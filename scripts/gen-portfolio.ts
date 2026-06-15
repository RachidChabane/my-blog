import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { ProjectFrontmatter } from '../src/content/schemas';
import type { Locale } from '../src/i18n/index';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const FLAGGED_TERMS: string[] = [
  // Raw private repository directory names
  'quality-gate-AI',
  'knowledge-master',
  'math-monster',
  'cc-mvp-scaffold',
  'kairox-studio',
  'modular-web-factory',
  // Third-party personal data identifiers
  'Rose Torres',
  'Ikram Mameche',
  'El Chaher',
  'elchaher',
  'trucIkram',
  'docs-Rose',
  // Secret-related file names present in private repos
  'SCALEWAY_SECRETS_BACKUP',
  'SECRETS_INVENTORY',
  'RESEND_API_KEY',
];

export interface Metric {
  value: string;
  label: string;
}
export interface ArchLayer {
  label: string;
  nodes: string[];
}
export interface Architecture {
  caption?: string;
  layers: ArchLayer[];
}
export interface GalleryImage {
  src: string; // site-root path under public/ (e.g. "/work/<slug>/home.png")
  alt: string; // required for a11y
  caption?: string;
}

export interface LocalizedCopy {
  slug: string;
  name: string;
  summary: string;
  body: string;
  // Optional enrichment (richer S7 pages). Authored from this project's own body
  // (no fabrication); each locale carries its own labels.
  role?: string;
  highlights?: string[];
  metrics?: Metric[];
  architecture?: Architecture;
  // Optional screenshot gallery — per-locale so an EN page shows EN screens and an
  // FR page shows FR screens (captured from the real app, not fabricated).
  gallery?: GalleryImage[];
}

export interface PortfolioEntry {
  translationKey: string;
  stack: string[];
  status: { fr: string; en: string };
  links: Array<{ label: string; url: string }>;
  relatedArticles?: string[];
  derivedFrom?: string;
  publishState: 'draft' | 'published';
  year?: string; // locale-neutral
  fr: LocalizedCopy;
  en: LocalizedCopy;
}

