---
translationKey: agent-run-analysis-needs-a-replay
lang: en
slug: replay-your-agents-analysis
title: Replay your agent's analysis before you act on it
publishDate: 24-11-2026
tags:
- agentic-coding
- evaluation
category: essays
difficulty: 3
sources:
- label: Gunsilius, Van Dijcke and Wuthrich, Inference after coding agents (arXiv
    2611.23174)
  url: https://arxiv.org/abs/2611.23174
  date: 17-11-2026
- label: 'Gao and Xiao, When AI Analysts Disagree: Agentic Multiverse Analysis (arXiv
    2611.25198)'
  url: https://arxiv.org/abs/2611.25198
  date: 18-11-2026
contentHash: sha256:d5d56bfe781d0f00
publishState: published
---


Don't act on a coding agent's data analysis until you have replayed it. The answer you got is one of several that the same agent, on the same data, could have handed you.

Somebody pastes in the experiment readout, or asks why signups fell on Tuesday, and a few minutes later there is a tidy notebook with plots, a coefficient table and a conclusion written in a confident voice. What the notebook doesn't show is the set of forks that produced that conclusion. Which rows got dropped as probable bots, which date window survived, which covariates went into the regression and which were tried and quietly removed. Those decisions were made during the run, and the notebook keeps only the path that was taken.

## Same data, different notebooks

An agent can be rerun with one command, as often as your patience allows, and that is what makes its forks measurable. Ruijiang Gao and Steven Chong Xiao gave 150 autonomous coding agents one dataset and one set of research questions in a pilot study [s9], and the agents split over the same defensible methodological choices human analysts split over, only less widely [s4] [s11]. Read any one of those notebooks alone and you won't find anything to circle in red.

With people, finding this out is the expensive part: many-analyst studies eat person-years of volunteer labor [s12], and nobody reruns the same human analyst to see whether they change their mind.

Don't count on a reviewer agent to settle it. It barely narrows the spread [s5], since every notebook holds together and coherence is what it checks. Showing the agents the top-rated reports does narrow it, mostly by getting them to copy [s6] (anyone who has sat in a meeting where everyone sided with whoever spoke first already knew this).

## What happens when you ask for a finding

Ask an agent for a finding and it will find one, even in noise. When Florian Gunsilius and two co-authors [s8] simulated data with zero effects and asked four frontier agents for a compelling finding, the agents reported significant p-values between 54% and 98% of the time [s1]. Each extra test costs the agent next to nothing, and the notebook only shows the one that cleared the bar.

That range comes from a prompt that asked for a result. A neutral prompt would probably do less damage, and I don't know by how much. Then again, read the tickets you actually hand to agents. "Why did conversion drop last week?" is already a request for a finding, and an agent that comes back empty-handed looks like it did a bad job.

## The replay is the cheap part

Once the analysis is done, you can reset the agent and replay it on subsamples of the data with the same instructions [s2] [s10]. In Gunsilius and co-authors' simulations, a correction built from those replays brings the share of significant results on no-effect data back down to near the 5% the test is supposed to allow [s3].

You don't need their statistics to get something out of a replay. Run the same instructions a handful of times, each in a fresh session on a different random slice of the rows, and put the results side by side. Diff the choices each run made, not just the sign and size of the effect. A conclusion that keeps coming back through different choices is probably in the data, and a split means the original answer was one fork among several.

Gao and Xiao put their own exercises at hours of agent time and tens of dollars per paper [s7]. That covers a whole study, so take it as a ceiling for one replay and set it against the launch or price change the readout feeds.

So put the replay in the estimate and in the ticket, next to the query that pulls the data, and have the readout say whether the conclusion survived the replays as well as what it is. None of this works unless you keep the agent's full transcript, its exact instructions and a frozen copy of the data it read. Without those there is nothing to replay when someone questions the number next quarter.
