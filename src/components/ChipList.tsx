"use client";

import { useEffect, useRef, useState } from "react";

type ChipListProps = {
  items: string[];
  onAdd: (item: string) => void;
  onRemove: (item: string) => void;
  /** Caps items.length. Pass the owning schema's array bound. */
  maxItems: number;
  /** Caps each item's length via the add input's native maxLength. */
  maxItemLength: number;
  /** Visible text on the resting "+ Add …" chip, e.g. "+ Add ingredient". */
  addLabel: string;
  /** Accessible name for the add trigger (visible text can include
   * decorative characters like "+" that read awkwardly aloud). */
  addAriaLabel: string;
  /** Accessible name for the add input itself (there's no room for a
   * visible label at chip scale, so this stands in for one). */
  inputAriaLabel: string;
  inputPlaceholder: string;
  /** Shown instead of the chip row when items is empty. */
  emptyMessage: string;
  /** Shown in place of the add control once items.length === maxItems. */
  fullMessage: string;
};

/**
 * Generic, domain-agnostic chip list: items are the primary content (not a
 * form to fill out), each rendered as a substantial, tactile chip rather
 * than a small tag, with a low-weight "+ Add …" affordance living in the
 * same row rather than a bordered input competing for attention.
 *
 * Extracted from Kitchen's pantry ingredient editor once Settings needed
 * the identical interaction for dietary restrictions — same underlying
 * shape (a capped string list) and the same "delete one thing without
 * retyping everything" motivation. Domain call sites (PantryIngredients,
 * RestrictionChips, …) are thin wrappers that just pin down copy and the
 * owning schema's bounds; all the actual behavior lives here so it's
 * defined, tested, and fixed exactly once:
 *
 * - A case-insensitive duplicate add is treated as already satisfied, not
 *   an error — the caller's goal (that item being in the list) is already
 *   true, so the input just clears as if it succeeded.
 * - At maxItems, the add control is replaced by fullMessage rather than
 *   accepting input that would silently fail.
 * - Removing a chip removes its own remove-button from the DOM, which
 *   would otherwise drop keyboard focus to <body>. Focus is restored to
 *   whichever control now occupies that spot: the chip that shifted into
 *   the removed one's position, the previous chip if the last one was
 *   removed, or the add control if the list is now empty.
 * - The add control's own Escape or empty-Enter is a deliberate cancel and
 *   restores focus to the resting trigger chip; a blur with nothing typed
 *   does not force focus back, since the user is already deliberately
 *   navigating elsewhere.
 */
