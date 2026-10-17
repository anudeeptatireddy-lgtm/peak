// `lightning`: Lightning ⚠ (SCENES.md #32). The simulation lives in storm.ts;
// this file wires the pointer and draws nodes, then arcs with a soft glow.

import { createCanvas } from '../../engine/canvas';
import { createPointer } from '../../engine/pointer';
import type { Theme } from '../../theme/worlds';
import { SHARED } from '../shared';
import type { Params, SceneContext, SceneInstance, SceneModule } from '../types';
import { FIXED } from './constants';
import { meta } from './meta';
import { params } from './params';
import { followUps } from './prompt';
import { Storm, type StormOptions } from './storm';

function create(host: HTMLElement, initial: Params, ctx: SceneContext): SceneInstance {
  let p = { ...initial };
  const n = (id: string) => Number(p[id]);
  let theme: Theme = ctx.theme;
  const c = createCanvas(host);
  const ptr = createPointer(host);
  let storm = new Storm();
  let still: Storm | null = null;

  function options(): StormOptions {
    return {
      nodes: n('nodes'),
      reach: n('reach'),
      branching: n('branching'),
      crackle: n('crackle'),
      chain: n('chain'),
      strikes: n('strikes'),
      idleEvery: n('idleEvery'),
      arcLife: n('arcLife'),
      segment: n('segment'),
      jag: n('jag'),
      branchRate: n('branchRate'),
      branchLen: n('branchLen'),
      branchAngle: n('branchAngle'),
      chainFade: n('chainFade'),
      nodeFade: n('nodeFade'),
      margin: n('margin'),
    };
  }

  function draw(s: Storm): void {
    const g = c.ctx;
    c.clear();
    const inks = [theme.c1, theme.c2, theme.c3];
    g.globalCompositeOperation = theme.blend;
    const r = n('nodeSize');
    const gr = n('nodeGlow');
    const soft = new Path2D();
    for (const node of s.nodes) {
      soft.moveTo(node.x + r, node.y);
      soft.arc(node.x, node.y, r, 0, SHARED.TAU);
    }
    g.fillStyle = theme.inkSoft;
    g.fill(soft);
    for (const node of s.nodes) {
      if (node.glow < FIXED.GLOW_FLOOR) continue;
      const ink = inks[node.ink]!;
      if (gr > 0) {
        const grad = g.createRadialGradient(node.x, node.y, 0, node.x, node.y, gr);
        grad.addColorStop(0, ink);
        grad.addColorStop(1, ink + FIXED.CLEAR);
        g.globalAlpha = node.glow * 0.5;
        g.fillStyle = grad;
        g.fillRect(node.x - gr, node.y - gr, gr * 2, gr * 2);
      }
      g.globalAlpha = node.glow;
      g.fillStyle = ink;
      g.beginPath();
      g.arc(node.x, node.y, r, 0, SHARED.TAU);
      g.fill();
    }
    g.lineCap = 'round';
    g.lineJoin = 'round';
    const glowing = theme.blend === 'lighter';
    const life = n('arcLife');
    for (const a of s.arcs) {
      const path = new Path2D();
      for (const line of a.lines) {
        path.moveTo(line[0]!, line[1]!);
        for (let i = 2; i < line.length; i += 2) path.lineTo(line[i]!, line[i + 1]!);
      }
      const alpha = a.power * (1 - a.age / life);
      const w = n('arcWidth') * a.power;
      g.strokeStyle = inks[a.hop % SHARED.INKS]!;
      if (glowing)
        for (let i = FIXED.GLOW_LAYERS; i >= 1; i--) {
          g.globalAlpha =
            alpha * (FIXED.GLOW_STRENGTH / FIXED.GLOW_LAYERS) * (1 - (i - 1) / FIXED.GLOW_LAYERS);
          g.lineWidth = w + i * FIXED.GLOW_SPREAD;
          g.stroke(path);
        }
      g.globalAlpha = alpha;
      g.lineWidth = w;
      g.stroke(path);
      if (glowing) {
        g.strokeStyle = theme.ink;
        g.lineWidth = w / 2;
        g.stroke(path);
      }
    }
    g.globalAlpha = 1;
    g.globalCompositeOperation = 'source-over';
  }

  function makeStill(): Storm {
    const s = new Storm();
    const o = options();
    s.nodes = storm.nodes.map((q) => ({ ...q, glow: 0 }));
    const [fx, fy] = FIXED.STILL_FROM;
    const [tx, ty] = FIXED.STILL_TO;
    const a = s.nearest(fx * c.w, fy * c.h, Infinity, new Set());
    const b = a && s.nearest(tx * c.w, ty * c.h, Infinity, new Set([a]));
    if (a && b) {
      s.arcs.push({ lines: s.lines(a.x, a.y, b.x, b.y, o, Math.random), age: 0, hop: 0, power: 1 });
      a.glow = 1;
      b.glow = 1;
    }
    return s;
  }

  return {
    resize() {
      c.fit();
      storm.place(c.w, c.h, options());
      storm.arcs = [];
      still = null;
    },
    update(dt) {
      ptr.sync();
      ptr.takeTaps();
      const on = ptr.pointerType === 'mouse' ? ptr.active : ptr.dragging;
      storm.step(dt, on ? { x: ptr.x, y: ptr.y } : null, options());
      draw(storm);
    },
    still() {
      ptr.takeTaps();
      still ??= makeStill();
      draw(still);
    },
    setParams(next) {
      const rebuild = params.some((q) => q.rebuild && next[q.id] !== p[q.id]);
      p = { ...next };
      if (rebuild && c.w) {
        storm.place(c.w, c.h, options());
        storm.arcs = [];
      }
      still = null;
    },
    setTheme(t) {
      theme = t;
    },
    restart() {
      storm = new Storm();
      if (c.w) storm.place(c.w, c.h, options());
      still = null;
    },
    destroy() {
      ptr.destroy();
      c.destroy();
      storm = new Storm();
      still = null;
    },
  };
}

const scene: SceneModule = { meta, params, followUps, create };
export default scene;
