# Plan — task `draft`: FR+EN draft + claim→source map + M-4/G2/G3 gates

Run dir (cwd): `/Users/rachid/dev-env/0-git/my-blog/pipeline/runs/2026-07-01`
Repo root: `/Users/rachid/dev-env/0-git/my-blog`
Topic: `mcp-tool-poisoning-client-trust-boundary` (an **essay**, not lesson mode — `chosen_topic_id` does NOT start with `lesson-`).

This is a content-authoring stage wrapped in cpe's plan→execute. The "implementation" is
producing five artifacts under `plans/task-draft/` and making nine deterministic/judge
gates pass. This plan pins the exact content decisions, artifact shapes, sub-agent
dispatches, and command sequence so execution is mechanical.

---

## 0. Inputs already read (ground truth for execution)

- **brief.md** — angle + single-row outline + claim skeleton `c1 (s1, s2)`.
- **argument.json** — `strengthened_argument`: *do not* argue MCP invented prompt
  injection; argue MCP made a known-dangerous pattern the **default** and pushed the
  defense burden onto the wrong party (thin-forwarder clients). The `strongest_attack`
  ("just generic prompt injection wearing an MCP badge") is the steelman the draft MUST
  state and answer.
- **candidates.json** (research) — the two captured sources with verbatim excerpts:
  - `s1` arXiv 2603.22489 "MCP Threat Modeling…Tool Poisoning", `source_date` 2026-03-23.
    Excerpt establishes: tool poisoning = **most prevalent and impactful client-side
    vulnerability**; systematic comparison of **seven major MCP clients**; most clients
    have significant issues from **insufficient static validation and parameter
    visibility**.
  - `s2` CSA Research Note "MCP Security Crisis", `source_date` 2026-05-04. Excerpt:
    **reference implementation ships without guard rails**; majority of developers have
    no security baseline.
- **house_style.md**, **difficulty_rubric.md** — read; constraints folded in below.

### 0.1 CRITICAL RISK — tag vocabulary mismatch [MEM: first-autonomous-article-and-build-gate-gap]

`candidates.json` lists this topic's tags as `["agents", "security", "mcp"]`, but the
**controlled vocabulary** in `src/content/tags/index.json` is exactly:

```
agents, rag, agentic-coding, evaluation, llm-oss, retrieval, qualite
```

`security` and `mcp` DO NOT EXIST there. Using them passes every pipeline gate and
`astro check` but **fails the production build** (closed enum). **Decision: tags =
`[agents]`** (the only clean fit; optionally add `agentic-coding`, but `agents` alone is
safest and the frontmatter schema requires only ≥1). Same ids in fr and en. Do NOT copy
`candidates.json`'s tags.

---

## 1. Content decisions (pin before writing)

| Field | Value | Rationale |
| :--- | :--- | :--- |
| `category` | `essays` | An argued/opinion take (trust-boundary inversion), defended. |
| `difficulty` | `3` | Intermediate practitioner: assumes agent/MCP/tool-use fluency and a security-threat-model vocabulary, no heavy math/code. Rubric level 3 (all three axes hold); round-up rule keeps it off 2. IDENTICAL fr/en. |
| `translationKey` | `mcp-tool-poisoning-client-trust` | IDENTICAL both files (NFR-11 parity join). |
| `tags` | `[agents]` | Controlled vocab only (§0.1). Same ids fr/en. |
| `slug` (en) | `mcp-moved-the-trust-boundary-to-the-client` | ASCII, localized. |
| `slug` (fr) | `mcp-a-deplace-la-frontiere-de-confiance-vers-le-client` | ASCII (slug is the ONE deliberately-ASCII field). |
| `title` (en) | `MCP Won on Simplicity and Moved the Trust Boundary to the Client` | |
| `title` (fr) | `MCP a gagné par la simplicité et déplacé la frontière de confiance vers le client` | Every accent load-bearing (`gagné`, `simplicité`, `déplacé`, `frontière`). |

### 1.1 The one load-bearing argument (shape from `strengthened_argument`)

> MCP's reference SDKs forward server-authored tool metadata into the model context
> **without validation**; that metadata is **model-visible yet UI-hidden**; and the
> clients expected to police it were built as **thin forwarders**. Therefore the trust
> boundary is inverted **by default, not by misuse**. The fix is client-side (static
> metadata analysis, decision-path tracking, runtime display of descriptions); there is
> no upstream server patch to wait for.

