import { useState } from "react";
import { ArrowRight, Briefcase, Search, Shield, Sparkles, Star } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useToast } from "@/hooks/use-toast";

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

const GoogleIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const features = [
  {
    icon: Shield,
    title: "Peer-verified scores",
    body: "Senior professionals score each candidate across 4 dimensions.",
  },
  {
    icon: Star,
    title: "Top 3 only",
    body: "Recruiters never see a resume firehose. Just the three best matches.",
  },
  {
    icon: Sparkles,
    title: "Three roles, one login",
    body: "Seeker, Recruiter, and Referrer — switch without signing out.",
  },
];

const karmaPreview = [
  { name: "Aarav S.", role: "Software Engineer", score: 9.2, initials: "AS", color: "#2563eb" },
  { name: "Meera K.", role: "Product Manager", score: 8.7, initials: "MK", color: "#7c3aed" },
  { name: "Rohit V.", role: "Software Engineer", score: 8.4, initials: "RV", color: "#059669" },
];

export const AuthFlow = () => {
  const { signInWithGoogle } = useAuthStore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
    } catch (error: any) {
      toast({
        title: "Sign-in failed",
        description: error?.message ?? "Couldn't reach Google. Try again.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--surface)", display: "flex", flexDirection: "column" }}>
      {/* Nav */}
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "18px 40px", borderBottom: "1px solid var(--border-soft)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 17, fontWeight: 700, letterSpacing: "-0.04em", color: "var(--ink)" }}>
          <LogoMark />
          vouch<span style={{ opacity: 0.45 }}>me</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button style={{
            background: "transparent", border: "none", cursor: "pointer",
            fontSize: 14, fontWeight: 500, color: "var(--ink-3)",
            padding: "6px 12px", borderRadius: 8,
          }}>
            How it works
          </button>
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              background: "var(--ink)", color: "white",
              border: "none", cursor: "pointer",
              fontSize: 13, fontWeight: 500, padding: "7px 14px",
              borderRadius: 8, letterSpacing: "-0.01em",
              opacity: loading ? 0.7 : 1,
            }}
          >
            Get started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "80px 40px 60px", textAlign: "center",
      }}>
        {/* Badge */}
        <div
          className="anim-fadeup"
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "5px 14px", borderRadius: 999,
            border: "1px solid var(--border-med)",
            fontSize: 11, fontWeight: 600, color: "var(--ink-3)",
            letterSpacing: "0.03em", textTransform: "uppercase",
            marginBottom: 28, background: "var(--surface-2)",
          }}
        >
          <Shield size={11} />
          Trust-first hiring
        </div>

        {/* Headline */}
        <div className="anim-fadeup" style={{ animationDelay: "0.05s" }}>
          <h1 style={{
            fontSize: "clamp(40px, 6vw, 72px)", fontWeight: 800,
            letterSpacing: "-0.05em", lineHeight: 1.0,
            color: "var(--ink)", marginBottom: 20,
          }}>
            Hiring powered<br />by <span style={{ color: "var(--ink-3)" }}>real karma.</span>
          </h1>
          <p style={{
            fontSize: 17, color: "var(--ink-3)", maxWidth: 480,
            margin: "0 auto 36px", lineHeight: 1.65, fontWeight: 400,
          }}>
            Candidates earn karma scores from senior peers. Recruiters see only the top 3 matches. One login, three roles.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              style={{
                display: "inline-flex", alignItems: "center", gap: 10,
                background: "var(--ink)", color: "white", border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: 15, fontWeight: 500,
                padding: "0 22px", height: 46,
                borderRadius: 14, letterSpacing: "-0.01em",
                opacity: loading ? 0.7 : 1,
                transition: "all 0.18s",
              }}
            >
              <GoogleIcon size={18} />
              {loading ? "Redirecting…" : "Continue with Google"}
            </button>
            <button style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "var(--surface-2)", color: "var(--ink-2)",
              border: "1px solid var(--border-med)", cursor: "pointer",
              fontSize: 15, fontWeight: 500,
              padding: "0 22px", height: 46,
              borderRadius: 14, letterSpacing: "-0.01em",
            }}>
              See how it works <ArrowRight size={15} />
            </button>
          </div>
          <div style={{ marginTop: 14, fontSize: 13, color: "var(--ink-4)" }}>
            No password · No spam · Switch roles anytime
          </div>
        </div>

        {/* Feature strip */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(3,1fr)",
          gap: 16, maxWidth: 700, width: "100%", marginTop: 72,
        }}>
          {features.map((f, i) => (
            <div
              key={i}
              className="anim-fadeup surface-card"
              style={{ padding: 20, textAlign: "left", animationDelay: `${0.2 + i * 0.08}s` }}
            >
              <div style={{
                width: 34, height: 34, borderRadius: 8,
                background: "var(--surface-2)",
                display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12,
              }}>
                <f.icon size={16} color="var(--ink-2)" />
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)", marginBottom: 5 }}>{f.title}</div>
              <div style={{ fontSize: 13, color: "var(--ink-3)", lineHeight: 1.55 }}>{f.body}</div>
            </div>
          ))}
        </div>

        {/* Live karma snapshot */}
        <div className="anim-fadeup" style={{ marginTop: 60, maxWidth: 420, width: "100%", animationDelay: "0.3s" }}>
          <div style={{
            fontSize: 11, fontWeight: 600, textTransform: "uppercase",
            letterSpacing: "0.06em", color: "var(--ink-4)", marginBottom: 12,
          }}>
            Live karma snapshot
          </div>
          <div className="surface-card" style={{ padding: 20 }}>
            {karmaPreview.map((c, i) => (
              <div
                key={i}
                className="anim-slidein-right"
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "10px 0",
                  borderBottom: i < karmaPreview.length - 1 ? "1px solid var(--border-soft)" : "none",
                  animationDelay: `${0.35 + i * 0.08}s`,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: "50%",
                    background: c.color + "20", color: c.color,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontWeight: 600, flexShrink: 0,
                  }}>
                    {c.initials}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>{c.name}</div>
                    <div style={{ fontSize: 12, color: "var(--ink-3)" }}>{c.role}</div>
                  </div>
                </div>
                <div style={{
                  display: "flex", alignItems: "center", gap: 5,
                  background: "var(--ink)", color: "white",
                  padding: "4px 10px", borderRadius: 999,
                  fontSize: 12, fontWeight: 700,
                }}>
                  <Star size={10} fill="#facc15" color="#facc15" /> {c.score}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Role cards */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(3,1fr)",
          gap: 12, maxWidth: 700, width: "100%", marginTop: 32,
        }}>
          {[
            { icon: Search, label: "Seekers", body: "Build a transparent reputation that travels with you.", grad: "linear-gradient(135deg,#1e3a8a,#2563eb)" },
            { icon: Briefcase, label: "Recruiters", body: "Hire from a curated, karma-ranked talent pool.", grad: "linear-gradient(135deg,#064e3b,#059669)" },
            { icon: Sparkles, label: "Referrers", body: "Lend your experience and grow your influence.", grad: "linear-gradient(135deg,#3b0764,#7c3aed)" },
          ].map((r, i) => (
            <div
              key={i}
              className="anim-fadeup surface-card"
              style={{ padding: 16, textAlign: "left", animationDelay: `${0.4 + i * 0.08}s` }}
            >
              <div style={{
                width: 34, height: 34, borderRadius: 8, background: r.grad,
                display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10,
              }}>
                <r.icon size={16} color="white" />
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)", marginBottom: 4 }}>{r.label}</div>
              <div style={{ fontSize: 12, color: "var(--ink-3)", lineHeight: 1.5 }}>{r.body}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
