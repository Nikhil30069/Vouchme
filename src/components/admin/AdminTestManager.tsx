import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { QUESTION_BANK } from "@/data/questionBank";

// ── Types ──────────────────────────────────────────────────────────────────────

type DBQuestion = {
  id: string;
  tier: number;
  question_text: string;
  options: string[];
  correct_answer: number;
  explanation: string;
};

type DBTier = {
  id: string;
  tier_number: number;
  title: string;
  difficulty: string;
  questions: DBQuestion[];
  is_active: boolean;
  created_at: string;
};

type ViewMode = "list" | "create" | "view";

const DIFF_LABELS = ["Beginner", "Intermediate", "Advanced", "Expert", "Elite"];

// ── AdminTestManager ───────────────────────────────────────────────────────────

export const AdminTestManager = () => {
  const [tiers, setTiers] = useState<DBTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewMode>("list");
  const [selectedTier, setSelectedTier] = useState<DBTier | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Create form state
  const [formTierNum, setFormTierNum] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formDiff, setFormDiff] = useState("Beginner");
  const [formJSON, setFormJSON] = useState("");
  const [jsonError, setJsonError] = useState<string | null>(null);

  const fetchTiers = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("test_tiers")
      .select("*")
      .order("tier_number");
    if (error) {
      setError("Failed to load tiers: " + error.message);
    } else {
      setTiers((data ?? []) as DBTier[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchTiers(); }, [fetchTiers]);

  const localTierNumbers = new Set(
    Array.from(new Set(QUESTION_BANK.map(q => q.tier)))
  );
  const dbTierNumbers = new Set(tiers.map(t => t.tier_number));

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleSeedFromLocal = async (tierNum: number) => {
    setSaving(true);
    const qs = QUESTION_BANK.filter(q => q.tier === tierNum);
    const diff = tierNum <= 2 ? "Beginner" : tierNum <= 4 ? "Intermediate" : tierNum <= 6 ? "Advanced" : tierNum <= 8 ? "Expert" : "Elite";
    const { error } = await supabase.from("test_tiers").insert({
      tier_number: tierNum,
      title: `Test ${tierNum} — ${diff}`,
      difficulty: diff,
      questions: qs,
      is_active: true,
    });
    if (error) setError("Seed failed: " + error.message);
    else { showSuccess(`Tier ${tierNum} seeded to Supabase`); fetchTiers(); }
    setSaving(false);
  };

  const handleToggleActive = async (tier: DBTier) => {
    setSaving(true);
    const { error } = await supabase
      .from("test_tiers")
      .update({ is_active: !tier.is_active, updated_at: new Date().toISOString() })
      .eq("id", tier.id);
    if (error) setError("Update failed: " + error.message);
    else { showSuccess(`Tier ${tier.tier_number} ${tier.is_active ? "disabled" : "enabled"}`); fetchTiers(); }
    setSaving(false);
  };

  const handleDelete = async (tier: DBTier) => {
    if (!confirm(`Delete Test ${tier.tier_number} — ${tier.title} from Supabase? This only removes the DB override; the local fallback remains.`)) return;
    setSaving(true);
    const { error } = await supabase.from("test_tiers").delete().eq("id", tier.id);
    if (error) setError("Delete failed: " + error.message);
    else { showSuccess(`Tier ${tier.tier_number} deleted`); fetchTiers(); }
    setSaving(false);
  };

  const validateJSON = (json: string): { ok: true; data: DBQuestion[] } | { ok: false; msg: string } => {
    try {
      const arr = JSON.parse(json);
      if (!Array.isArray(arr)) return { ok: false, msg: "Must be a JSON array" };
      for (const q of arr) {
        if (typeof q.question_text !== "string") return { ok: false, msg: 'Each question must have "question_text" (string)' };
        if (!Array.isArray(q.options) || q.options.length < 2) return { ok: false, msg: 'Each question must have "options" (array of ≥2 strings)' };
        if (typeof q.correct_answer !== "number") return { ok: false, msg: 'Each question must have "correct_answer" (number index)' };
        if (typeof q.explanation !== "string") return { ok: false, msg: 'Each question must have "explanation" (string)' };
      }
      return { ok: true, data: arr };
    } catch (e) {
      return { ok: false, msg: "Invalid JSON: " + (e as Error).message };
    }
  };

  const handleCreateTier = async () => {
    const tierNum = parseInt(formTierNum);
    if (!tierNum || tierNum < 1) { setJsonError("Enter a valid tier number (≥ 1)"); return; }
    if (!formTitle.trim()) { setJsonError("Enter a title"); return; }
    const validation = validateJSON(formJSON);
    if (!validation.ok) { setJsonError(validation.msg); return; }
    setJsonError(null);
    setSaving(true);
    const { error } = await supabase.from("test_tiers").upsert({
      tier_number: tierNum,
      title: formTitle.trim(),
      difficulty: formDiff,
      questions: validation.data,
      is_active: true,
      updated_at: new Date().toISOString(),
    }, { onConflict: "tier_number" });
    if (error) setError("Save failed: " + error.message);
    else {
      showSuccess(`Tier ${tierNum} saved to Supabase`);
      setView("list");
      setFormTierNum(""); setFormTitle(""); setFormJSON("");
      fetchTiers();
    }
    setSaving(false);
  };

  // ── Render: Create view ──────────────────────────────────────────────────────

  if (view === "create") {
    return (
      <div style={{ animation: "fadeUp 0.4s var(--ease-out) both" }}>
        <button onClick={() => { setView("list"); setJsonError(null); }} style={backBtnStyle}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
          Back to test list
        </button>

        <h2 style={headingStyle}>Upload New Test</h2>
        <p style={subStyle}>Create a new test tier or overwrite an existing one. Questions must be valid JSON.</p>

        <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 640 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>Tier Number</label>
              <input value={formTierNum} onChange={e => setFormTierNum(e.target.value)} type="number" min={1} placeholder="21" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Test Title</label>
              <input value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder="Test 21 — Advanced AI Ethics" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Difficulty</label>
              <select value={formDiff} onChange={e => setFormDiff(e.target.value)} style={inputStyle}>
                {DIFF_LABELS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label style={labelStyle}>
              Questions (JSON array)
              <span style={{ fontWeight: 400, color: "var(--ink-3)", marginLeft: 8 }}>— minimum 10 questions recommended</span>
            </label>
            <textarea
              value={formJSON}
              onChange={e => { setFormJSON(e.target.value); setJsonError(null); }}
              placeholder={JSON_PLACEHOLDER}
              style={{ ...inputStyle, height: 280, fontFamily: "monospace", fontSize: 12, resize: "vertical" }}
            />
            {jsonError && <div style={{ fontSize: 12, color: "#ef4444", marginTop: 6 }}>⚠️ {jsonError}</div>}
          </div>

          <div style={{ padding: "12px 16px", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, fontSize: 13, color: "#92400e" }}>
            <strong>Required fields per question:</strong> <code>question_text</code>, <code>options</code> (array), <code>correct_answer</code> (0-indexed), <code>explanation</code>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={handleCreateTier} disabled={saving} style={{ ...primaryBtnStyle, flex: 1, height: 42, fontSize: 14 }}>
              {saving ? "Saving…" : "Save Test to Supabase"}
            </button>
            <button onClick={() => { setView("list"); setJsonError(null); }} style={{ ...ghostBtnStyle, height: 42, padding: "0 20px" }}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Render: View questions ───────────────────────────────────────────────────

  if (view === "view" && selectedTier) {
    return (
      <div style={{ animation: "fadeUp 0.4s var(--ease-out) both" }}>
        <button onClick={() => setView("list")} style={backBtnStyle}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
          Back
        </button>
        <h2 style={headingStyle}>Test {selectedTier.tier_number} — {selectedTier.title}</h2>
        <p style={subStyle}>{selectedTier.questions.length} questions · {selectedTier.difficulty}</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 16 }}>
          {selectedTier.questions.map((q, i) => (
            <div key={q.id ?? i} style={{ padding: "16px 18px", background: "var(--surface)", border: "1px solid var(--border-soft)", borderRadius: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", marginBottom: 10 }}>Q{i + 1}. {q.question_text}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 10 }}>
                {q.options.map((opt, oi) => (
                  <div key={oi} style={{ fontSize: 13, color: oi === q.correct_answer ? "var(--recruiter)" : "var(--ink-3)", fontWeight: oi === q.correct_answer ? 700 : 400, display: "flex", gap: 8 }}>
                    <span style={{ width: 18, flexShrink: 0 }}>{oi === q.correct_answer ? "✓" : `${oi + 1}.`}</span>
                    {opt}
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 12, color: "var(--ink-3)", padding: "8px 10px", background: "var(--surface-2)", borderRadius: 6 }}>{q.explanation}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Render: List view ────────────────────────────────────────────────────────

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, animation: "fadeUp 0.4s var(--ease-out) both" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={headingStyle}>Test Management</h2>
          <p style={subStyle}>Manage AI PM certification tests. Supabase rows override local fallbacks when present.</p>
        </div>
        <button onClick={() => setView("create")} style={primaryBtnStyle}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
          Upload New Test
        </button>
      </div>

      {error && (
        <div style={{ padding: "12px 16px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, fontSize: 13, color: "#ef4444" }}>
          {error}
          <button onClick={() => setError(null)} style={{ marginLeft: 12, background: "none", border: "none", cursor: "pointer", color: "#ef4444", fontSize: 13 }}>✕</button>
        </div>
      )}

      {successMsg && (
        <div style={{ padding: "12px 16px", background: "#ecfdf5", border: "1px solid #a7f3d0", borderRadius: 10, fontSize: 13, color: "var(--recruiter)", fontWeight: 600 }}>
          ✓ {successMsg}
        </div>
      )}

      {/* Info banner */}
      <div style={{ padding: "14px 18px", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 12, fontSize: 13, color: "#92400e" }}>
        <strong>How it works:</strong> Tests in Supabase override local question bank fallbacks. Tiers not in Supabase fall back to the local <code>questionBank.ts</code> file. Seed a tier to Supabase to take ownership of its questions.
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 16, fontSize: 12, color: "var(--ink-3)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <div style={{ width: 8, height: 8, borderRadius: 2, background: "var(--recruiter)" }} /> In Supabase
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <div style={{ width: 8, height: 8, borderRadius: 2, background: "#d97706" }} /> Local fallback only
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <div style={{ width: 8, height: 8, borderRadius: 2, background: "var(--ink-4)" }} /> Disabled
        </div>
      </div>

      {/* Tier rows */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 40, color: "var(--ink-3)", fontSize: 14 }}>Loading…</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {Array.from({ length: Math.max(20, ...localTierNumbers, ...dbTierNumbers) }, (_, i) => i + 1).map(tierNum => {
            const dbTier = tiers.find(t => t.tier_number === tierNum);
            const hasLocal = localTierNumbers.has(tierNum);
            const localCount = QUESTION_BANK.filter(q => q.tier === tierNum).length;

            return (
              <div key={tierNum} style={{
                display: "flex", alignItems: "center", gap: 14, padding: "14px 18px",
                background: "var(--surface)", border: "1px solid var(--border-soft)",
                borderRadius: 12, opacity: dbTier && !dbTier.is_active ? 0.55 : 1,
              }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: dbTier ? (dbTier.is_active ? "var(--recruiter)" : "var(--ink-4)") : "#d97706", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "white" }}>{tierNum}</span>
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>
                    {dbTier ? dbTier.title : `Test ${tierNum} — (local fallback)`}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>
                    {dbTier ? (
                      <>{dbTier.questions.length} questions · {dbTier.difficulty} · {dbTier.is_active ? "Active" : "Disabled"}</>
                    ) : (
                      <>{hasLocal ? `${localCount} questions (local only — not in Supabase)` : "Not available"}</>
                    )}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                  {dbTier ? (
                    <>
                      <button
                        onClick={() => { setSelectedTier(dbTier); setView("view"); }}
                        style={ghostBtnStyle}
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleToggleActive(dbTier)}
                        disabled={saving}
                        style={{ ...ghostBtnStyle, color: dbTier.is_active ? "#d97706" : "var(--recruiter)" }}
                      >
                        {dbTier.is_active ? "Disable" : "Enable"}
                      </button>
                      <button
                        onClick={() => handleDelete(dbTier)}
                        disabled={saving}
                        style={{ ...ghostBtnStyle, color: "#ef4444" }}
                      >
                        Delete
                      </button>
                    </>
                  ) : hasLocal ? (
                    <button
                      onClick={() => handleSeedFromLocal(tierNum)}
                      disabled={saving}
                      style={{ ...primaryBtnStyle, background: "#d97706" }}
                    >
                      Seed to Supabase
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* JSON format documentation */}
      <details style={{ border: "1px solid var(--border-soft)", borderRadius: 12, overflow: "hidden" }}>
        <summary style={{ padding: "12px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer", background: "var(--surface)", color: "var(--ink-2)" }}>
          JSON question format reference
        </summary>
        <div style={{ padding: "16px 18px", borderTop: "1px solid var(--border-soft)", background: "var(--surface-2)" }}>
          <pre style={{ fontSize: 12, color: "var(--ink-2)", fontFamily: "monospace", margin: 0, overflowX: "auto" }}>{JSON_PLACEHOLDER}</pre>
        </div>
      </details>
    </div>
  );
};

// ── Placeholder & styles ───────────────────────────────────────────────────────

const JSON_PLACEHOLDER = `[
  {
    "id": "t21-01",
    "tier": 21,
    "question_text": "Your question text here?",
    "options": [
      "Option A",
      "Option B (correct)",
      "Option C",
      "Option D"
    ],
    "correct_answer": 1,
    "explanation": "Explanation of why option B is correct."
  }
]`;

const headingStyle: React.CSSProperties = {
  fontSize: 22, fontWeight: 700, letterSpacing: "-0.04em", color: "var(--ink)", marginBottom: 4,
};
const subStyle: React.CSSProperties = {
  fontSize: 14, color: "var(--ink-3)", lineHeight: 1.6,
};
const labelStyle: React.CSSProperties = {
  display: "block", fontSize: 12, fontWeight: 600, color: "var(--ink-2)", marginBottom: 5, letterSpacing: "0.02em",
};
const inputStyle: React.CSSProperties = {
  width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid var(--border-soft)",
  fontSize: 13, fontFamily: "inherit", color: "var(--ink)", background: "var(--surface)",
  outline: "none", boxSizing: "border-box",
};
const primaryBtnStyle: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: 6,
  background: "var(--ink)", color: "white", border: "none",
  cursor: "pointer", fontSize: 13, fontWeight: 600,
  padding: "0 14px", height: 34, borderRadius: 8, fontFamily: "inherit",
};
const ghostBtnStyle: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: 6,
  background: "none", color: "var(--ink-2)", border: "1px solid var(--border-soft)",
  cursor: "pointer", fontSize: 12, fontWeight: 500,
  padding: "0 10px", height: 28, borderRadius: 6, fontFamily: "inherit",
};
const backBtnStyle: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 6, border: "none", background: "none",
  cursor: "pointer", fontSize: 13, color: "var(--ink-3)", marginBottom: 24, fontFamily: "inherit", padding: 0,
};
