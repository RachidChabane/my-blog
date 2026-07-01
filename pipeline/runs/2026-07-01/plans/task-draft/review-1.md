# Review 1 — task `draft` plan

## Verdict: APPROVED

## What I verified (against the actual repo, not the plan's word)

- **Inputs read correctly.** `brief.md` (`chosen_topic_id: mcp-tool-poisoning-client-trust-boundary`, single-row outline, `c1 (s1,s2)`), `argument.json` (`strengthened_argument` = "MCP made a known-dangerous pattern the default and pushed the defense burden onto forwarder-clients"; `strongest_attack` = "just generic prompt injection"), and `candidates.json` (`s1` arXiv 2603.22489 seven-client STRIDE/DREAD; `s2` CSA note "ships without guard rails") all match the plan's §0 summary. Not lesson mode (topic_id has no `lesson-` prefix); `category: essays` is right.
- **Tag build-break call is correct and load-bearing.** `src/content/tags/index.json` is exactly `agents, rag, agentic-coding, evaluation, llm-oss, retrieval, qualite`. `candidates.json` lists `["agents","security","mcp"]` for this topic; `security`/`mcp` are out-of-vocab and would pass every pipeline gate + astro check but fail the prod build. Plan's decision `tags: [agents]` is the only clean fit. [MEM: first-autonomous-article-and-build-gate-gap] resolves to a live memory file. Good.
- **Every CLI signature the plan invokes exists and matches.** `stages.draft validate` prints `OK` (draft.py:219); `stages.review check` writes `review.json` and prints `## Verdict: APPROVED|NEEDS_REVISION` (review.py:153,159); `stages.humanize scan` enforces emoji + em-dash (U+2014) + **FR-diacritics** (humanize.py:187/192/214), and strips the slug from the diacritics scan (so ASCII slug is safe); `gate.factcheck --run-dir --lang {fr,en}`, `gate.grounding --run-dir --lang {fr,en} [--link-check fake default]`, `gate.editorial --run-dir` (no `--lang`), `gate.source_quality --run-dir` (no `--lang`), `gate.difficulty --run-dir` (no `--lang`) all confirmed.
- **Gate teeth match the plan's stated risks.** factcheck raises on a missing `supported` bool and BLOCKs on `supported:false` / missing findings file (factcheck.py:79-84); source_quality's `SOURCE_QUALITY_REQUIRED_FIELDS = (source_id, primary, authoritative, corroborated)` raises on a dropped boolean even on a `sound` verdict, and is verdict-only for pass/fail (source_quality.py:52,23-26). The plan's §7.2 warning about all four keys is accurate.
- **claim_source_map contract.** `excerpt_span` is optional (absent ⇒ whole excerpt supports the claim), so the plan's omit-to-avoid-off-by-one is safe. `retrieved_at` is required and ISO-validated; both `s1`/`s2` in candidates.json carry it, so verbatim copy satisfies the contract.
- **Nine-gate scoping is right.** `independence.py` (G4) and `source_fidelity.py` exist but are argue-stage / default-inert, not part of this task's nine; the plan correctly does not run them.
- **Judge != author separation** is respected throughout (§4-7): style-auditor, fact-check, editorial, source-quality each a fresh sub-agent with minimal prose-free context; the drafting agent writes none of their JSONs. This is the one silent-rubber-stamp failure mode and the plan guards it explicitly.
- Exemplar reference `pipeline/runs/2026-06-30/plans/task-draft/draft-en.md` exists.

## Comments (non-blocking)

- **`difficulty: 3`** is a judgment call, not a correctness issue; the plan justifies it against the rubric's three axes with the round-up rule. The editorial/difficulty gates enforce parity and integer range, not a specific level, so any defensible 1-5 with fr==en passes. Fine as-is.
- **FR diacritics on the map body are not scanned** (the gate reads the draft's title+body, not `claim_source_map.json`) — the plan states this correctly in §2.2. The real exposure is the FR *title and headings*; the plan's §1.4/§10 deny-list note (`déplacé`, `simplicité`, `frontière`, `problème`, `modèle`, `fenêtre`, `découper`) is the right thing to watch. Just re-flagging that the FR H2s in §1.3 must be authored with full accents, since §1.3 currently lists the section titles in English.
- **Editorial `thin` is the highest writing risk** (non-recoverable by redraft, burns a repair round then falls back to a new topic). The plan leans on the trust-boundary-inversion / default-not-misuse framing to clear non-obviousness on the first pass; that framing is genuinely non-obvious against the "MCP is neutral plumbing" naive read, so the risk is acknowledged and mitigated as well as a plan can.

Safe to implement.
