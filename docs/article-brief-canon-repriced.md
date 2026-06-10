# Article brief — "AI re-priced the whole canon, it didn't repeal it" (the wedge)

Hand-authored editorial brief for one flagship standalone essay, at CANON altitude — SOLID is one
worked example, not the headline. Shaped to the select-stage `brief.md` contract (frontmatter + the
four mandatory sections, `pipeline/prompts/select.py`) so the core block drops into
`plans/task-select/brief.md`, plus the editor's context the pipeline brief has no field for.

**Seed ready:** `docs/seed/canon-repriced.candidates.json` (13 sources, each with a VERBATIM excerpt
captured + validated; passes `python3 -m pipeline.stages.research --validate`). NOT run — copy it to
`<run_dir>/plans/task-research/candidates.json` when the runner goes live. The claim skeleton below is
reconciled to those 13 verified sources (see "verification notes").

Origin: editorial assessment of 2026-06-09 — repo grounding + a 2024-2026 discourse sweep + an
adversarial pass that sorted ~18 practices and then **broke its own taxonomy** (see "the honest frame").
Decision: ONE standalone essay (chapter/series machinery unsupported); the "recurring thread" is the
backlog at the bottom — a lens over DISTINCT practices, not a column. Supersedes the SOLID-anchored
draft (deleted).

---

## Thesis (the wedge)

**Every engineering convention was one bet: that the binding cost of software is editing code a
human has to read.** For a human author, legibility and change-cost were the *same lever* — code you
could not read was code you could not change cheaply. AI drives a **wedge** between them: a machine
reader changes code without paying the legibility tax, and a stochastic author writes it. Once you
separate the two, most of the canon does not survive or die wholesale — **it splits**: a
substrate-independent **economic core that now binds harder**, plus a freed **human-cognition layer**
that gets cheaper, flips into a liability, or has no analog at all.

Refuse both slogans: "clean code is dead" AND "nothing changed."

## The honest frame (read before writing — this is what the adversary forced)

Do NOT pitch a tidy four-peer-bucket taxonomy. Tallied across the canon, ~14 of 18 practices land in
"splits" and 4 in "invariant"; *repriced-down / inverted / newly-emergent never appear as a
standalone verdict for a whole practice* — they are the **fates a freed ceremony-leg meets**. So the
real engine is **two moves**: (1) **invariant core that binds harder** (priced change-cost, not
reading comfort), and (2) **splits into surviving-core + shed-ceremony**, where the shed leg meets one
of three fates — **cheaper** (repriced-down), **sign-flip to liability** (inverted), or **no human-era
analog** (newly-emergent). The uniformity is **the finding, not a flaw** — it is the signature of one
historically-fused objective being pried apart. Falsifiable split bar: the two legs must be
independently **nameable** AND receive **opposite** price moves.

## Candidate titles

- EN: *AI Re-Priced the Whole Canon. It Didn't Repeal It.*  /  *One Bet, Broken Two Ways: What the Machine Reader Does to Clean Code*  /  *The Wedge: How an AI Reader Splits Every Principle You Know*
- FR: *L'IA a revalorisé tout le canon, elle ne l'a pas aboli*  /  *Un seul pari, brisé en deux : ce que le lecteur-machine fait au code propre*

## Suggested lead (the wedge hook; thesis in the first block, before the ~180-char dek cut)

> This blog is written by an AI. It ships from a pipeline that plans, drafts, verifies each claim
> against a captured source, and refuses to publish when one cannot be grounded — a working answer to
> a problem that did not exist when the rules I was taught were written: how do you trust code from an
> author that can produce a different structure from the same intent? That is the real shape of
> "AI-era patterns" — not the death of clean code, and not the comfortable line that nothing changed.
> Every convention I inherited — SOLID, DRY, the design patterns, the testing pyramid, code review —
> was one bet: that the binding cost of software is editing code a human has to read [s1]. For a human
> author, legibility and change-cost were the same lever. AI drives a wedge between them, and once you
> separate the two, most of the canon does not survive or die. It splits.