export const PORTFOLIO_PROJECTS: PortfolioEntry[] = [
  // ── 1. Sterna ─────────────────────────────────────────────────────────────
  // Public brand: "Sterna" (a tern seabird). Directory name (quality-gate-AI) never exposed.
  {
    translationKey: 'sterna-ai-platform',
    stack: [
      'Python',
      'Django',
      'React',
      'OpenRouter',
      'pgvector',
      'Kubernetes',
      'Cloudflare',
    ],
    status: { en: 'pre-launch', fr: 'pré-lancement' },
    links: [],
    publishState: 'published',
    en: {
      slug: 'sterna-ai-platform',
      name: 'Sterna — Multi-Model AI Platform',
      summary:
        'A production-grade, multi-model AI chat and agent platform with sandboxed code execution, ' +
        'a RAG knowledge base, MCP integrations, and Stripe billing — built autonomously by a ' +
        'homegrown Claude Code orchestrator.',
      body:
        'Sterna is a full-stack AI product: a Django/DRF backend hosting eleven domain apps ' +
        '(multi-LLM via OpenRouter, coding assistant, sandboxed code execution, pgvector RAG, ' +
        'MCP connectors, AI voice rooms, Stripe billing, GDPR/rate-limiting hardening) paired with ' +
        'a React 19 + TypeScript frontend. The entire codebase was driven by an autonomous ' +
        'Claude Code task-runner that enforced per-task quality gates, gate-repair loops, and ' +
        'structured failure records — making the development process itself a case study in ' +
        'agentic software engineering.',
    },
    fr: {
      slug: 'plateforme-ia-sterna',
      name: 'Sterna — Plateforme IA Multi-Modèles',
      summary:
        "Une plateforme de chat et d'agents IA multi-modèles de niveau production, avec exécution " +
        'de code en sandbox, base de connaissances RAG, intégrations MCP et facturation Stripe — ' +
        'construite de manière autonome par un orchestrateur Claude Code maison.',
      body:
        'Sterna est un produit IA full-stack : un backend Django/DRF hébergeant onze applications ' +
        'métier (multi-LLM via OpenRouter, assistant de codage, exécution de code en sandbox, ' +
        'RAG pgvector, connecteurs MCP, salles vocales IA, facturation Stripe, durcissement ' +
        "RGPD/limitation de débit) couplé à un frontend React 19 + TypeScript. L'ensemble du " +
        'code a été piloté par un task-runner Claude Code autonome appliquant des portes de ' +
        "qualité par tâche, des boucles de réparation de portes et des enregistrements d'échecs " +
        'structurés — faisant du processus de développement lui-même une étude de cas en ' +
        'ingénierie logicielle agentique.',
    },
  },

  // ── 2. Ijtihad Engine ─────────────────────────────────────────────────────
  // Codename IS the public product name. Dir (math-monster/ijtihad-engine) never exposed.
  {
    translationKey: 'ijtihad-engine',
    stack: [
      'Python',
      'Claude Code',
      'LaTeX',
      'aiosqlite',
      'SymPy',
      'Z3',
      'FastAPI',
    ],
    status: { en: 'active (paused)', fr: 'actif (en pause)' },
    links: [],
    publishState: 'published',
    en: {
      slug: 'ijtihad-engine',
      name: 'Ijtihad Engine — Autonomous Research System',
      summary:
        'A self-improving, multi-agent LLM orchestration system that autonomously attacks open ' +
        'problems in mathematics and science, verifying claims formally and producing ' +
        'publication-ready research papers.',
      body:
        'The Ijtihad Engine runs ~16 specialized Claude Code subagents across an 8-phase cycle: ' +
        'divergence, claim extraction, friction, evidence-quality audit, evidence-sufficiency gate, ' +
        'synthesis, meta-evolution, and formal construction. At its core is a SQLite-backed ' +
        'epistemic claim graph that tracks atomic claims through a confidence lifecycle ' +
        '(conjectured → supported → replicated → contested → refuted) with typed victory ' +
        'conditions — Lean proof, SymPy verification, or simulation fragility threshold. ' +
        'The engine has produced compiled, submission-ready research papers as real outputs.',
    },
    fr: {
      slug: 'moteur-ijtihad',
      name: 'Ijtihad Engine — Système de Recherche Autonome',
      summary:
        "Un système d'orchestration multi-agents LLM auto-améliorant qui attaque de manière " +
        'autonome des problèmes ouverts en mathématiques et en science, vérifiant les affirmations ' +
        'formellement et produisant des articles de recherche prêts à soumettre.',
      body:
        "L'Ijtihad Engine fait tourner ~16 sous-agents Claude Code spécialisés sur 8 phases " +
        'cycliques : divergence, extraction de claims, friction, audit de qualité des preuves, ' +
        'porte de suffisance des preuves, synthèse, méta-évolution et construction formelle. ' +
        'Son cœur est un graphe de claims épistémiques sur SQLite qui suit des claims atomiques ' +
        'dans un cycle de confiance (conjectured → supported → replicated → contested → refuted) ' +
        'avec des conditions de victoire typées — preuve Lean, vérification SymPy ou seuil de ' +
        'fragilité de simulation. Le moteur a produit des articles de recherche compilés et ' +
        'prêts à soumettre comme résultats réels.',
    },
  },

  // ── 3. Bayan ──────────────────────────────────────────────────────────────
  // Codename IS the public product name. Dir (knowledge-master) never exposed.
  {
    translationKey: 'bayan-rag-platform',
    stack: [
      'Python',
      'FastAPI',
      'pgvector',
      'OpenRouter',
      'React',
      'PostgreSQL',
      'Docker',
    ],
    status: { en: 'MVP ready', fr: 'MVP prêt' },
    links: [],
    publishState: 'published',
    en: {
      slug: 'bayan-rag-platform',
      name: 'Bayan — Arabic Scholarship RAG Platform',
      summary:
        'A multi-user platform for citation-exact answers over classical Arabic books, powered by ' +
        'a hybrid BM25 + pgvector retrieval pipeline with cross-encoder reranking, verifier-loop ' +
        'recursion, and a precision "I don\'t know" threshold gate.',
      body:
        'Bayan delivers citation-exact answers (page, line, hadith number, bayt number, folio) ' +
        'from private or shared classical Arabic knowledge bases. Its retrieval stack runs two ' +
        'parallel legs — lexical GIN tsvector and pgvector cosine HNSW — fused with Reciprocal ' +
        'Rank Fusion, then reranked by a cross-encoder. A threshold gate refuses synthesis when ' +
        'top cosine similarity falls below the knowledge-base threshold, returning near-misses ' +
        'rather than hallucinating. A verifier recursion loop (depth-capped, SSE-streamed) ' +
        'iterates sub-queries until the retrieval is judged sufficient. The stack was built ' +
        'autonomously and passes a seven-gate MVP scorecard including 100% citation recall.',
    },
    fr: {
      slug: 'bayan-plateforme-rag',
      name: "Bayan — Plateforme RAG pour l'Érudition Arabe",
      summary:
        'Une plateforme multi-utilisateurs pour des réponses à citations exactes sur des livres ' +
        'arabes classiques, alimentée par un pipeline de récupération hybride BM25 + pgvector avec ' +
        'reclassement cross-encoder, récursion par boucle de vérification et une porte de seuil ' +
        '"je ne sais pas" de précision.',
      body:
        'Bayan fournit des réponses à citations exactes (page, ligne, numéro de hadith, numéro ' +
        'de bayt, folio) depuis des bases de connaissances arabes classiques privées ou partagées. ' +
        'Son stack de récupération exécute deux branches en parallèle — tsvector GIN lexical et ' +
        'cosinus pgvector HNSW — fusionnées par Reciprocal Rank Fusion, puis reclassées par un ' +
        'cross-encoder. Une porte de seuil refuse la synthèse si la similarité cosinus maximale ' +
        'est inférieure au seuil de la base de connaissances, retournant des quasi-correspondances ' +
        "plutôt qu'halluciner. Une boucle de récursion vérificateur (profondeur plafonnée, " +
        "diffusée en SSE) itère des sous-requêtes jusqu'à juger la récupération suffisante. " +
        'Le stack a été construit de manière autonome et passe un scorecard MVP à sept portes, ' +
        'dont 100 % de rappel de citations.',
    },
  },

  // ── 4. Claude Plan Execute ────────────────────────────────────────────────
  {
    translationKey: 'claude-plan-execute',
    stack: ['Python', 'Claude Code', 'tmux', 'YAML', 'pytest', 'FastAPI'],
    status: { en: 'active', fr: 'actif' },
    links: [],
    publishState: 'published',
    en: {
      slug: 'claude-plan-execute',
      name: 'Claude Plan Execute — Autonomous Task Orchestrator',
      summary:
        'A plan→review→implement orchestrator that drives the Claude Code CLI through a multi-phase, ' +
        'multi-agent workflow over a declarative task slate, with quality gates, branch-per-task, ' +
        'cross-task memory, and a subscription-pool-preserving tmux backend.',
      body:
        'Claude Plan Execute runs a fixed lifecycle for every task: Plan agent writes a structured ' +
        'plan; a Review loop checks it (APPROVED / NEEDS_REVISION) and iterates a revise agent up ' +
        'to the configured round cap; only an approved plan reaches the Implement agent, which ' +
        'works in committed chunks with a resumable progress checklist. Role specialization is ' +
        'prompt-swapping, not separate binaries. A dual-backend driver lets the same code run ' +
        'either the `claude -p` print backend or a real interactive Claude TUI inside tmux — ' +
        'the latter keeps usage on the Claude subscription pool rather than the metered API. ' +
        'The project dogfoods itself: its own roadmap is the tasks.yaml it executes.',
    },
    fr: {
      slug: 'claude-plan-execute-fr',
      name: 'Claude Plan Execute — Orchestrateur de Tâches Autonome',
      summary:
        'Un orchestrateur plan→révision→implémentation qui pilote le CLI Claude Code à travers un ' +
        'workflow multi-phases et multi-agents sur un slate de tâches déclaratif, avec des portes ' +
        'de qualité, une branche par tâche, une mémoire inter-tâches et un backend tmux préservant ' +
        "le pool d'abonnement.",
      body:
        "Claude Plan Execute exécute un cycle fixe pour chaque tâche : l'agent Plan écrit un plan " +
        'structuré ; une boucle de révision le contrôle (APPROVED / NEEDS_REVISION) et itère un ' +
        "agent de révision jusqu'au plafond configuré de rounds ; seul un plan approuvé atteint " +
        "l'agent Implement, qui travaille par commits avec une checklist de progression reprise. " +
        'La spécialisation de rôle est du swap de prompt, non des binaires séparés. Un pilote ' +
        "double backend permet au même code d'utiliser soit le backend print `claude -p`, soit " +
        "un vrai TUI Claude interactif dans tmux — ce dernier maintient l'usage sur le pool " +
        "d'abonnement Claude plutôt que l'API facturée. Le projet se dogfoode lui-même : " +
        "sa propre roadmap est le tasks.yaml qu'il exécute.",
    },
  },

  // ── 4b. CCA-F Exam Trainer ────────────────────────────────────────────────
  // Public GitHub repo + GitHub Pages app; safe to link directly. Copy describes
  // the deployed, content-complete build; screenshots captured from the live app.
  {
    translationKey: 'cca-f-exam-trainer',
    stack: [
      'React 19',
      'TypeScript',
      'Vite',
      'Tailwind CSS v4',
      'Zustand',
      'Playwright',
      'GitHub Actions',
    ],
    status: { en: 'in production', fr: 'en production' },
    links: [
      {
        label: 'Live app',
        url: 'https://rachidchabane.github.io/cca-f-exam-trainer/',
      },
      {
        label: 'GitHub',
        url: 'https://github.com/RachidChabane/cca-f-exam-trainer',
      },
    ],
    // Public-safe related reads (all published FR + EN); on-point for the CCA-F
    // domains (context management, tool-using agents, agentic coding workflows).
    relatedArticles: [
      'context-budget',
      'evaluating-tool-using-agents',
      'deterministic-agent-workflows',
    ],
    publishState: 'published',
    year: '2026',
    en: {
      slug: 'cca-f-exam-trainer',
      name: 'CCA-F Exam Trainer: Bilingual Certification Practice',
      summary:
        'A fully client-side, bilingual (English and French) practice trainer for ' +
        "Anthropic's Claude Certified Architect Foundations (CCA-F) exam: timed mocks " +
        'weighted across the five official domains, a scaled score with a per-domain ' +
        'breakdown and a full answer review, plus a study mode of original course ' +
        'summaries grounded in first-party Anthropic documentation.',
      body:
        'CCA-F Exam Trainer is a fully client-side single-page app (Vite, React 19, ' +
        'TypeScript, Tailwind CSS v4) with no backend, no database, and no accounts: ' +
        'every in-progress exam, results history, and preference lives only in the ' +
        "browser's localStorage. The exam runner assembles a timed mock weighted across " +
        'the five official domains, with a flag-and-navigator grid, a 120-minute ' +
        'countdown, and auto-submit at zero. Each sitting is graded on a documented ' +
        'linear approximation of the scaled 100-1000 score (pass at 720), with a ' +
        'per-domain accuracy breakdown and a full answer review that shows your answer, ' +
        'the correct one, why it is best, and why each distractor falls short. A Zustand ' +
        'store persists session state, so an in-progress mock survives a refresh or a ' +
        'slept laptop, recent attempts build a score history, and you can re-quiz only ' +
        'the questions you missed or drill a single weak domain untimed. The English and ' +
        'French toggle is total: one click swaps every label and every piece of content, ' +
        'including stems, options, explanations, and the study-mode course bodies. All ' +
        'questions and summaries are original and grounded in first-party Anthropic ' +
        'documentation, with no third-party question banks; a deterministic fact-check ' +
        'pins the exam parameters and keeps community-reported numbers labeled as such, ' +
        'an optional Claude-powered pass reviews the answer keys, and a Playwright suite ' +
        'runs against the real production bundle. Continuous integration ties it ' +
        'together: every push runs schema validation, the fact-check, and end-to-end ' +
        'tests before deploying to GitHub Pages.',
      highlights: [
        'A timed mock built like the real exam: weighted across the five official ' +
          'domains, with a flag-and-navigator grid, a 120-minute countdown, auto-submit, ' +
          'and a scaled 100-1000 score (pass at 720).',
        'Every result breaks accuracy down per domain and opens a full review: your ' +
          'answer, the correct answer, why it is best, and why each distractor falls short.',
        'A total English / French toggle flips all UI and all content at once; language, ' +
          'theme, and an in-progress attempt persist locally, with no backend and no accounts.',
        'Original content grounded in first-party Anthropic docs, guarded by a ' +
          'deterministic fact-check, an optional Claude answer-key review, and a Playwright ' +
          'suite that runs against the production bundle before each GitHub Pages deploy.',
      ],
      metrics: [
        { value: '300+', label: 'scenario questions' },
        { value: '5', label: 'weighted domains' },
        { value: '11', label: 'course summaries' },
        { value: 'EN / FR', label: 'fully bilingual' },
      ],
      architecture: {
        caption: 'Local-first, content-validated, continuously deployed',
        layers: [
          {
            label: 'Content (bilingual JSON)',
            nodes: ['question pool', 'course summaries', 'exam blueprint'],
          },
          {
            label: 'App (Vite, React 19, TS)',
            nodes: [
              'exam runner',
              'scaled scoring',
              'study reader',
              'EN / FR + theme',
            ],
          },
          {
            label: 'State',
            nodes: ['Zustand store', 'localStorage (resume, history, prefs)'],
          },
          {
            label: 'Quality gates (CI)',
            nodes: [
              'schema check',
              'deterministic fact-check',
              'Playwright e2e',
            ],
          },
          {
            label: 'Deploy',
            nodes: ['GitHub Actions', 'GitHub Pages'],
          },
        ],
      },
      gallery: [
        {
          src: '/work/cca-f-exam-trainer/home.en.png',
          alt: 'CCA-F Exam Trainer home screen in English, with the exam and study mode cards and the exam blueprint',
          caption: 'Home: exam and study modes, with the blueprint at a glance',
        },
        {
          src: '/work/cca-f-exam-trainer/exam.en.png',
          alt: 'A timed exam question in English with its domain tag, four options, and the numbered question-navigator grid',
          caption:
            'Exam: a scenario question, its domain, and the navigator grid',
        },
        {
          src: '/work/cca-f-exam-trainer/results.en.png',
          alt: 'The results screen in English showing a scaled score out of 1000, the pass mark, and accuracy by domain',
          caption: 'Results: scaled score, pass line, and accuracy by domain',
        },
        {
          src: '/work/cca-f-exam-trainer/review.en.png',
          alt: 'The answer review in English with the chosen answer, the correct answer, and why it is best',
          caption:
            'Review: your answer, the correct answer, and why it is best',
        },
        {
          src: '/work/cca-f-exam-trainer/study.en.png',
          alt: 'Study mode in English with a course index, a course summary, and highlighted key concepts',
          caption: 'Study: course summaries with key concepts and self-checks',
        },
      ],
    },
    fr: {
      slug: 'entraineur-examen-cca-f',
      name: "Entraîneur d'examen CCA-F : pratique bilingue de la certification",
      summary:
        "Un entraîneur d'examen entièrement côté client et bilingue (français et " +
        'anglais) pour la certification Claude Certified Architect Foundations (CCA-F) ' +
        "d'Anthropic : des examens blancs chronométrés et pondérés sur les cinq " +
        'domaines officiels, un score normalisé avec répartition par domaine et revue ' +
        'complète des réponses, et un mode révision de résumés de cours originaux ancrés ' +
        'dans la documentation Anthropic de première partie.',
      body:
        "L'Entraîneur d'examen CCA-F est une application monopage entièrement côté " +
        'client (Vite, React 19, TypeScript, Tailwind CSS v4), sans backend, sans base ' +
        'de données et sans comptes : chaque examen en cours, historique de résultats et ' +
        "préférence ne vit que dans le localStorage du navigateur. Le moteur d'examen " +
        'assemble un examen blanc chronométré et pondéré sur les cinq domaines officiels, ' +
        'avec une grille de marquage et de navigation, un compte à rebours de 120 minutes ' +
        'et une soumission automatique à zéro. Chaque session est notée selon une ' +
        'approximation linéaire documentée du score normalisé de 100 à 1000 (réussite à ' +
        '720), avec une répartition de la précision par domaine et une revue complète des ' +
        'réponses qui montre votre réponse, la bonne réponse, pourquoi elle est la ' +
        'meilleure et pourquoi chaque distracteur échoue. Un store Zustand persiste ' +
        "l'état de session : un examen en cours survit à un rafraîchissement ou à une " +
        'mise en veille, les tentatives récentes forment un historique de scores, et vous ' +
        'pouvez ne reprendre que les questions ratées ou réviser un seul domaine faible ' +
        'sans chronomètre. La bascule français / anglais est totale : un clic change ' +
        'chaque libellé et chaque contenu, y compris les énoncés, les options, les ' +
        'explications et les corps de cours du mode révision. Toutes les questions et ' +
        'tous les résumés sont originaux et ancrés dans la documentation Anthropic de ' +
        'première partie, sans banque de questions tierce ; un fact-check déterministe ' +
        "fixe les paramètres de l'examen et garde les chiffres rapportés par la " +
        'communauté étiquetés comme tels, une passe optionnelle propulsée par Claude relit ' +
        "les clés de réponse, et une suite Playwright s'exécute contre le vrai bundle de " +
        "production. L'intégration continue relie le tout : chaque push lance la " +
        'validation du schéma, le fact-check et les tests de bout en bout avant le ' +
        'déploiement sur GitHub Pages.',
      highlights: [
        'Un examen blanc bâti comme le vrai : pondéré sur les cinq domaines officiels, ' +
          'avec une grille de marquage et de navigation, un compte à rebours de 120 ' +
          'minutes, une soumission automatique et un score normalisé de 100 à 1000 ' +
          '(réussite à 720).',
        'Chaque résultat détaille la précision par domaine et ouvre une revue complète : ' +
          'votre réponse, la bonne réponse, pourquoi elle est la meilleure et pourquoi ' +
          'chaque distracteur échoue.',
        "Une bascule français / anglais totale change toute l'interface et tout le " +
          "contenu d'un coup ; la langue, le thème et un examen en cours persistent " +
          'localement, sans backend ni comptes.',
        'Contenu original ancré dans la documentation Anthropic de première partie, ' +
          'protégé par un fact-check déterministe, une revue optionnelle des clés de ' +
          'réponse par Claude et une suite Playwright exécutée contre le bundle de ' +
          'production avant chaque déploiement sur GitHub Pages.',
      ],
      metrics: [
        { value: '300+', label: 'questions de scénario' },
        { value: '5', label: 'domaines pondérés' },
        { value: '11', label: 'résumés de cours' },
        { value: 'EN / FR', label: 'entièrement bilingue' },
      ],
      architecture: {
        caption: "Local d'abord, contenu validé, déploiement continu",
        layers: [
          {
            label: 'Contenu (JSON bilingue)',
            nodes: [
              'banque de questions',
              'résumés de cours',
              "blueprint d'examen",
            ],
          },
          {
            label: 'App (Vite, React 19, TS)',
            nodes: [
              "moteur d'examen",
              'score normalisé',
              'lecteur de révision',
              'FR / EN + thème',
            ],
          },
          {
            label: 'État',
            nodes: [
              'store Zustand',
              'localStorage (reprise, historique, préférences)',
            ],
          },
          {
            label: 'Portes qualité (CI)',
            nodes: [
              'validation du schéma',
              'fact-check déterministe',
              'e2e Playwright',
            ],
          },
          {
            label: 'Déploiement',
            nodes: ['GitHub Actions', 'GitHub Pages'],
          },
        ],
      },
      gallery: [
        {
          src: '/work/cca-f-exam-trainer/home.fr.png',
          alt: "Écran d'accueil de l'Entraîneur d'examen CCA-F en français, avec les cartes des modes examen et révision et le blueprint",
          caption:
            "Accueil : modes examen et révision, avec le blueprint en un coup d'oeil",
        },
        {
          src: '/work/cca-f-exam-trainer/exam.fr.png',
          alt: "Une question d'examen chronométré en français avec son domaine, quatre options et la grille de navigation numérotée",
          caption:
            'Examen : une question de scénario, son domaine et la grille de navigation',
        },
        {
          src: '/work/cca-f-exam-trainer/results.fr.png',
          alt: 'Écran de résultats en français montrant un score normalisé sur 1000, le seuil de réussite et la précision par domaine',
          caption:
            'Résultats : score normalisé, seuil de réussite et précision par domaine',
        },
        {
          src: '/work/cca-f-exam-trainer/review.fr.png',
          alt: 'Revue des réponses en français avec la réponse choisie, la bonne réponse et pourquoi elle est la meilleure',
          caption:
            'Révision : votre réponse, la bonne réponse et pourquoi elle est la meilleure',
        },
        {
          src: '/work/cca-f-exam-trainer/study.fr.png',
          alt: 'Mode révision en français avec un index de cours, un résumé de cours et des concepts clés mis en évidence',
          caption:
            'Révision : résumés de cours avec concepts clés et auto-évaluations',
        },
      ],
    },
  },

  // ── 5. Athletic Tracker ───────────────────────────────────────────────────
  {
    translationKey: 'athletic-tracker',
    stack: [
      'Python',
      'Claude Code',
      'Pydantic',
      'openpyxl',
      'Hevy API',
      'uv',
      'pytest',
    ],
    status: { en: 'active', fr: 'actif' },
    links: [],
    publishState: 'published',
    en: {
      slug: 'athletic-tracker',
      name: 'Athletic Tracker — Autonomous Strength Program Manager',
      summary:
        'An autonomous, Claude Code-operated manager for a multi-year strength program, bridging ' +
        'an Excel prescription engine and the Hevy training app with a constrained LLM-override ' +
        'layer, shadow mode, and idempotent collision detection.',
      body:
        'Athletic Tracker runs three gated cron tasks. Weekly sync pulls workouts from Hevy and ' +
        'appends them to an Excel log. The mid-block task rewrites next-week routines (applying ' +
        '% progression and auto-regulation bumps), then layers a constrained LLM judgment on top: ' +
        'a cloud Claude agent receives an observations brief and must return typed, schema-validated ' +
        'JSON overrides — it can react to injury or fatigue signals but cannot touch the program ' +
        'outside that surface. Two safety properties define the design: a shadow mode that emits ' +
        'proposals to files for the first two blocks before ever writing to the API (autonomy is ' +
        'earned, not assumed), and collision detection that diffs every planned write against the ' +
        'last committed snapshot and aborts on unexpected changes — no blind overwrite.',
    },
    fr: {
      slug: 'suivi-athletique',
      name: 'Athletic Tracker — Gestionnaire Autonome de Programme de Force',
      summary:
        'Un gestionnaire autonome opéré par Claude Code pour un programme de force pluriannuel, ' +
        "connectant un moteur de prescriptions Excel et l'application Hevy avec une couche " +
        "d'overrides LLM contrainte, un mode shadow et une détection de collision idempotente.",
      body:
        'Athletic Tracker exécute trois tâches cron à portes. Le sync hebdomadaire récupère les ' +
        'entraînements depuis Hevy et les ajoute à un journal Excel. La tâche mid-block réécrit ' +
        'les routines de la semaine suivante (appliquant la progression en % et les ajustements ' +
        "d'auto-régulation), puis superpose un jugement LLM contraint : un agent Claude cloud " +
        "reçoit un brief d'observations et doit retourner des overrides JSON typés et validés " +
        'par schéma — il peut réagir aux signaux de blessure ou de fatigue, mais ne peut pas ' +
        'toucher au programme en dehors de cette surface. Deux propriétés de sécurité définissent ' +
        'la conception : un mode shadow qui émet des propositions dans des fichiers pendant les ' +
        "deux premiers blocs avant d'écrire sur l'API (l'autonomie se mérite, elle n'est pas " +
        'supposée), et une détection de collision qui compare chaque écriture planifiée au dernier ' +
        "snapshot commité et s'arrête en cas de modifications inattendues — aucun écrasement " +
        'aveugle.',
    },
  },

  // ── 6. MCP Secrets Vault ─────────────────────────────────────────────────
  // Public npm package; safe to link directly.
  {
    translationKey: 'mcp-secrets-vault',
    stack: ['TypeScript', 'MCP SDK', 'Zod', 'Vitest', 'GitHub Actions'],
    status: { en: 'shipped', fr: 'publié' },
    links: [
      { label: 'npm', url: 'https://www.npmjs.com/package/mcp-secrets-vault' },
    ],
    // Public-safe related reads (both published in FR + EN); thematically on-point
    // for a tool-using-agent secrets server. Stored as translationKeys (locale-
    // neutral); the S7 page resolves them to the current locale (task 13).
    relatedArticles: [
      'evaluating-tool-using-agents',
      'deterministic-agent-workflows',
    ],
    publishState: 'published',
    en: {
      slug: 'mcp-secrets-vault',
      name: 'MCP Secrets Vault — AI-Safe Secret Management',
      summary:
        'A published npm MCP server that lets AI assistants use secrets — API keys, tokens, ' +
        'credentials — to perform authorized actions without ever exposing the secret values.',
      body:
        'MCP Secrets Vault sits between an AI assistant (Claude Desktop or any MCP-compatible ' +
        'client) and the secret store. When the assistant needs to call an API, it invokes a ' +
        'vault tool by name; the server resolves the secret from environment variables, injects ' +
        'it into the request, and returns only the sanitized response — the raw secret value ' +
        'never appears in the model context. Policy-based access control, configurable rate ' +
        'limiting, and an audit log are built in. The package is MIT-licensed, published on npm, ' +
        'and ships with CI coverage badges and a demo walkthrough.',
    },
    fr: {
      slug: 'coffre-secrets-mcp',
      name: "MCP Secrets Vault — Gestion de Secrets pour l'IA",
      summary:
        "Un serveur MCP publié sur npm qui permet aux assistants IA d'utiliser des secrets — " +
        "clés d'API, tokens, identifiants — pour réaliser des actions autorisées sans jamais " +
        'exposer les valeurs secrètes.',
      body:
        'MCP Secrets Vault se place entre un assistant IA (Claude Desktop ou tout client ' +
        "compatible MCP) et le dépôt de secrets. Quand l'assistant doit appeler une API, il " +
        'invoque un outil vault par son nom ; le serveur résout le secret depuis les variables ' +
        "d'environnement, l'injecte dans la requête et retourne uniquement la réponse assainie " +
        "— la valeur brute du secret n'apparaît jamais dans le contexte du modèle. Le contrôle " +
        "d'accès basé sur les politiques, la limitation de débit configurable et un journal " +
        "d'audit sont intégrés. Le package est sous licence MIT, publié sur npm, et inclut " +
        'des badges CI de couverture et une démonstration détaillée.',
    },
  },

  // ── 7. Atelier ────────────────────────────────────────────────────────────
  // Public GitHub repo confirmed: git@github.com:RachidChabane/atelier.git
  {
    translationKey: 'atelier',
    stack: ['JSON', 'Markdown', 'Claude Code', 'Python', 'TypeScript'],
    status: { en: 'active', fr: 'actif' },
    links: [
      { label: 'GitHub', url: 'https://github.com/RachidChabane/atelier' },
    ],
    publishState: 'published',
    en: {
      slug: 'atelier-plugin-marketplace',
      name: 'Atelier — Claude Code Plugin Marketplace',
      summary:
        'A personal Claude Code plugin marketplace shipping opinionated, reusable workflow skills — ' +
        'from project bootstrapping to interactive-Claude migration — as installable plugins with ' +
        'a consistent structure and resume-aware execution.',
      body:
        'Atelier packages complex Claude Code workflows as installable plugins with a strict ' +
        'convention: kebab-case name, one skill per directory, a SKILL.md frontmatter definition, ' +
        'and a references/ folder for context-loaded material. Two plugins ship at v0.1.0: ' +
        'project-bootstrap (drives a repo through a 5-stage planning workflow producing a complete ' +
        'cross-referenced docs/ slate, resume-aware so it continues rather than restarts) and ' +
        'migrate-to-interactive-claude (migrates a project off the metered claude -p API onto ' +
        'the tmux interactive backend to preserve subscription-pool usage after the 2026 ' +
        "billing split). Install via Claude Code's native /plugin system.",
    },
    fr: {
      slug: 'atelier-marketplace-plugins',
      name: 'Atelier — Marketplace de Plugins Claude Code',
      summary:
        'Un marketplace personnel de plugins Claude Code proposant des skills de workflow ' +
        'réutilisables et opinionés — du bootstrapping de projet à la migration vers Claude ' +
        'interactif — sous forme de plugins installables avec une structure cohérente et une ' +
        'exécution consciente de la reprise.',
      body:
        'Atelier conditionne des workflows Claude Code complexes en plugins installables avec une ' +
        'convention stricte : nom en kebab-case, un skill par répertoire, une définition ' +
        'frontmatter SKILL.md et un dossier references/ pour le matériel chargé en contexte. ' +
        'Deux plugins sont livrés en v0.1.0 : project-bootstrap (pilote un dépôt à travers un ' +
        'workflow de planification en 5 étapes produisant un slate docs/ complet et ' +
        'inter-référencé, conscient de la reprise pour continuer plutôt que redémarrer) et ' +
        "migrate-to-interactive-claude (migre un projet hors de l'API claude -p facturée vers " +
        "le backend interactif tmux pour préserver l'usage du pool d'abonnement après la " +
        'scission de facturation 2026). Installation via le système natif /plugin de Claude Code.',
    },
  },
];

