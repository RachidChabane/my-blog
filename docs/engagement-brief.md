# Engagement brief — make the site compelling, not flat (hand-off for a fresh session)

**Status:** brainstorm + direction. **Do NOT implement yet** — this is a thinking/scoping doc for
the session that will execute it. Owner has reviewed the direction at a high level; confirm scope
with them before building.

---

## 0 · Mission

The blog/portfolio renders correctly but reads **flat**, and the current articles carry AI tells
(em-dashes, translated-feeling French). Make the site genuinely **engaging and distinctive** for its
audience (AI engineers, technical recruiters, potential collaborators) — _without_ betraying its
identity (serious/premium register, no emoji, no AI-slop) or its hard constraints (below).

Crucial framing the owner and I aligned on: **widgets on flat prose is lipstick.** The flatness is
first a *writing* problem and second a *surfacing* problem. Fix the prose at the source (the
pipeline), then surface the site's unique machinery as the engagement layer — don't bolt on generic
blog gadgets.

**Already decided this session (context for you):** the 16 example articles are throwaway BUILD seeds
(their frontmatter literally says `SEED ... Safe to delete`; written by single build-instances, never
through CPE). The plan is to **delete them and regenerate a proper starter corpus by running the real
pipeline ~5–8 times (supervised) during bring-up.** So engagement work should assume the corpus will
be pipeline-generated — anything you add must be **producible/maintainable by the autonomous daily
pipeline**, not hand-crafted per post.

---

## 1 · Hard constraints (non-negotiable — verify against the gates)

- **Astro static site, NO React / no UI framework.** Islands are `.astro` + **vanilla `<script>`**
  (see memory `islands-are-astro-not-react`). `*.tsx` key_files in tasks.yaml are guidance only.
- **Perf budget is strict** (`perf/lighthouse-budgets.json`, e2e `perf.spec`): LCP ≤ 2500ms, **≤ 6
  scripts, ≤ 100 KB JS total**, Lighthouse perf ≥ 0.90. Anything interactive must be tiny + lazy.
- **A11y gate** (WCAG AA; `e2e/a11y.spec`, pinned `@axe-core/playwright`). Known sub-AA contrast
  defects already tracked (memory `task-29-a11y-contrast-findings`) — don't add more.
- **No emoji, premium register** (`pipeline/house_style.md §2`, D-007; enforced by a no-emoji scan +
  the `style-auditor` gate). Engagement ≠ emoji/playful.
- **Bilingual FR/EN, parallel originals.** Every surface must work in both; the pipeline writes FR as
  a real original, gated independently. Don't add EN-only chrome.
- **Repo-wide `prettier --check .` is a lint gate** (memory `repo-wide-prettier-gate-couples-tasks`);
  astro `<style>` `*/` trap (memory `astro-style-comment-star-slash`); island closure narrowing +
  base-mounted landmark collisions (memories `astro-island-closure-narrowing`,
  `base-mounted-island-landmark-collision`, `astro-template-formatting-element-leak`). Read these
  before touching islands.
- **AI-maintained:** the daily pipeline (`pipeline/`, driven by `claude-plan-execute`) writes content
  unattended. New engagement elements should be **emittable by the draft stage** (a directive the
  renderer hydrates) or be **one-time site chrome** — never per-article hand-work.

## 2 · Machinery that already exists — REUSE it (this is the high-leverage insight)

The site's most compelling assets are things a normal blog can't have. They're already built:

- **A RAG avatar over the whole corpus** (`src/components/Avatar.astro`, `src/lib/avatar/*`,
  `functions/api/avatar/query.ts`). Honest "I don't know" gate. Currently a corner widget.
- **Per-chunk embeddings** for every article (the avatar index) — free material for semantic
  "related", a topic map, reading paths.
- **A claim→source provenance map** per article (`pipeline/contracts/claim_source_map.py`): every
  load-bearing claim is tagged to a specific source excerpt for fact-checking.
- **Structured `sources` in frontmatter** already (label + URL + date) on every post.
- **The autonomous pipeline itself** — research → select → draft(FR+EN) → review loop →
  `style-auditor` humanize → 6 M-4 fact/grounding/style gates → publish. A live, demonstrable system.

The thesis: **the medium is the message.** This is an AI-engineering site that _is_ an AI-engineering
artifact. Surfacing its own machinery is both the most distinctive engagement and the cheapest to
maintain.

---

## 3 · Brainstorm (full menu — not all should ship)

**A. Fix the prose at the source (root cause; free; do first).** Tune `pipeline/house_style.md` + the
draft prompt (`pipeline/stages/draft.py` / prompt builders): problem-first / war-story leads instead
of definitions; a strong opinionated POV ("what most teams get wrong about X"); concrete numbers from
Rachid's _real_ projects (`~/dev-env/0-git/*`); varied sentence rhythm; kill the AI register. The
`style-auditor` gate already enforces voice — sharpen its target. Highest ROI, zero new UI.

**B. Interactive grounded citations (radical transparency).** Surface the claim→source map: hover/tap
a load-bearing sentence → the exact source excerpt it's grounded in (Tufte-style sidenotes fit the
premium register). No human blog can do this; it directly showcases the fact-check engineering. Trust
as engagement.

