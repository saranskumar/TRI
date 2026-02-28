"""
TRI System — Feature Preprocessing
Converts PatientInput dict → normalized numpy array for the severity model.
"""

import numpy as np
from typing import Dict, Any


# Feature names — ORDER MUST MATCH model training
FEATURE_NAMES = [
    "age",
    "injury",
    "pain",
    "mental_state",
    "sbp",
    "heart_rate",
    "resp_rate",
    "temperature",
    "spo2",
]

# Normalisation bounds [min, max] per feature (physiological ranges)
FEATURE_BOUNDS = {
    "age":          (0,   100),
    "injury":       (0,   2),
    "pain":         (0,   2),
    "mental_state": (0,   2),
    "sbp":          (40,  200),
    "heart_rate":   (30,  200),
    "resp_rate":    (6,   60),
    "temperature":  (94,  108),
    "spo2":         (60,  100),
}


def _minmax_scale(value: float, low: float, high: float) -> float:
    """Scale a value into [0, 1] using fixed physiological bounds."""
    if high == low:
        return 0.0
    return float(np.clip((value - low) / (high - low), 0.0, 1.0))


def extract_features(patient: Dict[str, Any]) -> np.ndarray:
    """
    Convert a patient dict to a normalised 1-D numpy feature vector.

    Args:
        patient: dict with keys matching FEATURE_NAMES
    Returns:
        np.ndarray shape (1, n_features) for direct model input
    """
    vector = []
    for feat in FEATURE_NAMES:
        raw = patient.get(feat, 0)
        low, high = FEATURE_BOUNDS[feat]
        vector.append(_minmax_scale(float(raw), low, high))
    return np.array(vector, dtype=np.float32).reshape(1, -1)
