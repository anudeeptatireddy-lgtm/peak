import type { SceneMeta } from '../types';

export const meta: SceneMeta = {
  slug: 'anamorphic',
  title: 'Anamorphic',
  summary: 'Flat shards float in 3D and line up into your name from one exact viewpoint.',
  useCase: 'A creative studio or portfolio hero.',
  tags: ['Portfolio', 'Cursor'],
  difficulty: 'Medium',
  minutes: 35,
  world: 'vapor',
  terms: ['parallax', 'easing', 'transform'],
  howItWorks: [
    'Each shard sits on a point of the name, then is pushed toward or away from the camera along its line of sight, and grown or shrunk by the same amount. From the starting view nothing seems to change.',
    'Moving the cursor orbits the camera around the middle (a 3D **transform**). Near shards and far shards slide by different amounts (**parallax**), so the name breaks apart.',
    'Near the sweet spot the camera is pulled into place, with **easing**, so the name snaps together.',
    'The floating also happens along each line of sight, so it is invisible from the sweet spot.',
  ],
  whatElse: [
    'A portfolio hero that reveals a different word from a second viewpoint.',
    'A product launch where shards form the logo as the page scrolls.',
    'An exhibition poster that rewards visitors for finding the angle.',
  ],
  wants:
    'Flat-colored shards floating in 3D space in front of the camera. Moving the cursor (or tilting a phone) orbits the view, and the shards drift apart in depth. At one exact viewpoint, the middle of the screen, they line up and spell a name, and the camera gently snaps into that view when it gets close.',
  lookLines: [
    'A full-screen canvas (100svh, at least 540px), transparent over the background and cleared every frame. Size it for devicePixelRatio (capped at 2) and do all math in CSS pixels, with the origin at the center of the canvas.',
  ],
  behaviorLines: [
    'Run one requestAnimationFrame loop. dt = seconds since the last frame, clamped to 0.05; f = min(dt × 60, 2.5).',
    'Lay out the shards again on every resize and once more when the Anybody font has finished loading; nothing is drawn before the font loads. Use a seeded random number generator so the layout is the same every visit.',
    'Reduced-motion still frame: the camera exactly at the sweet spot and no floating, so the name is fully aligned.',
  ],
  interactionLines: ['The canvas has touch-action: pan-y, so vertical swipes still scroll.'],
  unreleased: true,
};
