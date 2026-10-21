// `clayframes`: Clay Frames (SCENES.md #68). The name's traced outlines are redrawn only
// a few times a second with fresh wobbles (stop motion); presses leave thumbprints that
// dent and squish the clay, then relax away. Light from the top left gives the clay depth.

import { createCanvas } from '../../engine/canvas';
import { fontsReady } from '../../engine/fonts';
import { createPointer } from '../../engine/pointer';
import { smoothstep } from '../../kits/easing';
import { seededRandom } from '../../kits/field';
import {
  alphaChannel,
  groupHoles,
  samplePoints,
  simplifyLoop,
  textMask,
  traceContours,
  type Pt,
} from '../../kits/text';
import { luminance, mixOklab } from '../../theme/color';
import type { Theme } from '../../theme/worlds';
import { SHARED } from '../shared';
import type { Params, SceneContext, SceneInstance, SceneModule } from '../types';
import { FIXED } from './constants';
import { meta } from './meta';
import { params } from './params';
import { followUps } from './prompt';

interface Loop {
  x: Float32Array;
  y: Float32Array;
  /** Unit normals and distance along the loop. */
  nx: Float32Array;
  ny: Float32Array;
  s: Float32Array;
}

interface Piece {
  loops: Loop[];
  /** Which accent it starts from, and how far toward the next one it strays. */
  accent: number;
  mix: number;
}

interface Print {
  x: number;
  y: number;
  angle: number;
  born: number;
}

/** Even spacing along a closed loop, with normals. */
function resample(loop: Pt[], step: number): Loop {
  const pts: Pt[] = [];
  const m = loop.length;
  for (let i = 0; i < m; i++) {
    const a = loop[i]!;
    const b = loop[(i + 1) % m]!;
    const len = Math.hypot(b.x - a.x, b.y - a.y);
    const k = Math.max(1, Math.round(len / step));
    for (let j = 0; j < k; j++)
      pts.push({ x: a.x + ((b.x - a.x) * j) / k, y: a.y + ((b.y - a.y) * j) / k });
  }
  const q = pts.length;
  const out: Loop = {
    x: new Float32Array(q),
    y: new Float32Array(q),
    nx: new Float32Array(q),
    ny: new Float32Array(q),
    s: new Float32Array(q),
  };
  let s = 0;
  for (let i = 0; i < q; i++) {
    const prev = pts[(i - 1 + q) % q]!;
    const next = pts[(i + 1) % q]!;
    const cur = pts[i]!;
    const tx = next.x - prev.x;
    const ty = next.y - prev.y;
    const tl = Math.hypot(tx, ty) || 1;
    out.x[i] = cur.x;
    out.y[i] = cur.y;
    out.nx[i] = -ty / tl;
    out.ny[i] = tx / tl;
    if (i) s += Math.hypot(cur.x - pts[i - 1]!.x, cur.y - pts[i - 1]!.y);
    out.s[i] = s;
  }
  return out;
}

