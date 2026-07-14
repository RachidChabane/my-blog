# Progress — task-research (2026-07-14)

- [x] Step 1 — Live web sweep (WebSearch + WebFetch) across cutting-edge AI engineering (D-006)
- [x] Step 2 — Filter every hit against the recently-covered-topics denylist (no rehash)
- [x] Step 3 — Apply the HARD independence bar: >= 2 genuinely independent origins per candidate
- [x] Step 4 — Rank best-first (independence, freshness, depth, room for a contestable take)
- [x] Step 5 — Fill the envelope (candidates.json), 5 ranked news candidates; no LESSON fallback
- [x] Step 6 — Self-check: `research --validate candidates.json` prints OK

## Result
5 ranked candidates, each with 2 genuinely independent origins (distinct parties/evidence):
1. llm-as-judge-run-to-run-variance — 2606.13685 (reliability study) + 2604.16790 (SE bias audit)
2. verification-horizon-coding-agent-reward-bottleneck — 2606.26300 (paper) + Mitra (analyst blog)
3. coding-agent-destructive-action-blast-radius — 2606.19380 (ClayBuddy) + Arize (field taxonomy)
4. small-models-for-agentic-workloads-cost-thesis — 2506.02153 (NVIDIA) + Forbes/ScaleDown (benchmark)
5. diffusion-code-model-speed-claims-eval-fairness — 2508.02193 (Seed Diffusion) + 2604.13413 (critique)

Decision gate: usable independently-sourced news EXISTS → ranked news list, LESSON fallback declined.
No em-dashes, no emoji in any field. Numbers cited to a captured excerpt or deliberately omitted
(Seed Diffusion throughput withheld as unverifiable).
