"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import { Tile } from "@/components/Tile";
import { Card } from "@/components/Card";
import { Pill } from "@/components/Pill";
import { PantryIngredients } from "@/components/kitchen/PantryIngredients";
import { CultureTilePicker } from "@/components/CultureTilePicker";
import { FirstNameField } from "@/components/settings/FirstNameField";
import { RestrictionChips } from "@/components/settings/RestrictionChips";
import { ServingsStepper } from "@/components/settings/ServingsStepper";

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

      <Section title="Pantry ingredients (Kitchen V1 — WIP)">
        <PantryIngredientsPreview />
      </Section>

      <Section title="Settings profile layout (Settings V1 — WIP)">
        <SettingsPreview />
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

/**
 * Local-state stub for reviewing PantryIngredients' visuals and interaction
 * in isolation, before it's wired to real durable storage in Kitchen
 * (Step 2). Not the real Kitchen page — just a bench to check this against.
 */
function PantryIngredientsPreview() {
  const [ingredients, setIngredients] = useState([
    "chicken thighs",
    "rice",
    "onions",
    "garlic",
    "spinach",
  ]);

  return (
    <PantryIngredients
      ingredients={ingredients}
      onAdd={(ingredient) => setIngredients((prev) => [...prev, ingredient])}
      onRemove={(ingredient) =>
        setIngredients((prev) => prev.filter((item) => item !== ingredient))
      }
    />
  );
}

/**
 * Local-state stub for reviewing the new Settings V1 fields composed into
 * their intended two-section "profile" layout, before any of it is wired
 * to real durable storage or the real /you (soon /settings) page. Section
 * headings use the same text-2xl serif treatment as this page's own
 * Section wrapper; field labels reuse onboarding Details' established
 * "font-serif italic text-lg" style, so the hierarchy (section > field >
 * control) is legible without leaning on borders, cards, or boxes — meant
 * to read as a profile's grouped information, not a stacked admin form.
 */
function SettingsPreview() {
  const [firstName, setFirstName] = useState("Anna");
  const [cultures, setCultures] = useState<string[]>([
    "Dominican",
    "Soul Food",
  ]);
  const [restrictions, setRestrictions] = useState<string[]>(["peanuts"]);
  const [servings, setServings] = useState(2);

  return (
    <div className="max-w-lg space-y-12">
      <div className="space-y-8">
        <h3 className="font-serif text-2xl text-charcoal">About You</h3>

        <div>
          <label
            htmlFor="preview-first-name"
            className="block font-serif italic text-lg text-charcoal mb-3"
          >
            First name
          </label>
          <FirstNameField
            id="preview-first-name"
            value={firstName}
            onCommit={setFirstName}
          />
        </div>

        <div>
          <div className="font-serif italic text-lg text-charcoal mb-3">
            Cuisine preferences
          </div>
          <CultureTilePicker selected={cultures} onChange={setCultures} compact />
        </div>
      </div>

      <div className="space-y-8">
        <h3 className="font-serif text-2xl text-charcoal">
          Food Preferences
        </h3>

        <div>
          <div className="font-serif italic text-lg text-charcoal mb-3">
            Dietary restrictions
          </div>
          <RestrictionChips
            restrictions={restrictions}
            onAdd={(restriction) =>
              setRestrictions((prev) => [...prev, restriction])
            }
            onRemove={(restriction) =>
              setRestrictions((prev) =>
                prev.filter((item) => item !== restriction),
              )
            }
          />
        </div>

        <div>
          <div className="font-serif italic text-lg text-charcoal mb-3">
            Default servings
          </div>
          <ServingsStepper value={servings} onChange={setServings} />
        </div>
      </div>
    </div>
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
