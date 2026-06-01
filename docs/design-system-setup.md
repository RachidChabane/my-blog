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
- **Add fonts, logos and assets** — *optional*: attach any fonts you already favor, and — if you want the "bayan caliber" benchmark in the notes to actually land — a **screenshot of `bayan`** (Claude has no idea what bayan is otherwise). Inspiration screenshots are fine here.

(Once the site has a front-end, you'd later point "Link code" at its frontend folder/repo to keep the system in sync — not now.)

## Field 3 — "Any other notes?"

Paste (brand direction; condensed from `D-007`, `vision.md`, `D-006`):

```
Positioning: personal, practitioner voice — a serious, original, cutting-edge AI engineer; NOT a tech-startup template. Quality bar: premium and polished — match the CALIBER and feel of the "bayan" project (not its visual style); tasteful scroll-driven motion, used sparingly.

Palette: restrained — ~3 core colors + neutrals, with explicit light AND dark registers; no decorative gradients or mesh blobs.

Typography: a distinctive display face (titles + wordmark) + a highly readable long-form body face (articles) + a mono (code). Must render French diacritics and English cleanly; show FR and EN specimens.

Components needed: long-form article/reading layout, portfolio project card, FR/EN language switcher, tags/metadata, and a chatbot avatar mark with idle + "thinking"/active states.

Motion: 3–4 signature motions (entrance, hover, avatar "thinking", section transition), used sparingly.

HARD CONSTRAINT — the avatar must be distinctive and original and must NOT be a face, character, mascot, or any depiction of a living being. Non-figurative only: abstract generative mark, typographic/glyph identity, or geometric/particle motif.

Refuse: stock photos, generic icon sets, gradient hero, full-width candy buttons, skeuomorphic chrome, any face/mascot.

Brand mark is typographic (a wordmark), not a graphic logo.
```

---

## Notes on the setup

- Open the form from onboarding, or via the **organization picker (lower-left)** → org settings. Setting up a design system needs **admin permissions** and the system is **organization-scoped** (all in-org projects inherit it once published).
- The form's examples are **all optional** — a brand can be created from the blurb + notes alone. But providing at least one real source (code / `.fig` / a brand PDF / fonts) gives Claude more to extract from, so attach one when you actually have it.

## After submitting the form

1. Claude generates a **design-system UI kit** (palette, typography, components, layout). Review it — a quick way is to spin up a throwaway test project (e.g. a landing page) and see the kit applied.
2. Refine with the two iteration tools — **chat** (broad changes) and **inline comments** (click an element for a targeted change). Example asks: *"Strip the palette to ~3 core colors + neutrals with light + dark registers, no gradients."* · *"The body font must read at long-article length and render French diacritics — show FR + EN specimens."* · *"The avatar must be non-figurative — no face/creature, ever."* If extraction is weak, add or swap source assets.
3. **Flip the "Published" toggle on.** After that, every in-org project (the pitch deck next, the Stage-4 screens later, and the build) inherits this design system automatically. You can edit it later via org settings → **Open** → **Remix**.

Then proceed to Phase 2: the pitch deck in `claude-design-prompt.md`.
