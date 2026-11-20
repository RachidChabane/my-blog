/**
 * Going from one page of the site to another: the browser prepares the page a
 * visitor is about to open, and the room slides the way the visitor walks.
 */
import { SECTION_ORDER, SECTION_PATHS } from './sections';

export type Passage = 'forward' | 'back' | 'stay';

/** First path segment after the locale, in the order of the signs; home comes first. */
export const PASSAGE_ORDER: string[] = [
  '',
  ...SECTION_ORDER.map((k) => SECTION_PATHS[k].replace(/\/$/, '')),
];

/** Which way the room moves between two addresses of the site. */
export function passage(from: string, to: string, order: string[]): Passage {
  const rank = (url: string): number => {
    try {
      return order.indexOf(new URL(url).pathname.split('/')[2] ?? '');
    } catch {
      return -1;
    }
  };
  const a = rank(from);
  const b = rank(to);
  if (a < 0 || b < 0 || a === b) return 'stay';
  return b > a ? 'forward' : 'back';
}

/** Runs in the arriving page before its first frame and names the way it came. */
function announce(
  order: string[],
  direction: (from: string, to: string, order: string[]) => Passage
): void {
  addEventListener('pagereveal', (e) => {
    const transition = (e as PageRevealEvent).viewTransition;
    if (!transition) return;
    const nav = (
      window as { navigation?: { activation?: { from?: { url?: string } } } }
    ).navigation;
    const from = nav?.activation?.from?.url ?? document.referrer;
    transition.types.add(direction(from, location.href, order));
  });
}

export const passageScript = `(${announce.toString()})(${JSON.stringify(PASSAGE_ORDER)},${passage.toString()})`;

/** Pages of the site a visitor points at are prepared before the click. */
export const speculationRules = JSON.stringify({
  prerender: [
    {
      where: {
        and: [
          { href_matches: '/*' },
          { not: { href_matches: '/*.*' } },
          { not: { href_matches: '/api/*' } },
          { not: { selector_matches: '[href*="#"], [target="_blank"]' } },
        ],
      },
      eagerness: 'moderate',
    },
  ],
});
