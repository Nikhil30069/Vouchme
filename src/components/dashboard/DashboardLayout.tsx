import { ReactNode, useRef, useState, useEffect, type ComponentType } from "react";
import { ChevronDown, LogOut } from "lucide-react";
import { useAuthStore, type AppRole } from "@/stores/authStore";
import { ROLE_CONFIG } from "@/constants/appRoles";

export interface SideItem {
  id: string;
  label: string;
  icon: ComponentType<{ size?: number; color?: string; className?: string }>;
}

interface DashboardLayoutProps {
  children: ReactNode;
  sideItems: SideItem[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const roleColor: Record<AppRole, string> = {
  seeker: "var(--seeker)",
  recruiter: "var(--recruiter)",
  referrer: "var(--referrer)",
};
const roleGrad: Record<AppRole, string> = {
  seeker: "linear-gradient(135deg, #1e3a8a, #2563eb)",
  recruiter: "linear-gradient(135deg, #064e3b, #059669)",
  referrer: "linear-gradient(135deg, #3b0764, #7c3aed)",
};

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

const roleIcons: Record<AppRole, ReactNode> = {
  seeker: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
    </svg>
  ),
  recruiter: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
    </svg>
  ),
  referrer: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
    </svg>
  ),
};

export const DashboardLayout = ({ children, sideItems, activeTab, onTabChange }: DashboardLayoutProps) => {
  const user = useAuthStore((s) => s.user);
  const activeRole = useAuthStore((s) => s.activeRole);
  const setActiveRole = useAuthStore((s) => s.setActiveRole);
  const signOut = useAuthStore((s) => s.signOut);
  const addRoleToUser = useAuthStore((s) => s.addRoleToUser);

  const [showDropdown, setShowDropdown] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!user || !activeRole) return null;

  const initials = (user.name || user.email || "?")
    .split(/\s|@/).filter(Boolean)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .slice(0, 2).join("");

  const color = roleColor[activeRole];
  const otherRoles = (user.roles ?? []).filter((r) => r !== activeRole);

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Topbar */}
      <header style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(255,255,255,0.90)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--border-soft)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 24px", height: 56, flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 17, fontWeight: 700, letterSpacing: "-0.04em", color: "var(--ink)" }}>
            <LogoMark />
            vouch<span style={{ opacity: 0.45 }}>me</span>
          </div>
          {/* Role pill */}
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "4px 10px", borderRadius: 999,
            background: color + "15",
            border: `1px solid ${color}30`,
          }}>
            <div style={{
              width: 16, height: 16, borderRadius: "50%",
              background: roleGrad[activeRole],
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {roleIcons[activeRole]}
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, color, textTransform: "capitalize" }}>{activeRole}</span>
          </div>
        </div>

        {/* User menu */}
        <div style={{ position: "relative" }} ref={dropRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            style={{
              display: "flex", alignItems: "center", gap: 7,
              background: "transparent", border: "none", cursor: "pointer",
              padding: "4px 8px", borderRadius: 8,
              fontFamily: "inherit",
            }}
          >
            <div style={{
              width: 32, height: 32, borderRadius: "50%",
              background: "var(--ink)", color: "white",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 600,
            }}>
              {initials || "U"}
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-2)" }}>
              {user.name?.split(" ")[0] || "Account"}
            </span>
            <ChevronDown size={13} color="var(--ink-3)" />
          </button>

          {showDropdown && (
            <div style={{
              position: "absolute", top: "calc(100% + 6px)", right: 0,
              background: "var(--surface)",
              border: "1px solid var(--border-soft)",
              borderRadius: 14,
              boxShadow: "0 20px 60px rgba(14,14,17,0.13), 0 4px 12px rgba(14,14,17,0.06)",
              minWidth: 200, zIndex: 100,
              overflow: "hidden",
              animation: "scaleIn 0.2s var(--ease-out)",
              transformOrigin: "top right",
            }}>
              {/* User info */}
              <div style={{ padding: "12px 14px 10px" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>{user.name}</div>
                <div style={{ fontSize: 12, color: "var(--ink-3)" }}>{user.email}</div>
              </div>
              <div style={{ height: 1, background: "var(--border-soft)", margin: "4px 0" }} />

              {/* Switch role options */}
              {otherRoles.length > 0 && (
                <div style={{ padding: "6px" }}>
                  {otherRoles.map((role) => (
                    <button
                      key={role}
                      onClick={() => { setActiveRole(role); setShowDropdown(false); }}
                      style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "10px 14px", width: "100%",
                        background: "none", border: "none", cursor: "pointer",
                        fontSize: 14, fontWeight: 500, color: "var(--ink-2)",
                        borderRadius: 8, transition: "background 0.1s",
                        fontFamily: "inherit", textAlign: "left",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "var(--surface-2)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "none"; }}
                    >
                      <div style={{
                        width: 26, height: 26, borderRadius: 6,
                        background: roleGrad[role],
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        {roleIcons[role]}
                      </div>
                      Switch to {role.charAt(0).toUpperCase() + role.slice(1)}
                    </button>
                  ))}
                </div>
              )}

              <div style={{ height: 1, background: "var(--border-soft)", margin: "4px 0" }} />
              <div style={{ padding: "6px" }}>
                <button
                  onClick={() => signOut()}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "10px 14px", width: "100%", margin: "0",
                    background: "none", border: "none", cursor: "pointer",
                    fontSize: 14, fontWeight: 500, color: "#dc2626",
                    borderRadius: 8, fontFamily: "inherit", textAlign: "left",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "#fef2f2"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "none"; }}
                >
                  <LogOut size={14} /> Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Body: sidebar + content */}
      <div style={{ display: "flex", flex: 1 }}>
        {/* Sidebar */}
        <aside style={{
          width: 220, flexShrink: 0,
          borderRight: "1px solid var(--border-soft)",
          padding: "20px 12px",
          display: "flex", flexDirection: "column", gap: 2,
          position: "sticky", top: 56,
          height: "calc(100vh - 56px)", overflowY: "auto",
          background: "var(--surface)",
        }}>
          {sideItems.map((item) => {
            const ItemIcon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  fontSize: 14, fontWeight: active ? 600 : 500,
                  color: active ? "var(--ink)" : "var(--ink-3)",
                  padding: "9px 12px", borderRadius: 10,
                  cursor: "pointer", transition: "all 0.15s",
                  border: "none", background: active ? "var(--surface-2)" : "none",
                  width: "100%", textAlign: "left",
                  letterSpacing: "-0.01em",
                  fontFamily: "inherit",
                }}
                onMouseEnter={(e) => { if (!active) { e.currentTarget.style.background = "var(--surface-2)"; e.currentTarget.style.color = "var(--ink)"; } }}
                onMouseLeave={(e) => { if (!active) { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "var(--ink-3)"; } }}
              >
                <ItemIcon size={15} color={active ? "var(--ink)" : "var(--ink-3)"} />
                {item.label}
              </button>
            );
          })}
          <div style={{ height: 1, background: "var(--border-soft)", margin: "12px 4px" }} />
          <button
            onClick={() => useAuthStore.getState().setActiveRole(null as any)}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              fontSize: 14, fontWeight: 500, color: "var(--ink-2)",
              padding: "9px 12px", borderRadius: 10,
              cursor: "pointer", border: "none", background: "none",
              width: "100%", textAlign: "left", fontFamily: "inherit",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--surface-2)"; e.currentTarget.style.color = "var(--ink)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "var(--ink-2)"; }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6"/>
            </svg>
            Switch workspace
          </button>
        </aside>

        {/* Main content */}
        <main style={{
          flex: 1, padding: "28px 32px",
          background: "var(--surface-2)",
          overflowY: "auto",
        }}>
          <div style={{ maxWidth: 820, animation: "fadeUp 0.4s var(--ease-out) both" }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
