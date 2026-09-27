---
translationKey: telemetry-off-forks-coding-agent-behaviour
lang: en
slug: telemetry-is-a-behaviour-setting-for-coding-agents
title: A telemetry switch is a behaviour setting for your coding agent
publishDate: 27-09-2026
tags:
- agentic-coding
- agents
category: essays
difficulty: 4
sources:
- label: blog.szypowi.cz, Claude Code reads AGENTS.md only when telemetry is on (summary)
  url: https://blog.szypowi.cz/p/claude-code-reads-agents.md-only-when-telemetry-is-on/
  date: 23-09-2026
- label: anthropics/claude-code issue 95690, independent reproduction in the thread
  url: https://github.com/anthropics/claude-code/issues/95690
  date: 20-09-2026
- label: Anthropic, Claude Code CHANGELOG (AGENTS.md fix entry)
  url: https://raw.githubusercontent.com/anthropics/claude-code/main/CHANGELOG.md
  date: 27-09-2026
- label: Anthropic, Claude Code release notes (telemetry settings notice)
  url: https://github.com/anthropics/claude-code/releases/tag/v2.1.282
  date: 24-09-2026
- label: Anthropic, Claude Code release notes (telemetry-off default mode)
  url: https://github.com/anthropics/claude-code/releases/tag/v2.1.283
  date: 25-09-2026
contentHash: sha256:001ea242bbfac9dd
publishState: published
---


I think a coding agent's telemetry switch is a behaviour setting: in Claude Code it has decided which instructions load and which mode an interactive session starts in. An engineer's write-up found that the AGENTS.md loader sits behind a remote feature flag, so with telemetry or nonessential traffic turned off, a local AGENTS.md is skipped without a warning [s1]. The release notes now start interactive sessions on third-party providers or with telemetry off in auto mode when no permission mode is configured [s8]. I do not need to predict the next coupling to justify two controls: a CI step that fails when a canary word planted in AGENTS.md does not come back, and an explicit permissions.defaultMode in every environment.

## Where AGENTS.md goes missing

The skip hides exactly where it costs most, because the file reads fine on disk and the session looks normal. The write-up traces the mechanism: when Claude Code cannot fetch the flag, the plugin is unavailable and the local file is never read [s2]. In the cases it describes, none print a warning, it adds; the session starts, the model answers without the project instructions, and nothing says that a file was skipped [s3]. A separate report, the one that opened the issue, describes the same symptom on its own setup: there is no error and no warning, and it just does not load [s9].

A model that answers without its project instructions still answers, fluently, and in my experience the first suspects are the prompt and the model. The loader comes last, if anyone looks at it at all.

A commenter in the issue thread widens the list of affected sessions. The commenter reports the skip in the very first session after install and every time feature-flag fetching is disabled (`DISABLE_GROWTHBOOK=1` or nonessential traffic off), which the commenter calls exactly what CI runners do; the file loads fine once the flag is cached locally [s4].

> [!NOTE]
> A runner that starts from a fresh home on every job never has the flag cached, so as I read the thread, the first-session case is every session there.

This is why I want the check to be an assertion about the effective configuration. As I see it, a repository does not fully determine the agent that reads it: the environment, the state cached in the home directory and the provider all feed in. Reviewing AGENTS.md on a laptop checks the wording of the file, and only a run on the runner can show whether its agent read it.

Same repository, different agent.

## What the changelog entry closes

A changelog line tells me which branch the vendor closed, and I treat every branch it does not name as open until my own environment says otherwise. That habit earns its keep here, because the entry is precise about where the loader now works and says nothing about the cases the thread raised.

> [!CONFIRMED]
> The changelog changed AGENTS.md support to also work on Amazon Bedrock, Google Vertex AI, Microsoft Foundry, LLM gateways, and sessions with telemetry disabled [s6].

> [!INFERRED]
> I read that entry as closing the telemetry-disabled branch. It names neither the first session after install nor a runner that blocks flag fetching, so I would not assume either is covered until a check on my own runner says so.

For the telemetry-disabled case, the entry moves the problem into the past tense. I keep the canary for the cases it leaves unnamed, and I would keep it even if the list grew, because a list in a changelog is the vendor's view and my runner is not on it.

## Where telemetry meets the permission mode

The second reach is no defect at all, which is exactly why it is easy to wave through. The release notes changed interactive sessions on third-party providers or with telemetry off to start in auto mode when no permission mode is configured, and permissions.defaultMode still overrides that [s8]. The release notes also added a startup notice, and /status and claude doctor entries, listing telemetry variables in a project's settings files that were ignored or that turned telemetry off [s7].

