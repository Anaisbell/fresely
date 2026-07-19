"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { RecommendationView } from "@/components/RecommendationView";
import { clearDinnerSession } from "@/lib/session/dinner-state";
import { useDinnerRecommendation } from "@/lib/useDinnerRecommendation";

export default function TonightPage() {
  const router = useRouter();
  const { recommendation, hydrated } = useDinnerRecommendation();

  if (!hydrated) return null;

  if (!recommendation) {
    return (
      <main className="flex flex-1 items-center justify-center px-6 text-center">
        <div>
          <h1 className="font-serif text-3xl mb-6">Dinner is waiting to be figured out.</h1>
          <Button onClick={() => router.push("/onboarding/culture")}>
            Start →
          </Button>
        </div>
      </main>
    );
  }

  return (
    <RecommendationView
      recommendation={recommendation}
      onStartOver={() => {
        clearDinnerSession();
        router.push("/onboarding/culture");
      }}
    />
  );
}
