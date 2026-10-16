import type { SceneMeta } from '../types';

export const meta: SceneMeta = {
  slug: 'flow',
  title: 'Living wallpaper',
  summary: 'Thousands of particles riding an invisible current. Press and hold to stir it.',
  useCase: 'A calm animated background, or just something to play with.',
  tags: ['Backgrounds', 'Just for fun'],
  difficulty: 'Medium',
  minutes: 20,
  world: 'glacier',
  terms: ['flow-field', 'particle-system', 'trail'],
  howItWorks: [
    'An invisible current covers the screen: at every point, a smooth formula gives a direction to move in. That is a **flow field**.',
    'Thousands of particles follow it, and the formula slowly changes over time, so the currents shift.',
    'Instead of clearing the screen each frame, we fade it a little, so each particle leaves a **trail**.',
    'Pressing and holding adds a whirlpool around your finger or cursor.',
  ],
  whatElse: [
    'A calm background behind a portfolio intro.',
    'A screensaver-style page for a waiting room or a stream.',
    'A section divider that swirls when you touch it.',
  ],
  wants:
    'A full-screen living wallpaper: thousands of tiny particles drift along an invisible, slowly shifting current and leave soft fading trails. When I press and hold, a whirlpool forms around my cursor or finger and stirs them.',
  lookLines: ['Size the canvas for devicePixelRatio (capped at 2) and draw in CSS pixels.'],
  behaviorLines: [
    'Run one requestAnimationFrame loop. dt = seconds since the last frame, clamped to 0.05; t = seconds the loop has run (the sum of dt).',
    "Rebuild all particles and repaint the background on every resize and once more when the Anybody font has finished loading (wait for document.fonts.load('900 120px Anybody'), document.fonts.load('italic 800 120px Anybody') and document.fonts.load('400 120px Anybody'), then document.fonts.ready; give up waiting after 2.5 seconds); repaint the background whenever the background color changes (this clears the trails).",
    'Reduced-motion still frame: repaint the background, then run 70 steps with t = step ÷ 60 and f = 1, without the stir.',
  ],
  interactionLines: [
    'Stir with a mouse button held down. On touch, the stir starts once a finger has been held still for a quarter of a second, so normal swipes still scroll the page (touch-action: pan-y; once stirring, stop the page from scrolling).',
  ],
};
