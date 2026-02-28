"""
TRI System — Safety Rule Engine
Hard medical override rules that execute AFTER ML prediction.

Rules are deterministic and safety-critical. Any rule that fires
will force the severity to HIGH and record the reason.
"""

from typing import Tuple, List
from app.config import SBP_CRITICAL_THRESHOLD, MENTAL_STATE_UNRESPONSIVE, SEVERITY_HIGH


class SafetyOverrideResult:
    def __init__(
        self,
        severity: str,
        overridden: bool,
        reasons: List[str],
        ml_severity: str,
    ):
        self.severity    = severity
        self.overridden  = overridden
        self.reasons     = reasons
        self.ml_severity = ml_severity

    def as_dict(self) -> dict:
        return {
            "severity":    self.severity,
            "overridden":  self.overridden,
            "reasons":     self.reasons,
            "ml_severity": self.ml_severity,
        }


# ---------------------------------------------------------------------------
# Rule definitions
# Each rule is a callable: (patient_dict) -> Optional[str]
# Returns a non-empty reason string if the rule fires, else None.
# ---------------------------------------------------------------------------

def rule_unresponsive(patient: dict) -> str | None:
    if patient.get("mental_state", 0) >= MENTAL_STATE_UNRESPONSIVE:
        return "Unresponsive mental state — immediate HIGH acuity required"
    return None


def rule_hypotension(patient: dict) -> str | None:
    if patient.get("sbp", 999) < SBP_CRITICAL_THRESHOLD:
        return f"Critical hypotension: SBP {patient['sbp']} mmHg < {SBP_CRITICAL_THRESHOLD} mmHg"
    return None


def rule_critical_spo2(patient: dict) -> str | None:
    if patient.get("spo2", 100) < 85:
        return f"Severe hypoxia: SpO2 {patient['spo2']}% — life-threatening"
    return None


def rule_extreme_tachycardia(patient: dict) -> str | None:
    if patient.get("heart_rate", 0) > 150:
        return f"Extreme tachycardia: HR {patient['heart_rate']} bpm"
    return None


def rule_severe_bradycardia(patient: dict) -> str | None:
    if patient.get("heart_rate", 999) < 40:
        return f"Severe bradycardia: HR {patient['heart_rate']} bpm"
    return None


# Ordered list of all active safety rules
SAFETY_RULES = [
    rule_unresponsive,
    rule_hypotension,
    rule_critical_spo2,
    rule_extreme_tachycardia,
    rule_severe_bradycardia,
]


def apply_safety_rules(patient: dict, ml_severity: str) -> SafetyOverrideResult:
    """
    Execute all safety rules against the patient dict.
    If any rule fires, severity is forced to HIGH regardless of ML output.

    Args:
        patient:     dict with patient vitals
        ml_severity: ML model's predicted severity label

    Returns:
        SafetyOverrideResult with final severity and override details
    """
    fired_reasons: List[str] = []

    for rule in SAFETY_RULES:
        reason = rule(patient)
        if reason:
            fired_reasons.append(reason)

    if fired_reasons:
        return SafetyOverrideResult(
            severity   = SEVERITY_HIGH,
            overridden = ml_severity != SEVERITY_HIGH,
            reasons    = fired_reasons,
            ml_severity= ml_severity,
        )

    return SafetyOverrideResult(
        severity   = ml_severity,
        overridden = False,
        reasons    = [],
        ml_severity= ml_severity,
    )
