// Fixed values in `trail` that are not sliders, each with its reason.

export const FIXED = {
  /** Idle path: the sideways sweep runs at this multiple of Swim speed… */
  IDLE_X: 1,
  /** …and the up-and-down sweep at this multiple, so the path never repeats exactly. */
  IDLE_Y: 1.37,
  /** Phase of the up-and-down sweep (radians). */
  IDLE_PHASE: 0.8,
  /** Smooth-curve samples per link between points (Catmull-Rom). */
  SAMPLES: 3,
  /** A Catmull-Rom curve's tension: the standard value. */
  TENSION: 6,
  /** The glow draws the trail again this many times as wide… */
  GLOW_SCALE: 2.2,
  /** …at this share of the Glow setting as its opacity. */
  GLOW_ALPHA: 0.35,
  /** Frames simulated for the reduced-motion still frame. */
  STILL_FRAMES: 240,
  /** Snake segments overlap by this share so there are no gaps. */
  OVERLAP: 1.15,
  /** Where the middle accent sits along a three-color blend (0 = head, 1 = tail). */
  MIDDLE: 0.5,
  /** The binomial coefficient 3 in a cubic Bézier curve. */
  CUBIC: 3,
} as const;

export const FIXED_REASONS: Record<keyof typeof FIXED, string> = {
  IDLE_X: 'Pace of the idle swim, scaled by Swim speed.',
  IDLE_Y: 'A different pace so the idle path is not a repeating circle.',
  IDLE_PHASE: 'Offsets the two sweeps so the path starts off-axis.',
  SAMPLES: 'Enough points to look smooth at this size, few enough to stay fast.',
  TENSION: 'The standard Catmull-Rom spline: tangent = (next − previous) ÷ 6 in Bézier form.',
  GLOW_SCALE: 'Style of the glow around the trail.',
  GLOW_ALPHA: 'Style of the glow around the trail.',
  STILL_FRAMES: 'Long enough for the swimming trail to curl for the still frame.',
  OVERLAP: 'Stops hairline gaps between round pieces.',
  MIDDLE: 'The second accent sits halfway along the trail.',
  CUBIC: 'Maths of a cubic Bézier curve (1, 3, 3, 1).',
};
