# Project conventions — my-blog

Context for every plan/review/implement agent in the `claude-plan-execute` slate (`tasks.yaml`). Read this with `docs/decisions/` (the ADRs) before planning any task. The planning docs in `docs/` are the source of truth; this file is the operational digest.

## What we're building

An autonomously AI-maintained personal site for Rachid Chabane: a bilingual (FR/EN) blog on cutting-edge AI engineering that doubles as a portfolio, with an always-present non-figurative RAG chatbot avatar. Static-first, content-in-git, no CMS, no accounts, auto-published with mandatory automated quality gates. See `docs/vision.md`, `docs/app-ia.md` (the surface), `docs/writing-flow.md` (the content engine), `docs/rag-avatar.md` (the avatar).

## Non-negotiables (hard constraints — never violate)

1. **No secrets in the repo** (`NFR-5`, `M-7`). All keys via env / a secret store; `.env` is gitignored; only `.env.example` is committed. The `secret-scan` gate enforces this.
2. **No hand-authored article or portfolio prose** (`W-1`, `FR-D2`). Content surfaces render generated content; there is no authoring/editing UI.
3. **Privacy / secret hygiene on public surfaces** (`FR-D3`, `NFR-6`): no secrets, private-repo internals, internal codenames, or third-party personal data on any public page or in any avatar answer. The `content-safety` gate checks this.
4. **Avatar groundedness** (`NFR-4`, `FR-E2`): answers cite sources and return "I don't know" below the similarity threshold; it never presents non-site knowledge as site content. The threshold gate must short-circuit *before* the synthesis LLM is called.
5. **Avatar is non-figurative** (`D-007`): no face, character, mascot, or living being, ever.
6. **No emojis** in UI chrome or content (rare deliberate exception only); professional SVG icons only (`D-007`, `app-ia.md` INV-9).
7. **Bilingual parity** (`NFR-11`): every article and portfolio page exists in FR and EN at parallel URLs; the language switcher never dead-ends.
8. **Both gates pass before publish** (`NFR-3`): no article publishes without passing fact-check + style, per language.

## Architecture (the working build; seams keep choices swappable)

- **Site:** **Astro + TypeScript**, deployed to **Cloudflare Pages** (`D-005`, `D-001`). Content as Astro **content collections** (markdown + frontmatter). i18n by **path prefix** `/fr/ /en/` (`app-ia.md` §5). Light/dark via `[data-theme]`. Design tokens ported from `design/screens/my-blog-screens/project/colors_and_type.css` (rename `--ember-*` → `--iris-*`; values are already correct violet). Fonts self-hosted (the variable TTFs in `design/`).
- **Search:** client-side **Pagefind** prebuilt index (no server) (`FR-A5`).
- **Avatar backend:** a **Cloudflare Pages Function** (`functions/api/avatar/query.ts`, TypeScript) — keeps everything on Cloudflare, no separate hosted service, fits ≤ €25/mo (`NFR-9`). This **concretizes [OQ-4]** (managed API + lightweight store) and **[OQ-5]** (managed multilingual embedder):
  - **Index:** built at deploy time — embed all post/portfolio chunks (markdown-section-aware) → emit a **static index artifact** the Function loads. The corpus is a single-author blog (hundreds of chunks), so in-memory **lexical + vector + RRF** is enough; no vector DB needed at MVP.
  - **Retrieval:** lift the *shape* from `bayan` (`rag-avatar.md` §2) — hybrid lexical+vector, **Reciprocal Rank Fusion**, **threshold "I don't know" gate** — reimplemented in TS behind **Protocol-style interfaces** `Embedder` / `VectorStore` / `Reranker` / `LLMProvider` (so a managed vector DB / different model swaps in without touching callers).
  - **Synthesis:** a light managed LLM via **OpenRouter** (a Haiku-tier or comparable small model), citations-precede-prose, streamed. Reached through the `LLMProvider` seam (base URL `https://openrouter.ai/api/v1`), so the model is swappable without touching callers.
  - **Reindex:** event-driven on publish (incremental, content-hash-keyed) + nightly full reindex safety net (`FR-E3`).
- **Content pipeline (the writing engine, `M-3`/`M-4`):** **Python**, built on **`claude-plan-execute`** as the orchestration substrate (`writing-flow.md`, `inventory/02-claude-plan-execute.md`). It runs as a **scheduled Claude Code routine** on the **interactive/tmux backend** (subscription pool, `M-6`/`NFR-10`) with exit-code-75 auto-resume (`NFR-8`). It is tooling that commits markdown to the repo; it is **not** a hosted service. Lives under `pipeline/`.

## Shared contracts — PINNED. Do not reinvent; reference these exact paths.

These are defined once in early tasks and consumed by many later tasks. A task that needs one **reads the file**; it does not invent its own shape.

