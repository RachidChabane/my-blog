# Difficulty rubric (version 1)

<!--
  SINGLE SOURCE OF TRUTH for the 1-5 article difficulty rating.
  The pipeline reads this file on EVERY run and injects it verbatim into the
  draft prompt; the agent rates each article against it, never by ad-hoc
  judgment. The same file calibrates manual backfills. When the scale needs
  to change, change it HERE and bump the version line above; nothing else
  defines the scale.

  Consistency contract: a level must mean the same degree of difficulty
  across the whole blog, whatever the domain (an ML lesson, an agentic-AI
  news piece, an infra explainer). The scale is therefore anchored on three
  domain-agnostic axes: prerequisite knowledge, conceptual density, and
  math/code depth. Rate the ARTICLE AS WRITTEN (what the reader must already
  know to follow it), not the topic's reputation.
-->

Scale: 1 (easiest) to 5 (hardest). Shown to readers as stars (3 = three stars
out of five). FR and EN versions of an article always carry the SAME rating.

| Level | Meaning                                                                                                                                     | Prerequisites           | Math / Code                                 |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- | ------------------------------------------- |
| 1     | Accessible to anyone curious about AI. Plain language; a general reader can follow it end to end.                                           | None                    | None                                        |
| 2     | Light familiarity helps. Assumes basic AI vocabulary (model, prompt, training). Introduces one or two concepts gently.                      | Basic AI literacy       | Pseudocode or illustrative snippets at most |
| 3     | Intermediate practitioner. Comfortable with core ML/AI concepts and reading code. Covers architecture, trade-offs, or intuition-level math. | Working ML/AI knowledge | Real but readable code; light math          |
| 4     | Advanced. Fluent in the domain, reads non-trivial code/configs, knows current tooling. Detailed mechanisms and implementation patterns.     | Domain fluency          | Non-trivial code; formal reasoning          |
| 5     | Expert / research-grade. Dense formalism, novel techniques, papers, or low-level systems detail. Effortful even for specialists.            | Deep expertise          | Heavy math / low-level detail               |

## How to apply it

- Pick the level whose THREE cells all hold. When the axes disagree, take the
  highest axis: an article with no math but expert-only prerequisites is a 4,
  not a 2.
- Anchor questions, in order: (1) who can follow this without searching the
  web? (2) how many new concepts per section? (3) what is the densest code or
  math block asking of the reader?
- News pieces and Lessons use the same scale. A gentle ML-fundamentals Lesson
  is typically 1-2; a tooling deep-dive for practitioners is typically 3-4; a
  paper-dense survey is a 5.
- Round toward the reader: when torn between two levels, choose the HIGHER
  one, so a reader who trusts a low rating is never ambushed.
- The rating is an integer 1-5, identical in FR and EN frontmatter
  (`difficulty: 3`).
