// Fixed values in `doubling` that are not sliders, each with its reason.

export const FIXED = {
  /** A pixel counts as part of the letters above this alpha. */
  ALPHA_CUTOFF: 128,
  /** The name's center sits at this share of the height, below the counter. */
  NAME_Y: 0.55,
  /** Neighboring stacks sit this many coin widths apart. */
  X_GAP: 1.08,
  /** A coin's top is an ellipse this share as tall as it is wide (seen from slightly above). */
  TILT: 0.42,
  /** The name shrinks up to this many times to fit the coin count. */
  SHRINK_TRIES: 8,
  /** Each shrink takes off this share of the font size beyond the exact estimate. */
  SHRINK_MARGIN: 0.97,
  /** A spinning coin never gets thinner than this share of its width. */
  MIN_WIDTH: 0.12,
  /** At full wobble the top of the tallest stack sways this many coin widths. */
  WOBBLE_SHARE: 0.35,
  /** The wobble spring's stiffness per frame. */
  WOBBLE_K: 0.12,
  /** Coin edges are the coin color mixed this far toward the text color. */
  EDGE_MIX: 0.35,
  /** The table line sits this many coin thicknesses below the lowest coin. */
  TABLE_GAP: 1,
  /** The counter's font size as a share of the screen height… */
  COUNTER_SIZE: 0.07,
  /** …and its center's height as a share of the screen height. */
  COUNTER_Y: 0.3,
  /** The counter text keeps at least this contrast with the background (WCAG AA). */
  CONTRAST: 4.5,
  /** The counter is drawn at this weight. */
  COUNTER_WEIGHT: 700,
  /** The inner scroll area on scene pages is this many screens tall… */
  INNER_SCREENS: 3,
  /** …and recenters within half a screen of either end. */
  RECENTER_LOW: 0.5,
  RECENTER_HIGH: 1.5,
} as const;

export const FIXED_REASONS: Record<keyof typeof FIXED, string> = {
  ALPHA_CUTOFF: 'Half opacity: the edge of the anti-aliased letters.',
  NAME_Y: 'Layout: leaves room for the counter above the stacks.',
  X_GAP: 'A sliver of table between stacks, so each stack reads on its own.',
  TILT: 'A gentle view from above: coins read as discs, stacks as columns.',
  SHRINK_TRIES: 'Enough tries to fit any coin count; it stops as soon as the name fits.',
  SHRINK_MARGIN: 'Makes each shrink land just under the target instead of just over.',
  MIN_WIDTH: 'A coin seen edge-on still shows as a sliver, never vanishes.',
  WOBBLE_SHARE: 'A visible sway that never knocks a stack over.',
  WOBBLE_K: 'A slow, heavy sway, like a real stack of coins.',
  EDGE_MIX: 'Coin edges darker than their faces, so stacks read in 3D.',
  TABLE_GAP: 'The table sits just under the coins.',
  COUNTER_SIZE: 'Typography: the counter is clear but smaller than the name.',
  COUNTER_Y: 'Layout: the counter sits above the stacks.',
  CONTRAST: 'Text contrast rule (WCAG AA for normal text).',
  COUNTER_WEIGHT: 'Typography: a bold, readable counter.',
  INNER_SCREENS: 'Part of the invisible endless scroll area on scene pages; never shows.',
  RECENTER_LOW: 'Part of the invisible endless scroll area on scene pages; never shows.',
  RECENTER_HIGH: 'Part of the invisible endless scroll area on scene pages; never shows.',
};
