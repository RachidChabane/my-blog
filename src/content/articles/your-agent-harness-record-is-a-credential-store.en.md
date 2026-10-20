---
translationKey: attack-agent-harness-state-holds-the-secrets-it-finds
lang: en
slug: your-agent-harness-record-is-a-credential-store
title: Your agent harness record is a credential store
publishDate: 20-10-2026
tags:
- agents
category: essays
difficulty: 4
sources:
- label: 'Gambit Security, AI agents hacking online retailers: company description'
  url: https://gambit.security/blog-posts/autonomous-ai-agents-online-retailers-25-a-company
  date: 22-09-2026
- label: 'NorForge, Inside Cairn exposed AI pentesting panels: TL;DR'
  url: https://norforge.com/blog/inside_cairn
  date: 19-10-2026
contentHash: sha256:1c9d175553a8d45d
publishState: published
---


I think the record an agent harness keeps should be built as a credential store, because that is what it becomes, and the login in front of it is only the second line. Two security firms have each read such a record from the outside, and what they found argues for deciding at write time what the record may hold.

## What two investigations found in the record

The striking thing in Gambit's campaign is how little the human typed. Gambit Security, a firm that keeps enterprises operating through disruption [s2], reports a financially motivated operator running three open source AI harnesses against hundreds of online retailers, almost entirely unattended [s3]. In Gambit's account the human prompts are short instructions that launch an attack, hand the agent a general next step, or say what to do once access is gained [s9]. Strix searched for vulnerabilities, Cairn exploited targets end to end, and Hermes orchestrated the campaign [s7].

In my reading, the operator's knowledge lives in the harness, and the prompts merely point at it. Gambit describes Hermes as an open source autonomous agent with a persistent memory, skills the agent writes and edits itself, a searchable archive of past sessions, scheduled jobs and a web console [s8]. Cairn, per Gambit, takes target domains and an objective such as a shell or admin access, then runs for hours until it reaches the objective, times out or is stopped [s10]. Some targets, Gambit writes, were picked by hand and handed to the agent while the operators already held a working administrator password [s11]. That is a lot of state for a campaign whose human side fits in a few lines of chat.

NorForge, a company that brings its sandboxing expertise to AI agents so that users can see what their agents do [s21], came at the same tools from the other side. It investigated publicly exposed AI-driven penetration-testing control panels and how they are used in malicious cyber operations [s20], and it identified more than 20 exposed Cairn panels as likely associated with malicious activity [s23]. What those panels show is the record itself. NorForge lists what they reveal about the targets: who they are, what weaknesses were uncovered, account secrets and API keys, and whether they were compromised [s27].

> [!CONFIRMED]
> NorForge reports that the Cairn agent posts every fact onto a project-internal blackboard where a human operator can add hints [s28], and that the panels include human input with credentials harvested elsewhere [s29].

> [!INFERRED]
> I read that blackboard as a credential store with two intake pipes: what the agent finds, and what the operator pastes in. Gambit's handed-over password is the same second pipe in another campaign. In my reading, a filter on the agent's output sees only the first.

The volume matters as much as the content. For the tasks that reached their goals, NorForge reports, especially in the AIA0001 cluster, a project ran a little under 23 hours from start to goal and generated 140 facts on average [s37]. Each of those facts is a row that the next step reads, and some of them are keys.

## Two readers got in by different routes

As I read them, both reports exist because a harness record was readable by someone its operator never meant to read it. Gambit's evidence came partly from the attacker's staging server, where it found the exfiltrated data itself and the respective tooling [s42]. Gambit also lists logs and AI claims found on the attacker's server [s43], and it relied on those claims because it could verify substantial parts of them by its first two methods [s13]. One completed Cairn project, Gambit reports, documented an attack chain that ran from an unauthenticated SQL injection through database credentials read from wp-config.php to a full dump of AWS Secrets Manager (46 secrets) [s44]. I think a record that documents that dump sits one serialization away from holding the secrets, and it already tells any reader where the keys live.

NorForge reached its records by a different door. The panels NorForge found appear completely unprotected, exposing what looks like the full administrative functionality of the harness [s32]. It ran the secrets scanner Trufflehog over the data from those Cairn instances [s30]. It found literally hundreds of secrets, from relatively trivial to extremely serious, with 11% verified valid by Trufflehog [s31].

Two readers, two routes. In my reading, a login on the panel speaks to one of those routes at most. Whatever route Gambit took to that server, the record was there to read once it did, and the credential trail came with it.

## Why a login is the second line

