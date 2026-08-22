# my-blog

A bilingual (FR/EN) blog and portfolio, live at **https://rachid-chabane.com**
(Cloudflare Pages; the origin also answers at `my-blog-4uk.pages.dev`).

Two jobs: publish writing on AI engineering — agentic systems, frontier and
open-source models, the craft of building with them — and show the projects
behind it. A retrieval-backed avatar answers visitor questions about either,
grounded in the site's own content.

The site was built, and is largely maintained, by an autonomous multi-agent
workflow. See [Build process](#build-process).

## Architecture

**Static site — Astro, `output: 'static'`.** Every page is prerendered. Content
lives in `src/content/` as Markdown across typed collections — `articles`,
`radar`, `projects`, `knowledge`, plus `tags`, `categories`, `concepts` and
`provenance` sidecars. `src/content/schemas.ts` pins each one with a Zod schema,
so a malformed frontmatter field fails the build instead of reaching a reader.

**Bilingual.** French and English are peers, not a base language plus
translations. Routes are `/[lang]/…`; all UI copy lives in the `src/i18n/`
strings tables and never in component JS, which is what lets the e2e suite
assert copy per locale.

**Content pipeline — Python, `pipeline/`.** The editorial engine that researches,
selects, drafts (both languages), fact-checks and publishes. One editorial run is
one slate of dependent tasks: `research → select → draft → publish`, with quality
gates on the draft stage and a bilingual-or-nothing rule — a blocked draft means
publish never runs. A lighter `radar` variant produces short briefs. Both commit
Markdown into `src/content/`; neither is a hosted service. Details in
[`pipeline/README.md`](./pipeline/README.md).

**Avatar — RAG on Cloudflare.** Hybrid retrieval over the site's own published
content: a dense leg (Workers AI `bge-m3` embeddings → Vectorize) and a lexical
leg (D1 with FTS5/BM25), merged, thresholded, and synthesized by an LLM via
OpenRouter, streamed back over SSE. The endpoint is a Pages Function at
[`functions/api/avatar/query.ts`](./functions/api/avatar/query.ts); the retrieval
and synthesis logic it calls is plain testable TypeScript in `src/lib/avatar/`.
The index is rebuilt and pushed on deploy. When retrieval finds nothing above the
threshold, the avatar says it does not know rather than inventing an answer.

## Running it

Node >= 20.3, pnpm 10.14 (`packageManager` is pinned).

```
pnpm install
pnpm dev        # dev server
pnpm build      # static build + pagefind index
pnpm preview    # serve the build on :4321
```

Checks:

```
pnpm lint       # astro check + eslint + prettier --check
pnpm check      # astro check alone (types + content schemas)
pnpm test       # vitest — 594 unit tests
pnpm test:e2e   # playwright; builds and previews on :4321 first
```

The Python pipeline is the honest exception. It orchestrates on top of
`claude-plan-execute`, which is a **private** repo, so `pytest pipeline` only
runs if you have access to it — CI checks for the token and skips green when it
is absent, and you should expect the same locally. Everything else in this repo
runs from a clean clone with no credentials.

Deploying, the Cloudflare provisioning, and the required secrets are documented
in [`DEPLOY.md`](./DEPLOY.md).

## CI

[`.github/workflows/ci.yml`](./.github/workflows/ci.yml), on push and PR to
`main`:

| Job                   | Blocking | What it covers                                      |
| --------------------- | -------- | --------------------------------------------------- |
| **Lint + Unit tests** | yes      | `astro check`, eslint, prettier, the vitest suite   |
| **E2E tests**         | yes      | Playwright against a real build, incl. perf proxies |
| **Lighthouse**        | no       | performance >= 0.90; reports without wedging a run  |
| **Pipeline**          | yes\*    | ruff + pytest over `pipeline/`                      |
| **Deploy**            | —        | avatar index + Pages, on push to `main`             |

\* The pipeline job is gated on the `CPE_REPO_TOKEN` secret for the private
dependency above: without it the job skips green rather than going red. Deploy is
gated the same way on the Cloudflare secrets. A gate that cannot run says so
instead of failing loudly for the wrong reason — but a gate that _can_ run is
never advisory, Lighthouse excepted.

## Build process

This site was built by an autonomous multi-agent loop rather than by hand: a
slate of dependent tasks driven by `claude-plan-execute`, each one planned,
implemented, reviewed and gated before the next became eligible. Agents wrote the
code and the content; the owner reviewed at the seams.

[`RUN-LOG.md`](./RUN-LOG.md) is the narrative of that build — what was attempted,
what broke, what the fix was, and the judgment calls made along the way. It is
the interesting document in this repo, and the honest one: the failures are in
there too. Start there if you want to know how this was actually made.

## Layout

```
src/          site — pages, components, i18n, content collections, avatar lib
functions/    Cloudflare Pages Functions (the avatar query endpoint)
pipeline/     Python content engine (private cpe dependency)
e2e/          Playwright specs
tests/        vitest unit suites
scripts/      index build, reindex, provisioning, launch checks
docs/         design notes and decision records
perf/         Lighthouse budgets
```
