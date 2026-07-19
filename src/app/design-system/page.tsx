import { Button } from "@/components/Button";
import { Tile } from "@/components/Tile";
import { Card } from "@/components/Card";
import { Pill } from "@/components/Pill";

export default function DesignSystemPage() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-16">
      <header className="mb-16">
        <p className="text-xs tracking-widest text-quiet mb-2">
          Design system
        </p>
        <h1 className="font-serif text-4xl tracking-tight">Fresely, v0.1.</h1>
      </header>

      <Section title="Palette">
        <div className="grid grid-cols-4 gap-3">
          <Swatch bg="bg-cream" name="Cream" hex="#F2E5C9" />
          <Swatch bg="bg-charcoal" name="Charcoal" hex="#1F1D1A" light />
          <Swatch bg="bg-honey" name="Honey" hex="#C5A270" />
          <Swatch bg="bg-sage" name="Sage" hex="#9DAB91" />
        </div>
      </Section>

      <Section title="Typography">
        <div className="bg-surface border border-line rounded-2xl p-8">
          <p className="font-serif text-5xl tracking-tight mb-4">Fresely</p>
          <p className="text-sm text-muted leading-relaxed max-w-md">
            Fraunces for headlines and voice. Inter for everything functional.
            Together, closer to a cookbook than an app.
          </p>
        </div>
      </Section>

      <Section title="Button">
        <div className="flex gap-3 flex-wrap">
          <Button>Continue</Button>
          <Button>Begin →</Button>
        </div>
      </Section>

      <Section title="Tile">
        <div className="grid grid-cols-2 gap-2 max-w-xs">
          <Tile>Mexican</Tile>
          <Tile selected>Dominican</Tile>
          <Tile>Italian</Tile>
          <Tile selected>Mediterranean</Tile>
        </div>
      </Section>

      <Section title="Pill">
        <div className="flex gap-2">
          <Pill variant="honey">20 min</Pill>
          <Pill variant="sage">You have everything</Pill>
        </div>
      </Section>

      <Section title="Card (hero preview)">
        <Card>
          <div className="h-40 bg-honey" />
          <div className="p-5">
            <p className="font-serif text-xl mb-2">Lemon herb chicken bowl</p>
            <p className="text-sm text-muted leading-relaxed mb-3">
              Because you have chicken and yogurt, 25 minutes, and you said
              more protein this week.
            </p>
            <div className="flex gap-2">
              <Pill variant="honey">25 min</Pill>
              <Pill variant="sage">You have everything</Pill>
            </div>
          </div>
        </Card>
      </Section>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-16">
      <h2 className="font-serif text-2xl mb-6">{title}</h2>
      {children}
    </section>
  );
}

function Swatch({
  bg,
  name,
  hex,
  light = false,
}: {
  bg: string;
  name: string;
  hex: string;
  light?: boolean;
}) {
  return (
    <div
      className={`${bg} border border-line rounded-xl aspect-square p-3 flex flex-col justify-end`}
    >
      <div className={`text-xs ${light ? "text-cream" : "text-charcoal"}`}>
        {name}
      </div>
      <div
        className={`text-xs font-mono opacity-60 ${light ? "text-cream" : "text-charcoal"}`}
      >
        {hex}
      </div>
    </div>
  );
}
