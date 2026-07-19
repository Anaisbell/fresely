"use client";

import { useEffect, useState } from "react";
import type { DinnerRecommendation } from "@/lib/dinner/types";
import { readRecommendation } from "@/lib/session/dinner-state";

export function useDinnerRecommendation() {
  const [recommendation, setRecommendation] =
    useState<DinnerRecommendation | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // sessionStorage is an external browser system and can only be read after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRecommendation(readRecommendation());
    setHydrated(true);
  }, []);

  return { recommendation, hydrated };
}