// Authoritative override layer (scripts/_enrichment-data.json, keyed by translationKey).
// It (a) replaces the former internal codenames in the RENDERED fields (slug / name /
// body) of the three flagged projects with their descriptive names, (b) supplies the
// em-dash-free name/summary/body for projects whose inline copy above still carried
// em-dashes, and (c) attaches the richer-page enrichment (year / highlights / metrics /
// architecture). Kept as data so the bulky enrichment stays out of the entry table; this
// is the single source a regen reads, so `tsx gen-portfolio.ts` cannot regress the copy.
interface OverrideCopy {
  slug?: string;
  name?: string;
  summary?: string;
  body?: string;
  highlights?: string[];
  metrics?: Metric[];
  architecture?: Architecture;
  gallery?: GalleryImage[];
}
interface ProjectOverride {
  year?: string;
  en?: OverrideCopy;
  fr?: OverrideCopy;
}

const overrides = JSON.parse(
  readFileSync(join(__dirname, '_enrichment-data.json'), 'utf-8')
) as Record<string, ProjectOverride>;

for (const entry of PORTFOLIO_PROJECTS) {
  const o = overrides[entry.translationKey];
  if (!o) continue;
  if (o.year) entry.year = o.year;
  for (const lang of ['fr', 'en'] as Locale[]) {
    const oc = o[lang];
    if (!oc) continue;
    const copy = entry[lang];
    if (oc.slug) copy.slug = oc.slug;
    if (oc.name) copy.name = oc.name;
    if (oc.summary) copy.summary = oc.summary;
    if (oc.body) copy.body = oc.body;
    if (oc.highlights) copy.highlights = oc.highlights;
    if (oc.metrics) copy.metrics = oc.metrics;
    if (oc.architecture) copy.architecture = oc.architecture;
    if (oc.gallery) copy.gallery = oc.gallery;
  }
}

