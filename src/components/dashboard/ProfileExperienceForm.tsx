import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Building2, Calendar, Star } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useAuthStore } from "@/stores/authStore";

export const ProfileExperienceForm = () => {
  const { user } = useAuthStore();
  const [totalExperience, setTotalExperience] = useState<number>(0);
  const [currentOrganization, setCurrentOrganization] = useState("");
  const [newOrganization, setNewOrganization] = useState("");
  const [organizations, setOrganizations] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addOrganization = () => {
    if (newOrganization.trim() && !organizations.includes(newOrganization.trim())) {
      setOrganizations([...organizations, newOrganization.trim()]);
      setNewOrganization("");
    }
  };

  const removeOrganization = (org: string) => {
    setOrganizations(organizations.filter(o => o !== org));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          total_experience_years: totalExperience,
          current_organization: currentOrganization,
          organizations: organizations,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;
      
      // Show success message or redirect
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Building2 className="w-5 h-5 text-blue-600" />
          <span>Update Your Professional Experience</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Total Experience */}
          <div className="space-y-2">
            <Label htmlFor="experience" className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>Total Years of Experience</span>
            </Label>
            <Input
              id="experience"
              type="number"
              min="0"
              max="50"
              value={totalExperience}
              onChange={(e) => setTotalExperience(parseInt(e.target.value) || 0)}
              placeholder="e.g., 5"
              className="max-w-xs"
            />
          </div>

          {/* Current Organization */}
          <div className="space-y-2">
            <Label htmlFor="currentOrg" className="flex items-center space-x-2">
              <Star className="w-4 h-4 text-yellow-500" />
              <span>Current Organization</span>
            </Label>
            <Input
              id="currentOrg"
              type="text"
              value={currentOrganization}
              onChange={(e) => setCurrentOrganization(e.target.value)}
              placeholder="e.g., Google"
              className="max-w-md"
            />
          </div>

          {/* Previous Organizations */}
          <div className="space-y-2">
            <Label className="flex items-center space-x-2">
              <Building2 className="w-4 h-4" />
              <span>Previous Organizations</span>
            </Label>
            <div className="flex space-x-2">
              <Input
                type="text"
                value={newOrganization}
                onChange={(e) => setNewOrganization(e.target.value)}
                placeholder="e.g., Microsoft"
                className="flex-1"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addOrganization())}
              />
              <Button
                type="button"
                onClick={addOrganization}
                variant="outline"
                size="sm"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Display added organizations */}
            {organizations.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {organizations.map((org, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                    <span>{org}</span>
                    <button
                      type="button"
                      onClick={() => removeOrganization(org)}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? 'Updating...' : 'Update Profile'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}; 