**Purpose.** Canonical specification of my-blog's user-facing surface: routes, screens, navigation, state, and the order in which screens get implemented. Source of truth for the Stage-4 screen-design prompt, for `tasks.yaml` (Stage 5), and for anyone joining the project. Reconciles `vision.md`, `user-requirements.md`, `roadmap.md`, `content-pipeline.md`, `rag-avatar.md`, and decisions `D-001`–`D-007`.
**Status:** draft — last revised 02-06-2026.
**Audience.** The implementation agent (Stage 5). The designer (Stage 4). The owner.

## 0. How to read this document

Sections 1–4 set the model (scope, personas, vocabulary, entities). Section 5 is the route map. Section 6 is the navigation shell. Section 7 is the screen inventory — the bulk of the document. Section 8 is core flows. Section 9 is the API surface. Section 10 is the invariants every screen must respect. Section 11 maps the display modes (theme + language) onto screens. Section 12 is the dependency-ordered implementation order that feeds Stage 5. Section 13 lists the Stage-1 amendments this IA surfaced.

**Vocabulary convention:** **engineering nouns** (`Article`, `Project`, `Tag`, `Translation`, `Chunk`) appear in code, content schema, and the one runtime API. **UI nouns** (article, projet/project, sujet/topic) appear in copy on screens. §3.1 fixes the mapping. Engineering nouns and routes are language-neutral; only displayed copy is bilingual.

## 1. Product summary

my-blog is an autonomously AI-maintained personal site for Rachid Chabane: a blog publishing ~2 fact-checked, bilingual (FR/EN) articles per week on cutting-edge AI engineering, that doubles as a portfolio of his AI projects, with an always-present non-figurative RAG chatbot avatar that answers visitor questions grounded only in the site's own content (`vision.md`; `D-006`). It is static-first, content-in-git, no CMS, no accounts (`D-001`, `W-2`, `W-4`).

