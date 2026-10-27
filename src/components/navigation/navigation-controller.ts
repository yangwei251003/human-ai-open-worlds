"use client";

import type { WorldKey } from "@/data/types";
import { useExperienceStore } from "@/components/runtime/experience-store";

let pendingNavigation: number | null = null;

export function cancelPendingWorldNavigation() {
  if (pendingNavigation !== null) {
    window.clearTimeout(pendingNavigation);
    pendingNavigation = null;
  }
  useExperienceStore.getState().endTransition();
}

export function scheduleWorldNavigation(
  target: WorldKey,
  delay: number,
  navigate: () => void,
) {
  cancelPendingWorldNavigation();
  useExperienceStore.getState().beginTransition(target);
  pendingNavigation = window.setTimeout(() => {
    pendingNavigation = null;
    navigate();
  }, delay);
}
