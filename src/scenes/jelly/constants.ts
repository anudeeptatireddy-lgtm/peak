// Fixed values in `jelly` that are not sliders, each with its reason.

export const FIXED = {
  /** Most cards on the stage. */
  MAX_CARDS: 6,
  /** Longest label, in characters. */
  MAX_LABEL: 16,
  /** Fewest cards shown even if the field is cleared. */
  FALLBACK: 'Drag me',
  /** Space between resting cards as a share of the card width. */
  SPACING: 1.15,
  /** The fan angle between neighbouring cards in the still frame and at the start, in degrees. */
  FAN: 5,
  /** How much a moving card leans per px of speed per frame, in degrees (scaled by Wobble). */
  LEAN_GAIN: 2.5,
  /** The most a card can lean from moving, in degrees. */
  MAX_LEAN: 30,
  /** How much a moving card stretches per px of speed per frame (scaled by Wobble). */
  STRETCH_GAIN: 0.01,
  /** The most a card can stretch from moving. */
  MAX_STRETCH: 0.25,
  /** A jiggle also tips the card by this many degrees (scaled by Wobble), left or right at random. */
  JIGGLE_TILT: 12,
  /** A press that moves less than this (px) is a tap, not a drag. */
  DRAG_SLOP: 6,
  /** When squashed, a card gets this share of the squash wider as it gets shorter. */
  SPREAD: 0.5,
  /** Border thickness of a card, in px. */
  BORDER: 3,
  /** Corner radius of a card, in px. */
  RADIUS: 20,
  /** Font weight of the card label. */
  WEIGHT: 800,
} as const;

export const FIXED_REASONS: Record<keyof typeof FIXED, string> = {
  MAX_CARDS: 'More than six cards would not fit a phone.',
  MAX_LABEL: 'Longer labels would not fit a card.',
  FALLBACK: 'One label so there is always a card.',
  SPACING: 'Layout of the resting row.',
  FAN: 'The slight fan of the resting cards (SCENES.md #49).',
  LEAN_GAIN: 'How much speed becomes lean; scaled by the Wobble setting.',
  MAX_LEAN: 'Stops a fast drag from tipping a card over.',
  STRETCH_GAIN: 'How much speed becomes stretch; scaled by the Wobble setting.',
  MAX_STRETCH: 'Stops a fast drag from stretching a card too far.',
  JIGGLE_TILT: 'The sideways tip a tap adds to the jiggle.',
  DRAG_SLOP: 'A small slip of the finger should still count as a tap.',
  SPREAD: 'Squashed jelly gets wider as it gets shorter.',
  BORDER: 'Style of the card outline.',
  RADIUS: 'Style of the card corners.',
  WEIGHT: 'Typography of the card label.',
};