**C. Avatar as the discovery spine, not a corner widget.** Per-article "interrogate this piece" +
site-wide "what does Rachid think about X", answers citing back into the corpus. The honest
"I don't know" is a _feature_ (signals integrity). Reuses a thing that already exists.

**D. Visualize the corpus's own embedding space.** A precomputed (build-time UMAP/t-SNE) 2-D map of
all articles as points in topic-space, colored by tag, clickable. Doubles as navigation _and_ a live
demo of the embeddings/RAG the blog writes about. Tiny client cost (static coords + canvas).

**E. "How this was made" provenance layer.** A per-article ribbon / a site page showing the sources
it was grounded in, which gates it passed, the cadence. Lean into "every article here was researched,
fact-checked and humanized by an autonomous pipeline — here's exactly how." For this audience that's
more compelling than the post.

**F. Pipeline-emittable interactive explainers (scales with daily cadence).** A small library of
reusable, lazy, <few-KB islands the draft stage can _choose_ to embed when a topic warrants: a
parameter slider (RRF `k`, quantization bits→perplexity), a tiny canvas viz (vector field, retrieval
graph), a runnable code cell (JS/WASM sandbox, no server). The pipeline emits a directive; the
renderer hydrates. NOT hand-built one-offs.

**G. Connect blog ↔ portfolio ↔ real code.** Articles that are "the story behind" one of Rachid's
actual projects link to the repo + the portfolio entry, with real benchmarks/diffs. Turns posts into
credible case studies (it's a portfolio, after all).

**H. Generative topic art at build.** Algorithmic hero visuals tied to each topic (attention grids,
embedding fields, retrieval graphs) rendered at build — premium, not stock, cheap to auto-generate,
avoids the maintenance cost of video.

**I. "Pulse / now / changelog" page.** Show the autonomous engine is _alive_: last run, topics in the
queue, cadence, gates passing. Makes a static site feel living; the daily cadence is itself the hook.

**J. Reading craft.** Reading-progress, est. time, inline sidenotes/marginalia, auto "key takeaways"
TL;DR, code blocks with copy + "explain this line" (via the avatar), semantic "readers also explored"
(reuse embeddings).

## 4 · Recommended direction (my POV)

Sequence by leverage, and bias toward **reuse-the-machinery** over new gadgets:

1. **Tier 0 — fix the writing (A).** Do this _with_ the starter-corpus regeneration, not after. If
   the pipeline's prose is sharp, half the "flat" problem is gone before any UI work. Free, in-prompt.
2. **Tier 1 — surface the unique machinery (B, C, E, D).** Grounded interactive citations + avatar-as-
   discovery + the provenance layer + the embedding map. These are the site's moat, near-zero
   marginal content cost, and uniquely on-brand. Start with **B (grounded citations)** and
   **C (per-article avatar)** — biggest distinctiveness per KB.
3. **Tier 2 — make it scale (F, G, H).** The pipeline-emittable explainer library + blog↔portfolio↔
   repo links + generative art. Build the _pattern_ so the daily cadence keeps producing it.
4. **Tier 3 — reading craft (J).** Sidenotes, progress, TL;DR, copy/explain code. Polish.

**Why this and not "add interactive widgets + videos":** generic widgets on an AI-engineering blog are
forgettable and (videos especially) un-maintainable under a daily autonomous cadence. The
differentiated, defensible, cheap-to-run engagement is the stuff only _this_ site can do — its own
fact-check provenance, its own avatar, its own embedding space — plus prose with an actual point of
view. Lead with those.

## 5 · Suggested first moves (for the executing session)

1. Read §1 constraints + the linked memories; skim `docs/writing-flow.md`, `pipeline/house_style.md`,
   `src/lib/avatar/contracts.ts`, one article's frontmatter, `perf/lighthouse-budgets.json`.
2. Bring the owner **2–3 concrete options for Tier 1** (B + C) as small mockups, get a pick, then
   prototype ONE on a single article behind the perf/a11y gates before generalizing.
3. For Tier 0, draft a `house_style.md` + draft-prompt revision and dry-run it on one topic (fake
   embedder is fine for prose) to feel the new voice before the supervised corpus regeneration.

## 6 · Open questions for the owner

- How heavy can the avatar lean as a navigation paradigm vs. classic browse? (Privacy/cost of more
  LLM calls per visit.)
- Generative art / embedding map: worth the build-time + bytes, or skip for v1?
- Provenance transparency: a subtle per-article ribbon, or a full "how this is made" page, or both?
- Any topics/projects from `~/dev-env/0-git/*` to prioritize for blog↔portfolio case studies?

## 7 · Read-first pointers

`docs/writing-flow.md` (the editorial engine) · `pipeline/house_style.md` (voice/no-emoji) ·
`src/lib/avatar/*` + `functions/api/avatar/query.ts` (avatar/RAG) · `pipeline/contracts/claim_source_map.py`
(provenance) · `perf/lighthouse-budgets.json` + `e2e/perf.spec`, `e2e/a11y.spec` (the gates) ·
`DEPLOY.md` (deploy/ops state) · the project memory (`MEMORY.md` index) — especially the island/a11y/
prettier gotchas. Note: the daily pipeline + RAG-on-Vectorize+D1 deploy is done but **owner-gated on
keys** (see `DEPLOY.md §1`); engagement work is independent of that and can proceed in parallel.
