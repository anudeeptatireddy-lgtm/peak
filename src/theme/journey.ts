// Scroll-driven color journeys (PRD §6.2–§6.4, §6.7): which two worlds the
// viewport is between, how far, and the blended theme with text kept readable.
// Pure functions plus the home page's section order (one config array, §6.1).

import { contrast, ensureContrast, hexToOklab, mixOklab, withAlpha } from './color';
import { blendFor, getWorld, type Theme, type WorldId } from './worlds';

/* ---------- home order (PRD §6.1) ---------- */

export interface JourneySlot {
  /** Section id and the scene featured there. */
  scene: string;
  world: Exclude<WorldId, 'custom'>;
  /** Use-case title and one line of what to do, shown in the caption. */
  title: string;
  line: string;
}

export const HOME_JOURNEY: JourneySlot[] = [
  {
    scene: 'particles',
    world: 'dreamhouse',
    title: 'Your name in particles',
    line: 'Move through the letters, click to scatter them.',
  },
  {
    scene: 'elastic',
    world: 'dunes',
    title: 'Stretchy headline',
    line: 'Each letter swells toward your cursor. On a phone, drag sideways.',
  },
  {
    scene: 'velocity',
    world: 'doomsday',
    title: 'Scroll-reactive marquee',
    line: 'Scroll fast, then slow down. The type speeds up and leans into it.',
  },
  {
    scene: 'blackhole',
    world: 'lava',
    title: 'Black hole',
    line: 'A grid bends into a funnel while particles spiral in and vanish.',
  },
  {
    scene: 'marbles',
    world: 'cherry',
    title: 'Text to marbles',
    line: 'Click to shatter the headline into marbles, click again to rebuild it.',
  },
  {
    scene: 'lightning',
    world: 'toxic',
    title: 'Lightning',
    line: 'Move around and electric arcs jump from your cursor to the nodes.',
  },
  {
    scene: 'flock',
    world: 'aurora',
    title: 'Flock',
    line: 'Hundreds of birds swirl together and scatter away from your cursor.',
  },
  {
    scene: 'ripple',
    world: 'abyss',
    title: 'Ripple background',
    line: 'Tap anywhere to drop a ripple. Hover to push the dots around.',
  },
  {
    scene: 'cloth',
    world: 'blueprint',
    title: 'Tearable cloth',
    line: 'Grab the sheet and swing it. Pull hard and it tears.',
  },
  {
    scene: 'neon',
    world: 'arcade',
    title: 'Neon sign',
    line: 'The tubes buzz on letter by letter. Hover a letter to brighten it.',
  },
  {
    scene: 'confetti',
    world: 'vapor',
    title: 'Celebration burst',
    line: 'A big message with confetti bursting around it. Click to fire more.',
  },
  {
    scene: 'fireworks',
    world: 'golden',
    title: 'Fireworks',
    line: 'Tap to launch a rocket.',
  },
];

/** The closing sections (How it works, Start here) sit in Matcha. */
export const HOME_CLOSING_WORLD: Exclude<WorldId, 'custom'> = 'matcha';

/* ---------- blending ---------- */

export interface Boundary {
  /** Top and bottom of each section in page coordinates. */
  top: number;
  bottom: number;
}

export interface JourneyState {
  from: number;
  to: number;
  t: number;
}

/** PRD §6.2 easing: 6t⁵ − 15t⁴ + 10t³. */
export function smootherstep(x: number): number {
  const t = Math.min(1, Math.max(0, x));
  return t * t * t * (t * (t * 6 - 15) + 10);
}

/**
 * Where the viewport's vertical center sits: inside one section (t = 0) or in the
 * blend zone (35% of the viewport, centered on a boundary) between two.
 */
export function journeyState(
  sections: Boundary[],
  scrollY: number,
  viewportH: number,
  zone = 0.35,
): JourneyState {
  if (sections.length === 0) return { from: 0, to: 0, t: 0 };
  const y = scrollY + viewportH / 2;
  const half = (viewportH * zone) / 2;
  for (let i = 0; i < sections.length - 1; i++) {
    const b = sections[i]!.bottom;
    if (y >= b - half && y <= b + half) {
      return { from: i, to: i + 1, t: smootherstep((y - (b - half)) / (2 * half)) };
    }
  }
  let idx = 0;
  for (let i = 0; i < sections.length; i++) if (y >= sections[i]!.top) idx = i;
  return { from: idx, to: idx, t: 0 };
}

/**
 * Blends two themes in OKLab (PRD §6.3): text colors start from the blended ink
 * and are pushed until they pass (ink and inkSoft 4.5:1, accent text 3:1); the
 * canvas blend mode follows the blended ground (§6.4).
 */
export function blendThemes(a: Theme, b: Theme, t: number): Theme {
  if (t <= 0) return a;
  if (t >= 1) return b;
  const mix = (k: keyof Theme) => mixOklab(a[k] as string, b[k] as string, t);
  const ground = mix('ground');
  const c1 = mix('c1');
  const ink = ensureContrast(mix('ink'), ground, 4.5);
  let inkSoft = ensureContrast(mix('inkSoft'), ground, 4.5);
  // Keep the secondary ink from collapsing onto the main ink when both get pushed.
  if (contrast(inkSoft, ground) > contrast(ink, ground)) inkSoft = ink;
  const accent = ensureContrast(c1, ground, 3);
  return {
    id: t < 0.5 ? a.id : b.id,
    name: t < 0.5 ? a.name : b.name,
    mode: hexToOklab(ground).L >= 0.6 ? 'light' : 'dark',
    ground,
    surface: mix('surface'),
    ink,
    inkSoft,
    c1,
    c2: mix('c2'),
    c3: mix('c3'),
    accentText: accent,
    focus: accent,
    line: withAlpha(ink, 0.14),
    headerBg: withAlpha(ground, 0.74),
    blend: blendFor(ground),
  };
}

/** The blended theme for a journey state over a list of section themes. */
export function journeyTheme(themes: Theme[], s: JourneyState): Theme {
  const a = themes[s.from] ?? themes[0] ?? getWorld('riso');
  const b = themes[s.to] ?? a;
  return blendThemes(a, b, s.t);
}
