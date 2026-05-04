import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Clock, Users, X } from "lucide-react";
import { useReferralStore } from "@/stores/referralStore";
import { JOB_ROLES } from "@/constants/roles";
import { primaryBtnStyle } from "./SeekerDashboard";

interface BookInterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobRequirementId: string;
  jobRole: string;
  jobExperience: number;
  seekerId: string;
  onBooked: () => void;
}

interface ReferrerWithCalendly {
  referrer_id: string;
  referrer_name: string;
  referrer_role: string;
  referrer_experience: number;
  organization: string | null;
  calendly_url: string | null;
}

const roleLabel = (value: string) => JOB_ROLES.find((r) => r.value === value)?.label ?? value;

export const BookInterviewModal = ({
  isOpen,
  onClose,
  jobRequirementId,
  jobRole,
  jobExperience,
  seekerId,
  onBooked,
}: BookInterviewModalProps) => {
  const { findEligibleReferrersForJob, fetchCalendlyUrls, bookSlot, eligibleReferrers } = useReferralStore();
  const [referrers, setReferrers] = useState<ReferrerWithCalendly[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedReferrer, setSelectedReferrer] = useState<ReferrerWithCalendly | null>(null);
  const [booked, setBooked] = useState(false);


  useEffect(() => {
    if (!isOpen || !jobRequirementId) return;
    const load = async () => {
      setLoading(true);
      setReferrers([]);
      setSelectedReferrer(null);
      setBooked(false);
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
    const loadUrls = async () => {
      const ids = eligibleReferrers.map((r) => r.referrer_id);
      const urlMap = await fetchCalendlyUrls(ids);
      const result: ReferrerWithCalendly[] = eligibleReferrers.map((r) => ({
        referrer_id: r.referrer_id,
        referrer_name: r.referrer_name,
        referrer_role: r.referrer_role,
        referrer_experience: r.referrer_experience,
        organization: r.organization ?? null,
        calendly_url: urlMap[r.referrer_id] ?? null,
      }));
      setReferrers(result);
    };
    loadUrls();
  }, [eligibleReferrers]);

  useEffect(() => {
    const handler = async (e: MessageEvent) => {
      if (e.data?.event !== 'calendly.event_scheduled') return;
      if (!selectedReferrer || booked) return;
      setBooked(true);
      try {
        await bookSlot({
          slotId: '',
          seekerId,
          referrerId: selectedReferrer.referrer_id,
          jobRequirementId,
          jobRole,
          seekerExperience: jobExperience,
        });
      } catch {}
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [selectedReferrer, booked, seekerId, jobRequirementId, jobRole, jobExperience]);

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
        maxWidth: 560,
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
          {booked ? (
            <div style={{ textAlign: "center", padding: "40px 24px" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "var(--ink)", marginBottom: 8 }}>Interview booked!</div>
              <div style={{ fontSize: 13, color: "var(--ink-3)", lineHeight: 1.6 }}>
                You'll receive a confirmation email from Calendly with the meeting details and Google Meet link.
              </div>
              <button onClick={onBooked} style={{ ...primaryBtnStyle, marginTop: 20 }}>Done</button>
            </div>
          ) : loading ? (
            <div style={{ textAlign: "center", padding: "32px 0", color: "var(--ink-3)", fontSize: 14 }}>
              <Clock size={24} style={{ opacity: 0.4, marginBottom: 8, display: "block", margin: "0 auto 8px" }} />
              Finding available referrers…
            </div>
          ) : referrers.length === 0 ? (
            <div className="surface-card" style={{ textAlign: "center", padding: "40px 24px" }}>
              <div style={{ opacity: 0.2, marginBottom: 12, display: "flex", justifyContent: "center" }}>
                <Users size={40} color="var(--ink-4)" />
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)", marginBottom: 6 }}>
                No referrers available yet
              </div>
              <div style={{ fontSize: 13, color: "var(--ink-3)" }}>
                Referrers with matching experience haven't set up availability yet. Check back soon.
              </div>
            </div>
          ) : (
            referrers.map((r) => {
              const isSelected = selectedReferrer?.referrer_id === r.referrer_id;
              return (
                <div key={r.referrer_id} style={{
                  borderRadius: 14,
                  border: isSelected ? "1.5px solid var(--seeker)" : "1px solid var(--border-soft)",
                  overflow: "hidden",
                }}>
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
                        {r.calendly_url ? (
                          <span style={{
                            fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 999,
                            background: "var(--seeker)", color: "white", letterSpacing: "0.02em",
                          }}>
                            Available
                          </span>
                        ) : (
                          <span style={{ fontSize: 12, color: "var(--ink-4)" }}>Not available</span>
                        )}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>
                        {roleLabel(r.referrer_role)} · {r.referrer_experience} yrs
                        {r.organization ? ` · ${r.organization}` : ""}
                      </div>
                    </div>
                    {r.calendly_url && (
                      <button
                        onClick={() => setSelectedReferrer(isSelected ? null : r)}
                        style={{
                          display: "inline-flex", alignItems: "center",
                          background: isSelected ? "var(--seeker)" : "transparent",
                          color: isSelected ? "white" : "var(--seeker)",
                          border: `1.5px solid var(--seeker)`,
                          borderRadius: 9, padding: "0 14px", height: 32,
                          fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                        }}
                      >
                        {isSelected ? "Close" : "Book Interview"}
                      </button>
                    )}
                  </div>

                  {isSelected && r.calendly_url && (
                    <div style={{ borderTop: "1px solid var(--border-soft)", overflow: "hidden" }}>
                      <iframe
                        src={`${r.calendly_url}?hide_gdpr_banner=1&primary_color=2563eb&embed_type=Inline`}
                        width="100%"
                        height="580"
                        frameBorder="0"
                        title="Book a time"
                        allow="payment"
                      />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
