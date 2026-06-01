**Purpose:** A self-contained prompt to paste into Claude Design (claude.ai/design) to produce the site's **brand & identity system + a short concept deck** — palette, typography, motion language, the non-figurative avatar concept, and sample layouts (home, post, portfolio, avatar). This is the client-facing/brand artifact in `/docs`; everything else is owner-only. Adapted from the standard pitch-deck scaffold because this project's Stage-2 need is brand definition, not an investor pitch.
**Status:** draft.

## How to use this file

1. Confirm Stage 1 is settled enough to brand against: `vision.md` (positioning), `D-006` (editorial scope), `D-007` (brand constraints).
2. Confirm the brand constraints below still hold — especially the **hard avatar constraint** (no face / no living being) and the **premium / `bayan`-caliber** quality bar.
3. Pick a working name/wordmark for the cover (the domain is `rachidchabane.*`, exact TLD TBD — `[OQ-11b]`).
4. Populate `_deck-bundle/01-brand-system-upload/` with any reference assets you already have (fonts you like, a screenshot of `bayan` for *caliber* reference — not to copy its style). Optional but improves the first pass.
5. Copy everything between the `=== PROMPT ===` markers into Claude Design (a "Slide deck" project, High fidelity). Iterate 2–4 rounds.
6. Carry the resulting palette + type + avatar concept into Stage 4 (per-screen design via `app-design-prompt.md`, after Stage 3 IA).

Extraction one-liner:

```bash
awk '/^=== PROMPT ===$/{flag=1; next} /^=== END PROMPT ===$/{flag=0} flag' docs/claude-design-prompt.md
```

The block below is the prompt itself, in English (instructions to the tool); the brand must support both **French and English** content (`D-004`).

---

```
=== PROMPT ===

You are designing the brand identity and a short concept deck for a personal website. Produce a brand system (palette, typography, motion language, a non-figurative avatar mark) and ~12 concept slides that show it applied. Output in English; the site itself is bilingual French/English, so the type system must handle both.

## What this is, in two sentences
This is the personal site of Rachid Chabane, an AI engineer: an autonomously AI-maintained blog on cutting-edge AI engineering (agentic AI, agentic coding, frontier and open-source LLMs) that doubles as a portfolio of his AI projects. It is not a generic dev blog — it writes, fact-checks, and publishes itself with no human in the loop, and a chatbot avatar answers visitor questions grounded only in the site's own content.

## Audience
The site is portfolio-led: its primary readers are people evaluating Rachid's AI-engineering capability (recruiters, collaborators, clients) and practitioners who read for sharp, accurate takes on agentic AI. The brand must read as "serious, original, cutting-edge AI engineer," not "tech-startup template."
After viewing, the audience should conclude: this person operates at the frontier of AI engineering and has the taste to match.

## Quality bar (non-negotiable)
Premium and polished, matching the *caliber and overall feel* of the reference project "bayan" — NOT copying its visual style. Visually engaging, with tasteful scroll-driven motion and micro-interactions (assume a motion/scroll-animation library is available). Restraint over decoration; every effect earns its place.

## Tone and voice
First-person, practitioner, confident but not boastful; precise, technical-literate, no marketing fluff. The wordmark is typographic (no logo graphic). Avoid buzzword soup ("revolutionary", "seamless", "next-gen", "empower").

## The hard avatar constraint
The site has an always-present chatbot avatar. Its visual identity must be **distinctive and original** and must **NOT be a face, character, mascot, or any depiction of a living being** — this is absolute. Explore non-figurative directions: an abstract generative mark, a typographic/glyph identity, a geometric or particle/field motif, a reactive shape that animates while "thinking." Propose 2–3 distinct concepts.

## Narrative arc (~12 slides)
1. Cover. Typographic wordmark for the site (working name on the `rachidchabane.*` domain) at full size — no graphic logo. Establish the type and palette in one frame.
2. The idea. The site writes and maintains itself; one sentence, set typographically.
3. Positioning. Portfolio-led personal hub for a cutting-edge AI engineer (paraphrase `vision.md`).
4. Voice & tone. The verbal identity, shown as a few sample headline/standfirst pairs (EN + FR).
5. Palette. Full palette with hex codes, light + dark registers. Restrained (≈3 core colors + neutrals).
6. Typography. Display + body + mono stack, with FR and EN specimens (accents, ligatures). Name the families.
7. Motion language. How scroll + micro-interactions feel — describe 3–4 signature motions (entrance, hover, "avatar thinking", section transition).
8. The avatar — concept A. A non-figurative identity (no face/being). Show idle + active states.
9. The avatar — concept B. A second distinct non-figurative direction.
10. Home page concept. Hero + latest posts + portfolio entry points, applying the system.
11. Post page concept. A bilingual article layout: title, metadata, sources, language switcher, readable measure.
12. Portfolio + avatar-in-context. A project showcase card grid and the avatar docked/active on a page.

## Visual direction
- Palette: restrained, ~3 core colors + neutrals, with explicit light and dark registers and hex codes. No gradients-as-decoration, no mesh blobs.
- Typography: a distinctive display face + a highly readable body face + a mono for code; all must render French diacritics and English cleanly. Name real font families.
- Brand mark: typographic wordmark, not a graphic logo.
- Avatar: non-figurative only (see hard constraint).
- Refuse explicitly: stock photos, generic icon sets, skeuomorphic chrome, tech-startup gradient hero, full-width candy buttons, any face/mascot.
- Density: generous whitespace, editorial rather than dashboard-dense.

## Output format
~12 slides, English, 16:9, high fidelity. Include short speaker notes (≤ 60 words/slide) describing the design intent of each frame. Export-ready as PDF.

=== END PROMPT ===
```

## Notes on iterating

The first pass will need 2–4 rounds. Likely pushbacks, in the order Claude Design tends to drift:

### Pushback A — the avatar drifted into a face/creature (most important)
> The avatar on slides 8–9 depicts a face/creature. That violates a hard constraint: the avatar must NOT be a face, character, mascot, or any living being. Replace with purely non-figurative concepts — abstract generative mark, typographic glyph, geometric/particle field, or a reactive "thinking" shape. Show idle and active states.

### Pushback B — generic SaaS / tech-startup register
> The register reads as tech-startup, not a serious AI engineer's personal site. Remove gradient hero, coloured shadows, generic icons, candy buttons. Match the premium, restrained caliber referenced (bayan-level), editorial whitespace, motion used sparingly.

### Pushback C — fonts swapped for system defaults
> You substituted system fonts. Restore the specified display/body/mono families and show French diacritics + English specimens. The body face is for reading long articles; the display face is for titles and the wordmark only.

### Pushback D — a graphic logo appeared
> Remove the graphic logo. The brand is typographic — the cover is the bare wordmark in the display family at full size, no graphic element.

### Pushback E — motion is decorative, not signature
> The motion reads as generic fade-ins. Define 3–4 *signature* motions tied to the brand (entrance, hover, avatar "thinking", section transition) and show them as annotated frames.