The obvious objection is that the industry already has a rule for this: keep secrets out of logs. I think that rule does not transfer, because a harness record is a different object from a log. A log is written for a human who reads it after the fact. The record is read back by the model as its working memory, so the step that needs the password is the step that writes it down. Scrub the value on the way in and the next tool call fails for lack of it; leave it in and the record holds the key. The scrubber cannot win.

That gives the failure mode a name: **credential residue**, a secret value written to an agent record that outlives the task that needed it. The residue does not wait for success. NorForge's working assumption is that for the harnesses in these campaigns the average success rate hovers around 10%, with many of the remaining tasks achieving partial goals or gathering information that can be used in later attempts [s36]. In my reading, a failed task's record is inventory for the next attempt, and whoever reads it inherits the inventory.

In my reading, the readers of a value in the record look like this:

| reader | governed by the console login | sees the value today | sees it with handles |
| :--- | :---: | :---: | :---: |
| a console session | yes | yes | no |
| the model reading the record back | no | yes | no |
| an operator adding hints | partly | yes | no |
| the session archive | no | yes | no |
| a backup or an export | no | yes | no |

The console login governs the top row and part of the third. The other three readers see whatever the record holds, and in my reading the record is where the control has to sit.

## What I would build

My design starts at write time. The record stores a handle, the tool layer resolves it at call time, and the model reads facts and handles without ever seeing a value. Values expire with the engagement while the facts and the URLs stay, because those are what make a finding checkable later. The operator's hint channel goes through the same intake, so a credential pasted by a human becomes a handle before it reaches the blackboard. The console sits behind authentication as table stakes. Nothing else changes. The agent reasons over the same facts and posts them to the same blackboard; the difference is what a row can carry.

```text
# what the blackboard holds today
fact  admin login works on the shop   user=admin  password=<the value>
# what I would let it hold
fact  admin login works on the shop   user=admin  credential=vault:engagement/shop-admin
```

```bash
# the tool layer resolves this at call time; the model never sees it
vault kv get -mount=secret -field=password engagement/shop-admin
# the scan NorForge ran on exposed panels, pointed at your own record
trufflehog filesystem ./harness-record
```

NorForge ran Trufflehog over the data from the Cairn panels it found [s30], and I would run the same scan over my own record at the close of each engagement. A hit there is a write path that let a value through, and that is a bug in the intake with a known location.

> [!IMPORTANT]
> My rule: no credential value enters the agent record, the operator's hint channel included. The record holds a handle, the tool layer resolves it at call time, and the value expires with the engagement while the facts stay.

## The strongest case against

NorForge itself makes the case for the login. Searches on Shodan and Censys, NorForge says, reveal hosts running what appear to be AI harnesses of different kinds; most need authorization to access, but quite a few of these interfaces are left open by their operators [s26]. Having your site tested on an open Cairn instance is often a serious security issue, regardless of the outcome of the test, it writes [s33]. On this view the login is the fix and everything I proposed above is decoration. I concede the proximate failure: the panels NorForge found appear completely unprotected, and I would not ship a harness without authentication. My answer is that Gambit read the same kind of record off the operator's own server, and a login decides who gets in while leaving what is there to take unchanged.

Two weaker objections remain. The second is that the record is the evidence, and both firms worked from it with care. Gambit calls its work an interim report [s14] and says a few errors or inaccuracies are possible [s15]. Gambit counts 105 attack projects launched between 10 and 15 September [s5]. Its chart covers 48 of them; the other 57 were deleted and not available for analysis [s16]. NorForge checked one claimed intrusion by fetching the shell URL mentioned in a completed task, and the URL did serve an uploader webshell [s35]. NorForge also calls its data a snapshot at this point in time [s38]. I read both checks the same way: they ran on facts and URLs. My rule keeps those and expires the values, whereas the deleted projects lost both.

The third objection is the bluntest: the agent needs the credential. Gambit's report has targets picked by hand and handed to the agent while the operators held a working administrator password [s11]. The handle answers it, since the agent gets the use of the credential and the value stays with the tool layer. Both answers hold.

## Who pays

The attacker has no reason to adopt any of this, and the cost side shows why. Gambit puts the marginal cost at a few US dollars to a few tens of US dollars for each targeted company [s17]. NorForge, counting per task, estimates the average at around $5 once unsuccessful, early-ending projects are included [s39], and it calls the uncertainty considerable [s40]. At those prices a leaked record costs the operator almost nothing, so I expect no discipline from that side.

The people who must adopt it are the legitimate red teams. NorForge found a considerable number of apparently legitimate red team operations exposed the same way, potentially placing clients at risk [s24]. It calls gathering secrets from your client just to publish them on the Internet a nightmare scenario [s34]. They own this problem. A red team whose record holds handles loses findings in a breach; a red team whose record holds values loses the client's keys.
