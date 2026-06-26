---
translationKey: claude-fable-5-mythos-5
lang: fr
slug: claude-fable-5-palier-mythos-repli
title: 'Claude Fable 5 : un palier supérieur à 2x Opus, avec un repli silencieux vers
  Opus'
publishDate: 26-06-2026
kind: release
tags:
- Claude
- Anthropic
- llm-release
- agentic
summary: 'Le 2026-06-09, Anthropic a publié Claude Fable 5, le premier modèle public
  de la classe Mythos, un cran au-dessus d''Opus, en tête de GDPval-AA à 1932. Pour
  une équipe déjà sur Claude, le piège n''est pas le benchmark : il coûte le double
  d''Opus 4.8 et, sur les tours sensibles, il répond discrètement depuis Opus 4.8.'
sources:
- label: Anthropic news - Claude Fable 5 and Claude Mythos 5
  url: https://www.anthropic.com/news/claude-fable-5-mythos-5
  date: 09-06-2026
- label: TechCrunch - independent coverage
  url: https://techcrunch.com/2026/06/09/anthropic-released-claude-fable-5-its-most-powerful-model-publicly-days-after-warning-ai-is-getting-too-dangerous/
  date: 09-06-2026
- label: Artificial Analysis - independent benchmark outlet
  url: https://artificialanalysis.ai/articles/claude-fable-5-mythos
  date: 09-06-2026
- label: Claude Cookbook - classifier fallback and billing for Fable 5
  url: https://platform.claude.com/cookbook/fable-5-fallback-billing-guide
  date: 09-06-2026
contentHash: sha256:55fcec558de806f9
publishState: published
---

## Ce qui change

Le 2026-06-09, Anthropic a mis son modèle le plus capable entre les mains du public. Claude Fable 5 est la première version généralement disponible du nouveau palier Mythos, un cran au-dessus de la classe Opus ; Anthropic le présente au niveau de l'état de l'art sur presque tous les benchmarks testés, et Artificial Analysis lui attribue un score GDPval-AA de 1932, en tête du classement. Pour une équipe déjà sur Claude, l'information n'est pas le benchmark. C'est le prix, et un garde-fou capable de changer le modèle qui répond vraiment.

## Payer le haut de gamme au double

Fable 5 est affiché à 10 dollars par million de tokens en entrée et 50 dollars par million en sortie, soit, comme le souligne TechCrunch, le double du tarif d'Opus 4.8. Toute la décision d'adoption tient dans cette ligne. Fable 5 n'est pas une mise à niveau que l'on active partout ; à 2x, c'est un modèle vers lequel on aiguille, réservé aux tâches où la capacité supplémentaire se rentabilise. Y router tout son trafic courant, c'est le moyen le plus simple de doubler une facture sans doubler la valeur.

## Le repli qu'il faut instrumenter

Fable 5 embarque un garde-fou qu'Opus n'affiche pas. Sur les sujets à haut risque (Anthropic cite la cybersécurité, la biologie, la chimie et la distillation), il bloque la requête et fait répondre Claude Opus 4.8 à la place, ce qui survient, selon Anthropic, dans moins de 5 % des sessions en moyenne. Autrement dit, sur une petite part de vos tours les plus sensibles, votre modèle haut de gamme devient discrètement un modèle moins cher. Le cookbook Claude l'expose comme un repli côté serveur que l'on active et que l'on peut relire :

```
# la réponse indique quel modèle a vraiment répondu
message.model            # "claude-opus-4-8" lors d'un repli
# la requête nomme explicitement la cible de repli
"fallbacks": [{"model": "claude-opus-4-8"}]
```

> [!IMPORTANT]
> Considérez toute charge de sécurité, de biologie ou de chimie sur Fable 5 comme non déterministe quant à l'identité du modèle. Journalisez `message.model` à chaque tour ; si vous supposiez que Fable répondait à chaque requête, vos évaluations et vos coûts sont tous deux faux sur la part bloquée.

## Impact pour une équipe

Si vous tournez sur Claude, refaites le calcul de prix cette semaine, ne changez pas la valeur par défaut. Décidez quelles charges justifient 10/50 dollars et n'aiguillez que celles-là vers Fable 5 ; laissez le reste sur Opus 4.8. Si vous construisez quoi que ce soit dans les catégories bloquées, instrumentez `message.model` dès maintenant pour voir le repli vers Opus, et rejouez vos évaluations sensibles à la sécurité contre le modèle qui répond réellement, pas celui que vous avez demandé. Il n'y a ici aucune échéance de dépréciation ; le coût de l'attente se limite à celui de chaque appel courant mal aiguillé vers le haut de gamme entre-temps.
