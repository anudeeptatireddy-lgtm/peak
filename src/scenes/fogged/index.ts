// `fogged`: Fogged bottle (SCENES.md #51, gallery only). A colorful scene behind a pane of
// fog: a blurred, whitened copy masked by a low-resolution fog amount that the cursor wipes
// away, drips run down, and the fog creeps back from the edges.

import { createCanvas } from '../../engine/canvas';
import { fontsReady } from '../../engine/fonts';
import { createPointer } from '../../engine/pointer';
import { smoothstep } from '../../kits/easing';
import { applyFont } from '../../kits/text';
import { parseHex } from '../../theme/color';
import type { Theme } from '../../theme/worlds';
import { SHARED } from '../shared';
import type { Params, SceneContext, SceneInstance, SceneModule } from '../types';
import { FIXED } from './constants';
import { meta } from './meta';
import { params } from './params';
import { followUps } from './prompt';

interface Drip {
  x: number;
  y: number;
  left: number;
}

function create(host: HTMLElement, initial: Params, ctx: SceneContext): SceneInstance {
  let p = { ...initial };
  const n = (id: string) => Number(p[id]);
  let theme: Theme = ctx.theme;
  const c = createCanvas(host);
  const ptr = createPointer(host);
  const back = document.createElement('canvas');
  const blurred = document.createElement('canvas');
  const fogCv = document.createElement('canvas');
  const maskCv = document.createElement('canvas');
  const small = document.createElement('canvas');
  let fog = new Float32Array(0);
  let cols = 0;
  let rows = 0;
  let img: ImageData | null = null;
  let drips: Drip[] = [];
  let last: { x: number; y: number } | null = null;
  let owed = 0;

  const rgba = (hex: string, a: number) => {
    const q = parseHex(hex);
    const to = (v: number) => Math.round(v * FIXED.CHANNEL);
    return `rgba(${to(q.r)}, ${to(q.g)}, ${to(q.b)}, ${a})`;
  };

  /** The colorful scene behind the glass, drawn once at the screen size (CSS px). */
  function paintBack(): void {
    const w = c.w;
    const h = c.h;
    back.width = w;
    back.height = h;
    const g = back.getContext('2d')!;
    const a = (FIXED.BACK_ANGLE * Math.PI) / FIXED.HALF_TURN;
    const dx = Math.cos(a) * w;
    const dy = Math.sin(a) * h;
    const grad = g.createLinearGradient(
      w * 0.5 - dx * 0.5,
      h * 0.5 - dy * 0.5,
      w * 0.5 + dx * 0.5,
      h * 0.5 + dy * 0.5,
    );
    grad.addColorStop(0, theme.c1);
    grad.addColorStop(0.5, theme.c2);
    grad.addColorStop(1, theme.c3);
    g.fillStyle = grad;
    g.fillRect(0, 0, w, h);
    const inks = [theme.c3, theme.c1, theme.c2];
    FIXED.BLOBS.forEach((b, i) => {
      g.globalAlpha = FIXED.BLOB_ALPHA;
      g.fillStyle = inks[i % inks.length]!;
      g.beginPath();
      g.arc(b[0]! * w, b[1]! * h, b[2]! * Math.min(w, h), 0, SHARED.TAU);
      g.fill();
    });
    g.globalAlpha = 1;
    const text = String(p.text || ' ');
    const size = Math.min(
      h * FIXED.TEXT_SIZE,
      (w * FIXED.TEXT_FIT) / Math.max(1, text.length) / FIXED.TEXT_EM,
    );
    applyFont(g, { size, weight: FIXED.TEXT_WEIGHT }, SHARED.PERCENT);
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillStyle = theme.ink;
    g.fillText(text, w * 0.5, h * FIXED.TEXT_Y);
    paintBlur();
  }

  /** A blurred copy of the scene: draw it small, then scale it up with smoothing. */
  function paintBlur(): void {
    const w = c.w;
    const h = c.h;
    const k = Math.max(1, n('blur'));
    small.width = Math.max(1, Math.round(w / k));
    small.height = Math.max(1, Math.round(h / k));
    const sg = small.getContext('2d')!;
    sg.imageSmoothingEnabled = true;
    sg.drawImage(back, 0, 0, small.width, small.height);
    blurred.width = Math.max(1, Math.round(w * FIXED.FOG_SCALE));
    blurred.height = Math.max(1, Math.round(h * FIXED.FOG_SCALE));
    fogCv.width = blurred.width;
    fogCv.height = blurred.height;
    // Scale up in steps of two, each with smoothing, so there are no visible blocks.
    let from: HTMLCanvasElement = small;
    while (from.width * 2 < blurred.width) {
      const mid = document.createElement('canvas');
      mid.width = from.width * 2;
      mid.height = from.height * 2;
      const mg = mid.getContext('2d')!;
      mg.imageSmoothingEnabled = true;
      mg.drawImage(from, 0, 0, mid.width, mid.height);
      from = mid;
    }
    const bg = blurred.getContext('2d')!;
    bg.imageSmoothingEnabled = true;
    bg.drawImage(from, 0, 0, blurred.width, blurred.height);
  }

  function allocate(): void {
    cols = Math.ceil(c.w / FIXED.MASK_CELL);
    rows = Math.ceil(c.h / FIXED.MASK_CELL);
    fog = new Float32Array(cols * rows).fill(1);
    maskCv.width = cols;
    maskCv.height = rows;
    img = maskCv.getContext('2d')!.createImageData(cols, rows);
  }

  /** Clears a soft circle of fog at (x, y). */
  function stamp(x: number, y: number, r: number): void {
    const cell = FIXED.MASK_CELL;
    const i0 = Math.max(0, Math.floor((x - r) / cell));
    const i1 = Math.min(cols - 1, Math.ceil((x + r) / cell));
    const j0 = Math.max(0, Math.floor((y - r) / cell));
    const j1 = Math.min(rows - 1, Math.ceil((y + r) / cell));
    const core = r * (1 - FIXED.WIPE_EDGE);
    for (let j = j0; j <= j1; j++)
      for (let i = i0; i <= i1; i++) {
        const d = Math.hypot((i + 0.5) * cell - x, (j + 0.5) * cell - y);
        if (d >= r) continue;
        const v = smoothstep(0, 1, (d - core) / (r * FIXED.WIPE_EDGE));
        const k = j * cols + i;
        if (v < fog[k]!) fog[k] = v;
      }
  }

  const wipeRadius = () => (c.w * n('wipe')) / SHARED.PERCENT / 2;

  function wipeTo(x: number, y: number): void {
    const r = wipeRadius();
    if (last) {
      const dist = Math.hypot(x - last.x, y - last.y);
      const steps = Math.max(1, Math.ceil(dist / (FIXED.MASK_CELL * 0.5)));
      for (let s = 1; s <= steps; s++)
        stamp(last.x + ((x - last.x) * s) / steps, last.y + ((y - last.y) * s) / steps, r);
      owed += dist;
      while (owed >= FIXED.DRIP_SPACING) {
        owed -= FIXED.DRIP_SPACING;
        if (Math.random() < n('drip'))
          drips.push({
            x,
            y: y + r * FIXED.DRIP_START,
            left: c.h * FIXED.DRIP_LEN * (0.5 + Math.random() * 0.5),
          });
      }
    } else stamp(x, y, r);
    last = { x, y };
  }

  function regrow(dt: number): void {
    const grow = dt / n('returnTime');
    const creep = n('creep');
    const prev = fog.slice();
    for (let j = 0; j < rows; j++)
      for (let i = 0; i < cols; i++) {
        const k = j * cols + i;
        const f = prev[k]!;
        if (f >= 1) continue;
        const nb = Math.max(
          i > 0 ? prev[k - 1]! : 1,
          i < cols - 1 ? prev[k + 1]! : 1,
          j > 0 ? prev[k - cols]! : 1,
          j < rows - 1 ? prev[k + cols]! : 1,
        );
        fog[k] = Math.min(1, f + grow * (creep + (1 - creep) * nb));
      }
  }

  function moveDrips(dt: number): void {
    for (const d of drips) {
      const dy = Math.min(d.left, n('dripSpeed') * dt);
      const steps = Math.max(1, Math.ceil(dy / FIXED.MASK_CELL));
      for (let s = 1; s <= steps; s++) stamp(d.x, d.y + (dy * s) / steps, FIXED.DRIP_RADIUS);
      d.y += dy;
      d.left -= dy;
    }
    drips = drips.filter((d) => d.left > 0);
  }

  function draw(beads: Drip[]): void {
    const g = c.ctx;
    c.clear();
    g.drawImage(back, 0, 0, c.w, c.h);
    // The fog: the blurred copy, whitened, shown only where the fog amount is high.
    const fg = fogCv.getContext('2d')!;
    fg.globalCompositeOperation = 'source-over';
    fg.clearRect(0, 0, fogCv.width, fogCv.height);
    fg.drawImage(blurred, 0, 0);
    fg.fillStyle = rgba(theme.surface, n('fog'));
    fg.fillRect(0, 0, fogCv.width, fogCv.height);
    const mg = maskCv.getContext('2d')!;
    const d = img!.data;
    for (let k = 0; k < fog.length; k++)
      d[(k + 1) * SHARED.RGBA - 1] = Math.round(fog[k]! * FIXED.CHANNEL);
    mg.putImageData(img!, 0, 0);
    fg.globalCompositeOperation = 'destination-in';
    fg.imageSmoothingEnabled = true;
    fg.drawImage(maskCv, 0, 0, fogCv.width, fogCv.height);
    fg.globalCompositeOperation = 'source-over';
    g.drawImage(fogCv, 0, 0, c.w, c.h);
    for (const b of beads) {
      g.beginPath();
      g.arc(b.x, b.y, FIXED.DRIP_BEAD, 0, SHARED.TAU);
      g.fillStyle = rgba(theme.surface, FIXED.BLOB_ALPHA);
      g.fill();
      g.strokeStyle = rgba(theme.ink, FIXED.WIPE_EDGE * 0.5);
      g.lineWidth = 1;
      g.stroke();
    }
  }

  function rebuild(): void {
    if (!c.w) return;
    allocate();
    paintBack();
    drips = [];
    last = null;
  }

  fontsReady().then(() => {
    if (c.w) {
      paintBack();
      draw(drips);
    }
  });

  return {
    resize() {
      if (c.fit() || !fog.length) rebuild();
      draw(drips);
    },
    update(dt) {
      ptr.sync();
      ptr.takeTaps();
      if (ptr.active) wipeTo(ptr.x, ptr.y);
      else {
        last = null;
        owed = 0;
      }
      moveDrips(dt);
      regrow(dt);
      draw(drips);
    },
    still() {
      ptr.takeTaps();
      allocate();
      paintBack();
      const r = wipeRadius();
      const [band, x0, x1] = FIXED.STILL_BAND;
      last = null;
      wipeTo(c.w * x0, c.h * band);
      wipeTo(c.w * x1, c.h * band);
      last = null;
      const beads: Drip[] = [];
      for (const [fx, run] of FIXED.STILL_DRIPS) {
        const top = c.h * band + r * FIXED.DRIP_START;
        const len = c.h * run;
        for (let s = 0; s <= len; s += FIXED.MASK_CELL * 0.5)
          stamp(c.w * fx, top + s, FIXED.DRIP_RADIUS);
        beads.push({ x: c.w * fx, y: top + len, left: 0 });
      }
      draw(beads);
    },
    setParams(next) {
      const re = next.text !== p.text || next.blur !== p.blur;
      p = { ...next };
      if (re && c.w) paintBack();
      if (c.w) draw(drips);
    },
    setTheme(t) {
      theme = t;
      if (c.w) paintBack();
    },
    restart() {
      rebuild();
      draw(drips);
    },
    destroy() {
      ptr.destroy();
      c.destroy();
      for (const x of [back, blurred, fogCv, maskCv, small]) {
        x.width = 0;
        x.height = 0;
      }
      fog = new Float32Array(0);
      drips = [];
    },
  };
}

const scene: SceneModule = { meta, params, followUps, create };
export default scene;
