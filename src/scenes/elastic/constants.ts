// Fixed values in `elastic` that are not sliders, each with its reason.

export const FIXED = {
  /** The moment of the idle wave shown as the reduced-motion still frame (prototype). */
  STILL_TIME: 0.4,
} as const;

export const FIXED_REASONS: Record<keyof typeof FIXED, string> = {
  STILL_TIME:
    'Picks which instant of the idle wave the still frame shows (the prototype uses 0.4s); motion settings do not apply to a still frame.',
};
