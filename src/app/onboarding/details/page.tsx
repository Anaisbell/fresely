"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { ProgressDots } from "@/components/ProgressDots";
import { Tile } from "@/components/Tile";
import type { OnboardingAnswers } from "@/lib/dinner/types";
import { writeOnboardingAnswers } from "@/lib/session/dinner-state";
import { useOnboarding } from "@/lib/useOnboarding";

const TIME_OPTIONS = [
  { label: "15 min", value: 15 },
  { label: "30 min", value: 30 },
  { label: "45 min", value: 45 },
  { label: "About an hour", value: 60 },
] as const;

const MIN_SERVINGS = 1;
const MAX_SERVINGS = 6;

function splitItems(value: string): string[] {
  return value
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function readDirective(values: string[], prefix: string, fallback: number) {
  const match = values.find((value) => value.startsWith(prefix));
  const parsed = match ? Number.parseInt(match.slice(prefix.length), 10) : NaN;
  return Number.isFinite(parsed) ? parsed : fallback;
}

export default function DetailsOnboarding() {
  const router = useRouter();
  const { answers, hydrated } = useOnboarding();

  // Defensive redirect: if the user lands here without prior steps
  // completed (bookmarked link, cleared storage, older session),
  // send them back to the earliest missing step instead of letting
  // them fill this form and fail at generation.
  useEffect(() => {
    if (!hydrated) return;
    if (!answers.culture.length) {
      router.replace("/onboarding/culture");
      return;
    }
    if (!answers.goal.length) {
      router.replace("/onboarding/goal");
    }
  }, [hydrated, answers.culture.length, answers.goal.length, router]);

  if (!hydrated) return null;
  if (!answers.culture.length || !answers.goal.length) return null;

  return <DetailsForm answers={answers} />;
}

function DetailsForm({ answers }: { answers: OnboardingAnswers }) {
  const router = useRouter();

  const [ingredients, setIngredients] = useState(() =>
    answers.kitchen.join(", "),
  );
  const [timeMinutes, setTimeMinutes] = useState<number | null>(() => {
    const stored = readDirective(answers.goal, "Time available: ", 0);
    return stored > 0 ? stored : null;
  });
  const [avoid, setAvoid] = useState(() => answers.restrictions.join(", "));
  const [servings, setServings] = useState(() =>
    readDirective(answers.goal, "Servings: ", 2),
  );

  const kitchen = splitItems(ingredients);
  const canContinue = kitchen.length > 0 && timeMinutes !== null;

  function handleContinue() {
    if (!canContinue || timeMinutes === null) return;

    // Time and servings travel as generation directives in the existing goal
    // array, preserving the beta API and session-storage contract.
    const completeAnswers = {
      ...answers,
      goal: [
        answers.goal[0],
        `Time available: ${timeMinutes} minutes`,
        `Servings: ${servings}`,
      ],
      kitchen,
      restrictions: splitItems(avoid),
    };

    writeOnboardingAnswers(completeAnswers);
    router.push("/onboarding/loading");
  }

  function adjustServings(delta: number) {
    setServings((prev) =>
      Math.min(MAX_SERVINGS, Math.max(MIN_SERVINGS, prev + delta)),
    );
  }

  return (
    <main className="flex-1 px-6 py-12 md:py-16">
      <div className="max-w-lg mx-auto">
        <div className="mb-12">
          <ProgressDots currentStep={3} totalSteps={3} />
        </div>

        <h1 className="font-serif text-3xl md:text-4xl leading-tight tracking-tight text-center text-charcoal mb-3">
          About tonight.
        </h1>
        <p className="text-sm text-muted text-center mb-12 max-w-sm mx-auto">
          A few last details so we can pick something you can actually make.
        </p>

        <section className="mb-10">
          <label
            htmlFor="ingredients"
            className="block font-serif italic text-lg text-charcoal mb-3"
          >
            Ingredients you have
          </label>
          <textarea
            id="ingredients"
            value={ingredients}
            onChange={(event) => setIngredients(event.target.value)}
            placeholder="chicken thighs, rice, onions, spinach"
            rows={4}
            className="w-full rounded-xl bg-surface p-4 text-base text-charcoal placeholder:text-quiet outline-none focus:bg-warm transition-colors resize-none"
          />
          <p className="text-xs text-quiet mt-2">Separate with commas.</p>
        </section>

        <section className="mb-10">
          <div className="block font-serif italic text-lg text-charcoal mb-3">
            Time tonight
          </div>
          <div className="grid grid-cols-2 gap-2">
            {TIME_OPTIONS.map((option) => (
              <Tile
                key={option.value}
                selected={timeMinutes === option.value}
                onClick={() => setTimeMinutes(option.value)}
              >
                {option.label}
              </Tile>
            ))}
          </div>
        </section>

        <section className="mb-10">
          <label
            htmlFor="avoid"
            className="block font-serif italic text-lg text-charcoal mb-3"
          >
            Anything to avoid
          </label>
          <textarea
            id="avoid"
            value={avoid}
            onChange={(event) => setAvoid(event.target.value)}
            placeholder="Nothing"
            rows={2}
            className="w-full rounded-xl bg-surface p-4 text-base text-charcoal placeholder:text-quiet outline-none focus:bg-warm transition-colors resize-none"
          />
          <p className="text-xs text-quiet mt-2">
            Allergies, dietary restrictions, or dislikes.
          </p>
        </section>

        <section className="mb-12">
          <div className="block font-serif italic text-lg text-charcoal mb-3 text-center">
            Servings
          </div>
          <div className="flex items-center justify-center gap-6">
            <button
              type="button"
              onClick={() => adjustServings(-1)}
              disabled={servings <= MIN_SERVINGS}
              aria-label="Decrease servings"
              className="w-10 h-10 rounded-full bg-surface text-charcoal text-xl leading-none hover:bg-warm transition-colors disabled:opacity-30 disabled:hover:bg-surface disabled:cursor-not-allowed"
            >
              −
            </button>
            <span className="font-serif text-3xl w-10 text-center">
              {servings}
            </span>
            <button
              type="button"
              onClick={() => adjustServings(1)}
              disabled={servings >= MAX_SERVINGS}
              aria-label="Increase servings"
              className="w-10 h-10 rounded-full bg-surface text-charcoal text-xl leading-none hover:bg-warm transition-colors disabled:opacity-30 disabled:hover:bg-surface disabled:cursor-not-allowed"
            >
              +
            </button>
          </div>
        </section>

        <div className="flex justify-center">
          <Button disabled={!canContinue} onClick={handleContinue}>
            Continue →
          </Button>
        </div>
      </div>
    </main>
  );
}
