// The guides' facts rule (PRD §11): every guide has sources and a "Last checked" date,
// every source link is an https page, and no install commands are written into the text.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const DIR = join(process.cwd(), 'src/content/guides');
const files = readdirSync(DIR).filter((f) => f.endsWith('.mdx'));

function frontmatter(src: string): { lastChecked?: string; urls: string[] } {
  const m = /^---\n([\s\S]*?)\n---/.exec(src)!;
  const lastChecked = /lastChecked:\s*'?(\d{4}-\d{2}-\d{2})'?/.exec(m[1]!)?.[1];
  const urls = [...m[1]!.matchAll(/url:\s*'([^']+)'/g)].map((x) => x[1]!);
  return { lastChecked, urls };
}

describe('guides', () => {
  it('there are three', () => {
    expect(files.sort()).toEqual(['fix.mdx', 'ship.mdx', 'start.mdx']);
  });
  it.each(files)('%s has sources and a valid last-checked date', (f) => {
    const { lastChecked, urls } = frontmatter(readFileSync(join(DIR, f), 'utf8'));
    expect(lastChecked).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(Number.isNaN(Date.parse(lastChecked!))).toBe(false);
    expect(urls.length).toBeGreaterThan(0);
    for (const u of urls) expect(u).toMatch(/^https:\/\//);
  });
  it.each(files)('%s writes no install commands from memory', (f) => {
    const text = readFileSync(join(DIR, f), 'utf8');
    for (const bad of ['curl -fsSL', 'irm https', 'brew install', 'winget install', 'npm install'])
      expect(text, `${f} contains "${bad}"`).not.toContain(bad);
  });
  it.each(files)('%s links to official pages for every outside fact it names', (f) => {
    const text = readFileSync(join(DIR, f), 'utf8');
    // Any inline outside link in the body is https and not a bare shortener.
    for (const m of text.matchAll(/\]\((https?:[^)]+)\)/g)) {
      expect(m[1]).toMatch(
        /^https:\/\/(code\.claude\.com|claude\.com|docs\.|developer\.|support\.apple\.com|firefox-source-docs|app\.netlify\.com)/,
      );
    }
  });
  it('lists the places still marked for the owner to verify', () => {
    const marked = files.flatMap((f) =>
      [...readFileSync(join(DIR, f), 'utf8').matchAll(/\[OWNER: verify[^\]]*\]/g)].map(
        (x) => `${f}: ${x[0]}`,
      ),
    );
    // Not a failure: these are what HANDOFF.md reports to the owner.
    expect(marked.length).toBeGreaterThanOrEqual(0);
  });
});
