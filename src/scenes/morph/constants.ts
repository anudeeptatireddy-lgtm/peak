// Fixed values in `morph` that are not sliders, each with its reason. The shapes' own
// geometry is in shapes.ts, spelled out in plain words in the prompt.

export const FIXED = {
  /** The reduced-motion still frame shows the first shape this far into the second. */
  STILL_PROGRESS: 0.5,
  /** The back-ease curve overshoots by this much (the standard easeOutBack constant). */
  OVERSHOOT: 1.70158,
} as const;

export const FIXED_REASONS: Record<keyof typeof FIXED, string> = {
  STILL_PROGRESS: 'The still frame shows one shape halfway into the next (SCENES.md #39).',
  OVERSHOOT:
    'The standard easeOutBack constant that gives the jelly overshoot; from kits/easing.ts.',
};
