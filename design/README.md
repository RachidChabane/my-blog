# design/ — Claude Design hand-off (Stage 4 output)

The **"Handoff to Claude Code"** export from Claude Design (claude.ai/design), unpacked. This is the visual source of truth the build (Stage 5) implements. Fetched 02-06-2026 from the handoff link.

## What's here

```
design/screens/my-blog-screens/
├── README.md                       ← Claude Design's own "coding agents read this first" note
├── chats/chat1.md                  ← the full design conversation (intent lives here)
└── project/
    ├── colors_and_type.css         ← ★ TOKEN SOURCE OF TRUTH (palette, type, space, radius, motion)
    ├── *.html                      ← the 7 screens as standalone HTML prototypes
    ├── *.jsx                       ← the same screens as React components (reference only)
    ├── fonts/                      ← self-hosted variable TTFs (Fraunces, Inter, JetBrains Mono)
    ├── assets/  ·  screenshots/    ← exported imagery
```

Seven screens: **Home (Accueil), Article, Articles (index), Projets (portfolio), Projet (detail), À propos (about), Avatar (overlay).**

## How the build should use this

- **`colors_and_type.css` is the token source of truth.** It already matches the pinned design system: cool-gray neutrals (`--bg` `#FAFAFB` light / `#0E0F13` dark), the single electric-violet accent (`--accent` `#5B4BE0` / `#7C6BFF`), Fraunces / Inter / JetBrains Mono, ~8px radius, soft cool shadows, sparing-motion tokens, light + dark via `[data-theme]`. Port these tokens into the Astro app's global CSS; don't re-derive them.
- **Recreate visual output, not prototype structure.** Per Claude Design's note: the `.html`/`.jsx` are prototypes. The target is **Astro** (`D-005`) — match the look, build idiomatic Astro components. The `.jsx` is React and is reference only; the `.html` is the closer reference.
- **Fonts are already self-hosted here** (same variable TTFs as `docs/_deck-bundle/01-brand-system-upload/`). Wire `@font-face` from these in the build.
- **Verified on import (02-06-2026):** tokens match the pinned spec; no emojis (only the `⌘` command-key glyph in search-shortcut hints); no internal project codenames in the portfolio screens (placeholders, per the secret-hygiene rule).

## Note on naming

The accent color scale is named `--ember-*` in `colors_and_type.css` but the **values are violet** (`#5B4BE0` / `#7C6BFF`) and labelled "Iris accent" — a vestige of the earlier amber palette that was renamed. The semantic `--accent` tokens resolve correctly; consider renaming `--ember-*` → `--iris-*` when porting, for clarity.
