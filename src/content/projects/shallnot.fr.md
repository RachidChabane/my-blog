---
translationKey: 'shallnot'
lang: 'fr'
slug: 'shallnot-fr'
name: 'shallnot: Porte de Traçabilité Specs-Tests pour Agents de Code'
summary: 'Une porte déterministe qui empêche un agent de code d''annoncer un travail terminé tant qu''une exigence n''a pas de test qui passe, en joignant les spécifications, les sources de tests et les résultats JUnit XML dans un unique binaire Go statique qui n''appelle jamais de modèle.'
stack:
  - 'Go'
  - 'YAML'
  - 'JUnit XML'
  - 'GitHub Actions'
  - 'Claude Code'
status: 'actif'
links:
  - label: 'GitHub'
    url: 'https://github.com/RachidChabane/shallnot'
publishState: 'published'
year: '2026'
highlights:
  - 'Chaque exigence porte une révision: l''incrémenter invalide tous les tests qui citent encore le sens précédent, et une exigence reformulée ne peut pas profiter d''un vert périmé'
  - 'Une étiquette ne compte qu''une fois parvenue au fichier de résultats: posée dans un commentaire, ou sur un test qui ne tourne jamais, elle ne lie rien'
  - 'shallnot init outille un dépôt en une commande: configuration du runner, instructions d''agent, skills, et un hook de fin de tour pour 9 harnais d''agents'
  - 'Le déterminisme est imposé plutôt que promis: un test d''architecture fait échouer le build si le binaire lie un paquet réseau, ou si les couches domaine et analyse touchent un fichier'
  - 'L''outil se contrôle lui-même, en liant ses propres 57 exigences à des tests étiquetés en CI, dont les deux qui figent sa propre architecture'
  - 'La limite d''un run vert est documentée plutôt que masquée: il prouve qu''un test réussi cite l''exigence, pas que ce test affirme quoi que ce soit d''utile'
metrics:
  - value: '57'
    label: 'exigences propres contrôlées en CI'
  - value: '9'
    label: 'harnais d''agents outillés'
architecture:
  caption: 'Trois entrées jointes en un seul verdict'
  layers:
    - label: 'Spécifications'
      nodes:
        - 'spec Markdown'
        - 'spec YAML'
        - 'ID~REVISION'
    - label: 'Tests'
      nodes:
        - 'pytest'
        - 'Jest / Vitest'
        - 'JUnit 5'
        - 'Go'
        - '[verifies ID~REVISION]'
    - label: 'Résultats'
      nodes:
        - 'JUnit XML'
    - label: 'Porte'
      nodes:
        - 'shallnot gate'
        - 'shallnot check'
        - 'états des exigences'
        - 'constats'
    - label: 'Restitution'
      nodes:
        - 'code de sortie'
        - 'rapport JSON'
        - 'hook de fin de tour'
        - 'GitHub Action'
---

shallnot referme la boucle sur ce que l'agent déclare de lui-même. Chaque exigence d'une spécification Markdown ou YAML porte un identifiant et une révision, notés `PWD-2~1`; chaque test en cite une via une étiquette `[verifies PWD-2~1]`, placée là où son runner la reportera dans le JUnit XML. La porte joint ces trois entrées et échoue tant que chaque exigence n'est pas citée par un test réellement exécuté et réussi: une étiquette posée dans un commentaire, ou sur un test qui ne tourne jamais, ne lie rien. Incrémenter une révision invalide tous les tests qui citent encore le sens précédent, ce qui empêche une exigence reformulée de profiter d'un vert périmé. `shallnot init` outille un dépôt en une commande: configuration du runner détecté, instructions d'agent, skills, et un hook de fin de tour qui renvoie les constats pour que l'agent poursuive au lieu de s'arrêter. Le déterminisme est imposé plutôt que promis: un test d'architecture fait échouer le build si le binaire lie un paquet réseau, ou si les couches domaine et analyse touchent un fichier. L'outil se contrôle lui-même, en liant ses propres 57 exigences à des tests étiquetés dans sa CI. Ce que le vert ne prouve pas, à savoir la qualité des tests eux-mêmes, le projet le dit sans détour: ce jugement relève de la revue, confié à un skill plutôt que revendiqué par la porte.
