# D-005 — SSG + host: Astro + Cloudflare Pages

**Status.** Accepted 2026-06-01. Source: `open-questions.md` [OQ-2]; intake (SSG/host choice).

## Decision

- The static site is built with **Astro** and deployed to **Cloudflare Pages** (`M-1`).
- Content stays as **markdown in git**; a push triggers the Cloudflare Pages build + deploy (`D-001`, `FR-B5`).
- The same publish/push event drives the avatar's incremental reindex (`rag-avatar.md` §3).

## Why

Astro has a first-class markdown / content-collections model that fits content-in-git and bilingual routing (`D-004`) cleanly, and Cloudflare Pages offers a generous free tier with git-push auto-deploy — directly serving the autonomy and ≤ €25/month goals (`NFR-9`). This is a low-stakes, reversible-early choice; recorded because it now anchors `M-1` and the publish path.

## Consequences

- `M-1` targets the Astro + Cloudflare Pages toolchain specifically.
- Bilingual routing (`M-11`) uses Astro's i18n / parallel-route conventions.
- Hosting cost is effectively €0 at expected volume, leaving the €25/month budget for LLM/API calls.

## What we did NOT pick

- **Hugo + GitHub Pages.** Fast builds and no extra host, but weaker component/templating ergonomics for the portfolio and avatar UI — rejected.
- **11ty + Netlify.** Fine alternative; Astro's content-collections + i18n story was the deciding edge — rejected.
