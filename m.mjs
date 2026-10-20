import { chromium, devices } from '@playwright/test';
const b = await chromium.launch(); 
const ctx = await b.newContext({ ...devices['Pixel 5'] });
for (const path of ['/', '/scenes/ripple', '/gallery', '/tour', '/start', '/words']) {
  const p = await ctx.newPage();
  await p.addInitScript(() => { window.__m = { lcp: 0, long: [] };
    new PerformanceObserver(l => { for (const e of l.getEntries()) window.__m.lcp = e.startTime; }).observe({ type: 'largest-contentful-paint', buffered: true });
    new PerformanceObserver(l => { for (const e of l.getEntries()) window.__m.long.push(Math.round(e.duration)); }).observe({ type: 'longtask', buffered: true }); });
  await p.goto('https://peak-teal.vercel.app' + path, { waitUntil: 'load' }); await p.waitForTimeout(3000);
  const m = await p.evaluate(() => window.__m);
  console.log(path, 'LCP', Math.round(m.lcp), 'ms; long tasks', JSON.stringify(m.long));
  await p.close();
}
await b.close();
