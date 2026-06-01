**Purpose:** Live log of unresolved questions, risks, and assumptions. Owned by the project owner. Update continuously, not just at the end.
**Status:** draft — last updated 01-06-2026.

## How to use this file

Each entry follows: **question/risk → why it matters → options → resolution path → who answers**. Resolved entries move to the bottom with date and decision (DD-MM-YYYY).

`**Assumption:**` markers and `[OQ-N]` tags inline in other docs all point back here.

## Open

### [OQ-5] Which embedding model for the avatar index?
**Why it matters.** Quality/cost of retrieval; coupled to [OQ-4]. Must be multilingual (bilingual content, `D-004`).
**Options.** (a) a managed multilingual embedding API; (b) a local multilingual embedding model.
**Resolution path.** Decide at `M-10` build. Default: managed.
**Needed from.** Owner direction.

### [OQ-10] What is the 18-month readership target?
**Why it matters.** The `vision.md` 18-month readership signal has no number yet.
**Options.** Owner-set (monthly uniques / subscribers / returning readers).
**Resolution path.** Set when analytics (`S-4`) lands.
**Needed from.** Owner direction.

## Resolved

**[OQ-1] 01-06-2026** — *Is the RAG avatar in the MVP, or deferred to `S-1`?* — **In the MVP** (`M-10`). Owner chose to ship the avatar with v1; `S-1` retired, MVP estimate grew to ~10–14 weeks.

**[OQ-4] 01-06-2026** — *Avatar LLM + vector store?* — **Managed API + lightweight store** (light hosted model + sqlite-vss / managed vector DB, multilingual embedder). Provider/model settles at `M-10` build.

**[OQ-6] 01-06-2026** — *What schedules the pipeline?* — **A scheduled Claude Code routine**, composing with the interactive/tmux backend (`M-6`) and native web-search sourcing.

**[OQ-11] 01-06-2026** — *Brand positioning?* — **Personal, practitioner voice** (Rachid's personal hub; blog as his AI-engineering notebook). Concrete domain + visual identity still to pick ([OQ-11b]).

**[OQ-13] 01-06-2026** — *How does the pipeline source news?* — **Claude Code's native web-search tools** (optionally specialized search sub-agents); no external search-API/RSS infra. Also clarified editorial scope → `D-006`.

**[OQ-2] 01-06-2026** — *Which SSG and static host?* — **Astro + Cloudflare Pages.** See `D-005`.

**[OQ-7] 01-06-2026** — *Confirm the proposed target numbers?* — **Accepted as confirmed.** The bootstrap-proposed values (≤ €25/mo, ≥2 topics/wk for ≥8 wks, ≤15 min/wk, ≤1 correction/20, Lighthouse ≥90, LCP ≤2.5s, avatar P50 ≤5s/P95 ≤12s, ≥90% self-recovery, ≥95% groundedness, reindex ≤5 min) are now the targets; `**Assumption**` tags removed. Revisable later with real data.

**[OQ-8] 01-06-2026** — *Topic-dedup window?* — **Semantic similarity, no fixed time window.** A candidate is rejected when it's too similar to an already-published post (`FR-B2`, `content-pipeline.md` §5).

**[OQ-11b] 01-06-2026** — *Concrete domain + visual identity?* — **Partially set; rest delegated to Claude Design.** Domain `rachidchabane.*` (exact TLD TBD); premium quality bar (bayan caliber), scroll-animation polish, and a **non-figurative avatar (no face / living being)** — see `D-007`. Claude Design (Stage 2) proposes the final palette + avatar concept and the TLD is picked at registration.

**[OQ-12] 01-06-2026** — *Avatar prompt-injection hardening?* — **Full red-team pass before launch** (`M-12`, `NFR-7`): sanitization + prompt isolation + grounded-only, validated adversarially; launch-blocking.

**[OQ-3] 01-06-2026** — *Pipeline + RAG build approach?* — **Hybrid:** `claude-plan-execute` for the pipeline + a stripped bayan-pattern RAG for the avatar. See `D-003`. (No `architecture-options.md` needed.)

**[OQ-9] 01-06-2026** — *English only or FR/EN bilingual?* — **Bilingual FR + EN.** See `D-004`. Promoted former `C-2` into the MVP (`M-11`).

**[OQ — site architecture] 01-06-2026** — *Static site vs dynamic app?* — **Static-first, content in git.** See `D-001`. (Intake decision.)

**[OQ — publish autonomy] 01-06-2026** — *Human review gate before publish, or full auto-publish?* — **Full auto-publish, with mandatory automated quality gates.** See `D-002`. (Intake decision.)

**[OQ — primary goal] 01-06-2026** — *Portfolio-led, publication-led, or equal?* — **Portfolio-led** (portfolio wins ties). Captured in `vision.md`, `roadmap.md` § Prioritization principle, and `user-requirements.md` § Implication on prioritization.
