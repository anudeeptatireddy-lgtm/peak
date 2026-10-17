// Fixed values in `sand` that are not sliders, each with its reason.

export const FIXED = {
  /** Sampling mask color: only the alpha channel is read. */
  MASK: '#000',
  /** A grid point counts as inside a letter when its alpha is above half. */
  ALPHA_CUTOFF: 127,
  /** The sampling grid starts this fine (px) and widens until the grain count fits. */
  START_GAP: 2,
  /** ...but never wider than this. */
  MAX_GAP: 24,
} as const;

export const FIXED_REASONS: Record<keyof typeof FIXED, string> = {
  MASK: 'The hidden canvas is only read for alpha, so its fill color never shows.',
  ALPHA_CUTOFF:
    'Only decides whether half-covered edge pixels count as inside; at grain spacing any middling value looks the same.',
  START_GAP: 'The finest sampling grid; the "Grains" setting decides how coarse it ends up.',
  MAX_GAP:
    'A safety stop for the loop that widens the grid; at sensible grain counts it is never reached.',
};
