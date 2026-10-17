import type { SceneMeta } from '../types';
import { FIXED } from './constants';

export const meta: SceneMeta = {
  slug: 'jelly',
  title: 'Jelly cards',
  summary: 'Cards that jiggle when tapped, and lag, lean and wobble to rest when you drag them.',
  useCase: 'Cards for projects, links or products that feel squishy and fun.',
  tags: ['Portfolio', 'Just for fun'],
  difficulty: 'Easy',
  minutes: 15,
  world: 'lava',
  accessible: true,
  terms: ['spring', 'damping', 'velocity'],
  howItWorks: [
    'Each card has a target position, and a **spring** pulls the card toward it, so it overshoots and wobbles instead of stopping dead.',
    'While you drag, the target follows your pointer and the card lags behind it, leaning and stretching with its **velocity**.',
    '**Damping** takes a bit of speed away each frame, which is why the wobble fades out.',
    'A tap squashes the card and tips it, and the same spring brings it back.',
  ],
  whatElse: [
    'Project cards on a portfolio that you can pick up and play with.',
    'Link cards on a bio page.',
    'Product cards on a playful shop page.',
  ],
  wants:
    'A few cards that feel like jelly. Tapping one makes it jiggle. Dragging one makes it lag and lean, and when I drop it, it wobbles to rest where I let go. The cards are real buttons.',
  lookLines: [],
  behaviorLines: [
    'Run one requestAnimationFrame loop. dt = seconds since the last frame, clamped to 0.05; f = min(dt × 60, 2.5).',
    `Reduced-motion still frame: the cards at rest, slightly fanned (${FIXED.FAN}° apart), no wobble.`,
  ],
  interactionLines: [
    'Cards are real buttons, so Enter and Space jiggle them. The stage keeps touch-action: pan-y; on touch, a press-and-hold of about 250ms starts a drag.',
  ],
};
