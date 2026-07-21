"use client";

import { BottomSheet } from "@/components/BottomSheet";
import { RecommendationSteps } from "@/components/recommendation/RecommendationSteps";
import type { AnchorRecipe } from "@/lib/dinner/anchor-recipes/schema";

type RootsSpotlightSheetProps = {
  recipe: AnchorRecipe | null;
  open: boolean;
  onClose: () => void;
};

/**
 * The "Made for Your Roots" recipe preview, opened by tapping the spotlight
 * card. Read-only exploration today, not a cooking decision — no Cook Now,
 * no Made it / Not tonight, nothing implying this becomes tonight's active
 * pick. That's why it's its own sheet rather than reusing the hero's
 * expand/collapse "Cook Now" details.
 *
 * Structured to grow into the full recipe experience later (actions like
 * Cook this, ingredient ownership, timers, saving) without a rewrite, even
 * though none of that is built yet:
 *   - Content is split into named sub-components below (Summary,
 *     Ingredients), each a real component boundary rather than inline JSX,
 *     so a future change to one (e.g. Ingredients gaining a checkbox per
 *     item) doesn't touch the others.
 *   - Ingredients render as an actual list — one element per item — not a
 *     joined string, specifically so "ownership" state can attach to each
 *     <li> later without reshaping the data.
 *   - There's a marked, currently-empty spot reserved for future actions.
 *   - Deliberately no speculative props (no onCookThis, onSave, etc.) —
 *     guessing at that API now, before the real UX is scoped, is more
 *     likely to need rework than to prevent it.
 *
 * Ingredients are listed directly here rather than via
 * RecommendationIngredients — that component's "In your kitchen" / "You'll
 * also need" framing asserts a pantry match, but selectSpotlightAnchorRecipe
 * deliberately never checks the pantry, so reusing it here would claim
 * something that isn't true. RecommendationSteps has no such framing, so
 * it's reused as-is.
 *
 * `recipe` is nullable defensively (BottomSheet's own open/close mechanics
 * don't require content); in practice Home only ever opens this once a
 * spotlight recipe already exists to preview.
 */
export function RootsSpotlightSheet({
  recipe,
  open,
  onClose,
}: RootsSpotlightSheetProps) {
  if (!recipe) return null;

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={recipe.title}
      subtitle={`A taste of ${recipe.culture} home cooking.`}
    >
      <div className="space-y-8">
        <RootsSpotlightSummary recipe={recipe} />
        <RootsSpotlightIngredients recipe={recipe} />
        <RecommendationSteps steps={recipe.steps} />
        {/* Reserved for future actions (Cook this, Save, timers). This is
            the one place they'd be added — nothing above needs to change
            when they are. Intentionally not built yet. */}
      </div>
    </BottomSheet>
  );
}

/**
 * The "why this recipe, and the basics" read-only summary: rationale,
 * time/servings, and an optional safety note. Its own component so a
 * future Cook-this flow can change how the summary reads (e.g. once
 * cooking is underway) without touching ingredients or steps.
 */
function RootsSpotlightSummary({ recipe }: { recipe: AnchorRecipe }) {
  return (
    <div className="space-y-3">
      <p className="text-base text-charcoal leading-relaxed">
        {recipe.rationale}
      </p>
      <p className="text-sm text-quiet">
        ⏱ {recipe.timeMinutes} min &nbsp;•&nbsp; 🍽 Serves {recipe.servings}
      </p>
      {recipe.caution ? (
        <p className="text-sm text-muted leading-relaxed">{recipe.caution}</p>
      ) : null}
    </div>
  );
}

/**
 * A real list — each ingredient its own <li>, not a joined string — so a
 * future "ingredient ownership" checkbox can attach per item without
 * changing how this data is shaped or fetched. Still deliberately not
 * pantry-aware and not split into available/needed groups; see the module
 * doc comment above for why RecommendationIngredients isn't reused here.
 */
function RootsSpotlightIngredients({ recipe }: { recipe: AnchorRecipe }) {
  const ingredients = [...recipe.coreIngredients, ...recipe.flexibleIngredients];

  return (
    <section>
      <h2 className="font-serif italic text-lg text-charcoal mb-3">
        Ingredients
      </h2>
      <ul className="space-y-1.5">
        {ingredients.map((ingredient, index) => (
          <li
            key={index}
            className="text-base text-charcoal leading-relaxed"
          >
            {ingredient}
          </li>
        ))}
      </ul>
    </section>
  );
}
