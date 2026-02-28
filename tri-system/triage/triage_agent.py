"""
TRI System — Triage Agent (Orchestrator)
Ties together: preprocess → ML predict → safety override → explainability → output.
"""

import logging
from typing import Dict, Any

from triage.preprocess import extract_features
from triage.severity_model import predict
from triage.safety_rules import apply_safety_rules
from triage.explainability import identify_key_factors, determine_required_facility

logger = logging.getLogger("tri.triage_agent")


def _map_triage_level(severity: str, probability: float) -> str:
    """Map severity + probability to an approximate KTAS level string."""
    if severity == "HIGH":
        if probability >= 0.85:
            return "KTAS 1"
        elif probability >= 0.70:
            return "KTAS 2"
        else:
            return "KTAS 3"
    else:
        if probability < 0.20:
            return "KTAS 5"
        return "KTAS 4"


def run_triage(patient: Dict[str, Any]) -> Dict[str, Any]:
    """
    Full triage pipeline for a patient input dict.

    Steps:
      1. Preprocess (normalise features)
      2. ML severity prediction
      3. Safety rule overrides
      4. Generate key clinical factors
      5. Determine required facility
      6. Return structured triage output

    Args:
        patient: dict matching PatientInput schema (without location key required)
    Returns:
        Structured triage output dict
    """
    logger.info("Running triage for patient: age=%s, sbp=%s, mental_state=%s",
                patient.get("age"), patient.get("sbp"), patient.get("mental_state"))

    # Step 1 — Preprocess
    features = extract_features(patient)

    # Step 2 — ML Prediction
    ml_severity, probability = predict(features)
    logger.debug("ML prediction: severity=%s, p_high=%.4f", ml_severity, probability)

    # Step 3 — Safety Overrides
    override_result = apply_safety_rules(patient, ml_severity)
    final_severity = override_result.severity

    if override_result.overridden:
        logger.warning(
            "Safety override fired! ML said %s → forced to %s. Reasons: %s",
            ml_severity, final_severity, override_result.reasons
        )
        # Confidence reflects the override certainty (HIGH → 0.99)
        probability = 0.99 if final_severity == "HIGH" else probability

    # Step 4 — Explainability
    key_factors = identify_key_factors(patient)
    if override_result.reasons:
        # Prepend safety rule reasons to factors list (de-duplicate)
        for reason in override_result.reasons:
            if reason not in key_factors:
                key_factors.insert(0, reason)

    # Step 5 — Required facility
    required_facility = determine_required_facility(patient, final_severity)

    # Step 6 — KTAS level
    triage_level = _map_triage_level(final_severity, probability)

    output = {
        "severity":          final_severity,
        "probability":       round(probability, 4),
        "triage_level":      triage_level,
        "key_factors":       key_factors[:5],          # top 5 factors
        "required_facility": required_facility,
        "safety_overridden": override_result.overridden,
        "override_reasons":  override_result.reasons,
    }

    logger.info("Triage complete: %s", output)
    return output
