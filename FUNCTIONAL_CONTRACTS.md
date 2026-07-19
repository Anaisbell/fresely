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

`POST /api/generate` accepts only `culture`, `goal`, `kitchen`, and
`restrictions`. The client constructs this strict request explicitly;
`firstName` is never sent to the API or included in the Claude prompt. A
successful response is:

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
    request: GenerateDinnerRequest;
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
  savedAt: string | null;
  madeAt: string | null;
  isFresh: boolean;
  markMade: () => void;
  clearRecommendation: () => void;
};
```

The persistence layer owns freshness. `isFresh` is true only when the current
recommendation was generated on the same local calendar day. Presentation code
must not compare recommendation dates itself.

`markMade` adds a durable completion timestamp without changing the saved
recommendation. `clearRecommendation` removes only the latest recommendation;
setup, preferences, and pantry remain unchanged. Existing version 1 records
without `madeAt` remain valid and receive `null` through the schema default.

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
