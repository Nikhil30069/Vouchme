
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Star, Users, Award, FileText } from "lucide-react";
import { User } from "@/stores/authStore";
import { useJobStore } from "@/stores/jobStore";

interface ReferrerDashboardProps {
  user: User;
}

export const ReferrerDashboard = ({ user }: ReferrerDashboardProps) => {
  const { getProfilesByRole, addScore } = useJobStore();
  const [scores, setScores] = useState<Record<string, number>>({});
  
  const eligibleProfiles = user.workExperience 
    ? getProfilesByRole(user.workExperience.role, user.workExperience.years)
    : [];

  const handleScoreChange = (profileId: string, score: number) => {
    setScores(prev => ({ ...prev, [profileId]: score }));
  };

  const handleSubmitScore = (profileId: string) => {
    const score = scores[profileId];
    if (score >= 1 && score <= 10) {
      addScore(profileId, user.id, user.name, score);
      setScores(prev => ({ ...prev, [profileId]: 0 }));
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
                <p className="text-sm text-gray-600">Profiles to Review</p>
                <p className="text-2xl font-bold text-gray-900">{eligibleProfiles.length}</p>
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
                <p className="text-sm text-gray-600">Reviews Given</p>
                <p className="text-2xl font-bold text-gray-900">
                  {eligibleProfiles.reduce((sum, profile) => 
                    sum + profile.scores.filter(s => s.referrerId === user.id).length, 0
                  )}
                </p>
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
                <p className="text-sm text-gray-600">Average Score Given</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(() => {
                    const allScores = eligibleProfiles.flatMap(profile => 
                      profile.scores.filter(s => s.referrerId === user.id).map(s => s.score)
                    );
                    return allScores.length ? (allScores.reduce((a, b) => a + b, 0) / allScores.length).toFixed(1) : '0';
                  })()}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Star className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Profiles to Review */}
      <Card>
        <CardHeader>
          <CardTitle>Candidate Profiles to Review</CardTitle>
          <CardDescription>
            Review profiles from candidates with {user.workExperience?.role} role and ≤{user.workExperience?.years} years experience
          </CardDescription>
        </CardHeader>
        <CardContent>
          {eligibleProfiles.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No profiles to review</h3>
              <p className="text-gray-500">Candidates matching your criteria will appear here</p>
            </div>
          ) : (
            <div className="space-y-6">
              {eligibleProfiles.map((profile) => {
                const existingScore = profile.scores.find(s => s.referrerId === user.id);
                const currentScore = scores[profile.id] || existingScore?.score || 0;

                return (
                  <div key={profile.id} className="p-6 border rounded-lg bg-white shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{profile.role}</h3>
                        <div className="flex items-center space-x-4 mt-2">
                          <Badge variant="outline">{profile.yearsOfExperience} years exp</Badge>
                          <span className="text-sm text-gray-600">
                            Expected CTC: ₹{profile.expectedCtc?.toLocaleString()}
                          </span>
                          <span className="text-sm text-gray-600">
                            Notice: {profile.noticePeriod} days
                          </span>
                        </div>
                      </div>
                      
                      {profile.scores.length > 0 && (
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Average Score</p>
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-500 mr-1" />
                            <span className="font-medium">
                              {(profile.scores.reduce((sum, s) => sum + s.score, 0) / profile.scores.length).toFixed(1)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {profile.resumeUrl && (
                      <div className="mb-4">
                        <Button variant="outline" size="sm">
                          <FileText className="w-4 h-4 mr-2" />
                          View Resume
                        </Button>
                      </div>
                    )}

                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <label className="text-sm font-medium text-gray-700">Your Score (1-10):</label>
                        <Input
                          type="number"
                          min="1"
                          max="10"
                          value={currentScore || ''}
                          onChange={(e) => handleScoreChange(profile.id, parseInt(e.target.value) || 0)}
                          className="w-20"
                          placeholder="0"
                        />
                      </div>
                      
                      <Button
                        onClick={() => handleSubmitScore(profile.id)}
                        disabled={!scores[profile.id] || scores[profile.id] < 1 || scores[profile.id] > 10}
                        size="sm"
                      >
                        {existingScore ? 'Update Score' : 'Submit Score'}
                      </Button>
                    </div>

                    {existingScore && (
                      <p className="text-sm text-green-600 mt-2">
                        You previously scored this profile: {existingScore.score}/10
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
