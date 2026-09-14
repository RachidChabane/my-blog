---
translationKey: deepseek-v4-1-flash-v4-pro-reroute-withdrawn
lang: fr
slug: deepseek-v4-1-flash-bascule-v4-pro-retiree
title: DeepSeek a retiré la bascule de V4 Pro prévue le 14 septembre, et deepseek-v4-flash
  désigne désormais un autre modèle
publishDate: 14-09-2026
kind: release
tags:
- DeepSeek
- DeepSeek V4.1
- open-weight
- inference
summary: 'Le billet de DeepSeek sur V4.1-Flash annonce toujours la bascule de deepseek-v4-pro
  le 14 septembre, mais sa page de tarifs, réécrite le 11 septembre, maintient V4
  Pro sans date de fin. Le changement qui a bien eu lieu est plus discret : depuis
  la sortie du 10 septembre 2026, les anciens noms deepseek-v4-flash désignent V4.1-Flash.
  Je pense que c''est cet alias qui fausse vos évals.'
sources:
- label: DeepSeek news, Introducing DeepSeek-V4.1-Flash
  url: https://www.deepseek.com/en/news/deepseek-v4-1-flash/
  date: 10-09-2026
- label: Hugging Face model card, deepseek-ai/DeepSeek-V4.1-Flash
  url: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
  date: 10-09-2026
- label: SiliconANGLE, DeepSeek releases V4.1-Flash, says it outperforms flagship
    V4-Pro
  url: https://siliconangle.com/2026/09/10/deepseek-releases-v4-1-flash-says-it-outperforms-flagship-v4-pro/
  date: 10-09-2026
- label: DeepSeek API docs, Models and Pricing
  url: https://api-docs.deepseek.com/quick_start/pricing
  date: 11-09-2026
- label: Wayback Machine, DeepSeek pricing page captured at 07:47 UTC on 11 September
    2026
  url: https://web.archive.org/web/20260911074742/https://api-docs.deepseek.com/quick_start/pricing/
  date: 11-09-2026
- label: Wayback Machine, DeepSeek pricing page captured at 16:55 UTC on 11 September
    2026
  url: https://web.archive.org/web/20260911165508/https://api-docs.deepseek.com/quick_start/pricing/
  date: 11-09-2026
- label: TokenCost, DeepSeek V4.1 Flash pricing and the V4-Pro routing correction
  url: https://tokencost.app/blog/deepseek-v4-1-flash-pricing-v4-pro-routing
  date: 12-09-2026
contentHash: sha256:082d2dc108c4d6a9
publishState: published
---

## Ce qui change

DeepSeek a publié V4.1-Flash le 10 septembre 2026 sous le nom d'API `deepseek-flash`, a retiré V4-Flash et V4-Flash-Vision-Exp, et redirige temporairement leurs noms vers le nouveau modèle [s1]. Le même billet annonce que toutes les requêtes `deepseek-v4-pro` basculent vers V4.1-Flash à partir du 14 septembre 2026 à 04:00 UTC [s1]. Il le dit encore. La page de tarifs dit l'inverse. Sa note maintient désormais V4 Pro après le 14 septembre, à facturation inchangée [s4]. Deux captures Wayback du 11 septembre, à 07:47 et 16:55 UTC, encadrent la modification [s5][s6], et TokenCost a publié une correction datée du 12 septembre [s7].

| Nom de modèle envoyé | Servi par, selon la page de tarifs [s4] |
| :--- | :--- |
| `deepseek-flash` | DeepSeek-V4.1-Flash |
| `deepseek-v4-flash`, `deepseek-v4-flash-vision-exp` | DeepSeek-V4.1-Flash, anciens noms |
| `deepseek-v4-pro` | DeepSeek-V4-Pro-0813 |

## La bascule qui a bien eu lieu

Je pense que l'échéance de Pro a capté l'attention, mais c'est l'alias Flash qui pose problème. Quand V4-Flash est sorti de preview en juillet, ce radar notait que seul son post-entraînement avait changé. Cette fois, l'architecture change aussi. V4.1-Flash est un encodeur-décodeur causal qui active 8 milliards de paramètres par token au prefill et 16 milliards au décodage [s2], pour 552 milliards au total contre 284 milliards pour V4-Flash [s3]. Une requête `deepseek-v4-flash` est encore acceptée et servie par ce modèle [s4]. Un score d'éval, un budget de latence ou une référence de coût rattachés au nom décrivent désormais un modèle que vous n'appelez plus.

## Un sursis sans date de fin

Avant la modification, la note affirmait que V4.1 Flash avait dépassé V4 Pro et que DeepSeek prévoyait de retirer V4 Pro de façon ordonnée [s5]. Le nouveau texte ne fixe aucune date de fin et promet seulement de prévenir en cas de changement [s6]. J'y lis un sursis révocable, et je n'y engagerais pas un trimestre.

> [!IMPORTANT]
> Ignorez l'échéance de 04:00 UTC du billet. La page de tarifs associe toujours `deepseek-v4-pro` à DeepSeek-V4-Pro-0813 [s4], et je n'ai trouvé aucune page DeepSeek qui date la fin de ce service.

## Impact pour une équipe

Si vous avez figé `deepseek-v4-pro`, ne changez rien aujourd'hui. Profitez du sursis pour tester vos propres tâches sur `deepseek-flash` et `deepseek-v4-pro` en parallèle, tant que ces deux noms mènent à deux modèles distincts [s4], pour être prêt le jour où DeepSeek préviendra. Si votre stack envoie encore `deepseek-v4-flash`, renommez-le en `deepseek-flash` maintenant et remesurez vos références. Ces anciens noms ne sont qu'une redirection temporaire [s1], et tout résultat enregistré sous ces noms depuis la sortie mesure V4.1-Flash. Notez, à chaque campagne d'éval, la version de modèle affichée par la page de tarifs, car le nom seul a changé de sens deux fois depuis juillet.
