import { AnimatePresence, motion } from "framer-motion";
import { useAuthStore } from "@/stores/authStore";
import { DashboardLayout } from "./DashboardLayout";
import { SeekerDashboard } from "./SeekerDashboard";
import { RecruiterDashboard } from "./RecruiterDashboard";
import { ReferrerDashboard } from "./ReferrerDashboard";

export const Dashboard = () => {
  const user = useAuthStore((s) => s.user);
  const activeRole = useAuthStore((s) => s.activeRole);

  if (!user || !activeRole) return null;

  const renderDashboard = () => {
    switch (activeRole) {
      case "seeker":
        return <SeekerDashboard user={user} />;
      case "recruiter":
        return <RecruiterDashboard user={user} />;
      case "referrer":
        return <ReferrerDashboard user={user} />;
      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeRole}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          {renderDashboard()}
        </motion.div>
      </AnimatePresence>
    </DashboardLayout>
  );
};
