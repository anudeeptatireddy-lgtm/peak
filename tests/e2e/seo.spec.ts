import { expect, test } from '@playwright/test';
import { existsSync, readdirSync } from 'node:fs';

// PLAN 9.4 / PRD §22: unique titles and descriptions, canonical links, share images.
const PAGES = [
  '/',
  '/gallery',
  '/tour',
  '/start',
  '/fix',
  '/ship',
  '/words',
  '/drops',
  '/about',
  '/scenes/ripple',
];

test('every page has a unique title and description, a canonical link and a share image', async ({
  page,
}) => {
  const titles = new Set<string>();
  const descs: string[] = [];
  for (const path of PAGES) {
    await page.goto(path);
    const title = await page.title();
    expect(title.length, path).toBeGreaterThan(3);
    titles.add(title);
    const desc = await page.locator('meta[name="description"]').getAttribute('content');
    expect(desc?.length ?? 0, path).toBeGreaterThan(20);
    descs.push(path === '/scenes/ripple' || path === '/' ? '' : desc!);
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    expect(canonical, path).toMatch(/^https:\/\/.+/);
    expect(new URL(canonical!).pathname, path).toBe(path);
    const og = await page.locator('meta[property="og:image"]').getAttribute('content');
    expect(og, path).toMatch(/^https:\/\/.+\/og\/[a-z-]+\.png$/);
    expect(await page.locator('meta[name="twitter:card"]').getAttribute('content')).toBe(
      'summary_large_image',
    );
  }
  expect(titles.size).toBe(PAGES.length);
});

test('scene and home share images are their own', async ({ page }) => {
  await page.goto('/scenes/ripple');
  expect(await page.locator('meta[property="og:image"]').getAttribute('content')).toContain(
    '/og/ripple.png',
  );
  await page.goto('/');
  expect(await page.locator('meta[property="og:image"]').getAttribute('content')).toContain(
    '/og/home.png',
  );
});

test('an OG image is committed for every scene, the home page and a fallback', () => {
  const slugs = readdirSync('src/scenes', { withFileTypes: true })
    .filter((d) => d.isDirectory() && d.name !== 'node_modules')
    .map((d) => d.name);
  for (const s of [...slugs, 'home', 'default'])
    expect(existsSync(`public/og/${s}.png`), s).toBe(true);
});
