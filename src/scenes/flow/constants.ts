// Fixed values in `flow` that are not sliders, each with its reason.

export const FIXED = {
  /** Particles respawn once they are this far past the edge (prototype). */
  EDGE: 5,
  /** The reduced-motion still frame simulates this many steps so trails show (PRD SCENES #22). */
  STILL_STEPS: 70,
} as const;

export const FIXED_REASONS: Record<keyof typeof FIXED, string> = {
  EDGE: 'Particles are already off screen at that point, so the exact margin never shows.',
  STILL_STEPS:
    'The PRD defines the still frame as about 70 simulated steps; it is not part of the live animation.',
};
