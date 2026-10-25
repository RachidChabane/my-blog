---
translationKey: ai-rediscovered-vulnerabilities-leak-the-disclosure-window
lang: en
slug: a-patch-sla-cannot-measure-exposure
title: A patch SLA that starts at the advisory cannot measure exposure
publishDate: 25-10-2026
tags:
- agents
- qualite
category: essays
difficulty: 4
sources:
- label: OpenAI, Coordinated disclosure of critical vulnerabilities (independent rediscovery
    by Wiz)
  url: https://openai.com/index/coordinated-disclosure-of-critical-vulnerabilities/
  date: 21-10-2026
- label: Wiz Research, PHP2Shell technical briefing (scope)
  url: https://www.wiz.io/blog/php2shell-php-rce
  date: 21-10-2026
- label: Cloudflare, WAF protections for the PHP vulnerabilities (pre-disclosure rules)
  url: https://blog.cloudflare.com/php-vulnerabilities-waf-protection/
  date: 21-10-2026
- label: PHP project, Security advisory of 21 Oct 2026 (urgency)
  url: https://www.php.net/archive/2026.php
  date: 21-10-2026
- label: Hacker News, Tell HN post on incoming PHP RCE CVEs (early public notice)
  url: https://news.ycombinator.com/item?id=50167754
  date: 20-10-2026
- label: Anthropic, Using Claude to reduce the attack surface of code (scaling argument)
  url: https://www.anthropic.com/research/attack-surface-reduction
  date: 25-10-2026
- label: Amazon Threat Intelligence, PHP2Shell exploitation prior to public disclosure
    in MadPot (pre-disclosure attempt)
  url: https://aws.amazon.com/blogs/security/amazon-threat-intelligence-identifies-php2shell-exploitation-prior-to-public-disclosure-in-madpot/
  date: 21-10-2026
- label: Hacker News, Tell HN apology for the PHP RCE embargo (no-embargo notice)
  url: https://news.ycombinator.com/item?id=50193416
  date: 22-10-2026
- label: Phoronix, Linux kernel vulnerability reports posted to the public mailing
    list (duplicate report)
  url: https://www.phoronix.com/news/LKML-New-Trend-Vulnerabilities
  date: 22-10-2026
contentHash: sha256:058709c4486920ff
publishState: published
---


I think a patch SLA counted from the advisory measures how fast a team responds, and in the PHP2Shell case exposure started before public disclosure. Amazon Threat Intelligence identified an exploitation attempt dating to Oct. 17, 2026, in its MadPot telemetry, four days before public disclosure [s28], and Cloudflare reports that the vulnerability leaked before the official release date [s14]. AI shortens the step after any detail escapes: the threat-intelligence post says AI-assisted analysis makes it cheaper to turn a patch diff or advisory into a working exploit [s32].

So I keep two clocks. The hours SLA governs the patch, and I would not loosen it. Exposure runs on a second clock that starts at the earliest exploitation, and for an operator outside the advance list its only controls are the ones in place before any advisory: unused optional runtime features switched off now, and web logs kept long enough to look back past a disclosure date.

## The window did not hold

I read the dated records as one failure seen from several seats: the embargo did not hold, and no record says how. Amazon writes that the targeting of a honeypot from an anonymized IP address suggests a threat actor, though it remains unclear how the actor acquired exploit information prior to disclosure [s28] [s29].

Release day was no cleaner. Amazon Threat Intelligence says the PHP embargo window was set to be lifted on 2026-10-21 1400 UTC, and that on the day of the release it identified multiple proof of concept exploits, the earliest around 2026-10-21 0200 UTC [s30].

Two public forum posts show the outside view: one said a reliable source had indicated an announcement scheduled for 22 October 2026 at 18:00 CEST regarding two PHP RCEs with a CVSS score of 10.0 [s22], and listed CVE-2026-109618 and CVE-2026-109619 as the two reserved CVEs for the reported upcoming announcement [s23]. A later post says the writer's contact had said there was no embargo [s34], and acknowledges knock-on effects on the coordinated-disclosure schedule [s35].

