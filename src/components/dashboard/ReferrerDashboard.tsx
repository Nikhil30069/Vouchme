import { useEffect, useMemo, useState } from "react";
import { Award, CalendarCheck, CheckCircle, Clock, FileText, Star } from "lucide-react";
import { User, useAuthStore } from "@/stores/authStore";
import { useReferralStore } from "@/stores/referralStore";
import { JOB_ROLES } from "@/constants/roles";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  HeroBanner, StatCard, EmptyState,
  primaryBtnStyle, secondaryBtnStyle, badgeStyle,
} from "./SeekerDashboard";

interface ReferrerDashboardProps {
  user: User;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const roleLabel = (value: string) => JOB_ROLES.find((r) => r.value === value)?.label ?? value;

export const ReferrerDashboard = ({ user, activeTab, onTabChange }: ReferrerDashboardProps) => {
  const {
    fetchReferralRequests, fetchScoringParameters, createScore,
    referralRequests, scoringParameters, saveCalendlyUrl,
  } = useReferralStore();
  const [scores, setScores] = useState<Record<string, Record<string, number | "">>>({});
  const [comments, setComments] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<Set<string>>(new Set());

  // Read directly from the store so the embed updates immediately when the
  // CalendlySetupModal saves and calls updateUser — no page refresh needed.
  const activeCalendlyUrl = useAuthStore((s) => s.user?.calendly_url || "");
  const updateUser = useAuthStore((s) => s.updateUser);
  const [showEditCalendly, setShowEditCalendly] = useState(false);
  const [editCalendlyUrl, setEditCalendlyUrl] = useState(user.calendly_url || "");
  const [savingCalendly, setSavingCalendly] = useState(false);
  const [savedCalendly, setSavedCalendly] = useState(false);

  const [seekerProfiles, setSeekerProfiles] = useState<Record<string, { name: string; avatar_url: string | null }>>({});

  useEffect(() => {
    if (!activeCalendlyUrl) return;
    if (!document.querySelector('script[src*="calendly"]')) {
      const link = document.createElement("link");
      link.href = "https://assets.calendly.com/assets/external/widget.css";
      link.rel = "stylesheet";
      document.head.appendChild(link);
      const script = document.createElement("script");
      script.src = "https://assets.calendly.com/assets/external/widget.js";
      script.async = true;
      document.head.appendChild(script);
      script.onload = () => (window as any).Calendly?.initInlineWidgets();
    } else {
      setTimeout(() => (window as any).Calendly?.initInlineWidgets(), 100);
    }
  }, [activeCalendlyUrl]);

  useEffect(() => {
    fetchReferralRequests(user.id);
    fetchScoringParameters();
  }, [user.id, fetchReferralRequests, fetchScoringParameters]);

  const myRequests = useMemo(
    () => referralRequests.filter((r) => r.referrer_id === user.id),
    [referralRequests, user.id]
  );

  const pending = myRequests.filter((r) => r.status === "pending");
  const scheduled = myRequests.filter((r) => r.status === "scheduled");
  const readyToScore = myRequests.filter((r) => r.status === "pending" || r.status === "scheduled");
  const scored = myRequests.filter((r) => r.status === "scored");

  const scheduledSorted = useMemo(
    () => [...pending, ...scheduled].sort((a, b) => new Date(a.created_at ?? 0).getTime() - new Date(b.created_at ?? 0).getTime()),
    [pending, scheduled]
  );

  useEffect(() => {
    const ids = scheduledSorted.map((r) => r.seeker_id).filter(Boolean);
    if (!ids.length) return;
    supabase.from("profiles").select("id, name, avatar_url").in("id", ids)
      .then(({ data }) => {
        const map: Record<string, { name: string; avatar_url: string | null }> = {};
        (data || []).forEach((p: any) => { map[p.id] = { name: p.name || "Unknown", avatar_url: p.avatar_url }; });
        setSeekerProfiles(map);
      });
  }, [scheduledSorted.length]);

  const handleSaveEditCalendlyUrl = async () => {
    const trimmed = editCalendlyUrl.trim();
    if (!trimmed) return;
    setSavingCalendly(true);
    try {
      await saveCalendlyUrl(user.id, trimmed);
      updateUser({ calendly_url: trimmed });
      setSavedCalendly(true);
      setShowEditCalendly(false);
      setTimeout(() => setSavedCalendly(false), 2000);
      toast.success("Calendly link updated!");
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to save Calendly link");
    } finally {
      setSavingCalendly(false);
    }
  };

  const handleScoreChange = (reqId: string, paramId: string, value: number | "") => {
    if (value !== "" && (value < 0 || value > 10)) return;
    setScores((prev) => ({ ...prev, [reqId]: { ...prev[reqId], [paramId]: value } }));
  };

  const handleSubmit = async (requestId: string) => {
    if (submitting.has(requestId)) return;
    const reqScores = scores[requestId];
    const missing = scoringParameters.filter((p) => !reqScores?.[p.id]);
    if (missing.length > 0) {
      toast.error(`Please score: ${missing.map((m) => m.name).join(", ")}`);
      return;
    }
    const request = myRequests.find((r) => r.id === requestId);
    if (!request) return;

    setSubmitting((s) => new Set(s).add(requestId));
    try {
      await Promise.all(
        Object.entries(reqScores).map(([parameterId, score]) => {
          if (typeof score !== "number") throw new Error("Invalid score");
          return createScore({
            referral_request_id: requestId,
            referrer_id: user.id,
            seeker_id: request.seeker_id,
            parameter_id: parameterId,
            score,
            comments: comments[requestId] || undefined,
          });
        })
      );
      toast.success("Scores submitted!");
      setScores((prev) => { const n = { ...prev }; delete n[requestId]; return n; });
      setComments((prev) => { const n = { ...prev }; delete n[requestId]; return n; });
      await fetchReferralRequests(user.id);
    } catch {
      toast.error("Failed to submit. Try again.");
    } finally {
      setSubmitting((s) => { const n = new Set(s); n.delete(requestId); return n; });
    }
  };

  if (activeTab === "overview") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <HeroBanner
          role="referrer"
          name={user.name?.split(" ")[0] || "there"}
          subtitle="Your honest feedback shapes the karma score. Every review nudges hiring toward transparency."
        />

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
          {[
            { label: "Pending reviews", value: pending.length + scheduled.length, icon: Clock, color: "#d97706" },
            { label: "Completed", value: scored.length, icon: Award, color: "#059669" },
            { label: "Total requests", value: myRequests.length, icon: Star, color: "#7c3aed" },
          ].map((s, i) => <StatCard key={i} {...s} delay={i * 0.08} />)}
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--border-soft)", borderRadius: 14, padding: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)", marginBottom: 16, letterSpacing: "-0.02em" }}>
            Upcoming Interviews
          </div>
          {scheduledSorted.length === 0 ? (
            <div style={{ fontSize: 13, color: "var(--ink-3)", lineHeight: 1.6 }}>
              No upcoming interviews yet. Seekers will appear here once they book via your Calendly link.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {scheduledSorted.map((r) => {
                const profile = seekerProfiles[r.seeker_id];
                return (
                  <div
                    key={r.id}
                    style={{
                      padding: "16px 18px",
                      borderRadius: 12,
                      border: "1px solid var(--border-soft)",
                      background: "var(--surface-2)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)", marginBottom: 4 }}>
                          {profile?.name ?? "Loading…"}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 13, color: "var(--ink-2)" }}>{roleLabel(r.job_role)}</span>
                          <span style={badgeStyle}>{r.seeker_experience_years} yrs exp</span>
                        </div>
                        <div style={{ fontSize: 12, color: "var(--ink-4)", marginTop: 6 }}>
                          Booked on {new Date(r.created_at ?? Date.now()).toLocaleDateString()}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                        <button
                          onClick={() => (r as any).resume_url && window.open((r as any).resume_url, "_blank")}
                          disabled={!(r as any).resume_url}
                          style={{ ...secondaryBtnStyle, opacity: (r as any).resume_url ? 1 : 0.45 }}
                        >
                          <FileText size={13} /> View Resume
                        </button>
                        <button
                          onClick={() => onTabChange("reviews")}
                          style={{ ...primaryBtnStyle, padding: "0 14px", height: 34, borderRadius: 8, gap: 6 }}
                        >
                          <Star size={13} /> Score Candidate
                        </button>
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 10, fontStyle: "italic" }}>
                      Meeting details sent to your email by Calendly
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--border-soft)", borderRadius: 14, padding: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)", marginBottom: 16, letterSpacing: "-0.02em" }}>
            My Interview Calendar
          </div>
          {activeCalendlyUrl ? (
            <>
              <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid var(--border-soft)" }}>
                <div
                  className="calendly-inline-widget"
                  data-url={`${activeCalendlyUrl}?hide_gdpr_banner=1&hide_event_type_details=0`}
                  style={{ minWidth: 300, height: 660 }}
                />
              </div>
              <div style={{ marginTop: 12 }}>
                {!showEditCalendly ? (
                  <button
                    onClick={() => { setEditCalendlyUrl(activeCalendlyUrl); setShowEditCalendly(true); }}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: 13,
                      color: "var(--ink-3)",
                      padding: 0,
                      fontFamily: "inherit",
                      textDecoration: "underline",
                      textDecorationStyle: "dotted",
                      textUnderlineOffset: 3,
                    }}
                  >
                    Update Calendly link →
                  </button>
                ) : (
                  <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                    <input
                      type="url"
                      placeholder="https://calendly.com/your-name/event-name"
                      value={editCalendlyUrl}
                      onChange={(e) => setEditCalendlyUrl(e.target.value)}
                      style={{
                        flex: 1, height: 40, padding: "0 12px", borderRadius: 10,
                        border: "1px solid var(--border-med)", fontSize: 14,
                        color: "var(--ink)", background: "var(--surface)", fontFamily: "inherit", outline: "none",
                      }}
                    />
                    <button
                      onClick={handleSaveEditCalendlyUrl}
                      disabled={savingCalendly}
                      style={{ ...primaryBtnStyle, padding: "0 16px", height: 40, borderRadius: 10, gap: 6, flexShrink: 0 }}
                    >
                      {savingCalendly ? "Saving…" : savedCalendly ? "✓ Saved!" : "Save"}
                    </button>
                    <button
                      onClick={() => setShowEditCalendly(false)}
                      style={{ ...secondaryBtnStyle, height: 40, borderRadius: 10, flexShrink: 0 }}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={{ fontSize: 13, color: "var(--ink-3)", lineHeight: 1.6 }}>
              No Calendly link connected yet. Complete the setup to show your calendar here.
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.03em", color: "var(--ink)" }}>Review Queue</h2>

      {myRequests.length === 0 && (
        <EmptyState
          icon={<FileText size={40} color="var(--ink-4)" />}
          title="Nothing to review yet"
          body="Requests from candidates with matching experience will appear here."
        />
      )}

      {readyToScore.length > 0 && (
        <>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 4 }}>
            Ready to score
          </div>
          {readyToScore.map((req, i) => (
            <div key={req.id} style={{
              padding: 20, borderRadius: 18,
              border: "1px solid var(--border-soft)",
              background: "var(--surface)",
              animationDelay: `${i * 0.07}s`,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)", letterSpacing: "-0.02em" }}>
                      {roleLabel(req.job_role)}
                    </div>
                    <span style={badgeStyle}>{req.seeker_experience_years} yrs</span>
                    {req.status === "scheduled" ? <ScheduledBadge /> : <PendingBadge />}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 3 }}>
                    Requested {new Date(req.created_at ?? Date.now()).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {req.status === "scheduled" && (
                <div style={{
                  padding: "10px 14px", background: "#eff6ff", borderRadius: 10,
                  border: "1px solid #bfdbfe", marginBottom: 18,
                  fontSize: 13, color: "#2563eb", fontWeight: 500,
                }}>
                  After your interview, submit scores below.
                </div>
              )}

              <div style={{
                padding: "12px 14px", background: "var(--surface-2)", borderRadius: 10,
                border: "1px solid var(--border-soft)",
                display: "flex", justifyContent: "space-between", alignItems: "center",
                marginBottom: 18,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--ink-2)", fontWeight: 500 }}>
                  <FileText size={14} /> Candidate resume
                </div>
                <button
                  onClick={() => (req as any).resume_url && window.open((req as any).resume_url, "_blank")}
                  disabled={!(req as any).resume_url}
                  style={{ ...secondaryBtnStyle, opacity: (req as any).resume_url ? 1 : 0.5 }}
                >
                  {(req as any).resume_url ? "View resume" : "No resume"}
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 18 }}>
                {scoringParameters.map((param, pi) => {
                  const val = scores[req.id]?.[param.id] ?? "";
                  return (
                    <div key={param.id} style={{ animationDelay: `${pi * 0.05}s` }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: "var(--ink-2)", marginBottom: 3 }}>
                        {param.name} <span style={{ color: "var(--ink-4)" }}>(0–10)</span>
                      </div>
                      {param.description && (
                        <div style={{ fontSize: 11, color: "var(--ink-4)", marginBottom: 8 }}>{param.description}</div>
                      )}
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <input
                          type="number" min="0" max="10"
                          value={val} placeholder="0"
                          onChange={(e) => handleScoreChange(req.id, param.id, e.target.value === "" ? "" : parseInt(e.target.value))}
                          style={{
                            width: 56, height: 40, textAlign: "center",
                            fontSize: 18, fontWeight: 700,
                            border: "1px solid var(--border-med)", borderRadius: 10,
                            background: "var(--surface)", color: "var(--ink)",
                            fontFamily: "inherit", outline: "none",
                            WebkitAppearance: "none",
                          }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ height: 6, borderRadius: 999, background: "var(--surface-3)", overflow: "hidden" }}>
                            <div style={{
                              height: "100%", borderRadius: 999,
                              background: "var(--referrer)",
                              width: `${(Number(val) || 0) * 10}%`,
                              transition: "width 0.2s",
                            }} />
                          </div>
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)", width: 24, textAlign: "right" }}>
                          {Number(val) || 0}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: "var(--ink-2)", marginBottom: 6, display: "block" }}>
                  Comments (optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Share what makes this candidate stand out…"
                  value={comments[req.id] || ""}
                  onChange={(e) => setComments((p) => ({ ...p, [req.id]: e.target.value }))}
                  style={{
                    width: "100%", fontFamily: "inherit", fontSize: 14, color: "var(--ink)",
                    background: "var(--surface)", border: "1px solid var(--border-med)",
                    borderRadius: 10, padding: "10px 13px",
                    outline: "none", resize: "vertical", lineHeight: 1.5,
                  }}
                />
              </div>

              <button
                onClick={() => handleSubmit(req.id)}
                disabled={submitting.has(req.id)}
                style={{ ...primaryBtnStyle, padding: "0 18px", height: 38, borderRadius: 10, gap: 7 }}
              >
                <Star size={14} />
                {submitting.has(req.id) ? "Submitting…" : "Submit scores"}
              </button>
            </div>
          ))}
        </>
      )}

      {scored.length > 0 && (
        <>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 4 }}>
            Reviewed
          </div>
          {scored.map((req, i) => (
            <div key={req.id} style={{
              padding: 20, borderRadius: 18,
              border: "1px solid var(--recruiter-mid)",
              background: "var(--recruiter-light)",
              animationDelay: `${i * 0.07}s`,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)", letterSpacing: "-0.02em" }}>
                      {roleLabel(req.job_role)}
                    </div>
                    <span style={badgeStyle}>{req.seeker_experience_years} yrs</span>
                    <ScoredBadge />
                  </div>
                  <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 3 }}>
                    Requested {new Date(req.created_at ?? Date.now()).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10, fontSize: 13, color: "var(--recruiter)" }}>
                <CheckCircle size={14} /> Scores submitted. Thank you for contributing!
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

const PendingBadge = () => (
  <span style={{
    display: "inline-flex", alignItems: "center", gap: 5,
    fontSize: 11, fontWeight: 600, letterSpacing: "0.02em", textTransform: "uppercase",
    padding: "3px 9px", borderRadius: 999,
    background: "#fffbeb", color: "#d97706", border: "1px solid #fde68a",
  }}>
    <Clock size={10} /> Pending
  </span>
);

const ScheduledBadge = () => (
  <span style={{
    display: "inline-flex", alignItems: "center", gap: 5,
    fontSize: 11, fontWeight: 600, letterSpacing: "0.02em", textTransform: "uppercase",
    padding: "3px 9px", borderRadius: 999,
    background: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe",
  }}>
    <CalendarCheck size={10} /> Scheduled
  </span>
);

const ScoredBadge = () => (
  <span style={{
    display: "inline-flex", alignItems: "center", gap: 5,
    fontSize: 11, fontWeight: 600, letterSpacing: "0.02em", textTransform: "uppercase",
    padding: "3px 9px", borderRadius: 999,
    background: "#ecfdf5", color: "#059669", border: "1px solid #a7f3d0",
  }}>
    <CheckCircle size={10} /> Reviewed
  </span>
);
