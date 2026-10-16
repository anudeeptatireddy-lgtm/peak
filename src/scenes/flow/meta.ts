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
  lookLines: [
    'Particles are short line segments in the three accent colors (one third each), drawn at 90% opacity.',
    'Each frame, fade the previous frame a little instead of clearing it, so movement leaves trails.',
    'Draw one path per color per frame.',
  ],
  behaviorLines: [
    "The current's angle at (x, y) and time t is sin(x × s + t × 0.23) × 1.9 + cos(y × s × 1.4 − t × 0.17) × 1.6 + sin((x − y) × s × 0.6 + t × 0.11) × 1.3, where s is the swirl size.",
    'Each particle lives 40–260 frames, then respawns at a random spot; it also respawns when it leaves the screen.',
    'Use about one particle per 620 square pixels of screen, between 500 and the particle count.',
  ],
  interactionLines: [
    'Press and hold (mouse or touch): particles within the stir radius orbit around the pointer and get pulled in slightly.',
    'Touch: a normal swipe still scrolls; press and hold to stir.',
  ],
};
