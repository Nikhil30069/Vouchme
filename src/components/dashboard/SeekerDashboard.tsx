
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Briefcase, TrendingUp, Clock } from "lucide-react";
import { User } from "@/stores/authStore";
import { useJobStore } from "@/stores/jobStore";
import { JobRequirementForm } from "./JobRequirementForm";

interface SeekerDashboardProps {
  user: User;
}

export const SeekerDashboard = ({ user }: SeekerDashboardProps) => {
  const [showForm, setShowForm] = useState(false);
  const { getJobsByUser } = useJobStore();
  
  const userJobs = getJobsByUser(user.id);

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
        <Button 
          onClick={() => setShowForm(true)}
          className="bg-white text-blue-600 hover:bg-blue-50"
        >
          <Plus className="w-4 h-4 mr-2" />
          Post New Job Requirement
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                <p className="text-sm text-gray-600">Profile Views</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Applications</p>
                <p className="text-2xl font-bold text-gray-900">{userJobs.length}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
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
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
