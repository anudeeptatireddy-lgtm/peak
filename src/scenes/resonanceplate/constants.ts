// Fixed values in `resonanceplate` that are not sliders, each with its reason.

export const FIXED = {
  /** Room below the plate for the pitch scale, in px. */
  SCALE_SPACE: 56,
  /** Pitch scale line width and the radius of its marker, in px. */
  SCALE_LINE: 2,
  SCALE_DOT: 6,
  /** Chamfer distance steps: straight and diagonal neighbors. */
  STRAIGHT: 1,
  DIAGONAL: 1.4142,
  /** A pixel of the name mask counts as letter above this alpha. */
  ALPHA_CUTOFF: 128,
  /** Still frame: grains are placed where the name field is below this. */
  STILL_CUTOFF: 0.02,
  /** Still frame: give up placing a grain after this many tries (an empty name). */
  STILL_TRIES: 50,
  /** Square-plate modes |Φ| reach at most 2; this scales them to 0–1. */
  MODE_MAX: 2,
} as const;

export const FIXED_REASONS: Record<keyof typeof FIXED, string> = {
  SCALE_SPACE: 'Enough room for the pitch scale under the plate at every size.',
  SCALE_LINE: 'A visible hairline for the scale.',
  SCALE_DOT: 'A marker big enough to see at a glance.',
  STRAIGHT: 'Standard chamfer distance weights (approximates true distance).',
  DIAGONAL: 'Standard chamfer distance weights (√2 for diagonal steps).',
  ALPHA_CUTOFF: 'Half opacity: the edge of the anti-aliased letters.',
  STILL_CUTOFF: 'Inside the letters, so the still frame reads as the name.',
  STILL_TRIES: 'Ends the search when the name is blank; never reached otherwise.',
  MODE_MAX: 'Mathematical bound of cos·cos − cos·cos.',
};
