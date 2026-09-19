---
translationKey: claude-code-2-1-277-agents-md-builtin-plugin
lang: en
slug: claude-code-2-1-277-reads-agents-md-builtin-plugin
title: Claude Code 2.1.277 reads AGENTS.md, and a built-in plugin decides when
publishDate: 19-09-2026
kind: release
tags:
- Claude
- Claude Code
- AGENTS.md
- agents
- tooling
summary: 'Anthropic shipped Claude Code 2.1.277 on September 18, 2026: in a project
  with no CLAUDE.md it now reads AGENTS.md. The reader is a built-in agents-md plugin,
  and its default resolves rather than merges, so any CLAUDE.md or CLAUDE.local.md
  at or above your working directory wins and the mode that reads both is ignored
  in project and local settings files. Reading the npm registry on September 19, I
  saw the stable dist-tag still at 2.1.267, below the v2.1.277 floor. I keep a CLAUDE.md
  whose whole body is the AGENTS.md import.'
sources:
- label: Claude Code changelog, the 2.1.277 entry
  url: https://code.claude.com/docs/en/changelog
  date: 18-09-2026
- label: Claude Code docs, how Claude remembers your project
  url: https://code.claude.com/docs/en/memory
  date: 18-09-2026
- label: AGENTS.md, the open format for coding agents
  url: https://agents.md/
  date: 19-09-2026
- label: WindowsForum news desk on Claude Code 2.1.277 and AGENTS.md
  url: https://windowsforum.com/news/claude-code-2-1-277-adds-agents-md-fallback-not-merge.445031/
  date: 18-09-2026
- label: npm registry, @anthropic-ai/claude-code dist-tags and publish times
  url: https://registry.npmjs.org/@anthropic-ai/claude-code
  date: 19-09-2026
contentHash: sha256:83824156c7ea8b20
publishState: published
---

## What changed

Anthropic shipped Claude Code 2.1.277 on September 18, 2026, and in a project with no CLAUDE.md it now reads AGENTS.md instead [s1]. The npm tarball went up at 2026-09-18T16:22:26.548Z [s5]. The reader is a built-in plugin called `agents-md`, driven by a `Project instructions` setting whose default is `claude-md-or-agents-md` [s2].

## What the default resolves

That default picks one file and drops the other. A `CLAUDE.md`, `.claude/CLAUDE.md` or `CLAUDE.local.md` in your working directory or any directory above it makes Claude read those and leave AGENTS.md aside, while your user-level CLAUDE.md, your organization's managed one and `.claude/rules/` keep loading beside it [s2]. The trap is the local file: the docs state that adding a `CLAUDE.local.md` for your own uncommitted notes stops Claude reading the team's AGENTS.md, for you alone [s2]. The mode that reads both, `claude-md-and-agents-md`, exists, but Claude Code ignores it in project and local settings files [s2]. A team cannot commit that fix. Each developer sets it, or an organization pushes it through managed settings [s2].

> [!IMPORTANT]
> Support is absent in any session that does not fetch feature flags from Anthropic, which the docs illustrate with Amazon Bedrock, another third-party provider, or disabled telemetry, and also under `disableAllHooks` or `allowManagedHooksOnly` [s2]. There the `Project instructions` entry does not even appear in /config [s2], and the changelog lists the feature as not yet on Bedrock, Vertex or Foundry [s1]. The interop lands last in the locked-down deployments, which is where one shared instruction file was worth the most.

## What I would actually commit

I keep the boring path the docs already bless: a CLAUDE.md whose whole body is the import.

```markdown
@AGENTS.md
```

It fires `InstructionsLoaded` hooks and lists the file in /memory and /context, neither of which an AGENTS.md read through the setting does [s2], and it works in the sessions above. Keeping the import never makes Claude read AGENTS.md twice, whichever value you choose [s2].

## Impact on your team

Check your install channel first. Reading the npm registry on September 19, I saw the `stable` dist-tag pointing at 2.1.267 [s5], below the v2.1.277 floor the docs set [s2], while `latest` was already 2.1.278 [s5]. If you install from `stable`, you do not have this yet. The decision sits elsewhere: your AGENTS.md is now read by Claude Code too, so anything written in it for a different agent is now Claude's instruction set. Reread it once with that in mind. The project site claims over 60k open-source projects carry the format [s3], and WindowsForum makes the reading I would hand a platform team: a fallback does not give you the shared policy file you think you are adopting [s4].
