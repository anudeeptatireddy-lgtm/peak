// Generates the share images (PRD §22): one per scene (its still frame in its own world, with
// the title), one for the home page, and a generic fallback. Writes to public/og/.
//
// Run:  npm run build && node scripts/make-og.mjs
// It starts `astro preview` itself, drives it with Playwright, and uses test mode (seeded random,
// fixed step) so the same build always gives the same pictures.

import { spawn } from 'node:child_process';
import { mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';
import { chromium } from '@playwright/test';

const PORT = 4399;
const BASE = `http://localhost:${PORT}`;
const W = 1200;
const H = 630;
const OUT = 'public/og';
mkdirSync(OUT, { recursive: true });

const server = spawn('npx', ['astro', 'preview', '--port', String(PORT)], { stdio: 'ignore' });
for (let i = 0; i < 60; i += 1) {
  try {
    if ((await fetch(BASE)).ok) break;
  } catch {
    /* not up yet */
  }
  await sleep(500);
}

const slugs = readdirSync('src/scenes', { withFileTypes: true })
  .filter((d) => d.isDirectory() && d.name !== 'node_modules')
  .map((d) => d.name);

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1280, height: 800 },
  deviceScaleFactor: 1,
});
await ctx.addInitScript(() => {
  window.__PEAK_TEST__ = 7;
});
const page = await ctx.newPage();
const card = await ctx.newPage();
await card.setViewportSize({ width: W, height: H });

/** Puts a picture and a title together into a 1200x630 card. */
async function compose(name, imageBuffer, title, subtitle, ground, ink) {
  const img = imageBuffer ? `data:image/png;base64,${imageBuffer.toString('base64')}` : '';
  await card.setContent(`<!doctype html><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anybody:wdth,wght@75..125,100..900&display=swap">
<style>
  html,body{margin:0;width:${W}px;height:${H}px;background:${ground};overflow:hidden}
  .pic{position:absolute;inset:0;background:url(${img}) center/cover no-repeat}
  .bar{position:absolute;left:0;right:0;bottom:0;padding:90px 56px 44px;
    background:linear-gradient(to top,${ground} 30%,transparent);color:${ink};
    font-family:Anybody,system-ui,sans-serif}
  .t{font-size:76px;line-height:1;font-weight:850;font-stretch:112%;margin:0}
  .s{font-size:30px;margin:12px 0 0;opacity:.8;font-weight:450}
  .m{position:absolute;right:56px;top:40px;font-family:Anybody,system-ui,sans-serif;
    font-weight:900;font-size:44px;color:${ink}}
</style>
<div class="pic"></div><div class="m">peak</div>
<div class="bar"><p class="t">${title}</p><p class="s">${subtitle}</p></div>`);
  await card.evaluate(() => document.fonts.ready);
  await sleep(300);
  writeFileSync(`${OUT}/${name}.png`, await card.screenshot({ type: 'png' }));
}

// Scenes
for (const slug of slugs) {
  await page.goto(`${BASE}/scenes/${slug}`);
  await page.addStyleTag({
    content:
      '[data-header],footer,.title-block,.panel,.stage-controls,.sheet-handle{display:none!important}',
  });
  await page.evaluate(() => document.documentElement.classList.add('panel-collapsed'));
  await sleep(1800);
  const info = await page.evaluate(() => ({
    title: document.querySelector('h1')?.textContent ?? '',
    summary: document.querySelector('.title-block p')?.textContent ?? '',
    ground: getComputedStyle(document.documentElement).getPropertyValue('--ground').trim(),
    ink: getComputedStyle(document.documentElement).getPropertyValue('--ink').trim(),
  }));
  const stage = await page.locator('[data-stage]').screenshot({ type: 'png' });
  await compose(slug, stage, info.title, 'Tweak it, copy the prompt', info.ground, info.ink);
  console.log('og', slug);
}

// Home: the hero
await page.setViewportSize({ width: W, height: 800 });
await page.goto(BASE);
await page.addStyleTag({ content: '[data-header],.caption,[data-rail]{display:none!important}' });
await sleep(2200);
const hero = await page.screenshot({ type: 'png', clip: { x: 0, y: 0, width: W, height: 800 } });
const homeColors = await page.evaluate(() => ({
  ground: getComputedStyle(document.documentElement).getPropertyValue('--ground').trim(),
  ink: getComputedStyle(document.documentElement).getPropertyValue('--ink').trim(),
}));
await compose(
  'home',
  hero,
  'Tweak it. Copy it. Build it.',
  'Animations you can play with, plus the exact prompt.',
  homeColors.ground,
  homeColors.ink,
);

// Generic fallback
await compose(
  'default',
  null,
  'peak',
  'Animations you can play with, plus the exact prompt to make your own.',
  '#FFE3F1',
  '#2A0A1E',
);

await browser.close();
server.kill();
console.log(`done: ${slugs.length} scenes + home + default in ${OUT}/`);
