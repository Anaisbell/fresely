import { FreselyAppStateSchema } from "./schema";
import { migrateLegacyState } from "./migration";
import type { FreselyAppState } from "./types";
import {
  ONBOARDING_STORAGE_KEY,
  RECOMMENDATION_STORAGE_KEY,
  writeOnboardingAnswers,
} from "@/lib/session/dinner-state";
import type { OnboardingAnswers } from "@/lib/dinner/types";

export const APP_STATE_STORAGE_KEY = "fresely:app-state:v1";

export type AppStateRecoveryResult =
  | {
      status: "ready";
      state: FreselyAppState;
      migrated: boolean;
    }
  | {
      status: "resume-onboarding";
      route: "/onboarding/name" | "/onboarding/culture" | "/onboarding/goal" | "/onboarding/details" | "/onboarding/loading";
      onboarding: OnboardingAnswers;
    };

export function readAppState(): FreselyAppState | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(APP_STATE_STORAGE_KEY);
    if (!raw) return null;
    return FreselyAppStateSchema.parse(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function writeAppState(state: FreselyAppState): void {
  if (typeof window === "undefined") return;

  const validated = FreselyAppStateSchema.parse(state);
  window.localStorage.setItem(APP_STATE_STORAGE_KEY, JSON.stringify(validated));
}

export function updateAppState(
  update: (current: FreselyAppState) => FreselyAppState,
): FreselyAppState | null {
  const current = readAppState();
  if (!current) return null;

  const next = FreselyAppStateSchema.parse(update(current));
  writeAppState(next);
  return next;
}

export function clearAppState(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(APP_STATE_STORAGE_KEY);
}

function earliestOnboardingRoute(
  answers: OnboardingAnswers,
): AppStateRecoveryResult & { status: "resume-onboarding" } {
  if (!answers.firstName.trim()) {
    return { status: "resume-onboarding", route: "/onboarding/name", onboarding: answers };
  }
  if (!answers.culture.length) {
    return { status: "resume-onboarding", route: "/onboarding/culture", onboarding: answers };
  }
  if (!answers.goal.length) {
    return { status: "resume-onboarding", route: "/onboarding/goal", onboarding: answers };
  }
  if (!answers.kitchen.length) {
    return { status: "resume-onboarding", route: "/onboarding/details", onboarding: answers };
  }
  return { status: "resume-onboarding", route: "/onboarding/loading", onboarding: answers };
}

function readLegacyJson(key: string): unknown {
  try {
    const raw = window.sessionStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function readOrMigrateAppState(
  migratedAt = new Date(),
): AppStateRecoveryResult {
  const existing = readAppState();
  if (existing) {
    if (!existing.preferences.firstName.trim()) {
      const onboarding: OnboardingAnswers = {
        firstName: "",
        culture: existing.preferences.cultures,
        goal: existing.latestRecommendation?.request.goal ?? [],
        kitchen: existing.pantry.ingredients,
        restrictions: existing.preferences.restrictions,
      };
      try {
        writeOnboardingAnswers(onboarding);
      } catch {
        // The guard can still redirect safely when session storage is unavailable.
      }
      return earliestOnboardingRoute(onboarding);
    }
    return { status: "ready", state: existing, migrated: false };
  }

  if (typeof window === "undefined") {
    return earliestOnboardingRoute({
      firstName: "",
      culture: [],
      goal: [],
      kitchen: [],
      restrictions: [],
    });
  }

  // Remove only the invalid durable record. Legacy onboarding answers live
  // under separate session keys and remain available for migration/resume.
  if (window.localStorage.getItem(APP_STATE_STORAGE_KEY) !== null) {
    clearAppState();
  }

  const onboarding = readLegacyJson(ONBOARDING_STORAGE_KEY);
  const recommendation = readLegacyJson(RECOMMENDATION_STORAGE_KEY);
  const migration = migrateLegacyState(
    onboarding,
    recommendation,
    migratedAt,
  );

  if (migration.state) {
    writeAppState(migration.state);
    return { status: "ready", state: migration.state, migrated: true };
  }

  try {
    // Replace only the malformed composite record with the field-by-field
    // sanitized result so independently valid answers remain usable on resume.
    writeOnboardingAnswers(migration.onboarding);
  } catch {
    // Redirect recovery still remains safe when session storage is unavailable.
  }

  return earliestOnboardingRoute(migration.onboarding);
}
