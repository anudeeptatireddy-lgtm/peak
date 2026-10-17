import type { SceneMeta } from '../types';

export const meta: SceneMeta = {
  slug: 'extrude',
  title: '3D letters',
  summary: 'A chunky 3D word that turns to face your cursor and springs back with a sway.',
  useCase: 'A chunky portfolio title or a product name.',
  tags: ['Headlines', 'Portfolio'],
  difficulty: 'Medium',
  minutes: 20,
  world: 'blueprint',
  terms: ['transform', 'spring', 'damping'],
  howItWorks: [
    'The word is drawn many times on top of itself, each copy nudged a little further back: together they look like a solid block.',
    'Turning the word just changes how far each copy is nudged and how much the front squashes (a **transform**), so you see its sides.',
    'The angle follows your cursor on a **spring**, and **damping** settles the sway when you let go.',
    'The sides shade from one accent toward another and darken toward the back.',
  ],
  whatElse: [
    'A chunky product name on a landing page.',
    'A title that tilts as you scroll.',
    'A logo that faces whoever is looking at it.',
  ],
  wants:
    'A chunky 3D word, built from stacked layers, that turns to face my cursor and shows its sides; the front face is one color and the depth shades through the others. When I move away it springs back with a little sway, then floats gently.',
  lookLines: [
    'A full-screen canvas (100svh, at least 540px), transparent, cleared every frame. Size it for devicePixelRatio (capped at 2) and do all math in CSS pixels.',
  ],
  behaviorLines: [
    'Run one requestAnimationFrame loop. dt = seconds since the last frame, clamped to 0.05; f = min(dt × 60, 2.5); t = seconds the loop has run (the sum of dt).',
    'Reduced-motion still frame: yaw = 0.6 × max turn and pitch = −0.3 × max turn.',
  ],
  interactionLines: ['The canvas has touch-action: pan-y.'],
};
