import { describe, expect, it } from 'vitest';
import {
  createGovernor,
  hexToVec3,
  lighter,
  packSigned,
  packUnit16,
  pickTier,
  unpackSigned,
  unpackUnit16,
} from '../../src/kits/gl';

describe('quality tiers', () => {
  it('phones and previews start balanced, laptops start full, an explicit setting wins', () => {
    expect(pickTier('auto', { isSmall: true, quality: 'full' })).toBe('balanced');
    expect(pickTier('auto', { isSmall: false, quality: 'preview' })).toBe('balanced');
    expect(pickTier('auto', { isSmall: false, quality: 'full' })).toBe('full');
    expect(pickTier('phone', { isSmall: false, quality: 'full' })).toBe('phone');
  });
  it('steps down one tier at a time and stops at the lightest', () => {
    expect(lighter('full')).toBe('balanced');
    expect(lighter('balanced')).toBe('phone');
    expect(lighter('phone')).toBe('phone');
  });
});

describe('governor', () => {
  const opts = { slowSeconds: 0.03, afterSeconds: 0.5, smoothing: 0.5 };
  it('stays put while frames are fast', () => {
    const g = createGovernor('full', opts);
    for (let i = 0; i < 200; i++) expect(g.tick(0.016)).toBeNull();
    expect(g.tier).toBe('full');
  });
  it('drops one tier after a run of slow frames, then another, then stops', () => {
    const g = createGovernor('full', opts);
    const seen: string[] = [];
    for (let i = 0; i < 100; i++) {
      const t = g.tick(0.06);
      if (t) seen.push(t);
    }
    expect(seen).toEqual(['balanced', 'phone']);
    expect(g.tier).toBe('phone');
  });
  it('ignores a single hitch', () => {
    const g = createGovernor('full', opts);
    for (let i = 0; i < 30; i++) g.tick(0.016);
    g.tick(0.2);
    for (let i = 0; i < 30; i++) expect(g.tick(0.016)).toBeNull();
  });
});

describe('packing', () => {
  it('round-trips 16-bit values to within one step', () => {
    for (const v of [0, 0.001, 0.25, 0.5, 0.731, 1]) {
      const [hi, lo] = packUnit16(v);
      expect(Math.abs(unpackUnit16(hi, lo) - v)).toBeLessThan(1 / 65535);
    }
  });
  it('clamps out-of-range input', () => {
    expect(packUnit16(-3)).toEqual([0, 0]);
    expect(packUnit16(9)).toEqual([255, 255]);
  });
  it('packs signed values around 128', () => {
    expect(packSigned(0)).toBeGreaterThanOrEqual(127);
    expect(packSigned(0)).toBeLessThanOrEqual(128);
    expect(Math.abs(unpackSigned(packSigned(0.4)) - 0.4)).toBeLessThan(0.01);
  });
  it('turns hex into 0..1 channels', () => {
    expect(hexToVec3('#FF0000')).toEqual([1, 0, 0]);
  });
});
