**Purpose:** Index of every document in `/docs`, in reading order with a one-line synopsis. Start here.
**Status:** historical — the planning record the site was built from. Kept as written; not maintained against the shipped code.

## How `/docs` is organized

This folder is the planning foundation the build ran on: the design notes, requirements and decision records that the site was implemented from. It is not the website — the site's content lives in `src/content/` as Markdown. Where a document here disagrees with the code, the code is right; these pages are the record of what was intended, not a description of what shipped. For what actually got built and how, see the repo [`README.md`](../README.md) and the build narrative in [`RUN-LOG.md`](../RUN-LOG.md).

**Project model in one line:** an autonomously AI-maintained blog + portfolio that publishes ~2 fact-checked articles per week (bilingual FR/EN) on cutting-edge AI engineering with zero hand-authoring, showcases Rachid Chabane's AI projects, and answers visitor questions via a RAG chatbot avatar.

All dates: **DD-MM-YYYY** (decision records use ISO `YYYY-MM-DD` in their status line for sortability). Currency, where it appears: **€ (EUR)**. All filenames: kebab-case ASCII.

## Reading order

| # | File | One-line synopsis |
|---|---|---|
| 1 | [`vision.md`](vision.md) | What "good" looks like at MVP, 6 months (01-12-2026), 18 months (01-06-2028) — measurable signals. |
| 2 | [`content-pipeline.md`](content-pipeline.md) | The autonomous editorial engine: source → select → draft → review → **gate** → auto-publish. The core of the project; read second. |
| 3 | [`writing-flow.md`](writing-flow.md) | The writing engine's **agent design**: the slate of `claude-plan-execute` roles, hand-off artifacts, the fact-check provenance chain, the `style-auditor` humanizing loop, and terminal-failure policy. Resolves the core of `OQ-14`. |
| 4 | [`rag-avatar.md`](rag-avatar.md) | The RAG chatbot avatar (MVP, `M-10`): grounded answers + event-driven incremental reindex. |
| 5 | [`user-requirements.md`](user-requirements.md) | Personas (P1–P3) + numbered FRs (groups A–G) with acceptance criteria + NFRs. |
| 6 | [`roadmap.md`](roadmap.md) | MoSCoW with the explicit MVP cut, named Won't list, and risk-to-feature mapping. |
| 7 | [`open-questions.md`](open-questions.md) | Live log of unresolved decisions (`OQ-N`) and the proposed defaults. |
| 8 | [`decisions/`](decisions/) | One file per accepted decision: `D-001` (static-first), `D-002` (auto-publish + gates), `D-003` (hybrid build), `D-004` (bilingual FR/EN), `D-005` (Astro + Cloudflare Pages), `D-006` (editorial scope), `D-007` (brand + avatar constraint). |

`architecture-options.md` is intentionally **not** written — the high-level fork (static vs dynamic) is settled in `D-001`, and the build-approach fork resolved to hybrid in `D-003` ([OQ-3]). No real architectural fork remains open.

## Stage 2 hand-off (prepared)

The Claude Design hand-off is scaffolded and ready, in the order Claude Design expects — **design system first, pitch deck second**:

- [`design-system-setup.md`](design-system-setup.md) — **Phase 1.** A worksheet of values to paste into Claude Design's **"Set up your design system"** *form* (Company name + blurb, "Any other notes?" brand direction with the `D-007` constraints incl. the **non-figurative avatar**, + an attach checklist). The design system is created via the **form**, then **Published**.
- [`claude-design-prompt.md`](claude-design-prompt.md) — **Phase 2.** The **pitch-deck** chat prompt that *inherits* the published design system.
- [`_deck-bundle/`](_deck-bundle/) — step-by-step guide tying the two phases together (fill form → publish → build deck → export).

## Stage 3 hand-off (drafted)

- [`app-ia.md`](app-ia.md) — **information architecture.** The reconciled source of truth for the public surface: route map, navigation shell, screen inventory (S1–S11), data model, core flows, the single runtime API (avatar), cross-screen invariants, display-mode matrix, and the dependency-ordered implementation order that feeds Stage 5. § 13 lists the Stage-1 amendments it surfaced (search/RSS/about tiers). Feeds Stage 4 (per-screen design in Claude Design, inheriting the published design system) and Stage 5.

