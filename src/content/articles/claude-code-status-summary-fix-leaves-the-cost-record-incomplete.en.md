---
translationKey: claude-code-agent-summary-side-calls-escape-transcript-cost-accounting
lang: en
slug: claude-code-status-summary-fix-leaves-the-cost-record-incomplete
title: Claude Code's status-summary fix leaves the cost record on disk incomplete
publishDate: 02-11-2026
tags:
- agentic-coding
- agents
category: essays
difficulty: 4
sources:
- label: Flamerix AI gist, Claude Code agent_summary timer (what the call is for)
  url: https://gist.github.com/flamerix-ai/c3905705cc4205e5de3011fa2e74efce
  date: 26-10-2026
- label: Hacker News, the gist authors post their weekly measurement (share of spend)
  url: https://news.ycombinator.com/item?id=50284255
  date: 29-10-2026
- label: claude-code issue 86879, opening measurement from captured raw payloads (method)
  url: https://github.com/anthropics/claude-code/issues/86879
  date: 15-08-2026
- label: claude-code issue 104358, per-request usage missing from disk (problem)
  url: https://github.com/anthropics/claude-code/issues/104358
  date: 22-10-2026
- label: Hacker News, reply from a Claude Code team member (fleet share)
  url: https://news.ycombinator.com/item?id=50284699
  date: 29-10-2026
contentHash: sha256:745e7d56267ed72e
publishState: published
---


I think Claude Code's status-summary fix lowers a price and leaves the ledger on disk incomplete, because the transcripts cost tools read never record those calls. The issue that opened the complaint says each agent_summary call re-sends a subagent's entire conversation history plus the full tool schema, every 30 seconds per active subagent [s26], and that these calls carry `skipTranscript: true`, so they appear in no transcript [s31]. A second issue, 104358, lists agent_summary among several request types that are billed but leave no row on disk [s19]. It reports that in sub-agent-heavy sessions a transcript-based sum lands 1.35 to 2.13 times below Claude Code's own cost-state [s29], whose internal accounting is correct [s30]. None of these sources says how much of that gap belongs to agent_summary. In my reading, a cost report rebuilt from transcripts undercounts by construction.

## The calls the transcript cannot see

I think the dispute over what this call is for matters less than where its cost gets written down. Flamerix AI [s43] says Claude Code sends a working background agent's entire transcript to the agent's own model, usually Opus [s27], and that the answer only updates the agent's status line in the agents panel and never reaches the model or the conversation [s1]. A self-identified Claude Code team member [s39] says the call applies only to background agents that are actively working, which get a summary call about every 30 seconds [s21], and that the summaries let both the user and Claude Code track what each agent is working on [s40].

In my reading, the defect sits in what Claude Code writes to disk, and this call is only its most visible case. The opening report's `skipTranscript: true` [s31] explains why one request type goes missing. Issue 104358 widens the frame. It states that nothing Claude Code writes to disk lets a tool reconstruct what a session cost [s18], and it lists requests with querySource `agent_summary`, `auto_mode` (both classifier stages), `compact`, `away_summary`, `generate_session_title`, `extract_memories`, `prompt_suggestion` and others as billed but appearing neither as assistant rows nor as api-request rows [s19]. The accurate internal accounting mentioned above shows that the correct number is already inside the process. It simply never reaches the files.

In my reading, the correct number was found by a route that never touches those files. The Hacker News post that linked the gist says its authors' DRIM system flagged the anomaly [s42]. The gist names the same DRIM as the detector, working on Claude Code's OpenTelemetry export, where grouping `claude_code.api_request` events by `query_source` showed agent_summary costing more than the main conversation itself [s3]. The gist also restates the disk side: these requests are not written to the session logs on disk [s7]. In my reading, a harness charges for a surface wider than its conversation. Cost tools read the conversation.

## Every share is right for someone

I think every share in this thread is right for the workload that produced it, which is why a mean over all users tells a team little. The figures disagree because each one counts a different population against a different denominator, so the table keeps every share beside the thing it divides.

| Who measured | Scope | Share | Of what |
| :--- | :--- | ---: | :--- |
| Flamerix AI [s41] | One measured week | 16.4% (main conversation 15.7%) | Total estimated spend |
| Flamerix AI [s4] | Same week | 19.7% | All API requests |
| Opening report [s44] [s8] | One 4-hour session, 27 subagents, 1,496 requests | 22.7% [s9] | All API requests |
| Second measurement [s11] | One session | 26% | Cache-read tokens |
| Issue commenter [s32] | 30 days, 129 sessions with background agents | about 14% / about 10%, up to 24% | Requests / estimated spend |
| Claude Code team member [s20] | Users who send telemetry, last week | about 2% (about 6% in the terminal) | Cost at API list prices |
| Hacker News reader [s24] | Own sessions | about 8% at most | Not stated |

