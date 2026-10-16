import { describe, expect, it } from 'vitest';
import { ScrollVelocity } from '../../src/engine/scroll';
import { MAX_DT, computeDt, ease, frameFactor } from '../../src/engine/time';

describe('frame timing', () => {
  it('clamps dt to 0.05 seconds', () => {
    expect(computeDt(1000, 0)).toBe(MAX_DT);
    expect(computeDt(1016, 1000)).toBeCloseTo(0.016, 6);
  });
  it('skips frames where no time has passed', () => {
    expect(computeDt(1000, 1000)).toBeNull();
    expect(computeDt(999, 1000)).toBeNull();
    expect(computeDt(NaN, 1000)).toBeNull();
  });
  it('frame factor is 1 at 60Hz, 0.5 at 120Hz, capped at 2.5', () => {
    expect(frameFactor(1 / 60)).toBeCloseTo(1, 6);
    expect(frameFactor(1 / 120)).toBeCloseTo(0.5, 6);
    expect(frameFactor(0.05)).toBe(2.5);
  });
  it('ease gives the same result for one 60Hz frame as two 120Hz frames', () => {
    const one = ease(0.2, 1);
    const twoHalf = 1 - (1 - ease(0.2, 0.5)) ** 2;
    expect(twoHalf).toBeCloseTo(one, 10);
  });
});

describe('scroll velocity', () => {
  it('smooths toward the raw velocity and tracks direction', () => {
    const v = new ScrollVelocity();
    v.tick(0, 1 / 60);
    for (let i = 1; i <= 30; i++) v.tick(i * 10, 1 / 60);
    expect(v.vel).toBeGreaterThan(9.9);
    expect(v.vel).toBeLessThanOrEqual(10);
    expect(v.dir).toBe(1);
    for (let i = 29; i >= 0; i--) v.tick(i * 10, 1 / 60);
    expect(v.vel).toBeLessThan(0);
    expect(v.dir).toBe(-1);
  });
  it('is frame-rate independent for steady scrolling', () => {
    const a = new ScrollVelocity();
    const b = new ScrollVelocity();
    a.tick(0, 1 / 60);
    b.tick(0, 1 / 120);
    for (let i = 1; i <= 120; i++) a.tick(i * 6, 1 / 60);
    for (let i = 1; i <= 240; i++) b.tick(i * 3, 1 / 120);
    expect(a.vel).toBeCloseTo(6, 3);
    expect(b.vel).toBeCloseTo(6, 3);
  });
  it('caps extreme jumps', () => {
    const v = new ScrollVelocity();
    v.tick(0, 1 / 60);
    for (let i = 0; i < 60; i++) v.tick(100000 * (i + 1), 1 / 60);
    expect(v.vel).toBeLessThanOrEqual(140);
  });
});
