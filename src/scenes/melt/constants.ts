// Fixed values in `melt` that are not sliders, each with its reason.

export const FIXED = {
  /** The variety pattern: two sine waves, the second this many times slower. */
  WAVE_RATIO: 2.5,
  /** Phase offset of the second wave (radians), so the two don't line up at x = 0. */
  WAVE_PHASE: 2.1,
  /** Each wave contributes up to this much either side of the middle (0.5). */
  WAVE_AMP: 0.25,
} as const;

export const FIXED_REASONS: Record<keyof typeof FIXED, string> = {
  WAVE_RATIO:
    'Shapes the uneven pattern of fast and slow strips; the "Variety" and "Pattern size" settings control how strong and how wide it is.',
  WAVE_PHASE: 'Only shifts where the uneven pattern starts; any value looks alike.',
  WAVE_AMP: 'Keeps the pattern between 0 and 1, so "Variety" alone sets its strength.',
};
