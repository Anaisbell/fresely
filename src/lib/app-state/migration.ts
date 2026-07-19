import {
  DinnerRecommendationSchema,
  OnboardingAnswersSchema,
  PartialOnboardingAnswersSchema,
  StoredGenerateDinnerRequestSchema,
} from "@/lib/dinner/schema";
import type {
  DinnerRecommendation,
  MealContext,
  OnboardingAnswers,
} from "@/lib/dinner/types";
import { APP_STATE_VERSION, FreselyAppStateSchema } from "./schema";
import type { FreselyAppState } from "./types";

export type LegacyMigrationResult = {
  state: FreselyAppState | null;
  onboarding: OnboardingAnswers;
};

function sanitizeLegacyOnboarding(value: unknown): OnboardingAnswers {
  const defaults = PartialOnboardingAnswersSchema.parse({});
  const input =
    typeof value === "object" && value !== null
      ? (value as Record<string, unknown>)
      : {};

  const field = <K extends keyof OnboardingAnswers>(
    key: K,
  ): OnboardingAnswers[K] => {
    const parsed = PartialOnboardingAnswersSchema.shape[key].safeParse(input[key]);
    return parsed.success
      ? (parsed.data as OnboardingAnswers[K])
      : defaults[key];
  };

  return {
    firstName: field("firstName"),
    culture: field("culture"),
    goal: field("goal"),
    kitchen: field("kitchen"),
    restrictions: field("restrictions"),
  };
}

function readServings(goal: string[], fallback = 2): number {
  const prefix = "Servings: ";
  const directive = goal.find((value) => value.startsWith(prefix));
  const parsed = directive
    ? Number.parseInt(directive.slice(prefix.length), 10)
    : NaN;

  return Number.isInteger(parsed) && parsed >= 1 && parsed <= 12
    ? parsed
    : fallback;
}

export function migrateLegacyState(
  legacyOnboarding: unknown,
  legacyRecommendation: unknown,
  migratedAt = new Date(),
  mealContext: MealContext | null = null,
): LegacyMigrationResult {
  const onboarding = sanitizeLegacyOnboarding(legacyOnboarding);
  const foodRequest = OnboardingAnswersSchema.safeParse({
    culture: onboarding.culture,
    goal: onboarding.goal,
    kitchen: onboarding.kitchen,
    restrictions: onboarding.restrictions,
  });
  const recommendation = DinnerRecommendationSchema.safeParse(
    legacyRecommendation,
  );

  if (
    !onboarding.firstName.trim() ||
    !foodRequest.success ||
    !recommendation.success
  ) {
    return { state: null, onboarding };
  }

  const timestamp = migratedAt.toISOString();
  const request = StoredGenerateDinnerRequestSchema.parse({
    ...foodRequest.data,
    mealContext,
  });
  const state = FreselyAppStateSchema.parse({
    version: APP_STATE_VERSION,
    setup: { completedAt: timestamp },
    preferences: {
      firstName: onboarding.firstName,
      cultures: request.culture,
      restrictions: request.restrictions,
      defaultServings: readServings(request.goal),
    },
    pantry: {
      ingredients: request.kitchen,
      updatedAt: timestamp,
    },
    latestRecommendation: {
      recommendation: recommendation.data as DinnerRecommendation,
      generatedAt: timestamp,
      request,
    },
  });

  return { state, onboarding };
}
