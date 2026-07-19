"use client";

import { useEffect, useState } from "react";
import {
  readOnboardingAnswers,
  writeOnboardingAnswers,
} from "@/lib/session/dinner-state";
import { readAppState, updateAppState } from "./storage";
import type { FreselyAppState } from "./types";

export type AppSettingsState = {
  hydrated: boolean;
  firstName: string;
  pantryIngredients: string[];
  cultures: string[];
  restrictions: string[];
  defaultServings: number;
  setPantryIngredients: (ingredients: string[]) => void;
  setCultures: (cultures: string[]) => void;
  setRestrictions: (restrictions: string[]) => void;
  setDefaultServings: (servings: number) => void;
};

function updateLegacyServings(goal: string[], servings: number): string[] {
  if (!goal.length) return goal;

  const withoutServings = goal.filter(
    (value) => !value.startsWith("Servings: "),
  );
  return [...withoutServings, `Servings: ${servings}`].slice(0, 3);
}

export function useAppSettings(): AppSettingsState {
  const [state, setState] = useState<FreselyAppState | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Durable state is an external browser system and is read after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState(readAppState());
    setHydrated(true);
  }, []);

  function persist(
    update: (current: FreselyAppState) => FreselyAppState,
    updateSession: () => void,
  ) {
    const next = updateAppState(update);
    setState(next);

    try {
      updateSession();
    } catch {
      // Durable state remains authoritative if session storage is unavailable.
    }
  }

  function setPantryIngredients(ingredients: string[]) {
    const updatedAt = new Date().toISOString();
    persist(
      (current) => ({
        ...current,
        pantry: { ingredients, updatedAt },
      }),
      () => {
        const onboarding = readOnboardingAnswers();
        writeOnboardingAnswers({ ...onboarding, kitchen: ingredients });
      },
    );
  }

  function setCultures(cultures: string[]) {
    persist(
      (current) => ({
        ...current,
        preferences: { ...current.preferences, cultures },
      }),
      () => {
        const onboarding = readOnboardingAnswers();
        writeOnboardingAnswers({ ...onboarding, culture: cultures });
      },
    );
  }

  function setRestrictions(restrictions: string[]) {
    persist(
      (current) => ({
        ...current,
        preferences: { ...current.preferences, restrictions },
      }),
      () => {
        const onboarding = readOnboardingAnswers();
        writeOnboardingAnswers({ ...onboarding, restrictions });
      },
    );
  }

  function setDefaultServings(defaultServings: number) {
    persist(
      (current) => ({
        ...current,
        preferences: { ...current.preferences, defaultServings },
      }),
      () => {
        const onboarding = readOnboardingAnswers();
        writeOnboardingAnswers({
          ...onboarding,
          goal: updateLegacyServings(onboarding.goal, defaultServings),
        });
      },
    );
  }

  return {
    hydrated,
    firstName: state?.preferences.firstName ?? "",
    pantryIngredients: state?.pantry.ingredients ?? [],
    cultures: state?.preferences.cultures ?? [],
    restrictions: state?.preferences.restrictions ?? [],
    defaultServings: state?.preferences.defaultServings ?? 2,
    setPantryIngredients,
    setCultures,
    setRestrictions,
    setDefaultServings,
  };
}
