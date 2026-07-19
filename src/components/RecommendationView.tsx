import type { DinnerRecommendation } from "@/lib/dinner/types";
import { RecommendationActions } from "@/components/recommendation/RecommendationActions";
import { RecommendationHeader } from "@/components/recommendation/RecommendationHeader";
import { RecommendationIngredients } from "@/components/recommendation/RecommendationIngredients";
import { RecommendationMeta } from "@/components/recommendation/RecommendationMeta";
import { RecommendationSteps } from "@/components/recommendation/RecommendationSteps";

type RecommendationViewProps = {
  recommendation: DinnerRecommendation;
  onStartOver: () => void;
};

export function RecommendationView({
  recommendation,
  onStartOver,
}: RecommendationViewProps) {
  return (
    <main className="flex-1 px-6 py-12 md:py-16">
      <article className="max-w-2xl mx-auto space-y-10">
        <RecommendationHeader
          title={recommendation.title}
          rationale={recommendation.rationale}
          eyebrow="Tonight"
        />
        <RecommendationMeta
          timeMinutes={recommendation.timeMinutes}
          servings={recommendation.servings}
          caution={recommendation.caution}
        />
        <RecommendationIngredients
          available={recommendation.availableIngredients}
          additional={recommendation.additionalIngredients}
        />
        <RecommendationSteps steps={recommendation.steps} />
        <RecommendationActions onStartOver={onStartOver} />
      </article>
    </main>
  );
}
