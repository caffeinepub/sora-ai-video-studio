import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface VideoJob {
  id: string;
  ownerId: string;
  prompt: string;
  imageUrl?: string;
  style: string;
  durationSeconds: number;
  status: "pending" | "processing" | "completed" | "failed";
  createdAt: number;
  title: string;
  category: string;
  thumbnailUrl: string;
  isSample?: boolean;
}

export interface UserProfile {
  principal: string;
  credits: number;
  hasReceivedFreeCredits: boolean;
  createdAt: number;
}

export const VIDEO_STYLES = [
  "Cinematic",
  "Realistic",
  "Web Series",
  "Movie",
  "Music Video",
  "Custom",
];

export type DurationOption = { label: string; value: number; credits: number };
export const VIDEO_CATEGORIES = [
  "Short Films",
  "Web Series",
  "Movies",
  "Music Videos",
] as const;

export type VideoStyle = (typeof VIDEO_STYLES)[number];
export type VideoCategory = (typeof VIDEO_CATEGORIES)[number];

export const DURATION_OPTIONS = [
  { label: "15 seconds", value: 15, credits: 10 },
  { label: "30 seconds", value: 30, credits: 20 },
  { label: "3 minutes", value: 180, credits: 80 },
  { label: "8 minutes", value: 480, credits: 200 },
] as const;

const SAMPLE_VIDEOS: VideoJob[] = [
  {
    id: "sample-1",
    ownerId: "sample",
    prompt:
      "A cyberpunk city at night with neon reflections on rain-soaked streets, flying cars overhead",
    style: "Cinematic",
    durationSeconds: 30,
    status: "completed",
    createdAt: Date.now() - 86400000 * 3,
    title: "Neon Tokyo Nights",
    category: "Short Films",
    thumbnailUrl: "/assets/generated/thumb-neon-tokyo.dim_800x450.jpg",
    isSample: true,
  },
  {
    id: "sample-2",
    ownerId: "sample",
    prompt:
      "An astronaut floating near a golden nebula in deep space, cinematic wide angle shot",
    style: "Movie",
    durationSeconds: 480,
    status: "completed",
    createdAt: Date.now() - 86400000 * 5,
    title: "Stellar Odyssey",
    category: "Movies",
    thumbnailUrl: "/assets/generated/thumb-stellar-odyssey.dim_800x450.jpg",
    isSample: true,
  },
  {
    id: "sample-3",
    ownerId: "sample",
    prompt:
      "Dark gothic castle on a cliff during a lightning storm, atmospheric horror style",
    style: "Cinematic",
    durationSeconds: 180,
    status: "completed",
    createdAt: Date.now() - 86400000 * 7,
    title: "The Dark Frontier",
    category: "Movies",
    thumbnailUrl: "/assets/generated/thumb-dark-frontier.dim_800x450.jpg",
    isSample: true,
  },
  {
    id: "sample-4",
    ownerId: "sample",
    prompt:
      "Epic concert stage with purple and gold laser lights, performer silhouette, smoke and energy",
    style: "Music Video",
    durationSeconds: 180,
    status: "completed",
    createdAt: Date.now() - 86400000 * 2,
    title: "Midnight Echoes",
    category: "Music Videos",
    thumbnailUrl: "/assets/generated/thumb-midnight-echoes.dim_800x450.jpg",
    isSample: true,
  },
  {
    id: "sample-5",
    ownerId: "sample",
    prompt:
      "Lone figure walking through a rain-soaked alleyway, neon blue reflections, film noir",
    style: "Realistic",
    durationSeconds: 15,
    status: "completed",
    createdAt: Date.now() - 86400000 * 1,
    title: "Digital Dreams",
    category: "Short Films",
    thumbnailUrl: "/assets/generated/thumb-digital-dreams.dim_800x450.jpg",
    isSample: true,
  },
  {
    id: "sample-6",
    ownerId: "sample",
    prompt:
      "Futuristic megacity skyline with flying vehicles and towering skyscrapers at golden hour",
    style: "Web Series",
    durationSeconds: 30,
    status: "completed",
    createdAt: Date.now() - 86400000 * 4,
    title: "Urban Chronicles",
    category: "Web Series",
    thumbnailUrl: "/assets/generated/thumb-urban-chronicles.dim_800x450.jpg",
    isSample: true,
  },
];

interface AppState {
  userProfiles: Record<string, UserProfile>;
  videos: VideoJob[];
  highlightedVideoId: string | null;
  // Actions
  ensureProfile: (principal: string) => boolean; // returns true if newly created (first login)
  deductCredits: (principal: string, amount: number) => void;
  addCredits: (principal: string, amount: number) => void;
  setCredits: (principal: string, amount: number) => void;
  addVideo: (video: VideoJob) => void;
  updateVideoStatus: (id: string, status: VideoJob["status"]) => void;
  deleteVideo: (id: string) => void;
  setHighlightedVideo: (id: string | null) => void;
  getProfile: (principal: string) => UserProfile | null;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      userProfiles: {},
      videos: SAMPLE_VIDEOS,
      highlightedVideoId: null,

      ensureProfile: (principal: string) => {
        const existing = get().userProfiles[principal];
        if (existing) return false;
        const newProfile: UserProfile = {
          principal,
          credits: 300,
          hasReceivedFreeCredits: true,
          createdAt: Date.now(),
        };
        set((state) => ({
          userProfiles: { ...state.userProfiles, [principal]: newProfile },
        }));
        return true;
      },

      getProfile: (principal: string) => {
        return get().userProfiles[principal] || null;
      },

      deductCredits: (principal: string, amount: number) => {
        set((state) => {
          const profile = state.userProfiles[principal];
          if (!profile) return state;
          return {
            userProfiles: {
              ...state.userProfiles,
              [principal]: {
                ...profile,
                credits: Math.max(0, profile.credits - amount),
              },
            },
          };
        });
      },

      addCredits: (principal: string, amount: number) => {
        set((state) => {
          const profile = state.userProfiles[principal];
          if (!profile) return state;
          return {
            userProfiles: {
              ...state.userProfiles,
              [principal]: { ...profile, credits: profile.credits + amount },
            },
          };
        });
      },

      setCredits: (principal: string, amount: number) => {
        set((state) => {
          const profile = state.userProfiles[principal];
          if (!profile) return state;
          return {
            userProfiles: {
              ...state.userProfiles,
              [principal]: { ...profile, credits: amount },
            },
          };
        });
      },

      addVideo: (video: VideoJob) => {
        set((state) => ({ videos: [video, ...state.videos] }));
      },

      updateVideoStatus: (id: string, status: VideoJob["status"]) => {
        set((state) => ({
          videos: state.videos.map((v) => (v.id === id ? { ...v, status } : v)),
        }));
      },

      deleteVideo: (id: string) => {
        set((state) => ({ videos: state.videos.filter((v) => v.id !== id) }));
      },

      setHighlightedVideo: (id: string | null) => {
        set({ highlightedVideoId: id });
      },
    }),
    {
      name: "sora-ai-store",
      partialize: (state) => ({
        userProfiles: state.userProfiles,
        videos: state.videos,
      }),
    },
  ),
);
