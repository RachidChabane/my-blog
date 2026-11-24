---
translationKey: fourteen-months-of-agent-factory
lang: en
slug: closing-the-agent-factory-chapter
title: Closing the agent factory chapter
publishDate: 24-11-2026
summary: What I learned in fourteen months spent on the same tool, and what I want
  to automate now.
tags:
- agentic-coding
- agents
- evaluation
sources:
- label: Agent Factory
  url: https://github.com/RachidChabane/agent-factory
  date: 24-11-2026
- label: Claude Plan Execute
  url: https://github.com/RachidChabane/claude-plan-execute
  date: 24-11-2026
- label: Claude Autopilot
  url: https://github.com/RachidChabane/cc-mvp-scaffold
  date: 24-11-2026
- label: musthold
  url: https://github.com/RachidChabane/musthold
  date: 24-11-2026
- label: Datadog Studio
  url: https://studio.datadoghq.com/
  date: 24-11-2026
- label: 'Chen and Stratton, Artificial Intelligence in the Firm: Bottlenecks in Software
    Production (2026)'
  url: https://fion.ac/jellyfish.pdf
  date: 24-11-2026
- label: Anthropic, Introducing Claude Ship (2026)
  url: https://claude.com/blog/introducing-claude-ship
  date: 24-11-2026
- label: Anthropic, How the Claude Code team does code review (2026)
  url: https://claude.dev/blog/solving-code-review-at-anthropic
  date: 24-11-2026
- label: Kohavi et al., Online Experimentation at Microsoft (2009)
  url: https://ai.stanford.edu/~ronnyk/ExPThinkWeek2009Public.pdf
  date: 24-11-2026
- label: Nielsen, Why You Only Need to Test with 5 Users (2000)
  url: https://www.nngroup.com/articles/why-you-only-need-to-test-with-5-users/
  date: 24-11-2026
- label: Nielsen, Usability ROI Declining, But Still Strong (2008)
  url: https://www.nngroup.com/articles/usability-roi-declining-but-still-strong/
  date: 24-11-2026
- label: Nature News on Lindgaard et al. (2006)
  url: https://www.nature.com/news/2006/060109/full/news060109-13.html
  date: 24-11-2026
- label: Pendo, The 2019 Feature Adoption Report
  url: https://www.pendo.io/resources/the-2019-feature-adoption-report/
  date: 24-11-2026
- label: Fortune, Why startups fail, according to their founders (2014)
  url: https://fortune.com/2014/09/25/why-startups-fail-according-to-their-founders
  date: 24-11-2026
- label: Park et al., AI Simulations Grounded in Rich Self-Reports (2026)
  url: https://arxiv.org/abs/2411.10109
  date: 24-11-2026
- label: Zhong, McDonald and Hsieh, Synthetic Cognitive Walkthrough (2025)
  url: https://arxiv.org/abs/2512.03568
  date: 24-11-2026
contentHash: sha256:d4c62bf39949fe4f
publishState: published
---

