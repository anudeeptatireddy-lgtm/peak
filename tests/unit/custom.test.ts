import { describe, expect, it } from 'vitest';
import { contrast, toHex } from '../../src/theme/color';
import { customTheme } from '../../src/theme/custom';

// mulberry32, so the 20 palettes are the same on every run.
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = rng(20261017);
const color = () => toHex({ r: rand(), g: rand(), b: rand() });
const palettes = Array.from({ length: 20 }, () => ({
  ground: color(),
  c1: color(),
  c2: color(),
  c3: color(),
}));
// The hardest grounds: pure mid-gray, black, white.
palettes.push(
  { ground: '#777777', c1: '#FF0000', c2: '#00FF00', c3: '#0000FF' },
  { ground: '#000000', c1: '#FF1F8E', c2: '#1FA9DB', c3: '#FFC21A' },
  { ground: '#FFFFFF', c1: '#FF1F8E', c2: '#1FA9DB', c3: '#FFC21A' },
);

describe('custom colors', () => {
  it.each(palettes.map((p) => [p.ground, p] as const))(
    'ground %s: derived text colors pass contrast',
    (_, p) => {
      const t = customTheme(p);
      expect(contrast(t.ink, t.ground)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(t.ink, t.surface)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(t.inkSoft, t.ground)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(t.inkSoft, t.surface)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(t.accentText, t.ground)).toBeGreaterThanOrEqual(3);
      expect(contrast(t.focus, t.ground)).toBeGreaterThanOrEqual(3);
    },
  );

  it('keeps the visitor’s ground and accents exactly', () => {
    const p = { ground: '#FFE3F1', c1: '#FF1F8E', c2: '#1FA9DB', c3: '#FFC21A' };
    const t = customTheme(p);
    expect([t.ground, t.c1, t.c2, t.c3]).toEqual([p.ground, p.c1, p.c2, p.c3]);
  });
});
