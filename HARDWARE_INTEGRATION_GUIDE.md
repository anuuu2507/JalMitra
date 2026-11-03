# JalMitra — Hardware Integration Guide (Phase 2 Deployment)
> **Device Architecture:** ESP32-WROOM-32D + JSN-SR04T Waterproof Ultrasonic Sensor  
> **Challenge:** Seva First Innovation Challenge 2026 — Track A  

---

## 1. Overview
In the initial challenge prototype, all water level readings are synthesized by the `SimulatedWaterLevelProvider`. This guide describes how physical field sensors will connect directly to the JalMitra backend in Phase 2 without altering the frontend or database schemas.

---

## 2. Hardware Bill of Materials (BOM)

| Item | Specification | Est. Price (INR ₹) | Purpose |
|---|---|---|---|
| **Microcontroller** | ESP32-WROOM-32D Development Board (Wi-Fi + BLE) | ₹450 | Local telemetry processing & HTTP client |
| **Ultrasonic Sensor** | JSN-SR04T v3.0 Waterproof Transducer | ₹650 | Distance measurement inside humid tank |
| **Power Unit** | 10W Monocrystalline Solar Panel + 18650 Battery Pack | ₹850 | Autonomous 24/7 power supply |
| **Enclosure** | IP67 Weatherproof ABS Box + M12 Cable Glands | ₹350 | Protection against monsoon rain and heat |
| **Cellular Shield** | SIM7600EI 4G LTE Module (Optional for remote areas) | ₹1,400 | Used when Gram Panchayat Wi-Fi is unavailable |

---

## 3. Wiring & Pin Connections

```
  +------------------+                    +---------------------+
  |   ESP32 Board    |                    |  JSN-SR04T Board    |
  |                  |                    |                     |
  |             5V   |------------------->|  VCC                |
  |             GND  |------------------->|  GND                |
  |   GPIO 5  (TRIG) |------------------->|  TRIG               |
  |   GPIO 18 (ECHO) |<-------------------|  ECHO               |
  +------------------+                    +---------------------+
```

---

## 4. Distance Calculation & Telemetry Firmware Sample (C++ / Arduino)

```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

const char* ssid = "Panchayat_Office_WiFi";
const char* password = "village_secure_pass";
const char* serverUrl = "http://api.jalmitra.bharat/api/sensors/esp32/telemetry";

const int TRIG_PIN = 5;
const int ECHO_PIN = 18;

void setup() {
  Serial.begin(115200);
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi Connected!");
}

void loop() {
  // Transmit 10 microsecond trigger pulse
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  // Read echo travel time in microseconds
  long duration = pulseIn(ECHO_PIN, HIGH, 30000); // 30ms timeout
  float distance_cm = (duration * 0.0343) / 2.0;

  if (distance_cm > 20.0 && distance_cm < 400.0) {
    if (WiFi.status() == WL_CONNECTED) {
      HTTPClient http;
      http.begin(serverUrl);
      http.addHeader("Content-Type", "application/json");

      StaticJsonDocument<200> doc;
      doc["device_id"] = "ESP32-KALYAN-01";
      doc["tank_id"] = 1;
      doc["distance_cm"] = distance_cm;

      String requestBody;
      serializeJson(doc, requestBody);

      int httpResponseCode = http.POST(requestBody);
      Serial.printf("Telemetry posted, HTTP Code: %d\n", httpResponseCode);
      http.end();
    }
  }

  // Sample once every 60 seconds to conserve power
  delay(60000);
}
```

---

## 5. Backend Ingestion & Processing

When the telemetry packet hits `POST /api/sensors/esp32/telemetry`:
1. The backend verifies the `device_id` and lookup matches the tank.
2. The `FutureSensorProvider` computes:
   $$\text{Water Depth} = 300\text{ cm} - \text{distance\_cm}$$
   $$\text{Level \%} = \frac{\text{Water Depth}}{280\text{ cm}} \times 100$$
3. The new level is recorded in `water_level_records` with `source="HARDWARE_ESP32"`.
4. The threshold engine checks if an alert threshold has been crossed and generates bilingual notifications as necessary.
