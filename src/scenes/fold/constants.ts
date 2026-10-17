// Fixed values in `fold` that are not sliders, each with its reason.

export const FIXED = {
  /** The inner scroll area (scene pages) is this many screens tall. */
  INNER_SCREENS: 5,
  /** Recenter the inner scroll area when within this many screens of the top… */
  RECENTER_LOW: 1,
  /** …or beyond this many screens from the top. */
  RECENTER_HIGH: 3,
  /** The headline is never wider than this share of the sheet. */
  TEXT_FIT: 0.9,
  /** Average letter width as a share of the font size, used to fit the headline to the sheet. */
  TEXT_EM: 0.6,
  /** Font weight of the headline. */
  TEXT_WEIGHT: 800,
  /** Where the reduced-motion still frame stops: half folded. */
  STILL_FOLD: 0.5,
  /** Opacity of a panel's thin edge line. */
  EDGE_ALPHA: 0.35,
  /** How much a flat panel's creased side is lightened, as a share of the Crease shading. */
  LIGHT_SHARE: 0.5,
  /** Degrees in half a turn, to turn the Fold angle (degrees) into radians. */
  HALF_TURN: 180,
  /** CSS value that lets panels stack and rotate in 3D inside each other. */
  PRESERVE: 'preserve-3d',
} as const;

export const FIXED_REASONS: Record<keyof typeof FIXED, string> = {
  INNER_SCREENS: 'Size of the scroll area that drives the fold on scene pages (as in velocity).',
  RECENTER_LOW: 'Keeps the endless scroll area from reaching its top (as in velocity).',
  RECENTER_HIGH: 'Keeps the endless scroll area from reaching its bottom (as in velocity).',
  TEXT_FIT: 'Keeps the headline inside the sheet.',
  TEXT_EM: 'A rough letter width, to fit the headline without measuring it.',
  TEXT_WEIGHT: 'Typography of the paper headline.',
  STILL_FOLD: 'The still frame shows the sheet half folded (SCENES.md #43).',
  EDGE_ALPHA: 'A faint line at each crease so the panels read as paper.',
  LIGHT_SHARE: 'Panels tilting away are lightened a little, those tilting toward are darkened.',
  HALF_TURN: 'Unit conversion from degrees to radians.',
  PRESERVE: 'The CSS keyword that makes nested 3D transforms work.',
};
