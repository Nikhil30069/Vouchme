import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Trophy, 
  Star, 
  Phone, 
  Mail, 
  Users, 
  TrendingUp,
  Eye,
  EyeOff,
  Crown,
  Award,
  Zap,
  Briefcase
} from "lucide-react";
import { useReferralStore } from "@/stores/referralStore";
import { User } from "@/stores/authStore";
import { toast } from "sonner";
import { JOB_ROLES } from "@/constants/roles";

interface TopCandidatesProps {
  user: User;
  jobPostingId?: string;
  onClose?: () => void;
}

export const TopCandidates = ({ user, jobPostingId, onClose }: TopCandidatesProps) => {
  const { 
    getTopCandidates, 
    updateCandidateMatch,
    getCandidateContactDetails,
    topCandidates, 
    loading, 
    error 
  } = useReferralStore();

  const [unlockedPhones, setUnlockedPhones] = useState<Set<string>>(new Set());
  const [interestedCandidates, setInterestedCandidates] = useState<Set<string>>(new Set());
  const [contactDetails, setContactDetails] = useState<Record<string, { phone: string; email: string }>>({});

  useEffect(() => {
    if (jobPostingId) {
      console.log('TopCandidates: Fetching for job posting ID:', jobPostingId);
      getTopCandidates(jobPostingId);
    } else {
      console.error('TopCandidates: No job posting ID provided');
    }
  }, [jobPostingId, getTopCandidates]);

  const handleShowInterest = async (candidateId: string) => {
    if (!jobPostingId) {
      toast.error("Job posting ID not available");
      return;
    }

    try {
      // Update the candidate match to show interest
      await updateCandidateMatch(candidateId, jobPostingId, user.id, { is_interested: true });
      
      // Update UI only after successful DB operation
      setInterestedCandidates(prev => new Set(prev).add(candidateId));
      toast.success("Interest marked successfully!");
    } catch (error) {
      toast.error("Failed to mark interest. Please try again.");
    }
  };

  const handleUnlockPhone = async (candidateId: string) => {
    if (!jobPostingId) {
      toast.error("Job posting ID not available");
      return;
    }

    try {
      // Get candidate contact details first
      const details = await getCandidateContactDetails(candidateId);
      if (!details) {
        toast.error("Failed to get candidate contact details");
        return;
      }

      // Update the candidate match to unlock phone
      await updateCandidateMatch(candidateId, jobPostingId, user.id, { phone_unlocked: true });
      
      // Update UI only after successful DB operation
      setUnlockedPhones(prev => new Set(prev).add(candidateId));
      setContactDetails(prev => ({ ...prev, [candidateId]: details }));
      toast.success("Contact details unlocked!");
    } catch (error) {
      toast.error("Failed to unlock contact details. Please try again.");
    }
  };

  const getScoreLevel = (score: number) => {
    if (score >= 8.5) return { level: "Elite", color: "text-purple-600", bgColor: "bg-purple-100", icon: Crown };
    if (score >= 7.5) return { level: "Excellent", color: "text-green-600", bgColor: "bg-green-100", icon: Trophy };
    if (score >= 6.5) return { level: "Good", color: "text-blue-600", bgColor: "bg-blue-100", icon: Star };
    if (score >= 5.5) return { level: "Average", color: "text-yellow-600", bgColor: "bg-yellow-100", icon: Award };
    return { level: "Developing", color: "text-orange-600", bgColor: "bg-orange-100", icon: Zap };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Finding top candidates...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Top Candidates</h2>
            <p className="text-gray-600">Error occurred while fetching candidates</p>
          </div>
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Back to Dashboard
            </Button>
          )}
        </div>

        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-red-600 mb-2">⚠️ Error</div>
              <p className="text-red-700 mb-4">{error}</p>
              <div className="flex justify-center space-x-3">
                <Button onClick={() => jobPostingId && getTopCandidates(jobPostingId)} className="bg-blue-600 hover:bg-blue-700">
                  Try Again
                </Button>
                {onClose && (
                  <Button variant="outline" onClick={onClose}>
                    Back to Dashboard
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Top Candidates</h2>
          <p className="text-gray-600">Best matches based on strength scores</p>
        </div>
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            Back
          </Button>
        )}
      </div>

      {/* Results */}
      {topCandidates.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No candidates found</h3>
              <p className="text-gray-500 mb-4">
                No candidates with strength scores found for this job posting.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>Note:</strong> Candidates need to have received scores from referrers to appear here.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {topCandidates.map((candidate, index) => {
            const scoreInfo = getScoreLevel(candidate.strength_score);
            const IconComponent = scoreInfo.icon;
            const isInterested = interestedCandidates.has(candidate.seeker_id);
            const isPhoneUnlocked = unlockedPhones.has(candidate.seeker_id);

            return (
              <Card key={candidate.seeker_id} className="relative overflow-hidden">
                {/* Rank Badge */}
                <div className="absolute top-4 right-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                </div>

                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {candidate.seeker_name}
                        </h3>
                        <Badge variant="outline">{candidate.seeker_experience} years exp</Badge>
                        <Badge className={scoreInfo.bgColor + " " + scoreInfo.color}>
                          <IconComponent className="w-3 h-3 mr-1" />
                          {scoreInfo.level}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center space-x-1">
                          <Briefcase className="w-4 h-4" />
                          <span>{JOB_ROLES.find((roleObj) => roleObj.value === candidate.seeker_role).label}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4" />
                          <span>{candidate.total_scores} reviews</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="font-medium">Expected CTC:</span>
                          <span>₹{candidate.expected_ctc?.toLocaleString() || 'Not specified'}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="font-medium">Current CTC:</span>
                          <span>₹{candidate.current_ctc?.toLocaleString() || 'Not specified'}</span>
                        </div>
                      </div>

                      {/* Strength Score Display */}
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="w-5 h-5 text-blue-600" />
                          <span className="font-medium text-gray-900">Strength Score:</span>
                          <span className="text-2xl font-bold text-blue-600">
                            {candidate.strength_score.toFixed(1)}
                          </span>
                          <span className="text-gray-500">/10</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-3 pt-4 border-t">
                    {!isInterested ? (
                      <Button
                        onClick={() => handleShowInterest(candidate.seeker_id)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Show Interest
                      </Button>
                    ) : (
                      <Button variant="outline" className="text-green-600 border-green-600">
                        <Eye className="w-4 h-4 mr-2" />
                        Interested
                      </Button>
                    )}

                    {isInterested && !isPhoneUnlocked && (
                      <Button
                        onClick={() => handleUnlockPhone(candidate.seeker_id)}
                        variant="outline"
                        className="border-blue-600 text-blue-600 hover:bg-blue-50"
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        Unlock Phone
                      </Button>
                    )}

                    {isPhoneUnlocked && contactDetails[candidate.seeker_id] && (
                      <div className="flex items-center space-x-4">
                        <Button variant="outline" className="text-green-600 border-green-600">
                          <Phone className="w-4 h-4 mr-2" />
                          {contactDetails[candidate.seeker_id].phone}
                        </Button>
                        <Button variant="outline">
                          <Mail className="w-4 h-4 mr-2" />
                          {contactDetails[candidate.seeker_id].email}
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Score Insights */}
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                      <strong>Why this candidate:</strong> {candidate.strength_score.toFixed(1)}/10 strength score 
                      based on {candidate.total_scores} professional reviews. 
                      {candidate.strength_score >= 8.5 && " Elite performer with exceptional ratings."}
                      {candidate.strength_score >= 7.5 && candidate.strength_score < 8.5 && " Excellent candidate with strong professional backing."}
                      {candidate.strength_score >= 6.5 && candidate.strength_score < 7.5 && " Good candidate with solid professional feedback."}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <Trophy className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-blue-900 mb-2">How Strength Scores Work</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Candidates are scored by experienced professionals in their field</li>
                <li>• Scores are based on technical abilities and cultural fit</li>
                <li>• Higher scores indicate stronger professional reputation</li>
                <li>• Only candidates with multiple reviews are shown</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 