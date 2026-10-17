// Fixed values in `moire` that are not sliders, each with its reason.

export const FIXED = {
  /** PRD §8.2: bright and dark bands never sweep past any spot more than this many times a second. */
  RATE_CAP: 3,
  /** The second moving layer moves this multiple of the first (opposite way), so layers differ in speed. */
  SECOND_SCALE: -0.5,
  /** Idle sway: the sideways wave runs at this multiple of Drift speed… */
  SWAY_RATIO: 1.3,
  /** …starting this far along (radians), so the two waves never line up. */
  SWAY_PHASE: 1.1,
  /** Idle turn wave runs at this multiple of Drift speed. */
  TURN_RATIO: 0.7,
  /** Where the pattern rests in the reduced-motion still frame: sideways share of the spacing… */
  STILL_SHIFT: 0.35,
  /** …and turn, in degrees. */
  STILL_TURN: 3,
  /** Extra margin so rotated patterns still cover the corners, as a share of the diagonal. */
  COVER: 1.1,
  /** Degrees in half a turn, to turn the Turn slider (degrees) into radians. */
  HALF_TURN: 180,
} as const;

export const FIXED_REASONS: Record<keyof typeof FIXED, string> = {
  RATE_CAP: 'Flash safety (PRD §8.2): the beat of the interference never exceeds 3 per second.',
  SECOND_SCALE: 'A different speed for the third layer so it does not just copy the second.',
  SWAY_RATIO: 'Two waves at different speeds so the idle path is not a repeating loop.',
  SWAY_PHASE: 'Offsets the two idle waves so they do not line up.',
  TURN_RATIO: 'A third wave speed for the idle turn.',
  STILL_SHIFT: 'A resting offset so the still frame shows an interference pattern.',
  STILL_TURN: 'A resting turn so the still frame shows an interference pattern.',
  COVER:
    'Patterns are drawn slightly larger than the screen so no corner is left empty when rotated.',
  HALF_TURN: 'Unit conversion from degrees to radians.',
};
