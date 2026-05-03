import { useState } from "react";
import { ArrowRight, ArrowLeft, Check, LogOut } from "lucide-react";
import { useAuthStore, type AppRole } from "@/stores/authStore";
import { ROLE_CONFIG, ROLE_ORDER } from "@/constants/appRoles";
import { JOB_ROLES } from "@/constants/roles";
import { toast } from "sonner";

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

const roleGrads: Record<AppRole, string> = {
  seeker: "linear-gradient(135deg, #1e3a8a, #2563eb)",
  recruiter: "linear-gradient(135deg, #064e3b, #059669)",
  referrer: "linear-gradient(135deg, #3b0764, #7c3aed)",
};

const roleIcons: Record<AppRole, React.ReactNode> = {
  seeker: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
    </svg>
  ),
  recruiter: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
    </svg>
  ),
  referrer: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
    </svg>
  ),
};

const inputStyle: React.CSSProperties = {
  width: "100%", fontFamily: "inherit", fontSize: 14, color: "var(--ink)",
  background: "var(--surface)", border: "1px solid var(--border-med)",
  borderRadius: 10, padding: "0 13px", height: 40,
  outline: "none", transition: "border-color 0.15s, box-shadow 0.15s",
  WebkitAppearance: "none",
  boxSizing: "border-box",
};

