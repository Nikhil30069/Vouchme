import { useEffect, useState } from "react";
import { Calendar, CheckCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/authStore";
import { useReferralStore } from "@/stores/referralStore";
import { primaryBtnStyle, secondaryBtnStyle } from "./SeekerDashboard";

const DAY_LABELS = [
  { value: 1, short: "M", label: "Mon" },
  { value: 2, short: "T", label: "Tue" },
  { value: 3, short: "W", label: "Wed" },
  { value: 4, short: "T", label: "Thu" },
  { value: 5, short: "F", label: "Fri" },
  { value: 6, short: "S", label: "Sat" },
  { value: 7, short: "S", label: "Sun" },
];

// IANA timezones likely used by users. Anything else still saves correctly;
// this just gives a friendly dropdown for common cases.
const COMMON_TIMEZONES = [
  "Asia/Kolkata",
  "Asia/Singapore",
  "Asia/Dubai",
  "Europe/London",
  "Europe/Berlin",
  "America/New_York",
  "America/Los_Angeles",
  "America/Chicago",
  "Australia/Sydney",
];

export const AvailabilityPanel = () => {
  const user = useAuthStore((s) => s.user);
  const calendarConnected = useAuthStore((s) => s.calendarConnected);
  const connectGoogleCalendar = useAuthStore((s) => s.connectGoogleCalendar);
  const refreshCalendarConnected = useAuthStore((s) => s.refreshCalendarConnected);
  const updateUser = useAuthStore((s) => s.updateUser);
  const saveAvailability = useReferralStore((s) => s.saveAvailability);

  const [start, setStart] = useState(user?.availability_start ?? "10:00");
  const [end, setEnd] = useState(user?.availability_end ?? "19:00");
  const [days, setDays] = useState<number[]>(user?.availability_days ?? [1, 2, 3, 4, 5]);
  const [timezone, setTimezone] = useState(user?.availability_timezone ?? "Asia/Kolkata");
  const [saving, setSaving] = useState(false);
  const [connecting, setConnecting] = useState(false);

  // Pick up latest values when the user prop loads / refreshes.
  useEffect(() => {
    if (!user) return;
    setStart((s) => (s === "10:00" ? user.availability_start ?? "10:00" : s));
    setEnd((s) => (s === "19:00" ? user.availability_end ?? "19:00" : s));
    setDays((d) => (d.length === 5 && d[0] === 1 ? user.availability_days ?? [1, 2, 3, 4, 5] : d));
    setTimezone((tz) => (tz === "Asia/Kolkata" ? user.availability_timezone ?? "Asia/Kolkata" : tz));
  }, [user?.id]);

  useEffect(() => {
    // The connection state might have changed elsewhere (e.g., after returning
    // from the OAuth redirect). Re-read once on mount.
    refreshCalendarConnected();
  }, [refreshCalendarConnected]);

  const toggleDay = (d: number) => {
    setDays((cur) => (cur.includes(d) ? cur.filter((x) => x !== d) : [...cur, d].sort()));
  };

  const handleConnect = async () => {
    setConnecting(true);
    try {
      await connectGoogleCalendar();
      // Redirect happens via OAuth — control rarely returns here.
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to start Google Calendar connection");
      setConnecting(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    if (days.length === 0) {
      toast.error("Pick at least one day you're available.");
      return;
    }
    if (start >= end) {
      toast.error("Start time must be before end time.");
      return;
    }
    setSaving(true);
    try {
      await saveAvailability(user.id, { start, end, days, timezone });
      updateUser({
        availability_start: start,
        availability_end: end,
        availability_days: days,
        availability_timezone: timezone,
      });
      toast.success("Availability saved");
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to save availability");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border-soft)", borderRadius: 14, padding: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <Calendar size={16} color="var(--ink-3)" />
        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)", letterSpacing: "-0.02em" }}>
          Calendar &amp; Availability
        </div>
      </div>
      <div style={{ fontSize: 13, color: "var(--ink-3)", marginBottom: 16, lineHeight: 1.5 }}>
        Connect your Google Calendar so seekers can book interviews on your real availability.
        Each booking creates a calendar event with a Google Meet link automatically.
      </div>

      {/* Connection status */}
      <div
        data-testid="calendar-connection"
        style={{
          padding: "12px 14px",
          background: calendarConnected ? "#ecfdf5" : "var(--surface-2)",
          border: `1px solid ${calendarConnected ? "#a7f3d0" : "var(--border-soft)"}`,
          borderRadius: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 10,
          marginBottom: 18,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {calendarConnected ? (
            <>
              <CheckCircle size={16} color="#059669" />
              <span style={{ fontSize: 13, fontWeight: 600, color: "#047857" }}>Google Calendar connected</span>
            </>
          ) : (
            <>
              <Clock size={16} color="var(--ink-3)" />
              <span style={{ fontSize: 13, color: "var(--ink-2)" }}>
                Not connected — you won't be discoverable by seekers until you connect.
              </span>
            </>
          )}
        </div>
        <button
          onClick={handleConnect}
          disabled={connecting}
          style={{
            ...primaryBtnStyle,
            background: calendarConnected ? "var(--surface-3)" : "var(--seeker)",
            color: calendarConnected ? "var(--ink-2)" : "white",
            height: 32,
            padding: "0 14px",
            fontSize: 13,
          }}
        >
          {connecting ? "Opening Google…" : calendarConnected ? "Reconnect" : "Connect Google Calendar"}
        </button>
      </div>

      {/* Availability editor */}
      <div style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 10 }}>
        When are you available?
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontSize: 12, color: "var(--ink-3)" }}>From</span>
          <input
            type="time"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            data-testid="availability-start"
            style={{
              height: 36, padding: "0 10px", borderRadius: 8,
              border: "1px solid var(--border-med)", fontSize: 14, color: "var(--ink)",
              background: "var(--surface)", fontFamily: "inherit", outline: "none",
            }}
          />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontSize: 12, color: "var(--ink-3)" }}>To</span>
          <input
            type="time"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            data-testid="availability-end"
            style={{
              height: 36, padding: "0 10px", borderRadius: 8,
              border: "1px solid var(--border-med)", fontSize: 14, color: "var(--ink)",
              background: "var(--surface)", fontFamily: "inherit", outline: "none",
            }}
          />
        </label>
      </div>

      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 6 }}>Days</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {DAY_LABELS.map((d) => {
            const active = days.includes(d.value);
            return (
              <button
                key={d.value}
                type="button"
                onClick={() => toggleDay(d.value)}
                data-testid={`availability-day-${d.value}`}
                aria-pressed={active}
                title={d.label}
                style={{
                  width: 36, height: 36, borderRadius: 999,
                  border: `1.5px solid ${active ? "var(--seeker)" : "var(--border-med)"}`,
                  background: active ? "var(--seeker)" : "var(--surface)",
                  color: active ? "white" : "var(--ink-2)",
                  fontSize: 13, fontWeight: 600,
                  cursor: "pointer", fontFamily: "inherit",
                }}
              >
                {d.short}
              </button>
            );
          })}
        </div>
      </div>

      <label style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 18 }}>
        <span style={{ fontSize: 12, color: "var(--ink-3)" }}>Timezone</span>
        <select
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          data-testid="availability-timezone"
          style={{
            height: 36, padding: "0 10px", borderRadius: 8,
            border: "1px solid var(--border-med)", fontSize: 14, color: "var(--ink)",
            background: "var(--surface)", fontFamily: "inherit", outline: "none",
          }}
        >
          {COMMON_TIMEZONES.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
          {!COMMON_TIMEZONES.includes(timezone) && <option value={timezone}>{timezone}</option>}
        </select>
      </label>

      <button onClick={handleSave} disabled={saving} style={{ ...primaryBtnStyle, height: 38 }} data-testid="availability-save">
        {saving ? "Saving…" : "Save availability"}
      </button>
    </div>
  );
};
