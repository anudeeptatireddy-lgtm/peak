// Fixed values in `echo` that are not sliders, each with its reason.

export const FIXED = {
  /** The idle path is a Lissajous loop: the vertical wave runs this many times as fast. */
  LOOP_RATIO: 1.7,
  /** Phase of the vertical wave, so the loop starts mid-swing instead of at a corner. */
  LOOP_PHASE: 0.5,
  /** Moment of the idle path shown as the reduced-motion still frame (seconds). */
  STILL_TIME: 2.2,
} as const;

export const FIXED_REASONS: Record<keyof typeof FIXED, string> = {
  LOOP_RATIO:
    'The shape of the drifting loop; "Path width", "Path height" and "Idle drift speed" control its size and pace.',
  LOOP_PHASE: 'Only picks where on the loop the word starts.',
  STILL_TIME:
    'Picks which moment of the drift the still frame shows, mid-swing so the echoes fan out.',
};
