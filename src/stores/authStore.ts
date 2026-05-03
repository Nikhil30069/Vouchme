import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Json } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "seeker" | "recruiter" | "referrer";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  avatar_url?: string | null;
  roles: AppRole[];
  workExperience?: Json | null;
  total_experience_years?: number | null;
  organizations?: string[] | null;
  current_organization?: string | null;
  onboarded: boolean;
  createdAt?: string | null;
  is_admin?: boolean;
}

export type AuthStatus = "loading" | "unauthenticated" | "needs-onboarding" | "needs-role" | "ready";

interface AuthState {
  user: User | null;
  activeRole: AppRole | null;
  status: AuthStatus;

  setUser: (user: User | null) => void;
  setActiveRole: (role: AppRole) => void;
  refreshProfile: () => Promise<void>;
  initializeAuth: () => Promise<() => void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
  addRoleToUser: (role: AppRole) => Promise<void>;
}

const computeStatus = (user: User | null, activeRole: AppRole | null): AuthStatus => {
  if (!user) return "unauthenticated";
  if (!user.onboarded || user.roles.length === 0) return "needs-onboarding";
  if (!activeRole || !user.roles.includes(activeRole)) return "needs-role";
  return "ready";
};

const profileToUser = (row: any): User => ({
  id: row.id,
  name: row.name ?? "",
  email: row.email ?? "",
  phone: row.phone ?? null,
  avatar_url: row.avatar_url ?? null,
  roles: (row.roles ?? []) as AppRole[],
  workExperience: row.workExperience ?? row.work_experience ?? null,
  total_experience_years: row.total_experience_years ?? null,
  organizations: row.organizations ?? null,
  current_organization: row.current_organization ?? null,
  onboarded: !!row.onboarded,
  createdAt: row.created_at ?? null,
  is_admin: !!row.is_admin,
});

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      activeRole: null,
      status: "loading",

      setUser: (user) =>
        set((state) => ({
          user,
          status: computeStatus(user, state.activeRole),
        })),

      setActiveRole: (role) =>
        set((state) => ({
          activeRole: role,
          status: computeStatus(state.user, role),
        })),

      updateUser: (data) =>
        set((state) => {
          const user = state.user ? { ...state.user, ...data } : null;
          return { user, status: computeStatus(user, state.activeRole) };
        }),

      refreshProfile: async () => {
        const { data: sessionData } = await supabase.auth.getSession();
        const session = sessionData?.session;
        if (!session) {
          set({ user: null, activeRole: null, status: "unauthenticated" });
          return;
        }
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();
        if (error || !data) {
          // Profile may not exist yet (race with trigger). Synthesize a stub.
          const stub: User = {
            id: session.user.id,
            name:
              (session.user.user_metadata?.full_name as string) ??
              (session.user.user_metadata?.name as string) ??
              "",
            email: session.user.email ?? "",
            phone: null,
            avatar_url: (session.user.user_metadata?.avatar_url as string) ?? null,
            roles: [],
            onboarded: false,
          };
          set((state) => ({ user: stub, status: computeStatus(stub, state.activeRole) }));
          return;
        }
        const user = profileToUser(data);
        set((state) => {
          const activeRole =
            state.activeRole && user.roles.includes(state.activeRole)
              ? state.activeRole
              : user.roles.length === 1
              ? user.roles[0]
              : state.activeRole;
          return { user, activeRole, status: computeStatus(user, activeRole) };
        });
      },

      initializeAuth: async () => {
        await get().refreshProfile();
        const { data: listener } = supabase.auth.onAuthStateChange(async (event) => {
          if (event === "SIGNED_OUT") {
            set({ user: null, activeRole: null, status: "unauthenticated" });
            return;
          }
          if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "INITIAL_SESSION") {
            await get().refreshProfile();
          }
        });
        return () => listener.subscription.unsubscribe();
      },

      signInWithGoogle: async () => {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: window.location.origin,
          },
        });
        if (error) throw error;
      },

      signOut: async () => {
        await supabase.auth.signOut();
        set({ user: null, activeRole: null, status: "unauthenticated" });
      },

      addRoleToUser: async (role) => {
        const user = get().user;
        if (!user) return;
        const nextRoles = Array.from(new Set([...user.roles, role])) as AppRole[];
        const { error } = await supabase
          .from("profiles")
          .update({ roles: nextRoles, onboarded: true, updated_at: new Date().toISOString() })
          .eq("id", user.id);
        if (error) throw error;
        await get().refreshProfile();
        set({ activeRole: role });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ activeRole: state.activeRole }),
    }
  )
);
