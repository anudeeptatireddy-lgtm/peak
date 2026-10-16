import { describe, expect, it } from 'vitest';
import {
  contrast,
  ensureContrast,
  fitGamut,
  hexToOklab,
  hexToOklch,
  inGamut,
  mixOklab,
  oklabToRgb,
  oklchToHex,
  parseHex,
  rgbToOklab,
  rotateHue,
  toHex,
} from '../../src/theme/color';

const SAMPLES = [
  '#000000',
  '#FFFFFF',
  '#FF1F8E',
  '#1FA9DB',
  '#FFC21A',
  '#160E44',
  '#B6FF1A',
  '#7F7F7F',
];

describe('hex', () => {
  it('parses short and long forms', () => {
    expect(toHex(parseHex('#abc'))).toBe('#AABBCC');
    expect(toHex(parseHex('ff1f8e'))).toBe('#FF1F8E');
  });
  it('rejects junk', () => {
    expect(() => parseHex('#12345')).toThrow();
    expect(() => parseHex('pink')).toThrow();
  });
});

describe('OKLab', () => {
  it('round-trips sRGB within 1/255', () => {
    for (let i = 0; i < 4096; i++) {
      const rgb = {
        r: ((i * 37) % 256) / 255,
        g: ((i * 91) % 256) / 255,
        b: ((i * 13) % 256) / 255,
      };
      const back = oklabToRgb(rgbToOklab(rgb));
      expect(Math.abs(back.r - rgb.r)).toBeLessThan(1 / 255);
      expect(Math.abs(back.g - rgb.g)).toBeLessThan(1 / 255);
      expect(Math.abs(back.b - rgb.b)).toBeLessThan(1 / 255);
    }
  });
  it('gives known lightness for black and white', () => {
    expect(hexToOklab('#000000').L).toBeCloseTo(0, 5);
    expect(hexToOklab('#FFFFFF').L).toBeCloseTo(1, 3);
  });
});

describe('OKLCH and gamut', () => {
  it('rotating hue keeps lightness and (in-gamut) chroma', () => {
    for (const hex of SAMPLES) {
      const before = hexToOklch(hex);
      const after = hexToOklch(rotateHue(hex, 12));
      expect(after.L).toBeCloseTo(before.L, 2);
      expect(after.C).toBeLessThanOrEqual(before.C + 0.01);
    }
  });
  it('fitGamut always returns valid sRGB', () => {
    for (let L = 0; L <= 1; L += 0.1) {
      for (let h = 0; h < 360; h += 15) {
        expect(inGamut(fitGamut({ L, C: 0.5, h }))).toBe(true);
      }
    }
    expect(oklchToHex({ L: 0.7, C: 0.9, h: 140 })).toMatch(/^#[0-9A-F]{6}$/);
  });
});

describe('mixOklab', () => {
  it('returns the ends at t = 0 and t = 1', () => {
    expect(mixOklab('#FFE3F1', '#1E1412', 0)).toBe('#FFE3F1');
    expect(mixOklab('#FFE3F1', '#1E1412', 1)).toBe('#1E1412');
  });
  it('blends lightness monotonically', () => {
    let last = Infinity;
    for (let t = 0; t <= 1; t += 0.1) {
      const L = hexToOklab(mixOklab('#FFFFFF', '#000000', t)).L;
      expect(L).toBeLessThanOrEqual(last + 1e-9);
      last = L;
    }
  });
});

describe('contrast', () => {
  it('matches known values', () => {
    expect(contrast('#000000', '#FFFFFF')).toBeCloseTo(21, 5);
    expect(contrast('#FFFFFF', '#FFFFFF')).toBeCloseTo(1, 5);
    expect(contrast('#777777', '#FFFFFF')).toBeCloseTo(4.48, 2);
  });
});

describe('ensureContrast', () => {
  it('leaves passing colors alone', () => {
    expect(ensureContrast('#1A1240', '#F4F2FF', 4.5)).toBe('#1A1240');
  });
  it('reaches 4.5 for every gray ground from black to white in 64 steps', () => {
    for (let i = 0; i < 64; i++) {
      const v = Math.round((i / 63) * 255);
      const ground = toHex({ r: v / 255, g: v / 255, b: v / 255 });
      for (const fg of [ground, '#FF1F8E', '#1FA9DB', '#7F7F7F']) {
        expect(contrast(ensureContrast(fg, ground, 4.5), ground)).toBeGreaterThanOrEqual(4.5);
      }
    }
  });
  it('reaches 3 for accent colors on light grounds', () => {
    expect(contrast(ensureContrast('#FFC21A', '#FFE3F1', 3), '#FFE3F1')).toBeGreaterThanOrEqual(3);
  });
});
