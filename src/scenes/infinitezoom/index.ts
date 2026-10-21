// `infinitezoom`: Infinite Zoom (SCENES.md #89). A top-down city whose rooftops spell
// the name; a skylight holds a picture of the same city moved by one similarity M
// (shrink, turn, move). Level k is drawn under M^(k − z) around M's fixed point F, so
// zooming one whole level lands every level exactly on the next one out: no seam.

import { cursorSweep } from '../../kits/cursor';
import { createCanvas } from '../../engine/canvas';
import { fontsReady } from '../../engine/fonts';
import { innerScroller } from '../../engine/inner-scroll';
import { createPointer } from '../../engine/pointer';
import { addScrollSource } from '../../engine/scheduler';
import { createScrollSource } from '../../engine/scroll';
import { ease, frameFactor } from '../../engine/time';
import { seededRandom } from '../../kits/field';
import { textMask } from '../../kits/text';
import { mixOklab } from '../../theme/color';
import type { Theme } from '../../theme/worlds';
import { SHARED } from '../shared';
import type { Params, SceneContext, SceneInstance, SceneModule } from '../types';
import { FIXED } from './constants';
import { meta } from './meta';
import { params } from './params';
import { followUps } from './prompt';

const DEG = Math.PI / FIXED.HALF_TURN;

interface City {
  shadows: Path2D;
  streets: Path2D;
  filler: Path2D;
  accents: Path2D[];
  hatches: Path2D;
  tower: Path2D;
  skylight: Path2D;
  frame: Path2D;
}

