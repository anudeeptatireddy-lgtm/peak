// Fixed values in `particles` that are not sliders, each with its reason.

export const FIXED = {
  /** Prototype font stack; Anybody is the only design font, the rest are fallbacks. */
  FONT: 'Anybody, "Arial Black", Arial, sans-serif',
  /** Sampling mask color: only the alpha channel is read. */
  MASK: '#000',
  /** Squared distance below which the cursor doesn't push (avoids dividing by zero), as in the prototype. */
  MIN_PUSH_DIST2: 0.01,
} as const;

export const FIXED_REASONS: Record<keyof typeof FIXED, string> = {
  FONT: 'Anybody is the site font (PRD §18); the fallbacks only matter if it fails to load, and the scene waits for it.',
  MASK: 'The hidden canvas is only read for alpha, so its fill color never shows.',
  MIN_PUSH_DIST2: 'A divide-by-zero guard (0.01px², as in the prototype); too small to see.',
};
