**Purpose:** Two paste-ready Claude Design (claude.ai/design) prompts, **in order**: **(1)** generate & publish the site's **design system** (palette, typography, components, layout, motion, the non-figurative avatar mark); **(2)** generate a **pitch/showcase deck** that *inherits* that published design system. This is the brand/client-facing artifact in `/docs`; everything else is owner-only.
**Status:** draft.

> **Why two prompts, in this order.** Claude Design is built around a *design system* you set up and **Publish** once; every project created afterward inherits it automatically. So you create the design system **first** (Prompt 1), publish it, and **then** build the deck (Prompt 2) on top of it. Because this site has **no brand yet**, Prompt 1 asks Claude Design to *propose* the brand rather than extract it from existing assets. Step-by-step UI flow: `_deck-bundle/README.md`.

## How to use this file

1. Confirm Stage 1 is settled enough to brand against: `vision.md`, `D-006` (editorial scope), `D-007` (brand constraints — premium/`bayan`-caliber, **non-figurative avatar**, personal practitioner voice, bilingual FR/EN).
2. Pick a working name/wordmark (domain `rachidchabane.*`, TLD TBD — `[OQ-11b]`).
3. **Phase 1 — design system:** paste **Prompt 1** into a Claude Design project, iterate, then **codify the result into your org's design system and flip "Published" on** (see `_deck-bundle/README.md` Steps 3–5).
4. **Phase 2 — deck:** create a new "Slide deck" project (it now inherits the published system), paste **Prompt 2**, iterate, export.

Extraction one-liners:

```bash
# Prompt 1 — design system
awk '/^=== DESIGN-SYSTEM PROMPT ===$/{f=1;next} /^=== END DESIGN-SYSTEM PROMPT ===$/{f=0} f' docs/claude-design-prompt.md
# Prompt 2 — pitch deck
awk '/^=== PITCH-DECK PROMPT ===$/{f=1;next} /^=== END PITCH-DECK PROMPT ===$/{f=0} f' docs/claude-design-prompt.md
```

Both prompts are in English (instructions to the tool); the brand must support **French + English** content (`D-004`).

---

## Prompt 1 — Design system (run first, then Publish)

```
=== DESIGN-SYSTEM PROMPT ===

You are creating a reusable DESIGN SYSTEM for a personal website (it will be published so every later project — a pitch deck, then individual screens — inherits it). I do not have an existing brand; propose one. Output a reviewable brand/UI-kit board, in English; the site is bilingual French/English, so the type system must render both.

## What the site is, in two sentences
This is the personal site of Rachid Chabane, an AI engineer: an autonomously AI-maintained blog on cutting-edge AI engineering (agentic AI, agentic coding, frontier and open-source LLMs) that doubles as a portfolio of his AI projects. It writes, fact-checks, and publishes itself with no human in the loop, and a chatbot avatar answers visitor questions grounded only in the site's own content.

## Brand intent (non-negotiable)
- Positioning: personal, practitioner voice — a serious, original, cutting-edge AI engineer. Not "tech-startup template."
- Quality bar: premium and polished, matching the *caliber and overall feel* of the reference project "bayan" — NOT copying its visual style. Assume a scroll-animation/motion library is available; motion is tasteful and earns its place.
- Verbal tone: first-person, precise, technical-literate, confident, no marketing fluff ("revolutionary", "seamless", "next-gen").

## Produce a design system with these parts
1. **Palette.** ~3 core colors + neutrals, with explicit light AND dark registers, all with hex codes. No decorative gradients, no mesh blobs.
2. **Typography.** A distinctive display face + a highly readable long-form body face + a mono for code. Name real font families. Show FR and EN specimens (accents, diacritics, ligatures). The body face must read well at article length.
3. **Components.** Buttons, cards, navigation, tags/metadata, a **language switcher (FR/EN)**, an article/long-form reading layout, a portfolio project card, and the **avatar mark** (idle + active/"thinking" states).
4. **Layout patterns.** Spacing scale, grid, page structure — editorial and generous, not dashboard-dense.
5. **Motion language.** 3–4 signature motions (entrance, hover, avatar "thinking", section transition), described and shown as annotated frames.
6. **The avatar — HARD CONSTRAINT.** The always-present chatbot avatar must be **distinctive and original** and must **NOT be a face, character, mascot, or any depiction of a living being** — absolute. Explore non-figurative directions only (abstract generative mark, typographic/glyph identity, geometric or particle/field motif, a reactive shape that animates while thinking). Propose 2–3 distinct concepts with idle + active states.

## Refuse explicitly
Stock photos, generic icon sets, skeuomorphic chrome, tech-startup gradient hero, full-width candy buttons, any face/mascot/living-being avatar, decorative gradients.

## Output
A design-system board: palette swatches with hex, type specimens (FR + EN), the component set, layout/spacing rules, the motion notes, and the 2–3 avatar concepts. I will review it, refine, then publish it as my design system so later projects inherit it.

=== END DESIGN-SYSTEM PROMPT ===
```

**After Prompt 1:** review the board, refine (use the pushback lines below), pick one avatar direction, then **codify it into your org design system and flip "Published" on** (`_deck-bundle/README.md` Step 5). Only then run Prompt 2.

---

## Prompt 2 — Pitch / showcase deck (run after the design system is published)

```
=== PITCH-DECK PROMPT ===

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

=== END PITCH-DECK PROMPT ===
```

## Notes on iterating

First passes need 2–4 rounds. Pushback lines, in the order Claude Design tends to drift:

### Pushback A — the avatar drifted into a face/creature (most important; Prompt 1)
> The avatar depicts a face/creature. That violates a hard constraint: it must NOT be a face, character, mascot, or any living being. Replace with purely non-figurative concepts (abstract generative mark, typographic glyph, geometric/particle field, or a reactive "thinking" shape). Show idle and active states.

### Pushback B — generic SaaS / tech-startup register
> The register reads as tech-startup, not a serious AI engineer's personal site. Remove gradient hero, coloured shadows, generic icons, candy buttons. Match the premium, restrained, `bayan`-caliber feel; editorial whitespace; motion used sparingly.

### Pushback C — fonts swapped for system defaults
> You substituted system fonts. Restore the specified display/body/mono families and show French diacritics + English specimens. The body face is for long articles; the display face is for titles and the wordmark only.

### Pushback D — a graphic logo appeared
> Remove the graphic logo. The brand is typographic — the wordmark in the display family, no graphic element.

### Pushback E — the deck redefined the brand instead of inheriting it (Prompt 2)
> The deck is using its own colors/fonts. Apply my published design system instead — same palette, typography, components, and motion. Do not invent new brand styling.

### Pushback F — motion is decorative, not signature (Prompt 1)
> The motion reads as generic fade-ins. Define 3–4 *signature* motions tied to the brand (entrance, hover, avatar "thinking", section transition) and show them as annotated frames.
