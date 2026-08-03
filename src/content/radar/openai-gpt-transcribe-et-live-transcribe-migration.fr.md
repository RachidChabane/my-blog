---
translationKey: gpt-transcribe-live-transcribe-split
lang: fr
slug: openai-gpt-transcribe-et-live-transcribe-migration
title: OpenAI livre gpt-transcribe et gpt-live-transcribe, et la migration coûte plus
  qu'un identifiant de modèle
publishDate: 03-08-2026
kind: release
tags:
- OpenAI
- GPT Transcribe
- Realtime API
- speech-to-text
- voice agents
summary: 'OpenAI a livré GPT Transcribe et GPT Live Transcribe le 28 juillet : un
  modèle fichier à 0,0045 $ la minute et un modèle streaming à 0,017 $ la minute.
  Changer l''identifiant de modèle est la partie facile ; le champ d''indice de langue
  change, et horodatages, sous-titres et étiquettes de locuteur passent à d''autres
  modèles.'
sources:
- label: Primary - OpenAI developer changelog, Jul 28 GPT Transcribe release
  url: https://developers.openai.com/api/docs/changelog
  date: 28-07-2026
- label: Primary - OpenAI API pricing, transcription and realtime audio rows
  url: https://developers.openai.com/api/docs/pricing
  date: 28-07-2026
- label: Primary - OpenAI model page, gpt-transcribe endpoints and price
  url: https://developers.openai.com/api/docs/models/gpt-transcribe
  date: 28-07-2026
- label: Primary - OpenAI model page, gpt-live-transcribe endpoints and price
  url: https://developers.openai.com/api/docs/models/gpt-live-transcribe
  date: 28-07-2026
- label: Primary - OpenAI realtime transcription guide, session config and delay levels
  url: https://developers.openai.com/api/docs/guides/realtime-transcription
  date: 28-07-2026
- label: Primary - OpenAI transcription guide, workflow and capability matrix
  url: https://developers.openai.com/api/docs/guides/transcription
  date: 28-07-2026
- label: Corroboration - Microsoft Foundry blog, GPT Transcribe availability
  url: https://techcommunity.microsoft.com/blog/azure-ai-foundry-blog/introducing-gpt-transcribe-and-gpt-live-transcribe-in-microsoft-foundry/4541740
  date: 29-07-2026
- label: Corroboration - yellow.com, launch pricing and third-party accuracy index
  url: https://yellow.com/news/openai-cuts-transcription-prices-25-percent
  date: 30-07-2026
contentHash: sha256:a52d96486ff01895
publishState: published
---

## Ce qui change

OpenAI a livré GPT Transcribe et GPT Live Transcribe le 28 juillet [s1]. Le modèle fichier est facturé 0,0045 $ la minute, le streaming 0,017 $ [s2], et Microsoft a listé les deux dans Foundry le lendemain [s7]. Le guide réécrit oriente chaque cas d'usage vers un seul modèle recommandé [s6].

## Trois choses bougent en même temps

Y voir une simple montée de version se défend : même fournisseur, même tâche, un identifiant plus récent. Elle casse quand même : le champ d'indice renomme, les points d'entrée divergent [s3][s4], et les sorties que vous consommez partent ailleurs.

| Capacité | `gpt-transcribe` | `gpt-live-transcribe` |
| :--- | :--- | :--- |
| Prix à la minute | 0,0045 $ [s2] | 0,017 $ [s2] |
| Point d'entrée fichier | `v1/audio/transcriptions` [s3] | non pris en charge [s4] |
| Point d'entrée temps réel | `v1/realtime/transcription_sessions` [s3] | `v1/realtime/transcription_sessions` [s4] |
| Horodatages de mots, locuteurs | renvoyés vers `whisper-1` ou `gpt-4o-transcribe-diarize` [s6] | rien [s5] |
| Champ d'indice de langue | `languages` [s6] | `languages` [s5] |

Le renommage est bon marché : seule l'exécution le révèle.

La rupture coûteuse se situe en aval. Tout ce qui consomme horodatages de mots, sous-titres ou étiquettes de locuteur reste sur `whisper-1` ou `gpt-4o-transcribe-diarize` [s6], puisque `gpt-live-transcribe` ne renvoie rien de tout cela [s5]. La montée de version revient à réécrire le consommateur. J'adopterais le nouveau modèle là où le produit se contente de texte, et garderais l'ancien quand le transcrit alimente une frise temporelle.

Une session streaming porte ces indices dans un seul objet [s5] :

```json
"transcription": {
  "model": "gpt-live-transcribe",
  "prompt": "A customer support call about a premium plan and account AC-42.",
  "keywords": ["premium plan", "AC-42", "billing"],
  "languages": ["en", "fr"],
  "delay": "low"
}
```

> [!IMPORTANT]
> Ces modèles lisent `languages`, une liste, là où les modèles 4o lisent `language`, une chaîne [s6] ; la documentation précise de ne pas envoyer les deux [s5].

## Où la baisse de prix s'applique vraiment

Le quart de prix en moins du titre [s8] ne vaut que pour un modèle : 0,0045 $ contre 0,006 $ pour `gpt-4o-transcribe` [s2]. `gpt-4o-mini-transcribe` reste facturé 0,003 $ [s2] : le chemin recommandé coûte moitié plus cher que le palier qu'OpenAI ne recommande pas aux nouvelles intégrations [s6]. Et `gpt-realtime-whisper` est au même tarif de 0,017 $ [s2] : le compteur streaming n'est pas nouveau. Artificial Analysis mesure 3,31 % d'erreur sur les mots, au neuvième rang de la cinquantaine de systèmes suivis [s8]. Calez vos attentes sur ce rang.

## Impact pour une équipe

Aucune échéance ne vous presse : les modèles 4o servent toujours les intégrations existantes [s6]. Lisez « modèle de départ recommandé » comme un aiguillage pour les nouveaux chantiers. Avant tout changement d'identifiant, greppez vos appels de transcription sur `language:` et recensez chaque consommateur d'horodatages ou d'étiquettes de locuteur : ces deux recherches décident si le chantier tient en une ligne ou en un sprint. Gardez `gpt-4o-mini-transcribe` pour le batch de volume, où 0,003 $ l'emporte sur 0,0045 $ [s2]. Mesurez `delay` sur votre propre audio téléphonique : la documentation nomme des points de départ de `minimal` à `xhigh` sans publier la moindre milliseconde [s5].
