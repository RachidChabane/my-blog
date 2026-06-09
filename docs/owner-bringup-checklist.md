# Owner bring-up checklist — my-blog

Everything that's autonomously buildable is **built + verified** (Tier-0 voice, Options 1/2/4;
Option 3 is a keys-gated fast-follow). What remains is a short list of **manual steps only you can
do** — account/key creation and one interactive auth. Do them in the order below; after each group,
tell me the **handback trigger** and I take over the rest (provision, secrets, seed, deploy,
recalibrate the safety gate, run the pipeline, build the map).

> **Do NOT begin** any of this for me — just create the keys/accounts and hand off. I will not
> provision, deploy, set secrets, or run the pipeline until you confirm.

---

## TL;DR — the shortest path

| You provide | I deliver |
|---|---|
| **O1** (Cloudflare token) + **O3** (OpenRouter key) | Live static site **+** live avatar (corner **and** the scoped per-article button) **+** recalibrated honest-refusal gate **+** the Option 3 embedding map |
| add **O5** (runner authed) + **O6** (alert URL, optional) | The daily article pipeline → which **activates Option 2 grounded sidenotes** and the **sharper Tier-0 voice** in real, freshly-generated articles |

**O2** (Workers Paid) and **O4** (custom domain) are **optional / non-blocking** — skip for launch.

---

## 0 · Read this first — the SAFE way to hand me a secret

The previous Cloudflare token leaked because a secret ended up as **text in a transcript**. So the
rule is: **a secret value must never appear in any chat message, nor as an argument on any command
line** (the prompt's `! gh secret set … --body '<token>'` example would itself leak — the command
text is captured). Instead, drop each secret into a local file **from your own normal terminal (NOT
the Claude prompt)**, and just tell me the file path. Paths aren't secrets; I read the values with
`$(cat …)` and never echo them.

**The one thing that matters: type/paste the secret in your own terminal, never in our chat.** The
threat is the *transcript*, not your local shell — your shell history/echo is fine. (`read -rs` below
hides the input as a nicety; if your shell doesn't honor the flag, no harm — it's still off-transcript.)

Run this **in your own terminal (NOT the Claude prompt)**:

```bash
mkdir -p ~/.my-blog-secrets && chmod 700 ~/.my-blog-secrets

# Cloudflare API token (O1) — paste at the blank prompt, then Enter:
read -rs CF && printf %s "$CF" > ~/.my-blog-secrets/cf-token        && chmod 600 ~/.my-blog-secrets/cf-token        && unset CF && echo "cf-token saved"

# OpenRouter key (O3):
read -rs OR && printf %s "$OR" > ~/.my-blog-secrets/openrouter-key  && chmod 600 ~/.my-blog-secrets/openrouter-key  && unset OR && echo "openrouter-key saved"
```

Then in our chat just say: **"keys are in ~/.my-blog-secrets/"** — nothing else.

