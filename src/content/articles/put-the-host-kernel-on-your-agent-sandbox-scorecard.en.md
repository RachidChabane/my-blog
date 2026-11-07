---
translationKey: agent-sandbox-strength-is-host-kernel-patch-lag
lang: en
slug: put-the-host-kernel-on-your-agent-sandbox-scorecard
title: Put the host kernel on your agent sandbox scorecard
publishDate: 07-11-2026
tags:
- agents
- agentic-coding
category: essays
difficulty: 4
sources:
- label: OpenAI, A thousand fewer paths to root
  url: https://openai.com/index/a-thousand-fewer-paths-to-root/
  date: 04-11-2026
- label: 'pwn.ai, Firecracker VM Escape: PwnEscape Part 2'
  url: https://pwn.ai/blog/firecracker-escape
  date: 07-11-2026
- label: Vercel, findings from the $1M Vercel Sandbox challenge
  url: https://vercel.com/blog/findings-from-the-1-million-dollar-vercel-sandbox-challenge
  date: 14-10-2026
- label: CSO Online, KVM escape exposes broader attack surface in Linux networking
  url: https://www.csoonline.com/article/4237999/kvm-escape-exposes-broader-attack-surface-in-linux-networking.html
  date: 20-10-2026
- label: 'Andronchik and Lokhmakov, AI Code Sandboxes: A Comparative Security Study,
    Part 1 (arXiv 2606.08433)'
  url: https://arxiv.org/abs/2606.08433
  date: 07-06-2026
contentHash: sha256:8a5827b72f859a9a
publishState: published
---


I think an agent sandbox scorecard needs a row for the host kernel: its version and how fast the vendor rebuilds it. CSO Online [s41] traces the PwnEscape bug to the Linux networking code that handles traffic from inside virtual machines, outside the KVM hypervisor itself [s11], and reports that updating only the guest VMs does not fix it [s12]. Vercel says the host memory leak was demonstrated against its production sandboxes [s29]. I read that as an exposure that only the host kernel's version can show.

## What the sandbox study already settles

The comparison I want to extend has already moved once, and a study moved it. The sandbox study finds that engine classes (microVM, userspace kernel, OCI container) separate cleanly on every architectural axis, while products within a class do not [s14]. Its central finding is that product pin policy is the dominant operator-facing variable: engine-side patch latency sits near 0 days for coordinated disclosures, while downstream lag spans 0 days to 471+ days [s15]. The study concludes that class-level isolation does not predict downstream lag, so the two have to be combined [s21]. The pins it measures are engine pins, and its sharpest example is a pin that never moved: arrakis pinned Cloud Hypervisor at v44.0 and has not bumped since [s24].

That shift, from grading a product by its isolation class to grading how it pins its engine, belongs to the study, and I build on it.

Every pin in that comparison belongs to an engine. I think that is where the scorecard runs out.

## An entry point on the host

I think the study's own per-class model shows where the gap sits. The first two columns are the study's reading of a host-kernel CVE; the third is the pin I would ask about.

| Engine class | What a host-kernel CVE does, per the study | The pin I would ask about |
| :--- | :--- | :--- |
| Container (runc) | Full surface: every host-kernel CVE reachable from unprivileged userspace applies [s17] | Host kernel version and rebuild time |
| microVM (Firecracker, Cloud Hypervisor, libkrun) | Partial via guest kernel only; escape only if the VMM has its own surface bug [s18] | Engine pin, guest kernel, and the host kernel that parses guest traffic |
| Userspace kernel (gVisor) | Minimal: generally not reachable via the syscall path [s20] | Engine pin first, then the host kernel |

My third column is longest on the microVM row: a microVM adds a guest kernel to the path and keeps the host kernel in it, so the buyer inherits a pin for each.

The study is candid about its own limit: its engine-level CVE counts do not include the shared-kernel exposure, which it reports as an aggregate baseline [s23]. In my reading, that baseline is an open slot. A per-vendor host kernel row fills a hole the study names itself, and it says something an aggregate cannot say about any single product.

The case that tests the microVM row comes from Vercel. Its design puts each sandbox on its own Firecracker microVM with a dedicated guest kernel [s7], and Vercel says no guest shares a running kernel with the host or with another tenant [s31]. Against that design, Vercel reports, a HackerOne researcher working from a standard sandbox with no special access found a defect in the Linux kernel's networking stack [s32]. Vercel also notes that almost every major cloud provider isolates customer workloads on this same layer of the Linux kernel, so any defect there is shared-infrastructure risk [s6].

CSO Online adds the precondition: the guest-to-host attack needs an attacker-controlled workload able to supply the malformed traffic through the virtual network [s34]. I think that precondition describes the job of an agent sandbox, which exists to run code that nobody has reviewed and that a model may have written under an attacker's instructions. The PwnEscape write-up says its Part 1 introduced the host memory primitive behind this work [s28]. On the fix, CSO Online reports that it was merged into the mainline Linux kernel, with patched kernel versions for multiple distributions [s36], and the researchers warn that similar bugs could exist elsewhere in the networking stack, wherever guest-controlled metadata can modify packet fields after validation [s37].

