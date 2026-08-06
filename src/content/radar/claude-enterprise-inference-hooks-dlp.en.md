---
translationKey: claude-enterprise-inference-hooks-dlp
lang: en
slug: claude-enterprise-inference-hooks-dlp
title: Claude Enterprise sends every governed prompt to your own security server,
  and checks the MCP tool response on the way back
publishDate: 06-08-2026
kind: release
tags:
- Claude
- Anthropic
- MCP
- security
- agents
summary: Anthropic's inference hooks send each prompt, and each tool-call response,
  to an organization's own security server for an allow or deny verdict before Claude
  proceeds. The verdict cannot redact, image-only attachments go uninspected, and
  Claude Platform API, Amazon Bedrock and Google Cloud deployments are out of scope.
sources:
- label: Anthropic announcement blog
  url: https://claude.com/blog/claude-enterprise-inference-hooks
  date: 05-08-2026
- label: Unite.AI cybersecurity desk
  url: https://www.unite.ai/anthropic-puts-inline-data-loss-prevention-inside-claude-enterprise/
  date: 05-08-2026
- label: The Next Web
  url: https://thenextweb.com/news/anthropic-inference-hooks-dlp-claude-enterprise
  date: 05-08-2026
contentHash: sha256:6a870f0b80ff4bdf
publishState: published
---

## What changed

Anthropic announced inference hooks on 5 August 2026, and they govern Claude Enterprise surfaces only [s2]. Turn them on and Claude sends the prompt and its surrounding context to your own security server before the model starts generating, then proceeds only once that server returns allow or deny [s1]. The same check runs on tool calls: a tool's response, including tools connected through MCP, skills and plugins, is checked before it goes back to the model [s1]. The transport is a webhook-based protocol with a published schema, built for the DLP infrastructure you already run [s3].

## The tool response is the new surface

Gating prompts is the proxy your DLP vendor already sells, moved one layer in. The response side is different. An MCP server your agent calls returns text straight into the model's context, and in most stacks I see nothing sits in between, so a policy decision there is new surface. That leaves the envelope, narrow, and drawn by the vendor alone.

| Surface | Governed by a hook today |
| :--- | :--- |
| The prompt, before inference | Yes, the only event at launch [s1][s2] |
| Tool responses through MCP, skills, plugins | Yes [s1] |
| What the model returns | No, a later event [s2] |
| Image-only attachments (a document screenshot) | No, attachments arrive as metadata and extracted text [s2] |
| API access through the Claude Platform, Amazon Bedrock, Google Cloud | No [s2] |

> [!IMPORTANT]
> The verdict is allow or deny; the server cannot rewrite or redact a prompt [s2]. Every rule your DLP team ships today as a redaction becomes a block here, and a block is a refusal the user sees. That work belongs to whoever writes the rules, and it outweighs the connector install.

## Impact on your team

If your compliance story says every Claude interaction is inspected, that sentence is false the moment a team reaches Claude through the Claude Platform API, or runs on Amazon Bedrock or Google Cloud [s2]. Fix the sentence before you buy the feature. If you are in scope, start in shadow mode, which always allows [s3], and count the prompts a redaction rule would turn into denials; that count decides whether your policy survives a binary verdict. Two things I would not defer: a rule for image-only attachments, which pass uninspected today [s2], and an inventory of the MCP servers your agents reach, because a response-side check is worth only what you know about the server answering.