Anchors (house_style §1: at least one concrete number / command / named failure mode):
- **Number**: "seven major MCP clients" compared [s1]; STRIDE/DREAD ranks tool poisoning
  the most prevalent client-side vulnerability [s1].
- **Named failure mode**: **tool poisoning** — coercive instructions embedded in tool
  metadata the model reads but the UI rarely renders.
- Root-cause: reference implementation ships **without guard rails** [s2].

### 1.2 Steelman to answer (house_style §5 depth mandate, from argument.json)

State fairly, then refute: *"Tool poisoning is textbook indirect prompt injection, a
class older than MCP and shared by every tool-use framework (OpenAI function calling,
LangChain tools). Attributing it to MCP is a near-tautology."* Refutation (the
reconciliation): MCP did not invent the primitive; it made the known-dangerous pattern
the **low-friction, ecosystem-wide default** and shipped reference SDKs **without
guardrails**, so the same weakness replicates across **every conforming client** — a
different risk class than one app's bug. This is a falsifiable structural claim (where
the boundary sits, who defends it, what the SDK ships), not the abstract tautology.

### 1.3 Section outline (expand the brief's single row into real `##` sections)

Lead paragraph (no `##`, first block, is the dek source — thesis in sentence 1, ≤180
chars to the first period-ish cut, block stands alone; NO "MCP is a protocol that…"
definition opener). Then:

1. `## The boundary moved and nobody re-checked` — mechanism: server authors
   model-visible/UI-hidden text; client forwards verbatim; cite s1's prevalence finding.
2. `## Tool poisoning, concretely` — the named failure mode; seven-client comparison,
   insufficient static validation + parameter visibility [s1]. A `> [!WARNING]` callout
   lifting the UI-hidden-metadata pitfall.
3. `## "This is just prompt injection"` — the steelman (§1.2), stated fairly then
   answered (default-vs-misuse, ecosystem scale, SDK ships without guardrails [s2]).
