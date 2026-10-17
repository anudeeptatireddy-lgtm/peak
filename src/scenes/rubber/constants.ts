// Fixed values in `rubber` that are not sliders, each with its reason.

export const FIXED = {
  /** The still frame shows this share of the max stretch, upward, on the middle letter. */
  STILL_PULL: 0.35,
} as const;

export const FIXED_REASONS: Record<keyof typeof FIXED, string> = {
  STILL_PULL:
    'Picks how far the letter caught mid-wobble is stretched in the reduced-motion still frame.',
};
