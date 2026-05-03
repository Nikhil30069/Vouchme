import { useEffect, useState } from "react";
import { CalendarCheck, ChevronDown, ChevronRight, Clock, Users, X } from "lucide-react";
import { useReferralStore, ReferrerSlot } from "@/stores/referralStore";
import { JOB_ROLES } from "@/constants/roles";
import { toast } from "sonner";

interface BookInterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobRequirementId: string;
  jobRole: string;
  jobExperience: number;
  seekerId: string;
  onBooked: () => void;
}

interface ReferrerWithSlots {
  referrer_id: string;
  referrer_name: string;
  referrer_role: string;
  referrer_experience: number;
  organization: string | null;
  slots: ReferrerSlot[];
}

const roleLabel = (value: string) => JOB_ROLES.find((r) => r.value === value)?.label ?? value;

const fmtSlot = (isoString: string, durationMins: number) => {
  const d = new Date(isoString);
  const day = d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
  const time = d.toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit", hour12: true }).toUpperCase();
  return `${day} · ${time} · ${durationMins} min`;
};

export const BookInterviewModal = ({
  isOpen,
  onClose,
  jobRequirementId,
  jobRole,
  jobExperience,
  seekerId,
  onBooked,
}: BookInterviewModalProps) => {
  const { findEligibleReferrersForJob, fetchSlotsByReferrers, bookSlot, eligibleReferrers } = useReferralStore();
  const [referrersWithSlots, setReferrersWithSlots] = useState<ReferrerWithSlots[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedReferrer, setExpandedReferrer] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{ referrerId: string; slot: ReferrerSlot } | null>(null);
  const [booking, setBooking] = useState(false);
  const [bookedMeetLink, setBookedMeetLink] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !jobRequirementId) return;
    const load = async () => {
      setLoading(true);
      setReferrersWithSlots([]);
      setExpandedReferrer(null);
      setSelectedSlot(null);
      setBookedMeetLink(null);
      try {
        await findEligibleReferrersForJob(jobRequirementId);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isOpen, jobRequirementId]);

  useEffect(() => {
    if (!eligibleReferrers.length) return;
    const loadSlots = async () => {
      const ids = eligibleReferrers.map((r) => r.referrer_id);
      const slotMap = await fetchSlotsByReferrers(ids);
      const result: ReferrerWithSlots[] = eligibleReferrers
        .filter((r) => (slotMap[r.referrer_id] ?? []).length > 0)
        .map((r) => ({
          referrer_id: r.referrer_id,
          referrer_name: r.referrer_name,
          referrer_role: r.referrer_role,
          referrer_experience: r.referrer_experience,
          organization: r.organization ?? null,
          slots: slotMap[r.referrer_id],
        }));
      setReferrersWithSlots(result);
    };
    loadSlots();
  }, [eligibleReferrers]);

  const handleBook = async () => {
    if (!selectedSlot) return;
    setBooking(true);
    try {
      const meetId = Math.random().toString(36).slice(2, 10);
      const link = `https://meet.jit.si/vouchme-${meetId}`;
      await bookSlot({
        slotId: selectedSlot.slot.id,
        seekerId,
        referrerId: selectedSlot.referrerId,
        jobRequirementId,
        jobRole,
        seekerExperience: jobExperience,
      });
      const { useReferralStore: s } = await import("@/stores/referralStore");
      const stored = s.getState().referralRequests.find(
        (r) => r.slot_id === selectedSlot.slot.id
      );
      setBookedMeetLink(stored?.meet_link ?? link);
      toast.success("Interview booked!");
    } catch (err) {
      toast.error("Booking failed. Try again.");
    } finally {
      setBooking(false);
    }
  };

  if (!isOpen) return null;

  return (
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
        maxWidth: 520,
        maxHeight: "90vh",
        overflowY: "auto",
        boxShadow: "0 24px 64px rgba(0,0,0,0.22)",
      }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "20px 24px 0",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <CalendarCheck size={18} color="var(--seeker)" />
            <span style={{ fontSize: 16, fontWeight: 700, color: "var(--ink)", letterSpacing: "-0.02em" }}>
              Book an interview
            </span>
          </div>
          <button onClick={onClose} style={{
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

        <div style={{ padding: "16px 24px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
          {bookedMeetLink ? (
            <div style={{
              padding: 20, borderRadius: 14,
              background: "#ecfdf5", border: "1px solid #a7f3d0",
              textAlign: "center",
            }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#059669", marginBottom: 8 }}>
                Interview scheduled!
              </div>
              <div style={{ fontSize: 13, color: "var(--ink-2)", marginBottom: 14 }}>
                Your meeting link is ready. Join at the scheduled time.
              </div>
              <a
                href={bookedMeetLink}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  background: "#059669", color: "white", border: "none",
                  borderRadius: 9, padding: "0 16px", height: 36,
                  fontSize: 13, fontWeight: 600, textDecoration: "none", cursor: "pointer",
                }}
              >
                Join meeting
              </a>
              <div style={{ marginTop: 14 }}>
                <button onClick={onBooked} style={{
                  background: "transparent", border: "none", color: "var(--ink-3)",
                  fontSize: 13, cursor: "pointer",
                }}>
                  Close
                </button>
              </div>
            </div>
          ) : loading ? (
            <div style={{ textAlign: "center", padding: "32px 0", color: "var(--ink-3)", fontSize: 14 }}>
              <Clock size={24} style={{ opacity: 0.4, marginBottom: 8, display: "block", margin: "0 auto 8px" }} />
              Finding available referrers…
            </div>
          ) : referrersWithSlots.length === 0 ? (
            <div className="surface-card" style={{ textAlign: "center", padding: "40px 24px" }}>
              <div style={{ opacity: 0.2, marginBottom: 12, display: "flex", justifyContent: "center" }}>
                <Users size={40} color="var(--ink-4)" />
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)", marginBottom: 6 }}>
                No slots available yet
              </div>
              <div style={{ fontSize: 13, color: "var(--ink-3)" }}>
                Referrers with matching experience haven't published slots yet. Check back soon.
              </div>
            </div>
          ) : (
            referrersWithSlots.map((r) => {
              const isExpanded = expandedReferrer === r.referrer_id;
              return (
                <div key={r.referrer_id} style={{
                  borderRadius: 14,
                  border: "1px solid var(--border-soft)",
                  overflow: "hidden",
                }}>
                  <button
                    onClick={() => setExpandedReferrer(isExpanded ? null : r.referrer_id)}
                    style={{
                      width: "100%", background: "var(--surface-2)", border: "none",
                      padding: "14px 16px", cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                    }}
                  >
                    <div style={{ textAlign: "left" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>
                          {r.referrer_name}
                        </span>
                        <span style={{
                          fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 999,
                          background: "var(--seeker)", color: "white", letterSpacing: "0.02em",
                        }}>
                          {r.slots.length} slot{r.slots.length !== 1 ? "s" : ""} available
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>
                        {roleLabel(r.referrer_role)} · {r.referrer_experience} yrs
                        {r.organization ? ` · ${r.organization}` : ""}
                      </div>
                    </div>
                    {isExpanded ? <ChevronDown size={16} color="var(--ink-3)" /> : <ChevronRight size={16} color="var(--ink-3)" />}
                  </button>

                  {isExpanded && (
                    <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
                      {r.slots.map((slot) => {
                        const isSelected = selectedSlot?.slot.id === slot.id;
                        return (
                          <div key={slot.id}>
                            <button
                              onClick={() => setSelectedSlot(isSelected ? null : { referrerId: r.referrer_id, slot })}
                              style={{
                                width: "100%", border: isSelected ? "1.5px solid var(--seeker)" : "1px solid var(--border-med)",
                                borderRadius: 10, padding: "10px 14px", cursor: "pointer",
                                background: isSelected ? "#eff6ff" : "var(--surface)",
                                display: "flex", alignItems: "center", justifyContent: "space-between",
                                fontFamily: "inherit",
                              }}
                            >
                              <span style={{ fontSize: 13, color: "var(--ink)", fontWeight: 500 }}>
                                {fmtSlot(slot.slot_start, slot.duration_mins)}
                              </span>
                              {isSelected && (
                                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--seeker)" }}>Selected</span>
                              )}
                            </button>
                            {isSelected && (
                              <div style={{ marginTop: 8, display: "flex", justifyContent: "flex-end" }}>
                                <button
                                  onClick={handleBook}
                                  disabled={booking}
                                  style={{
                                    display: "inline-flex", alignItems: "center", gap: 6,
                                    background: "var(--seeker)", color: "white", border: "none",
                                    borderRadius: 9, padding: "0 18px", height: 36,
                                    fontSize: 13, fontWeight: 600, cursor: booking ? "not-allowed" : "pointer",
                                    opacity: booking ? 0.7 : 1, fontFamily: "inherit",
                                  }}
                                >
                                  <CalendarCheck size={14} />
                                  {booking ? "Booking…" : "Confirm booking"}
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
