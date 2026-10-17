import type { SceneMeta } from '../types';

export const meta: SceneMeta = {
  slug: 'echo',
  title: 'Echo trail',
  summary: 'A word drifts on a slow loop and leaves a trail of colored copies that fade behind it.',
  useCase: 'A dreamy hero headline.',
  tags: ['Headlines', 'Just for fun'],
  difficulty: 'Easy',
  minutes: 15,
  world: 'vapor',
  terms: ['trail', 'opacity', 'blend-mode', 'lerp'],
  howItWorks: [
    'The word’s position is recorded 60 times a second, so we always know where it was a moment ago.',
    'Each echo is the word drawn where it was a few samples back, a little fainter each time (lower **opacity**): together they make a **trail**.',
    'Echoes cycle through the three accent colors, and where they overlap a **blend mode** mixes them.',
    'The word eases toward its looping path, or toward your cursor when you come close: a **lerp** each frame.',
  ],
  whatElse: [
    'A dreamy hero headline for a music or fashion page.',
    'A cursor that leaves colored echoes behind it.',
    'A logo that leaves a trail as it animates in.',
  ],
  wants:
    'A word drifts along a gentle looping path, or follows my cursor when it comes close, and leaves a trail of colored copies that fade out behind it, overlapping in the three accent colors.',
  lookLines: [
    'A full-screen canvas (100svh, at least 540px), transparent, cleared every frame. Size it for devicePixelRatio (capped at 2) and do all math in CSS pixels.',
  ],
  behaviorLines: [
    'Run one requestAnimationFrame loop. dt = seconds since the last frame, clamped to 0.05; f = min(dt × 60, 2.5); t = seconds the loop has run (the sum of dt).',
    'The word starts at the path point for t = 0, and every recorded sample starts there too.',
    'Reduced-motion still frame: the word where the path puts it at t = 2.2s, with its echoes where the path put it at the earlier sample times.',
  ],
  interactionLines: ['The canvas has touch-action: pan-y.'],
};
