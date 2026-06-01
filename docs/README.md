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
| 7 | [`decisions/`](decisions/) | One file per accepted decision: `D-001` (static-first), `D-002` (auto-publish + gates), `D-003` (hybrid build), `D-004` (bilingual FR/EN), `D-005` (Astro + Cloudflare Pages), `D-006` (editorial scope), `D-007` (brand + avatar constraint). |

`architecture-options.md` is intentionally **not** written — the high-level fork (static vs dynamic) is settled in `D-001`, and the build-approach fork resolved to hybrid in `D-003` ([OQ-3]). No real architectural fork remains open.

## Stage 2 hand-off (prepared)

The Claude Design hand-off is scaffolded and ready, in the order Claude Design expects — **design system first, pitch deck second**:

- [`design-system-setup.md`](design-system-setup.md) — **Phase 1.** A worksheet of values to paste into Claude Design's **"Set up your design system"** *form* (Company name + blurb, "Any other notes?" brand direction with the `D-007` constraints incl. the **non-figurative avatar**, + an attach checklist). The design system is created via the **form**, then **Published**.
- [`claude-design-prompt.md`](claude-design-prompt.md) — **Phase 2.** The **pitch-deck** chat prompt that *inherits* the published design system.
- [`_deck-bundle/`](_deck-bundle/) — step-by-step guide tying the two phases together (fill form → publish → build deck → export).

## Stage 3 hand-off (drafted)

- [`app-ia.md`](app-ia.md) — **information architecture.** The reconciled source of truth for the public surface: route map, navigation shell, screen inventory (S1–S11), data model, core flows, the single runtime API (avatar), cross-screen invariants, display-mode matrix, and the dependency-ordered implementation order that feeds Stage 5. § 13 lists the Stage-1 amendments it surfaced (search/RSS/about tiers). Feeds Stage 4 (per-screen design in Claude Design, inheriting the published design system) and Stage 5.

Stage 5 (`tasks.yaml` hand-off to `claude-plan-execute`) is not yet scaffolded — generate when `app-ia.md` is approved.

## Conventions

- **Inline assumption markers.** Anywhere you see `**Assumption:** …` in a doc, the same item is indexed in `open-questions.md` under an `[OQ-N]` tag. Many target numbers carry these — they are *proposed defaults*, not owner-confirmed.
- **Stable IDs.** `M-N` (Must), `S-N` (Should), `C-N` (Could), `W-N` (Won't), `FR-X<n>` (Functional Requirement, group X), `NFR-N`, `OQ-N`, `D-NNN`, `P-N` (persona). Never reused, never renumbered.
- **Doc headers.** Each doc starts with `**Purpose:** …` + `**Status:** draft | for review | approved`.
- **Dates.** DD-MM-YYYY, always absolute.

## What's still open

Stage-1 scope is effectively fully decided. Only two **non-blocking** items remain in `open-questions.md`:

1. **[OQ-5]** Multilingual embedding model for the avatar index — a build-time pick (default: managed multilingual).
2. **[OQ-10]** The 18-month readership target — set later when analytics (`S-4`) lands.

The exact palette + avatar concept + domain TLD ([OQ-11b]) are delegated to Claude Design (Stage 2).

Recent resolutions (01-06-2026): **[OQ-1]** avatar in MVP (`M-10`) · **[OQ-2]** Astro + Cloudflare Pages (`D-005`) · **[OQ-3]** hybrid build (`D-003`) · **[OQ-4]** managed avatar stack · **[OQ-6]** scheduled Claude Code routine · **[OQ-7]** targets confirmed · **[OQ-8]** semantic dedup · **[OQ-9]** bilingual FR/EN (`D-004`) · **[OQ-11]** personal practitioner voice · **[OQ-11b]** brand constraints set (`D-007`) · **[OQ-12]** full red-team pass (`M-12`) · **[OQ-13]** native web-search sourcing + scope (`D-006`) · **[site architecture]** static-first (`D-001`) · **[publish autonomy]** auto-publish + gates (`D-002`) · **[primary goal]** portfolio-led.
