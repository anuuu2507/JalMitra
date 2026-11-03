# JalMitra — Smart Community Water Availability and Alert System
> **“Know Today. Save Tomorrow.”**  
> **Challenge:** Seva First Innovation Challenge 2026  
> **Theme:** Swachh & Sustainable Bharat  
> **Track:** Track A — Product or Technology  
> **Participation Level:** Open — Undergraduate  

---

## 1. Project Overview & Prototype Status

**JalMitra** is a community water availability platform engineered for rural and semi-urban communities across Bharat. It provides real-time community overhead tank level monitoring, threshold-based bilingual shortage alerts (English and Telugu), and direct water supply schedule notices from local operators (*Jal Sahayaks*).

> [!IMPORTANT]
> **Prototype & Simulation Disclosure:**  
> This working competition prototype utilizes an extensible **Software Sensor Abstraction Layer** (`SimulatedWaterLevelProvider`). No physical ultrasonic sensor, live village water tank, paid telecom SMS gateway, or automated IVRS voice calling service is currently connected. The software is architected to be 100% hardware-ready for Phase-2 field deployment. No claims of active field deployment or measured clinical impact are asserted.

---

## 2. Problem Statement & Proposed Solution

### The Problem
In rural and semi-urban communities reliant on shared overhead tanks (OHT) and intermittent piped water supply:
1. **Unpredictable Availability:** Residents do not know if water is available in the community tank before walking to public standposts, leading to long queues and wasted hours.
2. **Delayed Supply Notice:** Supply delays caused by motor pump repairs or feeder line rationing are rarely communicated in advance, leaving families unprepared.
3. **Language & Literacy Barriers:** Existing administrative apps rely on dense English text rather than direct local-language (Telugu) audio-visual status.

### The Solution: JalMitra
- **Hydrodynamic Animated Tank Visual:** High-contrast graphic representation of water percentage and volume with responsive wave animations.
- **Threshold Rule Engine:** Automated categorization into **Sufficient (70–100%)**, **Moderate (30–69%)**, **Low (10–29%)**, and **Critical (0–9%)** with duplicate alert suppression.
- **Bilingual Interface:** English and Telugu side-by-side or toggled, with tailored messaging.
- **Jal Sahayak Operator Console:** Local operators publish scheduled, delayed, or completed supply cycles; marking a supply as delayed automatically broadcasts warning alerts.
- **Interactive Judge Demo Scenario:** A 9-step guided walkthrough demonstrating real-time API calls, consumption, threshold breaches, bilingual alerts, delay notices, and tank recharge.

---

## 3. Technology Stack

### Frontend
- **Framework:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS (Modern civic-tech palette: sky blue, ocean slate, emerald, warning amber, and critical rose)
- **Visualization:** Recharts (Responsive Area, Line, and Bar charts for 24-hour telemetry and alert breakdowns)
- **Icons:** Lucide React
- **Typography:** Inter & Noto Sans Telugu (crisp rendering on mobile and desktop)

### Backend
- **Framework:** Python 3.11+ / FastAPI
- **Database:** SQLite via SQLAlchemy 2.0 ORM
- **Validation:** Pydantic V2 schemas with strict typing
- **Architecture:** Sensor & Notification abstraction layers, RESTful API design, interactive Swagger UI (`/docs`)

---

## 4. System Architecture

