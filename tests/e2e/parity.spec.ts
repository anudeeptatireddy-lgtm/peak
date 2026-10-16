// Prototype parity (owner request, 2026-10-16): each ported scene must render like
// its section of reference/peak-prototype.html under identical conditions —
// same viewport, same seeded Math.random, Riso light colors, living colors off,
// Anybody fully loaded before sampling, and a fake clock so both pages step the
// exact same frames. Screenshots are compared with Playwright's pixel comparator.
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { expect, test, type Page, type TestInfo } from '@playwright/test';

const PROTOTYPE = readFileSync('reference/peak-prototype.html', 'utf8');

// Playwright's fake clock drives requestAnimationFrame in Chromium only, so both
// sizes run in Chromium (the phone size with touch and mobile emulation).
test.use({ browserName: 'chromium' });
// Frame-by-frame stepping is slow; give each scene two minutes.
test.setTimeout(120_000);
const SEED = 20261016;

/** The prototype with only one scene's section kept and its header/captions hidden. */
function prototypeFor(slug: string): string {
  const withoutOthers = PROTOTYPE.replace(
    /<section class="scene[^"]*"[^>]*data-scene="([a-z]+)"[\s\S]*?<\/section>/g,
    (block, s: string) => (s === slug ? block : ''),
  );
  return withoutOthers.replace(
    '</style>',
    '.bar,.caption,.magnet,.scene--canvas::after{display:none!important}body::before{display:none}</style>',
  );
}

async function prepare(page: Page) {
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

async function open(page: Page, which: 'prototype' | 'peak', slug: string) {
  await prepare(page);
  if (which === 'prototype') {
    const url = `http://localhost:4329/__prototype/${slug}`;
    await page.route(url, (r) => r.fulfill({ body: prototypeFor(slug), contentType: 'text/html' }));
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

const section = (page: Page) => page.locator('section').first();

/** How much ink is in each cell of a 24×16 grid over the canvas (0 = background). */
async function inkGrid(page: Page): Promise<number[]> {
  return page.evaluate(() => {
    const src = document.querySelector('section canvas') as HTMLCanvasElement;
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

async function shot(page: Page, info: TestInfo, name: string) {
  return section(page).screenshot({ path: info.outputPath(name), animations: 'disabled' });
}

/** Saves the prototype's screenshot as the expected image, then compares ours to it. */
async function compare(
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

type Pair = { proto: Page; ours: Page };
type Scenario = (
  pp: Pair,
  step: (ms: number) => Promise<void>,
  view: { width: number; height: number },
) => AsyncGenerator<string>;

const both = async (pp: Pair, fn: (p: Page) => Promise<unknown>) => {
  for (const p of [pp.proto, pp.ours]) await fn(p);
};

/** Each scenario yields a name whenever both pages should be screenshotted and compared. */
const SCENARIOS: Record<string, Scenario> = {
  async *particles(pp, step, { width, height }) {
    await step(500);
    yield 'intro';
    await step(6000);
    yield 'settled';
    const x = Math.round(width * 0.35);
    const y = Math.round(height * (width < 700 ? 0.4 : 0.43));
    await both(pp, (p) => p.mouse.move(x, y));
    await step(400);
    yield 'cursor';
    await both(pp, (p) => p.mouse.click(x + 40, y));
    await step(300);
    yield 'blast';
  },
  async *elastic(pp, step, { width, height }) {
    await step(1500);
    yield 'idle-wave';
    await both(pp, (p) => p.mouse.move(Math.round(width * 0.3), Math.round(height * 0.45)));
    await step(700);
    yield 'hover';
  },
  async *velocity(_pp, step) {
    await step(300);
    yield 'start';
    await step(2000);
    yield 'drift';
  },
  async *ripple(pp, step, { width, height }) {
    // The prototype's very first frame can run before its canvas is sized, so on a
    // phone its first automatic ring starts at the top-left corner (a prototype race,
    // see DECISIONS). Compare once that ring has expired (rings live 5 seconds).
    await step(5300);
    yield 'auto-ripples';
    await both(pp, (p) => p.mouse.move(Math.round(width * 0.3), Math.round(height * 0.5)));
    await step(300);
    yield 'cursor';
    await both(pp, (p) => p.mouse.click(Math.round(width * 0.6), Math.round(height * 0.4)));
    await step(500);
    yield 'click';
  },
  async *flow(pp, step, { width, height }) {
    // A flow field never settles, and a loading frame or two can differ between the
    // pages, so the live field is compared by where its ink is (inkGrid). The
    // prototype's reduced-motion still frame is blank, so there is nothing to compare
    // there; ours draws the 70 steps PRD SCENES #22 asks for (see DECISIONS).
    await step(2000);
    yield 'signature:trails';
    await both(pp, (p) => p.mouse.move(Math.round(width * 0.5), Math.round(height * 0.5)));
    await both(pp, (p) => p.mouse.down());
    await step(1500);
    yield 'signature:stir';
    await both(pp, (p) => p.mouse.up());
  },
  async *warp(pp, step, { width, height }) {
    await step(1000);
    yield 'cruise';
    await both(pp, (p) => p.mouse.move(Math.round(width * 0.3), Math.round(height * 0.3)));
    await both(pp, (p) => p.mouse.down());
    await step(1500);
    yield 'warp';
    await both(pp, (p) => p.mouse.up());
    await step(800);
    yield 'slowing';
  },
};

for (const [slug, scenario] of Object.entries(SCENARIOS)) {
  test(`${slug} matches the prototype`, async ({ browser }, info) => {
    const viewport = info.project.use.viewport!;
    const opts = {
      viewport,
      deviceScaleFactor: 2,
      isMobile: info.project.use.isMobile,
      hasTouch: info.project.use.hasTouch,
    };
    const ctxA = await browser.newContext(opts);
    const ctxB = await browser.newContext({ ...opts, baseURL: info.project.use.baseURL });
    const pp: Pair = { proto: await ctxA.newPage(), ours: await ctxB.newPage() };
    await open(pp.proto, 'prototype', slug);
    await open(pp.ours, 'peak', slug);
    // The magnetic button's position is a deliberate layout difference (see DECISIONS).
    await pp.ours.addStyleTag({
      content: '[data-stage] button { visibility: hidden !important; }',
    });
    // Advance both pages in lockstep, one 60Hz frame at a time: one long runFor()
    // can deliver frames slightly differently to the two pages.
    const step = async (ms: number) => {
      for (let t = 0; t < ms; t += 16) {
        await pp.proto.clock.runFor(16);
        await pp.ours.clock.runFor(16);
      }
    };
    for await (const yielded of scenario(pp, step, viewport)) {
      const [kind, name] = yielded.includes(':') ? yielded.split(':') : ['pixels', yielded];
      const theirs = await shot(pp.proto, info, `proto-${name}.png`);
      const ours = await shot(pp.ours, info, `ours-${name}.png`);
      if (kind === 'signature') {
        const [a, b] = await Promise.all([inkGrid(pp.proto), inkGrid(pp.ours)]);
        const diff = a.reduce((sum, v, i) => sum + Math.abs(v - b[i]!), 0) / a.length;
        expect.soft(diff, `${name}: average ink difference per grid cell`).toBeLessThan(0.02);
      } else await compare(ours, theirs, info, `${name}.png`, 0.02);
    }
    await ctxA.close();
    await ctxB.close();
  });
}
