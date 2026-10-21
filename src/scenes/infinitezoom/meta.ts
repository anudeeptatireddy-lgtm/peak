import type { SceneMeta } from '../types';

export const meta: SceneMeta = {
  slug: 'infinitezoom',
  title: 'Infinite Zoom',
  summary: 'Scroll to zoom into a city that spells your name, forever, with no visible seam.',
  useCase: 'Real estate, travel, tech and agency sites.',
  tags: ['Real estate', 'Tech & AI'],
  difficulty: 'Spicy',
  minutes: 75,
  world: 'vapor',
  terms: ['scroll-linked', 'transform', 'easing'],
  blends: false,
  howItWorks: [
    'The rooftops of a city seen from above spell the name. One building has a skylight, and inside it hangs a picture of the same city, smaller and slightly turned.',
    'That picture has the same skylight, with a smaller picture in it, and so on: each level is the one above it moved by the same **transform** (shrink, turn, move).',
    'The camera zooms toward the one point that transform leaves in place. After exactly one level of zoom, the picture fills the screen exactly as the city did, so the loop starts again with no seam.',
    'Scrolling zooms in or out (**scroll-linked**), with **easing**; left alone, it zooms in slowly.',
  ],
  whatElse: [
    'A real estate site that zooms from the city to one listing.',
    'An agency intro that dives into its own logo forever.',
    'A travel page where each loop lands on a new destination name.',
  ],
  wants:
    'A flat-illustrated city seen from above, where the rooftops spell a name. One building has a skylight with a picture on the room’s wall that shows the same city again, smaller and slightly rotated. Scrolling zooms into that picture forever, rotating a little as it goes, with no visible seam where the loop repeats.',
  lookLines: [
    'A full-screen canvas (100svh, at least 540px), filled with the background color every frame (it has to be opaque so the inner pictures match the outer city). Size it for devicePixelRatio (capped at 2) and do all math in CSS pixels.',
  ],
  behaviorLines: [
    'Run one requestAnimationFrame loop. dt = seconds since the last frame, clamped to 0.05; f = min(dt × 60, 2.5).',
    'Build the city once in screen coordinates (as cached Path2D objects, one per color), again on every resize and once more when the Anybody font has finished loading. Every level reuses the same paths under a different canvas transform. Use a seeded random number generator so the city is the same every visit.',
    'Reduced-motion still frame: the top-level view (zoom 0).',
  ],
  interactionLines: ['The canvas has touch-action: pan-y, so vertical swipes still scroll.'],
};
