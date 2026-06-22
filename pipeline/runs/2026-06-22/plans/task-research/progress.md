# Progress — task-research (run 2026-06-22)

- [x] Step 1: Re-read research.py + SourceRecord contract (matched shape)
- [x] Step 2: Native web-search sweep (~8-12 raw leads + sources)
- [x] Step 3: Open >= 2 independent pages per lead, capture verbatim excerpts + metadata
- [x] Step 4: Explicit newsworthiness call -> Mode A (5 news candidates)
- [x] Step 5: Pick best 5, distinct dedup_keys (checked §3), ranked best-first
- [x] Step 6: Author topic_id/title/summary/why_relevant/tags per §6 (no em-dash in authored fields)
- [x] Step 7: Write candidates.json (envelope, schema_version 1)
- [x] Step 8: Self-check with --validate -> OK

## Newsworthiness call (Mode A)
Multiple material, dated 2026 developments clear the bar; no lesson fallback needed.
Ranked best-first:
1. mcp-stdio-rce-by-design (security) — Ox/Infosec + authzed
2. llm-inference-nondeterminism-batch-invariant-kernels (inference) — Thinking Machines + LLM-42 (arXiv 2601.17768)
3. prompt-injection-defend-by-design-camel (security) — Zylos + CaMeL (arXiv 2503.18813)
4. open-weight-agentic-coding-matches-proprietary (oss) — Kilo + MindStudio
5. agentic-rag-logical-retrieval-beyond-embeddings (retrieval) — arXiv 2605.27123 + 2602.03442

Steered clear of §3 published cluster (eval/benchmark/scaffold/pass@1, AST chunking,
context-window-ceiling, canon-repricing, code-erosion). #4 is a model-landscape take,
not an eval-methodology angle; dedup_key phrased accordingly.
