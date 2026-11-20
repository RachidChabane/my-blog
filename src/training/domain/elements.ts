/**
 * The four elements of the office, and the one table that says who beats whom.
 * Each element beats the next one in the cycle: ink soaks paper, paper filters coffee,
 * coffee shorts the current, the current dries the ink.
 */
export const ELEMENTS = ['encre', 'papier', 'cafe', 'courant'] as const;
export type Element = (typeof ELEMENTS)[number];

const BEATS: Record<Element, Element> = {
  encre: 'papier',
  papier: 'cafe',
  cafe: 'courant',
  courant: 'encre',
};

/** How a target takes an element: weak to it, resisting it, or neither. */
export type Affinity = 'weak' | 'neutral' | 'resist';

export const AFFINITY_FACTOR: Record<Affinity, number> = {
  weak: 2,
  neutral: 1,
  resist: 0.5,
};

export function affinity(attack: Element, target: Element): Affinity {
  if (BEATS[attack] === target) return 'weak';
  if (attack === target) return 'resist';
  return 'neutral';
}

/** The element a target of `el` is weak to. */
export const weaknessOf = (el: Element): Element =>
  ELEMENTS.find((a) => BEATS[a] === el) as Element;
