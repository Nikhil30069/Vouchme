import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  Send, 
  Building, 
  Clock, 
  User, 
  Briefcase,
  AlertCircle,
  CheckCircle,
  Loader2
} from "lucide-react";
import { useReferralStore } from "@/stores/referralStore";
import { User as UserType } from "@/stores/authStore";
import { toast } from "sonner";

interface ReferralRequestFormProps {
  user: UserType;
  onClose?: () => void;
}

export const ReferralRequestForm = ({ user, onClose }: ReferralRequestFormProps) => {
  const { 
    findEligibleReferrers, 
    createReferralRequest, 
    eligibleReferrers, 
    loading, 
    error 
  } = useReferralStore();

  const [selectedRole, setSelectedRole] = useState<string>("");
  const [experienceYears, setExperienceYears] = useState<number>(0);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [sendingRequests, setSendingRequests] = useState<Set<string>>(new Set());

  // Common job roles
  const jobRoles = [
    "Software Engineer",
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "DevOps Engineer",
    "Data Scientist",
    "Product Manager",
    "UI/UX Designer",
    "QA Engineer",
    "System Administrator",
    "Network Engineer",
    "Cybersecurity Analyst",
    "Business Analyst",
    "Project Manager",
    "Sales Representative",
    "Marketing Specialist",
    "Content Writer",
    "Graphic Designer",
    "Financial Analyst",
    "Human Resources"
  ];

  const handleSearch = async () => {
    if (!selectedRole || experienceYears <= 0) {
      toast.error("Please select a role and enter your experience years");
      return;
    }

    setSearchPerformed(true);
    await findEligibleReferrers(selectedRole, experienceYears);
  };

  const handleSendRequest = async (referrerId: string) => {
    if (!selectedRole || experienceYears <= 0) {
      toast.error("Please select a role and enter your experience years");
      return;
    }

    setSendingRequests(prev => new Set(prev).add(referrerId));

    try {
      await createReferralRequest({
        seeker_id: user.id,
        referrer_id: referrerId,
        job_role: selectedRole,
        seeker_experience_years: experienceYears
      });

      toast.success("Referral request sent successfully!");
      
      // Refresh the eligible referrers list
      await findEligibleReferrers(selectedRole, experienceYears);
    } catch (error) {
      toast.error("Failed to send referral request. Please try again.");
    } finally {
      setSendingRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(referrerId);
        return newSet;
      });
    }
  };

  const handleSendBulkRequests = async () => {
    if (eligibleReferrers.length === 0) {
      toast.error("No eligible referrers found");
      return;
    }

    const promises = eligibleReferrers.map(referrer => 
      handleSendRequest(referrer.referrer_id)
    );

    try {
      await Promise.all(promises);
      toast.success(`Sent ${eligibleReferrers.length} referral requests!`);
    } catch (error) {
      toast.error("Some requests failed to send. Please try again.");
    }
  };

  // Auto-populate experience years from user profile
  useEffect(() => {
    if (user.workExperience?.years) {
      setExperienceYears(user.workExperience.years);
    }
    if (user.workExperience?.role) {
      setSelectedRole(user.workExperience.role);
    }
  }, [user.workExperience]);

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="w-5 h-5" />
            <span>Find Eligible Referrers</span>
          </CardTitle>
          <CardDescription>
            Find experienced professionals who can score your profile. 
            Referrers must have more than (your experience + 1) years in the same role.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role">Job Role</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your job role" />
                </SelectTrigger>
                <SelectContent>
                  {jobRoles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="experience">Years of Experience</Label>
              <Input
                id="experience"
                type="number"
                min="0"
                max="50"
                value={experienceYears || ""}
                onChange={(e) => setExperienceYears(parseInt(e.target.value) || 0)}
                placeholder="Enter your experience years"
              />
            </div>
          </div>

          <Button 
            onClick={handleSearch} 
            disabled={!selectedRole || experienceYears <= 0 || loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Find Referrers
              </>
            )}
          </Button>

          {error && (
            <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span className="text-sm text-red-600">{error}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {searchPerformed && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Eligible Referrers</span>
              {eligibleReferrers.length > 0 && (
                <Button 
                  onClick={handleSendBulkRequests}
                  variant="outline"
                  size="sm"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send All Requests
                </Button>
              )}
            </CardTitle>
            <CardDescription>
              {eligibleReferrers.length > 0 
                ? `Found ${eligibleReferrers.length} eligible referrers for ${selectedRole} role`
                : `No eligible referrers found for ${selectedRole} role with ${experienceYears} years experience`
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {eligibleReferrers.length === 0 ? (
              <div className="text-center py-8">
                <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No eligible referrers found</h3>
                <p className="text-gray-500 mb-4">
                  Try searching for a different role or check back later when more referrers join the platform.
                </p>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <strong>Eligibility criteria:</strong> Referrers must have more than {experienceYears + 1} years of experience in {selectedRole} role.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {eligibleReferrers.map((referrer) => (
                  <div 
                    key={referrer.referrer_id} 
                    className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
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
                      </div>

                      <Button
                        onClick={() => handleSendRequest(referrer.referrer_id)}
                        disabled={sendingRequests.has(referrer.referrer_id)}
                        size="sm"
                        className="ml-4"
                      >
                        {sendingRequests.has(referrer.referrer_id) ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Send Request
                          </>
                        )}
                      </Button>
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
                <li>• Send referral requests to experienced professionals in your field</li>
                <li>• Referrers will review your profile and score you on technical abilities and cultural fit</li>
                <li>• Your strength score is calculated from the average of all scores received</li>
                <li>• Higher strength scores increase your visibility to recruiters</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 