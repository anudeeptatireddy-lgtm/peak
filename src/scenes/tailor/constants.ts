// Fixed values in `tailor` that are not sliders, each with its reason.

export const FIXED = {
  /** The sheet is this share of the screen width and height. */
  SHEET_W: 0.9,
  SHEET_H: 0.92,
  /** Cloth grid columns on screens 700px wide or more, and on narrower ones. */
  COLS: 36,
  COLS_SMALL: 20,
  /** Constraint passes per frame (how stiff the cloth holds together). */
  ITER: 8,
  /** The cloth is heavier or lighter by lerping gravity between these (px per frame²)… */
  GRAVITY_LIGHT: 0.25,
  GRAVITY_HEAVY: 0.9,
  /** …and drag (share of speed kept per frame). */
  DRAG_LIGHT: 0.99,
  DRAG_HEAVY: 0.97,
  /** Idle sway: a gentle sideways push (px per frame²) and its pace (radians per second). */
  SWAY: 0.04,
  SWAY_RATE: 1.1,
  /** The sway shifts by this much per grid step (radians), so it ripples across the cloth. */
  SWAY_STEP: 0.2,
  /** Before the chalk line starts, the cloth just hangs for this many seconds. */
  START_DELAY: 0.4,
  /** The wavy cut: height of the wave as a share of the rows, and how many waves cross the sheet. */
  WAVE_AMP: 0.08,
  WAVE_CYCLES: 1.5,
  /** The diagonal cut runs from this share of the rows above the middle to the same below. */
  DIAG: 0.25,
  /** Short snips: the shears advance during the first part of each bite and rest for the rest. */
  BITE_MOVE: 0.6,
  /** At each bite the cloth near the shears bunches: points within this many cells get kicked down by… */
  BUNCH_CELLS: 4,
  /** …this many px. */
  BUNCH: 3,
  /** After the cut finishes, the halves hang together for this long before the top lifts away. */
  HOLD: 0.35,
  /** The top half lifts: its pins rise with this acceleration (px per frame²)… */
  LIFT_ACC: 0.12,
  /** …after starting at this speed (px per frame). */
  LIFT_START: 1,
  /** How far outside the screen a thing may be before it is no longer drawn or simulated. */
  MARGIN: 200,
  /** Chalk dashes and gaps, in px. */
  DASH: 10,
  DASH_GAP: 7,
  /** Chalk line thickness, in px. */
  CHALK: 3,
  /** Shears: blade length in px, and the widest they open (radians). */
  SHEAR_LEN: 70,
  SHEAR_OPEN: 0.4,
  /** Shading levels the fabric is drawn in (one path per level). */
  SHADES: 8,
  /** Pinstripes and checks every this many grid lines. */
  STRIPE_EVERY: 3,
  /** Cursor breeze reach in px. */
  BREEZE_R: 140,
  /** A loose thread has this many points, this far apart (px). */
  THREAD_POINTS: 5,
  THREAD_SEG: 14,
  /** Threads fall with this gravity (px per frame²) and drag. */
  THREAD_G: 0.05,
  THREAD_DRAG: 0.95,
  /** The still frame shows the scene this long after the top starts lifting (seconds). */
  STILL_AFTER: 0.6,
  /** Fabric stripe lines are this much lighter than the cloth, as a mix with the background color. */
  STRIPE_MIX: 0.35,
  /** Opacity of the chalk line. */
  CHALK_ALPHA: 0.9,
  /** Size of the name behind the cloth, as a share of the height, and its fit. */
  TEXT_SIZE: 0.3,
  TEXT_FIT: 0.9,
  TEXT_EM: 0.75,
  TEXT_WEIGHT: 900,
} as const;

export const FIXED_REASONS: Record<keyof typeof FIXED, string> = {
  SHEET_W: 'The sheet nearly fills the screen.',
  SHEET_H: 'The sheet nearly fills the screen.',
  COLS: 'Enough cloth points to fold smoothly, few enough to stay fast.',
  COLS_SMALL: 'Fewer points keep phones smooth.',
  ITER: 'How stiff the cloth is: more passes hold it together better.',
  GRAVITY_LIGHT: 'Silk end of the Fabric weight slider.',
  GRAVITY_HEAVY: 'Wool end of the Fabric weight slider.',
  DRAG_LIGHT: 'Silk end of the Fabric weight slider.',
  DRAG_HEAVY: 'Wool end of the Fabric weight slider.',
  SWAY: 'A gentle idle sway so the hanging cloth is alive.',
  SWAY_RATE: 'Pace of that sway.',
  SWAY_STEP: 'Makes the sway ripple across the cloth.',
  START_DELAY: 'A short beat before the chalk line starts.',
  WAVE_AMP: 'Shape of the wavy cut.',
  WAVE_CYCLES: 'Shape of the wavy cut.',
  DIAG: 'Shape of the diagonal cut.',
  BITE_MOVE: 'Shape of the snipping rhythm.',
  BUNCH_CELLS: 'How far the cloth bunches at each snip.',
  BUNCH: 'How hard the cloth bunches at each snip.',
  HOLD: 'A beat after the last snip before the halves part.',
  LIFT_ACC: 'How quickly the top half lifts away.',
  LIFT_START: 'How quickly the top half lifts away.',
  MARGIN: 'Things further off screen than this are dropped.',
  DASH: 'Style of the chalk line.',
  DASH_GAP: 'Style of the chalk line.',
  CHALK: 'Style of the chalk line.',
  SHEAR_LEN: 'Size of the drawn shears.',
  SHEAR_OPEN: 'How wide the shears open.',
  SHADES: 'Fabric shading is drawn in this many steps (one fill per step).',
  STRIPE_EVERY: 'Spacing of pinstripes and checks.',
  BREEZE_R: 'How far the cursor breeze reaches.',
  THREAD_POINTS: 'Each loose thread is a short chain.',
  THREAD_SEG: 'Each loose thread is a short chain.',
  THREAD_G: 'Threads drift down slowly.',
  THREAD_DRAG: 'Threads drift down slowly.',
  STILL_AFTER: 'The still frame is the halves mid-fall.',
  STRIPE_MIX: 'Style of the pattern lines.',
  CHALK_ALPHA: 'Style of the chalk line.',
  TEXT_SIZE: 'Typography of the name behind the cloth.',
  TEXT_FIT: 'Keeps the name inside the screen.',
  TEXT_EM: 'A rough letter width used to fit the name.',
  TEXT_WEIGHT: 'Typography of the name behind the cloth.',
};
