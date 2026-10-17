// Fixed values in `lightning` that are not sliders, each with its reason.

export const FIXED = {
  /** Strikes start at least this many seconds apart, whatever the settings. */
  MIN_GAP: 0.34,
  /** Most times a bolt is split in half (2^6 = 64 segments at most). */
  MAX_LEVELS: 6,
  /** Branches are split this many fewer times than their bolt. */
  BRANCH_LEVELS: 2,
  /** Glow under each arc in dark worlds: stroke layers… */
  GLOW_LAYERS: 3,
  /** …each this many px wider… */
  GLOW_SPREAD: 3,
  /** …at this total opacity. */
  GLOW_STRENGTH: 0.8,
  /** Reduced-motion still frame: the arc runs between the two nodes nearest these spots (shares of width and height). */
  STILL_FROM: [0.3, 0.45],
  STILL_TO: [0.7, 0.55],
  /** Node glows below this are invisible, so they aren't drawn. */
  GLOW_FLOOR: 0.01,
  /** Hex alpha suffix: a node's glow fades to a fully transparent copy of its color. */
  CLEAR: '00',
} as const;

export const FIXED_REASONS: Record<keyof typeof FIXED, string> = {
  MIN_GAP:
    'Safety (PRD §8.2): at most 3 strikes in any second; a hair over 1/3s leaves room for rounding.',
  MAX_LEVELS: 'Caps the work per bolt; more segments than this are too small to see.',
  BRANCH_LEVELS:
    'Keeps branches simpler than the bolt they grow from; "Branching" sets how many there are.',
  GLOW_LAYERS: 'Look of the arc glow only; kept soft so arcs never light up the background.',
  GLOW_SPREAD: 'Look of the arc glow only; "Arc width" sets the size.',
  GLOW_STRENGTH: 'Look of the arc glow only; kept soft so arcs never light up the background.',
  STILL_FROM: 'Picks two nodes near the middle for the still frame.',
  STILL_TO: 'Picks two nodes near the middle for the still frame.',
  GLOW_FLOOR: 'Skips work that cannot be seen; not a look setting.',
  CLEAR: 'Fading to the same color at zero alpha avoids a dark fringe; not a setting.',
};
