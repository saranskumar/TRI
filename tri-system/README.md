# TRI — Triage Response Intelligence System

> An AI-assisted pre-hospital emergency decision support system for ambulance crews.

---

## Overview

TRI runs inside ambulances to assess patient severity in real time, apply medical safety overrides, and recommend the nearest appropriate hospital — all before the ambulance arrives.

**Pipeline:**
```
Ambulance Interface → Vital Capture → Triage AI Model → Safety Override → Hospital Ranking → Hospital Dashboard
```

---

## Project Structure

```
tri-system/
├── app/
│   ├── main.py          ← FastAPI entry point
│   └── config.py        ← Global constants & thresholds
├── triage/
│   ├── preprocess.py    ← Feature normalisation
│   ├── severity_model.py← Logistic Regression (KTAS-mapped)
│   ├── safety_rules.py  ← Hard medical override engine
│   ├── explainability.py← Clinical factor identification
│   └── triage_agent.py  ← Pipeline orchestrator
├── vitals/
│   ├── presets.py       ← Pre-defined emergency vital profiles
│   └── capture.py       ← Pydantic input schemas & validation
├── hospital/
│   ├── hospital_db.json ← Static hospital database (10 hospitals)
│   ├── ranking.py       ← Haversine ETA + weighted scoring
│   └── coordinator.py   ← Recommendation + dashboard queue
├── api/
│   ├── ambulance_routes.py ← POST /triage/run, POST /vitals/preset
│   └── hospital_routes.py  ← POST /hospital/recommend, GET /hospital/incoming
├── models/
│   └── severity.pkl     ← Auto-generated on first startup
└── requirements.txt
```

---

## Quickstart

### 1. Install dependencies
```bash
cd tri-system
pip install -r requirements.txt
```

### 2. Start the server
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The severity model trains and saves automatically on first startup.

### 3. Open the interactive docs
```
http://localhost:8000/docs
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/triage/run` | Full pipeline: vitals → triage → hospital report |
| `POST` | `/vitals/preset` | Resolve a preset name to vital values |
| `GET`  | `/vitals/presets/list` | List all available vital presets |
| `POST` | `/hospital/recommend` | Hospital ranking from patient vitals |
| `GET`  | `/hospital/incoming` | Hospital dashboard: live incoming queue |
| `GET`  | `/health` | Health check |
| `GET`  | `/docs` | Swagger UI |

---

## Example: Full Triage Run

```bash
curl -X POST http://localhost:8000/triage/run \
  -H "Content-Type: application/json" \
  -d '{
    "age": 58,
    "injury": 0,
    "pain": 1,
    "mental_state": 2,
    "sbp": 88,
    "heart_rate": 120,
    "resp_rate": 24,
    "temperature": 98.6,
    "spo2": 88,
    "location": {"lat": 10.01, "lon": 76.34}
  }'
```

**Response excerpt:**
```json
{
  "report_type": "TRI_PRE_ARRIVAL_REPORT",
  "triage": {
    "severity": "HIGH",
    "probability": 0.99,
    "triage_level": "KTAS 1",
    "key_factors": ["Critical hypotension: SBP 88 mmHg", "Altered Mental State (Unresponsive)"],
    "required_facility": "ICU",
    "safety_overridden": true
  },
  "hospitals": [
    {"name": "City Medical Center", "score": 0.91, "eta_minutes": 4.5}
  ]
}
```

---

## Available Vital Presets

| Preset Name | Scenario |
|-------------|----------|
| `cardiac_emergency` | Acute cardiac event |
| `respiratory_distress` | Severe respiratory distress |
| `trauma_major` | Major trauma / internal bleeding |
| `stroke_suspected` | Suspected stroke |
| `diabetic_emergency` | Hypo/hyperglycaemic crisis |
| `anaphylaxis` | Severe allergic reaction |
| `minor_injury` | Low-acuity minor injury |

---

## AI Model

- **Algorithm:** Logistic Regression (`scikit-learn`)
- **Features:** age, injury, pain, mental_state, SBP, HR, RR, temp, SpO2
- **Labels:** KTAS 1–3 → HIGH, KTAS 4–5 → LOW
- **Training data:** Synthetic (2000 samples) with KTAS-inspired vital distributions
- **Persistence:** `models/severity.pkl` (auto-trained on first run)

## Safety Override Rules (Post-ML)

Rules fire **after** the ML prediction and always take priority:

| Rule | Condition | Override |
|------|-----------|----------|
| Unresponsive | `mental_state == 2` | → HIGH |
| Hypotension | `SBP < 90 mmHg` | → HIGH |
| Severe Hypoxia | `SpO2 < 85%` | → HIGH |
| Extreme Tachycardia | `HR > 150 bpm` | → HIGH |
| Severe Bradycardia | `HR < 40 bpm` | → HIGH |

## Hospital Ranking Formula

```
Score = 0.5 × facility_match + 0.3 × (1 − eta/60min) + 0.2 × availability
```

Returns top 3 hospitals. ETA computed via haversine distance at 60 km/h.

---

## Design Principles

- **Deterministic:** Same input always produces the same output
- **Explainable:** Every decision is traceable to rule or feature
- **Modular:** Each module is independently testable
- **Safety-first:** Hard overrides can never be bypassed by the ML model
