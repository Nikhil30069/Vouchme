import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Briefcase,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Trophy,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/authStore";
import { useToast } from "@/hooks/use-toast";

const features = [
  {
    icon: ShieldCheck,
    title: "Verified by peers",
    body: "Every candidate carries a karma score curated by senior professionals who actually know the craft.",
  },
  {
    icon: Trophy,
    title: "Top 3, every time",
    body: "Recruiters see only the highest-trust candidates — no resume firehose, no noise.",
  },
  {
    icon: Sparkles,
    title: "One identity, three lenses",
    body: "Switch between Seeker, Recruiter and Referrer without ever logging out.",
  },
];

const roleCards = [
  {
    title: "Seekers",
    blurb: "Build a transparent reputation that travels with you.",
    icon: Search,
    gradient: "from-sky-400 to-indigo-500",
  },
  {
    title: "Recruiters",
    blurb: "Hire from a curated, karma-ranked talent pool.",
    icon: Briefcase,
    gradient: "from-emerald-400 to-teal-500",
  },
  {
    title: "Referrers",
    blurb: "Lend your experience and grow your influence.",
    icon: Sparkles,
    gradient: "from-fuchsia-400 to-purple-500",
  },
];

export const AuthFlow = () => {
  const { signInWithGoogle } = useAuthStore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
    } catch (error: any) {
      toast({
        title: "Sign-in failed",
        description: error?.message ?? "We couldn't reach Google. Try again in a moment.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden auth-bg">
      <div className="pointer-events-none absolute inset-0 bg-grid-soft bg-grid-cell opacity-[0.35]" />
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-brand-300/40 blur-3xl animate-blob" />
      <div className="pointer-events-none absolute -bottom-32 -right-24 h-[28rem] w-[28rem] rounded-full bg-fuchsia-300/30 blur-3xl animate-blob [animation-delay:-6s]" />

      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-fuchsia-500 text-white shadow-soft">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="text-lg font-display font-bold tracking-tight">
            Hire<span className="gradient-text">Eco</span>
          </div>
        </div>
        <a
          href="#how-it-works"
          className="hidden text-sm font-medium text-slate-600 hover:text-slate-900 sm:block"
        >
          How it works
        </a>
      </header>

      <main className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 pb-16 pt-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20 lg:pt-12">
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col justify-center"
        >
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-brand-100 bg-white/70 px-3 py-1 text-xs font-medium text-brand-700 shadow-sm backdrop-blur">
            <Star className="h-3.5 w-3.5 fill-brand-500 text-brand-500" />
            Hiring, but transparent.
          </div>
          <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-slate-900 md:text-6xl">
            A trust-first
            <br />
            hiring ecosystem
            <br />
            with <span className="gradient-text">karma at the core</span>.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-slate-600">
            Job seekers earn a karma score from senior referrers. Recruiters see
            only the top three matches. Everybody wins. One sign-in. Three roles.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              size="lg"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="group h-12 gap-3 rounded-xl bg-slate-900 px-6 text-base text-white hover:bg-slate-800"
            >
              <GoogleIcon className="h-5 w-5" />
              {loading ? "Redirecting..." : "Continue with Google"}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
            <p className="text-sm text-slate-500">
              No password. No spam. Sign in once, switch roles anytime.
            </p>
          </div>

          <div className="mt-10 grid max-w-xl grid-cols-1 gap-4 sm:grid-cols-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.08, duration: 0.5 }}
                className="rounded-2xl border border-slate-200/70 bg-white/70 p-4 shadow-sm backdrop-blur"
              >
                <f.icon className="h-5 w-5 text-brand-600" />
                <div className="mt-2 text-sm font-semibold text-slate-900">{f.title}</div>
                <p className="mt-1 text-xs text-slate-600">{f.body}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section
          id="how-it-works"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          className="relative flex flex-col"
        >
          <div className="surface-card relative overflow-hidden p-8">
            <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-gradient-to-br from-brand-400/40 to-fuchsia-400/30 blur-3xl" />
            <div className="relative">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium uppercase tracking-wider text-slate-500">
                    Live karma snapshot
                  </div>
                  <div className="mt-1 font-display text-2xl font-bold text-slate-900">
                    Top candidates this week
                  </div>
                </div>
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-fuchsia-500 text-white shadow-soft">
                  <Users className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {[
                  { name: "Aarav S.", role: "Software Developer", score: 9.2, hue: "from-blue-500 to-indigo-500" },
                  { name: "Meera K.", role: "Product Manager", score: 8.7, hue: "from-emerald-500 to-teal-500" },
                  { name: "Rohit V.", role: "Software Developer", score: 8.4, hue: "from-fuchsia-500 to-purple-500" },
                ].map((c, idx) => (
                  <motion.div
                    key={c.name}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + idx * 0.1 }}
                    className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br ${c.hue} text-white text-sm font-semibold`}
                      >
                        {c.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-900">{c.name}</div>
                        <div className="text-xs text-slate-500">{c.role}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-xs font-bold text-white">
                      <Star className="h-3 w-3 fill-yellow-300 text-yellow-300" />
                      {c.score.toFixed(1)}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {roleCards.map((r, i) => (
              <motion.div
                key={r.title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.08 }}
                className="surface-card p-4"
              >
                <div
                  className={`grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br ${r.gradient} text-white`}
                >
                  <r.icon className="h-4 w-4" />
                </div>
                <div className="mt-3 text-sm font-semibold text-slate-900">{r.title}</div>
                <div className="mt-1 text-xs text-slate-600">{r.blurb}</div>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </main>
    </div>
  );
};

const GoogleIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden>
    <path
      fill="#FFC107"
      d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z"
    />
    <path
      fill="#FF3D00"
      d="M6.3 14.7l6.6 4.8C14.7 16.1 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.1 4 9.3 8.4 6.3 14.7z"
    />
    <path
      fill="#4CAF50"
      d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.2c-2 1.5-4.5 2.4-7.3 2.4-5.3 0-9.7-3.1-11.4-7.6l-6.5 5C9.2 39.5 16 44 24 44z"
    />
    <path
      fill="#1976D2"
      d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.2 5.6l6.3 5.2c-.4.4 6.6-4.8 6.6-14.8 0-1.3-.1-2.3-.4-3.5z"
    />
  </svg>
);
