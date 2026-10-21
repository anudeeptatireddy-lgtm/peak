import type { SceneMeta } from '../types';

export const meta: SceneMeta = {
  slug: 'torchmap',
  title: 'Torch Map',
  summary: 'Carry a torch through a fogged map to uncover your name, laid out in stone tiles.',
  useCase: 'Games, game studios, esports and escape rooms.',
  tags: ['Gaming', 'Cursor'],
  difficulty: 'Medium',
  minutes: 50,
  world: 'toxic',
  terms: ['opacity', 'easing', 'particle-system'],
  howItWorks: [
    'A map wider than the screen sits under a grid of fog. Each fog cell has an **opacity** that the torch lowers around the cursor, with a soft edge.',
    'Every cell remembers the most it has been cleared, so places you have explored stay dimly visible.',
    'The torch flickers gently (a small change in size, at most a few times a second), and the view slides along the map as you move toward an edge (**easing**).',
    'When every stone of the name has been found, the stones glow up slowly and a few sparks drift up (a small **particle system**), with no flashing.',
  ],
  whatElse: [
    'A game studio’s landing page where the logo is hidden in the map.',
    'An escape room site where visitors uncover the booking button.',
    'A treasure-hunt invitation that reveals the date and place.',
  ],
  wants:
    'A stylized top-down map hidden under dark fog. My cursor carries a torch that clears the fog around it with a soft, gently flickering edge, and explored areas stay dimly revealed. A name is laid out on the map as a path of stone tiles, uncovered piece by piece, and when the last tile is found the stones glow up slowly and a few sparks drift up, with nothing flashing.',
  lookLines: [
    'A full-screen canvas (100svh, at least 540px), filled every frame. Size it for devicePixelRatio (capped at 2) and do all math in CSS pixels. The fog color is whichever of the background and text colors is darker; the map is the surface color.',
  ],
  behaviorLines: [
    'Run one requestAnimationFrame loop. dt = seconds since the last frame, clamped to 0.05; f = min(dt × 60, 2.5).',
    'Draw the map once into a hidden canvas, again on every resize and once more when the Anybody font has finished loading. Use a seeded random number generator so the map is the same every visit.',
    'Reduced-motion still frame: the map fully explored (every cell at its remembered dimness), the name revealed and glowing, no flicker and no sparks.',
  ],
  interactionLines: [
    'The canvas has touch-action: pan-y, so vertical swipes still scroll; on touch screens the torch follows a finger that is held down.',
  ],
};
