---
translationKey: reasoning-effort-switches-and-tool-edits-break-the-agent-prefix-cache
lang: en
slug: reasoning-effort-sits-in-the-wrong-place-for-escalation
title: Reasoning effort sits in the wrong place for escalation
publishDate: 01-11-2026
tags:
- agents
- agentic-coding
category: essays
difficulty: 4
sources:
- label: Neuralwatt, Why harnesses matter for energy efficiency (cause of breaks)
  url: https://neuralwatt.com/news/why-harnesses-matter-for-energy-efficiency
  date: 16-10-2026
- label: OpenCodex issue 6895, keep the Anthropic prompt cache across reasoning effort
    changes (goal)
  url: https://github.com/lidge-jun/opencodex/issues/6895
  date: 10-10-2026
- label: 'Manus, Context Engineering for AI Agents: Lessons from Building Manus (single-token
    difference)'
  url: https://manus.im/blog/Context-Engineering-for-AI-Agents-Lessons-from-Building-Manus
  date: 18-07-2025
contentHash: sha256:54b89ec8d73134c0
publishState: published
---


I think escalating reasoning effort mid-session is a placement bug, because the effort setting sits ahead of the history it is meant to govern. Neuralwatt [s14] reports that the GLM-5.3 and DeepSeek V4.1 chat templates write the effort level in the first few tokens of the prompt [s2], and that the first difference was at token 8 on both models, so a switch re-reads everything [s3]. An OpenCodex issue reports a matching symptom on an adaptive-thinking Claude model reached through the Anthropic adapter [s26]: cache reads stop at the first user message, and everything after it is written again on each effort change [s18]. In my reading, an escalation after a failed attempt is billed for the conversation again on both routes. The usual advice, fix the effort for the session, gives up the escalation adaptive effort exists for, and I think the fix belongs in the template and the API.

## The effort line sits ahead of the history

I read the two reports as two mechanisms with one bill. On the open-weight templates the effort value is a line near the front of the prompt; on the second route it is a top-level setting that, per the issue, a provider rule ties to the messages cache.

Only that one value changes, Neuralwatt [s14] reports, and its length and everything after it stay identical [s35]. In my reading, the server recomputes a conversation whose bytes did not change past the effort value.

The OpenCodex issue says OpenCodex does not touch the prefix and attributes the miss to an upstream rule: a change of the top-level effort invalidates the messages cache [s17]. The same issue adds that the wire bodies were not retained, so the exact cause was not proven by byte comparison [s21].

Neuralwatt reports that every cache break in its lab tests came from a harness editing what it had already sent, forcing a re-read from the first difference onward [s1]. Manus wrote the general rule earlier: even a single-token difference can invalidate the cache from that token onward [s22].

The rule is old. What changes the bill, in my reading, is which value sits at the front of the prompt and who owns it.

## Escalation lands where re-reads cost most

The escalation the OpenCodex issue names follows a failed attempt [s26], which in my experience means deep in a session.

By Neuralwatt's count [s14], changing the tool list or the effort level makes a cache break more than 20 times as likely and costs, on average, about 40% of the previous prompt [s4].

Past 128k tokens of context, about 3 turns in every 1,000 re-read more than half of the prompt from scratch [s9]. A normal turn at that depth adds a median of about 370 new tokens, so a single one of these costs as much prefill as roughly 600 ordinary turns [s10]. I read that figure as the price of any deep re-read, whatever caused it. Neuralwatt's depth rule is blunt: changing the beginning of the prompt once, early on, costs little, and doing it at turn 200 of a long session brings a large, visible pause and a large energy cost [s34].

Neuralwatt also reports that a mostly uncached request takes roughly twice the energy of a cached one of the same size [s11].

In my reading, on the two templates that write effort up front, every effort switch touches the beginning of the prompt, so a late escalation pays the late-change price Neuralwatt describes. The knob is cheap only when nobody needs it.

## A fixed effort gives up the escalation

Neuralwatt's advice to people who use a harness [s14] is to pick a reasoning effort per session [s29] and to settle settings like effort, MCP servers and skills before the session gets long, which it says is when a cache break hurts most [s30].

The OpenCodex issue keeps effort fixed for the whole conversation for now [s19]. Its other two workarounds each cost something else: starting a new thread on escalation loses context and writes the whole prompt again [s40], and stripping replayed reasoning keeps the cache and drops thinking continuity [s20].

Its stated goal is to change effort mid-conversation without paying a cache write for the whole conversation history again [s16]. I read the fixed effort as a stopgap the issue itself wants to retire. I think fixing effort removes the reason adaptive effort exists.

## The append rule stops short of effort

Neuralwatt already gives harness builders the rule [s14]: add new messages and tool results at the end of the conversation, and describe changes to settings there too, leaving the earlier text untouched [s43]. In its lab capture, every one of deepseek-harness's follow-up requests was a pure append to the previous one [s32]. That harness puts changing state after the history: when the approval policy or skills change, it appends a short snapshot saying it supersedes earlier ones [s42].

On the two templates Neuralwatt measured, the template itself writes the effort line [s2][s3]. In my reading, the builder rule cannot reach a line the harness does not own, which is why Neuralwatt's advice to users falls back to a fixed effort.

The OpenCodex issue proposes keeping the cached prefix across mid-conversation effort changes on models that support Anthropic's per-message effort [s38]. It would re-insert every earlier change point at the same position on later requests so the prefix stays byte-identical [s39]. It has not yet measured whether the tools and system blocks stay cached on the effort-changing turn, since the experiment had no tools [s41].

