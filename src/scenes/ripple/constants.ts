// Fixed values in `ripple` that are not sliders, each with its reason.

export const FIXED = {
  /** Beyond 2.5 ring widths a ring's bell curve is under 0.2%: skip it (prototype). */
  CUTOFF: 2.5,
  /** "No click yet": far enough in the past that automatic ripples start right away. */
  NO_CLICK_YET: -99,
  /** The reduced-motion still frame: two rings from the middle (prototype composition). */
  STILL_Y: 0.45,
  STILL_AGE_A: 0.9,
  STILL_AGE_B: 0.35,
} as const;

export const FIXED_REASONS: Record<keyof typeof FIXED, string> = {
  CUTOFF: 'Only skips work where a ring has no visible effect (under 0.2% strength).',
  NO_CLICK_YET:
    'A starting marker meaning nobody has clicked; it just lets automatic ripples begin immediately.',
  STILL_Y: 'Composition of the still frame shown under reduced motion (from the prototype).',
  STILL_AGE_A: 'Composition of the still frame shown under reduced motion (from the prototype).',
  STILL_AGE_B: 'Composition of the still frame shown under reduced motion (from the prototype).',
};