## Prior art to CREDIT (integrity-critical — a reader holding these papers must not catch an overclaim)

- **Dmytro Ustynov, "Beyond Human-Readable" (arXiv 2604.07502)** — the nearest twin: opens with "the
  entire apparatus of software engineering was optimized around human cognition," already performs our
  split for SRP, already decomposes SOLID. Cite it; do not claim the human-cognition lens as original.
- **Christina Lin, "Design Patterns Are Dead. Long Live Design Patterns" (Google Cloud Community, 2026)**
  — one classifying question across GoF patterns, sorted survive/demote/promote. Narrower scope.
- **CGI (Brincin & Lessard), "When rework only costs a prompt"** — owns the economic-repricing thesis
  at the *methodology* level (Waterfall/Agile/Scrum).

**Claim ONLY the narrow residual:** one uniform change-cost-vs-cognition question run across the WHOLE
technical canon (not just patterns, not just methodology); "splits" as a first-class NAMED mechanism
with a falsifiable bar; and the wedge (legibility and change-cost were fused, AI separates them) as the
generative cause of why the canon splits the same way.

---

## BRIEF — drop this block into `plans/task-select/brief.md`

```markdown
---
chosen_topic_id: canon-repriced
fallback_topic_ids:
  - disposable-vs-legible-code
  - verifying-the-stochastic-author
angle: Every engineering convention was one bet — minimizing the change-cost of code a human had to read; AI drives a wedge between legibility and change-cost (a non-human reader, a non-deterministic author), so most of the canon splits into a substrate-independent economic core that binds harder plus a freed human-cognition layer that gets cheaper, flips into a liability, or has no analog. SOLID is one worked example, not the headline.
claim_skeleton:
  - id: c1
    statement: Coupling is the cost of changes that ripple through a system; if changing one element forces a change in another they are coupled with respect to that change, a property of the system's structure rather than of who edits it.
    source_ids: [s1]
  - id: c2
    statement: At team scale AI amplifies what is already there, since loosely-coupled architectures with fast feedback loops see gains while tightly-coupled systems see little or no benefit.
    source_ids: [s2]
  - id: c3
    statement: Agent-generated code shows a near-perfect correlation (rho=0.94, p<0.001) between total lines of code and architectural smells, and requirement specificity has no statistical impact (p>0.8).
    source_ids: [s3]
  - id: c4
    statement: Across four state-of-the-art code LLMs, 35.2 percent of outputs are less robust than human-written code, with over 90 percent of deficiencies caused by missing conditional checks.
    source_ids: [s4]
  - id: c5
    statement: Sixteen of the 23 Gang-of-Four design patterns are invisible or simpler given first-class types and functions, so much of the pattern vocabulary was scaffolding for a human reader rather than a substrate-independent gain.
    source_ids: [s5]
  - id: c6
    statement: Even the best-performing LLMs reached only 38.81 percent overall accuracy classifying design patterns in source code, evidence the named-pattern vocabulary carries little machine ROI.
    source_ids: [s6]
  - id: c7
    statement: All existing LLMs perform much worse at class-level code generation than at method-level benchmarks like HumanEval, so class-level structure and deep indirection are where the agent fails.
    source_ids: [s7]
  - id: c8
    statement: AGENTS.md is an open cross-vendor agent-instruction format used by over 60,000 open-source projects and now stewarded by the Agentic AI Foundation under the Linux Foundation, an artifact class whose only reader is an agent.
    source_ids: [s8]
  - id: c9
    statement: The source of truth is relocating out of the code into the specification, shifting from code as the source of truth to intent as the source of truth, with the spec determining what gets built.
    source_ids: [s9]
  - id: c10
    statement: Concepts and synchronizations are explicit and declarative, so they can be analyzed, verified, and generated by an LLM that proposes new features without introducing hidden side effects.
    source_ids: [s10]
  - id: c11
    statement: Agent-authored code shows a 15.8 percentage-point lower modification rate and 16 percent lower hazard of modification, so it persists rather than being thrown away, which contests the disposable-code premise.
    source_ids: [s11]
  - id: c12
    statement: When solving larger and more complex problems AI tools generate lower-quality solutions, so architects must perform the problem decomposition and integration, which keeps human decomposition the binding skill.
    source_ids: [s12]
  - id: c13
    statement: AI shifts authoring from reuse toward duplication, with cloned lines rising from 8.3 to 12.3 percent of changed lines while refactoring fell from 25 percent in 2021 to under 10 percent in 2024.
    source_ids: [s13]
---

## Angle

Every engineering convention was one bet on the change-cost of human-read code. AI drives a wedge
between legibility and change-cost, so the canon splits into an economic core that binds harder [s1, s2]
and a freed human-cognition layer that gets cheaper [s5], flips to a liability [s7], or has no analog
[s8]. SOLID is one example, not the headline. First-person, as the engineer who built an AI that ships
this very pipeline.

## Outline

- LEAD (problem-first, thesis in sentence one): the wedge hook; refuse "clean code is dead" and "nothing changed"; state the canon-altitude thesis.
- THE ONE BET AND THE WEDGE: every convention answered one cost structure (editing code a human had to read); for a human author legibility and change-cost were the same lever; AI separates them. Name the classifying question once.
- THE FLOOR THAT BINDS HARDER (invariant core): low coupling, change-cost, module boundaries are substrate-independent and the stochastic author raises their price. Anchor on DORA loose-coupling [s2, vendor-flag], the rho=0.94 volume-to-smell correlation [s3], the defensive-programming deficit [s4]. SOLID's DIP/ISP enter as ONE example.
- THE CEREMONY GETS CHEAPER (repriced-down): GoF named-pattern vocabulary [s5, s6], SOLID's many-tiny-classes reflex, DRY-at-all-costs indirection, the unit-heavy pyramid silhouette. Still wanted, worth less; explicitly NOT a sign flip.
- THE RARE FLIP (inverted): class-level structure and deep indirection become where the agent fails [s7]; conventional commits invert toward write-for-the-parser metadata. Concede up front: thin at the whole-practice level; most inversions are sub-legs inside a split.
- THE GENUINELY NEW (newly-emergent): AGENTS.md/CLAUDE.md [s8], spec-driven and eval-driven dev [s9], verifiable-by-construction architecture [s10]. Frame the ADR's "capture the why" as the human ANCESTOR that relocated here — relocation, not invention.
- THE CONTRADICTION THE HYPE BLURS (the fact-check move): "code is disposable, regenerate it" vs "invest more in AI-legible code" cannot both be fully true. Resolve by layering, then puncture the disposable slogan with the ~15.8pp counter-evidence [s11].
- THE HONEST PREEMPT: concede most practices split the SAME way and name the uniformity as the finding, not a flaw (the wedge signature). Credit the prior art (Ustynov, Lin) and claim only the narrow residual. Human decomposition stays binding [s12].
- SELF-REFERENTIAL CLOSE + falsifiable prediction: this blog is AI-built software running a Plan-Execute-Verify harness with a BLOCK/WARN gate split — the newly-emergent bucket in operation. State the flip condition (if whole-system regeneration becomes routine and agent-code modification rate climbs above human's [s11], the disposable regime wins). Concede it in advance.

## Claim skeleton

- c1 (s1): coupling = the ripple-cost of change, structural not about who types it — the invariant core.
- c2 (s2): AI amplifies what's already there; loose coupling captures the gains [VENDOR-FLAG: Google/DORA].
- c3 (s3): rho=0.94 lines-of-code-to-architectural-smell; requirement specificity does not fix it (p>0.8).
- c4 (s4): 35.2% of LLM outputs less robust, 90%+ missing conditional checks — defensive programming binds harder.
- c5 (s5): 16/23 GoF patterns invisible/simpler with first-class functions — pattern vocabulary was human scaffolding.
- c6 (s6): best LLMs only 38.81% accurate classifying patterns — low machine ROI for the vocabulary.
- c7 (s7): all LLMs much worse at class level than method level — deep/class-level structure is where the agent fails.
- c8 (s8): AGENTS.md, 60k+ projects, stewarded under the Linux Foundation — a machine-only-reader artifact, no analog.
- c9 (s9): source of truth moving from code to intent (the spec) [VENDOR-FLAG: GitHub Spec Kit shipped-fact].
- c10 (s10): MIT concepts+synchronizations — analyzable/verifiable, no hidden side effects.
- c11 (s11): agent code modified 15.8pp LESS, persists rather than discarded — the disposable-code premise is contested.
- c12 (s12): AI quality drops on larger/complex problems; architects must decompose — human decomposition stays binding.
- c13 (s13): cloned lines 8.3%->12.3% while refactoring fell 25%->under 10% [VENDOR-FLAG: GitClear].

## Fallback shortlist

- disposable-vs-legible-code
- verifying-the-stochastic-author
```

