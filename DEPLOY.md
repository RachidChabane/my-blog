# DEPLOY — bring-up runbook + owner handoff

**Phase:** deploy/ops (the 30-task BUILD is done & verified; we are wiring it to live infra).
**Target:** static site live at `https://my-blog-4uk.pages.dev` → live avatar (RAG on Cloudflare
Vectorize + D1) → daily article pipeline.

This file is the single source of truth for the deploy. It is updated as autonomous work lands;
the **owner-only** steps are consolidated in §1. See also `RUN-LOG.md` (action log), `LAUNCH.md`
(launch-readiness gate), `pipeline/README.md` (scheduler), `docs/persona.md` (manual steps).

---

## ★ Bring-up status (2026-06-09) — site + avatar LIVE on pages.dev, gate calibrated

**Live + verified:** https://my-blog-4uk.pages.dev (static site) + the avatar (corpus-wide corner
launcher + the scoped per-article button). Done autonomously this bring-up:

- CF provisioned: Vectorize `my-blog-avatar` (1024-d/cosine) + D1 `my-blog-avatar`
  (`database_id` `bce36924-…-2ba9fbc908c5`, pasted into `wrangler.toml`). Index seeded (31 chunks,
  30 slugs, FR+EN). Deployed via `wrangler pages deploy`.
- Secrets: Pages → `OPENROUTER_API_KEY`, `AVATAR_SIMILARITY_THRESHOLD`. GH Actions →
  `CLOUDFLARE_API_TOKEN`, `EMBEDDINGS_API_KEY`, `OPENROUTER_API_KEY`, `SITE_URL`.
- **Gate calibrated (§3 step 4b, SAFETY-CRITICAL): `AVATAR_SIMILARITY_THRESHOLD = 0.46`**, cosine
  direction confirmed NOT inverted. Live `done`-frame: on-topic → grounded (topSim 0.77),
  off-topic → honest idk (0.32). Tool: `scripts/calibrate-avatar-gate.ts` (re-run on every regen).
- Two live-only runtime bugs fixed (commit `55a99e4`): Workers `fetch.bind(globalThis)`; D1
  `toD1Sql` drops file-level `BEGIN/COMMIT`. See the `avatar-worker-runtime-gotchas` memory.
- **`SITE_URL` is `https://my-blog-4uk.pages.dev` for the interim** (until the custom domain is on
  Cloudflare) so the avatar's citation links resolve today. Flip everything to
  `https://rachid-chabane.com` at the domain handback (item 1 below).

**Open — needs the owner (consolidated handoff):**

1. **Custom domain `rachid-chabane.com` — owner DNS migration.** It's registered at IONOS
   (`*.ui-dns.*` nameservers), NOT on Cloudflare, so Pages cannot attach it yet. Owner: add the zone
   in the CF dashboard; **audit the current IONOS DNS first and recreate any email (MX), SPF/DKIM/TXT,
   and subdomain records in Cloudflare** (moving nameservers makes CF authoritative for the WHOLE
   domain — un-migrated records break on cutover); then point the IONOS nameservers at the CF pair.
   Tell me when the zone is Active → I attach the Pages custom domain + DNS record and flip `SITE_URL`
   (build + reseed + GH/Pages) to the apex.
2. **Pipeline first run (§3 step 5) — owner DECISION, intentionally NOT run.** The owner's in-flight
   `docs/writing-rigor-handoff-prompt.md` targets the pipeline's argument/source-quality/editorial
   gaps and says "reconcile with DEPLOY.md §3", so running step 5 now would publish content with
   prompts under active revision. Options: **(a)** run AFTER the writing-rigor slate lands
   (recommended); or **(b)** a no-push throwaway run now to de-risk the cpe harness mechanics
   (findings §3 flagged it as never run green end-to-end) — inspected, then discarded, never promoted.
3. **Option 3 embedding map — ready to build (autonomous), greenlight when wanted.** Lowest-value /
   owner-questioned; best timed once the corpus is finalized (auto-updates on reindex). Build plan +
   guardrails (empty-map fallback; emit in the build:index/deploy path, not `reindex.yml`):
   `engagement-findings.md` §5 item 2.

---

## 0 · Decision record (read this first)

