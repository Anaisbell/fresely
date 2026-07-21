"use client";

import { ChipList } from "@/components/ChipList";

// Mirrors AppPreferencesSchema's restrictions bounds (src/lib/app-state/schema.ts).
const MAX_RESTRICTIONS = 20;
const MAX_RESTRICTION_LENGTH = 120;

type RestrictionChipsProps = {
  restrictions: string[];
  onAdd: (restriction: string) => void;
  onRemove: (restriction: string) => void;
};

/**
 * Settings' thin domain wrapper around the shared ChipList primitive —
 * mirrors Kitchen's PantryIngredients. Dietary restrictions are the same
 * underlying shape (a capped string list) with the same "delete one thing
 * without retyping everything" motivation, so the interaction model stays
 * identical by construction rather than by separately-maintained discipline.
 */
export function RestrictionChips({
  restrictions,
  onAdd,
  onRemove,
}: RestrictionChipsProps) {
  return (
    <ChipList
      items={restrictions}
      onAdd={onAdd}
      onRemove={onRemove}
      maxItems={MAX_RESTRICTIONS}
      maxItemLength={MAX_RESTRICTION_LENGTH}
      addLabel="+ Add restriction"
      addAriaLabel="Add restriction"
      inputAriaLabel="New restriction"
      inputPlaceholder="e.g. peanuts"
      emptyMessage="No dietary restrictions added yet."
      fullMessage="You've reached the limit. Remove one to add another."
    />
  );
}
