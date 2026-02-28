"""
TRI System — Explainability Engine
Identifies the key clinical factors driving the triage severity level.
Rule-based threshold checks — fully transparent, no black-box.
"""

from typing import List, Dict, Any


# Threshold definitions: (feature, operator, threshold, label)
# operator: "lt" | "gt" | "ge" | "eq"
FACTOR_RULES: List[Dict[str, Any]] = [
    {"feature": "sbp",          "op": "lt",  "threshold": 90,   "label": "Critical Low SBP (Hypotension)"},
    {"feature": "sbp",          "op": "lt",  "threshold": 100,  "label": "Low SBP"},
    {"feature": "sbp",          "op": "gt",  "threshold": 180,  "label": "Severe Hypertension"},
    {"feature": "heart_rate",   "op": "gt",  "threshold": 130,  "label": "Extreme Tachycardia"},
    {"feature": "heart_rate",   "op": "gt",  "threshold": 100,  "label": "Elevated Heart Rate"},
    {"feature": "heart_rate",   "op": "lt",  "threshold": 50,   "label": "Bradycardia"},
    {"feature": "spo2",         "op": "lt",  "threshold": 85,   "label": "Severe Hypoxia (SpO2 < 85%)"},
    {"feature": "spo2",         "op": "lt",  "threshold": 92,   "label": "Low Oxygen Saturation"},
    {"feature": "resp_rate",    "op": "gt",  "threshold": 29,   "label": "Critically High Respiratory Rate"},
    {"feature": "resp_rate",    "op": "gt",  "threshold": 20,   "label": "Elevated Respiratory Rate"},
    {"feature": "resp_rate",    "op": "lt",  "threshold": 10,   "label": "Dangerously Low Respiratory Rate"},
    {"feature": "mental_state", "op": "ge",  "threshold": 2,    "label": "Altered Mental State (Unresponsive)"},
    {"feature": "mental_state", "op": "ge",  "threshold": 1,    "label": "Altered Mental State (Confused)"},
    {"feature": "pain",         "op": "ge",  "threshold": 2,    "label": "Severe Pain"},
    {"feature": "injury",       "op": "ge",  "threshold": 2,    "label": "Major Traumatic Injury"},
    {"feature": "temperature",  "op": "gt",  "threshold": 103,  "label": "High Fever (Hyperthermia)"},
    {"feature": "temperature",  "op": "lt",  "threshold": 96,   "label": "Hypothermia"},
]

# Prevent duplicate label when a more specific rule already fired
_SUPERSEDED_BY: Dict[str, str] = {
    "Low SBP":                        "Critical Low SBP (Hypotension)",
    "Elevated Heart Rate":            "Extreme Tachycardia",
    "Low Oxygen Saturation":          "Severe Hypoxia (SpO2 < 85%)",
    "Elevated Respiratory Rate":      "Critically High Respiratory Rate",
    "Altered Mental State (Confused)":"Altered Mental State (Unresponsive)",
}

_OPS = {
    "lt": lambda v, t: v <  t,
    "gt": lambda v, t: v >  t,
    "ge": lambda v, t: v >= t,
    "eq": lambda v, t: v == t,
}


def identify_key_factors(patient: dict) -> List[str]:
    """
    Return a de-duplicated list of human-readable clinical factors
    found in the patient vitals.

    Args:
        patient: dict with patient vitals
    Returns:
        List of factor label strings (most critical first)
    """
    fired_labels: List[str] = []

    for rule in FACTOR_RULES:
        value = patient.get(rule["feature"])
        if value is None:
            continue
        check = _OPS[rule["op"]]
        if check(float(value), rule["threshold"]):
            label = rule["label"]
            # Skip if superseded by a more specific label already captured
            superseded_by = _SUPERSEDED_BY.get(label)
            if superseded_by and superseded_by in fired_labels:
                continue
            if label not in fired_labels:
                fired_labels.append(label)

    return fired_labels


def determine_required_facility(patient: dict, severity: str) -> str:
    """
    Determine the minimum required hospital facility type based on vitals.
    Returns: "ICU" | "TRAUMA" | "CARDIAC" | "BASIC"
    """
    if severity == "LOW":
        return "BASIC"

    # Mental state unresponsive or critical SpO2 → ICU
    if patient.get("mental_state", 0) >= 2 or patient.get("spo2", 100) < 85:
        return "ICU"

    # Major injury → TRAUMA
    if patient.get("injury", 0) >= 2:
        return "TRAUMA"

    # Cardiac-pattern (low SBP + tachycardia)
    if patient.get("sbp", 999) < 90 and patient.get("heart_rate", 0) > 100:
        return "CARDIAC"

    return "ICU"
