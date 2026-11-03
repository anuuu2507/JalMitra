import sys
from pathlib import Path

_backend_dir = Path(__file__).resolve().parent
_project_root = _backend_dir.parent
if str(_project_root) not in sys.path:
    sys.path.insert(0, str(_project_root))
if str(_backend_dir) not in sys.path:
    sys.path.insert(0, str(_backend_dir))

import datetime
from sqlalchemy.orm import Session

try:
    from backend import models
except (ImportError, ModuleNotFoundError):
    import models

def reset_and_seed_database(db: Session):
    """
    Clears all tables and seeds realistic simulated community data
    for JalMitra hackathon demo presentation.
    """
    # Delete in child-to-parent order
    db.query(models.Alert).delete()
    db.query(models.SupplyUpdate).delete()
    db.query(models.WaterLevelRecord).delete()
    db.query(models.WaterTank).delete()
    db.query(models.Community).delete()
    db.query(models.DemoSettings).delete()
    db.commit()

    now = datetime.datetime.utcnow()

    # Community 1: Kalyanadurgam
    comm1 = models.Community(
        id=1,
        name="Kalyanadurgam Grama Panchayat",
        name_te="కళ్యాణదుర్గం గ్రామ పంచాయతీ",
        district="Ananthapuramu",
        district_te="అనంతపురం",
        state="Andhra Pradesh",
        total_households=340,
        created_at=now - datetime.timedelta(days=30)
    )

    # Community 2: Narsapur
    comm2 = models.Community(
        id=2,
        name="Narsapur Mandal Model Ward",
        name_te="నర్సాపూర్ మండల మోడల్ వార్డ్",
        district="Medak",
        district_te="మెదక్",
        state="Telangana",
        total_households=280,
        created_at=now - datetime.timedelta(days=20)
    )

    db.add_all([comm1, comm2])
    db.flush()

    # Tanks for Community 1
    tank1 = models.WaterTank(
        id=1,
        community_id=comm1.id,
        name="Ward 4 Community Overhead Tank",
        name_te="వార్డ్ 4 కమ్యూనిటీ ఓవర్‌హెడ్ ట్యాంక్",
        location="Near Primary Health Centre & ZP High School",
        location_te="ప్రాథమిక ఆరోగ్య కేంద్రం & జడ్పీ హైస్కూల్ దగ్గర",
        capacity_liters=25000.0,
        current_level_pct=75.0,
        current_liters=18750.0,
        status="Sufficient",
        sensor_status="Simulated Sensor Connected",
        last_sensor_update=now - datetime.timedelta(minutes=3),
        next_supply_time="Tomorrow at 06:30 AM",
        supply_status="Scheduled",
        created_at=now - datetime.timedelta(days=30)
    )

    tank2 = models.WaterTank(
        id=2,
        community_id=comm1.id,
        name="Gowda Colony Ground Storage Reservoir",
        name_te="గౌడ కాలనీ భూగర్భ నీటి రిజర్వాయర్",
        location="Near Panchayat Office & Water ATM",
        location_te="పంచాయతీ కార్యాలయం & వాటర్ ఏటీఎం వద్ద",
        capacity_liters=15000.0,
        current_level_pct=42.0,
        current_liters=6300.0,
        status="Moderate",
        sensor_status="Simulated Sensor Connected",
        last_sensor_update=now - datetime.timedelta(minutes=7),
        next_supply_time="Today at 05:00 PM",
        supply_status="Scheduled",
        created_at=now - datetime.timedelta(days=30)
    )

    # Tank for Community 2
    tank3 = models.WaterTank(
        id=3,
        community_id=comm2.id,
        name="Narsapur Central Water Sump",
        name_te="నర్సాపూర్ సెంట్రల్ వాటర్ సంప్",
        location="Bazaar Street Distribution Point",
        location_te="బజార్ వీధి పంపిణీ కేంద్రం",
        capacity_liters=30000.0,
        current_level_pct=22.0,
        current_liters=6600.0,
        status="Low",
        sensor_status="Simulated Sensor Connected",
        last_sensor_update=now - datetime.timedelta(minutes=1),
        next_supply_time="Tomorrow at 07:00 AM",
        supply_status="Delayed",
        created_at=now - datetime.timedelta(days=20)
    )

    db.add_all([tank1, tank2, tank3])
    db.flush()

    # 24-hour historical records for Tank 1 to power beautiful Recharts curves
    history_records = []
    # Profile: full morning supply -> daytime draw-down -> partial evening recharge -> night stabilization
    pattern = [
        (24, 78.0), (22, 75.0), (20, 72.0), (18, 68.0),
        (16, 62.0), (14, 54.0), (12, 47.0), (10, 42.0),
        (8,  38.0), (6,  82.0), (4,  79.0), (2,  76.0), (0, 75.0)
    ]
    for hours_ago, pct in pattern:
        timestamp = now - datetime.timedelta(hours=hours_ago)
        liters = round((pct / 100.0) * tank1.capacity_liters, 1)
        stat = "Sufficient" if pct >= 70 else ("Moderate" if pct >= 30 else ("Low" if pct >= 10 else "Critical"))
        history_records.append(
            models.WaterLevelRecord(
                tank_id=tank1.id,
                level_pct=pct,
                liters=liters,
                status=stat,
                recorded_at=timestamp,
                source="SIMULATED"
            )
        )
    db.add_all(history_records)

    # Historical alerts
    alert1 = models.Alert(
        tank_id=tank1.id,
        severity="Info",
        alert_type="THRESHOLD",
        message_en="Water availability is sufficient.",
        message_te="నీటి లభ్యత సరిపడా ఉంది.",
        is_read=True,
        created_at=now - datetime.timedelta(hours=6)
    )
    alert2 = models.Alert(
        tank_id=tank1.id,
        severity="Warning",
        alert_type="THRESHOLD",
        message_en="Water level is moderate. Please use water responsibly.",
        message_te="నీటి మట్టం మధ్యస్థంగా ఉంది. జాగ్రత్తగా వాడండి.",
        is_read=False,
        created_at=now - datetime.timedelta(hours=14)
    )
    alert3 = models.Alert(
        tank_id=tank1.id,
        severity="Warning",
        alert_type="SUPPLY_DELAY",
        message_en="Routine pipeline maintenance completed. Normal supply scheduled for morning.",
        message_te="పైప్‌లైన్ మరమ్మతులు పూర్తయ్యాయి. ఉదయం సాధారణ సరఫరా షెడ్యూల్ చేయబడింది.",
        is_read=False,
        created_at=now - datetime.timedelta(hours=18)
    )
    db.add_all([alert1, alert2, alert3])

    # Operator Supply Updates
    sup1 = models.SupplyUpdate(
        tank_id=tank1.id,
        expected_supply_time="Tomorrow at 06:30 AM",
        status="Scheduled",
        operator_name="Ramesh Babu (Jal Sahayak)",
        message_en="Mission Bhagiratha feeder line pressure is nominal. Overhead tank recharge scheduled at 06:30 AM.",
        message_te="ఫీడర్ లైన్ ప్రెజర్ సాధారణంగా ఉంది. ఉదయం 06:30 గంటలకు ట్యాంక్ రీఛార్జ్ షెడ్యూల్ చేయబడింది.",
        created_at=now - datetime.timedelta(hours=2)
    )
    sup2 = models.SupplyUpdate(
        tank_id=tank1.id,
        expected_supply_time="Yesterday at 05:00 PM",
        status="Completed",
        operator_name="Ramesh Babu (Jal Sahayak)",
        message_en="Evening community distribution cycle completed across all 6 street distribution taps.",
        message_te="సాయంత్రం నీటి పంపిణీ అన్ని వీధుల్లో విజయవంతంగా పూర్తయింది.",
        created_at=now - datetime.timedelta(hours=22)
    )
    db.add_all([sup1, sup2])

    # Demo settings default
    settings = models.DemoSettings(
        active_community_id=comm1.id,
        active_tank_id=tank1.id,
        sufficient_threshold=70.0,
        moderate_threshold=30.0,
        low_threshold=10.0,
        language="en",
        updated_at=now
    )
    db.add(settings)
    db.commit()
