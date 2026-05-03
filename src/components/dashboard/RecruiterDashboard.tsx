import { useEffect, useState } from "react";
import { Briefcase, Calendar, Plus, TrendingUp, Users } from "lucide-react";
import { User } from "@/stores/authStore";
import { useReferralStore } from "@/stores/referralStore";
import { TopCandidates } from "./TopCandidates";
import { JobPostingForm } from "./JobPostingForm";
import { JOB_ROLES } from "@/constants/roles";
import {
  HeroBanner, StatCard, EmptyState,
  primaryBtnStyle, secondaryBtnStyle, badgeStyle, heroBtnStyle,
} from "./SeekerDashboard";

interface RecruiterDashboardProps {
  user: User;
  activeTab: string;
}

const roleLabel = (value: string) => JOB_ROLES.find((r) => r.value === value)?.label ?? value;
const fmtCrore = (n?: number | null) => {
  if (!n) return "—";
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  return `₹${n.toLocaleString()}`;
};

export const RecruiterDashboard = ({ user, activeTab }: RecruiterDashboardProps) => {
  const [showForm, setShowForm] = useState(false);
  const [showTopCandidates, setShowTopCandidates] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const { fetchJobPostings, jobPostings, updateJobPosting } = useReferralStore();

  useEffect(() => { fetchJobPostings(user.id); }, [user.id, fetchJobPostings]);

  const handleToggleStatus = async (jobId: string, current: boolean) => {
    await updateJobPosting(jobId, { is_active: !current });
  };

  if (showForm) {
    return (
      <div style={{ animation: "fadeUp 0.4s var(--ease-out) both" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.04em", color: "var(--ink)" }}>Create Job Posting</h2>
          <button onClick={() => setShowForm(false)} style={{ ...secondaryBtnStyle }}>Back to dashboard</button>
        </div>
        <JobPostingForm user={user} onClose={() => setShowForm(false)} />
      </div>
    );
  }

  if (showTopCandidates && selectedJobId) {
    return (
      <TopCandidates
        user={user}
        jobPostingId={selectedJobId}
        onClose={() => { setShowTopCandidates(false); setSelectedJobId(null); }}
      />
    );
  }

  if (activeTab === "overview") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <HeroBanner
          role="recruiter"
          name={user.name?.split(" ")[0] || "there"}
          subtitle="Find karma-verified candidates. Unlock contacts when you're truly interested."
          action={
            <button onClick={() => setShowForm(true)} style={{ ...heroBtnStyle, color: "#064e3b" }}>
              <Plus size={16} /> Create job posting
            </button>
          }
        />

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
          {[
            { label: "Job postings", value: jobPostings.length, icon: Briefcase, color: "#059669" },
            { label: "Active postings", value: jobPostings.filter((j) => j.is_active).length, icon: TrendingUp, color: "#2563eb" },
            { label: "Candidates matched", value: 0, icon: Users, color: "#7c3aed" },
            { label: "Interviews set", value: 0, icon: Calendar, color: "#d97706" },
          ].map((s, i) => <StatCard key={i} {...s} delay={i * 0.08} />)}
        </div>

        {/* Recent postings preview */}
        <div className="surface-card" style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>Recent postings</div>
            <button onClick={() => {}} style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "var(--ink-3)", fontFamily: "inherit" }}>
              View all
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </button>
          </div>
          {jobPostings.slice(0, 3).map((job, i) => (
            <div key={job.id} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "12px 0",
              borderBottom: i < Math.min(jobPostings.length, 3) - 1 ? "1px solid var(--border-soft)" : "none",
            }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, color: "var(--ink)" }}>{roleLabel(job.role)}</div>
                <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>
                  {job.years_of_experience}+ years · {job.salary_min ? `${fmtCrore(job.salary_min)}–${fmtCrore(job.salary_max)}` : "—"}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{
                  ...badgeStyle,
                  background: job.is_active ? "#ecfdf5" : "var(--surface-2)",
                  color: job.is_active ? "#059669" : "var(--ink-3)",
                  borderColor: job.is_active ? "#a7f3d0" : "var(--border-med)",
                }}>
                  {job.is_active ? "Active" : "Paused"}
                </span>
                <button
                  onClick={() => { setSelectedJobId(job.id); setShowTopCandidates(true); }}
                  style={primaryBtnStyle}
                >
                  <Users size={12} /> Top 3
                </button>
              </div>
            </div>
          ))}
          {jobPostings.length === 0 && (
            <div style={{ textAlign: "center", padding: "20px 0", color: "var(--ink-4)", fontSize: 14 }}>
              No postings yet
            </div>
          )}
        </div>
      </div>
    );
  }

  // Postings tab
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.03em", color: "var(--ink)" }}>Job Postings</h2>
        <button onClick={() => setShowForm(true)} style={primaryBtnStyle}><Plus size={14} /> Create posting</button>
      </div>

      {jobPostings.length === 0 ? (
        <EmptyState
          icon={<Briefcase size={40} color="var(--ink-4)" />}
          title="No postings yet"
          body="Create your first posting to start matching with karma-verified talent."
          action={<button onClick={() => setShowForm(true)} style={primaryBtnStyle}><Plus size={14} /> Create posting</button>}
        />
      ) : jobPostings.map((job, i) => (
        <div key={job.id} className="surface-card" style={{ padding: 20, animationDelay: `${i * 0.06}s` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)", letterSpacing: "-0.02em" }}>{roleLabel(job.role)}</div>
              <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 3 }}>
                Posted {job.created_at ? new Date(job.created_at).toLocaleDateString() : "recently"}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <span style={badgeStyle}>{job.years_of_experience}+ yrs</span>
              <span style={{
                ...badgeStyle,
                background: job.is_active ? "#ecfdf5" : "var(--surface-2)",
                color: job.is_active ? "#059669" : "var(--ink-3)",
                borderColor: job.is_active ? "#a7f3d0" : "var(--border-med)",
              }}>
                {job.is_active ? "Active" : "Paused"}
              </span>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
            {[
              ["Salary range", `${fmtCrore(job.salary_min)}–${fmtCrore(job.salary_max)}`],
              ["Status", job.is_active ? "Accepting candidates" : "Paused"],
            ].map(([l, v]) => (
              <div key={l}>
                <div style={{ fontSize: 11, color: "var(--ink-4)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 2 }}>{l}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: job.is_active && l === "Status" ? "var(--recruiter)" : "var(--ink)" }}>{v}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => { setSelectedJobId(job.id); setShowTopCandidates(true); }}
              style={primaryBtnStyle}
            >
              <Users size={12} /> Find top 3
            </button>
            <button
              onClick={() => handleToggleStatus(job.id, job.is_active)}
              style={secondaryBtnStyle}
            >
              {job.is_active ? "Pause" : "Activate"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
