---
translationKey: llm-findings-expire-across-model-generations
lang: fr
slug: votre-juge-llm-change-avec-son-modele-revalidez-le-avant-qu-il-note-une-mise-a-niveau
title: Votre juge LLM change avec son modèle, revalidez-le avant qu'il note une mise
  à niveau
publishDate: 05-11-2026
tags:
- evaluation
category: essays
difficulty: 3
sources:
- label: 'Queen and Zou (Stanford University), The shelf life of LLM findings (scope:
    50 claims)'
  url: https://zou-group.github.io/llm-claims-shelf-life/
  date: 02-11-2026
- label: Singh, Xu, Zhou, Zhou, Hakkani-Tur and Joty, On the Shelf Life of Fine-Tuned
    LLM-Judges (arXiv 2509.23542) (future-proofing is hard, backward compatibility
    is easy)
  url: https://arxiv.org/abs/2509.23542
  date: 28-09-2025
- label: Trisovic, The Shrinking Lifespan of LLMs in Science (arXiv 2604.07530) (lifespan
    shrinks with each release year)
  url: https://arxiv.org/abs/2604.07530
  date: 08-04-2026
- label: Stephen Turner, Paired Ends, The Shelf Life of LLM findings (commentary)
    (OpenScholar claims benchmarked against GPT-4o)
  url: https://blog.stephenturner.us/p/llm-claims-shelf-life
  date: 03-11-2026
contentHash: sha256:e62186b54f2f9b50
publishState: published
---


À mon avis, une équipe qui change le modèle qu'elle livre doit revalider son juge LLM avant de se fier à un re-test qu'il note, car ce juge est daté par son modèle. Les affirmations sur les LLM vieillissent vite : dans les 15 mois suivant leur publication, la plupart de celles qu'un re-test a examinées ne tenaient plus ou montraient des effets nettement diminués [s2], 16 % ayant expiré en moins d'un an et 39 % en moins de deux [s3]. Ce re-test est signé Queen et Zou, de Stanford University [s16] ; j'y ajoute deux articles, l'un de Singh et ses coauteurs [s31], l'autre de Trisovic [s33]. La page de Stanford tire déjà la leçon générale : un résultat est une observation sur des modèles particuliers à un moment particulier, et les articles devraient indiquer le modèle, la version et la date avec chaque résultat [s25]. Ce qui a expiré, ce sont surtout des échecs de capacité que les modèles récents ne commettent plus [s4], tandis que les limites structurelles ont faibli sans disparaître [s5]. Selon moi, il en va de même pour le juge qui note ces résultats.

## Le modèle juge fixe ses biais

À mon avis, le juge est le maillon de la chaîne d'évaluation que l'on oublie le plus facilement de versionner. La page de Stanford ne les épargne pas : parmi les affirmations sur les modèles comme juges, relecteurs et évaluateurs, trois sur dix seulement persistent ou se renforcent [s6]. La majorité ne s'est donc ni maintenue ni renforcée. Ce qui a persisté relève surtout des préférences et du jugement, notamment chez les juges qui favorisent leurs propres réponses [s17]. La page note que les affirmations sur ce que les modèles préfèrent ont duré plus longtemps [s34], et avance une raison : ce sont des tendances sans réponse juste unique à un test, si bien qu'elles peuvent être plus difficiles à remarquer et à corriger par l'entraînement pour les développeurs de modèles [s26]. C'est justement ce qui rend un juge utile et difficile à auditer.

L'auto-préférence des juges LLM figure parmi les trois résultats renforcés, avec les éloges qui suivent la préférence déclarée de l'utilisateur et la génération non uniforme de nombres aléatoires ; leurs effets ajustés valent environ 2.36, 1.85 et 1.70 fois leurs amplitudes de référence, respectivement [s18]. Pour l'auto-préférence, la page part d'une petite référence : un écart de 4.6 points de pourcentage entre la préférence de GPT-4 pour ses propres résumés et celle de GPT-3.5 pour ces mêmes résumés [s35].

Les valeurs par modèle divergent selon le juge :

| Effet de juge (valeurs par modèle de la page) | Claude Sonnet 5.5 | GPT-6.1 Sol |
| :--- | ---: | ---: |
| Auto-préférence [s19] | e = 1.09 | e = 2.88 |
| Préférence pour les réponses longues [s20] | e = 1.12 | e = 0.09 |

