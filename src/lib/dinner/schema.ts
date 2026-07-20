import { z } from "zod";

export const OnboardingAnswersSchema = z.object({
  culture: z.array(z.string().trim().min(1).max(80)).min(1).max(12),
  goal: z.array(z.string().trim().min(1).max(120)).min(1).max(3),
  kitchen: z.array(z.string().trim().min(1).max(120)).min(1).max(40),
  restrictions: z.array(z.string().trim().min(1).max(120)).max(20),
});

export const PartialOnboardingAnswersSchema = z.object({
  firstName: z.string().trim().max(60).default(""),
  // Session state is written after every onboarding step, so required fields
  // must accept an empty array until the user reaches generation. Element and
  // maximum-size validation remain identical to the final request contract.
  culture: z
    .array(OnboardingAnswersSchema.shape.culture.element)
    .max(12)
    .default([]),
  goal: z.array(OnboardingAnswersSchema.shape.goal.element).max(3).default([]),
  kitchen: z
    .array(OnboardingAnswersSchema.shape.kitchen.element)
    .max(40)
    .default([]),
  restrictions: z
    .array(OnboardingAnswersSchema.shape.restrictions.element)
    .max(20)
    .default([]),
});

export const DinnerRecommendationSchema = z.object({
  title: z.string().trim().min(1).max(120),
  rationale: z.string().trim().min(1).max(500),
  timeMinutes: z.number().int().min(5).max(180),
  servings: z.number().int().min(1).max(12),
  availableIngredients: z.array(z.string().trim().min(1).max(120)).max(40),
  additionalIngredients: z.array(z.string().trim().min(1).max(120)).max(30),
  steps: z.array(z.string().trim().min(1).max(600)).min(2).max(12),
  caution: z.string().trim().max(500).nullable(),
});

export const MealContextSchema = z.enum(["breakfast", "lunch", "dinner"]);

// Ephemeral, per-call diversity hint for in-place regeneration (e.g. "Not
// today"). Not part of StoredGenerateDinnerRequestSchema below — it must
// never be persisted, only ever reflect whatever was on screen a moment ago.
export const GenerateDinnerRequestSchema = OnboardingAnswersSchema.extend({
  mealContext: MealContextSchema,
  previousRecommendationTitle: z.string().trim().min(1).max(120).optional(),
});

// Durable version 1 records predate meal-period awareness. Missing values are
// normalized to null without weakening the strict live generation contract.
export const StoredGenerateDinnerRequestSchema = OnboardingAnswersSchema.extend({
  mealContext: MealContextSchema.nullable().default(null),
});

export const GenerateDinnerResponseSchema = z.object({
  recommendation: DinnerRecommendationSchema,
});

export const ApiErrorSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
  }),
});
