"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { useOnboarding } from "@/lib/useOnboarding";

export default function NameOnboarding() {
  const { answers, setField, hydrated } = useOnboarding();

  if (!hydrated) return null;

  return (
    <NameForm
      initialName={answers.firstName}
      onContinue={(firstName) => setField("firstName", firstName)}
    />
  );
}

function NameForm({
  initialName,
  onContinue,
}: {
  initialName: string;
  onContinue: (firstName: string) => void;
}) {
  const router = useRouter();
  const [firstName, setFirstName] = useState(initialName);
  const normalizedName = firstName.trim();
  const canContinue = normalizedName.length > 0 && normalizedName.length <= 60;

  function handleContinue() {
    if (!canContinue) return;
    onContinue(normalizedName);
    router.push("/onboarding/culture");
  }

  return (
    <main className="flex flex-1 items-center justify-center px-6">
      <div className="w-full max-w-md text-center">
        <h1 className="font-serif text-3xl md:text-4xl leading-tight tracking-tight text-charcoal mb-3">
          What should we call you?
        </h1>
        <label htmlFor="first-name" className="sr-only">
          First name
        </label>
        <input
          id="first-name"
          type="text"
          autoComplete="given-name"
          maxLength={60}
          value={firstName}
          onChange={(event) => setFirstName(event.target.value)}
          className="w-full rounded-xl bg-surface p-4 text-base text-charcoal outline-none focus:bg-warm transition-colors my-8"
        />
        <div className="flex justify-center">
          <Button disabled={!canContinue} onClick={handleContinue}>
            Continue →
          </Button>
        </div>
      </div>
    </main>
  );
}

