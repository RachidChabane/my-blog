**Purpose:** Personas and numbered user stories with acceptance criteria. Source of truth for what the system does.
**Status:** draft — last revised 01-06-2026.

## Personas

The audience splits into three personas. One person often crosses two (an evaluator who is also a practitioner). Use these as filters when prioritizing trade-offs, not as user-base segments. The AI maintainer is not a persona — it has no preferences to arbitrate; it appears as the *actor* in group B/C/G requirements and is operated via group F.

### P1 — The Owner (Rachid)
Wants a self-running showcase that builds his credibility while costing him almost no time. He cares most about **accuracy** (every post represents him) and **unattended operation** (the system's whole value is that he doesn't touch it), then about **low cost**. His usage is operational, not authorial: he checks that it's running, gets alerted when it isn't, and occasionally pulls a bad post.

What disqualifies the product for him: a hallucinated or off-brand post going live under his name; or a pipeline that needs weekly hand-holding to keep publishing.

### P2 — The Evaluator (recruiter / collaborator / client)
Lands on the site to assess Rachid's AI capability quickly. Skims the portfolio for credible proof of depth, follows a link or two, and may ask the avatar "has he built X?" before deciding to reach out. Cares about **clarity and credibility** over volume.

What disqualifies it for them: a thin or stale portfolio, broken links, or content that reads as generic AI filler rather than real engineering.

### P3 — The Practitioner Reader
An agentic-AI developer or enthusiast who reads for signal on Anthropic / OpenAI / open-source LLMs / agentic coding. Values **accuracy, freshness, and no fluff**; will return if the takes are sharp and correct. Will instantly spot a wrong technical claim or a rehashed press release.

What disqualifies it for them: factual errors, or content that just restates announcements without insight.

**Implication on prioritization.** When P2 (portfolio polish) and P3 (publication cadence/reach) conflict, default to **P2** — the portfolio-led tiebreaker (`vision.md`). P1's accuracy concern and P3's accuracy concern align, and both are served by the `M-4` quality gate. But note the coupling: underinvesting in P3 (article quality and freshness) starves the top-of-funnel that brings P2 in at all — a polished portfolio nobody arrives at is still a failure.

## Functional requirements

Group letters: **A** = publishing surface, **B** = content pipeline, **C** = quality & safety gates, **D** = portfolio, **E** = RAG avatar (`M-10`), **F** = operations & owner utilities, **G** = memory / house style.

### Group A — Publishing surface

**FR-A1** — As a reader, I can browse a list of posts and open any one as a static page.
*Acceptance.* Index lists all published posts newest-first; each post is a stable static URL; the build emits zero broken internal links.

**FR-A2** — As a reader, I can see each post's metadata and sources.
*Acceptance.* Each post shows publish date (DD-MM-YYYY), ≥ 1 topic tag, and a sources/references list with working links.

**FR-A3** — As a reader on any device, I get a fast, responsive page.
*Acceptance.* Usable on mobile and desktop; Lighthouse performance ≥ 90. **Assumption** [OQ-7].

**FR-A4** — As a reader, I can switch between the French and English version of the site and of any post.
*Acceptance.* A language switcher is present site-wide; each post exists in FR and EN at parallel URLs; switching preserves the current post when its translation exists, else falls back to the index (`NFR-11`, `M-11`).

### Group B — Content pipeline

**FR-B1** — As the AI maintainer, on a schedule I search recent agentic-AI news and produce ranked candidate topics.
*Acceptance.* Output is a ranked candidate list, each with source URL(s) and date; candidates are within the agentic-AI scope (`W-5`).

**FR-B2** — As the AI maintainer, I select a topic not recently covered.
*Acceptance.* Selection consults topic memory (`FR-G1`) and rejects any topic covered within the dedup window. **Assumption:** window = N days [OQ-8].

**FR-B3** — As the AI maintainer, I draft a full article with citations, in house style.
*Acceptance.* Draft has title, body, ≥ 2 cited sources, ≥ 1 topic tag; conforms to the house-style guide (`FR-G2`).

**FR-B4** — As the AI maintainer, I run a review loop and revise until approved or capped.
*Acceptance.* Each round yields an explicit verdict (APPROVED / NEEDS_REVISION); revise loop runs ≤ max rounds; only an APPROVED draft proceeds to publish.

**FR-B5** — As the AI maintainer, on approval I publish with no human step.
*Acceptance.* Publishing commits the post to the repo, triggers the build, and the post appears live; the commit is authored by the pipeline; no manual action exists in the path.

### Group C — Quality & safety gates

**FR-C1** — As the AI maintainer, every draft passes an automated fact-check gate before publish.
*Acceptance.* Each load-bearing claim is checked against the cited sources; the gate blocks publish on any unsupported claim; the check is logged with its verdict.

**FR-C2** — As the AI maintainer, every draft passes a style/brand gate.
*Acceptance.* A style auditor (cf. the `ijtihad` style-auditor) flags AI-tells and off-voice prose; the gate blocks publish on failure.

