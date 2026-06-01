**Purpose:** Live log of unresolved questions, risks, and assumptions. Owned by the project owner. Update continuously, not just at the end.
**Status:** draft — last updated 01-06-2026.

## How to use this file

Each entry follows: **question/risk → why it matters → options → resolution path → who answers**. Resolved entries move to the bottom with date and decision (DD-MM-YYYY).

`**Assumption:**` markers and `[OQ-N]` tags inline in other docs all point back here.

## Open

### [OQ-1] Is the RAG avatar in the MVP, or deferred to `S-1`?
**Why it matters.** This sets the MVP boundary. The brief gives the avatar equal billing with the article pipeline as a "foundation" piece, but the 6-month success metric is autonomous publishing *cadence*, for which the avatar is not required. Misplacing it either bloats the MVP or under-delivers against the brief.
**Options.**
- (a) Defer to `S-1` (proposed): ship the publishing engine + portfolio first; add the avatar once cadence is stable.
- (b) Move into Must: avatar is foundational and ships with v1.
**Resolution path.** Owner ratifies (a) or moves to (b). If (b), `FR-E1`–`FR-E3` move to a new `M-` block and the MVP estimate grows by ~3–4 weeks.
**Needed from.** Owner direction. **This is the top blocking decision.**

### [OQ-3] Pipeline + RAG build approach: reuse existing stacks, build lean-fresh, or hybrid?
**Why it matters.** Roadmap-shaping. The owner already has `claude-plan-execute` (a proven plan→review→implement orchestrator) and `bayan` (a full hybrid-RAG platform). Reusing wholesale imports power but also weight; building fresh is clean but slower; the cost/maintenance envelope differs materially.
**Options.**
- (a) **Hybrid (recommended):** drive the article pipeline with `claude-plan-execute` (on its tmux backend), and build a *stripped* bayan-pattern RAG for the avatar (lift retrieval + fusion + "I don't know" gate; drop Arabic/billing/OCR machinery).
- (b) Reuse both stacks wholesale.
- (c) Build everything lean and fresh.
**Resolution path.** Owner picks; if depth is wanted, this OQ escalates to a full `architecture-options.md` (deliberately not written now, per the brief's "design the how later"). Default proposal: (a).
**Needed from.** Owner direction.

### [OQ-2] Which SSG and static host?
**Why it matters.** Determines the `M-1`/`M-2` build and the publish→deploy path the pipeline commits into.
**Options.**
- (a) Astro + Cloudflare Pages (recommended — strong markdown/content-collections story, generous free tier).
- (b) Hugo or 11ty + Netlify / GitHub Pages.
**Resolution path.** Owner preference; otherwise default to (a). Low-stakes, reversible early.
**Needed from.** Owner direction (or accept default).

### [OQ-4] Avatar LLM + vector store (with `S-1`)?
**Why it matters.** Drives avatar cost, latency (`NFR-2`), and ops burden.
**Options.**
- (a) Managed LLM API (e.g. a light Claude/Haiku-tier or OpenRouter model) + a lightweight vector store (sqlite-vss / a managed vector DB) — lean (recommended).
- (b) Self-hosted small model + pgvector (lifts more of the bayan stack; higher ops).
**Resolution path.** Decide at `S-1` start; defer for now.
**Needed from.** Owner direction, post-MVP.

### [OQ-5] Which embedding model for the avatar index?
**Why it matters.** Quality/cost of retrieval; coupled to [OQ-4].
**Options.** (a) a managed embedding API; (b) a local embedding model.
**Resolution path.** Decide at `S-1`. Default: managed.
**Needed from.** Owner direction, post-MVP.

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

### [OQ-9] Language: English only, or FR/EN bilingual?
**Why it matters.** Doubles or halves pipeline work and shapes the audience (`NFR-11`). Owner is francophone; audience (agentic-AI practitioners) skews English.
**Options.** (a) EN only (proposed); (b) FR/EN bilingual (`C-2`).
**Resolution path.** Owner decides.
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
**Why it matters.** A public chat endpoint is an attack surface; injection could try to exfiltrate config or make the avatar misrepresent Rachid.
**Options.** (a) basic input sanitization + system-prompt isolation; (b) add output filtering + allow-listed retrieval only; (c) fuller red-team pass.
**Resolution path.** Decide at `S-1`; scope to risk.
**Needed from.** Owner direction, post-MVP.

### [OQ-13] How does the pipeline source news (`FR-B1`)?
**Why it matters.** Determines coverage and freshness of the candidate topics.
**Options.** (a) web-search API; (b) curated RSS/feeds of key sources (Anthropic/OpenAI blogs, OSS releases); (c) both.
**Resolution path.** Owner preference; (c) likely. Decide at `M-3` build.
**Needed from.** Owner direction.

## Resolved

**[OQ — site architecture] 01-06-2026** — *Static site vs dynamic app?* — **Static-first, content in git.** See `D-001`. (Intake decision.)

**[OQ — publish autonomy] 01-06-2026** — *Human review gate before publish, or full auto-publish?* — **Full auto-publish, with mandatory automated quality gates.** See `D-002`. (Intake decision.)

**[OQ — primary goal] 01-06-2026** — *Portfolio-led, publication-led, or equal?* — **Portfolio-led** (portfolio wins ties). Captured in `vision.md`, `roadmap.md` § Prioritization principle, and `user-requirements.md` § Implication on prioritization.
