import type { SceneMeta } from '../types';

export const meta: SceneMeta = {
  slug: 'blackhole',
  title: 'Black hole',
  summary: 'A grid bends into a funnel around a black hole while particles spiral in and vanish.',
  useCase: 'A dramatic space-themed hero or background.',
  tags: ['Backgrounds', 'Just for fun'],
  difficulty: 'Spicy',
  minutes: 30,
  world: 'doomsday',
  terms: ['gravity', 'velocity', 'drag', 'particle-system'],
  howItWorks: [
    'Every grid point is pulled toward the hole by an amount that shrinks with distance, so straight lines bend into a funnel.',
    'Particles in a **particle system** feel **gravity** toward the hole that grows sharply as they get close, so they orbit faster and faster.',
    'A little **drag** steals their speed, so their orbits slowly shrink and they spiral in.',
    'Each particle is drawn as a streak along its **velocity**, and vanishes when it crosses the event horizon, then starts again from far away.',
  ],
  whatElse: [
    'A space-themed hero behind a big headline.',
    'A "lost in space" 404 page.',
    'A launch countdown that pulls everything into the middle.',
  ],
  wants:
    'A black hole in the middle of the screen. A faint grid around it bends into a funnel, and glowing particles drift in, orbit faster as they get close, stretch into streaks and vanish at its edge. I can press and hold to drag the hole around, and clicking releases a burst of new particles.',
  lookLines: [
    'A full-screen canvas (100svh, at least 540px), transparent over the background and cleared every frame. Size it for devicePixelRatio (capped at 2) and do all math in CSS pixels.',
  ],
  behaviorLines: [
    'Run one requestAnimationFrame loop. dt = seconds since the last frame, clamped to 0.05; f = min(dt × 60, 2.5).',
    'The hole starts in the middle. Each frame, in this order: handle clicks, move the hole, move the particles, draw (grid, particles, hole).',
    'Place the particles again on every resize.',
    'Reduced-motion still frame: the scene after 180 frames of the physics with f = 1 and no pointer.',
  ],
  interactionLines: ['The canvas has touch-action: pan-y, so swipes still scroll.'],
};
