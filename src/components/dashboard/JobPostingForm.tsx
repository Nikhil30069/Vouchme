import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Briefcase, DollarSign, FileText } from "lucide-react";
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
    title: "",
    role: "",
    years_of_experience: 0,
    salary_min: 0,
    salary_max: 0,
    description: "",
    requirements: [] as string[]
  });

  const [newRequirement, setNewRequirement] = useState("");

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddRequirement = () => {
    if (newRequirement.trim()) {
      setFormData(prev => ({
        ...prev,
        requirements: [...prev.requirements, newRequirement.trim()]
      }));
      setNewRequirement("");
    }
  };

  const handleRemoveRequirement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.role || formData.years_of_experience <= 0) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.salary_min > formData.salary_max) {
      toast.error("Minimum salary cannot be greater than maximum salary");
      return;
    }

    try {
      await createJobPosting({
        recruiter_id: user.id,
        title: formData.title,
        role: formData.role,
        years_of_experience: formData.years_of_experience,
        salary_min: formData.salary_min || undefined,
        salary_max: formData.salary_max || undefined,
        description: formData.description || undefined,
        requirements: formData.requirements.length > 0 ? formData.requirements : undefined
      });

      toast.success("Job posting created successfully!");
      onClose();
    } catch (error) {
      toast.error("Failed to create job posting. Please try again.");
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Briefcase className="w-5 h-5" />
          <span>Create Job Posting</span>
        </CardTitle>
        <CardDescription>
          Create a new job posting to find top candidates based on strength scores
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Job Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="e.g., Senior Software Engineer"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Job Role *</Label>
              <Select value={formData.role} onValueChange={(value) => handleInputChange("role", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select job role" />
                </SelectTrigger>
                <SelectContent>
                  {JOB_ROLES.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="experience">Years of Experience Required *</Label>
              <Input
                id="experience"
                type="number"
                min="0"
                max="50"
                value={formData.years_of_experience || ""}
                onChange={(e) => handleInputChange("years_of_experience", parseInt(e.target.value) || 0)}
                placeholder="e.g., 3"
                required
              />
            </div>
          </div>

          {/* Salary Range */}
          <div className="space-y-2">
            <Label className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4" />
              <span>Salary Range (Optional)</span>
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="salary_min">Minimum Salary (₹)</Label>
                <Input
                  id="salary_min"
                  type="number"
                  min="0"
                  value={formData.salary_min || ""}
                  onChange={(e) => handleInputChange("salary_min", parseInt(e.target.value) || 0)}
                  placeholder="e.g., 500000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salary_max">Maximum Salary (₹)</Label>
                <Input
                  id="salary_max"
                  type="number"
                  min="0"
                  value={formData.salary_max || ""}
                  onChange={(e) => handleInputChange("salary_max", parseInt(e.target.value) || 0)}
                  placeholder="e.g., 1500000"
                />
              </div>
            </div>
          </div>

          {/* Job Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Job Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Describe the role, responsibilities, and what you're looking for in a candidate..."
              rows={4}
            />
          </div>

          {/* Requirements */}
          <div className="space-y-2">
            <Label className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>Requirements</span>
            </Label>
            <div className="space-y-3">
              <div className="flex space-x-2">
                <Input
                  value={newRequirement}
                  onChange={(e) => setNewRequirement(e.target.value)}
                  placeholder="Add a requirement (e.g., React experience)"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddRequirement())}
                />
                <Button
                  type="button"
                  onClick={handleAddRequirement}
                  disabled={!newRequirement.trim()}
                  size="sm"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              
              {formData.requirements.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.requirements.map((req, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                      <span>{req}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveRequirement(index)}
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Job Posting"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}; 