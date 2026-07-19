import {
  DinnerRecommendationSchema,
  PartialOnboardingAnswersSchema,
} from "@/lib/dinner/schema";
import type {
  DinnerRecommendation,
  OnboardingAnswers,
} from "@/lib/dinner/types";

export const ONBOARDING_STORAGE_KEY = "fresely:onboarding";
export const RECOMMENDATION_STORAGE_KEY = "fresely:recommendation";

export const EMPTY_ONBOARDING_ANSWERS: OnboardingAnswers = {
  firstName: "",
  culture: [],
  goal: [],
  kitchen: [],
  restrictions: [],
};

function readJson(key: string): unknown {
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem(key);
  return raw ? JSON.parse(raw) : null;
}

export function readOnboardingAnswers(): OnboardingAnswers {
  try {
    return PartialOnboardingAnswersSchema.parse(
      readJson(ONBOARDING_STORAGE_KEY) ?? EMPTY_ONBOARDING_ANSWERS,
    );
  } catch {
    return { ...EMPTY_ONBOARDING_ANSWERS };
  }
}

export function writeOnboardingAnswers(answers: OnboardingAnswers): void {
  if (typeof window === "undefined") return;
  const validated = PartialOnboardingAnswersSchema.parse(answers);
  window.sessionStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(validated));
}

export function clearOnboardingAnswers(): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(ONBOARDING_STORAGE_KEY);
}

export function readRecommendation(): DinnerRecommendation | null {
  try {
    const stored = readJson(RECOMMENDATION_STORAGE_KEY);
    return stored ? DinnerRecommendationSchema.parse(stored) : null;
  } catch {
    return null;
  }
}

export function writeRecommendation(value: DinnerRecommendation): void {
  if (typeof window === "undefined") return;
  const validated = DinnerRecommendationSchema.parse(value);
  window.sessionStorage.setItem(
    RECOMMENDATION_STORAGE_KEY,
    JSON.stringify(validated),
  );
}

export function clearDinnerSession(): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(ONBOARDING_STORAGE_KEY);
  window.sessionStorage.removeItem(RECOMMENDATION_STORAGE_KEY);
}
