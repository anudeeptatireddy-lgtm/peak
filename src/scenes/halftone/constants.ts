// Fixed values in `halftone` that are not sliders, each with its reason. All come
// from reference/riso-demo.html's "Halftone".

export const FIXED = {
  /** Row height of a hexagonal grid, in dot spacings (√3 ÷ 2). */
  ROW: 0.866,
  /** A ripple only affects dots within this many ring widths of it. */
  RING_REACH: 3,
  /** Dots swelled less than this stay plain gray. */
  HOT_FLOOR: 0.04,
  /** The swell is capped here so overlapping ripples never blow a dot up. */
  MAX_SWELL: 1.25,
  /** Ripples fainter than this are removed. */
  RIPPLE_GONE: 0.03,
  /** Each ink's fixed misregistration direction (x, y) for inks 1, 2, 3… */
  REGISTER: [-1, -0.6, 1, -0.2, 0, 0.95],
  /** …in units of this share of the dot spacing. */
  REGISTER_SIZE: 0.1,
  /** Where the swell starts, as shares of width and height (also the still frame). */
  START: [0.64, 0.4],
  /** A dot this close to the swell's center isn't pushed (divide-by-zero guard). */
  NEAR: 0.001,
} as const;

export const FIXED_REASONS: Record<keyof typeof FIXED, string> = {
  ROW: 'Geometry of a hexagonal grid; not a setting.',
  RING_REACH: 'Beyond 3 widths a Gaussian ring is invisible; from reference/riso-demo.html.',
  HOT_FLOOR: 'Below this a dot looks unchanged; from reference/riso-demo.html.',
  MAX_SWELL: 'A safety cap from reference/riso-demo.html; only reached where ripples overlap.',
  RIPPLE_GONE: 'Removes ripples once invisible; from reference/riso-demo.html.',
  REGISTER:
    'The look of a slightly misaligned riso print, from reference/riso-demo.html; "Most misprint" sets the moving part.',
  REGISTER_SIZE: 'The look of a slightly misaligned riso print, from reference/riso-demo.html.',
  START:
    'Where the swell rests at first (toward the upper right), as in reference/riso-demo.html; also the still frame.',
  NEAR: 'A divide-by-zero guard from reference/riso-demo.html; far too small to see.',
};
