---
translationKey: nvidia-open-secure-ai-alliance-nooa
lang: fr
slug: nvidia-alliance-open-secure-ai-nooa-docstrings-comme-prompts
title: NVIDIA emmène son cadre d'exécution d'agents dans une nouvelle alliance de
  sécurité, où les docstrings tiennent lieu de prompts
publishDate: 30-07-2026
kind: tool
tags:
- NVIDIA
- NOOA
- agents
- security
summary: 'NVIDIA a annoncé l''Open Secure AI Alliance le 27 juillet 2026 et cite parmi
  ses contributions ses travaux sur les cadres d''exécution d''agents. Ces travaux,
  c''est NOOA, un framework sous licence Apache 2.0 où une docstring tient lieu de
  prompt. Son article a été déposé sur arXiv le 22 juillet 2026 : il précède donc
  l''alliance de cinq jours.'
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
contentHash: sha256:d5de6e03050a7574
publishState: published
---

## Ce qui change

NVIDIA a annoncé l'Open Secure AI Alliance le 27 juillet 2026, en y apportant ses travaux sur les cadres d'exécution d'agents. Ces travaux ont un dépôt public, NOOA, que The Hacker News décrit comme un framework de recherche sous licence Apache 2.0 conçu pour rendre le comportement des agents testable, traçable, auditable et gouvernable. NVIDIA écrit que le projet est « désormais disponible sur GitHub », ce qui suggère une première mise à disposition. Il n'en est rien. L'article NOOA, déposé sur arXiv le 22 juillet 2026, pointait déjà vers `nvidia-nemo/labs-OO-Agents`, que la phrase du 27 juillet ne fait que réannoncer.

## Un agent est un objet Python

Selon l'article, le modèle ramène gabarits de prompts, schémas d'outils et graphes de workflow à une seule classe. Les méthodes sont les actions, les champs l'état, les docstrings les prompts, les annotations de type des contrats, et une méthode au corps réduit à `...` est complétée à l'exécution par une boucle d'agent LLM. Les corps ordinaires restent du Python déterministe.

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

Ce listing se lit comme un diff plutôt que comme de la documentation. `is_refund_eligible` reste du code ordinaire, couvert par vos tests, quand `classify` et `triage` sont des prompts déguisés en signature de méthode. À mon sens, l'intérêt et le risque tiennent au même endroit, le texte des prompts atterrissant dans les pull requests.

## L'alliance sans les labos de modèles

The Hacker News situe OpenAI, Google et Meta hors de la liste des membres fondateurs, et Anthropic sur aucune des deux listes au 27 juillet 2026. implicator.ai les place tous les quatre dans la Coalition for Secure AI, plus ancienne. Cette configuration oriente la lecture, à mon sens. La pile ouverte de sécurité des agents s'assemble au niveau de l'infrastructure, sans les labos dont elle vise à inspecter les cadres d'exécution.

> [!IMPORTANT]
> Dans NOOA, une docstring est un prompt. La nettoyer change le comportement du modèle,
> sans qu'aucun linter ni vérificateur de types ne le signale. Le nombre de membres
> fondateurs reste disputé. The Hacker News écrit « NVIDIA et 36 autres
> organisations », implicator.ai rapporte 27 membres fondateurs selon la presse
> spécialisée. Précisez la source citée et le désaccord.

## Impact pour une équipe

Deux profils sont concernés, ceux qui choisissent un cadre d'exécution d'agents et ceux dont les prompts vivent dans des fichiers de gabarits. Si vous adoptez NOOA, désignez qui relit les diffs de docstrings et étiquetez-les comme des modifications de prompt, car vos conventions y voient de simples commentaires et les laissent passer. J'écarterais la liste des membres et j'attendrais des éléments indépendants sur l'API, puisque tout ce qu'on en sait vient de l'article de NVIDIA.
