import os
import sys
from pathlib import Path

# Add project root and backend dir to sys.path so it works from root or inside backend/
_backend_dir = Path(__file__).resolve().parent
_project_root = _backend_dir.parent

if str(_project_root) not in sys.path:
    sys.path.insert(0, str(_project_root))
if str(_backend_dir) not in sys.path:
    sys.path.insert(0, str(_backend_dir))

from contextlib import asynccontextmanager
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

try:
    from backend.database import engine, Base, get_db
    from backend import models, schemas, crud
    from backend.seed_data import reset_and_seed_database
    from backend.sensor_service import sensor_provider, FutureSensorProvider
    from backend.notification_service import notification_manager
except (ImportError, ModuleNotFoundError):
    from database import engine, Base, get_db
    import models, schemas, crud
    from seed_data import reset_and_seed_database
    from sensor_service import sensor_provider, FutureSensorProvider
    from notification_service import notification_manager

# Initialize database schema
Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Ensure database has initial seed data on startup."""
    db = next(get_db())
    try:
        community = db.query(models.Community).first()
        if not community:
            reset_and_seed_database(db)
    finally:
        db.close()
    yield

app = FastAPI(
    title="JalMitra — Smart Community Water Availability and Alert System",
    description=(
        "Official Competition Prototype API for Seva First Innovation Challenge 2026.\n\n"
        "**Theme:** Swachh & Sustainable Bharat | **Track:** Track A — Product or Technology\n\n"
        "**Prototype Notice:** All water levels and telemetry in this stage are generated via "
        "the SimulatedWaterLevelProvider. Physical sensor connection (ESP32), SMS gateway, and "
        "IVRS voice engines are planned architectural extensions."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS configuration
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health", tags=["System"])
def health_check():
    return {
        "status": "healthy",
        "service": "JalMitra Community Water Platform",
        "version": "1.0.0",
        "mode": "Simulated Prototype",
        "database": "SQLite (Connected)",
        "sensor_layer": sensor_provider.get_status_metadata()
    }


@app.get("/api/dashboard", response_model=schemas.DashboardResponse, tags=["Dashboard"])
def get_dashboard(tank_id: Optional[int] = Query(None, description="Target tank ID. Defaults to active tank."), db: Session = Depends(get_db)):
    settings = crud.get_demo_settings(db)
    target_tank_id = tank_id or settings.active_tank_id

    tank = crud.get_tank(db, target_tank_id)
    if not tank:
        tank = db.query(models.WaterTank).first()
        if not tank:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No water tank found.")

    community = crud.get_community(db, tank.community_id)
    if not community:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Community not found.")

    latest_update = db.query(models.SupplyUpdate).filter(
        models.SupplyUpdate.tank_id == tank.id
    ).order_by(models.SupplyUpdate.created_at.desc()).first()

    recent_alerts = crud.get_alerts(db, tank_id=tank.id, limit=5)
    history_records = crud.get_tank_history(db, tank_id=tank.id, limit=24)

    # Compute daily availability stats
    levels = [r.level_pct for r in history_records] if history_records else [tank.current_level_pct]
    avg_level = sum(levels) / len(levels)
    min_level = min(levels)
    max_level = max(levels)

    daily_summary = {
        "average_level_pct": round(avg_level, 1),
        "min_level_pct": round(min_level, 1),
        "max_level_pct": round(max_level, 1),
        "hours_above_threshold": len([l for l in levels if l >= settings.sufficient_threshold]),
        "total_records_analyzed": len(levels),
        "status_summary": tank.status
    }

    return schemas.DashboardResponse(
        community=schemas.CommunityResponse.model_validate(community),
        tank=schemas.WaterTankResponse.model_validate(tank),
        current_level_pct=tank.current_level_pct,
        current_liters=tank.current_liters,
        capacity_liters=tank.capacity_liters,
        status=tank.status,
        sensor_status=tank.sensor_status,
        last_sensor_update=tank.last_sensor_update,
        supply_status=tank.supply_status,
        next_supply_time=tank.next_supply_time,
        latest_operator_message=schemas.SupplyUpdateResponse.model_validate(latest_update) if latest_update else None,
        recent_alerts=[schemas.AlertResponse.model_validate(a) for a in recent_alerts],
        level_trend_24h=[schemas.WaterLevelRecordResponse.model_validate(r) for r in history_records[-15:]],
        daily_availability_summary=daily_summary,
        is_simulation_mode=True,
        disclaimer="Demo Prototype: Hardware sensor, SMS gateway, and voice calls are simulated. No live physical deployment."
    )


@app.get("/api/tanks", response_model=List[schemas.WaterTankResponse], tags=["Tanks"])
def list_tanks(community_id: Optional[int] = None, db: Session = Depends(get_db)):
    tanks = crud.get_tanks(db, community_id=community_id)
    return [schemas.WaterTankResponse.model_validate(t) for t in tanks]


@app.get("/api/tanks/{tank_id}", response_model=schemas.WaterTankResponse, tags=["Tanks"])
def get_tank_details(tank_id: int, db: Session = Depends(get_db)):
    tank = crud.get_tank(db, tank_id)
    if not tank:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Tank with ID {tank_id} not found.")
    return schemas.WaterTankResponse.model_validate(tank)


@app.get("/api/tanks/{tank_id}/history", response_model=List[schemas.WaterLevelRecordResponse], tags=["Tanks"])
def get_tank_history(tank_id: int, limit: int = 50, db: Session = Depends(get_db)):
    tank = crud.get_tank(db, tank_id)
    if not tank:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Tank with ID {tank_id} not found.")
    records = crud.get_tank_history(db, tank_id, limit)
    return [schemas.WaterLevelRecordResponse.model_validate(r) for r in records]


@app.post("/api/tanks/{tank_id}/water-level", response_model=schemas.WaterTankResponse, tags=["Demo Controls"])
def set_tank_water_level(tank_id: int, payload: schemas.WaterLevelUpdateRequest, db: Session = Depends(get_db)):
    updated_tank = crud.update_water_level(db, tank_id, payload.level_pct, source=payload.source or "MANUAL_SIMULATION")
    if not updated_tank:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Tank with ID {tank_id} not found.")
    return schemas.WaterTankResponse.model_validate(updated_tank)


@app.post("/api/tanks/{tank_id}/simulate-consumption", response_model=schemas.WaterTankResponse, tags=["Demo Controls"])
def simulate_water_consumption(tank_id: int, payload: schemas.SimulateStepRequest = schemas.SimulateStepRequest(), db: Session = Depends(get_db)):
    updated_tank = crud.simulate_consumption(db, tank_id, step_pct=payload.step_pct or 15.0)
    if not updated_tank:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Tank with ID {tank_id} not found.")
    return schemas.WaterTankResponse.model_validate(updated_tank)


@app.post("/api/tanks/{tank_id}/simulate-refill", response_model=schemas.WaterTankResponse, tags=["Demo Controls"])
def simulate_water_refill(tank_id: int, payload: schemas.SimulateStepRequest = schemas.SimulateStepRequest(), db: Session = Depends(get_db)):
    updated_tank = crud.simulate_refill(db, tank_id, step_pct=payload.step_pct or 25.0)
    if not updated_tank:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Tank with ID {tank_id} not found.")
    return schemas.WaterTankResponse.model_validate(updated_tank)


@app.get("/api/alerts", response_model=List[schemas.AlertResponse], tags=["Alerts"])
def list_alerts(
    tank_id: Optional[int] = None,
    severity: Optional[str] = Query(None, description="Info, Warning, Critical, or All"),
    unread_only: bool = False,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    alerts = crud.get_alerts(db, tank_id=tank_id, severity=severity, unread_only=unread_only, limit=limit)
    return [schemas.AlertResponse.model_validate(a) for a in alerts]


@app.patch("/api/alerts/{alert_id}/read", response_model=schemas.AlertResponse, tags=["Alerts"])
def toggle_alert_read(alert_id: int, db: Session = Depends(get_db)):
    alert = crud.mark_alert_read(db, alert_id, is_read=True)
    if not alert:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Alert with ID {alert_id} not found.")
    return schemas.AlertResponse.model_validate(alert)


@app.get("/api/supply-updates", response_model=List[schemas.SupplyUpdateResponse], tags=["Supply Updates"])
def list_supply_updates(tank_id: Optional[int] = None, limit: int = 20, db: Session = Depends(get_db)):
    updates = crud.get_supply_updates(db, tank_id=tank_id, limit=limit)
    return [schemas.SupplyUpdateResponse.model_validate(u) for u in updates]


@app.post("/api/supply-updates", response_model=schemas.SupplyUpdateResponse, status_code=status.HTTP_201_CREATED, tags=["Supply Updates"])
def post_supply_update(payload: schemas.SupplyUpdateCreate, db: Session = Depends(get_db)):
    tank = crud.get_tank(db, payload.tank_id)
    if not tank:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Tank with ID {payload.tank_id} not found.")
    
    record = crud.create_supply_update(db, payload)
    return schemas.SupplyUpdateResponse.model_validate(record)


@app.get("/api/analytics", response_model=schemas.AnalyticsResponse, tags=["Analytics"])
def get_analytics(tank_id: Optional[int] = None, db: Session = Depends(get_db)):
    settings = crud.get_demo_settings(db)
    target_tank_id = tank_id or settings.active_tank_id

    tank = crud.get_tank(db, target_tank_id)
    if not tank:
        tank = db.query(models.WaterTank).first()
        if not tank:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No tank available.")

    history = crud.get_tank_history(db, tank.id, limit=60)
    alerts = crud.get_alerts(db, tank_id=tank.id, limit=100)
    supply_updates = crud.get_supply_updates(db, tank_id=tank.id, limit=50)

    levels = [r.level_pct for r in history] if history else [tank.current_level_pct]
    avg_level = sum(levels) / len(levels)
    min_level = min(levels)
    max_level = max(levels)

    critical_cnt = len([a for a in alerts if a.severity.lower() == "critical"])
    warning_cnt = len([a for a in alerts if a.severity.lower() == "warning"])
    info_cnt = len([a for a in alerts if a.severity.lower() == "info"])

    if len(levels) >= 2:
        diff = levels[-1] - levels[0]
        trend_label = "Improving (Recharging)" if diff > 5 else ("Declining (Heavy Usage)" if diff < -5 else "Stable Availability")
    else:
        trend_label = "Stable Availability"

    simulated_saved_liters = round(tank.capacity_liters * 0.05 * 1.8, 1)

    return schemas.AnalyticsResponse(
        tank_id=tank.id,
        tank_name=tank.name,
        tank_name_te=tank.name_te,
        capacity_liters=tank.capacity_liters,
        current_level_pct=tank.current_level_pct,
        history=[schemas.WaterLevelRecordResponse.model_validate(r) for r in history],
        total_alerts_count=len(alerts),
        critical_alerts_count=critical_cnt,
        warning_alerts_count=warning_cnt,
        info_alerts_count=info_cnt,
        supply_events_count=len(supply_updates),
        average_level_pct=round(avg_level, 1),
        min_level_pct=round(min_level, 1),
        max_level_pct=round(max_level, 1),
        availability_trend=trend_label,
        estimated_water_saved_liters=simulated_saved_liters,
        is_demo_estimate=True,
        estimate_explanation=(
            "DEMO ESTIMATE: Based on an assumed 5-9% reduction in accidental tank overflow "
            "and uncoordinated tap usage when community members receive proactive low-water "
            "and schedule alerts. This is an illustrative simulation metric, not field-measured data."
        )
    )


@app.post("/api/demo/reset", tags=["Demo Controls"])
def reset_demo(db: Session = Depends(get_db)):
    """Resets database to baseline demo state with sample community and records."""
    reset_and_seed_database(db)
    return {
        "status": "success",
        "message": "Demo database successfully reset to clean presentation state.",
        "active_tank_level": 75.0,
        "is_simulation_mode": True
    }


@app.get("/api/settings", response_model=schemas.DemoSettingsResponse, tags=["Settings"])
def get_settings(db: Session = Depends(get_db)):
    settings = crud.get_demo_settings(db)
    return schemas.DemoSettingsResponse.model_validate(settings)


@app.put("/api/settings", response_model=schemas.DemoSettingsResponse, tags=["Settings"])
def update_settings(payload: schemas.DemoSettingsUpdate, db: Session = Depends(get_db)):
    settings = crud.update_demo_settings(db, payload)
    return schemas.DemoSettingsResponse.model_validate(settings)


@app.get("/api/communities", response_model=List[schemas.CommunityResponse], tags=["Communities"])
def list_communities(db: Session = Depends(get_db)):
    communities = crud.get_communities(db)
    return [schemas.CommunityResponse.model_validate(c) for c in communities]


@app.get("/api/hardware-spec", tags=["Hardware Integration Architecture"])
def get_hardware_architecture():
    return {
        "status": "Hardware-Ready Architecture",
        "current_provider": sensor_provider.get_status_metadata(),
        "planned_provider": FutureSensorProvider("ESP32-DEV-PROD").get_status_metadata(),
        "channels": notification_manager.get_all_channels(),
        "hardware_components": [
            {"component": "Microcontroller", "model": "ESP32-WROOM-32D (with Wi-Fi / ESP-NOW)", "estimated_inr": 450},
            {"component": "Ultrasonic Sensor", "model": "JSN-SR04T Waterproof Ultrasonic Transducer", "estimated_inr": 650},
            {"component": "Power Supply", "model": "Solar Panel 10W + 3.7V 18650 Li-Ion BMS or 5V DC Mains", "estimated_inr": 850},
            {"component": "Enclosure", "model": "IP67 Weatherproof Junction Box with Cable Glands", "estimated_inr": 350},
            {"component": "Connectivity", "model": "Community Gram Panchayat Wi-Fi or 4G GSM SIM7600", "estimated_inr": 200}
        ],
        "telemetry_protocol": {
            "method": "HTTP POST / MQTT",
            "endpoint": "/api/sensors/esp32/telemetry",
            "format": "JSON",
            "fields": {
                "device_id": "Unique hardware MAC address or device ID string",
                "tank_id": "Target overhead tank ID",
                "distance_cm": "Measured distance between top transducer and water meniscus",
                "battery_voltage": "Optional battery telemetry (e.g. 3.92V)",
                "api_key": "Pre-shared village authentication key"
            }
        }
    }


@app.post("/api/sensors/esp32/telemetry", tags=["Hardware Integration Architecture"])
def ingest_esp32_telemetry(payload: dict, db: Session = Depends(get_db)):
    tank_id = payload.get("tank_id")
    distance_cm = payload.get("distance_cm")
    if not tank_id or distance_cm is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing tank_id or distance_cm in telemetry payload.")
    
    tank = crud.get_tank(db, tank_id)
    if not tank:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Tank {tank_id} not registered.")
    
    future_provider = FutureSensorProvider(payload.get("device_id", "ESP32-TEST"), tank_height_cm=300.0)
    calculated_pct = future_provider.calculate_level_from_distance(float(distance_cm))
    
    updated_tank = crud.update_water_level(db, tank_id, calculated_pct, source="HARDWARE_ESP32")
    return {
        "status": "Telemetry processed",
        "device_id": payload.get("device_id"),
        "calculated_level_pct": calculated_pct,
        "tank_status": updated_tank.status
    }
