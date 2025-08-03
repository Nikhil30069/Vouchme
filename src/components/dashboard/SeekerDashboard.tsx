
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Briefcase, TrendingUp, Clock, Send, Users, Star } from "lucide-react";
import { User } from "@/stores/authStore";
import { useJobStore } from "@/stores/jobStore";
import { useReferralStore } from "@/stores/referralStore";
import { JobRequirementForm } from "./JobRequirementForm";
import { StrengthScore } from "./StrengthScore";
import { ReferrerSelectionPopup } from "./ReferrerSelectionPopup";

interface SeekerDashboardProps {
  user: User;
}

export const SeekerDashboard = ({ user }: SeekerDashboardProps) => {
  const [showForm, setShowForm] = useState(false);
  const [showReferrerPopup, setShowReferrerPopup] = useState(false);
  const [selectedJob, setSelectedJob] = useState<{ id: string; role: string; experience: number } | null>(null);
  const { getJobsByUser } = useJobStore();
  const { fetchReferralRequests, referralRequests } = useReferralStore();
  
  const userJobs = getJobsByUser(user.id);

  useEffect(() => {
    fetchReferralRequests(user.id);
  }, [user.id, fetchReferralRequests]);

  // Calculate referral metrics
  const pendingRequests = referralRequests.filter(
    req => req.seeker_id === user.id && req.status === 'pending'
  ).length;
  
  const scoredRequests = referralRequests.filter(
    req => req.seeker_id === user.id && req.status === 'scored'
  ).length;

  const totalRequests = pendingRequests + scoredRequests;

  if (showForm) {
    return (
      <JobRequirementForm 
        user={user} 
        type="seeker" 
        onClose={() => setShowForm(false)} 
      />
    );
  }



  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user.name}!</h1>
        <p className="text-blue-100 mb-6">Ready to find your next opportunity?</p>
        <div className="flex flex-wrap gap-4">
          <Button 
            onClick={() => setShowForm(true)}
            className="bg-white text-blue-600 hover:bg-blue-50"
          >
            <Plus className="w-4 h-4 mr-2" />
            Post New Job Requirement
          </Button>
          <Button 
            onClick={() => setShowReferrerPopup(true)}
            variant="outline"
            className="border-white text-white hover:bg-white hover:text-blue-600 font-semibold text-base"
          >
            <Send className="w-4 h-4 mr-2" />
            Send Referral Requests
          </Button>
        </div>
      </div>

      {/* Strength Score Section */}
      <StrengthScore user={user} />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Applications</p>
                <p className="text-2xl font-bold text-gray-900">{userJobs.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Briefcase className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Referral Requests</p>
                <p className="text-2xl font-bold text-gray-900">{totalRequests}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <Send className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Reviews</p>
                <p className="text-2xl font-bold text-gray-900">{pendingRequests}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed Reviews</p>
                <p className="text-2xl font-bold text-gray-900">{scoredRequests}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <Star className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Referral Requests Status */}
      {totalRequests > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Referral Requests Status</span>
            </CardTitle>
            <CardDescription>Track your referral requests and their current status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {referralRequests
                .filter(req => req.seeker_id === user.id)
                .map((request) => (
                  <div key={request.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium text-gray-900">{request.job_role}</h3>
                        <p className="text-sm text-gray-600">
                          Requested on {new Date(request.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge 
                        variant={request.status === 'scored' ? 'default' : 'secondary'}
                        className={
                          request.status === 'scored' 
                            ? 'bg-green-100 text-green-800' 
                            : request.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }
                      >
                        {request.status === 'scored' ? 'Completed' : 
                         request.status === 'pending' ? 'Pending Review' : 
                         request.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Your Experience:</span> {request.seeker_experience_years} years
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Job Requirements History */}
      <Card>
        <CardHeader>
          <CardTitle>Your Job Requirements</CardTitle>
          <CardDescription>Track all your job applications and requirements</CardDescription>
        </CardHeader>
        <CardContent>
          {userJobs.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No job requirements yet</h3>
              <p className="text-gray-500 mb-4">Get started by posting your first job requirement</p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Post Job Requirement
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {userJobs.map((job) => (
                <div key={job.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-gray-900">{job.role}</h3>
                    <Badge variant="outline">{job.yearsOfExperience} years exp</Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                    <div>
                      <span className="font-medium">Current CTC:</span> ₹{job.currentCTC?.toLocaleString()}
                    </div>
                    <div>
                      <span className="font-medium">Expected CTC:</span> ₹{job.expectedCTC?.toLocaleString()}
                    </div>
                    <div>
                      <span className="font-medium">Notice Period:</span> {job.noticePeriod} days
                    </div>
                    <div>
                      <span className="font-medium">Applied:</span> {new Date(job.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button 
                      onClick={() => {
                        setSelectedJob({ id: job.id, role: job.role, experience: job.yearsOfExperience });
                        setShowReferrerPopup(true);
                      }}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Request Referral
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Referrer Selection Popup */}
      {showReferrerPopup && selectedJob && (
        <ReferrerSelectionPopup
          isOpen={showReferrerPopup}
          onClose={() => {
            setShowReferrerPopup(false);
            setSelectedJob(null);
          }}
          jobRequirementId={selectedJob.id}
          jobRole={selectedJob.role}
          jobExperience={selectedJob.experience}
        />
      )}

    </div>
  );
};
