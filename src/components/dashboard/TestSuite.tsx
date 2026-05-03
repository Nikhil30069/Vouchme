import { useCallback, useEffect, useRef, useState } from "react";
import { getTestQuestions, type Question } from "@/data/questionBank";
import { supabase } from "@/integrations/supabase/client";
import { useProctorEngine, type ProctorViolation } from "@/lib/proctor/useProctorEngine";

// ── Types ──────────────────────────────────────────────────────────────────────

type TestRecord = {
  score: number;
  date: number;
  karmaChange: number;
};

type TestState = "lobby" | "pretest" | "testing" | "results";

// Reviews are returned by the Edge Function after scoring — correct_answer never lives on client
type QuestionReview = {
  questionId: string;
  correctAnswer: number;
  explanation: string;
};

type TestResult = {
  score: number;
  total: number;
  delta: number;
  answers: Record<number, number>;
  questions: Question[];
  reviews: QuestionReview[];
  tier: number;
  proctorNote?: string; // set when test was terminated / penalised by proctoring
};

interface TestSuiteProps {
  userId: string;
}

// ── Constants ──────────────────────────────────────────────────────────────────

const TOTAL_TESTS = 20;
const PASS_THRESHOLD = 6; // 6/10 = 60%
const RETAKE_DAYS = 7;

const diffLabel = (t: number) =>
  t <= 2 ? "Beginner" : t <= 4 ? "Intermediate" : t <= 6 ? "Advanced" : t <= 8 ? "Expert" : t <= 12 ? "Elite" : t <= 16 ? "Master" : "Legend";

const diffColor = (t: number) =>
  t <= 2 ? "#059669" : t <= 4 ? "#2563eb" : t <= 6 ? "#d97706" : t <= 8 ? "#dc2626" : t <= 12 ? "#7c3aed" : t <= 16 ? "#0891b2" : "#c026d3";

// sessionStorage keys — persist test state across page refreshes
const SS_IP = "vouchme_inprogress"; // {userId, tier, questions}
const SS_PG = "vouchme_progress";   // {answers, timeLeft, currentQ, tabWarnings, fsExits, savedAt}

// ── Storage helpers ────────────────────────────────────────────────────────────

function loadRecords(userId: string): Record<number, TestRecord> {
  try {
    return JSON.parse(localStorage.getItem(`vouchme_tests_${userId}`) ?? "{}");
  } catch {
    return {};
  }
}

function saveRecords(userId: string, records: Record<number, TestRecord>) {
  localStorage.setItem(`vouchme_tests_${userId}`, JSON.stringify(records));
}

// ── TestSuite root ─────────────────────────────────────────────────────────────

export const TestSuite = ({ userId }: TestSuiteProps) => {
  const [state, setState] = useState<TestState>("lobby");
  const [activeTier, setActiveTier] = useState(1);
  const [activeSeed, setActiveSeed] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [result, setResult] = useState<TestResult | null>(null);
  const [records, setRecords] = useState<Record<number, TestRecord>>(() => loadRecords(userId));
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  // Stop camera stream whenever we leave the testing state
  useEffect(() => {
    if (state !== "pretest" && state !== "testing") {
      cameraStream?.getTracks().forEach(t => t.stop());
      setCameraStream(null);
    }
  }, [state]); // eslint-disable-line react-hooks/exhaustive-deps

  // Ensure camera is always cleaned up on unmount
  useEffect(() => {
    return () => { cameraStream?.getTracks().forEach(t => t.stop()); };
  }, [cameraStream]);

  // Load from Supabase (authoritative) — overrides localStorage
  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("test_completions")
        .select("tier, score, karma_change, completed_at")
        .eq("user_id", userId);
      if (data && data.length > 0) {
        const serverRecords: Record<number, TestRecord> = {};
        (data as any[]).forEach((row) => {
          serverRecords[row.tier] = {
            score: row.score,
            date: new Date(row.completed_at).getTime(),
            karmaChange: row.karma_change,
          };
        });
        setRecords(serverRecords);
        saveRecords(userId, serverRecords);
      }
    })();
  }, [userId]);

  // Restore in-progress test after page refresh (prevents refresh-escape exploit)
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(SS_IP);
      if (!saved) return;
      const parsed = JSON.parse(saved);
      if (parsed.userId !== userId || !Array.isArray(parsed.questions) || !parsed.questions.length) return;
      setActiveTier(parsed.tier);
      setActiveSeed(parsed.seed ?? 0);
      setQuestions(parsed.questions);
      setState("testing");
    } catch {}
  }, [userId]);

  const testKarma = Object.values(records).reduce((acc, r) => acc + r.karmaChange, 0);

  const startTest = (tier: number) => {
    const seed = Math.floor(Math.random() * 1_000_000);
    const qs = getTestQuestions(tier, seed);
    setQuestions(qs);
    setActiveTier(tier);
    setActiveSeed(seed);
    // Lock test attempt into sessionStorage — refresh resumes, not escapes
    sessionStorage.setItem(SS_IP, JSON.stringify({ userId, tier, questions: qs, seed }));
    sessionStorage.removeItem(SS_PG);
    setState("pretest");
  };

  const handleComplete = useCallback((res: TestResult) => {
    // Clear proctoring session state on completion
    sessionStorage.removeItem(SS_IP);
    sessionStorage.removeItem(SS_PG);

    setResult(res);
    const newRecords = {
      ...records,
      [res.tier]: { score: res.score, date: Date.now(), karmaChange: res.delta },
    };
    setRecords(newRecords);
    saveRecords(userId, newRecords);
    setState("results");
  }, [records, userId]);

  if (state === "pretest") {
    return (
      <PreTestScreen
        tier={activeTier}
        cameraStream={cameraStream}
        onCameraReady={setCameraStream}
        onConfirm={() => setState("testing")}
        onBack={() => setState("lobby")}
      />
    );
  }

  if (state === "testing") {
    return (
      <TestEnvironment
        tier={activeTier}
        seed={activeSeed}
        questions={questions}
        userId={userId}
        cameraStream={cameraStream}
        onComplete={handleComplete}
      />
    );
  }

  if (state === "results" && result) {
    const oldKarma = testKarma - result.delta;
    return (
      <TestResults
        result={result}
        oldKarma={oldKarma}
        newKarma={testKarma}
        onContinue={() => { setResult(null); setState("lobby"); }}
      />
    );
  }

  return (
    <TestLobby
      completedTests={records}
      karmaScore={testKarma}
      userId={userId}
      onStartTest={startTest}
    />
  );
};

// ── TestLobby ──────────────────────────────────────────────────────────────────

type LeaderboardRow = {
  user_id: string;
  name: string;
  organization: string;
  tests_passed: number;
  total_karma: number;
};

