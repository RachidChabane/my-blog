# Progress — task-argue

- [x] Step 0 — Read inputs (brief.md thesis + claim skeleton; chosen candidate sources)
- [x] Step 1 — Dispatch thesis judge (argument-rigor, G1) -> argument.json (verdict: defensible)
- [x] Step 2 — Dispatch source-independence judge (G4) -> independence.json (verdict: single_origin)
- [x] Step 3 — Ran both gates: argument gate OK (exit 0); independence gate BLOCK (single_origin, exit 1)
- [x] Step 4 — Handled honestly: independence BLOCK is the designed fallback signal (writing-flow.md section 7). No hand-edit, no source swap, no gate weakening. Run should fall back to next-ranked topic (glm-5-2-open-weight-long-horizon-coding) and re-argue.
- [x] Final commit

## Outcome

- argument (G1): OK — thesis is a falsifiable conditional; the benchmark-artifact attack confirms the mechanism and only forces a calibration demotion of the GPT-5.4 edge; survives in strengthened form.
- independence (G4): BLOCK (single_origin) — load-bearing numbers (58.71 vs 58.25; seven-benchmark/three-OOD transfer) trace solely to the Alibaba Cloud vendor announcement (_603304); s1==s3 same URL, s2 re-reports vendor framing with no independent verification. Deterministic domain backstop passed (2 distinct domains), but the judge verdict blocks.
- No pipeline source files modified.
