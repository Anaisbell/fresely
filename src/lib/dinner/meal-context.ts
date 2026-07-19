import type { MealContext } from "./types";

/**
 * Resolves the meal period from local time.
 * Breakfast: 05:00–10:59; lunch: 11:00–15:59; dinner: 16:00–04:59.
 */
export function getMealContext(date = new Date()): MealContext {
  const hour = date.getHours();

  if (hour >= 5 && hour < 11) return "breakfast";
  if (hour >= 11 && hour < 16) return "lunch";
  return "dinner";
}
