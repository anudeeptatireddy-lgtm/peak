// `flow`: Living wallpaper (SCENES.md #22). Ported from reference/peak-prototype.html.
// Like the prototype, the canvas holds the ground color and trails fade by painting
// the ground over them (which leaves the faint gray ghost trails). When the ground
// color changes (a world change or a journey blend) the canvas is repainted.

import { createCanvas } from '../../engine/canvas';
import { createPointer } from '../../engine/pointer';
import { frameFactor } from '../../engine/time';
import { Batch } from '../../kits/render';
import type { Theme } from '../../theme/worlds';
import type { Params, SceneContext, SceneInstance, SceneModule } from '../types';
import { SHARED } from '../shared';
import { FIXED } from './constants';
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
  const batch = new Batch(SHARED.INKS);
  let time = 0;
  let paintedGround = '';

  const spawn = (q: P): P => {
    q.x = Math.random() * c.w;
    q.y = Math.random() * c.h;
    q.life = Number(p.lifeMin) + Math.random() * Number(p.lifeRange);
    return q;
  };

  const field = (x: number, y: number, t: number) => {
    const s = Number(p.zoom);
    const n = (id: string) => Number(p[id]);
    return (
      Math.sin(x * s + t * n('w1Drift')) * n('w1Strength') +
      Math.cos(y * s * n('w2Stretch') - t * n('w2Drift')) * n('w2Strength') +
      Math.sin((x - y) * s * n('w3Scale') + t * n('w3Drift')) * n('w3Strength')
    );
  };

  function build(): void {
    const max = Number(p.count) * (ctx.quality === 'preview' ? SHARED.PREVIEW_SCALE : 1);
    const floor = Math.min(Number(p.minCount), max);
    const n = Math.round(Math.max(floor, Math.min(max, (c.w * c.h) / Number(p.areaPerParticle))));
    parts = [];
    for (let i = 0; i < n; i++) parts.push(spawn({ x: 0, y: 0, life: 0, ci: i % SHARED.INKS }));
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
    g.globalCompositeOperation = theme.blend;
    g.lineCap = 'round';
    batch.reset();
    const R = Math.max(
      Number(p.stirMin),
      Math.min(Number(p.stirMax), Math.min(c.w, c.h) * Number(p.stirReach)),
    );
    const pull = Number(p.stirPull);
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
          vx += ((-dy / d) * stir - (dx / d) * pull) * s;
          vy += ((dx / d) * stir - (dy / d) * pull) * s;
        }
      }
      const nx = q.x + vx * f;
      const ny = q.y + vy * f;
      batch.line(q.ci, q.x, q.y, nx, ny);
      q.x = nx;
      q.y = ny;
      // The prototype ages particles by one per frame (not by f).
      q.life -= 1;
      const e = FIXED.EDGE;
      if (q.life < 0 || nx < -e || ny < -e || nx > c.w + e || ny > c.h + e) spawn(q);
    }
    batch.stroke(g, [theme.c1, theme.c2, theme.c3], Number(p.lineWidth), Number(p.lineOpacity));
    g.globalCompositeOperation = 'source-over';
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
      for (let i = 0; i < FIXED.STILL_STEPS; i++) step(i / SHARED.FPS, 1, false);
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
