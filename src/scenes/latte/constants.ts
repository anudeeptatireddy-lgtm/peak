// Fixed values in `latte` that are not sliders, each with its reason.

export const FIXED = {
  /** The foam and crema are stored on a grid with one value per square cell of this many px. */
  CELL: 4,
  /** The pour timeline as shares of the Pour time: the stream lands and blooms until… */
  BLOOM_END: 0.25,
  /** …then draws the name until… */
  DRAW_END: 0.85,
  /** …then lifts away. After that the foam settles for this many seconds. */
  SETTLE: 2.5,
  /** The stream starts above the cup edge: this many cup radii above the center. */
  STREAM_START: 1.25,
  /** Foam added per second at the landing spot while it stays still (the bloom), at foam thickness 1. */
  POUR_RATE: 2.4,
  /** While drawing, foam laid at each stamp along the path (stamps are half a spot apart). */
  STROKE_FOAM: 0.7,
  /** Foam laid down during the bloom, expanding as rings: ring count, ring width (cells) and ring speed (cells per second). */
  RINGS: 3,
  RING_WIDTH: 2.5,
  RING_SPEED: 28,
  /** The bloom rings lay foam at this strength, and stop once they reach this share of the cup radius. */
  RING_FOAM: 0.35,
  RING_REACH: 0.4,
  /** Drawn strokes only lay foam on the letters and this many cells around them, so the letters keep their shape. */
  EDGE_CELLS: 0,
  /** The landing spot's size in px, before Foam spread. */
  SPOT: 3.5,
  /** The stream's drawn width, in px, before Foam spread. */
  STREAM_W: 3.5,
  /** Rows of the name zigzag stroke are this many cells apart (a share of the spot size). */
  ROW_GAP: 0.8,
  /** Name size as a share of the cup diameter, and its weight. */
  TEXT_SIZE: 0.32,
  TEXT_WEIGHT: 800,
  /** Pour wobble: how fast it sways (radians per second) and how far at Wobble 1 (px). */
  WOBBLE_RATE: 5.5,
  WOBBLE_PX: 14,
  /** How fast the settling softens foam edges: the share of the difference from the neighbors' average per second. */
  DIFFUSE: 0.6,
  /** Saucer and cup rim size, as multiples of the coffee's radius. */
  RIM: 1.1,
  SAUCER: 1.32,
  /** Rim thickness in px. */
  RIM_W: 3,
  /** Crema speckles: how many per 1000 cells, and their alpha. */
  SPECKS: 14,
  SPECK_ALPHA: 0.35,
  /** Tiger stripes: how many radial streaks, and their alpha. */
  STRIPES: 28,
  STRIPE_ALPHA: 0.15,
  /** Seed of the random numbers for the crema texture. */
  SEED: 91,
  /** Steam on the still frame: curls, height as a share of the radius, and alpha. */
  STEAM_CURLS: 2,
  STEAM_H: 0.45,
  STEAM_ALPHA: 0.35,
  /** The cup turns toward the pointer by at most this many degrees × the Cup turn setting. */
  TURN_EASE: 0.05,
  /** Phone tilt that counts as a full lean (degrees) and the pitch of a phone held to read. */
  GYRO_RANGE: 30,
  GYRO_REST: 45,
  /** Degrees in half a turn. */
  HALF_TURN: 180,
  /** Button height in rem for the "Use motion" button, and its gap from the bottom. */
  BUTTON_HEIGHT: 2.75,
  BUTTON_BOTTOM: 1.5,
  /** Highest value of a color channel (8-bit). */
  CHANNEL: 255,
  /** Crema texture: how fast the streaks bend with distance, and how much. */
  STREAK_FREQ: 0.15,
  STREAK_WOBBLE: 3,
  /** Speckle chance is per this many cells. */
  PER_THOUSAND: 1000,
  /** The name is never wider than this share of the grid. */
  TEXT_FIT: 0.9,
  /** Smallest grid, in cells. */
  MIN_GRID: 8,
  /** The wobble's second axis runs at this multiple of the first. */
  WOBBLE_Y_RATIO: 1.3,
  /** A foam blob matters out to this many of its radii. */
  GAUSS_REACH: 2.5,
  /** Each of the four neighbors counts this much in the settling average. */
  NEIGHBOR_SHARE: 0.25,
  /** Steam: sample step along each curl (share of its height), waves per curl and sway (share of R). */
  STEAM_STEP: 0.05,
  STEAM_WAVES: 1.5,
  STEAM_AMP: 0.08,
  /** Side padding of the "Use motion" button, in rem. */
  BUTTON_PAD: 1.25,
  /** Corner radius that makes the button a pill, in px. */
  PILL: 999,
} as const;

