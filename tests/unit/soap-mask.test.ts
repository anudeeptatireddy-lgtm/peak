import { describe, expect, it } from 'vitest';
import { signedDistance, wireCoverage } from '../../src/scenes/soap/mask';

describe('soap wire mask', () => {
  // A 9 × 9 grid with a filled 5 × 5 square in the middle.
  const w = 9;
  const h = 9;
  const inside = new Uint8Array(w * h);
  for (let y = 2; y <= 6; y++) for (let x = 2; x <= 6; x++) inside[y * w + x] = 1;
  const sd = signedDistance(inside, w, h);
  const at = (x: number, y: number) => sd[y * w + x]!;

  it('is negative inside, positive outside, and about half a pixel at the boundary', () => {
    expect(at(4, 4)).toBeLessThan(0);
    expect(at(0, 0)).toBeGreaterThan(0);
    expect(Math.abs(at(2, 4))).toBeLessThanOrEqual(0.51);
    expect(Math.abs(at(1, 4))).toBeLessThanOrEqual(1.51);
  });
  it('grows with distance from the boundary', () => {
    expect(at(4, 4)).toBeLessThan(at(3, 4));
    expect(at(0, 4)).toBeGreaterThan(at(1, 4));
  });
  it('wire coverage is full at the boundary, soft at its edge and zero far away', () => {
    expect(wireCoverage(0, 3)).toBe(1);
    expect(wireCoverage(1.5, 3)).toBeCloseTo(0.5, 5);
    expect(wireCoverage(6, 3)).toBe(0);
    expect(wireCoverage(-6, 3)).toBe(0);
  });
});
