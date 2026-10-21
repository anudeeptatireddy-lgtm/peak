// Fixed values in `peekaboo` that are not sliders, each with its reason.

export const FIXED = {
  /** Height of a capital as a share of the font size. */
  CAP: 0.72,
  /** The letters' baseline sits at this share of the height, leaving room to peek over. */
  BASELINE: 0.62,
  /** Spring damping is DAMP_MIN + bounce × DAMP_RANGE per frame. */
  DAMP_MIN: 0.62,
  DAMP_RANGE: 0.3,
  /** A head never gets wider than this share of its letter's width, so it can hide. */
  HIDE_FIT: 0.42,
  /** Peeking over the top, the head's center rises this many radii above the letter. */
  PEEK_TOP: 0.35,
  /** Peeking at a side, the head's center sits this many radii past the letter's edge. */
  PEEK_SIDE: 0.45,
  /** This share of the animals prefer peeking over the top; the rest peek round a side. */
  TOP_SHARE: 0.5,
  /** Eyes: radius, spacing and height as shares of the head radius. */
  EYE_R: 0.24,
  EYE_GAP: 0.4,
  EYE_Y: -0.05,
  /** Pupils are this share of the eye and travel this share of it toward what they look at. */
  PUPIL: 0.5,
  PUPIL_TRAVEL: 0.45,
  /** Nose and cheeks as shares of the head radius (high quality only). */
  NOSE: 0.1,
  CHEEK: 0.14,
  /** Nose height, and cheek spread and height, as shares of the head radius. */
  NOSE_Y: 0.22,
  CHEEK_X: 0.55,
  CHEEK_Y: 0.28,
  /** Cheeks are drawn at this opacity. */
  CHEEK_ALPHA: 0.5,
  /** Ears sit this many radii above the head's center; long ears this much higher. */
  EAR_Y: 0.8,
  EAR_LONG: 1.35,
  /** Ears: size and spread as shares of the head radius. */
  EAR: 0.42,
  EAR_GAP: 0.62,
  /** Squash per px/frame of speed, and its limit either way. */
  SQUASH_GAIN: 0.05,
  SQUASH_MAX: 0.35,
  /** Each animal's timing varies by up to this share either way, so none move in sync. */
  TIMING_SPREAD: 0.4,
  /** Each animal's spring stiffness varies by up to this share either way. */
  STIFF_SPREAD: 0.3,
  /** The idle point loops the stage every this many seconds… */
  IDLE_PERIOD: 9,
  /** …its up-and-down wave running this many times faster. */
  IDLE_RATIO: 1.7,
  /** The idle point's path reaches this share of the stage from the center. */
  IDLE_REACH: 0.42,
  /** A tap counts as a nearby cursor for this many seconds. */
  TAP_HOLD: 1.5,
  /** Letters keep at least this contrast with the background (large text). */
  CONTRAST: 3,
  /** Phone tilt (degrees) that counts as looking all the way to one side. */
  GYRO_RANGE: 30,
  /** Phone pitch (degrees) held in a hand at rest, so leaning is measured from there. */
  GYRO_REST: 45,
  /** Height of the "Use motion" button in rem: a comfortable touch target. */
  BUTTON_HEIGHT: 2.75,
  /** Gap between the "Use motion" button and the bottom of the section, in rem. */
  BUTTON_BOTTOM: 1.5,
  /** Side padding of the "Use motion" button in rem. */
  BUTTON_PAD: 1.25,
  /** Corner radius of the "Use motion" button: any value this large makes a pill. */
  PILL: 999,
  /** Seed for each animal's kind, timing and color. */
  SEED: 86,
} as const;

export const FIXED_REASONS: Record<keyof typeof FIXED, string> = {
  CAP: 'Fallback letter height when the browser does not report one.',
  BASELINE: 'Layout: room above the letters for heads peeking over.',
  DAMP_MIN: 'Bounce 0 settles without overshoot.',
  DAMP_RANGE: 'Bounce 1 overshoots twice, cartoon-style, but still settles.',
  HIDE_FIT: 'A ducked head must fit behind its letter, even a narrow one.',
  PEEK_TOP: 'Eyes clear the top of the letter while the chin stays hidden.',
  PEEK_SIDE: 'One eye and an ear show round the letter’s edge.',
  TOP_SHARE: 'A mix of peeking over and round, so the letters feel lively.',
  EYE_R: 'Character design: big friendly eyes.',
  EYE_GAP: 'Character design: eyes set apart like a cute animal.',
  EYE_Y: 'Character design: eyes just above the middle of the face.',
  PUPIL: 'Character design: large pupils read as looking somewhere.',
  PUPIL_TRAVEL: 'Pupils move far enough to show direction but stay inside the eye.',
  NOSE: 'Character design: a small nose.',
  CHEEK: 'Character design: small rosy cheeks.',
  NOSE_Y: 'Character design: nose just below the eyes.',
  CHEEK_X: 'Character design: cheeks under the eyes.',
  CHEEK_Y: 'Character design: cheeks under the eyes.',
  CHEEK_ALPHA: 'Character design: a soft blush, not a spot.',
  EAR_Y: 'Character design: ears on top of the head.',
  EAR_LONG: 'Character design: long ears stand taller than round ones.',
  EAR: 'Character design: ears big enough to read the animal’s kind.',
  EAR_GAP: 'Character design: ears on the top corners of the head.',
  SQUASH_GAIN: 'Squash and stretch visible on a quick duck, subtle when slow.',
  SQUASH_MAX: 'Keeps the squash cartoony, never broken.',
  TIMING_SPREAD: 'SCENES.md #86: each animal has its own timing.',
  STIFF_SPREAD: 'SCENES.md #86: each animal has its own timing.',
  IDLE_PERIOD: 'A slow wander, so the animals have time to duck and peek.',
  IDLE_RATIO: 'A looping path that never repeats exactly.',
  IDLE_REACH: 'The idle point passes over most letters.',
  TAP_HOLD: 'Long enough for a tap to make nearby animals hide.',
  CONTRAST: 'Text contrast rule for large text (WCAG AA).',
  GYRO_RANGE: 'A comfortable full lean of a phone; the browser reports tilt in degrees.',
  GYRO_REST: 'The pitch of a phone held to read; leaning is measured from it.',
  BUTTON_HEIGHT: 'At least 44px tall, the touch-target minimum (PRD §8.3).',
  BUTTON_BOTTOM: 'Layout gap so the button clears the screen edge.',
  BUTTON_PAD: 'Comfortable side padding for a touch button.',
  PILL: 'Any radius this large gives a pill shape.',
  SEED: 'The same animals every visit, so the scene and its prompt match.',
};
