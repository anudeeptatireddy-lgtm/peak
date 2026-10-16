import type { SceneMeta } from '../types';

export const meta: SceneMeta = {
  slug: 'velocity',
  title: 'Scroll-reactive marquee',
  summary: 'Three rows of type that speed up, reverse and lean as you scroll.',
  useCase: 'An announcement banner or brand page.',
  tags: ['Landing pages', 'Events'],
  difficulty: 'Easy',
  minutes: 15,
  world: 'doomsday',
  terms: ['marquee', 'scroll-linked', 'velocity', 'transform'],
  howItWorks: [
    'Each row is a **marquee**: the same words repeated twice side by side, slid left or right and wrapped around so it never ends.',
    'Every frame, we measure how fast you are scrolling (your scroll **velocity**) and smooth it a little.',
    'Faster scrolling makes the rows drift faster, and scrolling back up reverses them.',
    'The whole block leans with a skew **transform** proportional to that speed.',
  ],
  whatElse: [
    'An announcement banner for a sale or a launch.',
    'A brand page where your name scrolls in three styles.',
    'A footer that speeds up as visitors reach the bottom.',
  ],
  wants:
    'Three rows of huge repeating text that drift in alternating directions. When I scroll, they speed up, reverse direction when I scroll back up, and lean into the motion, then relax when I stop.',
  lookLines: [
    'Row 1: very wide and heavy (Anybody width 150, weight 900) in the main text color.',
    'Row 2: italic, narrow (width 70, weight 800), outlined only: transparent fill with a thin stroke in the main text color.',
    'Row 3: light (width 110, weight 300) in the accent text color.',
    'Rows are about clamp(3rem, 12vw, 10rem) tall and fill the width edge to edge.',
  ],
  behaviorLines: [
    'Each row contains its words repeated until wider than the screen, then that group duplicated once, so it can wrap seamlessly.',
    'Scroll velocity: each frame take the change in scroll position divided by (dt × 60), clamp it to ±140, and smooth it with velocity += (raw − velocity) × 0.2.',
  ],
  interactionLines: [
    "Scroll the page (or the stage itself on a page that doesn't scroll much).",
    'Works the same with touch scrolling.',
  ],
};
