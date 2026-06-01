# my-blog brand & concept deck — step-by-step guide

Use this to drive Claude Design (claude.ai/design) to produce the site's brand direction from `../claude-design-prompt.md`, then lock it into a **published design system** that later projects inherit. The flow: generate the concept → iterate → codify & publish the design system → export.

```
docs/_deck-bundle/
├── README.md                       ← you are here
├── 01-brand-system-upload/         ← Step 2 uses this whole folder (populate it)
│   ├── (optional) bayan-reference.png   ← a screenshot of `bayan` for CALIBER reference only — do NOT copy its style
│   ├── (optional) fonts/                ← any display/body/mono font files you already favor (.ttf/.otf)
│   ├── (optional) brand-spec.md         ← any brand notes you want to pin
│   └── (optional) design-tokens.css     ← if you already have color/spacing tokens
└── 02-deck-attachments/            ← Step 4: anything the deck should reference (usually empty here)
```

This folder ships mostly empty on purpose — the brand is being *defined* in this step, so there are few pre-existing assets. The constraints live in the prompt (`../claude-design-prompt.md`) and in `../decisions/D-007-brand-quality-bar-avatar-constraint.md`.

End-to-end: ~60–90 minutes, most of it iterating.

## Step 0 — Prerequisites
Active Claude Pro / Max / Team / Enterprise subscription, a browser, and a local copy of this folder.

## Step 1 — Open Claude Design
Go to claude.ai/design; pick/create your org; complete onboarding.

## How the design system fits (read this first)

Claude Design is built around a **design system** (a reusable UI kit: palette, typography, components, layout patterns) that you **set up and "Publish" once**, after which every project you create — decks, prototypes, screens — **inherits it automatically**. That's the intended order: *design system first, projects second.*

But that model assumes you already **have** a brand to extract from assets. You don't yet — you want Claude Design to *propose* the palette and avatar. So for a from-scratch brand the practical order inverts the first two moves:

1. **Generate the brand direction** as a concept project (the prompt in `../claude-design-prompt.md`) — Claude proposes palette, type, motion, and the non-figurative avatar.
2. **Codify the chosen direction into a design system and Publish it** — so the Stage-4 per-screen work (home, post, portfolio, avatar) inherits it automatically.

(If you already had a brand, you'd do step 2 first and skip step 1.)

## Step 2 — Seed any assets you have (optional)
If you populated `01-brand-system-upload/` (e.g. a `bayan` caliber-reference screenshot, fonts you like):
1. Have them ready to drag into the "fonts, logos, assets" zone when you set up the design system.
2. These *seed* the direction — they don't replace the concept generation, since you're defining a new brand.

If you have no assets, that's fine — the concept prompt drives the palette/type proposal.

## Step 3 — Create the concept project & send the prompt
Pick "Slide deck", **High fidelity** (not Wireframe). Open `../claude-design-prompt.md`, copy everything between the `=== PROMPT ===` markers (or run the `awk` one-liner in that file), paste into the chat, attach anything in `02-deck-attachments/`, and send.

## Step 4 — Iterate

| Tool | Use it for | How |
|---|---|---|
| Chat (left panel) | Structural changes — rewrite/reorder/add/remove a slide. | Type a sentence and send. |
| Inline comment | Targeted fix on one element. | Click the element, type a comment. |
| Direct text edit | Typos, small wording. | Click into text and type. |
| Adjustment knobs | Spacing, color, scale. | Use sliders, then "apply across all slides." |

Have these ready (from `../claude-design-prompt.md` § Notes on iterating):
- **The avatar drifted into a face/creature** — the #1 thing to catch; the no-face/no-living-being constraint is absolute.
- **Generic SaaS register** — push back toward the premium, restrained, `bayan`-caliber feel.
- **Fonts swapped to system defaults** / **a graphic logo appeared** / **motion is generic, not signature**.

## Step 5 — Codify & publish the design system
Once the concept is right, turn the chosen direction into a reusable, published design system so everything you build next inherits it:
1. From your org settings (or onboarding), set up the **design system**, seeding it with the concept output + any assets from `01-brand-system-upload/`.
2. Review the generated UI kit (palette, typography, components, layout); refine with lines like *"Strip the palette to ~3 core colors + neutrals, light + dark registers, no decorative gradients"* and *"The body font must render French diacritics and read at long-article length — show FR + EN specimens."*
3. **Flip the "Published" toggle on.** After that, any new project (including the Stage-4 screens) inherits the brand automatically — no manual re-setup.

This published design system is the real hand-off to Stage 4 (`../app-design-prompt.md`, after the Stage 3 IA) and, ultimately, to the build.

## Step 6 — Export
Export (upper-right) → PDF for sharing. The lasting output is the **published design system** (Step 5), not just the deck PDF — that's what Stage 4 and the build inherit.

## Step 7 — Soundness check
Show the result to one person whose design taste you trust before locking the system; first reactions catch what you can no longer see.

## Troubleshooting
- **"The avatar keeps becoming a face."** Reply: *"Non-figurative only — no face, character, mascot, or living being, ever. Use an abstract/typographic/geometric/particle direction. This is a hard constraint."*
- **"Palette icon missing in the sidebar."** It's in the left rail of claude.ai; if absent, confirm subscription and refresh.
- **"It generated the deck in French."** Reply: *"Output the deck text in English; the brand must still support French + English content."* (Or the reverse, if you prefer a French deck.)
- **"PDF export cuts off the right edge."** Reply: *"Use a 16:9 export profile, A4/Letter landscape, 8 mm margins. Re-export."*
