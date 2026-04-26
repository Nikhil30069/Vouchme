import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, LogOut, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuthStore, type AppRole } from "@/stores/authStore";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ROLE_CONFIG, ROLE_ORDER } from "@/constants/appRoles";
import { JOB_ROLES } from "@/constants/roles";

export const Onboarding = () => {
  const { user, refreshProfile, setActiveRole, signOut } = useAuthStore();
  const { toast } = useToast();
  const [step, setStep] = useState<0 | 1>(0);
  const [selected, setSelected] = useState<AppRole[]>(user?.roles ?? []);
  const [submitting, setSubmitting] = useState(false);

  const [refRole, setRefRole] = useState<string>(JOB_ROLES[0].value);
  const [refYears, setRefYears] = useState<number>(2);
  const [refOrg, setRefOrg] = useState<string>("");

  const needsReferrerDetails = selected.includes("referrer");

  const toggleRole = (role: AppRole) => {
    setSelected((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const greeting = useMemo(() => {
    if (!user?.name) return "Welcome";
    return `Hi, ${user.name.split(" ")[0]}`;
  }, [user?.name]);

  const handleNext = () => {
    if (selected.length === 0) {
      toast({
        title: "Pick at least one role",
        description: "You can always switch or add more later.",
        variant: "destructive",
      });
      return;
    }
    if (needsReferrerDetails) {
      setStep(1);
    } else {
      void handleSubmit(selected);
    }
  };

  const handleSubmit = async (roles: AppRole[]) => {
    if (!user) return;
    if (roles.includes("referrer")) {
      if (!refRole || refYears < 2 || !refOrg.trim()) {
        toast({
          title: "Tell us about your experience",
          description: "Referrers need at least 2 years and a current organization.",
          variant: "destructive",
        });
        return;
      }
    }

    setSubmitting(true);
    try {
      const update: Record<string, unknown> = {
        roles,
        onboarded: true,
        updated_at: new Date().toISOString(),
      };

      if (roles.includes("referrer")) {
        update["workExperience"] = {
          role: refRole,
          years: refYears,
          organization: refOrg.trim(),
        };
        update["current_organization"] = refOrg.trim();
        update["total_experience_years"] = refYears;
      }

      const { error } = await supabase
        .from("profiles")
        .update(update)
        .eq("id", user.id);

      if (error) throw error;
      await refreshProfile();
      if (roles.length === 1) setActiveRole(roles[0]);
      toast({ title: "You're all set!", description: "Pick a workspace to get started." });
    } catch (error: any) {
      toast({
        title: "Couldn't save your profile",
        description: error?.message ?? "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden auth-bg">
      <div className="pointer-events-none absolute inset-0 bg-grid-soft bg-grid-cell opacity-30" />
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-brand-300/30 blur-3xl animate-blob" />
      <div className="pointer-events-none absolute -bottom-32 -right-24 h-[28rem] w-[28rem] rounded-full bg-fuchsia-300/30 blur-3xl animate-blob [animation-delay:-6s]" />

      <header className="relative z-10 mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-fuchsia-500 text-white shadow-soft">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="text-lg font-display font-bold tracking-tight">
            Hire<span className="gradient-text">Eco</span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => signOut()}
          className="text-slate-500 hover:text-slate-900"
        >
          <LogOut className="mr-2 h-4 w-4" /> Sign out
        </Button>
      </header>

      <main className="relative z-10 mx-auto max-w-5xl px-6 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="surface-card p-8 md:p-10"
        >
          <div className="text-sm font-medium text-brand-700">{greeting} 👋</div>
          <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
            How would you like to use HireEco?
          </h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            Pick one or more roles. You can switch between them anytime — like flipping
            between Gmail accounts.
          </p>

          <AnimatePresence mode="wait">
            {step === 0 ? (
              <motion.div
                key="step-roles"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35 }}
              >
                <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
                  {ROLE_ORDER.map((role) => {
                    const cfg = ROLE_CONFIG[role];
                    const Icon = cfg.icon;
                    const active = selected.includes(role);
                    return (
                      <motion.button
                        key={role}
                        type="button"
                        whileHover={{ y: -3 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => toggleRole(role)}
                        className={`relative overflow-hidden rounded-2xl border p-5 text-left transition-all ${
                          active
                            ? "border-transparent bg-white shadow-soft ring-2 ring-brand-300"
                            : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                      >
                        <div
                          className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${cfg.gradient}`}
                        />
                        <div className="flex items-center justify-between">
                          <div
                            className={`grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br ${cfg.gradient} text-white shadow-sm`}
                          >
                            <Icon className="h-5 w-5" />
                          </div>
                          <div
                            className={`grid h-6 w-6 place-items-center rounded-full border ${
                              active
                                ? "border-brand-500 bg-brand-500 text-white"
                                : "border-slate-300 text-transparent"
                            }`}
                          >
                            <Check className="h-3.5 w-3.5" />
                          </div>
                        </div>
                        <div className="mt-4 font-display text-lg font-semibold text-slate-900">
                          {cfg.label}
                        </div>
                        <p className="mt-1 text-sm text-slate-600">{cfg.description}</p>
                        <ul className="mt-4 space-y-1.5 text-xs text-slate-600">
                          {cfg.highlights.map((h) => (
                            <li key={h} className="flex items-center gap-2">
                              <Check className="h-3.5 w-3.5 text-emerald-500" />
                              {h}
                            </li>
                          ))}
                        </ul>
                      </motion.button>
                    );
                  })}
                </div>

                <div className="mt-8 flex items-center justify-between">
                  <div className="text-sm text-slate-500">
                    {selected.length} role{selected.length === 1 ? "" : "s"} selected
                  </div>
                  <Button
                    onClick={handleNext}
                    disabled={selected.length === 0 || submitting}
                    size="lg"
                    className="h-11 gap-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800"
                  >
                    {submitting ? "Saving..." : "Continue"}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="step-referrer"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35 }}
                className="mt-8"
              >
                <div className="rounded-2xl border border-purple-100 bg-purple-50/60 p-5">
                  <h3 className="font-display text-lg font-semibold text-purple-900">
                    Referrer credentials
                  </h3>
                  <p className="text-sm text-purple-800/80">
                    To keep our karma score trustworthy, referrers need at least 2 years
                    of experience.
                  </p>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="ref-role">Primary role</Label>
                    <Select value={refRole} onValueChange={setRefRole}>
                      <SelectTrigger id="ref-role" className="h-11">
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        {JOB_ROLES.map((r) => (
                          <SelectItem key={r.value} value={r.value}>
                            {r.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ref-years">Years of experience</Label>
                    <Input
                      id="ref-years"
                      type="number"
                      min={2}
                      max={50}
                      value={refYears}
                      onChange={(e) => setRefYears(parseInt(e.target.value) || 0)}
                      className="h-11"
                    />
                    <p className="text-xs text-slate-500">Minimum 2 years required.</p>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="ref-org">Current organization</Label>
                    <Input
                      id="ref-org"
                      type="text"
                      value={refOrg}
                      onChange={(e) => setRefOrg(e.target.value)}
                      placeholder="e.g. Stripe"
                      className="h-11"
                    />
                  </div>
                </div>

                <div className="mt-8 flex items-center justify-between">
                  <Button
                    variant="ghost"
                    onClick={() => setStep(0)}
                    className="text-slate-600 hover:text-slate-900"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                  <Button
                    onClick={() => handleSubmit(selected)}
                    disabled={submitting}
                    size="lg"
                    className="h-11 gap-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800"
                  >
                    {submitting ? "Saving..." : "Finish setup"}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>
    </div>
  );
};
