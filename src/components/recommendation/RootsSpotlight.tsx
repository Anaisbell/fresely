import type { AnchorRecipe } from "@/lib/dinner/anchor-recipes/schema";

type RootsSpotlightProps = {
  recipe: AnchorRecipe;
  /**
   * Reserved for a future recipe detail view. Intentionally left unwired by
   * Home for this milestone — there's nothing to open yet — but the card is
   * a real button now so wiring this up later needs no structural change.
   */
  onSelect?: () => void;
};

/**
 * Home's "Made for Your Roots" section: a standalone spotlight on a curated
 * cultural classic, independent of whatever the hero card is currently
 * showing. Presentational only — inspiration and cultural connection, not
 * a cook-this-now decision, which is why it deliberately doesn't reuse the
 * hero's full-width image band, CTA, or actions.
 *
 * A teaser, not a reading experience: title and rationale are both
 * line-clamped (same technique the hero already uses for its own title) and
 * the time/servings metadata is dropped entirely — that's cook-now detail,
 * not what makes someone want to tap. The full rationale text is still in
 * the DOM for screen readers; line-clamp only hides overflow visually.
 *
 * The card has no visible call-to-action text; the whole card is the tap
 * target instead (a real <button>, not a styled div), so it's keyboard-
 * and screen-reader-accessible today even though onSelect isn't wired to
 * anything yet.
 */
export function RootsSpotlight({ recipe, onSelect }: RootsSpotlightProps) {
  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h2 className="font-serif text-lg md:text-xl text-charcoal">
          Made for Your Roots
        </h2>
        <p className="text-sm text-muted">
          A taste of {recipe.culture} home cooking.
        </p>
      </div>

      <button
        type="button"
        onClick={onSelect}
        className="w-full text-left rounded-2xl border border-line bg-surface p-5 flex items-center gap-5 transition-colors hover:border-muted"
      >
        {/* Modest, reserved image — same "none invented" precedent as the
            hero's own placeholder. Falls back to a warm gradient distinct
            from the hero's (honey-tint, not sage) so this reads as its own
            thing rather than a smaller hero. Swap for a real photo once
            imageUrl exists without any layout change. */}
        <div
          aria-hidden="true"
          className="shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-gradient-to-br from-honey-tint to-warm"
        >
          {recipe.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={recipe.imageUrl}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : null}
        </div>

        {/* flex/gap rather than space-y here so the extra breathing room
            below the culture label (title's mt-1) stacks predictably
            instead of collapsing with a sibling margin — line-clamp's box
            model makes plain block margin-collapse unreliable to lean on. */}
        <div className="min-w-0 flex flex-col gap-1">
          <p className="text-xs tracking-[0.2em] uppercase text-honey-deep">
            {recipe.culture}
          </p>
          <h3 className="font-serif text-lg leading-[1.2] tracking-tight text-charcoal text-balance line-clamp-2 mt-1">
            {recipe.title}
          </h3>
          <p className="text-sm text-muted leading-snug line-clamp-2">
            {recipe.rationale}
          </p>
        </div>
      </button>
    </section>
  );
}
