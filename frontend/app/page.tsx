"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { analyzeStudent, generatePlan, uploadResourceText, getCLScheme } from "@/lib/api";

const CONFIDENCE_OPTIONS = ["low", "medium", "high"];

export default function HomePage() {
  const router = useRouter();
  const [step, setStep] = useState(0); // 0 = Resources, 1 = Profile, 2 = Marks, 3 = Syllabus
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sessionId, setSessionId] = useState("");

  // Resource state
  const [resourceText, setResourceText] = useState("");
  const [semester, setSemester] = useState("");
  const [studyHours, setStudyHours] = useState("4");
  const [subjectInput, setSubjectInput] = useState("");
  const [subjects, setSubjects] = useState<string[]>([]);
  const [confidence, setConfidence] = useState<Record<string, string>>({});

  // Marks state
  const [marks, setMarks] = useState<Record<string, { internal: string; assignment: string; previous_exam: string }>>({});

  // Syllabus + PYQ
  const [syllabus, setSyllabus] = useState("");
  const [pyqs, setPyqs] = useState("");

  function addSubject() {
    const trimmed = subjectInput.trim();
    if (trimmed && !subjects.includes(trimmed)) {
      const newSubjects = [...subjects, trimmed];
      setSubjects(newSubjects);
      setConfidence((prev) => ({ ...prev, [trimmed]: "medium" }));
      setMarks((prev) => ({ ...prev, [trimmed]: { internal: "", assignment: "", previous_exam: "" } }));
    }
    setSubjectInput("");
  }

  function removeSubject(s: string) {
    setSubjects((prev) => prev.filter((x) => x !== s));
    setConfidence((prev) => { const c = { ...prev }; delete c[s]; return c; });
    setMarks((prev) => { const m = { ...prev }; delete m[s]; return m; });
  }

  async function handleLoadCLScheme() {
    setLoading(true);
    setError("");
    try {
      // Create session id if not exists
      const sId = sessionId || crypto.randomUUID();
      setSessionId(sId);

      const res = await getCLScheme("semester 5 subjects syllabus");
      if (res.error) { throw new Error(res.error); }

      // Auto-upload the parsed CL scheme text as a resource for this session
      const parsedText = JSON.stringify(res.cl_scheme, null, 2);
      const upRes = await uploadResourceText(sId, parsedText);

      if (upRes.extracted_metadata) {
        const d = upRes.extracted_metadata;
        if (d.semester) setSemester(String(d.semester));
        if (d.subjects) {
          setSubjects(d.subjects);
          const c: Record<string, string> = {};
          d.subjects.forEach((s: string) => c[s] = d.confidence_defaults?.[s] || "medium");
          setConfidence(c);
        }
      }
      setStep(1);
    } catch (e: any) {
      setError(e.message || "Failed to load CL Scheme.");
    } finally {
      setLoading(false);
    }
  }

  async function handleUploadRaw() {
    if (!resourceText.trim()) return;
    setLoading(true);
    setError("");
    try {
      const sId = sessionId || crypto.randomUUID();
      setSessionId(sId);
      const upRes = await uploadResourceText(sId, resourceText);

      if (upRes.extracted_metadata) {
        const d = upRes.extracted_metadata;
        if (d.semester) setSemester(String(d.semester));
        if (d.subjects) {
          setSubjects(d.subjects);
          const c: Record<string, string> = {};
          d.subjects.forEach((s: string) => c[s] = d.confidence_defaults?.[s] || "medium");
          setConfidence(c);
        }
      }
      setStep(1);
    } catch (e: any) {
      setError(e.message || "Failed to upload resources.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit() {
    setLoading(true);
    setError("");
    try {
      const profile = { semester, subjects, study_hours: Number(studyHours), confidence };
      const marksPayload: Record<string, Record<string, number>> = {};
      for (const s of subjects) {
        marksPayload[s] = {
          internal: Number(marks[s]?.internal || 0),
          assignment: Number(marks[s]?.assignment || 0),
          previous_exam: Number(marks[s]?.previous_exam || 0),
        };
      }

      const payload = { profile, marks: marksPayload, syllabus, pyqs, session_id: sessionId };
      const analyzeRes = await analyzeStudent(payload);
      if (analyzeRes.error) { setError(analyzeRes.error); setLoading(false); return; }

      const newSessionId = analyzeRes.session_id;
      setSessionId(newSessionId);
      localStorage.setItem("tri_session_id", sessionId);
      localStorage.setItem("tri_analysis", JSON.stringify(analyzeRes.analysis));
      localStorage.setItem("tri_profile", JSON.stringify(profile));

      const planRes = await generatePlan(sessionId, 7);
      if (!planRes.error) {
        localStorage.setItem("tri_plan", JSON.stringify(planRes.plan));
      }

      router.push("/dashboard");
    } catch {
      setError("Could not connect to TRI backend. Make sure Flask is running on port 5000.");
    } finally {
      setLoading(false);
    }
  }

  const progressPct = (step / 3) * 100;

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "40px 24px" }}>
      {/* Header */}
      <div className="fade-in" style={{ textAlign: "center", marginBottom: 40 }}>
        <div
          style={{
            display: "inline-flex",
            padding: "6px 16px",
            borderRadius: 999,
            background: "rgba(139,92,246,0.12)",
            border: "1px solid rgba(139,92,246,0.3)",
            fontSize: 12,
            color: "#a78bfa",
            fontWeight: 600,
            marginBottom: 16,
            gap: 6,
          }}
        >
          <span>✦</span> AI-Powered Academic Agent
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 800, lineHeight: 1.2, marginBottom: 12 }}>
          Set up your{" "}
          <span className="gradient-text">Learning Profile</span>
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 15, lineHeight: 1.6 }}>
          TRI analyzes your academic data and builds a personalized, adaptive study strategy powered by Gemini AI.
        </p>
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          {["Resources", "Profile", "Marks", "Syllabus"].map((label, i) => (
            <span key={i} style={{
              fontSize: 12, fontWeight: 600,
              color: step >= i ? "var(--accent-purple)" : "var(--text-secondary)"
            }}>
              {i}. {label}
            </span>
          ))}
        </div>
        <div style={{ height: 4, background: "var(--border)", borderRadius: 99 }}>
          <div style={{
            height: "100%", borderRadius: 99,
            background: "linear-gradient(90deg, #8b5cf6, #06b6d4)",
            width: `${(step / 3) * 100}%`,
            transition: "width 0.4s ease"
          }} />
        </div>
      </div>

      {/* Step 0: Resources */}
      {step === 0 && (
        <div className="card-glow fade-in" style={{ padding: 28 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Provide Learning Materials (Optional)</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: 13, marginBottom: 20 }}>
            TRI can extract your subjects and syllabus directly from your learning materials.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ background: "var(--bg-secondary)", padding: 16, borderRadius: 12, border: "1px solid var(--border)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 600 }}>Use Institutional Syllabus</span>
                <span className="badge" style={{ background: "rgba(16,185,129,0.15)", color: "#34d399" }}>Recommended</span>
              </div>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 14 }}>
                TRI is pre-loaded with the full CL Branch scheme. We can extract your semester data automatically.
              </p>
              <button className="btn-secondary" style={{ width: "100%", justifyContent: "center" }} onClick={handleLoadCLScheme} disabled={loading}>
                {loading ? "Loading Scheme..." : "Load CL Scheme Data"}
              </button>
            </div>

            <div style={{ textAlign: "center", fontSize: 12, color: "var(--text-secondary)", fontWeight: 600 }}>— OR —</div>

            <div>
              <label style={{ fontSize: 13, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Paste Raw Text (Timetable / Syllabus / Notes)</label>
              <textarea className="input-field" rows={5} placeholder="Paste syllabus or subjects here..." value={resourceText} onChange={e => setResourceText(e.target.value)} />
              <button className="btn-secondary" style={{ width: "100%", justifyContent: "center", marginTop: 10 }} onClick={handleUploadRaw} disabled={loading || !resourceText}>
                {loading ? "Extracting..." : "Extract from Text"}
              </button>
            </div>
          </div>

          <div style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid var(--border)", textAlign: "center" }}>
            <button style={{ background: "none", border: "none", color: "var(--text-secondary)", fontSize: 13, cursor: "pointer", textDecoration: "underline" }}
              onClick={() => setStep(1)}>
              Skip and enter manually →
            </button>
          </div>
        </div>
      )}


      {/* Step 1: Profile */}
      {step === 1 && (
        <div className="card-glow fade-in" style={{ padding: 28 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Student Profile</h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ fontSize: 13, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Semester</label>
              <input className="input-field" placeholder="e.g. 5" value={semester} onChange={e => setSemester(e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: 13, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Daily Study Hours</label>
              <input className="input-field" type="number" min="1" max="16" value={studyHours} onChange={e => setStudyHours(e.target.value)} />
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Add Subjects</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                className="input-field"
                placeholder="e.g. DBMS"
                value={subjectInput}
                onChange={e => setSubjectInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addSubject()}
              />
              <button className="btn-primary" onClick={addSubject} style={{ whiteSpace: "nowrap" }}>+ Add</button>
            </div>
          </div>

          {subjects.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, color: "var(--text-secondary)", display: "block", marginBottom: 10 }}>Confidence per Subject</label>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {subjects.map(s => (
                  <div key={s} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--bg-secondary)", borderRadius: 10, padding: "10px 14px" }}>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{s}</span>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      {CONFIDENCE_OPTIONS.map(opt => (
                        <button key={opt} onClick={() => setConfidence(prev => ({ ...prev, [s]: opt }))}
                          style={{
                            padding: "4px 12px", borderRadius: 999, border: "1px solid",
                            fontSize: 12, fontWeight: 600, cursor: "pointer",
                            borderColor: confidence[s] === opt ? "var(--accent-purple)" : "var(--border)",
                            background: confidence[s] === opt ? "rgba(139,92,246,0.15)" : "transparent",
                            color: confidence[s] === opt ? "var(--accent-purple)" : "var(--text-secondary)",
                          }}>{opt}</button>
                      ))}
                      <button onClick={() => removeSubject(s)} style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", marginLeft: 4 }}>✕</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button className="btn-primary" style={{ width: "100%", justifyContent: "center" }}
            onClick={() => { if (semester && subjects.length) setStep(2); }}
            disabled={!semester || subjects.length === 0}>
            Continue →
          </button>
        </div>
      )}

      {/* Step 2: Marks */}
      {step === 2 && (
        <div className="card-glow fade-in" style={{ padding: 28 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Academic Marks</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: 13, marginBottom: 20 }}>Enter your recent scores out of 100 (or leave 0 if unavailable).</p>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {subjects.map(s => (
              <div key={s} style={{ background: "var(--bg-secondary)", borderRadius: 12, padding: 16 }}>
                <p style={{ fontWeight: 700, marginBottom: 12, fontSize: 14 }}>{s}</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                  {(["internal", "assignment", "previous_exam"] as const).map(field => (
                    <div key={field}>
                      <label style={{ fontSize: 11, color: "var(--text-secondary)", display: "block", marginBottom: 4, textTransform: "capitalize" }}>
                        {field.replace("_", " ")}
                      </label>
                      <input className="input-field" type="number" min="0" max="100" placeholder="0"
                        value={marks[s]?.[field] || ""}
                        onChange={e => setMarks(prev => ({ ...prev, [s]: { ...prev[s], [field]: e.target.value } }))}
                        style={{ padding: "8px 12px" }} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            <button className="btn-secondary" onClick={() => setStep(1)} style={{ flex: 1, justifyContent: "center" }}>← Back</button>
            <button className="btn-primary" onClick={() => setStep(3)} style={{ flex: 2, justifyContent: "center" }}>Continue →</button>
          </div>
        </div>
      )}

      {/* Step 3: Syllabus */}
      {step === 3 && (
        <div className="card-glow fade-in" style={{ padding: 28 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Syllabus & PYQs</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: 13, marginBottom: 20 }}>Paste your syllabus and previous-year questions. TRI will extract key topics from these.</p>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Syllabus Content</label>
            <textarea className="input-field" rows={6} placeholder="Unit 1: ER Model, Relational Algebra&#10;Unit 2: SQL, Normalization..." value={syllabus} onChange={e => setSyllabus(e.target.value)} />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 13, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Previous Year Questions (PYQs)</label>
            <textarea className="input-field" rows={5} placeholder="2023: What is normalization? Explain ACID properties.&#10;2022: Describe indexing and hashing..." value={pyqs} onChange={e => setPyqs(e.target.value)} />
          </div>

          {error && (
            <div style={{ marginBottom: 16, padding: "12px 16px", borderRadius: 10, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5", fontSize: 13 }}>
              ⚠ {error}
            </div>
          )}

          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn-secondary" onClick={() => setStep(2)} style={{ flex: 1, justifyContent: "center" }} disabled={loading}>← Back</button>
            <button className="btn-primary" onClick={handleSubmit} style={{ flex: 2, justifyContent: "center" }} disabled={loading}>
              {loading ? <span className="pulse">Analyzing with Gemini...</span> : "🚀 Analyze & Generate Plan"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
