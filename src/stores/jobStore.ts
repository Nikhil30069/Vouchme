import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface JobRequirement {
  id: string;
  userId: string;
  role: string;
  yearsOfExperience: number;
  currentCtc?: number;
  expectedCtc?: number;
  salaryBracket?: { min: number; max: number };
  resumeUrl?: string;
  noticePeriod?: number;
  readyToJoinIn?: number;
  createdAt: Date;
  type: string;
}

export interface Profile {
  id: string;
  userId: string;
  role: string;
  yearsOfExperience: number;
  currentCtc?: number;
  expectedCtc?: number;
  resumeUrl?: string;
  noticePeriod?: number;
  scores: { referrerId: string; referrerName: string; score: number }[];
  createdAt: Date;
}

interface JobState {
  jobRequirements: JobRequirement[];
  profiles: Profile[];
  addJobRequirement: (job: Omit<JobRequirement, "id" | "createdAt">) => void;
  addProfile: (profile: Omit<Profile, "id" | "createdAt" | "scores">) => void;
  addScore: (
    profileId: string,
    referrerId: string,
    referrerName: string,
    score: number
  ) => void;
  getJobsByUser: (userId: string) => JobRequirement[];
  getProfilesByRole: (role: string, maxYears: number) => Profile[];
  getTopCandidates: (role: string, years: number) => Profile[];
  setJobsForUser: (
    userId: string,
    jobs: Omit<JobRequirement, "id" | "createdAt">[]
  ) => void;
}

export const useJobStore = create<JobState>()(
  persist(
    (set, get) => ({
      jobRequirements: [],
      profiles: [],
      addJobRequirement: (job) =>
        set((state) => ({
          jobRequirements: [
            ...state.jobRequirements,
            { ...job, id: Date.now().toString(), createdAt: new Date() },
          ],
        })),
      addProfile: (profile) =>
        set((state) => ({
          profiles: [
            ...state.profiles,
            {
              ...profile,
              id: Date.now().toString(),
              createdAt: new Date(),
              scores: [],
            },
          ],
        })),
      addScore: (profileId, referrerId, referrerName, score) =>
        set((state) => ({
          profiles: state.profiles.map((profile) =>
            profile.id === profileId
              ? {
                  ...profile,
                  scores: [
                    ...profile.scores.filter(
                      (s) => s.referrerId !== referrerId
                    ),
                    { referrerId, referrerName, score },
                  ],
                }
              : profile
          ),
        })),
      getJobsByUser: (userId) =>
        get().jobRequirements.filter((job) => job.userId === userId),
      setJobsForUser: (userId, jobs) =>
        set((state) => ({
          jobRequirements: [
            ...state.jobRequirements.filter((job) => job.userId !== userId),
            ...jobs.map((job) => ({
              ...job,
              id: Date.now().toString() + Math.random().toString(36).slice(2),
              createdAt: new Date(),
            })),
          ],
        })),
      getProfilesByRole: (role, maxYears) =>
        get().profiles.filter(
          (profile) =>
            profile.role === role && profile.yearsOfExperience <= maxYears
        ),
      getTopCandidates: (role, years) =>
        get()
          .profiles.filter(
            (profile) =>
              profile.role === role && profile.yearsOfExperience <= years
          )
          .sort((a, b) => {
            const avgScoreA = a.scores.length
              ? a.scores.reduce((sum, s) => sum + s.score, 0) / a.scores.length
              : 0;
            const avgScoreB = b.scores.length
              ? b.scores.reduce((sum, s) => sum + s.score, 0) / b.scores.length
              : 0;
            return avgScoreB - avgScoreA;
          })
          .slice(0, 3),
    }),

    {
      name: "job-storage",
    }
  )
);
