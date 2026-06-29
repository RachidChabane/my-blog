# Progress - radar research stage (2026-06-29)

- [x] 1. Re-read dedup set from radar_memory.json; RADAR_STEER empty
- [x] 2. Native web-search sweep across mandated beats (last week, run date 2026-06-29)
- [x] 3. Shortlist fresh items; fetch primary + independent corroboration, read them
- [x] 4. Apply gates (freshness, currency, dedup, >=2 independent sources)
- [x] 5. Rank survivors best first (single top pick, per 2026-06-28 precedent; no padding)
- [x] 6. Author schema_facts for top pick (+ DO-NOT-INVENT list)
- [x] 7. Pick kind + tags
- [x] 8. Write radar-candidates.json
- [x] 9. Validation (JSON list, keys, enum, tags, distinct dates/urls, no emoji/em-dash)

## Outcome

Top pick: microsoft-foundry-hosted-agents-runtime (kind: tool). Foundry
Hosted Agents framework-agnostic managed agent runtime, public preview now,
GA targeted end of June 2026. Sources: Microsoft Foundry blog (primary),
Microsoft Learn docs (primary, updated 2026-06-25), InfoQ (independent).

Quiet week for model releases: only Doubao Seed 2.1 (already covered) dropped
06-22..29. GLM-6 / DeepSeek V4.1 confirmed NOT released (aggregator noise).
GPT-5.6 (06-26) and Gemini 3.5 Pro are gated previews; rejected per the
adoptable-today ranking. Nemotron 3 (06-04), Kimi K2.7 Code (06-13), OWASP/
CVE-2026-22708 (06-11) all failed the freshness gate (>2 weeks).
