// Owner rule (2026-10-16): every number in a scene's code that affects what you see
// comes from a param or from the scene's FIXED constants (each with a reason).
// Bare numbers allowed in scene code: 0, 1, 2 and 0.5 (structural: counting,
// halving, centering), plus the digits passed to toFixed() (formatting only).
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = join(process.cwd(), 'src/scenes');
const SCENES = readdirSync(ROOT, { withFileTypes: true })
  .filter((d) => d.isDirectory() && existsSync(join(ROOT, d.name, 'index.ts')))
  .map((d) => d.name);
const ALLOWED = new Set(['0', '1', '2', '0.5']);

function bareNumbers(source: string): string[] {
  const code = source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/[^\n]*/g, '')
    .replace(/^import .*$/gm, '')
    .replace(/\.toFixed\(\d+\)/g, '.toFixed()');
  const found = code.match(/(?<![\w.$])\d+(?:\.\d+)?(?:e-?\d+)?/g) ?? [];
  return found.filter((n) => !ALLOWED.has(n));
}

describe('scene code has no unexplained numbers', () => {
  it.each(SCENES)('%s', (slug) => {
    const source = readFileSync(join(ROOT, slug, 'index.ts'), 'utf8');
    expect(bareNumbers(source)).toEqual([]);
  });

  it.each(SCENES)('%s: every fixed constant has a reason', async (slug) => {
    const file = join(ROOT, slug, 'constants.ts');
    if (!existsSync(file)) return;
    const mod = (await import(file)) as { FIXED: object; FIXED_REASONS: Record<string, string> };
    for (const key of Object.keys(mod.FIXED))
      expect(mod.FIXED_REASONS[key]?.length ?? 0).toBeGreaterThan(10);
  });
});
