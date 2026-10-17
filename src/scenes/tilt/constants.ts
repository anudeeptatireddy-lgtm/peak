// Fixed values in `tilt` that are not sliders, each with its reason.

export const FIXED = {
  /** Card width never exceeds this share of the stage width, so it fits phones. */
  MAX_WIDTH_SHARE: 0.82,
  /** Name text size as a share of the card width. */
  NAME_SIZE: 0.085,
  /** Role text size as a share of the card width. */
  ROLE_SIZE: 0.048,
  /** Font weight of the name. */
  NAME_WEIGHT: 800,
  /** Font weight of the role. */
  ROLE_WEIGHT: 500,
  /** Card padding as a share of the card width. */
  PADDING: 0.08,
  /** The foil gradient's repeat: three accents then the first again, evenly spaced. */
  FOIL_STOPS: [0, 33, 66, 100],
  /** How far the glare may sit from the card center, as a share of the card size. */
  GLARE_TRAVEL: 0.5,
  /** Tilt shown by the still frame, in degrees (x then y): a slight angle. */
  STILL_TILT: [5, -9],
  /** Second wander wave runs at this share of the first, so the path never repeats exactly. */
  WANDER_RATIO: 0.8,
  /** Phase offset of the second wander wave, in radians. */
  WANDER_PHASE: 1,
  /** Phone tilt (degrees) that counts as a full lean, either way. */
  GYRO_RANGE: 30,
  /** Phone pitch (degrees) held in a hand at rest, so leaning is measured from there. */
  GYRO_REST: 45,
  /** Blur of the soft shadow under the card, in px. */
  SHADOW_BLUR: 40,
  /** Drop shadow offset as a share of the card width. */
  SHADOW_OFFSET: 0.06,
  /** Drop shadow opacity (of the main text color). */
  SHADOW_ALPHA: 20,
  /** Height of the "Use motion" button in rem: a comfortable touch target. */
  BUTTON_HEIGHT: 2.75,
  /** Gap between the "Use motion" button and the bottom of the section, in rem. */
  BUTTON_BOTTOM: 1.5,
  /** Line height of the name. */
  LINE_HEIGHT: 1.1,
  /** Side padding of the "Use motion" button in rem. */
  BUTTON_PAD: 1.25,
  /** Corner radius of the "Use motion" button: any value this large makes a pill. */
  PILL: 999,
  /** The card is never taller than this share of the stage height, so it fits above a phone's bottom sheet. */
  MAX_HEIGHT_SHARE: 0.6,
} as const;

export const FIXED_REASONS: Record<keyof typeof FIXED, string> = {
  MAX_WIDTH_SHARE: 'Keeps the card inside a phone screen; a layout margin, not a style.',
  NAME_SIZE: 'Typography of the card: the name is the largest text on it.',
  ROLE_SIZE: 'Typography of the card: the role is smaller than the name.',
  NAME_WEIGHT: 'Typography of the card: a heavy name against a lighter role.',
  ROLE_WEIGHT: 'Typography of the card: a lighter role under a heavy name.',
  PADDING: 'Card layout margin so text never touches the edge.',
  FOIL_STOPS: 'Even spacing of the three accents in the foil; geometry of the gradient.',
  GLARE_TRAVEL: 'The glare reaches the card edge at full tilt; geometry of the highlight.',
  STILL_TILT: 'The slight angle of the reduced-motion still frame (SCENES.md #37).',
  WANDER_RATIO: 'A second, slower wave so the idle sway is not a plain circle.',
  WANDER_PHASE: 'Phase offset of that second wave.',
  GYRO_RANGE: 'A comfortable full lean of a phone; the browser reports tilt in degrees.',
  GYRO_REST: 'The pitch of a phone held to read; leaning is measured from it.',
  SHADOW_BLUR: 'Soft shadow under the card that gives it depth; a style constant.',
  SHADOW_OFFSET: 'Shadow offset that gives the card depth; a style constant.',
  SHADOW_ALPHA: 'Shadow strength (percent of the main text color); a style constant.',
  BUTTON_HEIGHT: 'At least 44px tall, the touch-target minimum (PRD §8.3).',
  BUTTON_BOTTOM: 'Layout gap so the button clears the screen edge.',
  LINE_HEIGHT: 'Typography of the card: tight lines for a heavy name.',
  BUTTON_PAD: 'Comfortable side padding for a touch button.',
  PILL: 'Rounds the button fully; any number beyond half its height works.',
  MAX_HEIGHT_SHARE: 'Keeps the whole card visible above the phone bottom sheet; a layout margin.',
};
