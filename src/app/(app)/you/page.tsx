"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import {
  useAppSettings,
  type AppSettingsState,
} from "@/lib/app-state/useAppSettings";

function splitItems(value: string): string[] {
  return value
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function YouPage() {
  const settings = useAppSettings();

  if (!settings.hydrated) return null;

  return <YouEditor settings={settings} />;
}

function YouEditor({ settings }: { settings: AppSettingsState }) {
  const [cultures, setCultures] = useState(() =>
    settings.cultures.join(", "),
  );
  const [restrictions, setRestrictions] = useState(() =>
    settings.restrictions.join(", "),
  );
  const [servings, setServings] = useState(settings.defaultServings);

  function save() {
    settings.setCultures(splitItems(cultures));
    settings.setRestrictions(splitItems(restrictions));
    settings.setDefaultServings(servings);
  }

  return (
    <main className="flex-1 px-6 py-12">
      <div className="max-w-lg mx-auto">
        <h1 className="font-serif text-3xl mb-6">You</h1>

        <label htmlFor="cultures" className="block mb-2">
          Cuisine preferences
        </label>
        <textarea
          id="cultures"
          rows={4}
          value={cultures}
          onChange={(event) => setCultures(event.target.value)}
          className="w-full rounded-xl border border-line bg-surface p-4 mb-6"
        />

        <label htmlFor="restrictions" className="block mb-2">
          Restrictions
        </label>
        <textarea
          id="restrictions"
          rows={4}
          value={restrictions}
          onChange={(event) => setRestrictions(event.target.value)}
          className="w-full rounded-xl border border-line bg-surface p-4 mb-6"
        />

        <label htmlFor="default-servings" className="block mb-2">
          Default servings
        </label>
        <input
          id="default-servings"
          type="number"
          min={1}
          max={12}
          value={servings}
          onChange={(event) =>
            setServings(Math.min(12, Math.max(1, Number(event.target.value))))
          }
          className="w-full rounded-xl border border-line bg-surface p-4 mb-6"
        />

        <Button onClick={save} disabled={!splitItems(cultures).length}>
          Save
        </Button>
      </div>
    </main>
  );
}

