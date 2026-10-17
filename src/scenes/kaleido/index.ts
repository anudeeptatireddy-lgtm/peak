// `kaleido`: Kaleidoscope (SCENES.md #38). Strokes are folded into one wedge of a hidden
// canvas; each frame that wedge is copied around the center, every other copy mirrored.

import { createCanvas } from '../../engine/canvas';
import { createPointer } from '../../engine/pointer';
import { frameFactor } from '../../engine/time';
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
  const buf = document.createElement('canvas');
  const bg = buf.getContext('2d')!;
  let rot = 0;
  let time = 0;
  let travelled = 0;
  let last: { x: number; y: number; a: number } | null = null;

  const wedge = () => SHARED.TAU / Math.max(1, n('segments'));

  /** Folds a point into the wedge: returns its place on the hidden canvas and its folded angle. */
  function fold(x: number, y: number): { x: number; y: number; a: number } {
    const cx = c.w * 0.5;
    const cy = c.h * 0.5;
    const w = wedge();
    const period = p.alternate ? w * 2 : w;
    const r = Math.hypot(x - cx, y - cy);
    const theta = Math.atan2(y - cy, x - cx) - rot;
    let a = ((theta % period) + period) % period;
    if (p.alternate && a > w) a = period - a;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a), a };
  }

  function stroke(x: number, y: number): void {
    const q = fold(x, y);
    if (last && Math.abs(q.a - last.a) <= FIXED.SEAM_JUMP * wedge()) {
      const colors = [theme.c1, theme.c2, theme.c3];
      travelled += Math.hypot(q.x - last.x, q.y - last.y);
      bg.globalCompositeOperation = 'source-over';
      bg.globalAlpha = FIXED.STROKE_ALPHA;
      bg.strokeStyle = colors[Math.floor(travelled / n('colorEvery')) % SHARED.INKS]!;
      bg.lineWidth = n('brush');
      bg.lineCap = 'round';
      bg.beginPath();
      bg.moveTo(last.x, last.y);
      bg.lineTo(q.x, q.y);
      bg.stroke();
      bg.globalAlpha = 1;
    }
    last = q;
  }

  function autoPoint(t: number): { x: number; y: number } {
    const reach = Math.min(c.w, c.h) * n('autoReach') * 0.5;
    return {
      x: c.w * 0.5 + reach * Math.sin(t * n('autoSpeed') * FIXED.AUTO_X),
      y: c.h * 0.5 + reach * Math.sin(t * n('autoSpeed') * FIXED.AUTO_Y + FIXED.AUTO_PHASE),
    };
  }

  function fade(f: number): void {
    bg.globalCompositeOperation = 'destination-out';
    bg.globalAlpha = Math.min(1, n('fade') * f);
    bg.fillStyle = theme.ground;
    bg.fillRect(0, 0, c.w, c.h);
    bg.globalAlpha = 1;
    bg.globalCompositeOperation = 'source-over';
  }

  function render(): void {
    const g = c.ctx;
    c.clear();
    const cx = c.w * 0.5;
    const cy = c.h * 0.5;
    const w = wedge();
    const R = Math.hypot(c.w, c.h);
    for (let k = 0; k < n('segments'); k++) {
      const flipped = !!p.alternate && k % 2 === 1;
      g.save();
      g.translate(cx, cy);
      g.rotate(rot + (flipped ? k + 1 : k) * w);
      if (flipped) g.scale(1, -1);
      g.beginPath();
      g.moveTo(0, 0);
      g.arc(0, 0, R, 0, w);
      g.closePath();
      g.clip();
      g.drawImage(buf, -cx, -cy, c.w, c.h);
      g.restore();
    }
  }

  function fitBuffer(): void {
    buf.width = c.canvas.width;
    buf.height = c.canvas.height;
    bg.setTransform(c.dpr, 0, 0, c.dpr, 0, 0);
    last = null;
  }

  return {
    resize() {
      if (c.fit()) fitBuffer();
      render();
    },
    update(dt) {
      const f = frameFactor(dt);
      time += dt;
      rot += n('turnSpeed') * FIXED.TURN_RATE * dt;
      ptr.sync();
      ptr.takeTaps();
      const drawing = ptr.pointerType === 'mouse' ? ptr.active : ptr.dragging;
      fade(f);
      if (drawing) stroke(ptr.x, ptr.y);
      else if (p.autoDraw) {
        const a = autoPoint(time);
        stroke(a.x, a.y);
      } else last = null;
      render();
    },
    still() {
      ptr.takeTaps();
      bg.clearRect(0, 0, c.w, c.h);
      last = null;
      travelled = 0;
      rot = 0;
      let t = 0;
      for (let i = 0; i < FIXED.STILL_FRAMES; i++) {
        t += 1 / SHARED.FPS;
        fade(1);
        const a = autoPoint(t);
        stroke(a.x, a.y);
      }
      render();
    },
    setParams(next) {
      p = { ...next };
      if (c.w) render();
    },
    setTheme(t) {
      theme = t;
    },
    restart() {
      bg.clearRect(0, 0, c.w, c.h);
      last = null;
      travelled = 0;
      rot = 0;
      time = 0;
    },
    destroy() {
      ptr.destroy();
      c.destroy();
      buf.width = 0;
      buf.height = 0;
    },
  };
}

const scene: SceneModule = { meta, params, followUps, create };
export default scene;
