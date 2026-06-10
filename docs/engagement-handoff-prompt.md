# Hand-off prompt — my-blog engagement bring-up

Paste everything in the fenced block below into a fresh agent session. It explains where the work
was left and tells the agent to first give you a precise, ordered list of the manual steps you must
perform before it can take over the rest.

---

```
You are picking up the ENGAGEMENT work on the my-blog project (repo: /Users/rachid/dev-env/0-git/my-blog).
A previous agent built it; your job now is BRING-UP, which is gated on a few manual steps only the
owner can do. Operate autonomous-by-default, but the FIRST thing you do is the task in section C.

== A. WHERE IT WAS LEFT (read these before doing anything) ==
- Branch `engagement-tier0-and-options` holds 4 commits, NOT pushed, working tree clean. Do NOT push
  to main without an explicit owner ask (a push to main fires the CF Pages deploy + reindex).
- Sources of truth — READ THEM FIRST:
  - docs/engagement-findings.md  — engagement status (§4: per-option done/gated) + the consolidated
    handoff (§5: the keys/account come-backs and the Option 3 PCA build plan).
  - DEPLOY.md                    — the deploy runbook. §1 = the OWNER-ONLY steps (O1–O6). §3 = the
    bring-up runbook YOU execute once keys arrive. §3 step 4b = the SAFETY-CRITICAL avatar-gate
    recalibration. §4 = the untested-until-bring-up surface.
  - The project memory: ~/.claude/projects/-Users-rachid-dev-env-0-git-my-blog/memory/MEMORY.md and
    the files it indexes (esp. avatar-per-article-scoping, provenance-sidecar-contract,
    avatar-gate-calibration-fake-tuned, perf-gate-counts-external-scripts-only).
- What is BUILT + VERIFIED this engagement (committed on the branch):
  - Tier-0 prose fix (pipeline/house_style.md + prompts/draft.py): problem-first/POV leads,
    SOURCED-numbers-only, anti-translationese FR. Voice-validated by an offline dry-run.
  - Option 1: per-article "ask the agent about this article" button (reuses the avatar panel).
  - Option 2: grounded-citation sidenotes — publish-stage provenance sidecars + `provenance`
    content collection + a renderer island. DORMANT until a published article actually contains
    [sN] markers (the seed corpus has none); it no-ops safely today.
  - Option 4: true per-article scoping — scopeSlug end-to-end + the topSimilarity gate-fix (refusal
    computed over the scoped subset) + a Vectorize topK clamp. The per-article button is scoped; the
    corner launcher stays corpus-wide.
  - Option 3 (embedding map): INTENTIONALLY NOT BUILT — its value is entirely behind real vectors
    (needs the CF token). A dependency-free PCA build plan is in engagement-findings.md §5 item 2.
  - Gates at hand-off: vitest 480, pytest 191 (pipeline), astro check 0 errors, eslint + prettier
    clean, e2e 100 passed. Re-run `pnpm lint`, `pnpm test`, `pytest -q pipeline`, `pnpm test:e2e`
    to confirm before you build on top.
- HONESTY FLAGS to respect:
  - The avatar "I don't know" gate threshold (0.25) + cosine DIRECTION are FAKE-embedder placeholders.
    Recalibrating against live bge-m3 (DEPLOY.md §3 4b) is SAFETY-CRITICAL and is now ALSO load-bearing
    for the user-facing scoped button. Do it before exposing the avatar.
  - The Tier-0 dry-run article (pipeline/runs/dry-run-tier0-rrf/, gitignored) validated VOICE, not
    FACTS (it skipped the semantic fact-check + used the fake link checker). Do NOT promote it to a
    reader-facing article without a real semantic fact-check + live link check.

== B. WHAT IS LEFT = manual owner steps, then you do the rest ==
Everything remaining is either (1) a key/account step the owner must do, or (2) bring-up work you do
once those arrive (provision, deploy, recalibrate the gate, run the pipeline, build the Option 3 map).

== C. YOUR FIRST TASK (do this BEFORE any build/deploy/provision work) ==
Tell the owner PRECISELY what they must do now — every manual step, in order, until they can hand
the rest back to you. Produce a single owner-facing checklist that:
  1. Lists each manual step grouped by WHAT IT UNLOCKS, marking REQUIRED vs OPTIONAL.
     Ground it in DEPLOY.md §1 (O1 Cloudflare API token with exact scopes; O3 OpenRouter key;
     O5 the pipeline runner + one-time `tmux`+`claude` subscription auth; O6 alert webhook (optional);
     O2 Workers Paid and O4 custom domain are optional/non-blocking).
  2. Gives the exact, copy-pasteable command or click-path for each step the OWNER runs.
  3. Specifies the SAFE secret-handover method — the previous CF token leaked via a transcript, so
     the owner must NOT paste raw secrets into chat. Have them use the `!` shell prefix in-session
     (e.g. `! gh secret set CLOUDFLARE_API_TOKEN --body '...'`) or `! export VAR=...`, or set the
     Pages/GH secrets themselves and just confirm. Never echo a secret back into the conversation.
  4. States the HANDBACK TRIGGER for each group: e.g. "once O1 + O3 are set, tell me and I will
     provision CF, seed the index, deploy, and recalibrate the avatar gate"; "once O5 is authed, I
     will run a supervised pipeline pass that regenerates the corpus and activates the sidenotes +
     the new voice."
  5. Makes explicit the SHORTEST PATH: O1 + O3 → static site + live avatar (corner + scoped
     per-article) + recalibrated gate + the Option 3 map. Add O5 → corpus regen activates Option 2
     sidenotes and the sharper Tier-0 voice in real articles.

Do NOT begin provisioning, deploying, setting secrets, or running the pipeline until the owner
confirms the relevant manual steps are done. After you present the checklist, wait for the owner.

== D. ONCE THE OWNER HANDS BACK (your bring-up sequence, autonomous) ==
Follow DEPLOY.md §3 exactly:
  1. With O1: `bash scripts/cf-provision.sh` (account id b80b576d7908f66d87478b739446ae55), paste the
     printed D1 database_id into wrangler.toml.
  2. Set secrets (gh secret / Pages env) per DEPLOY.md §3 step 2 (EMBEDDINGS_API_KEY = the CF token).
  3. `EMBEDDINGS_API_KEY=$CLOUDFLARE_API_TOKEN pnpm build:index --push` (seed Vectorize + D1).
  4. Deploy (push to main only with explicit owner ask, or `wrangler pages deploy`).
  4b. RECALIBRATE THE AVATAR GATE — SAFETY-CRITICAL (DEPLOY.md §3 4b): direction check first
      (on-topic topSimilarity must be NEAR 1, else the gate is inverted — flip the score in
      VectorizeVectorStore.search), then set AVATAR_SIMILARITY_THRESHOLD between on-topic and
      off-topic. This gates the scoped button's trust.
  5. With O5/O6: supervised first pipeline run (`PIPELINE_EMBEDDER=real ... python -m
     pipeline.schedule.cron run`) — verify the M-4 gate + that provenance sidecars are written; this
     regenerates the corpus so Option 2 sidenotes + the new voice go live. Then install the schedule.
  6. Build Option 3 (embedding map) per engagement-findings.md §5 item 2 once vectors exist.
Re-verify the full gate suite after each step. Keep DEPLOY.md / engagement-findings.md / RUN-LOG.md
updated as work lands, and save any non-obvious new facts to the project memory.
```

---

*(This prompt is also saved at `docs/engagement-handoff-prompt.md`.)*
