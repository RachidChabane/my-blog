# my-blog brand & concept deck — step-by-step guide

Use this to drive Claude Design (claude.ai/design) to produce the site's brand system + concept deck from `../claude-design-prompt.md`. You do a brand-asset upload, a prompt paste, and an export.

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

## Step 2 — Upload the brand system (optional but helpful)
If you populated `01-brand-system-upload/`:
1. Drag any reference screenshot + `brand-spec.md` into the "fonts, logos, assets" zone.
2. Drag font files into the same zone.
3. Drop `design-tokens.css` into "Link code from your computer," if you have one.
4. Wait for extraction (2–5 min); review the UI kit.
If you have no assets yet, skip — Claude Design will propose a palette and type system from the prompt, which is the point of this step.

**Refinement lines you might need:**
- *"Strip the palette to ~3 core colors + neutrals, with explicit light and dark registers. No decorative gradients."*
- *"The body font must render French diacritics cleanly and read well at long-article length; show an FR and an EN specimen."*

## Step 3 — Create the deck project
Pick "Slide deck"; select the brand system (if you made one); choose "High fidelity" (not Wireframe).

## Step 4 — Send the prompt
Open `../claude-design-prompt.md`, copy everything between the `=== PROMPT ===` markers (or run the `awk` one-liner in that file), paste into the Claude Design chat. Attach anything in `02-deck-attachments/` via the paperclip. Send.

## Step 5 — Iterate

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

## Step 6 — Export
Export (upper-right) → PDF for sharing. Keep the palette/type/avatar concept — they feed Stage 4 (per-screen design, `../app-design-prompt.md`, generated after Stage 3 IA).

## Step 7 — Soundness check
Show the result to one person whose design taste you trust before locking the system; first reactions catch what you can no longer see.

## Troubleshooting
- **"The avatar keeps becoming a face."** Reply: *"Non-figurative only — no face, character, mascot, or living being, ever. Use an abstract/typographic/geometric/particle direction. This is a hard constraint."*
- **"Palette icon missing in the sidebar."** It's in the left rail of claude.ai; if absent, confirm subscription and refresh.
- **"It generated the deck in French."** Reply: *"Output the deck text in English; the brand must still support French + English content."* (Or the reverse, if you prefer a French deck.)
- **"PDF export cuts off the right edge."** Reply: *"Use a 16:9 export profile, A4/Letter landscape, 8 mm margins. Re-export."*
