import type { SceneMeta } from '../types';
import { FIXED } from './constants';

export const meta: SceneMeta = {
  slug: 'tailor',
  title: "Tailor's cut",
  summary: 'A heavy drape of cloth is chalked, snipped in two and falls away to reveal a name.',
  useCase: 'A fashion or tailoring brand intro.',
  tags: ['Brands', 'Intros'],
  difficulty: 'Spicy',
  minutes: 40,
  world: 'newsprint',
  terms: ['velocity', 'damping', 'frame-rate'],
  howItWorks: [
    'The cloth is a grid of points joined by links, like a net. Gravity pulls every point down, and the links keep neighbors a fixed distance apart, which is what makes it hang and fold.',
    'The cut works by removing links: as the shears move along the chalk line, every link that connects the top half to the bottom half is deleted.',
    'Once the links are gone the halves are separate pieces: the top one is lifted away by its pinned edge and the bottom one drops.',
    'Folds are shaded by comparing each patch of cloth with how big it should be: squeezed patches go darker. Each point carries its **velocity** and loses a little to **damping** every frame.',
  ],
  whatElse: [
    'An intro for a fashion label or a tailor shop.',
    'A reveal for a sale or a collection launch.',
    'A transition between two sections of a page.',
  ],
  wants:
    'A heavy drape of cloth hangs in soft folds. A chalk line draws itself across it, shears snip along it, then the top half lifts away and the bottom half drops, swinging and folding, to reveal a name behind. Loose threads drift down. The cursor is a breeze on the cloth.',
  lookLines: ['Size the canvas for devicePixelRatio (capped at 2) and do all math in CSS pixels.'],
  behaviorLines: [
    'Run one requestAnimationFrame loop. dt = seconds since the last frame, clamped to 0.05; f = min(dt × 60, 2.5); t = seconds the loop has run (the sum of dt).',
    `Reduced-motion still frame: run the whole timeline at 60 frames a second up to ${FIXED.STILL_AFTER}s after the top half starts lifting, then draw that frame (the halves mid-fall, the name visible between them).`,
  ],
  interactionLines: [
    'The stage has touch-action: pan-y, so vertical swipes still scroll; a finger dragged across the cloth is the breeze.',
  ],
};
