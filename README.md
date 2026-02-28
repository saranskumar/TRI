# TRI – AI Academic Automation Agent

[![Python](https://img.shields.io/badge/Python-3.10+-blue)](https://python.org) [![Flask](https://img.shields.io/badge/Flask-3.0-green)](https://flask.palletsprojects.com) [![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org) [![Gemini](https://img.shields.io/badge/AI-Gemini%201.5%20Flash-purple)](https://ai.google.dev)

> **TRI** converts fragmented student academic preparation into an automated, intelligent, adaptive learning workflow powered by Google Gemini AI.

## Architecture

```
Student → Next.js UI → Flask Agent Controller → Gemini AI → Personalized Outputs
```

## Features

| Engine | Description |
|---|---|
| 🧠 **Syllabus Intelligence** | Extracts key topics & PYQ focus areas from raw text |
| 📊 **Academic Analysis** | Detects strong/weak subjects with readiness score |
| 📝 **Notes Generator** | Creates beginner notes, revision summaries & exam tips |
| 📅 **Study Planner** | Generates personalized 7/14-day adaptive roadmap |
| 🧪 **Evaluation Engine** | Quiz generation + answer scoring + weakness detection |
| 🔄 **Adaptive Loop** | Auto-regenerates plan based on quiz weakness data |

## Project Structure

```
TRI/
├── backend/
│   ├── app.py                  # Flask server + CORS + session store
│   ├── gemini_service.py       # All Gemini prompt builders
│   ├── requirements.txt
│   └── routes/
│       ├── analyze.py          # POST /analyze_student
│       ├── plan.py             # POST /generate_plan
│       ├── evaluate.py         # POST /evaluate
│       └── adapt.py           # POST /adapt_learning
└── frontend/
    ├── app/
    │   ├── page.tsx            # 3-step Profile Setup
    │   ├── dashboard/page.tsx  # Main dashboard (4 tabs)
    │   └── evaluate/page.tsx   # Interactive quiz
    └── lib/api.ts              # Typed API client
```

## Quick Start

### 1. Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
cp .env.example .env         # Add your GEMINI_API_KEY
python app.py
# → Running on http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
# → Running on http://localhost:3000
```

### 3. Get a Free Gemini API Key

[Google AI Studio → Get API Key](https://aistudio.google.com/app/apikey) (free tier is sufficient)

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/analyze_student` | Analyze marks + syllabus → profile |
| `POST` | `/generate_plan` | Generate 7/14-day study roadmap |
| `POST` | `/evaluate` | Generate quiz or evaluate answers |
| `POST` | `/adapt_learning` | Regenerate plan from weakness data |
| `GET`  | `/health` | Health check |

## The Adaptive Learning Loop

```
Study → Evaluate Me → Detect Weakness → Regenerate Notes → Adapt Study Plan → repeat
```
