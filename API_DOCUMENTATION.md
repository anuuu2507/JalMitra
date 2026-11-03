# JalMitra — API Reference Specification
> **Service:** Smart Community Water Availability and Alert System  
> **Challenge:** Seva First Innovation Challenge 2026  
> **Base URL:** `http://127.0.0.1:8000/api`  
> **Interactive Docs:** `http://127.0.0.1:8000/docs` (FastAPI Swagger UI)

---

## 1. System & Health

### `GET /api/health`
Checks backend API, SQLite database connection, and sensor layer metadata.

**Response (200 OK):**
```json
{
  "status": "healthy",
  "service": "JalMitra Community Water Platform",
  "version": "1.0.0",
  "mode": "Simulated Prototype",
  "database": "SQLite (Connected)",
  "sensor_layer": {
    "provider": "Simulated Sensor Provider (Software Mock)",
    "status": "Simulated Sensor Connected",
    "hardware_connected": false,
    "simulation_mode": true,
    "sampling_frequency_sec": 60,
    "simulated_noise_pct": 0.2,
    "disclaimer": "Simulated sensor environment. No physical ultrasonic transducer or ESP32 connected."
  }
}
```

---

## 2. Dashboard

### `GET /api/dashboard`
Fetches all aggregated community metrics for the active water tank.

**Query Parameters:**
- `tank_id` (optional integer): Specific tank ID. Defaults to active tank in settings.

**Response (200 OK):**
```json
{
  "community": {
    "id": 1,
    "name": "Kalyanadurgam Grama Panchayat",
    "name_te": "కళ్యాణదుర్గం గ్రామ పంచాయతీ",
    "district": "Ananthapuramu",
    "district_te": "అనంతపురం",
    "state": "Andhra Pradesh",
    "total_households": 340,
    "created_at": "2026-10-04T08:47:00Z"
  },
  "tank": {
    "id": 1,
    "community_id": 1,
    "name": "Ward 4 Community Overhead Tank",
    "name_te": "వార్డ్ 4 కమ్యూనిటీ ఓవర్‌హెడ్ ట్యాంక్",
    "location": "Near Primary Health Centre & ZP High School",
    "location_te": "ప్రాథమిక ఆరోగ్య కేంద్రం & జడ్పీ హైస్కూల్ దగ్గర",
    "capacity_liters": 25000.0,
    "current_level_pct": 75.0,
    "current_liters": 18750.0,
    "status": "Sufficient",
    "sensor_status": "Simulated Sensor Connected",
    "last_sensor_update": "2026-11-03T09:12:00Z",
    "next_supply_time": "Tomorrow at 06:30 AM",
    "supply_status": "Scheduled",
    "created_at": "2026-10-04T08:47:00Z"
  },
  "current_level_pct": 75.0,
  "current_liters": 18750.0,
  "capacity_liters": 25000.0,
  "status": "Sufficient",
  "sensor_status": "Simulated Sensor Connected",
  "last_sensor_update": "2026-11-03T09:12:00Z",
  "supply_status": "Scheduled",
  "next_supply_time": "Tomorrow at 06:30 AM",
  "latest_operator_message": { ... },
  "recent_alerts": [ ... ],
  "level_trend_24h": [ ... ],
  "daily_availability_summary": {
    "average_level_pct": 68.4,
    "min_level_pct": 38.0,
    "max_level_pct": 82.0,
    "hours_above_threshold": 8,
    "total_records_analyzed": 13,
    "status_summary": "Sufficient"
  },
  "is_simulation_mode": true,
  "disclaimer": "Demo Prototype: Hardware sensor, SMS gateway, and voice calls are simulated. No live physical deployment."
}
```

---

## 3. Water Tank Monitoring & Simulation Controls

### `POST /api/tanks/{tank_id}/water-level`
Directly sets the water level percentage and evaluates threshold rules.

**Request Body:**
```json
{
  "level_pct": 25.0,
  "source": "MANUAL_SIMULATION"
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "current_level_pct": 25.0,
  "current_liters": 6250.0,
  "status": "Low",
  "sensor_status": "Simulated Sensor Connected"
}
```

### `POST /api/tanks/{tank_id}/simulate-consumption`
Reduces water level by `step_pct` to simulate drawdown.

**Request Body:**
```json
{
  "step_pct": 15.0
}
```

### `POST /api/tanks/{tank_id}/simulate-refill`
Increases water level by `step_pct` to simulate inflow.

**Request Body:**
```json
{
  "step_pct": 25.0
}
```

---

## 4. Alerts

### `GET /api/alerts`
Retrieves list of alerts with optional filters.

**Query Parameters:**
- `tank_id` (int)
- `severity` (`Critical`, `Warning`, `Info`, or `All`)
- `unread_only` (`true` or `false`)

### `PATCH /api/alerts/{alert_id}/read`
Marks an alert as read.

---

## 5. Supply Updates

### `POST /api/supply-updates`
Publishes an operator notice. If `status` is `"Delayed"`, an alert is automatically generated for residents.

**Request Body:**
```json
{
  "tank_id": 1,
  "expected_supply_time": "Today at 08:30 PM",
  "status": "Delayed",
  "operator_name": "Ramesh Babu (Jal Sahayak)",
  "message_en": "Feeder pump maintenance underway. Supply delayed.",
  "message_te": "ఫీడర్ పంప్ మరమ్మతులు జరుగుతున్నాయి. సరఫరా ఆలస్యం."
}
```

---

## 6. Hardware-Ready Contract

### `POST /api/sensors/esp32/telemetry`
Contract endpoint for future ESP32 field units.

**Request Body:**
```json
{
  "device_id": "ESP32-WARD4-01",
  "tank_id": 1,
  "distance_cm": 75.0
}
```

**Response (200 OK):**
```json
{
  "status": "Telemetry processed",
  "device_id": "ESP32-WARD4-01",
  "calculated_level_pct": 74.1,
  "tank_status": "Sufficient"
}
```
