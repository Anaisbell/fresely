import {
  ApiErrorSchema,
  GenerateDinnerRequestSchema,
  GenerateDinnerResponseSchema,
} from "./schema";
import type { DinnerRecommendation, OnboardingAnswers } from "./types";

export async function requestDinnerRecommendation(
  answers: OnboardingAnswers,
): Promise<DinnerRecommendation> {
  const request = GenerateDinnerRequestSchema.parse(answers);
  const response = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const parsedError = ApiErrorSchema.safeParse(body);
    throw new Error(
      parsedError.success
        ? parsedError.data.error.message
        : "Dinner could not be generated. Please try again.",
    );
  }

  return GenerateDinnerResponseSchema.parse(body).recommendation;
}

