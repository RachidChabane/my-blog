---
translationKey: rtk-caveman-token-stack
lang: en
slug: rtk-caveman-token-stack-both-ends
title: 'RTK + Caveman: cutting agent tokens at both ends of the loop'
publishDate: 22-06-2026
kind: tool
tags:
- agents
- agentic-coding
- oss
- inference
summary: Two independent open-source tools - RTK compresses command output entering
  context, Caveman compresses the model's generated output leaving it.
sources:
- label: RTK primary repo README
  url: https://raw.githubusercontent.com/rtk-ai/rtk/master/README.md
  date: 21-06-2026
- label: RTK GitHub API
  url: https://api.github.com/repos/rtk-ai/rtk
  date: 22-06-2026
- label: Caveman primary repo README
  url: https://raw.githubusercontent.com/JuliusBrussee/caveman/main/README.md
  date: 12-06-2026
- label: Caveman GitHub API
  url: https://api.github.com/repos/JuliusBrussee/caveman
  date: 22-06-2026
- label: azrod.me - independent corroboration of the combined RTK/Caveman stack
  url: https://azrod.me/en/articles/token-economy-rtk-dcp-caveman/
  date: 07-05-2026
contentHash: sha256:312e00d075e5c9af
publishState: published
---

## What changed

On 12-06-2026, two unaffiliated open-source projects that the community bundles as "RTK + Caveman" each shipped a release the same day. RTK (Rust Token Killer, `rtk-ai/rtk`, v0.42.4, Apache 2.0) is a Rust CLI proxy that intercepts and compresses shell command output (test runners, git, grep, ls) before it enters the agent's context, claiming 60-90% reduction on the input side. Caveman (`JuliusBrussee/caveman`, v1.9.0, MIT) is a Claude Code skill/plugin that makes the model answer in terse fragments on the output side. Both are local tools, not models or hosted services; they plug into Claude Code, Cursor, Gemini CLI, and others.

## The schema

```bash
# RTK - INPUT side: rewrites tool output before it hits context
# (global flag is -g, or its long form --global; install branch is master)
brew install rtk
rtk init -g                  # Claude Code / Copilot (default)
rtk init -g --gemini         # Gemini CLI
rtk init -g --agent cursor   # Cursor
rtk gain                     # show token savings stats
# after init: "git status" is automatically rewritten to "rtk git status"

# Caveman - OUTPUT side: compresses the style of generated replies
/caveman lite    # drop filler
/caveman full    # default caveman (~75% claimed; 65% measured)
/caveman ultra   # telegraphic
/caveman-stats   # real session tokens + lifetime savings
```

## In practice

```bash
# Combined stack on a CLI-heavy Claude Code session
rtk init -g                              # input: -80% on RTK's own table
# (ls/tree -80%, grep -80%, cargo test -90%, total ~118k -> ~23.9k tokens)

curl -fsSL https://raw.githubusercontent.com/JuliusBrussee/caveman/main/install.sh | bash
/caveman full                            # output: 65% average (range 22-87%)

# Verify both
rtk --version        # note: README prints "rtk 0.28.2" as a stale example; API gives v0.42.4
/caveman-stats
```

## Impact on your team

If your agents run dense CLI workflows (test suites, repeated git and grep), most of the token cost is in tool output, and RTK attacks it at the source with under 10ms overhead. Caveman touches only output tokens and claims to keep "full technical accuracy" on code and paths - useful when a human still reviews the diff.

> [!IMPORTANT]
> "RTK + Caveman" is not a product: these are two projects by different authors under two licenses (Apache 2.0 and MIT). Community bundles (e.g. `adityahimaone/hermes-agent-rtk-caveman`) advertise "90-99% savings," but that figure stacks measurements that do not come from one shared benchmark. Measure on your own project: RTK's README warns its numbers are "based on medium-sized TypeScript/Rust projects" and that "actual savings vary by project size," and Caveman's "~75% claimed" versus "65% measured" gap deserves your own check before any budgeting.