As I read the three posts, they describe one bug, found from a standard Vercel sandbox during its challenge. In my reading its entry point is host kernel code that parses guest traffic, and the study's microVM row only counts a host kernel CVE when the VMM has its own surface bug. The fix ships as a host kernel, and no engine version records it.

> [!CONFIRMED]
> The study's microVM row says a host kernel CVE leads to escape only if the VMM has its own surface bug [s18]. CSO Online reports that the attack targets the Linux networking code that handles traffic from inside virtual machines [s11].

> [!INFERRED]
> In my reading, a host kernel that parses guest traffic is a boundary of its own, and its version appears in no engine pin and no guest kernel pin.

## Why the rebuild window matters

I read OpenAI's kernel report as a statement about time, since its exploits are local privilege escalations on a Linux distribution. The report, titled A thousand fewer paths to root [s40], says one run produced 948 working local privilege escalation exploits for a commonly used Linux distribution [s16], exploits that could let an unprivileged local user gain root access [s1]. The whole run cost $1,213,430 in API credits, or $1,279 per LPE exploit [s38]. Upstream moved fast: within 10 days, while the scan was running, over 100 Linux LPEs had been patched or had staging patches from other contributors [s4].

OpenAI draws the conclusion for defenders: a low-privileged account on an operating system behind on its patches should be considered functionally equivalent to root for a well-resourced threat actor [s2], and the report believes that even less capable models may be able to develop exploits once disclosed [s39]. At that price per exploit, I think the time between a published fix and a machine running it is the one interval a defender controls.

The virtualization side moves at the same pace. CSO Online counts multiple critical vulnerabilities this year in KVM and other kernel-based virtualization components, some found with the help of LLMs, PwnEscape among them [s13]. Vercel received 1,285 reports in two weeks and says researchers now hunt at AI speed [s33]; some steered their agents straight at the kernel boundary [s10]. The PwnEscape researchers, quoted by CSO Online, expect exploits working in default hypervisor configurations in under a month [s35].

In my experience a host kernel fix counts only once the host is running it, and getting there on a sandbox host means draining or migrating its guests. I think that scheduling cost explains why the host kernel is the pin most likely to sit still while the engine moves.

In my reading the upstream side already moves fast. The exposure lives downstream, with whoever rebuilds the host, and for a guest-to-host bug that rebuild is the whole fix.

## The strongest case against

The best objection says the containment held wherever it was switched on, and it deserves its full weight. The PwnEscape write-up says the researchers escaped a Firecracker microVM and got code execution as root on the host [s5]. The same write-up says the configuration had no jailer [s25], and that Firecracker was launched directly as root under `systemd-run`, so the controlled call ran as root on the host [s27]. It describes production containment as dropping privileges and restricting the process through namespaces and seccomp, and says a deployment using those controls needs a separate assessment of what is available after compromising the VMM [s26]. Vercel adds that the crash and code execution attacks were demonstrated on the researcher's own KVM and Firecracker machines matching its configuration [s30], and that no reports showed anyone accessing customer data in Vercel Sandbox [s8]. OpenAI itself calls sandboxes and isolation like Firecracker and gVisor important for limiting the blast radius of exploited vulnerabilities [s3]. So, the objection runs, root still needed a step past the VMM's containment, which is the condition the study's row encodes, and keeping the host patched is advice already given: Vercel recommends keeping host and guest kernels up to date [s9].

I concede the root escape. It ran without the jailer, as root, on the researchers' own machines, and I would not write that a production sandbox was taken over. Two things survive the objection. As I read the posts, the leak needed no takeover of the Firecracker process and was seen on production, and the fix ships as a host kernel. Keeping the host patched is advice to whoever runs the host. A buyer of a hosted sandbox runs nothing there and sees nothing there, so for that buyer the advice turns into a question, and a question every vendor must answer belongs on the scorecard.

## What I would ask a vendor

I would put the host kernel on the same sheet as the engine pin, and ask for both in writing.

- I ask a hosted vendor for the running host kernel version and the time from an upstream fix to a rebuilt, rebooted host, next to the engine pin and the guest kernel.
- I refuse `uname -r` run inside the sandbox as an answer. In a Firecracker guest it reports the guest kernel, and the study notes that operators choose the guest kernel independently of the host kernel [s19].
- On a self-hosted fleet, I run `uname -r` on each sandbox host and compare it with the newest kernel the distribution ships. The failure mode I look for first is installed and never booted: a patched kernel sitting in `/boot` that the host never rebooted into.
- I keep the jailer and the rest of the production containment; the write-up's own caveat is the reason.
- I treat a vendor that cannot answer the way the study treats one cloud-hosted product: opaque on the pin question [s22].

Engine class still decides which host kernel paths a guest can reach, since the study finds a host-kernel CVE generally not reachable via the syscall path of gVisor [s20]. So I add the row beside the class comparison and remove nothing from it. Self-hosting does not remove the row either; I think it makes the row yours to fill.
