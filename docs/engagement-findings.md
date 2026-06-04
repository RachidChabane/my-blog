# Engagement findings — verified ground truth + scoped options

**Companion to `docs/engagement-brief.md`.** The brief was a scoping/brainstorm doc. This doc
records what changed when the brief's assumptions were **verified against the actual code** (a
fan-out read of the avatar, provenance, prose pipeline, perf gates, render seam, and embedding
index), plus three adversarially-checked Tier-1 options and a concrete Tier-0 prose revision.

Status: **verified analysis, awaiting an owner pick on which Tier-1 to prototype first.** Tier-0 is
ready to implement now. Still no implementation landed.

---

## 0 · What changed vs the brief (read this first)

| Brief assumption | Verified reality | Consequence |
|---|---|---|
| "Perf budget is strict — ≤6 scripts, ≤100 KB JS; anything interactive must be tiny + lazy." | The blocking perf gate (`e2e/perf.spec.ts`) counts only **external** network scripts. Astro **inlines all island JS**, so every page ships **0 external scripts**; articles carry **3 inline scripts / 4,420 B**. Pagefind's 444 KB loads only via `import()` after a search. | **Perf is a regression ceiling, not a real blocker.** ~93 KB of inline headroom; the ≤6 ceiling only bites if someone ships an external/CDN/framework bundle. Inline vanilla islands are effectively free. |
| Option B: "every load-bearing claim is tagged to a source excerpt — surface it." | The `claim_source_map` **is** per-claim→source-excerpt (with sub-span offsets), BUT it is an **ephemeral pipeline artifact** (`pipeline/runs/<run>/…`, gitignored). At publish, only `sources` (label/url/date) survive to frontmatter; `claims[]`, `excerpt`, `excerpt_span` are **dropped**. No published article has any `[sN]` citation. | **B is blocked on persistence plumbing**, not a front-end task. It also can't be demoed until a real pipeline run generates an article with `[sN]` markers. |
| Option C: "per-article 'interrogate this piece'." | Single-article **scoping is impossible without backend changes**: `AvatarQueryRequest = {query, lang?}`; slug is not Vectorize metadata. The cheap path (post-hydration slug filter) hits a **gate landmine**: `topSimilarity` (the honest-refusal signal) is read from the *unfiltered* vector leg, so a scoped query can pass the gate then have nothing in-scope → dishonest/empty answer. | True scoping is **L effort + a correctness fix + live bge-m3 recalibration**. A *labelled* "ask about this topic" entry point (corpus-wide retrieval) is **S effort, zero backend.** |
| Option D: "precomputed UMAP map, tiny cost." | Cheap and feasible (mean-pool ~15–30 chunk vectors, `umap-js`, ~1–3 KB coords). BUT the input `.avatar-index/vectors.ndjson` **only materializes from a CF-credentialed `build:index` run** (owner-gated secrets). `reindex.yml` is index-only with **no commit-back**, so the "self-updates daily" mechanism in the brief is false — the real wiring is a post-`build:index` step in the deploy job emitting a gitignored JSON. | **D is owner-gated like deploy.** Every secret-less build (PR/e2e/local) needs an empty-map fallback or `pnpm build` breaks. |
| "Fix prose with concrete numbers from Rachid's real projects." | Two issues. (a) There is no project-facts/personal-metrics input channel (research sweeps web news only). (b) The **house_style/prompt rule** (§4), not any gate, currently tells the agent every load-bearing claim must map to a captured source — a personal metric has no source, so the agent fabricates one or drops the number. **The fact-check gate is directional and does NOT force this**: `grounding.py`/`factcheck.py` only iterate claims *already in* the map (mapped-claim→must-be-cited; body-`[sN]`→must-resolve; ≥1 mapped claim/lang). No gate extracts claims from the body. | Tier-0 adds a **§4 carve-out** as a **clean prompt edit, no `factcheck.py` change**: first-person results = primary evidence, stated as yours, **no `[sN]`, not in the claim map** → passes every gate. Owner call is a *light brand* decision (recommend yes, marked as the author's own measurement), not a gate reconciliation. |

**Net:** of the brief's Tier-1 menu, **only the per-article avatar entry point and Tier-0 are
buildable + demoable on today's corpus.** B and D depend on the supervised corpus regeneration
and/or owner-gated CF creds, so they should be sequenced *with* that bring-up, not before it.

---

## 1 · Tier-1 options (adversarially verified)

All three were checked against: no-React, the perf gate, WCAG AA (incl. the 5 known sub-AA token
colors to avoid), bilingual FR/EN, pipeline-emittability, and the island gotchas in memory.

### Option 1 — "Ask about this topic" (per-article avatar entry point) · effort **S** · verdict **conditional**
- **What:** a real `<button>` at the end of each `<article>` (outside `data-pagefind-body`) that
  opens the existing site-wide avatar panel pre-seeded with a build-time question from
  `title`+`tags`. Reuses the panel, SSE, citation rendering, and honest-refusal gate verbatim.
- **Zero backend change** (confirmed): the avatar already POSTs `{query, lang}`. The only island
  edit is a delegated click listener inside the existing null-guard block (per
  `astro-island-closure-narrowing`).
- **Works on the current seed corpus today** (needs only `title`+`tags`).
- **Binding condition:** retrieval is **corpus-wide**, so label it "Ask about *<topic>*" — **not**
  "interrogate *this* piece" — or it undercuts the integrity brand. True scoping is Option 4.
- Perf: +~0.3–0.5 KB inline, 0 external scripts. a11y: real button + existing dialog contract.

### Option 2 — Grounded citation sidenotes (claim → exact source excerpt) · effort **M** · verdict **conditional (blocker: data)**
- **What:** hover/tap a `[sN]` citation marker → a Tufte-style sidenote unfolds the exact source
  excerpt that grounds it, with the supporting sub-span bolded. The fact-check-engineering moat.
- **Blocker:** requires a **publish-stage write** of a per-language provenance sidecar (the data is
  already loaded+validated in `publish.py`; ~one helper + one write). Build-import only (a runtime
  `fetch` of `src/content/*.json` 404s). Anchor on `[sN]` tokens (stable), not claim-sentence text
  (humanize edits prose after the map is authored → drift).
- **Differentiator caveat:** `excerpt_span` is per-*claim* but `[sN]` is per-*source*; when one
  source backs multiple claims, the "bold the exact substring" feature degrades to whole-excerpt.
- **Cannot be demoed until** a real pipeline article exists (or a hand-authored fixture + injected
  `[sN]`). Also: `.prettierignore` the emitted JSON (repo-wide prettier gate).

### Option 3 — Embedding-space map (corpus self-navigation) · effort **M–L** · verdict **conditional (owner-gated input)**
- **What:** a build-time 2-D UMAP of the corpus as a clickable topic map (lazy canvas + a parallel
  accessible `<ul>`), colored by tag. Doubles as a live demo of the embeddings the blog writes about.
- **Cheap compute** (umap over <60 vectors, sub-second, ~$0; ~1–3 KB coords client-side).
- **Owner-gated:** input vectors need a CF-credentialed `build:index`. Needs an **empty-map
  fallback** so secret-less builds don't break. Real wiring = post-`build:index` step in the deploy
  job, **not** `reindex.yml` (no commit-back). Mount on a new `/[lang]/map` page (the blog index is a
  rest route, can't be `index.astro`).

### Option 4 (stretch) — True per-article avatar scoping · effort **L** · verdict **blocked**
- 6-file scope-threading + the `topSimilarity` gate-correctness fix + live bge-m3 recalibration +
  (prerequisite) a cache/rate-limit on `/api/avatar/query` before the avatar becomes primary nav.
  Defer until after bring-up recalibration.

---

## 2 · Tier-0 prose fix (ready now — highest ROI, no UI)

**Primary lever:** `pipeline/house_style.md` is the cpe `persona_file`, injected into *every*
sub-phase (draft / review / revise / humanize) — higher leverage than the draft prompt alone.
**Secondary:** the `prompts/draft.py` builder + the `style-auditor` `context:` string.

Concrete changes (full text drafted, ready to apply):
1. **§1** — turn "prefer the specific number" into a **MUST**, with the personal-metric carve-out.
2. **§1** — add an **opinionated-POV** rule (one load-bearing argument, stated in para 1).
3. **§3** — tighten the em-dash cap *per language*; add a no-throat-clearing-opener rule.
4. **§4** — **carve-out:** first-person results & marked opinions are primary evidence — **no
   `[sN]`, not in the claim map.** This is a pure house_style/prompt edit (the gates are directional
   and won't block an uncited first-person number — verified in `grounding.py`/`factcheck.py`), so
   **no `factcheck.py` change is needed.** *Owner call (light/brand): is an unsourced first-person
   number acceptable on a fact-check-branded site? Recommend yes, clearly marked as the author's
   own measurement.*
5. **§5** — replace the lead rule: **problem-first / POV lead, thesis in the first sentence**, honoring
   the derived-dek truncation (`src/lib/content.ts` `excerpt()` ≈ 180 chars at a word boundary).
6. **§5** — strengthen the rhythm rule (break the claim→expansion→restatement pattern per section).
7. **§6** — concrete anti-translationese rules for FR (restructure, native connectors, no calques).
8. **`prompts/draft.py`** — mirror the lead/POV/numbers/FR rules in `_draft_section`; sharpen the
   `style-auditor` `context:` to name the new failure modes; add a **second FR-context auditor pass**
   (repo-local — avoids editing the global, cross-project `~/.claude/agents/style-auditor.md`).

**Gate reality:** the deterministic gate only checks no-emoji + a binary "auditor verdict == clean";
the auditor is English-centric with no FR-translationese category. The fix is **recall** (context
string + FR pass + house_style text), not the threshold (only "clean" already passes).

Dry-run plan: regenerate **one** topic with the fake embedder to feel the new voice before the
supervised corpus regeneration. (Fake embedder is fine for prose; numbers stay as `[N]` placeholders
until a real source or a real personal bench fills them.)

---

## 3 · Recommended sequence

1. **Tier-0 now** (ready, highest ROI, reversible, no deploy). Apply the house_style + draft-prompt
   revision; dry-run one topic.
2. **Option 1 (avatar entry button)** as the first Tier-1 prototype — the only Tier-1 buildable +
   demoable on today's corpus, behind the perf/a11y gates, on one article first.
3. **Option 2 (grounded sidenotes)** is **nearer-term than the brief implies.** The draft stage
   emits `[sN]`+claim_source_map via the cpe sub-agent, *independent of the embedder* (the embedder
   is only in select-dedup, where the fake works). So B's demo substrate — a real article with
   citations — falls out of the **same Tier-0 dry-run** (step 1). B is gated on the **publish-stage
   provenance-sidecar write (doable now, no CF creds) + one dry-run**, not full bring-up. Land the
   sidecar, run one supervised draft, then build the sidenote island against that article. This is
   the brief's true moat. *(Caveat: an end-to-end local pipeline run has not yet been executed to
   confirm the cpe harness is currently green — verify before committing to B's timeline.)*
4. **Option 3 (embedding map)** when a CF-credentialed index build is available; ship the empty-map
   fallback regardless.
5. **Option 4 (true scoping)** post-bring-up, after gate recalibration + a cache/rate-limit.

Full per-option mockups, file:line render hooks, and the verbatim Tier-0 text live in the workflow
output for this session (`engagement-brief-scope` run).

---

## 4 · Owner decisions (locked 2026-06-04) + execution status

**Decisions:**
- **Tier-1 scope: do ALL of it** (owner: "why not do everything"). Execute in dependency order;
  the sequencing in §3 stands.
- **Tier-0: implement + dry-run now** — DONE (see below).
- **First-person numbers: REQUIRE an external source** (owner). No unsourced-personal-metric
  carve-out. Every number is a load-bearing claim that must cite a captured source `[sN]`; pure
  marked opinions stay uncited but may not assert unsourced figures. (This is the stricter, more
  on-brand choice and needs no `factcheck.py` change — the gate already permits it.)

**Status:**
- [x] **Tier-0 prose revision applied** — `pipeline/house_style.md` (§1 MUST-have-a-sourced-number,
      §1 opinionated-POV, §3 per-language em-dash + no-throat-clearing, §5 problem-first lead +
      rhythm, §6 anti-translationese FR) and `pipeline/prompts/draft.py` (lead/POV/sourced-numbers
      in `_draft_section`, FR-anti-calque, sharpened `style-auditor` context naming the new failure
      modes). All 187 pipeline tests green; ruff + prettier + ASCII-prompt checks pass.
- [x] **Tier-0 dry-run — DONE & independently verified.** Faithful offline RRF draft (5 real web
      sources with numbers: k=60 [s1], 4-5% / .3686 vs .3586 [s2], 3.7%→2.9% [s3], rank_constant=60
      [s4], alpha=0.5 [s5]). I re-ran every gate myself: draft validate / grounding EN+FR / no-emoji
      scan EN+FR all OK; 0 em-dashes; all 5 [sN] cited in both languages and resolving. Voice vs the
      seed: problem-first lead with thesis in sentence one (EN 167 / FR 162 chars, inside the dek
      window), a marked POV, sourced numbers (seed had zero), varied rhythm, and FR as a genuine
      accented parallel original (no calque). Artifacts: `pipeline/runs/dry-run-tier0-rrf/`
      (gitignored). The Tier-0 revision is validated.
      **Scope: VOICE, not FACTS.** The dry-run skipped the semantic fact-check sub-agent (only the
      structural provenance backstop ran) and used the *fake* link checker (all URLs treated
      reachable). The five excerpts are gate-passing but factually UNVERIFIED — I did not confirm
      Cormack 2009 states k=60 or that the Anthropic post says 3.7%→2.9%. Any path that promotes this
      article to reader-facing MUST first run a real semantic fact-check + live link check.
- [x] **Option 1 — avatar "ask about topic" entry button** — DONE & gate-verified. New
      `src/components/ArticleAskButton.astro` (static `<button>`, zero JS of its own, build-time seed
      from the primary tag, mounted after PrevNext OUTSIDE `data-pagefind-body`); a delegated
      capture-phase `[data-avatar-ask]` listener in `Avatar.astro` opens the existing panel +
      pre-fills the composer (no scope sent → corpus-wide, honestly labelled); bilingual seed in
      `i18n/ui.ts`. Verified: astro check 0 errors, build OK (renders on EN + FR), prettier clean,
      i18n parity (61), all e2e gates green (a11y/perf/article/avatar = 97 passed), + 2 new
      feature tests. AA-safe tokens only; reuses the audited dialog/refusal machinery verbatim.
- [x] **Option 2 — persistence half** — DONE & verified. `publish.py`: `project_provenance()`
      (keyed on sources **cited in that language**, span only when unambiguous) + `build_provenance()`
      + a bilingual-or-nothing sidecar write + manifest paths. New `provenance` content collection
      (`content.config.ts`) + `provenanceSchema` (`schemas.ts`) + `.prettierignore` + an empty-dir
      `.gitkeep`. Tests: per-cited-source/span, cited-per-lang filtering, record shape, write, and
      bilingual-or-nothing-extends-to-sidecars. Verified: full pipeline pytest (191), full vitest
      (451), astro check 0 errors, build clean, repo-wide eslint + prettier green.
- [x] **Option 2 — renderer island** — DONE & verified. Pure `src/lib/avatar/sidenotes.ts`
      (`attachSidenotes`: anchors on body `[sN]` tokens, builds an accessible disclosure with the
      source excerpt + emphasised sub-span, safe-href, skips code/pre, idempotent) + a lazy
      `ProvenanceSidenotes.astro` island (data-attr citations, no markup sink) + `sidenotes.css`
      (tokens-only, click-toggle, absolute note → CLS 0) + `[slug].astro` wiring (mounts only when a
      provenance entry exists). Verified: 9 happy-dom DOM tests + 9 static-source guards; live probe
      e2e (throwaway article → markers replaced, click reveals span-emphasised excerpt + safe link →
      probe removed); astro check 0 errors; full vitest 469; e2e gates 99 passed (dormant/no-op on
      the seed corpus). NOTE: the only thing missing is a LIVE substrate (a published article with
      `[sN]`); that arrives with the corpus regen (handoff item 1) — the renderer is built + proven.
- [ ] **Option 3 — embedding map** — NOT BUILT (intentional). Its value is ENTIRELY behind real
      vectors, which need a CF-credentialed `build:index` run; an empty shell delivers nothing and a
      local-bge-m3 detour (~2GB dep, divergent-from-prod embedder) is poor ROI on the
      owner-questioned ("worth it for v1?") lowest-value item. Flagged as a keys-gated fast-follow
      with a concrete build plan in §5 item 2.
- [x] **Option 4 — scoping machinery + client** — DONE & verified. `scopeSlug` threaded
      protocol → guard (slug-charset validated) → retrieval → query handler; the **gate-correctness
      fix** computes `topSimilarity` over the SCOPED subset (with a wide leg-pull so in-scope chunks
      survive the filter) so an out-of-scope question honestly refuses instead of answering from
      another article. The per-article button is now genuinely **scoped** ("ask about this article",
      sends `scopeSlug`); the corner launcher stays corpus-wide. Verified: 10 scope unit tests
      (incl. a deterministic gate-fix proof: scoped signal = in-scope max, strictly < global max),
      astro check 0 errors, full vitest 479, e2e 100 passed (scoped + corpus-wide). Also fixed a
      latent live bug the fakes hid: the wide scoped leg-pull is now clamped to Vectorize's query
      topK cap (`VECTORIZE_MAX_TOPK = 100`) so a scoped query can't throw/truncate in production
      (clamp unit-tested). **Two come-backs remain (keys/account):** (a) live bge-m3 **recalibration**
      of the 0.25 threshold AND the cosine direction ("near 1") — now LOAD-BEARING for a user-facing
      control (the scoped button), so it is a first-deploy gate, not just a corner-widget nicety;
      (b) a **cache + rate-limit** on `/api/avatar/query` (needs a CF KV/Durable-Object binding)
      before the avatar is promoted to primary navigation.

## 5 · Consolidated handoff (end of the autonomous queue)

Tier-0 and Options 1, 2 (persistence + renderer), and 4 (scoping machinery + client) are built and
verified. **Every remaining ACTIVATION is gated on a key/account step I cannot do** — a real corpus,
CF credentials, or live gate recalibration. The batched come-backs:

1. **Option 2 substrate (unblocks the entire sidenote UI).** To build + verify the grounded-citation
   island I need *one* real article that contains `[sN]` markers + a matching provenance sidecar.
   Options: (a) run a **supervised** pipeline draft at bring-up (the brief's plan); or (b) promote the
   existing Tier-0 dry-run RRF article. **If (b): the dry-run validated VOICE, not FACTS** — it
   skipped the semantic fact-check and used the fake link checker, so its 5 excerpts are unverified.
   Any reader-facing promotion MUST first run a real semantic fact-check + live link check (deploy is
   separately key-gated, so seeding the corpus does not itself publish anything live).
2. **Option 3 (embedding map) — keys-gated; not built.** Provide the CF creds
   (`EMBEDDINGS_API_KEY` + `CLOUDFLARE_ACCOUNT_ID`, per `DEPLOY.md`) so a `build:index` run produces
   `.avatar-index/vectors.ndjson`. Fast-follow build plan (no new heavy dep): a post-`build:index`
   step mean-pools each slug's chunk vectors → one article-level vector per slug → a dependency-free
   2-D PCA projection → a small `embedding-map.json` (`[x, y, tag, slug, title]`); a `/[lang]/map`
   page renders a lazy canvas of the points PLUS a parallel `<ul>` of article links (the
   a11y-equivalent path), colored by tag; regenerated on the daily reindex. ~Zero client bytes, no
   extra embed cost. Skipped now because an empty map (no vectors) delivers nothing of value.
3. **Option 4 (true scoping) — built; trust gated.** The scoping + gate-fix ship now. FIRST-DEPLOY
   GATE: recalibrate the `0.25` threshold AND verify the cosine direction ("near 1") against live
   bge-m3 (`avatar-gate-calibration-fake-tuned`). This is now LOAD-BEARING for the user-facing
   per-article scoped button (not just the corner widget), so the honest refusal must be calibrated
   before the button is trusted. Then add a cache + rate-limit to `/api/avatar/query` (a CF
   KV/Durable-Object binding) before promoting the avatar to a primary navigation paradigm.

**Deferred to a dedicated change (noted, not bundled):** a second FR-context `style-auditor`
invocation in the humanize loop. It touches the gate's single-verdict contract, so it deserves its
own tested change rather than riding the Tier-0 prompt edit; the sharpened context string already
names French-translationese for the existing pass.

All changes are in the working tree, **uncommitted** (commit on request).
