// Fixed values in `velocity` that are not sliders, each with its reason.

export const FIXED = {
  /** Row directions: rows 1 and 3 drift one way, row 2 the other (the prototype's design). */
  DIRECTIONS: [1, -1, 1] as const,
  /** The most copies of a word in one row before giving up (a safety cap for empty text). */
  MAX_REPEATS: 40,
  /** The inner scroll area on scene pages is this many screens tall. */
  INNER_SCREENS: 3,
  /** The inner scroll area recenters by one screen when within half a screen of either end. */
  RECENTER_LOW: 0.5,
  RECENTER_HIGH: 1.5,
  PERCENT: 100,
} as const;

export const FIXED_REASONS: Record<keyof typeof FIXED, string> = {
  DIRECTIONS: 'The alternating drift is the design of this scene; there is no in-between value.',
  MAX_REPEATS: 'Only stops an endless loop if a word has no width; it never shows on screen.',
  INNER_SCREENS:
    'Only sizes the invisible scroll area used on scene pages; it recenters itself, so it never shows.',
  RECENTER_LOW: 'Part of the invisible endless scroll area on scene pages; never shows.',
  RECENTER_HIGH: 'Part of the invisible endless scroll area on scene pages; never shows.',
  PERCENT: 'Converts screens to a CSS percentage.',
};
