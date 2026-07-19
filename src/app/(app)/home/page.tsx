"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { RecommendationActions } from "@/components/recommendation/RecommendationActions";
import { RecommendationHeader } from "@/components/recommendation/RecommendationHeader";
import { RecommendationIngredients } from "@/components/recommendation/RecommendationIngredients";
import { RecommendationMeta } from "@/components/recommendation/RecommendationMeta";
import { RecommendationSteps } from "@/components/recommendation/RecommendationSteps";
import { readGenerationOnboardingAnswers } from "@/lib/app-state/storage";
import { useHomeRecommendation } from "@/lib/app-state/useHomeRecommendation";
import type { MealContext } from "@/lib/dinner/types";
import { writeOnboardingAnswers } from "@/lib/session/dinner-state";

const MEAL_LABELS: Record<MealContext, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Tonight",
};

export default function HomePage() {
  const router = useRouter();
  const {
    hydrated,
    firstName,
    currentRecommendation,
    mealContext,
    madeAt,
    isFresh,
    markMade,
  } = useHomeRecommendation();

  const [expanded, setExpanded] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  function startGeneration() {
    const answers = readGenerationOnboardingAnswers();
    try {
      writeOnboardingAnswers(answers);
    } catch {
      // Loading still reads durable state directly if session storage is unavailable.
    }
    setIsLeaving(true);
    router.push("/onboarding/loading");
  }

  if (!hydrated) return null;

  // Quiet, eyebrow-style greeting reused across every state that isn't the
  // transient leaving screen. No generic fallback: absent name, no greeting.
  const trimmedFirstName = firstName.trim();
  const greeting = trimmedFirstName ? (
    <p className="text-xs tracking-widest text-quiet mb-4">
      Hi, {trimmedFirstName}.
    </p>
  ) : null;

  // Reflects the meal period actually used to generate the current
  // recommendation. Never recalculated from the current clock.
  const mealLabel = mealContext ? MEAL_LABELS[mealContext] : "Tonight";

  // --- Loading (transient, presentation-only while navigating away) ---
  if (isLeaving) {
    return (
      <main className="flex flex-1 items-center justify-center px-6">
        {/* Marker consumed by the CSS rule in globals.css that hides
            AppNavigation during focused Home Loading. */}
        <span data-app-focus="loading" aria-hidden="true" hidden />
        <div className="text-center max-w-md space-y-6">
          <p
            className="font-serif italic text-xl md:text-2xl text-charcoal"
            style={{ animation: "fresely-fadein 1.4s ease-out 0s both" }}
          >
            Reading your kitchen.
          </p>
          <p
            className="font-serif italic text-xl md:text-2xl text-charcoal"
            style={{ animation: "fresely-fadein 1.4s ease-out 1.8s both" }}
          >
            Considering tonight.
          </p>
        </div>
      </main>
    );
  }

  // --- Ready (no fresh recommendation) ---
  if (!currentRecommendation || !isFresh) {
    return (
      <main className="flex flex-1 items-center justify-center px-6">
        <div className="text-center max-w-md">
          {greeting}
          <h1 className="font-serif text-3xl md:text-4xl leading-[1.1] tracking-tight text-charcoal mb-12 text-balance">
            Ready when you are.
          </h1>
          <Button
            onClick={startGeneration}
          >
            Find tonight&apos;s dinner &rarr;
          </Button>
        </div>
      </main>
    );
  }

  // Shared recipe details block (rendered only when See how is expanded).
  const detailsBlock = expanded ? (
    <div className="space-y-10">
      <RecommendationIngredients
        available={currentRecommendation.availableIngredients}
        additional={currentRecommendation.additionalIngredients}
      />
      <RecommendationSteps steps={currentRecommendation.steps} />
    </div>
  ) : null;

  // --- Made (post-cook acknowledgment) ---
  if (madeAt) {
    return (
      <main className="flex-1 px-6 py-12 md:py-16">
        <article className="max-w-2xl mx-auto space-y-10">
          {greeting}
          <RecommendationHeader
            title={currentRecommendation.title}
            rationale={currentRecommendation.rationale}
            eyebrow={mealLabel}
          />
          <RecommendationMeta
            timeMinutes={currentRecommendation.timeMinutes}
            servings={currentRecommendation.servings}
            caution={currentRecommendation.caution}
          />
          <p className="font-serif italic text-base text-muted">
            Enjoy tonight.
          </p>
          <RecommendationActions
            onSeeHow={() => setExpanded((v) => !v)}
            seeHowExpanded={expanded}
          />
          {detailsBlock}
        </article>
      </main>
    );
  }

  // --- Pick (active recommendation, not yet made) ---
  return (
    <main className="flex-1 px-6 py-12 md:py-16">
      <article className="max-w-2xl mx-auto space-y-10">
        {greeting}
        <RecommendationHeader
          title={currentRecommendation.title}
          rationale={currentRecommendation.rationale}
          eyebrow={mealLabel}
        />
        <RecommendationMeta
          timeMinutes={currentRecommendation.timeMinutes}
          servings={currentRecommendation.servings}
          caution={currentRecommendation.caution}
        />
        <RecommendationActions
          onMadeIt={() => markMade()}
          onNotTonight={startGeneration}
          onSeeHow={() => setExpanded((v) => !v)}
          seeHowExpanded={expanded}
        />
        {detailsBlock}
      </article>
    </main>
  );
}
