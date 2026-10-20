// Fixed values in `velvet` that are not sliders, each with its reason (PRD §8.5, §8.8).

export const FIXED = {
  /** The fiber field is this many cells wide at full quality (cells are square). */
  COLS: 220,
  /** Direction the pile lies at rest, in degrees (0 = right, 90 = down on the screen). */
  REST_ANGLE: 100,
  /** How far the fibers lean at rest, 0 (standing up) to 1 (lying flat). */
  REST_LEAN: 0.7,
  /** How far a brushed fiber leans. */
  BRUSH_LEAN: 1,
  /** Share of the way a fiber turns toward the stroke each frame under the brush's center, at full speed. */
  BRUSH_RATE: 0.6,
  /** A stroke at this speed (px per second) brushes at full strength; slower strokes are lighter. */
  SPEED_REF: 800,
  /** Brush stamps are placed this share of the brush radius apart along a stroke. */
  STEP_FRAC: 0.35,
  /** How quickly fast strokes press a dent into the pile, per frame at full speed. */
  DENT_RATE: 0.5,
  /** Relaxing takes this many time constants over the relax time (e^-3 leaves 5% of the change). */
  RELAX_K: 3,
  /** The crushed-pile variation repeats every this many cells. */
  CRUSH_CELLS: 9,
  /** The most the crush turns the rest direction, in degrees. */
  CRUSH_TURN: 70,
  /** The most the crush changes how far fibers lean at rest (share of REST_LEAN). */
  CRUSH_LEAN: 0.4,
  /** Size of the name, as a share of the height. */
  TEXT_SIZE: 0.32,
  /** The name is never wider than this share of the screen. */
  TEXT_FIT: 0.9,
  /** Average letter width as a share of the font size. */
  TEXT_EM: 0.6,
  /** Font weight of the name (it only sets where the pile lies the other way). */
  TEXT_WEIGHT: 900,
  /** How strongly a fiber's lean tilts the surface it shades. */
  TILT_GAIN: 2.2,
  /** Wrap lighting: light wraps this far around the fibers (velvet never goes fully dark). */
  WRAP: 0.5,
  /** Rim sheen: brightness where fibers lie flat and are seen from the side. */
  RIM_POWER: 2.5,
  RIM_WEIGHT: 0.6,
  /** Strength of the fiber-direction highlight (Kajiya-Kay). */
  KK_WEIGHT: 1,
  /** How much each fiber's own brightness varies at full fiber strength. */
  FIBER_LUM: 0.5,
  /** Share of fibers that catch the light as a bright speck, and how bright. */
  SPARKLE_RATE: 0.997,
  SPARKLE_GAIN: 1.2,
  /** How dark a full dent is. */
  DENT_DARK: 0.45,
  /** How much a full dent also dims the sheen. */
  DENT_SHEEN: 0.5,
  /** Lamp falloff: the far side of the screen from the lamp is this much darker. */
  FALLOFF: 0.3,
  /** The body color is the first accent at this share of its brightness. */
  BODY_DEPTH: 0.3,
  /** The sheen color is the first accent this share of the way to white. */
  SHEEN_LIFT: 0.18,
  /** How far a fiber's own random turn goes at full fiber strength, in radians. */
  FIBER_TURN: 1.2,
  /** How far the crush turns the pile in the shading, in radians, at full crush. */
  CRUSH_SHADE_TURN: 1,
  /** One crush patch spans this many fibers. */
  CRUSH_SCALE: 22,
  /** How strongly lean tilts the fiber direction used for the highlight. */
  TANGENT_GAIN: 3,
  /** The fiber highlight fades out where the surface faces away from the lamp (offset on N·L). */
  KK_GATE: 0.4,
  /** One big crush fold spans this many CSS pixels. */
  CRUSH_SIZE: 220,
  /** How steeply the big folds tilt the surface at full crush. */
  CRUSH_RELIEF: 0.5,
  /** Step used to measure the folds' slope, in noise units. */
  CRUSH_EPS: 0.02,
  /** The four fold waves: direction angle (degrees), frequency (radians per crush size) and phase (radians). */
  WAVES: [
    [0, 4.5, 0.3],
    [58, 7, 1.9],
    [112, 5.5, 3.4],
    [157, 9, 5.2],
  ],
  /** Each wave counts this much of the fold height. */
  WAVE_WEIGHT: 0.25,
  /** Noise bends the waves by this many crush sizes, so creases wander. */
  WARP: 1.2,
  /** Satin highlight on fold crests: the sharpness and how strong it is. */
  SATIN_POW: 10,
  SATIN_WEIGHT: 0.9,
  /** Fibers lying this flat show the full sheen; upright ones show only the floor share of it. */
  LEAN_REF: 0.7,
  SHEEN_FLOOR: 0.25,
  /** Exposure before the gamma curve. */
  EXPOSURE: 1,
  /** Gamma for converting between sRGB colors and light. */
  GAMMA: 2.2,
  /** Degrees in half a turn, and the two byte limits used to pack the field. */
  HALF_TURN: 180,
  BYTE: 255,
  /** The reduced-motion still frame: one broad swoop through these points (share of width, share of height). */
  STILL_SWOOP: [
    [0.12, 0.78],
    [0.38, 0.3],
    [0.66, 0.66],
    [0.92, 0.24],
  ],
  /** Speed of the scripted swoop (px per second), well above full strength. */
  STILL_SPEED: 1600,
  /** A guard against dividing by zero (a zero relax time, a zero-length stroke). */
  EPS: 0.000001,
  /** Seed of the noise that crushes the resting pile, so the cloth looks the same every time. */
  NOISE_SEED: 7,
  /** Frame time the scripted swoop pretends to take. */
  STILL_DT: 0.016,
  /** Governor: smoothed frame time above this (seconds) for this many seconds in a row drops a quality tier. */
  SLOW_SECONDS: 0.03,
  SLOW_AFTER: 1.5,
  SLOW_SMOOTHING: 0.1,
} as const;

