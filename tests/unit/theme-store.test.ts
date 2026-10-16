import { beforeEach, describe, expect, it } from 'vitest';
import { createApplier } from '../../src/theme/apply';
import { _resetStore, getTheme, setTheme, setTransform, subscribe } from '../../src/theme/store';
import { getWorld } from '../../src/theme/worlds';

function fakeTarget() {
  const writes: [string, string][] = [];
  return { writes, style: { setProperty: (n: string, v: string) => void writes.push([n, v]) } };
}

describe('apply', () => {
  it('writes every variable once, then only what changed', () => {
    const target = fakeTarget();
    const apply = createApplier(target);
    const first = apply(getWorld('dreamhouse'));
    expect(first).toBeGreaterThan(10);
    expect(apply(getWorld('dreamhouse'))).toBe(0);
    const changed = apply({ ...getWorld('dreamhouse'), c1: '#000000' });
    expect(changed).toBe(1);
    expect(target.writes.at(-1)).toEqual(['--c1', '#000000']);
  });
});

describe('store', () => {
  beforeEach(() => _resetStore());

  it('notifies subscribers only when the theme changes', () => {
    const seen: string[] = [];
    subscribe((t) => seen.push(t.id));
    setTheme(getWorld('abyss'));
    setTheme(getWorld('abyss'));
    setTheme(getWorld('toxic'));
    expect(seen).toEqual(['riso', 'abyss', 'toxic']);
  });

  it('applies a transform on top of the base theme', () => {
    setTheme(getWorld('abyss'));
    setTransform((t) => ({ ...t, c1: '#123456' }));
    expect(getTheme().c1).toBe('#123456');
    expect(getTheme().ground).toBe(getWorld('abyss').ground);
    setTransform(null);
    expect(getTheme().c1).toBe(getWorld('abyss').c1);
  });
});
