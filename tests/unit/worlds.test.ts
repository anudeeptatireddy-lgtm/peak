import { describe, expect, it } from 'vitest';
import { contrast } from '../../src/theme/color';
import { WORLD_DEFS, WORLD_ORDER, allThemes, blendFor, getWorld } from '../../src/theme/worlds';

const themes = allThemes();

describe('worlds', () => {
  it('has all 16 worlds (17 themes with Riso dark)', () => {
    expect(Object.keys(WORLD_DEFS)).toHaveLength(16);
    expect(new Set(WORLD_ORDER).size).toBe(16);
    expect(themes).toHaveLength(17);
  });

  it.each(themes.map((t) => [`${t.name} (${t.mode})`, t] as const))(
    '%s: ink and inkSoft ≥ 4.5:1 on ground and surface, accentText ≥ 3:1',
    (_, t) => {
      expect(contrast(t.ink, t.ground)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(t.ink, t.surface)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(t.inkSoft, t.ground)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(t.inkSoft, t.surface)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(t.accentText, t.ground)).toBeGreaterThanOrEqual(3);
      expect(contrast(t.focus, t.ground)).toBeGreaterThanOrEqual(3);
    },
  );

  it('keeps the hand-picked ink colors (they already pass)', () => {
    for (const def of Object.values(WORLD_DEFS)) {
      expect(getWorld(def.id).ink).toBe(def.palette.ink);
      expect(getWorld(def.id).inkSoft).toBe(def.palette.inkSoft);
    }
  });

  it('never uses film or brand names in public names', () => {
    for (const def of Object.values(WORLD_DEFS)) {
      expect(def.name).not.toMatch(/\bbarbie\b/i);
      expect(def.name).not.toMatch(/\bdune\b/i);
    }
  });

  it('picks the canvas blend mode from ground lightness', () => {
    expect(blendFor('#FFFFFF')).toBe('multiply');
    expect(blendFor('#000000')).toBe('lighter');
    expect(blendFor('#808080')).toBe('source-over');
    for (const t of themes) expect(t.blend).toBe(t.mode === 'light' ? 'multiply' : 'lighter');
  });

  it('gives Riso a dark variant', () => {
    expect(getWorld('riso', 'dark').ground).toBe('#160E44');
    expect(getWorld('riso', 'dark').mode).toBe('dark');
    expect(getWorld('abyss', 'light').mode).toBe('dark');
  });
});
