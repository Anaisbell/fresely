type RecommendationStepsProps = {
  steps: string[];
};

export function RecommendationSteps({ steps }: RecommendationStepsProps) {
  return (
    <section>
      <h2 className="font-serif italic text-lg text-charcoal mb-6">
        The steps
      </h2>
      <ol className="space-y-7">
        {steps.map((step, index) => (
          <li key={index} className="flex gap-5 items-start">
            <span
              aria-hidden="true"
              className="font-serif text-3xl text-quiet leading-none tabular-nums flex-shrink-0 pt-1"
            >
              {index + 1}
            </span>
            <p className="text-base text-charcoal leading-relaxed">
              <span className="sr-only">Step {index + 1}. </span>
              {step}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
