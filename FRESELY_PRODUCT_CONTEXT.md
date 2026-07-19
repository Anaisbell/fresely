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
- Kitchen Wisdom emoji/icon beside the notification bell.
- Calm featured recommendation.
- "Taste of Home."
- "Made for Your Roots."
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
