// Fixed values in `smoke` that are not sliders, each with its reason.

export const FIXED = {
  /** Frames of the idle plume run before drawing the reduced-motion still frame. */
  STILL_FRAMES: 150,
  /** Canvas pixels: a byte holds 0–255. */
  BYTE: 255,
  /** Offset of the alpha byte in an RGBA pixel. */
  ALPHA: 3,
} as const;

export const FIXED_REASONS: Record<keyof typeof FIXED, string> = {
  STILL_FRAMES: 'Long enough for the plume to rise and curl, for the still frame.',
  BYTE: 'The canvas pixel format; not a setting.',
  ALPHA: 'The canvas pixel format; not a setting.',
};
