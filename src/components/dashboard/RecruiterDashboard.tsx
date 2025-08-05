
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, Search, Calendar, Briefcase, TrendingUp } from "lucide-react";
import { User } from "@/stores/authStore";
import { useReferralStore } from "@/stores/referralStore";
import { TopCandidates } from "./TopCandidates";
import { JobPostingForm } from "./JobPostingForm";

interface RecruiterDashboardProps {
  user: User;
}

export const RecruiterDashboard = ({ user }: RecruiterDashboardProps) => {
  const [showJobPostingForm, setShowJobPostingForm] = useState(false);
  const [showTopCandidates, setShowTopCandidates] = useState(false);
  const [selectedJobPostingId, setSelectedJobPostingId] = useState<string | null>(null);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  
  const { fetchJobPostings, jobPostings, updateJobPosting } = useReferralStore();

  useEffect(() => {
    fetchJobPostings(user.id);
  }, [user.id, fetchJobPostings]);

  const handleToggleJobStatus = async (jobId: string, currentStatus: boolean) => {
    try {
      await updateJobPosting(jobId, { is_active: !currentStatus });
      // State will be updated automatically by the updateJobPosting function
    } catch (error) {
      console.error('Failed to toggle job status:', error);
    }
  };

  const handleEditJob = (jobId: string) => {
    setEditingJobId(jobId);
    setShowJobPostingForm(true);
  };



  if (showJobPostingForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Create Job Posting</h1>
          <Button variant="outline" onClick={() => setShowJobPostingForm(false)}>
            Back to Dashboard
          </Button>
        </div>
        <JobPostingForm user={user} onClose={() => setShowJobPostingForm(false)} />
      </div>
    );
  }

  if (showTopCandidates && selectedJobPostingId) {
    return (
      <TopCandidates 
        user={user} 
        jobPostingId={selectedJobPostingId}
        onClose={() => {
          setShowTopCandidates(false);
          setSelectedJobPostingId(null);
        }} 
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user.name}!</h1>
        <p className="text-green-100 mb-6">Find the perfect candidates for your team</p>
        <div className="flex flex-wrap gap-4">
          <Button 
            onClick={() => setShowJobPostingForm(true)}
            className="bg-white text-green-600 hover:bg-green-50"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Job Posting
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Job Postings</p>
                <p className="text-2xl font-bold text-gray-900">{jobPostings.length}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <Briefcase className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Postings</p>
                <p className="text-2xl font-bold text-gray-900">
                  {jobPostings.filter(job => job.is_active).length}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Candidates Found</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
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
                <p className="text-sm text-gray-600">Interviews Scheduled</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <Calendar className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Job Postings */}
      <Card>
        <CardHeader>
          <CardTitle>Your Job Postings</CardTitle>
          <CardDescription>Manage your job postings and find top candidates</CardDescription>
        </CardHeader>
        <CardContent>
          {jobPostings.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No job postings yet</h3>
              <p className="text-gray-500 mb-4">Start by creating your first job posting to find candidates</p>
              <Button onClick={() => setShowJobPostingForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Job Posting
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {jobPostings.map((job) => (
                <div key={job.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium text-gray-900">{job.title}</h3>
                      <p className="text-sm text-gray-600">{job.role}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{job.years_of_experience}+ years exp</Badge>
                      <Badge variant={job.is_active ? "default" : "secondary"}>
                        {job.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                    <div>
                      <span className="font-medium">Salary Range:</span> 
                      {job.salary_min && job.salary_max 
                        ? ` ₹${job.salary_min.toLocaleString()} - ₹${job.salary_max.toLocaleString()}`
                        : " Not specified"
                      }
                    </div>
                    <div>
                      <span className="font-medium">Posted:</span> {new Date(job.created_at).toLocaleDateString()}
                    </div>
                    <div>
                      <span className="font-medium">Requirements:</span> {job.requirements?.length || 0} items
                    </div>
                    <div>
                      <span className="font-medium">Status:</span> {job.is_active ? "Active" : "Inactive"}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Button
                      onClick={() => {
                        setSelectedJobPostingId(job.id);
                        setShowTopCandidates(true);
                      }}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Search className="w-4 h-4 mr-2" />
                      Find Top Candidates
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditJob(job.id)}
                    >
                      Edit Posting
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleToggleJobStatus(job.id, job.is_active)}
                    >
                      {job.is_active ? "Deactivate" : "Activate"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>


    </div>
  );
};