4. `## The fix is client-side` — static metadata analysis, decision-path tracking,
   runtime display; no server patch to wait for. Optional **verdict pair**:
   `> [!CONFIRMED]` (s1's seven-client / most-prevalent finding, carries [s1]) then
   `> [!INFERRED]` (practitioner judgment: treat every tool description as untrusted
   input; SOURCE-FREE, no [sN], no map entry).

Length: essay target **1200–1800 words**, earned by the four sections (not padded).
Vary sentence length; at least one long→short break per section. Use ONE `> [!…]`
callout and at most one verdict pair — only where earned. First block is always the
lead paragraph; no construct opens the body.

### 1.4 Parity rules the draft must honour (enforced downstream)

- Same set of cited `[sN]` in fr and en: both cite **[s1] and [s2]** (review.py set
  equality + grounding). Any `[sN]` a callout/verdict adds must appear in BOTH languages.
- `translationKey`, `category`, `difficulty` identical fr/en (draft.validate + difficulty
  gate). `slug`/`title`/`tags` localized but tag **ids** identical.
- French: write as a French engineer (restructure, native connectors "or/en
  revanche/d'ailleurs"; no calqued clause order, no "un défaut robuste"). Every accent
  present in **title, headings, and body** (fr diacritics gate scans title+body). The
  deny-list that will bite includes `modele/fenetre/probleme/decouper/deplace/…` — write
  `modèle/fenêtre/problème/découper/déplace`.
- No em-dash (U+2014) anywhere in either file (frontmatter included); no emoji. GFM
  alert markers stay English (`[!WARNING]`, `[!CONFIRMED]`, `[!INFERRED]`) in both langs.

---

## 2. Artifacts to CREATE (all under `plans/task-draft/`)

Order matters: draft bodies → claim map → self-gates → humanize → judge sub-agents → gates.

### 2.1 `draft-en.md` and `draft-fr.md`

Frontmatter fence with author-time keys exactly: `lang, translationKey, slug, title,
tags, category, difficulty` (values per §1). Then the body per §1.3.

Reference exemplar (structure/register/construct usage, already in repo):
`pipeline/runs/2026-06-30/plans/task-draft/draft-en.md`.

### 2.2 `claim_source_map.json` (contract: `pipeline/contracts/claim_source_map.py`)

Shape `{"claims":[…], "sources":[…]}`. Rules:
- `sources[]` = **s1 and s2 copied verbatim** from `candidates.json` (`source_id, label,
  url, retrieved_at, excerpt, source_date`). Do NOT re-author excerpts; the fact-check
  and source-quality judges read them.
- `claims[]` = for EACH language, a `{lang, claim, source_id}` entry for every
  load-bearing claim, **covering both s1 and s2 in fr AND en** (review.py requires the
  skeleton ids `{s1,s2}` covered per language and fr set == en set).
- **Reuse ids s1/s2 only** — minting a new id makes review compute every skeleton id
  uncovered and thrashes the loop.
- **Omit `excerpt_span`** (like the 2026-06-30 exemplar): it is optional, and omitting it
  sidesteps off-by-one bounds errors in `_validate_span`; the provenance backstop only
  checks a span when present.
- Minimum per language: one claim on s1 (seven-client / most-prevalent tool poisoning)
  and one on s2 (reference SDK ships without guardrails). Add the 2–3 other load-bearing
  body claims, each mapped to whichever of s1/s2 backs it. FR claim text is written in
  French (accents in the map body are fine but not gate-scanned; the fr diacritics gate
  reads the draft, not this file).

### 2.3 `review.json`, `style-fr.json`, `style-en.json`, `factcheck-fr.json`,
`factcheck-en.json`, `editorial.json`, `source_quality.json`

- `review.json` — written by `review check` itself (do not hand-author).
- `style-{fr,en}.json` — written by the **style-auditor** sub-agent (§4).
- `factcheck-{fr,en}.json` — written by the **fact-check** sub-agent (§5).
- `editorial.json` — written by the **editorial** judge sub-agent (§6).
- `source_quality.json` — written by the **source-quality** judge sub-agent (§7).

None of the judge/auditor JSONs are hand-authored by the drafting agent (judge != author;
overriding a verdict defeats the gate).

---

## 3. Self-gates on the draft + map (fix until clean)

Run from repo root with `PYTHONPATH=/Users/rachid/dev-env/0-git/my-blog`:

1. `python3 -m pipeline.stages.draft validate --run-dir <run-dir>` → must print `OK`.
   Catches: missing/invalid frontmatter key, tags empty, translationKey/category/
   difficulty parity, claim_source_map structural integrity.
2. `python3 -m pipeline.stages.review check --run-dir <run-dir>` → must print
   `## Verdict: APPROVED`. Catches: skeleton `{s1,s2}` not covered per language, fr/en
   coverage-set mismatch.

Iterate the draft/map until both pass **before** invoking any sub-agent (cheap
deterministic checks first).

---

## 4. Humanize (role 4b) — style-auditor as AUDITOR ONLY, per language

For each of en, fr:
1. Dispatch the **`style-auditor`** sub-agent (Agent tool, `subagent_type:
   style-auditor`). Give it the draft file path, point it at
   `pipeline/house_style.md`, and pass the context label verbatim from the task
   description (personal practitioner AI-engineering blog; no emoji; no em-dashes U+2014;
   flag flat definitional/textbook leads, missing opinionated stance, absent concrete
   number/command/failure mode, and — FR only — French that reads like translated
   English / calqued clause order / "un défaut robuste"). Save its JSON to
   `style-{lang}.json`.
2. If verdict ≠ `clean`: dispatch a **separate revise** sub-agent (general-purpose) that
   applies ONLY the `suggested_fix` edits, preserving meaning + every `[sN]` citation, in
   place in `draft-{lang}.md`; then re-invoke `style-auditor` and overwrite
   `style-{lang}.json`. Up to **2 rounds** (`MAX_HUMANIZE_ROUNDS`). Never let one agent
   both rewrite and judge.
3. Deterministic + verdict gates (must all pass):
   - `python3 -m pipeline.stages.humanize scan …/draft-fr.md` → `OK`
   - `python3 -m pipeline.stages.humanize scan …/draft-en.md` → `OK`
   - `python3 -m pipeline.stages.humanize verdict …/style-fr.json` → exit 0 (`clean`)
   - `python3 -m pipeline.stages.humanize verdict …/style-en.json` → exit 0 (`clean`)

`scan` enforces no-emoji + no-em-dash deterministically; write clean on the first pass so
these never fire.

---

## 5. Fact-check (role 4 / FR-C1) — fresh sub-agent, judge != author

1. Dispatch a **fresh general-purpose** sub-agent per language. Hand it ONLY the list of
   `{claim, source_id}` for that `lang` from `claim_source_map.json`, each paired with the
   mapped `sources[].excerpt`. Do NOT give it the prose, the brief, or the authorship
   fact.
2. It judges semantically (cross-lingual entailment allowed: a FR claim may be backed by
   the English s1 excerpt) whether each excerpt supports its claim; assigns
   `supported: true|false` + one-line `reason`.
3. It **writes** `factcheck-{lang}.json` shaped
   `{"verdict":"supported"|"unsupported","claims":[{"claim","source_id","supported":<bool>,"reason"}]}`
   where `verdict` is `"unsupported"` iff any claim is `supported:false`. The drafting
   agent does not write or override these.
4. Gate:
   - `python3 -m pipeline.gate.factcheck --run-dir <run-dir> --lang fr` → `OK`
   - `python3 -m pipeline.gate.factcheck --run-dir <run-dir> --lang en` → `OK`
   The gate BLOCKS on any `supported:false`, a missing findings file, or a claim missing
   the `supported` boolean. If a claim is unsupported, RE-SOURCE or CUT it (fix the draft
   + map), never fabricate support; then rerun §3 review.

Citation convention (producer/consumer agreement): ids are `s`+digits, cited inline as
`[s1]`; grounding keys its dangling-citation regex on exactly `[sN]`.

## 5b. Grounding self-check (deterministic; part of the nine gates via task 26)

- `python3 -m pipeline.gate.grounding --run-dir <run-dir> --lang fr` → `OK`
- `python3 -m pipeline.gate.grounding --run-dir <run-dir> --lang en` → `OK`
Default `--link-check fake` treats all URLs reachable. Catches: a cited source id NOT
appearing as `[sN]` in the body, a `[sN]` in the body with no map source. Ensures both
s1 and s2 appear inline in both bodies.

---

## 6. Editorial-quality judge (G3) — fresh sub-agent, EN draft only

1. Dispatch a **fresh general-purpose** sub-agent (clean context). Hand it ONLY the
   brief's **angle + outline** and the **EN draft body** as the finished article. Not the
   FR draft, not the claim map, not the authorship fact.
2. It decides: non-obvious (says something a knowledgeable reader did not already hold),
   angle sound, structure earns the length. It **writes** `editorial.json` shaped
   `{"verdict":"publishable"|"thin","issues":[{"dimension":"non_obviousness"|"angle"|"structure","note"}],"reason"}`.
3. Gate: `python3 -m pipeline.gate.editorial --run-dir <run-dir>` → `OK` (BLOCKS on
   `thin` or missing file).
4. **Mandate boundary**: G3 judges craft, not the thesis-as-claim (that was argue/G1). A
   `thin`/obvious verdict is NOT fixable by redrafting — it burns one gate-repair round,
   then the run correctly falls back to a new topic. So the draft must be genuinely
   non-obvious on the first pass (lean on the trust-boundary-inversion framing, not a
   generic "prompt injection is bad" recap).

---

## 7. Source-quality judge (G2) — fresh sub-agent, cited-source SET

1. Dispatch a **fresh general-purpose** sub-agent. Hand it ONLY the `sources[]`
   (label/url/excerpt/source_date) and the `{claim, source_id}` pairs — NOT the prose,
   brief, or authorship fact.
2. Per source it assesses primary vs secondary, authority of origin, and independent
   corroboration among the OTHER cited sources. It **writes** `source_quality.json` shaped
   `{"verdict":"sound"|"unsound","claims":[{"source_id","primary":<bool>,"authoritative":<bool>,"corroborated":<bool>,"note"}],"reason"}`.
   Every per-claim entry MUST contain all four keys `source_id/primary/authoritative/
   corroborated` (parser RAISES on a dropped boolean even on a `sound` verdict). Booleans
   are DESCRIPTIVE — a sound secondary source (`primary:false, authoritative:true,
   corroborated:true`) passes; only the `unsound` verdict blocks.
3. Gate: `python3 -m pipeline.gate.source_quality --run-dir <run-dir>` → `OK`.
4. **Expected shape**: s1 = primary, authoritative (peer-style arXiv threat-model paper),
   corroborated by s2; s2 = secondary (CSA research note), authoritative (recognized
   security org), corroborated by s1. Two independent origins → verdict `sound`.
   **Risk**: if the judge deems s2 non-authoritative/single-origin it returns `unsound`
   and blocks; this is a real gate (correctly), so the sources must genuinely
   corroborate. They do (independent methods, same conclusion), so first-pass `sound` is
   expected.

---

## 8. Difficulty gate (deterministic; ninth gate)

- `python3 -m pipeline.gate.difficulty --run-dir <run-dir>` → `OK` (both drafts carry
  integer 1-5 `difficulty`, fr == en). Satisfied by §1's `difficulty: 3` in both files.

---

## 9. Full gate checklist (the nine that BLOCK) + run order

Green-path command sequence (all from repo root, `PYTHONPATH=<repo_root>`; `<run-dir>` =
`/Users/rachid/dev-env/0-git/my-blog/pipeline/runs/2026-07-01`):

1. Author `draft-en.md`, `draft-fr.md`, `claim_source_map.json`.
2. `draft validate` → OK; `review check` → APPROVED. (loop 1↔2)
3. style-auditor ×2 → `style-{fr,en}.json`; revise loop ≤2; `humanize scan` ×2 + `verdict`
   ×2. → **style-fr, style-en**
4. fact-check sub-agent ×2 → `factcheck-{fr,en}.json`; `gate.factcheck --lang {fr,en}`.
   → **factcheck-fr, factcheck-en**
5. `gate.grounding --lang {fr,en}`. → **grounding-fr, grounding-en**
6. editorial sub-agent → `editorial.json`; `gate.editorial`. → **editorial-quality (G3)**
7. source-quality sub-agent → `source_quality.json`; `gate.source_quality`.
   → **source-quality (G2)**
8. `gate.difficulty`. → **difficulty-rating**

The nine gates: factcheck-fr, factcheck-en, grounding-fr, grounding-en, style-fr,
style-en, editorial-quality (G3), source-quality (G2), difficulty-rating.

---

## 10. Risks / edge cases

- **Tag build-break (highest)** [MEM: first-autonomous-article-and-build-gate-gap]: never
  use `security`/`mcp`; only controlled-vocab ids. `[agents]`. Pipeline gates won't catch
  a bad tag — only the prod build would.
- **FR diacritics gate**: the deny-list includes `deplace`, `probleme`, `modele`,
  `decouper`, `fenetre`, `reduit`, `ecart`, `defaillance`, `desormais`… Write full accents
  in the FR title, headings, and body. The fr `slug` stays ASCII by design.
- **Editorial `thin` is non-recoverable by redraft**: the piece must be non-obvious on the
  first pass (trust-boundary inversion / default-not-misuse), or the slot yields to a
  fallback topic. Highest-leverage writing risk.
- **Source-quality `unsound`**: hinges on s1↔s2 corroboration; keep both cited in both
  languages so the "independent corroboration" reading holds.
- **Judge != author separation**: the drafting agent must NOT write or edit any of
  `style-*`, `factcheck-*`, `editorial.json`, `source_quality.json`, nor override a
  verdict. Each is a fresh sub-agent with the minimal, prose-free context the step
  specifies. Violating this is a silent rubber-stamp.
- **Parity thrash**: any construct that introduces a new `[sN]` must add it in BOTH
  languages; otherwise review.py set-equality flips to NEEDS_REVISION. Keep the cited set
  to exactly `{s1,s2}` in both.
- **excerpt_span**: omit it to avoid `_validate_span` off-by-one failures; provenance
  backstop is satisfied without it.
- **Privacy/secret hygiene (FR-D3)**: no secrets, private-repo internals, codenames, or
  third-party personal data in either draft or any field.
- **No emoji anywhere (D-007)**; keep GFM alert markers in English in both languages.

---

## 11. Files

- CREATE: `plans/task-draft/draft-en.md`, `draft-fr.md`, `claim_source_map.json`
- WRITTEN-BY-TOOL: `plans/task-draft/review.json`
- WRITTEN-BY-SUBAGENT: `style-fr.json`, `style-en.json`, `factcheck-fr.json`,
  `factcheck-en.json`, `editorial.json`, `source_quality.json`
- No source-code changes: this task consumes the existing stage/gate CLIs unchanged.
