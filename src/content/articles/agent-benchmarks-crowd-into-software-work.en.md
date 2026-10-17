---
translationKey: agent-benchmarks-cover-little-of-the-work-your-agent-does
lang: en
slug: agent-benchmarks-crowd-into-software-work
title: Agent benchmarks crowd into software work, so map your own
publishDate: 17-10-2026
tags:
- evaluation
- agents
category: essays
difficulty: 3
sources:
- label: Mercor, A benchmark map of the US economy (occupation coverage)
  url: https://www.mercor.com/research/labor-index/benchmark-map/
  date: 17-10-2026
- label: Wang et al., How Well Does Agent Development Reflect Real-World Work? (scope)
  url: https://arxiv.org/html/2603.01203v2
  date: 06-03-2026
contentHash: sha256:25ce96d03c468c33
publishState: published
---


I think the headline estimate of how little work agent benchmarks cover is softer than it looks, and the decision it points to holds anyway. Mercor's benchmark map finds that only 208 of 923 occupations have a task with at least 5 benchmark prompts, and that 6 of 22 job families have no such occupation [s1]. Mercor's findings suggest that 90% of American working hours go to tasks with little or no coverage from existing benchmarks [s2]. Wang et al. find that agent development tends to be programming-centric, out of step with the categories where human labor and economic value are concentrated [s13]. If your agent works anywhere outside software, I would not let a leaderboard rank choose its model.

## Two maps, one shape

Two teams counted different benchmark sets and found the same skew, and I think the direction is the part of this worth trusting. Mercor started from a list of 29 benchmarks selected for their quality and economic relevance [s19]. Mercor concludes that it is very hard to know how good AI models are at the work Americans actually do [s3].

The paper Mercor credits for its method is the one by Wang et al., with Zora Z. Wang as first author [s27]. Wang et al. analyse 43 benchmarks and 72,342 tasks against all 1,016 occupations of the U.S. labor market [s12]. In Wang et al.'s data, agent benchmarks concentrate heavily in the computer and mathematical domain, which accounts for only 7.6% of U.S. employment [s14]. Wang et al. also find management, legal work, and architecture and engineering highly digital (88%, 70% and 71%) yet sparsely covered, at 1.4%, 0.3% and 0.7% of all 19,179 examples [s15].

Even the map that corrects for the skew starts by admitting it. Mercor caps its list per job family in significant part, it says, to account for the massive overrepresentation of software engineering and research tasks in popular benchmarks [s7].

The skew is a claim about domains, and the agreement Wang et al. measured grades domain and skill labels. The hours figure is built task by task.

Mercor argues that benchmarks are designed to measure AI progress, and that AI progress is most plausible on the most AI-exposed tasks [s25]. Mercor writes that this is why benchmarks are full of Software Engineering and Financial Analysis tasks while sparse on Truck Driving and Gas Plant Operation [s9].

| Dimension | Mercor's map | Wang et al. |
| :--- | :--- | :--- |
| What gets tagged | each benchmark prompt, to O*NET tasks, by an LLM judge [s4] | benchmark tasks, to domains and skills, by LLM annotation [s16] |
| Human check | expert tags on its own APEX benchmarks [s21] | a random sample of examples [s28] |
| Stated caveat | provisional, with a downward bias from an incomplete list [s8] | software benchmarks miss domain nuances [s32] |

Two maps, one shape.

## One tagger behind both numbers

One map borrowed the other's instrument, so I read their agreement as weak evidence. Mercor has an LLM judge tag each benchmark prompt with as many O*NET tasks as it thinks correspond to it, following Wang et al. [s4]. Mercor says it is indebted to Wang et al. for that tagging methodology [s5]. Wang et al. built their own mapping with LLM-based annotation and a manual quality check [s16].

Each study checked its tagger by hand, on different ground. Wang et al. tested the mapping on 90 randomly sampled examples [s28]. Two independent human annotators and the model reached agreement rates of 90.9% and 89.3% for domain and skill mapping, which Wang et al. read as a sign that the mapping is reliable [s29]. Mercor validates its tagging against human expert tags on its own APEX benchmarks [s21], which it can map because it has access to their held-out prompts [s20].

In Mercor's map, an O*NET task counts as covered once the LLM judge has tied it to at least 5 prompts from the 29 benchmarks [s22]. I read every coverage count in the map as a count of LLM decisions.

> [!CONFIRMED]
> Mercor gets its hours figure by combining its coverage estimates with Hatgis-Kessell et al.'s LLM-derived estimates of the working time share of each O*NET task [s23].

> [!INFERRED]
> My reading: the hours figure rests on two layers of LLM judgment, one deciding which tasks a prompt covers and one estimating how long each task takes. Wang et al.'s agreement check grades domains and skills, a coarser unit than the O*NET tasks Mercor tags, so I would not carry it over. And two maps that share a method cannot check that method against each other.

The number is soft.

## The list decides what counts as covered

