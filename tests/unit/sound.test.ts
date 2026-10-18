import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';
import { VOICES, play } from '../../src/engine/sound';

describe('sound', () => {
  it('has a synthesized voice for every sound a scene asks for', () => {
    const names = new Set<string>();
    for (const d of readdirSync('src/scenes', { withFileTypes: true })) {
      if (!d.isDirectory()) continue;
      let src = '';
      try {
        src = readFileSync(`src/scenes/${d.name}/index.ts`, 'utf8');
      } catch {
        continue;
      }
      for (const m of src.matchAll(/sound\.play\('([a-z]+)'/g)) names.add(m[1]!);
    }
    expect(names.size).toBeGreaterThan(4);
    for (const n of names) expect(Object.keys(VOICES), n).toContain(n);
  });
  it('never touches Web Audio while sound is off', () => {
    const ctor = vi.fn();
    vi.stubGlobal('window', { AudioContext: ctor, localStorage: { getItem: () => null } });
    play('pop');
    expect(ctor).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });
});
