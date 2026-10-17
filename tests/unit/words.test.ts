import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { DEMO_IDS } from '../../src/demos';
import { WORD_IDS } from '../../src/words/list';

const dir = 'src/content/words';
const files = readdirSync(dir)
  .filter((f) => f.endsWith('.md'))
  .map((f) => f.replace(/\.md$/, ''));
const field = (id: string, key: string) =>
  new RegExp(`^${key}: '(.*)'$`, 'm').exec(readFileSync(`${dir}/${id}.md`, 'utf8'))?.[1] ?? '';

describe('word bank', () => {
  it('has a word file and a demo for every term id', () => {
    expect([...files].sort()).toEqual([...WORD_IDS].sort());
    expect([...DEMO_IDS].sort()).toEqual([...WORD_IDS].sort());
  });
  it('gives every word a definition and a say-it sentence', () => {
    for (const id of WORD_IDS) {
      expect(field(id, 'term'), id).not.toBe('');
      expect(field(id, 'definition').length, id).toBeGreaterThan(20);
      expect(field(id, 'sayIt').length, id).toBeGreaterThan(20);
      expect(field(id, 'demo'), id).toBe(id);
    }
  });
  it('every term a scene uses is a real word', () => {
    const known = new Set<string>(WORD_IDS);
    for (const d of readdirSync('src/scenes', { withFileTypes: true })) {
      if (!d.isDirectory()) continue;
      for (const f of ['meta.ts', 'params.ts']) {
        let s = '';
        try {
          s = readFileSync(`src/scenes/${d.name}/${f}`, 'utf8');
        } catch {
          continue;
        }
        for (const m of s.matchAll(/\bterm: '([^']+)'/g))
          expect(known.has(m[1]!), `${d.name} ${m[1]}`).toBe(true);
        for (const m of s.matchAll(/terms: \[([^\]]*)\]/g))
          for (const x of m[1]!.matchAll(/'([^']+)'/g))
            expect(known.has(x[1]!), `${d.name} ${x[1]}`).toBe(true);
      }
    }
  });
});
