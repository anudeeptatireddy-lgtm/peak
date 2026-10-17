import type { SceneMeta } from '../types';

export const meta: SceneMeta = {
  slug: 'smoke',
  title: 'Smoke',
  summary: 'Soft colored smoke pours from your cursor and swirls, curls and fades.',
  useCase: 'A moody, atmospheric background.',
  tags: ['Backgrounds', 'Just for fun'],
  difficulty: 'Spicy',
  minutes: 35,
  world: 'aurora',
  terms: ['flow-field', 'velocity', 'opacity'],
  howItWorks: [
    'The screen is split into a coarse grid, and each cell remembers which way the air is moving there: a **flow-field** that moves itself.',
    'Every frame the air carries itself and the smoke along, and a pressure step keeps it from piling up, so it swirls instead of squashing.',
    'Moving the cursor pushes the air with your **velocity** and pours in colored smoke; a small extra twist keeps little curls alive.',
    'The smoke slowly loses **opacity**, and the low-resolution grid is stretched over the screen with smoothing, so it stays soft and fast.',
  ],
  whatElse: [
    'A moody background behind a music or film page.',
    'A dreamy hero for a perfume or candle shop.',
    'A loading screen where the smoke clears when the page is ready.',
  ],
  wants:
    'Soft colored smoke that pours from my cursor and swirls, curls and fades behind it. Faster movement makes bigger swirls. When I leave it alone, a slow plume rises from the bottom of the screen.',
  lookLines: [
    'A full-screen canvas (100svh, at least 540px), transparent over the background and cleared every frame. Size it for devicePixelRatio (capped at 2).',
  ],
  behaviorLines: [
    'Run one requestAnimationFrame loop. dt = seconds since the last frame, clamped to 0.05; f = min(dt × 60, 2.5); t = seconds the loop has run (the sum of dt).',
    'Each frame, in this order: splat from the pointer or the plume, add the swirl (vorticity confinement), step the fluid with dt, fade the dye, draw.',
    'Make a fresh, empty grid on every resize.',
    'Performance: the fluid only ever runs on the coarse grid; one frame must stay well under 8ms at the defaults.',
    'Reduced-motion still frame: the plume after 150 frames of the simulation with f = 1 and dt = 1/60, no pointer.',
  ],
  interactionLines: ['The canvas has touch-action: pan-y, so vertical swipes still scroll.'],
};
