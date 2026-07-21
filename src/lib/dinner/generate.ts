import { anchorRecipeToRecommendation, selectAnchorRecipe } from "./anchor-recipes/select";
import { generateDinnerRecommendation } from "./claude";
import type { DinnerRecommendation, GenerateDinnerRequest } from "./types";

/**
 * Single entry point for "Made for Your Roots" hybrid sourcing. Curated
 * anchor recipes take priority when one matches and is safe/practical for
 * the request; AI generation is the fallback and personalization layer.
 * Callers (the /api/generate route) don't need to know which path served
 * a given recommendation — both return the same DinnerRecommendation shape,
 * tagged with `source`.
 */
export async function getDinnerRecommendation(
  request: GenerateDinnerRequest,
): Promise<DinnerRecommendation> {
  const anchor = selectAnchorRecipe(request);
  if (anchor) {
    return anchorRecipeToRecommendation(anchor, request.kitchen);
  }

  return generateDinnerRecommendation(request);
}
