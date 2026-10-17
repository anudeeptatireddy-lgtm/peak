// Fixed values in `fireworks` that are not sliders, each with its reason.

export const FIXED = {
  /** Bursts (and launches) start at least this many seconds apart. */
  MIN_GAP: 0.35,
  /** Taps waiting for their turn; more are ignored. */
  MAX_QUEUE: 3,
  /** The first automatic rocket goes up this many seconds after the start. */
  FIRST_AUTO: 0.4,
  /** Reduced-motion still frame: three bursts at these spots (shares of width and height)… */
  STILL_SPOTS: [
    [0.25, 0.34],
    [0.5, 0.2],
    [0.75, 0.4],
  ],
  /** …this many frames after they burst. */
  STILL_FRAMES: 30,
  /** Hex alpha suffix: the glow fades to a fully transparent copy of its color. */
  CLEAR: '00',
} as const;

export const FIXED_REASONS: Record<keyof typeof FIXED, string> = {
  MIN_GAP:
    'Safety (PRD §8.2): at most 3 bursts start in any second however fast you tap; 0.35s leaves room for frame timing.',
  MAX_QUEUE: 'Keeps a burst of taps from turning into a long show; any small number works.',
  FIRST_AUTO:
    'So the page never opens on an empty sky; "Auto launch every" sets the pace after that.',
  STILL_SPOTS: 'Spreads the three still-frame bursts across the sky at different heights.',
  STILL_FRAMES: 'Catches the bursts fully open with their trails, for the still frame.',
  CLEAR: 'Fading to the same color at zero alpha avoids a dark fringe; not a setting.',
};
