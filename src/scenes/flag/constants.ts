// Fixed values in `flag` that are not sliders, each with its reason.

export const FIXED = {
  /** The second, smaller wave travels at this share of the first wave's speed. */
  WAVE2_SPEED: 1.6,
  /** And has this share of its wavelength. */
  WAVE2_LENGTH: 0.45,
  /** Phase offset so the two waves don't start aligned. */
  WAVE2_PHASE: 1.3,
  /** Moment of the ripple shown as the reduced-motion still frame (seconds). */
  STILL_TIME: 1.3,
} as const;

export const FIXED_REASONS: Record<keyof typeof FIXED, string> = {
  WAVE2_SPEED:
    'Shapes the cloth so it never repeats too neatly; "Wave speed", "Wave size" and "Second wave" set the overall motion.',
  WAVE2_LENGTH:
    'Shapes the cloth (a shorter, faster ripple riding on the main wave); see "Second wave".',
  WAVE2_PHASE: 'Only shifts where the second ripple starts; any value looks alike.',
  STILL_TIME: 'Picks a mid-ripple moment for the reduced-motion still frame.',
};