function yamlStr(s: string): string {
  return `'${s.replace(/'/g, "''")}'`;
}

function yamlStrArr(arr: string[]): string {
  // Leading space so the caller's `key:${...}` yields valid `key: []` (not `key:[]`).
  if (arr.length === 0) return ' []';
  return arr.map((v) => `\n  - ${yamlStr(v)}`).join('');
}

function yamlLinkArr(links: Array<{ label: string; url: string }>): string {
  if (links.length === 0) return ' []';
  return links
    .map((l) => `\n  - label: ${yamlStr(l.label)}\n    url: ${yamlStr(l.url)}`)
    .join('');
}

function yamlMetricArr(metrics: Metric[]): string {
  if (metrics.length === 0) return ' []';
  return metrics
    .map(
      (m) => `\n  - value: ${yamlStr(m.value)}\n    label: ${yamlStr(m.label)}`
    )
    .join('');
}

function yamlGalleryLines(gallery: GalleryImage[]): string[] {
  const lines: string[] = ['gallery:'];
  for (const g of gallery) {
    lines.push(`  - src: ${yamlStr(g.src)}`);
    lines.push(`    alt: ${yamlStr(g.alt)}`);
    if (g.caption) lines.push(`    caption: ${yamlStr(g.caption)}`);
  }
  return lines;
}

