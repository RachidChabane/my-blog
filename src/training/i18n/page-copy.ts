/**
 * The words the training pages need before the game is opened: the launch card, the
 * sheets and the chapter names, per exam. The game's own copy (copy.ts) builds on these,
 * and is only loaded with the game.
 */
import type { Locale } from '@/i18n/index';
import type { Exam } from '../domain/exams';
import {
  DEVELOPER_PROFESSIONAL_EXAM,
  EXAMS,
  FOUNDATIONS_EXAM,
} from '../domain/exams';

export interface ChapterName {
  /** Fits the top bar of a 360 px phone. */
  short: string;
  /** The exam domain, as the exam definition names it. */
  domain: string;
}

/** What the launch card and the sheets say about one exam. */
export interface ExamPageCopy {
  /** The page's meta description. */
  description: string;
  /** What is known of the exam, under its name: questions in the bank and domains. */
  outline: (questions: number, domains: number) => string;
  /** Example words for the sheet search. */
  placeholder: string;
  /** Keyed by exam domain. */
  chapters: Record<string, ChapterName>;
}

export interface PageCopy {
  lang: Locale;
  game: string;
  /** What the game is, on every exam's launch card. */
  pitch: string;
  /** What the training pages are, for the stand preview on the home page. */
  intro: string;
  play: string;
  resume: string;
  launch: { progress: (f: number, total: number) => string };
  /** Keyed by exam (its key). */
  campaigns: Record<string, ExamPageCopy>;
  sheets: {
    heading: string;
    sum: (n: number, f: number) => string;
    search: string;
    all: string;
    empty: string;
    right: string;
    why: string;
    freed: string;
    review: string;
    close: string;
    domains: string;
    count: (f: number, total: number) => string;
  };
}

/** Short chapter names, keyed by exam domain. */
const SHORT: Record<string, Record<Locale, string>> = {
  agentic_architecture: { fr: 'Agents', en: 'Agents' },
  tool_design_mcp: { fr: 'Outils et MCP', en: 'Tools & MCP' },
  claude_code: { fr: 'Claude Code', en: 'Claude Code' },
  prompt_engineering: { fr: 'Prompts', en: 'Prompts' },
  context_management: { fr: 'Contexte', en: 'Context' },
  integration_reliability: { fr: 'Intégration', en: 'Integration' },
  agent_architecture: { fr: 'Agents', en: 'Agents' },
  observability: { fr: 'Observabilité', en: 'Observability' },
  evaluation: { fr: 'Evals', en: 'Evals' },
  guardrails_security: { fr: 'Guardrails', en: 'Guardrails' },
  debugging_incidents: { fr: 'Incidents', en: 'Incidents' },
  fleet_operations: { fr: 'Flotte', en: 'Fleet' },
  cost_latency: { fr: 'Coûts', en: 'Costs' },
};

function chapters(exam: Exam, l: Locale): Record<string, ChapterName> {
  return Object.fromEntries(
    exam.domains.map((d) => {
      const short = SHORT[d.key]?.[l];
      if (!short) throw new Error(`no short name for ${d.key}`);
      return [d.key, { short, domain: d.name[l] }];
    })
  );
}

const EXAM_PAGE: Record<
  string,
  Record<Locale, Omit<ExamPageCopy, 'chapters'>>
> = {
  [FOUNDATIONS_EXAM.key]: {
    fr: {
      description:
        'Entraînement à l’agentique sous forme de jeu, d’après les cours d’Anthropic, avec les certifications de Rachid Chabane et le détail de l’examen CCAR-F.',
      outline: (_q, n) =>
        `Les questions couvrent les ${n} domaines de l’examen ${FOUNDATIONS_EXAM.code}.`,
      placeholder: 'prompt, hook, MCP…',
    },
    en: {
      description:
        'Agentic engineering practice, played as a game and built on Anthropic’s courses, with Rachid Chabane’s certifications and the outline of the CCAR-F exam.',
      outline: (_q, n) =>
        `The questions cover the ${n} domains of the ${FOUNDATIONS_EXAM.code} exam.`,
      placeholder: 'prompt, hook, MCP…',
    },
  },
  [DEVELOPER_PROFESSIONAL_EXAM.key]: {
    fr: {
      description:
        'Entraînement à l’agentique sous forme de jeu, d’après les cours d’Anthropic, sur les huit domaines de l’examen Claude Certified Developer - Professional.',
      outline: (q, n) =>
        `${q} questions dans cette banque · ${n} domaines. Aucun guide d’examen n’est publié : les questions sont écrites à partir du plan du cours.`,
      placeholder: 'retry, eval, guardrail…',
    },
    en: {
      description:
        'Agentic engineering practice, played as a game and built on Anthropic’s courses, across the eight domains of the Claude Certified Developer - Professional exam.',
      outline: (q, n) =>
        `${q} questions in this bank · ${n} domains. No exam guide is published: the questions are written from the course outline.`,
      placeholder: 'retry, eval, guardrail…',
    },
  },
};

const campaigns = (l: Locale): Record<string, ExamPageCopy> =>
  Object.fromEntries(
    EXAMS.map((e) => [
      e.key,
      { ...EXAM_PAGE[e.key][l], chapters: chapters(e, l) },
    ])
  );

export const PAGE_COPY: Record<Locale, PageCopy> = {
  fr: {
    lang: 'fr',
    game: 'Les fiches volées',
    pitch:
      'Un RPG au tour par tour pour réviser l’agentique, d’après les cours d’Anthropic : agents, outils, prompts, contexte. Chaque bonne réponse reprend une fiche aux Clawds.',
    intro:
      'Un entraînement à l’agentique sous forme de jeu, d’après les cours d’Anthropic.',
    play: 'Jouer',
    resume: 'Reprendre',
    launch: { progress: (f, t) => `${f} / ${t} fiches libérées` },
    campaigns: campaigns('fr'),
    sheets: {
      heading: 'Les fiches',
      sum: (n, f) => `${n} fiches, ${f} déjà libérées.`,
      search: 'Chercher une fiche',
      all: 'Toutes',
      empty: 'Aucune fiche ne correspond. Essaie un autre mot.',
      right: 'Bonne réponse',
      why: 'Pourquoi',
      freed: 'Libérée',
      review: 'À revoir',
      close: 'Fermer les fiches',
      domains: 'Domaines',
      count: (f, t) => `${f} / ${t} libérées`,
    },
  },
  en: {
    lang: 'en',
    game: 'The Stolen Cards',
    pitch:
      'A turn-based RPG to practise agentic engineering, built on Anthropic’s courses: agents, tools, prompts, context. Every right answer takes a card back from the Clawds.',
    intro:
      'Agentic engineering practice, played as a game, built on Anthropic’s courses.',
    play: 'Play',
    resume: 'Resume',
    launch: { progress: (f, t) => `${f} / ${t} cards freed` },
    campaigns: campaigns('en'),
    sheets: {
      heading: 'The cards',
      sum: (n, f) => `${n} cards, ${f} freed so far.`,
      search: 'Search the cards',
      all: 'All',
      empty: 'No card matches. Try another word.',
      right: 'Right answer',
      why: 'Why',
      freed: 'Freed',
      review: 'To review',
      close: 'Close the cards',
      domains: 'Domains',
      count: (f, t) => `${f} / ${t} freed`,
    },
  },
};