- The CF token file is **required for me locally** (provisioning + index seeding call Cloudflare from
  this machine; there's no other way to give me that value safely).
- For OpenRouter you can either drop the file as above **or** set it yourself (GitHub secret + the
  Pages env var) and just say "OpenRouter is set" — your call.
- I'll **shred all of `~/.my-blog-secrets/`** once bring-up is finished.

---

## GROUP 1 — REQUIRED · unlocks the live site + live avatar + the map

### ☐ O1 — Create a fresh Cloudflare API token  *(REQUIRED)*

Click-path:
1. Open **https://dash.cloudflare.com/profile/api-tokens**
2. **Create Token → Create Custom Token → Get started**
3. Name it e.g. `my-blog-bringup`.
4. Add these **Account**-level permission rows:
   - **Cloudflare Pages : Edit**
   - **Vectorize : Edit**
   - **D1 : Edit**
   - **Workers AI : Read**
   - *(only if you'll do the optional custom domain O4)* add **Zone · DNS : Edit**
5. **Account Resources → Include →** your account (`b80b576d7908f66d87478b739446ae55`).
6. **Continue to summary → Create Token**, then **copy it** (shown only once).
7. Save it via the `read -rs … cf-token` line in §0.

*Why this one token covers so much:* it deploys Pages, provisions/seeds Vectorize + D1, and (as
`EMBEDDINGS_API_KEY`) calls Workers AI `bge-m3` for embeddings. The Pages Function needs **no**
embeddings key — embeddings run in-Worker via the AI binding. (DEPLOY.md D-1, O1.)

### ☐ O3 — Create an OpenRouter key  *(REQUIRED for the avatar to answer)*

This is **only** the avatar's chat LLM (synthesis) — not embeddings.
1. **https://openrouter.ai** → sign in.
2. Add a little credit: **https://openrouter.ai/credits** (≈ $5–10 is plenty to start).
3. **https://openrouter.ai/keys → Create Key**, copy it.
4. Save it via the `read -rs … openrouter-key` line in §0 (or set it yourself — see §0).

> **HANDBACK TRIGGER — Group 1:** once the **cf-token** (and OpenRouter, file or self-set) are ready,
> say **"keys ready."** I will then, autonomously:
> provision CF (Vectorize + D1 + schema) → set the GitHub/Pages secrets from the files → seed the
> index (`build:index --push`) → deploy the Pages site → **recalibrate the SAFETY-CRITICAL avatar
> gate** (verify cosine direction is "near 1", then set the refusal threshold between on-topic and
> off-topic — DEPLOY.md §3 4b; this is what makes the honest "I don't know" trustworthy, and it now
> gates the scoped per-article button) → build the Option 3 embedding map.
> I'll deploy via `wrangler pages deploy` (no push to `main`); **I will not push to `main` without
> your explicit go-ahead**, since that also fires the CI deploy + reindex.

---

## GROUP 2 — REQUIRED for the daily pipeline · activates Option 2 sidenotes + the real Tier-0 voice

The site + avatar above run on the **existing seed corpus**. Option 2's grounded sidenotes and the
sharpened Tier-0 voice only become visible once **new articles are generated**, which needs the
pipeline runner.

### ☐ O5 — Pick + auth the pipeline runner  *(REQUIRED for daily articles)*

The pipeline drives your **Claude subscription** (not the API) through an interactive `claude`
session in `tmux`, so it needs a one-time interactive login on the runner machine.
1. Decide the runner: **this Mac** (simplest) or a small always-on VPS.
2. On that machine, in a terminal: `tmux new -s claude-runner` then run `claude` once and complete
   the login so the subscription is authenticated in that session.
   - If the runner is this Mac and you're already logged into `claude` here, this is effectively done
     — just confirm.

### ☐ O6 — Alert destination  *(OPTIONAL but recommended)*

Where pipeline failures get reported. A webhook URL **embeds a secret token**, so treat it like a
secret (save to a file, don't paste it in chat):
1. Create an incoming webhook (Slack / Discord / ntfy / your own).
2. In your own terminal: `read -rs WH && printf %s "$WH" > ~/.my-blog-secrets/alert-webhook && chmod 600 ~/.my-blog-secrets/alert-webhook && unset WH`
3. *(Optional)* a healthchecks.io-style ping URL for an external dead-man's-switch →
   `~/.my-blog-secrets/uptime-ping` the same way.

> **HANDBACK TRIGGER — Group 2:** once the runner is chosen + `claude` is authed in `tmux` (and, if
> you want alerts, the webhook file exists), say **"runner ready."** I will then run a **supervised**
> first pipeline pass (regenerates the corpus → activates Option 2 sidenotes + the new voice),
> verify the M-4 quality gate + that provenance sidecars are written, then install the daily schedule
> and force one failure to confirm alerts fire.

---

## GROUP 3 — OPTIONAL · non-blocking, do anytime (or never)

### ☐ O2 — Workers Paid ($5/mo)  *(optional)*
Not needed to launch — Vectorize/D1/Workers AI/Pages all run on the Free plan; paid only matters at
≈year-1 scale. Enable whenever via **CF dashboard → Workers & Pages → Plans**. (DEPLOY.md D-2.)

### ☐ O4 — Custom domain  *(optional)*
Register a domain + add it to Cloudflare if you want one instead of `my-blog-4uk.pages.dev`. If you
do this, add **Zone · DNS : Edit** to the O1 token (step 4) and tell me the domain — I'll wire it.

---

## What I do on handback (so you can see the whole arc)

1. **"keys ready"** → `cf-provision.sh` (paste the printed D1 `database_id` into `wrangler.toml`) →
   GH/Pages secrets from the files → `build:index --push` (seed Vectorize + D1) →
   `wrangler pages deploy` → verify bindings + one grounded answer → **gate recalibration (4b)** →
   Option 3 map. **Outcome: live site + live avatar (corner + scoped) + map.**
2. **"runner ready"** → supervised `python -m pipeline.schedule.cron run` → verify M-4 + sidecars →
   install `crontab` schedule → test an alert. **Outcome: daily articles, with Option 2 sidenotes +
   the Tier-0 voice now live in real content.**

I re-run the full gate suite (vitest / pytest / astro check / lint / e2e) after each step and keep
`DEPLOY.md`, `engagement-findings.md`, and `RUN-LOG.md` current.

**Right now: nothing for me to do until you create the keys. Start with O1 + O3.**
