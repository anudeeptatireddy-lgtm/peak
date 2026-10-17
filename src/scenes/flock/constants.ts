// Fixed values in `flock` that are not sliders, each with its reason.

export const FIXED = {
  /** Bird outline in units of its size, nose along +x: tip, wing, notch, wing. */
  BIRD: [1, 0, -0.7, 0.6, -0.35, 0, -0.7, -0.6],
  /** Fish outline in units of its size: nose, belly, tail joint, tail fin, tail joint, back. */
  FISH: [1, 0, 0, 0.4, -0.55, 0, -1, 0.4, -1, -0.4, -0.55, 0, 0, -0.4],
  /** Frames of flocking run before drawing the reduced-motion still frame. */
  STILL_FRAMES: 240,
} as const;

export const FIXED_REASONS: Record<keyof typeof FIXED, string> = {
  BIRD: 'The arrow shape of a bird; "Bird size" scales it.',
  FISH: 'The outline of a fish; "Bird size" scales it.',
  STILL_FRAMES: 'Long enough for flocks to form, for the still frame.',
};
