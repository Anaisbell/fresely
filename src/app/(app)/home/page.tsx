"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { KitchenWisdom } from "@/components/KitchenWisdom";
import { FeaturedRecommendationCard } from "@/components/recommendation/FeaturedRecommendationCard";
import { HeroTransition } from "@/components/recommendation/HeroTransition";
import { NotTodaySheet } from "@/components/recommendation/NotTodaySheet";
import { RecommendationIngredients } from "@/components/recommendation/RecommendationIngredients";
import { RecommendationSteps } from "@/components/recommendation/RecommendationSteps";
import { RegeneratingHeroCard } from "@/components/recommendation/RegeneratingHeroCard";
import { RootsSpotlight } from "@/components/recommendation/RootsSpotlight";
import { RootsSpotlightSheet } from "@/components/recommendation/RootsSpotlightSheet";
import { persistGeneratedRecommendation } from "@/lib/app-state/setup";
import { readGenerationOnboardingAnswers } from "@/lib/app-state/storage";
import { useHomeRecommendation } from "@/lib/app-state/useHomeRecommendation";
import { selectSpotlightAnchorRecipe } from "@/lib/dinner/anchor-recipes/select";
import { requestDinnerRecommendation } from "@/lib/dinner/client";
import { getMealContext } from "@/lib/dinner/meal-context";
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
    savedAt,
    madeAt,
    isFresh,
    markMade,
    syncState,
  } = useHomeRecommendation();

  const [expanded, setExpanded] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [notTodayOpen, setNotTodayOpen] = useState(false);
  const [rootsPreviewOpen, setRootsPreviewOpen] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const regeneratingRef = useRef(false);

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

  // "Not today" regenerates in place on Home instead of navigating to
  // /onboarding/loading: no route change, no loading screen. Reuses the
  // same requestDinnerRecommendation + persistGeneratedRecommendation path
  // the loading screen already uses — nothing about generation itself
  // changes, only where it's called from.
  //
  // isRegenerating drives which card HeroTransition shows (see the Pick
  // branch below): flipping it true swaps in RegeneratingHeroCard, flipping
  // it false swaps back to the real card — either the new recommendation on
  // success, or the unchanged current one if generation fails, since
  // nothing was persisted in that case. regeneratingRef stays as a defense-
  // in-depth guard against a double-fire; the structural fix is that the
  // interactive card (and its "Not tonight" button) isn't on screen at all
  // while isRegenerating is true, so there's nothing to tap twice.
  async function regenerateForNotToday() {
    if (regeneratingRef.current) {
      return;
    }
    regeneratingRef.current = true;
    setIsRegenerating(true);

    try {
      const answers = readGenerationOnboardingAnswers();
      const nextMealContext = getMealContext();
      // Captured before regeneration replaces it — this is what the model
      // should avoid repeating. Ephemeral: never persisted, only ever sent
      // for this one request.
      const previousRecommendationTitle = currentRecommendation?.title;
      const recommendation = await requestDinnerRecommendation(
        answers,
        nextMealContext,
        previousRecommendationTitle,
      );
      const nextState = persistGeneratedRecommendation(
        answers,
        recommendation,
        nextMealContext,
      );
      syncState(nextState);
    } catch (error) {
      // No separate error UI for this path by design — the loading card
      // simply gives way back to the current pick, unchanged, since
      // regeneration never persisted anything.
      console.error("Not today regeneration failed", error);
    } finally {
      regeneratingRef.current = false;
      setIsRegenerating(false);
    }
  }

  function handleNotTodayContinue() {
    setNotTodayOpen(false);
    // Collapse immediately, not just on success — the loading card is about
    // to replace the real one, so any expanded ingredients/steps for the
    // recipe being replaced shouldn't linger underneath it.
    setExpanded(false);
    void regenerateForNotToday();
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

  // Static for now — not derived from mealContext. Only shown alongside the
  // greeting, matching its no-generic-fallback behavior.
  const supportingLine = trimmedFirstName ? (
    <p className="text-sm text-muted mb-10">Let&apos;s make today delicious.</p>
  ) : null;

  // Reflects the meal period actually used to generate the current
  // recommendation. Never recalculated from the current clock.
  const mealLabel = mealContext ? MEAL_LABELS[mealContext] : "Tonight";

  // "Made for Your Roots" spotlight: independent of the hero/recommendation
  // lifecycle entirely — driven by the user's profile and the live meal
  // period, not by whatever currentRecommendation happens to be. That's why
  // it works even in the Ready state, where there may be no recommendation
  // at all. Hidden only when the hero is already showing this exact curated
  // recipe (matched by title, not just by source — a different curated
  // recipe surfacing here alongside an anchor-sourced hero is fine once the
  // library has more than one candidate per culture + meal period).
  const spotlightAnswers = readGenerationOnboardingAnswers();
  const spotlightRecipe = selectSpotlightAnchorRecipe({
    culture: spotlightAnswers.culture,
    goal: spotlightAnswers.goal,
    kitchen: spotlightAnswers.kitchen,
    restrictions: spotlightAnswers.restrictions,
    mealContext: getMealContext(),
  });
  const heroIsSpotlightRecipe = Boolean(
    currentRecommendation &&
      isFresh &&
      currentRecommendation.source === "anchor" &&
      spotlightRecipe &&
      currentRecommendation.title === spotlightRecipe.title,
  );
  const spotlightSection =
    spotlightRecipe && !heroIsSpotlightRecipe ? (
      <RootsSpotlight
        recipe={spotlightRecipe}
        onSelect={() => setRootsPreviewOpen(true)}
      />
    ) : null;
  // Computed once and referenced wherever spotlightSection appears, same
  // pattern. Read-only preview — see RootsSpotlightSheet for why it doesn't
  // reuse the hero's own expandable recipe details.
  const rootsPreviewSheet = (
    <RootsSpotlightSheet
      recipe={spotlightRecipe}
      open={rootsPreviewOpen}
      onClose={() => setRootsPreviewOpen(false)}
    />
  );

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
      <main className="relative flex flex-col flex-1 items-center justify-center gap-12 px-6">
        <KitchenWisdom />
        <div className="text-center max-w-md">
          {greeting}
          {supportingLine}
          <h1 className="font-serif text-3xl md:text-4xl leading-[1.1] tracking-tight text-charcoal mb-8 text-balance">
            Ready when you are.
          </h1>
          <Button
            onClick={startGeneration}
          >
            Show me what to make &rarr;
          </Button>
        </div>
        {spotlightSection ? (
          <div className="w-full max-w-2xl">{spotlightSection}</div>
        ) : null}
        {rootsPreviewSheet}
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
      <main className="relative flex-1 px-6 py-12 md:py-16">
        <KitchenWisdom />
        <article className="max-w-2xl mx-auto space-y-10">
          {greeting}
          {supportingLine}
          <HeroTransition transitionKey={savedAt ?? "initial"}>
            <FeaturedRecommendationCard
              title={currentRecommendation.title}
              mealLabel={mealLabel}
              timeMinutes={currentRecommendation.timeMinutes}
              servings={currentRecommendation.servings}
              cookNowExpanded={expanded}
              onCookNow={() => setExpanded((v) => !v)}
            />
          </HeroTransition>
          <p className="font-serif italic text-base text-muted">
            Enjoy tonight.
          </p>
          {detailsBlock}
          {spotlightSection}
        </article>
        {rootsPreviewSheet}
      </main>
    );
  }

  // --- Pick (active recommendation, not yet made) ---
  // While regenerating, the transition key changes to something distinct
  // from both the current and (eventual) next savedAt, so HeroTransition
  // always registers a real transition at each phase: real card ->
  // RegeneratingHeroCard -> real card again (new on success, same one
  // unchanged on failure, since savedAt only moves on success).
  const pickTransitionKey = isRegenerating
    ? `regenerating:${savedAt ?? "initial"}`
    : (savedAt ?? "initial");

  return (
    <main className="relative flex-1 px-6 py-12 md:py-16">
      <KitchenWisdom />
      <article className="max-w-2xl mx-auto space-y-10">
        {greeting}
        {supportingLine}
        <HeroTransition transitionKey={pickTransitionKey}>
          {isRegenerating ? (
            <RegeneratingHeroCard />
          ) : (
            <FeaturedRecommendationCard
              title={currentRecommendation.title}
              mealLabel={mealLabel}
              timeMinutes={currentRecommendation.timeMinutes}
              servings={currentRecommendation.servings}
              cookNowExpanded={expanded}
              onCookNow={() => setExpanded((v) => !v)}
              onMadeIt={() => markMade()}
              onNotTonight={() => setNotTodayOpen(true)}
            />
          )}
        </HeroTransition>
        {detailsBlock}
        {spotlightSection}
      </article>
      <NotTodaySheet
        open={notTodayOpen}
        onClose={() => setNotTodayOpen(false)}
        onContinue={handleNotTodayContinue}
      />
      {rootsPreviewSheet}
    </main>
  );
}
