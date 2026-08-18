---
translationKey: copilot-autofix-co-authored-commit-review-did-not-flag
lang: en
slug: copilot-autofix-co-author-merged-pr-all-clear
title: 'Wiz updated its disclosure: Copilot Autofix was a co-author that checked the
  merged PR and identified it as all-clear'
publishDate: 18-08-2026
kind: security
tags:
- GitHub Copilot
- Wiz
- security
- code review
summary: 'Wiz updated its Snowflake disclosure on August 17, 2026, 1957 UTC: Copilot
  was a co-author that checked the merged PR and code change and identified it as
  all-clear without noticing the critical vulnerabilities, and it is unclear whether
  the code change was AI-assisted. The Register logged its own correction. I think
  the review miss is the part that survived.'
sources:
- label: Wiz Research disclosure
  url: https://www.wiz.io/blog/red-agent-snowflake-copilot-cicd-bug
  date: 17-08-2026
- label: The Register
  url: https://www.theregister.com/security/2026/08/17/an-ai-broke-snowflakes-code-then-another-ai-agent-exploited-it/5288666
  date: 17-08-2026
- label: The Hacker News
  url: https://thehackernews.com/2026/08/snowflake-github-actions-flaw-lets_0330881554.html
  date: 17-08-2026
contentHash: sha256:d0236d5b15a4bf4b
publishState: published
---

## What changed

Wiz revised its Snowflake disclosure, and the revision moves the attribution. The update,
stamped August 17, 2026, 1957 UTC, says Copilot was a co-author that checked the merged PR and code
change, and identified it as all-clear without noticing the critical vulnerabilities; it adds that
it is unclear whether the code change was AI-assisted [s1]. The Register logged its own correction
at Update 08/18, 0000 GMT, recording that Wiz now says it is possible a human introduced the error
[s2]. Autofix, on that account, simply failed to correct it [s2].

## What the commit history establishes

The Hacker News went to the GitHub history and reports that the explicit Copilot co-authored commit,
6d0e2fa, changed jira_close.yml, that the unsafe jira_issue.yml refactor appears in a separate
August 25, 2025 commit, 094038e, attributed by GitHub to sfc-gh-hpathak, and that both were folded
into the June 18 squash merge commit 4a1b8ce, which lists Copilot Autofix among its co-authors [s3].
I think that paragraph is the one to keep, and not because it exonerates anyone. A squash merge
folds several commits into one, so a co-author entry sits at the merge rather than at any single
line. The two dates say the rest: a change dated August 25, 2025 rode into a June 18 merge [s3].

> [!CONFIRMED]
> The Hacker News reports that the unsafe jira_issue.yml refactor appears in the August 25, 2025
> commit 094038e, attributed by GitHub to sfc-gh-hpathak, and that the June 18 merge commit
> 4a1b8ce lists Copilot Autofix among its co-authors [s3].

> [!INFERRED]
> I read the correction as leaving one hard fact standing: an automated reviewer looked at the
> merged change and returned all-clear. That is a false negative in the review, and it holds
> whoever wrote the lines.

## Impact on your team

If this episode goes into a postmortem or an internal writeup, take the corrected text: Wiz revised
its own account and The Register revised the story it ran [s1][s2]. If your merge queue
squashes, stop reading a co-author entry on a merge commit as evidence about a line; The Hacker News
had to open the individual commits to tell jira_close.yml from jira_issue.yml [s3]. The engineering
call underneath both is the review miss. An automated all-clear on a merged PR bought nothing here
[s1], so keep a human read on workflow files and treat an automated verdict as one opinion in the
pull request.