> [!CONFIRMED]
> Neuralwatt [s14] tells harness builders to write setting changes at the end of the conversation [s43]. The OpenCodex issue proposes Anthropic's per-message effort to keep the cached prefix [s38].

> [!INFERRED]
> I think an effort change belongs in the transcript, appended at the turn where it takes effect, like any other change of state. A template that renders effort near its first token is the default I would change, because a harness cannot move that line.

## Until then, price it per stack

Until a template offers that slot and the OpenCodex proposal is measured with tools in the loop, I think an escalation has a price, and the price depends on the stack.

Switching effort back hit 10.6k to 27.5k cached tokens in Neuralwatt's runs [s14], so a toggle costs one full re-read the first time each new state is used [s28].

On the Claude path the OpenCodex issue measured [s26], each effort change writes everything after the first user message again, where the roughly 11.6k cached tokens stop [s18].

Side by side, the two reports price an effort change like this:

| | Open-weight templates, Neuralwatt lab [s14] | Claude through the Anthropic adapter, OpenCodex issue [s26] |
| :--- | :--- | :--- |
| Where effort lands | In the first few tokens [s2]; first difference at token 8 [s3] | A top-level setting; reads stop at the first user message [s18] |
| Price of a toggle | One full re-read the first time each new state is used [s28] | History after the first user message written again on each change [s18] |
| Cause | A harness edit in every lab break [s1] | An upstream rule [s17], unproven by byte comparison [s21] |
| Open question | Server-side reuse after a small early edit, still research [s31] | Tools and system blocks on the changing turn, still unmeasured [s41] |

On a stack like Neuralwatt's, a two-level policy (base effort, one escalation) pays one re-read per new level, so I would allow the return to base freely. On the second route every change pays, so I would count each one against the session and escalate once, and only after a failure. The open items the issue lists bound that second rule.

```python
from enum import Enum


class EffortCache(Enum):
    KEEPS_EARLIER_PREFIXES = "keeps-earlier-prefixes"
    REWRITES_ON_EVERY_CHANGE = "rewrites-on-every-change"


def effort_change_rereads_history(
    stack: EffortCache, levels_used: frozenset[str], new_level: str
) -> bool:
    if stack is EffortCache.REWRITES_ON_EVERY_CHANGE:
        return True
    return new_level not in levels_used
```

The function is the budget rule I would put in a harness before it raises effort.

## Tool lists are the same edit

I think a tool list deserves the same price, since it is the second piece of state that sits near the front.

In Neuralwatt's data [s14], OpenCode 1.x and Kilo Code insert new tools in alphabetical order, in the middle of the tool list [s6], while OpenCode 2.x leaves the tool list alone and appends a note, so connecting and disconnecting were pure appends [s7]. By its count, tool-list changes happen on about 0.5% of turns and account for 19% of all re-read tokens on these models [s5]; three accounts make up about two thirds of that share, and Neuralwatt says the per-turn effect holds across everyone else [s27].

Manus states a rule from its experiments: unless absolutely necessary, avoid dynamically adding or removing tools mid-iteration [s23]. In most LLMs, Manus explains, tool definitions live near the front of the context, so any change invalidates the KV-cache for what follows [s24]. Manus manages tool availability with a context-aware state machine and masks the token logits during decoding [s25].

In my reading, OpenCode 2.x appends a note and Manus masks at decoding, and both keep the front of the prompt fixed, the move effort still lacks.

> [!TIP]
> Pruning is an edit as well. Neuralwatt [s14] reports that omp prunes "uneventful" tool results and, after 90 minutes idle, prunes at any depth; setting `compaction.supersedeReads: false` and `compaction.dropUseless: false` keeps the cache [s8].

## The case against

The strongest objection is scale. Neuralwatt [s14] reports that the remaining three quarters of re-read tokens come on turns where neither the effort nor the tool count changed [s33]. It cannot always tell from the server side whether a harness edited the prompt or the cache was evicted under memory pressure [s13]. It adds that OpenCode 2.x fixes most of the 1.x cache breaks it found in the lab, yet that difference does not show up in production, for reasons it does not yet know [s12].

The second objection clears the template. Neuralwatt also reports that none of its lab breaks came from its chat templates [s44]. On the other route, the OpenCodex cause is itself unproven [s21].

Then there is the stake. Neuralwatt bills on measured energy, so it sees the cost directly [s36], and Session Insights in the Neuralwatt dashboard shows each agent session turn by turn [s37]. I read its counts with that stake in mind and keep them.

Neuralwatt wants to research ways for the server to reuse cached work after a small edit near the beginning of the prompt, such as the effort line or the date [s31].

The last objection is mine: a stronger effort after a failure may be worth a re-read, whatever it costs.

I credit the scale objection for aggregate traffic and for short sessions. On template innocence, I think both statements hold at once: the harness makes the change, and the template decides how much of the prompt it costs, which no harness designer can work around. As for the server fix, a harness on a closed API cannot change the provider's server. On quality, I agree, and that is why I price the escalation and keep it. For deep sessions I hold the rule: effort and tool-list changes are breaks a harness chooses to make, and Neuralwatt reports they make a cache break more than 20 times as likely [s4].

So I keep adaptive effort, and I make every escalation show up in the budget before it shows up in the bill.
