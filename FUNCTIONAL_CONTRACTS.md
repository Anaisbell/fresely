# Fresely beta functional contracts

These interfaces are the stable handoff between the functional and presentation
layers. Presentation work may replace page markup without changing these contracts.

## Onboarding

Import `useOnboarding` from `@/lib/useOnboarding`.

```ts
const { answers, setField, clear, hydrated } = useOnboarding();
```

`answers` contains one session-only identity field and four dinner fields:

- `firstName`: required trimmed first name, up to 60 characters
- `culture`: one or more cuisine preferences
- `goal`: the chosen dinner priority followed by optional generation directives
- `kitchen`: one or more available ingredients
- `restrictions`: zero or more allergies, dietary restrictions, or dislikes

The combined `/onboarding/details` screen collects ingredients, time, avoidances,
and servings. To preserve the existing API and storage schemas, it maps them to
the contract as follows:

- Ingredients → `kitchen`
- Avoidances → `restrictions`
- Time → `goal[1]` as `Time available: {number} minutes`
- Servings → `goal[2]` as `Servings: {number}`

Presentation code should treat `goal[0]` as the user-facing goal selection and
should not display the directive entries as additional selected goals.

Call `setField(key, value)` to update and immediately persist a field for the
current browser tab. Do not access `sessionStorage` directly from presentation
components.

## Generation API

`POST /api/generate` accepts `culture`, `goal`, `kitchen`, `restrictions`,
the required `mealContext` (`breakfast`, `lunch`, or `dinner`), and an
optional `previousRecommendationTitle`. The browser resolves `mealContext`
from local time once, at the moment generation begins, and the client
constructs this strict request explicitly. `firstName` is never sent to the
API or included in the Claude prompt.

`previousRecommendationTitle` is an ephemeral, per-call diversity hint, not a
durable preference. It is present only when Home's "Not today" flow
regenerates in place — set to whatever recommendation is currently on screen,
captured immediately before it's replaced — and absent for the original
onboarding generation, since there's nothing yet to differ from. It is part
of `GenerateDinnerRequestSchema` only, never `StoredGenerateDinnerRequestSchema`;
it must never be persisted. When present, the prompt instructs the model to
recommend a genuinely different meal (different overall concept, cooking
style, or primary ingredient) rather than a minor variation of the previous
one, while still respecting pantry, preferences, goals, and meal period. The
specific rejection reason selected in the "Not today" sheet is still never
sent to the API — only the previous title is. A successful response is:

```ts
{ recommendation: DinnerRecommendation }
```

Failures use:

```ts
{ error: { code: string; message: string } }
```

The canonical Zod schemas and inferred types live in
`src/lib/dinner/schema.ts` and `src/lib/dinner/types.ts`.

## Tonight

Import `useDinnerRecommendation` from `@/lib/useDinnerRecommendation`.

```ts
const { recommendation, hydrated } = useDinnerRecommendation();
```

Wait for `hydrated` before rendering a missing-data state. `recommendation` is
either `null` or contains:

- `title`
- `rationale`
- `timeMinutes`
- `servings`
- `availableIngredients`
- `additionalIngredients`
- `steps`
- `caution`

Use `clearDinnerSession()` from `@/lib/session/dinner-state` for the Start Over
action.

## Durable app state

The versioned post-onboarding state contract lives in
`src/lib/app-state/schema.ts`. Its storage key is `fresely:app-state:v1`.

```ts
type FreselyAppState = {
  version: 1;
  setup: { completedAt: string };
  preferences: {
    firstName: string;
    cultures: string[];
    restrictions: string[];
    defaultServings: number;
  };
  pantry: {
    ingredients: string[];
    updatedAt: string;
  };
  latestRecommendation: {
    recommendation: DinnerRecommendation;
    generatedAt: string;
    request: StoredGenerateDinnerRequest;
  } | null;
};
```

Use `readAppState`, `writeAppState`, and `clearAppState` from
`@/lib/app-state/storage`. Presentation code must not read or write the
`localStorage` key directly.

`migrateLegacyState` is a pure migration utility. It creates durable state only
when both the legacy onboarding request and recommendation are valid. For an
incomplete or malformed legacy session, it returns no completed app state and
preserves each independently valid onboarding field so onboarding can resume.

The current beta does not consume or write this durable state yet. Integration
begins when generation returns a recommendation that has passed the shared Zod
contract. `completeSetupOnce` then writes the versioned app state and sets the
`fresely_setup=1` cookie. Repeated calls reuse the existing valid durable state
instead of overwriting it.

When generation runs after setup is already complete,
`persistGeneratedRecommendation` replaces only `latestRecommendation` with the
validated result and the exact `mealContext` sent to the API. Setup metadata,
preferences, and pantry remain unchanged.

The setup cookie is only a non-sensitive server-routing hint. It contains no
profile, pantry, request, or recommendation data. Durable state remains in the
validated local storage record.

## Home recommendation

Home consumes `useHomeRecommendation` from
`@/lib/app-state/useHomeRecommendation`:

