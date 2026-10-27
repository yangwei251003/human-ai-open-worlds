"use client";

import { create } from "zustand";
import type { WorldKey } from "@/data/types";

type QualityTier = "cinematic" | "balanced" | "adaptive";

type ExperienceState = {
  world: WorldKey;
  quality: QualityTier;
  qualityFactor: number;
  reduceMotion: boolean;
  transitionTarget: WorldKey | null;
  setWorld: (world: WorldKey) => void;
  setQuality: (quality: QualityTier) => void;
  setQualityFactor: (factor: number) => void;
  setReduceMotion: (reduceMotion: boolean) => void;
  beginTransition: (target: WorldKey) => void;
  endTransition: () => void;
};

export const useExperienceStore = create<ExperienceState>((set) => ({
  world: "home",
  quality: "adaptive",
  qualityFactor: 0.75,
  reduceMotion: false,
  transitionTarget: null,
  setWorld: (world) => set({ world }),
  setQuality: (quality) => set({ quality }),
  setQualityFactor: (qualityFactor) => set({ qualityFactor }),
  setReduceMotion: (reduceMotion) => set({ reduceMotion }),
  beginTransition: (transitionTarget) => set({ transitionTarget }),
  endTransition: () => set({ transitionTarget: null }),
}));
