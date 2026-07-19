type RecommendationIngredientsProps = {
  available: string[];
  additional: string[];
};

export function RecommendationIngredients({
  available,
  additional,
}: RecommendationIngredientsProps) {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="font-serif italic text-lg text-charcoal mb-3">
          In your kitchen
        </h2>
        <p className="text-base text-charcoal leading-relaxed">
          {available.join(", ")}
        </p>
      </section>
      {additional.length > 0 ? (
        <section>
          <h2 className="font-serif italic text-lg text-charcoal mb-3">
            You&apos;ll also need
          </h2>
          <p className="text-base text-charcoal leading-relaxed">
            {additional.join(", ")}
          </p>
        </section>
      ) : null}
    </div>
  );
}
