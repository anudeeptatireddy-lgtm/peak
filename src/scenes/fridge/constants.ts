// Fixed values in `fridge` that are not sliders, each with its reason.

export const FIXED = {
  /** Two taps closer together than this (seconds) count as a double tap. */
  DOUBLE_TAP: 0.35,
  /** Extra letters are drawn from this alphabet. */
  ALPHABET: 'abcdefghijklmnopqrstuvwxyz',
  /** The shake detector looks at the pointer's last this-many seconds of movement. */
  SHAKE_WINDOW: 0.5,
} as const;

export const FIXED_REASONS: Record<keyof typeof FIXED, string> = {
  DOUBLE_TAP:
    'The usual double-click window on desktops and phones; it only changes how fast you must tap.',
  ALPHABET: 'The pool for the random extra letters; it is the alphabet, not a style choice.',
  SHAKE_WINDOW:
    'How much recent movement counts as one shake; the "Shake speed" and "Shake turns" settings set how hard you must shake.',
};