- **Content schema:** `src/content/config.ts` — the Zod schema for `Article`, `Project`, `Tag` (fields per `app-ia.md` §4: `translationKey`, `lang`, `slug`, `title`, `body`, `publishDate`, `tags`, `sources[]`, `contentHash`, `publishState`).
- **Claim→source map format:** `pipeline/contracts/claim_source_map.py` (+ a JSON schema `pipeline/contracts/claim_source_map.schema.json`). The Draft stage **produces** it; the fact-check gate **consumes** it (`writing-flow.md` §4). Pin the shape here once: a list of `{claim, source_id, excerpt_span}` plus a `sources[]` table of `{source_id, url, retrieved_at, excerpt}`.
- **Avatar provider seams:** `src/lib/avatar/contracts.ts` — the `Embedder` / `VectorStore` / `Reranker` / `LLMProvider` TS interfaces + the index-artifact JSON shape.
- **Design tokens:** `src/styles/tokens.css` — ported palette/type/space/radius/motion. All components reference these CSS variables; no hard-coded colors/fonts.
- **i18n helpers:** `src/i18n/index.ts` — locale list, `translationKey` join, route helpers, switcher fallback.

## Repo layout

```
astro.config.mjs · package.json · tsconfig.json · wrangler.toml
public/fonts/                      self-hosted variable TTFs
src/styles/tokens.css              ← design tokens (pinned)
src/content/config.ts              ← content schema (pinned)
src/i18n/index.ts                  ← i18n helpers (pinned)
src/layouts/ src/components/ src/pages/[lang]/...   the screens
src/lib/avatar/                    avatar retrieval lib (TS) + contracts.ts
functions/api/avatar/query.ts      Cloudflare Pages Function (avatar endpoint)
scripts/build-avatar-index.ts      deploy-time index builder
pipeline/                          Python content engine (built on claude-plan-execute)
  contracts/ stages/ prompts/ gate/ memory/ schedule/ tests/
tests/                             vitest unit/component
e2e/                               @playwright/test specs
.github/workflows/                 CI
.env.example                       documents required secrets (no real values)
```

## Testing & gates (how "fully tested" is enforced)

- **Code tests are mandatory per task.** TS: **vitest** (`pnpm test`). Python pipeline: **pytest** (set `test_command: pytest -q` on those tasks). Every task ships tests for what it adds; the `tests` gate blocks on failure.
- **e2e:** **`@playwright/test`** specs in `e2e/`, run by the `e2e` gate (`pnpm test:e2e`, Playwright manages its own `webServer`). Covers nav, language switch, theme toggle, reading flow, search, and the avatar UI (grounded + "I don't know" states). Blocks on failure.
- **Test against FAKES so the slate goes green WITHOUT secrets.** Avatar and pipeline tasks use fake `Embedder`/`LLMProvider`/web-search and fixture corpora. Live-integration verification (real keys) is the **explicit post-secret step**, not part of the autonomous build.
- **Visual fidelity & exploratory checks** are the **monitoring Claude Code instance's** job via **Playwright MCP** (compare against `design/screens/.../screenshots/`), not a blocking build gate.
- **Gate failure policy:** `tests`/`lint`/`e2e`/`secret-scan` → **block**. `content-safety`/`security-review` (agent gates) → **warn** (the monitoring instance acts on findings; an autonomous run shouldn't wedge on a fuzzy verdict). **Exception:** the avatar **red-team** gate **blocks** — launch is gated on it (`NFR-7`, `M-12`).

## Coding conventions

- TypeScript strict; ESLint + Prettier (`pnpm lint`). Astro components for markup; minimal client JS (islands only where needed — theme toggle, search, avatar). Semantic HTML landmarks (carry the screens' structure). Accessible: keyboard, focus-visible (the violet ring token), `prefers-reduced-motion` respected (already in tokens).
- Python: ruff + type hints; small pure functions; Protocol seams for providers (mirror bayan's clean interfaces); pytest with fakes.
- Conventional commits; the `commit_message` on each task is the headline.
- Never hard-code colors/fonts/spacing — use the token CSS variables.

## Manual steps reserved for the owner (the ONLY non-automated work)

The build + tests complete without these (fakes/fixtures). They are needed only for live deploy and live AI calls:

1. **Cloudflare:** account, a Pages project, and `CLOUDFLARE_API_TOKEN` + account id (deploy).
2. **OpenRouter API key** (`OPENROUTER_API_KEY`) — the avatar's synthesis LLM (via the `LLMProvider` seam → `https://openrouter.ai/api/v1`). **We use OpenRouter, not the Anthropic API.**
3. **Embedding provider key** (`EMBEDDINGS_API_KEY`) — the multilingual embedder ([OQ-5]): via OpenRouter if it serves a suitable multilingual embedding model, else a dedicated embeddings provider. Behind the `Embedder` seam.
4. **Domain:** register a `rachidchabane.*` domain and point DNS at Cloudflare Pages.
5. **Pipeline auth:** the scheduled content engine runs under the owner's Claude **subscription** via the tmux backend — a one-time interactive login on the runner. This is **not** an API key (it's the subscription pool, `M-6`/`NFR-10`); OpenRouter is only for the avatar.

All of the above go in env / Cloudflare secrets; `.env.example` documents the names. Nothing secret is committed.
