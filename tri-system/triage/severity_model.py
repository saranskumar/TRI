"""
TRI System — Severity Model
Logistic Regression classifier trained on synthetic KTAS-mapped data.

Binary classification:
  KTAS 1-3 → HIGH acuity (1)
  KTAS 4-5 → LOW  acuity (0)

Model is trained once and saved to disk. Subsequent startups load the pkl.
"""

import os
import pickle
import logging
import numpy as np
from typing import Tuple, Dict, Any

from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report

from app.config import MODEL_PATH, SEVERITY_HIGH, SEVERITY_LOW
from triage.preprocess import FEATURE_NAMES

logger = logging.getLogger("tri.severity_model")


# ---------------------------------------------------------------------------
# Synthetic dataset generation (KTAS-inspired distribution)
# ---------------------------------------------------------------------------

def _generate_training_data(n_samples: int = 2000, random_state: int = 42) -> Tuple[np.ndarray, np.ndarray]:
    """
    Generate synthetic patient data with realistic vital distributions.
    High-acuity (KTAS 1-3) patients get skewed vitals toward danger zones.
    """
    rng = np.random.default_rng(random_state)

    X_high = np.column_stack([
        rng.integers(20, 90,  size=n_samples // 2).astype(float),   # age
        rng.integers(0,  3,   size=n_samples // 2).astype(float),   # injury
        rng.integers(1,  3,   size=n_samples // 2).astype(float),   # pain
        rng.integers(1,  3,   size=n_samples // 2).astype(float),   # mental_state
        rng.uniform(60,  95,  size=n_samples // 2),                 # sbp
        rng.uniform(100, 180, size=n_samples // 2),                 # heart_rate
        rng.uniform(22,  50,  size=n_samples // 2),                 # resp_rate
        rng.uniform(95,  105, size=n_samples // 2),                 # temperature
        rng.uniform(70,  92,  size=n_samples // 2),                 # spo2
    ])
    y_high = np.ones(n_samples // 2, dtype=int)

    X_low = np.column_stack([
        rng.integers(18, 85,  size=n_samples // 2).astype(float),   # age
        rng.integers(0,  2,   size=n_samples // 2).astype(float),   # injury
        rng.integers(0,  2,   size=n_samples // 2).astype(float),   # pain
        rng.integers(0,  1,   size=n_samples // 2).astype(float),   # mental_state
        rng.uniform(100, 160, size=n_samples // 2),                 # sbp
        rng.uniform(60,  100, size=n_samples // 2),                 # heart_rate
        rng.uniform(12,  20,  size=n_samples // 2),                 # resp_rate
        rng.uniform(97,  101, size=n_samples // 2),                 # temperature
        rng.uniform(94,  100, size=n_samples // 2),                 # spo2
    ])
    y_low = np.zeros(n_samples // 2, dtype=int)

    X = np.vstack([X_high, X_low])
    y = np.concatenate([y_high, y_low])

    # Shuffle
    idx = rng.permutation(len(X))
    return X[idx], y[idx]


def _normalise(X: np.ndarray) -> np.ndarray:
    """Apply the same min-max normalisation used in preprocess.py."""
    from triage.preprocess import FEATURE_BOUNDS
    bounds = [FEATURE_BOUNDS[f] for f in FEATURE_NAMES]
    result = np.empty_like(X, dtype=np.float32)
    for i, (low, high) in enumerate(bounds):
        rng = high - low or 1.0
        result[:, i] = np.clip((X[:, i] - low) / rng, 0.0, 1.0)
    return result


# ---------------------------------------------------------------------------
# Training & persistence
# ---------------------------------------------------------------------------

def train_and_save() -> LogisticRegression:
    """Train the model on synthetic data and save to disk."""
    logger.info("Training severity model...")
    X_raw, y = _generate_training_data()
    X = _normalise(X_raw)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    model = LogisticRegression(max_iter=500, random_state=42, class_weight="balanced")
    model.fit(X_train, y_train)

    report = classification_report(y_test, model.predict(X_test), target_names=["LOW", "HIGH"])
    logger.info("Model training complete:\n%s", report)

    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    with open(MODEL_PATH, "wb") as f:
        pickle.dump(model, f)
    logger.info("Severity model saved to %s", MODEL_PATH)
    return model


def load_model() -> LogisticRegression:
    """Load model from disk, training first if pkl does not exist."""
    if not os.path.exists(MODEL_PATH):
        logger.info("No saved model found — training now.")
        return train_and_save()
    with open(MODEL_PATH, "rb") as f:
        model = pickle.load(f)
    logger.info("Severity model loaded from %s", MODEL_PATH)
    return model


# ---------------------------------------------------------------------------
# Singleton model instance
# ---------------------------------------------------------------------------
_model: LogisticRegression | None = None


def get_model() -> LogisticRegression:
    global _model
    if _model is None:
        _model = load_model()
    return _model


# ---------------------------------------------------------------------------
# Prediction
# ---------------------------------------------------------------------------

def predict(feature_vector: np.ndarray) -> Tuple[str, float]:
    """
    Run severity prediction on a pre-processed feature vector.

    Args:
        feature_vector: np.ndarray shape (1, n_features) — already normalised
    Returns:
        Tuple of (severity_label, probability_of_high_acuity)
    """
    model = get_model()
    proba = model.predict_proba(feature_vector)[0]   # [P_LOW, P_HIGH]
    p_high = float(proba[1])
    label = SEVERITY_HIGH if p_high >= 0.5 else SEVERITY_LOW
    return label, round(p_high, 4)


def retrain() -> Dict[str, Any]:
    """Force retrain and reload. Useful for live model refresh."""
    global _model
    _model = train_and_save()
    return {"status": "retrained", "model_path": MODEL_PATH}
