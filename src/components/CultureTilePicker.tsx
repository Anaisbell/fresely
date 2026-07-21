"use client";

import { Tile } from "@/components/Tile";

export const CUISINES = [
  "Mexican",
  "Dominican",
  "Soul Food",
  "West African",
  "Caribbean",
  "Italian",
  "Mediterranean",
  "East Asian",
  "South Asian",
  "Southeast Asian",
  "Middle Eastern",
  "American comfort",
] as const;

export const CULTURE_NOT_SURE = "Still figuring it out";

type CultureTilePickerProps = {
  selected: string[];
  onChange: (next: string[]) => void;
  /**
   * Onboarding is the primary cuisine-selection experience, so its grid
   * stays full-weight (the default). Settings shows the same grid as one
   * field among several, not the page's whole purpose, so it opts into a
   * lighter footprint via Tile's own "compact" size — smaller padding and
   * type, tighter gap. The toggle/exclusivity behavior is identical either
   * way; only sizing changes.
   */
  compact?: boolean;
};

/**
 * The cuisine tile grid and its toggle/exclusivity logic — extracted from
 * onboarding's Culture step once Settings needed the identical picker for
 * editing cuisine preferences after onboarding. Selecting "Still figuring
 * it out" clears every other selection (and selecting anything else clears
 * it), since it represents "none of the above yet" rather than one more
 * preference alongside others.
 *
 * Fully controlled, like ChipList: no internal selection state, no
 * submit/continue affordance. Navigation and any local draft state are the
 * caller's concern (onboarding's Culture step keeps its own; Settings
 * commits directly since cultures already persists immediately there).
 */
export function CultureTilePicker({
  selected,
  onChange,
  compact = false,
}: CultureTilePickerProps) {
  function toggle(option: string) {
    const isSelected = selected.includes(option);
    let next: string[];
    if (option === CULTURE_NOT_SURE) {
      next = isSelected ? [] : [CULTURE_NOT_SURE];
    } else {
      const withoutNotSure = selected.filter((c) => c !== CULTURE_NOT_SURE);
      next = isSelected
        ? withoutNotSure.filter((c) => c !== option)
        : [...withoutNotSure, option];
    }
    onChange(next);
  }

  const tileSize = compact ? "compact" : "default";

  return (
    <div
      role="group"
      aria-label="Cuisine preferences"
      className={`grid grid-cols-2 ${compact ? "gap-1.5" : "gap-2"}`}
    >
      {CUISINES.map((cuisine) => (
        <Tile
          key={cuisine}
          selected={selected.includes(cuisine)}
          size={tileSize}
          onClick={() => toggle(cuisine)}
        >
          {cuisine}
        </Tile>
      ))}
      <Tile
        selected={selected.includes(CULTURE_NOT_SURE)}
        size={tileSize}
        onClick={() => toggle(CULTURE_NOT_SURE)}
        className="col-span-2"
      >
        {CULTURE_NOT_SURE}
      </Tile>
    </div>
  );
}
