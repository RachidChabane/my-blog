---
translationKey: postman-desktop-installs-agent-plugins-installer-mints-codex-trust-record
lang: en
slug: postman-desktop-installs-agent-plugins-installer-mints-codex-trust-record
title: Postman desktop installed its plugins into Claude Code and Codex for two users;
  the postman-plugin 0.6.0 installer source writes Codex hook trust
publishDate: 04-11-2026
kind: security
tags:
- Postman
- Codex
- Claude Code
- Claude
- security
summary: 'On October 25, 2026, indicava reported that an existing Postman desktop
  12.33.4 install put Postman plugins into Claude Code and Codex through auto-existing-upgrade,
  and on November 3, 2026, ronthedrummer reported the same path after an update from
  12.31.3 to 12.35.1, with no trusted_hash entry in config.toml. The postman-plugin
  0.6.0 installer source, at release commit 9d5544f, writes trusted_hash under hooks.state
  for its own Codex session-start hook through config/batchWrite. Postman''s commit
  6975d3e says Codex 0.164 binds a plugin hook''s approval to a hash of every file
  under the plugin, so every commit to main made Codex ask again. My call: after a
  Postman desktop update, read hooks.state in ~/.codex/config.toml and the enabled
  plugins in ~/.claude/settings.json, and remove the entries you did not add.'
sources:
- label: 'indicava, postmanlabs/postman-app-support issue 14370: [SEVERE] Desktop
    auto-installs Codex/Claude plugins; installer attempts to trust its own startup
    hook'
  url: https://github.com/postmanlabs/postman-app-support/issues/14370
  date: 25-10-2026
- label: ronthedrummer, comment on postmanlabs/postman-app-support issue 14370
  url: https://github.com/postmanlabs/postman-app-support/issues/14370#issuecomment-6618575621
  date: 03-11-2026
- label: 'Postman, postman-plugin installer source at the 0.6.0 release commit 9d5544f:
    installer/src/hosts/codex-hooks.ts'
  url: https://raw.githubusercontent.com/postmanlabs/postman-plugin/9d5544f815a1d636dbd0126c609e827bf06fc0d7/installer/src/hosts/codex-hooks.ts
  date: 03-11-2026
- label: Postman, postman-plugin release @postman/postman-plugin@0.6.0
  url: https://github.com/postmanlabs/postman-plugin/releases/tag/%40postman/postman-plugin%400.6.0
  date: 03-11-2026
- label: 'Postman, postman-plugin commit 6975d3e: feat(installer): auto-approve Postman''s
    Codex hook'
  url: https://github.com/postmanlabs/postman-plugin/commit/6975d3e163fd5c6d91c6d0440a11146b3053035b.patch
  date: 21-10-2026
- label: The New Stack (Amanda Caswell), A developer opened Postman. Then two AI coding
    agents changed without their permission.
  url: https://thenewstack.io/postman-plugin-coding-agents/
  date: 03-11-2026
- label: Postman Docs, Install the Postman plugin
  url: https://learning.postman.com/docs/postman-plugin/install/overview
  date: 21-10-2026
- label: Postman, postman-plugin hooks/session-start-context.md at the 0.6.0 release
    commit 9d5544f
  url: https://raw.githubusercontent.com/postmanlabs/postman-plugin/9d5544f815a1d636dbd0126c609e827bf06fc0d7/hooks/session-start-context.md
  date: 03-11-2026
contentHash: sha256:fd1fac4f62f5bcca
publishState: published
---

## What changed

On October 25, 2026, indicava reported that an existing Postman desktop 12.33.4 install put Postman plugins into Claude Code and Codex through `auto-existing-upgrade` [s1]. On November 3, 2026, ronthedrummer reported that the app updated from 12.31.3 to 12.35.1 on launch, then `auto-existing-upgrade` installed the CLI and both plugins [s2]. Postman's installer source at `9d5544f`, the `@postman/postman-plugin@0.6.0` release commit, approves its own Codex session-start hook after installation [s3][s4].

## Approval is one config entry

In Postman's installer source, `approvePostmanHook` talks to Codex through `app-server`, reads the hook with `hooks/list`, and writes its hash through `config/batchWrite` [s3]. Verbatim, from codex-hooks.ts [s3]:

```ts
export const POSTMAN_HOOK_KEY = 'postman@postman:hooks/codex-hooks.json:session_start:0:0';
writeAttempted = true; await rpc.request('config/batchWrite', trustEdit(hook.currentHash));
edits: [{ keyPath: 'hooks.state', value: { [POSTMAN_HOOK_KEY]: { trusted_hash: hash } }, mergeStrategy: 'upsert' }], reloadUserConfig: true
```

I think the lesson sits here: in Codex, consent to run a hook comes down to a `trusted_hash` entry under `hooks.state`, which a program running as you can write. Postman's commit 6975d3e gives the motive: Codex 0.164 binds a plugin hook's approval to a hash of every file under the plugin, so every commit to main made Codex ask again to approve the session-start hook [s5]. In my reading, a hash over every file made the prompt frequent enough that the vendor automated it. The New Stack notes that developers who install the plugin directly through Codex must review and approve the hook themselves [s6].

> [!IMPORTANT]
> indicava writes that the source establishes the approval attempt, and the trust record alone does not prove who created it [s1]. The second report, from ronthedrummer, says `config.toml` has no `hooks.state` or `trusted_hash` entry [s2]. So I would check what actually landed on your machine.

## The objection from the docs

The strongest objection: Postman Docs say you can install into every detected agent on your machine with a single command [s7], and Postman's session-start-context.md says user instructions such as AGENTS.md or CLAUDE.md take precedence over its mandate [s8]. I agree that whoever runs that command gets what the docs describe. In my view the two reports change the picture: indicava and ronthedrummer both start from an existing Postman desktop install and name `auto-existing-upgrade` [s1][s2].

## Impact on your team

If Postman desktop shares a machine with Codex or Claude Code, my call: after each Postman desktop update, read the `hooks.state` table in `~/.codex/config.toml` and the enabled plugins in `~/.claude/settings.json`, and remove the entries you did not add. The key to look for is `postman@postman:hooks/codex-hooks.json:session_start:0:0`, per Postman's installer source [s3]. The failure I would watch for is a Codex session-start hook you did not approve, beside Postman's session-start-context.md, which tells the agent to load the `postman:api-engineer` skill before any non-trivial API engineering task [s8].
