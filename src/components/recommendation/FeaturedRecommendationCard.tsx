import { RecommendationActions } from "@/components/recommendation/RecommendationActions";

type FeaturedRecommendationCardProps = {
  title: string;
  mealLabel: string;
  timeMinutes: number;
  servings: number;
  cookNowExpanded: boolean;
  onCookNow: () => void;
  onMadeIt?: () => void;
  onNotTonight?: () => void;
};

/**
 * Home's single premium featured recommendation card. Presentation only —
 * every prop is data or a callback the caller already owns; this component
 * holds no state of its own beyond what it's given.
 *
 * The image area is a reserved placeholder, not a photo: there is no image
 * field in the recommendation data yet, and none is invented here. It is a
 * fixed-aspect-ratio container so that when a real image field exists later,
 * it can be swapped in without a layout change.
 */
export function FeaturedRecommendationCard({
  title,
  mealLabel,
  timeMinutes,
  servings,
  cookNowExpanded,
  onCookNow,
  onMadeIt,
  onNotTonight,
}: FeaturedRecommendationCardProps) {
  // RecommendationActions always renders its wrapper div even with nothing
  // inside (e.g. the Made state, which passes neither handler). Only show
  // the divider that precedes it when there's actually a secondary action
  // to separate from the primary CTA.
  const hasSecondaryActions = Boolean(onMadeIt || onNotTonight);

  return (
    <article className="rounded-2xl border border-line bg-surface overflow-hidden shadow-sm">
      {/* Reserved image space. Placeholder only — swap for a real image
          (object-cover, same container) once an image field exists. */}
      <div
        aria-hidden="true"
        className="w-full aspect-[2/1] bg-gradient-to-b from-warm to-sage-tint"
      />

      <div className="p-8 space-y-8">
        <div className="space-y-3">
          <p className="text-xs tracking-[0.2em] uppercase text-quiet">
            {mealLabel}
          </p>
          <h2 className="font-serif text-[1.7rem] md:text-[2rem] leading-[1.15] tracking-tight text-charcoal line-clamp-2 text-balance">
            {title}
          </h2>
          <p className="text-xs text-quiet">
            ⏱ {timeMinutes} min &nbsp;•&nbsp; 🍽 Serves {servings}
          </p>
        </div>

        <button
          type="button"
          onClick={onCookNow}
          aria-expanded={cookNowExpanded}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-charcoal px-8 py-3.5 text-base font-medium tracking-wide text-cream transition-opacity hover:opacity-90"
        >
          Cook Now &rarr;
        </button>

        {hasSecondaryActions ? (
          <div className="pt-6 border-t border-line/70 flex justify-center">
            <RecommendationActions
              onMadeIt={onMadeIt}
              onNotTonight={onNotTonight}
            />
          </div>
        ) : null}
      </div>
    </article>
  );
}
