// Fixed values in `fire` that are not sliders, each with its reason.

export const FIXED = {
  /** Heat-grid cell size in CSS px for each "Detail" choice. */
  CELLS: { low: 8, medium: 5, high: 3 } as Record<string, number>,
  /** Under reduced motion the shown heat moves only this share toward the new heat each frame. */
  CALM: 0.15,
  /** Fanned cells lose at most this share less heat (so fanning never makes flames endless). */
  FAN_LIFT_MAX: 0.8,
  /** Steps run to build the reduced-motion still frame from cold. */
  STILL_STEPS: 90,
  /** Sampling mask color: only the alpha channel is read. */
  MASK: '#000',
  /** A grid cell is fuel when the letter covers more than half of it. */
  ALPHA_CUTOFF: 127,
  /** Heat where the color ramp reaches full first accent, then the second accent (third at 1). */
  STOP1: 0.35,
  STOP2: 0.7,
  /** Color-ramp lookup table size (one entry per heat step). */
  RAMP: 256,
  /** Largest value of a color channel in canvas pixel data. */
  BYTE: 255,
} as const;

export const FIXED_REASONS: Record<keyof typeof FIXED, string> = {
  CELLS: 'The choices behind the "Detail" setting; picking among them is the setting.',
  CALM: 'Reduced motion only (PRD §8.2): keeps flames flowing without flicker after Play.',
  FAN_LIFT_MAX: 'A safety cap: with full fan, flames still cool and end; it never shows as a look.',
  STILL_STEPS: 'Enough steps for the flames to reach their full height in the still frame.',
  MASK: 'The hidden canvas is only read for alpha, so its fill color never shows.',
  ALPHA_CUTOFF: 'Only decides whether half-covered edge cells count as fuel.',
  STOP1: 'Shapes the color ramp of the flames from the world’s three accents.',
  STOP2: 'Shapes the color ramp of the flames from the world’s three accents.',
  RAMP: 'Precision of the color lookup; finer steps look identical.',
  BYTE: 'The canvas pixel format (0–255 per channel).',
};
