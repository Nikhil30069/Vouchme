import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Award,
  CheckCircle,
  Clock,
  FileText,
  Star,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { User } from "@/stores/authStore";
import { useReferralStore } from "@/stores/referralStore";
import { JOB_ROLES } from "@/constants/roles";
import { toast } from "sonner";

interface ReferrerDashboardProps {
  user: User;
}

const roleLabel = (value: string) =>
  JOB_ROLES.find((r) => r.value === value)?.label ?? value;

export const ReferrerDashboard = ({ user }: ReferrerDashboardProps) => {
  const {
    fetchReferralRequests,
    fetchScoringParameters,
    createScore,
    referralRequests,
    scoringParameters,
  } = useReferralStore();

  const [scores, setScores] = useState<Record<string, Record<string, number | "">>>({});
  const [comments, setComments] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchReferralRequests(user.id);
    fetchScoringParameters();
  }, [user.id, fetchReferralRequests, fetchScoringParameters]);

  const myRequests = useMemo(
    () => referralRequests.filter((r) => r.referrer_id === user.id),
    [referralRequests, user.id]
  );
  const pending = myRequests.filter((r) => r.status === "pending");
  const scored = myRequests.filter((r) => r.status === "scored");

  const workExperience =
    typeof user.workExperience === "object" && user.workExperience !== null
      ? (user.workExperience as Record<string, unknown>)
      : null;
  const workRole = workExperience?.role as string | undefined;
  const workYears = workExperience?.years as number | undefined;
  const workOrg = workExperience?.organization as string | undefined;

  const handleScoreChange = (
    requestId: string,
    parameterId: string,
    value: number | ""
  ) => {
    if (value !== "" && (value < 0 || value > 10)) return;
    setScores((prev) => ({
      ...prev,
      [requestId]: { ...prev[requestId], [parameterId]: value },
    }));
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
      const promises = Object.entries(reqScores).map(([parameterId, score]) => {
        if (typeof score !== "number") throw new Error("Invalid score");
        return createScore({
          referral_request_id: requestId,
          referrer_id: user.id,
          seeker_id: request.seeker_id,
          parameter_id: parameterId,
          score,
          comments: comments[requestId] || undefined,
        });
      });
      await Promise.all(promises);
      toast.success("Scores submitted!");
      setScores((prev) => {
        const next = { ...prev };
        delete next[requestId];
        return next;
      });
      setComments((prev) => {
        const next = { ...prev };
        delete next[requestId];
        return next;
      });
      await fetchReferralRequests(user.id);
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit scores. Try again.");
    } finally {
      setSubmitting((s) => {
        const next = new Set(s);
        next.delete(requestId);
        return next;
      });
    }
  };

  return (
    <div className="space-y-8">
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-fuchsia-600 via-purple-600 to-violet-600 p-8 text-white shadow-soft"
      >
        <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-fuchsia-300/20 blur-3xl" />
        <div className="relative">
          <div className="text-xs font-medium uppercase tracking-wider text-white/70">
            Referrer workspace
          </div>
          <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight md:text-4xl">
            Welcome back, {user.name?.split(" ")[0] || "there"}.
          </h1>
          <p className="mt-2 max-w-xl text-white/85">
            Your honest feedback shapes the karma score. Every review nudges this
            ecosystem closer to fair, transparent hiring.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-white/85">
            {workRole && (
              <Pill label="Role" value={roleLabel(workRole)} />
            )}
            {typeof workYears === "number" && (
              <Pill label="Experience" value={`${workYears} years`} />
            )}
            {workOrg && <Pill label="Organization" value={workOrg} />}
          </div>
        </div>
      </motion.section>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard icon={Users} label="Pending reviews" value={pending.length} tone="amber" />
        <StatCard icon={Award} label="Reviews completed" value={scored.length} tone="emerald" />
        <StatCard icon={Star} label="Total requests" value={myRequests.length} tone="purple" />
      </div>

      <Card className="rounded-2xl border-slate-200/70 bg-white shadow-sm">
        <CardHeader>
          <CardTitle>Referral requests</CardTitle>
          <CardDescription>
            Review profiles and score them on technical strength and cultural fit.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {myRequests.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center">
              <FileText className="mx-auto h-10 w-10 text-slate-400" />
              <h3 className="mt-3 font-display text-lg font-semibold text-slate-900">
                Nothing to review yet
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Requests from candidates with the right experience match will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {myRequests.map((request) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-2xl border p-5 transition ${
                    request.status === "scored"
                      ? "border-emerald-100 bg-emerald-50/50"
                      : "border-slate-200 bg-white hover:shadow-sm"
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-display text-lg font-semibold text-slate-900">
                          {roleLabel(request.job_role)}
                        </h3>
                        <Badge variant="outline" className="border-slate-200">
                          {request.seeker_experience_years} years exp
                        </Badge>
                        <Badge
                          className={
                            request.status === "scored"
                              ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                              : "bg-amber-100 text-amber-700 hover:bg-amber-100"
                          }
                        >
                          {request.status === "scored" ? (
                            <span className="flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" /> Reviewed
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" /> Pending
                            </span>
                          )}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500">
                        Requested{" "}
                        {new Date(request.created_at ?? Date.now()).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {request.status === "pending" && (
                    <div className="mt-5 space-y-5">
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                            <FileText className="h-4 w-4" /> Candidate resume
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              (request as any).resume_url &&
                              window.open((request as any).resume_url, "_blank")
                            }
                            disabled={!(request as any).resume_url}
                            className="rounded-lg"
                          >
                            {(request as any).resume_url ? "View resume" : "No resume"}
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {scoringParameters.map((parameter) => {
                          const value = scores[request.id]?.[parameter.id] ?? "";
                          return (
                            <div key={parameter.id} className="space-y-2">
                              <Label htmlFor={`score-${request.id}-${parameter.id}`}>
                                {parameter.name}{" "}
                                <span className="text-slate-400">(0-10)</span>
                              </Label>
                              <Input
                                id={`score-${request.id}-${parameter.id}`}
                                type="number"
                                min={0}
                                max={10}
                                value={value}
                                onChange={(e) =>
                                  handleScoreChange(
                                    request.id,
                                    parameter.id,
                                    e.target.value === ""
                                      ? ""
                                      : parseInt(e.target.value)
                                  )
                                }
                                placeholder="0-10"
                                className="h-10"
                              />
                              {parameter.description && (
                                <p className="text-xs text-slate-500">
                                  {parameter.description}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`comment-${request.id}`}>
                          Comments (optional)
                        </Label>
                        <Textarea
                          id={`comment-${request.id}`}
                          value={comments[request.id] ?? ""}
                          onChange={(e) =>
                            setComments((prev) => ({
                              ...prev,
                              [request.id]: e.target.value,
                            }))
                          }
                          placeholder="Share what makes this candidate stand out…"
                          rows={3}
                        />
                      </div>

                      <Button
                        onClick={() => handleSubmit(request.id)}
                        disabled={submitting.has(request.id)}
                        className="rounded-xl bg-slate-900 text-white hover:bg-slate-800"
                      >
                        <Star className="mr-2 h-4 w-4" />
                        {submitting.has(request.id) ? "Submitting…" : "Submit scores"}
                      </Button>
                    </div>
                  )}

                  {request.status === "scored" && (
                    <div className="mt-4 flex items-center gap-2 text-sm text-emerald-700">
                      <CheckCircle className="h-4 w-4" /> Scores submitted. Thanks for
                      contributing!
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const Pill = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-full bg-white/15 px-3 py-1 backdrop-blur">
    <span className="text-xs font-medium uppercase tracking-wider text-white/70">
      {label}
    </span>{" "}
    <span className="text-sm font-semibold">{value}</span>
  </div>
);

const toneClasses: Record<string, { bg: string; text: string; ring: string }> = {
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
  icon: typeof Users;
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
