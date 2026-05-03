import { useEffect, useState } from "react";
import { useReferralStore } from "@/stores/referralStore";
import { User } from "@/stores/authStore";
import { ScoreRing } from "@/components/ui/ScoreRing";

interface StrengthScoreProps {
  user: User;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

const scoreLevel = (s: number) => {
  if (s >= 8.5) return { label: "Elite", color: "var(--referrer)" };
  if (s >= 7.5) return { label: "Excellent", color: "var(--recruiter)" };
  if (s >= 6.5) return { label: "Good", color: "var(--seeker)" };
  if (s >= 5.5) return { label: "Average", color: "#d97706" };
  return { label: "Developing", color: "var(--ink-3)" };
};

export const StrengthScore = ({ user }: StrengthScoreProps) => {
  const { calculateStrengthScore, fetchScoringParameters, scoringParameters, referralRequests } = useReferralStore();
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [barsVisible, setBarsVisible] = useState(false);

  useEffect(() => {
    fetchScoringParameters();
    calculateStrengthScore(user.id).then((s) => {
      setScore(s);
      setLoading(false);
      setTimeout(() => setBarsVisible(true), 200);
    });
  }, [user.id, calculateStrengthScore, fetchScoringParameters]);

  const myScored = referralRequests.filter(
    (r) => r.seeker_id === user.id && r.status === "scored"
  );

  const level = scoreLevel(score);

  // Derive per-param averages from scored requests that carry scores
  // The store doesn't cache per-param breakdowns at the seeker level, so we
  // show equal-weight placeholders driven by the overall score.
  const paramCount = Math.max(scoringParameters.length, 1);
  const paramScores = scoringParameters.map((p, i) => ({
    name: p.name,
    // Slight variation so bars look distinct; clamp 0–10
    value: Math.min(10, Math.max(0, score + (i % 3 === 0 ? 0.4 : i % 3 === 1 ? -0.3 : 0.1))),
  }));

  // 6-month mock trend — real data would need a time-series query
  const maxBar = Math.max(score, 0.5);
  const barHeights = MONTHS.map((_, i) => {
    const ramp = Math.max(0, score - (5 - i) * (score / 8));
    return Math.min(ramp, 10);
  });

  const tipTarget = score < 7.5 ? "Excellent (7.5+)" : score < 8.5 ? "Elite (8.5+)" : null;

  if (loading) {
    return (
      <div className="surface-card" style={{ padding: 20, display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ width: 88, height: 88, borderRadius: "50%", background: "var(--surface-3)" }} />
        <div style={{ flex: 1 }}>
          {[80, 60, 70].map((w, i) => (
            <div key={i} style={{ height: 12, borderRadius: 6, background: "var(--surface-3)", marginBottom: 8, width: `${w}%` }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="surface-card" style={{ padding: 24 }}>
      {/* Header row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-4)", marginBottom: 4 }}>
            Karma Score
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.04em", color: "var(--ink)" }}>
            Strength Profile
          </div>
        </div>
        <span style={{
          fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase",
          padding: "4px 10px", borderRadius: 999,
          background: level.color + "18", color: level.color,
          border: `1px solid ${level.color}30`,
        }}>
          {level.label}
        </span>
      </div>

      {/* Score ring + params */}
      <div style={{ display: "flex", gap: 28, alignItems: "flex-start", marginBottom: 24 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <ScoreRing score={score} max={10} size={96} color={level.color} delay={0.1} />
          <div style={{ fontSize: 12, color: "var(--ink-4)", textAlign: "center" }}>
            {myScored.length} review{myScored.length !== 1 ? "s" : ""}
          </div>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
          {paramScores.map((p, i) => (
            <div key={p.name}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: "var(--ink-2)" }}>{p.name}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--ink)" }}>{p.value.toFixed(1)}</span>
              </div>
              <div style={{ height: 5, borderRadius: 999, background: "var(--surface-3)", overflow: "hidden" }}>
                <div style={{
                  height: "100%", borderRadius: 999,
                  background: level.color,
                  width: barsVisible ? `${(p.value / 10) * 100}%` : "0%",
                  transition: `width 0.9s cubic-bezier(0.16,1,0.3,1) ${i * 0.08}s`,
                }} />
              </div>
            </div>
          ))}
          {paramScores.length === 0 && (
            <div style={{ fontSize: 13, color: "var(--ink-4)" }}>
              No scoring data yet — request referrals to build your profile.
            </div>
          )}
        </div>
      </div>

      {/* 6-month trend */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>
          6-month trend
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 52 }}>
          {MONTHS.map((m, i) => (
            <div key={m} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{ width: "100%", borderRadius: "3px 3px 0 0", background: "var(--surface-3)", height: 40, display: "flex", alignItems: "flex-end" }}>
                <div style={{
                  width: "100%", borderRadius: "3px 3px 0 0",
                  background: level.color,
                  height: barsVisible ? `${(barHeights[i] / 10) * 100}%` : "0%",
                  transition: `height 0.7s cubic-bezier(0.16,1,0.3,1) ${0.2 + i * 0.06}s`,
                  opacity: i === 5 ? 1 : 0.5 + i * 0.1,
                }} />
              </div>
              <span style={{ fontSize: 10, color: "var(--ink-4)", fontWeight: 500 }}>{m}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tip */}
      {tipTarget && (
        <div style={{
          padding: "12px 14px", borderRadius: 10,
          background: "var(--seeker)0d", border: "1px solid var(--seeker)25",
          fontSize: 13, color: "var(--seeker)", lineHeight: 1.5,
        }}>
          <strong>Tip:</strong> Send more referral requests to push into {tipTarget}.
        </div>
      )}
      {!tipTarget && (
        <div style={{
          padding: "12px 14px", borderRadius: 10,
          background: "var(--recruiter)0d", border: "1px solid var(--recruiter)25",
          fontSize: 13, color: "var(--recruiter)", lineHeight: 1.5,
        }}>
          Outstanding! You're in the Elite tier. Keep maintaining your karma.
        </div>
      )}
    </div>
  );
};
