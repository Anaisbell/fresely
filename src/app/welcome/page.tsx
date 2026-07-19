import Link from "next/link";

export default function WelcomePage() {
  return (
    <main className="flex flex-1 flex-col px-6">
      <header className="pt-8 flex justify-center">
        <span className="font-serif text-base tracking-wide text-charcoal">
          Fresely
        </span>
      </header>
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="font-serif text-4xl md:text-5xl leading-[1.1] tracking-tight text-charcoal mb-6 text-balance">
            Tonight&apos;s dinner is already figured out.
          </h1>
          <p className="text-base text-muted mb-12 max-w-sm mx-auto text-balance">
            One pick, thoughtfully chosen for tonight.
          </p>
          <Link
            href="/onboarding/culture"
            className="inline-block text-sm tracking-wide text-quiet hover:text-charcoal transition-colors"
          >
            Begin &rarr;
          </Link>
        </div>
      </div>
    </main>
  );
}

