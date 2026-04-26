import { Briefcase, Search, Sparkles, type LucideIcon } from "lucide-react";
import type { AppRole } from "@/stores/authStore";

export interface RoleConfig {
  id: AppRole;
  label: string;
  short: string;
  description: string;
  icon: LucideIcon;
  accent: string;
  gradient: string;
  ring: string;
  pillClass: string;
  highlights: string[];
}

export const ROLE_CONFIG: Record<AppRole, RoleConfig> = {
  seeker: {
    id: "seeker",
    label: "Job Seeker",
    short: "Seeker",
    description:
      "Find your next role and let trusted referrers vouch for you with a transparent karma score.",
    icon: Search,
    accent: "text-seeker-deep",
    gradient: "from-blue-500 via-sky-500 to-indigo-500",
    ring: "ring-blue-200/70",
    pillClass: "role-pill-seeker",
    highlights: [
      "Track applications",
      "Build your karma score",
      "Get visible to top recruiters",
    ],
  },
  recruiter: {
    id: "recruiter",
    label: "Job Recruiter",
    short: "Recruiter",
    description:
      "Discover the top 3 candidates for every role, ranked by community-verified karma.",
    icon: Briefcase,
    accent: "text-recruiter-deep",
    gradient: "from-emerald-500 via-teal-500 to-green-500",
    ring: "ring-emerald-200/70",
    pillClass: "role-pill-recruiter",
    highlights: [
      "Post job openings",
      "Find karma-verified talent",
      "Unlock contacts on demand",
    ],
  },
  referrer: {
    id: "referrer",
    label: "Referrer",
    short: "Referrer",
    description:
      "Use your experience to score peers and shape a fair, transparent hiring ecosystem.",
    icon: Sparkles,
    accent: "text-referrer-deep",
    gradient: "from-fuchsia-500 via-purple-500 to-violet-500",
    ring: "ring-purple-200/70",
    pillClass: "role-pill-referrer",
    highlights: [
      "Review fellow professionals",
      "Build your scoring reputation",
      "Influence the karma ecosystem",
    ],
  },
};

export const ROLE_ORDER: AppRole[] = ["seeker", "recruiter", "referrer"];
