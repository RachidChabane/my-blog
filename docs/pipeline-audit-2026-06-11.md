# Article-pipeline audit — is daily writing scheduled, interesting, and reliable?

Date: 2026-06-11. Method: 6 parallel subsystem audits (scheduler, orchestration, gates,
reliability, interestingness, branch/CI), each adversarially self-verified against the actual
code (24 agents). Evidence is cited as `file:line`. This file is the durable record; the chat
summary is the executive version.

---

## TL;DR — two answers

**1. Is the daily article writing set up and scheduled?** **No.** The scheduler is fully coded,
tested (288 green pytest), and on `main`, but it is **not installed or active anywhere**: no
crontab, no LaunchAgent, no tmux session, and `pipeline/schedule/state/` does not exist (it has
never fired). The repo ships only `scheduler.cron.example` / `scheduler.plist.example`, which the
code deliberately never auto-installs. Today, zero articles appear on the live site automatically.

**2. Will it truly produce interesting + reliable articles with the full rigor I used?** **It is
capable of it — and has done it 3 times — but the _autonomous daily_ configuration as currently
wired would not reproduce that quality.** The three reference-grade articles
(`canon-repriced`, `explainer-ast-chunking`, `briefing-context-budget`) were each produced
**hand-seeded** (a vetted `candidates.json` injected, research skipped), **forced to `opus`**, and
**supervised, push-free**. The scheduled path differs on every one of those axes. The rigor
_machine_ is built to the bar; the autonomous _reproduction_ of it is unproven and has wiring gaps.

The good news is real: the writing-rigor slate is **fully merged into main and every gate is
genuinely wired** and BLOCKs on a live run; the claim-to-source map is now **persisted at publish**
(the old "dropped at publish" gap is closed); and the deterministic teeth (no-em-dash, emoji,
FR-diacritics, citation resolution, distinct-domain) are golden-bank-proven.

---

## Architecture as it actually runs

### 1) End-to-end editorial flow (the cpe slate)

```
 TOPIC SOURCE                       cpe SLATE — 5 tasks, dependency-ordered
 ───────────                ┌───────────────────────────────────────────────────────────┐
 web sweep  ──┐             │ research ─▶ select ─▶ argue ─▶ draft(FR+EN) ─▶ publish      │
 (autonomous)─┤             │   │          │         │          │             │           │
 hand-seed  ──┘  ──────────▶│  candidates  brief.md  argument   draft-fr.md   articles    │──▶ src/content/articles/*.md (FR+EN)
 (3 proven runs)            │  .json                 .json      draft-en.md                │──▶ src/content/provenance/<slug>.<lang>.json
                            │              ┌GATES┐   +indep     claim_source_  topic-      │──▶ pipeline/memory/topic_memory.json (append)
                            │              │argue │   .json      map.json       memory      │
                            │              └──────┘             +findings      append      │
                            │   argument-rigor                  ┌─────GATES (draft)──────┐ │
                            │   source-independence             │ factcheck-fr/en        │ │
                            │                                   │ grounding-fr/en        │ │
                            │                                   │ style-fr/en            │ │
                            │                                   │ editorial-quality      │ │
                            │                                   │ source-quality         │ │
                            │                                   └────────────────────────┘ │
                            └───────────────────────────────────────────────────────────────┘
   blocked argue/draft ─▶ fallback: rewrite brief to next-ranked topic, re-drive (×fallback_topic_attempts)
   still blocked ─────────▶ write ALERT.json, NO publish  (publish depends_on draft ⇒ bilingual-or-nothing)
```

### 2) Gate map — all 11 BLOCK and are wired (`invariants.yaml` + `tasks-template.yaml gates_extra`)

