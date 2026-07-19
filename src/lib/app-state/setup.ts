import type {
  DinnerRecommendation,
  MealContext,
  OnboardingAnswers,
} from "@/lib/dinner/types";
import { migrateLegacyState } from "./migration";
import { readAppState, writeAppState } from "./storage";
import type { FreselyAppState } from "./types";

export const SETUP_COOKIE_NAME = "fresely_setup";
const SETUP_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export type CompleteSetupResult = {
  state: FreselyAppState;
  written: boolean;
};

function setSetupCookie(): void {
  if (typeof document === "undefined") return;

  document.cookie = `${SETUP_COOKIE_NAME}=1; Path=/; Max-Age=${SETUP_COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
}

/**
 * Completes first-run setup after generation has produced a validated request
 * and recommendation. Normal repeated calls are idempotent and do not overwrite
 * valid durable state. The approved first-name backfill path may update a valid
 * existing record whose persisted firstName is empty while preserving durable
 * fields that are not owned by the refreshed onboarding data.
 */
export function completeSetupOnce(
  onboarding: OnboardingAnswers,
  recommendation: DinnerRecommendation,
  mealContext: MealContext,
  completedAt = new Date(),
): CompleteSetupResult {
  const existing = readAppState();
  if (existing) {
    if (!existing.preferences.firstName.trim()) {
      const migration = migrateLegacyState(
        onboarding,
        recommendation,
        completedAt,
        mealContext,
      );
      if (!migration.state) {
        throw new Error("Validated setup data could not be persisted");
      }

      const migratedRecommendation = migration.state.latestRecommendation;
      const state: FreselyAppState = {
        ...existing,
        preferences: {
          ...existing.preferences,
          ...migration.state.preferences,
        },
        pantry: {
          ...existing.pantry,
          ...migration.state.pantry,
        },
        latestRecommendation: migratedRecommendation
          ? {
              ...existing.latestRecommendation,
              ...migratedRecommendation,
              madeAt: null,
            }
          : existing.latestRecommendation,
      };

      writeAppState(state);
      setSetupCookie();
      return { state, written: true };
    }
    setSetupCookie();
    return { state: existing, written: false };
  }

  const migration = migrateLegacyState(
    onboarding,
    recommendation,
    completedAt,
    mealContext,
  );
  if (!migration.state) {
    throw new Error("Validated setup data could not be persisted");
  }

  writeAppState(migration.state);
  setSetupCookie();
  return { state: migration.state, written: true };
}

/**
 * Replaces only the latest recommendation after generation for an already
 * completed setup. Profile, pantry, and original setup metadata are preserved.
 */
export function persistGeneratedRecommendation(
  onboarding: OnboardingAnswers,
  recommendation: DinnerRecommendation,
  mealContext: MealContext,
  generatedAt = new Date(),
): FreselyAppState {
  const existing = readAppState();
  if (!existing) {
    throw new Error("Completed setup could not be read");
  }

  const migration = migrateLegacyState(
    onboarding,
    recommendation,
    generatedAt,
    mealContext,
  );
  if (!migration.state?.latestRecommendation) {
    throw new Error("Validated recommendation could not be persisted");
  }

  const state: FreselyAppState = {
    ...existing,
    latestRecommendation: migration.state.latestRecommendation,
  };
  writeAppState(state);
  return state;
}