```
                                 +--------------------------------------------+
                                 |          JalMitra Web Client (React)       |
                                 |  - Hydrodynamic Tank Visual (Waves)        |
                                 |  - Bilingual Engine (English + Telugu)     |
                                 |  - 9-Step Interactive Judge Demo Walkthrough|
                                 |  - Citizen Phone Preview (SMS / IVRS)      |
                                 +--------------------------------------------+
                                                       |
                                            REST API Requests (JSON)
                                                       v
+-------------------------------------------------------------------------------------------------------+
|                                      FastAPI Backend Application                                      |
|                                                                                                       |
|  [Routers]                                                                                            |
|  - /api/dashboard            -> Aggregated live telemetry, alerts, and 24h summary                    |
|  - /api/tanks                -> Multi-tank inventory, levels, and historical records                  |
|  - /api/alerts               -> Threshold rule evaluation, duplicate suppression, read status         |
|  - /api/supply-updates       -> Operator schedule broadcast & automated delay warning alerts           |
|  - /api/analytics            -> Drawdown curves, severity distributions, demo savings model           |
|  - /api/demo                 -> Scenario controls (consumption, refill, baseline reset)               |
|                                                                                                       |
|  [Sensor Abstraction Layer]                 [Notification Service Layer]                              |
|  * SimulatedWaterLevelProvider (Active)      * InAppNotificationChannel (Active)                      |
|  * FutureSensorProvider (Hardware-Ready)     * FutureSmsNotificationChannel (Planned - CDAC/DLT)      |
|  * ESP32 Telemetry Ingestion Endpoint        * FutureVoiceCallChannel (Planned - Telugu IVRS)         |
+-------------------------------------------------------------------------------------------------------+
                                                       |
                                               SQLAlchemy ORM
                                                       v
                                         +--------------------------+
                                         |    SQLite Database       |
                                         |  - communities           |
                                         |  - water_tanks           |
                                         |  - water_level_records   |
                                         |  - alerts                |
                                         |  - supply_updates        |
                                         |  - demo_settings         |
                                         +--------------------------+
```

---

## 5. Project Directory Structure

```
billbuddy-ai/
├── backend/
│   ├── crud.py                  # Database operations & duplicate alert prevention
│   ├── database.py              # SQLite engine & session management
│   ├── main.py                  # FastAPI app, lifespan, CORS, and API endpoints
│   ├── models.py                # SQLAlchemy declarative models
│   ├── notification_service.py  # In-App, SMS, and IVRS abstraction layer
│   ├── schemas.py               # Pydantic V2 validation schemas
│   ├── seed_data.py             # Realistic baseline community seed data
│   └── sensor_service.py        # Hardware-ready sensor abstraction (Simulated + ESP32)
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── DemoWalkthroughModal.tsx    # 9-step guided judge demonstration modal
│   │   │   ├── Navbar.tsx                  # Top branding, language toggle, demo reset
│   │   │   ├── NotificationPreviewModal.tsx# Citizen phone simulator (SMS / IVRS / App)
│   │   │   ├── Sidebar.tsx                 # Desktop sidebar & mobile navigation
│   │   │   ├── StatusBadge.tsx             # Standardized visual status pills
│   │   │   └── WaterTankVisual.tsx         # Custom dynamic hydrodynamic tank visual
│   │   ├── context/
│   │   │   └── AppContext.tsx              # Global state, language, tank selection
│   │   ├── pages/
│   │   │   ├── AlertsPage.tsx              # Smart alert center with filters
│   │   │   ├── AnalyticsPage.tsx           # Telemetry charts & simulated savings
│   │   │   ├── DashboardPage.tsx           # Main community dashboard
│   │   │   ├── HardwareSpecPage.tsx        # IoT pipeline & ESP32 test console
│   │   │   ├── ImpactCostPage.tsx          # Beneficiaries & editable cost model
│   │   │   ├── SettingsPage.tsx            # Language, community, thresholds, reset
│   │   │   ├── SupplyUpdatesPage.tsx       # Operator console & resident schedule
│   │   │   └── TankMonitoringPage.tsx      # Demo controls, sliders, refill/consume
│   │   ├── api.ts                          # Frontend typed API client
│   │   ├── App.tsx                         # Main layout & router
│   │   ├── index.css                       # Tailwind v4, Telugu fonts, wave animations
│   │   ├── main.tsx                        # React DOM entry point
│   │   ├── translations.ts                 # Full English & Telugu dictionaries
│   │   └── types.ts                        # TypeScript interfaces
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts                      # Tailwind v4 plugin & /api proxy to port 8000
├── tests/
│   └── test_api.py              # Pytest test suite for FastAPI backend
├── .env.example                 # Environment configuration template
├── API_DOCUMENTATION.md         # Detailed REST API specification
├── HARDWARE_INTEGRATION_GUIDE.md# ESP32 + Ultrasonic deployment manual
├── requirements.txt             # Python backend dependencies
├── run_dev.py                   # Single Python command to launch both servers
└── run_jalmitra.bat             # Double-click launcher for Windows
```

