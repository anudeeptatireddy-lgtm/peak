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
  lookLines: ['Size the canvas for devicePixelRatio (capped at 2) and draw in CSS pixels.'],
  behaviorLines: [
    'Run one requestAnimationFrame loop. dt = seconds since the last frame, clamped to 0.05; t = seconds the loop has run (the sum of dt).',
    'Each frame, in this order: ease the speed, move every star (respawning any that got too close), draw (respawning any that left the screen), then move the button.',
    'Reduced-motion still frame: the stars drawn with only the resting streak.',
  ],
  interactionLines: [
    'Press and hold anywhere on the canvas (mouse or touch) to warp; letting go slows back to cruise.',
    'The button follows the mouse only, not touch. Clicking it scrolls back to the top of the page (smoothly, unless reduced motion is on).',
  ],
};
