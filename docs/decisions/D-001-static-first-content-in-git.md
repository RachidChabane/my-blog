# D-001 — Architecture: static-first, content in git

**Status.** Accepted 2026-06-01. Source: Step-0 intake (architecture choice); `vision.md` § What this product is *not*.

## Decision

- The site is a **static site generated from markdown content committed to the repo** (no backend, no database, no CMS).
- The AI pipeline publishes by **committing markdown + opening/merging to the repo**; a CI build renders and deploys to a static host.
- A **git event on publish** is the trigger for the avatar's incremental reindex (`FR-E3`).
- The avatar is a **small, separate service** (vector store + light LLM), not part of a monolith backend.

## Why

The whole bet is unattended autonomy at near-zero cost (`vision.md`). A static, content-in-git model is the cheapest and simplest fit: the AI's natural output is markdown + a git commit, git is already the audit trail, and a static host has almost no operational surface to babysit. A dynamic app would add infra, cost, and maintenance — directly working against the autonomy and ≤ €25/month goals (`NFR-9`).

## Consequences

- Commits the project to an SSG + static-host toolchain (`M-1`, `M-2`); specific choice open ([OQ-2]).
- Dynamic features (comments, live data) require add-ons or are deferred (`C-1`, `C-3`).
- The publish path is `git commit → CI build → deploy` (`FR-B5`); the reindex hook keys off the same event (`rag-avatar.md` §3).

## What we did NOT pick

- **Dynamic app (backend + DB + CMS).** More flexible, but more infra, cost, and maintenance to keep running autonomously — rejected against the autonomy + low-cost directives. Revisit only if a feature (e.g. real-time data) genuinely demands a server.
