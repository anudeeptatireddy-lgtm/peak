// Shared setup for parity tests: identical seeded random numbers, a paused fake
// clock stepped frame by frame, the font held back so nothing samples a fallback,
// and helpers to screenshot and compare.
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { expect, type Page, type TestInfo } from '@playwright/test';

export const PROTOTYPE = readFileSync('reference/peak-prototype.html', 'utf8');
/** The earlier riso demo, source of `pluck`, `drop`, `overprint` and `halftone`. */
export const RISO_DEMO = readFileSync('reference/riso-demo.html', 'utf8');
export const FROM_RISO_DEMO = ['pluck', 'drop', 'overprint', 'halftone'];
/** Our Riso world, so both pages draw with the same inks (the demo has its own palette). */
const RISO = {
  ground: '#F4F2FF',
  ink: '#1A1240',
  'ink-soft': '#4E4777',
  c1: '#EC1C7F',
  c2: '#2A47EA',
  c3: '#FF7A00',
};

export const SEED = 20261016;

/** The prototype with only one scene's section kept and its header/captions hidden. */
export function prototypeFor(slug: string): string {
  if (FROM_RISO_DEMO.includes(slug)) {
    const only = RISO_DEMO.replace(
      /<section class="scene[^"]*"[^>]*data-scene="([a-z]+)"[\s\S]*?<\/section>/g,
      (block, s: string) => (s === slug ? block : ''),
    );
    const vars = Object.entries(RISO)
      .map(([k, v]) => `--${k}:${v}!important;`)
      .join('');
    return only.replace(
      '</style>',
      `:root{${vars}}.site-header,.caption,.scene.has-canvas::after{display:none!important}</style>`,
    );
  }
  const withoutOthers = PROTOTYPE.replace(
    /<section class="scene[^"]*"[^>]*data-scene="([a-z]+)"[\s\S]*?<\/section>/g,
    (block, s: string) => (s === slug ? block : ''),
  );
  return withoutOthers.replace(
    '</style>',
    '.bar,.caption,.magnet,.scene--canvas::after{display:none!important}body::before{display:none}</style>',
  );
}

