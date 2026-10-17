// `melt`: Melting text (SCENES.md #7). The word lives on a hidden canvas and is
// copied onto the screen in thin vertical strips, each stretched by its melt.

import { createCanvas } from '../../engine/canvas';
import { fontsReady } from '../../engine/fonts';
import { createPointer } from '../../engine/pointer';
import { frameFactor } from '../../engine/time';
import { fontString, offscreen } from '../../kits/text';
import type { Theme } from '../../theme/worlds';
import { SHARED } from '../shared';
import type { Params, SceneContext, SceneInstance, SceneModule } from '../types';
import { FIXED } from './constants';
import { meta } from './meta';
import { params } from './params';
import { followUps } from './prompt';

interface Strip {
  x: number;
  /** Lowest ink in this strip on the hidden canvas (CSS px), or -1 when empty. */
  inkBottom: number;
  rate: number;
  melt: number;
  hard: number;
}
interface Drop {
  strip: number;
  phase: 'wait' | 'hang' | 'fall';
  t: number;
  y: number;
  v: number;
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

  let src: ReturnType<typeof offscreen> | null = null;
  let strips: Strip[] = [];
  let inked: number[] = [];
  let drops: Drop[] = [];
  let box = { top: 0, bottom: 0, left: 0, right: 0 };
  let ink = '';

  const wobble = (x: number) => {
    const s = n('patternSize');
    return (
      0.5 +
      FIXED.WAVE_AMP * Math.sin(x * s) +
      FIXED.WAVE_AMP * Math.sin((x * s) / FIXED.WAVE_RATIO + FIXED.WAVE_PHASE)
    );
  };