Selon la page de Stanford, l'auto-préférence de Sonnet reste proche de l'amplitude de l'article, et celle de Sol est plus grande [s19]. La même page rapporte l'inverse pour la préférence de longueur : Sonnet la conserve, tandis que l'estimation ponctuelle de Sol est proche de la valeur d'expiration [s20]. La page précise que chaque point de son graphique d'effets ajustés est une tendance sur la date de sortie, ajustée sur 9 à 20 modèles du panel par affirmation et évaluée au 30 septembre 2026, et que ce n'est la mesure d'aucun modèle récent pris isolément [s36].

À mon sens, changer de modèle juge revient à changer le biais que portent les notes. Avec Sol, on achète un goût plus marqué pour ses propres réponses ; avec Sonnet, on garde un goût pour la longueur. Aucun des deux choix n'est neutre, et un rapport qui ne nomme que le générateur ne dit jamais lequel a été fait. Un re-test noté par un juge que je n'ai pas validé mesure à la fois le générateur et le juge, et la note seule ne me dit pas lequel des deux a bougé.

## Le juge affiné vieillit lui aussi

Affiner un juge semble régler la question, et selon moi cela reporte le problème sur le générateur suivant. L'argument en sa faveur est sérieux : affiner des juges sur des données propres au jugement est devenu un choix souvent préféré au prompt direct d'un modèle de pointe utilisé comme juge, en partie parce que ces juges résistent mieux aux biais courants [s27]. Sur le papier, cela règle le problème de la section précédente.

Singh et ses coauteurs examinent comment ces juges se comportent face aux réponses de modèles futurs ou passés, et s'ils généralisent à des questions jamais vues [s28]. Une mise à niveau du générateur, c'est le cas du modèle futur. Selon eux, les expériences suggèrent que la plupart des juges résistent mal aux modèles à venir, alors que la rétrocompatibilité est relativement facile [s11]. Tous les modèles perdent d'ailleurs un peu en performance sur les questions inédites [s12]. Ils en tirent des conseils pratiques pour déployer un juge quand les générateurs changent sans cesse [s29].

> [!CONFIRMED]
> La page de Stanford range l'auto-préférence des juges LLM parmi ses trois résultats renforcés [s18], et Singh et ses coauteurs indiquent que les expériences suggèrent que la plupart des juges affinés résistent mal aux modèles à venir, alors que la rétrocompatibilité est relativement facile [s11].

> [!INFERRED]
> À mon sens, les deux voies me laissent un instrument modifié après la mise à niveau du générateur : un nouveau modèle juge apporte son propre profil de biais, et un juge affiné sur des sorties plus anciennes affronte précisément le cas que l'article juge difficile. Aucune des deux ne me dispense de revalider le juge.

## Une mise à niveau qui se note elle-même

Voici la panne que je préparerais en premier. La page range les juges qui favorisent leurs propres réponses parmi ce qui a persisté [s17], et le tableau montre que l'ampleur de cet effet dépend du modèle juge.

> [!WARNING]
> Si le nouveau générateur sert aussi de nouveau juge, un effet d'auto-préférence comme celui que la page rapporte pour Sol gonflerait la note de la mise à niveau même qu'il doit vérifier. Je tiendrais tout re-test noté ainsi pour non mesuré tant qu'un second juge ou un échantillon humain ne l'a pas confirmé.

C'est le sens du biais qui pose problème. Un juge bruité élargit les barres d'erreur ; un juge qui se préfère déplace l'estimation vers la mise en production.

## Le verdict du panel et le modèle que je livre

La même page plaide aussi contre l'idée de lire ses moyennes comme le verdict d'un seul modèle. Elle écrit que le verdict d'une affirmation sur l'ensemble du panel peut différer de ce que l'on observe sur un seul modèle [s21]. Son propre exemple : selon la page, la fabrication de citations est classée comme expirée dans l'ensemble, et pourtant Qwen3.7-Flash a fabriqué 69 % des références de son test, contre environ 1 % pour Sonnet 5.5 et 0 % pour Sol [s22]. Un garde-fou se retire sur la mesure de mon modèle, jamais sur un verdict de panel.

