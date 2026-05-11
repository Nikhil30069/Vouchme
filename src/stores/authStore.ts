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
  calendly_url?: string | null;
  availability_start?: string;
  availability_end?: string;
  availability_days?: number[];
  availability_timezone?: string;
  createdAt?: string | null;
  is_admin?: boolean;
}

export type AuthStatus = "loading" | "unauthenticated" | "needs-onboarding" | "needs-role" | "ready";

interface AuthState {
  user: User | null;
  activeRole: AppRole | null;
  status: AuthStatus;
  calendarConnected: boolean;

  setUser: (user: User | null) => void;
  setActiveRole: (role: AppRole) => void;
  refreshProfile: () => Promise<void>;
  initializeAuth: () => Promise<() => void>;
  signInWithGoogle: () => Promise<void>;
  connectGoogleCalendar: () => Promise<void>;
  refreshCalendarConnected: () => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
  addRoleToUser: (role: AppRole, additionalData?: Record<string, unknown>) => Promise<void>;
}

// sessionStorage flag — set right before the Google Calendar OAuth flow,
// read once on return. Prevents the refresh_token returned by a normal
// basic-scope login from being mistakenly stored as "calendar connected".
const PENDING_CAL_KEY = "pending_calendar_connect";
const CALENDAR_SCOPE = "https://www.googleapis.com/auth/calendar.events";

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
  calendly_url: row.calendly_url ?? null,
  availability_start: row.availability_start ?? "10:00",
  availability_end: row.availability_end ?? "19:00",
  availability_days: row.availability_days ?? [1, 2, 3, 4, 5],
  availability_timezone: row.availability_timezone ?? "Asia/Kolkata",
  createdAt: row.created_at ?? null,
  is_admin: !!row.is_admin,
});

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      activeRole: null,
      status: "loading",
      calendarConnected: false,

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
        await get().refreshCalendarConnected();
        const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (event === "SIGNED_OUT") {
            set({ user: null, activeRole: null, status: "unauthenticated", calendarConnected: false });
            return;
          }
          if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "INITIAL_SESSION") {
            // If the user just completed the "Connect Google Calendar" flow,
            // the OAuth callback session carries provider_refresh_token. Persist
            // it so our Edge Functions can mint fresh access tokens later.
            const pending = typeof window !== "undefined" && sessionStorage.getItem(PENDING_CAL_KEY) === "1";
            const refreshToken = (session as any)?.provider_refresh_token as string | undefined;
            if (pending && refreshToken && session?.user?.id) {
              sessionStorage.removeItem(PENDING_CAL_KEY);
              const { error } = await supabase
                .from("oauth_credentials")
                .upsert(
                  {
                    user_id: session.user.id,
                    provider: "google",
                    refresh_token: refreshToken,
                    scopes: CALENDAR_SCOPE,
                    updated_at: new Date().toISOString(),
                  },
                  { onConflict: "user_id,provider" }
                );
              if (error) console.error("[auth] failed to persist calendar refresh token:", error);
            }
            await get().refreshProfile();
            await get().refreshCalendarConnected();
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

      connectGoogleCalendar: async () => {
        // Flag this redirect so the SIGNED_IN handler knows to persist the
        // refresh token. Cleared on return (whether success or failure).
        sessionStorage.setItem(PENDING_CAL_KEY, "1");
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: window.location.origin,
            scopes: CALENDAR_SCOPE,
            queryParams: {
              // Required for Google to return a refresh_token.
              access_type: "offline",
              // Force re-consent so we always get a refresh_token, even for
              // users who previously signed in without the calendar scope.
              prompt: "consent",
            },
          },
        });
        if (error) {
          sessionStorage.removeItem(PENDING_CAL_KEY);
          throw error;
        }
      },

      refreshCalendarConnected: async () => {
        const user = get().user;
        if (!user) {
          set({ calendarConnected: false });
          return;
        }
        const { data, error } = await supabase.rpc("has_calendar_connected", { uid: user.id });
        if (error) {
          // RPC might not exist on older schemas — fall back to "not connected".
          set({ calendarConnected: false });
          return;
        }
        set({ calendarConnected: !!data });
      },

      signOut: async () => {
        await supabase.auth.signOut();
        set({ user: null, activeRole: null, status: "unauthenticated", calendarConnected: false });
      },

      addRoleToUser: async (role, additionalData) => {
        const user = get().user;
        if (!user) return;
        const nextRoles = Array.from(new Set([...user.roles, role])) as AppRole[];
        const update: Record<string, unknown> = {
          roles: nextRoles,
          onboarded: true,
          updated_at: new Date().toISOString(),
          ...additionalData,
        };
        const { error } = await supabase
          .from("profiles")
          .update(update)
          .eq("id", user.id);
        if (error) throw error;
        await get().refreshProfile();
        get().setActiveRole(role);
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ activeRole: state.activeRole }),
    }
  )
);
