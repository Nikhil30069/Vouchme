import { useEffect, useState } from "react";
import { Briefcase, Send, Star, Target, ClipboardList, Settings } from "lucide-react";
import { useAuthStore, type AppRole } from "@/stores/authStore";
import { DashboardLayout, type SideItem } from "./DashboardLayout";
import { SeekerDashboard } from "./SeekerDashboard";
import { RecruiterDashboard } from "./RecruiterDashboard";
import { ReferrerDashboard } from "./ReferrerDashboard";
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
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    setActiveTab("overview");
  }, [activeRole]);

  if (!user || !activeRole) return null;

  const baseSideItems = roleTabItems[activeRole] ?? [];
  const sideItems = user.is_admin ? [...baseSideItems, adminItem] : baseSideItems;

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
    </DashboardLayout>
  );
};