Le calendrier ne tranche pas davantage. La page indique que la date de sortie ne détermine pas à elle seule la tendance ; parmi les modèles sortis de juillet à septembre 2026, elle relève de 11 affirmations expirées pour DeepSeek V4 Pro à 30 pour GPT-6.1 Sol [s23]. Le panel a aussi tourné avec la configuration d'API par défaut de chaque fournisseur [s24]. Si mes prompts et mes réglages de production s'écartent de ces valeurs par défaut, le panel n'a jamais mesuré ma configuration.

Et le renouvellement des modèles s'accélère. Trisovic associe chaque année de sortie successive à un délai jusqu'au pic plus court de 27 % et à une durée de vie plus courte de 23 % [s13], et constate que l'année de sortie prédit l'un et l'autre plus fortement que l'architecture, l'ouverture ou la taille [s32]. L'article suggère que se spécialiser sur un seul modèle peut être un investissement qui se déprécie, avec des coûts qui pèsent sur la reproductibilité et la migration [s14]. Un billet de commentaire sur la page de Stanford en donne un cas concret : les affirmations selon lesquelles OpenScholar battait un modèle de pointe sur les citations hallucinées étaient mesurées face au GPT-4o, dépassé depuis longtemps [s15]. Un juge d'évaluation relève de ce genre de spécialisation, et je pense qu'il se déprécie au rythme des générateurs qu'il note.

## Le meilleur argument contre la revalidation

L'argument contraire est solide, et l'essentiel vient des sources elles-mêmes. La méthode tient la route : sur 48 affirmations de la vérification de reproduction, 43 se reproduisent dans la tolérance et 5 montrent des effets plus forts [s7]. Les estimations agrégées ont de larges intervalles de confiance, car l'étude ne compte que 50 affirmations [s8], et le multiple d'auto-préférence de la page repose sur une petite référence de 4.6 points de pourcentage [s35]. Singh et ses coauteurs constatent que l'apprentissage continu adapte un juge de façon plus équilibrée aux glissements entre réponses anciennes et récentes [s30]. Refaire un test coûte aussi moins cher : les agents de code ont permis aux auteurs de Stanford de tester bien plus d'affirmations en bien moins de temps [s10].

Je concède aussi un point de périmètre : la page compare deux modèles juges côte à côte, et ne suit jamais un même juge à travers une mise à niveau.

Chaque objection porte, et aucune ne supprime la vérification. Un juge qui a besoin d'apprentissage continu pour suivre a son propre cycle de versions, et c'est tout mon propos : il devient un composant de plus à versionner. Je concède l'ampleur du multiple. Ma vérification porte sur son sens, et c'est le sens qui fausse une décision de mise à niveau. De larges intervalles sur un petit panel plaident pour mesurer ma propre paire de modèles. Le point de périmètre va dans le même sens, puisque seule ma propre vérification couvre mon prochain générateur. Des re-tests bon marché rendent cette vérification abordable.

## Ce que je mettrais en place

À la prochaine mise à niveau, je ferais quatre choses. La page de Stanford demande aux articles de publier leur provenance exacte, prompts et code d'analyse compris, pour que l'on puisse répéter les affirmations sur les futurs LLM [s9]. Son propre re-test a couvert 50 affirmations, de la complaisance et des jailbreaks aux capacités en contexte long et aux biais culturels [s1]. Une suite d'évaluation doit la même provenance à son juge.

1. Épingler le modèle juge et sa version.
2. Stocker chaque résultat d'évaluation avec le générateur et le juge qui l'a noté.
3. Avant que le juge ne note la mise à niveau, le vérifier sur un petit échantillon étiqueté à la main des sorties du nouveau générateur.
4. Ne retirer un garde-fou contre un échec de capacité qu'après avoir mesuré cet échec sur le modèle que je livre.

L'enregistrement de la deuxième étape est court :

```yaml
result:
  generator: { model: "identifiant-du-modèle-livré", version: "version-épinglée" }
  judge: { model: "identifiant-du-modèle-juge", version: "version-épinglée" }
  scored_on: "date de l'exécution"
  judge_check: "accord avec l'échantillon étiqueté à la main de ce générateur"
```

La troisième étape est celle qui peut me donner tort. Si l'échantillon étiqueté à la main s'accorde aussi bien avec le nouveau juge qu'avec l'ancien, je garde le juge, et la vérification ne m'a coûté qu'une passe d'étiquetage. S'il s'accorde moins bien, une partie de la note de la mise à niveau revenait au juge, et j'aurais livré sur cette base. Ce que cela change : à la mise à niveau, le juge entre dans la liste des changements, à côté du générateur.
