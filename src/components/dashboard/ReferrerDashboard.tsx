
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Star, Users, Award, FileText, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { User } from "@/stores/authStore";
import { useReferralStore } from "@/stores/referralStore";
import { toast } from "sonner";

interface ReferrerDashboardProps {
  user: User;
}

export const ReferrerDashboard = ({ user }: ReferrerDashboardProps) => {
  const { 
    fetchReferralRequests, 
    fetchScoringParameters, 
    createScore,
    referralRequests,
    scoringParameters,
    loading 
  } = useReferralStore();

  const [scores, setScores] = useState<Record<string, Record<string, number | ''>>>({});
  const [comments, setComments] = useState<Record<string, string>>({});
  const [submittingScores, setSubmittingScores] = useState<Set<string>>(new Set());

  useEffect(() => {
    console.log('🏠 [REFERRER_DASHBOARD] Component mounted, fetching data for user:', user.id);
    console.log('👤 [REFERRER_DASHBOARD] User details:', { id: user.id, name: user.name, persona: user.persona });
    
    fetchReferralRequests(user.id);
    fetchScoringParameters();
  }, [user.id, fetchReferralRequests, fetchScoringParameters]);

  // Filter requests for this referrer
  const myReferralRequests = referralRequests.filter(req => req.referrer_id === user.id);
  const pendingRequests = myReferralRequests.filter(req => req.status === 'pending');
  const scoredRequests = myReferralRequests.filter(req => req.status === 'scored');
  
  // Debug logging for referral requests
  console.log('🔍 [REFERRER_DASHBOARD] Referral requests analysis:', {
    totalInStore: referralRequests.length,
    myReferralRequests: myReferralRequests.length,
    pendingRequests: pendingRequests.length,
    scoredRequests: scoredRequests.length,
    userId: user.id
  });
  
  if (referralRequests.length > 0) {
    console.log('📋 [REFERRER_DASHBOARD] All referral requests in store:');
    referralRequests.forEach((req, index) => {
      console.log(`  ${index + 1}. ID: ${req.id}, Seeker: ${req.seeker_id}, Referrer: ${req.referrer_id}, Role: ${req.job_role}, Status: ${req.status}`);
    });
  }
  
  if (myReferralRequests.length > 0) {
    console.log('🎯 [REFERRER_DASHBOARD] My referral requests:');
    myReferralRequests.forEach((req, index) => {
      console.log(`  ${index + 1}. ID: ${req.id}, Seeker: ${req.seeker_id}, Role: ${req.job_role}, Status: ${req.status}`);
    });
  }

  const handleScoreChange = (requestId: string, parameterId: string, score: number | '') => {
    // Validate score range
    if (score !== '' && (score < 0 || score > 10)) {
      console.warn(`⚠️ [SCORING] Invalid score ${score} for parameter ${parameterId}. Score must be between 0-10.`);
      return; // Don't update if invalid
    }
    
    console.log(`📝 [SCORING] Updating score for request ${requestId}, parameter ${parameterId}: ${score}`);
    
    setScores(prev => ({
      ...prev,
      [requestId]: {
        ...prev[requestId],
        [parameterId]: score
      }
    }));
  };

  const handleCommentChange = (requestId: string, comment: string) => {
    setComments(prev => ({
      ...prev,
      [requestId]: comment
    }));
  };

  const handleSubmitScore = async (requestId: string) => {
    // Prevent multiple submissions for the same request
    if (submittingScores.has(requestId)) {
      console.log('⚠️ [SUBMIT_SCORES] Already submitting scores for request:', requestId);
      return;
    }
    
    console.log('🔒 [SUBMIT_SCORES] Setting submission state for request:', requestId);
    setSubmittingScores(prev => new Set(prev).add(requestId));
    
    console.log('🚀 [SUBMIT_SCORES] Starting score submission for request:', requestId);
    
    const requestScores = scores[requestId];
    console.log('📊 [SUBMIT_SCORES] Current scores for this request:', requestScores);
    
    if (!requestScores || Object.keys(requestScores).length === 0) {
      console.error('❌ [SUBMIT_SCORES] No scores provided');
      toast.error("Please provide scores for all parameters");
      return;
    }

    // Validate all parameters have scores
    const missingParameters = scoringParameters.filter(param => !requestScores[param.id]);
    if (missingParameters.length > 0) {
      console.error('❌ [SUBMIT_SCORES] Missing scores for parameters:', missingParameters.map(p => p.name));
      toast.error(`Please provide scores for: ${missingParameters.map(p => p.name).join(', ')}`);
      return;
    }

    // Validate score ranges
    const invalidScores = Object.entries(requestScores).filter(([paramId, score]) => 
      score === '' || score < 0 || score > 10
    );
    
    if (invalidScores.length > 0) {
      console.error('❌ [SUBMIT_SCORES] Invalid scores found:', invalidScores);
      toast.error("Please ensure all scores are between 0 and 10");
      return;
    }

    console.log('✅ [SUBMIT_SCORES] All validations passed, proceeding with submission');

    try {
      const request = myReferralRequests.find(req => req.id === requestId);
      if (!request) {
        console.error('❌ [SUBMIT_SCORES] Referral request not found in local state');
        toast.error("Referral request not found");
        return;
      }

      console.log('📋 [SUBMIT_SCORES] Referral request details:', request);

      // Create scores for all parameters
      const scorePromises = Object.entries(requestScores).map(([parameterId, score]) => {
        // Ensure score is a valid number
        if (score === '' || typeof score !== 'number') {
          console.error(`❌ [SUBMIT_SCORES] Invalid score for parameter ${parameterId}:`, score);
          throw new Error(`Invalid score for parameter ${parameterId}`);
        }
        
        const scoreData = {
          referral_request_id: requestId,
          referrer_id: user.id,
          seeker_id: request.seeker_id,
          parameter_id: parameterId,
          score: score,
          comments: comments[requestId] || undefined
        };
        
        console.log(`📝 [SUBMIT_SCORES] Creating score for parameter ${parameterId}:`, scoreData);
        return createScore(scoreData);
      });

      console.log('🔄 [SUBMIT_SCORES] Submitting all scores...');
      const results = await Promise.allSettled(scorePromises);
      
      // Check if any scores failed to submit
      const failedScores = results.filter(result => result.status === 'rejected');
      
      if (failedScores.length > 0) {
        console.error('❌ [SUBMIT_SCORES] Some scores failed to submit:', failedScores);
        throw new Error(`${failedScores.length} scores failed to submit`);
      }
      
      console.log('✅ [SUBMIT_SCORES] All scores submitted successfully!');
      toast.success("Scores submitted successfully!");
      
      // Clear form data
      setScores(prev => {
        const newScores = { ...prev };
        delete newScores[requestId];
        return newScores;
      });
      setComments(prev => {
        const newComments = { ...prev };
        delete newComments[requestId];
        return newComments;
      });
      
      console.log('🧹 [SUBMIT_SCORES] Form data cleared');

      // Refresh data
      await fetchReferralRequests(user.id);
    } catch (error) {
      console.error('💥 [SUBMIT_SCORES] Error submitting scores:', error);
      console.error('💥 [SUBMIT_SCORES] Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      toast.error("Failed to submit scores. Please try again.");
    } finally {
      setSubmittingScores(prev => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
      console.log('🔄 [SUBMIT_SCORES] Submission state reset');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'scored':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'scored':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user.name}!</h1>
        <p className="text-purple-100 mb-4">Help candidates by reviewing their profiles</p>
        <div className="flex items-center space-x-6 text-purple-100">
          <div>
            <span className="font-medium">Role:</span> {user.workExperience?.role}
          </div>
          <div>
            <span className="font-medium">Experience:</span> {user.workExperience?.years} years
          </div>
          <div>
            <span className="font-medium">Organization:</span> {user.workExperience?.organization}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Reviews</p>
                <p className="text-2xl font-bold text-gray-900">{pendingRequests.length}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Reviews Completed</p>
                <p className="text-2xl font-bold text-gray-900">{scoredRequests.length}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <Award className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold text-gray-900">{myReferralRequests.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Star className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Referral Requests */}
      <Card>
        <CardHeader>
          <CardTitle>Referral Requests to Review</CardTitle>
          <CardDescription>
            Review and score candidate profiles that match your expertise
          </CardDescription>
        </CardHeader>
        <CardContent>
          {myReferralRequests.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No referral requests yet</h3>
              <p className="text-gray-500">Candidates will send you referral requests based on your experience level</p>
            </div>
          ) : (
            <div className="space-y-6">
              {myReferralRequests.map((request) => (
                <div key={request.id} className={`p-6 border rounded-lg shadow-sm transition-all duration-200 ${
                  request.status === 'scored' 
                    ? 'bg-gray-100 opacity-60 cursor-not-allowed' 
                    : 'bg-white hover:shadow-md'
                }`}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                                          <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">{request.job_role}</h3>
                      <Badge variant="outline">{request.seeker_experience_years} years exp</Badge>
                      <Badge className={getStatusColor(request.status)}>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(request.status)}
                          <span className="capitalize">{request.status}</span>
                        </div>
                      </Badge>
                    </div>

                      <p className="text-sm text-gray-600">
                        Requested on {new Date(request.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {request.status === 'pending' && (
                    <div className="space-y-4">
                      {/* Resume Display */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                          <FileText className="w-4 h-4 mr-2" />
                          Candidate Resume
                        </h4>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(request.resume_url, '_blank')}
                            disabled={!request.resume_url}
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            {request.resume_url ? 'View Resume' : 'No Resume Available'}
                          </Button>
                          {request.resume_url && (
                            <span className="text-xs text-gray-500">
                              Click to open in new tab
                            </span>
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Score the candidate:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {scoringParameters.map((parameter) => {
                            const currentScore = scores[request.id]?.[parameter.id] || '';
                            const isValidScore = currentScore === '' || (currentScore >= 0 && currentScore <= 10);
                            
                            return (
                              <div key={parameter.id} className="space-y-2">
                                <Label htmlFor={`score-${request.id}-${parameter.id}`}>
                                  {parameter.name} (0-10)
                                </Label>
                                <Input
                                  id={`score-${request.id}-${parameter.id}`}
                                  type="number"
                                  min="0"
                                  max="10"
                                  value={currentScore}
                                  onChange={(e) => {
                                    const value = e.target.value === '' ? '' : parseInt(e.target.value);
                                    handleScoreChange(request.id, parameter.id, value);
                                  }}
                                  placeholder="0-10"
                                  className={`w-full ${!isValidScore ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                                />
                                {!isValidScore && (
                                  <p className="text-xs text-red-500">
                                    Please enter a score between 0 and 10
                                  </p>
                                )}
                                {parameter.description && (
                                  <p className="text-xs text-gray-500">{parameter.description}</p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor={`comment-${request.id}`}>Comments (Optional)</Label>
                        <Textarea
                          id={`comment-${request.id}`}
                          value={comments[request.id] || ''}
                          onChange={(e) => handleCommentChange(request.id, e.target.value)}
                          placeholder="Add any additional comments or feedback..."
                          className="mt-1"
                          rows={3}
                        />
                      </div>

                      <Button
                        onClick={() => {
                          // Prevent multiple clicks
                          if (submittingScores.has(request.id)) {
                            console.log('⚠️ [SUBMIT_SCORES] Already submitting, ignoring click');
                            return;
                          }
                          handleSubmitScore(request.id);
                        }}
                        disabled={submittingScores.has(request.id)}
                        className="w-full"
                      >
                        {submittingScores.has(request.id) ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Star className="w-4 h-4 mr-2" />
                            Submit Scores
                          </>
                        )}
                      </Button>
                    </div>
                  )}

                  {request.status === 'scored' && (
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-green-800 font-medium">Scores submitted successfully</span>
                      </div>
                      <p className="text-green-700 text-sm mt-1">
                        Thank you for helping this candidate improve their profile!
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-purple-50 border-purple-200">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <Award className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-purple-900 mb-2">Your Impact</h4>
              <p className="text-sm text-purple-800">
                By scoring candidates, you're helping them build their professional reputation and 
                increase their visibility to recruiters. Your expertise and feedback are invaluable 
                to their career growth.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
