---
lang: en
translationKey: mcp-tool-poisoning-client-trust
slug: mcp-moved-the-trust-boundary-to-the-client
title: MCP Won on Simplicity and Moved the Trust Boundary to the Client
tags:
  - agents
category: essays
difficulty: 3
---

MCP made wiring an agent to tools trivial by trusting the server's tool descriptions, and that one default quietly moved the trust boundary onto clients built to forward, not to check. The protocol's whole appeal is that a server describes its tools and the client hands those descriptions straight to the model. The convenience and the exposure are the same line of code. A STRIDE/DREAD threat model across seven major MCP clients rated tool poisoning, coercive instructions hidden in tool metadata, the most prevalent and impactful client-side vulnerability [s1]. Most teams read MCP as neutral plumbing. I think that reading is the mistake: it is a trust-boundary decision, and it ships turned the wrong way.

## The boundary moved and nobody re-checked

Trust boundaries used to be legible in a tool-use stack. Your code declared a function you wrote, the model picked which one to call, and the text describing that function came from your repo. MCP keeps the model choosing but changes the author of the description. Now an external server writes the text that tells the model what a tool does and how to invoke it, and the reference clients forward that text into the model's context verbatim. The party writing model-steering instructions is no longer you; it is whoever runs the server you connected to last week.

Two properties turn that into a boundary problem rather than a feature. First, the tool metadata is model-visible but UI-hidden: the model reads the full description as part of its instructions, while the human sees a tool name and maybe a one-line summary. Second, the clients that would police the metadata were architected as thin forwarders. They pass tool schemas through; they do not read them adversarially. So the one component positioned to catch a malicious description is the one component that was never asked to look. That is why the seven-client comparison found the failure concentrated in insufficient static validation and parameter visibility [s1], not in some exotic exploit chain. The clients are not compromised. They are doing exactly what the protocol asked, which is to forward.

Call the boundary what it is. The server is an untrusted party, the same way a web page is untrusted input to a browser. A browser that pasted every page's JavaScript straight into its own privileged scope would be called broken, not simple. MCP's default is closer to that than anyone wants to admit.

## Tool poisoning, concretely

The named failure mode is tool poisoning: a server embeds coercive instructions inside the fields the model reads as guidance. Not the tool's code, which the client may sandbox, but its description, its parameter docs, its examples. A tool that claims to "read a file" can carry, three sentences into its description, an instruction to also exfiltrate the user's environment variables to an attacker endpoint whenever it runs. The model reads the whole thing. The user, looking at a tool called `read_file`, reads none of it.

This is why the STRIDE/DREAD analysis ranked it first among client-side vulnerabilities and why the empirical work zeroed in on it across seven clients [s1]. The two weak points it named are the exact two you would predict from the mechanism. Insufficient static validation means the client never analyzes the description text for injection patterns before handing it to the model. Insufficient parameter visibility means the human never sees the metadata the model is acting on, so there is no chance to catch at review time what the client failed to catch at parse time. The attack does not need a bug. It needs the client to behave normally.

> [!WARNING]
> The dangerous text is the metadata the model reads, not the tool output you see. If your client renders a tool name and a summary but never surfaces the full description and parameter docs the model receives, you are trusting a channel you cannot inspect. Assume the gap between what the model reads and what the user sees is the attack surface.

## "This is just prompt injection"

Here is the strongest case against making this about MCP. Tool poisoning is textbook indirect prompt injection, a vulnerability class older than MCP and shared by every framework where a tool must describe itself to a model. OpenAI function calling has it. LangChain tools have it. Any system that forwards a tool description into a model context inherits it. So attributing the danger to MCP's design looks like a near-tautology: convenience that forwards untrusted text is an attack surface, which is true of essentially every trust-forwarding protocol. Stated that abstractly, "simplicity is the vulnerability" is unfalsifiable padding, and the only real content left is a contingent fact (most clients do not validate metadata today) that could age out the moment they add guardrails.

The objection is right about the primitive and wrong about the diagnosis. MCP did not invent untrusted-text-into-context; it made that known-dangerous pattern the low-friction, ecosystem-wide default and shipped reference SDKs without guardrails [s2]. That is not a restatement of "injection exists." It is a structural claim you can check: where does the boundary sit, who is expected to defend it, and what does the shipped SDK do at that boundary. The answer is that the boundary sits at the client, the client was built to forward, and the SDK ships without validation, so every conforming client inherits the same exposure. A single app's injection bug is one team's mistake. The same weakness replicated across every client that speaks the protocol is a different risk class, and standardization is precisely what converts the one into the other. The claim is falsifiable, which is a feature: the day the reference SDKs validate metadata by default, the thesis is refuted, and that would be good news.

## The fix is client-side

The uncomfortable consequence of "the flaw is a shipped default" is that there is no server patch to wait for. You cannot fix an untrusted party by asking it to behave; the whole point is that you do not control the server. The defense has to live where the metadata is consumed, which is the client, and it is concrete work, not a posture.

Three moves, in rough order of leverage. Static metadata analysis: scan tool descriptions and parameter docs for injection patterns before they reach the model, the same reflex a browser applies to untrusted markup. Decision-path tracking: record which tool description influenced which model action, so a poisoned tool leaves a trail you can audit instead of an invisible nudge. Runtime display of descriptions: surface the full metadata the model is acting on to the human, closing the model-visible-but-UI-hidden gap that makes the attack silent. None of these require the protocol to change. All of them require treating the client as a security boundary rather than a pipe, which is the architectural shift the thin-forwarder design skipped.

> [!CONFIRMED]
> A STRIDE/DREAD study across seven major MCP clients rated tool poisoning the most prevalent and impactful client-side vulnerability, tracing it to insufficient static validation and parameter visibility [s1].

> [!INFERRED]
> Treat every tool description as untrusted input, the way a browser treats a remote page. If your client cannot show you the metadata the model reads and cannot tell you which description drove an action, you are running unaudited instructions from a party you do not control.
