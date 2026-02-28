"""
TRI System — Hospital API Routes
POST /hospital/recommend — Recommend hospitals given patient vitals + triage
GET  /hospital/incoming  — Live incoming patient queue for hospital dashboards
"""

import logging
from typing import Dict, Any

from fastapi import APIRouter, HTTPException

from vitals.capture import PatientInput
from triage.triage_agent import run_triage
from hospital.coordinator import recommend_hospitals, get_incoming_queue

logger = logging.getLogger("tri.hospital_routes")
router = APIRouter()


# ---------------------------------------------------------------------------
# POST /hospital/recommend
# ---------------------------------------------------------------------------

@router.post("/hospital/recommend", summary="Recommend hospitals for a patient")
async def hospital_recommend(patient: PatientInput) -> Dict[str, Any]:
    """
    Accept patient vitals, run triage internally, and return ranked hospital
    recommendations. Equivalent to /triage/run but focused on the hospital output.
    """
    patient_dict = patient.model_dump()

    try:
        triage_output = run_triage(patient_dict)
        recommendation = recommend_hospitals(patient_dict, triage_output)

        return {
            "case_id":               recommendation["case_id"],
            "timestamp":             recommendation["timestamp"],
            "severity":              triage_output["severity"],
            "triage_level":          triage_output["triage_level"],
            "required_facility":     triage_output["required_facility"],
            "recommended_hospitals": recommendation["recommended_hospitals"],
        }

    except Exception as e:
        logger.exception("Error in hospital recommend")
        raise HTTPException(status_code=500, detail=f"Recommendation error: {str(e)}")


# ---------------------------------------------------------------------------
# GET /hospital/incoming
# ---------------------------------------------------------------------------

@router.get("/hospital/incoming", summary="Hospital dashboard — live incoming patient feed")
async def hospital_incoming() -> Dict[str, Any]:
    """
    Returns all incoming ambulance cases in the queue (most recent first).
    Intended for hospital triage desks to prepare for incoming patients.
    """
    queue = get_incoming_queue()
    return {
        "total_incoming": len(queue),
        "cases": queue,
    }