function yamlArchitectureLines(arch: Architecture): string[] {
  const lines: string[] = ['architecture:'];
  if (arch.caption) lines.push(`  caption: ${yamlStr(arch.caption)}`);
  lines.push('  layers:');
  for (const layer of arch.layers) {
    lines.push(`    - label: ${yamlStr(layer.label)}`);
    lines.push('      nodes:');
    for (const node of layer.nodes) {
      lines.push(`        - ${yamlStr(node)}`);
    }
  }
  return lines;
}

export function buildFrontmatter(
  entry: PortfolioEntry,
  lang: Locale
): ProjectFrontmatter {
  const copy = entry[lang];
  return {
    translationKey: entry.translationKey,
    lang,
    slug: copy.slug,
    name: copy.name,
    summary: copy.summary,
    stack: entry.stack,
    status: entry.status[lang],
    links: entry.links,
    ...(entry.relatedArticles
      ? { relatedArticles: entry.relatedArticles }
      : {}),
    ...(entry.derivedFrom ? { derivedFrom: entry.derivedFrom } : {}),
    publishState: entry.publishState,
    ...(entry.year ? { year: entry.year } : {}),
    ...(copy.role ? { role: copy.role } : {}),
    ...(copy.highlights ? { highlights: copy.highlights } : {}),
    ...(copy.metrics ? { metrics: copy.metrics } : {}),
    ...(copy.architecture ? { architecture: copy.architecture } : {}),
    ...(copy.gallery ? { gallery: copy.gallery } : {}),
  };
}