My reading: put together, a telemetry variable in a project's settings file, where it is honoured, can decide the mode an interactive session starts in when nobody configured one. That makes a line someone added for privacy reasons into a line that changes how the agent behaves in front of a developer. I have no quarrel with auto mode as such; my point is that the input selecting it is a telemetry setting.

Here is how I classify the two couplings; the Kind and Control columns are my reading.

| Coupling | Kind | Where it applies | Control I use |
| :--- | :--- | :--- | :--- |
| AGENTS.md skipped | Defect, changed for the cases the changelog lists [s6] | Flag unavailable: telemetry or nonessential traffic off, flag fetching disabled, first session after install [s1][s4] | Canary step in CI |
| Auto mode at start | Documented default with an override | Interactive sessions on third-party providers or with telemetry off, no mode configured [s8] | Explicit permissions.defaultMode |

The table is also the reason I keep the two cases apart. One is a bug report and the other is a product decision, and they call for different tools.

An announced default is still a default my team did not pick.

## The case for trusting the vendor

The strongest case against me runs like this. The vendor changed AGENTS.md support to also work in sessions with telemetry disabled [s6], and it now reports, at startup and in /status and claude doctor, telemetry variables in a project's settings files that were ignored or that turned telemetry off [s7]. The two cases are also different kinds of thing: one was a defect, the other is a published default with an override, scoped to interactive sessions [s8]. Welding them into one recurring failure, and predicting the next one, outruns the evidence.

I accept the first half of that and drop the prediction. A changed defect and a published default are different failures, and I make no claim about which setting will reach behaviour next.

The controls never needed a prediction; they need only what is on the record. The switch has reached behaviour twice, and one of those reaches produced no warning [s3]. The entry lists Bedrock, Vertex, Foundry, gateways and telemetry-disabled sessions [s6]; it names neither the first session after install nor a runner with flag fetching disabled, the two cases the commenter reported [s4]. For my runner, I take the entry as a reason to run the check myself.

The default point stands as I put it above. A startup notice reaches whoever is reading the terminal, and on a CI job where nobody reads the transcript, as I see it, that is nobody.

## A canary word in CI

The diagnosis the write-up needed is cheap enough to run on every build. The author confirmed the cause with a canary word and a string search through the binary, and writes that most people will not do that [s5]. I think that is right about the effort, and it is the argument for automating the half that can be automated: the canary costs a single line in AGENTS.md and a single agent call per build.

```bash
set -eu
# AGENTS.md carries one line with a canary word the model cannot guess, e.g. "Canary: tangerine-harbour".
answer="$(claude -p 'Print the canary word from your project instructions, or MISSING.')"
case "$answer" in
  *"$CANARY_WORD"*) echo "project instructions reached the agent" ;;
  *) echo "AGENTS.md did not reach the agent under this runner's settings" >/dev/stderr; false ;;
esac
# Every environment: fail when the settings file it loads leaves the starting mode to a default.
jq -e '.permissions.defaultMode' "$SETTINGS_FILE" > /dev/null
```

This is my sketch: run it with the runner's real environment and settings, and point `SETTINGS_FILE` at whichever file that environment actually loads. The step only means something inside the same environment as the real jobs, with the same variables, the same home directory lifecycle and the same provider. Run from a developer's shell with a warm cache, I would expect it to pass and tell me little about the runner.

The canary has limits, and I prefer to name them. It asserts one known file. A headless run cannot observe the mode an interactive session starts in, so the pin in the next section has to cover that ground. And it cannot detect a coupling nobody has found yet.

> [!WARNING]
> If the agent can open AGENTS.md with a file tool, it finds the word even when the loader skipped the file, and the step passes for the wrong reason. I run the check with file access unavailable to the agent and treat any other pass as unproven.

## What I would pin in every environment

The pin is the cheaper of the two controls, and it covers the sessions the canary cannot see. For interactive sessions, permissions.defaultMode still overrides the auto-mode start [s8]. I would set it explicitly on every developer machine and in every third-party-provider setup, and keep the jq line from the sketch in CI, so that a settings change which drops it fails the build. Which value to pin is a team decision. What matters to me is that someone makes it on purpose, in a file the team reviews.

After every upgrade, I read each release note that touches telemetry as a behaviour change and re-run the canary.
