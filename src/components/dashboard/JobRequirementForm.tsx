
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Upload } from "lucide-react";
import { User } from "@/stores/authStore";
import { useJobStore } from "@/stores/jobStore";

interface JobRequirementFormProps {
  user: User;
  type: 'seeker' | 'recruiter';
  onClose: () => void;
}

export const JobRequirementForm = ({ user, type, onClose }: JobRequirementFormProps) => {
  const [formData, setFormData] = useState({
    role: '',
    yearsOfExperience: '',
    currentCTC: '',
    expectedCTC: '',
    salaryBracketMin: '',
    salaryBracketMax: '',
    noticePeriod: '',
    readyToJoinIn: '',
    resumeUrl: ''
  });

  const { addJobRequirement } = useJobStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const jobData = {
      userId: user.id,
      role: formData.role,
      yearsOfExperience: parseInt(formData.yearsOfExperience),
      type,
      ...(type === 'seeker' && {
        currentCTC: parseInt(formData.currentCTC),
        expectedCTC: parseInt(formData.expectedCTC),
        noticePeriod: parseInt(formData.noticePeriod),
        resumeUrl: formData.resumeUrl
      }),
      ...(type === 'recruiter' && {
        salaryBracket: {
          min: parseInt(formData.salaryBracketMin),
          max: parseInt(formData.salaryBracketMax)
        },
        readyToJoinIn: parseInt(formData.readyToJoinIn)
      })
    };

    addJobRequirement(jobData);
    onClose();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onClose}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <CardTitle>
              {type === 'seeker' ? 'Post Job Requirement' : 'Post Job Opening'}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select onValueChange={(value) => handleInputChange('role', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="software-developer">Software Developer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">Years of Experience</Label>
                <Input
                  type="number"
                  value={formData.yearsOfExperience}
                  onChange={(e) => handleInputChange('yearsOfExperience', e.target.value)}
                  placeholder="e.g., 3"
                  required
                />
              </div>
            </div>

            {type === 'seeker' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentCTC">Current CTC (₹)</Label>
                    <Input
                      type="number"
                      value={formData.currentCTC}
                      onChange={(e) => handleInputChange('currentCTC', e.target.value)}
                      placeholder="e.g., 800000"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="expectedCTC">Expected CTC (₹)</Label>
                    <Input
                      type="number"
                      value={formData.expectedCTC}
                      onChange={(e) => handleInputChange('expectedCTC', e.target.value)}
                      placeholder="e.g., 1200000"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="noticePeriod">Notice Period (Days)</Label>
                  <Input
                    type="number"
                    value={formData.noticePeriod}
                    onChange={(e) => handleInputChange('noticePeriod', e.target.value)}
                    placeholder="e.g., 30"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="resume">Resume Upload</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Upload your resume (PDF)</p>
                    <Input
                      type="file"
                      accept=".pdf"
                      className="mt-2"
                      onChange={(e) => handleInputChange('resumeUrl', e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}

            {type === 'recruiter' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="salaryMin">Salary Min (₹)</Label>
                    <Input
                      type="number"
                      value={formData.salaryBracketMin}
                      onChange={(e) => handleInputChange('salaryBracketMin', e.target.value)}
                      placeholder="e.g., 800000"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="salaryMax">Salary Max (₹)</Label>
                    <Input
                      type="number"
                      value={formData.salaryBracketMax}
                      onChange={(e) => handleInputChange('salaryBracketMax', e.target.value)}
                      placeholder="e.g., 1500000"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="readyToJoin">Ready to Join in (Days)</Label>
                  <Input
                    type="number"
                    value={formData.readyToJoinIn}
                    onChange={(e) => handleInputChange('readyToJoinIn', e.target.value)}
                    placeholder="e.g., 45"
                    required
                  />
                </div>
              </>
            )}

            <div className="flex gap-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                {type === 'seeker' ? 'Post Requirement' : 'Post Job Opening'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