export const RoleSelector = () => {
  const { user, setActiveRole, signOut, addRoleToUser } = useAuthStore();
  const [addingReferrer, setAddingReferrer] = useState(false);
  const [refRole, setRefRole] = useState<string>(JOB_ROLES[0].value);
  const [refYears, setRefYears] = useState<number>(2);
  const [refOrg, setRefOrg] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  if (!user) return null;

  const availableRoles = user.roles ?? [];
  const initials = (user.name || user.email || "?")
    .split(/\s|@/).filter(Boolean)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .slice(0, 2).join("");

  const handleSelect = (role: AppRole) => setActiveRole(role);

  const handleAddRole = (role: AppRole) => {
    if (role === "referrer") {
      setAddingReferrer(true);
    } else {
      void addRoleToUser(role);
    }
  };

  const handleReferrerSubmit = async () => {
    if (!refOrg.trim()) {
      toast.error("Please enter your current organization.");
      return;
    }
    if (refYears < 2) {
      toast.error("You need at least 2 years of experience to become a referrer.");
      return;
    }
    setSubmitting(true);
    try {
      await addRoleToUser("referrer", {
        workExperience: { role: refRole, years: refYears, organization: refOrg.trim() },
        current_organization: refOrg.trim(),
        total_experience_years: refYears,
      });
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to add referrer role. Please try again.");
      setSubmitting(false);
    }
  };

  if (addingReferrer) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", background: "var(--surface-2)" }}>
        <div className="anim-scalein" style={{ width: "100%", maxWidth: 520 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 17, fontWeight: 700, letterSpacing: "-0.04em", color: "var(--ink)" }}>
              <LogoMark />
              vouchme
            </div>
          </div>

          <button
            onClick={() => setAddingReferrer(false)}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "none", border: "none", cursor: "pointer",
              fontSize: 13, color: "var(--ink-3)", marginBottom: 24,
              fontFamily: "inherit",
            }}
          >
            <ArrowLeft size={14} /> Back
          </button>

          <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.04em", marginBottom: 6, color: "var(--ink)" }}>
            Referrer credentials
          </h2>
          <p style={{ fontSize: 14, color: "var(--ink-3)", marginBottom: 28 }}>
            Referrers need ≥2 years of experience to keep karma scores trustworthy.
          </p>

          <div style={{
            padding: "16px 20px", borderRadius: 12,
            background: "var(--referrer-light)",
            border: "1px solid var(--referrer-mid)",
            marginBottom: 28,
          }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--referrer)", marginBottom: 3 }}>Why we ask this</div>
            <div style={{ fontSize: 13, color: "var(--ink-3)" }}>Your work history is shown to seekers so they know who's vouching for them.</div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: "var(--ink-2)", marginBottom: 6, display: "block" }}>Primary role</label>
              <select
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

          <div style={{ marginBottom: 32 }}>
            <label style={{ fontSize: 13, fontWeight: 500, color: "var(--ink-2)", marginBottom: 6, display: "block" }}>Current organization</label>
            <input
              type="text"
              value={refOrg}
              onChange={(e) => setRefOrg(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !submitting && handleReferrerSubmit()}
              placeholder="e.g. Stripe, Razorpay…"
              style={inputStyle}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              onClick={handleReferrerSubmit}
              disabled={submitting}
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "var(--ink)", color: "white", border: "none",
                cursor: submitting ? "not-allowed" : "pointer",
                fontSize: 14, fontWeight: 500,
                padding: "0 20px", height: 40, borderRadius: 10,
                opacity: submitting ? 0.7 : 1,
                fontFamily: "inherit",
              }}
            >
              {submitting ? "Saving…" : "Add referrer workspace"} {!submitting && <Check size={15} />}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", background: "var(--surface-2)" }}>
      <div className="anim-scalein" style={{ width: "100%", maxWidth: 520, textAlign: "center" }}>
        {/* Logo */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 17, fontWeight: 700, letterSpacing: "-0.04em", color: "var(--ink)" }}>
            <LogoMark />
            vouchme
          </div>
        </div>

        {/* Avatar */}
        <div style={{
          width: 52, height: 52, borderRadius: "50%",
          background: "var(--ink)", color: "white",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18, fontWeight: 700, margin: "0 auto 20px",
        }}>
          {initials || "U"}
        </div>

        <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.04em", marginBottom: 6, color: "var(--ink)" }}>
          Choose a workspace
        </h2>
        <p style={{ fontSize: 14, color: "var(--ink-3)", marginBottom: 32 }}>
          Logged in as <strong style={{ color: "var(--ink)" }}>{user.email}</strong>
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {availableRoles.map((role, i) => {
            const cfg = ROLE_CONFIG[role];
            return (
              <button
                key={role}
                onClick={() => handleSelect(role)}
                className="anim-fadeup"
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "16px 20px",
                  background: "var(--surface)",
                  border: "1px solid var(--border-soft)",
                  borderRadius: 14, cursor: "pointer", textAlign: "left",
                  transition: "all 0.18s",
                  animationDelay: `${0.1 + i * 0.07}s`,
                  fontFamily: "inherit",
                }}
                onMouseEnter={(e) => {
                  const roleColor = { seeker: "#2563eb", recruiter: "#059669", referrer: "#7c3aed" }[role];
                  e.currentTarget.style.borderColor = roleColor;
                  e.currentTarget.style.boxShadow = `0 0 0 2px ${roleColor}22`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border-soft)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: roleGrads[role],
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {roleIcons[role]}
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)", letterSpacing: "-0.02em" }}>{cfg.label}</div>
                    <div style={{ fontSize: 13, color: "var(--ink-3)" }}>{cfg.description}</div>
                  </div>
                </div>
                <ArrowRight size={16} color="var(--ink-3)" />
              </button>
            );
          })}
        </div>

        {/* Add missing roles */}
        {ROLE_ORDER.filter((r) => !availableRoles.includes(r)).length > 0 && (
          <div style={{ marginTop: 20 }}>
            <div style={{
              fontSize: 11, fontWeight: 600, textTransform: "uppercase",
              letterSpacing: "0.05em", color: "var(--ink-4)", marginBottom: 10,
            }}>
              Add a role
            </div>
            {ROLE_ORDER.filter((r) => !availableRoles.includes(r)).map((role) => {
              const cfg = ROLE_CONFIG[role];
              return (
                <button
                  key={role}
                  onClick={() => handleAddRole(role)}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "12px 16px", width: "100%",
                    background: "transparent",
                    border: "1px dashed var(--border-med)",
                    borderRadius: 12, cursor: "pointer", textAlign: "left",
                    marginBottom: 8, fontFamily: "inherit",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: 8,
                      background: roleGrads[role], opacity: 0.7,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {roleIcons[role]}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: "var(--ink-2)" }}>
                      Become a {cfg.short}
                    </div>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ink-4)" strokeWidth="1.8" strokeLinecap="round">
                    <path d="M5 12h14"/><path d="M12 5v14"/>
                  </svg>
                </button>
              );
            })}
          </div>
        )}

        <button
          onClick={() => signOut()}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "none", border: "none", cursor: "pointer",
            fontSize: 13, color: "var(--ink-3)", marginTop: 20,
            fontFamily: "inherit", margin: "20px auto 0",
          }}
        >
          <LogOut size={13} /> Sign out
        </button>
      </div>
    </div>
  );
};
