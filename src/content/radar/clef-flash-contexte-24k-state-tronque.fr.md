---
translationKey: clef-flash-24k-hosted-context-truncates-long-state
lang: fr
slug: clef-flash-contexte-24k-state-tronque
title: Cloudflare baisse Clef-flash à 0.038 $ par million de jetons avec 24K de contexte
  hébergé, et un state texte plus long est tronqué pour tenir
publishDate: 12-10-2026
kind: release
tags:
- Cloudflare
- Clef
- Workers AI
- decision models
summary: Le 9 octobre 2026, Cloudflare a ramené Clef-flash sur Workers AI à 0.038
  $ par million de jetons d'entrée, et sa fenêtre de contexte hébergée de 64K à 24K
  jetons. Un state texte qui dépasse la limite est tronqué pour tenir, alors qu'une
  requête dont les jetons des médias et les questions dépassent la fenêtre échoue.
  Je bornerais les state en chaîne sous 24K avant chaque appel, et j'enverrais les
  plus longs vers Clef, qui garde 64K, ou vers des poids auto-hébergés.
sources:
- label: Cloudflare Changelog, "Clef-omni adds audio and video input, Clef-flash is
    now cheaper, and Clef is faster"
  url: https://developers.cloudflare.com/changelog/post/2026-10-09-clef-omni-workers-ai/
  date: 09-10-2026
- label: Cloudflare docs source, clef-flash.json model definition at commit 970ac72
  url: https://raw.githubusercontent.com/cloudflare/cloudflare-docs/970ac7295d27cc146b7d88ed29f4463a4f02b78d/src/content/workers-ai-models/clef-flash.json
  date: 09-10-2026
- label: Cloudflare docs source, "How media inputs are billed" partial for the Clef
    model pages at commit 970ac72
  url: https://raw.githubusercontent.com/cloudflare/cloudflare-docs/970ac7295d27cc146b7d88ed29f4463a4f02b78d/src/content/partials/workers-ai/clef-media-input-pricing.mdx
  date: 09-10-2026
- label: 'DataStudios, "Cloudflare Clef-omni: 30B Multimodal Model, Benchmarks & Pricing"'
  url: https://www.datastudios.org/post/cloudflare-clef-omni-30b-audio-video-ai-decisions
  date: 11-10-2026
contentHash: sha256:229d9e03957f93fa
publishState: published
---

## Ce qui change

Le 9 octobre 2026, Cloudflare a baissé le prix de Clef-flash sur Workers AI de 0.090 $ à 0.038 $ par million de jetons d'entrée et, pour tenir ce prix, a ramené sa fenêtre de contexte hébergée de 64K à 24K jetons [s1]. La définition du modèle fixe désormais `context_window` à 24576 [s2]. Clef garde sa fenêtre de 64K, et les poids de Clef-flash publiés sur Hugging Face acceptent jusqu'à 256K en auto-hébergement [s1].

Le changelog met les trois modèles hébergés côte à côte [s1] :

| Modèle | Prix par million de jetons d'entrée | Fenêtre de contexte |
| :--- | ---: | ---: |
| `@cf/cloudflare/clef-flash` | 0.038 $ | 24K jetons |
| `@cf/cloudflare/clef` | 0.240 $ | 64K jetons |
| `@cf/cloudflare/clef-omni` | 0.150 $ | 64K jetons |

## Tronqué ou rejeté

La coupe de contexte est, je pense, la partie de cette version qui modifie du code déjà en production. La note de facturation distingue deux issues : les jetons des médias comptent dans la fenêtre avec les questions, une requête où ils la dépassent échoue, et sinon le `state` texte est tronqué pour tenir dans l'espace restant [s3]. DataStudios lit la documentation de la même façon [s4].

> [!CONFIRMED]
> Un `state` texte trop long pour la fenêtre est tronqué pour y tenir, alors qu'une requête dont les jetons des médias et les questions la dépassent échoue [s3].

> [!INFERRED]
> À mon sens, un `state` sous forme de chaîne compris entre 24K et 64K jetons, que l'ancienne fenêtre contenait, reçoit désormais des probabilités calculées sur une partie de son entrée.

Chaque image pèse jusqu'à 1,024 jetons dans cette même fenêtre et réduit d'autant la place du `state` [s3]. Quant au schéma de sortie, il renvoie `model`, `answers` et `usage` [s2], et je n'y trouve aucun champ qui signale une troncature.

## L'argument des 0.24 %

Le meilleur argument pour la coupe vient de Cloudflare : seules 0.24 % des requêtes dépassent 24K jetons d'entrée, et qui a besoin de plus est renvoyé vers Clef [s1]. J'en conviens pour l'ensemble du trafic. Mon objection est plus étroite. Ce chiffre global ne dit rien, je pense, d'une charge qui passe de longues transcriptions ou des documents en `state` sous forme de chaîne : elle peut se situer tout entière au-dessus de 24K.

## Impact pour une équipe

Pour de longs `state` en chaîne envoyés à `@cf/cloudflare/clef-flash`, la fenêtre hébergée est déjà de 24K [s1]. Ma recommandation : bornez le `state` texte sous 24K jetons avant chaque appel, images et questions comprises, et envoyez tout ce qui dépasse vers Clef à 64K ou vers les poids auto-hébergés, jusqu'à 256K [s1]. Clef coûte 0.240 $ par million de jetons d'entrée contre 0.038 $ [s1] ; cet écart est le prix d'une réponse calculée sur tout le `state`. Je journaliserais aussi le compte `input_tokens` de `usage`, en examinant toute valeur proche de 24576 [s2]. La définition ne dit pas si ce compte précède la troncature : je le traite donc comme un signal d'alerte, le contrôle de budget restant le garde-fou.
