import type { SceneMeta } from '../types';

export const meta: SceneMeta = {
  slug: 'warp',
  title: 'Hyperspace intro',
  summary: 'A drifting starfield. Press and hold to jump to light speed.',
  useCase: 'A launch page or dramatic intro.',
  tags: ['Landing pages', 'Events'],
  difficulty: 'Medium',
  minutes: 20,
  world: 'arcade',
  terms: ['easing', 'parallax', 'velocity'],
  howItWorks: [
    'Every star has a position in 3D. To draw it, we divide its x and y by its distance, so far stars bunch toward the middle and near ones spread out: that is perspective, a kind of **parallax**.',
    'Each frame, every star moves closer by the current speed; when it passes the screen, it is sent back far away.',
    'Pressing raises the target speed and the real speed **eases** toward it, so the jump to light speed builds up and winds down smoothly.',
    'Each star is drawn as a short line from where it was a moment ago, so faster speeds make longer streaks.',
  ],
  whatElse: [
    'A launch countdown that warps at zero.',
    'A game or music page intro.',
    'A "Back to the top" button that pulls you through space.',
  ],
  wants:
    'A full-screen starfield drifting toward me. When I press and hold, it accelerates into light-speed streaks and slows back down when I let go. A button follows my cursor a little when I get near it, like a magnet.',
  lookLines: [
    'Most stars (about 72%) are in the main text color; the rest use the three accent colors.',
    'Stars come in three sizes by distance: far (0.9px, 45% opacity), middle (1.8px, 75%) and near (3px, full).',
    'The vanishing point is the center of the screen, slightly above middle (45% down).',
    'A pill-shaped button in the main text color with the background color for its label.',
  ],
  behaviorLines: [
    'Stars have x and y between −1 and 1 and a depth z between 0.05 and 1. Screen position = center + (x / z, y / z) × 55% of the larger screen side.',
    'Each frame z decreases by speed × dt. Below 0.03 (or off screen), the star respawns far away at z 0.9–1.',
    'Speed eases toward its target: speed += (target − speed) × (1 − e^(−dt × 1.4)) when speeding up, and 2.2 instead of 1.4 when slowing down.',
    "The streak is a line from the star's position at depth z + speed × streak length to its current position.",
  ],
  interactionLines: [
    'Press and hold anywhere (mouse or touch) to warp.',
    'The button drifts toward the cursor when it comes within 170px of it, by the pull fraction of the distance.',
    'Clicking the button scrolls back to the top of the page.',
  ],
};
