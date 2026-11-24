/** Copy of the journal's interactive figures, per locale. */
import type { Locale } from '@/i18n/index';

export interface JournalStrings {
  glance: {
    start: string;
    warning: string;
    watch: string;
    rateFlash: string;
    rateLong: string;
    scaleLow: string;
    scaleHigh: string;
    pageOf: (i: number, total: number) => string;
    secondRound: string;
    colPage: string;
    colFlash: string;
    colLong: string;
    verdict: (same: number, total: number) => string;
    again: string;
  };
  sample: {
    users: string;
    perUser: string;
    found: (percent: string, users: number) => string;
    chartLabel: string;
  };
  queue: {
    produced: string;
    reviewed: string;
    waiting: (count: number, days: number) => string;
    none: (days: number) => string;
    chartLabel: string;
    day: string;
  };
}

const fr: JournalStrings = {
  glance: {
    start: 'Faire le test',
    warning: 'Trois écrans vont apparaître très brièvement, un par un.',
    watch: 'Regardez la croix',
    rateFlash: 'Cet écran vous a plu ?',
    rateLong: 'Et maintenant que vous avez le temps ?',
    scaleLow: 'pas du tout',
    scaleHigh: 'beaucoup',
    pageOf: (i, total) => `Écran ${i} sur ${total}`,
    secondRound: 'Les mêmes écrans, cette fois sans limite de temps.',
    colPage: 'Écran',
    colFlash: 'Note après 50 ms',
    colLong: 'Note sans limite',
    verdict: (same, total) =>
      `Sur ${total} écrans, votre première note est restée à un point près ${same} fois.`,
    again: 'Recommencer',
  },
  sample: {
    users: 'Personnes qui essaient le produit',
    perUser: "Part des problèmes qu'une seule personne rencontre",
    found: (percent, users) =>
      `${percent} des problèmes rencontrés avec ${users} ${users > 1 ? 'personnes' : 'personne'}`,
    chartLabel: 'Part des problèmes trouvés selon le nombre de personnes',
  },
  queue: {
    produced: 'Changements produits par jour',
    reviewed: 'Changements relus par jour',
    waiting: (count, days) =>
      `${count} changements attendent une relecture au bout de ${days} jours`,
    none: (days) => `Rien n'attend au bout de ${days} jours`,
    chartLabel: 'Changements en attente de relecture, jour après jour',
    day: 'jour',
  },
};

const en: JournalStrings = {
  glance: {
    start: 'Take the test',
    warning: 'Three screens will appear very briefly, one at a time.',
    watch: 'Look at the cross',
    rateFlash: 'Did you like that screen?',
    rateLong: 'And now that you have time?',
    scaleLow: 'not at all',
    scaleHigh: 'a lot',
    pageOf: (i, total) => `Screen ${i} of ${total}`,
    secondRound: 'The same screens, this time with no time limit.',
    colPage: 'Screen',
    colFlash: 'Rating after 50 ms',
    colLong: 'Rating with no limit',
    verdict: (same, total) =>
      `Out of ${total} screens, your first rating stayed within one point ${same} ${same === 1 ? 'time' : 'times'}.`,
    again: 'Start again',
  },
  sample: {
    users: 'People who try the product',
    perUser: 'Share of the problems one person runs into',
    found: (percent, users) =>
      `${percent} of the problems met with ${users} ${users > 1 ? 'people' : 'person'}`,
    chartLabel: 'Share of the problems found by number of people',
  },
  queue: {
    produced: 'Changes produced per day',
    reviewed: 'Changes reviewed per day',
    waiting: (count, days) =>
      `${count} changes are waiting for a review after ${days} days`,
    none: (days) => `Nothing is waiting after ${days} days`,
    chartLabel: 'Changes waiting for a review, day after day',
    day: 'day',
  },
};

const STRINGS: Record<Locale, JournalStrings> = { fr, en };

export function journalStrings(lang: string): JournalStrings {
  return lang === 'fr' ? STRINGS.fr : STRINGS.en;
}
