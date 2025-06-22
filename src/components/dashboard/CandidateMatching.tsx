
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, User, FileText, Star } from "lucide-react";
import { useJobStore } from "@/stores/jobStore";

interface CandidateMatchingProps {
  onClose: () => void;
}

export const CandidateMatching = ({ onClose }: CandidateMatchingProps) => {
  const { profiles } = useJobStore();

  // For demo purposes, showing all profiles
  const candidates = profiles;

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onClose}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <CardTitle>Find Candidates</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {candidates.length === 0 ? (
            <div className="text-center py-12">
              <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No candidates found</h3>
              <p className="text-gray-500">There are no candidate profiles available at the moment.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-sm text-gray-600 mb-4">
                Found {candidates.length} candidate(s)
              </div>
              
              {candidates.map((candidate) => {
                const avgScore = candidate.scores.length 
                  ? candidate.scores.reduce((sum, s) => sum + s.score, 0) / candidate.scores.length 
                  : 0;

                return (
                  <Card key={candidate.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{candidate.role}</h3>
                          <p className="text-gray-600">{candidate.yearsOfExperience} years experience</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {avgScore > 0 && (
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                              <span className="font-medium">{avgScore.toFixed(1)}/10</span>
                            </div>
                          )}
                          <Badge variant="secondary">{candidate.yearsOfExperience} yrs exp</Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                        {candidate.currentCTC && (
                          <div>
                            <span className="font-medium">Current CTC:</span> ₹{candidate.currentCTC.toLocaleString()}
                          </div>
                        )}
                        {candidate.expectedCTC && (
                          <div>
                            <span className="font-medium">Expected CTC:</span> ₹{candidate.expectedCTC.toLocaleString()}
                          </div>
                        )}
                        {candidate.noticePeriod && (
                          <div>
                            <span className="font-medium">Notice Period:</span> {candidate.noticePeriod} days
                          </div>
                        )}
                        <div>
                          <span className="font-medium">Profile Created:</span> {new Date(candidate.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      {candidate.scores.length > 0 && (
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-900 mb-2">Referrer Scores:</h4>
                          <div className="flex flex-wrap gap-2">
                            {candidate.scores.map((score, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {score.referrerName}: {score.score}/10
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2">
                        {candidate.resumeUrl && (
                          <Button size="sm" variant="outline">
                            <FileText className="w-4 h-4 mr-2" />
                            View Resume
                          </Button>
                        )}
                        <Button size="sm">
                          Contact Candidate
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