The scope is wide: Wiz Research describes core PHP as a scripting language that powers 70% of all websites in the world [s6], and the briefing grouped the issues under two CVEs, with severity reaching CVSS 9.2 [s11].

> [!NOTE]
> None of these records names the channel behind the attempt or the leak, and none ties the forum post to either. I treat them as separate records of one failure, neither one event nor independent confirmations of a single route.

## Where AI enters the timeline

The tempting story is that AI found the bugs and attackers rode along, and I find no record that supports it. The flaws were found twice: the coordinated-disclosure post records that Calif identified a critical flaw [s27], with Wiz also independently discovering and reporting both vulnerabilities [s1], and Wiz Research thanks the PHP team, Calif and OpenAI for their work on discovery, coordination and patch verification [s26]. The coordinated-disclosure post adds that, to its authors' knowledge, frontier AI found these vulnerabilities before attackers did [s2]. The post that reports the honeypot attempt puts the general rule in one line: an embargo protects defenders only until someone else finds the same bug [s31].

What AI changes, in my reading, is the step after a detail escapes. The briefing says the underlying flaws had been present for decades, but demonstrating their exploitability required an exceptionally complex chain of steps [s7]. Frontier AI models substantially reduced that barrier [s8], and the briefing's authors developed and adapted working exploits across multiple applications in hours [s9]. Its own conclusion is that complexity may no longer provide a meaningful barrier [s10].

The coordinated-disclosure post supplies the other half: even limited details can reveal a vulnerability [s4], and the post leaves open how to weigh coverage against leak risk when choosing who to notify [s3]. Its own patch process tests the fix adversarially with frontier models [s5]. I think that pairing is the real shift: if limited details reveal a bug and models shorten the work from detail to exploit, then a leak of any size sits closer to a working exploit, and I plan for that.

A separate Linux case shows reports escaping their channel elsewhere too: several new kernel vulnerability reports were posted, seemingly by accident, to the public kernel mailing list instead of the private security list [s38], and for one skb_zerocopy issue kernel developers had received a security report from another source the week before [s36]. The report ends on a line I agree with: the bug and security reports keep on coming in the AI fueled world [s37].

## Two clocks in one post

The post that reports the honeypot attempt gives two instructions, and I think they measure different things. One is speed: more actors can act within hours or even minutes once technical details are disclosed, so for critical vulnerabilities in internet-facing systems the post asks for patch and mitigation timelines measured in hours, since a 7-day or 30-day SLA assumes a delay that no longer exists [s32]. The other is where to start looking.

> [!CONFIRMED]
> Start investigations from the earliest known exploitation instead of the disclosure date [s33]. For PHP2Shell, the post says to investigate from at least October 17 [s44].

> [!INFERRED]
> In my reading, that instruction is the exposure clock and the hours SLA is the response clock. A web log that rolls over before the look-back date turns the instruction into a question nobody can answer.

I want to be fair to the post, because it already says most of what I am arguing: it also says to invest in detections that do not rely on a signature for a specific CVE, since the first exploitation will often come before those signatures exist [s43]. As I read it, the post never says which clock a team should report. I think teams will adopt the hours figure, because it fits a dashboard. That is the choice I would push back on: a team can meet an hours SLA on every critical CVE and still have been exposed for days it never measured.

## Stage what needs no advisory

The failure mode I would name is the review comment that says we never call session_start(), so the session bug is not ours. The briefing answers it: the attack works even when the application never calls `session_start()`, making the issue application-agnostic [s12]. In my reading, that puts a feature the application does not use on its attack surface anyway, so I would turn it off before anyone has a reason to. Separate work on attack-surface reduction argues that fixing individual vulnerabilities alone scales poorly [s24] and that reducing code reachability can reduce the severity of unknown vulnerabilities, including ones that might be under active exploitation [s25].

