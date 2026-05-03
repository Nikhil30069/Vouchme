import { useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, ChevronUp } from "lucide-react";
import { User } from "@/stores/authStore";
import { useReferralStore } from "@/stores/referralStore";
import { toast } from "sonner";
import { primaryBtnStyle } from "./SeekerDashboard";

interface CalendlySetupModalProps {
  user: User;
  onComplete: (url: string) => void;
}

export const CalendlySetupModal = ({ user, onComplete }: CalendlySetupModalProps) => {
  const { saveCalendlyUrl } = useReferralStore();
  const [url, setUrl] = useState("");
  const [saved, setSaved] = useState(false);
  const [showSteps, setShowSteps] = useState(false);

  const handleSave = () => {
    const trimmed = url.trim();
    if (!trimmed) {
      toast.error("Please enter your Calendly URL before saving.");
      return;
    }
    if (!trimmed.startsWith("https://calendly.com/")) {
      toast.error("URL must start with https://calendly.com/");
      return;
    }
    // Optimistically complete — fire the DB write in the background.
    // The free-tier Supabase project may take 20-30s to wake from pause on
    // the first write; we don't want to block the user on that.
    setSaved(true);
    saveCalendlyUrl(user.id, trimmed).catch(() => {
      // Silent — if this fails the modal will reappear on next login
      // once the project is fully awake.
    });
    setTimeout(() => onComplete(trimmed), 600);
  };

  return createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2000,
        background: "rgba(0,0,0,0.65)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
      }}
    >
      <div
        style={{
          background: "var(--surface)",
          borderRadius: 18,
          maxWidth: 560,
          width: "100%",
          padding: "36px 32px 32px",
          border: "1px solid var(--border-soft)",
          boxShadow: "0 24px 64px rgba(0,0,0,0.22)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
          <span style={{ fontSize: 28 }}>📅</span>
          <h2
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: "var(--ink)",
              letterSpacing: "-0.03em",
              margin: 0,
            }}
          >
            Set up your interview calendar
          </h2>
        </div>

        <p style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.6, marginBottom: 20, marginTop: 0 }}>
          Seekers can't book interviews with you until you connect your Calendly.{" "}
          <strong style={{ color: "var(--ink)" }}>This is required to use the referrer workspace.</strong>{" "}
          Your link lets candidates book a 30–45 minute slot directly on your calendar — no back-and-forth scheduling needed.
        </p>

        <div
          style={{
            border: "1px solid var(--border-soft)",
            borderRadius: 12,
            marginBottom: 22,
            overflow: "hidden",
          }}
        >
          <button
            onClick={() => setShowSteps((v) => !v)}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 16px",
              background: "var(--surface-2)",
              border: "none",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
              color: "var(--ink-2)",
              fontFamily: "inherit",
            }}
          >
            How to create a Calendly account
            {showSteps ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {showSteps && (
            <ol
              style={{
                margin: 0,
                padding: "16px 20px 16px 36px",
                fontSize: 13,
                color: "var(--ink-2)",
                lineHeight: 1.75,
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              <li>
                Go to{" "}
                <a
                  href="https://calendly.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "var(--referrer)" }}
                >
                  calendly.com
                </a>{" "}
                and click <strong>"Sign Up Free"</strong>
              </li>
              <li>Sign in with Google or create an account with your email</li>
              <li>Connect your Google Calendar or Outlook to prevent double-bookings</li>
              <li>
                Click <strong>"Create"</strong> → <strong>"Event Type"</strong> → choose{" "}
                <strong>"One-on-One"</strong>
              </li>
              <li>
                Name it <strong>"Referral Interview"</strong> and set duration to 30 or 45 minutes
              </li>
              <li>
                Copy your scheduling link — it looks like{" "}
                <code
                  style={{
                    background: "var(--surface-2)",
                    padding: "1px 5px",
                    borderRadius: 4,
                    fontSize: 12,
                  }}
                >
                  https://calendly.com/your-name/event-name
                </code>
              </li>
              <li>Paste it in the field below and click Save</li>
            </ol>
          )}
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <input
            type="url"
            placeholder="https://calendly.com/your-name/event-name"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !saved && handleSave()}
            style={{
              flex: 1,
              height: 42,
              padding: "0 14px",
              borderRadius: 10,
              border: "1px solid var(--border-med)",
              fontSize: 14,
              color: "var(--ink)",
              background: "var(--surface)",
              fontFamily: "inherit",
              outline: "none",
            }}
          />
          <button
            onClick={handleSave}
            disabled={saved}
            style={{
              ...primaryBtnStyle,
              padding: "0 20px",
              height: 42,
              borderRadius: 10,
              flexShrink: 0,
              opacity: saved ? 0.8 : 1,
              minWidth: 90,
            }}
          >
            {saved ? "✓ Saved!" : "Save"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