---

## The four fates, with the sharpest sourced example each (the body of the piece)

| fate | one line | carries (examples) | sharpest sourced anchor |
|------|----------|--------------------|--------------------------|
| **INVARIANT (binds harder)** | priced change-cost, never reading comfort; machine reader can't lower it, stochastic author raises it | low coupling / DIP-ISP, YAGNI + KISS-economic-core, separation of concerns, knowledge-DRY, refactoring (enforcement relocated), defensive programming, static typing/linting, SemVer/12-factor | defensive programming: 35.2% of LLM outputs less robust, 90%+ missing conditional checks [s4]; DORA loose-coupling [s2]; rho=0.94 [s3] |
| **REPRICED-DOWN (still wanted, worth less)** | human-cognition ceremony; magnitude drops, NOT a sign flip | GoF named-pattern vocabulary, SOLID's many-tiny-classes reflex, syntactic de-dup, fine-grained adapter/DTO ceremony, red-green-refactor-as-ritual, redundant "what" comments, narrative/tutorial docs, classic pair programming | Norvig: 16 of 23 GoF patterns invisible/simpler with first-class types and functions [s5] |
| **INVERTED (becomes a liability)** | the rare sign flip; the agent should AVOID it | deep inheritance / dynamic dispatch, conventional-commits→machine metadata, heavy FP idioms, hand-written boilerplate abstractions | ClassEval: all LLMs much worse at class level than method level [s7] |
| **NEWLY-EMERGENT (no human-era analog)** | created by the new reader / new author | AGENTS.md / CLAUDE.md, spec-driven + eval-driven dev, context/harness engineering, verifiable-by-construction arch, tests-as-oracle, machine-reviews-machine, gate-hardening, human-navigator + agent-driver | AGENTS.md: cross-vendor, 60k+ projects, stewarded under the Linux Foundation [s8] |

