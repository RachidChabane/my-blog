**Purpose:** Define what "good" looks like at MVP, 6 months, and 18 months for the AI-maintained blog + portfolio, as measurable signals. Start here.
**Status:** draft — last revised 01-06-2026.

## What this product is, in one sentence

An autonomously AI-maintained website that publishes ~2 fact-checked agentic-AI articles per week and showcases Rachid Chabane's AI projects, with a RAG chatbot avatar that answers visitor questions from the site's own content.

Two load-bearing directives shape every downstream decision:

- **Zero hand-authoring.** Every published word is produced *and shipped* by the AI pipeline with no human in the loop — full auto-publish, no review gate. (`D-002`) The owner never writes or edits an article by hand.
- **Portfolio-led.** When the portfolio job and the publication job conflict, the portfolio wins. The blog exists first to build credibility for the work; readership is the second prize, not the first.

## Why "good" looks different from a generic blog

A generic blog is judged on reach — traffic, SEO, subscriber count. This product is judged on **autonomous credibility**: it represents Rachid directly, ships with no human review, and must keep running without him. That flips three instincts:

- **A wrong or hallucinated claim published under his name is worse than publishing nothing.** Credibility is the asset; one bad post is a portfolio liability, not just a weak week. (Contrast a human blog, where the author catches the howler before it ships.)
- **The system's value is that it runs unattended.** A blog that needs weekly babysitting has failed *even if every post is excellent* — because the whole bet is autonomy. Effort spent by the owner is a defect, not a cost of doing business.
- **Freshness and accuracy are coupled.** Agentic-AI news dates in days; a stale or wrong take is worse than silence, because the audience (practitioners) will catch it.

These asymmetries shape everything: the pre-publish quality gate is mandatory infrastructure (not a polish item), monitoring and auto-recovery are first-class, and the avatar must refuse rather than fabricate.

## What "zero hand-authoring + auto-publish" implies

Because no human reviews a post before it goes live, three things are structural requirements, not enhancements:

- **An automated multi-agent review + fact-check gate is mandatory infra.** It is the only thing standing between a hallucination and the public site. See `roadmap.md` `M-4`, `user-requirements.md` group C.
- **Unattended operation needs monitoring + auto-recovery.** Silent failure must be detected (the success metric *is* sustained cadence). See `M-5`.
- **The RAG avatar must refuse, not guess.** An "I don't know" gate is required so the avatar never fabricates facts about Rachid or the blog. See `FR-E2`.

## 6-month definition of "good"

By **01-12-2026** (six months from 01-06-2026), the project passes these gates:

| Signal | Target | How measured |
|---|---|---|
| **Autonomous cadence** | ≥ 2 topics/week (each published in FR + EN) for ≥ 8 consecutive weeks **Assumption** [OQ-7] | Count of published topics/week from git history |
| **Manual effort** | ≤ 15 min/week median owner intervention **Assumption** [OQ-7] | Owner intervention log (count + time per week) |
| **Pre-publish gate coverage** | 100% of published posts passed the automated fact-check + style gate | Gate logs; zero posts bypass the gate (`NFR-3`) |
| **Factual defect rate** | ≤ 1 post requiring post-hoc correction per 20 published **Assumption** [OQ-7] | Owner/issue correction log |
| **Portfolio coverage** | All 5 flagship projects + ≥ 3 others have a showcase page | Site audit vs `PROJECT-INVENTORY.md` |
| **All-in cost** | ≤ €25/month **Assumption** [OQ-7] | Hosting + LLM API + any service bills |

If these hold, we turn attention to readership and the first post-MVP items (`S-2` onward).

## 18-month definition of "good"

By **01-06-2028**:

| Signal | Target | How measured |
|---|---|---|
| **Sustained cadence** | ≥ 2 posts/week in ≥ 50 of the trailing 52 weeks **Assumption** [OQ-7] | Git history |
| **Self-recovery** | ≥ 90% of transient pipeline failures recover without owner action **Assumption** [OQ-7] | Run logs: alert→resolve with no manual step |
| **Avatar groundedness** | ≥ 95% of avatar answers cite real site content or correctly say "I don't know" **Assumption** [OQ-7] | Sampled eval set against the live index |
| **Readership** | Owner-set target (e.g. monthly unique readers) **Assumption** [OQ-10] | Analytics (`S-4`) |

## What this product is *not* trying to be

- **Not a general tech-news site.** Scope is agentic AI only: agentic coding, Anthropic, OpenAI, open-source LLMs. Everything else is out of scope (`W-5`).
- **Not a hand-curated publication.** No human authoring or editing as a normal path (`W-1`). Correction is an exceptional, out-of-band action (`FR-F3`).
- **Not a media business.** No ads, paywalls, sponsorships, or payments (`W-3`).
- **Not a dynamic web app.** No CMS, backend database, accounts, or community platform — content lives as markdown in git (`D-001`, `W-2`, `W-4`).

## What "shipped" means at MVP

The MVP is the autonomous publishing engine + the bilingual portfolio + the RAG avatar, running unattended. Concretely (see `roadmap.md`):

- A static site (Astro + Cloudflare Pages) with post rendering, an FR/EN language switcher, and a portfolio section (`M-1`, `M-2`, `M-8`).
- The article pipeline: news-search → topic-select → draft (FR + EN) → automated review → auto-publish (`M-3`).
- The mandatory pre-publish quality gate, run per language (`M-4`).
- Twice-weekly scheduling with monitoring, alerting, and auto-resume (`M-5`).
- Interactive/tmux Claude backend so the pipeline stays on the subscription pool (`M-6`).
- Secret hygiene and topic memory (`M-7`, `M-9`).
- The RAG chatbot avatar with event-driven incremental reindex (`M-10`).
- Bilingual FR/EN plumbing across site, pipeline, and memory (`M-11`).

The owner included the avatar in the MVP ([OQ-1], 01-06-2026) and chose bilingual FR/EN content (`D-004`) — both expand the MVP beyond the minimal engine. The build reuses `claude-plan-execute` for the pipeline and a stripped `bayan`-pattern RAG for the avatar (`D-003`).

## Top risks to "good"

1. **An auto-published defect damages credibility.** With no human gate and a portfolio-led mission, a single hallucinated, wrong, or off-brand post publishes under Rachid's name and undercuts the whole point. This is the dominant risk precisely *because* auto-publish was chosen.
   *Mitigation.* `M-4` (multi-agent review + fact-check + source-grounding + style gate), backed by `FR-C1`–`FR-C3`; plus `S-2` (post-hoc pull/correction) as the safety net.

2. **Silent pipeline failure quietly kills the cadence.** Sustained autonomous cadence *is* the success metric; a pipeline that stops or degrades without anyone noticing fails the project invisibly.
   *Mitigation.* `M-5` (scheduling + heartbeat/monitoring + failure alerting + auto-resume), per `NFR-8`.

3. **Staleness.** Projects evolve and the portfolio misrepresents them; or the avatar answers from a stale index.
   *Mitigation.* `M-8` + `S-6` (portfolio generation/re-sync from the inventory); event-triggered incremental reindex for the avatar (`FR-E3`, `M-10`).

A fourth risk specific to the toolchain: **the 2026-06-15 Claude billing-pool split** could break the pipeline's economics if it drives `claude -p` (which moves to a metered pool). *Mitigation.* `M-6` — the pipeline uses the interactive/tmux backend to stay on the subscription pool, the pattern proven in `claude-plan-execute`.
