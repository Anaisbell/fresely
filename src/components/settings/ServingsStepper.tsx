"use client";

// Mirrors AppPreferencesSchema.defaultServings' bounds (src/lib/app-state/
// schema.ts) — the schema's actual range. Onboarding Details' own stepper
// is narrower (1-6), a separate, known, out-of-scope inconsistency (see
// FRESELY_PRODUCT_CONTEXT.md); this one intentionally matches the schema.
const MIN_SERVINGS = 1;
const MAX_SERVINGS = 12;

type ServingsStepperProps = {
  value: number;
  onChange: (value: number) => void;
};

/**
 * Visually and behaviorally the same +/- stepper onboarding's Details
 * screen already established — reused as a pattern rather than an
 * extracted shared component, since the logic here (a couple of clamped
 * lines) doesn't carry the same duplication risk ChipList or
 * CultureTilePicker did.
 */
export function ServingsStepper({ value, onChange }: ServingsStepperProps) {
  function adjust(delta: number) {
    onChange(Math.min(MAX_SERVINGS, Math.max(MIN_SERVINGS, value + delta)));
  }

  return (
    <div className="flex items-center gap-6">
      <button
        type="button"
        onClick={() => adjust(-1)}
        disabled={value <= MIN_SERVINGS}
        aria-label="Decrease servings"
        className="w-10 h-10 rounded-full bg-surface text-charcoal text-xl leading-none hover:bg-warm transition-colors disabled:opacity-30 disabled:hover:bg-surface disabled:cursor-not-allowed"
      >
        −
      </button>
      <span
        aria-live="polite"
        aria-label={`${value} servings`}
        className="font-serif text-3xl w-10 text-center"
      >
        {value}
      </span>
      <button
        type="button"
        onClick={() => adjust(1)}
        disabled={value >= MAX_SERVINGS}
        aria-label="Increase servings"
        className="w-10 h-10 rounded-full bg-surface text-charcoal text-xl leading-none hover:bg-warm transition-colors disabled:opacity-30 disabled:hover:bg-surface disabled:cursor-not-allowed"
      >
        +
      </button>
    </div>
  );
}
