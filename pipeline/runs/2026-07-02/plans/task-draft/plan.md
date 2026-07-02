# Task-draft implementation plan — 2026-07-02 run

STAGE: Draft + Review + Humanize + Fact-check + Editorial + Source-quality (writing-flow §3
roles 3/4/4b, §5). cwd = the run dir (`/Users/rachid/dev-env/0-git/my-blog/pipeline/runs/2026-07-02`),
INSIDE the repo at repo_root `/Users/rachid/dev-env/0-git/my-blog`. All repo paths below are
ABSOLUTE against repo_root; all artifact paths are under
`<repo_root>/pipeline/runs/2026-07-02/plans/task-draft/`.

This is an authoring task, not a code change. "Implementation" = producing the draft
artifacts and running the deterministic self-gates + judge sub-agents until all NINE
blocking gates pass. NO Python source under `pipeline/` is edited. The plan is the
authoring recipe + the exact gate-passing sequence.

## 0. Topic, argument, and the shape of the piece (inputs digested)

- `chosen_topic_id`: `coding-agent-failures-in-the-wild`. NOT a `lesson-` prefix, so
  this is NOT lesson mode. Category is a free choice among essays/explainers/briefings.
- **Category decision: `essays`.** The angle is an opinionated resource-allocation take
  ("spend this quarter on retrieval and guardrails, not on waiting for a bigger model")
  the reader can disagree with, defended with a steelman/refutation. That is an essay,
  not a how-it-works explainer or a short field note. `category: essays`, identical fr/en.
- **The ONE load-bearing argument** (shaped by `argument.json.strengthened_argument`,
  NOT a re-derived weaker version): For the next release cycle the binding constraint on
  coding-agent reliability is the harness, not model intelligence, so allocate now to
  retrieval over large repos, guardrails, and measurement of the low-visibility
  trust-cost failures teams under-count; do not defer that spend waiting for a bigger
  model. The strong sub-claim MUST be stated as **structural, not absolute**: added
  capability cannot close the growing self-reporting / constraint-violation classes
  because an agent cannot report a violation whose evidence its harness never puts in
  its observable context — an observability gap, fixable only by instrumentation. The
  400,000-LOC threshold and the 96-calls→5-calls refactor are **current-generation
  evidence for the allocation call, not permanent constants**; concede future models may
  raise the threshold, and note that this does not move where a rational team spends this
  quarter. This concession IS the steelman answer (see §2 structure).
- **Difficulty: 3** (rate against `pipeline/difficulty_rubric.md`). Prereqs: working
  ML/AI + agent-tooling knowledge (reader must know what a coding agent, a tool call,
  retrieval, and a benchmark score are); conceptual density: intermediate (harness vs
  capability, observability gap, allocation reasoning); math/code: readable numbers and a
  tool-call trace, no formal math. Axes agree on 3; not a 2 (assumes practitioner
  fluency, not basic AI literacy), not a 4 (no non-trivial code/configs, no formal
  reasoning). Identical fr/en. When torn 2↔3 → round up to 3.
- **Tags** (closed vocab from `src/content/tags/index.json`; pick 1-3 ids that already
  exist; SAME ids fr/en; only labels differ): `agentic-coding`, `agents`. Both exist
  (ids `agentic-coding`, `agents`). Matches the candidate's own `tags` in
  `candidates.json`. Do NOT invent tags; do NOT localize the id. (Optionally add
  `evaluation` — also in vocab — if a third tag is wanted; keep to the two the candidate
  carries to stay conservative.)
