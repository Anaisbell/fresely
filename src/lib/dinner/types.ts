import type { z } from "zod";
import type {
  ApiErrorSchema,
  DinnerRecommendationContentSchema,
  DinnerRecommendationSchema,
  GenerateDinnerRequestSchema,
  GenerateDinnerResponseSchema,
  MealContextSchema,
  PartialOnboardingAnswersSchema,
  StoredGenerateDinnerRequestSchema,
} from "./schema";

export type OnboardingAnswers = z.infer<typeof PartialOnboardingAnswersSchema>;
export type GenerateDinnerRequest = z.infer<typeof GenerateDinnerRequestSchema>;
export type StoredGenerateDinnerRequest = z.infer<
  typeof StoredGenerateDinnerRequestSchema
>;
export type MealContext = z.infer<typeof MealContextSchema>;
export type DinnerRecommendationContent = z.infer<
  typeof DinnerRecommendationContentSchema
>;
export type DinnerRecommendation = z.infer<typeof DinnerRecommendationSchema>;
export type GenerateDinnerResponse = z.infer<typeof GenerateDinnerResponseSchema>;
export type ApiError = z.infer<typeof ApiErrorSchema>;
