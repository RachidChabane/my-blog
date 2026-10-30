---
translationKey: frontier-model-factuality-depends-on-what-a-wrong-answer-costs
lang: fr
slug: la-factualite-d-une-mise-a-niveau-depend-du-prix-d-une-reponse-fausse
title: La factualité d'une mise à niveau dépend du prix que vous donnez à une réponse
  fausse
publishDate: 30-10-2026
tags:
- evaluation
- qualite
category: essays
difficulty: 3
sources:
- label: 'Google, Gemini 4 Carbon: our next frontier model'
  url: https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-carbon/
  date: 28-10-2026
- label: 'Artificial Analysis, Gemini 4 Carbon is the new #1 on the Intelligence Index
    v5'
  url: https://artificialanalysis.ai/articles/gemini-4-carbon-new-number-1
  date: 28-10-2026
- label: Artificial Analysis, Intelligence Index v5 methodology
  url: https://artificialanalysis.ai/methodology/intelligence-benchmarking
  date: 30-10-2026
- label: Kalai et al., Why Language Models Hallucinate (arXiv 2509.04664)
  url: https://arxiv.org/abs/2509.04664
  date: 04-09-2025
contentHash: sha256:8d28f3c708692003
publishState: published
---


À mon avis, les verdicts sur Gemini 4 Carbon reposent sur le prix qu'un tiers donne à une réponse fausse ; reste à savoir si la mise à niveau est plus factuelle chez vous. Google affirme que, selon ses tests internes, Carbon divise environ par deux les affirmations non étayées par rapport à Argon [s13]. Artificial Analysis, qui présente le modèle de Google comme le nouveau numéro un [s16], mesure pourtant un taux d'hallucination passé de 4 % à 11 % [s5]. Et son propre AA-Omniscience v1.1 donne toujours 54 à Carbon, contre 46 pour Argon [s7].

## Deux verdicts sur une même mise à niveau

L'éditeur et l'évaluateur n'ont pas mesuré la même chose, et je pense que chaque chiffre est honnête sur son propre terrain. Google présente Gemini 4 Carbon comme son modèle le plus puissant, avec des capacités de pointe en cybersécurité et sur les tâches à long horizon [s1], dans un billet signé par son SVP, Google DeepMind et Chief AI Architect [s15]. Ce facteur d'environ 2 vient de tests internes [s13]. Google ajoute que, dans des environnements de développement réels avec ses propres équipes, Carbon se désaligne moins souvent et invente moins de contenu [s2]. Ces deux constats portent sur les charges de travail de Google, mesurées par son propre banc de test.

Artificial Analysis regarde ailleurs, du côté d'un benchmark public de connaissances. Il classe Carbon nouveau numéro un de son Intelligence Index v5 [s16], avec un score de 59 [s4]. Sur AA-Omniscience v1.1, Carbon obtient 54, soit 6 points devant Claude Opus 5.5 (max, 48) et 8 devant Argon (46) [s7]. AA-Omniscience produit deux mesures, la précision et un taux d'hallucination [s18] ; pour Carbon, la précision gagne 10 points sur Argon et atteint 58 %, tandis que le taux d'hallucination passe de 4 % à 11 % [s5].

On a envie de demander lequel des deux se trompe. Selon moi, la question est mal posée : ces deux chiffres n'ont jamais concouru pour le même rôle.

> [!CONFIRMED]
> Google : selon ses tests internes, Carbon divise environ par deux les affirmations non étayées par rapport à Argon [s13].
> Artificial Analysis : la précision gagne 10 points et atteint 58 %, tandis que le taux d'hallucination passe de 4 % à 11 % [s5].

> [!INFERRED]
> À mon sens, les deux sont vrais à la fois. Ils viennent de terrains différents, un test interne sur les affirmations non étayées d'un côté, un benchmark de connaissances de l'autre ; leur désaccord dit donc que la réponse dépend de l'endroit où l'on mesure, et de la façon dont chaque terrain note une réponse fausse.

## La règle de notation fixe le prix

L'indice le plus net se trouve à l'intérieur d'un seul terrain. La méthodologie d'Artificial Analysis précise que les modèles sont notés avec l'AA-Omniscience Index, qui attribue des points aux réponses correctes, en retire aux réponses hallucinées et laisse les abstentions neutres [s19], ce qui favorise l'abstention face à une réponse devinée fausse [s9]. Selon moi, sous le seul barème explicite disponible, le modèle dont le taux d'hallucination a augmenté l'emporte donc, et j'accepte ce classement comme la réponse de cet indice. Ce que je refuse, c'est d'en faire mon barème. L'ampleur de cette pénalité, quelqu'un d'autre l'a choisie, pour un lecteur à qui personne n'a demandé ce que lui coûte une réponse fausse.

L'indice phare ajoute une seconde couche de tarification. L'Intelligence Index compte la précision mesurée par AA-Omniscience pour 10 % de l'Index global et le taux de non-hallucination, soit 1 moins le taux d'hallucination, pour 5 % [s18] ; les deux entrent comme des composantes distinctes [s10]. Pour un classement généraliste, ces pondérations relèvent d'un choix éditorial défendable. Elles restent un choix. Qui lit le titre du numéro un [s16] reçoit un verdict où la réponse fausse a déjà été tarifée, avec des poids qu'il n'a pas choisis.

