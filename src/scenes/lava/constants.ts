// Fixed values in `lava` that are not sliders, each with its reason.

export const FIXED = {
  /** Metaball grid cell in px for each Detail setting (smaller is smoother and slower). */
  CELL_LOW: 12,
  CELL_MEDIUM: 8,
  CELL_HIGH: 5,
  /** The bottom share of the screen that heats the wax. */
  HEAT_ZONE: 0.2,
  /** The top share of the screen that cools the wax. */
  COOL_ZONE: 0.25,
  /** Wax cools this much per second everywhere (0 to 1 scale), so it always sinks eventually. */
  AMBIENT: 0.05,
  /** Cooling per second in the top zone, as a multiple of the heating rate. */
  COOL_RATIO: 1,
  /** Water-like drag: the share of speed kept each frame. */
  DRAG: 0.985,
  /** Sideways wobble strength (px per frame²), scaled by Flow speed. */
  WANDER: 0.02,
  /** Sideways wobble pace (radians per second). */
  WANDER_RATE: 0.3,
  /** How hard a click kicks the lower blobs upward (px per frame), scaled by Warmth. */
  KICK: 4,
  /** Where the field is 1 at a blob's own edge; the Merge softness divides this. */
  EDGE_FIELD: 1,
  /** The glow edge is drawn at this share of the body threshold (a wider, fainter skirt)… */
  GLOW_SCALE: 0.45,
  /** …at this opacity. */
  GLOW_ALPHA: 0.55,
  /** The bright core is drawn at this multiple of the body threshold (smaller, hotter)… */
  CORE_SCALE: 2.4,
  /** …at this opacity. */
  CORE_ALPHA: 0.5,
  /** Frames simulated for the reduced-motion still frame. */
  STILL_FRAMES: 240,
  /** Seed of the random numbers that place the blobs, so the lamp starts the same every time. */
  SEED: 77,
  /** Highest value of a color channel in the metaball image (it is 8-bit). */
  CHANNEL: 255,
  /** Screens under 700px wide always use the low-detail cell size, to keep phones smooth (this is that cell, same as CELL_LOW). */
  PHONE_CELL: 12,
  /** Blob radius never goes below this share of its size (smallest of the random sizes). */
  SIZE_FLOOR: 0.3,
} as const;

export const FIXED_REASONS: Record<keyof typeof FIXED, string> = {
  CELL_LOW: 'Coarse grid for phones and slow machines.',
  CELL_MEDIUM: 'Balanced smoothness and speed.',
  CELL_HIGH: 'Fine grid for crisp edges.',
  HEAT_ZONE: 'The lamp is heated only at the bottom.',
  COOL_ZONE: 'Wax cools at the top.',
  AMBIENT: 'Slow cooling everywhere so wax always sinks eventually.',
  COOL_RATIO: 'Cooling at the top equals the heating at the bottom.',
  DRAG: 'Wax moves slowly through liquid.',
  WANDER: 'A little sideways drift so blobs do not rise in straight lines.',
  WANDER_RATE: 'The pace of that drift.',
  KICK: 'The push of a click, scaled by Warmth.',
  EDGE_FIELD: 'The metaball field equals 1 at a blob edge by definition.',
  GLOW_SCALE: 'Style of the glowing skirt around the blobs.',
  GLOW_ALPHA: 'Style of the glowing skirt around the blobs.',
  CORE_SCALE: 'Style of the hot core inside the blobs.',
  CORE_ALPHA: 'Style of the hot core inside the blobs.',
  STILL_FRAMES: 'Long enough for blobs to be mid-rise, two of them merging.',
  SEED: 'Any fixed number; makes the lamp the same every time.',
  SIZE_FLOOR: 'Stops a blob shrinking to nothing.',
  CHANNEL: 'The metaball image stores colors as 0 to 255.',
  PHONE_CELL: 'Phones use the coarsest grid to stay smooth.',
};
