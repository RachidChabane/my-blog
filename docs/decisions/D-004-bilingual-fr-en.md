# D-004 — Content is bilingual French + English

**Status.** Accepted 2026-06-01. Source: `open-questions.md` [OQ-9]; intake (language choice).

## Decision

- Every article and portfolio page exists in **both French and English**, at parallel URLs (`FR-A4`, `NFR-11`).
- The pipeline **authors each post in both languages** as parallel outputs, not a raw machine translation of one (`FR-B3`, `content-pipeline.md` §2).
- The quality gate runs **independently on each language version**; both must pass to publish (`FR-C1`, `FR-C2`, `M-4`).
- Topic memory is **keyed by topic, language-independent**, so a covered topic isn't re-selected for either language (`M-11`, `FR-G1`).
- The site has a **language switcher** (`FR-A4`).

## Why

The owner is francophone and wants French reach, while the agentic-AI practitioner audience skews English. Serving both is a deliberate scope choice made at intake, accepted despite roughly doubling per-post drafting and gate work — the reach is judged worth the cost.

## Consequences

- Adds `M-11` (bilingual plumbing) to the MVP and grows per-post pipeline cost (two drafts, two gate runs).
- The avatar must index both languages and use a multilingual embedder ([OQ-4], [OQ-5], `rag-avatar.md` §5).
- House style (`FR-G2`) must be defined for both languages.
- Promotes the former `C-2` (multi-language) into the MVP; `C-2` is retired.

## What we did NOT pick

- **English only.** Least work and a single house style, but forgoes French reach the owner wants — rejected.
- **Auto-translation of a single source.** Cheaper, but raw MT fails the style/quality bar under auto-publish — rejected in favor of parallel authoring.
