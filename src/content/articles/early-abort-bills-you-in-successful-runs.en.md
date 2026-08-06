---
translationKey: arret-anticipe-sondes-2026-08
lang: en
slug: early-abort-bills-you-in-successful-runs
title: Early abort bills you in successful runs
publishDate: 06-08-2026
tags:
- agents
- evaluation
category: essays
difficulty: 4
sources:
- label: Latent Programming Horizons in Coding Agents (arXiv)
  url: https://arxiv.org/abs/2607.05188
  date: 06-07-2026
- label: Doomed from the Start, probe timing (arXiv)
  url: https://arxiv.org/abs/2607.06503
  date: 07-07-2026
- label: ActProbe, the white-box objection (arXiv)
  url: https://arxiv.org/abs/2606.08508
  date: 07-06-2026
contentHash: sha256:90fc8c3db1c19457
publishState: published
---


Early abort for agent runs is a capability you buy at serving time, and it bills you every month in the successful runs your recall target chose to kill.

Teams reach for early abort as a cost lever, and the pitch writes itself: stop the runs that are going nowhere, keep the token budget. The TextCraft and WebShop work behind that pitch reports token reductions of 60.2% and 54.9% at a 90% recall target, and 45.0% and 41.5% once the target tightens to 95% [s5]. Divide the second pair by the first and the knob shows its teeth: roughly a quarter of the savings buys the last five points of recall. That ratio is my arithmetic over their figures, and it is the number I would put in front of a team before anyone writes a gate.

## What the probe reads, and how early

A linear read of the residual stream decodes execution state the agent has not produced yet. On coding agents, the latent-horizon work reports that a logistic-regression probe on hidden states decodes whether the current code parses, passes its test suite, reduces the number of failing tests and introduces regressions, reaching AUC up to 0.83 for correctness across two models and two benchmarks [s1]. The trajectory carries its own outcome before that outcome exists on disk.

The timing is the part I care about. Probes trained to predict the outcome of future edits stay above chance up to roughly 25 steps before those edits are materialized, which the same authors name the agent's latent programming horizon [s2]. Twenty-five steps is most of a subtask.

A second group, on a different task family and with a disjoint author list, lands on the same shape: lightweight linear probes on internal activations predict eventual task failure from the first interaction round, substantially earlier than agent-monitoring methods based only on observable behaviour [s4]. Two labs, two benchmark families, one asymmetry. The signal is there long before the transcript shows it. I treat that as settled ground and spend the rest of this piece on what it costs to use.

## What the gate is worth, and what it kills

Turning that signal into a gate is where the engineering and the bill actually live. The TextCraft and WebShop work does not stop at an AUC. It builds a recall-controlled cascade and then certifies it: the cascade is frozen and certified on independent data so that eventually successful episodes survive every early-stopping gate at a user-specified global recall rate, giving an exact post-selection recall guarantee [s7]. The certificate is what makes such a gate shippable, and it is also the line nobody budgets for.

Read the guarantee backwards and you get the operating cost. A 90% recall target is a standing promise to kill about one in ten eventually successful episodes, and you pay that in production, per run, for as long as the gate is on. The savings sit on the other end of the same knob: the same work reports 60.2% and 54.9% at 90% recall against 45.0% and 41.5% at 95% [s5], measured on TextCraft and WebShop with Qwen-2.5-7B, Llama-3.2-3B and Qwen3-1.7B [s8]. Tightening the promise from one-in-ten to one-in-twenty costs about a quarter of the token savings, by my arithmetic over their numbers. Neither end of that trade is obviously right, which is why it belongs in a design review and not in a config default.

The certificate has an acquisition cost too, and it appears in no benchmark table: labelled episodes on independent data. Not the training split, and not your production traffic until somebody has labelled it. In my experience that item is what stalls the project, months after the notebook demo convinced everyone.

> [!CONFIRMED]
> Behaviour-only monitoring is consistently weaker than hidden-state probing, and adding behavioural features to hidden-state probes provides no further gain [s6].

> [!INFERRED]
> I read that comparison as a procurement finding. If the transcript is the weaker channel and the stronger one lives inside the serving process, then the question of whether you can build a good gate was largely answered by whoever chose your inference stack, well before anyone opened an editor.

## The channel a hosted endpoint does not sell

So the access question is unavoidable, and I want to be precise about what it licenses.

