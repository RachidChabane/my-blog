**Purpose:** The autonomous editorial engine — how an article goes from "the schedule fired" to "a fact-checked post is live," with no human in the loop. Constrains the roadmap's content-pipeline and quality-gate items; read after `vision.md`.
**Status:** draft — last revised 01-06-2026.

## §1 Why this doc exists

The pipeline is the project. Everything else (the static site, the portfolio, eventually the avatar) is scaffolding around the one bet: that an AI can research, write, fact-check, and *ship* trustworthy articles unattended. Because there is no human review gate (`D-002`), the pipeline's stages and its quality gate carry the entire burden of credibility. That burden is heavy enough — and detailed enough — to need its own doc rather than being scattered across `roadmap.md` and `user-requirements.md`.

The design is modelled on `claude-plan-execute` (see `inventory/02-claude-plan-execute.md`): the same plan→review→implement machinery, with editorial roles swapped in for engineering ones.

## §2 The stages

A scheduled run flows through six stages. Each stage's output is a committed artifact that feeds the next, so a run is resumable mid-pipeline.

1. **Source** (`FR-B1`). Search recent agentic-AI news within scope (agentic coding, Anthropic, OpenAI, open-source LLMs). Output: a ranked candidate list, each item with source URL(s) + date. Sourcing method is open ([OQ-13]) — likely web-search + curated feeds.
2. **Select** (`FR-B2`). Pick one candidate not covered within the dedup window ([OQ-8]), consulting topic memory (`FR-G1`). Output: the chosen topic + its sources + an angle.
3. **Draft** (`FR-B3`). Write the full article in house style (`FR-G2`), with ≥ 2 cited sources and topic tags. Output: a draft markdown file.
4. **Review** (`FR-B4`). A review agent issues a verdict (APPROVED / NEEDS_REVISION); a revise agent edits until approved or the round cap is hit. This is `claude-plan-execute`'s Phase-2 review loop with an editorial prompt. Output: an approved draft, or a terminal "blocked" state.
5. **Gate** (`FR-C1`, `FR-C2`). The mandatory pre-publish quality gate (§3). Output: pass → proceed; fail → block + alert, nothing publishes.
6. **Publish** (`FR-B5`). Commit the post to the repo; the build + deploy runs; the post goes live. The commit is authored by the pipeline. No manual step exists in this path.

## §3 The quality gate — the load-bearing stage

The gate (`M-4`) is the only thing between a hallucination and the public site, so it is mandatory infrastructure, not polish. It runs after review and **blocks publish on any failure** (`NFR-3`). It has at least three checks, each modelled on `claude-plan-execute`'s Claude-agent gates (which emit machine-readable findings and can trigger a repair loop):

- **Fact-check** (`FR-C1`). Every load-bearing claim is verified against the cited sources. Unsupported claims block publication. This is the single most important check — it is what makes auto-publish defensible.
- **Source-grounding.** Every factual statement traces to a cited, reachable source; no uncited claims; no dead links.
- **Style / brand** (`FR-C2`). A style auditor flags AI-tells and off-voice prose. The `ijtihad` style-auditor agent (from `trucIkram`, see `inventory/07-research-and-non-ai.md`) is a concrete candidate to reuse here (parking-lot item in `roadmap.md`).

A failed gate retains the draft + the gate's findings as artifacts and alerts the owner (`FR-C3`, `FR-F2`); the run does not publish. A gate that wants a fix can re-dispatch to a revise step (the gate-repair loop pattern) before giving up.

## §4 Unattended operation

The pipeline must survive running with nobody watching (`vision.md` Risk 2):

- **Schedule** ([OQ-6]): fires twice weekly. Mechanism open — a scheduled Claude Code routine is the front-runner because it composes with the tmux backend.
- **Auto-resume** (`NFR-8`): transient failures and usage-limit stops resume automatically, reusing `claude-plan-execute`'s exit-code-75 sleep-until-reset loop. A run interrupted mid-pipeline resumes from its last committed stage artifact.
- **Backend** (`M-6`, `NFR-10`): the pipeline drives Claude through the **interactive/tmux backend**, not `claude -p`, to stay on the subscription pool after the 2026-06-15 billing split. This is the migration `claude-plan-execute` already implements.
- **Monitoring** (`M-5`): a heartbeat confirms runs happen on schedule; missed or failed runs alert the owner (`FR-F2`). Silent failure is the thing we most need to prevent.

## §5 Memory and house style

Coherence across many autonomous runs comes from persistent memory (`M-9`):

- **Topic memory** (`FR-G1`): what's been published, when, and from which sources — queried at Select to avoid repetition.
- **House-style guide** (`FR-G2`): a single spec for voice, structure, citation format, and length, consumed at Draft and enforced at the style gate. This is what keeps 100+ auto-written posts sounding like one coherent publication rather than 100 disconnected LLM outputs.

Both map onto `claude-plan-execute`'s cross-task memory (`evergreen` / per-run lifecycles).

## §6 Correction — the exceptional path

Auto-publish means defects *will* occasionally reach production. The owner's recourse (`FR-F3`, `S-2`) is out-of-band: a documented git procedure to unpublish or supersede a post, after which the next build reflects the change. This is deliberately not a routine editing workflow (`W-1`) — it is a safety valve for the rare miss the gate let through, and each use should feed back into a stronger gate.

## Where this surfaces

- `vision.md` § Top risks — Risks 1, 2, and 4 derive from this doc's §3, §4.
- `roadmap.md` § Must — `M-3` (pipeline), `M-4` (gate), `M-5` (ops), `M-6` (backend), `M-9` (memory) operationalize §2–§5.
- `user-requirements.md` — groups B, C, G, and `FR-F2`/`FR-F3` are the testable form of these stages.
- `open-questions.md` — [OQ-6], [OQ-8], [OQ-13] are this doc's unresolved forks.
