import { AnchorRecipeSchema, type AnchorRecipe } from "../schema";
import { dominicanAnchorRecipes } from "./dominican";

/**
 * Aggregates every culture's recipe file into one validated library.
 * Register a new culture by adding its import and array below — nothing
 * else in the system (selection logic, generation routing, persistence,
 * UI) needs to change as this list grows. Deliberately near-empty for this
 * milestone: the job right now is the architecture, not the library.
 *
 * Sorted by `id` after validation so selection order is deterministic and
 * never depends on import/file order — matters once more than one culture
 * file (and therefore import order) is in play.
 *
 * Each entry is validated against AnchorRecipeSchema here, at the one
 * aggregation point, so a malformed addition in any culture file fails
 * loudly (a thrown error, visible immediately in development) instead of
 * silently producing a broken recommendation.
 */
const RAW_ANCHOR_RECIPES: AnchorRecipe[] = [...dominicanAnchorRecipes];

export const ANCHOR_RECIPES: AnchorRecipe[] = RAW_ANCHOR_RECIPES.map((recipe) =>
  AnchorRecipeSchema.parse(recipe),
).sort((a, b) => a.id.localeCompare(b.id));
