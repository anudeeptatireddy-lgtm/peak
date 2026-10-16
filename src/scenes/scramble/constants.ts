// Fixed values in `scramble` that are not sliders, each with its reason.

export const FIXED = {
  /** PRD §7: accent-colored text needs at least 3:1 contrast on the background. */
  ACCENT_CONTRAST: 3,
  /** Milliseconds per second, for the stagger and flicker settings. */
  MS: 1000,
  /** The character sets offered by the "Scramble characters" setting. */
  CHARSETS: {
    letters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
    symbols: '!<>-_\\/[]{}=+*^?#$%&@~',
    binary: '01',
    blocks: '░▒▓█▀▄▌▐',
  } as Record<string, string>,
} as const;

export const FIXED_REASONS: Record<keyof typeof FIXED, string> = {
  ACCENT_CONTRAST:
    'An accessibility floor from PRD §7, not a style choice: lowering it would make the scrambling letters hard to read.',
  MS: 'Unit conversion only.',
  CHARSETS:
    'The choices behind the "Scramble characters" setting; picking among them is the setting.',
};
