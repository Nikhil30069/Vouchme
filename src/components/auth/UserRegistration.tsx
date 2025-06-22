
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UserRegistrationProps {
  phoneNumber: string;
}

export const UserRegistration = ({ phoneNumber }: UserRegistrationProps) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    persona: '' as 'seeker' | 'recruiter' | 'referrer' | '',
    workExperience: {
      role: '',
      years: 0,
      organization: ''
    }
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthStore();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        toast({
          title: "Error",
          description: "User authentication failed. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Update the user profile in Supabase
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          name: formData.name,
          phone: phoneNumber,
          email: formData.email,
          persona: formData.persona,
          work_experience: formData.persona === 'referrer' ? formData.workExperience : null,
        });

      if (profileError) {
        toast({
          title: "Error",
          description: profileError.message,
          variant: "destructive",
        });
        return;
      }

      // Create the user object for the store
      const userObj = {
        id: user.id,
        name: formData.name,
        phone: phoneNumber,
        email: formData.email,
        persona: formData.persona as 'seeker' | 'recruiter' | 'referrer',
        workExperience: formData.persona === 'referrer' ? formData.workExperience : undefined,
        createdAt: new Date()
      };
      
      login(userObj);
      
      toast({
        title: "Success",
        description: "Profile created successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="text-center pb-6">
        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <UserPlus className="w-8 h-8 text-blue-600" />
        </div>
        <CardTitle className="text-2xl font-bold text-gray-900">Create Your Profile</CardTitle>
        <CardDescription className="text-gray-600">
          Tell us about yourself to get started
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Full Name</label>
            <Input
              type="text"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Email Address</label>
            <Input
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">I am a</label>
            <Select value={formData.persona} onValueChange={(value: 'seeker' | 'recruiter' | 'referrer') => 
              setFormData({ ...formData, persona: value })
            }>
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

          {formData.persona === 'referrer' && (
            <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-gray-900">Work Experience Details</h3>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Role</label>
                <Select value={formData.workExperience.role} onValueChange={(value) => 
                  setFormData({ 
                    ...formData, 
                    workExperience: { ...formData.workExperience, role: value }
                  })
                }>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="software-developer">Software Developer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Years of Experience</label>
                <Input
                  type="number"
                  placeholder="Enter years of experience"
                  value={formData.workExperience.years}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    workExperience: { 
                      ...formData.workExperience, 
                      years: parseInt(e.target.value) || 0 
                    }
                  })}
                  min="0"
                  max="50"
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Organization</label>
                <Input
                  type="text"
                  placeholder="Enter your organization"
                  value={formData.workExperience.organization}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    workExperience: { 
                      ...formData.workExperience, 
                      organization: e.target.value 
                    }
                  })}
                  className="h-11"
                />
              </div>
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium mt-6"
            disabled={!formData.name || !formData.email || !formData.persona || isLoading}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
