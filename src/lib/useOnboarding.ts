"use client";

import { useEffect, useState } from "react";
import type { OnboardingAnswers } from "@/lib/dinner/types";
import {
  clearOnboardingAnswers,
  EMPTY_ONBOARDING_ANSWERS,
  readOnboardingAnswers,
  writeOnboardingAnswers,
} from "@/lib/session/dinner-state";

export type { OnboardingAnswers } from "@/lib/dinner/types";

/**
 * Beta state hook for the onboarding flow.
 *
 * Persists answers to sessionStorage so they survive the onboarding flow → /tonight
 * within a single browser session. Cleared when the tab closes. Will be replaced
 * by Supabase in Phase 0 Week 3.
 */
export function useOnboarding() {
  const [answers, setAnswers] = useState<OnboardingAnswers>(
    EMPTY_ONBOARDING_ANSWERS,
  );
  const [hydrated, setHydrated] = useState(false);

  // On mount, read any answers stored earlier in this session.
  useEffect(() => {
    try {
      // sessionStorage is an external browser system and can only be read after mount.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAnswers(readOnboardingAnswers());
    } catch {
      // Malformed storage — ignore and start empty.
    }
    setHydrated(true);
  }, []);

  // Whenever answers change (post-hydration), write them back to sessionStorage.
  useEffect(() => {
    if (!hydrated) return;
    try {
      writeOnboardingAnswers(answers);
    } catch {
      // Quota exceeded or storage disabled — silently continue.
    }
  }, [answers, hydrated]);

  function setField<K extends keyof OnboardingAnswers>(
    key: K,
    value: OnboardingAnswers[K],
  ) {
    setAnswers((prev) => {
      const next = { ...prev, [key]: value };
      try {
        // Persist before route navigation can unmount the current page.
        writeOnboardingAnswers(next);
      } catch {
        // Quota exceeded or storage disabled — in-memory state still works.
      }
      return next;
    });
  }

  function clear() {
    setAnswers(EMPTY_ONBOARDING_ANSWERS);
    try {
      clearOnboardingAnswers();
    } catch {
      // ignore
    }
  }

  return { answers, setField, clear, hydrated };
}
