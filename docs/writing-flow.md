**Purpose:** The design of the autonomous writing engine — the specialized-agent crew that takes a scheduled run from "search the news" to "a fact-checked bilingual post is live," and how the roles hand off. This is the detailed design behind `content-pipeline.md` §2/§7 and the `M-3`/`M-4` build; it resolves the roster question ([OQ-14]). Read after `content-pipeline.md`.
**Status:** draft — last revised 10-06-2026.

## §1 Why this doc, and what it is modeled on

`content-pipeline.md` fixes the seven *stages*; this doc fixes the *agents* that carry them, their *hand-off artifacts*, their *round caps*, and the *failure behavior* — the things that decide whether auto-published quality is actually defensible. The whole engine is built on **`claude-plan-execute`** (`inventory/02-claude-plan-execute.md`), whose central fact governs this design:

> "The multiple agents are the **same `claude` binary invoked with different prompts per phase**. Role specialization is prompt-swapping, not separate binaries." And: an article run is **a slate of dependent tasks** chained by `depends_on`, each stage's committed artifact feeding the next; the engine reuses the built-in **Plan → Review-loop → Gates** lifecycle.

So the writing crew is **one slate per run**, not a bespoke framework. We author editorial prompt builders and a `tasks.yaml` shape; `claude-plan-execute` provides scheduling, the review loop, gates, cross-task memory, resumability, the tmux backend, and exit-code-75 auto-resume for free.

## §2 A run is a slate of dependent tasks

One scheduled run = one slate (sticky `slate_id`). Tasks, chained by `depends_on`; each commits an artifact under `plans/task-N/`, so an interrupted run resumes from its last committed stage (`NFR-8`).

```
research ──▶ select ──▶ argue ──▶ draft ──▶ ┌─ review-fr ─▶ gate-fr ─┐
 (B1)        (B2)                 (B3,FR+EN) │                        ├─▶ publish
                                             └─ review-en ─▶ gate-en ─┘    (B5)
                                                (B4)          (C1,C2)
```

`review`/`gate` run **per language, independently and in parallel** (`parallelism>1`, gated by `depends_on`); **both must pass** before `publish` (§6). The dashed branch is the only fan-out; everything else is serial. `argue` runs the single (no fr/en) `argument-rigor` + `source-independence` gates on the chosen topic *before* the draft is paid for; a blocked `argue` falls back to the next-ranked topic (§7).

## §3 The agent roster (prompt builders) and hand-off artifacts

Each role is a prompt builder over the same `claude` agent. Artifacts are the contract between stages — a later stage reads only the committed artifact, never the prior agent's chat.

| # | Role (stage) | FR | Reads | Writes (artifact) |
|---|---|---|---|---|
| 1 | **Research** (Source) | B1 | topic memory (avoid repeats) | `candidates.json` — ranked topics, **each with source URLs + captured excerpts** (§4) + dates |
| 2 | **Planning** (Select) | B2 | `candidates.json`, topic memory | `brief.md` — chosen topic, angle, outline, the shortlist of fallback topics (§7), and the **claim skeleton** (which points will need sourcing) |
| 3 | **Argue** (Argument-rigor) | — | `brief.md` (thesis + claim skeleton), `candidates.json` | `argument.json` (steelman/attack/reconcile + `defensible`\|`weak` verdict + `strengthened_argument`) + `independence.json` (origin-diversity verdict) |
| 4 | **Writing** (Draft) | B3 | `brief.md`, `argument.json` (strengthened argument), house-style guide | `draft-fr.md` + `draft-en.md`, each with an explicit **claim→source map** (§4) |
| 5 | **Quality review** (Review) | B4 | the draft (per lang) | `review-N.md` with `## Verdict: APPROVED \| NEEDS_REVISION`; built-in revise-and-recheck loop, ≤ `max_review_rounds` |
| 5b | **Humanizing/style** (within Review) | C2 | the draft (per lang) | flags + a revised draft — **flag→revise→re-check**, see §5 |
| 6 | **Quality gate** (Gate) | C1, C2 | revised draft + its claim→source map + captured excerpts | gate findings (JSON); pass → proceed, fail → block+alert |
| 7 | **Publish** | B5 | both approved+gated drafts | commit FR+EN at parallel URLs; trigger build + avatar reindex event |

