import { TriageInput, TriageResponse, HospitalRecommendResponse } from "../types/triage";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const runTriage = async (data: TriageInput): Promise<TriageResponse> => {
    const response = await fetch(`${API_BASE}/triage/run`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error(`Triage failed: ${response.statusText}`);
    }

    return response.json();
};

export const recommendHospitals = async (data: any): Promise<HospitalRecommendResponse> => {
    const response = await fetch(`${API_BASE}/hospital/recommend`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error(`Hospital recommendation failed: ${response.statusText}`);
    }

    return response.json();
};
