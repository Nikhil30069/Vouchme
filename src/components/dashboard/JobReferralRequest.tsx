import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Search, 
  Send, 
  Building, 
  User, 
  Briefcase,
  AlertCircle,
  CheckCircle,
  Loader2,
  Users,
  Star
} from "lucide-react";
import { useReferralStore } from "@/stores/referralStore";
import { useJobStore } from "@/stores/jobStore";
import { User as UserType } from "@/stores/authStore";
import { toast } from "sonner";

interface JobReferralRequestProps {
  user: UserType;
  onClose?: () => void;
}

export const JobReferralRequest = ({ user, onClose }: JobReferralRequestProps) => {
  const { 
    findEligibleReferrersForJob, 
    createReferralRequest, 
    eligibleReferrers, 
    loading, 
    error 
  } = useReferralStore();

  const { getJobsByUser } = useJobStore();
  const userJobs = getJobsByUser(user.id);

  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [selectedReferrers, setSelectedReferrers] = useState<Set<string>>(new Set());
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [sendingRequests, setSendingRequests] = useState(false);

  const handleJobSelect = (jobId: string) => {
    setSelectedJobId(jobId);
    setSelectedReferrers(new Set());
    setSearchPerformed(false);
  };

  const handleSearch = async () => {
    if (!selectedJobId) {
      toast.error("Please select a job requirement first");
      return;
    }

    setSearchPerformed(true);
    await findEligibleReferrersForJob(selectedJobId);
  };

  const handleReferrerToggle = (referrerId: string) => {
    setSelectedReferrers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(referrerId)) {
        newSet.delete(referrerId);
      } else {
        newSet.add(referrerId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedReferrers.size === eligibleReferrers.length) {
      setSelectedReferrers(new Set());
    } else {
      setSelectedReferrers(new Set(eligibleReferrers.map(r => r.referrer_id)));
    }
  };

  const handleSendRequests = async () => {
    if (selectedReferrers.size === 0) {
      toast.error("Please select at least one referrer");
      return;
    }

    setSendingRequests(true);

    try {
      const selectedJob = userJobs.find(job => job.id === selectedJobId);
      if (!selectedJob) {
        toast.error("Selected job not found");
        return;
      }

      const promises = Array.from(selectedReferrers).map(referrerId =>
        createReferralRequest({
          seeker_id: user.id,
          referrer_id: referrerId,
          job_requirement_id: selectedJobId,
          job_role: selectedJob.role,
          seeker_experience_years: selectedJob.yearsOfExperience
        })
      );

      await Promise.all(promises);
      toast.success(`Sent ${selectedReferrers.size} referral request(s) successfully!`);
      
      // Reset form
      setSelectedReferrers(new Set());
      setSearchPerformed(false);
      setSelectedJobId("");
    } catch (error) {
      toast.error("Failed to send some referral requests. Please try again.");
    } finally {
      setSendingRequests(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Job Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Briefcase className="w-5 h-5" />
            <span>Select Job Requirement</span>
          </CardTitle>
          <CardDescription>
            Choose a job requirement to find eligible referrers for that specific role
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {userJobs.length === 0 ? (
            <div className="text-center py-8">
              <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No job requirements found</h3>
              <p className="text-gray-500 mb-4">You need to create job requirements first to send referral requests</p>
              <Button onClick={onClose}>
                Back to Dashboard
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userJobs.map((job) => (
                <div
                  key={job.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedJobId === job.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleJobSelect(job.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{job.role}</h3>
                    <Badge variant="outline">{job.yearsOfExperience} years exp</Badge>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>
                      <span className="font-medium">Current CTC:</span> ₹{job.currentCTC?.toLocaleString()}
                    </div>
                    <div>
                      <span className="font-medium">Expected CTC:</span> ₹{job.expectedCTC?.toLocaleString()}
                    </div>
                    <div>
                      <span className="font-medium">Notice Period:</span> {job.noticePeriod} days
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search Button */}
      {selectedJobId && (
        <Card>
          <CardContent className="p-4">
            <Button 
              onClick={handleSearch} 
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Finding Eligible Referrers...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Find Eligible Referrers for Selected Job
                </>
              )}
            </Button>

            {error && (
              <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg mt-4">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm text-red-600">{error}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {searchPerformed && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Eligible Referrers</span>
              {eligibleReferrers.length > 0 && (
                <div className="flex items-center space-x-2">
                  <Button 
                    onClick={handleSelectAll}
                    variant="outline"
                    size="sm"
                  >
                    {selectedReferrers.size === eligibleReferrers.length ? 'Deselect All' : 'Select All'}
                  </Button>
                  <Button 
                    onClick={handleSendRequests}
                    disabled={selectedReferrers.size === 0 || sendingRequests}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {sendingRequests ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send {selectedReferrers.size} Request(s)
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardTitle>
            <CardDescription>
              {eligibleReferrers.length > 0 
                ? `Found ${eligibleReferrers.length} eligible referrers for your job requirement`
                : `No eligible referrers found for this job requirement`
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {eligibleReferrers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No eligible referrers found</h3>
                <p className="text-gray-500 mb-4">
                  No referrers with sufficient experience found for this role. Try a different job requirement or check back later.
                </p>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <strong>Eligibility criteria:</strong> Referrers must have more than {userJobs.find(j => j.id === selectedJobId)?.yearsOfExperience + 1} years of experience in {userJobs.find(j => j.id === selectedJobId)?.role} role.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {eligibleReferrers.map((referrer) => (
                  <div 
                    key={referrer.referrer_id} 
                    className={`p-4 border rounded-lg transition-colors ${
                      selectedReferrers.has(referrer.referrer_id) 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        checked={selectedReferrers.has(referrer.referrer_id)}
                        onCheckedChange={() => handleReferrerToggle(referrer.referrer_id)}
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-medium text-gray-900">
                            {referrer.referrer_name}
                          </h3>
                          <Badge variant="outline" className="text-xs">
                            {referrer.referrer_experience} years
                          </Badge>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Briefcase className="w-4 h-4" />
                            <span>{referrer.referrer_role}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Building className="w-4 h-4" />
                            <span>{referrer.organization}</span>
                          </div>
                        </div>

                        <div className="mt-2 text-xs text-gray-500">
                          <span className="font-medium">Your job:</span> {referrer.job_role} ({referrer.job_experience} years exp)
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-blue-900 mb-2">How it works</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Select a job requirement from your posted jobs</li>
                <li>• The system automatically finds referrers with more experience in that role</li>
                <li>• Choose which referrers you want to send requests to</li>
                <li>• Referrers will review your profile and score you on technical abilities and cultural fit</li>
                <li>• Your strength score is calculated from all received scores</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 