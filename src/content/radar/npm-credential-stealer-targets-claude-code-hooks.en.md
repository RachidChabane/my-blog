---
translationKey: npm-supply-chain-payload-in-coding-agent-hooks
lang: en
slug: npm-credential-stealer-targets-claude-code-hooks
title: An npm credential stealer targets Claude Code hooks and VS Code tasks.json
  for persistence
publishDate: 10-08-2026
kind: security
tags:
- npm
- Claude Code
- supply chain
- agents
- security
summary: Malicious versions of keyv, flat-cache and file-entry-cache began running
  an install-time credential stealer on 4 August 2026, and the payload attempts persistence
  in Claude Code hooks and VS Code tasks.json. I think that puts it outside the reach
  of a reinstall, and inside the configuration your repository commits.
sources:
- label: Wiz Research incident analysis
  url: https://www.wiz.io/blog/keyv-and-cacheable-npm-supply-chain-attack
  date: 04-08-2026
- label: Endor Labs independent tracking advisory
  url: https://www.endorlabs.com/learn/npm-malware-compromises-keyv-and-cacheable-with-500m-weekly-downloads-and-spreads-to-hundreds-of-packages
  date: 04-08-2026
contentHash: sha256:5890b73064846eb8
publishState: published
---

## What changed

An install script attempted persistence "via Claude Code hooks and VS Code tasks.json" [s1]. On 4 August 2026, malicious versions of `keyv`, `flat-cache` and `file-entry-cache`, which together exceed 500 million weekly downloads, began running an install-time credential stealer, and Endor Labs reports the payload has since been republished across hundreds of other packages under multiple maintainer accounts [s2]. It targets cloud credentials, infrastructure secrets and AI-related configuration files, and attempts to harvest secrets from CI/CD environments [s1]. The data leaves through GitHub repositories created under compromised identities carrying the default description "Shai-Hulud: Here We Go Again" [s1].

## What the cleanup misses

The theft is the ordinary part. The interesting choice is where the payload lives: a hook is a command your agent runs on its own events, so writing one buys re-execution with no daemon, no login shell, no cron entry, and I think that makes the reflex remediation, delete the dependency tree and reinstall clean, structurally incomplete. It scrubs the directory the package arrived in and leaves the file the payload wanted. An agent configuration living in a repository is worse: it gets committed, reviewed as configuration, and pulled by everybody else, so the second hop travels over git instead of the registry, and the advisory feeds I follow do not watch that road.

Three commands, on the workstation and on the build runner; the third asks whether your own organisation already hosts an exfiltration repository [s1]:

```sh
npm ls keyv flat-cache file-entry-cache
git log -p --all -- <your-agent-config> '**/tasks.json'
gh search repos "Shai-Hulud: Here We Go Again" --owner <your-org>
```

> [!IMPORTANT]
> Order matters more than speed. Rotating credentials while a hook file survives sends fresh secrets to a machine that still reports out, so diff the configuration files before you rotate. I have not seen a team keep an audit trail for agent hook files the way it does for CI configuration.

## Impact on your team

I have not seen a safe version named for these packages, and the payload was republished under multiple maintainer accounts [s2], so treat this as a rotation event rather than a pin. Rotate every credential readable by an install script or sitting in an agent configuration, on workstations and build runners alike, starting with CI tokens [s1]. Then settle the governance question: is your repository's agent configuration code that a human reviews, or a file any install can write? On most repositories I have seen it is the second, and that answer is the only part of this incident you control.