Keep naming in INVARIANT, not inverted (it prices UP for both readers — the device's own counterexample;
flag it honestly). Keep enforcement-relocation in INVARIANT annotated "enforcement relocated" (lint/CI/
type-checkers predate AI), never newly-emergent.

## Sources — VERIFIED, verbatim excerpts captured 2026-06-09 (seeded in `docs/seed/canon-repriced.candidates.json`)

| id | source | url | tier / flag |
|----|--------|-----|-------------|
| s1 | Kent Beck — coupling and cohesion (Tidy First?) | https://tidyfirst.substack.com/p/tldr-coupling-and-later-cohesion | primary-author |
| s2 | Google Cloud / DORA — 2025 State of AI-assisted Software Development | https://cloud.google.com/blog/products/ai-machine-learning/announcing-the-2025-dora-report | **VENDOR/ORG-PUBLISHED** |
| s3 | "AI-Generated Smells" (Concordia) — rho=0.94 LoC-to-smell | https://arxiv.org/html/2605.02741 | academic |
| s4 | "Enhancing the Robustness of LLM-Generated Code" (Li et al.) | https://arxiv.org/abs/2503.20197 | academic |
| s5 | Peter Norvig — "Design Patterns in Dynamic Languages" | https://norvig.com/design-patterns/ | practitioner-authority |
| s6 | "Do Code LLMs Understand Design Patterns?" (Pan et al.) | https://arxiv.org/html/2501.04835v1 | academic |
| s7 | "ClassEval" (Du et al.) — class-level vs method-level | https://arxiv.org/abs/2308.01861 | academic |
| s8 | AGENTS.md — open agent-instruction standard | https://agents.md/ | institutional-fact |
| s9 | GitHub Blog — spec-driven development / Spec Kit | https://github.blog/ai-and-ml/generative-ai/spec-driven-development-with-ai-get-started-with-a-new-open-source-toolkit/ | **VENDOR** (shipped-fact is load-bearing) |
| s10 | MIT News — concepts and synchronizations (Daniel Jackson) | https://news.mit.edu/2025/mit-researchers-propose-new-model-for-legible-modular-software-1106 | academic |
| s11 | "Will It Survive?" — AI code modification rate | https://arxiv.org/abs/2601.16809 | academic |
| s12 | Amasanti & Jahic (Cambridge) — AI quality drops on larger problems | https://arxiv.org/abs/2506.17833 | academic — **the neutral anchor** |
| s13 | GitClear — AI Copilot Code Quality 2025 | https://www.gitclear.com/ai_assistant_code_quality_2025_research | **VENDOR-FLAG** |

