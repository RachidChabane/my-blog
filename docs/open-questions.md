**Purpose:** Live log of unresolved questions, risks, and assumptions. Owned by the project owner. Update continuously, not just at the end.
**Status:** draft — last updated 01-06-2026.

## How to use this file

Each entry follows: **question/risk → why it matters → options → resolution path → who answers**. Resolved entries move to the bottom with date and decision (DD-MM-YYYY).

`**Assumption:**` markers and `[OQ-N]` tags inline in other docs all point back here.

## Open

### [OQ-4] Avatar LLM + vector store?
**Why it matters.** Drives avatar cost, latency (`NFR-2`), and ops burden. Now **MVP-blocking** (avatar is `M-10`).
**Options.**
- (a) Managed LLM API (e.g. a light Claude/Haiku-tier or OpenRouter model) + a lightweight vector store (sqlite-vss / a managed vector DB) — lean (recommended).
- (b) Self-hosted small model + pgvector (lifts more of the bayan stack; higher ops).
**Resolution path.** Decide at `M-10` build. Default proposal: (a). Embedder must handle FR + EN (`D-004`).
**Needed from.** Owner direction.

### [OQ-5] Which embedding model for the avatar index?
**Why it matters.** Quality/cost of retrieval; coupled to [OQ-4]. Must be multilingual (bilingual content, `D-004`).
**Options.** (a) a managed multilingual embedding API; (b) a local multilingual embedding model.
**Resolution path.** Decide at `M-10` build. Default: managed.
**Needed from.** Owner direction.

### [OQ-6] What schedules and triggers the pipeline twice weekly?
**Why it matters.** `M-5` depends on it; affects where the pipeline runs and how it stays on the subscription pool (`M-6`).
**Options.**
- (a) A scheduled Claude Code routine (cron-style) on the owner's machine.
- (b) GitHub Actions on a schedule.
- (c) launchd / system cron invoking the runner.
**Resolution path.** Owner picks; (a) aligns best with the interactive/tmux backend requirement.
**Needed from.** Owner direction.

### [OQ-7] Confirm the proposed cadence/quality/cost/latency targets.
**Why it matters.** Several `vision.md` and `NFR` numbers are *proposed defaults invented during bootstrap*, not owner-set: ≥2 posts/week for ≥8 consecutive weeks, ≤15 min/week effort, ≤1 correction per 20 posts, ≤ €25/month, LCP ≤2.5s, Lighthouse ≥90, avatar P50 ≤5s/P95 ≤12s, ≥90% self-recovery, ≥95% avatar groundedness, reindex "within N minutes".
**Options.** Accept as-is / adjust each.
**Resolution path.** Owner reviews and confirms or edits the numbers. Until then they carry `**Assumption**` markers.
**Needed from.** Owner direction.

### [OQ-8] Topic-dedup window (N days) for `FR-B2`?
**Why it matters.** Too short → repetition; too long → starves valid follow-ups on fast-moving stories.
**Options.** e.g. 14 / 30 / 60 days; or semantic-similarity rather than a fixed window.
**Resolution path.** Owner sets a default; tune from experience.
**Needed from.** Owner direction.

### [OQ-10] What is the 18-month readership target?
**Why it matters.** The `vision.md` 18-month readership signal has no number yet.
**Options.** Owner-set (monthly uniques / subscribers / returning readers).
**Resolution path.** Set when analytics (`S-4`) lands.
**Needed from.** Owner direction.

### [OQ-11] Domain name and brand/visual identity?
**Why it matters.** Feeds the Stage-2 pitch-deck / Claude Design hand-off and the site's look; the avatar's persona may key off it.
**Options.** TBD — name, tone, palette, avatar character.
**Resolution path.** Resolve before Stage 2 (Claude Design).
**Needed from.** Owner direction.

### [OQ-12] How hardened must the avatar be against prompt-injection (`NFR-7`)?
**Why it matters.** A public chat endpoint is an attack surface; injection could try to exfiltrate config or make the avatar misrepresent Rachid. MVP-relevant (avatar is `M-10`).
**Options.** (a) basic input sanitization + system-prompt isolation; (b) add output filtering + allow-listed retrieval only; (c) fuller red-team pass.
**Resolution path.** Decide at `M-10` build; scope to risk.
**Needed from.** Owner direction.

### [OQ-13] How does the pipeline source news (`FR-B1`)?
**Why it matters.** Determines coverage and freshness of the candidate topics.
**Options.** (a) web-search API; (b) curated RSS/feeds of key sources (Anthropic/OpenAI blogs, OSS releases); (c) both.
**Resolution path.** Owner preference; (c) likely. Decide at `M-3` build.
**Needed from.** Owner direction.

## Resolved

**[OQ-1] 01-06-2026** — *Is the RAG avatar in the MVP, or deferred to `S-1`?* — **In the MVP** (`M-10`). Owner chose to ship the avatar with v1; `S-1` retired, MVP estimate grew to ~10–14 weeks.

**[OQ-2] 01-06-2026** — *Which SSG and static host?* — **Astro + Cloudflare Pages.** See `D-005`.

**[OQ-3] 01-06-2026** — *Pipeline + RAG build approach?* — **Hybrid:** `claude-plan-execute` for the pipeline + a stripped bayan-pattern RAG for the avatar. See `D-003`. (No `architecture-options.md` needed.)

**[OQ-9] 01-06-2026** — *English only or FR/EN bilingual?* — **Bilingual FR + EN.** See `D-004`. Promoted former `C-2` into the MVP (`M-11`).

**[OQ — site architecture] 01-06-2026** — *Static site vs dynamic app?* — **Static-first, content in git.** See `D-001`. (Intake decision.)

**[OQ — publish autonomy] 01-06-2026** — *Human review gate before publish, or full auto-publish?* — **Full auto-publish, with mandatory automated quality gates.** See `D-002`. (Intake decision.)

**[OQ — primary goal] 01-06-2026** — *Portfolio-led, publication-led, or equal?* — **Portfolio-led** (portfolio wins ties). Captured in `vision.md`, `roadmap.md` § Prioritization principle, and `user-requirements.md` § Implication on prioritization.
