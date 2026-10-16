import type { SceneMeta } from '../types';

export const meta: SceneMeta = {
  slug: 'particles',
  title: 'Your name in particles',
  summary: 'A word made of thousands of dots. Push through it, click to blow it apart.',
  useCase: 'A portfolio or personal-page intro.',
  tags: ['Portfolio', 'Headlines'],
  difficulty: 'Medium',
  minutes: 20,
  world: 'dreamhouse',
  terms: ['particle-system', 'spring', 'damping', 'impulse'],
  howItWorks: [
    'The word is drawn once on an invisible canvas, and we record where its pixels are.',
    'Each dot gets one of those spots as its home.',
    'Every frame, an invisible **spring** pulls each dot toward home, and **damping** slowly calms it down.',
    'Your cursor pushes nearby dots away; a click gives every dot a kick outward (an **impulse**).',
  ],
  whatElse: [
    'Use your own name as the intro to a portfolio.',
    'Spell a countdown number that rebuilds every second.',
    'Make the dots change color with their speed (see Next steps).',
  ],
  wants:
    'A full-screen intro where my word is made of thousands of small dots. When the page loads, the dots swarm in from all over the screen and settle into the letters. Moving my cursor pushes dots out of the way, and clicking makes them explode outward and then pull back into the word.',
  lookLines: [
    'A full-screen canvas covering the whole viewport (100svh tall, at least 540px), on the page background. The canvas itself is transparent and is cleared every frame.',
    'Size the canvas for devicePixelRatio (capped at 2) and do all drawing and sampling math in CSS pixels.',
    'Each dot is a filled circle in one of the three accent colors, picked at random per dot. Draw all dots of one color as a single path and fill it once, color by color in the order of the three accents, using the blend mode above.',
  ],
  behaviorLines: [
    'Every frame: f = min(dt × 60, 2.5), where dt is the seconds since the last frame (clamped to 0.05). For each dot: acceleration = (home − position) × its stiffness, plus the cursor push; velocity = (velocity + acceleration × f) × damping^f; position += velocity × f.',
    'Whenever the canvas is resized (and once the font has loaded), sample the word again: dot number i gets home number i. Existing dots keep their position, velocity and color and glide to their new homes; only dots beyond the old count are new. Every dot picks a new stiffness and radius on each rebuild.',
    'To make the result exactly reproducible: collect grid points row by row (top to bottom, left to right in each row), and when building each dot call Math.random() in exactly this order: x position, y position, x velocity, y velocity (these four only for new dots), then stiffness, then radius, then color (color only for new dots).',
    'Reduced-motion still frame: every dot sits exactly at its home.',
  ],
  interactionLines: [
    'Listen for pointer events on the canvas: pointermove and pointerdown update the pointer position and mark it active; pointerleave and pointercancel mark it inactive.',
    'A click (on release) explodes the word. On touch, a tap explodes it and a finger pushes dots while it is down; vertical swipes still scroll the page (touch-action: pan-y on the canvas).',
  ],
};
