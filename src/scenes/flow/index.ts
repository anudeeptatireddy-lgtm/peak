// `flow`: Living wallpaper (SCENES.md #22). Ported from reference/peak-prototype.html.
// Like the prototype, the canvas holds the ground color and trails fade by painting
// the ground over them (which leaves the faint gray ghost trails). When the ground
// color changes (a world change or a journey blend) the canvas is repainted.

import { createCanvas } from '../../engine/canvas';
import { createPointer } from '../../engine/pointer';
import { frameFactor } from '../../engine/time';
import type { Theme } from '../../theme/worlds';
import type { Params, SceneContext, SceneInstance, SceneModule } from '../types';
import { meta } from './meta';
import { params } from './params';
import { followUps } from './prompt';

interface P {
  x: number;
  y: number;
  life: number;
  ci: number;
}

function create(host: HTMLElement, initial: Params, ctx: SceneContext): SceneInstance {
  let p = { ...initial };
  let theme: Theme = ctx.theme;
  const c = createCanvas(host);
  const ptr = createPointer(host);
  let parts: P[] = [];
  let time = 0;
  let paintedGround = '';

  const spawn = (q: P): P => {
    q.x = Math.random() * c.w;
    q.y = Math.random() * c.h;
    q.life = 40 + Math.random() * 220;
    return q;
  };

  const field = (x: number, y: number, t: number) => {
    const s = Number(p.zoom);
    return (
      Math.sin(x * s + t * 0.23) * 1.9 +
      Math.cos(y * s * 1.4 - t * 0.17) * 1.6 +
      Math.sin((x - y) * s * 0.6 + t * 0.11) * 1.3
    );
  };

  function build(): void {
    const max = Number(p.count) * (ctx.quality === 'preview' ? 0.35 : 1);
    const n = Math.round(Math.max(Math.min(500, max), Math.min(max, (c.w * c.h) / 620)));
    parts = [];
    for (let i = 0; i < n; i++) parts.push(spawn({ x: 0, y: 0, life: 0, ci: i % 3 }));
    paintGround();
  }

  function paintGround(): void {
    c.clear(theme.ground);
    paintedGround = theme.ground;
  }

  function step(t: number, f: number, stirring: boolean): void {
    const g = c.ctx;
    g.globalCompositeOperation = 'source-over';
    g.globalAlpha = Math.min(1, Number(p.trail) * f);
    g.fillStyle = theme.ground;
    g.fillRect(0, 0, c.w, c.h);
    g.globalAlpha = 0.9;
    g.globalCompositeOperation = theme.blend;
    g.lineWidth = Number(p.lineWidth);
    g.lineCap = 'round';
    const paths = [new Path2D(), new Path2D(), new Path2D()];
    const R = Math.max(140, Math.min(280, Math.min(c.w, c.h) * 0.35));
    const speed = Number(p.speed);
    const stir = Number(p.stir);
    for (const q of parts) {
      const a = field(q.x, q.y, t);
      let vx = Math.cos(a) * speed;
      let vy = Math.sin(a) * speed;
      if (stirring) {
        const dx = q.x - ptr.x;
        const dy = q.y - ptr.y;
        const d = Math.hypot(dx, dy) || 1;
        if (d < R) {
          const s = 1 - d / R;
          vx += ((-dy / d) * stir - (dx / d) * 1.2) * s;
          vy += ((dx / d) * stir - (dy / d) * 1.2) * s;
        }
      }
      const nx = q.x + vx * f;
      const ny = q.y + vy * f;
      const path = paths[q.ci]!;
      path.moveTo(q.x, q.y);
      path.lineTo(nx, ny);
      q.x = nx;
      q.y = ny;
      // The prototype ages particles by one per frame (not by f).
      q.life -= 1;
      if (q.life < 0 || nx < -5 || ny < -5 || nx > c.w + 5 || ny > c.h + 5) spawn(q);
    }
    const inks = [theme.c1, theme.c2, theme.c3];
    for (let k = 0; k < 3; k++) {
      g.strokeStyle = inks[k]!;
      g.stroke(paths[k]!);
    }
    g.globalCompositeOperation = 'source-over';
    g.globalAlpha = 1;
  }

  return {
    resize() {
      // Like the prototype: every resize re-seeds the particles and repaints the ground.
      c.fit();
      build();
    },
    update(dt) {
      time += dt;
      ptr.sync();
      ptr.takeTaps();
      step(time, frameFactor(dt), ptr.down && ptr.active && ptr.dragging);
    },
    still() {
      paintGround();
      for (let i = 0; i < 70; i++) step(i / 60, 1, false);
    },
    setParams(next) {
      const rebuild = next.count !== p.count;
      p = { ...next };
      if (rebuild) build();
    },
    setTheme(t) {
      theme = t;
      if (t.ground !== paintedGround) paintGround();
    },
    restart() {
      build();
    },
    destroy() {
      ptr.destroy();
      c.destroy();
      parts = [];
    },
  };
}

const scene: SceneModule = { meta, params, followUps, create };
export default scene;
