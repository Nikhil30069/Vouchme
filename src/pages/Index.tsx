import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { AuthFlow } from "@/components/auth/AuthFlow";
import { Onboarding } from "@/components/auth/Onboarding";
import { RoleSelector } from "@/components/auth/RoleSelector";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { useAuthStore } from "@/stores/authStore";

const Index = () => {
  const status = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);

  if (status === "loading") {
    return (
      <div className="min-h-screen auth-bg grid place-items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-3 text-slate-600"
        >
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-fuchsia-500 text-white shadow-soft animate-pulse">
            <Sparkles className="h-6 w-6" />
          </div>
          <div className="text-sm font-medium">Loading your workspace…</div>
        </motion.div>
      </div>
    );
  }

  if (status === "unauthenticated" || !user) {
    return <AuthFlow />;
  }

  if (status === "needs-onboarding") {
    return <Onboarding />;
  }

  if (status === "needs-role") {
    return <RoleSelector />;
  }

  return <Dashboard />;
};

export default Index;
