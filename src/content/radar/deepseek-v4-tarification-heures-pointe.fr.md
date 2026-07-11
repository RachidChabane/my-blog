---
translationKey: deepseek-v4-peak-hour-surge-pricing
lang: fr
slug: deepseek-v4-tarification-heures-pointe
title: DeepSeek ajoute une tarification aux heures de pointe à son API V4, et l'heure
  devient une dimension de routage
publishDate: 11-07-2026
kind: release
tags:
- DeepSeek
- DeepSeek-V4
- inference
- pricing
- routing
summary: 'Le 2026-06-30, DeepSeek a prévenu les abonnés de son API que la V4 passera
  à une tarification heures pleines / heures creuses lors de la disponibilité générale
  de la mi-juillet : les appels dans deux créneaux quotidiens (heure de Pékin) sont
  facturés au double. Le vrai changement, c''est que l''heure de la journée devient
  une dimension de routage que votre passerelle doit intégrer.'
sources:
- label: Origin-adjacent - TechNode, 'DeepSeek to launch V4 in mid-July with new peak-time
    API pricing'
  url: https://technode.com/2026/06/30/deepseek-to-launch-v4-in-mid-july-with-new-peak-time-api-pricing/
  date: 30-06-2026
- label: Corroboration - South China Morning Post, 'After triggering price war, DeepSeek
    reverses course with surcharge on peak-hour API use'
  url: https://www.scmp.com/tech/big-tech/article/3358868/after-triggering-price-war-deepseek-reverses-course-surcharge-peak-hour-api-use
  date: 30-06-2026
- label: Corroboration - TheRouter.ai, 'DeepSeek V4 Peak-Hour Pricing Makes Time-of-Day
    a Routing Dimension Every AI Gateway Must Support'
  url: https://therouter.ai/news/deepseek-v4-peak-hour-pricing-routing/
  date: 06-07-2026
- label: Primary - DeepSeek API Docs, 'DeepSeek V4 Preview Release'
  url: https://api-docs.deepseek.com/news/news260424/
  date: 24-04-2026
contentHash: sha256:6983fe2aee9919c2
publishState: published
---

## Ce qui change

Le 2026-06-30, DeepSeek a prévenu par courriel les abonnés de son API que la V4 passera à une tarification heures pleines / heures creuses lors de son passage en disponibilité générale, à la mi-juillet 2026 [s1]. Pendant deux créneaux quotidiens, de 09:00 à 12:00 et de 14:00 à 18:00 (heure de Pékin), les appels sont facturés au double du tarif hors pointe [s1] ; pour `deepseek-v4-pro`, la sortie passe de 6 yuans à 12 yuans (environ 1,77 US$) par million de tokens [s2]. C'est un revirement : ce même laboratoire a déclenché une guerre des prix en mai 2026 avec une baisse permanente de 75 % sur l'accès à V4, forçant ByteDance et Tencent à suivre [s2], et il ajoute aujourd'hui une surcharge qu'il présente comme une "meilleure répartition des ressources et une stabilité de service accrue" [s2].

## L'horloge dans la facture

| Créneau (Pékin) | Multiplicateur | sortie `deepseek-v4-pro` |
| :--- | :--: | ---: |
| 09:00-12:00 et 14:00-18:00 | 2x [s1] | 12 yuans / Mtok [s2] |
| toutes les autres heures | 1x | 6 yuans / Mtok [s2] |

Les faits sont modestes ; la conséquence ne l'est pas. Une horloge quotidienne s'installe désormais dans le coût de chaque appel DeepSeek : tout routeur ou boucle d'agent qui multiplie les requêtes doit raisonner sur l'heure locale du fournisseur pour garder une facture stable. L'heure de la journée rejoint la qualité du modèle et le coût par token comme dimension de routage, ce qu'un analyste indépendant de passerelles a déjà formulé : les tables de routage ont maintenant besoin d'une horloge [s3]. Une passerelle qui n'arbitre que sur un prix par token figé paiera trop cher de manière systématique, car le fournisseur le moins cher à 03:00 (Pékin) ne l'est plus à 10:00.

Lisez la surcharge comme un signal, pas comme une note de bas de page. Le laboratoire qui a fixé le plancher de la guerre des prix est le premier à revenir dessus, ce qui montre que ce plancher, pour servir de l'inférence MoE à 1M de contexte [s4], ne tenait pas.

> [!IMPORTANT]
> À l'heure de ce brief, la surcharge est annoncée, pas encore facturée. Elle arrivera avec la disponibilité générale de la mi-juillet, et la V4 reste en préversion [s1][s4]. C'est un brief pour se préparer, pas pour adopter : rien ne change sur votre facture aujourd'hui.

## Impact pour une équipe

Si vous routez du trafic de production via `deepseek-v4-pro`, vous avez une échéance à la mi-juillet, pas une décision à repousser. Trois gestes concrets avant la disponibilité générale. Déplacez le travail par lots reportable, comme les évaluations, les reprises et l'enrichissement hors ligne, vers les heures creuses de Pékin, pour qu'il ne touche jamais la fenêtre à 2x. Ajoutez un repli sur les créneaux de pointe : routez les appels tolérants à la latence vers `deepseek-v4-flash` ou vers un concurrent pendant les deux fenêtres, et réservez `deepseek-v4-pro` au travail qui justifie la surcharge. Enfin, rendez votre routeur conscient du fuseau horaire dès maintenant [s3] : s'il ne raisonne que sur le modèle et un prix figé, il paiera trop cher en silence dès le premier jour de facturation. À ignorer pour l'instant : la spéculation selon laquelle les concurrents imiteront la surcharge [s3]. Aucun ne l'a fait ; planifiez autour de la seule horloge de DeepSeek, pas d'une norme du secteur.
