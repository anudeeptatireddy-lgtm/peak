// Fixed values in `stringart` that are not sliders, each with its reason.

export const FIXED = {
  /** A pixel counts as part of the letters above this alpha. */
  ALPHA_CUTOFF: 128,
  /** Letter outlines are simplified to within this many px before nails are placed. */
  SIMPLIFY: 0.6,
  /** Each letter outline gets at least this many nails. */
  MIN_NAILS: 3,
  /** The route search scores lines on a grid of cells this many px wide. */
  CELL: 3,
  /** A cell outside the letters costs this many times what a fresh inside cell gains. */
  OUT_PENALTY: 2.5,
  /** Seed for the route search. */
  SEED: 69,
  /** Threads are drawn at this opacity, so density builds the letters. */
  THREAD_ALPHA: 0.45,
  /** Threads are stroked in batches of this many, so crossings darken. */
  BATCH: 64,
  /** At draw speed 1 the thread lays this many lines a second. */
  BASE_RATE: 120,
  /** Left alone, a finished piece unwinds this many times faster than it was drawn. */
  UNWIND: 4,
  /** A pluck gives a thread this many px per frame of speed at pluck strength 1. */
  PLUCK_V: 3,
  /** Tension 1 gives a spring this stiff (per frame at 60fps). */
  TENSION_K: 0.08,
  /** A thread never bows more than this many px. */
  MAX_BOW: 30,
  /** Below this bow (px) a thread counts as at rest and is drawn straight. */
  REST: 0.05,
  /** The racing tip is a dot this many px across. */
  TIP: 5,
  /** The inner scroll area on scene pages is this many screens tall… */
  INNER_SCREENS: 3,
  /** …and recenters within half a screen of either end. */
  RECENTER_LOW: 0.5,
  RECENTER_HIGH: 1.5,
} as const;

export const FIXED_REASONS: Record<keyof typeof FIXED, string> = {
  ALPHA_CUTOFF: 'Half opacity: the edge of the anti-aliased letters.',
  SIMPLIFY: 'Below a pixel, so nails sit exactly on the letter edges.',
  MIN_NAILS: 'A loop needs three nails to span anything; tiny dots still get them.',
  CELL: 'Fine enough to judge thin strokes, coarse enough to search quickly.',
  OUT_PENALTY: 'Threads stay inside the letters but may still cross small gaps.',
  SEED: 'The same piece every visit, so the scene and its prompt match.',
  THREAD_ALPHA: 'Single threads are light; many together read as solid letters.',
  BATCH: 'Few draw calls, while crossings between batches still darken.',
  BASE_RATE: 'The default 1,200 threads take ten seconds: fast, but you can follow it.',
  UNWIND: 'The idle loop rewinds quickly so the drawing restarts soon.',
  PLUCK_V: 'A clear twang at default strength without threads flying about.',
  TENSION_K: 'At default tension a thread vibrates a few times a second, like a string.',
  MAX_BOW: 'Plucked threads stay near their nails.',
  REST: 'Under a tenth of a pixel the bow cannot be seen.',
  TIP: 'Large enough to follow the racing thread.',
  INNER_SCREENS: 'Part of the invisible endless scroll area on scene pages; never shows.',
  RECENTER_LOW: 'Part of the invisible endless scroll area on scene pages; never shows.',
  RECENTER_HIGH: 'Part of the invisible endless scroll area on scene pages; never shows.',
};