Every demonstration above reads hidden states. A hosted inference endpoint returns tokens, and on the products I use, log-probabilities at best; nothing in that response is a residual stream. I state that as my own reading of what those APIs expose, because it is a claim about commercial products rather than about any paper cited here. The failure-detection literature makes the same assumption from the other side when it treats white-box access to policy internals as a cost worth avoiding [s9]. If the class of gate that has actually been demonstrated needs internals, a token-only endpoint forecloses it, and that foreclosure happened at procurement time.

What I will not claim is that serving your own weights comes out cheaper. The serving premium appears nowhere in this evidence base, so the full arithmetic cannot be run from these papers at all. The quantified savings are small open models on two constrained benchmarks: Qwen-2.5-7B, Llama-3.2-3B and Qwen3-1.7B on TextCraft and WebShop [s8]. A 60.2% token cut on a 1.7B-to-7B agent bounds what anyone can infer about a frontier-scale coding agent whose economics this literature never touched. My claim is about capability and timing: whatever a hidden-state gate turns out to be worth to you, you cannot install one behind an endpoint that returns tokens only, and you make that choice once, upstream.

## The strongest case against this

The best argument against everything above is that the internals requirement is an artifact of which detectors got built first.

ActProbe makes it. Its authors report that it raises alerts before failures become visually recognizable and improves the F1-timeliness Pareto frontier of failure detection by an average hypervolume gain of +12.7% over both internal- and external-feature baselines, with a +9.0% early-detection ROC-AUC lead on unseen tasks [s10]. Notice which baselines it beats, internal-feature ones among them. An action-space detector outperforming internal features on their own ground is exactly the result that dissolves my access argument, and it comes from the same work that frames white-box access to policy internals as the cost worth avoiding [s9]. The easy rebuttal, that ActProbe is evaluated on robot manipulation while your agents live in a shell, deserves one sentence as a caveat and no more weight than that. Domain gaps close.

| signal channel | what it needs at serving time | what the evidence reports |
| --- | --- | --- |
| hidden-state probes | a read of internal activations inside the serving process | token cuts of 60.2% and 54.9% at 90% recall on TextCraft and WebShop [s5] |
| behaviour-only monitoring | the transcript, which any endpoint already returns | consistently weaker, with behavioural features adding no further gain on top of hidden-state probes [s6] |
| action-space detection | the agent's own actions, leaving policy internals unread [s9] | a +12.7% average hypervolume gain and a +9.0% early-detection ROC-AUC lead on unseen tasks [s10] |

Every row in that table needs the same thing to become a product: labelled episodes that certify a recall rate on independent data [s7]. ActProbe reports a better frontier, and a frontier becomes a promise you can write into a runbook only after that certification step. So the two results are not yet the same kind of object, and my answer to the strongest attack runs through the bill rather than through the signal quality.

Convenience on the training side does not touch this either. The probes transfer across benchmarks without retraining, which the authors offer as evidence of external validity [s3]. That is a genuine result and it discounts the training bill. The certification bill stays exactly where it was, because it follows from the guarantee construction [s7] rather than from how the detector was fitted. Which means my access premise carries a stated expiry: an external-signal detector certified at a user-specified recall on agent tasks ends it. Until one exists, the premise holds on the present state of the evidence, and that is the strongest thing anyone should claim for it.

## What I would ship

Pick the recall target first and price it before looking at the token savings. Write down the fraction of eventually successful episodes you are willing to kill, multiply by your run volume and by what one killed successful run costs a user, then compare that against a token line you can quote from an invoice. The published numbers give you the shape of the trade at 90% and 95% [s5]; your own kill cost decides which end of it you sit on.

Then budget the labelled episodes. A guarantee is only as good as the independent data it was certified on [s7], and that corpus is a recurring line item, refreshed every time the model, the agent scaffold or the task distribution moves under you.

At procurement, ask the boring question while it still has an answer: can we read the signal at all, and if the vendor says no today, what would it take to change that. Teams routinely defer this to the point where the gate becomes a rewrite instead of a feature.

Then watch for the expiry condition. The day a paper reports an action-space detector certified at a user-specified recall on real agent tasks, the access half of this argument is finished and only the certification half survives. I would take that as good news. The bill I actually worry about is denominated in successful runs, and no change of channel makes it go away.
