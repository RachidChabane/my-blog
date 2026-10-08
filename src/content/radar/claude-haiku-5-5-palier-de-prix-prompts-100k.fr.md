---
translationKey: claude-haiku-5-5-prompt-length-price-tier-at-100k
lang: fr
slug: claude-haiku-5-5-palier-de-prix-prompts-100k
title: Claude Haiku 5.5 multiplie par 5 le tarif des prompts au-delà de 100k jetons,
  et Artificial Analysis précise que ses coûts provisoires n'intègrent pas ce palier
publishDate: 08-10-2026
kind: release
tags:
- Claude
- Claude Haiku 5.5
- Anthropic
- pricing
summary: 'Anthropic a publié claude-haiku-5-5 avec un tarif par paliers : 0,10 $ en
  entrée et 0,50 $ en sortie par million de jetons jusqu''à 100k jetons de prompt,
  0,50 $ et 2,50 $ au-delà. Artificial Analysis précise que ses coûts provisoires
  pour Haiku 5.5 n''intègrent pas ce surcoût, et Simon Willison a mesuré environ 1,25
  fois plus de jetons sur le même long prompt qu''avec Haiku 4.5. Je placerais un
  comptage de jetons devant chaque appel de compaction, et je compacterais ou découperais
  tout prompt qui dépasserait 100k.'
sources:
- label: Anthropic, "Introducing Claude Haiku 5.5"
  url: https://www.anthropic.com/claude-haiku-5-5
  date: 07-10-2026
- label: Artificial Analysis, "Anthropic has released Claude Haiku 5.5"
  url: https://artificialanalysis.ai/articles/claude-haiku-5-5
  date: 07-10-2026
- label: Simon Willison, "Claude Haiku 5.5"
  url: https://simonwillison.net/2026/Oct/7/claude-haiku-5-5/
  date: 07-10-2026
contentHash: sha256:dd3bf3b55c418358
publishState: published
---

## Ce qui change

Le 7 octobre 2026, Anthropic a publié Claude Haiku 5.5, disponible dès maintenant sur toutes les plateformes ; sur la Claude Platform, son identifiant est `claude-haiku-5-5` [s1]. Le prix par million de jetons dépend de la longueur du prompt : 0,10 $ en entrée et 0,50 $ en sortie jusqu'à 100k jetons, contre 0,50 $ et 2,50 $ au-delà de 100k [s1]. Artificial Analysis et Simon Willison relèvent tous deux ce même palier de 5 fois au-dessus de 100k [s2][s3].

## La limite qui dicte la conception

Je pense que le chiffre qui compte ici est la limite des 100k, davantage que la baisse affichée. Anthropic destine Haiku 5.5 aux résumés, aux compactions et au travail de sous-agent sur du code [s1]. Ce sont justement les appels dont le prompt grossit au fil de la session.

Le tableau d'Anthropic, par million de jetons [s1] :

| Tarif | Haiku 5.5, jusqu'à 100k | Haiku 5.5, au-delà de 100k | Haiku 4.5 |
| :--- | ---: | ---: | ---: |
| Entrée | 0,10 $ | 0,50 $ | 1,00 $ |
| Sortie | 0,50 $ | 2,50 $ | 5,00 $ |
| Lecture du cache | 0,01 $ | 0,05 $ | 0,10 $ |
| Écriture du cache | 0,125 $ | 0,625 $ | 1,25 $ |

Le tokenizer rapproche les prompts de cette limite, à gabarit constant. Anthropic indique que le nouveau tokenizer consomme un peu plus de jetons par tâche [s1], et Simon Willison a mesuré environ 1,25 fois plus de jetons sur le même long prompt avec Haiku 5.5 qu'avec Haiku 4.5 [s3]. Je considère donc comme périmé tout budget de prompt calibré sur les comptes de Haiku 4.5. Le palier apparaît sur la facture. Aucun test n'échoue.

> [!IMPORTANT]
> Artificial Analysis précise que son site ne reflète pas encore la tarification par paliers, si bien que ses coûts provisoires pour Haiku 5.5 n'intègrent pas le surcoût du palier [s2]. Tant qu'Artificial Analysis n'a pas publié sa couverture Cost per Task, chiffrez toute charge dont les prompts dépassent 100k à partir de vos propres comptes de jetons.

On objectera qu'Anthropic indique que 90 % des requêtes adressées à Haiku 4.5 restaient sous 100 000 jetons [s1], et que le palier ne touche donc qu'une marge. Je pense que ce chiffre répond à une autre question. Il décrit la répartition des requêtes de Haiku 4.5 ; or un appel de compaction tombe dans cette marge par construction, puisqu'il s'exécute quand le contexte est au plus long.

## Impact pour une équipe

Si vous utilisez Haiku 5.5 comme modèle de compaction ou de sous-agent, la décision de la semaine porte sur l'endroit où couper. Ma recommandation : placez un comptage de jetons devant chaque appel à `claude-haiku-5-5` [s1], mesuré avec le tokenizer du nouveau modèle, et compactez ou découpez tout ce qui dépasserait 100k.

Le mode de défaillance que je surveillerais est une prévision de coûts bâtie sur la baisse moyenne d'environ 75 % qu'annonce Anthropic [s1], appliquée à un agent dont les prompts de compaction dépassent la limite. Pour les requêtes de plus de 100 000 jetons, Anthropic n'annonce lui-même qu'une baisse de 50 % par rapport à Haiku 4.5 [s1].
