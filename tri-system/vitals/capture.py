"""
TRI System — Vital Capture & Pydantic Schemas
Input validation and data models for patient vitals.
"""

from pydantic import BaseModel, Field, field_validator
from typing import Optional


class Location(BaseModel):
    lat: float = Field(..., ge=-90.0, le=90.0, description="Latitude")
    lon: float = Field(..., ge=-180.0, le=180.0, description="Longitude")


class PatientInput(BaseModel):
    """
    Full patient input schema for triage assessment.
    mental_state: 0=alert, 1=confused, 2=unresponsive
    injury:       0=no injury, 1=minor, 2=major
    pain:         0=none, 1=mild, 2=severe
    """
    age:          int   = Field(..., ge=0, le=130, description="Patient age in years")
    injury:       int   = Field(..., ge=0, le=2,   description="Injury level (0=none, 1=minor, 2=major)")
    pain:         int   = Field(..., ge=0, le=2,   description="Pain level (0=none, 1=mild, 2=severe)")
    mental_state: int   = Field(..., ge=0, le=2,   description="Mental state (0=alert, 1=confused, 2=unresponsive)")
    sbp:          float = Field(..., ge=0,  le=300, description="Systolic blood pressure (mmHg)")
    heart_rate:   float = Field(..., ge=0,  le=300, description="Heart rate (bpm)")
    resp_rate:    float = Field(..., ge=0,  le=80,  description="Respiratory rate (breaths/min)")
    temperature:  float = Field(..., ge=85.0, le=115.0, description="Body temperature (°F)")
    spo2:         float = Field(..., ge=0,  le=100, description="SpO2 oxygen saturation (%)")
    location:     Location = Field(..., description="Ambulance/patient GPS location")

    model_config = {"json_schema_extra": {
        "example": {
            "age": 58,
            "injury": 0,
            "pain": 1,
            "mental_state": 2,
            "sbp": 90,
            "heart_rate": 120,
            "resp_rate": 24,
            "temperature": 98.6,
            "spo2": 88,
            "location": {"lat": 10.01, "lon": 76.34}
        }
    }}


class VitalPresetRequest(BaseModel):
    """Request schema for loading preset vitals."""
    preset_name: str = Field(..., description="Name of the vital preset to load")
    location:    Location = Field(..., description="Ambulance GPS location")

    @field_validator("preset_name")
    @classmethod
    def preset_name_lower(cls, v: str) -> str:
        return v.lower().strip()


class VitalsOnly(BaseModel):
    """Vitals subset used internally when merging preset + patient demographics."""
    spo2:        float
    heart_rate:  float
    sbp:         float
    resp_rate:   float
    temperature: float
