import { Pill } from "@/components/Pill";

type RecommendationMetaProps = {
  timeMinutes: number;
  servings: number;
  caution?: string | null;
};

export function RecommendationMeta({
  timeMinutes,
  servings,
  caution,
}: RecommendationMetaProps) {
  return (
    <div>
      <div className="flex gap-2 items-center">
        <Pill>{timeMinutes} min</Pill>
        <Pill variant="sage">Serves {servings}</Pill>
      </div>
      {caution ? (
        <p className="text-sm italic text-honey-deep mt-4 leading-relaxed">
          {caution}
        </p>
      ) : null}
    </div>
  );
}
