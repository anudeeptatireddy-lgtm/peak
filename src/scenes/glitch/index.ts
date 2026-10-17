// `glitch`: Glitch (SCENES.md #44, ⚠). A headline that tears into slices and splits into
// three ink channels during short bursts. Burst timing is checked by gate.ts so the
// picture never changes abruptly more than 3 times a second.

import { createCanvas } from '../../engine/canvas';
import { fontsReady } from '../../engine/fonts';
import { createPointer } from '../../engine/pointer';
import { applyFont } from '../../kits/text';
import type { Theme } from '../../theme/worlds';
import { SHARED } from '../shared';
import type { Params, SceneContext, SceneInstance, SceneModule } from '../types';
import { FIXED } from './constants';
import { BurstGate } from './gate';
import { meta } from './meta';
import { params } from './params';
import { followUps } from './prompt';

function create(host: HTMLElement, initial: Params, ctx: SceneContext): SceneInstance {
  let p = { ...initial };
  const n = (id: string) => Number(p[id]);
  let theme: Theme = ctx.theme;
  const c = createCanvas(host);
  const ptr = createPointer(host);
  const gate = new BurstGate();
  let time = 0;
  let burstStart = -Infinity;
  let burstLength = 0;
  let jumps: number[] = [];
  let nextAuto = 0;
  let inside = false;
  let wantBurst = false;
  let fontSize = 0;
  let box = { x: 0, y: 0, w: 0, h: 0 };
  let channels: HTMLCanvasElement[] = [];
  let pad = 0;

  const unit = () => 1 + (Math.random() - 0.5) * 2 * FIXED.AUTO_SPREAD;
  const schedule = () => {
    nextAuto = n('autoEvery') > 0 ? time + n('autoEvery') * unit() : Infinity;
  };

  function layout(): void {
    const g = c.ctx;
    const text = String(p.text || ' ');
    fontSize = Math.min(
      c.h * n('size'),
      ((c.w * FIXED.FIT) / Math.max(1, text.length)) * FIXED.EM_INV,
    );
    applyFont(g, { size: fontSize, weight: n('weight') }, n('width'));
    const tw = g.measureText(text).width;
    pad = fontSize * FIXED.PAD;
    const cw = Math.ceil(tw + pad * 2);
    const ch = Math.ceil(fontSize * FIXED.LINE + pad * 2);
    box = {
      x: (c.w - cw) * 0.5,
      y: c.h * FIXED.TEXT_Y - ch * 0.5,
      w: cw,
      h: ch,
    };
    const inks = [theme.c1, theme.c2, theme.c3];
    channels = inks.map((ink) => {
      const o = document.createElement('canvas');
      o.width = Math.ceil(cw * c.dpr);
      o.height = Math.ceil(ch * c.dpr);
      const og = o.getContext('2d')!;
      og.scale(c.dpr, c.dpr);
      applyFont(og, { size: fontSize, weight: n('weight') }, n('width'));
      og.textAlign = 'center';
      og.textBaseline = 'middle';
      og.fillStyle = ink;
      og.fillText(text, cw * 0.5, ch * 0.5);
      return o;
    });
  }

  function startBurst(): boolean {
    if (ctx.reducedMotion || !gate.start(time, n('burst'))) return false;
    burstStart = time;
    burstLength = n('burst');
    jumps = Array.from({ length: Math.round(n('slices')) }, () => {
      const jumpsNow = Math.random() < n('intensity');
      const far = (Math.random() - 0.5) * 2;
      return jumpsNow ? far * n('intensity') * n('jump') * fontSize : 0;
    });
    return true;
  }

  function draw(envelope: number, restingSplit: boolean): void {
    const g = c.ctx;
    c.clear();
    const text = String(p.text || ' ');
    if (envelope <= 0 && !restingSplit) {
      applyFont(g, { size: fontSize, weight: n('weight') }, n('width'));
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.fillStyle = theme.ink;
      g.fillText(text, c.w * 0.5, c.h * FIXED.TEXT_Y);
      return;
    }
    const slices = Math.round(n('slices'));
    const sh = box.h / slices;
    const split = n('split') * (restingSplit ? 1 : envelope);
    g.globalCompositeOperation = theme.blend;
    g.globalAlpha = FIXED.CHANNEL_ALPHA;
    channels.forEach((img, k) => {
      const dx = (k - 1) * split;
      for (let j = 0; j < slices; j++) {
        const jump = restingSplit ? 0 : (jumps[j] ?? 0) * envelope;
        g.drawImage(
          img,
          0,
          j * sh * c.dpr,
          img.width,
          sh * c.dpr,
          box.x + dx + jump,
          box.y + j * sh,
          box.w,
          sh,
        );
      }
    });
    g.globalAlpha = 1;
    g.globalCompositeOperation = 'source-over';
  }

  fontsReady().then(() => {
    if (c.w) {
      layout();
      draw(0, false);
    }
  });

  return {
    resize() {
      c.fit();
      layout();
      schedule();
      draw(0, false);
    },
    update(dt) {
      time += dt;
      ptr.sync();
      const was = inside;
      inside =
        ptr.active &&
        ptr.x >= box.x &&
        ptr.x <= box.x + box.w &&
        ptr.y >= box.y &&
        ptr.y <= box.y + box.h;
      if (p.hover) {
        if (inside && !was) wantBurst = true;
        for (const tap of ptr.takeTaps())
          if (tap.x >= box.x && tap.x <= box.x + box.w && tap.y >= box.y && tap.y <= box.y + box.h)
            wantBurst = true;
        if (!inside && ptr.pointerType === 'mouse') wantBurst = wantBurst && false;
      } else ptr.takeTaps();
      if (time >= nextAuto) {
        wantBurst = true;
        schedule();
      }
      const running = time - burstStart < burstLength;
      if (wantBurst && !running && startBurst()) wantBurst = false;
      const age = time - burstStart;
      const live = age >= 0 && age < burstLength;
      draw(live ? Math.sin((Math.PI * age) / burstLength) : 0, false);
    },
    still() {
      ptr.takeTaps();
      draw(0, true);
    },
    setParams(next) {
      p = { ...next };
      if (c.w) {
        layout();
        schedule();
        draw(0, false);
      }
    },
    setTheme(t) {
      theme = t;
      if (c.w) layout();
    },
    restart() {
      time = 0;
      burstStart = -Infinity;
      burstLength = 0;
      wantBurst = false;
      schedule();
    },
    destroy() {
      ptr.destroy();
      c.destroy();
      channels = [];
    },
  };
}

const scene: SceneModule = { meta, params, followUps, create };
export default scene;
