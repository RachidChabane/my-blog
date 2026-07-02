# Review 1 — task-draft plan (2026-07-02 run)

## Verdict: APPROVED

The plan is a complete, accurate authoring recipe for the Draft+Review+Humanize+
Fact-check+Editorial+Source-quality stage. I verified every load-bearing contract claim
against the actual code and inputs; all check out. Safe to implement.

## What I verified (against the real codebase, not the plan's prose)

- **Sources**: `s1`/`s2` in the plan match `plans/task-research/candidates.json` for the
  `coding-agent-failures-in-the-wild` candidate VERBATIM (label, url, retrieved_at,
  excerpt; `source_date` present for s1, absent for s2). The numbers (90.50 / 91.49 /
  400,000 / 96 / 84 / 0.32 / 5 / 4.4 / 0.68 / 20,574 / 1,639 / 1,281) are copied exactly.
- **claim_source_map contract** (`contracts/claim_source_map.py`): `source_date` is
  `Optional` on `SourceRecord`, so omitting it for s2 is valid; `retrieved_at` is required
  (both sources carry `2026-07-02`); `excerpt_span` is optional (omitting it is valid, and
  the whole excerpt then supports the claim). Plan's "omit excerpt_span" decision is sound.
- **review.py** completeness is per-language `source_id` SET-equality against the skeleton
  union. Brief skeleton is c1[s1,s2], c2[s1], c3[s2], c4[s1,s2] → union `{s1,s2}`; the plan
  correctly requires each language to cite BOTH s1 and s2. Correct.
- **grounding.py**: keys on the exact `[s\d+]` regex; every source backing a claim in a
  language must appear inline in that body, and every `[sN]` in the body must resolve to a
  source in the map. Default `FakeLinkChecker` treats non-listed URLs as reachable. Plan
  correct.
- **factcheck.py**: `_claim_from_dict` RAISES if `supported` is absent or non-bool; gate
  blocks on any `supported:false` and on a missing findings file. Plan's judge≠author
  dispatch + shape are correct.
- **source_quality.py**: `SOURCE_QUALITY_REQUIRED_FIELDS = (source_id, primary,
  authoritative, corroborated)` — a dropped boolean RAISES even on a 'sound' verdict; booleans
  are descriptive (verdict-only pass). Plan §8 states this precisely.
- **draft.py validate**: required frontmatter keys match; `_int_field` coerces a quoted
  `'3'`/float to the 0 sentinel (so an unquoted int is mandatory); category/difficulty/
  translationKey parity enforced. Plan §2 frontmatter is compliant.
- **difficulty.py**: closed range 1-5 + fr==en parity, no `--lang`. Plan §9 correct.
- **humanize.py**: `parse_style_findings` accepts the real style-auditor JSON shape
  (`verdict` in `clean|suspicious|revision_needed`, optional `issues[]`); only `clean`
  passes; `fr_diacritic_violations` scans title+body (URLs stripped), not slug/labels — so
  quoting English source labels in the FR body is safe and the ASCII slug won't false-flag.
- **Tags**: `agentic-coding` and `agents` both exist in `src/content/tags/index.json`.
- **argument.json**: the plan's "structural not absolute" scoping of c4, the this-quarter
  allocation framing, and the "current-generation evidence not permanent constants"
  concession faithfully track `strengthened_argument` and `reconciliation`. Not a weaker
  re-derivation.
- **Lesson mode**: `chosen_topic_id` has no `lesson-` prefix; plan correctly treats this as
  a free-category essay. `category: essays` is defensible for an allocation-take piece.
- **MEM citations**: all five (`style-auditor-maximalist-restatement`,
  `humanize-cli-one-path-per-call`, `no-em-dashes-blog-directive`,
  `arxiv-version-drift-false-fabrication`, `first-autonomous-article-and-build-gate-gap`)
  resolve to live entries in MEMORY.md.

## Comments (non-blocking; the guidance is safe as written)

1. **INFERRED-card failure mechanism is slightly mis-stated** (§2.1 constructs, §12 risks).
   The plan says putting `[sN]` on the `> [!INFERRED]` side "would fail grounding
   (dangling)." That is not quite how `grounding.py` works: a `[s1]` on the INFERRED side
   would NOT dangle, because `s1` is present in the map's `sources[]` (the dangling check
   only fires for a `[sN]` with no matching source record). The real reasons to keep the
   INFERRED card source-free are the house-style / source_quality inference contract (an
   inference is opinion, never a claim_source_map entry) — not grounding. The plan's
   ACTION ("keep the INFERRED card source-free and out of the map") is correct and safe;
   only the stated failure path is imprecise. No change required to implement correctly.

2. **Privacy/secret hygiene (FR-D3, task step 9)** is not called out as its own item. Both
   sources are public (arXiv, Sourcegraph blog) and the piece has no secrets/PII, so risk is
   negligible, but a one-line "no secrets/private internals/third-party PII in either draft
   or any field" reminder would fully cover the task's step 9.

3. **style-auditor round budget**: §4 correctly caps at 2 revise rounds and pre-flags the
   maximalist-restatement failure mode via `[MEM: style-auditor-maximalist-restatement]`.
   Good — pre-empting tells on the first authored pass is the right call given a 'thin'
   editorial verdict is terminal for the topic.

## Bottom line

Complete coverage of the task, all nine blocking gates plus the two self-gates addressed,
ordering and judge≠author separation correct, every code-contract claim verified true. The
two comments are precision/completeness notes, not correctness or risk blockers. APPROVED.
