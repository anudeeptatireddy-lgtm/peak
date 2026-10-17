// Fixed values in `tunnel` that are not sliders, each with its reason.

export const FIXED = {
  /** PRD §8.2: rings pass any spot on screen at most this many times a second. */
  RATE_CAP: 3,
  /** Sides used to draw a circular ring (a polygon this smooth looks round). */
  CIRCLE_SIDES: 48,
  /** Sides of a square ring. */
  SQUARE_SIDES: 4,
  /** Sides of a hexagon ring. */
  HEX_SIDES: 6,
  /** Rings closer than this (world units) are behind or inside the camera and are skipped. */
  NEAR: 20,
  /** The noise path and the twist use different slices of the same noise: this multiplies the twist's pace. */
  TWIST_PACE: 0.5,
  /** Offset into the noise for the twist, so it differs from the path. */
  TWIST_SEED: 37.5,
  /** Offset into the noise for the vertical path, so it differs from the sideways path. */
  PATH_Y_SEED: 11.3,
  /** How fast the self-steering wanders, per second of noise. */
  SELF_RATE: 0.25,
  /** Opacity of the stripes between rings. */
  STRIPE_ALPHA: 0.6,
  /** The glowing center fog: opacity at the vanishing point… */
  FOG_ALPHA: 0.85,
  /** …and how far it reaches, as a share of the short side. */
  FOG_REACH: 0.35,
  /** Where the reduced-motion still frame stops, as a share of one ring spacing. */
  STILL_FRAC: 0.25,
  /** Seed of the noise that draws the path (any fixed number). */
  NOISE_SEED: 41,
  /** Rings pass no closer together in time than 1 ÷ RATE_CAP, times this (so rounding can never allow a fourth). */
  INTERVAL_MARGIN: 1.000001,
  /** Highest value of a color channel in rgba(). */
  CHANNEL: 255,
} as const;

export const FIXED_REASONS: Record<keyof typeof FIXED, string> = {
  RATE_CAP: 'Flash safety (PRD §8.2): light and dark never alternate more than 3 times a second.',
  CIRCLE_SIDES: 'A 48-sided polygon looks like a circle at this size.',
  SQUARE_SIDES: 'Geometry of a square.',
  HEX_SIDES: 'Geometry of a hexagon.',
  NEAR: 'Hides rings that are behind the camera; avoids dividing by zero.',
  TWIST_PACE: 'Makes the twist change at its own pace, not in step with the path.',
  TWIST_SEED: 'Gives the twist a different pattern from the path.',
  PATH_Y_SEED: 'Gives the up-and-down path a different pattern from the sideways path.',
  SELF_RATE: 'Pace of the wandering when nobody is steering.',
  STRIPE_ALPHA: 'Stripes are fainter than rings so rings read first.',
  FOG_ALPHA: 'Softens the crowded center where far rings pile up.',
  FOG_REACH: 'How wide the center fog is.',
  STILL_FRAC: 'The still frame shows the tunnel at a fixed point between two rings.',
  NOISE_SEED: 'Any fixed number: it makes the path the same every time.',
  INTERVAL_MARGIN: 'Rounding safety so the rate cap holds exactly.',
  CHANNEL: 'Unit conversion: colors in rgba() use 0 to 255.',
};