- [`app-design-prompt.md`](app-design-prompt.md) — **Stage 4 screen-design prompt.** Paste-ready Claude Design prompt (prelude + per-screen specs for Home, Article, index, Portfolio, Project detail, Avatar, About) that *inherits* the published design system and produces high-fidelity mockups, exported to the build via **Handoff to Claude Code**. Derived from `app-ia.md` § 7; scrubbed of internal names/IDs; the no-emoji rule baked in.

## Stage 5 hand-off (the build slate) — authored

The complete `claude-plan-execute` hand-off that drives the end-to-end build. **Validated against the real `claude-plan-execute` loader** (zero warnings).

- [`tasks.yaml`](tasks.yaml) — the full **30-task** slate across 7 phases (foundation → reading → portfolio → secondary → avatar → content engine → launch). Each task carries `key_files`, `depends_on`, `commit_message`, and code tests; UI tasks carry `@playwright/test` e2e. Serial (`parallelism: 1`). Covers `M-1`…`M-13`.
- [`persona.md`](persona.md) — the context every plan/implement agent reads: architecture (Astro+CF; avatar = CF Function with in-memory hybrid retrieval behind swappable seams, concretizing `OQ-4`/`OQ-5`; pipeline = Python on `claude-plan-execute`), the **pinned shared contracts**, the non-negotiables, and the **owner manual-steps** (secrets/keys/domain — the only non-automated work).
- [`invariants.yaml`](invariants.yaml) — custom gates: `secret-scan` + `e2e` (block), `content-safety` + `security-review` (warn). The avatar red-team is a deterministic test suite (task 22) so it blocks via CI.

The build goes **green without secrets** (fakes/fixtures); live integration is the explicit post-secret step. Next: install/point `claude-plan-execute` at `docs/tasks.yaml` and run (a separate go — this is where code gets written).

## Conventions

- **Inline assumption markers.** Anywhere you see `**Assumption:** …` in a doc, the same item is indexed in `open-questions.md` under an `[OQ-N]` tag. Many target numbers carry these — they are *proposed defaults*, not owner-confirmed.
- **Stable IDs.** `M-N` (Must), `S-N` (Should), `C-N` (Could), `W-N` (Won't), `FR-X<n>` (Functional Requirement, group X), `NFR-N`, `OQ-N`, `D-NNN`, `P-N` (persona). Never reused, never renumbered.
- **Doc headers.** Each doc starts with `**Purpose:** …` + `**Status:** draft | for review | approved`.
- **Dates.** DD-MM-YYYY, always absolute.

## What's still open

Stage-1 scope is effectively fully decided. Non-blocking items remain in `open-questions.md`:

1. **[OQ-5]** Multilingual embedding model for the avatar index — a build-time pick (default: managed multilingual).
2. **[OQ-10]** The 18-month readership target — set later when analytics (`S-4`) lands.
3. **[OQ-14a/b/c]** Residual writing-engine build-time choices (terminal-failure default, round caps, humanize placement) — tracked in `writing-flow.md` §9; the roster/flow itself is now designed (OQ-14 core resolved).

The exact palette + avatar concept + domain TLD ([OQ-11b]) are delegated to Claude Design (Stage 2).

Recent resolutions (01-06-2026): **[OQ-1]** avatar in MVP (`M-10`) · **[OQ-2]** Astro + Cloudflare Pages (`D-005`) · **[OQ-3]** hybrid build (`D-003`) · **[OQ-4]** managed avatar stack · **[OQ-6]** scheduled Claude Code routine · **[OQ-7]** targets confirmed · **[OQ-8]** semantic dedup · **[OQ-9]** bilingual FR/EN (`D-004`) · **[OQ-11]** personal practitioner voice · **[OQ-11b]** brand constraints set (`D-007`) · **[OQ-12]** full red-team pass (`M-12`) · **[OQ-13]** native web-search sourcing + scope (`D-006`) · **[site architecture]** static-first (`D-001`) · **[publish autonomy]** auto-publish + gates (`D-002`) · **[primary goal]** portfolio-led.
