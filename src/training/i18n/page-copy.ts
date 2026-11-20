/**
 * The words the training page needs before the game is opened: the launch card, the
 * sheets and the chapter names. The game's own copy (copy.ts) builds on these, and is
 * only loaded with the game.
 */
import type { Locale } from '@/i18n/index';
import exam from '../data/exam.json';

export interface ChapterName {
  /** Fits the top bar of a 360 px phone. */
  short: string;
  /** The exam domain, as exam.json names it. */
  domain: string;
}

export interface PageCopy {
  lang: Locale;
  game: string;
  pitch: string;
  play: string;
  resume: string;
  launch: { progress: (f: number, total: number) => string };
  /** Keyed by exam domain. */
  chapters: Record<string, ChapterName>;
  sheets: {
    heading: string;
    sum: (n: number, f: number) => string;
    search: string;
    placeholder: string;
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

const domainName = (key: string, l: Locale) =>
  exam.domains.find((d) => d.key === key)?.name[l] ?? key;
const SHORT: Record<string, Record<Locale, string>> = {
  agentic_architecture: { fr: 'Agents', en: 'Agents' },
  tool_design_mcp: { fr: 'Outils et MCP', en: 'Tools & MCP' },
  claude_code: { fr: 'Claude Code', en: 'Claude Code' },
  prompt_engineering: { fr: 'Prompts', en: 'Prompts' },
  context_management: { fr: 'Contexte', en: 'Context' },
};
const chapters = (l: Locale): Record<string, ChapterName> =>
  Object.fromEntries(
    exam.domains.map((d) => [
      d.key,
      { short: SHORT[d.key]?.[l] ?? d.key, domain: domainName(d.key, l) },
    ])
  );

export const PAGE_COPY: Record<Locale, PageCopy> = {
  fr: {
    lang: 'fr',
    game: 'Les fiches volées',
    pitch:
      'Un RPG au tour par tour pour réviser l’examen Claude Certified Architect : chaque bonne réponse reprend une fiche aux Clawds.',
    play: 'Jouer',
    resume: 'Reprendre',
    launch: { progress: (f, t) => `${f} / ${t} fiches libérées` },
    chapters: chapters('fr'),
    sheets: {
      heading: 'Les fiches',
      sum: (n, f) => `${n} fiches, ${f} déjà libérées.`,
      search: 'Chercher une fiche',
      placeholder: 'prompt, hook, MCP…',
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
      'A turn-based RPG to revise for the Claude Certified Architect exam: every right answer wins a card back from the Clawds.',
    play: 'Play',
    resume: 'Resume',
    launch: { progress: (f, t) => `${f} / ${t} cards freed` },
    chapters: chapters('en'),
    sheets: {
      heading: 'The cards',
      sum: (n, f) => `${n} cards, ${f} freed so far.`,
      search: 'Search the cards',
      placeholder: 'prompt, hook, MCP…',
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
