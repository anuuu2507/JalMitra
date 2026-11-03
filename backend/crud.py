import sys
from pathlib import Path

_backend_dir = Path(__file__).resolve().parent
_project_root = _backend_dir.parent
if str(_project_root) not in sys.path:
    sys.path.insert(0, str(_project_root))
if str(_backend_dir) not in sys.path:
    sys.path.insert(0, str(_backend_dir))

import datetime
from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import desc

try:
    from backend import models, schemas
    from backend.notification_service import notification_manager
except (ImportError, ModuleNotFoundError):
    import models, schemas
    from notification_service import notification_manager

def get_status_for_level(level_pct: float, db: Optional[Session] = None) -> Tuple[str, str]:
    """
    Returns (status_label, severity) based on challenge threshold specifications:
    Sufficient: >= 70% (Info)
    Moderate: >= 30% and < 70% (Warning)
    Critical: < 30% (Critical)
    Reads dynamic thresholds from DemoSettings if db session is provided.
    """
    suff = 70.0
    mod = 30.0
    if db:
        settings = db.query(models.DemoSettings).first()
        if settings:
            suff = settings.sufficient_threshold
            mod = settings.moderate_threshold

    if level_pct >= suff:
        return "Sufficient", "Info"
    elif level_pct >= mod:
        return "Moderate", "Warning"
    else:
        return "Critical", "Critical"

def get_standard_messages_for_status(status: str) -> Tuple[str, str]:
    """Official challenge bilingual prompt messages in English and Telugu."""
    if status == "Sufficient":
        return (
            "Water availability is sufficient.",
            "నీటి లభ్యత సరిపడా ఉంది."
        )
    elif status == "Moderate":
        return (
            "Water level is moderate. Please use water responsibly.",
            "నీటి మట్టం మధ్యస్థంగా ఉంది. జాగ్రత్తగా వాడండి."
        )
    else:  # Critical (< 30%)
        return (
            "Critical water level (< 30%). Please conserve water and check the next supply update.",
            "నీటి మట్టం చాలా తక్కువగా ఉంది (< 30%). నీటిని పొదుపుగా వాడండి."
        )

def get_demo_settings(db: Session) -> models.DemoSettings:
    settings = db.query(models.DemoSettings).first()
    if not settings:
        settings = models.DemoSettings(
            active_community_id=1,
            active_tank_id=1,
            sufficient_threshold=70.0,
            moderate_threshold=30.0,
            low_threshold=10.0,
            language="en"
        )
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings

def update_demo_settings(db: Session, update: schemas.DemoSettingsUpdate) -> models.DemoSettings:
    settings = get_demo_settings(db)
    if update.active_community_id is not None:
        settings.active_community_id = update.active_community_id
    if update.active_tank_id is not None:
        settings.active_tank_id = update.active_tank_id
    if update.sufficient_threshold is not None:
        settings.sufficient_threshold = update.sufficient_threshold
    if update.moderate_threshold is not None:
        settings.moderate_threshold = update.moderate_threshold
    if update.low_threshold is not None:
        settings.low_threshold = update.low_threshold
    if update.language is not None:
        settings.language = update.language
    settings.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(settings)
    return settings

def get_communities(db: Session) -> List[models.Community]:
    return db.query(models.Community).all()

def get_community(db: Session, community_id: int) -> Optional[models.Community]:
    return db.query(models.Community).filter(models.Community.id == community_id).first()

def get_tanks(db: Session, community_id: Optional[int] = None) -> List[models.WaterTank]:
    query = db.query(models.WaterTank)
    if community_id:
        query = query.filter(models.WaterTank.community_id == community_id)
    return query.all()

def get_tank(db: Session, tank_id: int) -> Optional[models.WaterTank]:
    return db.query(models.WaterTank).filter(models.WaterTank.id == tank_id).first()

def get_tank_history(db: Session, tank_id: int, limit: int = 50) -> List[models.WaterLevelRecord]:
    records = db.query(models.WaterLevelRecord).filter(
        models.WaterLevelRecord.tank_id == tank_id
    ).order_by(models.WaterLevelRecord.recorded_at.desc()).limit(limit).all()
    records.reverse()
    return records

def check_and_create_threshold_alert(db: Session, tank: models.WaterTank, old_status: str, new_status: str) -> Optional[models.Alert]:
    """
    Duplicate-alert prevention:
    Generates an alert ONLY if status changes across threshold boundaries or if no alert exists.
    """
    if old_status == new_status:
        return None

    status_label, severity = get_status_for_level(tank.current_level_pct, db)
    msg_en, msg_te = get_standard_messages_for_status(status_label)

    # Check the very latest alert for this tank to ensure no duplicate spam
    latest_alert = db.query(models.Alert).filter(
        models.Alert.tank_id == tank.id,
        models.Alert.alert_type == "THRESHOLD"
    ).order_by(desc(models.Alert.created_at)).first()

    if latest_alert and latest_alert.message_en == msg_en:
        return None

    alert = models.Alert(
        tank_id=tank.id,
        severity=severity,
        alert_type="THRESHOLD",
        message_en=msg_en,
        message_te=msg_te,
        is_read=False,
        created_at=datetime.datetime.utcnow()
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)

    # Dispatch to notification service abstraction
    notification_manager.dispatch(alert.id, msg_en, msg_te, severity)
    return alert