function create(host: HTMLElement, initial: Params, ctx: SceneContext): SceneInstance {
  let p = { ...initial };
  const n = (id: string) => Number(p[id]);
  let theme: Theme = ctx.theme;
  const c = createCanvas(host);
  const ptr = createPointer(host);
  let fontsOk = false;
  let stillShown = false;

  let pieces: Piece[] = [];
  let specks: number[] = [];
  /** Letter pixels on a grid, sorted left to right: idle presses and the still frame. */
  let spots: number[] = [];
  let letterSize = 1;
  let prints: Print[] = [];
  let now = 0;
  let clock = 0;
  let frame = 0;
  let quiet = 0;
  let idleClock = 0;
  let lastPrint: Pt | null = null;
  let idleRand = seededRandom(FIXED.SEED);

  const shadeInk = () =>
    luminance(theme.ground) < luminance(theme.ink) ? theme.ground : theme.ink;
  const lightInk = () =>
    luminance(theme.ground) < luminance(theme.ink) ? theme.ink : theme.ground;

  function layout(): void {
    pieces = [];
    if (!fontsOk || !c.w) return;
    const w = Math.round(c.w);
    const h = Math.round(c.h);
    const { data, size } = textMask(w, h, String(p.text || ' '), {
      heightShare: n('letterSize') / c.h,
      fitShare: FIXED.FIT,
      weight: n('weight'),
      centerY: FIXED.NAME_Y,
    });
    letterSize = size;
    const loops = traceContours(alphaChannel(data, w, h), w, h, FIXED.ALPHA_CUTOFF)
      .map((l) => simplifyLoop(l, FIXED.SIMPLIFY))
      .filter((l) => l.length > 2);
    const rand = seededRandom(FIXED.SEED);
    pieces = groupHoles(loops).map((g, k) => ({
      loops: [g.outer, ...g.holes].map((l) => resample(l, FIXED.RESAMPLE)),
      accent: k % SHARED.INKS,
      mix: rand(),
    }));
    const grid = samplePoints(data, w, h, FIXED.SPECK_GRID, FIXED.ALPHA_CUTOFF);
    spots = [];
    for (let i = 0; i < grid.length; i += 2) spots.push(grid[i]!, grid[i + 1]!);
    const order = Array.from({ length: spots.length / 2 }, (_, i) => i).sort(
      (a, b) => spots[a * 2]! - spots[b * 2]!,
    );
    spots = order.flatMap((i) => [spots[i * 2]!, spots[i * 2 + 1]!]);
    const area = (grid.length / 2) * FIXED.SPECK_GRID * FIXED.SPECK_GRID;
    const want = Math.round((area * FIXED.SPECKS * n('clayTexture')) / FIXED.SPECK_AREA);
    specks = [];
    for (let k = 0; k < want && grid.length; k++) {
      const i = Math.floor(rand() * (grid.length / 2));
      specks.push(
        grid[i * 2]! + rand() * FIXED.SPECK_GRID,
        grid[i * 2 + 1]! + rand() * FIXED.SPECK_GRID,
      );
    }
    idleRand = seededRandom(FIXED.SEED);
  }

  fontsReady().then(() => {
    fontsOk = true;
    layout();
    if (stillShown) still();
    else draw();
  });

  function depthOf(pr: Print): number {
    return 1 - smoothstep(0, n('relax'), now - pr.born);
  }

  function press(x: number, y: number, angle: number): void {
    prints.push({ x, y, angle, born: now });
    if (prints.length > FIXED.MAX_PRINTS) prints.shift();
  }

  function draw(): void {
    const g = c.ctx;
    c.clear();
    if (!pieces.length) return;
    const rng = seededRandom(FIXED.SEED + frame);
    const r = n('thumb') * 0.5;
    const reach = r * FIXED.PUSH_REACH;
    const live = prints.map((pr) => ({ ...pr, d: depthOf(pr) })).filter((pr) => pr.d > 0);
    const pushers = live.map((pr) => ({ x: pr.x, y: pr.y, d: pr.d }));
    if (ptr.active && !ptr.down && ptr.pointerType === 'mouse')
      pushers.push({ x: ptr.x, y: ptr.y, d: FIXED.HOVER_DEPTH });
    const amp = (n('jitter') * FIXED.JITTER_SHARE * letterSize) / (1 + 0.5);
    const push = n('squish') * FIXED.PUSH * r;

    const paths = pieces.map((piece) => {
      const path = new Path2D();
      for (const L of piece.loops) {
        const a = rng() * SHARED.TAU;
        const b = rng() * SHARED.TAU;
        for (let i = 0; i < L.x.length; i++) {
          const s = L.s[i]!;
          const j =
            amp * (Math.sin(s / FIXED.WAVE_PX + a) + 0.5 * Math.sin(s / (FIXED.WAVE_PX * 0.5) + b));
          let x = L.x[i]! + L.nx[i]! * j;
          let y = L.y[i]! + L.ny[i]! * j;
          for (const q of pushers) {
            const dx = x - q.x;
            const dy = y - q.y;
            const d = Math.hypot(dx, dy);
            if (d >= reach || d === 0) continue;
            const m = (q.d * push * (1 - d / reach) ** 2) / d;
            x += dx * m;
            y += dy * m;
          }
          if (i) path.lineTo(x, y);
          else path.moveTo(x, y);
        }
        path.closePath();
      }
      return path;
    });
    const all = new Path2D();
    for (const path of paths) all.addPath(path);
    const acc = [theme.c1, theme.c2, theme.c3];
    const colors = pieces.map((pc) =>
      mixOklab(acc[pc.accent]!, acc[(pc.accent + 1) % SHARED.INKS]!, pc.mix * n('colorVar')),
    );
    const shade = shadeInk();
    const light = lightInk();
    const lit = n('lighting');
    const o = lit * FIXED.LIGHT_SHARE * letterSize;

    if (lit > 0) {
      g.save();
      g.translate(o, o);
      g.globalAlpha = lit * FIXED.SHADOW_ALPHA;
      g.fillStyle = shade;
      g.fill(all, 'evenodd');
      g.restore();
    }
    if (n('edgeSoft') > 0) {
      g.globalAlpha = FIXED.SOFT_ALPHA;
      g.lineWidth = n('edgeSoft') * FIXED.SOFT_SHARE * letterSize;
      g.lineJoin = 'round';
      paths.forEach((path, k) => {
        g.strokeStyle = colors[k]!;
        g.stroke(path);
      });
    }
    g.globalAlpha = 1;
    paths.forEach((path, k) => {
      g.fillStyle = colors[k]!;
      g.fill(path, 'evenodd');
    });

    g.save();
    g.clip(all, 'evenodd');
    if (lit > 0) {
      g.lineWidth = o * 2;
      g.lineJoin = 'round';
      for (const [sign, ink, alpha] of [
        [1, light, FIXED.EDGE_LIGHT_ALPHA],
        [-1, shade, FIXED.EDGE_SHADE_ALPHA],
      ] as const) {
        g.save();
        g.translate(o * sign, o * sign);
        g.globalAlpha = lit * alpha;
        g.strokeStyle = ink;
        g.stroke(all);
        g.restore();
      }
    }
    if (specks.length) {
      const dots = [new Path2D(), new Path2D()];
      const sp = FIXED.SPECK_PX * 0.5;
      for (let i = 0; i < specks.length; i += 2) {
        const dot = dots[(i / 2) % 2]!;
        dot.moveTo(specks[i]! + sp, specks[i + 1]!);
        dot.arc(specks[i]!, specks[i + 1]!, sp, 0, SHARED.TAU);
      }
      g.globalAlpha = n('clayTexture') * FIXED.SPECK_ALPHA;
      g.fillStyle = light;
      g.fill(dots[0]!);
      g.fillStyle = shade;
      g.fill(dots[1]!);
    }
    for (const pr of live) {
      const ry = r * FIXED.THUMB_ASPECT;
      g.globalAlpha = pr.d * FIXED.DENT_ALPHA;
      g.fillStyle = shade;
      g.beginPath();
      g.ellipse(pr.x, pr.y, r, ry, pr.angle, 0, SHARED.TAU);
      g.fill();
      const ridges = new Path2D();
      for (let k = 1; k < FIXED.RIDGES; k++) {
        const f = k / FIXED.RIDGES;
        ridges.moveTo(pr.x + Math.cos(pr.angle) * r * f, pr.y + Math.sin(pr.angle) * r * f);
        ridges.ellipse(pr.x, pr.y, r * f, ry * f, pr.angle, 0, SHARED.TAU);
      }
      g.globalAlpha = pr.d * FIXED.RIDGE_ALPHA;
      g.strokeStyle = shade;
      g.lineWidth = 1;
      g.stroke(ridges);
      g.globalAlpha = pr.d * FIXED.RIM_ALPHA;
      g.strokeStyle = light;
      g.lineWidth = 2;
      g.beginPath();
      g.ellipse(pr.x, pr.y, r, ry, pr.angle, FIXED.RIM_FROM - pr.angle, FIXED.RIM_TO - pr.angle);
      g.stroke();
    }
    g.restore();
    g.globalAlpha = 1;
  }

  function still(): void {
    stillShown = true;
    ptr.takeTaps();
    prints = [];
    const m = spots.length / 2;
    for (const share of [FIXED.STILL_A, FIXED.STILL_B]) {
      const i = Math.floor(share * m);
      if (i < m) press(spots[i * 2]!, spots[i * 2 + 1]!, share * SHARED.TAU);
    }
    draw();
  }

  return {
    resize() {
      if (!c.fit()) return;
      layout();
      draw();
    },
    update(dt) {
      stillShown = false;
      now += dt;
      clock += dt;
      ptr.sync();
      const taps = ptr.takeTaps();
      const r = n('thumb') * 0.5;
      let input = taps.length > 0 || ptr.down;
      if (ptr.pointerType !== 'mouse')
        for (const t of taps) press(t.x, t.y, idleRand() * SHARED.TAU);
      if (ptr.down && ptr.dragging) {
        if (
          !lastPrint ||
          Math.hypot(ptr.x - lastPrint.x, ptr.y - lastPrint.y) >= r * FIXED.PRINT_STEP
        ) {
          lastPrint = { x: ptr.x, y: ptr.y };
          press(ptr.x, ptr.y, Math.atan2(ptr.y - ptr.py, ptr.x - ptr.px));
        }
      } else lastPrint = null;
      if (ptr.active && (ptr.x !== ptr.px || ptr.y !== ptr.py)) input = true;
      if (input) quiet = idleClock = 0;
      else {
        quiet += dt;
        if (quiet >= n('idleWait')) {
          idleClock += dt;
          if (idleClock >= n('idleEvery') && spots.length) {
            idleClock = 0;
            const i = Math.floor(idleRand() * (spots.length / 2));
            press(spots[i * 2]!, spots[i * 2 + 1]!, idleRand() * SHARED.TAU);
          }
        }
      }
      prints = prints.filter((pr) => depthOf(pr) > 0);
      if (clock >= 1 / n('fps')) {
        clock %= 1 / n('fps');
        frame++;
        draw();
      }
    },
    still,
    setParams(next) {
      p = { ...next };
      layout();
      if (stillShown) still();
      else draw();
    },
    setTheme(th) {
      theme = th;
      if (stillShown) still();
      else draw();
    },
    restart() {
      prints = [];
      quiet = idleClock = 0;
      frame = 0;
      idleRand = seededRandom(FIXED.SEED);
      draw();
    },
    destroy() {
      ptr.destroy();
      c.destroy();
      pieces = [];
      prints = [];
    },
  };
}

const scene: SceneModule = { meta, params, followUps, create };
export default scene;
