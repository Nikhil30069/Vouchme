import { useCallback, useEffect, useState } from "react";
import { Briefcase, CalendarCheck, Clock, Plus, Send, Star, Video } from "lucide-react";
import { User } from "@/stores/authStore";
import { useReferralStore } from "@/stores/referralStore";
import { JobRequirementForm } from "./JobRequirementForm";
import { StrengthScore } from "./StrengthScore";
import { BookInterviewModal } from "./BookInterviewModal";
import { TestSuite } from "./TestSuite";
import { supabase } from "@/integrations/supabase/client";
import { JOB_ROLES } from "@/constants/roles";

interface SeekerDashboardProps {
  user: User;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

type SeekerJob = {
  id: string;
  role: string;
  yearsOfExperience: number;
  currentCtc: number | null;
  expectedCtc: number | null;
  noticePeriod: number | null;
  createdAt: string | null;
};

const roleLabel = (value: string) => JOB_ROLES.find((r) => r.value === value)?.label ?? value;

const fmtCurrency = (n?: number | null) =>
  typeof n === "number" && Number.isFinite(n) ? `₹${n.toLocaleString()}` : "—";

const statColors = ["#2563eb", "#059669", "#d97706", "#7c3aed"];

export const SeekerDashboard = ({ user, activeTab, onTabChange }: SeekerDashboardProps) => {
  const [showForm, setShowForm] = useState(false);
  const [showReferrerPopup, setShowReferrerPopup] = useState(false);
  const [selectedJob, setSelectedJob] = useState<{ id: string; role: string; experience: number } | null>(null);
  const [allJobs, setAllJobs] = useState<SeekerJob[]>([]);
  const { fetchReferralRequests, referralRequests } = useReferralStore();

  useEffect(() => { fetchReferralRequests(user.id); }, [user.id, fetchReferralRequests]);

  const fetchJobs = useCallback(async () => {
    const { data, error } = await supabase
      .from("job_requirements").select("*")
      .eq("userId", user.id).eq("type", "seeker");
    if (!error && data) setAllJobs(data as unknown as SeekerJob[]);
  }, [user.id]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const myReferralRequests = referralRequests.filter((req) => req.seeker_id === user.id);
  const pendingRequests = myReferralRequests.filter((req) => req.status === "pending" || req.status === "scheduled").length;
  const scoredRequests = myReferralRequests.filter((req) => req.status === "scored").length;
  const totalRequests = pendingRequests + scoredRequests;

  if (showForm) {
    return (
      <div style={{ animation: "fadeUp 0.4s var(--ease-out) both" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.04em", color: "var(--ink)" }}>Post a Requirement</h2>
          <button onClick={() => setShowForm(false)} style={ghostBtnStyle}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            Close
          </button>
        </div>
        <JobRequirementForm user={user} type="seeker" onClose={() => { setShowForm(false); fetchJobs(); }} />
      </div>
    );
  }

  // Tests tab
  if (activeTab === "tests") {
    return <TestSuite userId={user.id} />;
  }

  // Overview tab
  if (activeTab === "overview") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Hero banner */}
        <HeroBanner
          role="seeker"
          name={user.name?.split(" ")[0] || "there"}
          subtitle="Track your applications, build karma with peer reviews, and stay visible to top recruiters."
          action={<button onClick={() => setShowForm(true)} style={heroBtnStyle}><Plus size={16} /> Post a requirement</button>}
        />

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
          {[
            { label: "Requirements", value: allJobs.length, icon: Briefcase, color: statColors[0] },
            { label: "Referral requests", value: totalRequests, icon: Send, color: statColors[1] },
            { label: "Pending reviews", value: pendingRequests, icon: Clock, color: statColors[2] },
            { label: "Completed", value: scoredRequests, icon: Star, color: statColors[3] },
          ].map((s, i) => (
            <StatCard key={i} {...s} delay={i * 0.08} />
          ))}
        </div>

        {/* Strength Score */}
        <StrengthScore user={user} />
      </div>
    );
  }

  // Jobs tab
  if (activeTab === "jobs") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.03em", color: "var(--ink)" }}>My Requirements</h2>
          <button onClick={() => setShowForm(true)} style={primaryBtnStyle}><Plus size={14} /> Post requirement</button>
        </div>
        {allJobs.length === 0 ? (
          <EmptyState icon={<Briefcase size={40} color="var(--ink-4)" />} title="No requirements yet" body="Post your first requirement to start collecting karma scores." action={<button onClick={() => setShowForm(true)} style={primaryBtnStyle}><Plus size={14} /> Post requirement</button>} />
        ) : allJobs.map((job, i) => (
          <div key={job.id} className="surface-card" style={{ padding: 20, animationDelay: `${i * 0.06}s` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)", letterSpacing: "-0.02em" }}>{roleLabel(job.role)}</div>
                <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 3 }}>
                  Posted {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : "recently"}
                </div>
              </div>
              <span style={badgeStyle}>{job.yearsOfExperience} yrs exp</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 14 }}>
              {[["Current CTC", fmtCurrency(job.currentCtc)], ["Expected CTC", fmtCurrency(job.expectedCtc)], ["Notice Period", job.noticePeriod ? `${job.noticePeriod} days` : "—"]].map(([l, v]) => (
                <div key={l}>
                  <div style={{ fontSize: 11, color: "var(--ink-4)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 2 }}>{l}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>{v}</div>
                </div>
              ))}
            </div>
            <button
              onClick={() => { setSelectedJob({ id: job.id, role: job.role, experience: job.yearsOfExperience }); setShowReferrerPopup(true); }}
              style={secondaryBtnStyle}
            >
              <CalendarCheck size={12} /> Book an interview
            </button>
          </div>
        ))}
        {showReferrerPopup && selectedJob && (
          <BookInterviewModal
            isOpen={showReferrerPopup}
            onClose={() => { setShowReferrerPopup(false); setSelectedJob(null); }}
            jobRequirementId={selectedJob.id}
            jobRole={selectedJob.role}
            jobExperience={selectedJob.experience}
            seekerId={user.id}
            onBooked={() => { setShowReferrerPopup(false); setSelectedJob(null); fetchReferralRequests(user.id); }}
          />
        )}
      </div>
    );
  }

  // Requests tab
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.03em", color: "var(--ink)" }}>Referral Requests</h2>
      {myReferralRequests.length === 0 ? (
        <EmptyState icon={<Send size={40} color="var(--ink-4)" />} title="No requests yet" body="Post a requirement and book an interview to see them here." />
      ) : myReferralRequests.map((r, i) => (
        <div key={r.id} className="surface-card" style={{ padding: "14px 18px", animationDelay: `${i * 0.07}s` }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>{roleLabel(r.job_role)}</div>
              <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 3 }}>
                Sent {new Date(r.created_at ?? Date.now()).toLocaleDateString()} · {r.seeker_experience_years} years exp
              </div>
              {r.interview_at && (
                <div style={{ fontSize: 13, color: "var(--seeker)", marginTop: 6, fontWeight: 500, display: "flex", alignItems: "center", gap: 5 }}>
                  <CalendarCheck size={12} />
                  Interview: {new Date(r.interview_at).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })} · {new Date(r.interview_at).toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit", hour12: true }).toUpperCase()}
                </div>
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
              <StatusBadge status={r.status} />
              {r.meet_link && (
                <a
                  href={r.meet_link}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    background: "var(--seeker)", color: "white",
                    borderRadius: 8, padding: "0 12px", height: 28,
                    fontSize: 12, fontWeight: 600, textDecoration: "none",
                  }}
                >
                  <Video size={11} /> Join meeting
                </a>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

/* ── Shared sub-components ── */

const HeroBanner = ({ role, name, subtitle, action }: { role: "seeker" | "recruiter" | "referrer"; name: string; subtitle: string; action?: React.ReactNode }) => {
  const grads = {
    seeker: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)",
    recruiter: "linear-gradient(135deg, #064e3b 0%, #059669 100%)",
    referrer: "linear-gradient(135deg, #3b0764 0%, #7c3aed 100%)",
  };
  const labels = { seeker: "Seeker workspace", recruiter: "Recruiter workspace", referrer: "Referrer workspace" };
  return (
    <div style={{
      borderRadius: 20, padding: "28px 32px", color: "white",
      position: "relative", overflow: "hidden",
      background: grads[role],
    }}>
      <div style={{ position: "absolute", inset: 0, opacity: 0.04, backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")", backgroundSize: "cover" }} />
      <div style={{ position: "relative" }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.65, marginBottom: 6 }}>{labels[role]}</div>
        <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.04em", marginBottom: 6 }}>Welcome back, {name}.</h2>
        <p style={{ fontSize: 14, opacity: 0.8, marginBottom: 20, maxWidth: 400, lineHeight: 1.6 }}>{subtitle}</p>
        {action}
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, color, delay = 0 }: { icon: any; label: string; value: number; color: string; delay?: number }) => (
  <div className="surface-card" style={{ padding: "18px 20px", animationDelay: `${delay}s` }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
      <div style={{ fontSize: 12, color: "var(--ink-3)", fontWeight: 500, letterSpacing: "0.02em", textTransform: "uppercase" }}>{label}</div>
      <div style={{ width: 30, height: 30, borderRadius: 8, background: color + "15", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon size={14} color={color} />
      </div>
    </div>
    <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.04em", color: "var(--ink)", lineHeight: 1 }}>{value}</div>
  </div>
);

const StatusBadge = ({ status }: { status: string }) => {
  if (status === "scored") {
    return (
      <span style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        fontSize: 11, fontWeight: 600, letterSpacing: "0.02em", textTransform: "uppercase",
        padding: "3px 9px", borderRadius: 999,
        background: "#ecfdf5", color: "#059669", border: "1px solid #a7f3d0",
      }}>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6 9 17l-5-5"/></svg> Reviewed
      </span>
    );
  }
  if (status === "scheduled") {
    return (
      <span style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        fontSize: 11, fontWeight: 600, letterSpacing: "0.02em", textTransform: "uppercase",
        padding: "3px 9px", borderRadius: 999,
        background: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe",
      }}>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> Scheduled
      </span>
    );
  }
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      fontSize: 11, fontWeight: 600, letterSpacing: "0.02em", textTransform: "uppercase",
      padding: "3px 9px", borderRadius: 999,
      background: "#fffbeb", color: "#d97706", border: "1px solid #fde68a",
    }}>
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> Pending
    </span>
  );
};

