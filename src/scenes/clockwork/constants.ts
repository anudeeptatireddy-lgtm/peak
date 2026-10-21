// Fixed values in `clockwork` that are not sliders, each with its reason.

export const FIXED = {
  /** Seed for the gear sizes, chain angles and letter scatter, so the layout is the same every visit. */
  SEED: 66,
  /** No gear has fewer teeth than this. */
  MIN_TEETH: 6,
  /** Teeth reach this many modules outside the pitch circle… */
  ADDENDUM: 1,
  /** …and their roots sit this many modules inside it. */
  DEDENDUM: 1.25,
  /** A tooth's base takes this share of one tooth's angle on each side of its center… */
  ROOT_HALF: 0.3,
  /** …and its tip at most this share (the "Tooth shape" slider scales it). */
  TIP_HALF: 0.25,
  /** The gear chain spans this share of the name's width… */
  GEAR_SPAN: 1.15,
  /** …and at most this share of the screen height. */
  GEAR_HEIGHT: 0.8,
  /** Each tick uses this much of a fully wound spring (1). */
  TICK_COST: 0.04,
  /** Moving the pointer across the whole screen at wind speed 1 winds this much spring. */
  WIND_GAIN: 1.5,
  /** Each tick builds this share of a letter at build speed 1. */
  BUILD_PER_TICK: 0.25,
  /** Share of the way the driven gear moves toward its next tooth each frame. */
  TICK_EASE: 0.35,
  /** Unplaced letters hang turned up to this many radians around their gear. */
  SCATTER: 1.2,
  /** Unplaced letters are drawn at this opacity, rising to 1 when placed. */
  LETTER_FADE: 0.25,
  /** At full looseness a gear wobbles by this share of one tooth after a tick. */
  BACKLASH_TOOTH: 0.35,
  /** The wobble's spring stiffness and damping per frame. */
  WOBBLE_K: 0.25,
  WOBBLE_DAMP: 0.78,
  /** The escapement's pivot sits this many radii above the driven gear's center… */
  ANCHOR_DIST: 1.45,
  /** …and its two pallets are this share of the radius apart and long. */
  PALLET: 0.45,
  /** The mainspring spiral has this many turns at rest, plus up to this many when fully wound. */
  SPIRAL_MIN: 1.5,
  SPIRAL_TURNS: 4,
  /** The spiral reaches this share of the driven gear's radius. */
  SPIRAL_SHARE: 0.55,
  /** Points per spiral. */
  SPIRAL_STEPS: 96,
  /** Gears are drawn at this opacity, so the letters on top stay readable. */
  GEAR_ALPHA: 0.55,
  /** Line width of the escapement and spiral, in px. */
  LINE: 2,
  /** Degrees in half a turn, to turn degree sliders into radians. */
  HALF_TURN: 180,
} as const;

export const FIXED_REASONS: Record<keyof typeof FIXED, string> = {
  SEED: 'A fixed layout so the scene and its prompt look the same every visit.',
  MIN_TEETH: 'Fewer teeth than this no longer reads as a gear.',
  ADDENDUM: 'Standard gear proportions: teeth reach one module past the pitch circle.',
  DEDENDUM: 'Standard gear proportions: roots sit 1.25 modules inside, leaving clearance.',
  ROOT_HALF: 'Standard look: a tooth is a bit wider than the gap at its base.',
  TIP_HALF: 'The widest a tip can be and still mesh with its neighbor.',
  GEAR_SPAN: 'Gears reach a little past the name, so it sits on the machine.',
  GEAR_HEIGHT: 'Layout margin so no gear leaves the screen.',
  TICK_COST: 'About 25 ticks per full wind: enough to build a short name once.',
  WIND_GAIN: 'One or two sweeps of the cursor wind the spring fully.',
  BUILD_PER_TICK: 'Four ticks per letter at speed 1: visibly one tick at a time.',
  TICK_EASE: 'A quick snap per tick, like a real escapement, without a jump.',
  SCATTER: 'About 70°: far enough to read as unbuilt, close enough to stay on screen.',
  LETTER_FADE: 'Unbuilt letters stay visible as a hint of the name.',
  BACKLASH_TOOTH: 'Keeps a loose gear near mesh, so the teeth never visibly pass through.',
  WOBBLE_K: 'A short, quick wobble that settles before the next tick at normal rates.',
  WOBBLE_DAMP: 'A short, quick wobble that settles before the next tick at normal rates.',
  ANCHOR_DIST: 'Puts the escapement just above the driven gear’s teeth.',
  PALLET: 'Proportions of the escapement anchor drawing.',
  SPIRAL_MIN: 'A visible spiral even when the spring is run down.',
  SPIRAL_TURNS: 'A wound spring looks clearly tighter than a slack one.',
  SPIRAL_SHARE: 'Keeps the spiral inside the driven gear’s face.',
  SPIRAL_STEPS: 'Enough points for a smooth spiral at any size.',
  GEAR_ALPHA: 'The gears are background to the name, which is drawn on top.',
  LINE: 'Hairline detail that reads at every screen size.',
  HALF_TURN: 'Unit conversion from degrees to radians.',
};
