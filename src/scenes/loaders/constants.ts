// Fixed values in `loaders` that are not sliders, each with its reason.

export const FIXED = {
  /** The six loaders, in the order of the grid. */
  KINDS: ['dots', 'bounce', 'ring', 'bars', 'morph', 'orbit'],
  /** Names shown to people for each loader. */
  NAMES: {
    dots: 'Dot chase',
    bounce: 'Bouncing trio',
    ring: 'Self-drawing ring',
    bars: 'Stacking bars',
    morph: 'Morphing square',
    orbit: 'Orbiting pair',
  } as Record<string, string>,
  /** Seconds one loop takes at speed 1, for each loader. */
  LOOP: { dots: 1.2, bounce: 0.9, ring: 1.6, bars: 1, morph: 1.8, orbit: 1.4 } as Record<
    string,
    number
  >,
  /** The featured loader is drawn this many times bigger than in the grid. */
  FEATURE_SCALE: 2.5,
  /** Grid columns on screens 700px wide or more, and on narrower ones. */
  COLS: 3,
  COLS_SMALL: 2,
  /** The still frame shows every loader at this share of its loop. */
  STILL_AT: 0.5,
} as const;

export const FIXED_REASONS: Record<keyof typeof FIXED, string> = {
  KINDS: 'The six loaders of the pack (SCENES.md #50).',
  NAMES: 'Plain names for the six loaders, used as button labels.',
  LOOP: 'Each loader has its own natural loop length at speed 1.',
  FEATURE_SCALE: 'How much bigger the featured loader is than a grid loader.',
  COLS: 'Three columns of two rows on wide screens.',
  COLS_SMALL: 'Two columns of three rows on phones (SCENES.md #50).',
  STILL_AT: 'The still frame shows every loader halfway through its loop.',
};
