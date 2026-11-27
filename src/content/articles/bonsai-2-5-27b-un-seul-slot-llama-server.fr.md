---
translationKey: bonsai-2-5-27b-llama-server-slot-default-costs-vram-headroom
lang: fr
slug: bonsai-2-5-27b-un-seul-slot-llama-server
title: Ternary Bonsai 2.5 27B se contente d'un seul slot llama-server
publishDate: 27-11-2026
tags:
- llm-oss
category: briefings
difficulty: 3
sources:
- label: Prism ML, Ternary Bonsai 2.5 27B GGUF model card
  url: https://huggingface.co/prism-ml/Ternary-Bonsai-2.5-27B-GGUF
  date: 27-11-2026
- label: Hugging Face discussion "KV Cache Tip" on the Bonsai 2.5 GGUF repo
  url: https://huggingface.co/prism-ml/Ternary-Bonsai-2.5-27B-GGUF/discussions/1
  date: 27-11-2026
- label: 'llama.cpp PR #16736, server: support unified cache across slots'
  url: https://github.com/ggml-org/llama.cpp/pull/16736
  date: 23-10-2025
- label: 'llama.cpp issue #17989, "--parallel 1" initializes 4 slots'
  url: https://github.com/ggml-org/llama.cpp/issues/17989
  date: 13-12-2025
- label: Prism ML, Ternary Bonsai 2.5 27B announcement
  url: https://prismml.com/news/bonsai-2-5-27b
  date: 24-11-2026
contentHash: sha256:197567c545389deb
publishState: published
---


Sur une carte de 10 Go, le premier réglage à vérifier pour Ternary Bonsai 2.5 27B est le nombre de slots de llama-server, parce que le seul relevé mémoire publié à ce jour contredit ce que prévoit le design de llama.cpp. Tout l'argument du modèle tient dans sa taille : 1.76 bit par poids et 5.93 Go sur disque, contre 53.8 Go pour les poids en FP16 [s1]. Un fichier aussi petit est censé laisser de la marge sur un GPU grand public, et la façon dont on le sert par défaut en consomme une partie sans que personne ait encore trouvé où elle passe.

## Quatre slots pour un seul utilisateur

Sans consigne contraire, llama-server démarre avec quatre slots et un cache KV unifié [s8]. Pour un serveur qui répond à plusieurs clients en même temps, c'est un choix raisonnable. Sur une carte de bureau qui sert une seule fenêtre de chat, trois slots restent à ne rien faire. Le premier retour de la communauté sur Bonsai montre la ligne correspondante dans le log du serveur [s4] :

```
I srv load_model: initializing, n_slots = 4, n_ctx_slot = 32000, kv_unified = 'true'
```

Le même utilisateur, sur une RTX 3080 de 10 Go, a ajouté `-np 1` et vu la VRAM totale passer d'environ 9.5 Go à environ 7.8 Go, bureau compris [s6]. La fiche du modèle a depuis repris la mesure [s3] et recommande `-np 1` quand on traite une requête à la fois sur une carte qui a peu de VRAM [s2].

Ça reste une seule paire de mesures, sur une seule machine, avec ce que faisait le bureau à ce moment-là, et je ne l'ai pas refaite. La fiche elle-même prévient que la consommation dépend du build, de la taille de contexte et d'autres réglages [s3]. Et 9.5 Go tiennent encore sur une carte de 10 Go : le modèle se charge dans les deux cas. L'enjeu, c'est la place qui reste pour un contexte plus long ou pour le reste de ce qui tourne sur le GPU.

La description de llama.cpp laisse attendre un écart bien plus faible. La pull request qui a introduit le cache unifié partage tout le contexte `-c N` entre les slots ; `-np N` plafonne toujours le nombre de jobs parallèles mais ne sert plus à modifier le contexte par slot [s9]. Le log de l'utilisateur colle à cette description : avec quatre slots, chacun annonce `n_ctx_slot = 32000` [s4], la fenêtre entière. Ce qui a grossi entre les deux runs n'est donc pas le contexte par slot dont parle la pull request. Prism, l'éditeur du modèle, n'a pas d'explication non plus et a demandé dans le fil les lignes d'allocation des buffers CUDA des deux runs [s7].

## Lire le log avant de croire le flag

Un flag s'ajoute facilement et se perd tout aussi facilement : un wrapper, un launcher qui construit sa propre ligne de commande, un fichier de config oublié. Rien ne signale alors l'erreur de configuration. Vous pensez tourner sur un slot, le serveur en a quatre, et tous les chiffres de mémoire que vous notez ensuite décrivent le réglage par défaut. La sortie de démarrage tranche la question en quelques secondes :

```
llama-server -m <model.gguf> -np 1 2>&1 | grep -E "n_slots|n_parallel|kv_unified"
```

On veut lire 1 en face de `n_slots`. La ligne à quatre slots existe aussi sous une autre forme, postée dans une [issue llama.cpp](https://github.com/ggml-org/llama.cpp/issues/17989) : `main: setting n_parallel = 4 and kv_unified = true (add -kvu to disable this)` [s10]. Si l'une des deux lignes à quatre slots apparaît alors que vous avez passé `-np 1`, le réglage n'a pas pris, quoi qu'en dise votre ligne de commande. Quand vous comparez les deux lancements, gardez la sortie complète de chacun. Deux démarrages du serveur et un diff répondraient à la question ouverte mieux que ce billet.

L'utilisateur qui a soulevé le problème estime que la valeur par défaut devrait être `-np 1`, ou 2 au maximum, pour un modèle destiné aux petites cartes [s5]. Pour ce modèle-là, je suis d'accord, et je placerais la correction un cran plus tôt. Prism a mis le conseil dans une note Known issues de la fiche [s7], la section qu'on lit une fois que quelque chose s'est mal passé. La commande de lancement de la fiche, c'est la ligne que les gens copient ; elle devrait porter `-np 1` pour l'usage mono-utilisateur.

Tout ceci concerne llama.cpp sur GPU NVIDIA et Intel. Le même modèle tourne aussi sur Mac, iPhone et iPad via MLX [s11], un autre runtime qu'aucun de ces retours n'a mesuré.
