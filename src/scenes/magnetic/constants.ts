// Fixed values in `magnetic` that are not sliders, each with its reason.

export const FIXED = {
  /** Most buttons in the row. */
  MAX_BUTTONS: 4,
  /** Longest label, in characters. */
  MAX_LABEL: 16,
  /** Buttons are at least this tall (rem): a comfortable touch target. */
  MIN_HEIGHT: 2.75,
  /** When pressed, a button gets this share of the squish wider as it gets shorter (it spreads). */
  SQUISH_SPREAD: 0.5,
  /** Border thickness of the outlined buttons, in px. */
  BORDER: 2,
  /** Labels shown when the visitor clears the field. */
  FALLBACK: 'Start',
  /** Font weight of the labels. */
  WEIGHT: 700,
  /** Padding above and below the label, and to its sides, in em. */
  PAD_Y: 0.9,
  PAD_X: 1.6,
} as const;

export const FIXED_REASONS: Record<keyof typeof FIXED, string> = {
  MAX_BUTTONS: 'A row of more than four buttons would not fit a phone.',
  MAX_LABEL: 'Longer labels would not fit the button row.',
  MIN_HEIGHT: 'At least 44px tall, the touch-target minimum (PRD §8.3).',
  SQUISH_SPREAD: 'Pressed rubber gets wider as it gets shorter.',
  BORDER: 'A clear outline for the secondary buttons.',
  FALLBACK: 'One label so the row is never empty.',
  WEIGHT: 'Typography of the buttons: bold labels.',
  PAD_Y: 'Comfortable vertical padding for a button.',
  PAD_X: 'Comfortable side padding for a button.',
};
