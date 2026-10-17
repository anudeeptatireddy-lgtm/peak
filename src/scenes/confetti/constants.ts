// Fixed values in `confetti` that are not sliders, each with its reason.

export const FIXED = {
  /** Degrees to radians. */
  DEG: Math.PI / 180,
  /** Bursts fire upward. */
  UP: -Math.PI / 2,
  /** The shapes each "Shapes" choice uses. */
  SHAPES: {
    mixed: ['square', 'ribbon', 'circle'],
    squares: ['square'],
    ribbons: ['ribbon'],
    circles: ['circle'],
  } as Record<string, ('square' | 'ribbon' | 'circle')[]>,
  /** Frames simulated to build the frozen still-frame burst. */
  STILL_FRAMES: 40,
} as const;

export const FIXED_REASONS: Record<keyof typeof FIXED, string> = {
  DEG: 'Unit conversion only.',
  UP: 'Bursts go up; "Spread" sets how wide the fan is.',
  SHAPES: 'The choices behind the "Shapes" setting; picking among them is the setting.',
  STILL_FRAMES: 'Picks the moment of the frozen burst shown under reduced motion: pieces mid-air.',
};
