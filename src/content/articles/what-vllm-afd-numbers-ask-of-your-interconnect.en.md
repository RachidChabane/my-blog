---
translationKey: afd-throughput-does-not-transfer-without-the-fabric
lang: en
slug: what-vllm-afd-numbers-ask-of-your-interconnect
title: What the vLLM AFD numbers ask of your interconnect
publishDate: 27-07-2026
tags:
- llm-oss
- evaluation
category: essays
difficulty: 4
sources:
- label: vLLM blog, AFD plugin announcement
  url: https://vllm.ai/blog/2026-07-23-vllm-afd-plugin
  date: 23-07-2026
- label: arXiv 2602.09721, roofline analysis of AFD
  url: https://arxiv.org/abs/2602.09721
  date: 10-02-2026
- label: arXiv 2605.28302, AFD design-space exploration
  url: https://arxiv.org/abs/2605.28302
  date: 27-05-2026
contentHash: sha256:aca09fd67047c8d5
publishState: published
---


The +11.3% that vLLM's AFD plugin reports at 64A16F [s1] is a number you cannot carry to your own cluster, and the release does not publish what you would need to earn it. Relative to EP64, the same reported result puts 48A16F at -5.3% [s1]. Inside the vendor's own runs that pair is coherent and self-explained: the attention-to-FFN provisioning ratio moves, and the result follows it. Why the sign flips there is settled by provisioning. Whether the winning side of that flip is reachable by a reader who did not buy the same fabric is the question the release leaves open, and it is the one I want to work through.

## What the vendor measured

Three reported figures carry the whole argument, and each one is narrower than it first looks. Relative to EP64, the AFD results are -5.3% for 48A16F and +11.3% for 64A16F [s1]. A separate reported result puts the same two provisioning ratios at -10.0% and +9.0% [s2]. Per die, EP64 achieves 168.2 tokens/s/die, 48A16F achieves 151.4 tokens/s/die, and 64A16F achieves 183.3 tokens/s/die [s3].

The ordering holds across both reports. The magnitudes do not, and nothing in either excerpt says what differs between them. I read that gap as the first warning label on the whole set: conditions that move a result that far are exactly the conditions the release does not report. No model is named. No workload is named. No cluster class is named. Three figures, and every variable that would let you predict your own is missing from them.

## The gain mechanism runs through scale-out bandwidth

AFD earns whatever it earns by scaling FFN instances independently of attention instances, which is why the provisioning ratio is the knob the vendor sweeps in the first place. A roofline analysis published five months before the plugin puts a ceiling on that knob. On standard clusters, increasing FFN instance count fails to improve HFU as computational workload is capped by scale-out bandwidth; these limitations diminish under specific conditions, namely superpod-class hardware with abundant interconnect bandwidth and models with coarse-grained experts and lower sparsity [s4].

Those two findings operate at different levels, and keeping them apart is the whole of my argument. The attention sweep is how the vendor found its own optimum: at a fixed FFN instance count, changing the attention count changes which side of EP64 the result lands on, and that is an intra-run effect of provisioning inside one fabric. The FFN ceiling decides something else entirely, namely whether an optimum of that shape exists at all on a given cluster. I am not claiming vLLM's runs sat in the dead zone. I am not claiming they sat above it either. The excerpts do not fix the cluster class, so neither claim is available to me, and neither is available to a reader trying to reason from the published sign.

What the release does not do is place its own hardware against the variable the roofline work isolates. That silence is the finding. A sign published without its fabric is a result about one cluster reported in a unit that looks portable, and the per-die framing in [s3] makes it look more portable still, because tokens/s/die reads like a hardware-normalised quantity when the thing it is normalised against is the part that varies.

> [!CONFIRMED]
> On standard clusters, increasing the FFN instance count fails to improve HFU because scale-out bandwidth caps the computational workload, and that limitation diminishes on superpod-class hardware with abundant interconnect bandwidth and on models with coarse-grained experts and lower sparsity [s4].

> [!INFERRED]
> My reading: disaggregation is a decision about the fabric under your racks, and it lives on the procurement cycle that bought that fabric. Treating it as a serving-config choice hides the timescale of the commitment you are actually making.

## The failure mode nobody benchmarked

AFD's discrete node-level scaling incurs higher imbalance penalties than EP's continuous batch adjustment [s4]. In the paper that is a throughput statement. In production it becomes a utilisation statement, and the two come apart under any load that is not steady.

Real arrival is bursty. Expert parallelism absorbs a burst by widening a batch, which is continuous and costs nothing you have not already provisioned. AFD absorbs the same burst only if you provisioned enough FFN nodes ahead of it, because the unit of adjustment is a node. Between those two behaviours sits the failure mode I would name explicitly for anyone piloting this: idle silicon under bursty arrival at node granularity. When the attention side saturates and the FFN side does not, the slack is a whole node of accelerators you already own, and it stays idle for the length of the trough.

Every published number in this space is a steady-state measurement, and a steady-state measurement cannot surface that. It reports a mean, and the mean is precisely where the imbalance disappears. What the benchmark measures and what the topology choice costs you are two different quantities, and only the first one gets published.

## The strongest case for AFD

The counter-position is real, and it deserves stating at full strength before I answer it. Under strict TTFT/TPOT SLOs, AFD sustains around 4k tokens/s of system throughput on DeepSeek-V3.2 across chat, coding and agentic-coding workloads, where non-AFD deployments are infeasible [s5]. Infeasible is a strong word and it looks like the right one here: that result marks out a region of the design space which only opens once you disaggregate. Anyone dismissing AFD as complexity theatre has to explain that region away, and I do not think it can be explained away.

My answer is about scope rather than validity. A feasibility result at one design point is a statement about that design point's hardware and model granularity. The conditions that make such a point reachable are the ones the roofline analysis isolates [s4], and the captured excerpts fix neither the cluster class behind the vendor's runs nor the one behind the design-space study. The result stands, and it travels exactly as far as its hardware does.

> [!WARNING]
> A strict-SLO feasibility result does not settle throughput portability. If your SLOs do not already make non-AFD deployment infeasible, that regime is not the one you are operating in, and the throughput question comes straight back.

## The decision rule I would apply

Expert parallelism stays my default, and it stays there until three things are established on the hardware that will actually serve the traffic. Coarse-grained experts with lower sparsity are the side of [s4] where AFD has room to work, while a fine-grained, high-sparsity MoE falls on the side where the ceiling arrives early, so model sparsity and expert granularity settle whether the mechanism is available to you at all. Your interconnect class then settles whether it pays, because on the scale-out fabric a standard cluster ships with, the independent FFN scaling AFD sells you is the exact mechanism [s4] says stops improving HFU. What remains is a measurement on your own cluster, taken before any published delta enters a decision.

```bash
vllm bench serve \
  --model <your-model> \
  --dataset-name random \
  --num-prompts 2000 \
  --request-rate 12
```

A finite request rate is what I use to get an arrival process instead of a back-to-back flood, and the flood is the regime in which the imbalance penalty stays invisible. Run it against both topologies at a fixed SLO. Read tokens/s/die rather than aggregate throughput, so a larger node count does not flatter the winner. Record per-node utilisation across the whole run and keep its variance, not only its mean, because the variance is where a node-granular topology bills you.

The vendor's numbers are sound as reports of the vendor's runs. Their reach is what stays open, and it stays open until you have measured your own fabric against the conditions in [s4]. Until that measurement exists, expert parallelism is the configuration I would keep in production. The +11.3% belongs to the cluster that produced it.
