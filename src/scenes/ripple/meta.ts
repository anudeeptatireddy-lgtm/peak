import type { SceneMeta } from '../types';

export const meta: SceneMeta = {
  slug: 'ripple',
  title: 'Ripple background',
  summary: 'A calm dot grid. Drop ripples into it and push the dots around.',
  useCase: 'An interactive background for a landing page.',
  tags: ['Backgrounds', 'Landing pages'],
  difficulty: 'Medium',
  minutes: 20,
  world: 'abyss',
  terms: ['easing', 'opacity', 'blend-mode'],
  howItWorks: [
    'The background is a grid of small dots that each remember their home spot.',
    'A click starts a ring that grows outward at a steady speed and fades over time.',
    "Dots near the ring get pushed along it and light up in the ring's color; where colors overlap they mix with a **blend mode**.",
    'Your cursor gently pushes nearby dots away, and when nobody is around, ripples start on their own.',
  ],
  whatElse: [
    'A landing page background behind a big headline.',
    'A contact section where every click leaves a ripple.',
    'A loading screen that ripples while it waits.',
  ],
  wants:
    'A calm, full-screen grid of small dots. When I click, a ring ripples out from that spot, pushing the dots outward and lighting them up in color as it passes. My cursor pushes nearby dots away. When nobody is interacting, ripples start by themselves every few seconds.',
  lookLines: [
    'Resting dots are tiny (radius 1.3px) in the secondary text color at 38% opacity.',
    'Excited dots grow (up to about 5px) and take the color of the ring that excited them, cycling through the three accent colors per ripple.',
    'Draw one path per color so each color is a single fill.',
  ],
  behaviorLines: [
    'Each ring has a center, a start time and a color. A dot at distance d from the center, when the ring has radius r, gets k = (d − r) / ring width; if |k| < 2.5 it is displaced by sin(2k) × e^(−k²) × e^(−age × fade) × push, outward from the center.',
    'Dots ease toward their displaced position by 25% per frame, so the grid looks liquid.',
    'Keep at most 8 rings, and drop rings older than 5 seconds.',
  ],
  interactionLines: [
    'Click or tap: drop a ripple at that point.',
    'Mouse: dots within the cursor reach are pushed away.',
    'Idle: after 3.5 seconds without clicks, a ripple starts at a random spot every few seconds.',
  ],
};