**Roles 1–4 and 7 are slate tasks** (author `build_research_prompt`, `build_select_prompt`, `build_argue_prompt`, `build_draft_prompt`, `build_publish_prompt`). **Role 5 is the built-in Phase-2 review loop** with an editorial prompt. **Role 6 is a set of Claude-agent gates** via `invariants.yaml` (emit `BEGIN_FINDINGS_JSON`, can trigger gate-repair re-dispatch).

## §4 The provenance chain — the fact-check crux (priority section)

Fact-check "is what makes auto-publish defensible" (`content-pipeline.md` §3). It only works if provenance is engineered end-to-end, not reconstructed at the end. Three design-time requirements:

1. **Research captures source *text*, not just links.** `candidates.json` stores, per source, the **fetched excerpt(s)** the claim will rest on (plus URL + retrieval date). The gate verifies against this captured text; a live re-fetch is only a fallback. (Captured text also defends against a source changing or 404-ing between research and gate.) The research sweep is **multi-angle**: it gathers a primary/origin source, an **independent corroboration**, and a skeptical/contrarian source where one exists — so candidates arrive with independent sourcing rather than one release echoed twice.
2. **The draft carries an explicit claim→source map.** Each load-bearing claim in `draft-{fr,en}.md` is tagged to the specific source (and ideally the excerpt span) it derives from — not a bare "Sources" list at the bottom. Without this, the fact-checker must *re-derive* which claim came from which source, which is exactly where verification silently fails.
3. **The gate verifies each load-bearing claim against its mapped excerpt** and **blocks on any unsupported claim** (`FR-C1`, `NFR-3`). Source-grounding sub-check: every factual statement traces to a cited, reachable source; no uncited load-bearing claims; no dead links.

This chain is the single most important part of the engine. A draft whose claim→source map is incomplete should fail review (role 5) *before* it reaches the gate.

**Source independence (beyond entailment).** The fact-check above verifies *entailment* — does the excerpt support the claim — not whether the sources are *independent*. `">= 2 sources"` is a count: two syndications of one wire story satisfy it. So a **source-independence** gate runs **pre-draft on the `argue` stage** (co-located with the thesis pressure-test, and re-fired on a fallback topic): a deterministic backstop requires the chosen topic's cited sources span **>= 2 distinct registrable domains**, and a fresh judge catches **cross-outlet syndication** (distinct hosts, one origin). It blocks a single-origin source set (`independence.json`). (A companion **source-quality** judge at the draft gate — §5 — assesses primary-vs-secondary, authority, and corroboration: "supported by this text" vs "the source is actually right.")

## §5 Review, humanizing, and the quality gate (M-4)

Three things must hold before publish; they are deliberately separated so each has teeth.

- **Review (role 5)** — editorial correctness/structure: the built-in APPROVED/NEEDS_REVISION loop. Also enforces that the claim→source map (§4) is complete. Revise-and-recheck up to the round cap.
- **Humanizing (role 5b) — `style-auditor` as auditor, not editor.** The global **`style-auditor`** agent (available in this environment) *flags* AI-generation tells and off-voice prose and *suggests* fixes; it does not rewrite. So the loop is **`style-auditor` flags → a separate revise agent applies the edits → `style-auditor` re-checks as the blocking style gate.** Keeping the editor and the auditor as *different* agents is what gives the gate teeth: if the same agent both rewrote and judged, the gate would pass exactly what it just wrote (toothless). Reusing `style-auditor` here satisfies the owner's "reuse the global agent rather than build one."
- **The gate (role 6, `M-4`)** runs after review, **blocks on any failure** (`NFR-3`), and bundles: **fact-check** (§4), **source-grounding**, **style** (the `style-auditor` re-check), **source-quality** (a fresh judge on the cited source set — primary-vs-secondary, authority, independent corroboration; distinct from fact-check's entailment), and **editorial-quality** (a fresh judge on the realized EN article — non-obviousness, angle soundness, structure). The two new judges are **single gates** (no fr/en split — the source set is identical fr/en per the review's set-equality, and editorial craft is judged on the EN draft as the canonical realization) and, like fact-check, are **judge != author**. (The pre-draft `argument-rigor` + `source-independence` gates run earlier, on the `argue` stage — §7 — not in this post-review bundle.) A failing gate retains the draft + findings as artifacts, emits an alert (`FR-C3`, `FR-F2`), and may re-dispatch to a revise step (gate-repair loop) before giving up. The house-style guide (`FR-G2`) encodes the brand register from `D-007`, including **no emojis** in prose — the style check flags emoji as an off-register tell.

