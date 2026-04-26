import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, FileText, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { JOB_ROLES } from "@/constants/roles";
import type { User } from "@/stores/authStore";

interface JobRequirementFormProps {
  user: User;
  type: "seeker" | "recruiter" | "referrer";
  onClose: () => void;
}

export const JobRequirementForm = ({ user, type, onClose }: JobRequirementFormProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    role: "",
    yearsOfExperience: "",
    currentCtc: "",
    expectedCtc: "",
    salaryBracketMin: "",
    salaryBracketMax: "",
    noticePeriod: "",
    readyToJoinIn: "",
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((p) => ({ ...p, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let uploadedResumeUrl = "";
      if (resumeFile) {
        const fileExt = resumeFile.name.split(".").pop();
        const filePath = `${user.id}/${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("resumes")
          .upload(filePath, resumeFile, { upsert: true, cacheControl: "3600" });
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from("resumes").getPublicUrl(filePath);
        uploadedResumeUrl = data.publicUrl;
      }

      const jobData: Record<string, unknown> = {
        userId: user.id,
        role: formData.role,
        yearsOfExperience: parseInt(formData.yearsOfExperience),
        type,
        createdAt: new Date().toISOString(),
      };

      if (type === "seeker") {
        Object.assign(jobData, {
          currentCtc: parseInt(formData.currentCtc),
          expectedCtc: parseInt(formData.expectedCtc),
          noticePeriod: parseInt(formData.noticePeriod),
          resumeUrl: uploadedResumeUrl || null,
        });
      } else if (type === "recruiter") {
        Object.assign(jobData, {
          salaryBracketMin: parseInt(formData.salaryBracketMin),
          salaryBracketMax: parseInt(formData.salaryBracketMax),
          readyToJoinIn: parseInt(formData.readyToJoinIn),
        });
      }

      const { error: insertError } = await supabase
        .from("job_requirements")
        .insert([jobData as any]);
      if (insertError) throw insertError;

      toast({
        title: "Saved",
        description: "Your requirement is live.",
      });
      onClose();
    } catch (err) {
      console.error(err);
      toast({
        title: "Couldn't save",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-3xl"
    >
      <Card className="rounded-2xl border-slate-200/70 bg-white shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="rounded-full"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle>
              {type === "seeker" ? "Post a job requirement" : "Post a job opening"}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(v) => handleInputChange("role", v)}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {JOB_ROLES.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">Years of experience</Label>
                <Input
                  id="experience"
                  type="number"
                  value={formData.yearsOfExperience}
                  onChange={(e) =>
                    handleInputChange("yearsOfExperience", e.target.value)
                  }
                  placeholder="e.g. 3"
                  className="h-11"
                  required
                />
              </div>
            </div>

            {type === "seeker" && (
              <>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="currentCtc">Current CTC (₹)</Label>
                    <Input
                      id="currentCtc"
                      type="number"
                      value={formData.currentCtc}
                      onChange={(e) =>
                        handleInputChange("currentCtc", e.target.value)
                      }
                      placeholder="e.g. 800000"
                      className="h-11"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expectedCtc">Expected CTC (₹)</Label>
                    <Input
                      id="expectedCtc"
                      type="number"
                      value={formData.expectedCtc}
                      onChange={(e) =>
                        handleInputChange("expectedCtc", e.target.value)
                      }
                      placeholder="e.g. 1200000"
                      className="h-11"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="noticePeriod">Notice period (days)</Label>
                  <Input
                    id="noticePeriod"
                    type="number"
                    value={formData.noticePeriod}
                    onChange={(e) =>
                      handleInputChange("noticePeriod", e.target.value)
                    }
                    placeholder="e.g. 30"
                    className="h-11"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Resume</Label>
                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/50 p-6 text-center transition hover:border-brand-300 hover:bg-brand-50/30">
                    <Upload className="mb-2 h-7 w-7 text-slate-400" />
                    <span className="text-sm font-medium text-slate-700">
                      {resumeFile ? resumeFile.name : "Upload your resume (PDF)"}
                    </span>
                    <span className="mt-1 text-xs text-slate-500">
                      Click or drop a file
                    </span>
                    <input
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) setResumeFile(f);
                      }}
                    />
                  </label>
                  {resumeFile && (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <FileText className="h-3.5 w-3.5" />
                      Ready to upload: {resumeFile.name}
                    </div>
                  )}
                </div>
              </>
            )}

            {type === "recruiter" && (
              <>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="salaryMin">Salary min (₹)</Label>
                    <Input
                      id="salaryMin"
                      type="number"
                      value={formData.salaryBracketMin}
                      onChange={(e) =>
                        handleInputChange("salaryBracketMin", e.target.value)
                      }
                      placeholder="e.g. 800000"
                      className="h-11"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salaryMax">Salary max (₹)</Label>
                    <Input
                      id="salaryMax"
                      type="number"
                      value={formData.salaryBracketMax}
                      onChange={(e) =>
                        handleInputChange("salaryBracketMax", e.target.value)
                      }
                      placeholder="e.g. 1500000"
                      className="h-11"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="readyToJoin">Ready to join in (days)</Label>
                  <Input
                    id="readyToJoin"
                    type="number"
                    value={formData.readyToJoinIn}
                    onChange={(e) =>
                      handleInputChange("readyToJoinIn", e.target.value)
                    }
                    placeholder="e.g. 45"
                    className="h-11"
                    required
                  />
                </div>
              </>
            )}

            <div className="flex justify-end gap-3 border-t border-slate-200 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="rounded-xl bg-slate-900 text-white hover:bg-slate-800"
              >
                {isLoading
                  ? "Saving…"
                  : type === "seeker"
                  ? "Post requirement"
                  : "Post opening"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};
