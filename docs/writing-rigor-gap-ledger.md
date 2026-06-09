# Writing-rigor gap ledger — verified against the code (2026-06-09)

**Purpose.** Section 0 of the writing-rigor handoff: re-verify each claimed gap against the
actual pipeline code before designing a fix. This is the ground-truth record the slate
(`docs/tasks-writing-rigor.yaml`) and its rationale (`docs/writing-rigor-slate-rationale.md`)
rest on. Where the brief's prior analysis was stale or imprecise, the discrepancy is flagged.

**Method.** Read `pipeline/{runner,fakes,conftest}.py`, all of `pipeline/stages/*`,
`pipeline/prompts/*`, `pipeline/gate/*`, `pipeline/contracts/*`, `pipeline/invariants.yaml`,
`pipeline/tasks-template.yaml`, `pipeline/tests/{test_gate,test_research_select,test_draft_review}.py`,
the design docs (`writing-flow.md`, `content-pipeline.md`, `open-questions.md`), and the bring-up
runbook (`DEPLOY.md`, `owner-bringup-checklist.md`). All five gaps reproduce; none is already
closed.

---

## Ledger

| Gap | Verdict | Evidence (file:line) |
|---|---|---|
| **G1** — no intellectual pressure-test of the argument | **CONFIRMED** | The run is single-pass on the idea. `pipeline/prompts/select.py:43-83` writes `brief.md` (angle/outline/claim-skeleton) with no adversarial step; `pipeline/prompts/draft.py:193-239` goes straight to drafting; the only "review" is `pipeline/stages/review.py:83-119` (`review_claim_source_map`), which is source-id coverage + parity, not a thesis test. Nothing steelmans/attacks the angle. |
| **G2** — fact-check is entailment, not correctness/authority | **CONFIRMED** | `pipeline/prompts/draft.py:160-190` and `pipeline/gate/factcheck.py:122-124` (`factcheck_passes`): the judge assigns only `supported: true\|false` = "does this EXCERPT support this CLAIM." No primary-vs-secondary, authority, or independent-corroboration dimension. A confidently-wrong but faithfully-cited source passes. The module docstring (`factcheck.py:16-23`) confirms the judgment is "does this excerpt support this claim," nothing more. |
| **G3** — editorial "review" is coverage, not quality | **CONFIRMED** | `pipeline/stages/review.py:83-119`: structural integrity + per-language skeleton coverage + fr/en parity → `APPROVED\|NEEDS_REVISION`. Lines 99-116 are pure set-coverage logic. No non-obviousness / angle / structure judgment. Quality otherwise lives only in the draft-time house style (`pipeline/prompts/draft.py:68-79`) and the `style 'clean'` verdict (`pipeline/gate/style.py:22-35`) — both voice, not substance. |
| **G4** — "≥2 sources" is a count, not independence | **CONFIRMED** | `pipeline/stages/research.py:57-61`: `if len(self.sources) < 2: raise` — a pure count (FR-B3). `pipeline/prompts/research.py:46-55` asks for "at least two sources" with no independence / origin / diversity constraint. Two syndications of one release satisfy it. |
| **G5a** — real link checker is faked | **CONFIRMED** | `pipeline/gate/grounding.py:103-108`: `_make_link_checker("real")` raises `NotImplementedError`. The gate is invoked without `--link-check` in `pipeline/invariants.yaml:39`, so it defaults to `fake` (`grounding.py:154`). `pipeline/tests/test_gate.py:269-274` asserts `--link-check real` raises. Reachability is faked in CI. |
| **G5b** — dedup threshold is an uncalibrated placeholder | **CONFIRMED** | `pipeline/stages/select.py:37`: `DEDUP_SIMILARITY_THRESHOLD = 0.82` is explicitly an "OQ-8 PLACEHOLDER." `select.py:285`: `_make_embedder` defaults to `fake` unless `PIPELINE_EMBEDDER=real`. The fake (`pipeline/fakes.py:295-322`) is a monolingual token-hash bag — its cosine distribution is unlike real bge-m3, so 0.82 is never the real value. |
| **G5c** — semantic gates' JUDGMENT is unproven | **CONFIRMED** | `pipeline/gate/factcheck.py:16-23` + `pipeline/tests/test_gate.py:1-15`: in CI the `factcheck-{lang}.json` / `style_findings.*` fixtures stand in for the live sub-agent. The *mechanism* fails closed deterministically; whether the *live* fact-checker catches a subtly-unsupported claim, or the style-auditor an AI-tell, is never asserted. There is no golden adversarial set. |

