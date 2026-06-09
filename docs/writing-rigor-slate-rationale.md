# Writing-rigor slate — rationale + wiring diffs

Companion to `docs/tasks-writing-rigor.yaml` (the slate) and
`docs/writing-rigor-gap-ledger.md` (the verified gaps). For owner review. **Nothing here
has been executed** — this is an authoring deliverable; the cpe run that builds the code is
deferred to owner approval.

---

## 1 · Per-task rationale

Each row: the rigor it adds → how it is proven **deterministically** (in `pytest -q pipeline`,
no secrets) **and live** (the golden adversarial set at bring-up) → the engine principle it
preserves.

| # | Task | Rigor added (gap) | Proven deterministically | Proven live | Principle preserved |
|---|---|---|---|---|---|
| 1 | Judge≠author substrate | DRY base for the three new judge gates (no rigor on its own; enables G1/G2/G3) | Fail-closed parser raises on every malformed shape; `judge_passes` truth table; dispatch helper is a pure, ASCII-only fn naming "fresh sub-agent / do not override" | n/a (substrate) | Fail-closed parsers; judge≠author; import-light |
| 2 | Golden-adversarial harness | **G5c** — proves the *judgment* of every semantic gate, not just the mechanism | Runner MECHANISM drives any gate by CLI + asserts exit code using FIXTURE findings (seeded to retro-prove factcheck + style + grounding) | `GOLDEN_LIVE=1` dispatches the REAL judges on planted defects; each gate must block (default-skip in CI) | Green-without-secrets + explicit live-only boundary; parser-agnostic |
| 3 | `argue` stage + argument-rigor gate | **G1** — steelman→attack→reconcile on the thesis *before* the bilingual draft | Gate blocks on a `weak` fixture / missing file / unparseable verdict; fallback resets argue+draft and names `argue`; runner re-drives on blocked-argue | Planted weak/obvious/aging-badly theses the live judge must block | Judge≠author; fail-closed; **bilingual-or-nothing extended upstream**; cadence (§7) |
| 4 | editorial-quality gate | **G3** — non-obviousness / angle / structure of the *finished piece* | Gate blocks on a `thin` fixture / missing file / unparseable verdict | A planted obvious / structurally-incoherent draft the live judge must block | Judge≠author; fail-closed; single-gate (no fr/en inflation, justified) |
| 5 | source-quality gate | **G2** — primary-vs-secondary, authority, independent corroboration (alongside factcheck) | Blocks on `unsound` / missing file / a per-claim entry missing a required boolean / unparseable | A wrong-but-faithfully-cited claim + a single-origin claim set the live judge must block | Judge≠author; fail-closed incl. per-item backstop; *alongside* (not replacing) factcheck |
| 6 | source-independence gate + broadened sweep | **G4** — distinct-origin requirement; syndication detection | Distinct-domain backstop blocks a same-host pair; judge layer blocks `single_origin`; fail-closed | Two syndications of one release the live judge must block | Judge≠author; fail-closed; contract stability (no fixture breakage); backstop+judge layering |
| 7 | real link checker | **G5a** — replaces `NotImplementedError` behind the seam | Mocked-network unit tests (2xx/3xx reachable, 4xx/5xx/timeout/DNS unreachable, bounded redirects, cache); updates the `--link-check real` test | Real reachability over real URLs at bring-up | The seam (fake stays the CI default); build-vs-bring-up line |
| 8 | docs reconcile | Design-of-record + bring-up runbook match the new engine; **G5b** dedup-threshold + live golden-set added to bring-up | Docs only — slate gates pass trivially | n/a (the *content* it adds drives the live bring-up steps) | Build-vs-bring-up line; one clean bring-up runbook |

**Two asymmetries worth stating explicitly** (both are deliberate, both follow the code):

- **G1 runs pre-draft, G3 runs post-draft.** Thesis-defensibility is knowable from the
  language-neutral skeleton (cheap → kill before the bilingual draft). Piece-craft
  (structure, "earns its length") needs the realized piece → post-draft, on EN as the
  canonical realization. The two judges' mandates are written to be **non-overlapping**
  (G1 = the thesis *as a claim*; G3 = the article *as an article*), so G3 is not a costlier
  re-run of G1.
- **All four new gates are single, not fr/en.** `review.py:112` makes the cited source-id
  *set* identical across languages, and authority/origin/defensibility are language-neutral.
  Pairing them fr/en would double gate count for no added signal. The one honest caveat:
  fr **structural** parity rests on the existing set-equality + parallel-output house-style
  rule, not on G3 — named, not hidden.

---

## 2 · Concrete wiring diffs

