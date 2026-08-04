---
translationKey: deepseek-v4-flash-0731-official-api
lang: fr
slug: deepseek-v4-flash-0731-sortie-officielle-api
title: DeepSeek publie V4-Flash 0731 comme sortie officielle de son API, et le harnais
  de benchmark n'est pas encore disponible
publishDate: 04-08-2026
kind: release
tags:
- DeepSeek
- OpenCode
- agents
- open-weight
summary: 'DeepSeek a sorti V4-Flash de la préversion le 31 juillet 2026 avec la build
  0731 : même architecture, nouveau post-entraînement. Les scores d''agent mis en
  avant ont été mesurés avec un harnais DeepSeek non publié, donc le chiffre sur lequel
  on voudrait arbitrer est celui qu''on ne peut pas reproduire.'
sources:
- label: DeepSeek API change log
  url: https://api-docs.deepseek.com/updates/
  date: 31-07-2026
- label: Developers Digest hands-on writeup
  url: https://www.developersdigest.tech/blog/deepseek-v4-flash-0731-opencode-guide
  date: 31-07-2026
contentHash: sha256:737816977b84a14c
publishState: published
---

## Ce qui change

DeepSeek a sorti V4-Flash de la préversion le 31 juillet 2026 avec la build 0731, une sortie officielle de l'API qualifiée de bêta publique par son journal des modifications [s1]. La build conserve l'architecture et la taille de V4-Flash-Preview et n'a reçu qu'un nouveau post-entraînement [s1]. Elle prend nativement en charge le format Responses API et est adaptée à Codex, sans toucher à V4-Pro ni aux modèles app et web [s1].

## Des scores adossés à un harnais indisponible

DeepSeek annonce 82,7 sur Terminal Bench 2.1, 54,2 sur NL2Repo, 76,7 sur Cybergym, 54,4 sur DeepSWE et 70,3 sur Toolathlon verified [s1]. Ces scores ont été mesurés avec DeepSeek Harness minimal mode, que la même note annonce comme non encore publié, au niveau d'effort max, avec topp=0.95 et temperature=1.0 [s1]. Tant que ce harnais n'est pas publié, ces scores restent une affirmation qu'il faut croire sur parole. Le point de comparaison aussi est choisi : DeepSeek se mesure à V4-Pro-Preview [s1], la préversion du grand frère [s2], et non à la préversion de Flash que cette build remplace.

> [!IMPORTANT]
> Le nouveau post-entraînement arrive comme une mise à niveau de l'API V4-Flash existante, pas comme un modèle distinct [s1]. Si votre référence d'évaluation a été mesurée sur V4-Flash-Preview, elle décrit des poids que vous n'appelez plus, et rien dans votre code ne vous en avertit.

## Ce que je lancerais

La pile n'a pas bougé depuis le 24 avril 2026 : MoE de 284B, 13B actifs par token, fenêtre de contexte de 1M de tokens, poids sous licence MIT [s2]. Ce sont ces poids qui valent l'heure passée dessus : vous pouvez les figer le jour où la build hébergée rebouge. Dans OpenCode, il arrive sous `opencode-go/deepseek-v4-flash`, avec deux variantes de raisonnement, `high` et `max`, choisies via `--variant` [s2]. Developers Digest, qui en a fait son modèle par défaut, réserve `max` aux boucles d'agent multi-étapes et `high` aux éditions de fichier unique et aux relectures [s2].

## Impact pour une équipe

Si un de vos agents tourne sur V4-Flash, relancez votre suite d'évaluation cette semaine : les poids ont changé derrière une simple mise à niveau d'API [s1], et les scores annoncés viennent d'un harnais dont personne ne dispose hors de DeepSeek [s1]. Démarrez le multi-étapes sur `--variant max` [s2], et gardez `high` pour les relectures, où la latence est le vrai coût [s2]. En revanche, je ne réécrirais pas une intégration Codex sur le support natif de Responses API [s1] : c'est une bêta publique [s1], et le harnais permettant de vérifier la mise à niveau n'a pas de date de sortie [s1].
