// Fixed values in `drop` that are not sliders, each with its reason.

export const FIXED = {
  /** Pairs closer than this squared distance are skipped (divide-by-zero guard, from the demo). */
  MIN_D2: 0.0001,
  /** Cursor pushes skip balls this close to its center (divide-by-zero guard, from the demo). */
  MIN_PUSH_D2: 0.01,
  /** Frames (at 60 fps) simulated to build the reduced-motion still frame: the settled pile. */
  STILL_FRAMES: 300,
} as const;

export const FIXED_REASONS: Record<keyof typeof FIXED, string> = {
  MIN_D2: 'A divide-by-zero guard from reference/riso-demo.html; far too small to see.',
  MIN_PUSH_D2: 'A divide-by-zero guard from reference/riso-demo.html; far too small to see.',
  STILL_FRAMES: 'Long enough for the starting balls to land and settle in the still frame.',
};
