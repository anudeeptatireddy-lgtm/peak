// Screenshot helper used while building scenes. Copy it into the repo root (it
// imports @playwright/test), start \`npx astro preview --port 4330\`, then run:
// node shoot.tmp.mjs '/scenes/<slug>/' <outPrefix> [waitMs] '[{"move":[0.3,0.5]},{"shot":"a"}]'
// Positions are shares of the viewport; actions: move, click, down, up, wheel, scrollY, eval, wait, shot.
// Usage: node shoot.mjs <url-path> <outPrefix> [waitMs] [actions-json]
import { chromium } from '@playwright/test';
const [, , path, out, wait = '3000', actions = '[]'] = process.argv;
const browser = await chromium.launch();
for (const [name, vp] of [
  ['desktop', { width: 1280, height: 800 }],
  ['phone', { width: 390, height: 844 }],
]) {
  const page = await browser.newPage({
    viewport: vp,
    deviceScaleFactor: 1,
    hasTouch: name === 'phone',
    isMobile: name === 'phone',
  });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  await page.goto('http://localhost:4330' + path);
  await page.waitForTimeout(Number(wait));
  for (const a of JSON.parse(actions)) {
    if (a.move) await page.mouse.move(a.move[0] * vp.width, a.move[1] * vp.height, { steps: 8 });
    if (a.click) await page.mouse.click(a.click[0] * vp.width, a.click[1] * vp.height);
    if (a.down) await page.mouse.down();
    if (a.up) await page.mouse.up();
    if (a.wheel) await page.mouse.wheel(0, a.wheel);
    if (a.scrollY !== undefined) await page.evaluate((y) => window.scrollTo(0, y), a.scrollY);
    if (a.eval) console.log(name, JSON.stringify(await page.evaluate(a.eval)));
    if (a.wait) await page.waitForTimeout(a.wait);
    if (a.shot) await page.screenshot({ path: `${out}-${name}-${a.shot}.png` });
  }
  await page.screenshot({ path: `${out}-${name}.png` });
  if (errors.length) console.log(name, 'ERRORS', errors);
  await page.close();
}
await browser.close();
