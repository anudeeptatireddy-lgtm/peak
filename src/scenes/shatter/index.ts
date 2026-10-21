// `shatter`: Shattering words (SCENES.md #13). Each word's box is cut into
// convex shards by repeated straight cracks; shards clip and carry the word.

import { cursorLean } from '../../kits/cursor';
import { createCanvas } from '../../engine/canvas';
import { fontsReady } from '../../engine/fonts';
import { createPointer } from '../../engine/pointer';
import { frameFactor } from '../../engine/time';
import { fontString, type Pt } from '../../kits/text';
import type { Theme } from '../../theme/worlds';
import type { Params, SceneContext, SceneInstance, SceneModule } from '../types';
import { FIXED } from './constants';
import { meta } from './meta';
import { params } from './params';
import { followUps } from './prompt';

interface Shard {
  /** Outline relative to the shard's home center. */
  poly: Pt[];
  hx: number;
  hy: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  a: number;
  va: number;
}
interface Word {
  text: string;
  x: number;
  box: { l: number; r: number; t: number; b: number };
  state: 'whole' | 'flying' | 'return' | 'shimmer';
  shards: Shard[];
  at: number;
}

const area = (poly: Pt[]) => {
  let s = 0;
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i]!;
    const b = poly[(i + 1) % poly.length]!;
    s += a.x * b.y - b.x * a.y;
  }
  return Math.abs(s) / 2;
};

/** Cuts a convex polygon along the line through p at angle th; returns both halves. */
function cut(poly: Pt[], p: Pt, th: number): [Pt[], Pt[]] {
  const dx = Math.cos(th);
  const dy = Math.sin(th);
  const side = (v: Pt) => dx * (v.y - p.y) - dy * (v.x - p.x);
  const a: Pt[] = [];
  const b: Pt[] = [];
  for (let i = 0; i < poly.length; i++) {
    const u = poly[i]!;
    const v = poly[(i + 1) % poly.length]!;
    const su = side(u);
    const sv = side(v);
    (su >= 0 ? a : b).push(u);
    if (su >= 0 !== sv >= 0) {
      const k = su / (su - sv);
      const q = { x: u.x + (v.x - u.x) * k, y: u.y + (v.y - u.y) * k };
      a.push(q);
      b.push(q);
    }
  }
  return [a, b];
}

function fracture(box: Word['box'], count: number): Pt[][] {
  let pieces: Pt[][] = [
    [
      { x: box.l, y: box.t },
      { x: box.r, y: box.t },
      { x: box.r, y: box.b },
      { x: box.l, y: box.b },
    ],
  ];
  while (pieces.length < count) {
    let best = 0;
    pieces.forEach((pc, i) => {
      if (area(pc) > area(pieces[best]!)) best = i;
    });
    const pc = pieces[best]!;
    const xs = pc.map((v) => v.x);
    const ys = pc.map((v) => v.y);
    const w = Math.max(...xs) - Math.min(...xs);
    const h = Math.max(...ys) - Math.min(...ys);
    const cx = xs.reduce((s, v) => s + v, 0) / pc.length;
    const cy = ys.reduce((s, v) => s + v, 0) / pc.length;
    const p = {
      x: cx + (Math.random() - 0.5) * FIXED.SPLIT_JITTER * w,
      y: cy + (Math.random() - 0.5) * FIXED.SPLIT_JITTER * h,
    };
    const [a, b] = cut(pc, p, Math.random() * Math.PI);
    if (a.length < FIXED.MIN_CORNERS || b.length < FIXED.MIN_CORNERS) continue;
    pieces = [...pieces.slice(0, best), a, b, ...pieces.slice(best + 1)];
  }
  return pieces;
}

