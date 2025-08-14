import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Users,
  Building2,
  Calendar,
  Send,
  X,
  CheckCircle,
  Clock,
  Star,
} from "lucide-react";
import { useReferralStore } from "@/stores/referralStore";
import { useAuthStore } from "@/stores/authStore";
import { supabase } from "@/lib/supabaseClient";
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
  organization: string;
  total_experience_years?: number;
  organizations?: string[];
  current_organization?: string;
  job_role?: string;
  job_experience?: number;
}

export const ReferrerSelectionPopup = ({
  isOpen,
  onClose,
  jobRequirementId,
  jobRole,
  jobExperience,
}: ReferrerSelectionPopupProps) => {
  const { findEligibleReferrersForJob, createReferralRequest } =
    useReferralStore();
  const { user } = useAuthStore();
  const [eligibleReferrers, setEligibleReferrers] = useState<ReferrerProfile[]>(
    []
  );
  const [selectedReferrers, setSelectedReferrers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (isOpen && jobRequirementId) {
      fetchEligibleReferrers();
    }
  }, [isOpen, jobRequirementId]);

  const fetchEligibleReferrers = async () => {
    setIsLoading(true);
    try {
      // await findEligibleReferrersForJob(jobRequirementId);
      // The referrers will be available in the store
      const { data: jobData, error: jobError } = await supabase
        .from("job_requirements")
        .select("role, yearsOfExperience")
        .eq("id", jobRequirementId)
        .single()

      if (jobError) throw jobError;
      const jobRole = jobData.role;
      const jobYears = jobData.yearsOfExperience;
      console.log ("Job Role:", jobRole, "Job Years:", jobYears);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("workExperience->>role", jobRole)
        .gte("workExperience->>years", jobYears + 2);

      console.log(data, error);

      if (error) {
        console.error("Error fetching profiles:", error);
        setEligibleReferrers([]);
      } else {
        // Transform the data to match the expected format
        const transformedData = (data || []).map(profile => ({
          referrer_id: profile.id,
          referrer_name: profile.name,
          referrer_role: profile.role,
          referrer_experience: profile.years_of_experience || 0,
          organization: profile.organization,
          total_experience_years: profile.total_experience_years,
          organizations: profile.organizations,
          current_organization: profile.current_organization
        }));
        
        console.log("Transformed data:", transformedData);
        setEligibleReferrers(transformedData);
      }
    } catch (error) {
      console.error("Error fetching eligible referrers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReferrerToggle = (referrerId: string) => {
    setSelectedReferrers((prev) =>
      prev.includes(referrerId)
        ? prev.filter((id) => id !== referrerId)
        : [...prev, referrerId]
    );
  };

  const handleSelectAll = () => {
    if (selectedReferrers.length === eligibleReferrers.length) {
      setSelectedReferrers([]);
    } else {
      setSelectedReferrers(eligibleReferrers.map((r) => r.referrer_id));
    }
  };

  const handleSendRequests = async () => {
    if (selectedReferrers.length === 0) return;

    setIsSending(true);
    try {
      for (const referrerId of selectedReferrers) {
        await createReferralRequest({
          seeker_id: user.id,
          referrer_id: referrerId,
          job_requirement_id: jobRequirementId,
          job_role: jobRole,
          seeker_experience_years: jobExperience,
        });
      }

      // Reset and close
      setSelectedReferrers([]);
      onClose();
    } catch (error) {
      console.error("Error sending referral requests:", error);
    } finally {
      setIsSending(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span>
              Select Referrers{" "}
              {JOB_ROLES.find((roleObj) => roleObj.value === jobRole).label} (
              {jobExperience} years)
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Header Info */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-800 font-medium">
                  Eligible Referrers: {eligibleReferrers.length} found
                </p>
                <p className="text-xs text-blue-600">
                  Referrers with more than {jobExperience + 1} years of
                  experience in {jobRole}
                </p>
              </div>
              {eligibleReferrers.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  className="text-blue-600 border-blue-200"
                >
                  {selectedReferrers.length === eligibleReferrers.length
                    ? "Deselect All"
                    : "Select All"}
                </Button>
              )}
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Finding eligible referrers...</p>
            </div>
          )}

          {/* No Referrers Found */}
          {!isLoading && eligibleReferrers.length === 0 && (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Eligible Referrers Found
              </h3>
              <p className="text-gray-600 mb-4">
                We couldn't find any referrers with more than{" "}
                {jobExperience + 2} years of experience in {JOB_ROLES.find(roleObj => roleObj.value === jobRole).label}.
              </p>
              <p className="text-sm text-gray-500">
                Try posting a different job requirement or check back later as
                more professionals join the platform.
              </p>
            </div>
          )}

          {/* Referrers List */}
          {!isLoading && eligibleReferrers.length > 0 && (
            <div className="space-y-3">
              {eligibleReferrers.map((referrer) => (
                <Card
                  key={referrer.referrer_id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-4">
                      {/* Checkbox */}
                      <Checkbox
                        checked={selectedReferrers.includes(
                          referrer.referrer_id
                        )}
                        onCheckedChange={() =>
                          handleReferrerToggle(referrer.referrer_id)
                        }
                        className="mt-1"
                      />

                      {/* Avatar */}
                      <Avatar className="w-12 h-12">
                        <AvatarImage src="" />
                        <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                          {getInitials(referrer.referrer_name)}
                        </AvatarFallback>
                      </Avatar>

                      {/* Referrer Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {referrer.referrer_name}
                          </h3>
                          {referrer.referrer_role && (
                            <Badge variant="secondary" className="text-xs">
                              {referrer.referrer_role}
                            </Badge>
                          )}
                        </div>

                        {/* Experience */}
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>
                              Total{" "}
                              {referrer.total_experience_years ||
                                referrer.referrer_experience}{" "}
                              years experience
                            </span>
                          </div>
                        </div>

                        {/* Organizations */}
                        {referrer.organizations &&
                          referrer.organizations.length > 0 && (
                            <div className="flex items-center space-x-2 text-sm text-gray-600 mb-1">
                              <Building2 className="w-4 h-4" />
                              <span className="font-medium">
                                Organizations:
                              </span>
                              <div className="flex flex-wrap gap-1">
                                {referrer.organizations.map((org, index) => (
                                  <Badge
                                    key={index}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {org}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                        {/* Current Organization */}
                        {referrer.current_organization && (
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span className="font-medium">Current:</span>
                            <span>{referrer.current_organization}</span>
                          </div>
                        )}

                        {/* Fallback to old organization field */}
                        {!referrer.organizations &&
                          !referrer.current_organization &&
                          referrer.organization && (
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <Building2 className="w-4 h-4" />
                              <span className="font-medium">Organization:</span>
                              <Badge variant="outline" className="text-xs">
                                {referrer.organization}
                              </Badge>
                            </div>
                          )}
                      </div>

                      {/* Selection Indicator */}
                      {selectedReferrers.includes(referrer.referrer_id) && (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          {!isLoading && eligibleReferrers.length > 0 && (
            <div className="flex justify-between items-center pt-4 border-t">
              <div className="text-sm text-gray-600">
                {selectedReferrers.length} of {eligibleReferrers.length}{" "}
                referrers selected
              </div>
              <div className="flex space-x-3">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSendRequests}
                  disabled={selectedReferrers.length === 0 || isSending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isSending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send {selectedReferrers.length} Request
                      {selectedReferrers.length !== 1 ? "s" : ""}
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
