// Fixed values in `blackhole` that are not sliders, each with its reason.

export const FIXED = {
  /** A press must last this long (seconds) before it moves the hole; shorter is a click. */
  HOLD_S: 0.2,
  /** Glow around the event horizon in dark worlds: stroke layers… */
  GLOW_LAYERS: 4,
  /** …each this many px wider… */
  GLOW_SPREAD: 3,
  /** …at this total opacity. */
  GLOW_STRENGTH: 0.6,
  /** Frames of physics run before drawing the reduced-motion still frame. */
  STILL_FRAMES: 180,
} as const;

export const FIXED_REASONS: Record<keyof typeof FIXED, string> = {
  HOLD_S: 'Tells a click (a burst) from a press-and-hold (moving the hole); any short time works.',
  GLOW_LAYERS: 'Look of the glowing ring only; "Ring width" sets its size.',
  GLOW_SPREAD: 'Look of the glowing ring only; "Ring width" sets its size.',
  GLOW_STRENGTH: 'Look of the glowing ring only; kept soft so it never flares.',
  STILL_FRAMES:
    'Long enough for particles to gather into a ring around the hole for the still frame.',
};
