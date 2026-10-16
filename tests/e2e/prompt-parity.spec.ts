// Prompt parity (owner request, 2026-10-16): the core promise of peak is that a
// scene's prompt alone rebuilds it. For each scene in docs/prompt-tests/<slug>/, a
// fresh agent built index.html from PROMPT.md in an empty folder. This test renders
// that page and our scene side by side under identical conditions and compares.
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { test, type Page } from '@playwright/test';
import { compare, open } from './parity-helpers';

test.use({ browserName: 'chromium' });
test.setTimeout(120_000);

const DIR = join(process.cwd(), 'docs/prompt-tests');
const BUILT = existsSync(DIR)
  ? readdirSync(DIR).filter((d) => existsSync(join(DIR, d, 'index.html')))
  : [];

/** Hide everything but canvases, so only the animation itself is compared. */
const onlyCanvas = (p: Page) =>
  p.addStyleTag({
    content:
      'body * { visibility: hidden !important; } canvas, [data-stage] * { visibility: visible !important; }',
  });

for (const slug of BUILT) {
  test(`${slug}: the prompt alone rebuilds the scene`, async ({ browser }, info) => {
    const viewport = info.project.use.viewport!;
    const opts = {
      viewport,
      deviceScaleFactor: 2,
      isMobile: info.project.use.isMobile,
      hasTouch: info.project.use.hasTouch,
    };
    const ctxA = await browser.newContext(opts);
    const ctxB = await browser.newContext({ ...opts, baseURL: info.project.use.baseURL });
    const theirs = await ctxA.newPage();
    const ours = await ctxB.newPage();
    await open(theirs, 'file', slug, join(DIR, slug, 'index.html'));
    await open(ours, 'peak', slug);
    for (const p of [theirs, ours]) await onlyCanvas(p);
    const step = async (ms: number) => {
      for (let t = 0; t < ms; t += 16) {
        await theirs.clock.runFor(16);
        await ours.clock.runFor(16);
      }
    };
    const snap = async (name: string) => {
      const a = await theirs.screenshot({ path: info.outputPath(`prompt-${name}.png`) });
      const b = await ours.screenshot({ path: info.outputPath(`ours-${name}.png`) });
      await compare(b, a, info, `${slug}-${name}.png`, 0.02);
    };
    await step(500);
    await snap('intro');
    await step(6000);
    await snap('settled');
    const x = Math.round(viewport.width * 0.35);
    const y = Math.round(viewport.height * (viewport.width < 700 ? 0.4 : 0.43));
    for (const p of [theirs, ours]) await p.mouse.move(x, y);
    await step(400);
    await snap('cursor');
    for (const p of [theirs, ours]) await p.mouse.click(x + 40, y);
    await step(300);
    await snap('blast');
    await ctxA.close();
    await ctxB.close();
  });
}
