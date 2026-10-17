// Fixed values in `tumble` that are not sliders, each with its reason.

export const FIXED = {
  /** Two taps closer together than this (seconds) count as a double tap. */
  DOUBLE_TAP: 0.35,
  /** Milliseconds per second (drop delay setting). */
  MS: 1000,
} as const;

export const FIXED_REASONS: Record<keyof typeof FIXED, string> = {
  DOUBLE_TAP:
    'The usual double-click window on desktops and phones; changing it only changes how fast you must tap, not how the scene looks.',
  MS: 'Unit conversion only.',
};
