import { useEffect, useMemo, useState } from "react";
import { Award, CalendarCheck, CheckCircle, Clock, FileText, Plus, Star, Trash2, Users, Video } from "lucide-react";
import { User } from "@/stores/authStore";
import { useReferralStore } from "@/stores/referralStore";
import { JOB_ROLES } from "@/constants/roles";
import { toast } from "sonner";
import {
  HeroBanner, StatCard, EmptyState,
  primaryBtnStyle, secondaryBtnStyle, badgeStyle,
} from "./SeekerDashboard";

interface ReferrerDashboardProps {
  user: User;
  activeTab: string;
}

const roleLabel = (value: string) => JOB_ROLES.find((r) => r.value === value)?.label ?? value;

const fmtSlotLabel = (isoString: string, durationMins: number) => {
  const d = new Date(isoString);
  const day = d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
  const time = d.toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit", hour12: true }).toUpperCase();
  return `${day} · ${time} · ${durationMins} min`;
};

export const ReferrerDashboard = ({ user, activeTab }: ReferrerDashboardProps) => {
  const {
    fetchReferralRequests, fetchScoringParameters, createScore,
    referralRequests, scoringParameters,
    fetchReferrerSlots, createSlot, deleteSlot, referrerSlots,
  } = useReferralStore();
  const [scores, setScores] = useState<Record<string, Record<string, number | "">>>({});
  const [comments, setComments] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<Set<string>>(new Set());

  const [slotDate, setSlotDate] = useState("");
  const [slotTime, setSlotTime] = useState("");
  const [slotDuration, setSlotDuration] = useState(30);
  const [addingSlot, setAddingSlot] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    fetchReferralRequests(user.id);
    fetchScoringParameters();
    fetchReferrerSlots(user.id);
  }, [user.id, fetchReferralRequests, fetchScoringParameters, fetchReferrerSlots]);

  const myRequests = useMemo(
    () => referralRequests.filter((r) => r.referrer_id === user.id),
    [referralRequests, user.id]
  );
  const now = new Date().toISOString();
  const upcomingInterviews = myRequests.filter(
    (r) => r.status === "scheduled" && r.interview_at && r.interview_at > now
  );
  const readyToScore = myRequests.filter(
    (r) => r.status === "pending" || (r.status === "scheduled" && r.interview_at && r.interview_at <= now)
  );
  const pending = myRequests.filter((r) => r.status === "pending");
  const scored = myRequests.filter((r) => r.status === "scored");

  const handleAddSlot = async () => {
    if (!slotDate || !slotTime) {
      toast.error("Pick a date and time.");
      return;
    }
    const slotStart = new Date(`${slotDate}T${slotTime}`).toISOString();
    setAddingSlot(true);
    try {
      await createSlot({ referrer_id: user.id, slot_start: slotStart, duration_mins: slotDuration });
      toast.success("Slot added!");
      setSlotDate("");
      setSlotTime("");
    } catch {
      toast.error("Failed to add slot.");
    } finally {
      setAddingSlot(false);
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    try {
      await deleteSlot(slotId);
      toast.success("Slot removed.");
    } catch {
      toast.error("Failed to remove slot.");
    }
  };

  const workExperience = typeof user.workExperience === "object" && user.workExperience !== null
    ? (user.workExperience as Record<string, unknown>) : null;

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
    } catch (err) {
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
            { label: "Pending reviews", value: pending.length, icon: Clock, color: "#d97706" },
            { label: "Completed", value: scored.length, icon: Award, color: "#059669" },
            { label: "Total requests", value: myRequests.length, icon: Star, color: "#7c3aed" },
          ].map((s, i) => <StatCard key={i} {...s} delay={i * 0.08} />)}
        </div>

        {/* Availability card */}
        <div className="surface-card" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>
              Manage Availability
            </div>
            <span style={badgeStyle}>{referrerSlots.length} slot{referrerSlots.length !== 1 ? "s" : ""}</span>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
            <input
              type="date"
              min={today}
              value={slotDate}
              onChange={(e) => setSlotDate(e.target.value)}
              style={{
                height: 34, borderRadius: 8, border: "1px solid var(--border-med)",
                padding: "0 10px", fontSize: 13, color: "var(--ink)",
                background: "var(--surface)", fontFamily: "inherit", outline: "none",
              }}
            />
            <input
              type="time"
              step="1800"
              value={slotTime}
              onChange={(e) => setSlotTime(e.target.value)}
              style={{
                height: 34, borderRadius: 8, border: "1px solid var(--border-med)",
                padding: "0 10px", fontSize: 13, color: "var(--ink)",
                background: "var(--surface)", fontFamily: "inherit", outline: "none",
              }}
            />
            <select
              value={slotDuration}
              onChange={(e) => setSlotDuration(Number(e.target.value))}
              style={{
                height: 34, borderRadius: 8, border: "1px solid var(--border-med)",
                padding: "0 10px", fontSize: 13, color: "var(--ink)",
                background: "var(--surface)", fontFamily: "inherit", outline: "none",
              }}
            >
              <option value={30}>30 min</option>
              <option value={45}>45 min</option>
              <option value={60}>60 min</option>
            </select>
            <button
              onClick={handleAddSlot}
              disabled={addingSlot}
              style={{ ...primaryBtnStyle, gap: 6 }}
            >
              <Plus size={13} />
              {addingSlot ? "Adding…" : "Add slot"}
            </button>
          </div>

          {referrerSlots.length === 0 ? (
            <div style={{ fontSize: 13, color: "var(--ink-4)", textAlign: "center", padding: "12px 0" }}>
              No upcoming slots. Add one above.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {referrerSlots.map((slot) => (
                <div key={slot.id} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "10px 14px", borderRadius: 10,
                  border: "1px solid var(--border-soft)",
                  background: slot.is_booked ? "#ecfdf5" : "var(--surface-2)",
                }}>
                  <span style={{ fontSize: 13, color: "var(--ink)", fontWeight: 500 }}>
                    {fmtSlotLabel(slot.slot_start, slot.duration_mins)}
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {slot.is_booked ? (
                      <>
                        <span style={{
                          fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 999,
                          background: "#d1fae5", color: "#059669", border: "1px solid #a7f3d0",
                        }}>
                          Booked
                        </span>
                      </>
                    ) : (
                      <button
                        onClick={() => handleDeleteSlot(slot.id)}
                        style={{
                          background: "transparent", border: "none", cursor: "pointer",
                          color: "#ef4444", display: "flex", padding: 4, borderRadius: 6,
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending queue preview */}
        {pending.length > 0 && (
          <div className="surface-card" style={{ padding: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)", marginBottom: 14 }}>Pending review queue</div>
            {pending.map((r, i) => (
              <div key={r.id} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "12px 0",
                borderBottom: i < pending.length - 1 ? "1px solid var(--border-soft)" : "none",
              }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: "var(--ink)" }}>{roleLabel(r.job_role)}</div>
                  <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>{r.seeker_experience_years} years exp</div>
                </div>
                <PendingBadge />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Reviews tab
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

      {upcomingInterviews.length > 0 && (
        <>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Upcoming interviews
          </div>
          {upcomingInterviews.map((req, i) => (
            <div key={req.id} style={{
              padding: 20, borderRadius: 18,
              border: "1px solid #bfdbfe",
              background: "#eff6ff",
              animationDelay: `${i * 0.07}s`,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)", letterSpacing: "-0.02em" }}>
                      {roleLabel(req.job_role)}
                    </div>
                    <span style={badgeStyle}>{req.seeker_experience_years} yrs</span>
                    <ScheduledBadge />
                  </div>
                  {req.interview_at && (
                    <div style={{ fontSize: 13, color: "var(--seeker)", marginTop: 6, fontWeight: 500 }}>
                      <CalendarCheck size={12} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} />
                      {fmtSlotLabel(req.interview_at, 30)}
                    </div>
                  )}
                </div>
                {req.meet_link && (
                  <a
                    href={req.meet_link}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 6,
                      background: "var(--seeker)", color: "white",
                      borderRadius: 9, padding: "0 14px", height: 34,
                      fontSize: 13, fontWeight: 600, textDecoration: "none",
                    }}
                  >
                    <Video size={13} /> Join meeting
                  </a>
                )}
              </div>
            </div>
          ))}
        </>
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
                    <PendingBadge />
                  </div>
                  <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 3 }}>
                    Requested {new Date(req.created_at ?? Date.now()).toLocaleDateString()}
                  </div>
                </div>
              </div>

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
