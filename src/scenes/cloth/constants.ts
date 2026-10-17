// Fixed values in `cloth` that are not sliders, each with its reason.

export const FIXED = {
  /** "Every 4th" pin option: pin every this-many top-row points. */
  PIN_EVERY: 4,
  /** The sheet always has at least this many rows of points. */
  MIN_ROWS: 2,
  /** Two clicks this close in time (seconds) are a double-click. */
  DOUBLE_TAP_S: 0.35,
  /** …and this close in space (px); a press that moved farther is a drag, not a click. */
  DOUBLE_TAP_PX: 30,
  /** Frames of physics run before drawing the reduced-motion still frame. */
  STILL_FRAMES: 240,
} as const;

export const FIXED_REASONS: Record<keyof typeof FIXED, string> = {
  PIN_EVERY: 'Names the "every 4th" option of the Pinned setting; the other options are every point and corners only.',
  MIN_ROWS: 'A sheet needs two rows to hang; "Sheet height" sets the real size.',
  DOUBLE_TAP_S: 'The usual double-click window; longer catches two separate tugs.',
  DOUBLE_TAP_PX: 'Tells a click from a tug; any small value works.',
  STILL_FRAMES: 'Long enough for the sheet to settle into its hanging curve for the still frame.',
};
