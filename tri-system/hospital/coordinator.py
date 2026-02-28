"""
TRI System — Hospital Coordinator
Combines triage output + patient location into a hospital recommendation.
Maintains an in-memory incoming queue for the hospital dashboard.
"""

import logging
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, List

from hospital.ranking import rank_hospitals

logger = logging.getLogger("tri.hospital_coordinator")

# In-memory queue — stores the last N incoming assessments per hospital
_incoming_queue: List[Dict[str, Any]] = []
MAX_QUEUE_SIZE = 50


def recommend_hospitals(
    patient: Dict[str, Any],
    triage_output: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Generate hospital recommendations based on patient location and triage result.

    Args:
        patient:        dict with at least 'location' (lat, lon)
        triage_output:  dict from triage_agent.run_triage()
    Returns:
        Recommendation dict with top hospitals and full triage context
    """
    lat = patient["location"]["lat"]
    lon = patient["location"]["lon"]
    required_facility = triage_output.get("required_facility", "BASIC")

    hospitals = rank_hospitals(lat, lon, required_facility)

    recommendation = {
        "case_id":              str(uuid.uuid4()),
        "timestamp":            datetime.now(timezone.utc).isoformat(),
        "patient_location":     {"lat": lat, "lon": lon},
        "triage_summary":       triage_output,
        "required_facility":    required_facility,
        "recommended_hospitals": hospitals,
    }

    # Push to the incoming queue for hospital dashboards
    _push_to_incoming_queue(recommendation)

    logger.info(
        "Hospitals recommended: %s",
        [h["name"] for h in hospitals]
    )
    return recommendation


def _push_to_incoming_queue(recommendation: Dict[str, Any]) -> None:
    """Add a new case to the incoming queue (capped at MAX_QUEUE_SIZE)."""
    _incoming_queue.append(recommendation)
    if len(_incoming_queue) > MAX_QUEUE_SIZE:
        _incoming_queue.pop(0)


def get_incoming_queue() -> List[Dict[str, Any]]:
    """Return the live incoming patient queue (most recent last)."""
    return list(reversed(_incoming_queue))


def clear_incoming_queue() -> None:
    """Clear the incoming queue (for testing)."""
    _incoming_queue.clear()
