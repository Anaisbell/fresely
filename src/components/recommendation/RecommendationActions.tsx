import { Button } from "@/components/Button";

type RecommendationActionsProps = {
  onMadeIt?: () => void;
  onNotTonight?: () => void;
  onSeeHow?: () => void;
  onStartOver?: () => void;
  seeHowExpanded?: boolean;
};

export function RecommendationActions({
  onMadeIt,
  onNotTonight,
  onSeeHow,
  onStartOver,
  seeHowExpanded = false,
}: RecommendationActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
      {onMadeIt ? <Button onClick={onMadeIt}>Made it</Button> : null}
      {onNotTonight ? (
        <button
          type="button"
          onClick={onNotTonight}
          className="text-base font-normal text-charcoal transition-colors duration-150 hover:underline underline-offset-4 decoration-1"
        >
          Not tonight
        </button>
      ) : null}
      {onSeeHow ? (
        <button
          type="button"
          onClick={onSeeHow}
          aria-expanded={seeHowExpanded}
          className="text-base font-normal text-charcoal transition-colors duration-150 hover:underline underline-offset-4 decoration-1"
        >
          {seeHowExpanded ? "Hide recipe" : "See how"}
        </button>
      ) : null}
      {onStartOver ? (
        <button
          type="button"
          onClick={onStartOver}
          className="text-base font-normal text-quiet transition-colors duration-150 hover:text-charcoal"
        >
          Start over
        </button>
      ) : null}
    </div>
  );
}
