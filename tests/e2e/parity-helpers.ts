// Shared setup for parity tests: identical seeded random numbers, a paused fake
// clock stepped frame by frame, the font held back so nothing samples a fallback,
// and helpers to screenshot and compare.
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { expect, type Page, type TestInfo } from '@playwright/test';

export const PROTOTYPE = readFileSync('reference/peak-prototype.html', 'utf8');

export const SEED = 20261016;

/** The prototype with only one scene's section kept and its header/captions hidden. */
export function prototypeFor(slug: string): string {
  const withoutOthers = PROTOTYPE.replace(
    /<section class="scene[^"]*"[^>]*data-scene="([a-z]+)"[\s\S]*?<\/section>/g,
    (block, s: string) => (s === slug ? block : ''),
  );
  return withoutOthers.replace(
    '</style>',
    '.bar,.caption,.magnet,.scene--canvas::after{display:none!important}body::before{display:none}</style>',
  );
}

export async function prepare(page: Page) {
  await page.addInitScript((seed: number) => {
    // mulberry32: the same sequence on both pages. __reseed() restarts it, so a
    // scenario can re-synchronize the two pages at a known moment.
    let a = seed >>> 0;
    (window as unknown as { __reseed: (s: number) => void }).__reseed = (s) => {
      a = s >>> 0;
    };
    Math.random = () => {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    try {
      localStorage.setItem('peak:living', '0');
    } catch {}
  }, SEED);
  // Hold the font back so both pages draw their first frames before Anybody exists:
  // a scene must wait for the real font instead of sampling a fallback.
  await page.route('https://fonts.gstatic.com/**', async (route) => {
    await new Promise((r) => setTimeout(r, 3000));
    await route.continue();
  });
  await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'no-preference' });
  // Time stands still except during runFor(), so both pages step identical frames.
  await page.clock.install({ time: 0 });
  await page.clock.pauseAt(1000);
}

export async function open(
  page: Page,
  which: 'prototype' | 'peak' | 'file',
  slug: string,
  file?: string,
) {
  await prepare(page);
  if (which === 'prototype') {
    const url = `http://localhost:4329/__prototype/${slug}`;
    await page.route(url, (r) => r.fulfill({ body: prototypeFor(slug), contentType: 'text/html' }));
    await page.goto(url, { waitUntil: 'domcontentloaded' });
  } else if (which === 'file') {
    // A page built by a fresh agent from the scene's prompt (docs/prompt-tests/).
    const url = `http://localhost:4329/__prompt-test/${slug}`;
    const body = readFileSync(file!, 'utf8');
    await page.route(url, (r) => r.fulfill({ body, contentType: 'text/html' }));
    await page.goto(url, { waitUntil: 'domcontentloaded' });
  } else {
    await page.goto(`/dev/parity?s=${slug}`, { waitUntil: 'domcontentloaded' });
  }
  // goto() returns as soon as the HTML is parsed (the default 'load' would wait for
  // the held font). Let layout and resize observers fire, then flush the frames
  // they queue, all before the font is released, so each page builds exactly once.
  await page.waitForTimeout(1000);
  await page.clock.runFor(100);
  await page.waitForFunction(() => document.fonts.check('900 120px Anybody'));
  await page.waitForTimeout(300); // let font-ready callbacks build the scene
}

export const section = (page: Page) => page.locator('section').first();

/** How much ink is in each cell of a 24×16 grid over the canvas (0 = background). */
export async function inkGrid(page: Page): Promise<number[]> {
  return page.evaluate(() => {
    const src = (document.querySelector('section canvas') ??
      document.querySelector('canvas')) as HTMLCanvasElement;
    const cols = 24;
    const rows = 16;
    const small = document.createElement('canvas');
    small.width = cols;
    small.height = rows;
    const g = small.getContext('2d')!;
    g.fillStyle = getComputedStyle(document.body).backgroundColor;
    g.fillRect(0, 0, cols, rows);
    g.drawImage(src, 0, 0, cols, rows);
    const d = g.getImageData(0, 0, cols, rows).data;
    const bg = getComputedStyle(document.body).backgroundColor.match(/\d+/g)!.map(Number);
    const out: number[] = [];
    for (let i = 0; i < d.length; i += 4)
      out.push(
        (Math.abs(d[i]! - bg[0]!) + Math.abs(d[i + 1]! - bg[1]!) + Math.abs(d[i + 2]! - bg[2]!)) /
          765,
      );
    return out;
  });
}

export async function shot(page: Page, info: TestInfo, name: string) {
  return section(page).screenshot({ path: info.outputPath(name), animations: 'disabled' });
}

/** Saves the prototype's screenshot as the expected image, then compares ours to it. */
export async function compare(
  ours: Buffer,
  theirs: Buffer,
  info: TestInfo,
  name: string,
  maxRatio: number,
) {
  const expected = info.snapshotPath(name);
  mkdirSync(dirname(expected), { recursive: true });
  writeFileSync(expected, theirs);
  expect.soft(ours).toMatchSnapshot(name, { maxDiffPixelRatio: maxRatio, threshold: 0.2 });
}
