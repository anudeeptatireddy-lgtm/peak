import type { SceneMeta } from '../types';

export const meta: SceneMeta = {
  slug: 'pendulum',
  title: 'Pendulum Field',
  summary: 'Hundreds of swinging bobs drift apart, then line up to spell your name.',
  useCase: 'A science, music, data or studio intro.',
  tags: ['Intros', 'Backgrounds'],
  difficulty: 'Medium',
  minutes: 30,
  world: 'aurora',
  terms: ['easing', 'trail', 'scroll-linked'],
  howItWorks: [
    'Every bob swings in a small circle around one point on the letters of the name.',
    'The bobs swing at slightly different speeds, all whole multiples of one cycle, so they drift apart and then all come back to their points at the same moment: that is when the name appears.',
    'Time slows near that moment (a gentle **easing** of the speed) so the name holds for a beat, and each bob leaves a short **trail**.',
    'Scrolling moves time forward or back (**scroll-linked**), and hovering slows it down.',
  ],
  whatElse: [
    'A studio intro where the logo assembles itself.',
    'A music page where the bobs sway like a waveform.',
    'A loading screen that spells the product name when ready.',
  ],
  wants:
    'Hundreds of small bobs swinging in circles at slightly different speeds. At one exact moment they all pass through points on the letters of a name and spell it, hold for a beat, then drift apart again. Scrolling moves time forward and back, and hovering slows it down.',
  lookLines: [
    'A full-screen canvas (100svh, at least 540px), transparent over the background and cleared every frame. Size it for devicePixelRatio (capped at 2) and do all math in CSS pixels.',
  ],
  behaviorLines: [
    'Run one requestAnimationFrame loop. dt = seconds since the last frame, clamped to 0.05; t starts at 0 (the moment the name forms) and moves as described.',
    'Lay out the name again on every resize and once more when the Anybody font has finished loading; nothing is drawn before the font loads.',
    'Reduced-motion still frame: the moment the name forms (t = 0).',
  ],
  interactionLines: ['The canvas has touch-action: pan-y, so vertical swipes still scroll.'],
};
