// Fixed values in `platformarrival` that are not sliders, each with its reason.

export const FIXED = {
  /** Each landscape is a sum of waves: [height share, waves per period, phase]. */
  SHAPES: {
    plains: [
      [0.25, 1, 0],
      [0.1, 3, 1],
    ],
    hills: [
      [0.7, 1, 0],
      [0.3, 2, 1],
    ],
    coast: [
      [0.9, 1, 0],
      [0.15, 4, 2],
    ],
  },
  /** In the coast landscape, the front half of the layers are calm sea at this height share. */
  SEA_SHARE: 0.06,
  /** The far edge of the land, as a share of the screen height… */
  HORIZON: 0.36,
  /** …and the front layer's base line. */
  FRONT_LINE: 0.72,
  /** The platform's top edge as a share of the height; it covers everything below. */
  PLATFORM_TOP: 0.68,
  /** The safety line along the platform edge, as a share of the platform's depth. */
  EDGE_LINE: 0.08,
  /** The canopy beam the sign hangs from, as a share of the height. */
  CANOPY_Y: 0.16,
  /** The canopy beam's thickness and the pillars' width, in px. */
  BEAM: 10,
  /** Space around the name on the sign, as a share of the font size. */
  SIGN_PAD: 0.35,
  /** The sign's chains, as a share of the font size. */
  CHAIN: 0.6,
  /** Pillars stand this many screen widths apart along the platform. */
  PILLAR_GAP: 0.45,
  /** How quickly the sign's swing follows the train's lurch (per 60Hz frame). */
  SWING_STIFF: 0.08,
  /** How much swing survives each frame. */
  SWING_DAMP: 0.9,
  /** The sign never swings past this angle (radians). */
  SWING_MAX: 0.35,
  /** Streaks are spread over this many lines, placed once with a fixed seed. */
  STREAKS: 40,
  /** The window's inner edge line, in px. */
  FRAME_LINE: 3,
  /** Streak thickness in px. */
  STREAK_W: 2,
  /** Streaks show only above this share of top speed. */
  STREAK_FROM: 0.5,
  /** Landscapes are drawn as lines through points this many px apart. */
  SAMPLE_PX: 6,
  /** The arrival counts as settled within this distance of its goal (idle demo). */
  SETTLED: 0.02,
  /** Text on the sign keeps at least this contrast with the board (WCAG AA). */
  SIGN_CONTRAST: 4.5,
  /** The inner scroll area on scene pages is this many screens tall… */
  INNER_SCREENS: 3,
  /** …and recenters within half a screen of either end. */
  RECENTER_LOW: 0.5,
  RECENTER_HIGH: 1.5,
} as const;

export const FIXED_REASONS: Record<keyof typeof FIXED, string> = {
  SHAPES: 'The three landscape choices; the Landscape menu picks one and Hill height scales it.',
  SEA_SHARE: 'Gives the coast its flat sea in front of the headlands.',
  HORIZON: 'Puts the land just below the middle, like a window view.',
  FRONT_LINE: 'Keeps the nearest layer above the bottom of the window.',
  PLATFORM_TOP: 'The platform fills the bottom of the window below the nearest layer.',
  EDGE_LINE: 'A thin painted safety line along the platform edge.',
  CANOPY_Y: 'Keeps the sign in the upper part of the window, above the landscape.',
  BEAM: 'Thin enough to read as a structure, not a block.',
  SIGN_PAD: 'The name breathes inside the sign board.',
  CHAIN: 'Short chains so the swing reads as hanging.',
  PILLAR_GAP: 'Enough pillars to read as a station at every screen size.',
  SWING_STIFF: 'A slow, heavy swing; "Sign swing" sets how far it goes.',
  SWING_DAMP: 'The swing settles in about a second.',
  SWING_MAX: 'Stops the sign flipping over on a hard stop.',
  STREAKS: 'Enough streaks to read as speed without covering the view.',
  FRAME_LINE: 'Separates the window frame from the sky in dark worlds.',
  STREAK_W: 'Thin lines; "Streak length" sets how long they are.',
  STREAK_FROM: 'Streaks only at real speed, so they fade out as the train slows.',
  SAMPLE_PX: 'Smooth curves at any width without thousands of points.',
  SETTLED: 'Close enough that the demo moves on without a visible jump.',
  SIGN_CONTRAST: 'The name on the sign stays readable in every world.',
  INNER_SCREENS: 'Part of the invisible endless scroll area on scene pages; never shows.',
  RECENTER_LOW: 'Part of the invisible endless scroll area on scene pages; never shows.',
  RECENTER_HIGH: 'Part of the invisible endless scroll area on scene pages; never shows.',
};
