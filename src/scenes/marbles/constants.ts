// Fixed values in `marbles` that are not sliders, each with its reason.

export const FIXED = {
  /** Sampling mask color: only the alpha channel is read. */
  MASK: '#000',
  /** A grid point counts as inside a letter when its alpha is above half. */
  ALPHA_CUTOFF: 127,
  /** Maps the 0–20 "Cursor push" setting from SCENES.md to px per frame² at the cursor. */
  SHOVE_SCALE: 0.1,
  /** The sampling grid never gets coarser than this many marble diameters. */
  MAX_SPREAD: 6,
  /** Milliseconds per second (auto-rebuild timer). */
  MS: 1000,
} as const;

export const FIXED_REASONS: Record<keyof typeof FIXED, string> = {
  MASK: 'The hidden canvas is only read for alpha, so its fill color never shows.',
  ALPHA_CUTOFF:
    'Only decides whether half-covered edge pixels count as inside; at marble spacing the result is the same for any middling value.',
  SHOVE_SCALE:
    'A unit conversion so the setting reads 0–20 as in SCENES.md; the setting itself controls the strength.',
  MAX_SPREAD:
    'A safety stop for the loop that widens the grid until the marble count fits; at sensible counts it is never reached.',
  MS: 'Unit conversion only.',
};
