"use client";

import { useState } from "react";

// Mirrors AppPreferencesSchema.firstName's bound (src/lib/app-state/schema.ts).
const MAX_FIRST_NAME_LENGTH = 60;

type FirstNameFieldProps = {
  id: string;
  value: string;
  onCommit: (value: string) => void;
};

/**
 * Commits on blur (or Enter) rather than per keystroke. A name is
 * continuous free text, not a discrete action like a chip add/remove, so
 * persisting on every keystroke would mean saving incomplete input mid-word.
 * Local draft state mirrors what onboarding's own Name step already does,
 * just without that step's navigation/continue button.
 *
 * An empty commit is refused rather than persisted, even though
 * AppPreferencesSchema itself allows an empty firstName: AppStateGuard
 * treats an empty firstName as incomplete setup and redirects back into
 * onboarding, so silently clearing this field would unexpectedly send the
 * user through onboarding again. Blurring an emptied field reverts the
 * draft back to the last saved value instead.
 */
export function FirstNameField({ id, value, onCommit }: FirstNameFieldProps) {
  const [draft, setDraft] = useState(value);

  function commit() {
    const trimmed = draft.trim();
    if (!trimmed) {
      setDraft(value);
      return;
    }
    setDraft(trimmed);
    if (trimmed !== value) onCommit(trimmed);
  }

  return (
    <input
      id={id}
      type="text"
      autoComplete="given-name"
      maxLength={MAX_FIRST_NAME_LENGTH}
      value={draft}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          // Reuse the blur-commit path rather than duplicating it.
          event.currentTarget.blur();
        }
      }}
      className="w-full rounded-xl bg-surface border border-line px-4 py-3 text-base text-charcoal outline-none focus:border-quiet focus:bg-warm transition-colors"
    />
  );
}