def update_water_level(db: Session, tank_id: int, level_pct: float, source: str = "MANUAL_SIMULATION") -> Optional[models.WaterTank]:
    tank = get_tank(db, tank_id)
    if not tank:
        return None

    old_status = tank.status
    clamped_pct = max(0.0, min(100.0, round(level_pct, 1)))
    new_liters = round((clamped_pct / 100.0) * tank.capacity_liters, 1)
    new_status, _ = get_status_for_level(clamped_pct, db)

    tank.current_level_pct = clamped_pct
    tank.current_liters = new_liters
    tank.status = new_status
    tank.last_sensor_update = datetime.datetime.utcnow()

    # Record historical telemetry
    record = models.WaterLevelRecord(
        tank_id=tank.id,
        level_pct=clamped_pct,
        liters=new_liters,
        status=new_status,
        recorded_at=datetime.datetime.utcnow(),
        source=source
    )
    db.add(record)
    db.commit()
    db.refresh(tank)

    # Trigger threshold alert if boundary crossed
    check_and_create_threshold_alert(db, tank, old_status, new_status)
    return tank

def simulate_consumption(db: Session, tank_id: int, step_pct: float = 15.0) -> Optional[models.WaterTank]:
    tank = get_tank(db, tank_id)
    if not tank:
        return None
    new_level = max(0.0, tank.current_level_pct - step_pct)
    return update_water_level(db, tank_id, new_level, source="SIMULATED_CONSUMPTION")

def simulate_refill(db: Session, tank_id: int, step_pct: float = 25.0) -> Optional[models.WaterTank]:
    tank = get_tank(db, tank_id)
    if not tank:
        return None
    new_level = min(100.0, tank.current_level_pct + step_pct)
    return update_water_level(db, tank_id, new_level, source="SIMULATED_REFILL")

def get_alerts(db: Session, tank_id: Optional[int] = None, severity: Optional[str] = None, unread_only: bool = False, limit: int = 50) -> List[models.Alert]:
    query = db.query(models.Alert)
    if tank_id:
        query = query.filter(models.Alert.tank_id == tank_id)
    if severity and severity.lower() != "all":
        query = query.filter(models.Alert.severity == severity.capitalize())
    if unread_only:
        query = query.filter(models.Alert.is_read == False)
    return query.order_by(desc(models.Alert.created_at)).limit(limit).all()

def mark_alert_read(db: Session, alert_id: int, is_read: bool = True) -> Optional[models.Alert]:
    alert = db.query(models.Alert).filter(models.Alert.id == alert_id).first()
    if alert:
        alert.is_read = is_read
        db.commit()
        db.refresh(alert)
    return alert

def get_supply_updates(db: Session, tank_id: Optional[int] = None, limit: int = 20) -> List[models.SupplyUpdate]:
    query = db.query(models.SupplyUpdate)
    if tank_id:
        query = query.filter(models.SupplyUpdate.tank_id == tank_id)
    return query.order_by(desc(models.SupplyUpdate.created_at)).limit(limit).all()

def create_supply_update(db: Session, update: schemas.SupplyUpdateCreate) -> models.SupplyUpdate:
    tank = get_tank(db, update.tank_id)
    
    # Generate Telugu translation if not provided
    msg_te = update.message_te
    if not msg_te:
        if update.status == "Delayed":
            msg_te = f"నీటి సరఫరా ఆలస్యం అయింది. ఆశించిన సమయం: {update.expected_supply_time}."
        elif update.status == "Completed":
            msg_te = f"ఈ రోజు నీటి సరఫరా పూర్తయింది. ధన్యవాదాలు."
        else:
            msg_te = f"నీటి సరఫరా షెడ్యూల్ చేయబడింది: {update.expected_supply_time}."

    supply_record = models.SupplyUpdate(
        tank_id=update.tank_id,
        expected_supply_time=update.expected_supply_time,
        status=update.status,
        operator_name=update.operator_name or "Ramesh Babu (Jal Sahayak)",
        message_en=update.message_en,
        message_te=msg_te,
        created_at=datetime.datetime.utcnow()
    )
    db.add(supply_record)

    # Update tank supply status
    if tank:
        tank.supply_status = update.status
        tank.next_supply_time = update.expected_supply_time

    # Critical requirement: If operator marks supply as delayed, generate an alert for residents!
    if update.status == "Delayed":
        alert_en = f"Supply Delayed: Next expected water supply at {update.expected_supply_time}. Notice: {update.message_en}"
        alert_te = f"నీటి సరఫరా ఆలస్యం: తదుపరి సరఫరా సమయం {update.expected_supply_time}. గమనిక: {msg_te}"
        
        delay_alert = models.Alert(
            tank_id=update.tank_id,
            severity="Warning",
            alert_type="SUPPLY_DELAY",
            message_en=alert_en,
            message_te=alert_te,
            is_read=False,
            created_at=datetime.datetime.utcnow()
        )
        db.add(delay_alert)
        db.flush()
        notification_manager.dispatch(delay_alert.id, alert_en, alert_te, "Warning")

    db.commit()
    db.refresh(supply_record)
    return supply_record
