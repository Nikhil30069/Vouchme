import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Briefcase,
  Calendar,
  Plus,
  Search,
  TrendingUp,
  Users,
} from "lucide-react";
import { User } from "@/stores/authStore";
import { useReferralStore } from "@/stores/referralStore";
import { TopCandidates } from "./TopCandidates";
import { JobPostingForm } from "./JobPostingForm";
import { JOB_ROLES } from "@/constants/roles";

interface RecruiterDashboardProps {
  user: User;
}

const roleLabel = (value: string) =>
  JOB_ROLES.find((r) => r.value === value)?.label ?? value;

export const RecruiterDashboard = ({ user }: RecruiterDashboardProps) => {
  const [showJobPostingForm, setShowJobPostingForm] = useState(false);
  const [showTopCandidates, setShowTopCandidates] = useState(false);
  const [selectedJobPostingId, setSelectedJobPostingId] = useState<string | null>(null);
  const { fetchJobPostings, jobPostings, updateJobPosting } = useReferralStore();

  useEffect(() => {
    fetchJobPostings(user.id);
  }, [user.id, fetchJobPostings]);

  const handleToggleJobStatus = async (jobId: string, currentStatus: boolean) => {
    try {
      await updateJobPosting(jobId, { is_active: !currentStatus });
    } catch (error) {
      console.error("Failed to toggle job status:", error);
    }
  };

  if (showJobPostingForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold tracking-tight">
            Create job posting
          </h1>
          <Button
            variant="outline"
            onClick={() => setShowJobPostingForm(false)}
            className="rounded-xl"
          >
            Back to dashboard
          </Button>
        </div>
        <JobPostingForm user={user} onClose={() => setShowJobPostingForm(false)} />
      </div>
    );
  }

  if (showTopCandidates && selectedJobPostingId) {
    return (
      <TopCandidates
        user={user}
        jobPostingId={selectedJobPostingId}
        onClose={() => {
          setShowTopCandidates(false);
          setSelectedJobPostingId(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-8">
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-green-600 p-8 text-white shadow-soft"
      >
        <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-emerald-300/20 blur-3xl" />
        <div className="relative">
          <div className="text-xs font-medium uppercase tracking-wider text-white/70">
            Recruiter workspace
          </div>
          <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight md:text-4xl">
            Welcome back, {user.name?.split(" ")[0] || "there"}.
          </h1>
          <p className="mt-2 max-w-xl text-white/85">
            Find karma-verified candidates, post openings and unlock contacts only when
            you're truly interested.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              onClick={() => setShowJobPostingForm(true)}
              className="h-11 rounded-xl bg-white px-5 text-emerald-700 hover:bg-emerald-50"
            >
              <Plus className="mr-2 h-4 w-4" /> Create job posting
            </Button>
          </div>
        </div>
      </motion.section>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <StatCard
          icon={Briefcase}
          label="Job postings"
          value={jobPostings.length}
          tone="emerald"
        />
        <StatCard
          icon={TrendingUp}
          label="Active postings"
          value={jobPostings.filter((j) => j.is_active).length}
          tone="blue"
        />
        <StatCard icon={Users} label="Candidates surfaced" value={0} tone="purple" />
        <StatCard
          icon={Calendar}
          label="Interviews scheduled"
          value={0}
          tone="amber"
        />
      </div>

      <Card className="rounded-2xl border-slate-200/70 bg-white shadow-sm">
        <CardHeader>
          <CardTitle>Your job postings</CardTitle>
          <CardDescription>
            Discover the top three candidates for each role, ranked by karma.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {jobPostings.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center">
              <Briefcase className="mx-auto h-10 w-10 text-slate-400" />
              <h3 className="mt-3 font-display text-lg font-semibold text-slate-900">
                No postings yet
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Create your first posting to start matching with karma-verified talent.
              </p>
              <Button
                onClick={() => setShowJobPostingForm(true)}
                className="mt-4 rounded-xl bg-slate-900 text-white hover:bg-slate-800"
              >
                <Plus className="mr-2 h-4 w-4" /> Create posting
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {jobPostings.map((job) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-slate-200/70 bg-white p-4 transition hover:shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-slate-900">
                        {roleLabel(job.role)}
                      </div>
                      <div className="text-xs text-slate-500">
                        Posted{" "}
                        {job.created_at
                          ? new Date(job.created_at).toLocaleDateString()
                          : "recently"}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="border-slate-200">
                        {job.years_of_experience}+ years
                      </Badge>
                      <Badge
                        className={
                          job.is_active
                            ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-100"
                        }
                      >
                        {job.is_active ? "Active" : "Paused"}
                      </Badge>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-600 md:grid-cols-3">
                    <Stat
                      label="Salary range"
                      value={
                        job.salary_min && job.salary_max
                          ? `₹${job.salary_min.toLocaleString()} – ₹${job.salary_max.toLocaleString()}`
                          : "—"
                      }
                    />
                    <Stat
                      label="Requirements"
                      value={`${job.requirements?.length ?? 0} items`}
                    />
                    <Stat label="Status" value={job.is_active ? "Active" : "Paused"} />
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <Button
                      onClick={() => {
                        setSelectedJobPostingId(job.id);
                        setShowTopCandidates(true);
                      }}
                      size="sm"
                      className="rounded-lg bg-slate-900 text-white hover:bg-slate-800"
                    >
                      <Search className="mr-2 h-4 w-4" /> Find top 3
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleJobStatus(job.id, job.is_active)}
                      className="rounded-lg"
                    >
                      {job.is_active ? "Pause" : "Activate"}
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div>
    <div className="text-xs uppercase tracking-wide text-slate-400">{label}</div>
    <div className="text-sm font-semibold text-slate-900">{value}</div>
  </div>
);

const toneClasses: Record<string, { bg: string; text: string; ring: string }> = {
  blue: { bg: "bg-blue-50", text: "text-blue-600", ring: "ring-blue-100" },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-600", ring: "ring-emerald-100" },
  amber: { bg: "bg-amber-50", text: "text-amber-600", ring: "ring-amber-100" },
  purple: { bg: "bg-purple-50", text: "text-purple-600", ring: "ring-purple-100" },
};

const StatCard = ({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Briefcase;
  label: string;
  value: number;
  tone: keyof typeof toneClasses;
}) => {
  const t = toneClasses[tone];
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm"
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-medium uppercase tracking-wider text-slate-500">
            {label}
          </div>
          <div className="mt-1 font-display text-2xl font-bold text-slate-900">
            {value}
          </div>
        </div>
        <div
          className={`grid h-10 w-10 place-items-center rounded-xl ${t.bg} ${t.text} ring-4 ${t.ring}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </motion.div>
  );
};
