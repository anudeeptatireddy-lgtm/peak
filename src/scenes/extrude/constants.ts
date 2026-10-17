// Fixed values in `extrude` that are not sliders, each with its reason.

export const FIXED = {
  /** Degrees to radians. */
  DEG: Math.PI / 180,
  /** The idle float tilts up and down at this share of its side-to-side swing, and this speed ratio. */
  FLOAT_PITCH: 0.6,
  FLOAT_RATIO: 0.7,
  /** The still frame shows the word turned this share of the max turn (and half that, upward). */
  STILL_TURN: 0.6,
} as const;

export const FIXED_REASONS: Record<keyof typeof FIXED, string> = {
  DEG: 'Unit conversion only.',
  FLOAT_PITCH:
    'Shapes the idle float into a gentle figure eight; "Idle float" and "Float speed" set its size and pace.',
  FLOAT_RATIO:
    'Keeps the idle float from repeating too visibly; any value that is not 1 looks alike.',
  STILL_TURN: 'Picks the angle of the reduced-motion still frame so the sides show.',
};
