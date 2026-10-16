import { describe, expect, it } from 'vitest';
import { contrast } from '../../src/theme/color';
import { HOME_JOURNEY, blendThemes, journeyState, smootherstep } from '../../src/theme/journey';
import { WORLD_DEFS, allThemes, blendFor } from '../../src/theme/worlds';

const VH = 1000;
const sections = Array.from({ length: 4 }, (_, i) => ({ top: i * VH, bottom: (i + 1) * VH }));

describe('journeyState', () => {
  it('holds steady inside a section', () => {
    expect(journeyState(sections, 0, VH)).toEqual({ from: 0, to: 0, t: 0 });
    expect(journeyState(sections, VH * 1.0, VH)).toEqual({ from: 1, to: 1, t: 0 });
  });
  it('blends across a 35% zone centered on each boundary', () => {
    // Viewport center = scrollY + 500. Boundary 1 is at 1000; zone is 825..1175.
    expect(journeyState(sections, 824 - 500, VH)).toEqual({ from: 0, to: 0, t: 0 });
    const start = journeyState(sections, 825 - 500, VH);
    expect(start.from).toBe(0);
    expect(start.to).toBe(1);
    expect(start.t).toBeCloseTo(0, 6);
    expect(journeyState(sections, 1000 - 500, VH).t).toBeCloseTo(0.5, 6);
    expect(journeyState(sections, 1175 - 500, VH).t).toBeCloseTo(1, 6);
    expect(journeyState(sections, 1176 - 500, VH)).toEqual({ from: 1, to: 1, t: 0 });
  });
  it('eases with smootherstep', () => {
    expect(smootherstep(0)).toBe(0);
    expect(smootherstep(1)).toBe(1);
    expect(smootherstep(0.5)).toBeCloseTo(0.5, 10);
    expect(smootherstep(0.25)).toBeLessThan(0.25);
  });
});

describe('contrast guardrail (PRD §6.3)', () => {
  const themes = allThemes();
  it(`every ordered pair of the ${themes.length} world themes stays readable at t = 0…1`, () => {
    const failures: string[] = [];
    for (const a of themes) {
      for (const b of themes) {
        if (a === b) continue;
        for (let i = 0; i <= 100; i++) {
          const t = blendThemes(a, b, i / 100);
          const ink = contrast(t.ink, t.ground);
          const soft = contrast(t.inkSoft, t.ground);
          const accent = contrast(t.accentText, t.ground);
          if (ink < 4.5 || soft < 4.5 || accent < 3)
            failures.push(
              `${a.name}/${a.mode} → ${b.name}/${b.mode} @${i}: ${ink.toFixed(2)} ${soft.toFixed(2)} ${accent.toFixed(2)}`,
            );
        }
      }
    }
    expect(failures.slice(0, 10)).toEqual([]);
  });
  it('picks the canvas blend mode from the blended ground', () => {
    const a = themes.find((t) => t.id === 'dreamhouse')!;
    const b = themes.find((t) => t.id === 'doomsday')!;
    for (let i = 0; i <= 10; i++) {
      const t = blendThemes(a, b, i / 10);
      expect(t.blend).toBe(blendFor(t.ground));
    }
  });
});

describe('home journey config', () => {
  it('features 12 scenes, each in a different world', () => {
    expect(HOME_JOURNEY).toHaveLength(12);
    expect(new Set(HOME_JOURNEY.map((s) => s.world)).size).toBe(12);
    expect(new Set(HOME_JOURNEY.map((s) => s.scene)).size).toBe(12);
    for (const s of HOME_JOURNEY) expect(WORLD_DEFS[s.world]).toBeDefined();
    expect(HOME_JOURNEY.slice(0, 3).map((s) => s.world)).toEqual([
      'dreamhouse',
      'dunes',
      'doomsday',
    ]);
  });
});