The PHP advisory shows what the same change costs under pressure: all PHP users are strongly encouraged to update immediately, and the risk is highest for mod_php, with a demonstrated exploit in which an unauthenticated request can trigger the attack before any application code runs [s17] [s18]. For those who cannot update at once, the listed measures reduce exposure to specific attack paths but do not make an installation safe [s19]. For CVE-2026-109619 the measure is to set `session.upload_progress.enabled=0` and restart every worker [s20]. I count that restart as the real price: on a fleet that has never done it, it is a deploy on the attacker's clock.

```ini
; php.ini, for an internet-facing runtime whose application does not use upload progress
session.upload_progress.enabled = 0
```

> [!WARNING]
> Check the value where requests run: the CLI can load a different php.ini than the FPM workers, and a pool file can override both, so I read it from a request the pool serves. `php --ini` shows only what the CLI loads.

The follow-up is the part I find most useful. An informational advisory dated 23 Oct 2026 suggests setting `session.upload_progress.enabled=0` until the next regular bugfix release, to fully protect from an unlikely RCE vector [s39]. It notes that the setting was already listed as a mitigation for CVE-2026-109619 on Oct 21st, 2026, and that those who applied it then need take no further action beyond keeping it in place [s40]. I read that as the standing switch paying out twice: an operator who already had the feature off had nothing new to do, an operator who had only patched was asked to weigh a second change, and in both cases the switch covers only the path it targets.

## The strongest case against

The strongest objection, as I would put it, is that before an advisory an operator cannot know which feature to switch off, so standing reduction is either a guess or ordinary hardening under a new name. Half of that is right. I agree that this is ordinary attack-surface reduction. In my reading the guess part fails, because the inventory needs a list of what each application uses, and the advisory adds nothing to that list. The follow-up item states its own limits: the issue can only occur under an unusual combination of configuration and application code [s41], and applications that never change the serialize handler at runtime can keep the feature enabled [s42]. In my reading, that exemption turns a config line into a question about application code, and I would rather answer the config line. A switch still narrows only the path it targets, and the original advisory says as much: such measures do not make an installation safe [s19].

A second objection is that the window worked for those inside it: Cloudflare had WAF protections deployed about 9 hours ahead of public disclosure [s13], Linux distributions and LTS vendors received the patches in advance [s21], and the post that reports the honeypot attempt still calls coordinated disclosure the right model [s31]. I agree. My point concerns the operator outside the advance list, who sees the advisory and cannot see the route, which even the party that logged the attempt calls unclear [s29].

A third objection is that an edge filter covers the window without touching the runtime, and the edge vendor's own write-up limits it: attackers were observed mutating the attack payload to try to bypass its protections [s15], and request data alone does not always provide enough evidence to distinguish an exploit from legitimate traffic [s16]. I treat a request filter as a complement to the runtime change, and the same limit applies to my logs: they give an investigation its starting record, which is less than a verdict.

## What I would stage before the next advisory

For each internet-facing runtime, this is the list I would work through.

| Control | Starts before an advisory | What it narrows | What I rehearse |
| :--- | :--- | :--- | :--- |
| Unused optional runtime features switched off | yes | the paths those features open | the config change and the worker restart |
| Web logs kept past a disclosure date | yes | the blind spot in the look-back | a query that dates the earliest matching request |
| Edge request filter | only for parties inside the window | request patterns it recognises | reading match volume for mutated payloads |
| Patch within hours | no | the full fix | the rollout itself |

Everything here hangs on the inventory, because I cannot switch off what I have not listed. A rehearsed restart makes the change routine on the day it matters. I size log retention by how far back I would want to look, and after this case that is past the advisory date. Each switch narrows only the path it targets, which is why the patch keeps its own clock. The hours SLA stays for the patch. I would report both clocks side by side, so a fast patch never hides a long exposure.
