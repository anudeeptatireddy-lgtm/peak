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
    'No canvas: three rows of real text. The rows are decorative (aria-hidden); a visually hidden paragraph holds the three phrases for screen readers.',
  ],
  behaviorLines: [
    'Run one requestAnimationFrame loop. dt = seconds since the last frame, clamped to 0.05; t = seconds the loop has run (the sum of dt).',
    'Measure the rows again (and rebuild their repeats) on every resize and once the font has loaded.',
    'Reduced-motion still frame: the rows in place, with no lean.',
  ],
  interactionLines: [
    'Scrolling the page drives the speed, direction and lean, with touch scrolling too.',
    'If the page itself barely scrolls (a short page), give the section its own scroll area instead: an invisible scroller over it, three screens tall, that quietly jumps back by one screen whenever it gets within half a screen of either end, and read the scroll position from it (adding up the jumps).',
  ],
};
