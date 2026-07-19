"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Tile } from "@/components/Tile";
import { Button } from "@/components/Button";
import { ProgressDots } from "@/components/ProgressDots";
import { useOnboarding } from "@/lib/useOnboarding";

const CUISINES = [
  "Mexican",
  "Dominican",
  "Soul Food",
  "West African",
  "Caribbean",
  "Italian",
  "Mediterranean",
  "East Asian",
  "South Asian",
  "Southeast Asian",
  "Middle Eastern",
  "American comfort",
] as const;

const NOT_SURE = "Still figuring it out";

export default function CultureOnboarding() {
  const router = useRouter();
  const { answers, setField, hydrated } = useOnboarding();

  useEffect(() => {
    if (hydrated && !answers.firstName.trim()) {
      router.replace("/onboarding/name");
    }
  }, [answers.firstName, hydrated, router]);

  if (!hydrated) return null;
  if (!answers.firstName.trim()) return null;

  return (
    <CultureForm
      initialSelected={answers.culture}
      onSelectionChange={(culture) => setField("culture", culture)}
    />
  );
}

function CultureForm({
  initialSelected,
  onSelectionChange,
}: {
  initialSelected: string[];
  onSelectionChange: (culture: string[]) => void;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState(initialSelected);

  const toggle = (option: string) => {
    const isSelected = selected.includes(option);
    let next: string[];
    if (option === NOT_SURE) {
      next = isSelected ? [] : [NOT_SURE];
    } else {
      const withoutNotSure = selected.filter((c) => c !== NOT_SURE);
      next = isSelected
        ? withoutNotSure.filter((c) => c !== option)
        : [...withoutNotSure, option];
    }
    setSelected(next);
    onSelectionChange(next);
  };

  const canContinue = selected.length > 0;

  const handleContinue = () => {
    if (!canContinue) return;
    router.push("/onboarding/goal");
  };

  return (
    <main className="flex-1 px-6 py-12 md:py-16">
      <div className="max-w-lg mx-auto">
        <div className="mb-12">
          <ProgressDots currentStep={1} totalSteps={3} />
        </div>

        <h1 className="font-serif text-3xl md:text-4xl leading-tight tracking-tight text-center text-charcoal mb-3">
          What kind of food feels like home?
        </h1>
        <p className="text-sm text-muted text-center mb-10 max-w-sm mx-auto">
          Pick a few. We&apos;ll cook around what you love.
        </p>

        <div className="grid grid-cols-2 gap-2 mb-12">
          {CUISINES.map((cuisine) => (
            <Tile
              key={cuisine}
              selected={selected.includes(cuisine)}
              onClick={() => toggle(cuisine)}
            >
              {cuisine}
            </Tile>
          ))}
          <Tile
            selected={selected.includes(NOT_SURE)}
            onClick={() => toggle(NOT_SURE)}
            className="col-span-2"
          >
            {NOT_SURE}
          </Tile>
        </div>

        <div className="flex justify-center">
          <Button disabled={!canContinue} onClick={handleContinue}>
            Continue →
          </Button>
        </div>
      </div>
    </main>
  );
}
