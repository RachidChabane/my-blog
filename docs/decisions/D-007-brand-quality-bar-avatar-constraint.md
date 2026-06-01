# D-007 — Brand: personal practitioner voice, premium quality bar, non-figurative avatar

**Status.** Accepted 2026-06-01. Source: owner clarification on [OQ-11] / [OQ-11b]; feeds Stage 2 (Claude Design).

## Decision

- **Positioning:** personal, practitioner voice — the site is Rachid's personal hub on a `rachidchabane.*` domain (exact TLD TBD); the blog reads as his cutting-edge-AI-engineering notebook.
- **Quality bar:** premium and polished, matching the **caliber and overall feel of `bayan`** (not copying its visual style). Visually engaging, with scroll-animation / motion libraries pulled in for effect.
- **Avatar — hard constraint:** the avatar must be **distinctive and original**, and **must NOT be a face or any depiction of a living being**. Memorable within that boundary.
- Concrete palette and the avatar concept are delegated to **Claude Design** (Stage 2), seeded with the above.

## Why

The site's primary job is portfolio-led credibility (`vision.md`); a generic or low-polish design would undercut the "serious AI engineer" signal the whole project exists to send. The owner explicitly anchors the quality bar to `bayan` (his most design-mature project) and rules out figurative avatars as a deliberate originality + taste choice.

## Consequences

- Stage 2 `claude-design-prompt.md` and the brand bundle carry these constraints; Stage 4 screen design inherits them.
- Front-end work (`M-1`, `M-2`) budgets for motion/scroll-animation libraries and a higher polish bar than a default static site.
- The avatar's visual identity (`M-10`) is a non-figurative mark/persona, not a character face.
- Adds a concrete-name + visual-identity follow-up ([OQ-11b]) that Claude Design resolves.

## What we did NOT pick

- **Named publication brand** or **hybrid** positioning — rejected in favor of a personal hub (`vision.md` portfolio-led).
- **A face / mascot avatar.** Common and on-trend, but explicitly ruled out as unoriginal and off-brief.
