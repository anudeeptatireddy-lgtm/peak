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
    'Each dot is a small filled circle in one of the three accent colors, picked at random.',
    'Draw all dots of one color as a single path, one fill per color, so it stays fast.',
    'The canvas is transparent over the page background.',
  ],
  behaviorLines: [
    'Every frame, each dot accelerates toward its home spot by (home − position) × its stiffness, then its velocity is multiplied by the bounciness value.',
    'Use a frame factor f = min(dt × 60, 2.5) so the motion is the same at 60Hz and 120Hz.',
    'On window resize, re-sample the word and give dots new homes, keeping their current positions so they glide over.',
  ],
  interactionLines: [
    'Mouse: dots within the cursor reach are pushed away, harder the closer they are.',
    'Click or tap: every dot gets a kick away from the click point, weaker with distance, plus a little randomness.',
    'Touch: a tap explodes the word; dragging does nothing, so the page still scrolls.',
  ],
};
