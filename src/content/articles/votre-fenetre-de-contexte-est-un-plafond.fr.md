---
translationKey: context-budget
lang: fr
slug: votre-fenetre-de-contexte-est-un-plafond
title: Votre fenetre de contexte est un plafond, pas un budget
publishDate: 10-06-2026
tags:
- retrieval
- llm-oss
category: briefings
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
contentHash: sha256:882c34d2e15e85bb
publishState: published
---


La longueur de contexte affichee sur la fiche technique d'un modele est un plafond marketing, pas un budget operationnel ; je dimensionne donc un prompt pour ce que le modele sait reellement exploiter, non pour ce que le cache me permet desormais d'envoyer a moindre frais. La precision s'effondre bien avant que la fenetre soit pleine : sur NoLiMa, GPT-4o passe d'une reference de 99,3 % en contexte court a 69,7 % a 32K, et 11 modeles tombent sous la moitie de leur score court a cette longueur [s1] ; sur RULER, seuls quatre modeles tiennent une performance satisfaisante aux 32K qu'ils revendiquent tous [s2]. Le plafond vend le modele ; le budget construit le systeme.

## Les preuves cote precision

Le chiffre qui compte n'est pas la taille de la fenetre, mais l'ampleur de la chute de precision avant qu'on l'atteigne. NoLiMa rend la coupure nette en testant une recherche qui exige de l'inference plutot qu'une correspondance litterale de chaine : GPT-4o, l'un des modeles les plus solides, descend d'une reference quasi parfaite de 99,3 % a 69,7 % a 32K, et 11 modeles passent sous la moitie de leur reference courte a cette meme longueur [s1]. RULER raconte la meme histoire sous un autre angle. Chaque modele teste revendique une fenetre de 32K ou plus, or seuls quatre d'entre eux (GPT-4, Command-R, Yi-34B et Mixtral) y maintiennent une performance satisfaisante [s2].

La position ajoute une seconde penalite a celle de la longueur. Lost in the Middle a observe qu'un modele exploite le mieux une information placee au debut ou a la fin du prompt, et nettement moins bien lorsque le fait pertinent est enfoui au milieu, meme pour les modeles concus explicitement pour le long contexte [s3]. Voila le mode de defaillance a surveiller : le meme fait, deplace du bord vers le centre d'un long prompt, devient celui qu'on exploite le plus mal.

Ce n'est pas un vestige des petites fenetres d'hier. Context Rot evalue 18 LLM de generation actuelle, dont GPT-4.1, Claude 4, Gemini 2.5 et Qwen3 [s4], et reproduit la meme degradation liee a la longueur sur les modeles de pointe avec lesquels vous livrez aujourd'hui, pas sur ceux que vous avez retires l'an dernier.

## L'economie qui pousse en sens inverse

L'incitation va exactement a l'encontre de ces preuves. Le cache de prompt reduit le cout jusqu'a 90 % et la latence jusqu'a 85 % sur les longs prompts, et l'entree mise en cache ne coute que 10 % du prix de base par token, contre une ecriture unique a 25 % au-dessus du prix de base [s5]. Google repercute la meme remise de 75 % via le cache implicite de Gemini 2.5 [s6]. Remplir la fenetre parait donc presque gratuit, et le geste qui semble rationnel consiste alors a cesser d'elaguer le contexte a la main pour laisser le modele trier le pertinent de l'inutile.

## Le revers

Des tokens bon marche ne sont pas des tokens utiles. Le cache change ce que coute un long prompt ; il ne change rien a ce que le modele en fait une fois les tokens arrives, et l'argument de precision tient meme si le cache n'existait pas. L'objection la plus solide merite une vraie reponse, car les modeles de pointe revendiquent aujourd'hui des fenetres de 200K a 1M et affichent des scores long-contexte quasi parfaits. Le piege est dans ce que ces scores mesurent : il s'agit massivement de recherche d'aiguille dans une botte de foin, des chaines exactes plantees dans du remplissage. Un bon score d'aiguille a 1M est compatible avec cette these, et non une refutation, car la degradation n'apparait qu'une fois que la recherche exige de l'inference plutot qu'une correspondance litterale [s1]. La fenetre plus large creuse l'ecart entre le plafond et le budget exploitable, sauf si l'on demontre qu'un modele tient la recherche par inference a cette longueur.

Je ne mettrai pas de chiffre sur cet ecart pour un modele a 1M de tokens, car les preuves ne soutiennent aucune valeur a l'echelle de la frontiere ; la these est directionnelle, pas une magnitude. Ce que je dirai d'experience, c'est la regle operationnelle : budgetez le contexte exploitable, pas le contexte abordable. Mesurez ce qu'un modele donne exploite reellement sur de la recherche par inference a votre longueur cible, traitez la fenetre affichee comme un plafond dur dont vous vous approchez rarement, et depensez les economies du cache a envoyer les bons tokens plutot qu'a en envoyer davantage.
