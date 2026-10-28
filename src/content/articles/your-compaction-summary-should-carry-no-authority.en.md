---
translationKey: compaction-summaries-carry-no-authority
lang: en
slug: your-compaction-summary-should-carry-no-authority
title: Your compaction summary should carry no authority
publishDate: 28-10-2026
tags:
- agents
- agentic-coding
category: essays
difficulty: 4
sources:
- label: 'arXiv 2610.29869, Compaction Laundering: Provenance Destruction in Context-Compacting
    Coding Agents'
  url: https://arxiv.org/abs/2610.29869
  date: 21-10-2026
- label: arXiv 2610.31778, Benchmarks Are Surprisingly Compaction-Friendly
  url: https://arxiv.org/html/2610.31778v1
  date: 22-10-2026
- label: 'hermes-agent issue #144835, forged role labels launder through compaction'
  url: https://github.com/NousResearch/hermes-agent/issues/144835
  date: 26-10-2026
- label: 'Claude Code issue #96422, custom instructions lost across context compaction'
  url: https://github.com/anthropics/claude-code/issues/96422
  date: 23-09-2026
- label: 'Copilot CLI issue #4687, instruction files not preserved across compaction'
  url: https://github.com/github/copilot-cli/issues/4687
  date: 01-09-2026
contentHash: sha256:48add9ac06325da4
publishState: published
---


I think an agent should come out of compaction holding no approval and no rule it cannot trace to a typed user turn or re-read from a file. Coding agents that run long enough must compact their context, summarizing the conversation, discarding the original, and carrying the summary forward as memory [s22]. A recent paper shows that in popular open-source coding agents this step is an exploitable trust boundary [s1]: an attacker who controls anything the agent reads can forge a user turn that survives compaction as a genuine instruction [s3].

Harnesses that flatten the typed conversation into a single plain string, marking each message with a text label such as `[User]:`, destroy message provenance in code, before the summarizer runs [s2]. The fix on record is to escape those labels. In my reading that is the floor. The summary fails as a carrier of authority in both directions, inventing instructions nobody gave and losing the ones somebody did, and I would stop asking it to carry any.

## A forged approval that outlives the conversation

The paper's headline split follows one design choice. Across five flattening harnesses (pi, opencode, Cline, Aider, OpenHands) the forged approval launders into the agent's memory 87-100% of the time, up to a ~908,000-token context window; across four role-typed harnesses (Codex, Gemini CLI, Qwen Code, Continue) the identical attack succeeds 0% of the time [s4]. Those rates belong to the harnesses the paper tested. Since the attack is identical on both sides, I read the split as a statement about serializers.

The laundered text then does real work. A laundered standing approval drives real tool-running agents to execute an attacker-controlled `curl | sh` in a sandbox, and end to end in the live pi TUI at ~50% against a 0% paired clean arm [s23]. The same channel reliably steers an agent's plan away from a file an attacker designates off-limits, which can blind a code review to a planted backdoor [s24]. I find the second result the more unsettling one. What the forged turn carried there was a rule, and the agent followed it like a rule the user had set.

An issue filed on another harness reads that harness's code and finds the same shape. It asks to escape turn-label sequences in summary-transcript serialization because forged role labels launder through compaction [s13], and it states that when the serializer is fed a tool record whose content contains a forged label, the label survives [s14]. The issue takes its threat model from the paper [s33]. I count it as a second reading of the mechanism on different code, and I give it no rate of its own.

## Escaping fixes one encoding

Both records propose the same two repairs. The paper says the defect has a straightforward fix at the serializer, escaping the role labels before flattening, and that the role-typed harnesses avoid it entirely by keeping messages role-typed [s6]. The issue proposes the escape and names a structural alternative: pass role-typed messages to the summarizer and drop the join [s15]. It also ranks the two itself: the escape is the minimal hardening, and the structural change would supersede it [s31].

I would ship typed input wherever I could, and the issue shows why from its own side. An escape covers the label shapes someone thought to list, and the same document declares a path it leaves alone: `codex_runtime_history_seed.py` renders labels differently and was not modified [s32]. Typed input removes the boundary class. An escape patches the spellings it knows.

The issue also names a failure mode I now look for in every guard. The harness already had a provenance guard, `_validate_summary_user_provenance`, and it early-returns whenever the transcript contains any real user turn, so it does not cover this vector [s30]. I call this a skipped guard: it reads as coverage in a code review and switches itself off in the ordinary case, a session where the user has typed something.

The strongest argument for stopping at a code fix comes from the paper. Because provenance is destroyed deterministically in harness code, no prompt-level defense can restore it, and a code-level provenance check catches 77% of laundering while demoting 2% of legitimate summary content [s5]. I would call that settled if the summary only ever carried approvals.

## The same summary drops the rules you did give

The second failure runs the other way. A separate study puts the premise plainly: compaction is generally lossy by design, and agents can silently lose task constraints, instructions, or their reasoning behind earlier decisions [s7]. On ProgramBench, the first compaction summary already drops on average about one of the task's three anti-cheating rules, and the loss grows with the number of compactions [s10].

Sessions with a human in them show where the loss lands. In real user-agent sessions, compaction keeps around 81% of user constraints, but instructions about how to work and what not to do are dropped about 6 times more often than specifications of what to build [s11].

