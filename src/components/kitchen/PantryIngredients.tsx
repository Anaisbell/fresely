"use client";

import { ChipList } from "@/components/ChipList";

// Mirrors AppPantrySchema's bounds (src/lib/app-state/schema.ts) — kept as
// local constants rather than introspecting the Zod schema, matching the
// pattern already used for onboarding's own MIN/MAX_SERVINGS. Update both
// places together if the schema's bounds ever change.
const MAX_INGREDIENTS = 40;
const MAX_INGREDIENT_LENGTH = 120;

type PantryIngredientsProps = {
  ingredients: string[];
  onAdd: (ingredient: string) => void;
  onRemove: (ingredient: string) => void;
};

/**
 * Kitchen's thin domain wrapper around the shared ChipList primitive — this
 * file only pins down pantry-specific copy and AppPantrySchema's bounds.
 * The actual interaction behavior (dedupe, capacity handling, keyboard
 * focus restoration) lives in ChipList, shared with Settings' restriction
 * chips so both stay identical by construction rather than by discipline.
 */
export function PantryIngredients({
  ingredients,
  onAdd,
  onRemove,
}: PantryIngredientsProps) {
  return (
    <ChipList
      items={ingredients}
      onAdd={onAdd}
      onRemove={onRemove}
      maxItems={MAX_INGREDIENTS}
      maxItemLength={MAX_INGREDIENT_LENGTH}
      addLabel="+ Add ingredient"
      addAriaLabel="Add ingredient"
      inputAriaLabel="New ingredient"
      inputPlaceholder="e.g. chicken thighs"
      emptyMessage="Your kitchen is empty for now."
      fullMessage="Your kitchen is full. Remove an ingredient to add another."
    />
  );
}