**Adjacent gaps, confirmed OUT of scope for *writing* rigor (noted, not entangled):**

- **Avatar "I don't know" gate calibration** — the brief flagged it as still fake-tuned, but it is now **live-calibrated**: `AVATAR_SIMILARITY_THRESHOLD = 0.46`, cosine direction confirmed non-inverted (`DEPLOY.md:23-29`, project memory updated 2026-06-09). It is the *reader-facing avatar*, not the writer. **No action in this slate.** (Discrepancy vs the brief: the brief said it "is also fake-tuned"; that is now stale.)
- **Runner resume / unattended survival** — offline-shaped only (`pipeline/runner.py:14-19`, `README.md:134-137`); a live-tmux concern, not a writing-quality one. **No action.**

---

## Discrepancies between the brief and the code (TRUST THE CODE)

1. **The avatar gate is no longer fake-tuned** (above) — the brief's G5 parenthetical is stale; it was calibrated live on 2026-06-09.
2. **The prompt-injection seam IS wired** (the brief implied it might be "incompletely wired"). `pipeline/prompts/__init__.py:19-47` (`editorial_stage_descriptions`) composes `{task_id: description}` and is passed to `assemble_slate(stage_descriptions=...)` (`runner.py:240-244`). The `argue` stage (task 3) plugs in here cleanly — no missing seam.
3. **`PIPELINE_EMBEDDER=real` is already owned by the bring-up runbook**, not an open build item: `DEPLOY.md` §3 step 5 + the env table (`DEPLOY.md:220`) + `owner-bringup-checklist.md` GROUP 2. The slate references it; it does not re-author it. The **dedup *threshold* calibration** (G5b), by contrast, is **missing** from `DEPLOY.md` §3 — task 8 proposes adding it.
4. **`DEPLOY.md` already anticipates this slate.** `DEPLOY.md:45-50` (Open item 2) defers the pipeline's first live run until "after the writing-rigor slate lands." Task 8 reconciles with that, it does not contradict it.

---

## Design implications the ledger drives (carried into the slate)

- The brief's `claim_skeleton` is **language-neutral** (`pipeline/stages/select.py:39-44`, no `lang` field) ⇒ argument-rigor (G1) is a **single** gate, not fr/en-paired.
- `pipeline/stages/review.py:112` enforces the cited source-id **set is identical fr/en** ⇒ source-quality (G2) and source-independence (G4) are **single** gates (a source's authority/origin is language-independent), and editorial-quality (G3) can be judged on the **EN realization** as canonical with fr/en structural parity resting on the existing set-equality + parallel-output rule.
- `pipeline/gate/factcheck.py` is the proven template for **all** new gates: a frozen verdict vocabulary, a **fail-closed** parser (`_claim_from_dict` raises on a missing boolean), a structural backstop, and a CLI that blocks on a missing findings file. The new judges share **one** such substrate (slate task 1); the existing factcheck/style parsers are **not** refactored onto it.
- The harness fallback (`pipeline/runner.py:380-394`, `pipeline/gate/fallback.py:116-201`) keys on the literal `"draft"` and `write_alert` hardcodes `blocked_task="draft"`. Inserting `argue` upstream ⇒ both must learn about `argue` (slate task 3), or a weak thesis would neither fall back nor alert.
