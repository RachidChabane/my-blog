---
chosen_topic_id: mcp-tool-poisoning-client-trust-boundary
fallback_topic_ids:
- low-bit-quantization-taxes-reasoning-long-context
- llm-judge-style-bias-dominates
- agentic-rag-capability-gap-not-retrieval-loop
angle: 'The contestable take: MCP''s design default, trust the server''s tool descriptions,
  inverts the trust boundary onto clients that were never built to defend it, so the
  protocol''s convenience is the attack surface. Named failure mode to anchor: tool
  poisoning, where instructions embedded in tool metadata (text the model reads but
  the UI rarely shows) coerce the agent, identified in a STRIDE/DREAD threat model
  as the most prevalent and impactful client-side vulnerability, with a systematic
  comparison of seven major clients finding significant issues from insufficient static
  validation and parameter visibility [s1]. The independent second origin is a separate
  security research note that traces the same weakness to its root cause with its
  own judgment: not a bug in one product but a design default shipped in every official
  MCP SDK, whose reference implementation ships without guard rails [s2]. This is
  a security piece with a real so-what: the mitigation is client-side (static metadata
  analysis, decision-path tracking, showing tool descriptions at runtime), not a server
  patch you can wait for.'
claim_skeleton:
- id: c1
  statement: 'The Model Context Protocol became the default way to wire agents to
    tools by being simple: a server describes its tools, the client hands the descriptions
    to the model. That simplicity is the vulnerability. Malicious instructions hidden
    in tool metadata (tool poisoning) are the most prevalent client-side attack, and
    most clients accept the metadata without validating it.'
  source_ids:
  - s1
  - s2
---

## Angle

The contestable take: MCP's design default, trust the server's tool descriptions, inverts the trust boundary onto clients that were never built to defend it, so the protocol's convenience is the attack surface. Named failure mode to anchor: tool poisoning, where instructions embedded in tool metadata (text the model reads but the UI rarely shows) coerce the agent, identified in a STRIDE/DREAD threat model as the most prevalent and impactful client-side vulnerability, with a systematic comparison of seven major clients finding significant issues from insufficient static validation and parameter visibility [s1]. The independent second origin is a separate security research note that traces the same weakness to its root cause with its own judgment: not a bug in one product but a design default shipped in every official MCP SDK, whose reference implementation ships without guard rails [s2]. This is a security piece with a real so-what: the mitigation is client-side (static metadata analysis, decision-path tracking, showing tool descriptions at runtime), not a server patch you can wait for.

## Outline

- MCP won on simplicity and moved the trust boundary to the client that never checks

## Claim skeleton

- c1 (s1, s2): The Model Context Protocol became the default way to wire agents to tools by being simple: a server describes its tools, the client hands the descriptions to the model. That simplicity is the vulnerability. Malicious instructions hidden in tool metadata (tool poisoning) are the most prevalent client-side attack, and most clients accept the metadata without validating it.

## Fallback shortlist

- low-bit-quantization-taxes-reasoning-long-context
- llm-judge-style-bias-dominates
- agentic-rag-capability-gap-not-retrieval-loop
