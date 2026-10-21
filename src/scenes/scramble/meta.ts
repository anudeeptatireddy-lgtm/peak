import type { SceneMeta } from '../types';

export const meta: SceneMeta = {
  slug: 'scramble',
  title: 'Decoding text',
  summary: 'Lines flicker through random characters, then lock into place letter by letter.',
  useCase: 'A portfolio title or a "hacker" reveal.',
  tags: ['Portfolio', 'Headlines', 'Tech & AI'],
  difficulty: 'Easy',
  minutes: 10,
  world: 'arcade',
  terms: ['stagger', 'variable-font', 'reduced-motion'],
  howItWorks: [
    'Every letter of a line starts out flickering through random characters.',
    'The letters settle one after another, a short delay apart: that delay is called a **stagger**.',
    'Each letter keeps an invisible copy of its real character underneath, so the line never shifts while it scrambles.',
    'The real text is always on the page for screen readers, and under **reduced motion** you just see the finished words.',
  ],
  whatElse: [
    'A portfolio title that decodes your name.',
    'Navigation links that scramble on hover.',
    'A loading message that decodes while you wait.',
  ],
  wants:
    'Three lines of text that flicker through random characters and then resolve, letter by letter from left to right, into the real words. Hovering a line scrambles it again.',
  lookLines: [
    'A scrambling character uses accent ((line index + j) mod 3) (line index 0, 1, 2; j its position in the line), adjusted in lightness only if needed so it has at least 3:1 contrast with the background. A settled character uses its line’s color.',
  ],
  behaviorLines: [
    'Build each line as one block holding a visually hidden copy of the whole line (for screen readers) and, marked aria-hidden, one inline-block span per character. Each span is an inline-grid (justify-items: center) holding two layers in the same grid cell (grid-area 1 / 1): the real character with visibility: hidden, which fixes the span’s width, and the character currently shown. So nothing shifts while the line scrambles.',
    'Run one requestAnimationFrame loop. dt = seconds since the last frame, clamped to 0.05; t = seconds the loop has run (the sum of dt). Start times use t.',
    'Each frame, update lines in order and characters left to right (this fixes the order of the Math.random() calls).',
    'Reduced-motion still frame: every line fully settled, no scrambling.',
  ],
  interactionLines: [
    'Only the lines themselves take pointer events; the rest of the section ignores them, so it never blocks scrolling.',
  ],
};
