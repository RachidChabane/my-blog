---
translationKey: claude-code-cursor-extension-comment-grep-versus-fingerprint-hunt
lang: en
slug: claude-code-cursor-extension-comment-grep-versus-fingerprint-hunt
title: The tampered Claude Code extension on Cursor's marketplace labels its SSH key
  svc-telemetry, and Microsoft and Phorion say to confirm it by the key fingerprint
publishDate: 31-10-2026
kind: security
tags:
- Claude
- Claude Code
- Cursor
- security
summary: 'Cursor says a maliciously modified Anthropic.claude-code, versions 2.1.312
  and 2.1.313 for Windows and MacOS, was available in its marketplace between about
  2:27am PT and 1:35pm PT on October 29, 2026, and attempts to install a persistent
  SSH backdoor. Cursor''s macOS impact check greps for the svc-telemetry comment,
  and a miss prints No key found; machine not impacted. Phorion says the script itself
  checks for svc-telemetry before appending its key, and Microsoft says to confirm
  the key against the fingerprint. My call: keep the grep as triage, match the fingerprint,
  alert on IDE processes writing ~/.ssh/authorized_keys, and update to 2.1.314 or
  later, as ThreatDefence advises.'
sources:
- label: Cursor, security notice on malicious Anthropic.claude-code 2.1.312 and 2.1.313
    in the Cursor VS Code Extension Marketplace
  url: https://cursor.com/blog/claude-code-extension-security-notice
  date: 29-10-2026
- label: Microsoft Security, Inside a malicious Claude Code-branded extension and
    its persistent SSH backdoor
  url: https://www.microsoft.com/en-us/security/blog/2026/10/30/inside-malicious-claude-code-branded-cursor-extension-persistent-ssh-backdoor/
  date: 30-10-2026
- label: 'Phorion, Official Claude Code Extension Compromise: Security Advisory'
  url: https://phorion.io/blog/offical-claude-code-vsx-compromise/
  date: 30-10-2026
- label: StepSecurity, Trojanized Claude Code Extension Delivered Persistent SSH Backdoor
    to Developer Machines
  url: https://www.stepsecurity.io/blog/claude-code-extension-trojanized
  date: 30-10-2026
- label: 'ThreatDefence, Malicious Claude Code Extension in the Cursor Marketplace:
    Check Developer Machines'
  url: https://threatdefence.com/article/claude-code-openvsx-extension-backdoor-advisory
  date: 30-10-2026
contentHash: sha256:814da7f11577f3d8
publishState: published
---

## What changed

Cursor says that between about 2:27am PT and 1:35pm PT on October 29, 2026, a maliciously modified Anthropic.claude-code, versions 2.1.312 and 2.1.313 for Windows and MacOS, was available in the Cursor VS Code Extension Marketplace, and that it attempts to install a persistent SSH backdoor [s1]. Microsoft says the malicious packages were never published nor distributed from Microsoft Visual Studio Marketplace and from npm [s2].

## The check greps the attacker's label

I think Cursor's impact check should not decide whether a machine is clean. Cursor's macOS check is `grep -qs svc-telemetry ~/.ssh/authorized_keys`, and a miss prints `No key found; machine not impacted` [s1]. Phorion says the script checks whether svc-telemetry is already in the file before appending, and advises checking the public-key fingerprint [s3]. Microsoft says a missing marker alone should not replace review of the installation, process, network, and persistence evidence [s2].

> [!CONFIRMED]
> Phorion says file modification telemetry is essential, and points to IDE helper processes (Code Helper, Cursor Helper) creating or writing to `~/.ssh/authorized_keys` [s3].

> [!INFERRED]
> My reading: Cursor's grep and the malware's own guard both key on the comment, a label the attacker chose. A miss on that string proves little. An editor process writing SSH keys is the signal I would alert on.

## Triage first, fingerprint second

The strongest objection is that the grep is a fast first pass, and that Cursor publishes the fingerprint, `SHA256:0Z6R+DF64Do2nwQic8a7kkfDLNNk4IiK+2U2Rci4htk`, in the same notice [s1]. I agree. That is why I would keep the grep as triage only, then match the fingerprint and review the persistence evidence on each machine that ran the extension.

Microsoft also points to restricting extensions to approved publishers and configuring an extension installation cooldown to delay installation of newly published versions [s2]. StepSecurity says the tampered build appeared under the legitimate identifier [s4]. In my view a list of approved publishers admits this build, while the cooldown is at least aimed at a newly published release like 2.1.313.

## Impact on your team

If your developers run the Claude Code extension in Cursor, my call: match the fingerprint, alert on IDE helper processes writing `~/.ssh/authorized_keys`, configure the cooldown, then update. Cursor says the attacker server no longer functions [s1]. I would not read that as remediation: Microsoft's step is to confirm the key against the fingerprint before removing the exact unauthorized entry [s2]. ThreatDefence says a 2.1.312 folder installed before October 29 may be the clean release, and to update the extension to 2.1.314 or later [s5].
