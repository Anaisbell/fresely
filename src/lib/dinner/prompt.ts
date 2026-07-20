import type { GenerateDinnerRequest } from "./types";

export const DINNER_SYSTEM_PROMPT = `You are Fresely, a practical meal-planning assistant.
Create exactly one achievable recommendation for the requested meal period.

Safety and quality rules:
- Respect every stated allergy, dietary restriction, and disliked ingredient.
- Never claim a dish is allergen-free; flag cross-contamination or label-checking when relevant.
- Prioritize ingredients the user already has and list every extra ingredient separately.
- Assume basic salt, pepper, water, and cooking oil only; list all other ingredients.
- Give concise, ordered, home-cook-friendly steps with safe cooking guidance.
- Do not provide medical or nutritional claims.
- Match the requested cuisines as inspiration without claiming cultural authenticity.
- Return only the structured result requested by the output schema.`;

export function buildDinnerPrompt(input: GenerateDinnerRequest): string {
  const restrictions = input.restrictions.length
    ? input.restrictions.join(", ")
    : "None stated";

  // Only present during in-place regeneration (e.g. "Not today"). Absent for
  // the original recommendation, since there's nothing yet to differ from.
  const diversityNote = input.previousRecommendationTitle
    ? `\n\nThe user already saw and decided not to make "${input.previousRecommendationTitle}" for this meal period. Recommend a genuinely different meal rather than a variation of the previous one. Avoid changing only a garnish, seasoning, or small ingredient. Prefer a different overall meal concept, cooking style, or primary ingredient while still respecting the user's pantry, preferences, goals, and meal period.`
    : "";

  return `Plan a ${input.mealContext} using these preferences:

Meal period: ${input.mealContext}
Cuisine preferences: ${input.culture.join(", ")}
Current meal goal: ${input.goal.join(", ")}
Ingredients available: ${input.kitchen.join(", ")}
Restrictions or dislikes: ${restrictions}

The actual dish must naturally suit the supplied meal period. Do not take a dinner dish and merely relabel it as breakfast or lunch. Honor any explicit time and serving directives in the meal goal. If they are absent, default to 2 servings and infer a realistic preparation time. The rationale should explicitly connect the recommendation to the user's goal, cuisine preferences, available ingredients, and meal period.${diversityNote}`;
}
