// Fixed values in `goo` that are not sliders, each with its reason.

export const FIXED = {
  /** SVG namespace. */
  SVG: 'http://www.w3.org/2000/svg',
  /** The moment of the orbits shown as the reduced-motion still frame (seconds). */
  STILL_TIME: 2.4,
  /** Most blobs at once, counting ones added by clicks. */
  MAX_BLOBS: 16,
} as const;

export const FIXED_REASONS: Record<keyof typeof FIXED, string> = {
  SVG: 'The SVG namespace; not a setting.',
  STILL_TIME: 'Picks a moment where a few blobs overlap and merge, for the still frame.',
  MAX_BLOBS: 'Same as the Blob count slider\'s top; more blobs fill the screen and the filter gets slow on phones.',
};
