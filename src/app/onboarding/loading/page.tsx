"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { completeSetupOnce } from "@/lib/app-state/setup";
import { requestDinnerRecommendation } from "@/lib/dinner/client";
import {
  readOnboardingAnswers,
  writeRecommendation,
} from "@/lib/session/dinner-state";

type Status = "working" | "error";

export default function LoadingPage() {
  const router = useRouter();
  const inFlight = useRef(false);
  const [status, setStatus] = useState<Status>("working");

  const generate = useCallback(async () => {
    // Guard against React 19 strict-mode double effect invocation
    // and against rapid Retry clicks while a request is still running.
    if (inFlight.current) return;
    inFlight.current = true;
    setStatus("working");

    try {
      const answers = readOnboardingAnswers();

      // If the flow is incomplete, route back to the earliest missing
      // step instead of sending a request the API would reject anyway.
      if (!answers.culture.length) {
        router.replace("/onboarding/culture");
        return;
      }
      if (!answers.goal.length) {
        router.replace("/onboarding/goal");
        return;
      }
      if (!answers.kitchen.length) {
        router.replace("/onboarding/details");
        return;
      }

      const recommendation = await requestDinnerRecommendation(answers);
      completeSetupOnce(answers, recommendation);
      writeRecommendation(recommendation);
      router.replace("/home");
    } catch (error) {
      console.error("Dinner generation failed on loading page", error);
      setStatus("error");
      inFlight.current = false;
    }
  }, [router]);

  useEffect(() => {
    generate();
  }, [generate]);

  if (status === "error") {
    return (
      <main className="flex flex-1 items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <h1 className="font-serif text-2xl md:text-3xl leading-tight tracking-tight text-charcoal mb-4">
            Dinner didn&apos;t come through.
          </h1>
          <p className="text-sm text-muted mb-10">
            Something got in the way. Let&apos;s try again.
          </p>
          <Button onClick={generate}>Try again →</Button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 items-center justify-center px-6">
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
        <p
          className="font-serif italic text-xl md:text-2xl text-charcoal"
          style={{ animation: "fresely-fadein 1.4s ease-out 3.6s both" }}
        >
          Your pick is ready.
        </p>
      </div>
    </main>
  );
}
