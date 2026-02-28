"""
TRI System — Global Configuration
"""

import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Model path
MODEL_PATH = os.path.join(BASE_DIR, "models", "severity.pkl")

# Hospital DB path
HOSPITAL_DB_PATH = os.path.join(BASE_DIR, "hospital", "hospital_db.json")

# Hospital ranking weights
FACILITY_WEIGHT   = 0.5
ETA_WEIGHT        = 0.3
AVAILABILITY_WEIGHT = 0.2

# Top N hospitals to return
TOP_N_HOSPITALS = 3

# Safety rule thresholds
SBP_CRITICAL_THRESHOLD = 90       # mmHg — systolic blood pressure
MENTAL_STATE_UNRESPONSIVE = 2     # 0=alert, 1=confused, 2=unresponsive

# Average ambulance speed for ETA estimation (km/h)
AMBULANCE_SPEED_KMH = 60.0

# Severity labels
SEVERITY_HIGH = "HIGH"
SEVERITY_LOW  = "LOW"

# KTAS levels
KTAS_HIGH_LEVELS = {1, 2, 3}
KTAS_LOW_LEVELS  = {4, 5}

# Required facility mapping per severity/condition
FACILITY_MAP = {
    "ICU":    ["icu"],
    "TRAUMA": ["trauma"],
    "CARDIAC": ["cardiac"],
    "BASIC":  [],
}