export function ChipList({
  items,
  onAdd,
  onRemove,
  maxItems,
  maxItemLength,
  addLabel,
  addAriaLabel,
  inputAriaLabel,
  inputPlaceholder,
  emptyMessage,
  fullMessage,
}: ChipListProps) {
  const atCapacity = items.length >= maxItems;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pendingFocusIndexRef = useRef<number | null>(null);

  useEffect(() => {
    const pendingIndex = pendingFocusIndexRef.current;
    if (pendingIndex === null) return;
    pendingFocusIndexRef.current = null;

    const container = containerRef.current;
    if (!container) return;

    if (pendingIndex === -1) {
      container
        .querySelector<HTMLElement>(
          '[data-role="chip-add-trigger"], [data-role="chip-add-input"]',
        )
        ?.focus();
      return;
    }

    container
      .querySelectorAll<HTMLElement>('[data-role="chip-remove"]')
      [pendingIndex]?.focus();
  }, [items]);

  function handleRemove(item: string, index: number) {
    const remainingCount = items.length - 1;
    pendingFocusIndexRef.current =
      remainingCount <= 0 ? -1 : Math.min(index, remainingCount - 1);
    onRemove(item);
  }

  function handleAdd(item: string) {
    const isDuplicate = items.some(
      (existing) => existing.toLowerCase() === item.toLowerCase(),
    );
    if (isDuplicate || atCapacity) return;
    onAdd(item);
  }

  const addControl = atCapacity ? (
    <p className="text-sm text-quiet">{fullMessage}</p>
  ) : (
    <AddChipControl
      onAdd={handleAdd}
      maxLength={maxItemLength}
      label={addLabel}
      ariaLabel={addAriaLabel}
      inputAriaLabel={inputAriaLabel}
      placeholder={inputPlaceholder}
      autoFocus={items.length === 0}
    />
  );

  if (items.length === 0) {
    return (
      <div ref={containerRef} className="space-y-6">
        <p className="text-base text-muted leading-relaxed">{emptyMessage}</p>
        <div className="flex flex-wrap gap-3">{addControl}</div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex flex-wrap gap-3">
      {items.map((item, index) => (
        <Chip
          key={item}
          item={item}
          onRemove={() => handleRemove(item, index)}
        />
      ))}
      {addControl}
    </div>
  );
}

/**
 * One item the user owns, not a metadata tag — sized and spaced to feel
 * like a small object rather than a label. Larger, medium-weight type and
 * generous padding give it presence; the 32px remove control (well past a
 * cramped icon-sized hit area) keeps it comfortable to tap on mobile
 * without letting the remove action visually outweigh the item's own name.
 */
function Chip({ item, onRemove }: { item: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-honey-tint pl-5 pr-2 py-3 text-lg font-medium text-honey-deep">
      {item}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${item}`}
        data-role="chip-remove"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xl leading-none text-honey-deep/60 hover:text-honey-deep hover:bg-honey/40 active:bg-honey/50 transition-colors"
      >
        &times;
      </button>
    </span>
  );
}

/**
 * Resting state is a single low-weight chip so it sits quietly alongside
 * the items instead of announcing itself as a form. Tapping it opens an
 * inline text input sized and shaped like the other chips. The input stays
 * open and refocused after each add (rather than collapsing back every
 * time) so adding several items in a row — the common first-use case —
 * doesn't require re-opening it each time. It only collapses back to the
 * resting chip on Escape, on submitting empty, or on blur with nothing
 * typed.
 */
function AddChipControl({
  onAdd,
  maxLength,
  label,
  ariaLabel,
  inputAriaLabel,
  placeholder,
  autoFocus = false,
}: {
  onAdd: (item: string) => void;
  maxLength: number;
  label: string;
  ariaLabel: string;
  inputAriaLabel: string;
  placeholder: string;
  autoFocus?: boolean;
}) {
  const [open, setOpen] = useState(autoFocus);
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const restoreFocusRef = useRef(false);

  useEffect(() => {
    if (open) return;
    if (restoreFocusRef.current) {
      restoreFocusRef.current = false;
      triggerRef.current?.focus();
    }
  }, [open]);

  function openInput() {
    setOpen(true);
  }

  function closeInput(restoreFocus: boolean) {
    restoreFocusRef.current = restoreFocus;
    setOpen(false);
    setValue("");
  }

  function submit() {
    const trimmed = value.trim();
    if (!trimmed) {
      // Enter on an empty field reads as "never mind" — a deliberate
      // cancel, same as Escape.
      closeInput(true);
      return;
    }
    onAdd(trimmed);
    setValue("");
    // Stay open for rapid successive entries.
    inputRef.current?.focus();
  }

  if (!open) {
    return (
      <button
        ref={triggerRef}
        type="button"
        onClick={openInput}
        aria-label={ariaLabel}
        data-role="chip-add-trigger"
        className="inline-flex items-center gap-1 rounded-full border border-dashed border-line px-5 py-3 text-lg text-muted hover:border-quiet hover:text-charcoal transition-colors"
      >
        {label}
      </button>
    );
  }

  return (
    <input
      ref={inputRef}
      type="text"
      value={value}
      autoFocus
      maxLength={maxLength}
      placeholder={placeholder}
      aria-label={inputAriaLabel}
      data-role="chip-add-input"
      onChange={(event) => setValue(event.target.value)}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          submit();
        } else if (event.key === "Escape") {
          closeInput(true);
        }
      }}
      onBlur={() => {
        if (!value.trim()) closeInput(false);
      }}
      className="rounded-full bg-surface border border-line px-5 py-3 text-lg text-charcoal placeholder:text-quiet outline-none focus:border-quiet transition-colors w-48"
    />
  );
}
