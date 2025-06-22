
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, User as UserIcon } from "lucide-react";
import { useAuthStore, User } from "@/stores/authStore";

interface DashboardLayoutProps {
  children: ReactNode;
  user: User;
}

export const DashboardLayout = ({ children, user }: DashboardLayoutProps) => {
  const { logout } = useAuthStore();

  const getPersonaLabel = (persona: string) => {
    switch (persona) {
      case 'seeker': return 'Job Seeker';
      case 'recruiter': return 'Job Recruiter';
      case 'referrer': return 'Referrer';
      default: return persona;
    }
  };

  const getPersonaColor = (persona: string) => {
    switch (persona) {
      case 'seeker': return 'bg-green-100 text-green-800';
      case 'recruiter': return 'bg-blue-100 text-blue-800';
      case 'referrer': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-blue-600">HireEco</h1>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPersonaColor(user.persona)}`}>
                {getPersonaLabel(user.persona)}
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarFallback className="bg-blue-100 text-blue-600">
                    <UserIcon className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="text-gray-500 hover:text-gray-700"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};
