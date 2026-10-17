// Fixed values in `filings` that are not sliders, each with its reason.

export const FIXED = {
  /** Frames of turning run before drawing the reduced-motion still frame. */
  STILL_FRAMES: 120,
  /** The cursor magnet only turns to its movement direction above this speed (px per frame). */
  TURN_MIN_SPEED: 0.5,
} as const;

export const FIXED_REASONS: Record<keyof typeof FIXED, string> = {
  STILL_FRAMES: 'Long enough for the filings to line up, for the still frame.',
  TURN_MIN_SPEED: 'Keeps a resting cursor from jittering the magnet; any small value works.',
};
