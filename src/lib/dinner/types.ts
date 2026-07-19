import type { z } from "zod";
import type {
  ApiErrorSchema,
  DinnerRecommendationSchema,
  GenerateDinnerRequestSchema,
  GenerateDinnerResponseSchema,
  PartialOnboardingAnswersSchema,
} from "./schema";

export type OnboardingAnswers = z.infer<typeof PartialOnboardingAnswersSchema>;
export type GenerateDinnerRequest = z.infer<typeof GenerateDinnerRequestSchema>;
export type DinnerRecommendation = z.infer<typeof DinnerRecommendationSchema>;
export type GenerateDinnerResponse = z.infer<typeof GenerateDinnerResponseSchema>;
export type ApiError = z.infer<typeof ApiErrorSchema>;

