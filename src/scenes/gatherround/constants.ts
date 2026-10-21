// Fixed values in `gatherround` that are not sliders, each with its reason.

export const FIXED = {
  /** The name is sampled on a grid starting this many px apart… */
  START_GAP: 3,
  /** …widened until it gives no more spots than there are people, up to this gap. */
  MAX_GAP: 80,
  /** A pixel counts as part of the letters above this alpha. */
  ALPHA_CUTOFF: 128,
  /** The name's center sits at this share of the height, below the counter. */
  NAME_Y: 0.56,
  /** This many people are on their way even before any scrolling. */
  START_FEW: 6,
  /** Walking speed at speed 1, in px per frame at 60fps. */
  WALK_PX: 1.1,
  /** Share of the way a person turns toward where they want to go each frame. */
  STEER: 0.12,
  /** People slow down within this many spot gaps of their spot. */
  ARRIVE: 3,
  /** Paths bend by up to this many radians at full variety… */
  CURVE_MAX: 0.9,
  /** …straightening out within this many px of the spot. */
  CURVE_DIST: 220,
  /** People keep this many figure sizes apart. */
  SEP_RADIUS: 2.1,
  /** Px per frame of push at full separation strength, for people fully overlapping. */
  SEP_PUSH: 0.6,
  /** Someone within this many spot gaps of their spot counts as standing there. */
  STAND: 0.6,
  /** People appear and leave this many px outside the stage. */
  SPAWN_OUT: 24,
  /** A stage has four edges to arrive from. */
  EDGES: 4,
  /** Shoulders: an ellipse this share as deep as it is wide. */
  SHOULDER: 0.6,
  /** The head is this share of the figure size, set this share of it ahead. */
  HEAD: 0.55,
  HEAD_FWD: 0.12,
  /** Shoulders sway this many radians as people walk… */
  SWAY: 0.28,
  /** …one step per this many px walked. */
  STEP_PX: 9,
  /** Each color comes in this many tints. */
  TINTS: 3,
  /** At full variety the lightest tint is mixed this far toward the surface color. */
  TINT_MIX: 0.45,
  /** Plaza paving squares are this many px (high quality only). */
  PAVING: 56,
  /** The counter's font size and center height, as shares of the stage height. */
  COUNTER_SIZE: 0.05,
  COUNTER_Y: 0.17,
  /** The counter keeps at least this contrast with the background (WCAG AA). */
  CONTRAST: 4.5,
  /** The counter's font weight. */
  COUNTER_WEIGHT: 700,
  /** Seed for spots, arrival order, speeds, paths and colors. */
  SEED: 87,
  /** The inner scroll area on scene pages is this many screens tall… */
  INNER_SCREENS: 3,
  /** …and recenters within half a screen of either end. */
  RECENTER_LOW: 0.5,
  RECENTER_HIGH: 1.5,
} as const;

export const FIXED_REASONS: Record<keyof typeof FIXED, string> = {
  START_GAP: 'Where the sampling search starts; the crowd size decides the real spacing.',
  MAX_GAP: 'Ends the sampling search for very long names; never reached at normal sizes.',
  ALPHA_CUTOFF: 'Half opacity: the edge of the anti-aliased letters.',
  NAME_Y: 'Layout: leaves room for the counter above the crowd.',
  START_FEW: 'SCENES.md #87: a few figures are already walking in at the start.',
  WALK_PX: 'A calm walking pace at the default size; the speed slider scales it.',
  STEER: 'People turn smoothly instead of snapping toward their spot.',
  ARRIVE: 'People slow as they reach their spot instead of overshooting.',
  CURVE_MAX: 'Varied, natural-looking paths across the plaza.',
  CURVE_DIST: 'Paths straighten near the end, so everyone reaches their spot.',
  SEP_RADIUS: 'Shoulders just touch, so people step around each other.',
  SEP_PUSH: 'Strong enough to step around others, gentle enough not to jostle.',
  STAND: 'Close enough to the spot to count as part of the name.',
  SPAWN_OUT: 'People walk in from just outside the edges.',
  EDGES: 'Geometry: people arrive from every edge (SCENES.md #87).',
  SHOULDER: 'Character design: shoulders seen from above.',
  HEAD: 'Character design: a head seen from above.',
  HEAD_FWD: 'Character design: the head sits a little forward of the shoulders.',
  SWAY: 'A gentle walking sway, visible but calm.',
  STEP_PX: 'About one stride per figure length.',
  TINTS: 'Gentle variety within one palette (SCENES.md #87).',
  TINT_MIX: 'Tints stay in the palette but are clearly different.',
  PAVING: 'Plaza paving at a human scale for the figures.',
  COUNTER_SIZE: 'Typography: clear, but smaller than the crowd.',
  COUNTER_Y: 'Layout: above the crowd and below the stage buttons.',
  CONTRAST: 'Text contrast rule (WCAG AA for normal text).',
  COUNTER_WEIGHT: 'Typography: a bold, readable counter.',
  SEED: 'The same crowd every visit, so the scene and its prompt match.',
  INNER_SCREENS: 'Part of the invisible endless scroll area on scene pages; never shows.',
  RECENTER_LOW: 'Part of the invisible endless scroll area on scene pages; never shows.',
  RECENTER_HIGH: 'Part of the invisible endless scroll area on scene pages; never shows.',
};