The low end comes from the widest population. The team member speaks for every user who sends telemetry, and puts the terminal, where nearly all of these calls happen, at about 6% of cost [s20]. A Hacker News reader found that it applies just to subagents, with workflows apparently unaffected [s23], and guesses that many new users prefer workflows, so the impact is less than the report suggested [s45]. That reading of an atypical workload is the reader's, and it is a fair one.

The high end comes from heavy users, and it carries its own caveat. Flamerix's spend figure is Claude Code's own per-request estimate, and on a subscription what goes is rate-limit headroom [s5]. The commenter with the 30-day numbers reports that Opus subagents accounted for about 90% of their share [s33]. I think both ends are right. The useful question is which row your team resembles, and in my reading a team that fans out to many Agent-tool subagents should assume the upper rows until it has counted.

## What sets a team's share

I think a team's share is set by how it fans out work, and the sources name the dials: how many agents run, how often their transcripts change, and how large their contexts grow. The opening report says cost scales with fan-out and wall-clock duration, so a session with three concurrent long-running subagents pays six of these calls per minute [s10]. A commenter reading a debug log reports that the timer skips ticks while the transcript is static [s37], so the cost tracks how often the agent's transcript changes [s38]. The price of each tick comes from the second measurement: the cost per tick is the agent's current context size, so a 380k-context agent pays about 45 M cache-read tokens per hour just for its spinner line [s12]. Multiply those dials together and the spread in the table stops looking like a disagreement.

In my reading, the cheapest dial is the kind of agent a team uses. The commenter with the 30-day numbers [s32] reports that only Agent-tool subagents get the timer, and that in one session 1,802 workflow-agent requests came with no summary timers for those agents [s17]. The same commenter adds that moving big scripted fan-outs into workflows avoids the cost and keeps forks [s34]. That is an architecture decision with a cost line attached, and most teams make it for other reasons.

> [!CONFIRMED]
> Two parties report that workflow agents escape the timer: an issue commenter counted 1,802 workflow-agent requests with no summary timers [s17], and a Hacker News reader found workflows apparently unaffected [s23].

> [!INFERRED]
> I treat any cost report rebuilt from the files on disk as a lower bound, and in my reading its error grows with the Agent-tool fan-out a team runs and with how often those agents change their transcripts.

## The fix prices the call and leaves the ledger

I think the vendor answered the complaint it received, which was about price, and left the record where it was. The team member says they just rolled out a fix for the most expensive case, summaries that miss the prompt cache [s22]. The team is also working on a much cheaper mode that sends short notes to a smaller model in place of the full transcript [s28]. Flamerix reports that about 98% of these calls re-read the transcript from cache, and that the roughly 2% that hit a cold cache carry over a third of the call's cost [s6]. In my reading, the fix aims at that third.

Both changes act on what one call costs. Yet the list in 104358 [s19] still names auto_mode, compact, generate_session_title and extract_memories as billed with no row on disk, and neither change touches that list. In my reading, agent_summary drew attention because in some workloads it was large. I think the cheaper mode will quiet the one side call big enough to notice and leave the rest of that list unrecorded, so the alarm can fade before the record is fixed. A release that writes those query sources to disk would prove me wrong. That is the forecast I would bet on.

## Count the calls before trusting a switch

In my experience, a switch reported to work on one machine is a claim about that machine. Flamerix AI [s43] says no setting turns the call off and that it has been on by default since 2.1.232 [s2]. The commenter with the 30-day numbers reports that on macOS `CLAUDE_CODE_FORK_SUBAGENT=0` still stops summaries on 2.1.312 [s13], and says the difference may come from the platform or from server-side flags, a cause they had not found [s14]. A Linux commenter reports that the same variable does not stop agent_summary on 2.1.312 [s15]. On that machine, stock produced 5 summary calls about 32 s apart, `FORK_SUBAGENT=0` also produced 5, and the Bun preload produced 0 [s16]. A commenter who read the bundles reports that the fork switch stops summaries only in an interactive session where nothing has set the flag [s35], and calls a settings entry for the variable, in any scope, the most likely cause of the Linux failure [s36].

So I trust none of these switches until a count confirms them: I group billed requests by `query_source`, as Flamerix did, or count summary calls in a debug log, as the Linux commenter did.

> [!CAUTION]
> A switch you set is a hypothesis until a request count confirms it. Count the summary calls before the change and after it, on the machine and in the session mode you actually run.

## The case against

The strongest case against me has five parts, and I credit each of them. The export already records these calls by query_source [s3]. The population figure, about 2% of cost at API list prices [s20], is the honest one, and a reader saw about 8% at most [s24]. The user figures are Claude Code's own estimates [s5]. Claude Code's internal accounting is correct [s30]. And the team is working on a much cheaper mode [s28], which could make the call negligible.

My answer is narrower than a rebuttal. I use the export myself, and I check it against cost-state. Some of these points concern the size of one call or the honesty of one estimate; the others locate the correct number inside the process and in an export. None of them puts the missing rows on disk, and the files a team's tooling reads still do not carry that number.

I budget agents from billed requests and read every disk-built total as the floor.
