# Hand-off prompt — running the FIRST live batch of the content engine

Paste the fenced block into a fresh agent session. It hands off the first real pipeline run — the first
time the engine's live backends (tmux+claude, the real embedder, the semantic M-4 gate judgments)
execute outside CI fakes. It is framed as a SUPERVISED validation run, push-free, with the prepared
`canon-repriced` article as the first payload.

---

```
You are the agent in charge of running the FIRST LIVE BATCH of the my-blog content engine
(repo: /Users/rachid/dev-env/0-git/my-blog). The engine has NEVER been run live — every stage has
only been exercised in CI against FAKES and FIXTURES. This run is the first time real backends
execute: cpe over tmux+claude (the subscription pool), the real embedder, the live link check, and —
most importantly — the SEMANTIC judgment of the M-4 gates (does fact-check actually catch an
unsupported claim, does the style-auditor actually catch an AI-tell). Treat this as a SUPERVISED
VALIDATION run, not fire-and-forget. Operate autonomous-by-default, but batch every manual owner ask
into ONE consolidated handoff and never push/deploy without an explicit owner OK.

== 0. RE-EXPLORE FIRST — the code + runbook are ground truth, not this brief ==
Read, at minimum, before doing anything:
  - DEPLOY.md — the ★ Bring-up status line (site + avatar are LIVE + gate calibrated as of 2026-06-09),
    §3 step 5 (the RUNNER bring-up), §4 (untested-until-bring-up surface), §5 (env var reference).
  - docs/owner-bringup-checklist.md — GROUP 2 / O5 (the runner machine + tmux + claude auth) is the
    gating manual step for the content engine.
  - pipeline/README.md, pipeline/runner.py (the run-dir / exit-75 contract; assemble_slate; the
    push-free core), pipeline/schedule/cron.py (the `run` entrypoint, the PIPELINE_GIT_PUSH gate).
  - pipeline/tasks-template.yaml (the 4-task slate: research -> select -> draft(FR+EN) -> publish;
    the 6 M-4 gates attach to draft), docs/writing-flow.md (the stage roles + the bilingual-or-nothing
    rule), pipeline/house_style.md (the Tier-0 voice the draft must hit).
  - pipeline/gate/{factcheck,grounding,style,fallback}.py — the gates you are about to fire LIVE.
  - The prepared first payload: docs/article-brief-canon-repriced.md (the brief + the BRIEF block) and
    docs/seed/canon-repriced.candidates.json (13 sources, each with a VERBATIM excerpt the fact-check
    verifies against; passes `python3 -m pipeline.stages.research --validate`).
  - docs/writing-rigor-handoff-prompt.md — the KNOWN engine gaps (no argument pressure-test;
    fact-check is entailment not correctness; the real link checker is NotImplementedError). Know them
    before you trust a green run.
  - Project memory: ~/.claude/projects/-Users-rachid-dev-env-0-git-my-blog/memory/MEMORY.md, especially
    m4-gate-contract, select-dedup-fake-embedder-default, publish-stage-commit-no-push-gap,
    pipeline-cpe-harness-contract, claim-source-map-dropped-at-publish, avatar-worker-runtime-gotchas
    (live-only bugs the fakes hid), deploy-phase-rag-vectorize-d1-bge-m3, article-direction-ai-repriced-solid.

== 1. PREREQUISITES — check each; do all you can; batch the rest into ONE owner ask ==
  - O5 RUNNER (manual, owner-gated): a machine with cpe installed and `claude` authenticated over tmux
    on the subscription pool (M-6/NFR-10 — the OAuth auth CANNOT be automated). Verify it is set up
    (DEPLOY.md §3 step 5). If not, this is the primary owner ask.
  - REAL EMBEDDER: export PIPELINE_EMBEDDER=real for any live run, or the select stage dedups on the
    monolingual FAKE (select-dedup-fake-embedder-default). It needs EMBEDDINGS_API_KEY = the Cloudflare
    token (D-1 bge-m3, deploy-phase-rag-vectorize-d1-bge-m3). On a first run topic memory is empty so
    dedup is trivially satisfied — fake is acceptable ONLY as a stopgap, and you must FLAG it.
  - REAL LINK CHECKER: gate/grounding.py's real reachability check is NotImplementedError — the live
    run uses the FAKE, so dead-link detection does NOT actually fire. Either land the real checker first
    (it is a task in the writing-rigor slate) or run with the fake and EXPLICITLY flag that reachability
    is unverified for this article.
  - PUSH STAYS OFF: do NOT set PIPELINE_GIT_PUSH=1. Leave it unset so the run is push-free — publish
    commits FR+EN LOCALLY only (publish-stage-commit-no-push-gap). The push is what fires the Cloudflare
    Pages deploy + the avatar reindex; that is a SEPARATE, owner-gated, deploy-time step.
  - Never commit secrets / .env.

== 2. SCOPE — confirm with the owner if unsure ==
The evident intent is to publish the PREPARED canon-repriced article first (we hand-built and
verified its sources). So:
  GOAL A — publish canon-repriced from the seed. This validates the HAPPY PATH (clean input flows
    research -> select -> draft -> gates -> publish) and ships the pre-vetted article. It does NOT prove
    the gates CATCH a bad input: the seed's excerpts were hand-built to ENTAIL their claims, so a green
    fact-check here only proves the gate passes clean input, never that it blocks a bad one.
  GOAL A2 — the REAL gate-judgment test, a CANARY. Catching-power is the one thing neither CI fakes nor
    a happy-path seed can exercise. Craft a draft + claim_source_map with deliberately-planted defects —
    one claim whose excerpt does NOT support it, one [sN] citing a dead URL, one AI-tell, one emoji — run
    the gate modules on it, and CONFIRM each corresponding gate BLOCKS (factcheck / grounding /
    style+no-emoji-scan). This is the golden-adversarial-set idea from docs/writing-rigor-handoff-prompt.md.
    Caveat: the dead-link canary only fires if the REAL link checker is in (section 1 — it is faked by
    default). Do A2 before trusting ANY green run.
  GOAL B — a fully-live run where the RESEARCH stage does its own web sweep and picks a topic; validates
    research + real-embedder dedup before you enable the daily cadence.
Each goal is a SEPARATE run with a DISTINCT run_id (see section 3: run_id == calendar day, so two
`cron run`s in one day COLLIDE). If the owner would rather the first article be research-chosen, skip the
seed and start at GOAL B.

== 3. THE RUN — supervised, in tmux, push-free ==
Two invocation modes — and run_id == the calendar day (YYYY-MM-DD), so a same-day re-fire RESUMES the
SAME run_dir and never re-assembles. You therefore CANNOT run two distinct batches via `cron run` on one
calendar day; give A2 / B different days, or drive runner.run() directly with an explicit non-date run_id.
  - FULL LIVE (GOAL B; and the A2 canary via crafted input): from repo root,
    `PIPELINE_EMBEDDER=real python -m pipeline.schedule.cron run`. The run lives in
    pipeline/runs/<run_id>/ with an assembled tasks.yaml + plans/.
  - SEED-INJECTED (GOAL A): `cron run` CANNOT inject the seed — it assembles AND drives in one call, so
    there is no hook to drop candidates.json in between assemble and the research task, and you CANNOT
    start at select (select depends_on research, so cpe will not touch it until research is marked done).
    The only real path: call runner.run() / the slate driver DIRECTLY with an explicit (non-date) run_id,
    having FIRST assembled the run, copied docs/seed/canon-repriced.candidates.json to
    <run_dir>/plans/task-research/candidates.json, AND marked the research task complete in cpe state.
    Verify the exact runner API + cpe state shape against runner.py + the cpe contract before relying on
    it; if it is not cleanly supported, run GOAL B first and treat canon-repriced as a later targeted run.
  - Watch each cpe task in tmux. The first run is a VALIDATION: a blocking gate is the system WORKING —
    diagnose it, let the gate-repair/fallback run, or surface to the owner. NEVER bypass a gate.

== 4. VERIFY AT EVERY SEAM (this is the point of the run) ==
  - research: pipeline/runs/<run_id>/plans/task-research/candidates.json valid (or the seed in place).
  - select: plans/task-select/brief.md written; `validate-brief` OK; the dedup tool actually RAN against
    topic memory with the REAL embedder (not the fake).
  - draft: draft-fr.md + draft-en.md produced; plans/task-draft/claim_source_map.json complete + valid;
    bilingual parity (fr/en cite the SAME skeleton source_ids).
  - M-4 GATES (the 6 BLOCKers: factcheck/grounding/style x fr/en) — read EVERY findings file and confirm
    the SEMANTIC judgment ran, not just the mechanism. NOTE: on the GOAL-A seed run a green fact-check
    only proves the gate PASSES CLEAN INPUT (the seed's excerpts were hand-built to entail their claims);
    it proves NOTHING about catching a bad one — that is what the GOAL-A2 canary tests (section 2), not
    this run.
  - CROSS-LINGUAL FACT-CHECK (a first-time live behavior — verify explicitly): the sources are English
    and the FR draft cites the same English source_ids, so the gate judges FRENCH claims against ENGLISH
    excerpts. That cross-lingual entailment has never executed in CI; confirm the fr fact-check passes (or
    fails) on its merits, not by accident.
  - publish: FR+EN committed LOCALLY (git log shows the commit; NOTHING pushed); provenance sidecars
    written per cited source (<slug>.<lang>.json); the article renders; sidenotes activate if the body
    carries [sN] markers (claim-source-map-dropped-at-publish — the CSM itself is dropped at publish).
  - topic memory updated (idempotency key = translationKey; embedding:null at write).
  - exit-75 auto-resume: if the run hits a usage limit, confirm the loop wrapper sleeps + relaunches
    (this path is ONLY exercisable live; the offline tests don't prove the real wrapper consumes the
    sentinel).

== 5. HONESTY THE GREEN RUN DOES NOT GIVE YOU ==
Even a fully-green run does NOT prove the article's ARGUMENT is good: fact-check is entailment ("does
the excerpt support the claim"), not correctness; review is coverage, not quality; there is no
argument pressure-test (writing-rigor-handoff-prompt.md). The canon-repriced brief front-loaded that
work BY HAND (its thesis was adversarially steelmanned/attacked/reconciled), so this specific article
is safe — but autonomous GOAL-B runs will NOT have that until the writing-rigor upgrade ships. Also:
the 0.82 dedup threshold is an OQ-8 placeholder (harmless while topic memory is near-empty; flag for
when it fills), and the link checker is faked (section 1).

== 6. DELIVERABLE + STOP POINT ==
Produce a RUN-LOG (append to RUN-LOG.md or a dated doc): which path you ran (seed/live), each stage's
artifacts, every gate verdict, explicit confirmation that the SEMANTIC gates demonstrably fired, any
live-only failure + the fix, and a GO/NO-GO on whether the engine is ready for the daily cadence
(`python -m pipeline.schedule.cron render --resolve | crontab -`). Then STOP:
  - Do NOT push / deploy / reindex (no PIPELINE_GIT_PUSH=1, no `wrangler ... deploy`, no crontab install)
    without an explicit owner OK — the local publish commit is the safe stopping point.
  - Present ONE consolidated owner ask for anything blocked (O5 auth, the push approval, enabling cadence).
If anything here conflicts with the code or DEPLOY.md, TRUST THOSE and flag the discrepancy.
```

---

*(This prompt is also saved at `docs/first-batch-handoff-prompt.md`.)*