These are the edits that make a **real** article run exercise the new rigor. Each slate task
makes its own slice (and updates the coupled tests); this is the consolidated end state.

### 2.1 `pipeline/tasks-template.yaml`

```diff
 phases:
   - id: source
     title: 'Research — web-search sweep, capture source excerpts (FR-B1)'
   - id: select
-    title: 'Select — angle, semantic dedup vs topic memory, claim skeleton + fallback shortlist (FR-B2)'
+    title: 'Select — angle, semantic dedup, claim skeleton + fallback shortlist; source-independence gate (FR-B2, G4)'
+  - id: argue
+    title: 'Argue — steelman/attack/reconcile the thesis before the bilingual draft (G1)'
   - id: draft
     title: 'Draft — FR+EN parallel outputs + claim->source map; review loop; M-4 gates (FR-B3/B4/C1/C2)'
   - id: publish
     title: 'Publish — commit FR+EN at parallel URLs; trigger build + avatar reindex (FR-B5)'
 tasks:
   - id: research
     phase: source
     ...
     depends_on: []
   - id: select
     phase: select
     ...
     key_files: [pipeline/stages/select.py]
     commit_message: 'content(select): brief.md'
     depends_on: [research]   # select gets NO new gate — independence moved to `argue` (re-runs on fallback)
+  - id: argue
+    phase: argue
+    title: 'Pressure-test the chosen topic (thesis + source independence) before drafting'
+    description: |
+      [STAGE: Argue (G1+G4). build_argue_prompt (pipeline/prompts/argue.py). Substrate
+      placeholder.] Dispatch TWO fresh judge!=author sub-agents over the brief's chosen
+      topic: (1) THESIS — steelman, strongest attack (wrong / weak / trivially-true /
+      aging-badly), reconcile -> plans/task-argue/argument.json {verdict: defensible|weak,
+      ..., strengthened_argument}; (2) SOURCE INDEPENDENCE — origins of the chosen
+      candidate's cited sources -> plans/task-argue/independence.json {verdict:
+      independent|single_origin, ...}. Both pre-draft chosen-topic checks; both re-run on a
+      fallback re-drive. A blocking gate => draft never runs => publish never runs.
+    key_files: [pipeline/gate/argument.py, pipeline/gate/independence.py]
+    commit_message: 'content(argue): argument.json + independence.json (chosen-topic pressure-test)'
+    depends_on: [select]
+    # G1 + G4: blocks a 'weak' thesis or a 'single_origin' source set. Both single gates
+    # (the claim skeleton + the chosen source set are language-neutral). On `argue`, NOT
+    # `select`, so they re-fire on every fallback topic (apply_fallback resets argue+draft).
+    gates_extra: [argument-rigor, source-independence]
   - id: draft
     phase: draft
     ...
     key_files: [pipeline/stages/draft.py]
     commit_message: 'content(draft): FR + EN drafts + claim->source map'
-    depends_on: [select]
+    depends_on: [argue]
     gates_extra:
       [
         factcheck-fr,
         factcheck-en,
         grounding-fr,
         grounding-en,
         style-fr,
         style-en,
+        source-quality,      # G2: primary/authority/corroboration of the cited source set
+        editorial-quality,   # G3: non-obviousness/angle/structure of the realized piece
       ]
   - id: publish
     ...
     depends_on: [draft]   # unchanged
```

### 2.2 `pipeline/invariants.yaml` — append four `kind: shell` block gates

(Same command contract as the existing six: `PYTHONPATH=../../..` from the run_dir,
`--run-dir .`. No `--lang` — these four are single, language-neutral gates. Names avoid cpe's
reserved set `{tests, lint, invariant-grep}`.)

```yaml
- name: argument-rigor          # G1 — scoped to the `argue` task via argue.gates_extra
  kind: shell
  command: 'PYTHONPATH=../../.. python3 -m pipeline.gate.argument --run-dir .'
  on_failure: block
  when: [always]
  parallel_safe: true
  timeout_minutes: 5
  comment: 'G1 argument-rigor: blocks a thesis judged weak (steelman/attack/reconcile).'

- name: editorial-quality       # G3 — scoped to the `draft` task via draft.gates_extra
  kind: shell
  command: 'PYTHONPATH=../../.. python3 -m pipeline.gate.editorial --run-dir .'
  on_failure: block
  when: [always]
  parallel_safe: true
  timeout_minutes: 5
  comment: 'G3 editorial-quality: blocks a thin/obvious/structurally-unsound piece (EN canonical).'

- name: source-quality          # G2 — scoped to the `draft` task via draft.gates_extra
  kind: shell
  command: 'PYTHONPATH=../../.. python3 -m pipeline.gate.source_quality --run-dir .'
  on_failure: block
  when: [always]
  parallel_safe: true
  timeout_minutes: 5
  comment: 'G2 source-quality: blocks a non-authoritative / wrong / single-origin cited source.'

- name: source-independence     # G4 — scoped to the `argue` task via argue.gates_extra (re-runs on fallback)
  kind: shell
  command: 'PYTHONPATH=../../.. python3 -m pipeline.gate.independence --run-dir .'
  on_failure: block
  when: [always]
  parallel_safe: true
  timeout_minutes: 5
  comment: 'G4 source-independence: distinct-origin backstop + syndication judge on the chosen topic.'
```

