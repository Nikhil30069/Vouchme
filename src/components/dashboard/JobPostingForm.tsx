import { useState } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Briefcase, DollarSign } from "lucide-react";
import { User } from "@/stores/authStore";
import { useReferralStore } from "@/stores/referralStore";
import { toast } from "sonner";
import { JOB_ROLES } from "@/constants/roles";

interface JobPostingFormProps {
  user: User;
  onClose: () => void;
}

export const JobPostingForm = ({ user, onClose }: JobPostingFormProps) => {
  const { createJobPosting, loading } = useReferralStore();

  const [formData, setFormData] = useState({
    role: "",
    years_of_experience: 0,
    salary_min: 0,
    salary_max: 0,
    description: "",
    requirements: [] as string[],
  });

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.role || formData.years_of_experience <= 0) {
      toast.error("Please fill in role and years of experience");
      return;
    }
    if (formData.salary_min && formData.salary_max && formData.salary_min > formData.salary_max) {
      toast.error("Minimum salary cannot exceed maximum");
      return;
    }
    try {
      await createJobPosting({
        recruiter_id: user.id,
        role: formData.role,
        years_of_experience: formData.years_of_experience,
        salary_min: formData.salary_min || undefined,
        salary_max: formData.salary_max || undefined,
        description: formData.description || undefined,
        requirements:
          formData.requirements.length > 0 ? formData.requirements : undefined,
      });
      toast.success("Job posting created!");
      onClose();
    } catch {
      toast.error("Failed to create job posting. Try again.");
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
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-emerald-600" /> New job posting
          </CardTitle>
          <CardDescription>
            Find the top three candidates ranked by their karma score.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => handleInputChange("role", value)}
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
                <Label htmlFor="experience">Years of experience *</Label>
                <Input
                  id="experience"
                  type="number"
                  min={0}
                  max={50}
                  value={formData.years_of_experience || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "years_of_experience",
                      parseInt(e.target.value) || 0
                    )
                  }
                  placeholder="e.g. 3"
                  className="h-11"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" /> Salary range (optional)
              </Label>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="salary_min" className="text-xs text-slate-500">
                    Minimum (₹)
                  </Label>
                  <Input
                    id="salary_min"
                    type="number"
                    min={0}
                    value={formData.salary_min || ""}
                    onChange={(e) =>
                      handleInputChange("salary_min", parseInt(e.target.value) || 0)
                    }
                    placeholder="e.g. 500000"
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salary_max" className="text-xs text-slate-500">
                    Maximum (₹)
                  </Label>
                  <Input
                    id="salary_max"
                    type="number"
                    min={0}
                    value={formData.salary_max || ""}
                    onChange={(e) =>
                      handleInputChange("salary_max", parseInt(e.target.value) || 0)
                    }
                    placeholder="e.g. 1500000"
                    className="h-11"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Job description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="What does success look like in this role?"
                rows={4}
              />
            </div>

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
                disabled={loading}
                className="rounded-xl bg-slate-900 text-white hover:bg-slate-800"
              >
                {loading ? "Creating…" : "Create posting"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};
