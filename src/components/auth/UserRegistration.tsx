"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserPlus } from "lucide-react";
import { useAuthStore, User } from "@/stores/authStore";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { JOB_ROLES } from "@/constants/roles";

interface UserRegistrationProps {
  phoneNumber: string;
  password: string;
}

export const UserRegistration = ({ phoneNumber, password }: UserRegistrationProps) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    persona: "" as "seeker" | "recruiter" | "referrer" | "",
    workExperience: {
      role: "",
      years: 0,
      organization: "",
    },
    password: password || "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const { login } = useAuthStore();
  const { toast } = useToast();

  // 🔍 Check if user is already registered
  useEffect(() => {
    const checkProfile = async () => {
      if (!phoneNumber) {
        setIsChecking(false);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("phone", phoneNumber)
        .single();

      if (!profileError && profile) {
        // Store the profile object as a string in localStorage
        localStorage.setItem("userProfile", JSON.stringify(profile));
        login(profile);
      } else {
        setIsChecking(false); // No profile found, show form
      }
    };

    checkProfile();
  }, [login]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate referrer experience requirement
      if (formData.persona === "referrer" && formData.workExperience.years < 2) {
        toast({
          title: "Experience Required",
          description: "Referrers must have at least 2 years of work experience to join our platform.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Generate a unique id if needed, or let DB handle it
      const userObj: User & { password: string } = {
        id: crypto.randomUUID(), // Generate a unique ID
        name: formData.name,
        phone: phoneNumber,
        email: formData.email,
        persona: formData.persona,
        workExperience:
          formData.persona === "referrer" ? formData.workExperience : undefined,
        createdAt: `${new Date()}`,
        password: formData.password,
      };

    const { error: insertError, data } = await supabase
      .from("profiles")
      .insert([userObj])
      .select()
      .single();

    if (insertError) throw insertError;

    login(data || userObj);

    toast({
      title: "Success",
      description: "Profile created successfully!",
    });
  } catch (error) {
    console.log(error);
    toast({
      title: "Error",
      description: "Failed to create profile. Please try again.",
      variant: "destructive",
    });
  } finally {
    setIsLoading(false);
    }
  };

  if (isChecking) return null; // 🕵️ Don't show form while checking

  return (
    <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="text-center pb-6">
        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <UserPlus className="w-8 h-8 text-blue-600" />
        </div>
        <CardTitle className="text-2xl font-bold text-gray-900">
          Create Your Profile
        </CardTitle>
        <CardDescription className="text-gray-600">
          Tell us about yourself to get started
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Full Name
            </label>
            <Input
              type="text"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Email Address
            </label>
            <Input
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">I am a</label>
            <Select
              value={formData.persona}
              onValueChange={(value: "seeker" | "recruiter" | "referrer") =>
                setFormData({ ...formData, persona: value })
              }
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="seeker">Job Seeker</SelectItem>
                <SelectItem value="recruiter">Job Recruiter</SelectItem>
                <SelectItem value="referrer">Referrer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Password
            </label>
            <Input
              type="password"
              placeholder="Set a password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
              className="h-11"
            />
          </div>

          {formData.persona === "referrer" && (
            <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-gray-900">
                Work Experience Details
              </h3>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Role
                </label>
                <Select
                  value={formData.workExperience.role}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      workExperience: {
                        ...formData.workExperience,
                        role: value,
                      },
                    })
                  }
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={JOB_ROLES[0].value}>
                      Software Developer
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Years of Experience <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  placeholder="Enter years of experience (minimum 2)"
                  value={formData.workExperience.years}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      workExperience: {
                        ...formData.workExperience,
                        years: parseInt(e.target.value) || 0,
                      },
                    })
                  }
                  min="2"
                  max="50"
                  className="h-11"
                />
                <p className="text-xs text-gray-500">
                  Minimum 2 years of experience required for referrers
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Organization
                </label>
                <Input
                  type="text"
                  placeholder="Enter your organization"
                  value={formData.workExperience.organization}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      workExperience: {
                        ...formData.workExperience,
                        organization: e.target.value,
                      },
                    })
                  }
                  className="h-11"
                />
              </div>
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium mt-6"
            disabled={
              !formData.name ||
              !formData.email ||
              !formData.persona ||
              isLoading
            }
          >
            {isLoading ? "Creating Account..." : "Create Account"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
