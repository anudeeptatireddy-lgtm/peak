import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// The no-brand-names rule: no film or brand names (trademarks) in public names.
const BANNED = [
  'barbie',
  'dune',
  'slinky',
  'claymation',
  'jello',
  'jell-o',
  'lego',
  'kleenex',
  'velcro',
  'frisbee',
  'tupperware',
  'sharpie',
  'post-it',
  // Film, game and brand names that came up in the specs (owner, 2026-10-20).
  'fogofwar',
  'gathering',
  'coinstar',
  'tiktok',
  'pokemon',
  // Brand and film names avoided in Batch 3 (2026-10-21).
  'swatch',
  'pounce',
  'bendit',
];
const has = (text: string, word: string) =>
  new RegExp(`(^|[^a-z])${word}([^a-z]|$)`, 'i').test(text);

describe('names', () => {
  it('scene titles and slugs in SCENES.md avoid brand names', () => {
    const rows = [
      ...readFileSync('docs/SCENES.md', 'utf8').matchAll(/^\| \d+ \| `([^`]+)` \| ([^|]+) \|/gm),
    ];
    expect(rows.length).toBeGreaterThanOrEqual(89);
    for (const [, slug, title] of rows)
      for (const b of BANNED) {
        expect(has(slug!, b), `${slug}: ${b}`).toBe(false);
        expect(has(title!, b), `${title}: ${b}`).toBe(false);
      }
  });
  it('built scenes avoid brand names too', () => {
    for (const d of readdirSync('src/scenes', { withFileTypes: true })) {
      if (!d.isDirectory()) continue;
      for (const b of BANNED) expect(has(d.name, b), `${d.name}: ${b}`).toBe(false);
    }
  });
});