**This IA covers the public, user-facing surface only** — the publishing surface (group A), the portfolio (group D), and the avatar (group E). The content pipeline (group B), quality gates (group C), owner operations (group F), and memory/house-style (group G) are **backend processes, not screens**: they produce the content this surface renders and run unattended (`content-pipeline.md`). They appear here only where they touch a route (the avatar's runtime query endpoint, §9) or impose an invariant (§10). The "AI maintainer" is an actor, not a visitor; it has no UI on this site.

**MVP surface** (`roadmap.md`): the site skeleton + i18n routing (`M-1`, `M-11`), article index + article + tags + language switcher (`M-2`), portfolio index + per-project pages (`M-8`), and the avatar (`M-10`, hardened by `M-12`). **Confirmed in Stage 3 but needing roadmap reconciliation** (see §13): an About/contact page, site search, and per-language RSS.

## 2. Personas (internal labels)

From `user-requirements.md`, with an "activity skew" column for this surface.

| Persona | Who | Activity skew on this surface |
|---|---|---|
| **P1 — Owner (Rachid)** | Operates the system; doesn't author. | ~0% of public-surface traffic; uses operational tooling (group F), not these screens. |
| **P2 — Evaluator** | Recruiter / collaborator / client assessing capability fast. | ~heavy on Home + Portfolio + the avatar ("has he built X?"). |
| **P3 — Practitioner reader** | Agentic-AI dev/enthusiast reading for signal. | ~heavy on Article + Tag/topic + search; the returning-reader funnel. |

The UI does **not** segment by persona — it is one read-only public surface. It segments only by **language** (FR/EN, chosen by the visitor) and **theme** (light/dark). The portfolio-led tiebreaker (`vision.md`) means when Evaluator polish (Home/Portfolio) and Reader cadence (Article/Tag) compete for effort, Evaluator surfaces win — but P3's funnel feeds P2, so Article quality is not optional.

## 3. Content & display model

No user accounts, no permissions, no roles (`W-4`). The model has two axes instead: **publication state** and **display mode**.

### 3.1 Vocabulary mapping

| UI (FR) | UI (EN) | Engineering | Notes |
|---|---|---|---|
| article | article | `Article` | One per language; two share a `translationKey`. |
| projet | project | `Project` | Portfolio entry; derived from inventory, public-safe. |
| sujet | topic / tag | `Tag` | Topic taxonomy; label localized, slug shared. |
| — | — | `Translation` | The FR+EN pair of one logical post, joined by `translationKey`. |
| — | — | `Chunk` | Avatar index unit (post section); never shown as a noun. |

### 3.2 Publication state

`Article` and `Project` content is either **published** (committed, built, live) or **draft/blocked** (held in the pipeline, never built into the public site). There is no preview/staging route in the public surface — unpublished content simply does not exist on the live site (`FR-B5`, `FR-C3`, `NFR-3`). The only state a visitor ever sees is *published*.

### 3.3 Display modes (the only visitor-controlled axes)

- **Language:** FR or EN. Path-prefixed (`/fr/…`, `/en/…`; §5). Every article and portfolio page exists in **both** languages at parallel URLs (`D-004`, `NFR-11`, FR-A4) — the switcher always has a target.
- **Theme:** light or dark, both first-class in the design system (cool-ink + electric violet). Visitor toggle, persisted client-side; respects `prefers-color-scheme` on first visit.

## 4. Domain entities

Content lives as markdown + frontmatter in git (Astro content collections); there is no database (`D-001`, `W-2`). The avatar index is a derived store, not authored content.

```
Article (one record per language)
 ├── translationKey        ← joins the FR + EN versions of one logical post
 ├── lang                  ← "fr" | "en"
 ├── slug                  ← URL slug (per language)
 ├── title, body(markdown)
 ├── publishDate (DD-MM-YYYY)
 ├── tags: Tag[]           ← ≥ 1 (FR-A2)
 ├── sources: {label, url, date}[]   ← ≥ 2, links must resolve (FR-A2, FR-B3)
 ├── contentHash           ← drives the avatar's incremental reindex (FR-E3)
 └── publishState          ← only "published" reaches the build

Project (portfolio; one record per language)
 ├── translationKey, lang, slug
 ├── name, summary, stack[], status, links[]   ← public-safe only (FR-D3, NFR-6)
 ├── relatedArticles: translationKey[]          ← optional cross-link (parking-lot)
 └── derivedFrom: PROJECT-INVENTORY.md / inventory/   ← generated, not hand-authored (FR-D2, W-1)

Tag
 ├── slug (shared across languages)
 └── label: {fr, en}

Chunk (derived — avatar index, not authored; rag-avatar.md §3)
 ├── sourceUrl + headingAnchor    ← the citation kind
 ├── lang, embedding
 └── keyed by Article.slug for incremental upsert/delete
```

The five flagships named for portfolio pages (`FR-D1`): the projects behind the codenames sternaway, claude-plan-execute, ijtihad-engine, bayan, atelier — rendered under **public-facing names and descriptions**, never internal codenames, private-repo internals, secrets, or third-party data (§10 INV-4; `FR-D3`, `NFR-6`).

## 5. Route map

Path-prefixed i18n (`/fr/`, `/en/`). `[…]` = dynamic segment generated at build. All routes are static pages except the avatar query endpoint (§9).

| Route | Screen | Notes |
|---|---|---|
| `/` | (redirect) | Redirect to `/fr/` or `/en/` (visitor preference / `Accept-Language`, default per owner). |
| `/[lang]/` | S1 Home / hub | Hero wordmark, latest articles, portfolio teaser. |
| `/[lang]/blog/` | S2 Article index | Paginated, newest-first (`FR-A1`); tag filter. |
| `/[lang]/blog/[slug]/` | S3 Article | The core reading surface (`FR-A1`, `FR-A2`). |
| `/[lang]/tags/` | S4 Tag directory | All topics. |
| `/[lang]/tags/[tag]/` | S5 Tag index | Articles for one topic. |
| `/[lang]/work/` | S6 Portfolio index | Project cards (`FR-D1`). |
| `/[lang]/work/[slug]/` | S7 Project detail | One flagship per page (`FR-D1`). |
| `/[lang]/about/` | S8 About / contact | Personal hub + the "ask" (§13: new). |
| `/[lang]/search/` | S9 Search | Client-side over articles (§13: new). |
| `/[lang]/rss.xml` | (feed) | Per-language RSS (§13: tier reconcile, `S-5`). |
| `—` (overlay) | S10 Avatar | Omnipresent on every route; idle + active (`FR-E1`). |
| `/[lang]/404` | S11 Not found | Localized; links back to index. |
| `/sitemap.xml`, `/robots.txt` | (assets) | SEO basics (`S-3`); static. |

## 6. Navigation shell

Shared chrome on every screen (except the avatar, which floats above all of them):

- **Top bar (masthead).** Typographic wordmark (links Home) · primary nav (Blog · Work · About) · **search affordance** (opens S9 or an inline overlay) · **language switcher** (FR⇄EN, preserves current page via `translationKey`; falls back to the localized index if no target — `FR-A4`, `NFR-11`) · **theme toggle** (light/dark).
- **Content area.** Per-screen; long-form reading column on S3.
- **Footer.** RSS link · language switcher (mirror) · scope/credit line (e.g. "written and maintained autonomously") · copyright.
- **Avatar launcher (S10).** Persistent, fixed-corner, non-figurative mark; idle by default, expands to a chat panel. Present on 100% of routes.

Motion budget (design system): 3–4 signature motions — entrance, hover, avatar "thinking", section transition — used sparingly.

## 7. Screen inventory

Each entry: purpose · key components · what it is **NOT** (the anti-patterns the screen must refuse).

### S1 — Home / hub  (`/[lang]/`)
- **Purpose.** Orient P2/P3 in one screen; route them to Portfolio or latest Article; establish the premium brand.
- **Components.** Hero wordmark · latest-articles list (3–5, newest-first) · portfolio teaser (top flagships → S6) · avatar present.
- **NOT.** Not a marketing landing page; no gradient hero, no stat-counters, no stock imagery, no newsletter modal. No infinite feed.

### S2 — Article index  (`/[lang]/blog/`)
- **Purpose.** Browse all published posts (`FR-A1`).
- **Components.** Paginated list newest-first · per-item: title, date (DD-MM-YYYY), tags, reading-time · tag filter (→ S5).
- **NOT.** Not a magazine grid with hero images per post. No author bylines beyond the single owner. No "trending"/engagement metrics.

### S3 — Article  (`/[lang]/blog/[slug]/`)  ← core surface
- **Purpose.** Read one post with its metadata and sources (`FR-A1`, `FR-A2`); the page P3 judges the whole site by.
- **Components.** Title · meta (date, tags, reading-time) · long-form reading column (Fraunces headings / Inter body / JetBrains Mono code) · **sources list with resolving links** (`FR-A2`) · language switcher lands on the parallel translation · prev/next or related-by-tag · avatar present.
- **NOT.** Not cluttered with share-widgets, ads, related-content spam, or comments (`W-3`, `C-1`). No AI-tells in prose (gate-enforced, `FR-C2`). No uncited load-bearing claim (gate-enforced, `FR-C1`).

### S4 — Tag directory  (`/[lang]/tags/`)
- **Purpose.** Show the topic taxonomy; entry point for subject browsing.
- **Components.** Tag list/cloud with counts → S5.
- **NOT.** Not an auto-generated dump of every term; tags are a curated topic vocabulary.

### S5 — Tag index  (`/[lang]/tags/[tag]/`)
- **Purpose.** All articles for one topic.
- **Components.** Same item layout as S2, scoped to the tag · tag title/description.
- **NOT.** Not distinct in layout from S2 (consistency); no per-tag bespoke design.

### S6 — Portfolio index  (`/[lang]/work/`)
- **Purpose.** P2's first proof of depth; cards for the flagships + others (`FR-D1`).
- **Components.** Project cards (name, one-line, stack chips, status) → S7 · generated from inventory (`FR-D2`).
- **NOT.** Not hand-authored prose (`W-1`, `FR-D2`). No private-repo internals, secrets, or third-party data (`FR-D3`). No logos-of-companies wall.

### S7 — Project detail  (`/[lang]/work/[slug]/`)
- **Purpose.** Deep, credible write-up of one flagship (`FR-D1`).
- **Components.** Name · what-it-is · engineering depth · stack · status · links (repo/demo where public-safe) · optional related articles.
- **NOT.** Not exposing anything private (§10 INV-4). Not a generic "case study" template with fake metrics. Not internal codenames.

### S8 — About / contact  (`/[lang]/about/`)
- **Purpose.** Who Rachid is; how to reach him; the "ask" (the personal-hub close on the rachidchabane.* domain).
- **Components.** Short bio · contact links · optional "how this site works" (the autonomous-pipeline story, a credibility asset for P2).
- **NOT.** Not a résumé dump. No contact form requiring a backend (`W-2`) — use mailto/external links. No living-being avatar/photo treatment that violates the brand constraint (`D-007`).

### S9 — Search  (`/[lang]/search/`)
- **Purpose.** Find an article by keyword (P3).
- **Components.** Query input · results list (S2 item layout) · powered by a **client-side prebuilt index** (e.g. Pagefind) — no server (`D-001`).
- **NOT.** Not the avatar (search returns *articles*; the avatar *answers* — keep them distinct so neither pretends to be the other). No server-side search API. Note redundancy risk with S10 — see §13.

### S10 — Avatar  (overlay, all routes)
- **Purpose.** Answer visitor questions about Rachid/the blog, grounded only in site content (`FR-E1`, `FR-E2`).
- **Components.** Persistent non-figurative launcher (idle) · chat panel (active/"thinking" state) · streamed answer with **citations preceding prose** · explicit **"I don't know"** below the similarity threshold (`FR-E2`, `NFR-4`).
- **NOT.** Not figurative — no face/character/mascot/living being, ever (`D-007`, hard constraint). Never presents non-site knowledge as site content (`NFR-4`). Not exploitable — must pass the prompt-injection red-team before launch (`M-12`, `NFR-7`). Not a generic support bot widget.

### S11 — 404  (`/[lang]/404`)
- **Purpose.** Graceful dead-end recovery.
- **Components.** Localized message · links to Home/Blog · search affordance.
- **NOT.** Not an unstyled default; not language-broken.

## 8. Core flows

1. **Evaluate (P2).** Land on S1 → scan latest + portfolio teaser → S6 → S7 → (optionally) ask S10 "has he built X?" → contact via S8. *Success: reaches a credible project page or a grounded avatar answer within a few clicks.*
2. **Read (P3).** Enter via S2/S5/search/external link → S3 → switch language or follow a source → next article by tag. *Success: a fast, accurate, fluff-free read (`NFR-1`, gates).*
3. **Switch language (any).** Anywhere → language switcher → same content in the other language (`translationKey`), or localized index if none. *Success: never a dead switch; URL stays parallel.*
4. **Ask the avatar (P2/P3).** Open S10 → ask → either a cited answer or "I don't know" — never a fabrication (`NFR-4`). *Success: grounded or honest refusal, with sources.*
5. **Publish (backend; not a screen).** Pipeline `M-3`→gate `M-4`→commit `FR-B5`→build/deploy→content appears on S2/S3/S6/S7→publish event triggers avatar reindex (`FR-E3`). Listed for completeness; produces the surface, has no UI here.

## 9. API surface

A static site has almost no runtime API. Exactly one visitor-facing runtime endpoint:

| Endpoint | Method | Purpose | Notes |
|---|---|---|---|
| `/api/avatar/query` (Cloudflare Pages Function / Worker) | POST | Avatar question → retrieval → grounded streamed answer or "I don't know" | The only server code path; input-sanitized + prompt-isolated + grounded-only (`M-12`, `NFR-7`); P50 ≤ 5 s, P95 ≤ 12 s (`NFR-2`). |

Everything else is **static assets**: pages (pre-rendered), `rss.xml` (built file), `sitemap.xml`/`robots.txt`, and the **client-side search index** (prebuilt at build time, queried in-browser — no endpoint). The avatar's **reindex** (`FR-E3`) is an internal, event-driven job triggered by the publish event, not a visitor route. No auth endpoints (`W-4`), no content-mutation endpoints (content is git, `D-001`).

## 10. Cross-screen invariants

Every screen must respect these; they are the testable spine for Stage 4/5.

- **INV-1 — Bilingual parity.** Every Article and Project exists in FR and EN at parallel URLs; the switcher never dead-ends (`NFR-11`, `FR-A4`).
- **INV-2 — Dual theme.** Every screen renders correctly in light and dark; neutrals stay cool (no warm tints) per the pinned palette.
- **INV-3 — No broken internal links; sources resolve.** Build emits zero broken internal links (`FR-A1`); article sources link out and resolve (`FR-A2`).
- **INV-4 — Privacy/secret hygiene.** No page (portfolio or avatar answer) exposes secrets, private-repo internals, internal codenames, or third-party personal data (`FR-D3`, `NFR-6`).
- **INV-5 — No hand-authored content on content surfaces.** Articles and project pages are pipeline/inventory-generated; the surface has no authoring/editing UI (`W-1`, `W-2`).
- **INV-6 — Avatar groundedness & non-figurativeness.** Cites sources, refuses below threshold, never figurative (`NFR-4`, `D-007`).
- **INV-7 — Performance.** LCP ≤ 2.5 s mid-tier mobile; Lighthouse perf ≥ 90 (`NFR-1`, `FR-A3`).
- **INV-8 — Read-only & public.** No login, no accounts, no user-generated content, no comments in v1 (`W-4`, `C-1`).
- **INV-9 — No emojis; professional icons only.** No emojis in UI chrome or article prose, save a rare deliberate exception; iconography uses a consistent professional SVG icon set, never emoji (`D-007`). Enforced in the article body by the style gate (`FR-C2`) and in components at design/build time.

## 11. Display modes × screens

Two cross-cutting modes (no per-screen exceptions at MVP):

| Screen | FR/EN | Light/Dark | Mode-specific states |
|---|---|---|---|
| S1–S9, S11 | ✓ both, parallel URLs | ✓ both | — |
| S10 Avatar | ✓ answers in the page's language; index is multilingual (`OQ-5`) | ✓ both | idle · thinking/active · answering · "I don't know" |
| `rss.xml` | per-language feed | n/a | — |

## 12. Implementation order (feeds Stage 5 `tasks.yaml`)

Dependency-ordered. The **backend pipeline track (`M-3`,`M-4`,`M-5`,`M-6`,`M-9`) runs in parallel** with the surface track below — it produces content but builds no screens; sequence it per `roadmap.md`'s critical path. Surface order:

1. **Shell & routing** — Astro + Cloudflare Pages skeleton, content-in-git, auto-deploy; i18n path-prefix routing; nav shell; theme toggle; design-system tokens from the Claude Design export (`M-1`, `M-11`, `D-005`). *Unblocks everything.*
2. **Reading surface** — S2 index, S3 article, S4/S5 tags, language switcher, sources rendering (`M-2`; `FR-A1`,`FR-A2`,`FR-A4`).
3. **Home** — S1 (depends on 2 for latest-articles + on 4 for portfolio teaser).
4. **Portfolio** — S6 index + S7 detail, generated from inventory (`M-8`; `FR-D1`–`FR-D3`).
5. **Secondary surfaces** — S8 About, S9 Search (client-side index), per-language `rss.xml`, S11 404, sitemap/robots (§13 reconcile for search/RSS tier).
6. **Avatar** — S10 overlay UI + `/api/avatar/query` (`M-10`; `FR-E1`–`FR-E3`), then the **launch-blocking** prompt-injection red-team (`M-12`, `NFR-7`).

Build screens single-language-complete then layer the second language (INV-1), since routing is parallel.

## 13. Reconciliation notes (Stage-1 amendments this IA surfaced)

Per IA discipline, the IA is the reconciled source of truth but Stage-1 docs must be amended to match. **Applied 02-06-2026:** search/about/RSS are now MVP — `roadmap.md` `M-13` + `user-requirements.md` `FR-A5`/`FR-A6`/`FR-A7`; `S-5` (RSS) promoted. Original flags, for the record:

- **Site search (S9) is new.** No `FR-` or roadmap ID covers search. Decide its tier: if MVP (as chosen in Stage 3), add a Must (e.g. a new `M-13` "client-side article search") and a `FR-A5`; if deferable, mark it Should. **Recommendation:** Should/early-post-MVP — the avatar (`M-10`) already answers content questions, so search is partly redundant at MVP (noted on S9). Owner to confirm.
- **RSS is `S-5` (post-MVP) but was selected as an MVP surface.** Either promote `S-5` into the MVP or keep RSS as a fast-follow. **Recommendation:** RSS is cheap and static — promote the per-language feed into MVP surface work (step 5) without disturbing the engine critical path.
- **About/contact (S8) had no FR.** Fits the personal-hub framing (`D-007`, `vision.md`); add a small `FR-A6` "static about/contact page" or fold into `M-2`. Low effort, MVP.
- **Group F (ops) confirmed out of the public web IA.** Run log/alerts/pause-resume (`FR-F1`–`FR-F4`) are operational tooling, not site routes — recorded here so a future reader doesn't expect an admin screen.

These are draft-stage edits to `roadmap.md` / `user-requirements.md`; apply on owner approval of this IA.
