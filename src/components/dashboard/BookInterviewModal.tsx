import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { createPortal } from "react-dom";
import { Calendar, Clock, Users, X } from "lucide-react";
import { useReferralStore, type AvailableSlot } from "@/stores/referralStore";
import { JOB_ROLES } from "@/constants/roles";
import { primaryBtnStyle, secondaryBtnStyle } from "./SeekerDashboard";

interface BookInterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobRequirementId: string;
  jobRole: string;
  jobExperience: number;
  seekerId: string;
  onBooked: () => void;
}

interface EligibleReferrer {
  referrer_id: string;
  referrer_name: string;
  referrer_role: string;
  referrer_experience: number;
  organization: string | null;
}

interface BookedResult {
  interview_at: string;
  meet_link: string | null;
}

const roleLabel = (value: string) => JOB_ROLES.find((r) => r.value === value)?.label ?? value;

const fmtDay = (iso: string) =>
  new Date(iso).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
const dayKey = (iso: string) => iso.slice(0, 10); // group by UTC date for stability

export const BookInterviewModal = ({
  isOpen,
  onClose,
  jobRequirementId,
  jobRole,
  jobExperience,
  seekerId: _seekerId,
  onBooked,
}: BookInterviewModalProps) => {
  const { findEligibleReferrersForJob, fetchAvailableSlots, bookCalendarSlot, eligibleReferrers } = useReferralStore();
  const [loadingReferrers, setLoadingReferrers] = useState(false);
  const [selectedReferrer, setSelectedReferrer] = useState<EligibleReferrer | null>(null);
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [pendingSlot, setPendingSlot] = useState<string | null>(null);
  const [booking, setBooking] = useState(false);
  const [booked, setBooked] = useState<BookedResult | null>(null);

  // Reset state every time the modal opens.
  useEffect(() => {
    if (!isOpen) return;
    setSelectedReferrer(null);
    setSlots([]);
    setSlotsError(null);
    setPendingSlot(null);
    setBooked(null);
    setBooking(false);
    if (!jobRequirementId) return;
    setLoadingReferrers(true);
    findEligibleReferrersForJob(jobRequirementId).finally(() => setLoadingReferrers(false));
  }, [isOpen, jobRequirementId, findEligibleReferrersForJob]);

  const referrers: EligibleReferrer[] = useMemo(
    () =>
      eligibleReferrers.map((r) => ({
        referrer_id: r.referrer_id,
        referrer_name: r.referrer_name,
        referrer_role: r.referrer_role,
        referrer_experience: r.referrer_experience,
        organization: r.organization ?? null,
      })),
    [eligibleReferrers],
  );

  const loadSlots = async (r: EligibleReferrer) => {
    setSelectedReferrer(r);
    setSlots([]);
    setSlotsError(null);
    setSlotsLoading(true);
    try {
      const result = await fetchAvailableSlots(r.referrer_id);
      setSlots(result);
    } catch (err: any) {
      setSlotsError(err?.message ?? "Failed to load availability");
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleBook = async () => {
    if (!selectedReferrer || !pendingSlot || booking) return;
    setBooking(true);
    try {
      const result = await bookCalendarSlot({
        referrerId: selectedReferrer.referrer_id,
        slotStart: pendingSlot,
        jobRequirementId,
        jobRole,
        seekerExperience: jobExperience,
      });
      setBooked({ interview_at: result.interview_at, meet_link: result.meet_link });
    } catch (err: any) {
      const msg = err?.message ?? "Failed to book slot";
      toast.error(msg);
      // If the slot was taken, refresh availability so the user sees the new state.
      if (/no longer available|just booked/i.test(msg) && selectedReferrer) {
        await loadSlots(selectedReferrer);
      }
      setPendingSlot(null);
    } finally {
      setBooking(false);
    }
  };

  // Group slots by day for display.
  const slotsByDay = useMemo(() => {
    const m = new Map<string, AvailableSlot[]>();
    for (const s of slots) {
      const k = dayKey(s.start);
      if (!m.has(k)) m.set(k, []);
      m.get(k)!.push(s);
    }
    return Array.from(m.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [slots]);

  if (!isOpen) return null;

  return createPortal(
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(0,0,0,0.5)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 16,
    }}>
      <div style={{
        background: "var(--surface)",
        borderRadius: 20,
        width: "100%",
        maxWidth: 640,
        maxHeight: "90vh",
        overflowY: "auto",
        boxShadow: "0 24px 64px rgba(0,0,0,0.22)",
      }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "20px 24px 0",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: "var(--ink)", letterSpacing: "-0.02em" }}>
              Book an interview
            </span>
          </div>
          <button onClick={onClose} aria-label="Close" style={{
            background: "transparent", border: "none", cursor: "pointer",
            color: "var(--ink-3)", display: "flex", padding: 4, borderRadius: 6,
          }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: "12px 24px 4px" }}>
          <div style={{ fontSize: 13, color: "var(--ink-3)" }}>
            {roleLabel(jobRole)} · {jobExperience} yrs exp
          </div>
        </div>

        <div style={{ padding: "16px 24px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
          {/* === Success state =================================================== */}
          {booked ? (
            <div data-testid="book-success" style={{ textAlign: "center", padding: "32px 16px" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "var(--ink)", marginBottom: 6 }}>Interview booked!</div>
              <div style={{ fontSize: 13, color: "var(--ink-3)", marginBottom: 16, lineHeight: 1.6 }}>
                {new Date(booked.interview_at).toLocaleString([], { dateStyle: "full", timeStyle: "short" })}
                <br />A Google Calendar invite + Meet link has been sent to your email.
              </div>
              {booked.meet_link && (
                <a
                  href={booked.meet_link}
                  target="_blank"
                  rel="noreferrer"
                  data-testid="meet-link"
                  style={{ ...primaryBtnStyle, textDecoration: "none", display: "inline-flex" }}
                >
                  Open Google Meet
                </a>
              )}
              <div style={{ marginTop: 14 }}>
                <button onClick={onBooked} style={secondaryBtnStyle}>Done</button>
              </div>
            </div>
          ) : loadingReferrers ? (
            <div style={{ textAlign: "center", padding: "32px 0", color: "var(--ink-3)", fontSize: 14 }}>
              <Clock size={24} style={{ opacity: 0.4, display: "block", margin: "0 auto 8px" }} />
              Finding referrers with calendar availability…
            </div>
          ) : referrers.length === 0 ? (
            /* === Empty state =================================================== */
            <div className="surface-card" data-testid="no-referrers" style={{ textAlign: "center", padding: "40px 24px" }}>
              <div style={{ opacity: 0.2, marginBottom: 12, display: "flex", justifyContent: "center" }}>
                <Users size={40} color="var(--ink-4)" />
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)", marginBottom: 6 }}>
                No referrers available yet
              </div>
              <div style={{ fontSize: 13, color: "var(--ink-3)" }}>
                We couldn't find referrers matching your role who have connected their calendar.
                Check back soon.
              </div>
            </div>
          ) : (
            referrers.map((r) => {
              const isSelected = selectedReferrer?.referrer_id === r.referrer_id;
              return (
                <div
                  key={r.referrer_id}
                  data-testid={`referrer-card-${r.referrer_id}`}
                  style={{
                    borderRadius: 14,
                    border: isSelected ? "1.5px solid var(--seeker)" : "1px solid var(--border-soft)",
                    overflow: "hidden",
                  }}
                >
                  <div style={{
                    width: "100%", background: isSelected ? "#eff6ff" : "var(--surface-2)",
                    padding: "14px 16px",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                  }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>
                          {r.referrer_name}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>
                        {roleLabel(r.referrer_role)} · {r.referrer_experience} yrs
                        {r.organization ? ` · ${r.organization}` : ""}
                      </div>
                    </div>
                    <button
                      onClick={() => (isSelected ? setSelectedReferrer(null) : loadSlots(r))}
                      data-testid={`show-slots-${r.referrer_id}`}
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 6,
                        background: isSelected ? "var(--seeker)" : "transparent",
                        color: isSelected ? "white" : "var(--seeker)",
                        border: `1.5px solid var(--seeker)`,
                        borderRadius: 9, padding: "0 14px", height: 32,
                        fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                      }}
                    >
                      <Calendar size={13} />
                      {isSelected ? "Hide slots" : "See available slots"}
                    </button>
                  </div>

                  {/* Slot grid for selected referrer */}
                  {isSelected && (
                    <div style={{ borderTop: "1px solid var(--border-soft)", padding: 16 }}>
                      {slotsLoading ? (
                        <div style={{ fontSize: 13, color: "var(--ink-3)", padding: "16px 0" }} data-testid="slots-loading">
                          Loading availability…
                        </div>
                      ) : slotsError ? (
                        <div data-testid="slots-error" style={{ fontSize: 13, color: "#dc2626", padding: 12, background: "#fee2e2", borderRadius: 8 }}>
                          {slotsError}
                          <button onClick={() => loadSlots(r)} style={{ ...secondaryBtnStyle, marginLeft: 8, height: 28, fontSize: 12 }}>
                            Retry
                          </button>
                        </div>
                      ) : slots.length === 0 ? (
                        <div data-testid="no-slots" style={{ fontSize: 13, color: "var(--ink-3)", padding: "12px 0" }}>
                          No open slots in the next 7 days. Try another referrer or check back later.
                        </div>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                          {slotsByDay.map(([day, daySlots]) => (
                            <div key={day}>
                              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-3)", marginBottom: 6 }}>
                                {fmtDay(daySlots[0].start)}
                              </div>
                              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                                {daySlots.map((s) => {
                                  const isPending = pendingSlot === s.start;
                                  return (
                                    <button
                                      key={s.start}
                                      onClick={() => setPendingSlot(s.start)}
                                      data-testid={`slot-${s.start}`}
                                      style={{
                                        padding: "6px 12px",
                                        borderRadius: 8,
                                        border: `1.5px solid ${isPending ? "var(--seeker)" : "var(--border-med)"}`,
                                        background: isPending ? "var(--seeker)" : "var(--surface)",
                                        color: isPending ? "white" : "var(--ink-2)",
                                        fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                                      }}
                                    >
                                      {fmtTime(s.start)}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Confirmation footer for picked slot */}
                      {pendingSlot && (
                        <div
                          data-testid="confirm-bar"
                          style={{
                            marginTop: 14, padding: "10px 12px",
                            border: "1px solid var(--seeker)", background: "#eff6ff",
                            borderRadius: 10,
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            gap: 10, flexWrap: "wrap",
                          }}
                        >
                          <div style={{ fontSize: 13, color: "var(--ink-2)" }}>
                            Book <strong>{fmtTime(pendingSlot)}</strong> on <strong>{fmtDay(pendingSlot)}</strong>?
                          </div>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button onClick={() => setPendingSlot(null)} style={{ ...secondaryBtnStyle, height: 32, fontSize: 12 }}>
                              Cancel
                            </button>
                            <button
                              onClick={handleBook}
                              disabled={booking}
                              data-testid="confirm-book"
                              style={{ ...primaryBtnStyle, height: 32, fontSize: 12 }}
                            >
                              {booking ? "Booking…" : "Confirm booking"}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
};
