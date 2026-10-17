// Fixed values in `overprint` that are not sliders, each with its reason. All of
// them are the "fixed physics from the demo" that SCENES.md #35 lists.

export const FIXED = {
  /** The middle ink's spring (fast and slow inks are sliders). */
  MID_SPRING: 0.042,
  /** Damping per frame of the fast, middle and slow ink. */
  DAMPING: [0.8, 0.84, 0.87],
  /** Strength of the second, finer edge wobble. */
  WOBBLE2: 0.035,
  /** The three inks jump this many seconds apart after a click. */
  JUMP_GAP: 0.07,
  /** The two edge wobbles have 3 and 5 bumps around the blob… */
  HARMONICS: [3, 5],
  /** …and travel at these speeds (radians per second; the second runs backward). */
  WOBBLE_SPEEDS: [1.3, -0.9],
  /** Points around each blob's outline. */
  POINTS: 72,
  /** Starting spots: x = width × (0.48 + ink × 0.07), y = height × (0.42 + (ink mod 2) × 0.05). */
  START: [0.48, 0.07, 0.42, 0.05],
} as const;

export const FIXED_REASONS: Record<keyof typeof FIXED, string> = {
  MID_SPRING:
    'Fixed in reference/riso-demo.html and SCENES.md #35; the two outer springs are sliders.',
  DAMPING: 'Fixed in reference/riso-demo.html and SCENES.md #35.',
  WOBBLE2:
    'Fixed in reference/riso-demo.html and SCENES.md #35; "Edge wobble" sets the main wobble.',
  JUMP_GAP: 'Fixed in reference/riso-demo.html and SCENES.md #35 (70ms).',
  HARMONICS:
    'The look of the wobble in reference/riso-demo.html; "Edge wobble" sets how strong it is.',
  WOBBLE_SPEEDS:
    'The look of the wobble in reference/riso-demo.html; "Edge wobble" sets how strong it is.',
  POINTS: 'Enough points for a smooth outline; from reference/riso-demo.html.',
  START:
    'Where the blobs start, overlapping, as in reference/riso-demo.html; also the still frame.',
};
