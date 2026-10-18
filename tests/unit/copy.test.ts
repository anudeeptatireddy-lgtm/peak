import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

// PLAN 9.5: plain copy. No filler text, no shouting, and every owner placeholder is listed
// in docs/DECISIONS.md (so nothing marked for the owner is forgotten).
function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((d) =>
    d.isDirectory() ? walk(join(dir, d.name)) : [join(dir, d.name)],
  );
}
const files = ['src/pages', 'src/components', 'src/layouts', 'src/content', 'src/playground']
  .flatMap(walk)
  .filter((f) => /\.(astro|ts|md|mdx)$/.test(f));

describe('copy', () => {
  it('has no lorem ipsum or filler', () => {
    for (const f of files)
      expect(readFileSync(f, 'utf8'), f).not.toMatch(/lorem ipsum|click here/i);
  });
  it('lists every owner placeholder in DECISIONS.md', () => {
    const decisions = readFileSync('docs/DECISIONS.md', 'utf8');
    const found = new Set<string>();
    for (const f of files)
      for (const m of readFileSync(f, 'utf8').matchAll(
        /\[(YOUR NAME|ONE-LINE BIO|WHY I MADE PEAK|WHAT YOU'RE LOOKING FOR|CONTACT LINK|SOCIAL LINKS)/g,
      ))
        found.add(m[1]!);
    expect(found.size).toBeGreaterThan(0);
    for (const p of found) expect(decisions, p).toContain(`[${p}`);
  });
  it('writes toasts to match their button names', () => {
    const src = readFileSync('src/playground/index.ts', 'utf8');
    expect(src).toContain("toast('Prompt copied.");
    expect(src).toContain("toast('Link copied.");
  });
});
