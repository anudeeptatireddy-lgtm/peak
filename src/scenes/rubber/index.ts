// `rubber`: Rubber letters (SCENES.md #19). Each letter has a stretch vector on
// a damped spring; drawing it stretched is a single transform.

import { createCanvas } from '../../engine/canvas';
import { fontsReady } from '../../engine/fonts';
import { createPointer } from '../../engine/pointer';
import { frameFactor } from '../../engine/time';
import { fontString } from '../../kits/text';
import type { Theme } from '../../theme/worlds';
import { SHARED } from '../shared';
import type { Params, SceneContext, SceneInstance, SceneModule } from '../types';
import { FIXED } from './constants';
import { meta } from './meta';
import { params } from './params';
import { followUps } from './prompt';

interface Letter {
  ch: string;
  ink: number;
  cx: number;
  cy: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
  sx: number;
  sy: number;
}

function create(host: HTMLElement, initial: Params, ctx: SceneContext): SceneInstance {
  let p = { ...initial };
  const n = (id: string) => Number(p[id]);
  let theme: Theme = ctx.theme;
  const c = createCanvas(host);
  const ptr = createPointer(host);
  let fontsOk = false;
  fontsReady().then(() => {
    fontsOk = true;
  });

  let letters: Letter[] = [];
  let font = '';
  let size = 0;
  let held: { l: Letter; gx: number; gy: number } | null = null;

  function setFont(g: CanvasRenderingContext2D): void {
    g.font = font;
    try {
      g.fontStretch = String(p.letterWidth) as CanvasFontStretch;
    } catch {
      /* older browsers */
    }
  }

  function layout(): void {
    const g = c.ctx;
    const text = String(p.text || ' ');
    size = c.h * n('textHeight');
    font = fontString({ size, weight: n('weight') });
    setFont(g);
    if (g.measureText(text).width > c.w * n('fitWidth')) {
      size *= (c.w * n('fitWidth')) / g.measureText(text).width;
      font = fontString({ size, weight: n('weight') });
      setFont(g);
    }
    const left = (c.w - g.measureText(text).width) / 2;
    const chars = [...text];
    const old = letters;
    letters = [];
    chars.forEach((ch, i) => {
      if (ch.trim() === '') return;
      const x0 = g.measureText(chars.slice(0, i).join('')).width;
      const m = g.measureText(ch);
      const prev = old[letters.length];
      letters.push({
        ch,
        ink: letters.length % SHARED.INKS,
        cx: left + x0 + m.width / 2,
        cy: c.h * n('textY'),
        w: m.width,
        h: m.actualBoundingBoxAscent + m.actualBoundingBoxDescent,
        vx: prev?.vx ?? 0,
        vy: prev?.vy ?? 0,
        sx: prev?.sx ?? 0,
        sy: prev?.sy ?? 0,
      });
    });
    held = null;
  }

  function drawLetter(g: CanvasRenderingContext2D, l: Letter): void {
    const inks = [theme.c1, theme.c2, theme.c3];
    const len = Math.hypot(l.sx, l.sy);
    const k = len / size;
    const th = Math.atan2(l.sy, l.sx);
    g.save();
    g.translate(l.cx + l.sx / 2, l.cy + l.sy / 2);
    g.rotate(th);
    g.scale(1 + k, (1 + k) ** -n('squash'));
    g.rotate(-th);
    g.fillStyle = inks[l.ink]!;
    g.fillText(l.ch, 0, 0);
    g.restore();
  }

  function draw(): void {
    const g = c.ctx;
    c.clear();
    setFont(g);
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.globalCompositeOperation = theme.blend;
    for (const l of letters) if (l !== held?.l) drawLetter(g, l);
    if (held) drawLetter(g, held.l);
    g.globalCompositeOperation = 'source-over';
  }

  return {
    resize() {
      c.fit();
      if (!fontsOk) return;
      layout();
    },
    update(dt) {
      ptr.sync();
      ptr.takeTaps();
      const f = frameFactor(dt);
      if (ptr.dragging && !held) {
        const l = letters.find(
          (q) => Math.abs(ptr.x - q.cx) <= q.w / 2 && Math.abs(ptr.y - q.cy) <= q.h / 2,
        );
        if (l) held = { l, gx: ptr.x - l.sx, gy: ptr.y - l.sy };
      } else if (!ptr.dragging && held) held = null;
      for (const l of letters) {
        if (held?.l === l) {
          let tx = (ptr.x - held.gx) * n('stretch');
          let ty = (ptr.y - held.gy) * n('stretch');
          const max = n('maxStretch') * size;
          const len = Math.hypot(tx, ty);
          if (len > max) {
            tx *= max / len;
            ty *= max / len;
          }
          const k = Math.min(1, n('follow') * f);
          const nx = l.sx + (tx - l.sx) * k;
          const ny = l.sy + (ty - l.sy) * k;
          l.vx = (nx - l.sx) / f;
          l.vy = (ny - l.sy) / f;
          l.sx = nx;
          l.sy = ny;
        } else {
          const d = n('wobble') ** f;
          l.vx = (l.vx - l.sx * n('snap') * f) * d;
          l.vy = (l.vy - l.sy * n('snap') * f) * d;
          l.sx += l.vx * f;
          l.sy += l.vy * f;
        }
      }
      draw();
    },
    still() {
      ptr.takeTaps();
      const keep = letters.map((l) => [l.sx, l.sy]);
      for (const l of letters) l.sx = l.sy = 0;
      const mid = letters[Math.floor(letters.length / 2)];
      if (mid) mid.sy = -FIXED.STILL_PULL * n('maxStretch') * size;
      draw();
      letters.forEach((l, i) => ([l.sx, l.sy] = keep[i]!));
    },
    setParams(next) {
      const relayout = params.some(
        (q) => (q.id === 'text' || q.phraseIn === 'text') && next[q.id] !== p[q.id],
      );
      p = { ...next };
      if (relayout && fontsOk && c.w) layout();
    },
    setTheme(t) {
      theme = t;
    },
    restart() {
      for (const l of letters) l.sx = l.sy = l.vx = l.vy = 0;
    },
    destroy() {
      ptr.destroy();
      c.destroy();
      letters = [];
    },
  };
}

const scene: SceneModule = { meta, params, followUps, create };
export default scene;
