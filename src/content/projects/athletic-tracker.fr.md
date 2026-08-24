---
translationKey: 'athletic-tracker'
lang: 'fr'
slug: 'suivi-athletique'
name: 'Hevy Periodizer'
summary: 'Un moteur de périodisation d''entraînement open source qui se configure au lieu de se coder. Objectifs, matériel et contraintes en entrée ; en sortie, la semaine prescrite, chaque charge résolue en disques que l''athlète possède vraiment. Claude mène la conversation de coaching, le moteur fait l''arithmétique.'
stack:
  - 'Python'
  - 'Pydantic'
  - 'Hypothesis'
  - 'pytest'
  - 'Claude Code'
  - 'Hevy API'
status: 'actif'
links:
  - label: 'GitHub'
    url: 'https://github.com/RachidChabane/hevy-periodizer'
  - label: 'Plugin de coaching (atelier)'
    url: 'https://github.com/RachidChabane/atelier'
publishState: 'published'
year: '2026'
highlights:
  - 'La couche de charge transforme 85 % d''un max de 140 kg en 117,5 kg, parce que 119 est un nombre qu''aucune barre avec des disques de 1,25 kg ne sait faire'
  - 'Des tests par propriétés génèrent des inventaires de matériel et vérifient que chaque prescription est chargeable, que la résolution est idempotente et que l''arrondi vers le bas ne dépasse jamais'
  - 'Deux athlètes d''exemple ne partagent presque rien, et un test d''intégration construit les deux et échoue si le moteur dérive vers l''un d''eux'
  - 'Le plugin Claude hevy-coach transforme l''onboarding en conversation et écrit le YAML à votre place ; le moteur fonctionne très bien sans lui'
metrics:
  - value: '103'
    label: 'fonctions de test, plus les cas générés par propriétés'
  - value: '2'
    label: 'athlètes d''exemple volontairement divergents'
  - value: 'MIT'
    label: 'licence'
architecture:
  caption: 'Les dépendances pointent uniquement vers l''intérieur'
  layers:
    - label: 'Conversation de coaching'
      nodes:
        - 'plugin hevy-coach'
        - 'Claude Code'
        - './start'
    - label: 'Config comme code'
      nodes:
        - 'athlete.yaml'
        - 'program.yaml'
        - 'schéma pydantic'
    - label: 'Moteur'
      nodes:
        - 'build_week'
        - 'review_week'
        - 'résolution de charge'
    - label: 'Adaptateurs'
      nodes:
        - 'API Hevy'
        - 'tracker manuel'
        - 'stockage'
---

Hevy Periodizer est le successeur open source d'un tracker privé que j'ai fait tourner sur mon propre programme pendant un an. La réécriture garde l'idée et retire la personne. Tout ce qui relève d'une opinion est passé dans `athlete.yaml` et `program.yaml`, si bien que le même moteur sert un powerlifter avec quatre max testés et un athlète en rééducation qui possède une paire d'haltères réglables et ne testera jamais de max. Deux exemples livrés encodent exactement ces deux athlètes. Un test d'intégration construit les deux et échoue s'ils cessent de diverger, ce qui garde la généralité honnête.

La partie la plus testée est la couche de charge, parce que c'est le calcul le plus susceptible de blesser quelqu'un. Un programme dit 85 % de 140 kg. Ça fait 119, et personne ne charge 119 sur une barre avec des disques de 1,25 kg. Le moteur sait qu'une barre avance par pas de deux fois le plus petit disque, qu'une ceinture de lest avance d'un seul, que des haltères fixes ont des trous dans leur gamme, et que les pourcentages au poids du corps s'appliquent à l'athlète plus la ceinture. Les suites par propriétés génèrent des inventaires et vérifient les invariants : chaque réponse est chargeable, résoudre deux fois ne change rien, et l'arrondi vers le bas ne dépasse jamais, la garantie sur laquelle repose le travail de rééducation. Claude s'installe au-dessus via le plugin hevy-coach. Lancer `./start` ouvre une conversation de coaching qui écrit la config, passe la semaine en revue face à ce que Hevy a enregistré, et explique pourquoi un chiffre a changé. Le moteur calcule. Le coach décide.
