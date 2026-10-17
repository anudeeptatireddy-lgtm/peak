import type { SceneMeta } from '../types';

export const meta: SceneMeta = {
  slug: 'halftone',
  title: 'Halftone paper',
  summary: 'A sheet of halftone dots that swell, push out and misprint around your cursor.',
  useCase: 'A print-inspired hero for a studio, shop or zine.',
  tags: ['Backgrounds', 'Landing pages'],
  difficulty: 'Easy',
  minutes: 15,
  world: 'riso',
  terms: ['easing', 'lerp', 'blend-mode'],
  howItWorks: [
    'The page is covered in small gray dots on a honeycomb grid, like a halftone print.',
    'Around the cursor a soft bump (a smooth **easing** curve) makes dots grow and push outward, and those dots are printed in the three inks instead of gray.',
    'Each ink is shifted a little, like paper that slipped in the press; moving fast shifts them further. The swell follows the cursor with a **lerp**, so it glides.',
    'Clicks send rings rolling out through the dots, and the inks overlap through a **blend mode**.',
  ],
  whatElse: [
    'A print-inspired hero for a design studio.',
    'A zine or poster shop landing page.',
    'A section divider that reacts as you scroll past.',
  ],
  wants:
    'A sheet of small gray halftone dots. Around my cursor the dots swell, push outward and split into three inks, slightly out of register like a riso print; moving fast exaggerates the misprint. Clicks send rings rolling through the dots, and when I leave it alone the swell wanders by itself.',
  lookLines: ['Size the canvas for devicePixelRatio (capped at 2) and do all math in CSS pixels.'],
  behaviorLines: [
    'Run one requestAnimationFrame loop. dt = seconds since the last frame, clamped to 0.05; f = min(dt × 60, 2.5); t = seconds the loop has run (the sum of dt).',
    'Rebuild the dot grid on every resize; the swell starts (once) at 64% of the width and 40% of the height, at rest.',
    'Reduced-motion still frame: the swell resting where it starts, toward the upper right.',
  ],
  interactionLines: ['The canvas has touch-action: pan-y, so vertical swipes still scroll.'],
};
