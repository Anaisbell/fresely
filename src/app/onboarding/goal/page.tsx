"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { ProgressDots } from "@/components/ProgressDots";
import { Tile } from "@/components/Tile";
import { useOnboarding } from "@/lib/useOnboarding";

const GOALS = [
  "Quick and easy",
  "Comforting",
  "Fresh and balanced",
  "Use what I have",
  "Something exciting",
] as const;

export default function GoalOnboarding() {
  const router = useRouter();
  const { answers, setField, hydrated } = useOnboarding();

  // Defensive redirect: if the user lands here without a Culture pick
  // (bookmarked link, cleared storage, etc.), send them back to Q1.
  useEffect(() => {
    if (!hydrated) return;
    if (!answers.culture.length) {
      router.replace("/onboarding/culture");
    }
  }, [hydrated, answers.culture.length, router]);

  if (!hydrated) return null;
  if (!answers.culture.length) return null;

  const selected = answers.goal[0];

  return (
    <main className="flex-1 px-6 py-12 md:py-16">
      <div className="max-w-lg mx-auto">
        <div className="mb-12">
          <ProgressDots currentStep={2} totalSteps={3} />
        </div>
        <h1 className="font-serif text-3xl leading-tight text-center mb-10">
          What do you need from dinner tonight?
        </h1>
        <div className="grid gap-2 mb-12">
          {GOALS.map((goal) => (
            <Tile
              key={goal}
              selected={selected === goal}
              onClick={() => setField("goal", [goal])}
            >
              {goal}
            </Tile>
          ))}
        </div>
        <div className="flex justify-center">
          <Button
            disabled={!selected}
            onClick={() => router.push("/onboarding/details")}
          >
            Continue →
          </Button>
        </div>
      </div>
    </main>
  );
}
