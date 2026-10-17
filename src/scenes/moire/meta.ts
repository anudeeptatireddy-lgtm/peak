import type { SceneMeta } from '../types';
import { FIXED } from './constants';

export const meta: SceneMeta = {
  slug: 'moire',
  title: 'Moiré',
  summary:
    'Two layers of fine rings, lines or dots interfere into large shimmering waves as you move.',
  useCase: 'An op-art background or a hypnotic section break.',
  tags: ['Backgrounds'],
  difficulty: 'Easy',
  minutes: 10,
  world: 'riso',
  terms: ['blend-mode', 'lerp', 'frame-rate'],
  howItWorks: [
    'Each layer is a simple pattern of thin lines, rings or dots in one ink.',
    'The layers overlap through a **blend mode**, and where their gaps do not line up you see big soft bands: the moiré effect.',
    'Moving the cursor slides and turns one layer toward where you point, using a **lerp** so it glides, and even a tiny shift moves the bands a long way.',
    'The speed is capped so the bands never pulse faster than three times a second, which keeps it calm and safe to look at.',
  ],
  whatElse: [
    'An op-art background for a gallery or music site.',
    'A hypnotic section break between two parts of a page.',
    'A loading screen that slowly shimmers.',
  ],
  wants:
    'Two or three layers of fine rings, lines or dots lie on top of each other and interfere into big shimmering bands. Moving my cursor slides and turns one layer, and when I leave it alone the pattern drifts slowly. The motion is slow enough that no spot ever pulses more than three times a second.',
  lookLines: [
    'Size the canvas for devicePixelRatio (capped at 2) and do all math in CSS pixels.',
    `Draw each pattern slightly bigger than the screen (${FIXED.COVER} × the diagonal) so no corner is empty when it turns. Layer 1 stays fixed and is drawn in the first accent color, layer 2 in the second and layer 3 in the third, each with the blend mode above.`,
  ],
  behaviorLines: [
    'Run one requestAnimationFrame loop. dt = seconds since the last frame, clamped to 0.05; f = min(dt × 60, 2.5); t = seconds the loop has run (the sum of dt).',
    `Safety: the layers move toward their target, but never faster than a speed cap so the bands beat at most ${FIXED.RATE_CAP} times a second at any spot. Let h = ${FIXED.RATE_CAP} ÷ 2 (÷ ${1 + Math.abs(FIXED.SECOND_SCALE)} when there are 3 layers, because the third moves relative to the second too). Layer 2 may slide at most h × spacing pixels per second and turn at most h × spacing ÷ R radians per second, where R is half the screen diagonal. Each frame cap the slide distance at h × spacing × dt and the turn at h × spacing ÷ R × dt.`,
    `Layer 3 slides and turns ${FIXED.SECOND_SCALE} × as much as layer 2 (the opposite way).`,
    `Reduced-motion still frame: layer 2 shifted sideways by ${FIXED.STILL_SHIFT} × the spacing and turned ${FIXED.STILL_TURN}°, nothing moving.`,
  ],
  interactionLines: [
    'The stage has touch-action: pan-y, so vertical swipes still scroll; on a phone, dragging sideways shifts the pattern.',
  ],
};
