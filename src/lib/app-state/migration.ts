import {
  DinnerRecommendationSchema,
  GenerateDinnerRequestSchema,
  PartialOnboardingAnswersSchema,
} from "@/lib/dinner/schema";
import type {
  DinnerRecommendation,
  OnboardingAnswers,
} from "@/lib/dinner/types";
import { APP_STATE_VERSION, FreselyAppStateSchema } from "./schema";
import type { FreselyAppState } from "./types";

export type LegacyMigrationResult = {
  state: FreselyAppState | null;
  onboarding: OnboardingAnswers;
};

function sanitizeLegacyOnboarding(value: unknown): OnboardingAnswers {
  const input =
    typeof value === "object" && value !== null
      ? (value as Record<string, unknown>)
      : {};

  const field = <K extends keyof OnboardingAnswers>(key: K) => {
    const parsed = PartialOnboardingAnswersSchema.shape[key].safeParse(input[key]);
    return parsed.success ? parsed.data : [];
  };

  return {
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
): LegacyMigrationResult {
  const onboarding = sanitizeLegacyOnboarding(legacyOnboarding);
  const request = GenerateDinnerRequestSchema.safeParse(onboarding);
  const recommendation = DinnerRecommendationSchema.safeParse(
    legacyRecommendation,
  );

  if (!request.success || !recommendation.success) {
    return { state: null, onboarding };
  }

  const timestamp = migratedAt.toISOString();
  const state = FreselyAppStateSchema.parse({
    version: APP_STATE_VERSION,
    setup: { completedAt: timestamp },
    preferences: {
      cultures: request.data.culture,
      restrictions: request.data.restrictions,
      defaultServings: readServings(request.data.goal),
    },
    pantry: {
      ingredients: request.data.kitchen,
      updatedAt: timestamp,
    },
    latestRecommendation: {
      recommendation: recommendation.data as DinnerRecommendation,
      generatedAt: timestamp,
      request: request.data,
    },
  });

  return { state, onboarding };
}

