// Fixed values in `tokenstream` that are not sliders, each with its reason.

export const FIXED = {
  /** The story plays in five equal stages: type, split, fly to the stack, weigh, dock. */
  STAGES: 5,
  /** The sentence's center sits at this share of the height… */
  SENTENCE_Y: 0.24,
  /** …and the stack and the finished name at these. */
  STACK_Y: 0.55,
  NAME_Y: 0.6,
  /** The sentence's font weight. */
  SENTENCE_WEIGHT: 600,
  /** The sentence's font is at most this share of the height. */
  SENTENCE_MAX: 0.06,
  /** Below this font size (px) the sentence wraps onto two lines. */
  WRAP_PX: 20,
  /** The sentence is never wider than this share of the width, gaps included. */
  SENTENCE_FIT: 0.92,
  /** Split chunks open a gap of this share of the sentence's font size. */
  SPLIT_GAP: 0.4,
  /** A chunk's chip is this many font sizes tall… */
  CHIP_H: 1.35,
  /** …with this many font sizes of padding on each side… */
  CHIP_PAD: 0.18,
  /** …and corners rounded by this share of its height. */
  CHIP_ROUND: 0.25,
  /** Stacked chips sit this many chip heights apart. */
  STACK_STEP: 1.15,
  /** The stack is never taller than this share of the height… */
  STACK_FIT: 0.5,
  /** …nor uses a font bigger than this many sentence font sizes. */
  STACK_MAX: 1.1,
  /** Docked chips keep a gap of this share of the name's font size, so each chunk shows. */
  DOCK_GAP: 0.05,
  /** Overshoot 1 gives back-out easing this strong (0.2 is the classic 1.7). */
  BACK_SCALE: 8.5,
  /** Shuffling chips swing sideways by this share of how far they still have to go. */
  SWAP_SIDE: 0.35,
  /** A swap is about 98% done when its shuffle time is up. */
  SETTLE: 4,
  /** Weight bars are up to this many chip heights long… */
  BAR_LEN: 2.4,
  /** …this share of a chip height thick, starting this many chip heights right of the chip. */
  BAR_THICK: 0.22,
  BAR_GAP: 0.3,
  /** Weights wobble by this much, this many times a second. */
  WOBBLE: 0.12,
  WOBBLE_RATE: 1.7,
  /** While weighing, name chunks rise to this weight and the others sink to that. */
  WEIGHT_HIGH: 0.9,
  WEIGHT_LOW: 0.2,
  /** Link lines bow upward by this share of their length. */
  ARC: 0.35,
  /** Chips are mixed this far from their accent toward the background. */
  CHIP_MIX: 0.25,
  /** Chip text keeps at least this contrast with its chip (WCAG AA). */
  CONTRAST: 4.5,
  /** Shadows (high quality) sit this share of a chip height below the chip. */
  SHADOW: 0.12,
  /** Left-over chunks sink this many chip heights as they fade while the name docks. */
  SINK: 1.5,
  /** Seed for the extra links and the shuffle. */
  SEED: 88,
  /** The inner scroll area on scene pages is this many screens tall… */
  INNER_SCREENS: 3,
  /** …and recenters within half a screen of either end. */
  RECENTER_LOW: 0.5,
  RECENTER_HIGH: 1.5,
} as const;

export const FIXED_REASONS: Record<keyof typeof FIXED, string> = {
  STAGES: 'SCENES.md #88: sentence, split, stack, weigh, reassemble.',
  SENTENCE_Y: 'Layout: the sentence reads first, near the top.',
  STACK_Y: 'Layout: the stack sits in the middle, between sentence and name.',
  NAME_Y: 'Layout: the finished name sits a little below the middle, under the stage buttons.',
  SENTENCE_WEIGHT: 'Typography: a sturdy, readable sentence, lighter than the name.',
  SENTENCE_MAX: 'Typography: the sentence stays a line of reading text on wide screens.',
  WRAP_PX: 'Readability: smaller one-line text is hard to read on phones.',
  SENTENCE_FIT: 'Keeps a margin at the screen edges on phones.',
  SPLIT_GAP: 'Clear gaps between chunks, so the split is easy to see.',
  CHIP_H: 'A chip just taller than its letters, like a tag.',
  CHIP_PAD: 'Enough room around the letters to read each chunk.',
  CHIP_ROUND: 'Soft corners, like a token chip.',
  STACK_STEP: 'Chips stacked with a small gap between them.',
  STACK_FIT: 'The stack never reaches the sentence or the screen edge.',
  STACK_MAX: 'Stacked chips stay about sentence size.',
  DOCK_GAP: 'Thin seams, so the name reads as one word but each chunk shows.',
  BACK_SCALE: 'Maps the overshoot slider onto the standard back-out curve.',
  SWAP_SIDE: 'Chips pass beside each other instead of through each other.',
  SETTLE: 'A swap finishes within its shuffle time.',
  BAR_LEN: 'Weight bars long enough to compare at a glance.',
  BAR_THICK: 'A thin bar that does not compete with the chip.',
  BAR_GAP: 'A small space between a chip and its bar.',
  WOBBLE: 'A visible but calm wobble while the chunks are weighed.',
  WOBBLE_RATE: 'A calm pace, under 2 wobbles a second.',
  WEIGHT_HIGH: 'The name chunks clearly win the weighing.',
  WEIGHT_LOW: 'The other chunks clearly lose, but their bars still show.',
  ARC: 'Gentle arcs that stay above the chips they link.',
  CHIP_MIX: 'Chips keep their accent but sit calmly on the background.',
  CONTRAST: 'Text contrast rule (WCAG AA for normal text).',
  SHADOW: 'A small drop shadow that lifts chips off the background.',
  SINK: 'Left-over chunks drop away gently instead of vanishing in place.',
  SEED: 'The same links and shuffle every visit, so the scene and its prompt match.',
  INNER_SCREENS: 'Part of the invisible endless scroll area on scene pages; never shows.',
  RECENTER_LOW: 'Part of the invisible endless scroll area on scene pages; never shows.',
  RECENTER_HIGH: 'Part of the invisible endless scroll area on scene pages; never shows.',
};
