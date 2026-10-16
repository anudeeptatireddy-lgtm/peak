// `marbles`: Text to marbles (SCENES.md #5). Text kit for the homes, physics kit
// for the pile (circles in a spatial hash), render kit for batched drawing.

import { createCanvas } from '../../engine/canvas';
import { fontsReady } from '../../engine/fonts';
import { createPointer } from '../../engine/pointer';
import { frameFactor } from '../../engine/time';
import { SpatialHash, makeCircles, stepCircles, type Circles } from '../../kits/physics';
import { Batch } from '../../kits/render';
import { fontString, offscreen, samplePointsUnder } from '../../kits/text';
import { hexToOklab } from '../../theme/color';
import type { Theme } from '../../theme/worlds';
import { SHARED } from '../shared';
import type { Params, SceneContext, SceneInstance, SceneModule } from '../types';
import { FIXED } from './constants';
import { meta } from './meta';
import { params } from './params';
import { followUps } from './prompt';

function create(host: HTMLElement, initial: Params, ctx: SceneContext): SceneInstance {
  let p = { ...initial };
  const n = (id: string) => Number(p[id]);
  let theme: Theme = ctx.theme;
  const c = createCanvas(host);
  const ptr = createPointer(host);
  let fontsOk = false;
  let destroyed = false;
  fontsReady().then(() => {
    fontsOk = true;
  });

  let m: Circles = makeCircles(0);
  let homes = new Float32Array(0);
  let color = new Uint8Array(0);
  let shattered = false;
  let shatteredAt = 0;
  let time = 0;
  const hash = new SpatialHash(1);
  const shadows = new Batch(1);
  const bodies = new Batch(SHARED.INKS);
  const lights = new Batch(1);

  const small = () => c.w < SHARED.SMALL_SCREEN;
  const radius = () => (small() ? n('marbleSizeSmall') : n('marbleSize'));

  function sample(): number[] {
    const W = c.w;
    const H = c.h;
    const off = offscreen(W, H);
    const o = off.ctx;
    const text = String(p.text || ' ');
    let size = Math.min(H * n('textHeight'), W * n('textWidth'));
    const setFont = () => {
      o.font = fontString({ size, weight: n('fontWeight') });
      try {
        o.fontStretch = String(p.letterWidth) as CanvasFontStretch;
      } catch {
        /* older browsers */
      }
    };
    setFont();
    const maxW = W * (small() ? n('fitWidthSmall') : n('fitWidth'));
    const tw = o.measureText(text).width;
    if (tw > maxW) {
      size *= maxW / tw;
      setFont();
    }
    o.textAlign = 'center';
    o.textBaseline = 'middle';
    o.fillStyle = FIXED.MASK;
    o.fillText(text, W / 2, H * n('textY'));
    const data = o.getImageData(0, 0, W, H).data;
    off.free();
    const r = radius();
    const max =
      (small() ? n('countSmall') : n('count')) *
      (ctx.quality === 'preview' ? SHARED.PREVIEW_SCALE : 1);
    const gap = Math.max(1, Math.round(2 * r * n('packing')));
    const limit = Math.round(2 * r * FIXED.MAX_SPREAD);
    return samplePointsUnder(data, W, H, gap, FIXED.ALPHA_CUTOFF, max, limit).pts;
  }

  function build(): void {
    const pts = sample();
    const count = pts.length / 2;
    const old = m;
    const oldColor = color;
    m = makeCircles(count);
    homes = Float32Array.from(pts);
    color = new Uint8Array(count);
    const r = radius();
    for (let i = 0; i < count; i++) {
      const keep = i < old.n;
      m.x[i] = keep ? old.x[i]! : pts[2 * i]!;
      m.y[i] = keep ? old.y[i]! : pts[2 * i + 1]!;
      m.vx[i] = keep ? old.vx[i]! : 0;
      m.vy[i] = keep ? old.vy[i]! : 0;
      m.r[i] = r;
      color[i] = keep ? oldColor[i]! : Math.floor(Math.random() * SHARED.INKS);
    }
    hash.cell = 2 * r;
  }

  function shatter(): void {
    shattered = true;
    shatteredAt = time;
    const k = n('kick');
    for (let i = 0; i < m.n; i++) {
      m.vx[i] = (Math.random() - 0.5) * k;
      m.vy[i] = -Math.random() * k;
    }
    ctx.sound.play('pop');
  }

  function shove(f: number): void {
    const pushing = ptr.pointerType === 'mouse' ? ptr.active : ptr.dragging;
    if (!pushing || n('shove') === 0) return;
    const R = n('shoveRadius');
    const s = n('shove') * FIXED.SHOVE_SCALE;
    for (let i = 0; i < m.n; i++) {
      const dx = m.x[i]! - ptr.x;
      const dy = m.y[i]! - ptr.y;
      const d = Math.hypot(dx, dy);
      if (d >= R || d === 0) continue;
      const q = s * (1 - d / R) * f;
      m.vx[i]! += (dx / d) * q;
      m.vy[i]! += (dy / d) * q;
    }
  }

  function draw(): void {
    const g = c.ctx;
    c.clear();
    const lightIsGround = hexToOklab(theme.ground).L >= hexToOklab(theme.ink).L;
    const dark = lightIsGround ? theme.ink : theme.ground;
    const light = lightIsGround ? theme.ground : theme.ink;
    const off = n('shadowOffset');
    const hs = n('highlightSize');
    const ho = n('highlightOffset');
    shadows.reset();
    bodies.reset();
    lights.reset();
    for (let i = 0; i < m.n; i++) {
      const x = m.x[i]!;
      const y = m.y[i]!;
      const r = m.r[i]!;
      shadows.dot(0, x, y + off * r, r);
      bodies.dot(color[i]!, x, y, r);
      if (hs > 0) lights.dot(0, x - ho * r, y - ho * r, hs * r);
    }
    shadows.fill(g, [dark], n('shadowAlpha'));
    g.globalCompositeOperation = theme.blend;
    bodies.fill(g, [theme.c1, theme.c2, theme.c3]);
    g.globalCompositeOperation = 'source-over';
    lights.fill(g, [light], n('highlightAlpha'));
  }

  return {
    resize() {
      c.fit();
      if (!fontsOk || destroyed) {
        m = makeCircles(0);
        return;
      }
      build();
    },
    update(dt) {
      time += dt;
      ptr.sync();
      for (const _ of ptr.takeTaps()) {
        if (shattered) shattered = false;
        else shatter();
      }
      const auto = n('autoRebuild');
      if (shattered && auto > 0 && time - shatteredAt >= auto) shattered = false;
      const f = frameFactor(dt);
      if (shattered) {
        shove(f);
        stepCircles(
          m,
          {
            w: c.w,
            h: c.h,
            gravity: n('gravity'),
            drag: n('airDrag'),
            restitution: n('bounce'),
            friction: n('friction'),
            walls: { left: true, right: true, floor: true, ceiling: false },
          },
          f,
          hash,
        );
      } else {
        const k = n('returnSpeed');
        const d = n('returnDamping') ** f;
        for (let i = 0; i < m.n; i++) {
          m.vx[i] = (m.vx[i]! + (homes[2 * i]! - m.x[i]!) * k * f) * d;
          m.vy[i] = (m.vy[i]! + (homes[2 * i + 1]! - m.y[i]!) * k * f) * d;
          m.x[i]! += m.vx[i]! * f;
          m.y[i]! += m.vy[i]! * f;
        }
      }
      draw();
    },
    still() {
      ptr.takeTaps();
      const hint = Math.min(n('stillHint'), m.n);
      const keepX = m.x.slice();
      const keepY = m.y.slice();
      for (let i = 0; i < m.n; i++) {
        m.x[i] = homes[2 * i]!;
        m.y[i] = homes[2 * i + 1]!;
      }
      for (let k = 0; k < hint; k++) {
        const i = m.n - hint + k;
        const r = m.r[i]!;
        m.x[i] = c.w / 2 + (k - (hint - 1) / 2) * 2 * r;
        m.y[i] = c.h - r;
      }
      draw();
      m.x.set(keepX);
      m.y.set(keepY);
    },
    setParams(next) {
      const rebuild = params.some((q) => q.rebuild && next[q.id] !== p[q.id]);
      p = { ...next };
      if (rebuild && fontsOk && c.w) build();
    },
    setTheme(t) {
      theme = t;
    },
    restart() {
      shattered = false;
      for (let i = 0; i < m.n; i++) {
        m.x[i] = homes[2 * i]!;
        m.y[i] = homes[2 * i + 1]!;
        m.vx[i] = 0;
        m.vy[i] = 0;
      }
    },
    destroy() {
      destroyed = true;
      ptr.destroy();
      c.destroy();
      m = makeCircles(0);
    },
  };
}

const scene: SceneModule = { meta, params, followUps, create };
export default scene;
