/** The sections of the site: their keys, order, addresses and colours. */
export type SectionKey =
  | 'radar'
  | 'blog'
  | 'journal'
  | 'work'
  | 'library'
  | 'training'
  | 'about';

/** A section with a stand in the office: every section but the one about the site. */
export type RoomKey = Exclude<SectionKey, 'about'>;

/** Path of each section under a locale, in navigation order. */
export const SECTION_PATHS: Record<SectionKey, string> = {
  radar: 'radar/',
  blog: 'blog/',
  journal: 'journal/',
  work: 'work/',
  library: 'library/',
  training: 'training/',
  about: 'about/',
};

export const SECTION_ORDER: SectionKey[] = [
  'radar',
  'blog',
  'journal',
  'work',
  'library',
  'training',
  'about',
];

/** Sections that have a stand, in navigation order: the tabs of the phone bar. */
export const ROOM_SECTIONS: RoomKey[] = SECTION_ORDER.filter(
  (k): k is RoomKey => k !== 'about'
);

/** Stands of the home drawing, left to right. */
export const FRIEZE_ORDER: RoomKey[] = [
  'radar',
  'blog',
  'work',
  'library',
  'journal',
  'training',
];

/** Colour token of each section's wall and sign. */
export const SECTION_COLOR: Record<SectionKey, string> = {
  radar: 'var(--radar)',
  blog: 'var(--art)',
  journal: 'var(--jrnl)',
  work: 'var(--ctrl)',
  library: 'var(--arch)',
  training: 'var(--drill)',
  about: 'var(--wains)',
};