### D-1 — Embeddings: Cloudflare Workers AI `@cf/baai/bge-m3`, NOT OpenRouter `text-embedding-3-large`

The resume plan locked "embeddings via OpenRouter, one key." I **overrode** the _mechanism_ (not
the store): embeddings run on **Cloudflare Workers AI `@cf/baai/bge-m3`** (1024-dim, multilingual,
instruction-free), the same platform as Vectorize/D1.

**Why** (the locked plan's own rationale — "native CF, $0, zero external vendor, zero-ops" — argued
for this, and "one OpenRouter key" was in tension with it):

- Query-time embedding runs **inside the Worker via the `AI` binding** → no external HTTP on the RAG
  hot path, and **no embeddings key in the Pages Function** (smaller secret surface).
- `bge-m3` is 1024-dim (≤ Vectorize's 1536 cap), multilingual (FR+EN), instruction-free
  (`embedQuery(t) == embed([t])[0]` — no query/passage prefix asymmetry).
- ~$0: Workers AI has a free daily allocation; bge-m3 is $0.012 / M tokens beyond it.
- The **avatar LLM stays on OpenRouter** (`synthesize.ts`) — persona quality. So OpenRouter is still
  in the stack, but only for chat synthesis, not embeddings.

**Veto path:** `bge-m3` is _also_ served on OpenRouter (`baai/bge-m3`), so if you prefer the
single-key story, the _model_ is unchanged — only the query-time path flips from the `AI` binding to
an OpenRouter HTTP call (slower, adds a key to the Function). Tell me and I'll switch.

**Consequence for keys:** `EMBEDDINGS_API_KEY` is now **the Cloudflare API token** (used by the
build/index scripts to call the Workers AI REST API). The Function needs no embeddings key.

### D-2 — `O2` (Workers Paid, $5/mo) is NOT a launch blocker

Vectorize, D1, Workers AI, and Pages Functions all run on the **Workers Free** plan (Vectorize free
tier: 30M queried + 5M stored dims/month; D1: 5M reads/day, 5GB). The whole app launches free; paid
is only needed at ≈year-1 scale. Enable it whenever; it does not gate go-live.

### D-3 — Cadence is **daily** (`0 9 * * *`)

Per the resume ("daily article"). That is ~7 articles/week. The topic-dedup + M-4 quality gate
throttle naturally, but if you want more quality/dedup headroom, say the word and I'll set 3×/week
(`0 9 * * 1,3,5`) — it's a one-line `Cadence` change. Done: `DEFAULT_CADENCE` + render + docs.

---

## 1 · OWNER-ONLY steps (consolidated — these cannot be automated)

| #      | Step                                    | Detail                                                                                                                                                                                                                                                  |
| ------ | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **O1** | **Rotate the Cloudflare API token**     | The previous token was exposed in a cleared transcript. Create a new one with **Account · Cloudflare Pages : Edit + Vectorize : Edit + D1 : Edit + Workers AI : Read** (add **Zone · DNS : Edit** only if doing a custom domain). Give me the value.    |
| **O2** | _(optional, non-blocking)_ Workers Paid | $5/mo. Needed only at ≈year-1 scale (see D-2).                                                                                                                                                                                                          |
| **O3** | **OpenRouter key**                      | Sign up → add credits → create one API key. This is now **only for the avatar LLM** (synthesis), not embeddings. Give it to me.                                                                                                                         |
| **O4** | _(optional)_ Custom domain              | Register a domain + add it to Cloudflare if you want one instead of `my-blog-4uk.pages.dev`.                                                                                                                                                            |
| **O5** | **Pick + prep the runner**              | The machine that runs the daily pipeline (your Mac, or a small always-on VPS). One-time: run `claude` interactively in a `tmux` window there to auth your subscription (the pipeline drives the subscription pool, not the API).                        |
| **O6** | **Alert destination**                   | Where failure alerts go — a webhook URL (Slack/Discord/ntfy/your own). I've already built the sink; I just need the URL (`ALERT_WEBHOOK_URL`). Optionally also a healthchecks.io-style ping URL (`UPTIME_PING_URL`) for the external dead-man's-switch. |

Everything else below is automated; I do it once O1/O3 (and O5/O6 for the pipeline) arrive.

---

## 2 · Done autonomously (this deploy phase)

- **M-13** git-push-on-success — `deploy.push_after_success` at the CLI layer, gated on
  `PIPELINE_GIT_PUSH=1`. Closes the publish-commits-but-never-pushes gap (publish → push → CI
  deploy & reindex). Pure run core stays push-free; tests/CI never push.
- **M-14** alerting — `WebhookAlertSink` (POST to `ALERT_WEBHOOK_URL`) behind the existing
  `AlertSink` Protocol + `ping_uptime()` external dead-man's-switch (`UPTIME_PING_URL`). Wired into
  `_default_sink` + run/monitor.
- **M-15** daily cadence — `DEFAULT_CADENCE` → every day; render + example files + docs updated.
- **M-1/M-2** Vectorize+D1 bindings + D1 schema (FTS5 `remove_diacritics`) + `cf-provision.sh`; real
  embedder = Workers AI `@cf/baai/bge-m3` (TS binding + REST, Python REST), fail-loud factories.
- **M-3/M-5** query path over the bindings — `VectorizeVectorStore` (dense) + `D1LexicalStore` (FTS5
  BM25, query escaped) + chunk hydration; RRF unchanged; `onRequestPost` rewired off the JSON
  artifact onto AI/VECTORIZE/DB.
- **M-4** `build:index --push` populates Vectorize + D1 (NDJSON + transactional SQL; full replace).
- **M-8** CI `deploy` job (push → index + Pages) + `reindex.yml` index-only (no double-deploy).

All committed with `pnpm test` (451) / `pnpm lint` (0 err) / `pytest -q pipeline` (187) /
`ruff check pipeline` green.

---

## 3 · Bring-up runbook (once O1/O3 arrive)

```
# 1. Provision the CF resources (needs the rotated token; prints the D1 database_id):
export CLOUDFLARE_API_TOKEN=...   CLOUDFLARE_ACCOUNT_ID=b80b576d7908f66d87478b739446ae55
bash scripts/cf-provision.sh                    # wrangler vectorize create + d1 create + schema load
#   -> paste the printed database_id into wrangler.toml ([[d1_databases]].database_id)

# 2. Secrets (never echoed into commits):
gh secret set CLOUDFLARE_API_TOKEN  --body "$CLOUDFLARE_API_TOKEN"
gh secret set OPENROUTER_API_KEY    --body "..."
gh secret set EMBEDDINGS_API_KEY    --body "$CLOUDFLARE_API_TOKEN"   # = the CF token (Workers AI REST)
gh secret set SITE_URL              --body "https://my-blog-4uk.pages.dev"
#   Pages env vars (dashboard or `wrangler pages ... `): OPENROUTER_API_KEY, SITE_URL
#   (Vectorize/D1/AI are bindings in wrangler.toml; the embeddings key is NOT needed in the Function.)

# 3. Seed Vectorize + D1 from the existing articles (full rebuild + push via wrangler):
EMBEDDINGS_API_KEY=$CLOUDFLARE_API_TOKEN pnpm build:index --push
#   If `wrangler d1 execute --file` errors "cannot start a transaction within a transaction",
#   drop the BEGIN/COMMIT wrapper in src/lib/avatar/index-sink.ts#toD1Sql (wrangler may wrap it).

# 4. First deploy. Either push to main (CI `deploy` job does index+build+deploy once the
#    GH secrets in step 2 are set), or deploy manually:
pnpm build && npx wrangler pages deploy dist --project-name=my-blog --branch=main
#   -> verify https://my-blog-4uk.pages.dev (static site is the fast win).

# 4b. CALIBRATE THE AVATAR GATE — SAFETY-CRITICAL (the "I don't know" guarantee, NFR-4).
#     The 0.25 default threshold was tuned for the FAKE embedder; NO test covers real bge-m3,
#     so this MUST be done by hand before exposing the avatar:
#   (i)  DIRECTION FIRST — ask an OBVIOUSLY on-topic question; the `done` SSE frame's
#        `topSimilarity` must be NEAR 1 (Vectorize cosine metric = similarity, higher = better).
#        If it is NEAR 0, Vectorize is returning DISTANCE -> the gate is INVERTED (off-topic
#        questions would pass and the avatar would hallucinate). Fix: flip the score in
#        VectorizeVectorStore.search and redeploy. Green tests cannot catch this — do not skip.
#   (ii) MAGNITUDE — run a few on-topic + off-topic questions, note their topSimilarity values,
#        set `AVATAR_SIMILARITY_THRESHOLD` (Pages env var — no code redeploy) BETWEEN the on-topic
#        floor and the off-topic ceiling. Confirm off-topic -> honest "I don't know".

# 5. Runner (daily pipeline): on the O5 machine, install deps + cpe + claude(tmux-authed), then:
export PIPELINE_EMBEDDER=real EMBEDDINGS_API_KEY=$CLOUDFLARE_API_TOKEN PIPELINE_GIT_PUSH=1
export ALERT_WEBHOOK_URL=...  UPTIME_PING_URL=...      # from O6
python -m pipeline.schedule.cron run                   # SUPERVISED first live run — verify M-4 gate + provenance
#   then install the schedule: `python -m pipeline.schedule.cron render --resolve | crontab -`
#   force one failure to confirm alerts fire.
```

**Verify after first deploy:** that the Pages production deployment actually shows the
`VECTORIZE` / `DB` / `AI` bindings (wrangler.toml drives them on `wrangler pages deploy`, but
confirm in the dashboard — if a binding is missing, add it there once).

---

## 4 · Untested-until-bring-up surface (honesty)

These compile + pass unit tests (with stubbed fetch / DI fakes) but have **never run against live
Cloudflare resources** — verify them during the supervised bring-up:

- **In-Worker bindings** (the stores behind `functions/api/avatar/query.ts`): `VECTORIZE.query`,
  `DB.prepare().bind().all()` (dense hydration + the FTS5 MATCH JOIN), in-Worker
  `AI.run('@cf/baai/bge-m3')`. Unit-tested with fake bindings; the shapes match the official
  `.d.ts` but were never exercised live.
- **The `build:index --push` wrangler shell-out** (`wrangler vectorize upsert` + `wrangler d1
execute --remote`): the NDJSON/SQL generation is tested; the wrangler invocation + flags are not.
- **wrangler.toml bindings on a PRODUCTION Pages deploy**: confirm `VECTORIZE` / `DB` / `AI` actually
  attach after the first `wrangler pages deploy` (vs needing one-time dashboard setup) — see §3.
- **End-to-end embedding parity**: that bge-m3 vectors built via the REST path retrieve correctly
  against the in-Worker AI-binding query vectors (same model/stack — verify one grounded answer).
- **The Function's import graph on the Workers runtime.** `pnpm build` (astro + pagefind) does NOT
  bundle `functions/` for the edge — `wrangler pages deploy` does. The rewired `query.ts` pulls five
  new `src/lib/avatar/*` modules via relative imports; the deploy is their first real bundle (astro
  check resolved the types, so this should be fine, but it is unverified until deploy).
- **The avatar gate threshold/direction** — the safety-critical §3 step 4b. Listed here too so it is
  not lost: a fake-tuned `0.25` over real bge-m3 scores is the one "tests pass, avatar unsafe" gap.

---

## 5 · Env var reference

| Var                     | Used by                                                                 | Value                              |
| ----------------------- | ----------------------------------------------------------------------- | ---------------------------------- |
| `CLOUDFLARE_API_TOKEN`  | wrangler (provision, deploy, reindex)                                   | O1 rotated token                   |
| `CLOUDFLARE_ACCOUNT_ID` | wrangler + Workers AI REST                                              | `b80b576d7908f66d87478b739446ae55` |
| `OPENROUTER_API_KEY`    | avatar LLM (Function + CI)                                              | O3                                 |
| `EMBEDDINGS_API_KEY`    | build:index / reindex / pipeline embedder (= CF token, Workers AI REST) | = `CLOUDFLARE_API_TOKEN`           |
| `SITE_URL`              | reindex prior-fetch, RSS, canonical URLs                                | deployed URL                       |
| `PIPELINE_EMBEDDER`     | pipeline live runs                                                      | `real`                             |
| `PIPELINE_GIT_PUSH`     | runner deploy-on-success                                                | `1`                                |
| `ALERT_WEBHOOK_URL`     | `WebhookAlertSink`                                                      | O6                                 |
| `UPTIME_PING_URL`       | external dead-man's-switch                                              | O6 (optional)                      |
