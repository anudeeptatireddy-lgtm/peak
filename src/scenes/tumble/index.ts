// `tumble`: Falling letters (SCENES.md #8). Each letter is a physics-kit body
// (four verlet corners, six sticks) so blocks stack, tip and can be thrown.

import { createCanvas } from '../../engine/canvas';
import { fontsReady } from '../../engine/fonts';
import { createPointer } from '../../engine/pointer';
import { frameFactor } from '../../engine/time';
import { bodyAngle, bodyCenter, makeBody, stepBodies, type Body } from '../../kits/physics';
import { fontString } from '../../kits/text';
import type { Theme } from '../../theme/worlds';
import { SHARED } from '../shared';
import type { Params, SceneContext, SceneInstance, SceneModule } from '../types';
import { FIXED } from './constants';
import { meta } from './meta';
import { params } from './params';
import { followUps } from './prompt';

interface Block {
  ch: string;
  ink: number;
  home: number;
  w: number;
  h: number;
  /** Ink centering offset for the glyph (alphabetic baseline). */
  shift: number;
  dropAt: number;
  body: Body | null;
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

  let blocks: Block[] = [];
  let font = '';
  let size = 0;
  let time = 0;
  let lastTap = -Infinity;
  let held: { block: Block; weights: number[] } | null = null;

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
    size = (c.h * n('letterSize')) / SHARED.PERCENT;
    font = fontString({ size, weight: n('fontWeight') });
    setFont(g);
    const maxW = c.w * n('rowFit');
    const row = g.measureText(text).width;
    if (row > maxW) {
      size *= maxW / row;
      font = fontString({ size, weight: n('fontWeight') });
      setFont(g);
    }
    const left = (c.w - g.measureText(text).width) / 2;
    const chars = [...text];
    blocks = [];
    let prefix = '';
    let ink = 0;
    chars.forEach((ch) => {
      const x0 = g.measureText(prefix).width;
      prefix += ch;
      const adv = g.measureText(prefix).width - x0;
      if (ch.trim() === '') return;
      const m = g.measureText(ch);
      blocks.push({
        ch,
        ink: ink % SHARED.INKS,
        home: left + x0 + adv / 2,
        w: adv * n('boxWidth'),
        h: size * n('boxHeight'),
        shift: (m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2,
        dropAt: 0,
        body: null,
      });
      ink++;
    });
  }

  function dropAll(t: number): void {
    held = null;
    blocks.forEach((b, i) => {
      b.body = null;
      b.dropAt = t + (i * n('dropDelay')) / FIXED.MS;
    });
  }

  function spawn(b: Block): void {
    const tilt = (Math.random() - 0.5) * 2 * n('spawnTilt');
    b.body = makeBody(b.home, b.h / 2, b.w, b.h, tilt);
  }

  /** The block under (x, y), topmost first, with the grab weights of its corners. */
  function hit(x: number, y: number): { block: Block; weights: number[] } | null {
    for (let i = blocks.length - 1; i >= 0; i--) {
      const b = blocks[i]!;
      if (!b.body) continue;
      const cen = bodyCenter(b.body);
      const a = bodyAngle(b.body);
      const dx = x - cen.x;
      const dy = y - cen.y;
      const lx = dx * Math.cos(-a) - dy * Math.sin(-a);
      const ly = dx * Math.sin(-a) + dy * Math.cos(-a);
      if (Math.abs(lx) > b.w / 2 || Math.abs(ly) > b.h / 2) continue;
      const u = lx / b.w + 0.5;
      const v = ly / b.h + 0.5;
      return { block: b, weights: [(1 - u) * (1 - v), u * (1 - v), u * v, (1 - u) * v] };
    }
    return null;
  }

  function release(): void {
    if (!held?.block.body) return void (held = null);
    const k = n('throwPower');
    for (const q of held.block.body.p) {
      q.px = q.x - (q.x - q.px) * k;
      q.py = q.y - (q.y - q.py) * k;
    }
    held = null;
  }

  function drawBlock(g: CanvasRenderingContext2D, b: Block, x: number, y: number, a: number): void {
    const inks = [theme.c1, theme.c2, theme.c3];
    g.save();
    g.translate(x, y);
    g.rotate(a);
    g.fillStyle = inks[b.ink]!;
    g.beginPath();
    g.roundRect(-b.w / 2, -b.h / 2, b.w, b.h, n('corner') * size);
    g.fill();
    g.fillStyle = theme.ground;
    g.fillText(b.ch, 0, b.shift);
    g.restore();
  }

  function draw(): void {
    const g = c.ctx;
    c.clear();
    setFont(g);
    g.textAlign = 'center';
    g.textBaseline = 'alphabetic';
    for (const b of blocks) {
      if (!b.body) continue;
      const cen = bodyCenter(b.body);
      drawBlock(g, b, cen.x, cen.y, bodyAngle(b.body));
    }
  }

  return {
    resize() {
      c.fit();
      if (!fontsOk) {
        blocks = [];
        return;
      }
      layout();
      dropAll(time);
    },
    update(dt) {
      time += dt;
      ptr.sync();
      for (const _ of ptr.takeTaps()) {
        if (time - lastTap < FIXED.DOUBLE_TAP) {
          dropAll(time);
          lastTap = -Infinity;
        } else lastTap = time;
      }
      for (const b of blocks) if (!b.body && time >= b.dropAt) spawn(b);
      if (ptr.dragging && !held) held = hit(ptr.x, ptr.y);
      else if (!ptr.dragging && held) release();
      const f = frameFactor(dt);
      if (held?.block.body) {
        const pts = held.block.body.p;
        let gx = 0;
        let gy = 0;
        pts.forEach((q, i) => {
          gx += q.x * held!.weights[i]!;
          gy += q.y * held!.weights[i]!;
        });
        // Weights add up to 1; times the corner count, the block's center follows by `grab`.
        const k = n('grab') * pts.length;
        pts.forEach((q, i) => {
          const w = held!.weights[i]! * k;
          q.x += (ptr.x - gx) * w;
          q.y += (ptr.y - gy) * w;
        });
      }
      const live = blocks.filter((b) => b.body).map((b) => b.body!);
      stepBodies(
        live,
        {
          w: c.w,
          h: c.h,
          gravity: n('gravity'),
          drag: n('airDrag'),
          bounce: n('bounce'),
          grip: n('grip'),
          iterations: n('iterations'),
        },
        f,
      );
      draw();
    },
    still() {
      ptr.takeTaps();
      const g = c.ctx;
      c.clear();
      setFont(g);
      g.textAlign = 'center';
      g.textBaseline = 'alphabetic';
      blocks.forEach((b, i) => {
        const a = (i % 2 === 0 ? -1 : 1) * n('stillTilt');
        const lift = (b.w / 2) * Math.abs(Math.sin(a)) + (b.h / 2) * Math.abs(Math.cos(a));
        drawBlock(g, b, b.home, c.h - lift, a);
      });
    },
    setParams(next) {
      const relayout = params.some(
        (q) =>
          (q.group === 'Look' || q.phraseIn === 'text' || q.id === 'rowFit') &&
          next[q.id] !== p[q.id],
      );
      p = { ...next };
      if (relayout && fontsOk && c.w) {
        layout();
        dropAll(time);
      }
    },
    setTheme(t) {
      theme = t;
    },
    restart() {
      dropAll(time);
    },
    destroy() {
      ptr.destroy();
      c.destroy();
      blocks = [];
    },
  };
}

const scene: SceneModule = { meta, params, followUps, create };
export default scene;
