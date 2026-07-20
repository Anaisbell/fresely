"use client";

import { useEffect, useRef, type ReactNode } from "react";

type BottomSheetProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
};

/**
 * Generic, reusable bottom sheet: backdrop + panel sliding up from the
 * bottom edge. Not specific to any one interaction — callers own all
 * content and behavior via `children`.
 *
 * Dismissal: the explicit close button, Escape, and tapping the backdrop
 * all call `onClose`. Focus moves to the close button on open and returns
 * to whatever triggered the sheet once it closes (never on initial mount).
 */
export function BottomSheet({
  open,
  onClose,
  title,
  subtitle,
  children,
}: BottomSheetProps) {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const wasOpenRef = useRef(false);
  const triggerRef = useRef<HTMLElement | null>(null);

  // Focus the close button on open; return focus to whatever had focus
  // before the sheet opened, but only after a real close (tracked via
  // wasOpenRef), never on initial mount when open is already false.
  useEffect(() => {
    if (open) {
      wasOpenRef.current = true;
      triggerRef.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
      closeButtonRef.current?.focus();
      return;
    }

    if (wasOpenRef.current) {
      wasOpenRef.current = false;
      triggerRef.current?.focus();
    }
  }, [open]);

  // Escape listener attached only while open, removed on cleanup, routed
  // through the same onClose the close button and backdrop use.
  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 bg-charcoal/40"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-t-2xl bg-cream px-6 pt-6 pb-8"
        style={{ animation: "fresely-sheet-in 0.25s ease-out both" }}
      >
        <div className="flex items-start justify-between gap-4">
          <h2 className="font-serif text-2xl leading-tight text-charcoal">
            {title}
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="pt-1 text-xl leading-none text-quiet hover:text-muted"
          >
            &times;
          </button>
        </div>
        {subtitle ? (
          <p className="mt-1 text-sm text-muted">{subtitle}</p>
        ) : null}
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