export const FIXED_REASONS: Record<keyof typeof FIXED, string> = {
  CELL: 'A coarse grid is fast and looks soft, which is what foam should look like.',
  BLOOM_END: 'Shape of the pour: land and bloom, then draw, then lift.',
  DRAW_END: 'Shape of the pour: land and bloom, then draw, then lift.',
  SETTLE: 'How long the foam takes to relax after the pour.',
  STREAM_START: 'The milk pours in from above the edge of the cup.',
  POUR_RATE: 'How quickly foam builds where the stream lands.',
  STROKE_FOAM: 'How much foam each stamp along the drawn strokes lays down.',
  RINGS: 'The bloom of foam spreading from the landing spot, as rings.',
  RING_FOAM: 'The bloom of foam spreading from the landing spot, as rings.',
  RING_REACH: 'How far the bloom rings spread.',
  RING_WIDTH: 'The bloom of foam spreading from the landing spot, as rings.',
  RING_SPEED: 'The bloom of foam spreading from the landing spot, as rings.',
  SPOT: 'Size of the foam laid down by the stream.',
  EDGE_CELLS: 'Keeps the strokes inside the letter shapes.',
  STREAM_W: 'Width of the drawn stream of milk.',
  ROW_GAP: 'Spacing of the zigzag strokes that fill the letters.',
  TEXT_SIZE: 'Typography of the name in foam.',
  TEXT_WEIGHT: 'Typography of the name in foam.',
  WOBBLE_RATE: 'Pace of the pour wobble.',
  WOBBLE_PX: 'Size of the pour wobble at full strength.',
  DIFFUSE: 'How quickly foam edges soften while settling.',
  RIM: 'Proportions of the cup.',
  SAUCER: 'Proportions of the saucer.',
  RIM_W: 'Thickness of the cup rim line.',
  SPECKS: 'The look of the crema texture.',
  SPECK_ALPHA: 'The look of the crema texture.',
  STRIPES: 'The look of the tiger-striped crema.',
  STRIPE_ALPHA: 'The look of the tiger-striped crema.',
  SEED: 'Any fixed number: it makes the crema texture the same every time.',
  STEAM_CURLS: 'The look of the steam in the still frame.',
  STEAM_H: 'The look of the steam in the still frame.',
  STEAM_ALPHA: 'The look of the steam in the still frame.',
  TURN_EASE: 'How smoothly the cup follows the pointer.',
  GYRO_RANGE: 'A comfortable full lean of a phone; the browser reports tilt in degrees.',
  GYRO_REST: 'The pitch of a phone held to read; leaning is measured from it.',
  HALF_TURN: 'Unit conversion from degrees to radians.',
  BUTTON_HEIGHT: 'At least 44px tall, the touch-target minimum (PRD §8.3).',
  BUTTON_BOTTOM: 'Layout gap so the button clears the screen edge.',
  CHANNEL: 'Unit: colors use 0 to 255.',
  STREAK_FREQ: 'The look of the crema streaks.',
  STREAK_WOBBLE: 'The look of the crema streaks.',
  PER_THOUSAND: 'Unit: speckle density is per 1000 cells.',
  TEXT_FIT: 'Keeps the name inside the cup.',
  MIN_GRID: 'A grid smaller than this would be invisible.',
  WOBBLE_Y_RATIO: 'A different pace on the second axis so the wobble is not a circle.',
  GAUSS_REACH: 'Beyond 2.5 radii a gaussian blob is invisible.',
  NEIGHBOR_SHARE: 'Geometry: four neighbors share the average equally.',
  STEAM_STEP: 'Smoothness of the steam curls.',
  STEAM_WAVES: 'The look of the steam curls.',
  STEAM_AMP: 'The look of the steam curls.',
  BUTTON_PAD: 'Comfortable side padding for a touch button.',
  PILL: 'Rounds the button fully.',
};
