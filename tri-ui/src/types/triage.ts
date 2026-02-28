export interface TriageInput {
    age: number;
    injury: number; // 0 = no, 1 = yes
    pain: number; // 0-10 or localized scale
    mental_state: number; // 0 = alert, 1 = altered, 2 = unresponsive
    sbp: number; // Systolic Blood Pressure
    heart_rate: number;
    resp_rate: number;
    temperature: number;
    spo2: number;
    location?: { lat: number; lon: number };
}

export interface TriageResponse {
    severity: "HIGH" | "MEDIUM" | "LOW";
    probability: number;
    required_facility: string; // e.g. "ICU", "Trauma", "General"
    key_factors: string[];
}

export interface RecommendedHospital {
    name: string;
    eta_minutes: number;
    score: number;
}

export interface HospitalRecommendResponse {
    recommended_hospitals: RecommendedHospital[];
}

// Preset types for convenience
export type PresetName = "Cardiac Emergency" | "Respiratory Distress" | "Trauma" | "Stable Patient";
