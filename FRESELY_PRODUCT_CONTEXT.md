# Fresely product context

This is the permanent product brief for Fresely. Read it alongside
`FUNCTIONAL_CONTRACTS.md` (the technical source of truth) before making product
or UX decisions. If a request conflicts with this document, flag the conflict
instead of silently resolving it.

## What Fresely is

Fresely is an AI-first food decision and cooking app. It is not a recipe app.
Its purpose is to reduce the daily mental load of deciding what to eat.

**Core promise:** "I open Fresely and instantly know what I can eat next."

**Brand idea:** "Cook the foods of your people."

The experience should feel personal, culturally familiar, comforting, calm,
warm, and modern.

## Scope discipline (V1)

Current V1 is solo-first. Do not add couple mode, family mode, community
features, social posts, family memories, or other large future features
without explicit approval. If a request seems to call for one of these, stop
and confirm before building it.

## Onboarding direction

Flow: **Welcome → Name → Culture → Goal → Details → Loading → Home.**

The Name screen is implemented before Culture and collects a required first
name. `firstName` persists through onboarding and is stored durably at
`preferences.firstName`. Home now displays a quiet "Hi, {firstName}." greeting,
sourced from durable `preferences.firstName` (never from sessionStorage). No
greeting appears when the name is unavailable — there is no generic fallback.
`firstName` remains excluded from the `/api/generate` request and Claude prompt.

## Home screen direction

- Warm cream background, not stark white.
- Personalized greeting using the user's first name.
- A small 💡 Kitchen Wisdom control sits top-right on Ready, Made, and the
  active recommendation (Pick) states — absolutely positioned so it never
  shifts or resizes the centered or top-aligned content in any of those
  states. It is hidden during the transient Loading (`isLeaving`) screen.
  Tapping it toggles a lightweight anchored panel (not a new page, not a
  large permanent section) showing one static tip. The tip is selected
  deterministically from the local calendar day (no `Math.random`, no
  storage) via `getDailyTip` in `src/lib/kitchen-wisdom/tips.ts`, so it stays
  stable all day and only changes at local midnight. The panel has an
  explicit close button; Escape also closes it; there is no click-outside
  dismissal in V1. The notification bell is intentionally not built yet —
  there is no notification system in the app to back it, and a visible but
  non-functional bell would be misleading. It remains future work.
- The featured recommendation renders as a single premium card
  (`FeaturedRecommendationCard`, Home-only, reused across the Made and Pick
  states): a reserved image area (a warm gradient placeholder — no image
  field exists in the recommendation data yet, and none is invented here;
  the container is sized and rounded so a real image can drop in later
  without a layout change), the persisted meal label, the recipe title
  (max two lines, gracefully truncated), inline metadata
  ("⏱ {time} min • 🍽 Serves {servings}"), a single primary "Cook Now →"
  button, and the secondary actions underneath. "Cook Now →" triggers the
  same expand/collapse behavior the old "See how" link used to trigger —
  it is not a new action. The long recommendation rationale and the
  allergy/caution note no longer render on Home; neither field is removed
  from data, generation, or storage. On Made, the secondary row has no
  actions (unchanged from before); on Pick, it is "Made it" and
  "Not tonight" only — "See how" no longer appears as a separate control
  since Cook Now replaced it. `RecommendationHeader` and `RecommendationMeta`
  are unchanged and still used by the legacy `/tonight` route; Home simply
  no longer calls them.
- Below the greeting, Home shows a static supporting line, "Let's make
  today delicious." — not yet derived from mealContext. It appears only
  alongside the greeting (same no-generic-fallback condition).
- Tapping "Not tonight" on the active recommendation opens a bottom sheet
  ("What wasn't quite right?") with six reason options (too heavy, too
  expensive, missing ingredients, too much effort, not in the mood, just
  something different) and a Continue button. The selected reason is V1
  only — never sent to the API, never persisted. Continue closes the sheet
  and regenerates in place on Home (no navigation, no loading screen): the
  current card slides away and the new one slides into the exact same
  position via a reusable `HeroTransition` component. Reuses the existing
  generation and persistence path exactly (see `FUNCTIONAL_CONTRACTS.md`);
  only the call site changed. `BottomSheet` is a generic, reusable
  component, not specific to this one interaction.
- That regeneration also sends one extra, ephemeral piece of context:
  `previousRecommendationTitle`, the recommendation just replaced. The
  prompt uses it to ask for a genuinely different meal — a different overall
  concept, cooking style, or primary ingredient — rather than a minor
  variation (e.g. the same dish with a different vegetable). This value is
  never persisted and never reused beyond that one request. The specific
  reason selected in the sheet is still not sent to the API — this is
  intentionally scoped to recommendation diversity only.
- "Taste of Home."
- "Made for Your Roots" is a hybrid recipe architecture, not a pure-AI
  feature. Curated "anchor" recipes — manually reviewed cultural classics —
  take priority whenever one is safe (no restriction conflict) and practical
  (the user's pantry covers its defining ingredients, and it fits their
  stated meal context and time). AI generation is the fallback and
  personalization layer: it runs whenever no curated recipe clears those
  bars, not merely because AI could optimize the pick further. This milestone
  ships the architecture and one illustrative curated recipe, not a full
  library — curators add classics incrementally, one file per culture under
  `src/lib/dinner/anchor-recipes/data/`; nothing else in the system changes
  as the library grows. Every recommendation now carries a `source: "anchor"
  | "ai"` field; no Home UI treatment for it exists yet (see
  `FUNCTIONAL_CONTRACTS.md`).
- Time-aware recommendations: breakfast, lunch, dinner.
- Primary recommendations use the browser-local meal period captured when
  generation begins: breakfast 05:00–10:59, lunch 11:00–15:59, and dinner
  16:00–04:59. The captured value is persisted with the recommendation rather
  than recomputed when Home reopens.
- Home displays that persisted meal context as a quiet label on the featured
  recommendation (both the active pick and the Made state): breakfast shows
  "Breakfast," lunch shows "Lunch," and dinner shows "Tonight." A legacy
  recommendation with no stored meal context also shows "Tonight." The label
  always reflects what was actually used to generate the current pick and is
  never recalculated from the clock when Home is reopened.
- The Ready-state CTA (before any recommendation exists) reads "Show me what
  to make →" — meal-period-neutral wording, since no recommendation or
  persisted mealContext exists yet at that point. It does not compute or
  display a temporary time-based label.
- Snacks must remain accessible.
- Avoid too many photographs, cards, or carousels.
- Reduce decision fatigue — this is a design constraint, not just a tagline.
- Do not automatically mix cultures yet.
- "Made for Right Now" wording is still undecided — don't lock it in without
  checking.

## Visual identity

- Fraunces for expressive headings.
- Inter for body/interface text.
- Palette: warm cream, honey, sage, and charcoal.
- Tone: Apple Health pace with a Calm whisper.
- Avoid loud gradients, generic fitness styling, excessive cards, aggressive
  gamification, and clutter.

## Development rules

- Preserve existing working functionality.
- Inspect the repo and `git status` before making changes.
- Make the smallest safe change.
- Do not silently make major product decisions — surface them instead.
- Explain changed files clearly after any edit.
- Treat `FUNCTIONAL_CONTRACTS.md` as the technical source of truth.
- Do not overwrite architecture-heavy Codex work without inspecting it first.
