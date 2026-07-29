---
translationKey: mcp-stateless-header-routing-2026-07
lang: en
slug: mcp-stateless-core-header-routing
title: MCP went stateless for a problem most of us never had
publishDate: 29-07-2026
tags:
- agents
- agentic-coding
category: essays
difficulty: 4
sources:
- label: Model Context Protocol blog, the stateless protocol core
  url: https://blog.modelcontextprotocol.io/posts/2026-07-28/
  date: 28-07-2026
- label: The Register, Craig McLuckie of Stacklok on why MCP was stateful
  url: https://www.theregister.com/devops/2026/07/23/model-context-protocol-prepares-to-break-with-its-stateful-past/5276722
  date: 23-07-2026
contentHash: sha256:845ea4bc41616fcd
publishState: published
---


MCP's stateless rewrite is a retrofit, and the migration bill lands on the operators who never had the problem it solves. The specification states the change without hedging: the highlight of the release is a stateless protocol core, MCP transforming from a bidirectional stateful protocol into a request/response stateless protocol [s1]. Session affinity, connection pinning, sticky routing behind a load balancer: those are the costs statelessness relieves, and every one of them belongs to remote, multi-tenant, gateway-fronted deployments. So the question worth asking is not whether the new core is cleaner. It is who was paying the pain that justifies rewriting the old one.

## Who actually had the session problem

Statefulness in MCP was never a design error somebody is now correcting. Craig McLuckie of Stacklok, speaking to The Register, gives the origin story plainly: the stateful nature of MCP was a by-product of its origin as a way to support developers using coding tools that tend to run locally [s4]. Hold that next to the release note [s1] and the shape of the move is visible. A protocol took its form from one deployment model, and it is now being reshaped for a different one.

In my experience most MCP servers still run on a laptop a few centimetres from the agent calling them, one client, one process, no proxy anywhere in the picture. Those servers have no session problem to solve. A stdio server that lives and dies with its client cannot suffer connection pinning; there is no second replica for a request to land on. Statelessness buys them nothing they lacked, and I think that asymmetry is the whole story of this release: the property being added is worth real money to the fraction of deployments sitting behind a gateway, and worth nothing at all to the majority who will still have to do the work.

That is my reading of who deploys MCP today, not a measurement, and it is the premise a critic should attack first. But notice that the specification's own account of the origin points the same way. The session machinery being deprecated exists because of local tooling [s4]. The people most likely to still be running that machinery are, by construction, the local tooling crowd.

## The header move is the real change

Skip the scaling narrative. The part of this release an engineer should read twice is the routing mechanism: method and tool names travel in the `Mcp-Method` and `Mcp-Name` HTTP headers, so gateways can route and authorize on headers directly [s2].

Read as an operations note, that is dull. One fewer JSON parse on the hot path, a routing key an L7 proxy can match without a Lua filter or a WASM plugin. Read as a security note, it is the largest thing in the document. A gateway can now allowlist per tool with a header match, no body inspection at all:

```
if ($http_mcp_name !~ "^(search_docs|read_file)$") { return 403; }
```

Two lines of proxy config, and the edge is now the authorization point for tool invocation. I would call that an authorization change wearing a performance costume. The specification does not frame it that way; that framing is mine.

## The failure mode nobody names

Promoting the edge to the authorization point duplicates tool identity into two places: the header the gateway reads, and the JSON-RPC body the server executes.

> [!CONFIRMED]
> Method and tool names travel in the `Mcp-Method` and `Mcp-Name` HTTP headers, so gateways can route and authorize on headers directly [s2].

> [!INFERRED]
> Nothing in a header obliges the body underneath it to agree. An edge allowlist that trusts `Mcp-Name` while the server dispatches on the body is a bypass, in my reading, and it is the variety that survives every test written by someone who assumed the two always match.

The honest version of this claim is conditional, and I want to state the condition rather than assert the vulnerability. Header-based authorization is sound only if the server, on dispatch, rejects any request whose headers disagree with its body. Whether that holds is a question about implementations, not about my opinion of them, and it is cheap to answer for the stack in front of you. Send a request through your gateway allowlist with `Mcp-Name` naming a permitted tool and a body invoking a denied one, then watch which one executes. If the denied tool runs, the allowlist is decoration. If the server returns an error on the mismatch, the design holds and you have the receipt.

That test is what keeps this out of the drawer marked "generic proxy advice". Yes, the family is old: verb tampering, `X-Forwarded-For` trust, path-versus-payload splits in gRPC. The family being old is what makes the finding credible rather than speculative. What is new is the specific placement, because this release plants the pattern at exactly the point where every remote MCP deployment is going to put a gateway.

## The strongest case against this

Statelessness is table stakes for anything that runs behind a load balancer, the direction of travel for MCP is obviously remote and multi-tenant, and a protocol that cannot horizontally scale is a protocol with a ceiling. Complaining that the local-first crowd pays for a property they do not need is complaining that a protocol grew up. And the transition is not being rushed: the bidirectional stateful protocol this release moves away from [s1] is not switched off on announcement day. They still work, and they will keep working for at least twelve months [s3].

That runway is real, and it forecloses the version of my argument that claims something breaks today. Nothing breaks today.

My answer is that the window was never the cost. A grace period converts an emergency into scheduled work; it does not delete the work. What is scheduled is a rewrite of servers that function correctly right now, undertaken by teams whose deployment shape never generated the requirement, in exchange for an operational property their single process already had for free. Add to that the duty inherited at the edge: anyone who adopts header routing takes on the cross-check obligation described above, permanently, in a component that did not previously make authorization decisions at all. That is the bill. It is payable over a year, and it is still payable by the wrong people.

## What I would actually do

Do not migrate on the scaling argument alone. If your servers run local, or single-instance behind nothing, the stateless core is a change in your dependency, not a change in your architecture; schedule it as maintenance and spend the attention elsewhere.

If you do run a gateway, take the header routing. It is genuinely good: cheaper routing, coarse tool-level policy at the edge, no body parsing in the proxy. Then close the loop server side. The rule I would write down is narrow enough to enforce in review: never let a component authorize on a field it is not also the one to execute. The gateway may filter on `Mcp-Name`, but the server must re-derive the same decision from the body it is about to run, and reject the request outright when the two disagree.

> [!WARNING]
> A gateway allowlist keyed on `Mcp-Name` is only an allowlist if the server rejects a request whose headers contradict its JSON-RPC body. Until you have tested that mismatch against your own server, treat the edge rule as routing, never as authorization.

Treat the twelve months [s3] as a planning input rather than a spec diff to apply this quarter. The clock is long enough that the correct move is to spend the first part of it on the question the release does not answer for you, which is what your own dispatch path does when the header and the body tell it two different things.
