"use client";

import { useEffect, useState } from "react";
import type { DinnerRecommendation } from "@/lib/dinner/types";
import { readAppState, updateAppState } from "./storage";
import type { FreselyAppState } from "./types";

export type HomeRecommendationState = {
  hydrated: boolean;
  firstName: string;
  currentRecommendation: DinnerRecommendation | null;
  savedAt: string | null;
  madeAt: string | null;
  isFresh: boolean;
  markMade: () => void;
  clearRecommendation: () => void;
};

export function isSameLocalCalendarDay(
  timestamp: string,
  now = new Date(),
): boolean {
  const saved = new Date(timestamp);
  return (
    saved.getFullYear() === now.getFullYear() &&
    saved.getMonth() === now.getMonth() &&
    saved.getDate() === now.getDate()
  );
}

export function useHomeRecommendation(): HomeRecommendationState {
  const [state, setState] = useState<FreselyAppState | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Durable state is an external browser system and is read after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState(readAppState());
    setHydrated(true);
  }, []);

  const latest = state?.latestRecommendation ?? null;

  function markMade() {
    const next = updateAppState((current) => {
      if (!current.latestRecommendation) return current;

      return {
        ...current,
        latestRecommendation: {
          ...current.latestRecommendation,
          madeAt: new Date().toISOString(),
        },
      };
    });
    setState(next);
  }

  function clearRecommendation() {
    const next = updateAppState((current) => ({
      ...current,
      latestRecommendation: null,
    }));
    setState(next);
  }

  return {
    hydrated,
    firstName: state?.preferences.firstName ?? "",
    currentRecommendation: latest?.recommendation ?? null,
    savedAt: latest?.generatedAt ?? null,
    madeAt: latest?.madeAt ?? null,
    isFresh: latest ? isSameLocalCalendarDay(latest.generatedAt) : false,
    markMade,
    clearRecommendation,
  };
}