### Verification notes (what changed when I captured verbatim excerpts)
- **Dropped the "homogenisation trap" claim** (formerly cited to arXiv 2507.06920): that paper's abstract is about test-suite homogeneity, NOT "AI regresses to the median" — no verbatim support, so it is out rather than mis-cited. The "AI doesn't transcend the human bar" point now rests on c12 (Cambridge).
- **Softened ClassEval (c7)**: the exact 85.4→37.6 Pass@1 / AttributeError figures were not fetchable from the abstract; the claim now states only what the abstract says verbatim (class-level much worse than method-level). Recover the exact numbers from the full PDF before using them in prose.
- **AGENTS.md (c8)**: dropped the "December 2025" date (not stated on agents.md); kept "60k+ projects" and "stewarded by the Agentic AI Foundation under the Linux Foundation," both verbatim.
- **GitClear (c13)**: uses the verbatim figures (8.3%→12.3% cloned; refactoring 25%→<10%) rather than the unverified "4x cloning."
- All 13 excerpts are verbatim from the page as fetched on 2026-06-09; the seed validates against the research-stage schema.

## Vendor-flag discipline (owner-locked rule, engagement-findings.md:138-140)

Every number carries an `[sN]` AND, when the source sells into the thesis, an inline flag in the prose.
Vendors/org-published that sell into the thesis: GitClear (s13), DORA/Google (s2), GitHub Spec Kit (s9,
where the *shipped-fact* is load-bearing). Weight the argument on the academic anchors (s3, s4, s6, s7,
s11, s12) and the institutional fact (s8, s10). The fact-check gate is directional — an unsourced
first-person number slips it, so discipline is on the author.

## How to run this through the pipeline (seed is ready; do NOT run until the runner is live)

1. `cp docs/seed/canon-repriced.candidates.json <run_dir>/plans/task-research/candidates.json` — the
   13 sources already carry captured excerpts the fact-check gate verifies against (no research-stage
   re-fetch needed; or run the research stage to refresh excerpts).
2. Drop the BRIEF block above into `<run_dir>/plans/task-select/brief.md`; it already passes
   `python3 -m pipeline.stages.select validate-brief` (verified clean).
