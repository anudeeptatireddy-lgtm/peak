import type { SceneMeta } from '../types';
import { FIXED } from './constants';

export const meta: SceneMeta = {
  slug: 'velvet',
  title: 'Velvet Brush',
  summary:
    'The screen is crushed velvet: brush it with your cursor and the fibers flip, leaving light and dark trails.',
  useCase: 'A fashion, luxury or furniture brand intro.',
  tags: ['Realistic', 'Brands'],
  difficulty: 'Spicy',
  minutes: 60,
  world: 'cherry',
  realistic: true,
  terms: ['lerp', 'velocity', 'damping'],
  howItWorks: [
    'The velvet is a grid of fibers. Each cell remembers which way its fibers lean, and a hidden copy of your name makes the fibers inside the letters lean the opposite way.',
    'A shader lights every pixel: a soft **lerp**-style wrap of light on the leaning fibers, a highlight that runs along the fibers, and a rim of sheen where they lie flat. Fibers that lean toward the light look different from fibers that lean away, which is why the name shows only as a shift in sheen.',
    'Moving the cursor turns the fibers under it to lie along your stroke, harder when you move fast. Fast strokes also press a dent that darkens the pile.',
    'Over time every fiber eases back to its resting lean, using **damping** so the trail fades smoothly instead of snapping.',
  ],
  whatElse: [
    'A hero for a fashion label or a fabric shop.',
    'A tactile loading screen where you brush the page awake.',
    'A luxury product page whose headline appears as you stroke the cloth.',
  ],
  wants:
    'The whole screen is crushed velvet that looks like real cloth filmed under one lamp. Moving my cursor brushes the pile, leaving lighter and darker trails where the fibers flip. My name is already brushed the other way inside the pile, so it shows up only as a change in sheen. Strokes slowly relax back to rest.',
  lookLines: [
    `Draw one WebGL 1 canvas that fills the screen; a single full-screen fragment shader paints every pixel. Simulate the pile on the CPU in a grid of square cells (${FIXED.COLS} cells across at full quality). Each cell holds a lean vector (x, y), each of length 0 to 1 (0 = fibers standing, 1 = lying flat), and a dent amount from 0 to 1. Upload the grid every frame as an RGBA texture (red and green: the lean vector as (value × 0.5 + 0.5) × ${FIXED.BYTE}; blue: the dent × ${FIXED.BYTE}) and sample it with linear filtering.`,
    `Resting field: the pile lies at ${FIXED.REST_ANGLE}° (0° right, 90° down) with a lean of ${FIXED.REST_LEAN}, varied by smooth value noise so it looks crushed (see the Crushed look setting). The hidden name mask is drawn on a 2D canvas the size of the grid; inside it (blended by the mask's antialiased alpha) the resting direction is turned 180°, so the name is already brushed the other way.`,
    `Brush: along each cursor stroke place stamps every ${FIXED.STEP_FRAC} × the brush radius. For every cell within the radius, move its lean vector toward (stroke direction × ${FIXED.BRUSH_LEAN}) by ${FIXED.BRUSH_RATE} × the brush weight × the stroke strength (speed ÷ ${FIXED.SPEED_REF} px per second, at most 1), and add to the dent by the weight × the strength × ${FIXED.DENT_RATE} (at most 1).`,
    `Relax: each frame move every cell's lean toward its resting vector, and its dent toward 0, by 1 − e^(−${FIXED.RELAX_K} × dt ÷ relax time).`,
    `Shading, per pixel, in linear light (convert hex colors with gamma ${FIXED.GAMMA}; convert back at the end). Take the lamp vector with its y flipped to point up the screen, and the cell's lean vector L (y flipped the same way), turn it by a random angle per fiber cell and by crush noise, then: surface normal N = normalize(L × ${FIXED.TILT_GAIN} × pile length, 1); fiber direction T = normalize(L × pile length × ${FIXED.TANGENT_GAIN}, 1); view V = (0, 0, 1); half-vector H = normalize(lamp + V).`,
    `Layers: body = the first accent color × ${FIXED.BODY_DEPTH}, times ambient + wrap diffuse × (1 − ambient), where wrap diffuse = clamp((N·lamp + ${FIXED.WRAP}) ÷ (1 + ${FIXED.WRAP}), 0, 1); times a per-fiber brightness. Sheen color = the first accent color ${FIXED.SHEEN_LIFT} of the way to white. Sheen = sheen setting × (${FIXED.SHEEN_FLOOR} + ${Number((1 - FIXED.SHEEN_FLOOR).toFixed(2))} × min(1, lean length × pile length ÷ ${FIXED.LEAN_REF})) × (the fiber highlight × ${FIXED.KK_WEIGHT} + rim × ${FIXED.RIM_WEIGHT}), where the fiber highlight = (sqrt(1 − (T·H)²) raised to sheen sharpness) × smoothstep(0, 0.5, N·lamp + ${FIXED.KK_GATE}) and rim = (1 − N·V) raised to ${FIXED.RIM_POWER}. Add sheen color × (sheen + specks).`,
    `Imperfection: every fiber cell (of the fiber size, in CSS pixels) gets two random numbers from a hash of its coordinates: one turns its lean, the other changes its brightness; a few fibers become bright specks. Crush: four octaves of value noise at a patch size of ${FIXED.CRUSH_SCALE} fiber cells turn the lean from place to place. Dent: multiply the color by 1 − ${FIXED.DENT_DARK} × dent × the dent setting and the sheen by 1 − ${FIXED.DENT_SHEEN} × dent.`,
    `Lamp falloff: multiply the color by mix(${1 - FIXED.FALLOFF}, 1, the pixel's position along the lamp's screen direction, from 0 at the far side to 1 at the near side). Finally multiply by exposure ${FIXED.EXPOSURE} and apply gamma 1 ÷ ${FIXED.GAMMA}. Use only the palette's colors; the name never appears as a color.`,
    'Quality tiers (see the Quality setting): scale the canvas and the grid together, and drop the finest fiber layer on the lightest tier. If WebGL is unavailable, fill the canvas with the body color and draw a few soft diagonal bands of the sheen color, with the name as a band of the opposite diagonal.',
  ],
  behaviorLines: [
    'Run one requestAnimationFrame loop. dt = seconds since the last frame, clamped to 0.05.',
    `Reduced-motion still frame: no animation. Run a scripted brush stroke once, through the points ${FIXED.STILL_SWOOP.map((s) => `(${s[0]! * 100}% of the width, ${s[1]! * 100}% of the height)`).join(', ')} at ${FIXED.STILL_SPEED} px per second with ${FIXED.STILL_DT} second steps, draw one frame, and stop. The name is visible as a shift in sheen.`,
  ],
  interactionLines: [
    'The stage has touch-action: pan-y, so vertical swipes still scroll; a finger brushes only while dragging after a short press and hold.',
  ],
};
