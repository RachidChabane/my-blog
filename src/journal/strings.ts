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
    metByAnyone: string;
    metByEach: string;
    add: string;
    remove: string;
    redraw: string;
    perUser: string;
    found: (
      people: number,
      count: number,
      problems: number,
      share: string,
      expected: string
    ) => string;
  };
  queue: {
    produced: string;
    reviewed: string;
    less: string;
    more: string;
    replay: (days: number) => string;
    status: (day: number, waiting: number, merged: number) => string;
    waiting: (count: number, days: number) => string;
    none: (days: number) => string;
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
    metByAnyone:
      "Les 40 problèmes du produit, en couleur quand quelqu'un en a rencontré un",
    metByEach: 'Une ligne par personne',
    add: 'Ajouter une personne',
    remove: 'En retirer une',
    redraw: "Tirer d'autres personnes",
    perUser: "Part des problèmes qu'une seule personne rencontre",
    found: (people, count, problems, share, expected) =>
      `${people} ${people > 1 ? 'personnes ont' : 'personne a'} rencontré ${count} des ${problems} problèmes, soit ${share}. La formule en prévoit ${expected}.`,
  },
  queue: {
    produced: 'changements produits par jour',
    reviewed: 'changements relus par jour',
    less: 'Un de moins',
    more: 'Un de plus',
    replay: (days) => `Rejouer les ${days} jours`,
    status: (day, waiting, merged) =>
      `Jour ${day} · ${waiting} en attente · ${merged} fusionnés`,
    waiting: (count, days) =>
      `${count} changements attendent une relecture au bout de ${days} jours`,
    none: (days) => `Rien n'attend au bout de ${days} jours`,
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
    metByAnyone:
      'The 40 problems of the product, coloured once somebody has met one',
    metByEach: 'One row per person',
    add: 'Add a person',
    remove: 'Remove one',
    redraw: 'Draw other people',
    perUser: 'Share of the problems one person runs into',
    found: (people, count, problems, share, expected) =>
      `${people} ${people > 1 ? 'people' : 'person'} met ${count} of the ${problems} problems, or ${share}. The formula predicts ${expected}.`,
  },
  queue: {
    produced: 'changes produced per day',
    reviewed: 'changes reviewed per day',
    less: 'One fewer',
    more: 'One more',
    replay: (days) => `Replay the ${days} days`,
    status: (day, waiting, merged) =>
      `Day ${day} · ${waiting} waiting · ${merged} merged`,
    waiting: (count, days) =>
      `${count} changes are waiting for a review after ${days} days`,
    none: (days) => `Nothing is waiting after ${days} days`,
  },
};

const STRINGS: Record<Locale, JournalStrings> = { fr, en };

export function journalStrings(lang: string): JournalStrings {
  return lang === 'fr' ? STRINGS.fr : STRINGS.en;
}
