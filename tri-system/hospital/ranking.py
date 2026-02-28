"""
TRI System — Hospital Ranking Engine
Scores hospitals using:
  Score = 0.5 * facility_match + 0.3 * (1/eta_normalized) + 0.2 * availability

ETA computed from haversine distance and ambulance speed.
Returns top N hospitals.
"""

import json
import math
import logging
from typing import List, Dict, Any, Tuple

from app.config import (
    HOSPITAL_DB_PATH,
    FACILITY_WEIGHT,
    ETA_WEIGHT,
    AVAILABILITY_WEIGHT,
    TOP_N_HOSPITALS,
    AMBULANCE_SPEED_KMH,
)

logger = logging.getLogger("tri.hospital_ranking")

# Facility groups required for each facility type
_FACILITY_REQUIREMENTS: Dict[str, List[str]] = {
    "ICU":     ["icu"],
    "TRAUMA":  ["trauma"],
    "CARDIAC": ["cardiac"],
    "BASIC":   [],
}

# Max ETA used for normalisation (minutes)
_MAX_ETA_MIN = 60.0


def _load_hospitals() -> List[Dict[str, Any]]:
    with open(HOSPITAL_DB_PATH, "r") as f:
        return json.load(f)


def _haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Compute great-circle distance between two (lat, lon) points in km."""
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2
         + math.cos(math.radians(lat1))
         * math.cos(math.radians(lat2))
         * math.sin(dlon / 2) ** 2)
    return R * 2 * math.asin(math.sqrt(a))


def _compute_eta_minutes(distance_km: float) -> float:
    """Estimate ETA in minutes given distance and ambulance speed."""
    return round((distance_km / AMBULANCE_SPEED_KMH) * 60.0, 1)


def _facility_match_score(hospital: Dict[str, Any], required_facility: str) -> float:
    """
    Return a facility match score in [0, 1].
    - Required facilities all present → 1.0
    - Partial match → proportional
    - No required facilities needed (BASIC) → 1.0
    """
    required_keys = _FACILITY_REQUIREMENTS.get(required_facility.upper(), [])
    if not required_keys:
        return 1.0

    facilities = hospital.get("facilities", {})
    matched = sum(1 for key in required_keys if facilities.get(key, False))
    return matched / len(required_keys)


def rank_hospitals(
    patient_lat: float,
    patient_lon: float,
    required_facility: str,
) -> List[Dict[str, Any]]:
    """
    Rank all hospitals and return the top N recommendations.

    Args:
        patient_lat:       Patient/ambulance latitude
        patient_lon:       Patient/ambulance longitude
        required_facility: Required facility type ("ICU", "TRAUMA", "CARDIAC", "BASIC")
    Returns:
        List of top N hospital dicts with score and ETA
    """
    hospitals = _load_hospitals()
    scored: List[Tuple[float, Dict[str, Any]]] = []

    for h in hospitals:
        lat2 = h["location"]["lat"]
        lon2 = h["location"]["lon"]

        dist_km = _haversine_km(patient_lat, patient_lon, lat2, lon2)
        eta_min = _compute_eta_minutes(dist_km)

        fac_score = _facility_match_score(h, required_facility)
        eta_score  = 1.0 - min(eta_min / _MAX_ETA_MIN, 1.0)   # higher = nearer
        avail_score = float(h.get("availability_score", 0.5))

        composite = (
            FACILITY_WEIGHT    * fac_score
            + ETA_WEIGHT       * eta_score
            + AVAILABILITY_WEIGHT * avail_score
        )

        scored.append((composite, {
            "id":           h["id"],
            "name":         h["name"],
            "score":        round(composite, 4),
            "eta_minutes":  eta_min,
            "distance_km":  round(dist_km, 2),
            "facilities":   h["facilities"],
            "availability": avail_score,
        }))

    # Sort descending by score
    scored.sort(key=lambda x: x[0], reverse=True)
    return [entry for _, entry in scored[:TOP_N_HOSPITALS]]
