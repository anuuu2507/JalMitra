from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict

# Base & Shared Schemas
class CommunityBase(BaseModel):
    name: str
    name_te: str
    district: str
    district_te: str
    state: str = "Andhra Pradesh"
    total_households: int = 320

class CommunityResponse(CommunityBase):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class WaterLevelRecordResponse(BaseModel):
    id: int
    tank_id: int
    level_pct: float
    liters: float
    status: str
    recorded_at: datetime
    source: str
    model_config = ConfigDict(from_attributes=True)


class AlertBase(BaseModel):
    tank_id: int
    severity: str  # Info, Warning, Critical
    alert_type: str  # THRESHOLD, SUPPLY_DELAY, SYSTEM
    message_en: str
    message_te: str

class AlertCreate(AlertBase):
    pass

class AlertResponse(AlertBase):
    id: int
    is_read: bool
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class SupplyUpdateBase(BaseModel):
    tank_id: int
    expected_supply_time: str
    status: str  # Scheduled, Delayed, Completed
    operator_name: str = "Ramesh Babu (Jal Sahayak)"
    message_en: str
    message_te: Optional[str] = None

class SupplyUpdateCreate(SupplyUpdateBase):
    pass

class SupplyUpdateResponse(SupplyUpdateBase):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class WaterTankBase(BaseModel):
    community_id: int
    name: str
    name_te: str
    location: str
    location_te: str
    capacity_liters: float = 25000.0

class WaterTankResponse(WaterTankBase):
    id: int
    current_level_pct: float
    current_liters: float
    status: str
    sensor_status: str
    last_sensor_update: datetime
    next_supply_time: str
    supply_status: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


# Request schemas for controls
class WaterLevelUpdateRequest(BaseModel):
    level_pct: float = Field(..., ge=0.0, le=100.0, description="Water level in percentage (0 to 100)")
    source: Optional[str] = "MANUAL_SIMULATION"

class SimulateStepRequest(BaseModel):
    step_pct: Optional[float] = Field(default=15.0, ge=1.0, le=50.0, description="Percentage points to increment or decrement")

class DemoSettingsUpdate(BaseModel):
    active_community_id: Optional[int] = None
    active_tank_id: Optional[int] = None
    sufficient_threshold: Optional[float] = None
    moderate_threshold: Optional[float] = None
    low_threshold: Optional[float] = None
    language: Optional[str] = None

class DemoSettingsResponse(BaseModel):
    id: int
    active_community_id: int
    active_tank_id: int
    sufficient_threshold: float
    moderate_threshold: float
    low_threshold: float
    language: str
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


# High-Level Aggregated Responses
class DashboardResponse(BaseModel):
    community: CommunityResponse
    tank: WaterTankResponse
    current_level_pct: float
    current_liters: float
    capacity_liters: float
    status: str
    sensor_status: str
    last_sensor_update: datetime
    supply_status: str
    next_supply_time: str
    latest_operator_message: Optional[SupplyUpdateResponse] = None
    recent_alerts: List[AlertResponse] = []
    level_trend_24h: List[WaterLevelRecordResponse] = []
    daily_availability_summary: Dict[str, Any]
    is_simulation_mode: bool = True
    disclaimer: str = "Demo Prototype: Hardware sensor, SMS gateway, and voice calls are simulated. No live physical deployment."


class AnalyticsResponse(BaseModel):
    tank_id: int
    tank_name: str
    tank_name_te: str
    capacity_liters: float
    current_level_pct: float
    history: List[WaterLevelRecordResponse]
    total_alerts_count: int
    critical_alerts_count: int
    warning_alerts_count: int
    info_alerts_count: int
    supply_events_count: int
    average_level_pct: float
    min_level_pct: float
    max_level_pct: float
    availability_trend: str
    estimated_water_saved_liters: float
    is_demo_estimate: bool = True
    estimate_explanation: str
