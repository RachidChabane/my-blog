# Progress — task-research (2026-06-20)

- [x] 1. Re-read research.py + SourceRecord contract
- [x] 2. Native web-search sweep (~8-12 leads) across D-006 surface
- [x] 3. Open >=2 independent pages per lead, capture verbatim excerpts + metadata
- [x] 4. Explicit newsworthiness call -> MODE A (frontier pace; 5 news candidates clear the bar)
- [x] 5. Pick best 5, distinct dedup_keys (checked §3), ranked best-first
- [x] 6. Author topic_id/title/summary/why_relevant/tags per house style
- [x] 7. Write candidates.json (schema_version 1)
- [x] 8. Self-check via --validate until OK (prints OK; no em-dash in authored fields)
- [x] 9. Final commit content(research): candidates.json

## Newsworthiness call (§2)
MODE A. The sweep surfaced multiple dated 2026 developments with real engineering
depth (MiniMax M3 open-weight frontier release Jun 1; TurboQuant KV-cache quant ICLR
2026; ColBERT late-interaction production-latency benchmark Apr 2026; LiteLLM PyPI
supply-chain compromise Mar 24 2026; OWASP 2026 prompt-injection-as-architecture).
Several clear the bar -> news list, no lesson fallback. Biased OFF eval/benchmark
(last 3 days clustered there) toward fresh surfaces: model release, inference/serving,
retrieval, security.

## Selected (ranked best-first)
0. minimax-m3-open-weight-frontier-coding (model release)
1. turboquant-kv-cache-3bit-quantization (inference/serving)
2. colbert-late-interaction-retrieval-latency (retrieval)
3. litellm-supply-chain-pypi-backdoor (security/supply-chain)
4. prompt-injection-permanent-architectural-flaw (security)
