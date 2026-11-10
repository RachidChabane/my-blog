---
translationKey: claude-fable-5-2-harness-history-edit-400-prefix-check
lang: en
slug: claude-fable-5-2-harness-history-edit-400-prefix-check
title: Claude Fable 5.2 returns a 400 when a harness edits what precedes a thinking
  block, and Anthropic's release notes apply the check to every account
publishDate: 10-11-2026
kind: release
tags:
- Claude
- Claude Fable 5.2
- OpenClaw
- agents
summary: 'Anthropic''s release notes dated November 9, 2026 say Claude Fable 5.2 enforces
  the prefix check for every account, whatever its age, so a harness that edits what
  precedes a thinking block gets a 400. OpenClaw pull request 196459 captures a direct
  route that sends drop_block with no 400 in 13 requests while thinking blocks are
  dropped server-side. My call: force the error on every route you ship before you
  change the model id.'
sources:
- label: Anthropic, Claude Platform release notes, November 9, 2026
  url: https://platform.claude.com/docs/en/release-notes/overview.md
  date: 09-11-2026
- label: vercel-labs/fx issue 1798, Claude Fable 5.2 sessions die with a thinking
    signature 400
  url: https://github.com/vercel-labs/fx/issues/1798
  date: 09-11-2026
- label: taigrr/fantasy pull request 7, drop thinking blocks on prefix mismatch
  url: https://github.com/taigrr/fantasy/pull/7
  date: 10-11-2026
- label: OpenClaw pull request 196459, new Claude models lose reasoning and hit 400s
  url: https://github.com/openclaw/openclaw/pull/196459
  date: 10-11-2026
- label: taigrr/crush pull request 91, drop stale thinking blocks when tools change
  url: https://github.com/taigrr/crush/pull/91
  date: 10-11-2026
contentHash: sha256:cfc4920a8624bc59
publishState: published
---

## What changed

Anthropic's release notes dated November 9, 2026 say Claude Fable 5.2 and Claude Mythos 5.2 enforce the prefix check for every account, whatever its age, where Claude Fable 5.1 returns the error by default on accounts created on or after August 31, 2026 [s1]. Per those notes, code that edits the `system` prompt, `tools`, or an earlier message and then sends back a 5.2 thinking block from a later turn gets a 400 [s1].

## Zero 400s proves little

I think the 400 is the failure you want, because the fixes around it can hide the edit. The trigger is ordinary: in vercel-labs/fx issue 1798, fx inserts a user message into the previous turn, after the tool result, and every later prompt fails [s2]. Over ACP, fx sends only `HTTP error` with a `stopReason` of refused, which clients show as a model refusal [s2]. The fx report adds that `anthropic/claude-opus-5.5` accepts the same history [s2]. In my reading, a clean run on the outgoing model says little: an account older than that cutoff can pass on Fable 5.1 and meet its first 400 at the switch, a sequence none of these reports shows.

Pull request 7 on taigrr/fantasy sets `thinking.block_binding.prefix_mismatch_behavior` to `drop_block` on every adaptive request, and says the API then drops the failing block and every later thinking block [s3]. OpenClaw pull request 196459 shows how that reads from outside, in captures of one OpenClaw session per run, each switching models [s4]:

| OpenClaw run | HTTP 400 | `prefix_binding_mismatch` | `model_binding_mismatch` | Thinking blocks |
| :--- | ---: | ---: | ---: | :--- |
| Before the patch, custom base URL | 7 / 18 | not listed | not listed | never retained, every 400 retried without thinking [s4] |
| Before, direct, forced to `"error"` | 1 / 15 | not listed | not listed | lost after the Fable 5.1 switch [s4] |
| Before, direct, sending `drop_block` | 0 / 13 | 2 | 2 | dropped server-side [s4] |
| After, direct, sending `drop_block` | 0 / 14 | 0 | 0 | retained [s4] |

In my reading, the last two rows carry the point: both show zero 400s, so the status code cannot tell the run that dropped blocks from the one that kept them.

## The objection

The strongest objection: a session where every later prompt fails is worse than one that lost some reasoning. I agree for a version already in production. I would still judge it by `input_transformations`: OpenClaw pull request 196459 reports `[]` on every request in every patched run [s4].

## Impact on your team

If your harness builds the `messages` array itself, my call is to test every route you ship before you change the model id to `claude-fable-5-2`: OpenClaw ties its 400s to sessions through a proxy or custom Anthropic base URL [s4]. Force `prefix_mismatch_behavior` to `"error"`, as OpenClaw's strict runs do [s4], with the `thinking-binding-controls-2026-08-01` beta value the fx error names [s2]. Make a turn think after a tool call: fx says the final reply only gets a signed thinking block when Claude chose to think, so the failure looks random [s2]. Start with the edits these reports found: a user message inserted into an earlier turn in fx [s2], a `tools` array that is not stable within a session in taigrr/crush pull request 91 [s5]. If `drop_block` stays in production, I would alert on any `prefix_binding_mismatch`.
