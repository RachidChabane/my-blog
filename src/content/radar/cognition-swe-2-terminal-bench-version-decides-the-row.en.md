---
translationKey: cognition-swe-2-terminal-bench-version-decides-the-row
lang: en
slug: cognition-swe-2-terminal-bench-version-decides-the-row
title: Cognition's SWE-2 leads Terminal-Bench 2.1 and loses Terminal-Bench 4 in the
  same table
publishDate: 12-09-2026
kind: release
tags:
- Cognition
- SWE-2
- Terminal-Bench
- Kimi K3
- evals
summary: Cognition released SWE-2 on September 10, 2026, post-trained from Kimi K3
  and reachable only inside Devin Desktop and Devin CLI [s2][s3]. Its own table puts
  SWE-2 at 92.8% on Terminal-Bench 2.1, ahead of Fable 5.1 at 91.4%, and at 27.3%
  on Terminal-Bench 4, where Fable 5.1 scores 55.8% [s1][s3]. I think the version
  you quote is doing more work than the model.
sources:
- label: 'Cognition, Introducing SWE-2: Pushing the Pareto Frontier'
  url: https://cognition.com/blog/swe-2
  date: 10-09-2026
- label: Tech Times, Cognition SWE-2 beats frontier coding AI
  url: https://www.techtimes.com/articles/327315/20260911/cognition-swe-2-beats-frontier-coding-ai-64-lower-cost-using-single-run-rl-training.htm
  date: 11-09-2026
- label: 'CellCog blog, Cognition SWE-2: benchmarks and the row it loses'
  url: https://cellcog.ai/blog/cognition-swe-2/
  date: 10-09-2026
contentHash: sha256:d1e2c071917a79db
publishState: published
---

## What changed

Cognition released SWE-2 on September 10, 2026, the successor to SWE-1.7, post-trained from Kimi K3 and reachable in Devin Desktop and Devin CLI with the rollout to Devin Web and Fusion underway [s2][s3]. The headline is one row of its own benchmark table: 92.8% on Terminal-Bench 2.1, ahead of Fable 5.1 at 91.4% and GPT-6 Astra at 89.9% [s1][s3]. The row under it runs the other way. On Terminal-Bench 4, SWE-2 posts 27.3% against 55.8% for Fable 5.1 and 57.9% for GPT-6 Astra [s1][s3].

| Benchmark | SWE-2 | Fable 5.1 | GPT-6 Astra |
| :--- | ---: | ---: | ---: |
| Terminal-Bench 2.1 | 92.8% | 91.4% | 89.9% |
| Terminal-Bench 4 | 27.3% | 55.8% | 57.9% |

## The rows you cannot reproduce

Spotting the inversion is easy. Paying for it is the part nobody prices. Same benchmark family, same table, opposite verdict, so "leads on Terminal-Bench" carries no information until someone says which version produced it. The normal answer to a table you distrust is to reproduce its rows yourself, and reproducing a row needs programmatic access. SWE-2 has no standalone API and no open weights [s2], and every figure above is Cognition's own run with no independent replication [s3]. So the published rows stay the vendor's to verify. The only pass rate you can own is one you measure by hand inside Devin, and I think that is the constraint worth carrying, more than the 27.3% itself.

> [!IMPORTANT]
> Every number in that table is first-party. There is no independent replication yet [s3], and no API and no weights to produce one with [s2]. Read the Terminal-Bench 2.1 row as a vendor claim you cannot audit rather than as a ranking.

## Impact on your team

If you are picking an agentic coding model off a published table this quarter, pin the benchmark version in your own eval config before you compare anything: a comparison that does not name 2.1 or 4 is not a comparison [s1]. If you already run Devin, the concrete move has a clock on it. Cognition is running a one-month free promotion for Pro, Max and Teams subscribers [s2], so spend it replaying your hardest real tasks inside Devin Desktop or the Devin CLI instead of rereading the table, and write down the pass rate you get. That number outweighs both rows above, because it is the only one you produced. And if what you need is a callable model for your own orchestration, SWE-2 is not a candidate today [s2]. Fusion is the surface to watch, and its rollout is still underway.
