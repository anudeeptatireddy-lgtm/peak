import type { SceneMeta } from '../types';

export const meta: SceneMeta = {
  slug: 'fire',
  title: 'Burning headline',
  summary: 'Flames lick up from a headline. Move near it to fan them toward you.',
  useCase: 'A bold launch or "hot new thing" headline.',
  tags: ['Headlines', 'Events'],
  difficulty: 'Spicy',
  minutes: 30,
  world: 'doomsday',
  terms: ['particle-system', 'frame-rate', 'reduced-motion'],
  howItWorks: [
    'Behind the headline is a coarse grid of heat values, where the letters themselves are fuel that stays hot.',
    'Every frame, each cell copies the heat from just below it, nudged a little sideways at random and cooled a little: heat rises and fades, which looks like flames.',
    'The heat is drawn as a tiny image and scaled up smoothly, colored from the world’s accents, so it stays cheap at any **frame rate**.',
    'Flicker stays small and local; with **reduced motion** the flames flow slowly without flickering.',
  ],
  whatElse: [
    'A "hot new release" banner.',
    'A product launch countdown that catches fire at zero.',
    'A sale headline that burns brighter as the timer runs out.',
  ],
  wants:
    'Flames lick up from the top edges of a headline, flickering and curling. Moving my cursor near the word fans the flames toward it and makes them taller.',
  lookLines: [
    'A full-screen canvas (100svh, at least 540px), transparent, cleared every frame. Size it for devicePixelRatio (capped at 2) and do all math in CSS pixels.',
  ],
  behaviorLines: [
    'Run one requestAnimationFrame loop. dt = seconds since the last frame, clamped to 0.05; run one heat step per frame.',
    'Rebuild the grid and the fuel (all cold) on every resize and once the Anybody font has finished loading.',
    'Safety (PRD flashing rules): the flicker is small and local, the background never flashes. Under reduced motion, each frame the shown heat only moves 15% of the way toward the new heat, so flames flow without flickering, even after Play.',
    'Reduced-motion still frame: the flames after 90 steps from cold, without the pointer.',
  ],
  interactionLines: ['The canvas has touch-action: pan-y.'],
};
