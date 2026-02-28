"""
TRI System — Ambulance API Routes
POST /triage/run     — Full triage pipeline (vitals → triage → hospital recommendation)
POST /vitals/preset  — Resolve preset name to vitals profile
"""

import logging
from typing import Dict, Any

from fastapi import APIRouter, HTTPException

from vitals.capture import PatientInput, VitalPresetRequest
from vitals.presets import get_preset, list_presets
from triage.triage_agent import run_triage
from hospital.coordinator import recommend_hospitals

logger = logging.getLogger("tri.ambulance_routes")
router = APIRouter()


# ---------------------------------------------------------------------------
# POST /triage/run
# ---------------------------------------------------------------------------

@router.post("/triage/run", summary="Run full triage + hospital recommendation pipeline")
async def triage_run(patient: PatientInput) -> Dict[str, Any]:
    """
    Accept full patient vitals, run triage AI pipeline, apply safety overrides,
    and return recommended hospitals with structured pre-arrival report.
    """
    patient_dict = patient.model_dump()

    try:
        # Step 1 — Triage
        triage_output = run_triage(patient_dict)

        # Step 2 — Hospital recommendation
        recommendation = recommend_hospitals(patient_dict, triage_output)

        # Step 3 — Assemble pre-arrival report
        report = {
            "report_type":   "TRI_PRE_ARRIVAL_REPORT",
            "case_id":       recommendation["case_id"],
            "timestamp":     recommendation["timestamp"],
            "patient": {
                "age":          patient.age,
                "mental_state": patient.mental_state,
                "location":     patient_dict["location"],
            },
            "triage": triage_output,
            "hospitals": recommendation["recommended_hospitals"],
        }

        logger.info("Triage run complete — case_id=%s severity=%s",
                    report["case_id"], triage_output["severity"])
        return report

    except Exception as e:
        logger.exception("Error during triage run")
        raise HTTPException(status_code=500, detail=f"Triage pipeline error: {str(e)}")


# ---------------------------------------------------------------------------
# POST /vitals/preset
# ---------------------------------------------------------------------------

@router.post("/vitals/preset", summary="Resolve a vital preset name to a vitals profile")
async def vitals_preset(req: VitalPresetRequest) -> Dict[str, Any]:
    """
    Return the vital profile for a named preset (e.g. 'cardiac_emergency').
    The caller can then merge with patient demographics and call /triage/run.
    """
    preset = get_preset(req.preset_name)
    if preset is None:
        raise HTTPException(
            status_code=404,
            detail=f"Preset '{req.preset_name}' not found. Available: {list_presets()}"
        )

    return {
        "preset_name":  preset["preset_name"],
        "description":  preset["description"],
        "vitals":       preset["vitals"],
        "note": (
            "Merge these vitals with patient demographics "
            "(age, injury, pain, mental_state, location) before calling /triage/run."
        ),
    }


# ---------------------------------------------------------------------------
# GET /vitals/presets/list  (bonus endpoint)
# ---------------------------------------------------------------------------

@router.get("/vitals/presets/list", summary="List all available vital presets")
async def list_vital_presets() -> Dict[str, Any]:
    return {"available_presets": list_presets()}
