"""
TRI — Triage Response Intelligence System
FastAPI Application Entry Point

Startup:
  uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
"""

import logging
import sys
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.ambulance_routes import router as ambulance_router
from api.hospital_routes import router as hospital_router

# ---------------------------------------------------------------------------
# Logging configuration
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s — %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger("tri.main")


# ---------------------------------------------------------------------------
# Lifespan — pre-load model at startup
# ---------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚑 TRI System starting up — pre-loading severity model...")
    from triage.severity_model import get_model
    get_model()   # triggers train/load
    logger.info("✅ Severity model ready.")
    yield
    logger.info("TRI System shutting down.")


# ---------------------------------------------------------------------------
# FastAPI app
# ---------------------------------------------------------------------------
app = FastAPI(
    title="TRI — Triage Response Intelligence System",
    description=(
        "AI-assisted pre-hospital emergency decision support system. "
        "Accepts ambulance patient vitals, estimates severity, applies medical "
        "safety overrides, and recommends the most appropriate hospitals."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS (allow all for ambulance/hospital clients in the field)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Route registration
# ---------------------------------------------------------------------------
app.include_router(ambulance_router, tags=["Ambulance"])
app.include_router(hospital_router,  tags=["Hospital"])


# ---------------------------------------------------------------------------
# Health / Info endpoints
# ---------------------------------------------------------------------------
@app.get("/", tags=["System"])
async def root():
    return {
        "system": "TRI — Triage Response Intelligence System",
        "status": "operational",
        "version": "1.0.0",
        "endpoints": {
            "POST /triage/run":         "Full triage pipeline + pre-arrival report",
            "POST /vitals/preset":      "Resolve preset vitals by name",
            "GET  /vitals/presets/list":"List all preset names",
            "POST /hospital/recommend": "Hospital recommendation from vitals",
            "GET  /hospital/incoming":  "Hospital dashboard incoming patient feed",
            "GET  /docs":               "Interactive Swagger UI",
        },
    }


@app.get("/health", tags=["System"])
async def health():
    return {"status": "healthy"}
