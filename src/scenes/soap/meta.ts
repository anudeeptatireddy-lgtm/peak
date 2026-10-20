import type { SceneMeta } from '../types';
import { FIXED } from './constants';

const lam = FIXED.LAMBDA;
const lobe = (l: readonly number[]) =>
  `${l[0]} at ${l[1]}nm (widths ${l[2]} below and ${l[3]} above)`;

export const meta: SceneMeta = {
  slug: 'soap',
  title: 'Soap Film',
  summary:
    'A soap film stretched across a wire bent into your name, with real interference colors that drain, swirl and pop.',
  useCase: 'A wellness, beauty or cleaning brand reveal.',
  tags: ['Realistic', 'Brands'],
  difficulty: 'Spicy',
  minutes: 60,
  world: 'abyss',
  realistic: true,
  terms: ['velocity', 'damping', 'gravity'],
  howItWorks: [
    'Each letter holds a film, stored as a grid of thicknesses in nanometers. The shader turns thickness into color the way real light does: light bouncing off the front and back of the film adds up or cancels depending on the thickness, for each color of light.',
    '**Gravity** pulls the liquid down inside each letter, so the top thins toward black and the bottom thickens, while slow swirls carry the thickness around and stretch the colors into marbled bands.',
    'Your cursor is a breath: it bulges the film, which tilts it and slides the mirrored window across it, and it pushes the film around. Blow too hard and a letter pops into droplets.',
    'A popped letter stays empty for a moment and then a new film slides across it, with **velocity** that is slow enough to watch.',
  ],
  whatElse: [
    'A hero for a skincare, soap or cleaning brand.',
    'A loading screen where bubbles drain and renew while a page loads.',
    'A playful 404 page whose letters pop when you blow on them.',
  ],
  wants:
    'A close-up of soap films that look real. The name is made of letter-shaped wire frames, each holding a film with true thin-film colors, bright where it mirrors a window and black where it has drained thin at the top. My cursor is a breath: the film bulges and swirls, and if I blow too hard a letter pops into flying droplets, then a fresh film slides across it.',
  lookLines: [
    `Draw one WebGL 1 canvas that fills the screen; a single full-screen fragment shader paints every pixel. Simulate the films on the CPU in a grid of square cells (${FIXED.COLS} cells across at full quality). For each cell keep: the film thickness in nanometers, a bulge from 0 to 1, whether film is there, and which letter it belongs to (by the letter's horizontal extent). Upload the grid every frame as an RGBA texture with linear filtering (red: thickness ÷ ${FIXED.THICK_MAX} × ${FIXED.BYTE}; green: the bulge × 0.5 + 0.5, times ${FIXED.BYTE}; blue: ${FIXED.BYTE} where film is). Also draw the letters once on a 2D canvas ${FIXED.MASK_SCALE} of the screen size on a black background: fill them red, then stroke their outline in green with the wire width; upload it as a second texture (red: where a film may be; green: the wire).`,
    `Color from thin-film interference. For each pixel: view vector V = normalize(−x, y, ${FIXED.EYE_DIST}) where x runs across the screen in screen heights from the center and y runs up; film normal N = normalize(−dBulge/dx × ${FIXED.BULGE_SLOPE}, dBulge/dy × ${FIXED.BULGE_SLOPE}, 1) from the bulge differences between neighboring cells; cosI = N·V (at least 0.05); sinT² = (1 − cosI²) ÷ n²; cosT = sqrt(1 − sinT²). Fresnel reflectance R = R0 + (1 − R0) × (1 − cosI)^5 with R0 = ((n − 1) ÷ (n + 1))².`,
    `For ${lam[2]} wavelengths λ evenly spaced from ${lam[0]} to ${lam[1]}nm (the middle of each slice): phase δ = 4π × n × thickness × cosT ÷ λ and reflected intensity I = clamp(2 × R × (1 − cos δ), 0, 1) (the reflection off the front surface flips phase, the back one does not, so a film of zero thickness is black). Sum I × the CIE 1931 color matching functions (x̄, ȳ, z̄) over the wavelengths, times the slice width ÷ ${FIXED.Y_NORM}. The functions are the Wyman 2013 multi-lobe fit, each lobe being weight × e^(−½((λ − center) ÷ width)²) with the left width below the center and the right width above: x̄ = ${FIXED.CMF_X.map(lobe).join(', ')}; ȳ = ${FIXED.CMF_Y.map(lobe).join(', ')}; z̄ = ${FIXED.CMF_Z.map(lobe).join(', ')}. Convert XYZ to linear sRGB with the matrix [${FIXED.XYZ_TO_RGB.flat().join(', ')}] (row by row).`,
    `Lighting: the film mirrors direction r = reflect(−V, N) (use only its x and y), so the window slides across the film as the view angle and the bulge change. Light(r) = room ${FIXED.ROOM_LIGHT} + window ${FIXED.WINDOW_LIGHT} × the reflection setting inside the window. Film color = (the interference color + ${FIXED.BLACK_FILM} gray, mixed with its own gray by the color strength) × Light × ${FIXED.FILM_GAIN} × the film's coverage. The scene behind the film is the ground color × ${FIXED.BACK_DEPTH} (in linear light) darkened by ${FIXED.VIGNETTE} × the squared distance from the center. Add the film color to it.`,
    `The wire, drawn over the film: its color is the ground color ${FIXED.WIRE_MIX} of the way to the text color, shaded by a normal made from the wire mask's own gradient (strength ${FIXED.WIRE_ROUND}): 0.25 + 0.75 × N·L, where L points at the window, plus a highlight ((N·H) raised to ${FIXED.WIRE_POWER}) × ${FIXED.WIRE_SPEC}. Droplets are drawn last (a loop over at most ${FIXED.MAX_DROPS}).`,
    `Finish: tone map each channel with 1 − e^(−${FIXED.TONE} × value), apply gamma 1 ÷ ${FIXED.GAMMA}, and add a tiny random dither of one 8-bit step. Do all shading in linear light (convert hex colors with gamma ${FIXED.GAMMA}).`,
    'Imperfection: the film is never even: it starts thicker toward the wire, a little thicker at the bottom of each letter, and patchy; the drain stretches and layers the colors; swirls marble them; droplets wobble. If WebGL is unavailable, fill the canvas with the ground color, draw each letter filled with a vertical gradient from near black at the top through the three accent colors to the lightest accent at the bottom, and outline it with the wire.',
  ],
  behaviorLines: [
    'Run one requestAnimationFrame loop. dt = seconds since the last frame, clamped to 0.05.',
    `Reduced-motion still frame: no animation. Start a fresh film, run the drain and swirl for ${FIXED.STILL_AGE} seconds in steps of ${FIXED.STILL_STEP} seconds, bulge the film under a breath at (${Number((FIXED.STILL_BREATH[0]! * 100).toFixed(2))}% of the width, ${Number((FIXED.STILL_BREATH[1]! * 100).toFixed(2))}% of the height), draw one frame, and stop.`,
  ],
  interactionLines: [
    'The stage has touch-action: pan-y, so vertical swipes still scroll; a finger blows only while dragging after a short press and hold.',
  ],
};
