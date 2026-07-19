type RecommendationHeaderProps = {
  title: string;
  rationale: string;
  eyebrow?: string;
};

export function RecommendationHeader({
  title,
  rationale,
  eyebrow,
}: RecommendationHeaderProps) {
  return (
    <header>
      {eyebrow ? (
        <p className="text-xs tracking-widest text-quiet mb-4">{eyebrow}</p>
      ) : null}
      <h1 className="font-serif text-3xl md:text-4xl leading-[1.1] tracking-tight text-charcoal mb-4 text-balance">
        {title}
      </h1>
      <p className="text-base text-charcoal leading-relaxed">{rationale}</p>
    </header>
  );
}