---

## 6. Windows Setup & Running Instructions

### Prerequisites
- Python 3.11+ installed and added to Windows PATH.
- Node.js v18+ and npm installed.

### Step 1: Install Backend Dependencies
In PowerShell or Command Prompt:
```powershell
pip install -r requirements.txt
```

### Step 2: Install Frontend Dependencies
```powershell
cd frontend
npm install
cd ..
```

### Step 3: Run Both Servers Simultaneously
You can run both the backend and frontend using the single runner script:
```powershell
python run_dev.py
```
*Or double-click `run_jalmitra.bat` on Windows.*

Alternatively, run them in separate terminal windows:
- **Terminal 1 (Backend):**
  ```powershell
  python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
  ```
- **Terminal 2 (Frontend):**
  ```powershell
  cd frontend
  npm run dev
  ```

### Step 4: Open in Browser
- **Frontend Dashboard:** [http://localhost:5173](http://localhost:5173)
- **FastAPI Interactive Swagger Docs:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

## 7. Running Backend Tests
Execute the automated test suite verifying all endpoints, threshold alert logic, and duplicate prevention:
```powershell
python -m pytest tests/test_api.py
```

---

## 8. How to Demonstrate to Judges (2–3 Minute Flow)

1. **Open the Application:** Navigate to [http://localhost:5173](http://localhost:5173). Point out the **Swachh & Sustainable Bharat** badge and the **Simulated Sensor Mode** tag.
2. **Language Switching:** Click **తెలుగు** in the header. Show how all metrics, tank status, and alerts immediately switch to localized Telugu text without layout overflow.
3. **Launch the Demo Scenario:** Click the prominent **“Run Demo Scenario”** button in the header.
4. **Follow the 9-Step Walkthrough:**
   - **Step 1:** Starts tank at 75% baseline (Sufficient).
   - **Step 2:** Simulates morning community drawdown (-30%).
   - **Step 3:** Drops level to 25% (Low status).
   - **Step 4:** Shows automatic backend alert creation.
   - **Step 5:** Demonstrates bilingual alert: *“Water level is low. Please conserve water.”* / *“నీటి మట్టం తక్కువగా ఉంది. దయచేసి నీటిని పొదుపుగా వాడండి.”*
   - **Step 6:** Jal Sahayak operator publishes a supply delay.
   - **Step 7:** Delay alert appears in residents' stream and mobile simulator.
   - **Step 8:** Pump refill begins (+35%).
   - **Step 9:** Tank recovers to 85% (Sufficient).
5. **Interactive Controls:** Navigate to **Tank Monitoring** and drag the level slider or click **-15% Consumption** / **+25% Refill** to show dynamic hydrodynamic wave changes.
6. **Hardware Spec & Impact:** Show the **Hardware Architecture** page with the live ESP32 test console, followed by the **Impact & Cost Model** calculator.
7. **Reset:** Click **“Reset Demo”** to return the database to the clean 75% baseline.

---

## 9. API Endpoint Summary

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check, DB status, and sensor layer metadata |
| `GET` | `/api/dashboard` | Main aggregated dashboard payload |
| `GET` | `/api/tanks` | List all community water tanks |
| `GET` | `/api/tanks/{id}` | Specific tank telemetry and metrics |
| `GET` | `/api/tanks/{id}/history` | Historical water level readings for charts |
| `POST` | `/api/tanks/{id}/water-level` | Set exact water level % (triggers threshold rules) |
| `POST` | `/api/tanks/{id}/simulate-consumption` | Decrement water level (gradual usage) |
| `POST` | `/api/tanks/{id}/simulate-refill` | Increment water level (pump refill) |
| `GET` | `/api/alerts` | List alerts (supports `severity` and `unread_only` filters) |
| `PATCH` | `/api/alerts/{id}/read` | Mark alert as read |
| `GET` | `/api/supply-updates` | Supply schedule history |
| `POST` | `/api/supply-updates` | Operator publishes schedule (delays generate alerts) |
| `GET` | `/api/analytics` | Analytics summary, trends, and demo water saved model |
| `POST` | `/api/demo/reset` | Restore clean baseline presentation state |
| `GET` | `/api/settings` / `PUT` | Read and update threshold and language settings |
| `GET` | `/api/hardware-spec` | Hardware bill of materials and telemetry schema |
| `POST` | `/api/sensors/esp32/telemetry`| Contract endpoint for physical ESP32 data packets |

---

## 10. Hardware-Ready Architecture & Future Deployment

In Phase 2, JalMitra transitions from simulation to physical sensing using:
- **Microcontroller:** ESP32-WROOM-32D with integrated Wi-Fi or 4G GSM SIM7600 module for remote villages.
- **Sensor:** JSN-SR04T waterproof ultrasonic transducer mounted at the top manhole cover of the overhead tank.
- **Power:** 10W solar panel paired with a 3.7V 18650 lithium-ion battery and BMS for off-grid 24/7 operation.
- **Measurement Logic:**
  $$\text{Water Depth} = \text{Tank Height (300 cm)} - \text{Measured Distance (cm)}$$
  $$\text{Level Percentage} = \frac{\text{Water Depth}}{\text{Effective Height (280 cm)}} \times 100$$
- **Telemetry Protocol:** Secure HTTP POST or MQTT JSON packet transmitted to `/api/sensors/esp32/telemetry`.

---

## 11. Transparent Cost Model & Scalability

| Component | Estimated Cost (INR ₹) | Note |
|---|---|---|
| ESP32 Microcontroller | ₹450 | Off-the-shelf development board |
| JSN-SR04T Waterproof Ultrasonic Sensor | ₹650 | IP67 waterproof transducer |
| 10W Solar Panel + 18650 Battery BMS | ₹850 | Off-grid continuous power |
| Weatherproof IP67 Enclosure & Glands | ₹350 | Outdoor sunlight & rain protection |
| Mounting Brackets & Wiring | ₹250 | Local installation hardware |
| **Total Hardware Setup Cost / Tank** | **₹2,600** | **Ultra-low public capital expenditure** |
| 4G SIM IoT Telemetry Data | ₹75 / month | 100MB/mo village M2M data plan |
| Cloud Hosting & Maintenance Allowance | ₹90 / month | Scaled across 50 village tanks |
| **Annual Running Cost / Tank** | **~₹1,980 / year** | Easily funded via Gram Panchayat funds |
| **Annual Cost per Beneficiary Household** | **~₹8 - ₹12 / year** | Based on 340 homes per village ward |

---

## 12. Beneficiaries & Ethical Presentation Standards

JalMitra is designed in strict adherence to hackathon competition integrity:
- **No False Claims:** We explicitly state that no physical sensors or tanks are connected in this prototype.
- **No Invented Field Impact:** All metrics on water savings and queuing reduction are clearly identified as **illustrative demo estimates**.
- **Transparent Open Source Stack:** Built on standard, accessible technologies that can be adopted by municipal corporations, gram panchayats, or grassroots civic technologists.

---

*Built with dedication for the Seva First Innovation Challenge 2026.*  
*Tagline: “Know Today. Save Tomorrow.”*
