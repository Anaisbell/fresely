"use client";

import { CultureTilePicker } from "@/components/CultureTilePicker";
import { FirstNameField } from "@/components/settings/FirstNameField";
import { RestrictionChips } from "@/components/settings/RestrictionChips";
import { ServingsStepper } from "@/components/settings/ServingsStepper";
import {
  useAppSettings,
  type AppSettingsState,
} from "@/lib/app-state/useAppSettings";

export default function SettingsPage() {
  const settings = useAppSettings();

  if (!settings.hydrated) return null;

  return <SettingsView settings={settings} />;
}

/**
 * Every field commits immediately through useAppSettings — first name on
 * blur/Enter, everything else per interaction — matching Kitchen's
 * immediate-persist model. There is no batch Save step. Organized as two
 * profile-like sections ("About You", "Food Preferences") rather than one
 * continuous list, per the Settings V1 design direction: this is meant to
 * read as a destination in the app, not an administrative form.
 */
function SettingsView({ settings }: { settings: AppSettingsState }) {
  // AppPreferencesSchema requires at least one culture. CultureTilePicker
  // itself is a fully controlled, opinion-free component (used as-is by
  // onboarding too), so the "at least one" business rule belongs here,
  // where the schema is actually enforced — not inside the picker. A
  // deselect that would leave zero selected is silently refused (the
  // previous selection stands) rather than committing an empty array and
  // crashing on FreselyAppStateSchema.parse.
  function handleCulturesChange(next: string[]) {
    if (next.length === 0) return;
    settings.setCultures(next);
  }

  function addRestriction(restriction: string) {
    settings.setRestrictions([...settings.restrictions, restriction]);
  }

  function removeRestriction(restriction: string) {
    settings.setRestrictions(
      settings.restrictions.filter((item) => item !== restriction),
    );
  }

  return (
    <main className="flex-1 px-6 py-12 md:py-16">
      <div className="max-w-lg mx-auto">
        <h1 className="font-serif text-3xl tracking-tight text-charcoal mb-2">
          Settings
        </h1>
        <p className="text-sm text-muted mb-10">
          Who you are and how Fresely cooks for you.
        </p>

        <div className="space-y-12">
          <section className="space-y-8">
            <h2 className="font-serif text-2xl text-charcoal">About You</h2>

            <div>
              <label
                htmlFor="settings-first-name"
                className="block font-serif italic text-lg text-charcoal mb-3"
              >
                First name
              </label>
              <FirstNameField
                id="settings-first-name"
                value={settings.firstName}
                onCommit={settings.setFirstName}
              />
            </div>

            <div>
              <div className="font-serif italic text-lg text-charcoal mb-3">
                Cuisine preferences
              </div>
              <CultureTilePicker
                selected={settings.cultures}
                onChange={handleCulturesChange}
                compact
              />
            </div>
          </section>

          <section className="space-y-8">
            <h2 className="font-serif text-2xl text-charcoal">
              Food Preferences
            </h2>

            <div>
              <div className="font-serif italic text-lg text-charcoal mb-3">
                Dietary restrictions
              </div>
              <RestrictionChips
                restrictions={settings.restrictions}
                onAdd={addRestriction}
                onRemove={removeRestriction}
              />
            </div>

            <div>
              <div className="font-serif italic text-lg text-charcoal mb-3">
                Default servings
              </div>
              <ServingsStepper
                value={settings.defaultServings}
                onChange={settings.setDefaultServings}
              />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
