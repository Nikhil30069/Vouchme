import { useEffect, useState } from "react";
import { Briefcase, Send, Star, Target, ClipboardList, Settings } from "lucide-react";
import { useAuthStore, type AppRole } from "@/stores/authStore";
import { DashboardLayout, type SideItem } from "./DashboardLayout";
import { SeekerDashboard } from "./SeekerDashboard";
import { RecruiterDashboard } from "./RecruiterDashboard";
import { ReferrerDashboard } from "./ReferrerDashboard";
import { CalendlySetupModal } from "./CalendlySetupModal";
import { AdminTestManager } from "@/components/admin/AdminTestManager";

const roleTabItems: Record<AppRole, SideItem[]> = {
  seeker: [
    { id: "overview", label: "Overview", icon: Target },
    { id: "jobs", label: "My Requirements", icon: Briefcase },
    { id: "requests", label: "Referral Requests", icon: Send },
    { id: "tests", label: "Certification Tests", icon: ClipboardList },
  ],
  recruiter: [
    { id: "overview", label: "Overview", icon: Target },
    { id: "postings", label: "Job Postings", icon: Briefcase },
  ],
  referrer: [
    { id: "overview", label: "Overview", icon: Target },
    { id: "reviews", label: "Review Queue", icon: Star },
  ],
};

const adminItem: SideItem = { id: "admin-tests", label: "Test Manager", icon: Settings };

export const Dashboard = () => {
  const user = useAuthStore((s) => s.user);
  const activeRole = useAuthStore((s) => s.activeRole);
  const updateUser = useAuthStore((s) => s.updateUser);
  const [activeTab, setActiveTab] = useState("overview");
  const [showCalendlySetup, setShowCalendlySetup] = useState(false);

  useEffect(() => {
    setActiveTab("overview");
  }, [activeRole]);

  useEffect(() => {
    if (activeRole === "referrer" && user && !user.calendly_url) {
      setShowCalendlySetup(true);
    } else {
      setShowCalendlySetup(false);
    }
  }, [activeRole, user]);

  if (!user || !activeRole) return null;

  const baseSideItems = roleTabItems[activeRole] ?? [];
  const sideItems = user.is_admin ? [...baseSideItems, adminItem] : baseSideItems;

  const handleCalendlyComplete = (url: string) => {
    updateUser({ calendly_url: url });
    setShowCalendlySetup(false);
  };

  const renderDashboard = () => {
    if (activeTab === "admin-tests") return <AdminTestManager />;
    switch (activeRole) {
      case "seeker":
        return <SeekerDashboard user={user} activeTab={activeTab} onTabChange={setActiveTab} />;
      case "recruiter":
        return <RecruiterDashboard user={user} activeTab={activeTab} />;
      case "referrer":
        return <ReferrerDashboard user={user} activeTab={activeTab} onTabChange={setActiveTab} />;
      default:
        return null;
    }
  };

  return (
    <DashboardLayout
      sideItems={sideItems}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {renderDashboard()}
      {showCalendlySetup && (
        <CalendlySetupModal user={user} onComplete={handleCalendlyComplete} />
      )}
    </DashboardLayout>
  );
};
