"use client";

import { useState } from "react";
import VitalPreset from "@/components/VitalPreset";
import PatientForm from "@/components/PatientForm";
import SeverityCard from "@/components/SeverityCard";
import HospitalList from "@/components/HospitalList";
import { runTriage, recommendHospitals } from "@/lib/api";
import { TriageInput, TriageResponse, RecommendedHospital, PresetName } from "@/types/triage";

export default function AmbulanceConsole() {
    const [activePreset, setActivePreset] = useState<PresetName | null>(null);
    const [vitals, setVitals] = useState<TriageInput>({
        age: 0, injury: 0, pain: 0, mental_state: 0, sbp: 120, heart_rate: 80, resp_rate: 16, temperature: 98.6, spo2: 98,
        location: { lat: 10.05, lon: 76.36 } // Mock ambulance location
    });

    const [isLoading, setIsLoading] = useState(false);
    const [triageResult, setTriageResult] = useState<TriageResponse | null>(null);
    const [hospitals, setHospitals] = useState<RecommendedHospital[]>([]);
    const [selectedHospital, setSelectedHospital] = useState<string | null>(null);

    const handleVitalChange = (field: keyof TriageInput, value: number) => {
        setVitals(prev => ({ ...prev, [field]: value }));
    };

    const handleSelectPreset = (presetData: Partial<TriageInput>, name: PresetName) => {
        setActivePreset(name);
        setVitals(prev => ({ ...prev, ...presetData }));
    };

    const handleRunTriage = async () => {
        setIsLoading(true);
        setTriageResult(null);
        setHospitals([]);
        setSelectedHospital(null);

        try {
            // 1. Run AI Triage
            const result = await runTriage(vitals);
            setTriageResult(result);

            // 2. Fetch Hospital Recommendations based on required facility
            const recs = await recommendHospitals({
                required_facility: result.required_facility,
                location: vitals.location
            });
            setHospitals(recs.recommended_hospitals);

        } catch (error) {
            console.error("Triage failed", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectHospital = (hospital: RecommendedHospital) => {
        setSelectedHospital(hospital.name);
        // In a real app, this would emit a websocket event or POST to the hospital dashboard
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
                <div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
                        AMBULANCE CONSOLE
                        <span className="flex h-3 w-3 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                        </span>
                    </h1>
                    <p className="text-slate-400 text-sm mt-1 font-mono uppercase tracking-widest">
                        Field Unit UI - Awaiting Telemetry
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* LEFT COLUMN: Input */}
                <div className="lg:col-span-7 space-y-6">
                    <VitalPreset
                        onSelectPreset={handleSelectPreset}
                        activePreset={activePreset}
                    />
                    <PatientForm
                        data={vitals}
                        onChange={handleVitalChange}
                        onSubmit={handleRunTriage}
                        isLoading={isLoading}
                    />
                </div>

                {/* RIGHT COLUMN: Output */}
                <div className="lg:col-span-5 space-y-6">
                    {!triageResult && !isLoading && (
                        <div className="h-full min-h-[400px] flex items-center justify-center border-2 border-dashed border-slate-700/50 rounded-2xl bg-slate-800/20">
                            <div className="text-center text-slate-500 font-mono text-sm max-w-[200px]">
                                Enter vitals and run assessment to see AI severity and destination.
                            </div>
                        </div>
                    )}

                    {triageResult && (
                        <div className="space-y-6">
                            <SeverityCard result={triageResult} />
                            <HospitalList
                                hospitals={hospitals}
                                onSelect={handleSelectHospital}
                                selectedHospitalName={selectedHospital}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