export function renderMarkdown(entry: PortfolioEntry, lang: Locale): string {
  const copy = entry[lang];
  const fm = buildFrontmatter(entry, lang);

  const linksYaml = yamlLinkArr(fm.links);
  const stackYaml = yamlStrArr(fm.stack);
  const relArr = fm.relatedArticles ?? [];
  const relYaml = relArr.length ? yamlStrArr(relArr) : null;

  const frontmatter = [
    '---',
    `translationKey: ${yamlStr(fm.translationKey)}`,
    `lang: ${yamlStr(fm.lang)}`,
    `slug: ${yamlStr(fm.slug)}`,
    `name: ${yamlStr(fm.name)}`,
    `summary: ${yamlStr(fm.summary)}`,
    `stack:${stackYaml}`,
    `status: ${yamlStr(fm.status)}`,
    `links:${linksYaml}`,
    ...(relYaml ? [`relatedArticles:${relYaml}`] : []),
    ...(fm.derivedFrom ? [`derivedFrom: ${yamlStr(fm.derivedFrom)}`] : []),
    `publishState: ${yamlStr(fm.publishState)}`,
    ...(fm.year ? [`year: ${yamlStr(fm.year)}`] : []),
    ...(fm.role ? [`role: ${yamlStr(fm.role)}`] : []),
    ...(fm.highlights ? [`highlights:${yamlStrArr(fm.highlights)}`] : []),
    ...(fm.metrics ? [`metrics:${yamlMetricArr(fm.metrics)}`] : []),
    ...(fm.architecture ? yamlArchitectureLines(fm.architecture) : []),
    ...(fm.gallery ? yamlGalleryLines(fm.gallery) : []),
    '---',
  ].join('\n');

  return `${frontmatter}\n\n${copy.body}\n`;
}