[Agent Factory](https://github.com/RachidChabane/agent-factory) has been public since November 24, 2026. It is the last version of a tool I started in September 2025, and I am stopping there on this subject. Here I tell what the tool does, what I learned by using it, and what I want to automate now.

<div class="j-wide">
<ol class="j-timeline">
<li><time datetime="2025-09">September 2025</time><strong>Claude Autopilot</strong>A list of tasks, done one by one, with the tests run after each.</li>
<li><time datetime="2026-03">March 2026</time><strong>Claude Plan Execute</strong>A plan written then reviewed by another Claude before the code starts.</li>
<li class="j-private"><time datetime="2026-09">September 2026</time><strong>A private version</strong>The same thing for a single product, inside an organisation.</li>
<li><time datetime="2026-11">November 2026</time><strong>Agent Factory</strong>Any repository, tests in the browser, screenshots and videos.</li>
</ol>
</div>

## The first version already worked

In September 2025 I wrote a script that I called [Claude Autopilot](https://github.com/RachidChabane/cc-mvp-scaffold). I gave it the list of tasks of a project and it asked Claude Code to do them, one by one, without me in front of the screen. After each task, the script ran the tests itself. If the tests did not pass, Claude Code had to fix things before moving to the next task, and after three failures everything stopped so that I could come and look. A second script ran next to it to watch what the agent was doing and cut everything if there was a problem.

The first commit dates from the night of September 1 to 2, 2025. That version already did the main thing. The agent moved forward alone, and it was not the one deciding whether a task was finished.

## What I improved since

Since then I have not changed the idea, I have improved the tool.

In March 2026 it became [Claude Plan Execute](https://github.com/RachidChabane/claude-plan-execute). The main difference is that before coding, the agent writes a plan. Another Claude reviews that plan, and the code only starts if the plan is accepted. This is the tool that runs this blog.

Then I made a version for one specific product, inside an organisation. That one I cannot show. Agent Factory is the same thing, made usable on any repository. Three points changed the most.

The tests used to judge the work are now written before the code, by another agent, and the one that codes can no longer modify them. These tests do not look at the code. They open the application in a browser, click where a user would click, and check what shows up.

The pull request arrives with what they saw. It contains screenshots taken before and after the change, and a video of the journey, filmed on the old version then on the new one. With Autopilot, all I had at the end was tests that passed.

And the cockpit, the interface where you see what each agent is doing, now follows several projects at once and shows the agents' logs live. It is from there that you validate a spec, answer an agent or start the merge.

<figure class="j-wide j-film">
<video controls muted loop playsinline preload="none" poster="/journal/fourteen-months-of-agent-factory/cockpit-poster.png" aria-label="The Agent Factory cockpit during its demonstration">
<source src="/journal/fourteen-months-of-agent-factory/cockpit.mp4" type="video/mp4">
</video>
<figcaption class="j-caption">The cockpit during the demonstration that ships with the repository. It shows an issue with its frozen tests, then a pull request with its tests red then green and its videos. The projects and the people are fictional.</figcaption>
</figure>

Part of these improvements comes from discussions with engineers at Vercel. The rest comes from the models and the harnesses themselves, which changed a lot in fourteen months.

## The pull request no longer means the same thing

The pull request was invented so that one person could read another person's code before it was merged. In Agent Factory, one agent writes the tests, another writes the code and a third reviews. When the pull request opens, that work is already done. So I think we can do without it more and more, and that this historical mechanism no longer makes as much sense.

The measurements point the same way. Two researchers at Harvard, Fiona Chen and James Stratton, [studied 655 firms and more than 720,000 people](https://fion.ac/jellyfish.pdf). After coding agents are adopted, the time between the review request and the merge goes up by 56%, and code waits 60% longer before a reviewer picks it up. 79% of those firms have adopted AI review tools, yet humans still write almost all of the reviews. The authors conclude that review has become the bottleneck.

You can watch the queue fill up.

<j-review-queue>
When fourteen changes arrive every day and eight are reviewed, one hundred and twenty are waiting after twenty days.
</j-review-queue>

<p class="j-caption">Each square is a change that is waiting. This is a subtraction and not a measurement. It shows what piles up as soon as you produce faster than you review.</p>

On 23 November 2026 Anthropic released [Claude Ship](https://claude.com/blog/introducing-claude-ship), which goes after this bottleneck. One agent reviews the pull request, another fixes what breaks in CI and answers the comments, and a third approves it when the policy written by the team allows it. Anthropic published [the figures of the team that builds Claude Code](https://claude.dev/blog/solving-code-review-at-anthropic), and they are good.

<div class="j-wide tablewrap">
<table class="j-ledger">
<thead><tr><th>On the Claude Code team</th><th>Before</th><th>After</th></tr></thead>
<tbody>
<tr><td>Pull requests merged, June to September 2026</td><td></td><td>more than double</td></tr>
<tr><td>Share of them that had to be reverted</td><td></td><td>down by more than 40%</td></tr>
<tr><td>Accepted after a single round of review</td><td>65%</td><td>78%</td></tr>
<tr><td>Five rounds of review or more</td><td>8.9%</td><td>1.5%</td></tr>
<tr><td>Reviews per pull request, on average</td><td>2.08</td><td>1.32</td></tr>
</tbody>
</table>
</div>

<p class="j-caption">Figures published by Anthropic about its own repositories. Anthropic notes that Claude's review is only one part of its process.</p>

For me it still does not change much, because the mechanism stays the same. Every change is still a branch, then a pull request that waits for its turn, gets reviewed, checked against the main branch and merged. Claude Ship moves that queue along faster, but the queue is still there, and what goes into it grows faster still. In the same article, Anthropic says its main repository went from about 2,500 changes a day in May to more than 30,000 in September. Ordinary changes still need one person to agree, the riskiest ones need two, and those people still read a diff.

I am not saying it is useless. A team that already has its repositories, its branch protection rules and audit obligations cannot change everything at once, and for that team it is the most realistic path. Reverting fewer changes while merging twice as many is a real result. Agent Factory itself still opens a pull request at the end. But I see it as a transition. As long as the unit of work is the pull request, we are speeding up the review of a text, when the useful question is whether the product does what we expected of it.

This is the reason I created [musthold](https://github.com/RachidChabane/musthold). It checks, requirement by requirement, that the tests would fail if the code stopped doing what was asked. It is only a sketch, and the philosophy behind it is not finished yet.

## What coordination costs

On a project in production there were four of us developers, with unlimited access to AI and the classic method. You write a spec, you code, you get it reviewed, you merge, and you sort out the conflicts. The headcount was then reduced and I ended up alone on the project. I moved much faster, and the customers were served much faster.

I am not better than my former colleagues, who are very competent. Two things explain the difference. I chose to put productivity first, even if it meant questioning practices that our trade has held as good for a very long time, while still having good code written. And I was alone, so there was nobody left to synchronise with.

<div class="j-wide tablewrap">
<table class="j-compare">
<thead><tr><th></th><th>Four of us</th><th>Alone</th></tr></thead>
<tbody>
<tr><td>Meetings</td><td>regular</td><td>none</td></tr>
<tr><td>Git conflicts</td><td>to sort out between us</td><td>none</td></tr>
<tr><td>Debates</td><td>before deciding</td><td>none</td></tr>
<tr><td>Service to customers</td><td>at the pace of the team</td><td>much faster</td></tr>
</tbody>
</table>
</div>

I find this observation unfortunate. Very competent people can be replaced without productivity going down. Today I think a development team can be a waste of time and efficiency.

## Very close tools are arriving

Tools that do the same thing are starting to come out. Datadog, for example, is opening [Datadog Studio](https://studio.datadoghq.com/) in early access. According to its page, it is a workspace that runs locally and brings agents, pull requests and bugs together in one place, around a "build, ship, validate" loop. It plugs into Claude Code, Codex, OpenCode and Pi.

On my side, everything is now public under the AGPL license, Autopilot and Plan Execute included. You can use the code, fork it and modify it, but a modified version that you distribute has to stay open too.

## What I want to automate now

I start from a request and I end, without watching the agents, with an application I can see working on screen. For me, that is a solved problem. So I am closing this chapter.

If agents write, review and test the code, the verification left to a person has to happen higher up, at the level of the real experience of the user, at least for products used by humans. That is the part I want to automate.

Today you get that feedback with an early access. You put the product in front of real people and you watch what happens. What you gain from it is known and has numbers.

<div class="j-wide j-figures">
<div><b>1/3</b>of the ideas tested at Microsoft improve what they were meant to improve. A third change nothing and a third make it worse.</div>
<div><b>85%</b>of usability problems are met by five people, when each of them meets 31%.</div>
<div class="j-hot"><b>50 ms</b>are enough to judge whether a page is pleasing, and that judgment holds when you look at it longer.</div>
</div>

The first number comes from [the experimentation team at Microsoft](https://ai.stanford.edu/~ronnyk/ExPThinkWeek2009Public.pdf). It says that the people who build a product are wrong two times out of three about what will work, and that it takes feedback from use to find out. The second comes from [Jakob Nielsen](https://www.nngroup.com/articles/why-you-only-need-to-test-with-5-users/), who adds that it holds for people who use the product in comparable ways. You can try it with people drawn at random.

<j-sample-size>
With five people who each meet 31% of the problems, about 85% of them are met.
</j-sample-size>

<p class="j-caption">Each dot is drawn at random, so the result changes from one draw to the next. The formula of Nielsen and Landauer gives the average. For five people who each run into 31% of the problems it gives 84%, which Nielsen rounds to 85%.</p>

That feedback pays. Nielsen reports that when about 10% of a project's budget goes to these trials, the targeted indicators [improve by 83% on average](https://www.nngroup.com/articles/usability-roi-declining-but-still-strong/). And going without it costs. Pendo estimates, on its own customers' products, that [80% of features are rarely or never used](https://www.pendo.io/resources/the-2019-feature-adoption-report/). In an analysis of 101 accounts of failed startups, the first cause cited, in 42% of cases, is [the lack of a need for the product](https://fortune.com/2014/09/25/why-startups-fail-according-to-their-founders).

None of this is about bugs. Part of what you learn comes down to an impression, and an impression forms very fast. In [a 2006 study](https://www.nature.com/news/2006/060109/full/news060109-13.html), pages shown for 50 milliseconds already got a rating, and that rating agreed with the one given after a longer look. Try it.

<j-first-glance>
This test shows three screens for 50 milliseconds each and asks you to rate them, then to rate them again with no time limit. It needs JavaScript.
</j-first-glance>

<p class="j-caption">Three wordless mock-ups, shown for about 50 ms each depending on your screen. Your ratings stay in your browser.</p>

An end-to-end test sees none of this. It is written in advance, it always goes through the same steps and it checks expected results. I want something else. I want to put agents in front of the product the way you would put people there, with unpredictable behaviour, to get feedback on what cannot be tested deterministically, like an impression or a matter of taste. The goal is not to find bugs. The goal is to stop waiting for the first users to learn what they would have taught us.

Research is moving in that direction. A team led at Stanford built agents from interviews and surveys with 1,052 people. Those agents [recover 72.8% of the answers](https://arxiv.org/abs/2411.10109) of the person they imitate, while the person, asked again two weeks later, only recovers 79.5% of them. There are limits left. In [another study](https://arxiv.org/abs/2512.03568), models that walk through an interface complete more tasks than humans do and spot fewer places where people go wrong. They are still too efficient to look like someone discovering a product.

## What I am not sure about

With musthold I look for reproducibility, out of scientific rigour. I may still be holding on too tightly to determinism, while the models keep getting more intelligent. Reproducibility is not always critical on the subjects we work on, and the budget may be better spent elsewhere, on these real usage tests.

This is the direction I have been taking for more than a year. I will say more soon.
