// Fixed values in `glitch` that are not sliders, each with its reason.

export const FIXED = {
  /** PRD §8.2: the picture never changes abruptly more than this many times a second. */
  RATE_CAP: 3,
  /** A burst changes the picture twice (it tears, then snaps clean): one change at its start, one at its end. */
  CHANGES_PER_BURST: 2,
  /** Rounding safety on the time window, so the cap holds exactly. */
  WINDOW_MARGIN: 1.000001,
  /** Fonts use this share of the headline's height as its line box. */
  LINE: 1.2,
  /** Where the headline sits, as a share of the stage height. */
  TEXT_Y: 0.5,
  /** The headline is never wider than this share of the stage width. */
  FIT: 0.9,
  /** Auto glitches wait a random time of this share either side of "Random glitch every". */
  AUTO_SPREAD: 0.5,
  /** Padding around the headline, as a share of its font size, so slices can move without being cut. */
  PAD: 0.6,
  /** Opacity of each color channel while splitting. */
  CHANNEL_ALPHA: 0.85,
  /** Inverse of an average letter width (about 0.625 of the font size), to fit the headline without measuring it. */
  EM_INV: 1.6,
} as const;

export const FIXED_REASONS: Record<keyof typeof FIXED, string> = {
  RATE_CAP: 'Flash safety (PRD §8.2): at most 3 abrupt changes a second.',
  CHANGES_PER_BURST: 'A burst tears the headline and then snaps it clean: two abrupt changes.',
  WINDOW_MARGIN: 'Rounding safety so the rate cap holds exactly.',
  LINE: 'Gives the headline room for tall letters.',
  TEXT_Y: 'The headline sits in the middle of the stage.',
  FIT: 'Keeps the headline inside the screen.',
  AUTO_SPREAD: 'Makes automatic glitches irregular, so they feel unplanned.',
  PAD: 'Room for slices to slide sideways without being cut off.',
  CHANNEL_ALPHA: 'Slightly see-through channels show where they overlap.',
  EM_INV: 'A rough letter width used to fit the headline to the screen.',
};
