# D-008 — Human voice: free structure, deterministic voice rules, a reader judge, runs without auto memory

**Status.** Accepted 2026-11-18. Source: owner review of the published corpus ("the articles sound like AI slop, they all look alike, the titles join two ideas with ', et'").

## Decision

- **Voice target:** posts read like the personal technical blogs engineers subscribed to before generative AI (Julia Evans, Dan Luu, Bob Nystrom, Hillel Wayne, Fabien Sanglard; Sam et Max, Stéphane Bortzmeyer, Ploum, sebsauvage): useful first, not self-serious, a person audible in every paragraph. `pipeline/house_style.md` is rewritten around the habits observed in 25 such posts, and gains a section on titles.
- **No mandated structure:** the radar's required `## What changed` / `## Impact on your team` sections are gone; the verdict pair, the table and a dedicated objection section are optional in essays. The argument decides the shape.
- **No mandated opinion markers:** a sentence without `[sN]` is the author's judgment. The fact-check judge only ever reads the claim-to-source map, so the "I think" / "à ma lecture" labels had no mechanical reader.
- **Citations follow the point:** the author's sentence first, `[sN]` after the fact; a source is named in prose once, when who said it matters.
- **Deterministic voice rules** (`pipeline/voice/rules.py`) block the countable tics in both pipelines: title over 70 characters or joining two clauses, opinion markers and attribution constructions above a per-1000-words allowance, the same `[sN]` twice in a paragraph, a `##` heading already used by two of the 30 most recent publications.
- **Reader judge** (`pipeline/voice/judge.py`) replaces the generic `style-auditor`: a fresh sub-agent on the run's model reads human reference posts (`pipeline/voice/references.yaml`, texts cached locally by `pnpm voice:refs`), then the draft, and answers one question: would a reader of those blogs take this for a person? The radar pipeline now runs it too, and its publish stage requires two `clean` verdicts.
- **Runs do not use Claude Code auto memory:** the runner sets `CLAUDE_CODE_DISABLE_AUTO_MEMORY=1` and writes `autoMemoryEnabled: false` into each run directory's `.claude/settings.json`.
- **The runner pins its interpreter:** cpe is launched with `sys.executable` and that interpreter's directory is first on `PATH` for the run.

## Why

Measured on the published corpus (182 articles, 202 radar briefs), comparing the 60 oldest pieces of each kind with the 60 newest:

| | Oldest 60 | Newest 60 |
| :--- | ---: | ---: |
| Radar title length, median characters | 83.5 | 155 |
| Radar opinion markers per 1000 words, median | 0 | 7.2 |
| Essay citations per 1000 words, median | 5.6 | 22.2 |
| Essay opinion markers per 1000 words, median | 0 | 5.2 |

Half of all radar titles (101 of 202) contain ", et" or ", and". In the newest 60 essays, 56 carry a CONFIRMED/INFERRED pair and 44 a table.

The model was not the cause (Opus 5.5 throughout). The prose drifted because every gate checked traceability and none checked readability, the house style itself mandated opinion labels and "citations precede prose", and the runs read and wrote the repository's auto memory: 365 self-generated lessons, many of them teaching later runs to add attribution screens, to place opinion markers, and to treat the style auditor's flags as noise. The auditor checked a generic list of tells (em-dash, "delve") that the corpus no longer contained.

Both pipelines had also failed daily since 2026-11-12: Homebrew's `python3` moved to 3.15, where PyYAML is not installed, and cpe's launcher resolves `python3` from `PATH`.

## Consequences

- Almost every already-published radar brief fails the new rules; they are left as published. The rules apply to new drafts.
- A fresh clone needs `pnpm voice:refs` once before the reader judge has references to read.
- Runs lose the operational lessons stored in auto memory (sites that block fetches, API quirks). A lesson worth keeping belongs in a prompt or in code.
- `PIPELINE_EMBEDDER` is `fake` in the installed launchd jobs while `DEPLOY_RUN_ENV` says `real`; topic dedup is therefore weaker than designed. Not changed here.

## What we did NOT pick

- **A CLAUDE.md or new skills.** The text that governs drafting is the `persona_file`; a second instruction surface would compete with it.
- **Changing the drafting model.** The same model produced the June corpus, which does not show these tics.
- **Purging the memory entries one by one.** The loop that wrote them would write them again.
- **Committing the reference posts.** They are third-party writing; the repository holds pointers only.
