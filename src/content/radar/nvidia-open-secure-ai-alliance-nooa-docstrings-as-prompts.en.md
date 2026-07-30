---
translationKey: nvidia-open-secure-ai-alliance-nooa
lang: en
slug: nvidia-open-secure-ai-alliance-nooa-docstrings-as-prompts
title: NVIDIA takes its agent framework into a new security alliance, where docstrings
  are the prompts
publishDate: 30-07-2026
kind: tool
tags:
- NVIDIA
- NOOA
- agents
- security
summary: NVIDIA announced the Open Secure AI Alliance on 27 July 2026 and named agent
  harness research among what it contributes. That research is NOOA, an Apache 2.0
  framework in which a docstring is a prompt. Its paper was submitted to arXiv on
  22 July 2026, so the paper predates the alliance by five days.
sources:
- label: Primary - NVIDIA blog, Open Secure AI Alliance announcement
  url: https://blogs.nvidia.com/blog/open-secure-ai-alliance/
  date: 27-07-2026
- label: Independent corroboration - The Hacker News on the alliance, NOOA's Apache
    2.0 licence, and the absent labs
  url: https://thehackernews.com/2026/07/nvidia-forms-37-member-open-secure-ai.html
  date: 27-07-2026
- label: Independent corroboration - implicator.ai on the absent labs and the older
    Coalition for Secure AI
  url: https://www.implicator.ai/nvidia-second-ai-security-alliance-openai-absent/
  date: 27-07-2026
- label: NOOA paper abstract, arXiv 2607.20709
  url: https://arxiv.org/abs/2607.20709
  date: 22-07-2026
- label: NOOA paper full text, Figure 1 and the linked implementation repository
  url: https://arxiv.org/html/2607.20709v1
  date: 22-07-2026
contentHash: sha256:c8b6c5f68e8476a9
publishState: published
---

## What changed

NVIDIA announced the Open Secure AI Alliance on 27 July 2026, naming agent harness research among its contributions. That research has a public repository: NOOA, which The Hacker News calls an Apache 2.0 research framework designed to make agent behavior easier to test, trace, audit, and govern. NVIDIA's page says the project "is now available on GitHub", which reads like a first release. It is not one: the NOOA paper went up on arXiv on 22 July 2026 and already links `nvidia-nemo/labs-OO-Agents`, so that sentence re-announces a repository the paper cited five days earlier.

## An agent is a Python object

The paper describes a programming model that folds prompt templates, tool schemas and workflow graphs into one class: methods are the actions, fields are state, docstrings are prompts, annotations are contracts, and a method whose body is `...` is completed at runtime by an LLM-driven agent loop. Normal bodies stay deterministic Python.

```python
class SupportAgent(Agent):
    """You are a support agent for a customer service system."""

    order_db: OrderDB

    def is_refund_eligible(self, order: Order) -> bool:
        """Return whether an order is eligible for a refund."""
        return order.delivered and order.days_since_delivery <= 30

    @strategy(PredictStrategy())
    async def classify(self, message: str) -> TicketKind:
        """Classify the customer message into the best ticket kind."""
        ...

    @strategy(CodeActStrategy())
    async def triage(self, message: str, photo: Image | None, order: Order | None) -> Ticket:
        """Triage a customer message and create a support ticket."""
        ...
```

Read that listing as a diff rather than as documentation. `is_refund_eligible` is ordinary code your tests already cover; `classify` and `triage` are prompts wearing a method signature. I think that is where the value and the exposure both sit: prompt text lands in pull requests.

## The alliance without the model labs

The Hacker News records OpenAI, Google and Meta as absent from the inaugural membership list, and Anthropic on neither list as of 27 July 2026; implicator.ai places all four inside the older Coalition for Secure AI. That shape sets the reading, I think: the open agent-security stack is being assembled at the infrastructure layer, without the labs whose harnesses it aims to inspect.

> [!IMPORTANT]
> A docstring in NOOA is a prompt, so a docstring tidy-up is a behavior change that no
> linter or type checker will flag. The founding-member count is unsettled too: The Hacker
> News writes "NVIDIA and 36 other organizations", implicator.ai reports 27 founding
> members from trade press. Say which you cite, and that they disagree.

## Impact on your team

Two groups should care: teams choosing an agent framework, and teams whose prompts live in template files. If you adopt NOOA, decide now who reviews docstring diffs and label them prompt changes in the review checklist; your conventions treat a docstring edit as a comment and wave it through. I would ignore the membership roster and wait for independent evidence about the API, since every claim about the programming model comes from NVIDIA's own paper.
