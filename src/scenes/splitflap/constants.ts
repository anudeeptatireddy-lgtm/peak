// Fixed values in `splitflap` that are not sliders, each with its reason.

export const FIXED = {
  /** The flap sequences offered by the "Characters" setting (a space first: blank tiles). */
  CHARSETS: {
    letters: ' ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    alnum: ' ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
  } as Record<string, string>,
  /** Milliseconds per second. */
  MS: 1000,
  /** A flap turns a quarter turn (degrees) to fall flat. */
  QUARTER: 90,
} as const;

export const FIXED_REASONS: Record<keyof typeof FIXED, string> = {
  CHARSETS: 'The choices behind the "Characters" setting; picking among them is the setting.',
  MS: 'Unit conversion only.',
  QUARTER: 'Geometry: a flap is upright at 0° and flat at 90°.',
};
