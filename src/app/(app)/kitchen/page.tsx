"use client";

import { PantryIngredients } from "@/components/kitchen/PantryIngredients";
import {
  useAppSettings,
  type AppSettingsState,
} from "@/lib/app-state/useAppSettings";

export default function KitchenPage() {
  const settings = useAppSettings();

  if (!settings.hydrated) return null;

  return <KitchenView settings={settings} />;
}

/**
 * Every add/remove commits immediately through useAppSettings — there is no
 * batch Save step. The ingredients are the page's content, not a form the
 * user fills out and submits.
 */
function KitchenView({ settings }: { settings: AppSettingsState }) {
  function addIngredient(ingredient: string) {
    settings.setPantryIngredients([...settings.pantryIngredients, ingredient]);
  }

  function removeIngredient(ingredient: string) {
    settings.setPantryIngredients(
      settings.pantryIngredients.filter((item) => item !== ingredient),
    );
  }

  return (
    <main className="flex-1 px-6 py-12 md:py-16">
      <div className="max-w-lg mx-auto">
        <h1 className="font-serif text-3xl tracking-tight text-charcoal mb-2">
          Kitchen
        </h1>
        <p className="text-sm text-muted mb-10">
          Keep your kitchen up to date for better meal recommendations.
        </p>
        <PantryIngredients
          ingredients={settings.pantryIngredients}
          onAdd={addIngredient}
          onRemove={removeIngredient}
        />
      </div>
    </main>
  );
}
