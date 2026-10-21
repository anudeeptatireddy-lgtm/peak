// Fixed values in `clayframes` that are not sliders, each with its reason.

export const FIXED = {
  /** A pixel counts as part of the letters above this alpha. */
  ALPHA_CUTOFF: 128,
  /** The name is never wider than this share of the width. */
  FIT: 0.9,
  /** The name's center sits at this share of the height. */
  NAME_Y: 0.55,
  /** Outlines are simplified to within this many px, then resampled every this many px. */
  SIMPLIFY: 0.6,
  RESAMPLE: 3,
  /** At jitter 1, outlines boil by up to this share of the letter size… */
  JITTER_SHARE: 0.022,
  /** …in waves this many px long (and a second, shorter wave at half that). */
  WAVE_PX: 26,
  /** Seed for letter colors, texture and the idle finger. */
  SEED: 68,
  /** A thumbprint is an ellipse this share as tall as it is wide… */
  THUMB_ASPECT: 0.78,
  /** …with this many fingerprint ridges. */
  RIDGES: 6,
  /** A press pushes the outline within this many thumb radii… */
  PUSH_REACH: 1.3,
  /** …by up to this many thumb radii at full squish. */
  PUSH: 0.45,
  /** The dent darkens by up to this opacity, its ridges by this, its lit rim by this. */
  DENT_ALPHA: 0.28,
  RIDGE_ALPHA: 0.3,
  RIM_ALPHA: 0.45,
  /** The lit rim runs between these screen angles (radians): the lower-right half. */
  RIM_FROM: -0.785,
  RIM_TO: 2.356,
  /** A dragging finger leaves a new print every this many thumb radii. */
  PRINT_STEP: 1.2,
  /** At most this many prints are kept; the oldest goes first. */
  MAX_PRINTS: 40,
  /** A hovering mouse presses this hard without leaving a print. */
  HOVER_DEPTH: 0.3,
  /** At full lighting, light and shade sit this share of the letter size off the edge. */
  LIGHT_SHARE: 0.03,
  /** At full lighting the drop shadow is this opaque, the edge light and shade these. */
  SHADOW_ALPHA: 0.35,
  EDGE_LIGHT_ALPHA: 0.5,
  EDGE_SHADE_ALPHA: 0.4,
  /** At full softness the soft rim is this share of the letter size wide and this opaque. */
  SOFT_SHARE: 0.03,
  SOFT_ALPHA: 0.35,
  /** Texture specks: this many per 1,000 px² of letter at full texture… */
  SPECKS: 3,
  SPECK_AREA: 1000,
  /** …each this many px across, this opaque at full texture. */
  SPECK_PX: 1.6,
  SPECK_ALPHA: 0.35,
  /** Specks are sampled on a grid this many px apart. */
  SPECK_GRID: 4,
  /** The still frame's two prints sit at these shares along the name. */
  STILL_A: 0.3,
  STILL_B: 0.72,
} as const;

export const FIXED_REASONS: Record<keyof typeof FIXED, string> = {
  ALPHA_CUTOFF: 'Half opacity: the edge of the anti-aliased letters.',
  FIT: 'Keeps a margin at the screen edges on phones.',
  NAME_Y: 'Layout: the name sits a little below the stage buttons.',
  SIMPLIFY: 'Below a pixel, so the outline is exact but lighter.',
  RESAMPLE: 'Points close enough for a smooth wobble, few enough to redraw each frame.',
  JITTER_SHARE: 'A visible stop-motion boil that never breaks a letter apart.',
  WAVE_PX: 'Soft, hand-made bumps rather than a fine buzz.',
  SEED: 'The same letters and texture every visit, so the scene and its prompt match.',
  THUMB_ASPECT: 'A thumb is a little longer than it is wide.',
  RIDGES: 'Enough ridges to read as a fingerprint at thumb size.',
  PUSH_REACH: 'The clay moves a little beyond the thumb itself.',
  PUSH: 'A clear squish that still keeps the letter readable.',
  DENT_ALPHA: 'A soft dent, darker than the clay but not a hole.',
  RIDGE_ALPHA: 'Faint ridges you notice up close.',
  RIM_ALPHA: 'The lit rim makes the dent read as pressed in.',
  RIM_FROM: 'Light from the top left lights the lower-right wall of a dent.',
  RIM_TO: 'Light from the top left lights the lower-right wall of a dent.',
  PRINT_STEP: 'A drag leaves a trail of overlapping prints.',
  MAX_PRINTS: 'Caps drawing work; older prints have mostly relaxed anyway.',
  HOVER_DEPTH: 'Hovering nudges the clay; pressing leaves the print.',
  LIGHT_SHARE: 'Light from the top left, thick enough to give the clay depth.',
  SHADOW_ALPHA: 'A grounded shadow that does not swallow the letters.',
  EDGE_LIGHT_ALPHA: 'A clear highlight on the lit edges.',
  EDGE_SHADE_ALPHA: 'A clear shade on the far edges.',
  SOFT_SHARE: 'A soft rim, like clay that is not cut clean.',
  SOFT_ALPHA: 'A soft rim that still keeps the letter shapes clear.',
  SPECKS: 'Enough specks to read as clay grain without looking dirty.',
  SPECK_AREA: 'Unit only: specks are counted per 1,000 px² of letter.',
  SPECK_PX: 'Grain at about the size of a fingertip mark.',
  SPECK_ALPHA: 'Grain you notice without it fighting the letters.',
  SPECK_GRID: 'Fine enough to scatter specks evenly over thin letters.',
  STILL_A: 'SCENES.md #68: the still frame shows two thumbprints, apart from each other.',
  STILL_B: 'SCENES.md #68: the still frame shows two thumbprints, apart from each other.',
};