### 2.3 `pipeline/prompts/__init__.py` — register the `argue` stage prompt (task 3)

```diff
-from .draft import build_draft_prompt, build_revise_prompt
+from .argue import build_argue_prompt
+from .draft import build_draft_prompt, build_revise_prompt
 ...
     return {
         "research": build_research_prompt(...),
         "select": build_select_prompt(...),
+        "argue": build_argue_prompt(repo_root=config.repo_root, run_dir=run_dir),
         "draft": build_draft_prompt(...),
         "publish": build_publish_prompt(...),
     }
```

### 2.4 Harness — a blocked `argue` behaves like a blocked `draft` (task 3)

- `pipeline/runner.py:380-394` — the fallback re-drive loop + terminal alert key on a module
  constant `_FALLBACK_TRIGGER_TASKS = ("argue", "draft")` instead of the literal `"draft"`;
  the terminal `write_alert` names the **actual** blocked task.
- `pipeline/gate/fallback.py` — `write_alert(..., blocked_task=...)` becomes a parameter
  (was hardcoded `"draft"`, line 120); **`apply_fallback` gains a `blocked_task` parameter**
  (threaded from the runner's `plan.blocked`) and forwards it to **every** internal
  `write_alert` call — the skip/dry/unusable paths (lines 150/159/169/177) otherwise still
  emit `"draft"`, so a dry-shortlist skip after a blocked `argue` would mislabel the blocker
  (FR-F2 needs the real one named on the skip path too). `apply_fallback` resets **both**
  `argue` and `draft` to pending and clears the prior topic's stale findings so a re-drive
  cannot pass on them. Two stale sets: the existing `_STALE_DRAFT_ARTIFACTS` (task-draft/)
  gains `editorial.json` (task 4) + `source_quality.json` (task 5); a **new**
  `_STALE_ARGUE_ARTIFACTS` (task-argue/) holds `argument.json` (task 3) + `independence.json`
  (task 6) — needed because the existing unlink loop only touches `task-draft/`.
- `pipeline/fakes.py` — add `"argue": ["argument.json", "independence.json"]` to
  `STAGE_ARTIFACTS`.

---

## 3 · Build-now vs bring-up (the G5 split — reconciled with `DEPLOY.md` §3)

**IN THE SLATE (buildable now, green-without-secrets):**
- the real link checker behind the seam, **mocked-network** tests (task 7);
- the golden-adversarial-set harness + its deterministic mechanism (task 2), and each new
  gate's deterministic fail-closed tests (tasks 3-6).

**NOT IN THE SLATE (owner-gated, live-only — task 8 reconciles into `DEPLOY.md` §3):**
- *Already owned, referenced only:* `PIPELINE_EMBEDDER=real` as the settled default
  (`DEPLOY.md` §3 step 5 + env table + owner-bringup GROUP 2); the supervised first run.
- *Proposed additions to `DEPLOY.md` §3* (currently missing there):
  1. **Dedup-threshold (OQ-8) calibration** — `DEDUP_SIMILARITY_THRESHOLD=0.82` is fake-tuned;
     calibrate against real bge-m3 cosine scores (analogous to the avatar gate's §3 step-4b).
  2. **Live link-reachability** — a one-time supervised `--link-check real` over a real
     article's cited URLs (optional; captured excerpts make it a fallback).
  3. **Live golden-set validation** — run the task-2 bank with `GOLDEN_LIVE=1` against the
     REAL judges; confirm every gate (factcheck, style, argument-rigor, editorial-quality,
     source-quality, source-independence) catches its planted defect **before** trusting
     auto-publish. **argument-rigor's calibration is cadence-safety-relevant** (an
     over-aggressive thesis judge can exhaust the fallback shortlist and produce nothing).
- This ties to `DEPLOY.md`'s existing **Open item 2**, which already defers the pipeline's
  first live run until "after the writing-rigor slate lands."

---

## 4 · Test-coupling inventory (what each task must also update)

The slate's own `tests` gate is `pytest -q pipeline`, which runs the existing suite — so any
task that adds a gate must update the suite **in the same task** or its own gate goes red.

- **`_GATE_NAMES` is OVERLOADED and must be SPLIT.** `pipeline/tests/test_gate.py:_GATE_NAMES`
  (the 6 M-4 gates) is used both as "every gate in `invariants.yaml`" (line 513) and as
  `draft.gates_extra` (line 530) — IDENTICAL today (6), but they DIVERGE after the slate:
  `invariants.yaml` gains 4 → **10**; `draft.gates_extra` gains 2 → **8**; `argue.gates_extra`
  gets **2** (argument-rigor + source-independence); `select` gets **none**. Split it into
  per-task lists (`_ALL_GATE_NAMES`=10 / `_DRAFT_GATES`=8 / `_ARGUE_GATES`=2), and
  rename/recount `test_invariants_load_as_six_blocking_shell_gates` (name + `len(resolved)==6`,
  lines 502-522) to 10. Tasks 3-6.
- **`test_assembled_template_wires_gates_and_absolute_pointers`** (line 530) — point each
  `gates_extra` assertion at the right per-task list (draft / argue). Tasks 3-6.
- **`pipeline/tests/test_runner.py`** breaks on the `argue` insertion + the `draft.depends_on`
  flip: `by_id["draft"]["depends_on"] == ["select"]` (line 131) → `["argue"]` (+ assert
  `argue` depends_on `["select"]`); `test_interrupt_then_resume_completes` expects
  `next_task == "draft"` after interrupt-after-select (line 268) → `"argue"`; the `_SPINE`
  done-set (lines 39/273) must include `"argue"`. **Add `test_runner.py` to task 3.**
- **The runpy / import-light guards** `test_gate_clis_have_no_runpy_double_import_warning`
  (loops over gate **CLIs**) and `test_import_pipeline_does_not_import_gate_modules` — each new
  gate CLI (`argument`, `editorial`, `source_quality`, `independence`) joins the first loop;
  **`judge.py` (substrate, no CLI) does NOT** — it's auto-covered by the second (wildcard)
  guard; none may be re-exported from `pipeline/__init__.py`. Tasks 1, 3-6.
- **`test_write_alert`** (`test_gate.py:381-390`) asserts `blocked_task: "draft"` exactly —
  changes when `write_alert`/`apply_fallback` are parameterized; add a blocked-`argue` alert
  assertion **on the skip path** (not only the retry/terminal path). Task 3.
- **`test_run_fallback_*`** assert `"draft" in rr.plan.blocked` — add the blocked-`argue`
  re-drive path (extend `FakeClaudeDriver`'s block hook to `argue`). Task 3.
- **`editorial_stage_descriptions` set-equality tests** — ALL THREE twins
  (`test_research_select.py:421`, `test_draft_review.py:327`, `test_publish_memory.py:573`)
  plus `test_editorial_stage_descriptions_includes_draft` now include an `"argue"` key. Also
  add a pure-fn assertion that **`build_draft_prompt` output references
  `plans/task-argue/argument.json`** (so the argue stage can't regress to decorative). Task 3.
- **`test_grounding_cli`** (`test_gate.py:269-274`) asserts `--link-check real` raises
  `NotImplementedError` — flips to the mocked-real behavior. Task 7.

---

## 5 · Open risks (surfaced, not hidden)

1. **Cadence safety of the pre-draft gates.** The `argue` task now carries **two**
   cadence-gating, judgment-unproven gates (argument-rigor + source-independence): both re-run
   on every fallback topic, so an over-aggressive judge on either could burn the fallback
   shortlist and publish nothing. Bounded by the attempt cap + the loud terminal alert; live
   golden-set calibration (task 8) is the real mitigation. The answer to "another gate that
   can exhaust the shortlist" is **calibrate the judge, not skip a safety gate on an
   auto-publish path** — fallback is still auto-publish, so G4 must hold there too.
2. **Draft-prompt heft.** The draft prompt now dispatches four fresh sub-agents (style-auditor,
   factcheck, source-quality, editorial-quality). This mirrors the existing factcheck pattern
   and is correct, but the draft task is the heaviest in the slate — worth watching the
   plan/review timeouts on the first live run.
3. **Gate-repair vs new gates.** A wrong source (G2), an obvious angle (G3), or a weak thesis
   (G1) is not fixable by re-drafting in place, so each burns one `max_gate_repair_rounds`
   before the fallback swaps topics. Correct behavior; flagged so it is not mistaken for a bug.
4. **`branch_per_task: false` + `base_branch: main`** (inherited from the build slate) means
   cpe commits locally to `main`. The owner may prefer a feature branch for review; the slate
   keeps the existing convention.