  function drawSource(): void {
    if (!src) return;
    const o = src.ctx;
    const text = String(p.text || ' ');
    o.setTransform(1, 0, 0, 1, 0, 0);
    o.clearRect(0, 0, src.canvas.width, src.canvas.height);
    o.setTransform(c.dpr, 0, 0, c.dpr, 0, 0);
    let size = Math.min(c.h * n('textHeight'), c.w * n('textWidth'));
    const setFont = () => {
      o.font = fontString({ size, weight: n('fontWeight') });
      try {
        o.fontStretch = String(p.letterWidth) as CanvasFontStretch;
      } catch {
        /* older browsers */
      }
    };
    setFont();
    const maxW = c.w * n('fitWidth');
    if (o.measureText(text).width > maxW) {
      size *= maxW / o.measureText(text).width;
      setFont();
    }
    o.textAlign = 'center';
    o.textBaseline = 'alphabetic';
    const m = o.measureText(text);
    const baseline =
      c.h * n('textY') + (m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2;
    o.fillStyle = theme.ink;
    o.fillText(text, c.w / 2, baseline);
    ink = theme.ink;
    box = {
      top: baseline - m.actualBoundingBoxAscent,
      bottom: baseline + m.actualBoundingBoxDescent,
      left: c.w / 2 - m.actualBoundingBoxLeft,
      right: c.w / 2 + m.actualBoundingBoxRight,
    };
  }

  function build(): void {
    src?.free();
    src = offscreen(c.w * c.dpr, c.h * c.dpr);
    drawSource();
    const sw = n('stripWidth');
    const d = c.dpr;
    const W = src.canvas.width;
    const data = src.ctx.getImageData(0, 0, W, src.canvas.height).data;
    strips = [];
    inked = [];
    for (let x = box.left; x < box.right; x += sw) {
      let low = -1;
      const x0 = Math.max(0, Math.floor(x * d));
      const x1 = Math.min(W, Math.ceil((x + sw) * d));
      const y0 = Math.max(0, Math.floor(box.top * d));
      const y1 = Math.min(src.canvas.height, Math.ceil(box.bottom * d));
      for (let y = y1 - 1; y >= y0 && low < 0; y--)
        for (let px = x0; px < x1; px++)
          if (data[(y * W + px) * SHARED.RGBA + SHARED.RGBA - 1]! > 0) {
            low = (y + 1) / d;
            break;
          }
      if (low >= 0) inked.push(strips.length);
      strips.push({
        x,
        inkBottom: low,
        rate: 1 - n('variety') * wobble(x + sw / 2),
        melt: 0,
        hard: 0,
      });
    }
    seedDrops();
  }

  const pick = () => inked[Math.floor(Math.random() * inked.length)] ?? 0;

  function seedDrops(): void {
    const count = n('drips');
    drops = Array.from({ length: count }, () => ({
      strip: pick(),
      phase: 'wait' as const,
      t: 0,
      y: 0,
      v: 0,
    }));
  }

  const sagOf = (s: Strip) => s.melt * (n('dripLength') / SHARED.PERCENT) * (box.bottom - box.top);
  function attachY(s: Strip): number {
    const sag = sagOf(s);
    const top = box.top + n('topSink') * sag;
    const bottom = box.bottom + sag;
    const H = box.bottom - box.top || 1;
    return top + ((s.inkBottom - box.top) / H) * (bottom - top);
  }

  function draw(): void {
    const g = c.ctx;
    c.clear();
    if (!src) return;
    if (theme.ink !== ink) drawSource();
    const sw = n('stripWidth');
    const d = c.dpr;
    const H = box.bottom - box.top;
    for (const s of strips) {
      const sag = sagOf(s);
      const top = box.top + n('topSink') * sag;
      const bottom = box.bottom + sag;
      g.drawImage(src.canvas, s.x * d, box.top * d, sw * d, H * d, s.x, top, sw, bottom - top);
    }
    g.fillStyle = theme.ink;
    g.strokeStyle = theme.ink;
    for (const drop of drops) {
      if (drop.phase === 'wait') continue;
      const s = strips[drop.strip];
      if (!s) continue;
      const x = s.x + sw / 2;
      const r =
        drop.phase === 'hang' ? n('dripSize') * Math.min(1, drop.t / n('hangTime')) : n('dripSize');
      if (r <= 0) continue;
      if (drop.phase === 'hang') {
        const a = attachY(s);
        g.lineWidth = r;
        g.beginPath();
        g.moveTo(x, a);
        g.lineTo(x, a + r);
        g.stroke();
        drop.y = a + r;
      }
      g.beginPath();
      g.arc(x, drop.y, r, 0, SHARED.TAU);
      g.fill();
    }
  }

  return {
    resize() {
      c.fit();
      if (!fontsOk) {
        strips = [];
        drops = [];
        return;
      }
      build();
    },
    update(dt) {
      ptr.sync();
      ptr.takeTaps();
      const f = frameFactor(dt);
      const R = n('coolRadius');
      const mid = (box.top + box.bottom) / 2;
      const sw = n('stripWidth');
      for (const s of strips) {
        let cool = 0;
        if (ptr.active) {
          const dist = Math.hypot(ptr.x - (s.x + sw / 2), ptr.y - mid);
          if (dist < R) cool = 1 - dist / R;
        }
        if (cool > 0) {
          s.melt += (0 - s.melt) * n('recover') * cool * f;
          s.hard = Math.max(s.hard, cool);
        } else {
          s.melt = Math.min(
            1,
            s.melt + (n('meltSpeed') * s.rate * (1 - s.hard) * dt) / n('meltTime'),
          );
          s.hard = Math.max(0, s.hard - dt / n('hold'));
        }
      }
      const count = drops.length;
      drops.forEach((drop, i) => {
        drop.t += dt;
        if (drop.phase === 'wait') {
          if (drop.t >= (i * n('hangTime')) / Math.max(1, count)) {
            drop.phase = 'hang';
            drop.t = 0;
          }
        } else if (drop.phase === 'hang') {
          if (drop.t >= n('hangTime')) {
            drop.phase = 'fall';
            drop.v = 0;
          }
        } else {
          drop.v += n('dripGravity') * f;
          drop.y += drop.v * f;
          if (drop.y - n('dripSize') > c.h) {
            drop.strip = pick();
            drop.phase = 'hang';
            drop.t = 0;
          }
        }
      });
      draw();
    },
    still() {
      ptr.takeTaps();
      const keep = strips.map((s) => s.melt);
      const keepDrops = drops.map((d) => ({ ...d }));
      for (const s of strips) s.melt = n('stillMelt') * s.rate;
      const hanging = Math.ceil(drops.length / SHARED.INKS);
      drops.forEach((d, i) => {
        d.phase = i < hanging ? 'hang' : 'wait';
        d.t = n('hangTime');
      });
      draw();
      strips.forEach((s, i) => (s.melt = keep[i]!));
      drops = keepDrops;
    },
    setParams(next) {
      const rebuild = params.some(
        (q) =>
          (q.group === 'Look' ||
            q.phraseIn === 'text' ||
            q.id === 'drips' ||
            q.id === 'variety' ||
            q.id === 'patternSize') &&
          next[q.id] !== p[q.id],
      );
      p = { ...next };
      if (rebuild && fontsOk && c.w) build();
    },
    setTheme(t) {
      theme = t;
    },
    restart() {
      for (const s of strips) {
        s.melt = 0;
        s.hard = 0;
      }
      seedDrops();
    },
    destroy() {
      ptr.destroy();
      c.destroy();
      src?.free();
      src = null;
      strips = [];
      drops = [];
    },
  };
}

const scene: SceneModule = { meta, params, followUps, create };
export default scene;