- **translationKey** (identical fr/en, NFR-11, not localized): `coding-agent-harness-not-capability`.
- **Sources** (from `candidates.json` → the `coding-agent-failures-in-the-wild`
  candidate; reuse VERBATIM — same `source_id`, `label`, `url`, `retrieved_at`,
  `source_date`, `excerpt`):
  - `s1` = "How Coding Agents Fail Their Users (arXiv 2605.29442)",
    url `https://arxiv.org/abs/2605.29442`, source_date 2026-05-28. Excerpt: 20,574
    sessions / 1,639 repos; seven recurring forms; **90.50%** effort/trust cost vs
    irreversible damage; **91.49%** need explicit user correction; overall rates decline
    while **constraint violations and inaccurate self-reporting grow in share**.
  - `s2` = "Sourcegraph: Why coding agents fail in large codebases",
    url `https://sourcegraph.com/blog/why-coding-agents-fail-large-codebases` (no
    source_date field — omit `source_date` for s2). Excerpt: 1,281 runs across 40+ repos;
    five failure patterns; local-tool agents struggle past **~400,000 LOC**; one refactor
    **96 tool calls / 84 min / 0.32** → **5 targeted calls / 4.4 min / 0.68**; "these
    failures stem from infrastructure limitations, not model intelligence".
- **Skeleton claims → source_ids** (the review gate keys on the UNION of skeleton
  `source_ids` per language; every one must be covered by ≥1 claim in BOTH fr and en, and
  fr/en must cover the SAME set): c1→[s1,s2], c2→[s1], c3→[s2], c4→[s1,s2]. **Union =
  {s1, s2}.** So each language MUST cite BOTH s1 and s2 (at least one claim mapped to
  each). This is automatically satisfied because both sources are load-bearing.

### Key contract facts learned from the code (do not violate)

- `review.py` completeness = per-language `source_id` SET equality against the skeleton
  union `{s1,s2}`, NOT prose matching. Each language needs ≥1 claim on s1 and ≥1 on s2.
- `grounding.py`: every source backing a claim in language L MUST be cited inline in
  `draft-<L>.md` as `[sN]` (exact shape `[s` + digits `]`). Every `[sN]` in the body MUST
  resolve to a source in the map (no dangling). Both s1 and s2 must appear as `[s1]`/`[s2]`
  in BOTH bodies. Link reachability uses the fake checker by default (both URLs live).
- `factcheck.py`: structural backstop needs ≥1 claim per language and non-whitespace
  `excerpt_span` slices IF spans are used. **Decision: omit `excerpt_span`** (optional;
  prior successful run omitted it) → the whole excerpt supports the claim, avoids
  off-by-one span-bounds failures. The per-claim semantic verdicts are written by a fresh
  sub-agent into `factcheck-{fr,en}.json`.
- `humanize.py` deterministic gates: no astral-plane emoji; **no em-dash U+2014 anywhere**
  (frontmatter, headings, body); FR-diacritics denylist (`_FR_DEACCENTED`) scans FR title
  + body (URLs stripped). Style verdict must be `clean`.
- `draft.py` validate: frontmatter keys `lang, translationKey, slug, title, tags,
  category, difficulty`; `difficulty` must be a literal YAML int (not quoted); tags a
  non-empty list; category in {essays,explainers,briefings,lessons}; fr/en parity on
  translationKey, category, difficulty.
- Judge substrate (`judge.py`): editorial + source_quality verdicts are VERDICT-ONLY;
  `reason` field always required in practice (read via `report.reason`). source_quality
  per-claim entries MUST contain `source_id, primary, authoritative, corroborated` (a
  dropped boolean RAISES → gate blocks even on a 'sound' verdict). editorial `issues`
  is informational (may be `[]`).

## 1. Files to create (all under `plans/task-draft/`)

| File | Author | Purpose / gate consuming it |
| --- | --- | --- |
| `draft-fr.md` | me (author) | FR article; draft.validate, grounding-fr, style-fr scan, difficulty |
| `draft-en.md` | me (author) | EN article; same, + editorial judge reads its body |
| `claim_source_map.json` | me (author) | provenance; review, factcheck, grounding, source_quality |
| `style-fr.json` | style-auditor sub-agent | humanize verdict-fr |
| `style-en.json` | style-auditor sub-agent | humanize verdict-en |
| `factcheck-fr.json` | fresh fact-check sub-agent | factcheck-fr gate |
| `factcheck-en.json` | fresh fact-check sub-agent | factcheck-en gate |
| `editorial.json` | fresh editorial judge sub-agent | editorial gate (EN only) |
| `source_quality.json` | fresh source-quality judge sub-agent | source_quality gate |
| `review.json` | written by `review check` CLI | self-check artifact (inert to cpe) |

