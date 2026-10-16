// Prototype parity (owner request, 2026-10-16): each ported scene must render like
// its section of reference/peak-prototype.html under identical conditions — same
// viewport, same seeded Math.random, Riso light colors, living colors off, Anybody
// fully loaded before sampling, and a paused fake clock stepped frame by frame.
import { expect, test, type Page } from '@playwright/test';
import { SEED, compare, inkGrid, open, shot } from './parity-helpers';

// Playwright's fake clock drives requestAnimationFrame in Chromium only, so both
// sizes run in Chromium (the phone size with touch and mobile emulation).
test.use({ browserName: 'chromium' });
// Frame-by-frame stepping is slow; give each scene two minutes.
test.setTimeout(120_000);

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
