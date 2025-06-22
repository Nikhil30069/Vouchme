
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, Search, Calendar } from "lucide-react";
import { User } from "@/stores/authStore";
import { useJobStore } from "@/stores/jobStore";
import { JobRequirementForm } from "./JobRequirementForm";
import { CandidateMatching } from "./CandidateMatching";

interface RecruiterDashboardProps {
  user: User;
}

export const RecruiterDashboard = ({ user }: RecruiterDashboardProps) => {
  const [showForm, setShowForm] = useState(false);
  const [showMatching, setShowMatching] = useState(false);
  const { getJobsByUser } = useJobStore();
  
  const userJobs = getJobsByUser(user.id);

  if (showForm) {
    return (
      <JobRequirementForm 
        user={user} 
        type="recruiter" 
        onClose={() => setShowForm(false)} 
      />
    );
  }

  if (showMatching) {
    return (
      <CandidateMatching 
        onClose={() => setShowMatching(false)} 
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
            onClick={() => setShowForm(true)}
            className="bg-white text-green-600 hover:bg-green-50"
          >
            <Plus className="w-4 h-4 mr-2" />
            Post Job Requirement
          </Button>
          <Button 
            onClick={() => setShowMatching(true)}
            variant="outline"
            className="border-white text-white hover:bg-white hover:text-green-600"
          >
            <Search className="w-4 h-4 mr-2" />
            Find Candidates
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Job Postings</p>
                <p className="text-2xl font-bold text-gray-900">{userJobs.length}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <Users className="w-6 h-6 text-green-600" />
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
              <div className="bg-blue-100 p-3 rounded-full">
                <Search className="w-6 h-6 text-blue-600" />
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
              <div className="bg-purple-100 p-3 rounded-full">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Job Requirements History */}
      <Card>
        <CardHeader>
          <CardTitle>Your Job Postings</CardTitle>
          <CardDescription>Manage your job requirements and track applications</CardDescription>
        </CardHeader>
        <CardContent>
          {userJobs.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No job postings yet</h3>
              <p className="text-gray-500 mb-4">Start by posting your first job requirement</p>
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
                    <Badge variant="outline">{job.yearsOfExperience}+ years exp</Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Salary Range:</span> ₹{job.salaryBracket?.min.toLocaleString()} - ₹{job.salaryBracket?.max.toLocaleString()}
                    </div>
                    <div>
                      <span className="font-medium">Ready to join:</span> {job.readyToJoinIn} days
                    </div>
                    <div>
                      <span className="font-medium">Posted:</span> {new Date(job.createdAt).toLocaleDateString()}
                    </div>
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