```ts
type HomeRecommendationState = {
  hydrated: boolean;
  firstName: string;
  currentRecommendation: DinnerRecommendation | null;
  mealContext: "breakfast" | "lunch" | "dinner" | null;
  savedAt: string | null;
  madeAt: string | null;
  isFresh: boolean;
  markMade: () => void;
  clearRecommendation: () => void;
  syncState: (next: FreselyAppState) => void;
};
```

The persistence layer owns freshness, and owns it as a meal-period concept,
not a calendar-day one. `isFresh` is true only when the current
recommendation's own period — its local generation day plus the meal context
it was generated for — matches the active period right now (see
`mealPeriodId` in `useHomeRecommendation.ts`, e.g. `"2026-07-20:dinner"`).
`madeAt` is preserved as historical data and never by itself keeps a
recommendation current: once its meal period has passed, `isFresh` becomes
false regardless of `madeAt`, and Home falls back to the Ready state rather
than continuing to show a stale Made or Pick view. Ready never triggers
generation on its own — it only ever happens when the user acts. A
recommendation with no stored `mealContext` (a legacy record) can never
match the active period and is always treated as stale. Presentation code
must not compare recommendation dates or meal periods itself.

`markMade` adds a durable completion timestamp without changing the saved
recommendation. `clearRecommendation` removes only the latest recommendation;
setup, preferences, and pantry remain unchanged. Existing version 1 records
without `madeAt` remain valid and receive `null` through the schema default.
Existing version 1 recommendation requests without `mealContext` also remain
valid and receive `null`. New recommendations persist the exact meal context
sent to the generation API; stored meal context is never recomputed when Home
is reopened.

`syncState` is a thin setter only — it does not read, write, or validate
storage itself. It exists so a caller that already produced a validated next
state through an existing write path (for example `persistGeneratedRecommendation`)
can make Home reflect it immediately without a page reload. Home's "Not today"
regeneration (see below) is currently the only caller.

### "Not today" in-place regeneration

Tapping "Not tonight" on the active recommendation opens a bottom sheet
("What wasn't quite right?") instead of regenerating immediately. The sheet
offers six reason options; the selection is V1-only — it is never sent to
`/api/generate` and never persisted anywhere. Continue always triggers the
same regeneration regardless of which reason was picked.

Regeneration itself reuses the existing pipeline exactly:
`readGenerationOnboardingAnswers` → `getMealContext` → `requestDinnerRecommendation`
→ `persistGeneratedRecommendation`, called directly from `home/page.tsx`
rather than via `/onboarding/loading`. No schema, prompt, or persistence
function changed — only the call site. The result is handed to
`useHomeRecommendation`'s `syncState` so Home updates without navigating or
reloading. `HeroTransition` (keyed on `savedAt`) animates the swap; there is
no intermediate loading screen for this path. If regeneration fails, the
current recommendation stays exactly as it was and the failure is logged —
there is no visible error state for this path in V1.

## Kitchen and You settings

`useAppSettings` from `@/lib/app-state/useAppSettings` owns durable pantry and
preference edits:

```ts
type AppSettingsState = {
  hydrated: boolean;
  firstName: string;
  pantryIngredients: string[];
  cultures: string[];
  restrictions: string[];
  defaultServings: number;
  setPantryIngredients: (ingredients: string[]) => void;
  setCultures: (cultures: string[]) => void;
  setRestrictions: (restrictions: string[]) => void;
  setDefaultServings: (servings: number) => void;
};
```

These setters modify only pantry or preferences. They never change
`latestRecommendation`, mark a meal as made, or start generation. The existing
beta onboarding session is synchronized when present so a later request in that
session uses the updated settings; durable app state remains the source of truth
across browser sessions.

## App-state recovery

The shared app layout is guarded by `AppStateGuard`. Its recovery order is:

1. Render immediately after a valid versioned durable state is found.
2. Otherwise, sanitize the existing beta onboarding and recommendation session
   independently and migrate when both form a valid completed setup.
3. If setup cannot be completed, clear the stale setup cookie and redirect to
   the earliest incomplete onboarding route.

`/onboarding/name` is the earliest onboarding and recovery route. Culture,
Goal, Details, and Loading all require a non-empty trimmed `firstName` before
continuing. The Name screen is unnumbered; Culture, Goal, and Details remain
steps 1–3 of 3.

Existing durable version 1 records without `preferences.firstName` remain
readable through the empty-string schema default. They are incomplete rather
than corrupt and resume at `/onboarding/name` while their valid preferences,
pantry, and session answers are preserved.

Malformed durable storage is removed without clearing beta session keys. A
valid culture, goal, kitchen, or restrictions field is therefore preserved even
when another legacy field is missing or malformed. The setup cookie is restored
only after durable state validates or migration succeeds.

## Environment

Both `ANTHROPIC_API_KEY` and `ANTHROPIC_MODEL` are server-only and required for
generation. Neither variable may use the `NEXT_PUBLIC_` prefix.
