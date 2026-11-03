import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from backend.database import Base

class Community(Base):
    __tablename__ = "communities"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    name_te = Column(String(100), nullable=False)
    district = Column(String(100), nullable=False)
    district_te = Column(String(100), nullable=False)
    state = Column(String(100), default="Andhra Pradesh")
    total_households = Column(Integer, default=320)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    tanks = relationship("WaterTank", back_populates="community", cascade="all, delete-orphan")


class WaterTank(Base):
    __tablename__ = "water_tanks"

    id = Column(Integer, primary_key=True, index=True)
    community_id = Column(Integer, ForeignKey("communities.id"), nullable=False)
    name = Column(String(100), nullable=False)
    name_te = Column(String(100), nullable=False)
    location = Column(String(150), nullable=False)
    location_te = Column(String(150), nullable=False)
    capacity_liters = Column(Float, default=25000.0)
    current_level_pct = Column(Float, default=75.0)
    current_liters = Column(Float, default=18750.0)
    status = Column(String(20), default="Sufficient")  # Sufficient, Moderate, Low, Critical
    sensor_status = Column(String(50), default="Simulated Sensor Connected")
    last_sensor_update = Column(DateTime, default=datetime.datetime.utcnow)
    next_supply_time = Column(String(100), default="Tomorrow at 06:30 AM")
    supply_status = Column(String(30), default="Scheduled")  # Scheduled, Delayed, Completed
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    community = relationship("Community", back_populates="tanks")
    records = relationship("WaterLevelRecord", back_populates="tank", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="tank", cascade="all, delete-orphan")
    supply_updates = relationship("SupplyUpdate", back_populates="tank", cascade="all, delete-orphan")


class WaterLevelRecord(Base):
    __tablename__ = "water_level_records"

    id = Column(Integer, primary_key=True, index=True)
    tank_id = Column(Integer, ForeignKey("water_tanks.id"), nullable=False)
    level_pct = Column(Float, nullable=False)
    liters = Column(Float, nullable=False)
    status = Column(String(20), nullable=False)
    recorded_at = Column(DateTime, default=datetime.datetime.utcnow)
    source = Column(String(40), default="SIMULATED")  # SIMULATED, HARDWARE_ESP32, MANUAL_OVERRIDE

    tank = relationship("WaterTank", back_populates="records")


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    tank_id = Column(Integer, ForeignKey("water_tanks.id"), nullable=False)
    severity = Column(String(20), nullable=False)  # Info, Warning, Critical
    alert_type = Column(String(30), nullable=False)  # THRESHOLD, SUPPLY_DELAY, SYSTEM
    message_en = Column(Text, nullable=False)
    message_te = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    tank = relationship("WaterTank", back_populates="alerts")


class SupplyUpdate(Base):
    __tablename__ = "supply_updates"

    id = Column(Integer, primary_key=True, index=True)
    tank_id = Column(Integer, ForeignKey("water_tanks.id"), nullable=False)
    expected_supply_time = Column(String(100), nullable=False)
    status = Column(String(30), default="Scheduled")  # Scheduled, Delayed, Completed
    operator_name = Column(String(100), default="Ramesh Babu (Jal Sahayak)")
    message_en = Column(Text, nullable=False)
    message_te = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    tank = relationship("WaterTank", back_populates="supply_updates")


class DemoSettings(Base):
    __tablename__ = "demo_settings"

    id = Column(Integer, primary_key=True, index=True)
    active_community_id = Column(Integer, default=1)
    active_tank_id = Column(Integer, default=1)
    sufficient_threshold = Column(Float, default=70.0)
    moderate_threshold = Column(Float, default=30.0)
    low_threshold = Column(Float, default=10.0)
    language = Column(String(10), default="en")  # 'en' or 'te'
    updated_at = Column(DateTime, default=datetime.datetime.utcnow)
