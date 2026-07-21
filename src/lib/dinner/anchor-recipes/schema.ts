import { z } from "zod";
import { MealContextSchema } from "../schema";

/**
 * A curated, manually reviewed cultural classic for "Made for Your Roots".
 * This is the authoring/storage shape — richer than DinnerRecommendation,
 * since selection needs data (culture, allergen tags, ingredient tiers)
 * that the final recommendation shown to the user doesn't. `select.ts` maps
 * a matched AnchorRecipe down to the existing DinnerRecommendation shape,
 * so no UI or persistence code needs to know this schema exists.
 *
 * Field constraints mirror DinnerRecommendationContentSchema where the
 * content is the same kind of data (title, rationale, steps, etc.) so a
 * curated recipe can never fail validation once mapped to the output shape.
 *
 * `coreIngredients` are the ingredients that define the dish — used for the
 * pantry-compatibility check in select.ts, and always shown to the user as
 * "available" once a recipe is selected (a match already confirms the user
 * has them). `flexibleIngredients` are secondary (seasonings, garnishes,
 * swappable sides) — never block a match, and are split into
 * available/additional per the user's actual pantry when mapped.
 *
 * `allergenTags` is how a curator declares known conflicts (e.g. "dairy",
 * "shellfish", "gluten", "pork", "nuts") without free-text guesswork at
 * selection time — see conflictsWithRestrictions in select.ts.
 */
export const AnchorRecipeSchema = z.object({
  id: z.string().trim().min(1).max(80),
  culture: z.string().trim().min(1).max(80),
  mealContext: MealContextSchema,
  title: z.string().trim().min(1).max(120),
  rationale: z.string().trim().min(1).max(500),
  timeMinutes: z.number().int().min(5).max(180),
  servings: z.number().int().min(1).max(12),
  coreIngredients: z.array(z.string().trim().min(1).max(120)).min(1).max(20),
  flexibleIngredients: z.array(z.string().trim().min(1).max(120)).max(30),
  steps: z.array(z.string().trim().min(1).max(600)).min(2).max(12),
  caution: z.string().trim().max(500).nullable(),
  allergenTags: z.array(z.string().trim().min(1).max(40)).max(20),
});

export type AnchorRecipe = z.infer<typeof AnchorRecipeSchema>;