Someone chose the list, and Mercor says its own choices move the estimate. Mercor capped the benchmarks per job family to maximize breadth of coverage, and says this makes its economy-wide estimate more accurate at the cost of biasing down coverage in the most-benchmarked job families, software engineering among them [s24]. Mercor also writes that any incomplete list will bias down estimates of economic coverage by an amount that is difficult to bound, which is why it calls its results provisional [s8].

The undercovered work is concrete. Mercor's initial list heavily covers the tasks of AI-exposed lawyers and barely touches those of legal secretaries or court clerks, who are similarly exposed to AI [s26]. Mercor describes the long tail of smaller, middle-income knowledge work jobs as appearing undercovered [s10].

I expect the leaderboard a team actually reads to be a third list, with no cap holding software back, and so to lean harder toward software than either map does. Even a covered task gives an optimistic signal, because Mercor notes that benchmarks often overstate LLM performance in real-world deployments [s11].

I call the result **coding-proxy selection**: choosing the model for an agent that does someone's non-software job by a leaderboard rank whose prompts come largely from software work. A team building an agent for court clerks would pick its model on evidence drawn from another profession. The rank measures someone else's job.

## Where the tagger hesitates

The paper's own example of a hard case is the exact question this argument turns on. Wang et al. report that the remaining disagreements are relatively minor and arise mostly from under-specified natural language task descriptions [s30]. Their example is a music recommendation system, which Wang et al. say could map to the Media domain for its content or to the Computer and Mathematical domain because building it typically involves programming [s31].

I read that example as the transfer question in miniature. An agent that builds the recommender does media work through code, and whether that counts as coding or as the domain is the call the tagger finds hard. Wang et al. raise the transfer point themselves: software can perform tasks across a wide variety of domains, so software engineering ability has the potential to accelerate other kinds of work [s17].

In my reading, the same boundary moves the coverage figure in both maps and the model choice in your team. Label the recommender as media and it looks undercovered; label it as code and it inherits every coding benchmark on the board.

## The strongest case against

I think the case for the leaderboard is stronger than its critics allow. Benchmarks go where AI progress is plausible, as Mercor itself argues [s25]. Wang et al. note that software engineering ability could accelerate other work [s17]. And Mercor calls its own results provisional, pulled down by an incomplete list in a way it finds difficult to bound [s8]. On that reading, I think a software-heavy leaderboard is the best proxy available, and the real gap is smaller than the hours figure suggests.

If your agent's work really is software, I accept the leaderboard as a fair proxy.

Wang et al. answer their own point: the concentrated focus overrepresents a domain that accounts for only 7.6% of total employment, and general-purpose software engineering benchmarks do not fully capture the domain-specific nuances of many other areas of work [s32]. My reading adds a second answer: transfer is the kind of case Wang et al. found ambiguous in their music example, so the steelman's best argument is also the one no public number can check for your tasks. I think the downward bias Mercor describes changes the size of the gap without telling a team whether its own tasks sit in the covered part, since Mercor finds that bias difficult to bound.

A second objection says the shared instrument changes nothing, because any tagger would find the same skew. I grant that the direction is coarser, and so sturdier, than the figure. I would answer that the instrument matters for the number, which is task-level and stacks a second LLM estimate, and the number is what travels into slides and model reviews.

Mercor also has a stake in the list. Mercor includes its own APEX benchmarks, for which it has access to held-out prompts [s6]. Its human check on the tagger ran on those same benchmarks. I read that as an interest to keep in view; nothing in the map is wrong because of it.

## Map your own task list

Reuse the instrument, keep its hand-check, and skip the headline number. Wang et al. propose three measurable principles for benchmark design: coverage, realism and granular evaluation [s18].

My procedure follows the two maps. Write the tasks your agent will do as O*NET-style task statements. Have an LLM judge tag each public prompt you rely on to those statements, constrained to your list so the strings match exactly. Hand-check a random sample of the tags, as Wang et al. did, before you trust any count. Then count prompts per task.

Mercor's bar for a covered task is at least 5 tagged prompts [s22]. I would keep the same bar.

```bash
# tasks.txt: your agent's tasks as O*NET-style task statements, one per line
# tags.jsonl: one {"prompt_id": ..., "task": ...} object per tag your LLM judge emitted
comm -23 <(sort -u tasks.txt) <(jq -r '.task' tags.jsonl | sort -u) > uncovered.txt
jq -r '.task' tags.jsonl | sort | uniq -c | sort -n > prompts_per_task.txt
# hand-check a random sample of tags before trusting either file
sort -R tags.jsonl | head -n "$SAMPLE" > to_review.jsonl
```

The file `uncovered.txt` lists the tasks no public prompt touches, and the top of `prompts_per_task.txt` lists the thin ones.

> [!WARNING]
> I would read every uncovered task as a build order for your own eval. Check the boundary rows by hand first: a task that mixes code and domain work is the kind of case Wang et al. found ambiguous.

Measure the job your agent does.
