// Shape outlines for `morph`: every shape is the same number of points, each a
// point (x, y) in a unit space centered on the origin, with its farthest point at
// distance 1. Point k sits at the same place around the outline for every shape
// (starting at the top, going clockwise), so shapes can be blended point by point.
// The numbers here are the shapes' geometry: the plain-words version lives in
// FORMULAS, which goes into the prompt.

export const SHAPE_IDS = [
  'circle',
  'square',
  'triangle',
  'star',
  'heart',
  'blob',
  'flower',
] as const;
export type ShapeId = (typeof SHAPE_IDS)[number];

export const POINTS = 120;

export const FORMULAS: string[] = [
  `Every shape is ${POINTS} points, numbered from 0 at the top going clockwise (screen y points down), with its farthest point at distance 1 from the center after centering its bounding box on the origin. Point k of one shape morphs into point k of the next.`,
  'Angles: a = −π/2 + 2π × k ÷ 120. circle: radius 1. square: radius 0.8 ÷ max(|cos a|, |sin a|). triangle: radius 0.5 ÷ cos(φ − π/3) where φ = (a + π/2) mod (2π/3). blob: radius 1 + 0.16 × sin(3a + 1) + 0.1 × sin(5a + 2). flower: radius 0.72 + 0.28 × cos(5 × (a + π/2)).',
  'star: a 5-pointed star, ten corners alternately at radius 1 and 0.45, starting with an outer point at the top, resampled to 120 points evenly along its outline.',
  'heart: with u = 2π × k ÷ 120, x = 16 × sin³u and y = −(13 × cos u − 5 × cos 2u − 2 × cos 3u − cos 4u).',
];

type Pt = [number, number];

const TAU = Math.PI * 2;
const angle = (k: number) => -Math.PI / 2 + (TAU * k) / POINTS;

function polar(r: (a: number) => number): Pt[] {
  return Array.from({ length: POINTS }, (_, k) => {
    const a = angle(k);
    const rr = r(a);
    return [rr * Math.cos(a), rr * Math.sin(a)];
  });
}

/** Spreads points evenly along a closed outline given by its corners. */
function resample(corners: Pt[]): Pt[] {
  const edges = corners.map((c, i) => {
    const d = corners[(i + 1) % corners.length]!;
    return { c, d, len: Math.hypot(d[0] - c[0], d[1] - c[1]) };
  });
  const total = edges.reduce((s, e) => s + e.len, 0);
  return Array.from({ length: POINTS }, (_, k) => {
    let at = (k / POINTS) * total;
    for (const e of edges) {
      if (at <= e.len) {
        const t = e.len ? at / e.len : 0;
        return [e.c[0] + (e.d[0] - e.c[0]) * t, e.c[1] + (e.d[1] - e.c[1]) * t];
      }
      at -= e.len;
    }
    return corners[0]!;
  });
}

function star(): Pt[] {
  const corners: Pt[] = Array.from({ length: 10 }, (_, i) => {
    const a = -Math.PI / 2 + (TAU * i) / 10;
    const r = i % 2 === 0 ? 1 : 0.45;
    return [r * Math.cos(a), r * Math.sin(a)];
  });
  return resample(corners);
}

function heart(): Pt[] {
  return Array.from({ length: POINTS }, (_, k) => {
    const u = (TAU * k) / POINTS;
    return [
      16 * Math.sin(u) ** 3,
      -(13 * Math.cos(u) - 5 * Math.cos(2 * u) - 2 * Math.cos(3 * u) - Math.cos(4 * u)),
    ];
  });
}

/** Centers the bounding box on the origin and scales the farthest point to distance 1. */
function normalize(pts: Pt[]): Float32Array {
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
  const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
  const far = Math.max(...pts.map((p) => Math.hypot(p[0] - cx, p[1] - cy)));
  const out = new Float32Array(POINTS * 2);
  pts.forEach((p, k) => {
    out[k * 2] = (p[0] - cx) / far;
    out[k * 2 + 1] = (p[1] - cy) / far;
  });
  return out;
}

const BUILD: Record<ShapeId, () => Pt[]> = {
  circle: () => polar(() => 1),
  square: () => polar((a) => 0.8 / Math.max(Math.abs(Math.cos(a)), Math.abs(Math.sin(a)))),
  triangle: () =>
    polar(
      (a) =>
        0.5 / Math.cos(((((a + Math.PI / 2) % (TAU / 3)) + TAU / 3) % (TAU / 3)) - Math.PI / 3),
    ),
  star,
  heart,
  blob: () => polar((a) => 1 + 0.16 * Math.sin(3 * a + 1) + 0.1 * Math.sin(5 * a + 2)),
  flower: () => polar((a) => 0.72 + 0.28 * Math.cos(5 * (a + Math.PI / 2))),
};

const cache = new Map<ShapeId, Float32Array>();
export function shapePoints(id: ShapeId): Float32Array {
  let s = cache.get(id);
  if (!s) {
    s = normalize(BUILD[id]());
    cache.set(id, s);
  }
  return s;
}

/** Turns the visitor's comma-separated list into known shapes (circle if none are). */
export function parseShapes(text: string): ShapeId[] {
  const ids = text
    .toLowerCase()
    .split(/[\s,]+/)
    .filter((s): s is ShapeId => (SHAPE_IDS as readonly string[]).includes(s));
  return ids.length ? ids : ['circle'];
}