function create(host: HTMLElement, initial: Params, ctx: SceneContext): SceneInstance {
  let p = { ...initial };
  // Follow cursor: the whole picture tilts toward the mouse (off by default).
  const lean = cursorLean(host);
  const n = (id: string) => Number(p[id]);
  let theme: Theme = ctx.theme;
  const c = createCanvas(host);
  const ptr = createPointer(host);
  const label = document.createElement('p');
  label.className = 'sr-only';
  host.append(label);
  let fontsOk = false;
  fontsReady().then(() => {
    fontsOk = true;
  });

  let words: Word[] = [];
  let font = '';
  let baseline = 0;
  let time = 0;

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
    label.textContent = text;
    let size = c.h * n('textHeight');
    font = fontString({ size, weight: n('fontWeight') });
    setFont(g);
    const maxW = c.w * n('fitWidth');
    if (g.measureText(text).width > maxW) {
      size *= maxW / g.measureText(text).width;
      font = fontString({ size, weight: n('fontWeight') });
      setFont(g);
    }
    const line = g.measureText(text);
    baseline =
      c.h * n('textY') + (line.actualBoundingBoxAscent - line.actualBoundingBoxDescent) / 2;
    const left = (c.w - line.width) / 2;
    const pad = n('pad') * size;
    words = [];
    let from = 0;
    for (const part of text.split(' ')) {
      if (part) {
        const x = left + g.measureText(text.slice(0, from)).width;
        const m = g.measureText(part);
        words.push({
          text: part,
          x,
          box: {
            l: x - m.actualBoundingBoxLeft - pad,
            r: x + m.actualBoundingBoxRight + pad,
            t: baseline - m.actualBoundingBoxAscent - pad,
            b: baseline + m.actualBoundingBoxDescent + pad,
          },
          state: 'whole',
          shards: [],
          at: 0,
        });
      }
      from += part.length + 1;
    }
  }

  function shardsFor(w: Word): Shard[] {
    return fracture(w.box, n('shards')).map((poly) => {
      const hx = poly.reduce((s, v) => s + v.x, 0) / poly.length;
      const hy = poly.reduce((s, v) => s + v.y, 0) / poly.length;
      return {
        poly: poly.map((v) => ({ x: v.x - hx, y: v.y - hy })),
        hx,
        hy,
        x: hx,
        y: hy,
        vx: 0,
        vy: 0,
        a: 0,
        va: 0,
      };
    });
  }

  function shatter(w: Word, cx: number, cy: number): void {
    w.shards = shardsFor(w);
    for (const s of w.shards) {
      const dx = s.hx - cx;
      const dy = s.hy - cy;
      const d = Math.hypot(dx, dy) || 1;
      const k = n('force') * (0.5 + Math.random() * 0.5);
      s.vx = (dx / d) * k;
      s.vy = (dy / d) * k - n('lift');
      s.va = (Math.random() - 0.5) * 2 * n('spin');
    }
    w.state = 'flying';
    w.at = time;
    ctx.sound.play('pop');
  }

  function trace(g: CanvasRenderingContext2D, poly: Pt[]): void {
    g.beginPath();
    poly.forEach((v, i) => (i ? g.lineTo(v.x, v.y) : g.moveTo(v.x, v.y)));
    g.closePath();
  }

  function draw(stillCracks: boolean): void {
    const g = c.ctx;
    c.clear();
    setFont(g);
    g.textAlign = 'left';
    g.textBaseline = 'alphabetic';
    g.fillStyle = theme.ink;
    g.lineWidth = 1;
    words.forEach((w, wi) => {
      if (w.state === 'whole' || w.state === 'shimmer') {
        g.fillText(w.text, w.x, baseline);
        const cracks = w.state === 'shimmer' || (stillCracks && wi === 0);
        if (!cracks) return;
        const age = time - w.at;
        g.strokeStyle = w.state === 'shimmer' ? theme.c2 : theme.inkSoft;
        g.globalAlpha =
          w.state === 'shimmer'
            ? n('crackAlpha') * Math.max(0, 1 - age / n('shimmer'))
            : n('crackAlpha') / 2;
        for (const s of w.shards) {
          g.save();
          g.translate(s.hx, s.hy);
          trace(g, s.poly);
          g.stroke();
          g.restore();
        }
        g.globalAlpha = 1;
        return;
      }
      for (const s of w.shards) {
        g.save();
        g.translate(s.x, s.y);
        g.rotate(s.a);
        trace(g, s.poly);
        g.save();
        g.clip();
        g.fillText(w.text, w.x - s.hx, baseline - s.hy);
        g.restore();
        g.globalAlpha = n('glint') * Math.abs(Math.sin(s.a * 2));
        g.strokeStyle = theme.c2;
        g.stroke();
        g.restore();
      }
    });
  }

  return {
    resize() {
      c.fit();
      if (!fontsOk) {
        words = [];
        return;
      }
      layout();
    },
    update(dt) {
      lean.update(dt, !!p.cursor, Number(p.cursorLean));
      time += dt;
      ptr.sync();
      for (const tap of ptr.takeTaps()) {
        const w = words.find(
          (q) =>
            q.state === 'whole' &&
            tap.x >= q.box.l &&
            tap.x <= q.box.r &&
            tap.y >= q.box.t &&
            tap.y <= q.box.b,
        );
        if (w) shatter(w, tap.x, tap.y);
      }
      const f = frameFactor(dt);
      for (const w of words) {
        if (w.state === 'flying') {
          for (const s of w.shards) {
            s.vy += n('gravity') * f;
            s.x += s.vx * f;
            s.y += s.vy * f;
            s.a += s.va * f;
          }
          if (time - w.at >= n('reform')) w.state = 'return';
        } else if (w.state === 'return') {
          const k = Math.min(1, n('returnRate') * f);
          let home = true;
          for (const s of w.shards) {
            s.x += (s.hx - s.x) * k;
            s.y += (s.hy - s.y) * k;
            s.a += (0 - s.a) * k;
            if (
              Math.hypot(s.hx - s.x, s.hy - s.y) > FIXED.HOME_DIST ||
              Math.abs(s.a) > FIXED.HOME_ANGLE
            )
              home = false;
          }
          if (home) {
            w.state = 'shimmer';
            w.at = time;
          }
        } else if (w.state === 'shimmer' && time - w.at >= n('shimmer')) w.state = 'whole';
      }
      draw(false);
    },
    still() {
      lean.reset();
      ptr.takeTaps();
      const first = words[0];
      if (first && first.state === 'whole') first.shards = shardsFor(first);
      draw(true);
    },
    setParams(next) {
      const relayout = params.some(
        (q) => (q.group === 'Look' || q.phraseIn === 'text') && next[q.id] !== p[q.id],
      );
      p = { ...next };
      if (relayout && fontsOk && c.w) layout();
    },
    setTheme(t) {
      theme = t;
    },
    restart() {
      for (const w of words) w.state = 'whole';
    },
    destroy() {
      lean.destroy();
      ptr.destroy();
      c.destroy();
      label.remove();
      words = [];
    },
  };
}

const scene: SceneModule = { meta, params, followUps, create };
export default scene;
