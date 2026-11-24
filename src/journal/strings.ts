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
    add: string;
    restart: string;
    keyNew: string;
    keySeen: string;
    person: (rank: number) => string;
    brought: (fresh: number, seen: number) => string;
    found: (people: number, known: number, problems: number) => string;
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
    add: 'Faire essayer une personne de plus',
    restart: "Recommencer avec d'autres personnes",
    keyNew: "problèmes que personne n'avait encore vus",
    keySeen: "problèmes déjà vus par quelqu'un",
    person: (rank) => `Personne ${rank}`,
    brought: (fresh, seen) =>
      `${fresh} ${fresh > 1 ? 'nouveaux' : 'nouveau'}, ${seen} déjà ${seen > 1 ? 'vus' : 'vu'}`,
    found: (people, known, problems) =>
      `Après ${people} ${people > 1 ? 'personnes' : 'personne'}, ${known} problèmes sur ${problems} sont connus.`,
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
    add: 'Have one more person try it',
    restart: 'Start again with other people',
    keyNew: 'problems nobody had seen yet',
    keySeen: 'problems somebody had already seen',
    person: (rank) => `Person ${rank}`,
    brought: (fresh, seen) => `${fresh} new, ${seen} already seen`,
    found: (people, known, problems) =>
      `After ${people} ${people > 1 ? 'people' : 'person'}, ${known} problems out of ${problems} are known.`,
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