Two practitioner reports describe the same loss from inside a session. In the first, the model continues from a lossy summary and silently stops honouring rules that exist only in instruction files [s16]; it then violates rules present in those files and absent from the summary (read the whole thread, zero autonomy, no unauthorised writes) while believing it was operating normally [s17]. The report adds that compaction is invisible to the user [s18]. In the second, context compaction occurred mid-session [s20], and afterwards the agent committed directly to main twice, violating the rule it had followed earlier [s36]; it had no indication the rule still applied and never re-read AGENTS.md after compaction [s21].

One request shows up on both sides.

> [!CONFIRMED]
> In the harness the issue reads, the summarizer's template explicitly asks it to record "corrections the USER gave" [s28]. In the study, the authors' summarization prompt explicitly asks for constraints that should persist, and they are dropped anyway [s25].

> [!INFERRED]
> In my reading this is one design error seen from two sides. A summarizer told to record what the user said will record a forged user line as faithfully as a real one, and a summarizer told to keep the rules keeps some of them. Asking harder repairs neither, so I would stop asking the summary to carry authority at all.

## Treat the boundary as a session boundary for authority

The rule-file half of the default is already on record in both reports. The first report asks for a compaction boundary to be treated as a session boundary for instruction loading, with project instruction and memory files re-read at the boundary and never inherited through a summary [s19]. The second suggests either re-injecting the current contents of active instruction files such as AGENTS.md and CLAUDE.md at compaction, or requiring the agent to re-read them before it resumes file-editing or git work [s35]. Two separate reports reach the same rule, and I adopt it as they wrote it.

My extension is to approvals, and the issue supplies the reason. In the harness it reads, the committed summary re-enters history as a role-typed user/assistant handoff [s29]. In my reading, a typed user turn after the boundary can then be the summary itself speaking in the user's role. I count an approval only from a user turn the human types after the boundary. At the boundary the harness does four things:

```python
# my sketch: after compaction, authority comes from files and fresh user turns only
def on_compaction(session, summary):
    session.history = [state_note(summary)]             # the state of the work, and nothing it grants
    session.approvals.clear()                           # standing approvals end at the boundary
    session.rules = load_rules(session.rule_snapshot)   # re-read from the files pinned at session start
    for action in session.pending_actions():
        session.ask_user(action)                        # re-asked in the first turn after compaction
```

The summary still says what was built and what comes next. Nothing written in it counts as an approval or a rule, however it is phrased, so a line like "next step: push to main" is a plan the agent proposes, and the push waits for a fresh approval.

> [!WARNING]
> A comment on the first report asks whether compaction should reload current files or restore the session-start snapshot [s34]. I would restore the snapshot. I think an agent that a forged turn can steer away from a file can be steered into editing its own instruction file, and reloading current files would promote that edit to a rule at the next boundary. In my setup, a change to a rule file during the session needs a typed approval before any reload picks it up.

Here is how I weigh the repairs against the ways a summary goes wrong.

| Repair | Forged approval | Forged rule | Real rule dropped | Rule given mid-session |
| :--- | :--: | :--: | :--: | :--: |
| Escape role labels | listed shapes only | listed shapes only | no effect | no effect |
| Role-typed summarizer input | closes | closes | no effect | no effect |
| Code-level provenance check | partial | partial | no effect | no effect |
| Summary carries state only, rules re-read from the snapshot | no effect | closes | closes | no effect |
| Pending approvals re-asked after the boundary | closes | no effect | no effect | no effect |
| Mid-session rules written to a rule file | no effect | no effect | no effect | closes |

No single row covers every column; in my weighing the snapshot re-read, the re-ask and the rule file cost little and hold whichever serializer a harness turns out to have.

## Where this costs you

The case against me starts with the same study. For the two 1M context models, the compaction threshold does not measurably affect the task performance [s8], no compaction method outperforms default self-summarization, and methods that discard more content cost some models up to 20 points [s9]. On the laundering side, the code-level check already catches most of it by the paper's measure [s5], and against the four role-typed harnesses the identical attack succeeded 0% of the time [s4]. Read together, compaction looks cheap to keep, typed input looks like the whole answer, and a re-ask buys nothing.

My answer to the first half belongs to the study. The authors argue that current benchmarks are compaction-friendly: the objective is fixed and the agent's progress stays on disk, so most of what compaction discards can be recovered, except constraints that exist nowhere else [s27]. Constraints that describe the deliverable can be recovered from the agent's own artifacts, and constraints that describe how the agent should behave cannot [s12]. I read a flat task score as silence about the rules, which is what that mechanism predicts.

To the second half I concede the order: ship typed input first. I still would not stake an approval on it. A team does not know its serializer is typed until someone has read the code, and the issue on another harness states that a forged label survives its serializer [s14] and declares a path its own escape leaves alone [s32]. The re-ask does not depend on that reading. It costs one turn, and a forged turn survives compaction as a genuine instruction [s3].

The default has two costs I accept. One is the extra turn whenever an approval was pending at the boundary. The other is persistence work. The user can add or change instructions as the session grows, and most of this is never persistent anywhere [s26], so a rule given mid-session has no file to re-read. My default protects it only once the harness appends it to a rule file the moment the user states it, pinned under the same snapshot rule.

The rates in this piece hold for the harnesses the paper tested. I would apply the boundary rule to any harness I run, because it does not need me to know which side of that split mine falls on.
