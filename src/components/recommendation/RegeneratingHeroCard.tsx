/**
 * Hero-shaped loading state shown in place of FeaturedRecommendationCard
 * while "Not tonight" regenerates. Deliberately not a spinner — mirrors the
 * real card's own proportions (gradient band + padded content, same
 * rounded-2xl/border/shadow shell) so HeroTransition's slide between the
 * outgoing hero, this, and the incoming hero reads as one continuous,
 * intentional motion rather than a layout jolt into a generic loader.
 *
 * role="status" + aria-live="polite" so screen reader users get an
 * equivalent "something is happening" signal to the pulsing gradient and
 * fade-in text sighted users see.
 */
export function RegeneratingHeroCard() {
  return (
    <article
      role="status"
      aria-live="polite"
      className="rounded-2xl border border-line bg-surface overflow-hidden shadow-sm"
    >
      <div
        aria-hidden="true"
        className="w-full aspect-[2/1] bg-gradient-to-b from-warm to-sage-tint animate-pulse"
      />
      <div className="p-8">
        <p
          className="font-serif italic text-lg text-charcoal"
          style={{ animation: "fresely-fadein 0.6s ease-out both" }}
        >
          Finding a better fit.
        </p>
      </div>
    </article>
  );
}