## §6 Bilingual (FR/EN) handling

The two languages are authored as **parallel outputs of one topic+sources** (`content-pipeline.md` §2.3), not a raw machine translation. Review and gate run **independently per language** (`FR-C1`/`FR-C2` per `NFR-11`). Publish requires **both** to pass — if EN passes but FR fails (or vice-versa), nothing publishes this run for that topic and the failure is treated per §7 (the post is bilingual-or-nothing, so a half-passing topic is a failing topic). Topic memory is keyed by **language-independent topic** so a topic covered in FR+EN is never re-selected for either (`M-11`).

## §7 Terminal failure & cadence

**Terminal failure (no human in the loop).** When a topic cannot pass the gate after the gate-repair loop caps out, the run **falls back to the next-ranked topic** from the Planning shortlist (`brief.md`) and restarts from Draft for that topic — rather than skipping the publish slot. A blocked **`argue`** gate (a *weak* thesis, or a *single-origin* source set) triggers the **same fallback**: the harness resets both `argue` and `draft`, clears the stale `argue` artifacts, and re-argues the next-ranked topic — killing a weak angle before the bilingual draft is paid for, without skipping the publish slot. The alert **names the real blocker** (`argue` vs `draft`) on the retry, skip, and terminal paths (`FR-F2`). *Rationale:* sustained cadence (≥2 posts/week) is an explicit success metric (`vision.md`), so a single hard topic must not silently consume a slot. Guardrails: a per-run cap on fallback attempts (e.g. 2) to bound cost; if the whole shortlist is exhausted, then skip-and-alert (`FR-F2`) so the owner sees a genuinely dry run. *(Owner sub-question OQ-14a below — this is the recommended default.)*

**Cadence & unattended operation** (`content-pipeline.md` §4): an external scheduler fires twice weekly; `claude-plan-execute-loop` provides exit-code-75 sleep-until-reset auto-resume (`NFR-8`); the run drives Claude through the **interactive/tmux backend** to stay on the subscription pool after the 2026-06-15 split (`M-6`, `NFR-10`); a heartbeat alerts on missed/failed runs (`M-5`).

**Cadence safety.** Because `argue` now gates cadence, an over-aggressive thesis judge could exhaust the fallback shortlist and turn a publish slot dry. The per-run fallback-attempt cap bounds the cost; the `argument-rigor` judge's strictness is **calibrated at bring-up** against the golden adversarial set (DEPLOY.md §3) — an explicit cadence-safety step, not a build constant.

## §8 Memory and the shared embedder

- **Topic memory** (`FR-G1`, evergreen lifecycle): published topics + sources + their embeddings; queried by Planning to reject candidates **too semantically similar** to prior posts (`FR-B2`, [OQ-8]).
- **House-style guide** (`FR-G2`): one spec for voice/structure/citation/length/no-emoji, consumed at Draft and enforced at the style gate. Lives as a persona/decision artifact + evergreen memory (`claude-plan-execute` context layering).
- **Shared embedder dependency:** the semantic-dedup at Planning needs a **multilingual embedding model — the same [OQ-5]** picked for the avatar index. Spec it **once** and reuse it for both; don't choose two embedders. The dedup **similarity threshold** (`DEDUP_SIMILARITY_THRESHOLD`, `[OQ-8]`) is a fake-tuned placeholder (`0.82`, a module constant in `pipeline/stages/select.py`) **calibrated against real bge-m3 cosine scores at first live run** — a bring-up step (DEPLOY.md §3), not a build value.

