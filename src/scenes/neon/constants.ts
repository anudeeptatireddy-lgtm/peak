// Fixed values in `neon` that are not sliders, each with its reason.

export const FIXED = {
  /** PRD §8.2: at most 3 flashes start per second, so flashes are at least 1/3s apart. */
  MIN_FLASH_GAP: 1 / 3,
  /** Seconds per minute (dims per minute setting). */
  MINUTE: 60,
  /** A letter's fade-in takes this share of its turn-on time; its stutter comes halfway. */
  FADE_SHARE: 0.6,
} as const;

export const FIXED_REASONS: Record<keyof typeof FIXED, string> = {
  MIN_FLASH_GAP:
    'A safety limit from PRD §8.2 (never more than 3 flashes a second), not a style choice; tested in tests/unit/flash.test.ts.',
  MINUTE: 'Unit conversion only.',
  FADE_SHARE:
    'Shapes how a tube warms up within its turn-on time; the "Turn-on time" setting controls the pace.',
};
