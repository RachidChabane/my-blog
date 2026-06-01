# D-003 — Build approach: hybrid (reuse claude-plan-execute + stripped bayan)

**Status.** Accepted 2026-06-01. Source: `open-questions.md` [OQ-3]; intake (build-approach choice).

## Decision

- Drive the **article pipeline** with `claude-plan-execute` on its **tmux/interactive backend** (`M-3`, `M-6`).
- Build the **avatar RAG** as a **stripped lift of bayan's patterns** (`M-10`): keep hybrid retrieval + RRF fusion + the "I don't know" threshold gate + the Protocol seams; drop Arabic/genre/billing/OCR/verifier-recursion (see `rag-avatar.md` §2).
- Do **not** stand up bayan or claude-plan-execute wholesale, and do **not** build everything fresh.

## Why

The owner already owns two proven stacks; rebuilding from scratch would re-solve solved problems, while reusing them wholesale would import platform weight (multi-tenant billing, Arabic machinery) the blog doesn't need. Hybrid takes the parts that carry power-to-weight — the orchestrator for the pipeline, the retrieval core for the avatar — and leaves the rest. This is also what makes putting the avatar *in* the MVP affordable.

## Consequences

- The pipeline inherits `claude-plan-execute`'s plan→review→implement loop, memory, gates, and exit-75 auto-resume (`content-pipeline.md`).
- The avatar is a small standalone service, not a port of the bayan platform (`rag-avatar.md`).
- Creates a soft dependency on `claude-plan-execute` staying maintained; acceptable since the owner maintains it.

## What we did NOT pick

- **Reuse wholesale.** Imports complexity (billing, Arabic, OCR) irrelevant to a single-author blog — rejected.
- **Build lean & fresh.** Cleanest, but slowest and discards directly reusable, battle-tested code — rejected.
