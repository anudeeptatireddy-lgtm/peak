import type { SceneMeta } from '../types';

export const meta: SceneMeta = {
  slug: 'coilstairs',
  title: 'Coil Stairs',
  summary: 'Each letter is a coiled spring that tumbles down a staircase as you scroll.',
  useCase: 'A playful brand, a kids’ product or a scrolling headline.',
  tags: ['Headlines', 'Intros'],
  difficulty: 'Medium',
  minutes: 40,
  world: 'dreamhouse',
  terms: ['spring', 'stagger', 'scroll-linked'],
  howItWorks: [
    'Every letter is a stack of letter-shaped wire coils. The front coil is the letter you read; the others sit just above it.',
    'To go down a step, the top coils lift first and tumble forward over the edge, and the bottom coils follow, like a toy spring walking down stairs.',
    'Each landing squashes the stack, and a **spring** bounces it back. The letters set off one after another (**stagger**).',
    'Scrolling moves them down or back up (**scroll-linked**); left alone, they walk down by themselves, rest, then climb back.',
  ],
  whatElse: [
    'A kids’ product page where the logo walks down to the buy button.',
    'A scrolling headline that tumbles into place as each section arrives.',
    'A playful 404 page where the letters fall down the stairs.',
  ],
  wants:
    'A front view of a staircase that comes down toward me. Each letter of a name is a coiled spring made of letter-shaped wire rings. As I scroll, the letters tumble down the stairs one after another, each flip arcing up and over onto the next step, and land on the bottom step with a springy squash and wobble.',
  lookLines: [
    'A full-screen canvas (100svh, at least 540px), transparent over the background and cleared every frame. Size it for devicePixelRatio (capped at 2) and do all math in CSS pixels.',
  ],
  behaviorLines: [
    'Run one requestAnimationFrame loop. dt = seconds since the last frame, clamped to 0.05; f = min(dt × 60, 2.5).',
    'Lay out the stairs and trace the letters again on every resize and once more when the Anybody font has finished loading; letters are not drawn before the font loads.',
    'Reduced-motion still frame: every letter landed on the bottom step, coils relaxed.',
  ],
  interactionLines: ['The canvas has touch-action: pan-y, so vertical swipes still scroll.'],
  unreleased: true,
};
