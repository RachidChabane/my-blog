# my-blog — Claude Design guide: design system first, then pitch deck

This walks you through Claude Design (claude.ai/design) in the order it's meant to be used:

**Phase 1 — create & *publish* a design system** (palette, typography, components, layout, motion, the non-figurative avatar mark) → **Phase 2 — create a pitch deck that *inherits* it.**

Both prompts live in `../claude-design-prompt.md` (Prompt 1 = design system, Prompt 2 = pitch deck). The brand constraints are in `../decisions/D-007-brand-quality-bar-avatar-constraint.md`.

```
docs/_deck-bundle/
├── README.md                       ← you are here
├── 01-brand-system-upload/         ← optional seed assets (fonts you like, a bayan caliber-reference screenshot)
└── 02-deck-attachments/            ← optional files the deck should reference (usually empty)
```

## How the design system fits (read this first)

Claude Design is built around a **design system** — a reusable kit (palette, typography, components, layout patterns) that you set up and **"Publish" once**, after which **every project you create inherits it automatically**. So the right order is *design system first, deck second*.

Normally you'd build the design system by uploading an **existing** brand. You don't have one yet — you want Claude Design to *propose* it. So Phase 1 below **generates** the brand (Prompt 1), you publish it, and Phase 2 builds the deck on top.

End-to-end: ~90–120 minutes, most of it iterating Phase 1.

---

## Step 0 — Prerequisites
Active Claude Pro / Max / Team / Enterprise subscription, a browser, a local copy of this folder.

## Step 1 — Open Claude Design
Go to claude.ai/design; pick/create your org; complete onboarding.

## Step 2 — (Optional) seed assets
If you have anything that hints at the direction — fonts you like, a `bayan` screenshot for *caliber* reference (not to copy) — keep `01-brand-system-upload/` handy to drag in during Phase 1. You can skip this; Prompt 1 will propose the brand regardless.

---

# Phase 1 — Create & publish the design system

## Step 3 — Generate the brand direction
Create a project (a "Design" / prototype project is fine), paste **Prompt 1** from `../claude-design-prompt.md` (the `=== DESIGN-SYSTEM PROMPT ===` block — or run its `awk` one-liner), and send. Attach any seed assets from `01-brand-system-upload/`.

## Step 4 — Iterate the brand
Refine until the palette, type, motion, and the **non-figurative avatar** are right. Keep these pushback lines ready (full set in `../claude-design-prompt.md` § Notes on iterating):

| Tool | Use it for | How |
|---|---|---|
| Chat (left panel) | Big changes — rework palette, type, avatar. | Type a sentence and send. |
| Inline comment | Targeted fix on one element. | Click it, comment. |
| Direct text edit | Small wording/specimen tweaks. | Click in, type. |
| Adjustment knobs | Spacing, color, scale. | Sliders, then "apply across all." |

- **Avatar drifted into a face/creature** — the #1 thing to catch; the no-face/no-living-being constraint is **absolute**.
- **Generic SaaS register** — push toward the premium, restrained, `bayan`-caliber feel.
- **Fonts swapped to system defaults** / **a graphic logo appeared** / **motion is generic, not signature**.

## Step 5 — Codify & PUBLISH the design system  ← the key step
Turn the chosen direction into your org's reusable design system so everything later inherits it:
1. From org settings (or onboarding), **set up the design system**, seeding it with the Phase-1 output + any assets from `01-brand-system-upload/`.
2. Review the generated UI kit (palette, typography, components, layout). Refine, e.g. *"Strip the palette to ~3 core colors + neutrals, light + dark registers, no decorative gradients"* and *"The body font must render French diacritics and read at long-article length — show FR + EN specimens."*
3. **Flip the "Published" toggle on.** After this, every new project inherits the brand automatically — no re-setup.

This published design system — not any PDF — is the durable output. It's what Phase 2, the Stage-4 screens (`../app-design-prompt.md`), and ultimately the build all inherit.

---

# Phase 2 — Create the pitch deck (inherits the design system)

## Step 6 — Create the deck project & send Prompt 2
Create a new **"Slide deck"** project, **High fidelity** — it now inherits your published design system. Paste **Prompt 2** from `../claude-design-prompt.md` (the `=== PITCH-DECK PROMPT ===` block), attach anything in `02-deck-attachments/`, and send.

## Step 7 — Iterate the deck
Same tools as Step 4. The deck-specific pushback to watch:
- **The deck redefined the brand instead of inheriting it** — tell it to apply the published design system, not invent new styling.
- Jargon / off-tone slides; slide count creep.

## Step 8 — Export
Export (upper-right) → PDF for sharing (PPTX / HTML / Canva also available).

## Step 9 — Soundness check
Show the result to one person whose design taste you trust before locking it in; first reactions catch what you can no longer see.

---

## Troubleshooting
- **"The avatar keeps becoming a face."** Reply: *"Non-figurative only — no face, character, mascot, or living being, ever. Use an abstract/typographic/geometric/particle direction. Hard constraint."*
- **"The deck isn't using my design system."** Confirm the design system is **Published** (Step 5) and that the deck project was created *after* publishing; reply: *"Apply my published design system — same palette, type, components."*
- **"Palette icon missing in the sidebar."** It's in the left rail of claude.ai; if absent, confirm subscription and refresh.
- **"It generated in the wrong language."** Reply: *"Output text in English; the brand must still support French + English content."*
- **"PDF export cuts off the right edge."** Reply: *"Use a 16:9 export profile, A4/Letter landscape, 8 mm margins. Re-export."*
