---
translationKey: claude-text-watermark-synthid-mechanism
lang: fr
slug: tatouage-texte-claude-alea-echantillonnage-divulgation
title: Le tatouage numérique du texte de Claude ne change que la source de l'aléa
  utilisé pour choisir les mots
publishDate: 17-08-2026
kind: release
tags:
- Claude
- Anthropic
- watermarking
summary: 'Anthropic a nommé le 14 août 2026 la méthode derrière le tatouage numérique
  du texte de Claude : une version de SynthID-Text, dont le principe affiché veut
  qu''il ne change que la source de l''aléa utilisé pour choisir les mots. Search
  Engine Journal relevait le 11 août 2026 qu''une relecture humaine qualifiée peut
  exempter un texte publié de l''obligation de divulgation. À mon sens, la marque
  ne répond pas de l''obligation.'
sources:
- label: Anthropic news post
  url: https://www.anthropic.com/news/claude-text-watermark
  date: 14-08-2026
- label: Search Engine Journal
  url: https://www.searchenginejournal.com/anthropic-claude-watermarks-eu-ai-act-code/585355/
  date: 11-08-2026
contentHash: sha256:4b8208b2bb71d9b1
publishState: published
---

## Ce qui change

Anthropic a nommé la méthode derrière le tatouage numérique du texte de Claude, dans un billet daté
du 14 août 2026 [s1]. C'est une version de l'approche SynthID-Text publiée par Google DeepMind dans
un article de Nature en 2024, dans une famille qui remonte à une proposition de Scott Aaronson en
2022, et dont le principe affiché veut que le tatouage ne change que la source de l'aléa utilisé pour
choisir les mots [s1]. Search Engine Journal, qui a examiné le 11 août 2026 les obligations attachées
au
tatouage numérique du texte de Claude, relève qu'un texte publié après une relecture humaine
qualifiée ou sous contrôle éditorial peut être exempté de l'obligation de divulgation [s2].

## La marque et l'obligation sont deux objets distincts

Search Engine Journal le dit sans détour : une marque de Claude peut figurer sur une copie que son
éditeur n'a aucune obligation de signaler [s2]. À mon sens, quiconque exploite une chaîne de
publication devrait s'arrêter sur cette phrase. L'exemption tient à qui porte la responsabilité
éditoriale, donc à des personnes et à un processus [s2]. La marque tient aux choix de jetons, donc à
la génération [s1]. Aucun des deux ne peut répondre pour l'autre.

> [!CONFIRMED]
> Le principe affiché veut que le tatouage ne change que la source de l'aléa utilisé pour choisir
> les mots [s1].

> [!INFERRED]
> J'y lis une marque portée par les choix de jetons plutôt que par un champ de métadonnées : le
> texte peut donc vous parvenir sans aucune trace de qui l'a lu ni de qui en porte la responsabilité
> éditoriale. Cette trace n'existe que si vous l'inscrivez au moment de la génération.

Une conséquence que j'ajouterais : sans aléa, aucune source d'aléa à changer. Une sortie produite
avec un échantillonnage figé ne laisse rien à substituer, si bien que le marquage se pose autrement
pour une copie calquée sur un gabarit que pour de la prose libre. C'est ma lecture, et ce n'est pas
une mesure.

## Impact pour une équipe

La décision se joue au moment de la génération : ce que votre chaîne enregistre quand elle écrit le
texte. Si vous poussez une sortie de Claude dans un CMS ou un gabarit destiné à vos clients,
consignez le fait éditorial dès l'écriture : qui a lu la copie, selon quel processus, et si cette
lecture correspond bien à celle que décrit Search Engine Journal [s2]. Cette information ne revient
pas des octets ensuite. Deux gestes que je refuserais : traiter une marque comme la preuve que son
éditeur devait la signaler, alors que les exemptions vont dans l'autre sens [s2] ; et tenir
l'échantillonnage pour un détail d'implémentation, alors qu'il vient d'entrer dans votre surface de
provenance.
