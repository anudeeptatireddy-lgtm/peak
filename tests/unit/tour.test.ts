import { describe, expect, it } from 'vitest';
import { shuffled, parseOrder, tourWorlds } from '../../src/theme/tour';
import { WORLD_ORDER } from '../../src/theme/worlds';
import { seededRandom } from '../../src/kits/field';

describe('tour worlds', () => {
  it('never puts the same world next to itself', () => {
    const own = ['riso', 'riso', 'riso', 'dunes', 'dunes', 'abyss', 'abyss', 'abyss'] as const;
    const out = tourWorlds([...own]);
    for (let i = 1; i < out.length; i++) expect(out[i]).not.toBe(out[i - 1]);
  });
  it('keeps a scene in its own world when its neighbors differ', () => {
    const own = ['dreamhouse', 'dunes', 'abyss'] as const;
    expect(tourWorlds([...own])).toEqual([...own]);
  });
  it('holds for a thousand random orders of every world', () => {
    const rand = seededRandom(3);
    for (let n = 0; n < 1000; n++) {
      const own = Array.from({ length: 50 }, () => WORLD_ORDER[Math.floor(rand() * 16)]!);
      const out = tourWorlds(own);
      for (let i = 1; i < out.length; i++) expect(out[i]).not.toBe(out[i - 1]);
    }
  });
});

describe('tour order', () => {
  const known = ['a', 'b', 'c', 'd'];
  it('shuffles without losing or repeating anything', () => {
    const s = shuffled(known, seededRandom(1));
    expect([...s].sort()).toEqual(known);
  });
  it('reads an order from the URL, dropping junk and filling gaps', () => {
    expect(parseOrder('c,a,zzz,c', known)).toEqual(['c', 'a', 'b', 'd']);
    expect(parseOrder(null, known)).toEqual(known);
    expect(parseOrder('nope', known)).toEqual(known);
  });
});
