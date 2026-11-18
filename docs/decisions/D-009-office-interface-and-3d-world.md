# D-009 — The office interface and its 3D world

**Status:** accepted · 2026-11-18

## Context

The site read like a generic blog template. The owner asked for an interface that is
unmistakably its own, with one hard constraint: search engines and AI agents must keep
reading every text.

## Decision

- **One world, two ways in.** The site is an office staffed by small orange agents.
  Every page is a flat, illustrated view of it (`src/layouts/Office.astro`); a
  first-person 3D version of the same office opens over any page on demand.
- **Pages are complete HTML.** Each text keeps its own address and is rendered at build
  time, with canonical and `hreflang` links, Open Graph tags and JSON-LD. Drawings are
  inline SVG produced by `src/office/draw.ts`. The browser script
  (`src/office/client.ts`) only adds what needs a click.
- **The 3D world is a runtime asset.** `public/world/` holds its script, markup, styles
  and a vendored three.js r128. Nothing in it is requested until the visitor asks for
  it. Its walls and sheets are fed by `/world/data.<lang>.json`, built from the content
  collections (`src/office/view.ts`). The directory is excluded from ESLint and
  Prettier: it is shipped as written.
- **The passage is continuous.** The page lifts away like a sheet while the camera
  starts far back with a narrow lens and comes down to eye level in front of the stand
  that matches the page; leaving runs it backwards and lands on the page of the nearest
  stand.
- **Retired pages redirect.** `/graph/`, `/search/` and `/tags/*` now answer with the
  library (`public/_redirects`), which holds every text, a search, and the definitions.
- **The agent has a daily ceiling.** Questions to a Clawd go through the existing
  grounded agent with an optional `persona`. Spend is capped at USD 0.10 per UTC day,
  shared by all visitors (`AVATAR_DAILY_BUDGET_USD` overrides it). When the day is
  spent, each Clawd answers with prepared lines in its own voice.

## Consequences

- The previous components, their styles and their tests are gone; the browser suite is
  `e2e/office.spec.ts`, `e2e/a11y.spec.ts` and `e2e/perf.spec.ts`.
- The 3D world's interface text is French in both locales.
- The mascot is Anthropic's Clawd; its use on a public site is the owner's call.
