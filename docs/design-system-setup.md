**Purpose:** Copy-paste worksheet for Claude Design's **"Set up your design system"** form (Phase 1 of the Claude Design hand-off). This creates & publishes the site's design system; the pitch deck (`claude-design-prompt.md`) is generated afterward and inherits it. The design system is set up via a **form**, not a chat prompt.
**Status:** draft.

> **Order:** fill this form → review the generated UI kit → **Publish** → then create the deck (Phase 2). Step-by-step UI flow: `_deck-bundle/README.md`.

The Claude Design setup form has three parts: **Company name and blurb**, **examples (all optional)**, and **Any other notes?**. Paste the values below into the matching fields.

---

## Field 1 — "Company name and blurb (or name of design system)"

Paste:

```
rachidchabane — the personal site of Rachid Chabane, an AI engineer. An autonomously AI-maintained blog on cutting-edge AI engineering that doubles as a portfolio of his AI projects, with an always-present non-figurative chatbot avatar. Bilingual (French + English).
```

## Field 2 — "Provide examples of your design system and products (all optional)"

All optional. For this project (no front-end code exists yet — pre-build, brand from scratch):

- **Link code on GitHub** — *skip* (no front-end repo yet).
- **Link code from your computer** — *skip* (nothing to point at yet).
- **Upload a .fig file** — *skip* unless you have a Figma file.
- **Add fonts, logos and assets** — **upload the brand fonts here.** Claude Design renders with substitute web fonts otherwise (it shows a *"Missing brand fonts"* warning). The five variable TTFs — Fraunces (+italic), Inter (+italic), JetBrains Mono — are staged in `_deck-bundle/01-brand-system-upload/`; upload all five. A logo or inspiration screenshot is optional on top of that.

(Once the site has a front-end, you'd later point "Link code" at its frontend folder/repo to keep the system in sync — not now.)

## Field 3 — "Any other notes?"

This is the only field Claude Design *reads as brand direction*, so it is written to be fully self-contained — every reference is a concrete palette / typography / feel instruction, with no internal project names or shorthand. Paste verbatim:

```
Positioning: personal, practitioner voice — a serious, original, cutting-edge AI engineer; NOT a tech-startup template.

Quality bar / feel: premium, restrained, editorial. A warm-neutral base (warm off-white in light, warm graphite in dark — not pure white/black, not cool gray) with a SINGLE distinctive accent color that has character (NOT a generic SaaS blue; choose something with warmth and confidence). Full light AND dark registers, both first-class. Generous whitespace; soft, low-opacity shadows; subtle corner radius (~8px); no decorative gradients, no mesh blobs, no glow. Motion is sparing and tasteful — 3–4 signature moments (entrance, hover, avatar "thinking", section transition), each understated.

Palette: ~3 core colors + neutrals max. One accent only.

Typography (this is the intended direction — please use these unless you have a strong reason): display/headings/wordmark = "Fraunces" (a variable optical-size serif, editorial and distinctive); long-form body + UI = "Inter"; code = "JetBrains Mono". All three must render French diacritics and English cleanly — show FR and EN specimens.

Components needed: long-form article/reading layout, portfolio project card, FR/EN language switcher, tags/metadata, and a chatbot avatar mark with idle + "thinking"/active states.

HARD CONSTRAINT — the avatar must be distinctive and original and must NOT be a face, character, mascot, or any depiction of a living being. Non-figurative only: abstract generative mark, typographic/glyph identity, or geometric/particle motif. Propose a concept in that space.

Refuse: stock photos, generic icon sets, gradient hero, full-width candy buttons, skeuomorphic chrome, any face/mascot.

Brand mark is typographic (a wordmark in the display face), not a graphic logo.
```

> **Why these specifics:** the typography, the warm-neutral-base + single-accent approach, the dual light/dark registers, and the restrained-motion / soft-shadow feel are the **caliber benchmark** the owner is targeting (recorded internally in `D-007` as "premium / on par with the owner's other work"). They are spelled out here as concrete, self-contained instructions because Claude Design only sees what's in this field — it has no access to the reference project. The **exact accent color** and the **avatar concept** are deliberately left for Claude Design to *propose* within these constraints, so the site stands on its own rather than cloning an existing project.

---

## Notes on the setup

- Open the form from onboarding, or via the **organization picker (lower-left)** → org settings. Setting up a design system needs **admin permissions** and the system is **organization-scoped** (all in-org projects inherit it once published).
- The form's examples are **all optional** — a brand can be created from the blurb + notes alone. But providing at least one real source (code / `.fig` / a brand PDF / fonts) gives Claude more to extract from, so attach one when you actually have it.

## After submitting the form

1. Claude generates a **design-system UI kit** (palette, typography, components, layout). Review it — a quick way is to spin up a throwaway test project (e.g. a landing page) and see the kit applied.
2. Refine with the two iteration tools — **chat** (broad changes) and **inline comments** (click an element for a targeted change). Example asks: *"Strip the palette to ~3 core colors + neutrals with light + dark registers, no gradients."* · *"The body font must read at long-article length and render French diacritics — show FR + EN specimens."* · *"The avatar must be non-figurative — no face/creature, ever."* If extraction is weak, add or swap source assets.
3. **Flip the "Published" toggle on.** After that, every in-org project (the pitch deck next, the Stage-4 screens later, and the build) inherits this design system automatically. You can edit it later via org settings → **Open** → **Remix**.

Then proceed to Phase 2: the pitch deck in `claude-design-prompt.md`.