`draft.py`/`review.py`/`humanize.py`/gate modules are READ-ONLY here — no edits.

## 2. Authoring order and content

### 2.1 Write `draft-en.md` first (the canonical realization the editorial judge reads)

Frontmatter (note `difficulty: 3` unquoted int):
```
---
lang: en
translationKey: coding-agent-harness-not-capability
slug: coding-agents-fail-at-the-harness-not-the-model
title: Coding Agents Fail at the Harness, Not the Model
tags:
  - agentic-coding
  - agents
category: essays
difficulty: 3
---
```

Body — target 1200-1500 words (essay band; prior successful essay was ~1250). LEAD
paragraph opens on the stance/stakes, thesis in the FIRST sentence, self-contained,
point lands before ~180 chars (the dek is derived from it). NO "X is/does Y" opener. Put
one cited number in the lead block. Draft the lead so its first sentence is the
allocation thesis (e.g. "The next model release will not fix your coding agent, because
the failures that cost you are not intelligence failures..."). Mark the opinion as mine
("I think", "in my experience") so the fact-check reads it as opinion, not an uncited
claim.

Section outline (`##` depth-2 headings build the TOC rail; follow the brief's outline):

1. **The reflex is "wait for a smarter model," aimed at the wrong layer** — states the
   contestable take; names the two studies at a high level (c1 → cite [s1] and [s2]).
2. **What the field study found: the expensive failures are invisible** — 90.50% impose
   effort/trust cost, 91.49% still need explicit user correction, growing classes are
   constraint violations + inaccurate self-reporting (c2 → [s1]). Every number cited.
   My thought on top of the fact: the costly failures are the ones dashboards don't show.
3. **What the benchmark isolates: failures scale with codebase size and tooling, not IQ**
   — ~400,000 LOC degradation; the 96-calls/84-min/0.32 → 5-calls/4.4-min/0.68 refactor;
   "infrastructure, not model intelligence" (c3 → [s2]). Frame these as current-generation
   evidence, not constants.
4. **"But models keep getting better, so this self-corrects"** — the STEELMAN. State the
   strongest case fairly (a stronger model plans searches better, mitigates the LOC
   threshold, self-corrects; future models may internalize retrieval and shrink the
   self-reporting gap). Then ANSWER it with the scoped structural sub-claim: an agent
   cannot report a violation whose evidence its harness never surfaces — that is
   information-availability, not reasoning capacity, so capability does not close it; and
   the allocation call is scoped to THIS quarter, so "future models may help eventually"
   does not move today's spend (c4 → [s1] and [s2]). This is the depth-mandate steelman.
5. **The so-what: retrieval, guardrails, and measuring trust-cost failures, this quarter**
   — the concrete decision. Name the failure mode teams under-count. This is the
   practitioner call.

Constructs (use ONLY where earned; never fabricate; never open the body):
- **One VERDICT PAIR** in §4 to separate what the sources ESTABLISH from what I INFER:
  `> [!CONFIRMED]` states the sourced fact (growing classes are self-reporting +
  constraint violations while overall rates fall) and carries its `[s1]`; immediately
  followed (one blank line) by `> [!INFERRED]` = my judgment that added capability cannot
  close a harness-observability gap — **SOURCE-FREE: no `[sN]`, and NOT a
  claim_source_map entry** (marked as my inference). Citing a source on the INFERRED side
  would fail grounding (dangling) / the inference-must-be-source-free rule.
- **One `> [!WARNING]` or `> [!TIP]` callout** lifting the practitioner caveat in §5
  (e.g. that green dashboards hide the trust-cost failures; instrument for them). Marker
  in English both languages; body in the article's language. Do NOT move a load-bearing
  cited claim into a callout.
- **Consider a small table** in §3 only if it earns it (baseline vs better-search:
  tool-calls / minutes / score). This is a genuine multi-dimension comparison of the s2
  numbers, so a 2-row GFM table with an ASCII-hyphen alignment row is legitimate. Both
  numbers are `[s2]`. Author the SAME table in FR. If it reads as padding, drop it and
  keep the numbers in prose (faithfulness outranks polish).

Inline citations: `[s1]` / `[s2]` immediately where the sourced fact appears, citation
PRECEDING the prose point per house §4. Every load-bearing NUMBER carries its `[sN]`.

AI-tell pre-emption while drafting (so style-auditor returns `clean` on round 1): no
em-dashes at all (use commas/parens/semicolons/colons per house §3); no stock lead-ins
("It is worth noting", "Notably", "delve into", "in the realm of"); no hedging stacks;
no over-signposting ("First… Next… Finally…"); no restatement padding; vary sentence
length (follow a long qualified sentence with a short blunt one) at least once per
section; no textbook definitional opener anywhere.

### 2.2 Write `draft-fr.md` — parallel authored, NOT a translation

Same argument, same numbers, same source_ids, same constructs (CONFIRMED/INFERRED pair,
callout, table if kept), same difficulty/category/translationKey. Restructure for French
syntax; native connectors ("or", "en revanche", "d'ailleurs", "cela dit"); idiomatic
technical register. Avoid calques (not "un défaut robuste" → "une valeur par défaut
fiable"; not transliterated clause order). If a FR sentence reads like EN with French
words, rewrite.

FR frontmatter differs only in localized fields:
```
---
lang: fr
translationKey: coding-agent-harness-not-capability
slug: les-agents-echouent-au-niveau-du-harnais-pas-du-modele
title: Les agents de code échouent au niveau du harnais, pas du modèle
tags:
  - agentic-coding
  - agents
category: essays
difficulty: 3
---
```

**FR diacritics are load-bearing and gate-checked.** Every accent in title, headings, and
body: modèle, fenêtre, problème, découper, écart, réduit, démontre, déplace, désormais,
moitié, pénalité, défaillance, écriture, etc. The `slug` is the ONLY ASCII field. Note
`_FR_DEACCENTED` in `humanize.py` will flag bare `modele/probleme/ecart/reduit/decouper/
demontre/deplace/desormais/moitie/penalite/defaillance/economie/ecriture/...` — write the
accents. English source labels inside `claim_source_map.json` are NOT scanned (only FR
title+body), so quoting the English s1/s2 labels is fine.

The English GitHub-alert markers (`[!CONFIRMED]`, `[!INFERRED]`, `[!WARNING]`) stay in
English in the FR draft (the renderer keys on them); the alert BODY is French.

### 2.3 Write `claim_source_map.json`

Shape: `{"claims": [...], "sources": [...]}` (validated by
`contracts/claim_source_map.py`). 

- `sources`: the two records s1, s2 copied VERBATIM from `candidates.json` (label, url,
  retrieved_at, excerpt; `source_date` for s1 only). No new ids.
- `claims`: one entry per load-bearing claim, in BOTH languages. Each entry
  `{"lang": "en"|"fr", "claim": "<the claim as stated in that language>", "source_id":
  "s1"|"s2"}`. **Omit `excerpt_span`** (optional; whole excerpt supports).
- Coverage requirement (review gate): EN claims must include ≥1 with source_id s1 AND ≥1
  with s2; FR likewise. Map the skeleton: c1(s1,s2), c2(s1), c3(s2), c4(s1,s2) → in
  practice author ~4-5 EN claims and ~4-5 FR claims such that both s1 and s2 are each
  cited at least once per language. Every `[sN]` cited inline in a body MUST have a
  backing claim of that source_id in that language, and vice-versa (grounding + review).
- **Do NOT create a claim for the INFERRED verdict-card content** — inferences are
  source-free by construction and must not appear in the map (source_quality/grounding
  contract).
- Sanity: `python3 -m pipeline.contracts.claim_source_map --validate <abs csm path>` →
  `OK` before running the stage gates.

## 3. Self-gate sequence (run from repo_root with PYTHONPATH; run-dir absolute)

Run in this order, fixing until each is green (all commands prefixed
`PYTHONPATH=/Users/rachid/dev-env/0-git/my-blog`; run-dir
`/Users/rachid/dev-env/0-git/my-blog/pipeline/runs/2026-07-02`):

1. `python3 -m pipeline.stages.draft validate --run-dir <run>` → prints `OK`
   (frontmatter completeness, fr/en parity on translationKey/category/difficulty, csm
   structural integrity).
2. `python3 -m pipeline.stages.review check --run-dir <run>` → MUST print
   `## Verdict: APPROVED`. If `NEEDS_REVISION`, the printed problems name the uncovered
   skeleton source_id or the fr/en parity gap; fix the csm (add the missing-language
   claim on that source_id) and re-run. Writes `review.json`.

## 4. Humanize (role 4b) — per language, auditor ≠ editor

For EACH language draft:

1. Invoke the global **style-auditor** sub-agent as AUDITOR ONLY (it flags, does not
   rewrite). Hand it the context label (verbatim from the task):
   > context: "personal practitioner AI-engineering blog post; no emoji; no em-dashes
   > (U+2014, the long dash, banned outright). voice per pipeline/house_style.md. Flag
   > specifically: any em-dash; flat definitional or textbook leads (X is/does Y openers,
   > field-describing intros); a missing opinionated stance (neutral explainer prose with
   > no take); the absence of a concrete number, command, or named failure mode in the
   > argument; and, for the FR draft, French that reads like a translation of English
   > (calqued clause order, literal idioms like un defaut robuste)."
   Also point it at `/Users/rachid/dev-env/0-git/my-blog/pipeline/house_style.md` and the
   draft file. Save its JSON to `style-fr.json` / `style-en.json`.
2. If verdict != `clean`: dispatch a SEPARATE revise agent that applies ONLY the
   `suggested_fix` edits (preserving meaning + citations + numbers + `[sN]`), then
   re-invoke style-auditor to re-check. Up to `MAX_HUMANIZE_ROUNDS` = 2 rounds. Never let
   the same agent both rewrite and judge.
   - [MEM: style-auditor-maximalist-restatement] The style-auditor tends to flag any
     synthesizing closer as "restatement padding"; if that is the only remaining flag,
     calibrate by tightening/cutting the closer rather than fighting it — it took 3 rounds
     before on a similar piece. Keep closers earning their place.
   - [MEM: humanize-cli-one-path-per-call] `humanize scan`/`verdict` take ONE path arg
     each — never a list.
3. Deterministic gates per language (all exit 0):
   - `python3 -m pipeline.stages.humanize scan <abs draft-fr.md>` → `OK`
   - `python3 -m pipeline.stages.humanize scan <abs draft-en.md>` → `OK`
   - `python3 -m pipeline.stages.humanize verdict <abs style-fr.json>` → `verdict: clean`
   - `python3 -m pipeline.stages.humanize verdict <abs style-en.json>` → `verdict: clean`
   - Extra safety: the FR-diacritics rule (`fr_diacritic_violations`) is enforced through
     the style gate path; also eyeball the FR body against the `_FR_DEACCENTED` list.

## 5. Fact-check (role 4 / FR-C1) — judge ≠ author, per language

- Dispatch a SEPARATE fresh general-purpose sub-agent (clean context). It does NOT see
  the draft prose, the brief, or that I authored the claims. Hand it ONLY, per language,
  the list of `{claim, source_id}` from the csm paired with each mapped source's
  `excerpt` (from `sources[]`).
- For each claim it judges semantically (cross-language allowed: a FR claim may be backed
  by the English s1/s2 excerpt) whether the EXCERPT supports the CLAIM → `supported:
  true|false` + one-line reason.
- The sub-agent WRITES `factcheck-fr.json` and `factcheck-en.json` (I do NOT write them or
  override): `{"verdict": "supported"|"unsupported", "claims": [{"claim","source_id",
  "supported": <bool>, "reason"}]}`; verdict is "unsupported" iff any claim
  `supported:false`. Every claim's `supported` MUST be a real boolean and present (parser
  raises otherwise).
- Gates:
  - `python3 -m pipeline.gate.factcheck --run-dir <run> --lang fr` → `OK`
  - `python3 -m pipeline.gate.factcheck --run-dir <run> --lang en` → `OK`
- If any claim is `supported:false`: RE-SOURCE or CUT that claim (and its inline `[sN]` +
  csm entry) — do NOT fabricate support and do NOT override the judge. Since every claim
  is a near-verbatim restatement of the s1/s2 excerpts, all should come back supported;
  the risk is a claim that overreaches the excerpt (e.g. stating the structural sub-claim
  as if the source proved it — keep that as an INFERRED card, not a claim).
- CITATION CONVENTION: source_ids `s`+digits, inline `[s1]`; grounding keys on exactly
  that shape.

## 6. Grounding gate (FR-C2) — per language (default fake link-checker)

- `python3 -m pipeline.gate.grounding --run-dir <run> --lang fr` → `OK`
- `python3 -m pipeline.gate.grounding --run-dir <run> --lang en` → `OK`
- Passes when: both s1 and s2 (each backing a claim) are cited inline `[s1]`/`[s2]` in
  each body; no `[sN]` in a body is missing from the map; both URLs reachable (fake
  checker treats non-listed URLs as reachable). Both arxiv/sourcegraph URLs are live.

## 7. Editorial-quality judge (G3) — fresh judge on the EN draft only

- Dispatch a FRESH general-purpose sub-agent (clean context) as the editorial judge. It
  does NOT see the FR draft, the csm, or that I authored this. Hand it ONLY the brief's
  ANGLE + OUTLINE and the EN draft BODY as the finished article.
- It WRITES `editorial.json` (I do not write/override): `{"verdict":
  "publishable"|"thin", "issues": [{"dimension":
  "non_obviousness"|"angle"|"structure", "note": "..."}], "reason": "..."}`.
- Judges: NON-OBVIOUS (says something a knowledgeable reader didn't already hold), ANGLE
  sound, STRUCTURE earns the length. "thin" iff obvious/incoherent/unearned.
- Gate: `python3 -m pipeline.gate.editorial --run-dir <run>` → `OK`.
- MANDATE BOUNDARY: judges CRAFT, not the thesis-as-claim (that was argue/G1). A 'thin'
  verdict is NOT fixable by re-drafting — it burns one repair round then the run falls
  back to a new topic. To PASS on the first try, the piece must clear the interesting bar:
  the structural-observability reframe (§4) and the this-quarter allocation call (§5) are
  the non-obvious moves; make sure they are the SPINE, not decoration, and that the
  steelman is a real objection genuinely answered (not a strawman).

## 8. Source-quality judge (G2) — fresh judge on the cited source SET

- Dispatch a FRESH general-purpose sub-agent (clean context) as the source-quality judge.
  It does NOT see the draft prose, brief, or authorship. Hand it ONLY the csm `sources[]`
  (each `label`, `url`, `excerpt`, `source_date`) + the list of `{claim, source_id}`
  pairs.
- It WRITES `source_quality.json` (I do not write/override): `{"verdict":
  "sound"|"unsound", "claims": [{"source_id", "primary": <bool>, "authoritative":
  <bool>, "corroborated": <bool>, "note": "..."}], "reason": "..."}`. Every per-claim
  entry MUST contain all four required keys (`source_id, primary, authoritative,
  corroborated`) or the parser raises and the gate blocks even on 'sound'. One entry per
  distinct source_id (s1, s2).
- Judges per source: primary vs secondary, authority of origin, independent corroboration
  among the OTHER cited sources. Booleans are DESCRIPTIVE (a sound secondary source with
  primary=false still passes); only the verdict blocks.
- Gate: `python3 -m pipeline.gate.source_quality --run-dir <run>` → `OK`.
- Expected: both are primary for their own study, arXiv (s1) and Sourcegraph engineering
  (s2) are authoritative for this technical claim, and they corroborate each other
  (independent designs — observational field study vs controlled benchmark — reaching the
  "harness not intelligence" conclusion). This is exactly the two-independent-origins
  structure that passes G2 and that argue's G4 independence gate already cleared. → 'sound'.

## 9. Difficulty gate (deterministic)

- `python3 -m pipeline.gate.difficulty --run-dir <run>` → `OK` (both drafts carry
  integer `difficulty: 3`, fr == en). Satisfied by the frontmatter in §2.

## 10. Full nine-gate green checklist (all must pass before task-draft is done)

1. `factcheck-fr` — §5
2. `factcheck-en` — §5
3. `grounding-fr` — §6
4. `grounding-en` — §6
5. `style-fr` (scan + verdict clean) — §4
6. `style-en` (scan + verdict clean) — §4
7. `editorial-quality` (EN, publishable) — §7
8. `source-quality` (sound) — §8
9. `difficulty-rating` (int 1-5, fr==en) — §9

Plus the two self-gates that unblock the loop: `draft validate` OK and `review check`
APPROVED (§3).

## 11. Dependencies / ordering

- csm + both drafts must exist before ANY gate runs (draft validate loads all three).
- review check depends on csm coverage matching the skeleton union {s1,s2} per language.
- humanize/style depends on final draft prose (run AFTER any content edits; re-run scan
  after every edit that could introduce an em-dash/emoji/deaccented FR word).
- fact-check / editorial / source-quality sub-agents read the FINAL drafts + csm — dispatch
  them AFTER §3 and §4 are green, else a later prose edit invalidates their JSON and they
  must be re-run.
- If a gate fails, edit the driving artifact and re-run that gate AND every downstream
  gate whose input changed (e.g. editing a claim → re-run review, factcheck, grounding,
  and if prose changed, style + editorial).

## 12. Risks / edge cases

- **INFERRED card leakage**: putting a `[sN]` on the INFERRED side, or adding a
  claim_source_map entry for the inference → grounding "dangling" or a source_quality/
  factcheck mismatch. Keep the INFERRED card source-free and out of the map. HIGHEST-risk
  item because the whole argument hinges on separating the sourced facts (CONFIRMED) from
  the structural sub-claim (INFERRED).
- **Overreaching claims**: writing c4 as "a smarter model CANNOT fix this" (absolute) in a
  csm CLAIM would fail fact-check (the excerpts don't prove the universal). State the
  absolute-sounding sub-claim only as INFERRED / opinion in prose; in the csm keep claims
  to what the excerpts literally support (the descriptive facts + "infrastructure not
  intelligence" which s2 states verbatim).
- **Em-dash / FR accents** [MEM: no-em-dashes-blog-directive]: zero em-dashes anywhere;
  the deterministic gate is unforgiving. FR accents on every word; `_FR_DEACCENTED` will
  catch common misses. Re-run `humanize scan` on both files after final edits.
- **difficulty as string**: `difficulty: "3"` (quoted) coerces to 0 → validate fails.
  Emit an unquoted int.
- **Tag drift**: only `agentic-coding`/`agents` (verified in `src/content/tags/index.json`).
  Never localize the id or invent one, or the production build (not this stage) breaks
  [MEM: first-autonomous-article-and-build-gate-gap].
- **style-auditor stalling / maximalism** [MEM: style-auditor-maximalist-restatement]:
  pre-empt tells on the first pass; if only a "restatement padding" flag on the closer
  remains after 2 rounds, cut the closer to a single blunt sentence.
- **Number fidelity** [MEM: arxiv-version-drift-false-fabrication]: copy 90.50 / 91.49 /
  400,000 / 96 / 84 / 0.32 / 5 / 4.4 / 0.68 / 20,574 / 1,639 / 1,281 EXACTLY from the
  excerpts; every one is a cited load-bearing claim. Do not round or paraphrase a figure.
- **Judge ≠ author discipline**: I never write factcheck/editorial/source_quality JSON
  myself and never override a verdict. A 'thin' editorial verdict is terminal for this
  topic (falls back to a new topic), so the piece must clear the interesting bar on the
  first authored pass.
```
