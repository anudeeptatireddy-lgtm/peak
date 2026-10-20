// Fixed values in `domino` that are not sliders, each with its reason.

export const FIXED = {
  /** A pixel counts as part of the letters above this alpha. */
  ALPHA_CUTOFF: 128,
  /** Letter outlines are simplified to within this many px before dominoes are placed. */
  SIMPLIFY: 1,
  /** Flat is a quarter turn. */
  FLAT: Math.PI / 2,
  /** A domino shows its face once it has fallen past this angle (radians, 60°). */
  FACE_AT: Math.PI / 3,
  /** Radians per degree (the lean slider is in degrees). */
  DEG: Math.PI / 180,
  /** The inner scroll area on scene pages is this many screens tall… */
  INNER_SCREENS: 3,
  /** …and recenters within half a screen of either end. */
  RECENTER_LOW: 0.5,
  RECENTER_HIGH: 1.5,
} as const;

export const FIXED_REASONS: Record<keyof typeof FIXED, string> = {
  ALPHA_CUTOFF: 'Half opacity: the edge of the anti-aliased letters.',
  SIMPLIFY: 'Removes pixel steps from the traced outline; smaller than a domino, so never visible.',
  FLAT: 'Geometry: a fallen domino lies flat.',
  FACE_AT:
    'Where a falling domino starts to read as its face from above; "Lean on topple" and the springs set the motion.',
  DEG: 'Unit conversion only.',
  INNER_SCREENS: 'Part of the invisible endless scroll area on scene pages; never shows.',
  RECENTER_LOW: 'Part of the invisible endless scroll area on scene pages; never shows.',
  RECENTER_HIGH: 'Part of the invisible endless scroll area on scene pages; never shows.',
};
