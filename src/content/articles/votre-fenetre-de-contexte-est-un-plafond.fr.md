---
translationKey: context-budget
lang: fr
slug: votre-fenetre-de-contexte-est-un-plafond
title: Votre fenêtre de contexte est un plafond, pas un budget
publishDate: 10-06-2026
tags:
- retrieval
- llm-oss
category: briefings
difficulty: 3
sources:
- label: 'NoLiMa: Long-Context Evaluation Beyond Literal Matching (Modarressi et al.,
    ICML 2025)'
  url: https://arxiv.org/abs/2502.05167
  date: 10-06-2026
- label: 'RULER: What''s the Real Context Size of Your Long-Context Language Models?
    (Hsieh et al.)'
  url: https://arxiv.org/abs/2404.06654
  date: 10-06-2026
- label: 'Lost in the Middle: How Language Models Use Long Contexts (Liu et al., TACL
    2024)'
  url: https://aclanthology.org/2024.tacl-1.9/
  date: 10-06-2026
- label: 'Context Rot: How Increasing Input Tokens Impacts LLM Performance (Chroma
    Research, July 2025)'
  url: https://www.trychroma.com/research/context-rot
  date: 10-06-2026
- label: Prompt caching with Claude (Anthropic, August 2025)
  url: https://claude.com/blog/prompt-caching
  date: 10-06-2026
- label: Gemini 2.5 models now support implicit caching (Google Developers Blog, May
    2025)
  url: https://developers.googleblog.com/gemini-2-5-models-now-support-implicit-caching/
  date: 10-06-2026
contentHash: sha256:888a9e63149f4e4b
publishState: published
---


La longueur de contexte affichée sur la fiche technique d'un modèle est un plafond marketing, pas un budget opérationnel ; je dimensionne donc un prompt pour ce que le modèle sait réellement exploiter, non pour ce que le cache me permet désormais d'envoyer à moindre frais. La précision s'effondre bien avant que la fenêtre soit pleine : sur NoLiMa, GPT-4o passe d'une référence de 99,3 % en contexte court à 69,7 % à 32K, et 11 modèles tombent sous la moitié de leur score court à cette longueur [s1] ; sur RULER, seuls quatre modèles tiennent une performance satisfaisante aux 32K qu'ils revendiquent tous [s2]. Le plafond vend le modèle ; le budget construit le système.

## Les preuves côté précision

Le chiffre qui compte n'est pas la taille de la fenêtre, mais l'ampleur de la chute de précision avant qu'on l'atteigne. NoLiMa rend la coupure nette en testant une recherche qui exige de l'inférence plutôt qu'une correspondance littérale de chaîne : GPT-4o, l'un des modèles les plus solides, descend d'une référence quasi parfaite de 99,3 % à 69,7 % à 32K, et 11 modèles passent sous la moitié de leur référence courte à cette même longueur [s1]. RULER raconte la même histoire sous un autre angle. Chaque modèle testé revendique une fenêtre de 32K ou plus, or seuls quatre d'entre eux (GPT-4, Command-R, Yi-34B et Mixtral) y maintiennent une performance satisfaisante [s2].

La position ajoute une seconde pénalité à celle de la longueur. Lost in the Middle a observé qu'un modèle exploite le mieux une information placée au début ou à la fin du prompt, et nettement moins bien lorsque le fait pertinent est enfoui au milieu, même pour les modèles conçus explicitement pour le long contexte [s3]. Voilà le mode de défaillance à surveiller : le même fait, déplacé du bord vers le centre d'un long prompt, devient celui qu'on exploite le plus mal.

Ce n'est pas un vestige des petites fenêtres d'hier. Context Rot évalue 18 LLM de génération actuelle, dont GPT-4.1, Claude 4, Gemini 2.5 et Qwen3 [s4], et reproduit la même dégradation liée à la longueur sur les modèles de pointe avec lesquels vous livrez aujourd'hui, pas sur ceux que vous avez retirés l'an dernier.

## L'économie qui pousse en sens inverse

L'incitation va exactement à l'encontre de ces preuves. Le cache de prompt réduit le coût jusqu'à 90 % et la latence jusqu'à 85 % sur les longs prompts, et l'entrée mise en cache ne coûte que 10 % du prix de base par token, contre une écriture unique à 25 % au-dessus du prix de base [s5]. Google répercute la même remise de 75 % via le cache implicite de Gemini 2.5 [s6]. Remplir la fenêtre paraît donc presque gratuit, et le geste qui semble rationnel consiste alors à cesser d'élaguer le contexte à la main pour laisser le modèle trier le pertinent de l'inutile.

## Le revers

Des tokens bon marché ne sont pas des tokens utiles. Le cache change ce que coûte un long prompt ; il ne change rien à ce que le modèle en fait une fois les tokens arrivés, et l'argument de précision tient même si le cache n'existait pas. L'objection la plus solide mérite une vraie réponse, car les modèles de pointe revendiquent aujourd'hui des fenêtres de 200K à 1M et affichent des scores long-contexte quasi parfaits. Le piège est dans ce que ces scores mesurent : il s'agit massivement de recherche d'aiguille dans une botte de foin, des chaînes exactes plantées dans du remplissage. Un bon score d'aiguille à 1M est compatible avec cette thèse, et non une réfutation, car la dégradation n'apparaît qu'une fois que la recherche exige de l'inférence plutôt qu'une correspondance littérale [s1]. La fenêtre plus large creuse l'écart entre le plafond et le budget exploitable, sauf si l'on démontre qu'un modèle tient la recherche par inférence à cette longueur.

Je ne mettrai pas de chiffre sur cet écart pour un modèle à 1M de tokens, car les preuves ne soutiennent aucune valeur à l'échelle de la frontière ; la thèse est directionnelle, pas une magnitude. Ce que je dirai d'expérience, c'est la règle opérationnelle : budgétez le contexte exploitable, pas le contexte abordable. Mesurez ce qu'un modèle donné exploite réellement sur de la recherche par inférence à votre longueur cible, traitez la fenêtre affichée comme un plafond dur dont vous vous approchez rarement, et dépensez les économies du cache à envoyer les bons tokens plutôt qu'à en envoyer davantage.
