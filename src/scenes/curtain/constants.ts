// Fixed values in `curtain` that are not sliders, each with its reason.

export const FIXED = {
  /** Number of pages in the little site. */
  PAGES: 3,
  /** Longest page name, in characters. */
  MAX_NAME: 16,
  /** The transition styles that "random" picks from. */
  STYLES: ['curtain', 'wipe', 'iris', 'slats'],
  /** How steeply the diagonal wipe leans, as a share of the stage width. */
  WIPE_SKEW: 0.3,
  /** Under reduced motion every transition is a fade of this many seconds each way. */
  FADE_TIME: 0.2,
  /** Folds drawn on each curtain panel, as repeating stripes of this width in px. */
  FOLD: 40,
  /** Opacity of the dark stripes that make the curtain look folded. */
  FOLD_SHADE: 0.25,
  /** The title of the page is this many rem. */
  TITLE_SIZE: 3.5,
  /** Nav buttons are at least this tall (rem): a comfortable touch target. */
  NAV_HEIGHT: 2.75,
  /** The text under the title. */
  BODY: 'Pick another link to see the page change.',
  /** Space above and below the navigation row, in rem. */
  NAV_PAD: 1.25,
  /** Space between the page title and its text, in rem. */
  PAGE_GAP: 0.75,
  /** Font weight of the navigation links. */
  NAV_WEIGHT: 700,
  /** Gap between a link's text and its underline, in em. */
  UNDERLINE: 0.3,
  /** Degrees of a quarter turn, for the direction of the curtain's fold stripes. */
  QUARTER: 90,
  /** Milliseconds in a second, to turn the Slat stagger setting into seconds. */
  MS: 1000,
  /** Each slat is this many percent wider than its share, so no gap shows between slats. */
  SLAT_OVERLAP: 0.2,
} as const;

export const FIXED_REASONS: Record<keyof typeof FIXED, string> = {
  PAGES: 'The little site has three pages (SCENES.md #48).',
  MAX_NAME: 'Longer names would not fit the navigation row.',
  STYLES: 'The four transitions that "random" picks among.',
  WIPE_SKEW: 'The angle of the diagonal wipe.',
  FADE_TIME: 'The gentle replacement for motion under reduced motion.',
  FOLD: 'Style of the curtain folds.',
  FOLD_SHADE: 'Style of the curtain folds.',
  TITLE_SIZE: 'Typography of the page title.',
  NAV_HEIGHT: 'At least 44px tall, the touch-target minimum (PRD §8.3).',
  BODY: 'Placeholder words under each page title.',
  NAV_PAD: 'Breathing room around the navigation row.',
  PAGE_GAP: 'Spacing in the page.',
  NAV_WEIGHT: 'Typography of the links.',
  UNDERLINE: 'Typography of the current-page underline.',
  QUARTER: 'Geometry: stripes run top to bottom.',
  MS: 'Unit conversion.',
  SLAT_OVERLAP: 'Hides hairline gaps between slats.',
};