## §9 Open sub-questions (resolve at the `M-3`/`M-4` build)

- **[OQ-14a] Terminal-failure policy** — fallback-to-next-topic (recommended, §7) vs skip-the-slot. Owner to confirm the default + the fallback-attempt cap.
- **[OQ-14b] Round caps** — `max_review_rounds` and gate-repair attempts (cost vs quality). Settle empirically at build.
- **[OQ-14c] Humanize placement** — within the review loop (recommended) vs a standalone stage between Draft and Review. Both keep the auditor/editor split of §5.
- **[OQ-5]** (shared) — the multilingual embedder for topic-dedup + the avatar index.

## Engine wiring — the tests that pin it (for maintainers)

A maintainer index (not part of the design narrative): the test-suite couplings each hardening task added, so the design of record names what pins the new wiring.

- **Gate registry & scoping** (`pipeline/tests/test_gate.py`): `_DRAFT_GATE_NAMES` (the 8 draft-scoped gates incl. `editorial-quality` [G3, task 4] + `source-quality` [G2, task 5]), `_ARGUE_GATE_NAMES` (`argument-rigor` [G1, task 3], `source-independence` [G4, task 6]), `_ALL_GATE_NAMES` (their concatenation in invariants.yaml load order). `test_invariants_load_as_ten_blocking_shell_gates` (renamed/recounted from *six*) and `test_assembled_template_wires_gates_and_absolute_pointers` (asserts `draft.gates_extra == _DRAFT_GATE_NAMES`, `argue.gates_extra == _ARGUE_GATE_NAMES`, `select` has none).
- **Stage-prompt seam** (`editorial_stage_descriptions`, `pipeline/prompts/__init__.py`): the three set-equality twins — `test_research_select.py`, `test_draft_review.py` (`test_editorial_stage_descriptions_includes_draft`), `test_publish_memory.py` — now assert `{research, select, argue, draft, publish}` (task 3 added `argue`). A fourth file, `pipeline/tests/test_argue.py`, also references `editorial_stage_descriptions` — it exercises the argue-description seam rather than carrying the full set-equality.
- **Import-light / runpy guards** (`pipeline/tests/test_gate.py`): `test_gate_clis_have_no_runpy_double_import_warning` loops the **seven** gate CLIs (`factcheck, grounding, style, argument, editorial, source_quality, independence`) under `-W error::RuntimeWarning`; `test_import_pipeline_does_not_import_gate_modules` is the wildcard guard that auto-covers any `pipeline.gate.*` module (incl. the substrate `judge.py`, task 1).
- **Judgment proof** (`pipeline/tests/test_golden.py` + `pipeline/tests/golden/bank.json`, task 2): the defect bank drives every gate by its CLI and asserts it blocks its planted defect; `GOLDEN_LIVE=1` runs the same bank against real judge sub-agents at bring-up (the live judgment proof — DEPLOY.md §3).

## Where this surfaces

- `content-pipeline.md` — §2 stages and §7 roster sketch are the contract this doc details; `M-3`/`M-4`.
- `user-requirements.md` — groups B, C, G and `FR-F2`/`FR-F3` are the testable form.
- `roadmap.md` — `M-3` (pipeline), `M-4` (gate), `M-5`/`M-6` (ops/backend), `M-9` (memory).
- `open-questions.md` — resolves the core of [OQ-14] (the roster + flow); residual build-time items OQ-14a/b/c and the shared [OQ-5] remain.
- `inventory/02-claude-plan-execute.md` — the engine this is built on.