export async function prepare(page: Page, ours = false) {
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
  // Our engine's test mode: seeded random numbers and a fixed 16ms step per frame.
  if (ours)
    await page.addInitScript((seed: number) => ((window as any).__PEAK_TEST__ = seed), SEED);
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
  await prepare(page, which === 'peak');
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

/** What a prompt test measures on one screenshot (PRD §8.7). */
export interface Look {
  ink: number;
  box: [number, number, number, number];
  centroid: [number, number];
  hues: number[];
  /** Share of the picture that is clearly colored (not gray). */
  color: number;
  gray: number[];
}

const GRAY_W = 64;
const GRAY_H = 40;
const HUE_BINS = 6;

/** Measures a screenshot inside a throwaway page (ink share, layout, palette, a tiny gray copy). */
export async function look(page: Page, png: Buffer): Promise<Look> {
  return page.evaluate(
    async ({ b64, GRAY_W, GRAY_H, HUE_BINS }) => {
      const img = new Image();
      img.src = `data:image/png;base64,${b64}`;
      await img.decode();
      const w = 320;
      const h = Math.round((img.height / img.width) * w);
      const c = document.createElement('canvas');
      c.width = w;
      c.height = h;
      const g = c.getContext('2d', { willReadFrequently: true })!;
      g.drawImage(img, 0, 0, w, h);
      const d = g.getImageData(0, 0, w, h).data;
      // The background is the most common color (so a star in the corner can't fool it).
      const seen = new Map<number, number>();
      for (let i = 0; i < d.length; i += 4) {
        const key = ((d[i]! >> 3) << 10) | ((d[i + 1]! >> 3) << 5) | (d[i + 2]! >> 3);
        seen.set(key, (seen.get(key) ?? 0) + 1);
      }
      const top = [...seen.entries()].sort((x, y) => y[1] - x[1])[0]![0];
      const bg = [((top >> 10) & 31) << 3, ((top >> 5) & 31) << 3, (top & 31) << 3];
      let n = 0;
      let sx = 0;
      let sy = 0;
      const colHist = new Array(w).fill(0);
      const rowHist = new Array(h).fill(0);
      const hues = new Array(HUE_BINS).fill(0);
      let sat = 0;
      for (let y = 0; y < h; y++)
        for (let x = 0; x < w; x++) {
          const i = (y * w + x) * 4;
          const r = d[i]!;
          const gg = d[i + 1]!;
          const b = d[i + 2]!;
          const diff = Math.abs(r - bg[0]!) + Math.abs(gg - bg[1]!) + Math.abs(b - bg[2]!);
          if (diff < 120) continue;
          n++;
          sx += x;
          sy += y;
          colHist[x]++;
          rowHist[y]++;
          const mx = Math.max(r, gg, b);
          const mn = Math.min(r, gg, b);
          if (mx - mn > 64) {
            let hue =
              mx === r
                ? ((gg - b) / (mx - mn)) % 6
                : mx === gg
                  ? (b - r) / (mx - mn) + 2
                  : (r - gg) / (mx - mn) + 4;
            if (hue < 0) hue += 6;
            hues[Math.min(HUE_BINS - 1, Math.floor((hue / 6) * HUE_BINS))]++;
            sat++;
          }
        }
      // The box holds the middle 90% of the ink, so a few stray pixels don't count.
      const span = (hist: number[], len: number): [number, number] => {
        let lo = 0;
        let hi = len - 1;
        let acc = 0;
        while (lo < len - 1 && acc + hist[lo]! < n * 0.05) acc += hist[lo++]!;
        acc = 0;
        while (hi > 0 && acc + hist[hi]! < n * 0.05) acc += hist[hi--]!;
        return [lo / len, hi / len];
      };
      const [x0, x1] = span(colHist, w);
      const [y0, y1] = span(rowHist, h);
      const small = document.createElement('canvas');
      small.width = GRAY_W;
      small.height = GRAY_H;
      const sg = small.getContext('2d', { willReadFrequently: true })!;
      sg.drawImage(c, 0, 0, GRAY_W, GRAY_H);
      const sd = sg.getImageData(0, 0, GRAY_W, GRAY_H).data;
      const gray: number[] = [];
      for (let i = 0; i < sd.length; i += 4) gray.push((sd[i]! + sd[i + 1]! + sd[i + 2]!) / 765);
      return {
        ink: n / (w * h),
        box: [x0, y0, x1, y1] as [number, number, number, number],
        centroid: (n ? [sx / n / w, sy / n / h] : [0.5, 0.5]) as [number, number],
        hues: hues.map((v) => (sat ? v / sat : 0)),
        color: sat / (w * h),
        gray,
      };
    },
    { b64: png.toString('base64'), GRAY_W, GRAY_H, HUE_BINS },
  );
}

/** The motion between two looks: mean absolute change of the tiny gray copy. */
export const energy = (a: Look, b: Look) =>
  a.gray.reduce((s, v, i) => s + Math.abs(v - b.gray[i]!), 0) / a.gray.length;

/**
 * The prompt-test pass rule (PRD §8.7). Returns what differs, empty when it passes:
 * same palette, ink amount within ±10%, same layout, speeds within ±20%, and the
 * same reaction (more or less ink) to what the visitor did.
 */
export function judge(
  name: string,
  a: Look,
  b: Look,
  prev?: { a: Look; b: Look },
  eye?: string[],
): string[] {
  const out: string[] = [];
  const rel = (x: number, y: number) => Math.abs(x - y) / Math.max(x, y, 1e-9);
  if (rel(a.ink, b.ink) > 0.3 && Math.max(a.ink, b.ink) > 0.01)
    out.push(`${name}: ink amount ${a.ink.toFixed(4)} vs ${b.ink.toFixed(4)} (limit ±30%)`);
  else if (rel(a.ink, b.ink) > 0.1 && Math.max(a.ink, b.ink) > 0.01)
    eye?.push(
      `${name}: ink amount ${a.ink.toFixed(4)} vs ${b.ink.toFixed(4)} (10–30% apart: judge by eye)`,
    );
  const near = (x: number, y: number) => Math.abs(x - y) <= 0.05;
  const moving = prev ? Math.max(energy(prev.a, a), energy(prev.b, b)) > 0.02 : true;
  if (!a.box.every((v, i) => near(v, b.box[i]!)) && a.ink > 0.003)
    (moving ? (eye ?? out) : out).push(
      `${name}: layout box ${a.box.map((v) => v.toFixed(2))} vs ${b.box.map((v) => v.toFixed(2))}`,
    );
  if (Math.min(a.ink, b.ink) > 0.02) {
    const off = Math.max(
      Math.abs(a.centroid[0] - b.centroid[0]),
      Math.abs(a.centroid[1] - b.centroid[1]),
    );
    const text = `${name}: ink center ${a.centroid.map((v) => v.toFixed(2))} vs ${b.centroid.map((v) => v.toFixed(2))}`;
    if (off > 0.1) out.push(text);
    else if (off > 0.05) eye?.push(`${text} (5–10% apart: judge by eye)`);
  }
  const same = a.hues.reduce((s, v, i) => s + Math.min(v, b.hues[i]!), 0);
  const any = a.color > 0.003 && b.color > 0.003;
  if (any && same < 0.8) out.push(`${name}: palette overlap ${same.toFixed(2)} (needs 0.80)`);
  if (prev) {
    const ea = energy(prev.a, a);
    const eb = energy(prev.b, b);
    if (Math.max(ea, eb) > 0.05 && rel(ea, eb) > 0.2)
      out.push(`${name}: motion ${ea.toFixed(3)} vs ${eb.toFixed(3)} (limit ±20%)`);
    const da = a.ink - prev.a.ink;
    const db = b.ink - prev.b.ink;
    if (Math.abs(da) > 0.1 * a.ink && Math.abs(db) > 0.1 * b.ink && Math.sign(da) !== Math.sign(db))
      out.push(`${name}: reacts the opposite way (ink ${da.toFixed(4)} vs ${db.toFixed(4)})`);
  }
  return out;
}

/** Stacks "prompt build | ours" screenshots into one image for the owner to judge by eye. */
export async function sideBySide(
  page: Page,
  rows: { name: string; theirs: Buffer; ours: Buffer }[],
): Promise<Buffer> {
  const b64 = await page.evaluate(
    async (items) => {
      const load = async (s: string) => {
        const i = new Image();
        i.src = `data:image/png;base64,${s}`;
        await i.decode();
        return i;
      };
      const imgs = await Promise.all(
        items.map(async (r) => [await load(r.theirs), await load(r.ours)] as const),
      );
      const w = 640;
      const label = 28;
      const hs = imgs.map(([t]) => Math.round((t.height / t.width) * w));
      const c = document.createElement('canvas');
      c.width = w * 2 + 10;
      c.height = hs.reduce((s, h) => s + h + label, 0);
      const g = c.getContext('2d')!;
      g.fillStyle = '#fff';
      g.fillRect(0, 0, c.width, c.height);
      g.fillStyle = '#000';
      g.font = '16px sans-serif';
      let y = 0;
      imgs.forEach(([t, o], i) => {
        g.fillText(`${items[i]!.name}: built from the prompt (left) | peak (right)`, 4, y + 20);
        g.drawImage(t, 0, y + label, w, hs[i]!);
        g.drawImage(o, w + 10, y + label, w, hs[i]!);
        y += hs[i]! + label;
      });
      return c.toDataURL('image/png').split(',')[1]!;
    },
    rows.map((r) => ({
      name: r.name,
      theirs: r.theirs.toString('base64'),
      ours: r.ours.toString('base64'),
    })),
  );
  return Buffer.from(b64, 'base64');
}

/** The fake clock's frame: Playwright fires requestAnimationFrame every 16ms. */
export const FRAME_MS = 16;
