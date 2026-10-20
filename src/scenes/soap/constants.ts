// Fixed values in `soap` that are not sliders, each with its reason (PRD §8.5, §8.8).

export const FIXED = {
  /** The film grid is this many cells wide at full quality (cells are square). */
  COLS: 180,
  /** The wire and film mask is drawn at this share of the screen size (a crisp edge needs more than the grid). */
  MASK_SCALE: 0.75,
  /** Size of the name, as a share of the height. */
  TEXT_SIZE: 0.36,
  /** The name is never wider than this share of the screen. */
  TEXT_FIT: 0.9,
  /** Average letter width as a share of the font size. */
  TEXT_EM: 0.6,
  /** Font weight of the name (heavy, so each letter's opening is big enough to hold a film). */
  TEXT_WEIGHT: 900,
  /** The film is thickest at this many nm above the thickness setting at the wire (the meniscus). */
  EDGE_THICK: 220,
  /** The meniscus fades over this many cells from the wire. */
  EDGE_CELLS: 2.5,
  /** A fresh film is this share thinner at the top of a letter and this share thicker at the bottom. */
  INIT_TILT: 0.15,
  /** Random patches in a fresh film vary its thickness by this share. */
  INIT_NOISE: 0.12,
  /** The patches in a fresh film repeat every this many cells. */
  INIT_CELLS: 5,
  /** The thickest film the data texture can hold, in nm. */
  THICK_MAX: 1500,
  /** The thickness a fresh film's drainage is measured against, in nm. */
  H_REF: 600,
  /** Drainage: nm per second lost to the cell below at H_REF thickness and drainage 1 (flux grows with thickness squared). */
  DRAIN_RATE: 90,
  /** The film never drains thinner than this, in nm (the black film). */
  H_BLACK: 18,
  /** A letter's film breaks by itself when its average thickness falls below this, in nm. */
  H_BREAK: 55,
  /** Swirl: the three drifting waves (wavelength in cells, direction in degrees, drift in radians per second, phase in radians). */
  SWIRL_WAVES: [
    [38, 20, 0.6, 0.4],
    [24, 115, 0.45, 2.1],
    [17, 205, 0.35, 4.3],
  ],
  /** How fast the swirl carries the film at swirl 1, in cells per second. */
  SWIRL_SPEED: 4,
  /** Breath: how strongly the breath pushes film outward and around, in cells per second at breath 1. */
  BREATH_FLOW: 28,
  /** How quickly the film bulges toward a breath (seconds). */
  BULGE_TAU: 0.25,
  /** The most the film bulges under a full breath (as a share of full normal tilt). */
  BULGE_MAX: 1,
  /** A stroke at this speed (px per second) blows at full strength; slower breath is lighter. */
  SPEED_REF: 600,
  /** Even a still breath blows at this share of full strength. */
  HOLD: 0.35,
  /** Pressure builds this fast per second at breath 1 and full strength under the cursor. */
  PRESS_RATE: 6,
  /** A letter under at least this share of the breath's area takes the full pressure. */
  PRESS_FULL: 0.4,
  /** Pressure fades at this rate per second. */
  PRESS_DECAY: 1,
  /** A letter pops when its pressure passes this ÷ the pop sensitivity (never at sensitivity 0). */
  POP_BASE: 0.9,
  /** Droplets thrown by one pop. */
  POP_DROPS: 12,
  /** The most droplets alive at once (the shader draws this many). */
  MAX_DROPS: 32,
  /** Droplets fall at this acceleration (px per second squared) and wobble at this rate (radians per second). */
  DROP_GRAVITY: 900,
  DROP_WOBBLE: 11,
  /** Droplets are thrown at up to this speed (px per second). */
  DROP_THROW: 260,
  /** A droplet lives this many seconds, fading over the last share of it. */
  DROP_LIFE: 1.4,
  DROP_FADE: 0.3,
  /** A droplet's radius is the droplet size × this much plus a random share of this much more. */
  DROP_SIZE_MIN: 0.6,
  DROP_SIZE_SPAN: 0.8,
  /** How much a droplet's radius wobbles (share of its radius). */
  DROP_WOBBLE_AMOUNT: 0.12,
  /** A popped letter waits this long before a new film starts to slide across (seconds). */
  REGROW_DELAY: 0.7,
  /** Seed of the noise that patches fresh films. */
  NOISE_SEED: 11,
  /** Bulge slope: how steeply a full bulge tilts the film, as a surface slope. */
  BULGE_SLOPE: 1.4,
  /** A guard against dividing by zero. */
  EPS: 0.000001,
  /** The wavelengths summed to turn interference into color, in nm: from, to, and how many (at full quality; phone uses half). */
  LAMBDA: [400, 700, 12],
  /** CIE 1931 color matching functions, Wyman et al. 2013 multi-lobe fit: per function, per lobe, [weight, center nm, left width, right width]. */
  CMF_X: [
    [1.056, 599.8, 37.9, 31.0],
    [0.362, 442.0, 16.0, 26.7],
    [-0.065, 501.1, 20.4, 26.2],
  ],
  CMF_Y: [
    [0.821, 568.8, 46.9, 40.5],
    [0.286, 530.9, 16.3, 31.1],
  ],
  CMF_Z: [
    [1.217, 437.0, 11.8, 36.0],
    [0.681, 459.0, 26.0, 13.8],
  ],
  /** XYZ to linear sRGB (D65), row by row. */
  XYZ_TO_RGB: [
    [3.2406, -1.5372, -0.4986],
    [-0.9689, 1.8758, 0.0415],
    [0.0557, -0.204, 1.057],
  ],
  /** The eye is this far in front of the film (in screen heights), so the view angle changes across the film. */
  EYE_DIST: 1.4,
  /** The window has a cross of dark bars this wide (in reflection-direction units). */
  MULLION: 0.025,
  /** CIE Y integrates to this over the visible range with 1 nm steps (normalizes the color sum). */
  Y_NORM: 106.86,
  /** Droplet glint sharpness, and how much a droplet darkens what is behind it. */
  DROP_GLINT_POWER: 30,
  DROP_SHADE: 0.3,
  /** Brightness of the window the film mirrors the film mirrors, of the dim room around it, and the window's size and edge softness (in reflection-direction units). */
  WINDOW_LIGHT: 9,
  ROOM_LIGHT: 0.25,
  WINDOW_SIZE: [0.55, 0.32],
  WINDOW_SOFT: 0.14,
  /** How far the window sits from the straight-on mirror direction, in reflection-direction units. */
  WINDOW_OFFSET: 0.14,
  /** How strongly the film's reflection is added to the dark scene behind it. */
  FILM_GAIN: 0.85,
  /** Tone mapping: 1 − e^(−x × this). */
  TONE: 1.1,
  /** Dim light on the black film so it stays a deep gray rather than vanishing. */
  BLACK_FILM: 0.006,
  /** The scene behind the film: how much darker than the ground color, and how much it darkens at the corners. */
  BACK_DEPTH: 0.5,
  VIGNETTE: 0.45,
  /** Wire: its color is the ground this far toward the text color, its highlight strength and sharpness. */
  WIRE_MIX: 0.3,
  WIRE_SPEC: 0.9,
  WIRE_POWER: 24,
  /** Wire edge normal strength (how round the wire looks). */
  WIRE_ROUND: 3,
  /** Droplet rim brightness and sharpness, and the glint's strength. */
  DROP_RIM: 0.7,
  DROP_RIM_POWER: 4,
  DROP_GLINT: 1.3,
  /** The no-WebGL fallback colors each letter dark at the top, then the first and second accent at these heights, then the third. */
  FALLBACK_STOPS: [0.35, 0.65],
  /** Gamma for converting between sRGB colors and light. */
  GAMMA: 2.2,
  BYTE: 255,
  HALF_TURN: 180,
  /** Dither added before the 8-bit output, to hide banding in smooth color (share of one step). */
  DITHER: 1,
  /** The reduced-motion still frame: how many seconds of drainage to pretend, and where one breath bulges (share of width, height). */
  STILL_AGE: 14,
  STILL_BREATH: [0.62, 0.55],
  STILL_STEP: 0.1,
  /** Governor: smoothed frame time above this (seconds) for this many seconds in a row drops a quality tier. */
  SLOW_SECONDS: 0.03,
  SLOW_AFTER: 1.5,
  SLOW_SMOOTHING: 0.1,
} as const;

