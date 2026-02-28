# InnoBot: TRI — Triage Response Intelligence System

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python Details](https://img.shields.io/badge/python-3.10%2B-blue.svg)
![FastAPI](https://img.shields.io/badge/framework-FastAPI-009688.svg)

> **TRI** is an AI-assisted pre-hospital emergency decision support system designed specifically for in-ambulance use. It evaluates patient vitals, applies machine learning and hard medical safety rules, explains its reasoning, and recommends the nearest, most suitable hospital before arrival.

---

## 📖 Mission

To reduce time-to-treatment by systematically triaging patients in the field, ensuring life-critical cases bypass standard queues and go straight to the specialized facilities they need (e.g., Trauma Centers, ICUs, or Cardiac labs).

---

## 🏗️ System Architecture

The project emphasizes **simplicity**, **modularity**, **explainability**, and **deterministic medical safety**.

### The Pipeline
1. **Vital Capture:** Vitals and demographics are collected either manually or via built-in presets (e.g. `cardiac_emergency`, `minor_injury`).
2. **AI Triage (Logistic Regression):** A trained model predicts severity probabilities based on a KTAS-mapped dataset.
3. **Safety Override Layer:** Rule-based logic takes priority over ML. E.g., if Systolic BP < 90, the system *forces* a HIGH-acuity flag regardless of ML output. 
4. **Explainability Engine:** Translates complex telemetry points into human-readable critical factors (e.g., "Critical hypotension: SBP 88").
5. **Hospital Recommendation:** Scans a database of hospitals, checks facility requirements (ICU/Trauma/Cardiac), and ranks top matches using a compound score based on capacity, capabilities, and Haversine-computed travel ETA.
6. **Dashboard Queue:** Emits pre-arrival reports continuously for hospital emergency departments.

---

## 📁 Repository Structure

```text
innobot/
└── tri-system/
    ├── api/                     # FASTApi Routers
    │   ├── ambulance_routes.py  # Ambulance endpoint logic (triage, vitals capture)
    │   └── hospital_routes.py   # Hospital endpoint logic (recommendations, dashboard)
    │
    ├── app/                     
    │   ├── config.py            # Global constants, paths, rules, model configurations
    │   └── main.py              # Application entrypoint & Middleware
    │
    ├── hospital/                # Hospital Module
    │   ├── coordinator.py       # Recommendation coordinator & live queue state
    │   ├── hospital_db.json     # Static hospital capability database
    │   └── ranking.py           # ETA & Facility matching algorithm
    │
    ├── models/                  # ML Artifacts
    │   └── severity.pkl         # Auto-generated scikit-learn LogisticRegression model
    │
    ├── triage/                  # Triage & AI Module
    │   ├── explainability.py    # De-duplicated clinical reasoning translations
    │   ├── preprocess.py        # Min-max normalization for telemetry streams
    │   ├── safety_rules.py      # Hard medical overrides
    │   ├── severity_model.py    # ML Training, persistence, and prediction logic
    │   └── triage_agent.py      # Orchestrator tying ML, rules, and factors together
    │
    ├── vitals/                  # Vitals Module
    │   ├── capture.py           # Pydantic Schemas bridging Request → Pipeline
    │   └── presets.py           # Known critical scenarios library
    │
    ├── README.md                # Component-level detailed README
    └── requirements.txt         # Core dependencies
```

---

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- pip

### 1. Installation
Navigate to the `tri-system` directory and install the necessary dependencies:

```bash
cd tri-system
pip install -r requirements.txt
```

### 2. Start the Server
Launch the FastAPI development server. The `severity.pkl` model will automatically train itself synthetically on its very first launch if it's not present.

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 3. API Documentation
Once running, you can interact with the API via the auto-generated Swagger UI:
👉 **[http://localhost:8000/docs](http://localhost:8000/docs)**

---

## ⚙️ Core Modules Overview

### Triage Agent (`triage_agent.py`)
Acts as the central orchestrator. It receives raw JSON dictionaries containing demographics (age, injury type, pain level, mental state) and telemetry (sbp, rate, temperature, SpO2). It pushes data sequentially through pre-processors, the Logistic Regression model, and finally the deterministic safety net.

### Safety Rule Engine (`safety_rules.py`)
This is the deterministic "fail-safe" built to protect patients against edge-case failures in the ML logic. Five hard-coded rules continually audit model outputs:
- **Unresponsive:** `mental_state == 2`
- **Hypotension:** `SBP < 90 mmHg`
- **Severe Hypoxia:** `SpO2 < 85%`
- **Extreme Tachycardia:** `HR > 150 bpm`
- **Severe Bradycardia:** `HR < 40 bpm`

If *any* of the above are true, the patient is flagged as `HIGH` severity (KTAS 1/2) regardless of the ML model's opinion.

### Hospital Ranking Engine (`ranking.py`)
Scores available hospitals mathematically:
```python
Score = 0.5 * facility_match + 0.3 * (1 - normalized_eta) + 0.2 * availability
```
*(ETA is computed in real-time via Haversine distance from the ambulance coordinates to the hospital DB coordinates assuming an average emergency transit speed of 60 km/h).*

---

## 🛠️ Testing the Pipeline

A full demonstration request simulating a major cardiac complication in the field:

```bash
curl -X POST http://localhost:8000/triage/run \
  -H "Content-Type: application/json" \
  -d '{
    "age": 65,
    "injury": 0,
    "pain": 2,
    "mental_state": 1,
    "sbp": 88,
    "heart_rate": 135,
    "resp_rate": 30,
    "temperature": 99.2,
    "spo2": 89,
    "location": {"lat": 10.05, "lon": 76.36}
  }'
```

The system will synchronously assign a High severity score, explicitly detail *why* (via the Safety layer responding to SBP constraints), and rank the top 3 compatible local hospitals with expected ETAs.

---

## 📜 License
This project is proprietary and intended for internal agency testing.
