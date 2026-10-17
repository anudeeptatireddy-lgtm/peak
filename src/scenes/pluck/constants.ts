// Fixed values in `pluck` that are not sliders, each with its reason.

export const FIXED = {
  /** Fewest strings, however narrow the screen. */
  MIN_STRINGS: 3,
  /** The lightsaber glow (owner-approved look, dark worlds only): halo, blade and core passes. */
  HALO_ALPHA: 0.07,
  HALO_WIDTH: 6,
  BLADE_ALPHA: 0.16,
  BLADE_WIDTH: 2.8,
  CORE_ALPHA: 0.9,
  WHITE_ALPHA: 0.85,
  WHITE_WIDTH: 0.38,
  WHITE_MIN: 0.6,
  WHITE: '#FFFFFF',
  /** A string counts as resting below this lit share, and fully lit above the second. */
  LIT_FLOOR: 0.02,
  LIT_CEIL: 0.98,
} as const;

export const FIXED_REASONS: Record<keyof typeof FIXED, string> = {
  MIN_STRINGS: 'Keeps the scene meaningful on very narrow screens; it never shows at normal sizes.',
  HALO_ALPHA:
    'Part of the lightsaber glow the owner approved for dark worlds (reference/riso-demo.html); the "Glow" switch turns it off.',
  HALO_WIDTH: 'Part of the owner-approved lightsaber glow (dark worlds only).',
  BLADE_ALPHA: 'Part of the owner-approved lightsaber glow (dark worlds only).',
  BLADE_WIDTH: 'Part of the owner-approved lightsaber glow (dark worlds only).',
  CORE_ALPHA: 'Part of the owner-approved lightsaber glow (dark worlds only).',
  WHITE_ALPHA:
    'Part of the owner-approved lightsaber glow: the near-white core (dark worlds only).',
  WHITE_WIDTH:
    'Part of the owner-approved lightsaber glow: the near-white core (dark worlds only).',
  WHITE_MIN: 'Keeps the white core visible on the thinnest strings (dark worlds only).',
  WHITE: 'The hot white core of the lightsaber glow (dark worlds only), as the owner asked.',
  LIT_FLOOR: 'Skips drawing invisible lit strokes; below 2% they cannot be seen.',
  LIT_CEIL: 'Skips drawing the gray rest line when it would be invisible under the lit string.',
};
