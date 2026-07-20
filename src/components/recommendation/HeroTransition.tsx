"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type HeroTransitionProps = {
  transitionKey: string;
  children: ReactNode;
};

const TRANSITION_MS = 300;
const SETTLE_MS = 360;

/**
 * Animates between two renders of its children when `transitionKey`
 * changes: the outgoing content slides out to the left while the incoming
 * content slides into the exact same position from the right. Purely
 * presentational — the caller owns all state and data; this component only
 * decides how the swap looks.
 *
 * Re-renders that don't change `transitionKey` (e.g. toggling "Cook Now"
 * expanded state) render the current children immediately with no
 * animation — the live `children` prop is always rendered directly rather
 * than a stored copy, so nothing can go stale.
 *
 * The current children always render in normal document flow, so the
 * wrapper's height (and therefore scroll position) never jumps. Only the
 * outgoing snapshot is absolutely positioned, overlaid on top until it
 * finishes sliding away.
 */
export function HeroTransition({ transitionKey, children }: HeroTransitionProps) {
  const prevKeyRef = useRef(transitionKey);
  const prevChildrenRef = useRef(children);
  const [outgoing, setOutgoing] = useState<ReactNode | null>(null);
  const [animate, setAnimate] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (prevKeyRef.current === transitionKey) {
      prevChildrenRef.current = children;
      return;
    }

    // Key changed: snapshot whatever was showing right before this change
    // so it can animate out; the new children (the current prop) animate
    // in from the opposite side.
    setOutgoing(prevChildrenRef.current);
    setAnimate(false);
    prevKeyRef.current = transitionKey;
    prevChildrenRef.current = children;

    const raf = requestAnimationFrame(() => setAnimate(true));
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setOutgoing(null);
      setAnimate(false);
    }, SETTLE_MS);

    return () => cancelAnimationFrame(raf);
  }, [transitionKey, children]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div className="relative overflow-hidden">
      <div
        className="transition-transform ease-out"
        style={{
          transitionDuration: `${TRANSITION_MS}ms`,
          transform: outgoing && !animate ? "translateX(100%)" : "translateX(0)",
          opacity: outgoing && !animate ? 0 : 1,
        }}
      >
        {children}
      </div>
      {outgoing ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 transition-transform ease-out"
          style={{
            transitionDuration: `${TRANSITION_MS}ms`,
            transform: animate ? "translateX(-100%)" : "translateX(0)",
            opacity: animate ? 0 : 1,
          }}
        >
          {outgoing}
        </div>
      ) : null}
    </div>
  );
}
