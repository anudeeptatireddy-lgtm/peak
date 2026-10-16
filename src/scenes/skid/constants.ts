// Fixed values in `skid` that are not sliders, each with its reason.

export const FIXED = {
  /** Milliseconds per second (stagger settings). */
  MS: 1000,
  /** Degrees to radians. */
  DEG: Math.PI / 180,
  /** The inner scroll area on scene pages is this many screens tall. */
  INNER_SCREENS: 3,
  /** The inner scroll area recenters by one screen when within half a screen of either end. */
  RECENTER_LOW: 0.5,
  RECENTER_HIGH: 1.5,
  /** Each letter's idle shake is offset by this phase (radians) from the one before. */
  SHAKE_PHASE: 1.7,
} as const;

export const FIXED_REASONS: Record<keyof typeof FIXED, string> = {
  MS: 'Unit conversion only.',
  DEG: 'Unit conversion only.',
  INNER_SCREENS:
    'Only sizes the invisible scroll area used on scene pages; it recenters itself, so it never shows.',
  RECENTER_LOW: 'Part of the invisible endless scroll area on scene pages; never shows.',
  RECENTER_HIGH: 'Part of the invisible endless scroll area on scene pages; never shows.',
  SHAKE_PHASE:
    'Only keeps neighboring letters from shaking in step; any value that is not a multiple of 2π looks the same.',
};
