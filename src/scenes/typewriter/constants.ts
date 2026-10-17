// Fixed values in `typewriter` that are not sliders, each with its reason.

export const FIXED = {
  /** A splatter strike throws between 1 and this many dots. */
  MAX_DOTS: 3,
  /** The slam's ring-out: e^(−age × this ÷ slam time) is under 0.3% by the end. */
  SLAM_DECAY: 6,
  /** Cursor bar width in em. */
  CURSOR_WIDTH: 0.08,
} as const;

export const FIXED_REASONS: Record<keyof typeof FIXED, string> = {
  MAX_DOTS:
    'Caps how many specks one strike throws; the "Ink splatter" setting decides how often strikes splatter at all.',
  SLAM_DECAY:
    'Makes the jolt die out exactly as the slam ends, whatever "Slam time" is set to; it is tied to that setting, not a look of its own.',
  CURSOR_WIDTH: 'A thin text cursor, like a caret; it has no effect on the typing.',
};
