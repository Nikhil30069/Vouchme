import { ReactNode } from "react";
import { motion } from "framer-motion";
import {
  Check,
  ChevronsUpDown,
  LogOut,
  Plus,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore, type AppRole } from "@/stores/authStore";
import { ROLE_CONFIG, ROLE_ORDER } from "@/constants/appRoles";

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const user = useAuthStore((s) => s.user);
  const activeRole = useAuthStore((s) => s.activeRole);
  const setActiveRole = useAuthStore((s) => s.setActiveRole);
  const addRoleToUser = useAuthStore((s) => s.addRoleToUser);
  const signOut = useAuthStore((s) => s.signOut);

  if (!user || !activeRole) return null;

  const cfg = ROLE_CONFIG[activeRole];
  const Icon = cfg.icon;

  const initials = (user.name || user.email || "?")
    .split(/\s|@/)
    .filter(Boolean)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("");

  const otherRoles = (user.roles ?? []).filter((r) => r !== activeRole);
  const missingRoles = ROLE_ORDER.filter((r) => !user.roles?.includes(r));

  const handleSwitch = (role: AppRole) => setActiveRole(role);
  const handleAdd = async (role: AppRole) => {
    await addRoleToUser(role);
  };

  return (
    <div className="min-h-screen dashboard-bg">
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-fuchsia-500 text-white shadow-soft">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="hidden sm:block">
              <div className="font-display text-lg font-bold tracking-tight">
                Hire<span className="gradient-text">Eco</span>
              </div>
              <div className="text-xs text-slate-500">Transparent hiring, powered by karma.</div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <RoleSwitcher
              activeRole={activeRole}
              otherRoles={otherRoles}
              missingRoles={missingRoles}
              onSwitch={handleSwitch}
              onAdd={handleAdd}
            />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-1.5 py-1 pr-3 transition hover:shadow-sm">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar_url ?? undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-brand-500 to-fuchsia-500 text-xs text-white">
                      {initials || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden text-left sm:block">
                    <div className="text-sm font-semibold leading-tight text-slate-900">
                      {user.name || "Account"}
                    </div>
                    <div className="text-[11px] leading-tight text-slate-500">
                      {user.email}
                    </div>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <div className="flex items-center gap-3 p-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatar_url ?? undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-brand-500 to-fuchsia-500 text-xs text-white">
                      {initials || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-slate-900">
                      {user.name || "Account"}
                    </div>
                    <div className="truncate text-xs text-slate-500">{user.email}</div>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut()}
                  className="text-rose-600 focus:bg-rose-50 focus:text-rose-700"
                >
                  <LogOut className="mr-2 h-4 w-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 pb-3 sm:px-6 lg:px-8">
          <span className={cfg.pillClass}>
            <Icon className="h-3 w-3" /> Working as {cfg.label}
          </span>
          <span className="text-xs text-slate-500">
            Switch roles anytime from the avatar menu — your data stays connected.
          </span>
        </div>
      </header>

      <motion.main
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
      >
        {children}
      </motion.main>
    </div>
  );
};

interface RoleSwitcherProps {
  activeRole: AppRole;
  otherRoles: AppRole[];
  missingRoles: AppRole[];
  onSwitch: (role: AppRole) => void;
  onAdd: (role: AppRole) => Promise<void> | void;
}

const RoleSwitcher = ({
  activeRole,
  otherRoles,
  missingRoles,
  onSwitch,
  onAdd,
}: RoleSwitcherProps) => {
  const cfg = ROLE_CONFIG[activeRole];
  const Icon = cfg.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="h-9 gap-2 rounded-full border-slate-200 bg-white pl-1 pr-3 text-sm font-medium text-slate-700 hover:bg-white hover:shadow-sm"
        >
          <span
            className={`grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br ${cfg.gradient} text-white`}
          >
            <Icon className="h-3.5 w-3.5" />
          </span>
          <span className="hidden sm:inline">{cfg.label}</span>
          <ChevronsUpDown className="h-3.5 w-3.5 text-slate-400" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel className="text-xs font-medium uppercase tracking-wider text-slate-500">
          Your roles
        </DropdownMenuLabel>
        <RoleRow role={activeRole} active onSelect={() => {}} />
        {otherRoles.map((r) => (
          <RoleRow key={r} role={r} onSelect={() => onSwitch(r)} />
        ))}

        {missingRoles.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Add a workspace
            </DropdownMenuLabel>
            {missingRoles.map((r) => (
              <RoleAddRow key={r} role={r} onSelect={() => onAdd(r)} />
            ))}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const RoleRow = ({
  role,
  active,
  onSelect,
}: {
  role: AppRole;
  active?: boolean;
  onSelect: () => void;
}) => {
  const cfg = ROLE_CONFIG[role];
  const Icon = cfg.icon;
  return (
    <DropdownMenuItem onClick={onSelect} className="gap-3 py-2.5">
      <span
        className={`grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br ${cfg.gradient} text-white`}
      >
        <Icon className="h-4 w-4" />
      </span>
      <div className="flex-1">
        <div className="text-sm font-semibold text-slate-900">{cfg.label}</div>
        <div className="text-xs text-slate-500">{cfg.short} workspace</div>
      </div>
      {active && <Check className="h-4 w-4 text-emerald-600" />}
    </DropdownMenuItem>
  );
};

const RoleAddRow = ({
  role,
  onSelect,
}: {
  role: AppRole;
  onSelect: () => void;
}) => {
  const cfg = ROLE_CONFIG[role];
  const Icon = cfg.icon;
  return (
    <DropdownMenuItem onClick={onSelect} className="gap-3 py-2.5">
      <span
        className={`grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br ${cfg.gradient} text-white opacity-70`}
      >
        <Icon className="h-4 w-4" />
      </span>
      <div className="flex-1">
        <div className="text-sm font-semibold text-slate-900">Become a {cfg.short}</div>
        <div className="text-xs text-slate-500">Add this workspace to your account</div>
      </div>
      <Plus className="h-4 w-4 text-slate-400" />
    </DropdownMenuItem>
  );
};
