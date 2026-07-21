import { DinnerRecommendationSchema } from "../schema";
import type {
  DinnerRecommendation,
  GenerateDinnerRequest,
  MealContext,
} from "../types";
import { ANCHOR_RECIPES } from "./data";
import type { AnchorRecipe } from "./schema";

/**
 * Selection priority for "Made for Your Roots" (agreed with product):
 *
 *   1. Safety & dietary restrictions — always excludes a match. Never
 *      overridable, same rule the AI generation prompt already enforces.
 *   2. Pantry compatibility — excludes a match if the user can't realistically
 *      make it from what they have.
 *   3. Meal context (breakfast/lunch/dinner) — part of the base match; a
 *      recipe for the wrong meal period is never a candidate at all.
 *   4. Time available — excludes a match if the user asked for less time
 *      than the recipe needs.
 *   5. Goals (e.g. weight loss, protein) — influence ranking only, never
 *      exclude a match. Not implemented yet: with at most one candidate per
 *      culture + meal context in the library today, ranking has nothing to
 *      choose between. Add ranking here once multiple anchors can match the
 *      same request, without changing anything above this function.
 *
 * A curated recipe is the default whenever it's safe and practical. AI is
 * the fallback and personalization layer, used only when no curated recipe
 * survives these filters — never simply because AI could optimize further.
 */

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

// Loose containment match: "chicken breast" (pantry) satisfies "chicken"
// (recipe ingredient) and vice versa. A v1 heuristic, not fuzzy/NLP
// ingredient matching — deliberately simple so it stays easy to reason
// about as the library grows. Tightening this later doesn't require
// touching anything outside this file.
function looselyMatches(a: string, b: string): boolean {
  const left = normalize(a);
  const right = normalize(b);
  return left.includes(right) || right.includes(left);
}

function anchorKey(culture: string, mealContext: MealContext): string {
  return `${normalize(culture)}:${mealContext}`;
}

// Built once at module load, not per request. ANCHOR_RECIPES is static, so
// this turns "scan every recipe in the library" into an O(1) lookup keyed
// by the one thing every request always narrows on first — this is what
// keeps selection cheap as the library grows into the hundreds or
// thousands, without needing to change anything below.
const ANCHOR_RECIPES_BY_KEY: Map<string, AnchorRecipe[]> = (() => {
  const index = new Map<string, AnchorRecipe[]>();
  for (const recipe of ANCHOR_RECIPES) {
    const key = anchorKey(recipe.culture, recipe.mealContext);
    const bucket = index.get(key);
    if (bucket) {
      bucket.push(recipe);
    } else {
      index.set(key, [recipe]);
    }
  }
  return index;
})();

function candidatesFor(request: GenerateDinnerRequest): AnchorRecipe[] {
  return request.culture.flatMap(
    (culture) => ANCHOR_RECIPES_BY_KEY.get(anchorKey(culture, request.mealContext)) ?? [],
  );
}

// Hard safety exclusion. Mirrors the same non-negotiable rule the AI system
// prompt states ("Respect every stated allergy, dietary restriction, and
// disliked ingredient") — a curated recipe gets no exception.
function conflictsWithRestrictions(
  recipe: AnchorRecipe,
  restrictions: string[],
): boolean {
  return recipe.allergenTags.some((tag) =>
    restrictions.some((restriction) => looselyMatches(tag, restriction)),
  );
}

// "Realistically cookable": every core (defining) ingredient must already
// be in the user's pantry. Flexible ingredients never block a match — they
// behave like the "additional ingredients" the AI path already lists
// separately for the user to pick up.
function isPantryCompatible(recipe: AnchorRecipe, kitchen: string[]): boolean {
  return recipe.coreIngredients.every((ingredient) =>
    kitchen.some((pantryItem) => looselyMatches(pantryItem, ingredient)),
  );
}

// Mirrors the small local directive-parsing helpers already used elsewhere
// (readDirective in onboarding/details/page.tsx, readServings in
// migration.ts) rather than introducing a new shared utility for one field.
function readAvailableMinutes(goal: string[]): number | null {
  const prefix = "Time available: ";
  const directive = goal.find((value) => value.startsWith(prefix));
  if (!directive) return null;
  const parsed = Number.parseInt(directive.slice(prefix.length), 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function fitsAvailableTime(recipe: AnchorRecipe, goal: string[]): boolean {
  const availableMinutes = readAvailableMinutes(goal);
  if (availableMinutes === null) return true; // no stated constraint
  return recipe.timeMinutes <= availableMinutes;
}

/**
 * Returns the curated anchor recipe to use for this request, or null if
 * none is safe and practical — in which case the caller (generate.ts) falls
 * back to AI generation.
 */
export function selectAnchorRecipe(
  request: GenerateDinnerRequest,
): AnchorRecipe | null {
  const candidates = candidatesFor(request)
    .filter((recipe) => !conflictsWithRestrictions(recipe, request.restrictions))
    .filter((recipe) => isPantryCompatible(recipe, request.kitchen))
    .filter((recipe) => fitsAvailableTime(recipe, request.goal));

  return candidates[0] ?? null;
}

/**
 * Maps a selected anchor recipe to the same DinnerRecommendation shape the
 * AI path produces, so no rendering or persistence code needs to know
 * anchor recipes exist. `availableIngredients` includes every core
 * ingredient (a match already confirmed they're in the pantry) plus any
 * flexible ingredient the user happens to have; the rest of the flexible
 * list becomes `additionalIngredients`, same convention the AI prompt uses.
 */
export function anchorRecipeToRecommendation(
  recipe: AnchorRecipe,
  kitchen: string[],
): DinnerRecommendation {
  const flexibleInPantry = recipe.flexibleIngredients.filter((ingredient) =>
    kitchen.some((pantryItem) => looselyMatches(pantryItem, ingredient)),
  );
  const flexibleNotInPantry = recipe.flexibleIngredients.filter(
    (ingredient) => !flexibleInPantry.includes(ingredient),
  );

  return DinnerRecommendationSchema.parse({
    title: recipe.title,
    rationale: recipe.rationale,
    timeMinutes: recipe.timeMinutes,
    servings: recipe.servings,
    availableIngredients: [...recipe.coreIngredients, ...flexibleInPantry],
    additionalIngredients: flexibleNotInPantry,
    steps: recipe.steps,
    caution: recipe.caution,
    source: "anchor",
  });
}
