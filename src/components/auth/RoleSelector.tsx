import { ArrowRight, LogOut } from "lucide-react";
import { useAuthStore, type AppRole } from "@/stores/authStore";
import { ROLE_CONFIG, ROLE_ORDER } from "@/constants/appRoles";

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

export const RoleSelector = () => {
  const { user, setActiveRole, signOut } = useAuthStore();
  if (!user) return null;

  const availableRoles = user.roles ?? [];
  const initials = (user.name || user.email || "?")
    .split(/\s|@/).filter(Boolean)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .slice(0, 2).join("");

  const handleSelect = (role: AppRole) => setActiveRole(role);

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
                  onClick={() => useAuthStore.getState().addRoleToUser(role)}
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
