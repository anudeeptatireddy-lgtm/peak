// Fixed values in `fogged` that are not sliders, each with its reason.

export const FIXED = {
  /** The fog mask is stored at one value per square cell of this many px. */
  MASK_CELL: 4,
  /** The fogged picture is built at this share of the screen size, then scaled up (the fog is soft anyway). */
  FOG_SCALE: 0.5,
  /** The name is never wider than this share of the screen. */
  TEXT_FIT: 0.9,
  /** Average letter width as a share of the font size, to fit the name without measuring it. */
  TEXT_EM: 0.6,
  /** Where the name sits, as a share of the height. */
  TEXT_Y: 0.5,
  /** Font weight of the name. */
  TEXT_WEIGHT: 900,
  /** Size of the name, as a share of the height. */
  TEXT_SIZE: 0.22,
  /** The scene behind the fog: a gradient at this angle (degrees)… */
  BACK_ANGLE: 135,
  /** …with three soft circles, each (x share, y share, radius share of the short side). */
  BLOBS: [
    [0.2, 0.3, 0.5],
    [0.8, 0.25, 0.45],
    [0.55, 0.85, 0.55],
  ],
  /** Opacity of those circles. */
  BLOB_ALPHA: 0.8,
  /** The edge of a wipe is soft over this share of its radius. */
  WIPE_EDGE: 0.45,
  /** Drips start this share of a wipe radius below the cursor. */
  DRIP_START: 0.6,
  /** A drip may run at most this share of the screen height (random between half of it and all). */
  DRIP_LEN: 0.3,
  /** Half-width of the clear line a drip leaves, in px. */
  DRIP_RADIUS: 3,
  /** Radius of the bead at the head of a drip, in px. */
  DRIP_BEAD: 4,
  /** Pixels of wiping per chance of a new drip (at Drip chance 1). */
  DRIP_SPACING: 150,
  /** Highest value of a color channel in rgba(). */
  CHANNEL: 255,
  /** The still frame: the wiped band's height share, and its left and right ends. */
  STILL_BAND: [0.5, 0.15, 0.85],
  /** The still frame's two drips: x shares and how far they have run (share of the height). */
  STILL_DRIPS: [
    [0.3, 0.14],
    [0.6, 0.1],
  ],
  /** Degrees in half a turn, to turn the gradient angle into radians. */
  HALF_TURN: 180,
} as const;

export const FIXED_REASONS: Record<keyof typeof FIXED, string> = {
  MASK_CELL: 'A coarse fog grid is fast and looks soft, which is what fog should look like.',
  FOG_SCALE: 'The fog is blurry anyway, so half resolution is invisible and much faster.',
  TEXT_FIT: 'Keeps the name inside the screen.',
  TEXT_EM: 'A rough letter width used to fit the name without measuring it.',
  TEXT_Y: 'The name sits in the middle.',
  TEXT_WEIGHT: 'Typography of the name.',
  TEXT_SIZE: 'Typography of the name.',
  BACK_ANGLE: 'The look of the colorful scene behind the glass.',
  BLOBS: 'The look of the colorful scene behind the glass.',
  BLOB_ALPHA: 'The look of the colorful scene behind the glass.',
  WIPE_EDGE: 'A soft wipe edge, like a finger on glass.',
  DRIP_START: 'Drips gather just below the finger.',
  DRIP_LEN: 'Drips stop before reaching the bottom of the screen.',
  DRIP_RADIUS: 'The width of the clear line a drip leaves.',
  DRIP_BEAD: 'The size of a drip bead.',
  DRIP_SPACING: 'How often drips can form while wiping.',
  CHANNEL: 'Unit conversion: rgba() colors use 0 to 255.',
  STILL_BAND:
    'The reduced-motion still frame shows one wiped band across the middle (SCENES.md #51).',
  STILL_DRIPS: 'The still frame shows two drips running down.',
  HALF_TURN: 'Unit conversion from degrees to radians.',
};
