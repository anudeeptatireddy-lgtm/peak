// Fixed values in `kinetic` that are not sliders, each with its reason.

export const FIXED = {
  /** The eight-beat pattern of moves; switches remove the ones they turn off. */
  PATTERN: ['scale', 'turn', 'swap', 'block', 'scale', 'block', 'turn', 'swap'] as const,
  /** Each beat moves to the cell this many places on (coprime with 4 and 9, so every cell gets a turn). */
  HOP: 5,
  /** Seconds per minute (tempo in beats per minute). */
  MINUTE: 60,
  /** A turned word is turned a quarter turn (degrees). */
  QUARTER: 90,
  /** "Mechanical" moves take this share of the usual move time, then hold. */
  MECHANICAL: 0.3,
  /** How many beats of the pattern the still frame shows. */
  STILL_BEATS: 4,
  /** The grids a click cycles through, in order. */
  GRIDS: ['2x2', '3x3', 'stacked'] as const,
} as const;

export const FIXED_REASONS: Record<keyof typeof FIXED, string> = {
  PATTERN:
    'The choreography itself; the "Allow turns" and "Color blocks" switches change it, and the tempo and feel settings shape every move.',
  HOP: 'Only decides which cell moves next; any number that visits every cell gives the same rhythm.',
  MINUTE: 'Unit conversion only.',
  QUARTER: 'Geometry: a turn on a Swiss grid is a right angle.',
  MECHANICAL:
    'Part of the "Mechanical" feel (a quick move, then a hold); the "Motion feel" setting chooses it.',
  STILL_BEATS: 'Picks which moment of the loop the reduced-motion still frame shows.',
  GRIDS: 'The choices behind the "Grid" setting, in the order a click cycles them.',
};
