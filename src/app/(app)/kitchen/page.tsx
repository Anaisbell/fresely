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

export default function KitchenPage() {
  const settings = useAppSettings();

  if (!settings.hydrated) return null;

  return <KitchenEditor settings={settings} />;
}

function KitchenEditor({ settings }: { settings: AppSettingsState }) {
  const [value, setValue] = useState(() =>
    settings.pantryIngredients.join(", "),
  );

  return (
    <main className="flex-1 px-6 py-12">
      <div className="max-w-lg mx-auto">
        <h1 className="font-serif text-3xl mb-6">Kitchen</h1>
        <label htmlFor="pantry-ingredients" className="block mb-2">
          Pantry ingredients
        </label>
        <textarea
          id="pantry-ingredients"
          rows={8}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          className="w-full rounded-xl border border-line bg-surface p-4 mb-6"
        />
        <Button
          onClick={() => settings.setPantryIngredients(splitItems(value))}
        >
          Save
        </Button>
      </div>
    </main>
  );
}

