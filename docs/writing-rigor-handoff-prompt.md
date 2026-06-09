# Hand-off prompt — make the article-writing pipeline rigorous about the *writing itself*

Paste everything in the fenced block below into a fresh agent session. It asks the agent to author a new
`claude-plan-execute` (cpe) build slate that closes the rigor gaps in the content engine — the dimensions the
current pipeline does **not** enforce: whether the *argument* is any good, whether the *sources are right*
(not merely cited), whether the *editorial* is more than coverage, whether *research* is independent rather than
echoed, and the slice of semantic rigor that is still **faked until live bring-up**.

The deliverable is the slate itself (for owner review), **not** an executed run.

---

```
You are picking up a RIGOR-HARDENING task on the my-blog project (repo: /Users/rachid/dev-env/0-git/my-blog).

GOAL
Author a new claude-plan-execute (cpe) BUILD SLATE that makes the article-WRITING pipeline rigorous about the
WRITING ITSELF — not just its sourcing and voice. The pipeline today is genuinely rigorous about GROUNDING and
VOICE (provenance captured end-to-end, six fail-closed bilingual M-4 gates, a fact-checker that never sees the
prose, a prescriptive house style). It is NOT rigorous about whether the ARGUMENT is good, whether the SOURCES
are correct (vs merely cited), whether the EDITING is more than coverage, or whether RESEARCH is independent —
and a slice of its existing teeth is faked until a live bring-up. Your job is to design a cpe slate that closes
those gaps, following the engine's own rigor principles. DELIVERABLE = the slate + a design rationale, for owner
review. Do NOT execute the cpe run.

== 0. RE-EXPLORE FIRST — the codebase is ground truth, not this brief ==
The gaps in section 1 come from a prior analysis and may be stale, partly fixed, or mis-pathed. Before you design
anything, READ THE ACTUAL CODE and re-verify each gap still exists. If a gap is already handled or mis-stated,
say so and adjust. Produce a short "verified gap ledger" (gap -> confirmed/partly/already-closed + the file:line
evidence) BEFORE writing the slate. Read, at minimum:
  - pipeline/runner.py, pipeline/README.md
  - docs/writing-flow.md, docs/content-pipeline.md            (the DESIGN of the engine — roles, the claim chain)
  - pipeline/stages/{research,select,draft,humanize,review,publish}.py
  - pipeline/prompts/{research,select,draft,publish}.py        (the actual prompt bodies + the judge≠author dispatch)
  - pipeline/gate/{factcheck,grounding,style,fallback}.py      (the six M-4 gates + the gate-repair fallback)
  - pipeline/house_style.md, pipeline/invariants.yaml          (house style; the M-4 gate registry)
  - pipeline/contracts/{claim_source_map,embedder}.py          (the claim->source contract; the embedder seam)
  - pipeline/tasks-template.yaml                               (the per-ARTICLE editorial slate: research->select->draft->publish, cpe v2)
  - docs/tasks.yaml                                            (the BUILD slate that built the pipeline — the SHAPE your new slate must follow)
  - pipeline/tests/*  + pipeline/tests/fixtures/*              (how mechanism rigor is proven deterministically, and the LIVE-ONLY boundary)
  - docs/open-questions.md, docs/invariants.yaml              (OQ-8 dedup threshold; the build-time invariant-grep gate)
  - DEPLOY.md (esp. §3) + docs/owner-bringup-checklist.md     (the EXISTING bring-up runbook: it ALREADY owns the live
                                                              link check, the PIPELINE_EMBEDDER=real switch, and the
                                                              dedup/avatar recalibration — G5's live half must
                                                              RECONCILE with this, not re-author it)
  - project memory: ~/.claude/projects/-Users-rachid-dev-env-0-git-my-blog/memory/MEMORY.md and especially the
    files: m4-gate-contract, pipeline-cpe-harness-contract, select-dedup-fake-embedder-default,
    pipeline-stages-import-light-runpy, claim-source-map-dropped-at-publish, reading-surface-content-conventions.

== 1. THE GAPS TO CLOSE (verify each against the code, then design a fix) ==
G1 — NO INTELLECTUAL PRESSURE-TEST OF THE ARGUMENT. The run is single-pass on the idea: rank candidates -> pick
     angle -> draft -> check grounding/voice. Nothing steelmans-then-attacks the thesis or red-teams it for being
     weak, wrong, obvious, or aging-badly. A well-cited, on-voice, but intellectually shallow or wrong-but-sourced
     article passes every gate.
G2 — FACT-CHECK IS ENTAILMENT, NOT CORRECTNESS/AUTHORITY. gate/factcheck.py verifies "does this excerpt support
     this claim," not whether the source is right or authoritative. A confidently-wrong source, faithfully cited,
     passes. There is no primary-vs-secondary, authority, or independent-corroboration judgment.
G3 — EDITORIAL "REVIEW" IS A COVERAGE CHECK, NOT A QUALITY JUDGMENT. stages/review.py verifies every claim-skeleton
     source_id is covered in both languages (bilingual parity). Nothing asks "is the angle right, is this saying
     anything non-obvious, is the structure sound." Quality lives only in draft-time house-style + the style 'clean'
     verdict — both about voice, not substance.
G4 — RESEARCH BREADTH IS ONE SWEEP; "≥2 SOURCES" IS A COUNT, NOT INDEPENDENCE. Two echoes of one press release
     qualify. No source-independence / diversity / primary-origin check.
G5 — A SLICE OF EXISTING RIGOR IS FAKED UNTIL LIVE BRING-UP:
       - the real link checker raises NotImplementedError (gate/grounding.py) — reachability is faked in CI;
       - the dedup embedder is defer-and-throw; select dedups on a FAKE unless PIPELINE_EMBEDDER=real; the 0.82
         dedup threshold is an OQ-8 placeholder, never calibrated;
       - the semantic teeth (factcheck/style) are verified LIVE-ONLY (JSON fixtures stand in during CI). The
         MECHANISM fails closed in tests, but the JUDGMENT — does the fact-checker actually catch a subtly-unsupported
         claim, does the style-auditor actually catch an AI-tell — is UNPROVEN.
     (Adjacent, likely OUT of scope for WRITING rigor — note only if you find it entangled: the avatar "I don't know"
     gate calibration is also fake-tuned, but that's the reader-facing avatar, not the writer; runner resume/
     unattended survival is offline-shaped only.)

== 2. DESIGN CONSTRAINTS — preserve the engine's existing rigor principles (verify them in code first) ==
Every new stage/gate MUST follow the patterns already in the engine:
  - JUDGE ≠ AUTHOR / AUDITOR ≠ EDITOR: a new judging stage runs as a FRESH sub-agent that never sees the draft
    prose or who authored the claim, and the author cannot override its verdict (see the fact-check dispatch in
    prompts/draft.py). A self-graded check rubber-stamps and proves nothing.
  - FAIL-CLOSED parsers: a missing or ambiguous verdict field RAISES (blocks), never reads as pass (gate/factcheck.py).
  - BILINGUAL-OR-NOTHING: a blocking gate on the draft => publish never runs; preserve fr/en parity (set-equality
    of source_ids in stages/review.py).
  - GREEN-WITHOUT-SECRETS + an explicit LIVE-ONLY BOUNDARY: CI must prove every new MECHANISM deterministically with
    fixtures/fakes; real-LLM judgment is live-only and clearly marked. So each new semantic gate needs BOTH (a) a
    deterministic mechanism test AND (b) a way to prove its JUDGMENT live — e.g. a GOLDEN ADVERSARIAL SET: a curated
    bank of subtly-weak theses / wrong-but-sourced claims / planted AI-tells that the gate MUST catch at bring-up.
    That golden-set harness is itself the fix for the G5 "judgment unproven" gap — design it once, reuse it for the
    new gates and to retro-prove the existing factcheck/style gates.
  - IMPORT-LIGHT stages: do not re-export pipeline.stages.<mod> symbols from pipeline/__init__.py; lazy-import
    cross-module constants (runpy double-import). Import direct from submodules.
  - Respect the cpe harness contract: run-dir/cwd, the exit-75 sentinel, plans_dir relative to --dir. Register new
    article gates in pipeline/invariants.yaml and scope them to the draft (or a new) task via gates_extra. The new
    BUILD slate's own gates are [tests, lint, invariant-grep] over docs/invariants.yaml (build-time code invariants),
    distinct from the per-article M-4 gates in pipeline/invariants.yaml.
  - The claim_source_map is EPHEMERAL — it is dropped at publish (the renderer can't see claims), so the gates are
    directional (they constrain only mapped claims). Don't design anything that assumes the CSM survives to render.
  - SHARE ONE JUDGE HARNESS: G1/G2/G3 are three LLM-judge stages — build them on ONE judge≠author substrate (one
    dispatch + N prompts/verdict-parsers), not three bespoke judge implementations. DRY the judging, vary the prompt.
  - BUILD vs BRING-UP: a cpe BUILD slate must reach GREEN with fakes/fixtures. Anything that needs real vectors, a
    live network, or a secret (calibration, live-reachability, real-embedder default) is BRING-UP, not build — it
    belongs in DEPLOY.md §3 / docs/owner-bringup-checklist.md, NOT as a slate task. Keep that line clean (see G5).

== 3. WHAT THE SLATE SHOULD BUILD (a suggested target — verify feasibility, then refine) ==
Author a new BUILD slate (suggest docs/tasks-writing-rigor.yaml), shaped EXACTLY like docs/tasks.yaml (version 1:
top-level `defaults` with gates [tests, lint, invariant-grep] and GREEN-without-secrets; `phases`; `tasks` each with
id / phase / task_class / title / description / key_files / commit_message / depends_on). Its tasks BUILD the
following into the engine AND wire them into pipeline/tasks-template.yaml so a REAL article run exercises them:

  - ARGUMENT-RIGOR stage + gate [closes G1]: a steelman -> attack -> reconcile pass on the chosen thesis + claim
    skeleton, ideally BETWEEN select and draft (kill a weak angle before paying to draft it bilingually), emitting a
    verdict + the surviving/strengthened argument; a fail-closed gate BLOCKS a "weak / unsupported-thesis / says-
    nothing-non-obvious" verdict. Judge≠author. This is the productized form of the ad-hoc steelman/attack/reconcile
    workflow the owner has been running by hand.
  - SOURCE-QUALITY dimension [closes G2]: alongside (not replacing) the entailment fact-check — primary-vs-secondary,
    source authority, and INDEPENDENT corroboration. Distinguish "supported by this text" from "the source is
    actually right." Flag confidently-wrong or single-origin claims.
  - EDITORIAL-QUALITY judgment [closes G3]: extend review beyond coverage — non-obviousness, angle soundness,
    structure — as a distinct judge≠author check, not a rewrite of the coverage parity check.
  - INDEPENDENCE-CHECKED RESEARCH [closes G4]: broaden the sweep (multi-angle / multi-modal) and add a source-
    independence / diversity threshold so two syndications of one release no longer satisfy "≥2".
  - REAL BACKENDS + JUDGMENT PROOF [closes G5 — SPLIT build-now vs owner-gated; RECONCILE with DEPLOY.md §3 +
    docs/owner-bringup-checklist.md, do NOT re-author what they already own]:
      (a) IN THE SLATE (buildable now, green-without-secrets): implement the real link checker behind the existing
          seam (replace the NotImplementedError) with MOCKED-network unit tests; and build the golden-adversarial-set
          HARNESS — the defect bank + a runner that asserts each gate catches its planted defect. The harness is the
          genuinely new piece and the real fix for "judgment unproven"; it also retro-proves the existing factcheck/
          style gates.
      (b) NOT IN THE SLATE (owner-gated, live-only — already in the bring-up runbook): live link-reachability against
          real URLs, flipping PIPELINE_EMBEDDER=real as the settled default, and the dedup-threshold calibration that
          closes OQ-8. These need the CF token / real bge-m3. Reference them as bring-up prerequisites; if any step is
          missing from DEPLOY.md §3, propose the addition there — but keep them OUT of the GREEN-without-secrets slate.
  - WIRING: the matching edits to pipeline/tasks-template.yaml (new task(s) in the research->...->publish chain;
    new gates_extra entries on the draft/new task), pipeline/invariants.yaml (gate registrations), and the design
    docs (docs/writing-flow.md / docs/content-pipeline.md) so the design of record matches the new engine.

Each task MUST state its test strategy: the deterministic mechanism test (fixtures, fail-closed) AND the live-only
semantic check (golden set). Keep tasks well-scoped, serially ordered (parallelism: 1), with explicit depends_on,
and choose task_class per docs/tasks.yaml conventions (pipeline -> opus/max).

== 4. DELIVERABLE & STOP POINT ==
Produce, in this order:
  1. the verified gap ledger (section 0);
  2. the new slate file (section 3);
  3. a short rationale per task — what rigor it adds, how it's proven deterministically AND live, which existing
     principle it preserves;
  4. the concrete diffs to pipeline/tasks-template.yaml + pipeline/invariants.yaml needed to wire it into a real run.
Then STOP. Do NOT run cpe / execute the slate — this is an authoring task for owner review. After presenting it,
offer to run it once the owner approves.
If ANYTHING in this brief conflicts with what you find in the code, TRUST THE CODE and flag the discrepancy.
```

---

*(This prompt is also saved at `docs/writing-rigor-handoff-prompt.md`.)*
