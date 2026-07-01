# Progress — task-research (run 2026-07-01)

- [x] Step 1 — Web sweep (native web search), read pages, capture verbatim excerpts
- [x] Step 2 — Newsworthiness + independence decision: NEWS mode (5 candidates, each >= 2 independent origins)
- [x] Step 3 — Author the envelope (candidates.json)
- [x] Step 4 — Self-check: `--validate` prints OK; no em-dash / no-emoji pass clean
- [x] Final commit: content(research): candidates.json

## Decision log

Mode: NEWS (>= 1 candidate both worth covering AND independently sourced to the >= 2
distinct-origin bar). Ranked best-first:

1. rlvr-gaming-verifiers-reward-hacking — 2604.15149 (controlled training study) +
   2605.02964 RHB (behavioral benchmark, 0-13.9% exploit). Independent groups/methods.
2. mcp-tool-poisoning-client-trust-boundary — 2603.22489 (STRIDE/DREAD, 7 clients) +
   CSA research note (independent industry root-cause analysis).
3. low-bit-quantization-taxes-reasoning-long-context — 2505.20276 (long-context, up to
   59% drop) + 2601.14888 (Reasoning-QAT, +44.53% MATH-500). Independent groups.
4. llm-judge-style-bias-dominates — 2604.23178 (style 0.10-0.76 vs position <=0.04) +
   2601.13649 (language bias). Independent groups, distinct bias findings.
5. agentic-rag-capability-gap-not-retrieval-loop — 2602.03442 A-RAG (mechanism) +
   2510.13910 RAGCap-Bench (capability breakdown). Independent groups.

All dedup_keys checked distinct from the 11 already-covered topics. Excerpts verbatim
from arXiv /abs pages + CSA note actually read (2026-07-01).
