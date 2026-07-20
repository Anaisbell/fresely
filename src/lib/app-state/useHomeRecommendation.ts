"use client";

import { useEffect, useState } from "react";
import { getMealContext } from "@/lib/dinner/meal-context";
import type { DinnerRecommendation, MealContext } from "@/lib/dinner/types";
import { readAppState, updateAppState } from "./storage";
import type { FreselyAppState } from "./types";

export type HomeRecommendationState = {
  hydrated: boolean;
  firstName: string;
  currentRecommendation: DinnerRecommendation | null;
  mealContext: MealContext | null;
  savedAt: string | null;
  madeAt: string | null;
  isFresh: boolean;
  markMade: () => void;
  clearRecommendation: () => void;
  syncState: (next: FreselyAppState) => void;
};

/**
 * The calendar date a meal period "belongs to" — using the same boundary as
 * getMealContext's dinner window (16:00–04:59). Any hour before 05:00 is
 * still part of the previous calendar day's period, since that's when
 * dinner's window actually ends. Without this adjustment, a dinner
 * recommendation from last night would incorrectly look stale at, say,
 * 2 AM even though it's still inside the same continuous dinner window.
 */
function mealDayKey(date: Date): string {
  const shifted = new Date(date);
  if (shifted.getHours() < 5) {
    shifted.setDate(shifted.getDate() - 1);
  }
  const year = shifted.getFullYear();
  const month = String(shifted.getMonth() + 1).padStart(2, "0");
  const day = String(shifted.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Derived presentation identity for a meal period, e.g. "2026-07-20:dinner".
 * Returns null when there's no meal context to anchor it to (legacy records
 * predating meal-context capture) — those can never match the active
 * period, which is the conservative, correct behavior for stale data.
 */
export function mealPeriodId(
  date: Date,
  mealContext: MealContext | null,
): string | null {
  if (!mealContext) return null;
  return `${mealDayKey(date)}:${mealContext}`;
}

// Same boundary hours getMealContext switches on (05:00, 11:00, 16:00).
const MEAL_PERIOD_BOUNDARY_HOURS = [5, 11, 16] as const;

/**
 * The next moment a meal period changes, strictly after `date`. Checks
 * today's and tomorrow's boundary hours and returns the earliest one that
 * hasn't passed yet, so it's correct regardless of what time it is now.
 */
function nextMealPeriodBoundary(date: Date): Date {
  const candidates: Date[] = [];
  for (let dayOffset = 0; dayOffset <= 1; dayOffset++) {
    for (const hour of MEAL_PERIOD_BOUNDARY_HOURS) {
      const candidate = new Date(date);
      candidate.setDate(candidate.getDate() + dayOffset);
      candidate.setHours(hour, 0, 0, 0);
      candidates.push(candidate);
    }
  }
  const upcoming = candidates
    .filter((candidate) => candidate.getTime() > date.getTime())
    .sort((a, b) => a.getTime() - b.getTime());
  return upcoming[0];
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

  // isFresh (below) is a plain expression computed from the current clock,
  // so it only ever updates when this hook re-renders. Nothing else here
  // re-renders on a clock tick, so without this, a tab left open across a
  // meal-period boundary would keep showing whatever was fresh at the last
  // render. This forces exactly one re-render at each upcoming boundary
  // (05:00, 11:00, 16:00) — no continuous polling — plus one more if the
  // tab was backgrounded and the timer got throttled or suspended while a
  // boundary passed.
  const [, setBoundaryTick] = useState(0);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    function recomputeAndReschedule() {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setBoundaryTick((tick) => tick + 1);
      if (timeoutId) clearTimeout(timeoutId);
      const delay = Math.max(
        nextMealPeriodBoundary(new Date()).getTime() - Date.now(),
        0,
      );
      timeoutId = setTimeout(recomputeAndReschedule, delay);
    }

    const initialDelay = Math.max(
      nextMealPeriodBoundary(new Date()).getTime() - Date.now(),
      0,
    );
    timeoutId = setTimeout(recomputeAndReschedule, initialDelay);

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        recomputeAndReschedule();
      }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
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

  // Thin setter for callers that already produced a validated next state
  // themselves (e.g. an in-place regeneration via persistGeneratedRecommendation)
  // and just need Home to reflect it without a page reload. Does not read,
  // write, or validate storage itself — the caller already did that.
  function syncState(next: FreselyAppState) {
    setState(next);
  }

  // Presentation lifecycle is meal-period-aware, not just calendar-day-aware:
  // a recommendation only counts as belonging to "now" when its own period
  // (the local day + meal context it was generated for) matches the active
  // period (the local day + meal context right now). madeAt is preserved as
  // historical data regardless — it does not by itself keep a recommendation
  // "current" once its meal period has passed; isFresh is what gates that.
  const activePeriod = mealPeriodId(new Date(), getMealContext());
  const recommendationPeriod = latest
    ? mealPeriodId(new Date(latest.generatedAt), latest.request.mealContext)
    : null;
  const isFresh = Boolean(
    activePeriod && recommendationPeriod && activePeriod === recommendationPeriod,
  );

  return {
    hydrated,
    firstName: state?.preferences.firstName ?? "",
    currentRecommendation: latest?.recommendation ?? null,
    mealContext: latest?.request.mealContext ?? null,
    savedAt: latest?.generatedAt ?? null,
    madeAt: latest?.madeAt ?? null,
    isFresh,
    markMade,
    clearRecommendation,
    syncState,
  };
}