const TestLobby = ({
  completedTests,
  karmaScore,
  userId,
  onStartTest,
}: {
  completedTests: Record<number, TestRecord>;
  karmaScore: number;
  userId: string;
  onStartTest: (tier: number) => void;
}) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[]>([]);

  useEffect(() => {
    supabase.rpc("get_leaderboard", { limit_n: 100 }).then(({ data }) => {
      if (data) setLeaderboard(data as LeaderboardRow[]);
    });
  }, []);
  const isUnlocked = (t: number) => {
    if (t === 1) return true;
    const prev = completedTests[t - 1];
    return !!prev && prev.score >= PASS_THRESHOLD;
  };
  const isPassed = (t: number) => !!completedTests[t] && completedTests[t].score >= PASS_THRESHOLD;
  const isFailed = (t: number) => !!completedTests[t] && completedTests[t].score < PASS_THRESHOLD;
  const canRetake = (t: number) => {
    if (!completedTests[t]) return false;
    const days = (Date.now() - completedTests[t].date) / (1000 * 60 * 60 * 24);
    return days >= RETAKE_DAYS;
  };

  const passedCount = Object.keys(completedTests).filter(t => isPassed(+t)).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.04em", marginBottom: 4, color: "var(--ink)" }}>AI PM Certification Tests</h2>
          <p style={{ fontSize: 14, color: "var(--ink-3)", maxWidth: 520, lineHeight: 1.6 }}>
            20 tests on increasing difficulty. Complete each to unlock the next. Your karma score updates based on performance.
          </p>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ textAlign: "center", padding: "12px 18px", background: "var(--surface)", border: "1px solid var(--border-soft)", borderRadius: 14 }}>
            <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.04em", color: "var(--seeker)" }}>{passedCount}</div>
            <div style={{ fontSize: 11, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: 600 }}>Passed</div>
          </div>
          <div style={{ textAlign: "center", padding: "12px 18px", background: "var(--surface)", border: "1px solid var(--border-soft)", borderRadius: 14 }}>
            <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.04em", color: "var(--ink)" }}>{karmaScore > 0 ? "+" : ""}{karmaScore.toFixed(2)}</div>
            <div style={{ fontSize: 11, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: 600 }}>Test Karma</div>
          </div>
        </div>
      </div>

      {/* Info banner */}
      <div style={{ padding: "14px 18px", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 12, display: "flex", gap: 12, alignItems: "flex-start" }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--seeker)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
          <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
        </svg>
        <div style={{ fontSize: 13, color: "#1e40af", lineHeight: 1.6 }}>
          <strong>How tests work:</strong> 10 questions · 60 min · Questions drawn randomly from a pool — no two attempts are the same. Score ≥60% to unlock the next level. One retake after 7 days. Tests are proctored — tab switching, copy-paste, and leaving fullscreen are monitored.
        </div>
      </div>

      {/* Test grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
        {Array.from({ length: TOTAL_TESTS }, (_, i) => {
          const t = i + 1;
          const unlocked = isUnlocked(t);
          const passed = isPassed(t);
          const failed = isFailed(t);
          const retakeable = canRetake(t);
          const color = diffColor(t);
          const rec = completedTests[t];

          return (
            <div key={t} style={{
              background: "var(--surface)", position: "relative", overflow: "hidden",
              border: `1px solid ${passed ? "#a7f3d0" : failed ? "#fecaca" : unlocked ? "var(--border-soft)" : "var(--border-soft)"}`,
              borderRadius: 14, padding: "20px",
              opacity: unlocked ? 1 : 0.5,
              transition: "all 0.2s",
              animation: `fadeUp 0.4s ${i * 0.04}s var(--ease-out) both`,
            }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: passed ? "var(--recruiter)" : failed ? "#ef4444" : unlocked ? color : "var(--border-soft)", borderRadius: "14px 14px 0 0" }} />

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: unlocked ? color : "var(--ink-4)", marginBottom: 3 }}>Test {t}</div>
                  <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.03em", color: unlocked ? "var(--ink)" : "var(--ink-4)" }}>{diffLabel(t)}</div>
                </div>
                <div style={{ width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", background: passed ? "#ecfdf5" : failed ? "#fef2f2" : unlocked ? color + "15" : "var(--surface-2)" }}>
                  {!unlocked ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ink-4)" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  ) : passed ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--recruiter)" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6 9 17l-5-5"/></svg>
                  ) : failed ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  )}
                </div>
              </div>

              <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
                <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 999, background: "var(--surface-2)", color: "var(--ink-3)", fontWeight: 600 }}>10 questions</span>
                <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 999, background: "var(--surface-2)", color: "var(--ink-3)", fontWeight: 600 }}>60 min</span>
                <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 999, background: color + "15", color, fontWeight: 600, border: `1px solid ${color}30` }}>Level {t}</span>
              </div>

              {rec && (
                <div style={{ marginBottom: 12, padding: "8px 12px", background: passed ? "#ecfdf5" : "#fef2f2", borderRadius: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: passed ? "var(--recruiter)" : "#ef4444", fontWeight: 600 }}>
                    {passed ? "✓ Passed" : "✗ Failed"} · {rec.score}/10 correct
                  </span>
                  <span style={{ fontSize: 11, color: "var(--ink-3)" }}>{rec.karmaChange > 0 ? "+" : ""}{rec.karmaChange.toFixed(2)} karma</span>
                </div>
              )}

              {unlocked ? (
                <button
                  onClick={() => onStartTest(t)}
                  disabled={failed && !retakeable}
                  style={{
                    width: "100%", padding: "9px", borderRadius: 8, border: "none",
                    cursor: (failed && !retakeable) ? "not-allowed" : "pointer",
                    background: (failed && !retakeable) ? "var(--surface-2)" : passed ? "var(--ink)" : color,
                    color: (failed && !retakeable) ? "var(--ink-4)" : "white",
                    fontSize: 13, fontWeight: 600, fontFamily: "inherit",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    transition: "opacity 0.15s",
                  }}
                  onMouseEnter={e => { if (!(failed && !retakeable)) (e.currentTarget as HTMLElement).style.opacity = "0.85"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
                >
                  {failed && !retakeable ? (
                    <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg> Retake in 7 days</>
                  ) : passed ? (
                    <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"/></svg> Retake</>
                  ) : (
                    <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"/></svg> Start Test</>
                  )}
                </button>
              ) : (
                <div style={{ width: "100%", padding: "9px", background: "var(--surface-2)", borderRadius: 8, textAlign: "center", fontSize: 12, color: "var(--ink-4)", fontWeight: 500 }}>
                  Pass Test {t - 1} to unlock
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Global leaderboard */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border-soft)", borderRadius: 14, padding: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>Global Leaderboard</div>
          <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 999, background: "#eff6ff", color: "var(--seeker)", fontWeight: 700, border: "1px solid #bfdbfe" }}>Top 100</span>
        </div>
        {(() => {
          // Build display rows: top 3 + "You" at real rank (never duplicate if already in top 3)
          const myRankIdx = leaderboard.findIndex(r => r.user_id === userId);
          const myRank = myRankIdx === -1 ? null : myRankIdx + 1;
          const top3 = leaderboard.slice(0, 3);
          const youInTop3 = myRankIdx >= 0 && myRankIdx < 3;

          type DisplayRow = { rank: number; name: string; org: string; tests: number; karma: number; isYou: boolean; isSpacer?: boolean };
          const rows: DisplayRow[] = top3.map((r, i) => ({
            rank: i + 1,
            name: r.user_id === userId ? "You" : r.name,
            org: r.organization,
            tests: Number(r.tests_passed),
            karma: Number(r.total_karma),
            isYou: r.user_id === userId,
          }));

          // If user has no completions yet, show them at the bottom with current local stats
          if (!youInTop3) {
            if (myRank !== null && myRank > 3 && leaderboard[myRankIdx]) {
              rows.push({ rank: myRank, name: "You", org: leaderboard[myRankIdx].organization, tests: Number(leaderboard[myRankIdx].tests_passed), karma: Number(leaderboard[myRankIdx].total_karma), isYou: true });
            } else {
              rows.push({ rank: (leaderboard.length || 0) + 1, name: "You", org: "—", tests: passedCount, karma: karmaScore, isYou: true });
            }
          }

          if (rows.length === 0) {
            return <div style={{ fontSize: 13, color: "var(--ink-3)", textAlign: "center", padding: "16px 0" }}>No attempts yet — be the first on the leaderboard!</div>;
          }

          return rows.map((row, i) => (
            <div key={row.rank} style={{
              display: "flex", alignItems: "center", gap: 14,
              padding: row.isYou ? "11px 12px" : "11px 0",
              borderBottom: i < rows.length - 1 ? "1px solid var(--border-soft)" : "none",
              background: row.isYou ? "#eff6ff" : "none",
              borderRadius: row.isYou ? 8 : 0,
              margin: row.isYou ? "0 -12px" : 0,
            }}>
              <div style={{ width: 28, height: 28, borderRadius: 6, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: row.rank <= 3 ? "white" : "var(--ink-3)", background: row.rank === 1 ? "linear-gradient(135deg,#f59e0b,#d97706)" : row.rank === 2 ? "linear-gradient(135deg,#9ca3af,#6b7280)" : row.rank === 3 ? "linear-gradient(135deg,#cd7c3a,#b45309)" : "var(--surface-2)" }}>{row.rank}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: row.isYou ? 700 : 500, color: row.isYou ? "var(--seeker)" : "var(--ink)" }}>{row.name}</div>
                <div style={{ fontSize: 11, color: "var(--ink-3)" }}>{row.org} · {row.tests} tests passed</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 14, fontWeight: 700, color: "var(--ink)" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="#facc15" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                {row.karma >= 0 ? "+" : ""}{row.karma.toFixed(2)}
              </div>
            </div>
          ));
        })()}
      </div>
    </div>
  );
};

