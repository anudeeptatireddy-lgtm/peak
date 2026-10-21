// Fixed values in `epicycles` that are not sliders, each with its reason.

export const FIXED = {
  /** A pixel counts as part of the letters above this alpha. */
  ALPHA_CUTOFF: 128,
  /** Letter outlines are simplified to within this many px before resampling. */
  SIMPLIFY: 0.6,
  /** The fewest circles the cursor can choose. */
  MIN_CIRCLES: 2,
  /** One full trace takes this many seconds at spin speed 1. */
  TRACE_SECONDS: 10,
  /** The trail is drawn through this many points per full trace. */
  TRAIL_POINTS: 900,
  /** Glow: this many wider, fainter strokes, each this many px wider than the last. */
  GLOW_LAYERS: 4,
  GLOW_SPREAD: 3,
  /** The slow drift moves the drawing up to this share of the shorter screen side… */
  DRIFT: 0.03,
  /** …and turns it up to this many radians… */
  DRIFT_TURN: 0.06,
  /** …once per this many seconds. */
  DRIFT_PERIOD: 14,
  /** Left alone, the circle count swings from few to all and back once per this many seconds. */
  IDLE_PERIOD: 16,
  /** The still frame draws the circles this much fainter. */
  STILL_FAINT: 0.4,
  /** Circles are drawn this many px wide. */
  RING_WIDTH: 1,
} as const;

export const FIXED_REASONS: Record<keyof typeof FIXED, string> = {
  ALPHA_CUTOFF: 'Half opacity: the edge of the anti-aliased letters.',
  SIMPLIFY: 'Below a pixel, so the outline is exact but the path is lighter.',
  MIN_CIRCLES: 'With fewer than two circles there is nothing to see but a dot.',
  TRACE_SECONDS: 'Slow enough to watch the circles draw, quick enough to finish while you watch.',
  TRAIL_POINTS: 'A smooth trail at any size; enough points for sharp letter corners.',
  GLOW_LAYERS: 'A soft glow in four steps, without shadowBlur (PRD §16.4).',
  GLOW_SPREAD: 'A soft glow in four steps, without shadowBlur (PRD §16.4).',
  DRIFT: 'A gentle float, so the drawing never leaves the screen.',
  DRIFT_TURN: 'A gentle tilt, a few degrees at most.',
  DRIFT_PERIOD: 'A slow drift, much slower than the trace.',
  IDLE_PERIOD: 'Shows the change from blobby to crisp at a calm pace.',
  STILL_FAINT: 'SCENES.md #67: the still frame shows the circles faint.',
  RING_WIDTH: 'Hairline circles, so the trace stays the main line.',
};