function create(host: HTMLElement, initial: Params, ctx: SceneContext): SceneInstance {
  let p = { ...initial };
  const n = (id: string) => Number(p[id]);
  let theme: Theme = ctx.theme;
  const c = createCanvas(host);
  const ptr = createPointer(host);
  const inner =
    host.dataset.innerScroll === 'true'
      ? innerScroller(host, {
          screens: FIXED.INNER_SCREENS,
          low: FIXED.RECENTER_LOW,
          high: FIXED.RECENTER_HIGH,
        })
      : null;
  // Follow cursor: a sideways mouse sweep counts as scrolling (off by default).
  const sweep = cursorSweep(host, inner ? inner.source : createScrollSource(), {
    on: () => !!p.cursor,
    px: () => Number(p.cursorSweep),
  });
  const source = sweep.source;
  const removeSource = addScrollSource(source);
  let fontsOk = false;
  let stillShown = false;
  let lastScroll: number | null = null;

  let city: City | null = null;
  let fillerInk = '';
  // q = e^(i × rotation) ÷ scale as (radius, angle), and the fixed point F.
  let qr = 1;
  let qa = 0;
  let fx = 0;
  let fy = 0;
  let target = 0;
  let zoom = 0;
  let quiet = 0;

  function inks(): void {
    fillerInk = mixOklab(theme.inkSoft, theme.ground, FIXED.FILLER_MIX);
  }

  function layout(): void {
    inks();
    if (!fontsOk || !c.w) return;
    const w = c.w;
    const h = c.h;
    const b = n('block');
    // The transform M(x) = T + q (x − C) and its fixed point F = (T − qC) ÷ (1 − q).
    qr = 1 / n('scale');
    qa = n('rotation') * DEG;
    const qx = qr * Math.cos(qa);
    const qy = qr * Math.sin(qa);
    const tx = w * n('windowX');
    const ty = h * n('windowY');
    const cx = w * 0.5;
    const cy = h * 0.5;
    const nx = tx - (qx * cx - qy * cy);
    const ny = ty - (qy * cx + qx * cy);
    const dx = 1 - qx;
    const dy = -qy;
    const d2 = dx * dx + dy * dy;
    fx = (nx * dx + ny * dy) / d2;
    fy = (ny * dx - nx * dy) / d2;
    // Picture, skylight and tower corners: the stage corners under M, grown around T.
    const corners = [
      [0, 0],
      [w, 0],
      [w, h],
      [0, h],
    ].map(([x, y]) => [tx + qx * (x! - cx) - qy * (y! - cy), ty + qy * (x! - cx) + qx * (y! - cy)]);
    const grown = (k: number) => corners.map(([x, y]) => [tx + (x! - tx) * k, ty + (y! - ty) * k]);
    const poly = (path: Path2D, pts: number[][]) => {
      pts.forEach(([x, y], i) => (i ? path.lineTo(x!, y!) : path.moveTo(x!, y!)));
      path.closePath();
    };
    const towerPts = grown(FIXED.WINDOW_PAD * FIXED.BUILDING_PAD);
    const minX = Math.min(...towerPts.map((q) => q[0]!));
    const maxX = Math.max(...towerPts.map((q) => q[0]!));
    const minY = Math.min(...towerPts.map((q) => q[1]!));
    const maxY = Math.max(...towerPts.map((q) => q[1]!));
    const { data } = textMask(w, h, String(p.text || ' '), {
      heightShare: n('textHeight'),
      fitShare: n('fitWidth'),
      weight: n('weight'),
      centerY: n('nameY'),
    });
    const rand = seededRandom(FIXED.SEED);
    const next: City = {
      shadows: new Path2D(),
      streets: new Path2D(),
      filler: new Path2D(),
      accents: [new Path2D(), new Path2D(), new Path2D()],
      hatches: new Path2D(),
      tower: new Path2D(),
      skylight: new Path2D(),
      frame: new Path2D(),
    };
    const W = Math.round(w);
    const cols = Math.ceil(w / b);
    const rows = Math.ceil(h / b);
    const shade = FIXED.SHADOW * b;
    for (let j = 0; j < rows; j++)
      for (let i = 0; i < cols; i++) {
        const x = (i + 0.5) * b;
        const y = (j + 0.5) * b;
        const roll = rand();
        const hatch = rand() < n('detail');
        if (x + b > minX && x - b < maxX && y + b > minY && y - b < maxY) continue;
        const px = Math.min(W - 1, Math.floor(x));
        const py = Math.min(Math.round(h) - 1, Math.floor(y));
        const named = data[(py * W + px) * SHARED.RGBA + SHARED.RGBA - 1]! > FIXED.ALPHA_CUTOFF;
        if (!named && roll >= n('density')) continue;
        const s = b * (named ? FIXED.FILL : FIXED.FILLER);
        const path = named
          ? next.accents[Math.min(SHARED.INKS - 1, Math.floor((x / w) * SHARED.INKS))]!
          : next.filler;
        next.shadows.rect(x - s * 0.5 + shade, y - s * 0.5 + shade, s, s);
        path.rect(x - s * 0.5, y - s * 0.5, s, s);
        if (hatch) {
          const k = s * (1 - FIXED.HATCH * 2);
          next.hatches.rect(x - k * 0.5, y - k * 0.5, k, k);
        }
      }
    const street = b * FIXED.STREET_EVERY;
    for (let x = street; x < w; x += street) {
      next.streets.moveTo(x, 0);
      next.streets.lineTo(x, h);
    }
    for (let y = street; y < h; y += street) {
      next.streets.moveTo(0, y);
      next.streets.lineTo(w, y);
    }
    poly(next.tower, towerPts);
    poly(next.skylight, grown(FIXED.WINDOW_PAD));
    poly(next.frame, corners);
    city = next;
  }

  fontsReady().then(() => {
    fontsOk = true;
    layout();
    if (stillShown) draw(0);
  });

  function drawCity(g: CanvasRenderingContext2D, k: City): void {
    g.fillStyle = theme.ground;
    g.fillRect(0, 0, c.w, c.h);
    g.strokeStyle = theme.line;
    g.lineWidth = n('line');
    g.stroke(k.streets);
    if (p.quality === 'high') {
      const alpha = g.globalAlpha;
      g.globalAlpha = alpha * FIXED.SHADOW_ALPHA;
      g.fillStyle = theme.ink;
      g.fill(k.shadows);
      g.globalAlpha = alpha;
    }
    g.fillStyle = fillerInk;
    g.fill(k.filler);
    const accents = [theme.c1, theme.c2, theme.c3];
    k.accents.forEach((path, i) => {
      g.fillStyle = accents[i]!;
      g.fill(path);
    });
    g.fillStyle = theme.surface;
    g.fill(k.hatches);
    g.fillStyle = theme.c1;
    g.fill(k.tower);
    g.fillStyle = theme.surface;
    g.fill(k.skylight);
  }

  /** Canvas transform for exponent e: x → F + q^e (x − F). */
  function level(g: CanvasRenderingContext2D, e: number): void {
    const s = qr ** e;
    const a = s * Math.cos(qa * e);
    const bb = s * Math.sin(qa * e);
    const ox = fx - (a * fx - bb * fy);
    const oy = fy - (bb * fx + a * fy);
    const d = c.dpr;
    g.setTransform(d * a, d * bb, -d * bb, d * a, d * ox, d * oy);
  }

  function draw(z: number): void {
    const g = c.ctx;
    const d = c.dpr;
    g.setTransform(d, 0, 0, d, 0, 0);
    g.fillStyle = theme.ground;
    g.fillRect(0, 0, c.w, c.h);
    if (!city) return;
    const small = c.w < SHARED.SMALL_SCREEN;
    const depth = small ? n('depthSmall') : n('depth');
    for (let k = 0; k <= depth + 1; k++) {
      if (k > depth && z <= 0) break;
      g.globalAlpha = k > depth ? z : 1;
      level(g, k - z);
      drawCity(g, city);
    }
    // Frames last, so each sits on the edge of the picture inside it.
    g.strokeStyle = theme.ink;
    for (let k = 0; k <= depth + 1; k++) {
      if (k > depth && z <= 0) break;
      g.globalAlpha = k > depth ? z : 1;
      level(g, k - z);
      g.lineWidth = n('line') * FIXED.FRAME;
      g.stroke(city.frame);
    }
    g.globalAlpha = 1;
    g.setTransform(d, 0, 0, d, 0, 0);
  }

  return {
    resize() {
      if (!c.fit()) return;
      layout();
    },
    update(dt) {
      stillShown = false;
      const f = frameFactor(dt);
      ptr.sync();
      ptr.takeTaps();
      const pos = source.read();
      const scrolled = lastScroll === null ? 0 : pos - lastScroll;
      lastScroll = pos;
      let moved = scrolled / n('scrub');
      if (ptr.down && ptr.pointerType !== 'mouse') moved -= (ptr.x - ptr.px) / n('scrub');
      if (moved) {
        target += moved * n('zoomSpeed');
        quiet = 0;
      } else {
        quiet += dt;
        if (quiet >= n('idleWait')) target += n('zoomSpeed') * FIXED.AUTO_RATE * dt;
      }
      zoom += (target - zoom) * ease(n('smoothing'), f);
      draw(zoom - Math.floor(zoom));
    },
    still() {
      stillShown = true;
      ptr.takeTaps();
      draw(0);
    },
    setParams(next) {
      p = { ...next };
      layout();
      if (stillShown) draw(0);
    },
    setTheme(th) {
      theme = th;
      inks();
      if (stillShown) draw(0);
    },
    restart() {
      target = zoom = quiet = 0;
    },
    destroy() {
      sweep.destroy();
      ptr.destroy();
      removeSource();
      inner?.el.remove();
      c.destroy();
      city = null;
    },
  };
}

const scene: SceneModule = { meta, params, followUps, create };
export default scene;
