import { useCallback, useEffect, useState } from "react";
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
  Clock,
  Plus,
  Send,
  Star,
  Users,
} from "lucide-react";
import { User } from "@/stores/authStore";
import { useReferralStore } from "@/stores/referralStore";
import { JobRequirementForm } from "./JobRequirementForm";
import { StrengthScore } from "./StrengthScore";
import { ReferrerSelectionPopup } from "./ReferrerSelectionPopup";
import { supabase } from "@/integrations/supabase/client";
import { JOB_ROLES } from "@/constants/roles";

interface SeekerDashboardProps {
  user: User;
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

const roleLabel = (value: string) =>
  JOB_ROLES.find((r) => r.value === value)?.label ?? value;

export const SeekerDashboard = ({ user }: SeekerDashboardProps) => {
  const [showForm, setShowForm] = useState(false);
  const [showReferrerPopup, setShowReferrerPopup] = useState(false);
  const [selectedJob, setSelectedJob] = useState<{
    id: string;
    role: string;
    experience: number;
  } | null>(null);
  const [allJobs, setAllJobs] = useState<SeekerJob[]>([]);
  const { fetchReferralRequests, referralRequests } = useReferralStore();

  useEffect(() => {
    fetchReferralRequests(user.id);
  }, [user.id, fetchReferralRequests]);

  const fetchJobs = useCallback(async () => {
    const { data, error } = await supabase
      .from("job_requirements")
      .select("*")
      .eq("userId", user.id)
      .eq("type", "seeker");
    if (!error && data) setAllJobs(data as unknown as SeekerJob[]);
  }, [user.id]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const myReferralRequests = referralRequests.filter(
    (req) => req.seeker_id === user.id
  );
  const pendingRequests = myReferralRequests.filter(
    (req) => req.status === "pending"
  ).length;
  const scoredRequests = myReferralRequests.filter(
    (req) => req.status === "scored"
  ).length;
  const totalRequests = pendingRequests + scoredRequests;

  if (showForm) {
    return (
      <JobRequirementForm
        user={user}
        type="seeker"
        onClose={() => {
          setShowForm(false);
          fetchJobs();
        }}
      />
    );
  }

  return (
    <div className="space-y-8">
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-8 text-white shadow-soft"
      >
        <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-fuchsia-300/20 blur-3xl" />
        <div className="relative">
          <div className="text-xs font-medium uppercase tracking-wider text-white/70">
            Seeker workspace
          </div>
          <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight md:text-4xl">
            Welcome back, {user.name?.split(" ")[0] || "there"}.
          </h1>
          <p className="mt-2 max-w-xl text-white/85">
            Track your applications, build your karma score with peer reviews, and stay
            visible to top recruiters.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              onClick={() => setShowForm(true)}
              className="h-11 rounded-xl bg-white px-5 text-blue-700 hover:bg-blue-50"
            >
              <Plus className="mr-2 h-4 w-4" /> Post a requirement
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                if (allJobs[0]) {
                  setSelectedJob({
                    id: allJobs[0].id,
                    role: allJobs[0].role,
                    experience: allJobs[0].yearsOfExperience,
                  });
                  setShowReferrerPopup(true);
                }
              }}
              disabled={allJobs.length === 0}
              className="h-11 rounded-xl border-white/40 bg-white/10 text-white hover:bg-white/20"
            >
              <Send className="mr-2 h-4 w-4" /> Request a review
            </Button>
          </div>
        </div>
      </motion.section>

      <StrengthScore user={user} />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <StatCard
          icon={Briefcase}
          label="Active requirements"
          value={allJobs.length}
          tone="blue"
        />
        <StatCard
          icon={Send}
          label="Referral requests"
          value={totalRequests}
          tone="emerald"
        />
        <StatCard
          icon={Clock}
          label="Pending reviews"
          value={pendingRequests}
          tone="amber"
        />
        <StatCard
          icon={Star}
          label="Reviews completed"
          value={scoredRequests}
          tone="purple"
        />
      </div>

      {totalRequests > 0 && (
        <Card className="rounded-2xl border-slate-200/70 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-brand-600" />
              Referral requests
            </CardTitle>
            <CardDescription>
              Track requests you've sent and their current status.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {myReferralRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex flex-col gap-3 rounded-2xl border border-slate-200/70 bg-slate-50/50 p-4 transition hover:bg-white sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="text-sm font-semibold text-slate-900">
                      {roleLabel(request.job_role)}
                    </div>
                    <div className="text-xs text-slate-500">
                      Sent on{" "}
                      {new Date(request.created_at ?? Date.now()).toLocaleDateString()} •{" "}
                      {request.seeker_experience_years} years exp
                    </div>
                  </div>
                  <Badge
                    className={
                      request.status === "scored"
                        ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                        : "bg-amber-100 text-amber-700 hover:bg-amber-100"
                    }
                  >
                    {request.status === "scored" ? "Reviewed" : "Pending review"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="rounded-2xl border-slate-200/70 bg-white shadow-sm">
        <CardHeader>
          <CardTitle>Your job requirements</CardTitle>
          <CardDescription>
            Each requirement is a snapshot of what you're looking for and your current
            profile.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {allJobs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center">
              <Briefcase className="mx-auto h-10 w-10 text-slate-400" />
              <h3 className="mt-3 font-display text-lg font-semibold text-slate-900">
                No requirements yet
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Post your first requirement to start collecting karma scores.
              </p>
              <Button
                onClick={() => setShowForm(true)}
                className="mt-4 rounded-xl bg-slate-900 text-white hover:bg-slate-800"
              >
                <Plus className="mr-2 h-4 w-4" /> Post requirement
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {allJobs.map((job) => (
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
                        {job.createdAt
                          ? new Date(job.createdAt).toLocaleDateString()
                          : "recently"}
                      </div>
                    </div>
                    <Badge variant="outline" className="border-slate-200">
                      {job.yearsOfExperience} years exp
                    </Badge>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-600 md:grid-cols-3">
                    <Stat label="Current CTC" value={fmtCurrency(job.currentCtc)} />
                    <Stat label="Expected CTC" value={fmtCurrency(job.expectedCtc)} />
                    <Stat
                      label="Notice period"
                      value={job.noticePeriod ? `${job.noticePeriod} days` : "—"}
                    />
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Button
                      onClick={() => {
                        setSelectedJob({
                          id: job.id,
                          role: job.role,
                          experience: job.yearsOfExperience,
                        });
                        setShowReferrerPopup(true);
                      }}
                      size="sm"
                      className="rounded-lg bg-slate-900 text-white hover:bg-slate-800"
                    >
                      <Send className="mr-2 h-4 w-4" /> Request referral
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {showReferrerPopup && selectedJob && (
        <ReferrerSelectionPopup
          isOpen={showReferrerPopup}
          onClose={() => {
            setShowReferrerPopup(false);
            setSelectedJob(null);
          }}
          jobRequirementId={selectedJob.id}
          jobRole={selectedJob.role}
          jobExperience={selectedJob.experience}
        />
      )}
    </div>
  );
};

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div>
    <div className="text-xs uppercase tracking-wide text-slate-400">{label}</div>
    <div className="text-sm font-semibold text-slate-900">{value}</div>
  </div>
);

const fmtCurrency = (n?: number | null) =>
  typeof n === "number" && Number.isFinite(n) ? `₹${n.toLocaleString()}` : "—";

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
