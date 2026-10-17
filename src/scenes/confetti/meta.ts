import type { SceneMeta } from '../types';

export const meta: SceneMeta = {
  slug: 'confetti',
  title: 'Celebration burst',
  summary: 'A big message with confetti bursting around it. Click anywhere to fire more.',
  useCase: 'A birthday or congratulations page.',
  tags: ['Events', 'Just for fun'],
  difficulty: 'Easy',
  minutes: 15,
  world: 'dreamhouse',
  terms: ['particle-system', 'gravity', 'drag'],
  howItWorks: [
    'Each burst throws a few hundred little pieces outward in a fan: a **particle system**.',
    'Every frame **gravity** pulls them down and air **drag** slows them, so they float and drift.',
    'Each piece narrows and widens as it falls, which looks like a card tumbling in the air.',
    'All pieces of one color are drawn in one go, so hundreds of them stay smooth.',
  ],
  whatElse: [
    'A birthday page for a friend.',
    'A "thanks for signing up" screen.',
    'A burst when a form is sent or a goal is reached.',
  ],
  wants:
    'A big message in the middle of the screen. Clicking fires confetti from the click point, and an automatic burst fires every few seconds. Pieces tumble, flutter and fall off the screen.',
  lookLines: ['Size the canvas for devicePixelRatio (capped at 2) and do all math in CSS pixels.'],
  behaviorLines: [
    'Run one requestAnimationFrame loop. dt = seconds since the last frame, clamped to 0.05; f = min(dt × 60, 2.5); t = seconds the loop has run (the sum of dt).',
    'Reduced-motion still frame: one burst from the middle of the bottom edge area (width ÷ 2, auto burst height), frozen 40 frames after it fired.',
  ],
  interactionLines: [
    'The canvas listens for clicks and taps (touch-action: pan-y so swipes still scroll); the message doesn’t block them (pointer-events: none on the message).',
  ],
};
