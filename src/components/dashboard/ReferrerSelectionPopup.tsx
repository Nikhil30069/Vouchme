import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Building2, Calendar, CheckCircle, Loader2, Send, Users } from "lucide-react";
import { useReferralStore } from "@/stores/referralStore";
import { useAuthStore } from "@/stores/authStore";
import { supabase } from "@/integrations/supabase/client";
import { JOB_ROLES } from "@/constants/roles";

interface ReferrerSelectionPopupProps {
  isOpen: boolean;
  onClose: () => void;
  jobRequirementId: string;
  jobRole: string;
  jobExperience: number;
}

interface ReferrerProfile {
  referrer_id: string;
  referrer_name: string;
  referrer_role: string;
  referrer_experience: number;
  organization?: string | null;
  current_organization?: string | null;
  organizations?: string[] | null;
}

const roleLabel = (value: string) =>
  JOB_ROLES.find((r) => r.value === value)?.label ?? value;

export const ReferrerSelectionPopup = ({
  isOpen,
  onClose,
  jobRequirementId,
  jobRole,
  jobExperience,
}: ReferrerSelectionPopupProps) => {
  const { createReferralRequest } = useReferralStore();
  const { user } = useAuthStore();
  const [eligibleReferrers, setEligibleReferrers] = useState<ReferrerProfile[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (!isOpen || !jobRequirementId) return;
    const load = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.rpc("find_eligible_referrers_for_job", {
          job_requirement_uuid: jobRequirementId,
        });
        if (error) throw error;
        setEligibleReferrers((data as ReferrerProfile[]) ?? []);
      } catch (err) {
        console.error("Failed to load eligible referrers:", err);
        setEligibleReferrers([]);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [isOpen, jobRequirementId]);

  const toggle = (id: string) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );

  const toggleAll = () => {
    if (selected.length === eligibleReferrers.length) setSelected([]);
    else setSelected(eligibleReferrers.map((r) => r.referrer_id));
  };

  const handleSend = async () => {
    if (selected.length === 0 || !user) return;
    setIsSending(true);
    try {
      for (const id of selected) {
        await createReferralRequest({
          seeker_id: user.id,
          referrer_id: id,
          job_requirement_id: jobRequirementId,
          job_role: jobRole,
          seeker_experience_years: jobExperience,
        });
      }
      setSelected([]);
      onClose();
    } catch (err) {
      console.error("Error sending referral requests:", err);
    } finally {
      setIsSending(false);
    }
  };

  const initials = (name: string) =>
    name
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display">
            <Users className="h-5 w-5 text-brand-600" />
            Pick referrers for {roleLabel(jobRole)} ({jobExperience} years)
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-2xl bg-brand-50/60 px-4 py-3">
            <div>
              <div className="text-sm font-semibold text-brand-800">
                {eligibleReferrers.length} eligible referrer
                {eligibleReferrers.length === 1 ? "" : "s"}
              </div>
              <div className="text-xs text-brand-700/80">
                Senior pros with more than {jobExperience + 1} years in{" "}
                {roleLabel(jobRole)}.
              </div>
            </div>
            {eligibleReferrers.length > 0 && (
              <Button variant="outline" size="sm" onClick={toggleAll} className="rounded-lg">
                {selected.length === eligibleReferrers.length
                  ? "Deselect all"
                  : "Select all"}
              </Button>
            )}
          </div>

          {isLoading && (
            <div className="flex items-center justify-center gap-2 py-10 text-slate-500">
              <Loader2 className="h-5 w-5 animate-spin" /> Finding referrers…
            </div>
          )}

          {!isLoading && eligibleReferrers.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center">
              <Users className="mx-auto h-10 w-10 text-slate-400" />
              <h3 className="mt-3 font-display text-lg font-semibold text-slate-900">
                No eligible referrers yet
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Check back later — more senior professionals join every week.
              </p>
            </div>
          )}

          {!isLoading && eligibleReferrers.length > 0 && (
            <div className="space-y-3">
              {eligibleReferrers.map((r) => (
                <motion.div
                  key={r.referrer_id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex items-start gap-4 rounded-2xl border p-4 transition ${
                    selected.includes(r.referrer_id)
                      ? "border-brand-400 bg-brand-50/50"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  <Checkbox
                    checked={selected.includes(r.referrer_id)}
                    onCheckedChange={() => toggle(r.referrer_id)}
                    className="mt-1"
                  />
                  <Avatar className="h-11 w-11">
                    <AvatarFallback className="bg-gradient-to-br from-brand-500 to-fuchsia-500 text-white">
                      {initials(r.referrer_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-slate-900">{r.referrer_name}</h3>
                      {r.referrer_role && (
                        <Badge variant="outline" className="border-slate-200">
                          {roleLabel(r.referrer_role)}
                        </Badge>
                      )}
                    </div>
                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {r.referrer_experience} years
                      </span>
                      {(r.current_organization || r.organization) && (
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3.5 w-3.5" />
                          {r.current_organization || r.organization}
                        </span>
                      )}
                    </div>
                  </div>
                  {selected.includes(r.referrer_id) && (
                    <CheckCircle className="h-5 w-5 text-brand-500" />
                  )}
                </motion.div>
              ))}
            </div>
          )}

          {!isLoading && eligibleReferrers.length > 0 && (
            <div className="flex items-center justify-between border-t border-slate-200 pt-4">
              <div className="text-sm text-slate-600">
                {selected.length} of {eligibleReferrers.length} selected
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={onClose} className="rounded-lg">
                  Cancel
                </Button>
                <Button
                  disabled={selected.length === 0 || isSending}
                  onClick={handleSend}
                  className="rounded-lg bg-slate-900 text-white hover:bg-slate-800"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending…
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" /> Send {selected.length} request
                      {selected.length === 1 ? "" : "s"}
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
