
import { User } from "@/stores/authStore";
import { SeekerDashboard } from "./SeekerDashboard";
import { RecruiterDashboard } from "./RecruiterDashboard";
import { ReferrerDashboard } from "./ReferrerDashboard";
import { DashboardLayout } from "./DashboardLayout";

interface DashboardProps {
  user: User;
}

export const Dashboard = ({ user }: DashboardProps) => {
  const renderDashboard = () => {
    switch (user.persona) {
      case 'seeker':
        return <SeekerDashboard user={user} />;
      case 'recruiter':
        return <RecruiterDashboard user={user} />;
      case 'referrer':
        return <ReferrerDashboard user={user} />;
      default:
        return <div>Invalid user type</div>;
    }
  };

  return (
    <DashboardLayout user={user}>
      {renderDashboard()}
    </DashboardLayout>
  );
};