const EmptyState = ({ icon, title, body, action }: { icon: React.ReactNode; title: string; body: string; action?: React.ReactNode }) => (
  <div className="surface-card" style={{ textAlign: "center", padding: "48px 24px" }}>
    <div style={{ opacity: 0.2, display: "flex", justifyContent: "center", marginBottom: 14 }}>{icon}</div>
    <div style={{ fontSize: 16, fontWeight: 600, color: "var(--ink)", marginBottom: 6 }}>{title}</div>
    <div style={{ fontSize: 14, color: "var(--ink-3)", marginBottom: action ? 16 : 0 }}>{body}</div>
    {action}
  </div>
);

/* Shared button styles */
export const heroBtnStyle: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: 8,
  background: "white", color: "#1e3a8a",
  border: "none", cursor: "pointer",
  fontSize: 15, fontWeight: 600,
  padding: "0 22px", height: 46, borderRadius: 14,
  fontFamily: "inherit",
};
export const primaryBtnStyle: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: 6,
  background: "var(--ink)", color: "white", border: "none",
  cursor: "pointer", fontSize: 13, fontWeight: 500,
  padding: "0 14px", height: 32, borderRadius: 8,
  fontFamily: "inherit",
};
export const secondaryBtnStyle: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: 6,
  background: "var(--surface-2)", color: "var(--ink)",
  border: "1px solid var(--border-med)", cursor: "pointer",
  fontSize: 13, fontWeight: 500,
  padding: "0 12px", height: 30, borderRadius: 8,
  fontFamily: "inherit",
};
export const ghostBtnStyle: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: 6,
  background: "transparent", color: "var(--ink-3)", border: "none",
  cursor: "pointer", fontSize: 13, fontWeight: 500,
  padding: "0 10px", height: 30, borderRadius: 8,
  fontFamily: "inherit",
};
export const badgeStyle: React.CSSProperties = {
  display: "inline-flex", alignItems: "center",
  fontSize: 11, fontWeight: 600, letterSpacing: "0.02em", textTransform: "uppercase",
  padding: "3px 9px", borderRadius: 999,
  background: "var(--surface-2)", color: "var(--ink-2)",
  border: "1px solid var(--border-med)",
};

export { HeroBanner, StatCard, StatusBadge, EmptyState };
