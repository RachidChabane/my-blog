---
translationKey: agent-sandbox-strength-is-host-kernel-patch-lag
lang: fr
slug: inscrivez-le-noyau-hote-dans-la-grille-de-votre-bac-a-sable
title: Inscrivez le noyau de l'hôte dans la grille de votre bac à sable pour agents
publishDate: 07-11-2026
tags:
- agents
- agentic-coding
category: essays
difficulty: 4
sources:
- label: OpenAI, A thousand fewer paths to root
  url: https://openai.com/index/a-thousand-fewer-paths-to-root/
  date: 04-11-2026
- label: 'pwn.ai, Firecracker VM Escape: PwnEscape Part 2'
  url: https://pwn.ai/blog/firecracker-escape
  date: 07-11-2026
- label: Vercel, findings from the $1M Vercel Sandbox challenge
  url: https://vercel.com/blog/findings-from-the-1-million-dollar-vercel-sandbox-challenge
  date: 14-10-2026
- label: CSO Online, KVM escape exposes broader attack surface in Linux networking
  url: https://www.csoonline.com/article/4237999/kvm-escape-exposes-broader-attack-surface-in-linux-networking.html
  date: 20-10-2026
- label: 'Andronchik and Lokhmakov, AI Code Sandboxes: A Comparative Security Study,
    Part 1 (arXiv 2606.08433)'
  url: https://arxiv.org/abs/2606.08433
  date: 07-06-2026
contentHash: sha256:8c89ee580a285146
publishState: published
---


À mon avis, la grille d'évaluation d'un bac à sable pour agents doit avoir une ligne pour le noyau de l'hôte : sa version et le rythme auquel le fournisseur le reconstruit. Selon CSO Online [s41], le bogue PwnEscape se trouve dans le code réseau de Linux qui traite le trafic provenant de l'intérieur des machines virtuelles, hors de l'hyperviseur KVM lui-même [s11], et mettre à jour les seules VM invitées ne le corrige pas [s12]. Vercel indique que la fuite de mémoire de l'hôte a été démontrée contre ses bacs à sable de production [s29]. J'y vois une exposition que seule la version du noyau de l'hôte peut révéler.

## Ce que l'étude sur les bacs à sable a déjà tranché

La comparaison que je veux prolonger a déjà bougé une fois, et c'est une étude qui l'a fait bouger. Selon cette étude sur les bacs à sable, les classes de moteurs (microVM, noyau en espace utilisateur, conteneur OCI) se distinguent nettement sur chaque axe architectural, ce qui ne vaut pas pour les produits d'une même classe [s14]. Son résultat central tient à la politique d'épinglage des produits, variable dominante côté opérateur : la latence de correction côté moteur avoisine 0 jour pour les divulgations coordonnées, tandis que le retard en aval va de 0 jour à 471 jours ou plus [s15]. L'étude en conclut que l'isolation au niveau de la classe ne prédit pas le retard en aval, et qu'il faut donc combiner les deux [s21]. Les épinglages qu'elle mesure sont ceux des moteurs, et son exemple le plus net est une version épinglée qui n'a jamais bougé : arrakis a épinglé Cloud Hypervisor en v44.0 et n'a pas changé de version depuis [s24].

Ce glissement, de la classe d'isolation vers la manière dont un produit épingle son moteur, revient à l'étude, et je m'appuie dessus.

Chaque épinglage de cette comparaison concerne un moteur. À mon sens, c'est là que la grille s'arrête.

## Une porte d'entrée côté hôte

Je pense que le modèle par classe de l'étude montre lui-même où se trouve le trou. Les deux premières colonnes reprennent la lecture que fait l'étude d'une CVE du noyau hôte ; la troisième est l'épinglage que je demanderais.

| Classe de moteur | Effet d'une CVE du noyau hôte, selon l'étude | L'épinglage que je demanderais |
| :--- | :--- | :--- |
| Conteneur (runc) | Surface complète : toute CVE du noyau hôte atteignable depuis l'espace utilisateur non privilégié s'applique [s17] | Version du noyau de l'hôte et délai de reconstruction |
| microVM (Firecracker, Cloud Hypervisor, libkrun) | Partielle, via le noyau invité seulement ; évasion uniquement si le VMM a son propre bogue de surface [s18] | Moteur, noyau invité, et noyau de l'hôte qui traite le trafic invité |
| Noyau en espace utilisateur (gVisor) | Minimale : en général pas atteignable par le chemin des appels système [s20] | Le moteur en priorité, puis le noyau de l'hôte |

Ma troisième colonne s'allonge sur la ligne microVM : une microVM ajoute un noyau invité sur le chemin sans en retirer le noyau de l'hôte, si bien que le client hérite d'un épinglage pour chacun.

