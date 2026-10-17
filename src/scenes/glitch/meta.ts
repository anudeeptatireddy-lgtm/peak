import type { SceneMeta } from '../types';
import { FIXED } from './constants';

export const meta: SceneMeta = {
  slug: 'glitch',
  title: 'Glitch',
  summary: 'A headline tears into slices and splits into three ink channels, then snaps clean.',
  useCase: 'A tech, music or portfolio headline with an edge.',
  tags: ['Headlines', 'Portfolio'],
  difficulty: 'Spicy',
  minutes: 20,
  world: 'vapor',
  terms: ['blend-mode', 'opacity', 'frame-rate'],
  howItWorks: [
    'The headline is drawn three times, once in each ink, and during a burst the copies slide apart a few pixels.',
    'The picture is also cut into thin horizontal slices, and each slice jumps sideways by its own random amount, which looks like a broken screen.',
    'The **blend mode** lets the three inks mix where they overlap, and a fading **opacity** lets you see through them.',
    'Every burst changes the picture only twice (tear, then snap clean), and bursts are spaced so nothing changes more than three times a second, which is what keeps it safe to look at.',
  ],
  whatElse: [
    'A headline with an edge for a music or tech page.',
    'A portfolio name that glitches when you hover it.',
    'A 404 page that glitches now and then.',
  ],
  wants:
    'A calm headline in the middle of the page. When I hover or tap it, it tears into horizontal slices that jump sideways while its three ink colors split apart, then snaps clean after a short burst. Now and then a small glitch happens by itself. Only the headline glitches, never the whole screen, and nothing flashes more than three times a second.',
  lookLines: ['Size the canvas for devicePixelRatio (capped at 2) and do all math in CSS pixels.'],
  behaviorLines: [
    'Run one requestAnimationFrame loop. dt = seconds since the last frame, clamped to 0.05; t = seconds the loop has run (the sum of dt).',
    `Safety: a burst changes the picture twice, once when it starts and once when it ends. Keep a list of the times of recent changes. A new burst of length L starting now may begin only if adding its two changes (now and now + L) leaves no more than ${FIXED.RATE_CAP} changes inside any window shorter than 1 second; otherwise ignore the trigger (a hover that is refused tries again on the next frame while the pointer is still over the headline). Nothing is ever inverted, and only the headline's own pixels move.`,
    'Reduced motion: never start a burst, not even automatic ones, and show only the still frame.',
    'Reduced-motion still frame: the clean headline in the main text color with the three channels drawn with their resting split, no slices.',
  ],
  interactionLines: [
    'The stage has touch-action: pan-y, so vertical swipes still scroll; tapping the headline starts a burst.',
  ],
};
