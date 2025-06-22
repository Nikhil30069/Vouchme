
import { useEffect } from "react";
import { AuthFlow } from "@/components/auth/AuthFlow";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { useAuthStore } from "@/stores/authStore";

const Index = () => {
  const { user, isAuthenticated, initializeAuth } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  if (!isAuthenticated) {
    return <AuthFlow />;
  }

  return <Dashboard user={user} />;
};

export default Index;