L'étude reconnaît d'ailleurs sa propre limite : ses décomptes de CVE au niveau du moteur n'incluent pas l'exposition du noyau partagé, rapportée comme une référence agrégée [s23]. Je lis cette référence comme une case à remplir. Une ligne par fournisseur pour le noyau de l'hôte dit de chaque produit ce qu'un agrégat tait.

Le cas qui met la ligne microVM à l'épreuve vient de Vercel. Dans sa conception, chaque bac à sable tourne sur sa propre microVM Firecracker avec un noyau invité dédié [s7], et Vercel affirme qu'aucun invité ne partage un noyau en cours d'exécution avec l'hôte ni avec un autre locataire [s31]. Or, selon Vercel, un chercheur HackerOne travaillant depuis un bac à sable standard, sans accès particulier, a trouvé un défaut dans la pile réseau du noyau Linux [s32]. Vercel note aussi que presque tous les grands fournisseurs cloud isolent les charges de travail de leurs clients sur cette même couche du noyau Linux, si bien que tout défaut y devient un risque pour une infrastructure partagée [s6].

CSO Online ajoute la condition préalable : l'attaque de l'invité vers l'hôte exige une charge de travail contrôlée par l'attaquant, capable de fournir le trafic malformé à travers le réseau virtuel [s34]. Je pense que cette condition décrit le métier même d'un bac à sable pour agents, qui existe pour exécuter du code que personne n'a relu et qu'un modèle a pu écrire sous la dictée d'un attaquant. L'article de recherche sur PwnEscape indique que sa Part 1 a introduit la primitive de mémoire de l'hôte sur laquelle repose ce travail [s28]. Côté correctif, CSO Online rapporte qu'il a été fusionné dans la branche principale du noyau Linux, avec des versions corrigées du noyau pour plusieurs distributions [s36], et les chercheurs avertissent que des bogues similaires pourraient exister ailleurs dans la pile réseau, partout où des métadonnées contrôlées par l'invité peuvent modifier des champs de paquets après leur validation [s37].

À mon sens, les trois publications décrivent un seul bogue, trouvé depuis un bac à sable Vercel standard pendant son défi. Son point d'entrée, tel que je le lis, est du code du noyau de l'hôte qui analyse le trafic invité, alors que la ligne microVM de l'étude ne compte une CVE du noyau hôte que si le VMM a son propre bogue de surface. Le correctif arrive sous la forme d'un noyau de l'hôte, et aucune version de moteur n'en garde la trace.

> [!CONFIRMED]
> La ligne microVM de l'étude indique qu'une CVE du noyau hôte ne mène à une évasion que si le VMM a lui-même un bogue de surface [s18]. CSO Online rapporte que l'attaque cible le code réseau de Linux qui traite le trafic provenant de l'intérieur des machines virtuelles [s11].

> [!INFERRED]
> À mon sens, un noyau de l'hôte qui analyse le trafic invité est une frontière à part entière, et sa version n'apparaît dans aucun épinglage de moteur ni de noyau invité.

## Pourquoi le délai de reconstruction compte

Je lis le rapport d'OpenAI sur le noyau comme un constat sur le temps, puisque ses exploits sont des élévations locales de privilèges sur une distribution Linux. Ce rapport, intitulé A thousand fewer paths to root [s40], indique qu'une seule exécution a produit 948 exploits fonctionnels d'élévation locale de privilèges (LPE) pour une distribution Linux couramment utilisée [s16], des exploits qui pourraient permettre à un utilisateur local non privilégié d'obtenir un accès root [s1]. L'exécution complète a coûté 1 213 430 dollars en crédits d'API, soit 1 279 dollars par exploit LPE [s38]. L'amont a réagi vite : en 10 jours, pendant l'analyse, plus de 100 LPE Linux avaient été corrigées ou disposaient de correctifs en préparation proposés par d'autres contributeurs [s4].

OpenAI en tire une conclusion pour les défenseurs : un compte peu privilégié sur un système d'exploitation en retard sur ses correctifs devrait être considéré comme fonctionnellement équivalent à un accès root pour un acteur malveillant doté de moyens importants [s2], et le rapport estime que même des modèles moins capables pourraient être en mesure de développer des exploits une fois les vulnérabilités divulguées [s39]. À ce prix par exploit, je pense que le temps qui sépare un correctif publié d'une machine qui l'exécute est le seul intervalle que le défenseur maîtrise.

Côté virtualisation, le rythme est le même. CSO Online recense cette année plusieurs vulnérabilités critiques dans KVM et d'autres composants de virtualisation fondés sur le noyau, dont certaines trouvées avec l'aide de LLM, parmi lesquelles PwnEscape [s13]. Vercel a reçu 1 285 rapports en deux semaines et estime que les chercheurs chassent désormais à la vitesse de l'IA [s33] ; certains ont dirigé leurs agents droit sur la frontière du noyau [s10]. Les chercheurs de PwnEscape, cités par CSO Online, s'attendent à des exploits fonctionnant dans les configurations d'hyperviseur par défaut en moins d'un mois [s35].

