# D-002 — Full auto-publish, with mandatory automated quality gates

**Status.** Accepted 2026-06-01. Source: Step-0 intake (publish-autonomy choice); `vision.md` § What "zero hand-authoring + auto-publish" implies.

## Decision

- Articles **publish with zero human review** — no approval gate in the publish path (`FR-B5`).
- A **mandatory automated quality gate** runs before every publish and **blocks on failure** (`M-4`, `NFR-3`): fact-check, source-grounding, and style/brand checks (`FR-C1`, `FR-C2`).
- A failed gate **blocks publication and alerts the owner**, retaining artifacts (`FR-C3`, `FR-F2`).
- Human correction exists only as an **exceptional, out-of-band** path (`FR-F3`, `S-2`), never as a routine editing workflow (`W-1`).

## Why

The owner's directive is zero hand-authoring and a self-running system (`vision.md`). Full auto-publish honors that literally. But auto-publishing under the owner's name with no review makes a single hallucinated or off-brand post a direct credibility liability — so the automated gate is not optional polish, it is the load-bearing safeguard that makes auto-publish defensible. Quality control shifts from a human reviewer to automated agents.

## Consequences

- Makes `M-4` (the quality gate) a non-negotiable MVP item and the pipeline's most important stage (`content-pipeline.md` §3).
- Elevates `NFR-3` to a hard invariant: nothing publishes without passing the gate.
- Requires a post-hoc correction path (`S-2`) as a safety net for the defects the gate misses.
- Raises the bar on monitoring (`M-5`): with no human in the loop, gate-blocks and failures must alert.

## What we did NOT pick

- **Human review gate** (pipeline opens a PR/draft, owner approves before publish). Lower risk, but reintroduces a human step the owner explicitly wants gone, and would gate cadence on his availability — rejected.
- **Auto-publish + post-hoc alert only** (no blocking gate). Cheapest, but lets a bad post go live before anyone checks — rejected as too risky for a portfolio-led site.