```
 GATE                 SCOPE   KIND            TEETH ON A LIVE RUN
 ───────────────────  ──────  ──────────────  ─────────────────────────────────────────────
 argument-rigor       argue   LLM-judge       re-reads argument.json; BLOCK on "weak"
 source-independence  argue   det + LLM-judge  ≥2 distinct registrable domains (det) + single_origin judge
 factcheck-fr/en      draft   det + LLM-judge  CSM structural backstop (det) + per-claim entailment (judge)
 grounding-fr/en      draft   DETERMINISTIC    every [sN] resolves, no dangling cite, URL reachable*
 style-fr/en          draft   DETERMINISTIC    no-emoji + no-em-dash + FR-diacritics + auditor "clean"
 editorial-quality    draft   LLM-judge       re-reads editorial.json; BLOCK on "thin" (obvious angle)
 source-quality       draft   det + LLM-judge  presence backstop (det) + primary/authoritative judge
 ───────────────────  ──────  ──────────────  ─────────────────────────────────────────────
 * grounding URL-reachability is a NO-OP today: invariants.yaml passes no --link-check, so it runs
   the FakeLinkChecker (every URL "reachable"). See GATE-1/REL-1.
 The 5 LLM-judge gates are VERDICT RE-READERS: the gate only parses a JSON verdict a fresh judge
   sub-agent was prompted to write. Their teeth depend on the prompt dispatching an honest judge —
   validated only at bring-up (GOLDEN_LIVE, default-skipped). See GATE-3/REL-5.
```

### 3) Scheduler + deploy path — and where it is broken

```
   launchd / cron  ✗ NOT INSTALLED  (only *.example templates ship)
        │ 09:00 UTC daily (run) · 12:00 local (monitor)
        ▼
   python -m pipeline.schedule.cron run
        │  pause-check (schedule.json) → heartbeat "started"
        ▼
   runner.run → cpe drives the slate → publish: git add -A && git commit  (LOCAL main)
        │
        ▼
   _after_run → deploy.push_after_success
        │   gated on PIPELINE_GIT_PUSH  ✗ DEFAULT OFF  ── articles never leave local main
        ▼ (only if PIPELINE_GIT_PUSH=1)
   git push origin main ─▶ CI deploy job ─▶ Cloudflare Pages + reindex.yml (avatar re-index)

   monitor (dead-man's switch, 12:00 local)
        │  ✗ BUG: 12:00 Paris = 10:00 UTC = 1h after the 09:00 fire, inside the 6h grace
        ▼     → returns "pending", NEVER emits MISSED in the owner's timezone (SCHED-4)
   check_heartbeat → AlertSink = File(alerts.jsonl) + Log(stderr) only
        │  ✗ no webhook/uptime ping unless ALERT_WEBHOOK_URL/UPTIME_PING_URL set; both commands exit 0
        ▼     → a failed/blocked/missed run notifies NO human (SCHED-6)
```

### 4) Readiness map — what's solid vs what blocks autonomy

```
 SOLID (built + wired + proven)            │  GAP (blocks autonomous interesting+reliable daily)
 ──────────────────────────────────────────┼───────────────────────────────────────────────────
 writing-rigor merged to main, gates wired │  scheduler not installed (P0)
 11 BLOCK gates fire; blocked ⇒ no publish  │  install env missing PIPELINE_GIT_PUSH / _EMBEDDER (P0)
 claim→source map persisted (provenance)    │  rich editorial prompts never injected live (P0, INT-1)
 deterministic style/diacritics/citation    │  autonomous research+topic-select never run live (P0, ORCH-2)
 scheduler design (heartbeat, pause, fallbk) │  scheduled path uses sonnet, not the proven opus (P1)
 288 pytest green locally; golden bank        │  no CI runs pipeline pytest/ruff — rigor can regress (P1)
 provenance sidecars on disk for 3 articles  │  link-check/number-trace/excerpt-verify absent (P1 reliability)
                                            │  dead-man's-switch mis-tuned; no human alerting (P2)
```

---

## Gap ledger (prioritized; every item adversarially verified)

Severity in brackets is the **verified** severity. IDs map to the audit areas.

### P0 — required for "an interesting+reliable article appears live, daily, unattended"

- **[critical] SCHED-1 / ORCH-1 — nothing is installed.** No cron/launchd/state. _Fix:_ install a
  scheduler. Recommend **launchd** over crontab (a laptop asleep at 09:00 skips a cron run with no
  catch-up; `launchd StartCalendarInterval` runs the missed job once on wake — SCHED-5). Add a
  `scripts/install-schedule.sh` (or a `cron.py install` subcommand) that renders the two LaunchAgents
  with the env block below and `launchctl load`s them. _Decision needed._
