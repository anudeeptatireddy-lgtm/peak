// Fixed values in `kaleido` that are not sliders, each with its reason.

export const FIXED = {
  /** Radians per second of turning at a Turn speed of 1. */
  TURN_RATE: 1,
  /** How fast the self-drawing point sweeps sideways, per unit of Draw speed (radians per second). */
  AUTO_X: 0.9,
  /** How fast it sweeps up and down; unlike AUTO_X so the path keeps changing. */
  AUTO_Y: 1.31,
  /** Phase offset of the up-and-down sweep, in radians. */
  AUTO_PHASE: 1.7,
  /** Frames of self-drawing simulated for the reduced-motion still frame. */
  STILL_FRAMES: 300,
  /** A stroke that moves further than this share of a wedge in one step crossed a seam; it isn't drawn. */
  SEAM_JUMP: 0.5,
  /** Opacity of each stroke segment. */
  STROKE_ALPHA: 0.9,
} as const;

export const FIXED_REASONS: Record<keyof typeof FIXED, string> = {
  TURN_RATE: 'Unit of the Turn speed slider: 1 is one radian per second.',
  AUTO_X: 'Pace of the self-drawing path, scaled by the Draw speed slider.',
  AUTO_Y: 'A different pace from AUTO_X so the self-drawn path is not a repeating circle.',
  AUTO_PHASE: 'Offsets the two sweeps so the path starts off-axis.',
  STILL_FRAMES: 'Long enough for a rich pattern to build for the still frame.',
  SEAM_JUMP: 'Stops a long stray line when a stroke crosses between two mirrored wedges.',
  STROKE_ALPHA: 'Slightly see-through strokes so overlapping lines show depth.',
};