// ── PreTestScreen ──────────────────────────────────────────────────────────────

type CameraStatus = "idle" | "requesting" | "active" | "denied" | "unavailable";

const PreTestScreen = ({
  tier,
  cameraStream,
  onCameraReady,
  onConfirm,
  onBack,
}: {
  tier: number;
  cameraStream: MediaStream | null;
  onCameraReady: (stream: MediaStream | null) => void;
  onConfirm: () => void;
  onBack: () => void;
}) => {
  const [agreed, setAgreed] = useState(false);
  const [cameraStatus, setCameraStatus] = useState<CameraStatus>(
    cameraStream ? "active" : "idle"
  );
  const videoPreviewRef = useRef<HTMLVideoElement>(null);

  // Attach existing stream to preview if already granted
  useEffect(() => {
    if (cameraStream && videoPreviewRef.current) {
      videoPreviewRef.current.srcObject = cameraStream;
    }
  }, [cameraStream]);

  const requestCamera = async () => {
    setCameraStatus("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
        audio: false,
      });
      onCameraReady(stream);
      setCameraStatus("active");
      if (videoPreviewRef.current) videoPreviewRef.current.srcObject = stream;
    } catch (err: any) {
      const isDenied = err?.name === "NotAllowedError" || err?.name === "PermissionDeniedError";
      setCameraStatus(isDenied ? "denied" : "unavailable");
      onCameraReady(null);
    }
  };

  const canBegin = agreed && (cameraStatus === "active");

  const rules = [
    { icon: "🖥️", title: "Stay fullscreen", desc: "Fullscreen is required. Exiting twice auto-submits." },
    { icon: "📷", title: "Camera proctoring", desc: "Your camera must be active throughout. Turning it off counts as a violation." },
    { icon: "🚫", title: "No switching windows", desc: "Switching tabs or apps is detected. Two violations auto-submit." },
    { icon: "📋", title: "No copy-paste", desc: "Clipboard, right-click, and DevTools are blocked." },
    { icon: "⏱️", title: "60-minute timer", desc: "Wall-clock time — the timer keeps running even if you refresh." },
    { icon: "🔀", title: "Random questions", desc: "Drawn from a pool each attempt. Refreshing gives the same set." },
  ];

  return (
    <div style={{ maxWidth: 580, margin: "0 auto", animation: "fadeUp 0.4s var(--ease-out) both" }}>
      <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 6, border: "none", background: "none", cursor: "pointer", fontSize: 13, color: "var(--ink-3)", marginBottom: 24, fontFamily: "inherit", padding: 0 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
        Back to tests
      </button>

      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
        <div style={{ width: 52, height: 52, borderRadius: 14, background: "var(--ink)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-3)", marginBottom: 3 }}>AI PM Certification</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.04em", color: "var(--ink)" }}>Test {tier} — {diffLabel(tier)}</h2>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 24 }}>
        {[["10", "Questions"], ["60", "Minutes"], [`T${tier}`, "Level"]].map(([v, l]) => (
          <div key={l} style={{ padding: "14px", background: "var(--surface-2)", borderRadius: 12, textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.04em", color: "var(--ink)" }}>{v}</div>
            <div style={{ fontSize: 11, color: "var(--ink-3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Rules */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border-soft)", borderRadius: 12, overflow: "hidden", marginBottom: 20 }}>
        <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border-soft)", fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>Test rules & proctoring</div>
        {rules.map((r, i) => (
          <div key={i} style={{ display: "flex", gap: 14, padding: "13px 18px", borderBottom: i < rules.length - 1 ? "1px solid var(--border-soft)" : "none" }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>{r.icon}</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", marginBottom: 2 }}>{r.title}</div>
              <div style={{ fontSize: 13, color: "var(--ink-3)", lineHeight: 1.55 }}>{r.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Camera setup — required step */}
      <div style={{
        border: `1.5px solid ${cameraStatus === "active" ? "#a7f3d0" : cameraStatus === "denied" || cameraStatus === "unavailable" ? "#fecaca" : "var(--border-soft)"}`,
        borderRadius: 12, overflow: "hidden", marginBottom: 20,
        background: cameraStatus === "active" ? "#f0fdf4" : "var(--surface)",
        transition: "all 0.2s",
      }}>
        <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border-soft)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={cameraStatus === "active" ? "var(--recruiter)" : "var(--ink-3)"} strokeWidth="2" strokeLinecap="round"><path d="m22 8-6 4 6 4V8z"/><rect x="2" y="6" width="14" height="12" rx="2"/></svg>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>Camera verification</span>
            <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 999, background: "#fef3c7", color: "#d97706", fontWeight: 700, border: "1px solid #fde68a" }}>Required</span>
          </div>
          {cameraStatus === "active" && (
            <span style={{ fontSize: 12, color: "var(--recruiter)", fontWeight: 700, display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--recruiter)", display: "inline-block", animation: "pulse-soft 2s infinite" }} />
              Camera active
            </span>
          )}
        </div>

        {cameraStatus === "active" ? (
          <div style={{ padding: "12px 18px", display: "flex", gap: 14, alignItems: "center" }}>
            <div style={{ position: "relative", borderRadius: 8, overflow: "hidden", flexShrink: 0, width: 120, height: 90, background: "#000" }}>
              <video ref={videoPreviewRef} autoPlay playsInline muted style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)" }} />
              <div style={{ position: "absolute", bottom: 4, left: 4, display: "flex", alignItems: "center", gap: 4, background: "rgba(0,0,0,0.6)", borderRadius: 4, padding: "2px 6px" }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#ef4444", animation: "pulse-soft 2s infinite" }} />
                <span style={{ fontSize: 9, color: "white", fontWeight: 700 }}>LIVE</span>
              </div>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--recruiter)", marginBottom: 3 }}>Camera verified</div>
              <div style={{ fontSize: 12, color: "var(--ink-3)", lineHeight: 1.5 }}>Your face is visible. The live feed will be shown in the corner during the test. No video is recorded or stored.</div>
            </div>
          </div>
        ) : (
          <div style={{ padding: "16px 18px" }}>
            {(cameraStatus === "denied" || cameraStatus === "unavailable") && (
              <div style={{ marginBottom: 12, padding: "10px 12px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, fontSize: 12, color: "#dc2626" }}>
                {cameraStatus === "denied"
                  ? "Camera access was denied. Please allow camera access in your browser settings and try again."
                  : "No camera found. Please connect a camera and try again."}
              </div>
            )}
            <div style={{ fontSize: 13, color: "var(--ink-3)", marginBottom: 12, lineHeight: 1.6 }}>
              Camera access is required to begin the test. Your video feed is shown to you only — nothing is recorded or uploaded.
            </div>
            <button
              onClick={requestCamera}
              disabled={cameraStatus === "requesting"}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 18px", borderRadius: 8, border: "none", background: "var(--ink)", color: "white", fontSize: 13, fontWeight: 600, cursor: cameraStatus === "requesting" ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: cameraStatus === "requesting" ? 0.7 : 1 }}
            >
              {cameraStatus === "requesting" ? (
                <><div style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid white", borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} /> Requesting…</>
              ) : (
                <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="m22 8-6 4 6 4V8z"/><rect x="2" y="6" width="14" height="12" rx="2"/></svg>{cameraStatus === "denied" || cameraStatus === "unavailable" ? "Try again" : "Enable camera"}</>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Agreement */}
      <label style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 24, cursor: "pointer" }}>
        <div
          onClick={() => setAgreed(!agreed)}
          style={{ width: 20, height: 20, borderRadius: 5, border: `2px solid ${agreed ? "var(--ink)" : "var(--border-soft)"}`, background: agreed ? "var(--ink)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1, transition: "all 0.15s", cursor: "pointer" }}
        >
          {agreed && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><path d="M20 6 9 17l-5-5"/></svg>}
        </div>
        <span style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.6 }}>
          I understand the proctoring rules. I will not switch windows, use external resources, or attempt to bypass monitoring. I consent to my camera being active during this test.
        </span>
      </label>

      {!canBegin && agreed && cameraStatus !== "active" && (
        <div style={{ marginBottom: 16, padding: "10px 14px", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, fontSize: 13, color: "#d97706" }}>
          Please enable your camera above to begin the test.
        </div>
      )}

      <button
        onClick={() => { if (canBegin) onConfirm(); }}
        disabled={!canBegin}
        style={{ width: "100%", padding: "13px", borderRadius: 12, border: "none", background: canBegin ? "var(--ink)" : "var(--surface-2)", color: canBegin ? "white" : "var(--ink-4)", fontSize: 15, fontWeight: 700, cursor: canBegin ? "pointer" : "not-allowed", transition: "all 0.15s", fontFamily: "inherit", letterSpacing: "-0.01em", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        Begin Test {tier}
      </button>
    </div>
  );
};

// ── TestEnvironment ────────────────────────────────────────────────────────────

const TestEnvironment = ({
  tier,
  seed,
  questions,
  userId,
  cameraStream,
  onComplete,
}: {
  tier: number;
  seed: number;
  questions: Question[];
  userId: string;
  cameraStream: MediaStream | null;
  onComplete: (result: TestResult) => void;
}) => {
  // Restore state from sessionStorage if resuming after a page refresh
  const [currentQ, setCurrentQ] = useState(() => {
    try { const s = sessionStorage.getItem(SS_PG); return s ? (JSON.parse(s).currentQ ?? 0) : 0; } catch { return 0; }
  });
  const [answers, setAnswers] = useState<Record<number, number>>(() => {
    try { const s = sessionStorage.getItem(SS_PG); return s ? (JSON.parse(s).answers ?? {}) : {}; } catch { return {}; }
  });
  const [timeLeft, setTimeLeft] = useState(() => {
    try {
      const s = sessionStorage.getItem(SS_PG);
      if (!s) return 60 * 60;
      const { timeLeft: tl, savedAt } = JSON.parse(s);
      if (tl == null || savedAt == null) return 60 * 60;
      // Deduct time elapsed during the refresh gap
      return Math.max(0, tl - Math.floor((Date.now() - savedAt) / 1000));
    } catch { return 60 * 60; }
  });
  const [tabWarnings, setTabWarnings] = useState(() => {
    try { const s = sessionStorage.getItem(SS_PG); return s ? (JSON.parse(s).tabWarnings ?? 0) : 0; } catch { return 0; }
  });
  const [fsExits, setFsExits] = useState(() => {
    try { const s = sessionStorage.getItem(SS_PG); return s ? (JSON.parse(s).fsExits ?? 0) : 0; } catch { return 0; }
  });
  const [flagged, setFlagged] = useState<Record<number, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const [scoring, setScoring] = useState(false);
  const [proctorWarnMsg, setProctorWarnMsg] = useState<string | null>(null);
  // tabWarn: full-screen modal state — includes reason and whether this is a final termination
  const [tabWarnModal, setTabWarnModal] = useState<{ reason: string; terminating: boolean } | null>(null);
  const [fsWarnModal, setFsWarnModal] = useState<{ count: number; terminating: boolean } | null>(null);
  const submittedRef = useRef(false);
  const cameraPipRef = useRef<HTMLVideoElement>(null);
  const proctorNoteRef = useRef("");

  const total = questions.length;
  const q = questions[currentQ];
  const selected = answers[currentQ];
  const answeredCount = Object.keys(answers).length;
  const timeIsLow = timeLeft < 300;

  const submit = useCallback(async () => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setSubmitted(true);
    setScoring(true);

    try {
      // Race the Edge Function against a 15-second timeout (guards against cold-start hangs)
      const invokePromise = supabase.functions.invoke("score-test", {
        body: { tier, seed, answers },
      });
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Scoring timed out — please check your connection")), 15000)
      );

      const { data: funcData, error: funcError } = await Promise.race([invokePromise, timeoutPromise]);

      if (funcError) throw new Error((funcError as any)?.message ?? "Scoring failed");
      if (!funcData || typeof funcData.score !== "number") throw new Error("Invalid response from scorer");

      const { score, total: t, karmaChange, reviews } = funcData as {
        score: number;
        total: number;
        karmaChange: number;
        reviews: QuestionReview[];
      };

      // Apply proctor penalty on top of score-based karma when terminated by AI
      const proctorNote = proctorNoteRef.current || undefined;
      const finalDelta = proctorNote ? Math.min(karmaChange - 0.5, -0.5) : karmaChange;
      setScoring(false);
      onComplete({ score, total: t, delta: finalDelta, answers, questions, reviews, tier, proctorNote });
    } catch (err) {
      console.error("score-test error:", err);
      const proctorNote = proctorNoteRef.current || undefined;
      setScoring(false);
      onComplete({ score: 0, total, delta: -0.6, answers, questions, reviews: [], tier, proctorNote });
    }
  }, [answers, questions, tier, seed, total, userId, onComplete]);

  // Always-fresh submit ref so timer/blur/devtools effects don't capture stale closures
  const submitRef = useRef(submit);
  useEffect(() => { submitRef.current = submit; }, [submit]);

  // ── Alert sound (Web Audio API — no file dependency) ─────────────────────
  const playAlertSound = useCallback((pitch = 880) => {
    try {
      const ac = new AudioContext();
      [0, 0.22].forEach(t => {
        const osc = ac.createOscillator();
        const gain = ac.createGain();
        osc.connect(gain); gain.connect(ac.destination);
        osc.type = "sine";
        osc.frequency.setValueAtTime(pitch, ac.currentTime + t);
        gain.gain.setValueAtTime(0, ac.currentTime + t);
        gain.gain.linearRampToValueAtTime(0.55, ac.currentTime + t + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + t + 0.35);
        osc.start(ac.currentTime + t);
        osc.stop(ac.currentTime + t + 0.35);
      });
    } catch {}
  }, []);

  // ── AI Proctoring engine ──────────────────────────────────────────────────

  const handleProctorWarn = useCallback((v: ProctorViolation, n: number) => {
    playAlertSound(740);
    setProctorWarnMsg(`⚠️ ${v.label} (warning ${n})`);
    setTimeout(() => setProctorWarnMsg(null), 6000);
  }, [playAlertSound]);

  const handleProctorBlock = useCallback((_v: ProctorViolation, _n: number) => {
    // isSuspended state from the engine shows the modal — nothing extra needed here
  }, []);

  const handleProctorTerminate = useCallback((reason: string) => {
    proctorNoteRef.current = reason;
    submitRef.current();
  }, []);

  const proctor = useProctorEngine(
    cameraPipRef,
    !submitted,
    handleProctorWarn,
    handleProctorBlock,
    handleProctorTerminate,
  );

  // Attach camera stream to PiP video element
  useEffect(() => {
    if (cameraStream && cameraPipRef.current) {
      cameraPipRef.current.srcObject = cameraStream;
    }
  }, [cameraStream]);

  // Shared handler for all focus/tab violations
  const triggerFocusViolation = useCallback((reason: string) => {
    if (submittedRef.current) return;
    playAlertSound(880);
    setTabWarnings(prev => {
      const next = prev + 1;
      const terminating = next >= 2;
      setTabWarnModal({ reason, terminating });
      if (terminating) {
        proctorNoteRef.current = `Test auto-submitted: ${reason.toLowerCase()}`;
        setTimeout(() => submitRef.current(), 2500); // let user see the termination screen
      }
      return next;
    });
  }, [playAlertSound]);

  // Camera track ended mid-test
  useEffect(() => {
    if (!cameraStream) return;
    const tracks = cameraStream.getVideoTracks();
    const onEnded = () => triggerFocusViolation("Camera was disabled or disconnected");
    tracks.forEach(t => t.addEventListener("ended", onEnded));
    return () => tracks.forEach(t => t.removeEventListener("ended", onEnded));
  }, [cameraStream, triggerFocusViolation]);

  // Request fullscreen when test begins
  useEffect(() => {
    document.documentElement.requestFullscreen?.().catch(() => {});
  }, []);

  // Save progress to sessionStorage after every relevant state change
  useEffect(() => {
    if (submitted) return;
    try {
      sessionStorage.setItem(SS_PG, JSON.stringify({
        answers, timeLeft, currentQ, tabWarnings, fsExits, savedAt: Date.now(),
      }));
    } catch {}
  }, [answers, timeLeft, currentQ, tabWarnings, fsExits, submitted]);

  // Deadline-based timer — immune to setInterval throttling
  useEffect(() => {
    if (timeLeft <= 0) { submitRef.current(); return; }
    const deadline = Date.now() + timeLeft * 1000;
    const id = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining <= 0) submitRef.current();
    }, 500);
    return () => clearInterval(id);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Tab-switch detection (document becomes hidden)
  useEffect(() => {
    const handler = () => {
      if (!document.hidden || submittedRef.current) return;
      triggerFocusViolation("Tab was switched away from the test");
    };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, [triggerFocusViolation]);

  // App-switch detection (window loses focus — Alt+Tab to another app)
  useEffect(() => {
    const handler = () => {
      if (document.hidden || submittedRef.current) return;
      triggerFocusViolation("Application window lost focus — switched to another app");
    };
    window.addEventListener("blur", handler);
    return () => window.removeEventListener("blur", handler);
  }, [triggerFocusViolation]);

  // DevTools detection via window dimension differential
  useEffect(() => {
    const id = setInterval(() => {
      if (submittedRef.current) return;
      const open = window.outerWidth - window.innerWidth > 160 || window.outerHeight - window.innerHeight > 200;
      if (!open) return;
      triggerFocusViolation("Browser DevTools were opened during the test");
    }, 2000);
    return () => clearInterval(id);
  }, [triggerFocusViolation]);

  // Fullscreen exit detection
  useEffect(() => {
    const handler = () => {
      if (document.fullscreenElement || submittedRef.current) return;
      playAlertSound(660);
      setFsExits(prev => {
        const next = prev + 1;
        const terminating = next >= 2;
        setFsWarnModal({ count: next, terminating });
        if (terminating) {
          proctorNoteRef.current = "Test auto-submitted: fullscreen was exited twice";
          setTimeout(() => submitRef.current(), 2500);
        }
        return next;
      });
    };
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, [playAlertSound]);

  // Navigation-away warning
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (submittedRef.current) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  // Block copy-paste, right-click, keyboard shortcuts, text selection, drag, and printing
  useEffect(() => {
    const block = (e: Event) => e.preventDefault();
    const origPrint = window.print;
    window.print = () => {};
    const blockKey = (e: KeyboardEvent) => {
      if (e.key === "F12" || e.key === "F5") { e.preventDefault(); return; }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && ["I", "J", "C"].includes(e.key.toUpperCase())) { e.preventDefault(); return; }
      // DevTools, view-source, save, print, select-all, new-tab, new-window, close-tab, address-bar, refresh
      if ((e.ctrlKey || e.metaKey) && ["u", "s", "p", "a", "t", "n", "w", "l", "r"].includes(e.key.toLowerCase())) { e.preventDefault(); return; }
      if (e.ctrlKey && e.key === "Tab") { e.preventDefault(); return; }
      if (e.key === "PrintScreen") { e.preventDefault(); return; }
    };
    document.addEventListener("copy", block);
    document.addEventListener("paste", block);
    document.addEventListener("cut", block);
    document.addEventListener("contextmenu", block);
    document.addEventListener("keydown", blockKey);
    document.addEventListener("selectstart", block);
    document.addEventListener("dragstart", block);
    return () => {
      window.print = origPrint;
      document.removeEventListener("copy", block);
      document.removeEventListener("paste", block);
      document.removeEventListener("cut", block);
      document.removeEventListener("contextmenu", block);
      document.removeEventListener("keydown", blockKey);
      document.removeEventListener("selectstart", block);
      document.removeEventListener("dragstart", block);
    };
  }, [])

  const requestFs = () => { document.documentElement.requestFullscreen?.().catch(() => {}); };
  const fmtTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  const pctDone = (currentQ / total) * 100;

  return (
    <div style={{ minHeight: "100vh", background: "var(--surface)", display: "flex", flexDirection: "column", userSelect: "none" }}>

      {/* Camera PiP — live feed with AI proctoring status border */}
      {cameraStream && (
        <div style={{
          position: "fixed", bottom: 20, right: 20, zIndex: 100,
          width: 140, height: 105, borderRadius: 10, overflow: "hidden",
          border: `2.5px solid ${proctor.borderColor}`,
          boxShadow: `0 4px 24px rgba(0,0,0,0.35), 0 0 0 1px ${proctor.borderColor}40`,
          background: "#000",
          transition: "border-color 0.4s, box-shadow 0.4s",
        }}>
          <video ref={cameraPipRef} autoPlay playsInline muted style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)" }} />
          <div style={{ position: "absolute", bottom: 4, left: 4, display: "flex", alignItems: "center", gap: 4, background: "rgba(0,0,0,0.65)", borderRadius: 4, padding: "2px 6px" }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: proctor.borderColor, animation: "pulse-soft 2s infinite" }} />
            <span style={{ fontSize: 9, color: "white", fontWeight: 700 }}>
              {proctor.modelStatus === "loading" ? "AI: INIT" : proctor.currentViolation ? "AI: ALERT" : "AI: OK"}
            </span>
          </div>
        </div>
      )}

      {/* Proctor — AI suspension modal (test is paused until acknowledged) */}
      {proctor.isSuspended && !submitted && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1002, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, animation: "scaleIn 0.2s var(--ease-out)" }}>
          <div style={{ background: "white", borderRadius: 20, padding: "36px 40px", maxWidth: 480, width: "100%", textAlign: "center", boxShadow: "0 40px 80px rgba(0,0,0,0.5)" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#fef2f2", border: "3px solid #ef4444", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 28 }}>🚨</div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: "#dc2626", marginBottom: 10, letterSpacing: "-0.03em" }}>Proctoring Violation Detected</h3>
            <p style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.65, marginBottom: 8 }}>{proctor.suspendMessage}</p>
            <div style={{ fontSize: 13, color: "var(--ink-3)", marginBottom: 24, padding: "10px 14px", background: "#fef2f2", borderRadius: 8, lineHeight: 1.6 }}>
              Violation {proctor.blockCount}/{3} · Test will be <strong>auto-terminated</strong> if this happens {3 - proctor.blockCount} more time{3 - proctor.blockCount !== 1 ? "s" : ""}.
            </div>
            <button
              onClick={proctor.acknowledge}
              style={{ width: "100%", padding: "12px", borderRadius: 10, border: "none", background: "#dc2626", color: "white", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
            >
              I understand — resume test
            </button>
          </div>
        </div>
      )}

      {/* Proctor — soft warning toast */}
      {proctorWarnMsg && !proctor.isSuspended && (
        <div style={{ position: "fixed", top: 70, left: "50%", transform: "translateX(-50%)", zIndex: 998, background: "#d97706", color: "white", padding: "11px 18px", borderRadius: 10, fontSize: 13, fontWeight: 600, boxShadow: "0 8px 32px rgba(0,0,0,0.2)", animation: "slideInRight 0.3s var(--ease-out)", maxWidth: 440, textAlign: "center", lineHeight: 1.5 }}>
          {proctorWarnMsg}
        </div>
      )}

      {/* Scoring overlay — shown while Edge Function grades the test */}
      {scoring && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1001, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "white", borderRadius: 20, padding: "40px 48px", textAlign: "center", boxShadow: "0 40px 80px rgba(0,0,0,0.4)" }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", border: "4px solid var(--seeker)", borderTopColor: "transparent", animation: "spin 0.8s linear infinite", margin: "0 auto 20px" }} />
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--ink)", marginBottom: 6, letterSpacing: "-0.02em" }}>Scoring your test…</h3>
            <p style={{ fontSize: 13, color: "var(--ink-3)" }}>Answers are being verified server-side</p>
          </div>
        </div>
      )}

      {/* Focus/tab-switch violation modal — full screen, unmissable */}
      {tabWarnModal && !submitted && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: tabWarnModal.terminating ? "#7f1d1d" : "#dc2626", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, animation: "scaleIn 0.15s var(--ease-out)" }}>
          <div style={{ background: "white", borderRadius: 24, padding: "48px 52px", maxWidth: 520, width: "100%", textAlign: "center", boxShadow: "0 60px 120px rgba(0,0,0,0.6)" }}>
            <div style={{ fontSize: 80, marginBottom: 16, lineHeight: 1, filter: "drop-shadow(0 4px 8px rgba(220,38,38,0.3))" }}>
              {tabWarnModal.terminating ? "🚫" : "⚠️"}
            </div>
            <h2 style={{ fontSize: 26, fontWeight: 800, color: tabWarnModal.terminating ? "#7f1d1d" : "#dc2626", marginBottom: 12, letterSpacing: "-0.04em" }}>
              {tabWarnModal.terminating ? "Test Terminated" : "Proctoring Violation"}
            </h2>
            <div style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)", marginBottom: 14, padding: "12px 16px", background: "#fef2f2", borderRadius: 10, lineHeight: 1.6 }}>
              {tabWarnModal.reason}
            </div>
            {tabWarnModal.terminating ? (
              <p style={{ fontSize: 14, color: "var(--ink-3)", lineHeight: 1.7 }}>
                This was your <strong>2nd violation</strong>. Your test is being submitted now with all unanswered questions marked wrong and a <strong>karma penalty applied</strong>. You may retake this test in 7 days.
              </p>
            ) : (
              <>
                <p style={{ fontSize: 14, color: "var(--ink-3)", lineHeight: 1.7, marginBottom: 24 }}>
                  This is warning <strong>{tabWarnings}/2</strong>. A second violation will <strong>immediately auto-submit</strong> your test with a karma penalty. Please stay focused on the test window at all times.
                </p>
                <button
                  onClick={() => setTabWarnModal(null)}
                  style={{ width: "100%", padding: "14px", borderRadius: 12, border: "none", background: "#dc2626", color: "white", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", letterSpacing: "-0.01em" }}
                >
                  I understand — return to test
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Fullscreen exit modal */}
      {fsWarnModal && !submitted && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: fsWarnModal.terminating ? "#78350f" : "#d97706", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, animation: "scaleIn 0.15s var(--ease-out)" }}>
          <div style={{ background: "white", borderRadius: 24, padding: "48px 52px", maxWidth: 520, width: "100%", textAlign: "center", boxShadow: "0 60px 120px rgba(0,0,0,0.6)" }}>
            <div style={{ fontSize: 80, marginBottom: 16, lineHeight: 1 }}>
              {fsWarnModal.terminating ? "🚫" : "🖥️"}
            </div>
            <h2 style={{ fontSize: 26, fontWeight: 800, color: fsWarnModal.terminating ? "#78350f" : "#b45309", marginBottom: 12, letterSpacing: "-0.04em" }}>
              {fsWarnModal.terminating ? "Test Terminated" : "Fullscreen Exited"}
            </h2>
            <div style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)", marginBottom: 14, padding: "12px 16px", background: "#fffbeb", borderRadius: 10, lineHeight: 1.6 }}>
              You exited fullscreen mode ({fsWarnModal.count}/2)
            </div>
            {fsWarnModal.terminating ? (
              <p style={{ fontSize: 14, color: "var(--ink-3)", lineHeight: 1.7 }}>
                Your test is being submitted now with a <strong>karma penalty</strong>. You may retake in 7 days.
              </p>
            ) : (
              <>
                <p style={{ fontSize: 14, color: "var(--ink-3)", lineHeight: 1.7, marginBottom: 24 }}>
                  Fullscreen is required. A second exit will <strong>auto-submit</strong> your test. Click below to re-enter fullscreen and continue.
                </p>
                <button
                  onClick={() => { requestFs(); setFsWarnModal(null); }}
                  style={{ width: "100%", padding: "14px", borderRadius: 12, border: "none", background: "#d97706", color: "white", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
                >
                  Re-enter fullscreen
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Top bar */}
      <div style={{ position: "sticky", top: 0, zIndex: 50, background: "var(--surface)", borderBottom: "1px solid var(--border-soft)" }}>
        <div style={{ position: "absolute", bottom: 0, left: 0, height: 2, width: `${pctDone}%`, background: "var(--seeker)", transition: "width 0.3s var(--ease-out)" }} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", height: 52 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)", letterSpacing: "-0.02em" }}>Test {tier}</div>
            <div style={{ height: 16, width: 1, background: "var(--border-soft)" }} />
            <div style={{ fontSize: 13, color: "var(--ink-3)" }}>Q <strong style={{ color: "var(--ink)" }}>{currentQ + 1}</strong>/{total} · <strong style={{ color: "var(--ink)" }}>{answeredCount}</strong> answered</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* AI proctor status */}
            <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 999, background: proctor.currentViolation ? "#fef2f2" : "var(--surface-2)", border: `1px solid ${proctor.currentViolation ? "#fecaca" : "var(--border-soft)"}`, transition: "all 0.3s" }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: proctor.borderColor, animation: "pulse-soft 2s infinite", transition: "background 0.3s" }} />
              <span style={{ fontSize: 11, color: proctor.currentViolation ? "#dc2626" : "var(--ink-3)", fontWeight: 600, transition: "color 0.3s" }}>
                {proctor.modelStatus === "loading" ? "AI: Loading…" : proctor.currentViolation ? proctor.currentViolation.label : "AI Proctored"}
              </span>
            </div>
            {/* Timer */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 8, background: timeIsLow ? "#fef2f2" : "var(--surface-2)", border: `1px solid ${timeIsLow ? "#fecaca" : "var(--border-soft)"}`, transition: "all 0.3s" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={timeIsLow ? "#ef4444" : "var(--ink-3)"} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
              <span style={{ fontSize: 14, fontWeight: 700, fontFamily: "monospace", color: timeIsLow ? "#ef4444" : "var(--ink)", letterSpacing: "0.04em" }}>{fmtTime(timeLeft)}</span>
            </div>
            {/* Fullscreen */}
            <button onClick={requestFs} title="Enter fullscreen" style={{ width: 34, height: 34, borderRadius: 8, background: "var(--surface-2)", border: "1px solid var(--border-soft)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ink-2)" strokeWidth="2" strokeLinecap="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
            </button>
          </div>
        </div>
      </div>

      {/* Question nav pills */}
      <div style={{ padding: "12px 24px", borderBottom: "1px solid var(--border-soft)", display: "flex", gap: 6, flexWrap: "wrap", background: "var(--surface-2)" }}>
        {questions.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentQ(i)}
            style={{
              width: 32, height: 32, borderRadius: 8, fontFamily: "inherit", fontSize: 12, fontWeight: 600,
              cursor: "pointer", transition: "all 0.15s", border: `1px solid ${i === currentQ ? "var(--ink)" : answers[i] !== undefined ? "#bfdbfe" : flagged[i] ? "#fde68a" : "var(--border-soft)"}`,
              background: i === currentQ ? "var(--ink)" : answers[i] !== undefined ? "#eff6ff" : flagged[i] ? "#fffbeb" : "var(--surface)",
              color: i === currentQ ? "white" : answers[i] !== undefined ? "var(--seeker)" : flagged[i] ? "#d97706" : "var(--ink-3)",
            }}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Main question */}
      <div style={{ flex: 1, display: "flex", justifyContent: "center", padding: "32px 24px" }}>
        <div style={{ width: "100%", maxWidth: 680, animation: "fadeUp 0.3s var(--ease-out) both" }} key={currentQ}>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-3)", padding: "4px 10px", background: "var(--surface-2)", borderRadius: 999 }}>
              Question {currentQ + 1} of {total}
            </span>
            <button
              onClick={() => setFlagged(prev => ({ ...prev, [currentQ]: !prev[currentQ] }))}
              style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 8, border: `1px solid ${flagged[currentQ] ? "#fde68a" : "var(--border-soft)"}`, background: flagged[currentQ] ? "#fffbeb" : "transparent", color: flagged[currentQ] ? "#d97706" : "var(--ink-3)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill={flagged[currentQ] ? "#d97706" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
              {flagged[currentQ] ? "Flagged" : "Flag"}
            </button>
          </div>

          <h3 style={{ fontSize: 20, fontWeight: 600, color: "var(--ink)", lineHeight: 1.5, letterSpacing: "-0.02em", marginBottom: 28 }}>{q.question_text}</h3>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
            {q.options.map((opt, oi) => {
              const isSelected = selected === oi;
              return (
                <button
                  key={oi}
                  onClick={() => setAnswers(prev => ({ ...prev, [currentQ]: oi }))}
                  style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "14px 18px", borderRadius: 12, border: `1.5px solid ${isSelected ? "var(--seeker)" : "var(--border-soft)"}`, background: isSelected ? "#eff6ff" : "var(--surface)", cursor: "pointer", textAlign: "left", transition: "all 0.15s", fontFamily: "inherit" }}
                  onMouseEnter={e => { if (!isSelected) { (e.currentTarget as HTMLElement).style.background = "var(--surface-2)"; } }}
                  onMouseLeave={e => { if (!isSelected) { (e.currentTarget as HTMLElement).style.background = "var(--surface)"; } }}
                >
                  <div style={{ width: 22, height: 22, borderRadius: "50%", border: `2px solid ${isSelected ? "var(--seeker)" : "var(--border-soft)"}`, background: isSelected ? "var(--seeker)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1, transition: "all 0.15s" }}>
                    {isSelected && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "white" }} />}
                  </div>
                  <div style={{ fontSize: 14, color: isSelected ? "var(--seeker)" : "var(--ink)", fontWeight: isSelected ? 600 : 400, lineHeight: 1.55 }}>{opt}</div>
                </button>
              );
            })}
          </div>

          {/* Navigation */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <button
              onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
              disabled={currentQ === 0}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 8, border: "1px solid var(--border-soft)", background: "var(--surface)", color: currentQ === 0 ? "var(--ink-4)" : "var(--ink-2)", cursor: currentQ === 0 ? "not-allowed" : "pointer", fontSize: 13, fontWeight: 600, fontFamily: "inherit" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg> Prev
            </button>

            {currentQ === total - 1 ? (
              <button
                onClick={() => { if (!submitted) submit(); }}
                style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 20px", borderRadius: 8, border: "none", background: answeredCount === total ? "var(--ink)" : "var(--surface-2)", color: answeredCount === total ? "white" : "var(--ink-3)", cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "inherit" }}
              >
                Submit test <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6 9 17l-5-5"/></svg>
              </button>
            ) : (
              <button
                onClick={() => setCurrentQ(Math.min(total - 1, currentQ + 1))}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 8, border: "none", background: "var(--ink)", color: "white", cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "inherit" }}
              >
                Next <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </button>
            )}
          </div>

          {currentQ === total - 1 && answeredCount < total && (
            <div style={{ marginTop: 14, padding: "10px 14px", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, fontSize: 13, color: "#d97706" }}>
              ⚠️ {total - answeredCount} question{total - answeredCount > 1 ? "s" : ""} unanswered. You can go back or submit anyway.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── TestResults ────────────────────────────────────────────────────────────────

const TestResults = ({
  result,
  oldKarma,
  newKarma,
  onContinue,
}: {
  result: TestResult;
  oldKarma: number;
  newKarma: number;
  onContinue: () => void;
}) => {
  const { score, total, delta, answers, questions, reviews, tier, proctorNote } = result;
  const pct = score / total;
  const passed = pct >= 0.6 && !proctorNote;
  const [animated, setAnimated] = useState(false);
  const [showReview, setShowReview] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{ maxWidth: 620, margin: "0 auto", padding: "40px 24px", animation: "fadeUp 0.5s var(--ease-out) both" }}>

      {/* Proctoring termination notice — shown before score when test was AI-terminated */}
      {proctorNote && (
        <div style={{ marginBottom: 28, padding: "20px 22px", background: "#fef2f2", border: "2px solid #fecaca", borderRadius: 16 }}>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <span style={{ fontSize: 24, flexShrink: 0 }}>🚨</span>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#dc2626", marginBottom: 6 }}>Test terminated by AI proctoring</div>
              <div style={{ fontSize: 13, color: "#991b1b", lineHeight: 1.65 }}>{proctorNote}</div>
              <div style={{ marginTop: 10, fontSize: 12, color: "#b91c1c", padding: "8px 12px", background: "rgba(220,38,38,0.08)", borderRadius: 8, lineHeight: 1.6 }}>
                <strong>Karma penalty applied: −0.50</strong> in addition to your score-based adjustment. This deduction is recorded on your account. If you believe this was an error, please contact support.
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: proctorNote ? "#fef2f2" : passed ? "#ecfdf5" : "#fef2f2", border: `3px solid ${proctorNote ? "#dc2626" : passed ? "var(--recruiter)" : "#ef4444"}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 32 }}>
          {proctorNote ? "🚫" : passed ? "🏆" : "📚"}
        </div>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--ink-3)", marginBottom: 6 }}>Test {tier} · {diffLabel(tier)}</div>
        <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.05em", color: proctorNote ? "#dc2626" : passed ? "var(--recruiter)" : "#ef4444", marginBottom: 6 }}>
          {proctorNote ? "Test Terminated" : passed ? "Test Passed!" : "Keep Practising"}
        </h2>
        <p style={{ fontSize: 15, color: "var(--ink-3)", lineHeight: 1.6 }}>
          {proctorNote
            ? "This attempt has been voided. You may retake in 7 days."
            : passed
              ? `Excellent work! You've unlocked Test ${tier + 1}.`
              : `You need 60% to pass. Review the explanations below and retake in 7 days.`}
        </p>
      </div>

      {/* Score row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 24 }}>
        <div style={{ padding: "18px", background: "var(--surface)", border: "1px solid var(--border-soft)", borderRadius: 14, textAlign: "center" }}>
          <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.05em", color: passed ? "var(--recruiter)" : "#ef4444" }}>{score}/{total}</div>
          <div style={{ fontSize: 11, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: 600, marginTop: 4 }}>Score</div>
        </div>
        <div style={{ padding: "18px", background: "var(--surface)", border: "1px solid var(--border-soft)", borderRadius: 14, textAlign: "center" }}>
          <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.05em", color: "var(--ink)" }}>{Math.round(pct * 100)}%</div>
          <div style={{ fontSize: 11, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: 600, marginTop: 4 }}>Accuracy</div>
        </div>
        <div style={{ padding: "18px", background: delta >= 0 ? "#ecfdf5" : "#fef2f2", border: `1px solid ${delta >= 0 ? "#a7f3d0" : "#fecaca"}`, borderRadius: 14, textAlign: "center" }}>
          <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.05em", color: delta >= 0 ? "var(--recruiter)" : "#ef4444" }}>{delta > 0 ? "+" : ""}{delta.toFixed(2)}</div>
          <div style={{ fontSize: 11, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: 600, marginTop: 4 }}>Karma Δ</div>
        </div>
      </div>

      {/* Karma update */}
      <div style={{ padding: "18px 22px", background: "var(--surface)", border: "1px solid var(--border-soft)", borderRadius: 14, marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 12, color: "var(--ink-3)", fontWeight: 500, marginBottom: 4 }}>Test karma updated</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 20, fontWeight: 700, color: "var(--ink-3)", letterSpacing: "-0.03em" }}>{oldKarma.toFixed(2)}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ink-3)" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            <span style={{ fontSize: 24, fontWeight: 800, color: delta >= 0 ? "var(--recruiter)" : "#ef4444", letterSpacing: "-0.04em" }}>{newKarma.toFixed(2)}</span>
            <span style={{ fontSize: 13, color: delta >= 0 ? "var(--recruiter)" : "#ef4444", fontWeight: 600, padding: "2px 8px", borderRadius: 999, background: delta >= 0 ? "#ecfdf5" : "#fef2f2" }}>{delta > 0 ? "+" : ""}{delta.toFixed(2)}</span>
          </div>
        </div>
        <div style={{ position: "relative", width: 60, height: 60 }}>
          <svg width="60" height="60" viewBox="0 0 60 60" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="30" cy="30" r="25" strokeWidth="4" stroke="var(--surface-2)" fill="none" />
            <circle cx="30" cy="30" r="25" strokeWidth="4" stroke={delta >= 0 ? "var(--recruiter)" : "#ef4444"} fill="none"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 25}
              strokeDashoffset={animated ? 2 * Math.PI * 25 * (1 - Math.min(newKarma / 2, 1)) : 2 * Math.PI * 25}
              style={{ transition: "stroke-dashoffset 1s var(--ease-out)" }}
            />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "var(--ink)" }}>{newKarma.toFixed(2)}</div>
        </div>
      </div>

      {/* Answer review */}
      <button
        onClick={() => setShowReview(!showReview)}
        style={{ width: "100%", padding: "12px", borderRadius: 12, border: "1px solid var(--border-soft)", background: "var(--surface)", color: "var(--ink-2)", fontSize: 14, fontWeight: 600, cursor: "pointer", marginBottom: showReview ? 0 : 20, fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.15s" }}
      >
        {showReview ? "Hide" : "Review"} answer explanations
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ transform: showReview ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}><path d="m6 9 6 6 6-6"/></svg>
      </button>

      {showReview && (
        <div style={{ marginBottom: 20, display: "flex", flexDirection: "column", gap: 10, animation: "fadeUp 0.3s var(--ease-out)" }}>
          {reviews.length === 0 && (
            <div style={{ padding: "14px 18px", borderRadius: 12, background: "#fffbeb", border: "1px solid #fde68a", fontSize: 13, color: "#d97706" }}>
              Review unavailable — please reconnect and retake the test.
            </div>
          )}
          {reviews.map((review, i) => {
            const question = questions[i];
            if (!question) return null;
            const userAns = answers[i];
            const correct = review.correctAnswer;
            const isRight = userAns === correct;
            return (
              <div key={i} style={{ padding: "16px 18px", borderRadius: 12, border: `1px solid ${isRight ? "#a7f3d0" : "#fecaca"}`, background: isRight ? "#ecfdf5" : "#fef2f2" }}>
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <div style={{ width: 22, height: 22, borderRadius: "50%", background: isRight ? "var(--recruiter)" : "#ef4444", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                      {isRight ? <path d="M20 6 9 17l-5-5"/> : <><path d="M18 6 6 18"/><path d="m6 6 12 12"/></>}
                    </svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", marginBottom: 6, lineHeight: 1.5 }}>Q{i + 1}. {question.question_text}</div>
                    {!isRight && userAns !== undefined && <div style={{ fontSize: 12, color: "#ef4444", marginBottom: 4 }}>Your answer: {question.options[userAns]}</div>}
                    {!isRight && userAns === undefined && <div style={{ fontSize: 12, color: "#d97706", marginBottom: 4 }}>Not answered</div>}
                    <div style={{ fontSize: 12, color: isRight ? "var(--recruiter)" : "var(--ink-2)", fontWeight: 600, marginBottom: 6 }}>✓ Correct: {question.options[correct]}</div>
                    <div style={{ fontSize: 12, color: "var(--ink-3)", lineHeight: 1.6, padding: "8px 12px", background: "rgba(255,255,255,0.6)", borderRadius: 6 }}>{review.explanation}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <button
        onClick={onContinue}
        style={{ width: "100%", padding: "12px", borderRadius: 12, border: "none", background: "var(--ink)", color: "white", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
      >
        {passed && tier < TOTAL_TESTS ? `Continue to Test ${tier + 1} →` : "Back to test lobby"}
      </button>
    </div>
  );
};
