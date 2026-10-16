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
const SEED = 20261016;

/** The prototype with only one scene's section kept and its header/captions hidden. */
function prototypeFor(slug: string): string {
  const withoutOthers = PROTOTYPE.replace(
    /<section class="scene[^"]*"[^>]*data-scene="([a-z]+)"[\s\S]*?<\/section>/g,
    (block, s: string) => (s === slug ? block : ''),
  );
  return withoutOthers.replace(
    '</style>',
    '.bar,.caption,.scene--canvas::after{display:none!important}body::before{display:none}</style>',
  );
}

async function prepare(page: Page) {
  await page.addInitScript((seed: number) => {
    // mulberry32: the same sequence on both pages.
    let a = seed >>> 0;
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

test.describe('particles matches the prototype', () => {
  test('swarm-in, settle, cursor hole and click blast', async ({ browser }, info) => {
    const viewport = info.project.use.viewport!;
    const ctxOpts = {
      viewport,
      deviceScaleFactor: 2,
      isMobile: info.project.use.isMobile,
      hasTouch: info.project.use.hasTouch,
    };
    const ctxA = await browser.newContext(ctxOpts);
    const ctxB = await browser.newContext({ ...ctxOpts, baseURL: info.project.use.baseURL });
    const proto = await ctxA.newPage();
    const ours = await ctxB.newPage();
    await open(proto, 'prototype', 'particles');
    await open(ours, 'peak', 'particles');

    const step = async (ms: number) => {
      await proto.clock.runFor(ms);
      await ours.clock.runFor(ms);
    };

    await step(500);
    const introP = await shot(proto, info, 'proto-intro.png');
    const introO = await shot(ours, info, 'ours-intro.png');
    await step(6000);
    const settledP = await shot(proto, info, 'proto-settled.png');
    const settledO = await shot(ours, info, 'ours-settled.png');

    const { width, height } = viewport;
    const target = {
      x: Math.round(width * 0.35),
      y: Math.round(height * (width < 700 ? 0.4 : 0.43)),
    };
    for (const p of [proto, ours]) await p.mouse.move(target.x, target.y);
    await step(400);
    const hoverP = await shot(proto, info, 'proto-cursor.png');
    const hoverO = await shot(ours, info, 'ours-cursor.png');
    for (const p of [proto, ours]) await p.mouse.click(target.x + 40, target.y);
    await step(300);
    const blastP = await shot(proto, info, 'proto-blast.png');
    const blastO = await shot(ours, info, 'ours-blast.png');

    await compare(settledO, settledP, info, 'settled.png', 0.02);
    await compare(introO, introP, info, 'intro.png', 0.02);
    await compare(hoverO, hoverP, info, 'cursor.png', 0.02);
    await compare(blastO, blastP, info, 'blast.png', 0.02);
    await ctxA.close();
    await ctxB.close();
  });
});