- **[high] SCHED-2 / ORCH-6 — the install never PUSHES.** `publish` commits FR+EN to local `main` but
  `deploy.push_after_success` returns early unless `PIPELINE_GIT_PUSH=1` (`config.py:128`,
  `deploy.py:39-40`). The example cron/plist set no env, so a perfectly-run article never deploys.
  _Fix:_ bake `PIPELINE_GIT_PUSH=1` into the rendered install env (and add a render-test asserting it).
  _Decision needed: autonomous push to the public site, or a human review-then-push gate?_ (The global
  owner directive authorises autonomous push; the first-batch runs were kept push-free for supervised
  review. CI does **not** run the Python tests before deploy, which argues for a first-N review gate.)
- **[critical→high] INT-1 / ORCH-4 — the rich editorial prompts are dead code on every live path.**
  `editorial_stage_descriptions()` (the steelman / falsifiable / concrete-number / independent-sourcing
  instructions) has **zero production callers**; `runner.run()` and `launch_seed.py` both call
  `assemble_slate(run_id, config)` bare, so the agent reads the **thin placeholder** descriptions in
  `tasks-template.yaml`. The 3 proven runs only worked because the `opus` agent chased the file pointer
  the placeholder names. _Fix (ready):_ thread `stage_descriptions` into `runner.run()` and pass
  `editorial_stage_descriptions(config, run_dir, topic_memory_summary=...)`; `assemble_slate` already
  accepts it (`runner.py:253-257`). Add a test asserting the live slate's argue/draft descriptions
  contain "steelman"/"contestable". This is the single biggest quality fix and is owner-decision-free.
- **[high] ORCH-3 — the scheduled run uses `sonnet`, not the `opus` that hit the bar.** `config.py:107`
  default is `sonnet`; `from_env` reads no model override; `launch_seed` forced `opus`. _Fix:_ add a
  `PIPELINE_MODEL` env read and set `PIPELINE_MODEL=opus` in the install env, **or** prove `sonnet`
  clears the judge gates on a hard topic first. _Decision needed (opus daily = cost)._
- **[medium] SCHED-3 — `PIPELINE_EMBEDDER=real` not set,** so `select` dedups on the monolingual
  offline fake. _Fix:_ add it to the install env.
- **one-time:** a tmux/subscription Claude login for the cpe backend the run drives (owner manual step).

### P1 — close the gap to "reliable: every number traces to a verified source"

- **[high] GATE-1 / REL-1 — grounding dead-link check is a no-op in production.** `invariants.yaml:39,47`
  pass no `--link-check`, so `FakeLinkChecker` reports every URL reachable; a 404'd cited URL publishes.
  _Fix:_ append `--link-check real` to `grounding-fr/en`, behind an env switch so CI stays offline; add a
  golden case where a known-404 blocks.
- **[high] REL-2 — no excerpt-vs-live-source check.** A fabricated-but-plausible excerpt on a real URL
  passes every gate. _Fix:_ new `gate/excerpt_verify.py` — fetch each cited URL, assert the normalized
  excerpt is a substring; BLOCK on absence (same real-link env switch).
- **[high] REL-3 — no deterministic hallucinated-number defense.** The reference bar ("refuses to publish
  a number it cannot trace") is not enforced. _Fix:_ new `gate/number_trace.py` — regex-extract numeric
  tokens (allowlist years/section numbers), require each in a cited excerpt or a CSM claim; BLOCK
  otherwise; wire `number-trace-fr/en` into `invariants.yaml` + `draft.gates_extra` + a golden artifact.
- **[high] REL-4 — factcheck passes vacuously on empty claims and never asserts CSM coverage.**
  `factcheck_passes` is `True` for `claims:[]` (`factcheck.py:122-124`). _Fix:_ require the fact-checked
  ids to cover the per-language CSM claim set; BLOCK on any uncovered claim; golden artifact.
- **[critical] ORCH-2 / INT-2 — autonomous research + topic-selection has never run live.** All 3 proven
  articles were hand-seeded. _Fix (proof, not code):_ one supervised, push-free, **unseeded** full run
  with `PIPELINE_EMBEDDER=real`; inspect `candidates.json` for real URLs + verbatim excerpts + ≥2
  independent sources, and confirm the chosen topic is novel vs `topic_memory`. Until this passes, the
  unseeded daily run is unproven on exactly the "interesting + reliable" axes.
- **[high] CI-1 / CI-2 — no CI runs the pipeline pytest/ruff;** the 288-test rigor suite (golden bank +
  gate-wiring tests) is green only locally. A future edit that un-wires a gate ships green. Complication:
  `cpe` is an **undeclared cross-repo dependency** (sibling checkout at
  `/Users/rachid/dev-env/0-git/claude-plan-execute`, found by runtime discovery). _Fix:_ add a `pipeline`
  CI job that checks out a **pinned** cpe SHA, sets `CLAUDE_PLAN_EXECUTE_HOME`, and runs
  `ruff check pipeline && python -m pytest pipeline -q` (offline; GOLDEN_LIVE stays opt-in). _Decision
  needed: is cpe public or private (token?), and which SHA to pin?_

### P2 — robustness, alerting, editorial range

- **[high] SCHED-4 — dead-man's-switch never fires MISSED in Europe/Paris** (monitor at 12:00 local is
  inside the 6h grace). _Fix:_ derive `monitor_hour` from `cadence + grace + local-offset` (or set 18:00
  Paris); regression test at the rendered instant. Matters once SCHED-1 lands.
