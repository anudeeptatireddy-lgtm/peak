import type { SceneMeta } from '../types';

export const meta: SceneMeta = {
  slug: 'tokenstream',
  title: 'Token Stream',
  summary:
    'Scroll and a sentence splits into colored chunks like an AI reading it, then the chunks are weighed and snap together into your name.',
  useCase: 'AI startups, developer tools and education.',
  tags: ['Tech & AI', 'Education'],
  difficulty: 'Medium',
  minutes: 40,
  world: 'arcade',
  terms: ['scroll-linked', 'stagger', 'easing'],
  howItWorks: [
    'A sentence types in, then splits into colored chunks the way an AI model splits text into tokens. Each chunk keeps its color the whole way.',
    'The chunks fly into a stack one after another (a **stagger**) and swap places while bars show them being weighed; the name’s chunks win.',
    'The winners dock into the finished name with back-out **easing**, so each one snaps in with a small overshoot.',
    'Scrolling plays the stages forward and back (**scroll-linked**); left alone, the story plays by itself.',
  ],
  whatElse: [
    'An AI product’s hero that shows how its model reads a sentence.',
    'A lesson page that explains tokens with the reader’s own name.',
    'A developer tool’s launch page whose tagline assembles from its tokens.',
  ],
  wants:
    'A sentence with a name in it types in, then splits into colored chunks like an AI model’s tokens. As I scroll, the chunks fly into a stack, swap places while little bars weigh them, and the name’s chunks snap into the finished name with a small overshoot. Thin lines link related chunks.',
  lookLines: [
    'A full-screen canvas (100svh, at least 540px), transparent over the background and cleared every frame. Size it for devicePixelRatio (capped at 2) and do all math in CSS pixels.',
  ],
  behaviorLines: [
    'Run one requestAnimationFrame loop. dt = seconds since the last frame, clamped to 0.05; f = min(dt × 60, 2.5).',
    'Measure the chunks again on every resize and once more when the Anybody font has finished loading; nothing is drawn before the font loads. Use a seeded random number generator so the links and the shuffle are the same every visit.',
    'Reduced-motion still frame: the finished name, made of its colored chunks, with its link lines.',
  ],
  interactionLines: ['The canvas has touch-action: pan-y, so vertical swipes still scroll.'],
};
