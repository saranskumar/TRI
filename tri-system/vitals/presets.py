"""
TRI System — Vital Presets
Pre-defined vital profiles for common emergency scenarios.
"""

from typing import Dict, Any

VITAL_PRESETS: Dict[str, Dict[str, Any]] = {
    "cardiac_emergency": {
        "preset_name": "cardiac_emergency",
        "description": "Acute cardiac event — chest pain, low BP, tachycardia",
        "vitals": {
            "spo2": 88,
            "heart_rate": 120,
            "sbp": 88,
            "resp_rate": 24,
            "temperature": 98.6,
        },
    },
    "respiratory_distress": {
        "preset_name": "respiratory_distress",
        "description": "Severe respiratory distress — low SpO2, rapid breathing",
        "vitals": {
            "spo2": 82,
            "heart_rate": 110,
            "sbp": 100,
            "resp_rate": 34,
            "temperature": 99.1,
        },
    },
    "trauma_major": {
        "preset_name": "trauma_major",
        "description": "Major trauma — suspected internal bleeding, hypotension",
        "vitals": {
            "spo2": 91,
            "heart_rate": 130,
            "sbp": 80,
            "resp_rate": 26,
            "temperature": 97.8,
        },
    },
    "stroke_suspected": {
        "preset_name": "stroke_suspected",
        "description": "Suspected stroke — altered consciousness, normal vitals",
        "vitals": {
            "spo2": 95,
            "heart_rate": 88,
            "sbp": 160,
            "resp_rate": 18,
            "temperature": 98.9,
        },
    },
    "diabetic_emergency": {
        "preset_name": "diabetic_emergency",
        "description": "Hypoglycaemic or hyperglycaemic emergency",
        "vitals": {
            "spo2": 96,
            "heart_rate": 105,
            "sbp": 95,
            "resp_rate": 20,
            "temperature": 98.6,
        },
    },
    "anaphylaxis": {
        "preset_name": "anaphylaxis",
        "description": "Severe allergic reaction — shock, low BP, wheeze",
        "vitals": {
            "spo2": 90,
            "heart_rate": 125,
            "sbp": 70,
            "resp_rate": 28,
            "temperature": 98.0,
        },
    },
    "minor_injury": {
        "preset_name": "minor_injury",
        "description": "Minor injury — stable vitals, low acuity",
        "vitals": {
            "spo2": 99,
            "heart_rate": 78,
            "sbp": 118,
            "resp_rate": 16,
            "temperature": 98.6,
        },
    },
}


def get_preset(preset_name: str) -> Dict[str, Any] | None:
    """Return the preset vitals dict for the given preset name, or None if not found."""
    return VITAL_PRESETS.get(preset_name.lower())


def list_presets() -> list[str]:
    """Return list of all available preset names."""
    return list(VITAL_PRESETS.keys())