- **[medium] SCHED-6 — a failed/blocked run notifies no human** (File+Log only, both commands exit 0).
  _Fix:_ set `ALERT_WEBHOOK_URL` (Slack/Discord/ntfy) — and ideally `UPTIME_PING_URL` (healthchecks.io)
  so an asleep/off machine is detected externally. _Decision needed: which channel/URL._
- **[medium] GATE-3 / REL-5 — the 5 LLM-judge verdicts are unvalidated on every default run.** _Fix:_ run
  GOLDEN_LIVE as a recurring judge-calibration (first-of-batch), and a deterministic test that the
  fresh-judge dispatch block in the stage prompts is intact (catch a self-grade regression).
- **[high→medium] INT-2/INT-3 — no curated topic backlog; interestingness has no deterministic floor.**
  Selection optimises anti-repeat, not editorial value. _Fix:_ a committed `topic_backlog.yaml` (seed the
  canon 14-row thread + evergreen wedges) the select stage prefers; a cheap deterministic stance/counter
  -argument WARN floor in the style gate.

---

## Recommended path to "on" (phased; each phase is provable before the next)

**Phase A — prove autonomous quality, supervised & push-free (no activation yet).**
Land INT-1 (wire the rich prompts) + the reliability gates (link-check real, number-trace,
excerpt-verify, factcheck coverage) + the CI pytest job (the ratchet). Then do **one unseeded,
supervised, push-free full run** on `opus` with `PIPELINE_EMBEDDER=real` and read the output end to
end. This answers the only question that matters: can the engine originate a wedge-class, fully-cited
article without a human seed? Cost: code + one watched run.

**Phase B — harden the operator.** Fix `monitor_hour`, wire `ALERT_WEBHOOK_URL` + `UPTIME_PING_URL`,
add the topic backlog, decide the model (opus daily vs proven-sonnet). Cost: config + small code.

**Phase C — activate.** Install launchd with the deploy-ready env block, decide push-to-main
(autonomous vs first-N review gate), watch the first scheduled fire produce a live article +
heartbeat + (deliberately) a forced alert. Only here does the site update itself daily.

```
 # deploy-ready install env block (Phase C) — for the rendered LaunchAgent / cron VAR lines
 PIPELINE_GIT_PUSH=1            # else the article never leaves local main
 PIPELINE_EMBEDDER=real         # else select dedups on the monolingual fake
 PIPELINE_MODEL=opus            # if opus daily is chosen (else prove sonnet first)
 ALERT_WEBHOOK_URL=<slack/discord/ntfy>   # else failures are silent
 UPTIME_PING_URL=<healthchecks.io>        # detects an asleep/off machine
```

## Decisions needed from the owner (batched)

1. **Autonomous push to the live site, or a human review-then-push gate** for the first N articles?
   (CI does not run the Python tests before deploy, which favours a review gate initially.)
2. **Model for the daily run:** `opus` (proven quality, higher cost) or prove `sonnet` clears the
   judge gates first?
3. **cpe repo:** public or private (CI checkout token?), and which SHA to pin for the CI job?
4. **Alert channel:** which webhook + uptime URL?
5. **launchd vs crontab** (recommend launchd for sleep catch-up).
6. **Cadence:** is daily even right given a finite interesting-topic space and the 0.82 dedup
   placeholder? A 2-3×/week cadence may sustain quality better than daily-or-fallback-to-least-similar.
