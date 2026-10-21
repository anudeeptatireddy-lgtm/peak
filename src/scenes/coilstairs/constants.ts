// Fixed values in `coilstairs` that are not sliders, each with its reason.

export const FIXED = {
  /** A pixel counts as part of a letter above this alpha. */
  ALPHA_CUTOFF: 128,
  /** Letter outlines are simplified to within this many px. */
  SIMPLIFY: 0.8,
  /** Room around each letter on its hidden canvas, in px. */
  PAD: 4,
  /** Extra room for letters that reach past their advance box, as a share of the font size. */
  OVERHANG: 0.15,
  /** Height of a capital as a share of the font size, for layout. */
  CAP: 0.72,
  /** The stairs and letters fill at most this share of the screen height. */
  HEIGHT_FIT: 0.86,
  /** The top face of a step is this share of the step height. */
  TREAD: 0.3,
  /** Steps reach this share of the name's width past either end. */
  MARGIN: 0.08,
  /** How strongly the steps' color leans from the background toward the text color. */
  TREAD_MIX: 0.1,
  RISER_MIX: 0.2,
  /** A coil stack never squashes past this (−1 would flatten it completely). */
  SQUASH_MIN: -0.9,
  /** The inner scroll area on scene pages is this many screens tall… */
  INNER_SCREENS: 3,
  /** …and recenters within half a screen of either end. */
  RECENTER_LOW: 0.5,
  RECENTER_HIGH: 1.5,
} as const;

export const FIXED_REASONS: Record<keyof typeof FIXED, string> = {
  ALPHA_CUTOFF: 'Half opacity: the edge of the anti-aliased letters.',
  SIMPLIFY: 'Below a pixel, so outlines look exact but have fewer points to draw.',
  PAD: 'Keeps a letter’s outline from touching the edge of its hidden canvas.',
  OVERHANG: 'Italic-like overhangs and wide bowls never get clipped on the hidden canvas.',
  CAP: 'Typical capital height of the Anybody font; only centers the layout.',
  HEIGHT_FIT: 'Layout margin so the stairs never touch the top or bottom.',
  TREAD: 'Proportion of the drawn step, so the top face reads as a surface.',
  MARGIN: 'Layout margin so the outer letters do not stand on the step edge.',
  TREAD_MIX: 'Steps are a quiet tint of the world, so the letters stay in front.',
  RISER_MIX: 'The step fronts are a little darker than the tops, so the steps read in 3D.',
  SQUASH_MIN: 'Stops a hard landing from turning a coil stack inside out.',
  INNER_SCREENS: 'Part of the invisible endless scroll area on scene pages; never shows.',
  RECENTER_LOW: 'Part of the invisible endless scroll area on scene pages; never shows.',
  RECENTER_HIGH: 'Part of the invisible endless scroll area on scene pages; never shows.',
};
