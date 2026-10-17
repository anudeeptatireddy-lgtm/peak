import type { SceneMeta } from '../types';

export const meta: SceneMeta = {
  slug: 'typewriter',
  title: 'Typewriter',
  summary: 'Lines type out key by key, with uneven ink, tiny splatters and a slam at every return.',
  useCase: 'A writer’s portfolio, a story intro or a manifesto.',
  tags: ['Portfolio', 'Headlines'],
  difficulty: 'Easy',
  minutes: 15,
  world: 'newsprint',
  terms: ['opacity', 'transform', 'stagger'],
  howItWorks: [
    'Every character is on the page from the start, just invisible, so the text never shifts as it types.',
    'Keys are revealed one at a time with a slightly random gap between them, like a real typist.',
    'Each letter lands with a little random **opacity**, tilt and shift (a **transform**), and sometimes a few specks of ink.',
    'At the end of a line the whole block jolts sideways and rings out: the carriage slamming back.',
  ],
  whatElse: [
    'A writer’s portfolio that types out a short bio.',
    'A story page whose first lines type themselves.',
    'A manifesto that types out on scroll.',
  ],
  wants:
    'Lines that type out key by key, like on an old typewriter. Each strike leaves a slightly uneven, inky letter and sometimes a tiny ink splatter. At the end of a line the carriage slams back with a jolt and the next line starts. A cursor blinks at the end; clicking types everything again.',
  lookLines: [
    'Keep the whole text in a visually hidden element for screen readers and mark the typing layer aria-hidden.',
  ],
  behaviorLines: [
    'Build every character up front as a span with visibility: hidden; typing a key makes its span visible.',
    'When a key lands, make its Math.random() calls in this order: the three ink values, the splatter check, the speck count and each speck’s three values, then the wait before the next key.',
    'Run one requestAnimationFrame loop. dt = seconds since the last frame, clamped to 0.05; t = seconds the loop has run (the sum of dt). Key times use t.',
  ],
  interactionLines: ['A click or tap (on release) anywhere on the section starts the typing over.'],
};
