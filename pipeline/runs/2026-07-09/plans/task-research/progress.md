# Progress — task-research (2026-07-09)

- [x] Step 1 — Sweep (native web search) for cutting-edge AI engineering threads
- [x] Step 2 — Capture sources verbatim (excerpts, urls, dates)
- [x] Step 3 — Rank and fill the envelope (candidates.json), 5 news candidates best-first
- [x] Step 4 — Decision gate: usable independently-sourced news EXISTS → news list (no lesson)
- [x] Step 5 — Self-check with research --validate → prints OK

## Result
5 ranked candidates, each with 2 GENUINELY INDEPENDENT origins (different parties/methods):
1. coding-agent-misalignment-real-sessions — 2605.29442 (obs study) + 2605.18583 (controlled)
2. ai-generated-pr-security-review-gap — 2604.19965 (in-the-wild) + Veracode (controlled bench)
3. agent-tool-shortlist-length — 2605.24660 (Meta) + 2505.10570 LongFuncEval (IBM)
4. llm-as-combinatorial-solver-trap — 2605.25246 FrontierOR + 2605.12421 Formalize-Dont-Optimize
5. rag-reranker-relevance-utility-gap — 2602.03689 BAR-RAG + 2601.17532 Info-Gain-Pruning

Independence note: dropped a same-lab security pairing (2601.21102 shares authors with 2604.19965)
in favor of the independent Veracode benchmark, to clear the argue source-independence judge.
