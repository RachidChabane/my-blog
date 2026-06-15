---
translationKey: 'cca-f-exam-trainer'
lang: 'fr'
slug: 'entraineur-examen-cca-f'
name: 'Entraîneur d''examen CCA-F : pratique bilingue de la certification'
summary: 'Un entraîneur d''examen entièrement côté client et bilingue (français et anglais) pour la certification Claude Certified Architect Foundations (CCA-F) d''Anthropic : des examens blancs chronométrés et pondérés sur les cinq domaines officiels, un score normalisé avec répartition par domaine et revue complète des réponses, et un mode révision de résumés de cours originaux ancrés dans la documentation Anthropic de première partie.'
stack:
  - 'React 19'
  - 'TypeScript'
  - 'Vite'
  - 'Tailwind CSS v4'
  - 'Zustand'
  - 'Playwright'
  - 'GitHub Actions'
status: 'en production'
links:
  - label: 'Live app'
    url: 'https://rachidchabane.github.io/cca-f-exam-trainer/'
  - label: 'GitHub'
    url: 'https://github.com/RachidChabane/cca-f-exam-trainer'
relatedArticles:
  - 'context-budget'
  - 'evaluating-tool-using-agents'
  - 'deterministic-agent-workflows'
publishState: 'published'
year: '2026'
highlights:
  - 'Un examen blanc bâti comme le vrai : pondéré sur les cinq domaines officiels, avec une grille de marquage et de navigation, un compte à rebours de 120 minutes, une soumission automatique et un score normalisé de 100 à 1000 (réussite à 720).'
  - 'Chaque résultat détaille la précision par domaine et ouvre une revue complète : votre réponse, la bonne réponse, pourquoi elle est la meilleure et pourquoi chaque distracteur échoue.'
  - 'Une bascule français / anglais totale change toute l''interface et tout le contenu d''un coup ; la langue, le thème et un examen en cours persistent localement, sans backend ni comptes.'
  - 'Contenu original ancré dans la documentation Anthropic de première partie, protégé par un fact-check déterministe, une revue optionnelle des clés de réponse par Claude et une suite Playwright exécutée contre le bundle de production avant chaque déploiement sur GitHub Pages.'
metrics:
  - value: '300+'
    label: 'questions de scénario'
  - value: '5'
    label: 'domaines pondérés'
  - value: '11'
    label: 'résumés de cours'
  - value: 'EN / FR'
    label: 'entièrement bilingue'
architecture:
  caption: 'Local d''abord, contenu validé, déploiement continu'
  layers:
    - label: 'Contenu (JSON bilingue)'
      nodes:
        - 'banque de questions'
        - 'résumés de cours'
        - 'blueprint d''examen'
    - label: 'App (Vite, React 19, TS)'
      nodes:
        - 'moteur d''examen'
        - 'score normalisé'
        - 'lecteur de révision'
        - 'FR / EN + thème'
    - label: 'État'
      nodes:
        - 'store Zustand'
        - 'localStorage (reprise, historique, préférences)'
    - label: 'Portes qualité (CI)'
      nodes:
        - 'validation du schéma'
        - 'fact-check déterministe'
        - 'e2e Playwright'
    - label: 'Déploiement'
      nodes:
        - 'GitHub Actions'
        - 'GitHub Pages'
gallery:
  - src: '/work/cca-f-exam-trainer/home.fr.png'
    alt: 'Écran d''accueil de l''Entraîneur d''examen CCA-F en français, avec les cartes des modes examen et révision et le blueprint'
    caption: 'Accueil : modes examen et révision, avec le blueprint en un coup d''oeil'
  - src: '/work/cca-f-exam-trainer/exam.fr.png'
    alt: 'Une question d''examen chronométré en français avec son domaine, quatre options et la grille de navigation numérotée'
    caption: 'Examen : une question de scénario, son domaine et la grille de navigation'
  - src: '/work/cca-f-exam-trainer/results.fr.png'
    alt: 'Écran de résultats en français montrant un score normalisé sur 1000, le seuil de réussite et la précision par domaine'
    caption: 'Résultats : score normalisé, seuil de réussite et précision par domaine'
  - src: '/work/cca-f-exam-trainer/review.fr.png'
    alt: 'Revue des réponses en français avec la réponse choisie, la bonne réponse et pourquoi elle est la meilleure'
    caption: 'Révision : votre réponse, la bonne réponse et pourquoi elle est la meilleure'
  - src: '/work/cca-f-exam-trainer/study.fr.png'
    alt: 'Mode révision en français avec un index de cours, un résumé de cours et des concepts clés mis en évidence'
    caption: 'Révision : résumés de cours avec concepts clés et auto-évaluations'
---

L'Entraîneur d'examen CCA-F est une application monopage entièrement côté client (Vite, React 19, TypeScript, Tailwind CSS v4), sans backend, sans base de données et sans comptes : chaque examen en cours, historique de résultats et préférence ne vit que dans le localStorage du navigateur. Le moteur d'examen assemble un examen blanc chronométré et pondéré sur les cinq domaines officiels, avec une grille de marquage et de navigation, un compte à rebours de 120 minutes et une soumission automatique à zéro. Chaque session est notée selon une approximation linéaire documentée du score normalisé de 100 à 1000 (réussite à 720), avec une répartition de la précision par domaine et une revue complète des réponses qui montre votre réponse, la bonne réponse, pourquoi elle est la meilleure et pourquoi chaque distracteur échoue. Un store Zustand persiste l'état de session : un examen en cours survit à un rafraîchissement ou à une mise en veille, les tentatives récentes forment un historique de scores, et vous pouvez ne reprendre que les questions ratées ou réviser un seul domaine faible sans chronomètre. La bascule français / anglais est totale : un clic change chaque libellé et chaque contenu, y compris les énoncés, les options, les explications et les corps de cours du mode révision. Toutes les questions et tous les résumés sont originaux et ancrés dans la documentation Anthropic de première partie, sans banque de questions tierce ; un fact-check déterministe fixe les paramètres de l'examen et garde les chiffres rapportés par la communauté étiquetés comme tels, une passe optionnelle propulsée par Claude relit les clés de réponse, et une suite Playwright s'exécute contre le vrai bundle de production. L'intégration continue relie le tout : chaque push lance la validation du schéma, le fact-check et les tests de bout en bout avant le déploiement sur GitHub Pages.
