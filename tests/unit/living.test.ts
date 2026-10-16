import { describe, expect, it } from 'vitest';
import { hexToOklch } from '../../src/theme/color';
import { DRIFT_DEGREES, drift, driftOffset } from '../../src/theme/living';
import { allThemes } from '../../src/theme/worlds';

const hueDelta = (a: number, b: number) => {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
};

describe('living colors', () => {
  it('drifts by at most ±12° and loops every 30 seconds', () => {
    for (let s = 0; s < 60; s += 0.37) {
      for (let i = 0; i < 3; i++)
        expect(Math.abs(driftOffset(i, s))).toBeLessThanOrEqual(DRIFT_DEGREES);
    }
    expect(driftOffset(0, 7)).toBeCloseTo(driftOffset(0, 37), 10);
  });

  it('never changes text tokens and always returns valid hex', () => {
    for (const theme of allThemes()) {
      for (let s = 0; s < 30; s += 2.5) {
        const d = drift(theme, s);
        for (const k of [
          'ground',
          'surface',
          'ink',
          'inkSoft',
          'accentText',
          'focus',
          'line',
          'headerBg',
        ] as const)
          expect(d[k]).toBe(theme[k]);
        for (const k of ['c1', 'c2', 'c3'] as const) expect(d[k]).toMatch(/^#[0-9A-F]{6}$/);
      }
    }
  });

  it('moves the hue of chromatic accents within the drift range', () => {
    for (const theme of allThemes()) {
      for (const k of ['c1', 'c2', 'c3'] as const) {
        const before = hexToOklch(theme[k]);
        if (before.C < 0.05) continue;
        for (let s = 0; s < 30; s += 3) {
          const after = hexToOklch(drift(theme, s)[k]);
          expect(hueDelta(after.h, before.h)).toBeLessThanOrEqual(DRIFT_DEGREES + 1.5);
        }
      }
    }
  });
});
