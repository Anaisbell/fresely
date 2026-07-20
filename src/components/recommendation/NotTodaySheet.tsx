"use client";

import { useState } from "react";
import { BottomSheet } from "@/components/BottomSheet";
import { Button } from "@/components/Button";

const REASONS = [
  { emoji: "🥘", label: "Too heavy" },
  { emoji: "💰", label: "Too expensive" },
  { emoji: "🛒", label: "Missing ingredients" },
  { emoji: "⏱️", label: "Too much effort" },
  { emoji: "😋", label: "Not in the mood" },
  { emoji: "✨", label: "Just something different" },
] as const;

type NotTodaySheetProps = {
  open: boolean;
  onClose: () => void;
  onContinue: () => void;
};

/**
 * "What wasn't quite right?" reason picker shown when the user taps
 * "Not tonight" on the featured recommendation. The selected reason is V1
 * only: it is never sent to the API and never persisted anywhere. Continue
 * triggers the exact same regeneration regardless of which reason (or
 * none) was selected — the reason only gives the interaction a moment of
 * intent before the pick changes.
 */
export function NotTodaySheet({
  open,
  onClose,
  onContinue,
}: NotTodaySheetProps) {
  const [selected, setSelected] = useState<string | null>(null);

  function handleClose() {
    setSelected(null);
    onClose();
  }

  function handleContinue() {
    setSelected(null);
    onContinue();
  }

  return (
    <BottomSheet
      open={open}
      onClose={handleClose}
      title="What wasn't quite right?"
      subtitle="Help Fresely find a better match."
    >
      <div className="grid grid-cols-2 gap-3">
        {REASONS.map(({ emoji, label }) => {
          const isSelected = selected === label;
          return (
            <button
              key={label}
              type="button"
              onClick={() => setSelected(label)}
              aria-pressed={isSelected}
              className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-left text-sm transition-colors ${
                isSelected
                  ? "border-charcoal bg-charcoal text-cream"
                  : "border-line text-charcoal hover:border-muted"
              }`}
            >
              <span aria-hidden="true">{emoji}</span>
              <span>{label}</span>
            </button>
          );
        })}
      </div>
      <Button
        onClick={handleContinue}
        disabled={!selected}
        className="w-full justify-center mt-8"
      >
        Continue &rarr;
      </Button>
    </BottomSheet>
  );
}
