# my-blog — Claude Design guide: design system first, then pitch deck

This walks you through Claude Design (claude.ai/design) in the order it's meant to be used:

**Phase 1 — create & *publish* a design system** (via Claude Design's **"Set up your design system"** form) → **Phase 2 — create a pitch deck that *inherits* it** (a chat prompt).

- Phase 1 inputs: `../design-system-setup.md` (a worksheet of values to paste into the setup form).
- Phase 2 input: `../claude-design-prompt.md` (the deck chat prompt).
- Brand constraints: `../decisions/D-007-brand-quality-bar-avatar-constraint.md`.

```
docs/_deck-bundle/
├── README.md                       ← you are here
├── 01-brand-system-upload/         ← brand fonts to upload (Fraunces / Inter / JetBrains Mono variable TTFs + OFL licenses)
└── 02-deck-attachments/            ← optional files the deck should reference (usually empty)
```

## How the design system fits (read this first)

Claude Design is built around a **design system** — a reusable kit (palette, typography, components, layout). You create it by filling a **setup form** ("Set up your design system"): a *Company name and blurb*, optional examples (GitHub repo / local frontend folder / `.fig` / fonts-logos-assets), and an *Any other notes?* brand-direction field. Claude generates a UI kit from that; you review, refine, and **Publish** it — after which **every project you create inherits it automatically**. So: design system (form) first, deck second.

The form's examples are **all optional** — this site has no front-end yet, so you'll create the system from the blurb + notes alone (plus any optional inspiration assets). The worksheet `../design-system-setup.md` has the exact text to paste.

End-to-end: ~90–120 minutes, most of it iterating Phase 1.

---

## Step 0 — Prerequisites
Active Claude Pro / Max / Team / Enterprise subscription, a browser, a local copy of this folder.

## Step 1 — Open Claude Design
Go to claude.ai/design; pick/create your org; complete onboarding.

---

# Phase 1 — Create & publish the design system (via the form)

## Step 2 — Open "Set up your design system"
From onboarding, or via the **organization picker (lower-left)** → org settings, open the **"Set up your design system"** form. Setting up a design system needs **admin permissions**, and the system is **organization-scoped** (every in-org project inherits it once published).

## Step 3 — Fill the form from the worksheet
Open `../design-system-setup.md` and paste its values into the matching fields:
- **"Company name and blurb (or name of design system)"** ← Field 1.
- **"Provide examples … (all optional)"** ← per the worksheet's checklist. For this site: skip the code/`.fig` options (no front-end yet), but **do upload the fonts** — Claude Design renders with substitute web fonts otherwise (a *"Missing brand fonts"* warning). The five variable TTFs (Fraunces +italic, Inter +italic, JetBrains Mono) are staged in `01-brand-system-upload/`; upload all five via "Add fonts, logos and assets". A logo or inspiration screenshot is optional on top.
- **"Any other notes?"** ← Field 3 (the brand direction, incl. the non-figurative-avatar hard constraint).
Submit.

## Step 4 — Review & refine the generated UI kit
Claude generates a design-system kit (palette, typography, components, layout). Refine with Claude Design's two iteration tools: **chat** (broad changes to the overall design) and **inline comments** (click a specific element on the canvas for a targeted change). A good way to validate is to spin up a throwaway test project (a landing page) and see the kit applied. Keep these pushbacks ready (full set in `../design-system-setup.md` and `../claude-design-prompt.md`):
- **Avatar drifted into a face/creature** — #1 to catch; non-figurative is **absolute**.
- **Generic SaaS register** — push toward the premium, restrained, editorial feel (warm-neutral base, single accent, generous whitespace, sparing motion).
- **Fonts swapped to system defaults** / **a graphic logo appeared** / **palette has too many colors / gradients**.

## Step 5 — PUBLISH the design system  ← the key step
**Flip the "Published" toggle on.** After this, every new in-org project (the deck next, the Stage-4 screens later, the build) inherits the brand automatically. This published system — not any PDF — is the durable output. You can edit it later via org settings → **Open** → **Remix** (a chat interface on the design system itself).

---

# Phase 2 — Create the pitch deck (inherits the design system)

## Step 6 — Create the deck project & send the prompt
Create a **new project** and **describe the deck** — Claude Design is prompt-driven, so there's no fixed "deck type" to pick; the project inherits your published design system automatically. Open `../claude-design-prompt.md`, copy the prompt between the `=== PROMPT ===` markers (or run its `awk` one-liner), add any context from `02-deck-attachments/`, and send. The deck renders as interactive HTML on the canvas.

## Step 7 — Iterate the deck
Same two tools — **chat** (broad changes) and **inline comments** (targeted, click an element). Deck-specific pushback:
- **The deck redefined the brand instead of inheriting it** — tell it to apply the published design system, not invent styling.
- Jargon / off-tone slides; slide-count creep.

## Step 8 — Export
Export (upper-right). Options: **PDF** (sharing), **PPTX**, **standalone HTML** (best for the interactive/animated version), **Send to Canva**, **Download as .zip**. (Separately, **Handoff to Claude Code** is the export you'll use later for the *site's screens/build*, not the deck — it packages designs for Claude Code to implement.)

## Step 9 — Soundness check
Show the result to one person whose design taste you trust before locking it in.

---

## Troubleshooting
- **"The avatar keeps becoming a face."** Reply: *"Non-figurative only — no face, character, mascot, or living being, ever. Use an abstract/typographic/geometric/particle direction. Hard constraint."*
- **"The deck isn't using my design system."** Confirm the system is **Published** (Step 5) and the deck project was created *after* publishing; reply: *"Apply my published design system — same palette, type, components."*
- **"Where's the design-system setup?"** Onboarding flow, or org settings → design system. If absent, confirm subscription and refresh.
- **"It generated in the wrong language."** Reply: *"Output text in English; the brand must still support French + English content."*
- **"PDF export cuts off the right edge."** Reply: *"Use a 16:9 export profile, A4/Letter landscape, 8 mm margins. Re-export."*