C'est là qu'un article plus ancien trouve sa place. Kalai, Nachum, Vempala et Zhang [s17] soutiennent que les hallucinations persistent à cause de la façon dont la plupart des évaluations sont notées : les modèles sont optimisés pour réussir les tests, et deviner en cas d'incertitude améliore le score [s11]. Leur remède consiste à modifier la notation des benchmarks existants, mal alignés mais dominants dans les classements, plutôt qu'à créer de nouvelles évaluations dédiées aux hallucinations [s12]. À mon sens, l'indice d'AA opère déjà ce type de changement, puisqu'une réponse fausse y coûte des points et qu'une case vide n'y coûte rien. La correction réclamée par Kalai et al. existe donc au moins sur un classement. Le montant de la pénalité reste pourtant l'affaire du classement, et celui qui met le modèle en production n'a pas eu son mot à dire.

Présenté terrain par terrain, l'écart saute aux yeux :

| Qui mesure | Terrain | Coût d'une réponse fausse | Coût d'une abstention |
| :--- | :--- | :--- | :--- |
| Google [s13] | Tests internes sur les affirmations non étayées | Aucune règle donnée dans le billet, à ma lecture | Aucune règle donnée dans le billet, à ma lecture |
| Artificial Analysis | AA-Omniscience v1.1 [s7] | Points retirés [s19] | Neutre [s9] |

À ma lecture, le chiffre phare de Google embarque donc un prix que le lecteur ne peut pas examiner. Celui d'AA est publié et explicite. Aucun des deux n'est le vôtre.

## Re-noter avant de migrer

Avant de faire passer un pipeline d'extraction ou de recherche documentaire d'Argon à Carbon, je ferais tourner les deux modèles sur ma propre évaluation en notant trois issues par élément : correct, faux, abstention. Je fixerais ensuite deux coûts. Celui d'une réponse fausse découle de ce qu'elle coûte en aval : un champ erroné dans un contrat, une mauvaise référence produit dans une commande, une réponse qu'un agent du support colle telle quelle à un client. Celui d'une abstention découle du prix du repli humain, c'est-à-dire les minutes d'un relecteur, une file d'attente, une réponse plus lente. Alors seulement je comparerais les deux modèles. Le résultat peut très bien rejoindre celui d'AA, et cela me convient ; ce qui compte, c'est que les poids soient les miens.

L'étape moins évidente consiste à se méfier de sa propre évaluation avant de croire l'un ou l'autre chiffre. D'expérience, les évaluations d'extraction que j'ai vues notent en correspondance exacte : le champ est juste ou il est faux, et un champ vide compte autant qu'un champ erroné. Or, à mon sens, une notation juste ou faux est exactement le cadre dans lequel, comme l'écrivent Kalai et al., deviner en cas d'incertitude améliore le score [s11]. Une telle évaluation penche vers le modèle qui devine davantage, et elle confirmera volontiers la mise à niveau qui s'abstient le moins. Ajouter une case abstention ne coûte presque rien.
```python
from collections import Counter

def upgrade_score(outcomes, wrong_cost, abstain_cost):
    counts = Counter(outcomes)
    return (counts["correct"]
            - wrong_cost * counts["wrong"]
            - abstain_cost * counts["abstained"])
```

Lancez-la une fois par modèle, sur les mêmes éléments et avec les deux mêmes coûts : le meilleur score désigne la mise à niveau à livrer.

> [!WARNING]
> Le mode de défaillance à chiffrer est une valeur fausse, écrite sans réserve dans un enregistrement en aval qui ne permet pas de s'abstenir. Un indice qui laisse les abstentions neutres retire quelques points pour cette valeur ; d'expérience, le pipeline la paie en entier.

Le temps ne manque pas pour s'y préparer. Carbon est déployé auprès d'utilisateurs sélectionnés et n'est pas encore accessible au public [s8], et Google indique continuer à recueillir des retours et à itérer sur les garde-fous avant de mettre Carbon à disposition des développeurs, des entreprises et du grand public [s3]. Le banc de test tient en trois cases et deux coûts. Il peut être prêt avant l'ouverture de l'accès, de sorte que le premier passage de Carbon sur vos données produise une décision le jour même.

## L'argument en faveur du chiffre absolu

Artificial Analysis classe le taux d'hallucination de 11 % de Carbon au deuxième rang des plus bas de tous les modèles, derrière le seul Argon, contre 50 % pour Claude Opus 5.5 (max) comme pour GPT-6 Astra (max) [s6]. Google affirme de son côté que Carbon récupère les sources pertinentes et signale les divergences à l'utilisateur avant d'agir, au lieu de deviner ou de forcer une solution [s14]. Si ces deux constats tiennent, re-noter reviendrait, selon cette objection, à se donner du mal pour confirmer un modèle déjà proche du plancher du secteur et conçu pour signaler le doute avant d'agir.

Elle a du poids. Pour un choix entre fournisseurs, je pense que le niveau absolu tranche, et je m'en servirais ainsi. L'affirmation de Google sur les divergences, en revanche, porte sur son propre terrain, et c'est justement la nouvelle notation qui dira si elle tient sur le mien : un modèle qui signale les divergences devrait se traduire dans mon banc de test par davantage d'abstentions et moins de valeurs fausses. Aucun de ces deux faits ne fixe le coût d'une réponse fausse dans mon pipeline, et le passage d'Argon à Carbon se joue précisément sur ce coût.

Le prix d'une réponse fausse est un paramètre, et à mon avis seul celui qui déploie le modèle peut le fixer. Choisissez-le avant la migration : les deux chiffres phares deviennent alors des données d'entrée pour une décision que vous prenez vous-même.