**FR-C3** — As the Owner (P1), a post that fails any gate is not published, and I am alerted.
*Acceptance.* A failed gate retains the draft + gate output as artifacts, blocks publication, and emits an alert (`FR-F2`); nothing reaches the live site.

### Group D — Portfolio

**FR-D1** — As an Evaluator (P2), I can view a showcase page for each flagship project.
*Acceptance.* Pages exist for all 5 flagships (sternaway, claude-plan-execute, ijtihad-engine, bayan, atelier); each states what it is, its stack, status, and links.

**FR-D2** — As the AI maintainer, I generate portfolio content from the inventory, not by hand.
*Acceptance.* Pages derive from `PROJECT-INVENTORY.md` / `inventory/`; regeneration is reproducible and contains no hand-authored prose (`W-1`).

**FR-D3** — As the Owner (P1), the portfolio never exposes private or sensitive material.
*Acceptance.* No secrets/keys, no third-party personal data, and no private-repo internals appear on any public page (cf. inventory secret-hygiene flags; `NFR-6`).

### Group E — RAG avatar (`M-10`)

**FR-E1** — As a visitor, I can ask the avatar questions about Rachid or the blog.
*Acceptance.* A chat UI is always present; answers draw on indexed site + portfolio content.

**FR-E2** — As a visitor, the avatar cites its sources and refuses when unsupported.
*Acceptance.* Each answer links the post/page it used; below the confidence/similarity threshold the avatar says "I don't know" rather than fabricating (`NFR-4`).

**FR-E3** — As the AI maintainer, the avatar's index refreshes when the blog updates.
*Acceptance.* A publish event triggers an incremental reindex of only changed content within N minutes **Assumption** [OQ-7]; a nightly full reindex runs as a safety net.

### Group F — Operations & owner utilities

**FR-F1** — As the Owner (P1), I can see pipeline run status and history.
*Acceptance.* A run log / dashboard shows recent runs with pass/fail/blocked status and retained artifacts.

**FR-F2** — As the Owner (P1), I am alerted on failure or gate-block.
*Acceptance.* A notification fires on any failed or blocked run, naming the reason.

**FR-F3** — As the Owner (P1), I can pull or correct a published post out-of-band.
*Acceptance.* A documented procedure unpublishes or supersedes a post via git; the next build reflects it. (`S-2`.)

**FR-F4** — As the Owner (P1), I can pause and resume the schedule.
*Acceptance.* A config flag halts scheduled runs without a code change, and resumes them the same way.

### Group G — Memory / house style

**FR-G1** — As the AI maintainer, I maintain topic memory of what's been covered.
*Acceptance.* A persistent record of published topics + sources exists and is queryable by `FR-B2`.

**FR-G2** — As the AI maintainer, I maintain and apply a house-style guide.
*Acceptance.* A style spec exists and is consumed by both drafting (`FR-B3`) and the style gate (`FR-C2`).

## Non-functional requirements

### Performance

**NFR-1** — Static pages: Largest Contentful Paint ≤ 2.5 s on a mid-tier mobile device. **Assumption** [OQ-7].
**NFR-2** — Avatar answer latency P50 ≤ 5 s, P95 ≤ 12 s (query submit → final token). **Assumption** [OQ-7].

### Correctness

**NFR-3** — No article is published without passing both the fact-check (`FR-C1`) and style (`FR-C2`) gates. Hard invariant, enforced in the publish path.
**NFR-4** — The avatar never presents non-site knowledge as site content; ungrounded queries return "I don't know" (`FR-E2`).

### Security & privacy

**NFR-5** — No secrets or API keys are committed to the repo; all config comes from env / a secret store (`M-7`).
**NFR-6** — Neither the portfolio nor the avatar exposes private-repo internals or third-party personal data.
**NFR-7** — Avatar chat input is hardened against prompt-injection that would exfiltrate config or override instructions. **Assumption:** scope TBD [OQ-12].

### Operations

**NFR-8** — The pipeline runs unattended on schedule; transient failures auto-resume (cf. `claude-plan-execute` exit-code-75 resume loop).
**NFR-9** — All-in monthly cost ≤ €25. **Assumption** [OQ-7].
**NFR-10** — The pipeline uses the interactive/tmux Claude backend to remain on the subscription pool (post 2026-06-15).

### Internationalization

**NFR-11** — Content is **bilingual French + English**: every article and portfolio page exists in both languages at parallel URLs, and the quality gate (`FR-C1`, `FR-C2`) runs on each language version independently. Per `D-004`.

## Non-requirements (named so they don't drift in)

- **No hand-editing workflow as a primary path.** Auto-publish is the path; correction (`FR-F3`) is exceptional, not routine (`W-1`).
- **No CMS / admin authoring UI.** Content is markdown in git (`D-001`).
- **No user accounts or authentication.** The site is read-only to the public (`W-4`).
- **No comments or community features in v1.** (`C-1`.)
- **No payments, ads, or monetization.** (`W-3`.)
