import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, LogOut } from "lucide-react";
import { useAuthStore, type AppRole } from "@/stores/authStore";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { JOB_ROLES } from "@/constants/roles";

const LogoMark = () => (
  <div style={{
    width: 28, height: 28, borderRadius: 8,
    background: "var(--ink)", display: "flex", alignItems: "center", justifyContent: "center",
  }}>
    <svg width="14" height="14" viewBox="0 0 24 24" fill="white" stroke="none">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  </div>
);

const roleCards = [
  {
    id: "seeker" as AppRole,
    label: "Job Seeker",
    desc: "Find your next role. Get peer-vouched.",
    color: "var(--seeker)",
    bar: "linear-gradient(90deg, #2563eb, #60a5fa)",
  },
  {
    id: "recruiter" as AppRole,
    label: "Recruiter",
    desc: "Post jobs. Hire from karma-ranked talent.",
    color: "var(--recruiter)",
    bar: "linear-gradient(90deg, #059669, #34d399)",
  },
  {
    id: "referrer" as AppRole,
    label: "Referrer",
    desc: "Score peers. Shape fair hiring.",
    color: "var(--referrer)",
    bar: "linear-gradient(90deg, #7c3aed, #a78bfa)",
  },
];

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

  const toggleRole = (role: AppRole) =>
    setSelected((prev) => prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]);

  const greeting = useMemo(() => {
    if (!user?.name) return "Welcome";
    return `Welcome, ${user.name.split(" ")[0]}`;
  }, [user?.name]);

  const handleNext = () => {
    if (selected.length === 0) {
      toast({ title: "Pick at least one role", variant: "destructive" });
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
        toast({ title: "Please fill all referrer details", variant: "destructive" });
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
        update["workExperience"] = { role: refRole, years: refYears, organization: refOrg.trim() };
        update["current_organization"] = refOrg.trim();
        update["total_experience_years"] = refYears;
      }
      const { error } = await supabase.from("profiles").update(update).eq("id", user.id);
      if (error) throw error;
      await refreshProfile();
      if (roles.length === 1) setActiveRole(roles[0]);
      toast({ title: "Profile saved!" });
    } catch (error: any) {
      toast({ title: "Couldn't save profile", description: error?.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", fontFamily: "inherit", fontSize: 14, color: "var(--ink)",
    background: "var(--surface)", border: "1px solid var(--border-med)",
    borderRadius: 10, padding: "0 13px", height: 40,
    outline: "none", transition: "border-color 0.15s, box-shadow 0.15s",
    WebkitAppearance: "none",
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--surface)" }}>
      {/* Header */}
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "18px 32px", borderBottom: "1px solid var(--border-soft)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 17, fontWeight: 700, letterSpacing: "-0.04em", color: "var(--ink)" }}>
          <LogoMark />
          vouchme
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {/* Step dots */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {[0, 1].map((i) => (
              <div key={i} style={{
                height: 8, borderRadius: 999,
                background: i <= step ? "var(--ink)" : "var(--surface-3)",
                width: i === step ? 24 : 8,
                transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
              }} />
            ))}
          </div>
          <button
            onClick={() => signOut()}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "none", border: "none", cursor: "pointer",
              fontSize: 13, color: "var(--ink-3)", fontFamily: "inherit",
            }}
          >
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </nav>

      <div style={{ flex: 1, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "48px 24px" }}>
        <div style={{ width: "100%", maxWidth: 640 }}>
          {step === 0 && (
            <div className="anim-fadeup">
              <div style={{ fontSize: 13, color: "var(--ink-3)", marginBottom: 6 }}>{greeting} 👋</div>
              <h2 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.04em", marginBottom: 8, color: "var(--ink)" }}>
                How would you like to use VouchMe?
              </h2>
              <p style={{ color: "var(--ink-3)", marginBottom: 32, fontSize: 15 }}>Pick one or more roles. Switch anytime.</p>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 32 }}>
                {roleCards.map((r, i) => {
                  const active = selected.includes(r.id);
                  return (
                    <button
                      key={r.id}
                      onClick={() => toggleRole(r.id)}
                      style={{
                        position: "relative", overflow: "hidden",
                        background: "var(--surface)",
                        border: `1px solid ${active ? r.color : "var(--border-soft)"}`,
                        borderRadius: 14, padding: 22,
                        cursor: "pointer", textAlign: "left",
                        boxShadow: active ? `0 0 0 2px ${r.color}` : "none",
                        transform: "translateY(0)",
                        transition: "all 0.2s",
                        animationDelay: `${i * 0.06}s`,
                        fontFamily: "inherit",
                      }}
                    >
                      {/* Top color bar */}
                      <div style={{
                        position: "absolute", top: 0, left: 0, right: 0, height: 3,
                        background: active ? r.bar : "var(--surface-3)",
                        transition: "background 0.2s",
                      }} />
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14, marginTop: 4 }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: 8,
                          background: active ? r.color + "18" : "var(--surface-2)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={active ? r.color : "var(--ink-3)"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            {r.id === "seeker" && <><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></>}
                            {r.id === "recruiter" && <><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></>}
                            {r.id === "referrer" && <><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></>}
                          </svg>
                        </div>
                        {/* Checkbox */}
                        <div style={{
                          width: 20, height: 20, borderRadius: "50%",
                          border: `2px solid ${active ? r.color : "var(--border-med)"}`,
                          background: active ? r.color : "transparent",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          transition: "all 0.15s",
                        }}>
                          {active && <Check size={10} color="white" strokeWidth={3} />}
                        </div>
                      </div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)", marginBottom: 5, letterSpacing: "-0.02em" }}>{r.label}</div>
                      <div style={{ fontSize: 13, color: "var(--ink-3)", lineHeight: 1.5 }}>{r.desc}</div>
                    </button>
                  );
                })}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: 13, color: "var(--ink-3)" }}>
                  {selected.length} role{selected.length !== 1 ? "s" : ""} selected
                </div>
                <button
                  onClick={handleNext}
                  disabled={selected.length === 0 || submitting}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    background: "var(--ink)", color: "white", border: "none",
                    cursor: selected.length === 0 ? "not-allowed" : "pointer",
                    fontSize: 14, fontWeight: 500,
                    padding: "0 18px", height: 38, borderRadius: 10,
                    opacity: selected.length === 0 ? 0.5 : 1,
                    fontFamily: "inherit",
                  }}
                >
                  {submitting ? "Saving…" : "Continue"} <ArrowRight size={15} />
                </button>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="anim-fadeup">
              <button
                onClick={() => setStep(0)}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  background: "none", border: "none", cursor: "pointer",
                  fontSize: 13, color: "var(--ink-3)", marginBottom: 24,
                  fontFamily: "inherit",
                }}
              >
                <ArrowLeft size={14} /> Back
              </button>

              {/* Referrer notice */}
              <div style={{
                padding: "16px 20px", borderRadius: 12,
                background: "var(--referrer-light)",
                border: "1px solid var(--referrer-mid)",
                marginBottom: 28,
              }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--referrer)", marginBottom: 3 }}>Referrer credentials</div>
                <div style={{ fontSize: 13, color: "var(--ink-3)" }}>Referrers need ≥2 years of experience to keep karma scores trustworthy.</div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 500, color: "var(--ink-2)", marginBottom: 6, display: "block" }}>Primary role</label>
                  <select
                    className="input"
                    value={refRole}
                    onChange={(e) => setRefRole(e.target.value)}
                    style={{ ...inputStyle, cursor: "pointer" }}
                  >
                    {JOB_ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 500, color: "var(--ink-2)", marginBottom: 6, display: "block" }}>Years of experience</label>
                  <input
                    type="number" min="2" max="50"
                    value={refYears}
                    onChange={(e) => setRefYears(parseInt(e.target.value) || 0)}
                    style={inputStyle}
                  />
                  <div style={{ fontSize: 12, color: "var(--ink-4)", marginTop: 5 }}>Minimum 2 years</div>
                </div>
              </div>
              <div style={{ marginBottom: 28 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: "var(--ink-2)", marginBottom: 6, display: "block" }}>Current organization</label>
                <input
                  type="text"
                  value={refOrg}
                  onChange={(e) => setRefOrg(e.target.value)}
                  placeholder="e.g. Stripe, Razorpay…"
                  style={inputStyle}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  onClick={() => handleSubmit(selected)}
                  disabled={submitting}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    background: "var(--ink)", color: "white", border: "none",
                    cursor: "pointer", fontSize: 14, fontWeight: 500,
                    padding: "0 18px", height: 38, borderRadius: 10,
                    fontFamily: "inherit",
                  }}
                >
                  {submitting ? "Saving…" : "Finish setup"} <Check size={15} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