export const FIXED_REASONS: Record<keyof typeof FIXED, string> = {
  COLS: 'A fiber grid this fine looks continuous after smoothing and costs little to simulate.',
  REST_ANGLE: 'The direction the pile lies before anyone touches it.',
  REST_LEAN: 'Crushed velvet lies mostly flat, so fibers lean a lot at rest.',
  BRUSH_LEAN: 'A brushed fiber lies fully along the stroke.',
  BRUSH_RATE: 'How fast fibers follow the brush: quick, but not an instant snap.',
  SPEED_REF: 'A comfortable fast stroke; slower ones brush less.',
  STEP_FRAC: 'Stamps close enough together to leave a smooth stroke.',
  DENT_RATE: 'How quickly a fast stroke presses the pile.',
  RELAX_K: 'Turns the relax time into a rate (e^-3 is about 5% left).',
  CRUSH_CELLS: 'Size of the crushed patches of pile.',
  CRUSH_TURN: 'How far crushing turns the pile from place to place.',
  CRUSH_LEAN: 'How much crushing changes how flat the pile lies.',
  TEXT_SIZE: 'Size of the name, as a share of the height.',
  TEXT_FIT: 'Keeps the name inside the screen.',
  TEXT_EM: 'A rough letter width used to fit the name without measuring it.',
  TEXT_WEIGHT: 'A heavy weight, so the name has broad areas of reversed pile.',
  TILT_GAIN: 'How strongly the lean of the fibers tilts the shaded surface.',
  WRAP: 'Real velvet scatters light into shadows, so light wraps around it.',
  RIM_POWER: 'Fresnel-style rim: fibers seen edge-on look brighter.',
  RIM_WEIGHT: 'How much the rim adds to the sheen.',
  KK_WEIGHT: 'How much the fiber-direction highlight adds to the sheen.',
  FIBER_LUM: 'Real fibers vary in brightness.',
  SPARKLE_RATE: 'Only a few fibers catch the light as specks.',
  SPARKLE_GAIN: 'How bright those specks are.',
  DENT_DARK: 'A pressed pile reflects less light.',
  DENT_SHEEN: 'A pressed pile also loses sheen.',
  FALLOFF: 'A real lamp lights the near side more than the far side.',
  BODY_DEPTH: 'Velvet is deep and dark in its body color.',
  SHEEN_LIFT: 'The sheen is a lighter tint of the body color.',
  FIBER_TURN: 'Real fibers do not all lie exactly the same way.',
  CRUSH_SHADE_TURN: 'How uneven crushed velvet looks.',
  CRUSH_SCALE: 'The size of crushed patches in the shading.',
  TANGENT_GAIN: 'How much lean tilts the highlight direction.',
  KK_GATE: 'The highlight fades where the cloth faces away from the lamp.',
  CRUSH_SIZE: 'The size of the big soft folds of crushed velvet.',
  CRUSH_RELIEF: 'How steep the folds are.',
  WAVES: 'Four creased waves at different angles make the folds of crushed velvet.',
  WAVE_WEIGHT: 'The four waves share the fold height equally.',
  WARP: 'Noise bends the waves so the creases wander like real crushing.',
  CRUSH_EPS: 'A small step to measure the slope of the folds.',
  SATIN_POW: 'How tight the satin highlight on fold crests is.',
  SATIN_WEIGHT: 'How strong the satin highlight is.',
  LEAN_REF: 'Sheen comes from fibers lying down, so it grows with how flat they lie.',
  SHEEN_FLOOR: 'Even upright fibers show a little sheen.',
  EXPOSURE: 'Overall brightness before the gamma curve.',
  GAMMA: 'Standard sRGB gamma: shading is done in linear light.',
  HALF_TURN: 'Unit conversion from degrees to radians.',
  BYTE: 'Unit conversion: texture bytes run 0 to 255.',
  STILL_SWOOP: 'The reduced-motion still frame shows one broad brushed swoop (SCENES.md #55).',
  STILL_SPEED: 'The scripted swoop is fast enough to brush at full strength.',
  EPS: 'A divide-by-zero guard.',
  NOISE_SEED: 'A fixed seed so the cloth is the same on every visit and in every test.',
  STILL_DT: 'The pretend frame time of the scripted swoop.',
  SLOW_SECONDS: 'Frames slower than this mean the device is struggling.',
  SLOW_AFTER: 'A stretch of slow frames, so one hitch never drops the quality.',
  SLOW_SMOOTHING: 'How quickly the frame-time average follows new frames.',
};
