import type { SceneMeta } from '../types';

export const meta: SceneMeta = {
  slug: 'marbles',
  title: 'Text to marbles',
  summary:
    'A headline made of glass marbles. Click to smash it into a pile, click again to rebuild.',
  useCase: 'A playful portfolio intro or a "smash it" landing headline.',
  tags: ['Headlines', 'Just for fun'],
  difficulty: 'Spicy',
  minutes: 30,
  world: 'cherry',
  terms: ['gravity', 'momentum', 'spring', 'damping', 'impulse'],
  howItWorks: [
    'The headline is drawn on an invisible canvas, and a grid of spots inside its letters becomes the marbles’ homes.',
    'A click breaks it: **gravity** pulls every marble down, and marbles that touch push apart and trade **momentum**, so the pile bounces and rolls.',
    'To keep thousands of collisions fast, marbles are sorted into a grid of cells and only check their neighbors.',
    'Click again and a **spring** pulls each marble back home, with **damping** to calm the wobble.',
  ],
  whatElse: [
    'A landing page headline you can smash.',
    'A 404 page where the error number falls apart.',
    'A guestbook where every visitor’s name turns into marbles.',
  ],
  wants:
    'A big headline built from small glass marbles, each with a soft shadow and a little highlight. When I click, it shatters: the marbles drop, bounce, roll, collide and pile up at the bottom of the screen. Clicking again makes every marble fly back into its letter. While they’re piled up, my cursor shoves the pile around.',
  lookLines: [
    'A full-screen canvas (100svh, at least 540px), transparent, cleared every frame, on the page background. Size it for devicePixelRatio (capped at 2) and do all math in CSS pixels.',
  ],
  behaviorLines: [
    'Run one requestAnimationFrame loop. dt = seconds since the last frame, clamped to 0.05; f = min(dt × 60, 2.5).',
    'Each marble picks its accent color when it is created, with one Math.random() call: floor(random × 3). Create marbles in home order.',
    'Don’t sample until the Anybody font has finished loading (draw nothing before that), then sample again on every resize. Marble i keeps its position, velocity and color and gets home i; new marbles start at their home, and extra old marbles are removed.',
    'The headline starts whole, every marble at home. A click (on release) toggles between shattering it and rebuilding it.',
    'Store positions and velocities in Float32Array (so rounding matches). Collision pairs come from a grid of cells one marble diameter wide covering the canvas (cell = floor(position ÷ diameter), clamped to the grid), rebuilt every frame with marbles listed in index order inside each cell. For each marble i in index order, look through the cells within one diameter of its center, row by row from the top-left, and handle every j > i in the order listed, applying each push and impulse immediately.',
    'Each frame while shattered: the pointer push, then gravity, then air drag, then move every marble (position += velocity × f). Then resolve collisions: find overlapping pairs with a spatial hash grid (cell size = one marble diameter, rebuilt every frame); for each pair (i < j), push them apart along the line between their centers so they just touch, split by mass (mass = radius², so half each here), and if they are moving toward each other, apply an impulse along that line: impulse = −(1 + restitution) × (relative velocity along the line) ÷ (1/m₁ + 1/m₂). Then the walls: the floor is the bottom of the canvas and the side walls are its edges (no ceiling); a marble past a wall is put back against it, its velocity into the wall reversed and multiplied by the restitution, and on the floor it also gets the rolling friction.',
  ],
  interactionLines: [
    'Listen for pointer events on the canvas (touch-action: pan-y). A click or tap (on release) shatters or rebuilds.',
  ],
};
