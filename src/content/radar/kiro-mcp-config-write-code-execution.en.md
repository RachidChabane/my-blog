---
translationKey: kiro-mcp-config-write-rce-approval-bypass
lang: en
slug: kiro-mcp-config-write-code-execution
title: A poisoned web page rewrote Kiro's MCP config and ran code past the approval
  prompt
publishDate: 27-07-2026
kind: security
tags:
- Kiro
- AWS
- MCP
- prompt injection
- agent security
summary: 'Kodem Security and Intezer disclosed on 19 July 2026 a prompt-injection
  chain in Kiro, AWS''s agentic IDE: a fetched web page makes the agent write an attacker''s
  server into ~/.kiro/settings/mcp.json, which Kiro reloads and starts. Kodem''s timeline
  puts the AWS fix at 3 April 2026 and the CVE-2026-10591 assignment at 22 July, so
  what is fresh here is the published chain and the lesson about which agent writes
  deserve a gate.'
sources:
- label: Primary - Kodem Security with Intezer, disclosure writeup on the Kiro MCP
    configuration chain
  url: https://www.kodemsecurity.com/resources/aws-kiro-agentic-ide-rce-prompt-injection-mcp-config-vulnerability
  date: 19-07-2026
- label: Independent corroboration - The Hacker News, reported coverage of the Kiro
    disclosure
  url: https://thehackernews.com/2026/07/aws-kiro-flaw-let-poisoned-web-page.html
  date: 21-07-2026
contentHash: sha256:149bb03cf8cbfe93
publishState: published
---

## What changed

Kodem Security, in research with Intezer, published on 19 July 2026 a prompt-injection chain against Kiro, AWS's agentic coding IDE. Hidden instructions on a page the user asks Kiro to fetch push the agent to write an attacker-controlled server entry into `~/.kiro/settings/mcp.json`; Kiro reloads that configuration automatically and starts the server it describes, so the attacker's code runs with the developer's privileges and no approval step is ever offered. The Hacker News, covering the research on 21 July 2026, reports that AWS has patched the issue and that it is tracked as CVE-2026-10591. Kodem's timeline puts the fix months back: a HackerOne ticket on 11 February 2026, AWS confirming fixes deployed on 3 April 2026, and Amazon assigning the CVE number on 22 July.

## The approval prompt fired on the wrong action

Kiro did ask permission, and the user did grant it, because the thing it asked about was the URL fetch they had just requested. The step that carried the payload was a file write. Writing `~/.kiro/settings/mcp.json` writes an execution path.

Kodem puts it plainly: the contents of that file are commands that run on the host with the user's privileges. The Hacker News describes the same file as Kiro's list of Model Context Protocol servers together with the exact command used to start each one.

```text
~/.kiro/settings/mcp.json
  <server name> -> <command Kiro runs to start it>
```

> [!WARNING]
> Classify an agent's writable paths by what reads them, never by extension. Any path a runtime reloads and executes is a shell tool wearing a config-file name, and it belongs behind the same gate as the shell tool. MCP config, editor tasks, hooks, shell rc files.

## Two version numbers that do not agree

Kodem records v0.11.130 as the build it confirmed fixed. The Hacker News reports AWS as saying everything before 0.11.34 is affected. Those are different numbers, and no public source reconciles them.

## Impact on your team

If your developers run Kiro, take the higher bound, check installed builds against v0.11.130 today, and treat the gap between the two figures as unresolved. If you ship an agent of your own, list every path it can write without a second prompt and name the process that reads each one back. Anything that answers "a runtime, automatically" is an execution primitive you have been treating as storage.
