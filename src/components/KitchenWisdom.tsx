"use client";

import { useEffect, useRef, useState } from "react";
import { getDailyTip } from "@/lib/kitchen-wisdom/tips";

/**
 * Small top-right Kitchen Wisdom control: a 💡 button that toggles a
 * lightweight anchored panel showing one stable tip for the local calendar
 * day. No click-outside dismissal in V1 — only the close button and Escape
 * close the panel, both routed through the same closePanel behavior so focus
 * handling stays consistent.
 */
export function KitchenWisdom() {
  const [open, setOpen] = useState(false);
  const wasOpenRef = useRef(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  function closePanel() {
    setOpen(false);
  }

  function toggleOpen() {
    setOpen((v) => !v);
  }

  // Focus the close button on open; return focus to the trigger only after a
  // real close (tracked via wasOpenRef), never on initial mount when open is
  // already false.
  useEffect(() => {
    if (open) {
      wasOpenRef.current = true;
      closeButtonRef.current?.focus();
      return;
    }

    if (wasOpenRef.current) {
      wasOpenRef.current = false;
      triggerRef.current?.focus();
    }
  }, [open]);

  // Escape listener attached only while open, removed on cleanup, routed
  // through the same closePanel behavior as the explicit close button.
  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closePanel();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  return (
    <div className="absolute top-6 right-6">
      <button
        ref={triggerRef}
        type="button"
        aria-label="Open Kitchen Wisdom"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="kitchen-wisdom-panel"
        onClick={toggleOpen}
        className="text-lg leading-none"
      >
        💡
      </button>
      {open ? (
        <div
          id="kitchen-wisdom-panel"
          role="dialog"
          aria-label="Kitchen wisdom tip"
          className="absolute right-0 mt-2 w-64 rounded-lg border border-line bg-cream p-4 shadow-md z-10"
        >
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm text-charcoal leading-relaxed">
              {getDailyTip()}
            </p>
            <button
              ref={closeButtonRef}
              type="button"
              aria-label="Close tip"
              onClick={closePanel}
              className="text-quiet hover:text-muted"
            >
              &times;
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
