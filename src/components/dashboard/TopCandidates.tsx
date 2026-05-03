import { useEffect, useState } from "react";
import { Mail, Phone, Users, X } from "lucide-react";
import { useReferralStore } from "@/stores/referralStore";
import { User } from "@/stores/authStore";
import { toast } from "sonner";
import { JOB_ROLES } from "@/constants/roles";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { primaryBtnStyle, secondaryBtnStyle, badgeStyle } from "./SeekerDashboard";
import { EmptyState } from "./SeekerDashboard";

interface TopCandidatesProps {
  user: User;
  jobPostingId: string;
  onClose: () => void;
}

const rankColors = [
  { bg: "linear-gradient(135deg, #f59e0b, #d97706)", label: "1st" },
  { bg: "linear-gradient(135deg, #94a3b8, #64748b)", label: "2nd" },
  { bg: "linear-gradient(135deg, #cd7f32, #a0522d)", label: "3rd" },
];

const scoreLevel = (s: number): { color: string; label: string } => {
  if (s >= 8.5) return { color: "var(--referrer)", label: "Elite" };
  if (s >= 7.5) return { color: "var(--recruiter)", label: "Excellent" };
  if (s >= 6.5) return { color: "var(--seeker)", label: "Good" };
  if (s >= 5.5) return { color: "#d97706", label: "Average" };
  return { color: "var(--ink-3)", label: "Developing" };
};

const fmtCtc = (n?: number | null) => {
  if (!n) return "—";
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  return `₹${n.toLocaleString()}`;
};

