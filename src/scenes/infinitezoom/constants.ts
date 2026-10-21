// Fixed values in `infinitezoom` that are not sliders, each with its reason.

export const FIXED = {
  /** A pixel counts as part of the letters above this alpha. */
  ALPHA_CUTOFF: 128,
  /** A building fills this share of its block; the rest is the street gap. */
  FILL: 0.8,
  /** Filler buildings outside the name are this share of a block. */
  FILLER: 0.55,
  /** Filler buildings are the soft text color mixed this far toward the background. */
  FILLER_MIX: 0.55,
  /** Shadows fall this share of a block down and to the right. */
  SHADOW: 0.18,
  /** Shadows are the text color at this opacity. */
  SHADOW_ALPHA: 0.18,
  /** A roof hatch is inset this share of the building on each side. */
  HATCH: 0.28,
  /** A street runs every this many blocks. */
  STREET_EVERY: 4,
  /** The skylight is this much bigger than the picture inside it… */
  WINDOW_PAD: 1.1,
  /** …and the building around the skylight this much bigger again. */
  BUILDING_PAD: 1.2,
  /** The picture frame is this many line weights thick. */
  FRAME: 2,
  /** Without input, the camera zooms this many levels a second at zoom speed 1. */
  AUTO_RATE: 0.12,
  /** Seed for which buildings get roof detail and filler buildings. */
  SEED: 89,
  /** Degrees in half a turn, to turn the rotation slider into radians. */
  HALF_TURN: 180,
  /** The inner scroll area on scene pages is this many screens tall… */
  INNER_SCREENS: 3,
  /** …and recenters within half a screen of either end. */
  RECENTER_LOW: 0.5,
  RECENTER_HIGH: 1.5,
} as const;

export const FIXED_REASONS: Record<keyof typeof FIXED, string> = {
  ALPHA_CUTOFF: 'Half opacity: the edge of the anti-aliased letters.',
  FILL: 'Leaves a narrow street between neighboring buildings, so blocks read as buildings.',
  FILLER: 'Background buildings are smaller than the name’s, so the name stands out.',
  FILLER_MIX: 'Background buildings are quiet, so the name stays the loudest thing.',
  SHADOW: 'A low sun: shadows long enough to read as height, short enough to stay tidy.',
  SHADOW_ALPHA: 'A soft shadow that works in light and dark worlds.',
  HATCH: 'Proportion of the flat-illustration roof detail.',
  STREET_EVERY: 'City blocks of four buildings, a familiar map rhythm.',
  WINDOW_PAD: 'A rim of room wall shows around the picture.',
  BUILDING_PAD: 'A visible roof around the skylight.',
  FRAME: 'The picture frame reads as a frame, thicker than the streets.',
  AUTO_RATE: 'About eight seconds per level at speed 1: calm, but clearly moving.',
  SEED: 'A fixed city so the scene and its prompt look the same every visit.',
  HALF_TURN: 'Unit conversion from degrees to radians.',
  INNER_SCREENS: 'Part of the invisible endless scroll area on scene pages; never shows.',
  RECENTER_LOW: 'Part of the invisible endless scroll area on scene pages; never shows.',
  RECENTER_HIGH: 'Part of the invisible endless scroll area on scene pages; never shows.',
};
