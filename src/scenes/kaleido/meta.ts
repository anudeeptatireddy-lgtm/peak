import type { SceneMeta } from '../types';

export const meta: SceneMeta = {
  slug: 'kaleido',
  title: 'Kaleidoscope',
  summary: 'Draw with your cursor and your strokes mirror into a slowly turning kaleidoscope.',
  useCase: 'A "make your own pattern" toy or a mesmerizing background.',
  tags: ['Just for fun', 'Backgrounds'],
  difficulty: 'Easy',
  minutes: 15,
  world: 'vapor',
  terms: ['transform', 'trail', 'opacity'],
  howItWorks: [
    'The screen is cut into wedges like a pizza, and everything you draw is folded into one wedge.',
    'Each wedge is then copied around the center, every other copy flipped, using a **transform** (rotate, then mirror), so the pattern is symmetrical.',
    'The whole picture slowly turns, and old strokes fade a little each frame, which leaves a soft **trail** instead of filling up.',
    'When nobody is drawing, a point wanders on its own so the pattern keeps growing.',
  ],
  whatElse: [
    'A calming background for a meditation or sleep app.',
    'A playful "make a pattern and share it" page.',
    'A loading screen that draws itself.',
  ],
  wants:
    'A kaleidoscope: I move the cursor to draw and my strokes are mirrored around the center into a symmetrical pattern that slowly turns. Old strokes fade so it never fills up. When I leave it alone it draws by itself.',
  lookLines: ['Size the canvas for devicePixelRatio (capped at 2) and do all math in CSS pixels.'],
  behaviorLines: [
    'Run one requestAnimationFrame loop. dt = seconds since the last frame, clamped to 0.05; f = min(dt × 60, 2.5); t = seconds the loop has run (the sum of dt).',
    'Keep strokes on a second, hidden canvas of the same size. The visible canvas is cleared and redrawn from it every frame.',
    'Reduced-motion still frame: the pattern after the self-drawing point has run 300 frames at f = 1 and dt = 1/60, with nothing moving.',
  ],
  interactionLines: [
    'The stage has touch-action: pan-y, so vertical swipes still scroll. On a touch screen, drawing starts after a press-and-hold of about 250ms.',
  ],
};
