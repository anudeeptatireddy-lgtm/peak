// Fixed values in `signalpaths` that are not sliders, each with its reason.

export const FIXED = {
  /** The name is sampled on a grid starting this many px apart (widened to fit the node budget). */
  START_GAP: 4,
  /** Widest sampling grid tried for very long names. */
  MAX_GAP: 80,
  /** A pixel counts as part of the letters above this alpha. */
  ALPHA_CUTOFF: 128,
  /** Two name nodes are joined by a name path when closer than this many sampling gaps. */
  NAME_LINK: 1.6,
  /** Connections are drawn in this many brightness steps (one path each). */
  EDGE_LEVELS: 4,
  /** The idle demo pointer swings this share of the width and height around the center… */
  IDLE_X: 0.35,
  IDLE_Y: 0.3,
  /** …with its vertical swing this many times faster than its horizontal one. */
  IDLE_RATIO: 1.7,
} as const;

export const FIXED_REASONS: Record<keyof typeof FIXED, string> = {
  START_GAP: 'Where the sampling search starts; the node count decides the real spacing.',
  MAX_GAP: 'Ends the sampling search for very long names; never reached at normal sizes.',
  ALPHA_CUTOFF: 'Half opacity: the edge of the anti-aliased letters.',
  NAME_LINK:
    'Joins grid neighbors (including diagonals) along the letters, so the name paths are continuous.',
  IDLE_X: 'Shape of the idle demo path only; it never shows directly.',
  IDLE_Y: 'Shape of the idle demo path only; it never shows directly.',
  IDLE_RATIO:
    'Makes the idle path a figure that covers the screen instead of a line; any ratio that is not a whole number works.',
  EDGE_LEVELS: 'Batches the drawing; four steps of brightness look smooth at these line widths.',
};