export const FIXED_REASONS: Record<keyof typeof FIXED, string> = {
  COLS: 'A film grid this fine looks smooth and costs little to simulate.',
  MASK_SCALE: 'A crisp wire edge needs more resolution than the film grid.',
  TEXT_SIZE: 'Size of the name, as a share of the height.',
  TEXT_FIT: 'Keeps the name inside the screen.',
  TEXT_EM: 'A rough letter width used to fit the name without measuring it.',
  TEXT_WEIGHT: 'A heavy weight, so every letter has a big enough opening for a film.',
  EDGE_THICK: 'Real films are thicker where they meet the wire (a meniscus).',
  EDGE_CELLS: 'How far the meniscus reaches into the film.',
  INIT_TILT: 'A freshly dipped film is already a little thicker at the bottom.',
  INIT_NOISE: 'Real films are never perfectly even.',
  INIT_CELLS: 'The size of the uneven patches in a fresh film.',
  THICK_MAX: 'The thickest film the 8-bit data texture can store.',
  H_REF: 'The thickness drainage is measured against.',
  DRAIN_RATE: 'How fast a film drains: a few seconds show a change, a minute shows a black top.',
  H_BLACK: 'A film this thin is black; it cannot get thinner in the model.',
  H_BREAK: 'Real films break when they get too thin.',
  SWIRL_WAVES: 'Three drifting waves make the film flow in slow swirls.',
  SWIRL_SPEED: 'How fast the swirl moves the film.',
  BREATH_FLOW: 'How hard a breath pushes the film.',
  BULGE_TAU: 'A film bulges quickly but not instantly.',
  BULGE_MAX: 'The film cannot bulge more than a full tilt.',
  SPEED_REF: 'A comfortable fast breath; slower ones blow less.',
  HOLD: 'Even a still breath pushes the film a little.',
  PRESS_RATE: 'How fast blowing builds pressure on a letter.',
  PRESS_FULL: 'A breath that is mostly over one letter presses on it fully.',
  PRESS_DECAY: 'Pressure fades when you stop blowing.',
  POP_BASE: 'The pressure a letter can take, before dividing by the pop sensitivity.',
  POP_DROPS: 'A pop throws a handful of droplets.',
  MAX_DROPS: 'A limit so the shader loop stays small.',
  DROP_GRAVITY: 'Droplets fall like water.',
  DROP_WOBBLE: 'Droplets wobble as they fall.',
  DROP_THROW: 'How fast a pop throws its droplets.',
  DROP_LIFE: 'Droplets disappear after a moment.',
  DROP_FADE: 'Droplets fade out at the end of their life.',
  DROP_SIZE_MIN: 'Droplets vary in size.',
  DROP_SIZE_SPAN: 'Droplets vary in size.',
  DROP_WOBBLE_AMOUNT: 'A falling droplet wobbles a little.',
  REGROW_DELAY: 'A short pause before a new film slides across.',
  NOISE_SEED: 'A fixed seed so the film looks the same on every visit and in every test.',
  BULGE_SLOPE: 'How steeply a full bulge tilts the film, which shifts its colors and reflection.',
  EPS: 'A divide-by-zero guard.',
  LAMBDA: 'The wavelengths of visible light that are summed to make the film’s color.',
  CMF_X: 'The CIE 1931 color matching function for X (published multi-lobe fit).',
  CMF_Y: 'The CIE 1931 color matching function for Y (published multi-lobe fit).',
  CMF_Z: 'The CIE 1931 color matching function for Z (published multi-lobe fit).',
  XYZ_TO_RGB: 'The standard matrix from CIE XYZ to linear sRGB.',
  EYE_DIST:
    'The viewing angle changes across a big film, which shifts its colors, like a real one.',
  MULLION: 'A window has a cross of dark frame bars.',
  Y_NORM: 'Normalizes the sum of wavelengths into a brightness.',
  DROP_GLINT_POWER: 'How tight a droplet’s glint is.',
  DROP_SHADE: 'A droplet darkens what is behind it a little.',
  WINDOW_LIGHT: 'A bright window is what a soap film mostly reflects.',
  ROOM_LIGHT: 'The dim room around the window.',
  WINDOW_SIZE: 'The size of the window.',
  WINDOW_SOFT: 'A soft window edge.',
  WINDOW_OFFSET: 'Where the window sits in the reflection.',
  FILM_GAIN: 'How bright the film’s reflection is against the dark scene.',
  TONE: 'Tone mapping keeps bright reflections from clipping.',
  BLACK_FILM: 'A thin film still reflects a very little light.',
  BACK_DEPTH: 'The scene behind the film is dark.',
  VIGNETTE: 'A soft darkening toward the corners.',
  WIRE_MIX: 'The wire is a dark metal tinted by the text color.',
  WIRE_SPEC: 'How bright the wire’s highlight is.',
  WIRE_POWER: 'How tight the wire’s highlight is.',
  WIRE_ROUND: 'How round the wire looks.',
  DROP_RIM: 'Water droplets have a bright rim.',
  DROP_RIM_POWER: 'How thin that rim is.',
  DROP_GLINT: 'Droplets glint where they mirror the window.',
  FALLBACK_STOPS: 'Where the fallback gradient changes color.',
  GAMMA: 'Standard sRGB gamma: shading is done in linear light.',
  BYTE: 'Unit conversion: texture bytes run 0 to 255.',
  HALF_TURN: 'Unit conversion from degrees to radians.',
  DITHER: 'Hides banding in smooth color.',
  STILL_AGE:
    'The reduced-motion still frame shows a film that has drained for a while (SCENES.md #56).',
  STILL_BREATH: 'The still frame shows one breath bulging the film.',
  STILL_STEP: 'The pretend frame time of the scripted still frame.',
  SLOW_SECONDS: 'Frames slower than this mean the device is struggling.',
  SLOW_AFTER: 'A stretch of slow frames, so one hitch never drops the quality.',
  SLOW_SMOOTHING: 'How quickly the frame-time average follows new frames.',
};