export interface GeneratedFile {
  filename: string;
  lang: Locale;
  translationKey: string;
  frontmatter: ProjectFrontmatter;
  content: string;
}

export function generateAll(): GeneratedFile[] {
  const files: GeneratedFile[] = [];
  for (const entry of PORTFOLIO_PROJECTS) {
    for (const lang of ['fr', 'en'] as Locale[]) {
      const frontmatter = buildFrontmatter(entry, lang);
      const content = renderMarkdown(entry, lang);
      files.push({
        filename: `${entry.translationKey}.${lang}.md`,
        lang,
        translationKey: entry.translationKey,
        frontmatter,
        content,
      });
    }
  }
  return files;
}

export function safetyCheck(content: string): string[] {
  return FLAGGED_TERMS.filter((term) => content.includes(term));
}

function main(): void {
  const WORK_DIR = join(__dirname, '../src/content/projects');
  mkdirSync(WORK_DIR, { recursive: true });

  const files = generateAll();
  for (const file of files) {
    const violations = safetyCheck(file.content);
    if (violations.length > 0) {
      console.error(
        `SAFETY VIOLATION in ${file.filename}: ${violations.join(', ')}`
      );
      process.exit(1);
    }
    writeFileSync(join(WORK_DIR, file.filename), file.content, 'utf-8');
    console.log(`wrote ${file.filename}`);
  }
  console.log(`Generated ${files.length} files in src/content/projects/`);
}

if (__filename === process.argv[1]) {
  main();
}
