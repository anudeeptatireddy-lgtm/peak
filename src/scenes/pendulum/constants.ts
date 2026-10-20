// Fixed values in `pendulum` that are not sliders, each with its reason.

export const FIXED = {
  /** The name is sampled on a grid starting this many px apart… */
  START_GAP: 3,
  /** …widened until it gives no more points than there are bobs, up to this gap. */
  MAX_GAP: 60,
  /** A pixel counts as part of the letters above this alpha. */
  ALPHA_CUTOFF: 128,
  /** The hold never stops time completely: at most this share of the speed is taken away. */
  HOLD_MAX: 0.85,
  /** A trail is drawn through this many past positions. */
  TRAIL_STEPS: 6,
  /** The inner scroll area on scene pages is this many screens tall… */
  INNER_SCREENS: 3,
  /** …and recenters within half a screen of either end. */
  RECENTER_LOW: 0.5,
  RECENTER_HIGH: 1.5,
} as const;

export const FIXED_REASONS: Record<keyof typeof FIXED, string> = {
  START_GAP: 'Where the sampling search starts; the bob count decides the real spacing.',
  MAX_GAP: 'Ends the sampling search for very long names; never reached at normal sizes.',
  ALPHA_CUTOFF: 'Half opacity: the edge of the anti-aliased letters.',
  HOLD_MAX: 'Keeps time moving at the name, so scrolling and the cycle never freeze.',
  TRAIL_STEPS: 'Enough points for a smooth curved trail; "Trail" sets its length.',
  INNER_SCREENS: 'Part of the invisible endless scroll area on scene pages; never shows.',
  RECENTER_LOW: 'Part of the invisible endless scroll area on scene pages; never shows.',
  RECENTER_HIGH: 'Part of the invisible endless scroll area on scene pages; never shows.',
};
