// Fixed values in `countdown` that are not sliders, each with its reason.

export const FIXED = {
  /** The default target is this many days after the page loads (so the default never goes stale). */
  DEFAULT_DAYS: 7,
  /** Milliseconds in a second, minute, hour and day, for splitting the time left. */
  SECOND: 1000,
  MINUTE: 60,
  HOUR: 60,
  DAY: 24,
  /** Days always show at least this many digits; every other unit shows exactly 2. */
  MIN_DAY_DIGITS: 2,
  /** A digit card is this wide, as a multiple of its font size… */
  CARD_W: 0.8,
  /** …and this tall. */
  CARD_H: 1.25,
  /** Space between the two digits of a unit, in em. */
  PAIR_GAP: 0.08,
  /** Space between units, as a multiple of the digit gap setting. */
  UNIT_GAP: 2,
  /** Corner radius of a card, in em. */
  CARD_RADIUS: 0.12,
  /** Font weight of the digits. */
  DIGIT_WEIGHT: 800,
  /** Size of the unit labels, as a share of the digit size. */
  LABEL_SIZE: 0.18,
  /** Size of the event name, as a share of the digit size. */
  EVENT_SIZE: 0.4,
  /** Size of "It's time.", as a share of the digit size. */
  TIME_SIZE: 0.6,
  /** The message shown at zero. */
  TIME_TEXT: "It's time.",
  /** The labels under each unit. */
  LABELS: ['days', 'hours', 'minutes', 'seconds'],
  /** Perspective of the flipping cards, in em. */
  PERSPECTIVE: 8,
  /** Where the celebration bursts from: share of the stage height. */
  BURST_Y: 0.85,
  /** Celebration burst (the confetti scene's defaults, so both match). */
  BURST: {
    count: 220,
    spread: 120,
    speed: 12,
    speedRange: 16,
    size: 9,
    spin: 0.15,
    flutter: 0.18,
    gravity: 0.5,
    drag: 0.97,
    wobble: 1.2,
    ribbon: 2.6,
  },
  /** Degrees to radians, for the burst spread. */
  DEG: Math.PI / 180,
  /** A quarter turn in degrees: a flap or drum is edge-on at this angle. */
  QUARTER: 90,
  /** Space between a unit's digits and its label, in em. */
  LABEL_GAP: 0.3,
} as const;

export const FIXED_REASONS: Record<keyof typeof FIXED, string> = {
  DEFAULT_DAYS: 'A default that is always in the future; the prompt says "7 days from now".',
  SECOND: 'Time units.',
  MINUTE: 'Time units.',
  HOUR: 'Time units.',
  DAY: 'Time units.',
  MIN_DAY_DIGITS: 'Two digits look like a clock; days grow to three when needed.',
  CARD_W: 'Proportions of a flip-clock card.',
  CARD_H: 'Proportions of a flip-clock card.',
  PAIR_GAP: 'Spacing of a flip-clock.',
  UNIT_GAP: 'Spacing of a flip-clock.',
  CARD_RADIUS: 'Style of a flip-clock card.',
  DIGIT_WEIGHT: 'Typography of the digits.',
  LABEL_SIZE: 'Typography of the labels.',
  EVENT_SIZE: 'Typography of the event name.',
  TIME_SIZE: 'Typography of the final message.',
  TIME_TEXT: 'Words shown when the countdown ends.',
  LABELS: 'Names of the four units.',
  PERSPECTIVE: 'Depth of the flip.',
  BURST_Y: 'The confetti rises from near the bottom.',
  BURST: "The same numbers as the confetti scene's defaults, so the celebration matches it.",
  DEG: 'Unit conversion only.',
  QUARTER: 'Geometry: a card turned 90 degrees is edge-on.',
  LABEL_GAP: 'Spacing between digits and their label.',
};
