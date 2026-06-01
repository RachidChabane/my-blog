**Purpose:** MoSCoW prioritization with stable IDs, explicit MVP cut, named Won't list, and risk-to-feature mapping.
**Status:** draft — last revised 01-06-2026.

## Prioritization principle

**Autonomous credibility is the binding constraint.** A feature ships in MVP if and only if it is (a) required to publish trustworthy content with no human in the loop, or (b) required to keep the engine running unattended. Everything reader-facing-but-optional (avatar, SEO, analytics, RSS) is a Should or Could. When two candidate items compete, the **portfolio-led** tiebreaker decides (per `vision.md`): the item that better serves the showcase wins.

Effort tags: **S** = ≤ 3 days, **M** = 1–2 weeks, **L** = 3–4 weeks, **XL** = 5+ weeks.

## Must (MVP, ~6–9 weeks)

Aim: the autonomous publishing engine + portfolio, running unattended. Bar: ≥ 2 fact-checked posts/week ship with no human authoring or review, and silent failure is caught (per `vision.md` 6-month gates).

### Publishing surface

| ID | Feature | Effort | Why |
|---|---|---|---|
| M-1 | Static site skeleton: SSG + content-in-git + deploy to a static host | M | The publishable surface; per `D-001`. |
| M-2 | Post rendering, index/listing, responsive layout, sources/tags display | S | Readers must be able to read posts (`FR-A1`, `FR-A2`). |

### Content pipeline

| ID | Feature | Effort | Why |
|---|---|---|---|
| M-3 | Article pipeline: news-search → topic-select → draft → review-loop → auto-publish, modeled on `claude-plan-execute` | L | The core engine and the project's central bet (`FR-B1`–`FR-B5`). |
| M-4 | Mandatory pre-publish quality gate: multi-agent review + fact-check + source-grounding + style auditor, blocking publish on failure | L | Mitigates Risk 1; non-negotiable under auto-publish (`FR-C1`–`FR-C3`, `NFR-3`). |

### Operations

| ID | Feature | Effort | Why |
|---|---|---|---|
| M-5 | Twice-weekly scheduling + heartbeat/monitoring + failure alerting + auto-resume | M | Mitigates Risk 2; sustained cadence is the success metric (`NFR-8`). |
| M-6 | Interactive/tmux Claude backend (stay on the subscription pool post 2026-06-15) | M | Mitigates the billing-split risk; pattern from `claude-plan-execute` (`NFR-10`). |
| M-7 | Secret hygiene: no secrets in repo, config via env / secret store | S | The inventory shows committed secrets are a recurring failure across repos (`NFR-5`). |

### Portfolio

| ID | Feature | Effort | Why |
|---|---|---|---|
| M-8 | Portfolio section: showcase pages for the 5 flagships + others, generated from `PROJECT-INVENTORY.md` | M | Portfolio-led — the site's primary job (`FR-D1`–`FR-D3`). |

### Memory

| ID | Feature | Effort | Why |
|---|---|---|---|
| M-9 | Topic memory + house-style guide (dedup covered topics; consistent voice) | S | Quality + coherence across autonomous runs; cheap via `claude-plan-execute` memory (`FR-G1`, `FR-G2`). |

**MVP total:** ~6–9 weeks of effort. **Critical path:** M-1 → M-3 → M-4 → M-5 (the engine must be able to publish, gate, and run unattended before anything else matters).

## Should (post-MVP, months 2+)

Order roughly by value-to-cost ratio.

| ID | Feature | Effort | Why it matters | Trigger |
|---|---|---|---|---|
| S-1 | **RAG chatbot avatar** (ingest posts + portfolio, retrieval, "I don't know" gate) + incremental event-triggered reindex on publish | L | The brief's second engine; lets evaluators interrogate the portfolio | **Assumption:** deferred from MVP [OQ-1]. Pulled in once cadence is stable, or immediately if the owner moves it to Must. |
| S-2 | Post-hoc correction / pull workflow (flag, supersede, or unpublish a bad post via git) | S | Safety net under auto-publish (Risk 1) | The first defect that reaches production. |
| S-3 | SEO basics (sitemap, meta, Open Graph) | S | Portfolio + article reach | When readership becomes an explicit goal. |
| S-4 | Analytics / readership tracking | S | Needed to measure the 18-month readership signal | When measuring reach (`vision.md` 18-mo). |
| S-5 | RSS feed / newsletter | M | Distribution to returning readers | Evidence of returning-reader demand. |
| S-6 | Periodic portfolio re-sync from the `0-git` inventory | S | Mitigates portfolio staleness (Risk 3) | When a flagship project evolves materially. |

## Could (months 3+ to 12+)

Nice-to-have, not commitments:

- **C-1.** Comments / community layer.
- **C-2.** Multi-language (FR/EN) content.
- **C-3.** Richer interactive portfolio (live demos, embeds).
- **C-4.** Avatar voice / TTS.
- **C-5.** Auto cross-post to X / LinkedIn on publish.
- **C-6.** AI-generated images / diagrams for posts.

## Won't (out of scope, named so they don't drift)

- **W-1.** No hand-authored or hand-edited articles. This is the core directive — authoring is the AI's job; the owner correcting prose by hand is a failure mode, not a workflow.
- **W-2.** No dynamic backend / database CMS. Content is markdown in git (`D-001`).
- **W-3.** No monetization — no ads, paywalls, sponsorships, or payments.
- **W-4.** No user accounts, login, or multi-author roles.
- **W-5.** No general tech-news scope. Agentic AI only (agentic coding, Anthropic, OpenAI, open-source LLMs).

## Parking lot ("good ideas, not a fit yet")

Captured so they don't get lost; nothing here is committed.

- A "what changed this week in agentic AI" auto-digest post format.
- Cross-linking articles to the portfolio project they relate to.
- An auto-generated "now" / changelog page driven by the pipeline's own activity.
- Using the `ijtihad` style-auditor agent (from `trucIkram`) as the `M-4` style gate.

## How features map to risks (sanity check)

Every top risk from `vision.md` is mitigated by a Must or Should item:

| Risk (from `vision.md`) | Mitigating feature(s) |
|---|---|
| Risk 1 — auto-published defect | M-4 (quality gate), S-2 (post-hoc pull) |
| Risk 2 — silent pipeline failure | M-5 (scheduling + monitoring + auto-resume) |
| Risk 3 — staleness | M-8 + S-6 (portfolio sync), S-1 (avatar reindex) |
| Risk 4 — 2026-06-15 billing-pool split | M-6 (interactive/tmux backend) |

No top risk is unmitigated. Note Risk 3's avatar half rides on `S-1`, which is post-MVP — acceptable because the portfolio-staleness half is covered by the MVP item `M-8`.
