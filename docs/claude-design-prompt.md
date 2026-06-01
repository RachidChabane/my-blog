**Purpose:** A paste-ready Claude Design chat prompt that generates a **pitch / showcase deck** which *inherits* the site's published design system. This is **Phase 2** — run it only after the design system is created and **Published** via the setup form (see `design-system-setup.md`).
**Status:** draft.

> **Order matters.** Phase 1 = create & publish the design system through Claude Design's **"Set up your design system"** form (worksheet: `design-system-setup.md`). Phase 2 (this file) = create a "Slide deck" project — which now inherits the published system — and paste the prompt below. Full UI flow: `_deck-bundle/README.md`.

## How to use this file

1. Confirm the design system from `design-system-setup.md` is created and **Published** in Claude Design.
2. Create a new **"Slide deck"** project (it inherits the published design system), High fidelity.
3. Paste the prompt between the sentinels (or `awk`-extract it), iterate, export PDF.

Extraction one-liner:

```bash
awk '/^=== PROMPT ===$/{f=1;next} /^=== END PROMPT ===$/{f=0} f' docs/claude-design-prompt.md
```

The prompt is in English; the brand supports French + English content (`D-004`).

---

```
=== PROMPT ===

Create a pitch/showcase deck for the personal site described below. USE MY PUBLISHED DESIGN SYSTEM — apply its palette, typography, components, and motion; do NOT redefine palette or typography from scratch. Output ~12 slides in English, 16:9, high fidelity, with short speaker notes (≤ 60 words/slide). Export-ready as PDF.

## What this is, in two sentences
The personal site of Rachid Chabane, an AI engineer: an autonomously AI-maintained blog on cutting-edge AI engineering that doubles as a portfolio of his AI projects. It is not a generic dev blog — it writes, fact-checks, and publishes itself with no human in the loop, and a chatbot avatar answers visitor questions grounded only in the site's own content.

## Audience & purpose
Portfolio-led: the deck is for people evaluating Rachid's AI-engineering capability (recruiters, collaborators, clients) and for sharing the project. After viewing, the audience should conclude: this person operates at the frontier of AI engineering and has the taste to match.

## Tone
First-person, practitioner, confident not boastful; precise and technical-literate; no marketing fluff. Typographic wordmark, no graphic logo.

## Slides (~12)
1. Cover — wordmark (working name on the rachidchabane.* domain) at full size, on the brand system.
2. The idea — the site writes and maintains itself; one sentence, set typographically.
3. Positioning — portfolio-led personal hub for a cutting-edge AI engineer (paraphrase vision.md).
4. How it works — the autonomous pipeline: search → topic → draft (FR+EN) → automated review + fact-check gate → auto-publish (cite content-pipeline.md; M-3, M-4).
5. Trust by design — why a self-publishing site is credible: the mandatory quality gate (M-4) and the avatar's "I don't know" gate (M-10, FR-E2).
6. The avatar — the non-figurative chatbot identity from the design system, shown in context (idle + active).
7–9. Portfolio highlights — one slide each for the flagships (e.g. ijtihad-engine, bayan, sternaway/quality-gate, claude-plan-execute): what it is, the engineering depth, the result.
10. Bilingual & open — FR/EN, cutting-edge AI-engineering scope (D-006).
11. Roadmap — MVP / 6 months (01-12-2026) / 18 months (01-06-2028), paraphrased from vision.md.
12. Contact / the ask — how to reach Rachid; the rachidchabane.* domain.

## Constraints
Inherit the design system for all visuals. Refuse: stock photos, generic icons, gradient hero, candy buttons, any face/mascot. Keep the avatar non-figurative.

=== END PROMPT ===
```

## Notes on iterating

First passes need 2–3 rounds. Likely pushbacks:

### Pushback A — the deck redefined the brand instead of inheriting it (most common)
> The deck is using its own colors/fonts. Apply my published design system instead — same palette, typography, components, and motion. Do not invent new brand styling.

### Pushback B — generic SaaS / tech-startup register
> The register reads as tech-startup, not a serious AI engineer. Remove gradient hero, coloured shadows, generic icons, candy buttons. Match the premium, restrained, `bayan`-caliber feel from the design system; editorial whitespace; motion used sparingly.

### Pushback C — the avatar shown as a face/creature
> The avatar must stay non-figurative — no face, character, mascot, or living being. Use the avatar mark from the published design system.

### Pushback D — a graphic logo appeared
> Remove the graphic logo. The brand is typographic — the wordmark in the display family, no graphic element.

### Pushback E — jargon / slide creep
> Keep it to ~12 slides and the audience above; cut engineering jargon a recruiter wouldn't parse.

> The **design-system** generation, palette, typography, motion, and the **non-figurative avatar** concept all live in Phase 1 (`design-system-setup.md`) — not here. This file only produces the deck that inherits them.
