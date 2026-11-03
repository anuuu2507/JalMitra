import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "Simulated Sensor Provider" in data["sensor_layer"]["provider"]

def test_dashboard():
    response = client.get("/api/dashboard")
    assert response.status_code == 200
    data = response.json()
    assert "community" in data
    assert "tank" in data
    assert data["is_simulation_mode"] is True
    assert data["current_level_pct"] >= 0.0

def test_tanks_list_and_details():
    response = client.get("/api/tanks")
    assert response.status_code == 200
    tanks = response.json()
    assert len(tanks) >= 1
    tank_id = tanks[0]["id"]

    tank_resp = client.get(f"/api/tanks/{tank_id}")
    assert tank_resp.status_code == 200
    assert tank_resp.json()["id"] == tank_id

def test_water_level_update_and_threshold_alert():
    # Set to Low level (25%)
    response = client.post("/api/tanks/1/water-level", json={"level_pct": 25.0})
    assert response.status_code == 200
    tank = response.json()
    assert tank["current_level_pct"] == 25.0
    assert tank["status"] == "Low"

    # Verify alert generated
    alerts_resp = client.get("/api/alerts?tank_id=1")
    assert alerts_resp.status_code == 200
    alerts = alerts_resp.json()
    assert any("Water level is low" in a["message_en"] for a in alerts)

def test_simulate_consumption_and_refill():
    # Start at 50
    client.post("/api/tanks/1/water-level", json={"level_pct": 50.0})
    
    # Consume 15
    consume_resp = client.post("/api/tanks/1/simulate-consumption", json={"step_pct": 15.0})
    assert consume_resp.status_code == 200
    assert consume_resp.json()["current_level_pct"] == 35.0

    # Refill 25
    refill_resp = client.post("/api/tanks/1/simulate-refill", json={"step_pct": 25.0})
    assert refill_resp.status_code == 200
    assert refill_resp.json()["current_level_pct"] == 60.0

def test_supply_update_delayed_triggers_alert():
    payload = {
        "tank_id": 1,
        "expected_supply_time": "Today at 08:00 PM",
        "status": "Delayed",
        "operator_name": "Ramesh Babu",
        "message_en": "Pump motor repair in progress at main sump."
    }
    response = client.post("/api/supply-updates", json=payload)
    assert response.status_code == 201
    
    # Check that alert was generated
    alerts_resp = client.get("/api/alerts?tank_id=1")
    alerts = alerts_resp.json()
    assert any("Supply Delayed" in a["message_en"] for a in alerts)

def test_analytics_and_reset():
    analytics = client.get("/api/analytics?tank_id=1")
    assert analytics.status_code == 200
    assert analytics.json()["is_demo_estimate"] is True

    reset_resp = client.post("/api/demo/reset")
    assert reset_resp.status_code == 200
    assert reset_resp.json()["status"] == "success"
