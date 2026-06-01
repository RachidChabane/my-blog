**Purpose:** Index of every document in `/docs`, in reading order with a one-line synopsis. Start here.
**Status:** draft — last revised 01-06-2026.

## How `/docs` is organized

This folder is **owner-only** planning material — the Stage-1 foundation produced by `project-bootstrap`. It is not the website; the site's content lives elsewhere (markdown posts, once the blog is built). The single client-facing artifact will be the pitch deck generated later via Claude Design (Stage 2).

**Project model in one line:** an autonomously AI-maintained blog + portfolio that publishes ~2 fact-checked articles per week (bilingual FR/EN) on cutting-edge AI engineering with zero hand-authoring, showcases Rachid Chabane's AI projects, and answers visitor questions via a RAG chatbot avatar.

All dates: **DD-MM-YYYY** (decision records use ISO `YYYY-MM-DD` in their status line for sortability). Currency, where it appears: **€ (EUR)**. All filenames: kebab-case ASCII.

## Reading order

| # | File | One-line synopsis |
|---|---|---|
| 1 | [`vision.md`](vision.md) | What "good" looks like at MVP, 6 months (01-12-2026), 18 months (01-06-2028) — measurable signals. |
| 2 | [`content-pipeline.md`](content-pipeline.md) | The autonomous editorial engine: source → select → draft → review → **gate** → auto-publish. The core of the project; read second. |
| 3 | [`rag-avatar.md`](rag-avatar.md) | The RAG chatbot avatar (MVP, `M-10`): grounded answers + event-driven incremental reindex. |
| 4 | [`user-requirements.md`](user-requirements.md) | Personas (P1–P3) + numbered FRs (groups A–G) with acceptance criteria + NFRs. |
| 5 | [`roadmap.md`](roadmap.md) | MoSCoW with the explicit MVP cut, named Won't list, and risk-to-feature mapping. |
| 6 | [`open-questions.md`](open-questions.md) | Live log of unresolved decisions (`OQ-N`) and the proposed defaults. |
| 7 | [`decisions/`](decisions/) | One file per accepted decision: `D-001` (static-first), `D-002` (auto-publish + gates), `D-003` (hybrid build), `D-004` (bilingual FR/EN), `D-005` (Astro + Cloudflare Pages), `D-006` (editorial scope). |

`architecture-options.md` is intentionally **not** written — the high-level fork (static vs dynamic) is settled in `D-001`, and the build-approach fork resolved to hybrid in `D-003` ([OQ-3]). No real architectural fork remains open.

## Conventions

- **Inline assumption markers.** Anywhere you see `**Assumption:** …` in a doc, the same item is indexed in `open-questions.md` under an `[OQ-N]` tag. Many target numbers carry these — they are *proposed defaults*, not owner-confirmed.
- **Stable IDs.** `M-N` (Must), `S-N` (Should), `C-N` (Could), `W-N` (Won't), `FR-X<n>` (Functional Requirement, group X), `NFR-N`, `OQ-N`, `D-NNN`, `P-N` (persona). Never reused, never renumbered.
- **Doc headers.** Each doc starts with `**Purpose:** …` + `**Status:** draft | for review | approved`.
- **Dates.** DD-MM-YYYY, always absolute.

## What's still open

The remaining open items are tracked in `open-questions.md`. The top three now:

1. **[OQ-7]** Confirm the proposed cadence / quality / cost / latency targets (currently `**Assumption**` defaults).
2. **[OQ-11b]** Concrete domain name + visual identity (gates the Stage-2 Claude Design hand-off).
3. **[OQ-5]** Multilingual embedding model for the avatar index.

Recent resolutions (01-06-2026): **[OQ-1]** avatar in MVP (`M-10`) · **[OQ-2]** Astro + Cloudflare Pages (`D-005`) · **[OQ-3]** hybrid build (`D-003`) · **[OQ-4]** managed avatar stack · **[OQ-6]** scheduled Claude Code routine · **[OQ-9]** bilingual FR/EN (`D-004`) · **[OQ-11]** personal practitioner voice · **[OQ-13]** native web-search sourcing + scope clarified (`D-006`) · **[site architecture]** static-first (`D-001`) · **[publish autonomy]** auto-publish + gates (`D-002`) · **[primary goal]** portfolio-led.