export const TopCandidates = ({ user, jobPostingId, onClose }: TopCandidatesProps) => {
  const { getTopCandidates, updateCandidateMatch, getCandidateContactDetails, topCandidates, loading, error } = useReferralStore();
  const [interested, setInterested] = useState<Set<string>>(new Set());
  const [unlocked, setUnlocked] = useState<Set<string>>(new Set());
  const [contacts, setContacts] = useState<Record<string, { phone: string; email: string }>>({});
  const [working, setWorking] = useState<Set<string>>(new Set());

  useEffect(() => { getTopCandidates(jobPostingId); }, [jobPostingId, getTopCandidates]);

  const handleInterest = async (id: string) => {
    if (working.has(id)) return;
    setWorking((p) => new Set(p).add(id));
    try {
      await updateCandidateMatch(id, jobPostingId, user.id, { is_interested: true });
      setInterested((p) => new Set(p).add(id));
      toast.success("Interest marked!");
    } catch {
      toast.error("Failed. Try again.");
    } finally {
      setWorking((p) => { const n = new Set(p); n.delete(id); return n; });
    }
  };

  const handleUnlock = async (id: string) => {
    if (working.has(id)) return;
    setWorking((p) => new Set(p).add(id));
    try {
      const details = await getCandidateContactDetails(id);
      if (!details) { toast.error("No contact details available."); return; }
      await updateCandidateMatch(id, jobPostingId, user.id, { phone_unlocked: true });
      setUnlocked((p) => new Set(p).add(id));
      setContacts((p) => ({ ...p, [id]: details }));
      toast.success("Contact unlocked!");
    } catch {
      toast.error("Failed to unlock. Try again.");
    } finally {
      setWorking((p) => { const n = new Set(p); n.delete(id); return n; });
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.03em", color: "var(--ink)" }}>Top Candidates</h2>
          <div style={{ fontSize: 13, color: "var(--ink-3)", marginTop: 2 }}>Best matches by karma score</div>
        </div>
        <button onClick={onClose} style={secondaryBtnStyle}>
          <X size={13} /> Back
        </button>
      </div>

      {loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[0, 1, 2].map((i) => (
            <div key={i} className="surface-card" style={{ padding: 20, display: "flex", gap: 16, alignItems: "center" }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--surface-3)" }} />
              <div style={{ flex: 1 }}>
                <div style={{ height: 14, width: "50%", background: "var(--surface-3)", borderRadius: 6, marginBottom: 8 }} />
                <div style={{ height: 10, width: "70%", background: "var(--surface-3)", borderRadius: 6 }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="surface-card" style={{ padding: 20, textAlign: "center" }}>
          <div style={{ fontSize: 13, color: "#dc2626", marginBottom: 12 }}>{error}</div>
          <button onClick={() => getTopCandidates(jobPostingId)} style={primaryBtnStyle}>Retry</button>
        </div>
      )}

      {!loading && !error && topCandidates.length === 0 && (
        <EmptyState
          icon={<Users size={40} color="var(--ink-4)" />}
          title="No candidates yet"
          body="Candidates need referral scores to appear here. Share your posting with referrers."
        />
      )}

      {!loading && !error && topCandidates.map((c, i) => {
        const rank = rankColors[i] ?? rankColors[2];
        const level = scoreLevel(c.strength_score);
        const isInterested = interested.has(c.seeker_id);
        const isUnlocked = unlocked.has(c.seeker_id);
        const isWorking = working.has(c.seeker_id);
        const roleLabel = JOB_ROLES.find((r) => r.value === c.seeker_role)?.label ?? c.seeker_role;

        return (
          <div key={c.seeker_id} className="surface-card" style={{ padding: 20, position: "relative", animationDelay: `${i * 0.08}s` }}>
            {/* Rank badge */}
            <div style={{
              position: "absolute", top: 16, right: 16,
              width: 32, height: 32, borderRadius: "50%",
              background: rank.bg,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: 700, color: "white",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            }}>
              {rank.label}
            </div>

            {/* Top row: ring + info */}
            <div style={{ display: "flex", gap: 18, alignItems: "flex-start", marginBottom: 16 }}>
              <ScoreRing score={c.strength_score} size={64} color={level.color} delay={i * 0.12} />
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)", letterSpacing: "-0.02em" }}>
                    {c.seeker_name}
                  </div>
                  <span style={{
                    ...badgeStyle,
                    background: level.color + "18", color: level.color,
                    borderColor: level.color + "30",
                  }}>
                    {level.label}
                  </span>
                </div>
                <div style={{ fontSize: 13, color: "var(--ink-2)", marginBottom: 6 }}>
                  {roleLabel} · {c.seeker_experience} yrs exp · {c.total_scores} review{c.total_scores !== 1 ? "s" : ""}
                </div>
                <div style={{ display: "flex", gap: 16 }}>
                  {[["Current CTC", fmtCtc(c.current_ctc)], ["Expected CTC", fmtCtc(c.expected_ctc)]].map(([l, v]) => (
                    <div key={l}>
                      <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--ink-4)", marginBottom: 1 }}>{l}</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", paddingTop: 14, borderTop: "1px solid var(--border-soft)" }}>
              {!isInterested ? (
                <button
                  onClick={() => handleInterest(c.seeker_id)}
                  disabled={isWorking}
                  style={{ ...primaryBtnStyle, background: "var(--recruiter)" }}
                >
                  {isWorking ? "…" : "Show interest"}
                </button>
              ) : (
                <span style={{
                  ...badgeStyle,
                  background: "var(--recruiter)18", color: "var(--recruiter)", borderColor: "var(--recruiter)30",
                  height: 32, display: "inline-flex", alignItems: "center",
                }}>
                  ✓ Interested
                </span>
              )}

              {isInterested && !isUnlocked && (
                <button
                  onClick={() => handleUnlock(c.seeker_id)}
                  disabled={isWorking}
                  style={secondaryBtnStyle}
                >
                  <Phone size={12} /> {isWorking ? "Unlocking…" : "Unlock contact"}
                </button>
              )}

              {isUnlocked && contacts[c.seeker_id] && (
                <>
                  <button style={{ ...secondaryBtnStyle, color: "var(--recruiter)", borderColor: "var(--recruiter)40" }}>
                    <Phone size={12} /> {contacts[c.seeker_id].phone}
                  </button>
                  <button style={{ ...secondaryBtnStyle }}>
                    <Mail size={12} /> {contacts[c.seeker_id].email}
                  </button>
                </>
              )}
            </div>
          </div>
        );
      })}

      {/* Info card */}
      <div style={{
        padding: "14px 16px", borderRadius: 12,
        background: "var(--seeker)0a", border: "1px solid var(--seeker)20",
      }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--seeker)", marginBottom: 8 }}>How karma scores work</div>
        <ul style={{ fontSize: 12, color: "var(--ink-3)", lineHeight: 1.7, paddingLeft: 14 }}>
          <li>Candidates are scored by experienced professionals in their field</li>
          <li>Scores reflect technical ability, communication, and culture fit</li>
          <li>Show interest first; unlock contact when you're ready to reach out</li>
        </ul>
      </div>
    </div>
  );
};
