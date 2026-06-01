# D-006 — Editorial scope: cutting-edge AI engineering (expertise showcase)

**Status.** Accepted 2026-06-01. Source: owner clarification on [OQ-13]; `vision.md` § What this product is *not*.

## Decision

- The blog's topical scope is **cutting-edge AI engineering**: agentic AI and agentic coding, frontier and open-source LLMs, and the craft of building with them.
- Named labs and models (Anthropic, OpenAI, …) are **examples of subject matter, not the boundary** — the brief's original list was illustrative.
- Topic selection (`FR-B2`) prefers topics that are both timely and **showcase the owner's engineering expertise** — the editorial filter is expertise-demonstration, consistent with the portfolio-led mission.
- Out of scope: general tech news, non-technical AI commentary, AI ethics/policy punditry (`W-5`).

## Why

The owner's goal is to **showcase his expertise on cutting-edge AI engineering**, not to chase a fixed list of vendors. Pinning scope to four named entities would both under-cover the field (OSS, tooling, technique) and read as derivative. Framing scope as "AI engineering, chosen to demonstrate depth" aligns the blog directly with the portfolio-led mission (`vision.md`).

## Consequences

- `FR-B1` sourcing targets the broader AI-engineering field; `FR-B2` adds an expertise-showcase selection criterion.
- News sourcing uses Claude Code's native web-search (per [OQ-13]) rather than a fixed vendor watchlist, fitting the broader scope.
- Keeps the scope focused enough to avoid general-tech-news drift (`W-5`) while wide enough to demonstrate range.

## What we did NOT pick

- **Literal four-vendor scope** (Anthropic / OpenAI / agentic coding / OSS LLMs only). Too narrow and derivative; rejected as a misreading of illustrative examples.
- **Broad "AI news" scope.** Would dilute the expertise-showcase signal into commodity commentary; rejected (`W-5`).
