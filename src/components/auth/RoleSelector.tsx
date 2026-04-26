import { motion } from "framer-motion";
import { ArrowRight, LogOut, Plus, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuthStore, type AppRole } from "@/stores/authStore";
import { ROLE_CONFIG, ROLE_ORDER } from "@/constants/appRoles";

export const RoleSelector = () => {
  const { user, setActiveRole, signOut } = useAuthStore();
  if (!user) return null;

  const availableRoles = user.roles ?? [];
  const missingRoles = ROLE_ORDER.filter((r) => !availableRoles.includes(r));

  const handleSelect = (role: AppRole) => {
    setActiveRole(role);
  };

  const initials = (user.name || user.email || "?")
    .split(/\s|@/)
    .filter(Boolean)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("");

  return (
    <div className="relative min-h-screen overflow-hidden auth-bg">
      <div className="pointer-events-none absolute inset-0 bg-grid-soft bg-grid-cell opacity-30" />
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-brand-300/30 blur-3xl animate-blob" />
      <div className="pointer-events-none absolute -bottom-32 -right-24 h-[28rem] w-[28rem] rounded-full bg-fuchsia-300/30 blur-3xl animate-blob [animation-delay:-6s]" />

      <header className="relative z-10 mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-fuchsia-500 text-white shadow-soft">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="text-lg font-display font-bold tracking-tight">
            Hire<span className="gradient-text">Eco</span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => signOut()}
          className="text-slate-500 hover:text-slate-900"
        >
          <LogOut className="mr-2 h-4 w-4" /> Sign out
        </Button>
      </header>

      <main className="relative z-10 mx-auto flex max-w-3xl flex-col items-center px-6 pb-16 pt-4 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center"
        >
          <Avatar className="h-16 w-16 ring-4 ring-white shadow-soft">
            <AvatarImage src={user.avatar_url ?? undefined} />
            <AvatarFallback className="bg-gradient-to-br from-brand-500 to-fuchsia-500 text-white">
              {initials || "U"}
            </AvatarFallback>
          </Avatar>
          <h1 className="mt-5 font-display text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
            Choose a workspace
          </h1>
          <p className="mt-2 text-slate-600">
            Logged in as <span className="font-medium text-slate-900">{user.email}</span>.
            Pick the lens you want to use right now.
          </p>
        </motion.div>

        <div className="mt-10 grid w-full grid-cols-1 gap-4 md:grid-cols-3">
          {availableRoles.map((role, i) => {
            const cfg = ROLE_CONFIG[role];
            const Icon = cfg.icon;
            return (
              <motion.button
                key={role}
                type="button"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.06 }}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelect(role)}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition-all hover:shadow-soft"
              >
                <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${cfg.gradient}`} />
                <div className="flex items-center justify-between">
                  <div
                    className={`grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br ${cfg.gradient} text-white shadow-sm`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 transition-all group-hover:translate-x-1 group-hover:text-slate-700" />
                </div>
                <div className="mt-5 font-display text-lg font-semibold text-slate-900">
                  {cfg.label}
                </div>
                <p className="mt-1 text-sm text-slate-600">{cfg.description}</p>
              </motion.button>
            );
          })}
        </div>

        {missingRoles.length > 0 && (
          <div className="mt-10 w-full">
            <div className="mb-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
              Add another role
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {missingRoles.map((role) => {
                const cfg = ROLE_CONFIG[role];
                const Icon = cfg.icon;
                return (
                  <button
                    key={role}
                    onClick={async () => {
                      await useAuthStore.getState().addRoleToUser(role);
                    }}
                    className="flex items-center justify-between rounded-2xl border border-dashed border-slate-300 bg-white/60 p-4 text-left text-slate-700 hover:border-slate-400 hover:bg-white"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br ${cfg.gradient} text-white opacity-80`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold">Become a {cfg.short}</div>
                        <div className="text-xs text-slate-500">{cfg.description}</div>
                      </div>
                    </div>
                    <Plus className="h-4 w-4 text-slate-400" />
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
