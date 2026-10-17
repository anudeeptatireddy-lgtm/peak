import type { SceneMeta } from '../types';
import { FIXED } from './constants';

export const meta: SceneMeta = {
  slug: 'tunnel',
  title: 'Infinite tunnel',
  summary: 'Fly through an endless tunnel of glowing rings and stripes that twists and turns.',
  useCase: 'A dramatic intro or a music page.',
  tags: ['Landing pages', 'Just for fun'],
  difficulty: 'Spicy',
  minutes: 30,
  world: 'arcade',
  terms: ['blend-mode', 'lerp', 'frame-rate'],
  howItWorks: [
    'The tunnel is a long row of rings in 3D, each one a little further away, and perspective makes far rings small and near rings big.',
    'The path winds because each ring is shifted a little by smooth noise, and you seem to fly because the rings slide toward you, easing with a **lerp** when you steer or boost.',
    'Faster flight spreads the rings further apart, so light and dark never alternate more than three times a second, which keeps it safe to watch.',
    'Rings overlap through a **blend mode** so glowing colors add up.',
  ],
  whatElse: [
    'A dramatic intro screen for a game or event.',
    'A music page where the tunnel speeds up on the chorus.',
    'A loading screen that hurtles forward.',
  ],
  wants:
    'I fly through an endless tunnel of glowing rings and stripes that twists and turns. My cursor steers, and pressing and holding speeds me up. The rings spread further apart as I go faster, so nothing ever flashes more than three times a second.',
  lookLines: [
    'Size the canvas for devicePixelRatio (capped at 2) and do all math in CSS pixels.',
    `After the rings, add a soft glow of fog at the vanishing point: a radial gradient from the background color at ${FIXED.FOG_ALPHA} opacity at the center to transparent at ${FIXED.FOG_REACH} × the short side.`,
  ],
  behaviorLines: [
    'Run one requestAnimationFrame loop. dt = seconds since the last frame, clamped to 0.05; f = min(dt × 60, 2.5); t = seconds the loop has run (the sum of dt).',
    `Reduced-motion still frame: the tunnel at rest, with frac = ${FIXED.STILL_FRAC}, no steering and no boost.`,
  ],
  interactionLines: [
    'The stage has touch-action: pan-y, so vertical swipes still scroll. On a phone it steers itself, and a press-and-hold boosts.',
  ],
};