3. Run select → draft → review → the six M-4 gates → publish.

This essay is the natural first payload for the writing-rigor upgrade
(`docs/writing-rigor-handoff-prompt.md`): its argument was pressure-tested by hand (the adversary broke
and rebuilt the taxonomy); that upgrade would make it a standing stage, and this essay could be the
first to survive it.

## Thread backlog — the recurring LENS over DISTINCT practices (NOT a named column)

Each row is a distinct practice through the same wedge lens, pegged to a freshly-shipped artifact so it
survives the Select-stage semantic dedup (`writing-flow.md:71`) and stays off the not-a-news-site line.
Rotate which question leads; let some land on "this one is just an old virtue renamed."

| practice | fate | freshly-shipped peg | angle |
|----------|------|---------------------|-------|
| SOLID (DIP/ISP core vs many-tiny-classes ceremony) | splits | Bilkent "Are We SOLID Yet?" (arXiv 2509.03093) — SRP detectable, DIP nearly not | the detection asymmetry IS the split: agent self-enforces the shallow principle, blind to the deep one |
| DRY (knowledge-DRY vs syntactic de-dup) | splits | Spec Kit / AGENTS.md single-source-of-truth | knowledge-DRY migrates UP to one authoritative spec; the syntactic half is conceded |
| GoF design patterns (seams vs vocabulary) | splits | "Do Code LLMs Understand Design Patterns?" (arXiv 2501.04835) — 38.81% | vocabulary ROI stays low while decoupling seams stay load-bearing |
| Composition-over-inheritance / Law of Demeter | splits (inverted leg) | SmellBench (arXiv 2605.07001) — agents repairing architectural smells | the genuine sign flip: can agents that get inheritance wrong repair their own coupling smells? |
| Testing pyramid / TDD / BDD | splits | tdd-guard (github.com/nizos/tdd-guard) — blocks impl until a failing test exists | the test-first SEQUENCE re-installed as an external deterministic guardrail for a stochastic author |
| Code review | splits | Cloudflare orchestrated AI review (Nov 2025) — multi-reviewer swarm | does the human-of-record accountability anchor survive a machine-reviews-machine swarm? |
| Refactoring discipline | invariant (relocated) | RefAgent (arXiv 2511.03153) vs CodeTaste (arXiv 2603.04177, ETH) | the boy-scout rule re-implemented as scheduled refactoring machinery; does it close the strategic gap? |
| Architectural patterns (layered/hexagonal/CQRS) | splits | Forge + intent.lisp descriptor (arXiv 2604.13108) | the port/layer boundary extracted OUT of in-code ceremony into a machine-read descriptor |
| Defensive programming / observability | invariant (binds harder) | RobGen (in arXiv 2503.20197) — auto-inserts missing guards | a shipped tool existing because LLMs under-produce defensive checks; the invariant externalized as a scaffold |
| Static typing / static analysis / linting | invariant (the agent's affordance) | type-constrained decoding (ETH, PLDI 2025, arXiv 2504.09246) | types as a machine-author steering affordance, not a human-ergonomics tax |
| Documentation / ADRs / capture-the-why | splits | "Codified Context" (arXiv 2602.20478) | the ADR's "capture the why" relocating into machine-consumed governance — relocation, not repeal |
| Process conventions (commits / SemVer / 12-factor) | splits (inverted commits) | Lore (arXiv 2603.15566) — git commits as a structured knowledge protocol for agents | human authoring-friction collapses; the optimum inverts toward write-for-the-parser commit metadata |
| Immutability / pure functions | splits | "Needle in the Repo" maintainability benchmark (arXiv 2603.27745) | a human-era testability nicety becoming the precondition for the agent to verify itself |
| VCS branching + CI/CD trust-gate | splits | GitHub native merge queue + Copilot agent-PR-review hardening | the gate as the only trust mechanism AND a primary attack surface — hardening against a reward-seeking author |
