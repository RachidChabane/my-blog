---
translationKey: ard-v0-91-json-ld-entries-and-per-service-trust
lang: en
slug: ard-v0-91-json-ld-entries-and-per-service-trust
title: ARD v0.91 standardises how agentic resources are described and leaves trust
  to each service
publishDate: 06-09-2026
kind: spec-change
tags:
- ARD
- JSON-LD
- MCP
- agents
- specs
summary: 'The Agentic Resource Discovery specification reached v0.91 on 26 August
  2026 and still reads Status: Proposal [s1]. An entry becomes a JSON-LD node with
  a @context seam [s1], while each discovery service keeps its own rules for what
  it returns and which sources it trusts [s2].'
sources:
- label: Agentic Resource Discovery Specification v0.91
  url: https://agenticresourcediscovery.org/spec/
  date: 26-08-2026
- label: The New Stack report on the ARD specification
  url: https://thenewstack.io/ard-agent-discovery-specification/
  date: 31-08-2026
contentHash: sha256:1033e266e8637f41
publishState: published
---

## What changed

The Agentic Resource Discovery specification reached v0.91 on 26 August 2026, and it still reads `Status: Proposal` [s1]. This version restates the description layer in terms of JSON-LD and namespaces: an entry is a JSON-LD node whose terms come from a default namespace unless it declares otherwise, and existing manifests remain valid entries unchanged [s1]. What it adds is a `@context` seam, so an entry MAY draw terms from additional namespaces without any change to the specification [s1]. The New Stack reports the query side: a REST interface whose required `POST /search` endpoint searches by task, plus optional endpoints for browsing available resources [s2].

## What the specification leaves open on purpose

The interesting half is what nobody standardised. The spec leaves open which namespaces beyond the default are recognised, and expects that set to grow [s1]; each discovery service sets its own rules for what it returns and which sources it trusts [s2]. Conformance covers the envelope and the search endpoint, and stops where the useful part starts: relevance and trust. Two conforming services can answer one task query with different resources, and both are right. The New Stack judges the DNS comparison insufficient for that reason [s2]. I would go further: the divergence is designed in and has no ceiling, since the vocabulary seam and the trust policy are both left to the participants. So you do not integrate a protocol here. You integrate one discovery service, and its ranking is the dependency.

> [!IMPORTANT]
> `Status: Proposal` at v0.91 is the caveat [s1]. The description layer is cheap to track, since existing manifests stay valid [s1]; `POST /search` and the optional browse endpoints are what a proposal is still free to move [s2].

## Impact on your team

If you publish MCP tools or A2A agents [s1], one move is cheap today and one is not. Cheap: confirm your manifest reads as a JSON-LD node under the default namespace, because v0.91 keeps existing manifests valid unchanged [s1]. Expensive: building a client against `POST /search` [s2] while the document still says Proposal [s1]. I would wait on that. The policy question will not wait, and it is yours whatever the protocol does: when a search returns several capable resources, who picks the one your agent calls? If the answer is the discovery service, name that service and what it trusts now, before it becomes a runtime default nobody chose.
