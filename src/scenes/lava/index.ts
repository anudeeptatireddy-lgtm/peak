// `lava`: Lava lamp (SCENES.md #42). Blobs with a heat rise when hot and sink when cold;
// they are drawn as metaballs (summed fields, thresholded) on a coarse grid.

import { createCanvas } from '../../engine/canvas';
import { createPointer } from '../../engine/pointer';
import { frameFactor } from '../../engine/time';
import { seededRandom } from '../../kits/field';
import { MetaballRenderer, type Ball } from '../../kits/render';
import { parseHex } from '../../theme/color';
import type { Theme } from '../../theme/worlds';
import { SHARED } from '../shared';
import type { Params, SceneContext, SceneInstance, SceneModule } from '../types';
import { FIXED } from './constants';
import { meta } from './meta';
import { params } from './params';
import { followUps } from './prompt';

const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);

interface Blob {
  x: number;
  y: number;
  vx: number;
  vy: number;
  heat: number;
  /** Radius as a share of Blob size. */
  scale: number;
}

function create(host: HTMLElement, initial: Params, ctx: SceneContext): SceneInstance {
  let p = { ...initial };
  const n = (id: string) => Number(p[id]);
  let theme: Theme = ctx.theme;
  const c = createCanvas(host);
  const ptr = createPointer(host);
  let rand = seededRandom(FIXED.SEED);
  let blobs: Blob[] = [];
  let time = 0;
  let renderer = new MetaballRenderer(FIXED.CELL_MEDIUM);

  const cellSize = () =>
    c.w < SHARED.SMALL_SCREEN
      ? FIXED.PHONE_CELL
      : p.detail === 'low'
        ? FIXED.CELL_LOW
        : p.detail === 'high'
          ? FIXED.CELL_HIGH
          : FIXED.CELL_MEDIUM;

  function build(): void {
    rand = seededRandom(FIXED.SEED);
    blobs = Array.from({ length: n('blobs') }, () => ({
      x: rand() * c.w,
      y: rand() * c.h,
      vx: 0,
      vy: 0,
      heat: rand(),
      scale: Math.max(FIXED.SIZE_FLOOR, rand() * (1 + n('sizeVariety'))),
    }));
  }

  const radius = (b: Blob) => n('size') * b.scale;

  function step(dt: number, f: number): void {
    time += dt;
    const speed = n('speed');
    blobs.forEach((b, i) => {
      if (b.y > c.h * (1 - FIXED.HEAT_ZONE)) b.heat += n('heatRate') * dt;
      if (b.y < c.h * FIXED.COOL_ZONE) b.heat -= n('heatRate') * FIXED.COOL_RATIO * dt;
      b.heat = clamp(b.heat - FIXED.AMBIENT * dt, 0, 1);
      b.vy -= (b.heat - 0.5) * n('buoyancy') * speed * f;
      b.vx +=
        Math.sin(time * FIXED.WANDER_RATE + (SHARED.TAU * i) / blobs.length) *
        FIXED.WANDER *
        speed *
        f;
      const drag = Math.pow(FIXED.DRAG, f);
      b.vx *= drag;
      b.vy *= drag;
      b.x += b.vx * f;
      b.y += b.vy * f;
      const r = radius(b);
      if (b.x < r || b.x > c.w - r) {
        b.x = clamp(b.x, r, c.w - r);
        b.vx = 0;
      }
      if (b.y < r || b.y > c.h - r) {
        b.y = clamp(b.y, r, c.h - r);
        b.vy = 0;
      }
    });
  }

  const rgb = (hex: string): [number, number, number] => {
    const q = parseHex(hex);
    return [q.r * FIXED.CHANNEL, q.g * FIXED.CHANNEL, q.b * FIXED.CHANNEL];
  };

  function draw(): void {
    const g = c.ctx;
    c.clear();
    const balls: Ball[] = blobs.map((b) => ({ x: b.x, y: b.y, r: radius(b) }));
    const threshold = FIXED.EDGE_FIELD / n('merge');
    const soft = n('edgeSoft');
    if (p.glowEdge) {
      g.globalCompositeOperation = theme.blend;
      g.globalAlpha = FIXED.GLOW_ALPHA;
      renderer.draw(g, c.w, c.h, balls, rgb(theme.c2), threshold * FIXED.GLOW_SCALE, soft);
      g.globalAlpha = 1;
      g.globalCompositeOperation = 'source-over';
    }
    renderer.draw(g, c.w, c.h, balls, rgb(theme.c1), threshold, soft);
    if (p.glowEdge) {
      g.globalAlpha = FIXED.CORE_ALPHA;
      renderer.draw(g, c.w, c.h, balls, rgb(theme.c3), threshold * FIXED.CORE_SCALE, soft);
      g.globalAlpha = 1;
    }
  }

  function refit(): void {
    if (renderer.cell !== cellSize()) {
      renderer.destroy();
      renderer = new MetaballRenderer(cellSize());
    }
  }

  return {
    resize() {
      c.fit();
      refit();
      if (!blobs.length) build();
      draw();
    },
    update(dt) {
      const f = frameFactor(dt);
      ptr.sync();
      for (const _tap of ptr.takeTaps()) {
        for (const b of blobs) {
          b.heat = Math.min(1, b.heat + n('warmth'));
          if (b.y > c.h * 0.5) b.vy -= n('warmth') * FIXED.KICK;
        }
      }
      step(dt, f);
      draw();
    },
    still() {
      ptr.takeTaps();
      build();
      for (let i = 0; i < FIXED.STILL_FRAMES; i++) step(1 / SHARED.FPS, 1);
      draw();
    },
    setParams(next) {
      const rebuild = next.blobs !== p.blobs || next.sizeVariety !== p.sizeVariety;
      p = { ...next };
      refit();
      if (rebuild && c.w) build();
      if (c.w) draw();
    },
    setTheme(t) {
      theme = t;
    },
    restart() {
      time = 0;
      build();
    },
    destroy() {
      ptr.destroy();
      renderer.destroy();
      c.destroy();
      blobs = [];
    },
  };
}

const scene: SceneModule = { meta, params, followUps, create };
export default scene;
