// Prompt parity (owner request, 2026-10-16): the core promise of peak is that a
// scene's prompt alone rebuilds it. For each scene in docs/prompt-tests/<slug>/, a
// fresh agent built index.html from PROMPT.md in an empty folder. This test renders
// that page and our scene side by side under identical conditions, runs the same
// scripted moments as the prototype parity test, and compares.
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { compare, inkGrid, open } from './parity-helpers';
import { SCENARIOS, type Pair } from './scenarios';

test.use({ browserName: 'chromium' });
test.setTimeout(120_000);

const DIR = join(process.cwd(), 'docs/prompt-tests');
const BUILT = existsSync(DIR)
  ? readdirSync(DIR).filter((d) => existsSync(join(DIR, d, 'compare.json')) && d in SCENARIOS)
  : [];

/**
 * What to leave out on the built page: `hide` in docs/prompt-tests/<slug>/compare.json
 * lists the titles, hints and Play buttons the agent added around the animation.
 * Only those are hidden (visibility: hidden lets pointer events through to the
 * scene below), so the page still receives the scripted mouse moves and clicks.
 * Our stage's own buttons are hidden the same way.
 */
interface CompareConfig {
  hide: string;
  /** A logged failure (docs/PROMPT_TESTS.md) awaiting a retest: runs, and must still fail. */
  expect?: 'fail';
  reason?: string;
}
const config = (slug: string) =>
  JSON.parse(readFileSync(join(DIR, slug, 'compare.json'), 'utf8')) as CompareConfig;
const hide = (p: Page, sel: string) =>
  p.addStyleTag({ content: `${sel} { visibility: hidden !important; }` });

for (const slug of BUILT) {
  test(`${slug}: the prompt alone rebuilds the scene`, async ({ browser }, info) => {
    const cfg = config(slug);
    // Known failures stay visible: if the page starts matching, this flips to an error.
    test.fail(cfg.expect === 'fail', cfg.reason);
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
    await open(pp.proto, 'file', slug, join(DIR, slug, 'index.html'));
    await open(pp.ours, 'peak', slug);
    await hide(pp.proto, cfg.hide);
    await hide(pp.ours, '[data-stage] button');
    const step = async (ms: number) => {
      for (let t = 0; t < ms; t += 16) {
        await pp.proto.clock.runFor(16);
        await pp.ours.clock.runFor(16);
      }
    };
    for await (const yielded of SCENARIOS[slug]!(pp, step, viewport)) {
      const [kind, name] = yielded.includes(':') ? yielded.split(':') : ['pixels', yielded];
      const theirs = await pp.proto.screenshot({ path: info.outputPath(`prompt-${name}.png`) });
      const ours = await pp.ours.screenshot({ path: info.outputPath(`ours-${name}.png`) });
      if (kind === 'signature') {
        const [a, b] = await Promise.all([inkGrid(pp.proto), inkGrid(pp.ours)]);
        const diff = a.reduce((sum, v, i) => sum + Math.abs(v - b[i]!), 0) / a.length;
        expect.soft(diff, `${name}: average ink difference per grid cell`).toBeLessThan(0.02);
      } else await compare(ours, theirs, info, `${slug}-${name}.png`, 0.02);
    }
    await ctxA.close();
    await ctxB.close();
  });
}