D'expérience, un correctif du noyau de l'hôte ne compte qu'une fois que l'hôte l'exécute, et sur un hôte de bacs à sable, y parvenir oblige à vider ou à migrer ses invités. Je pense que ce coût de planification explique pourquoi le noyau de l'hôte est l'épinglage le plus susceptible de rester figé pendant que le moteur avance.

À mon avis, l'amont va déjà vite. L'exposition se joue en aval, chez qui reconstruit l'hôte, et pour un bogue de l'invité vers l'hôte, cette reconstruction constitue tout le correctif.

## Le meilleur argument contre

La meilleure objection affirme que le confinement a tenu partout où il était activé, et elle mérite d'être exposée en entier. L'article de recherche sur PwnEscape affirme que ses auteurs sont sortis d'une microVM Firecracker et ont obtenu une exécution de code en tant que root sur l'hôte [s5]. Le même article précise que la configuration n'avait pas de jailer [s25], et que Firecracker était lancé directement en tant que root sous `systemd-run`, si bien que l'appel contrôlé s'exécutait en tant que root sur l'hôte [s27]. Il décrit le confinement de production comme l'abandon de privilèges et la restriction du processus par des espaces de noms et seccomp, et ajoute qu'un déploiement qui utilise ces contrôles exige une évaluation distincte de ce qui reste disponible après la compromission du VMM [s26]. Vercel ajoute que les attaques par plantage et par exécution de code ont été démontrées sur les propres machines KVM et Firecracker du chercheur, configurées comme la sienne [s30], et qu'aucun rapport n'a montré que quiconque ait accédé aux données des clients dans Vercel Sandbox [s8]. OpenAI juge d'ailleurs que les bacs à sable et les approches d'isolation comme Firecracker et gVisor sont importants pour limiter le rayon d'impact des vulnérabilités exploitées [s3]. L'objection conclut donc que l'accès root exigeait encore de franchir le confinement du VMM, soit précisément la condition que code la ligne de l'étude, et que garder l'hôte à jour est un conseil déjà donné : Vercel recommande de tenir à jour les noyaux de l'hôte et des invités [s9].

Je concède l'évasion jusqu'à root. Elle a tourné sans jailer, en tant que root, sur les propres machines des chercheurs, et je n'écrirais pas qu'un bac à sable de production a été compromis. Deux choses résistent à l'objection. À mon sens, la fuite n'exigeait aucune prise de contrôle du processus Firecracker et a été observée en production, et le correctif arrive sous la forme d'un noyau de l'hôte. Garder l'hôte à jour est un conseil pour qui administre l'hôte. Le client d'un bac à sable hébergé n'administre rien sur cette machine et n'y voit rien ; pour ce client, le conseil devient une question, et une question à laquelle chaque fournisseur doit répondre a sa place dans la grille.

## Ce que je demanderais à un fournisseur

Je mettrais le noyau de l'hôte sur la même fiche que la version épinglée du moteur, et je demanderais les deux par écrit.

- Je demande à un fournisseur hébergé la version du noyau qui tourne sur l'hôte et le délai entre un correctif amont et un hôte reconstruit puis redémarré, à côté de la version épinglée du moteur et du noyau invité.
- Je refuse comme réponse un `uname -r` lancé dans le bac à sable. Dans un invité Firecracker, la commande renvoie le noyau invité, et l'étude note que les opérateurs choisissent le noyau invité indépendamment du noyau hôte [s19].
- Sur une flotte auto-hébergée, je lance `uname -r` sur chaque hôte de bacs à sable et je compare le résultat au noyau le plus récent que livre la distribution. La défaillance que je cherche en premier est le noyau installé mais jamais démarré : un noyau corrigé présent dans `/boot` sur lequel l'hôte n'a jamais redémarré.
- Je garde le jailer et le reste du confinement de production ; la mise en garde de l'article de recherche lui-même en donne la raison.
- Je traite un fournisseur incapable de répondre comme l'étude traite un produit hébergé dans le cloud : opaque sur la question de l'épinglage [s22].

La classe de moteur décide toujours des chemins du noyau de l'hôte qu'un invité peut atteindre, puisque l'étude juge une CVE du noyau hôte en général inatteignable par le chemin des appels système de gVisor [s20]. J'ajoute donc la ligne à côté de la comparaison par classe, sans rien en retirer. L'auto-hébergement ne supprime pas cette ligne non plus ; je pense qu'il vous charge de la remplir.
