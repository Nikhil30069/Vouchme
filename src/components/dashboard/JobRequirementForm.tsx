import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Upload } from "lucide-react";
import { User } from "@/stores/authStore";
import { useJobStore } from "@/stores/jobStore";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface JobRequirementFormProps {
  user: User;
  type: "seeker" | "recruiter";
  onClose: () => void;
}

export const JobRequirementForm = ({
  user,
  type,
  onClose,
}: JobRequirementFormProps) => {
  const [formData, setFormData] = useState({
    role: "",
    yearsOfExperience: "",
    currentCTC: "",
    expectedCTC: "",
    salaryBracketMin: "",
    salaryBracketMax: "",
    noticePeriod: "",
    readyToJoinIn: "",
    resumeUrl: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const { addJobRequirement } = useJobStore();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let uploadedResumeUrl = "";

      // Upload resume file to Supabase Storage if present
      if (resumeFile) {
        const fileExt = resumeFile.name.split(".").pop();
        const filePath = `resumes/${user.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("resumes")
          .upload(filePath, resumeFile);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from("resumes")
          .getPublicUrl(filePath);

        uploadedResumeUrl = publicUrlData.publicUrl;
      }

      // Construct the job data
      const jobData = {
        userId: user.id,
        role: formData.role,
        yearsOfExperience: parseInt(formData.yearsOfExperience),
        type,
        createdAt: new Date().toISOString(),
      };

      if (type === "seeker") {
        Object.assign(jobData, {
          currentCtc: parseInt(formData.currentCTC),
          expectedCtc: parseInt(formData.expectedCTC),
          noticePeriod: parseInt(formData.noticePeriod),
          resumeUrl: uploadedResumeUrl,
        });
      } else if (type === "recruiter") {
        Object.assign(jobData, {
          salaryBracketMin: parseInt(formData.salaryBracketMin),
          salaryBracketMax: parseInt(formData.salaryBracketMax),
          readyToJoinIn: parseInt(formData.readyToJoinIn),
        });
      }

      const { error: insertError } = await supabase
        .from("job_requirements") // or your actual table
        .insert([jobData]);

      if (insertError) throw insertError;

      toast({
        title: "Success",
        description: "Job requirement posted successfully!",
      });

      addJobRequirement(jobData); // your local store (optional)
      onClose();
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to post job requirement.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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
              {type === "seeker" ? "Post Job Requirement" : "Post Job Opening"}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  onValueChange={(value) => handleInputChange("role", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="software-developer">
                      Software Developer
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">Years of Experience</Label>
                <Input
                  type="number"
                  value={formData.yearsOfExperience}
                  onChange={(e) =>
                    handleInputChange("yearsOfExperience", e.target.value)
                  }
                  placeholder="e.g., 3"
                  required
                />
              </div>
            </div>

            {type === "seeker" && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentCTC">Current CTC (₹)</Label>
                    <Input
                      type="number"
                      value={formData.currentCTC}
                      onChange={(e) =>
                        handleInputChange("currentCTC", e.target.value)
                      }
                      placeholder="e.g., 800000"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="expectedCTC">Expected CTC (₹)</Label>
                    <Input
                      type="number"
                      value={formData.expectedCTC}
                      onChange={(e) =>
                        handleInputChange("expectedCTC", e.target.value)
                      }
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
                    onChange={(e) =>
                      handleInputChange("noticePeriod", e.target.value)
                    }
                    placeholder="e.g., 30"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="resume">Resume Upload</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      Upload your resume (PDF)
                    </p>
                    <Input
                      type="file"
                      accept=".pdf"
                      className="mt-2"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setResumeFile(file);
                        }
                      }}
                    />
                  </div>
                </div>
              </>
            )}

            {type === "recruiter" && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="salaryMin">Salary Min (₹)</Label>
                    <Input
                      type="number"
                      value={formData.salaryBracketMin}
                      onChange={(e) =>
                        handleInputChange("salaryBracketMin", e.target.value)
                      }
                      placeholder="e.g., 800000"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="salaryMax">Salary Max (₹)</Label>
                    <Input
                      type="number"
                      value={formData.salaryBracketMax}
                      onChange={(e) =>
                        handleInputChange("salaryBracketMax", e.target.value)
                      }
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
                    onChange={(e) =>
                      handleInputChange("readyToJoinIn", e.target.value)
                    }
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
                {type === "seeker" ? "Post Requirement" : "Post Job Opening"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
