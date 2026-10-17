// `fridge`: Fridge magnets (SCENES.md #9). Letters slide toward the cursor,
// lock into their slots on the middle line, and scatter on a shake.

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

interface Magnet {
  ch: string;
  /** Index into slots, or -1 for an extra letter. */
  slot: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  ink: number;
  locked: boolean;
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

  let magnets: Magnet[] = [];
  let slots: { x: number; y: number }[] = [];
  let size = 0;
  let font = '';
  let time = 0;
  let lastTap = -Infinity;
  let trail: { t: number; x: number }[] = [];

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
    const chars = [...text];
    size = (c.h * n('letterSize')) / SHARED.PERCENT;
    const apply = () => {
      font = fontString({ size, weight: n('fontWeight') });
      setFont(g);
    };
    apply();
    const rowW = () => g.measureText(text).width + (chars.length - 1) * n('letterSpacing') * size;
    if (rowW() > c.w * n('rowFit')) {
      size *= (c.w * n('rowFit')) / rowW();
      apply();
    }
    const left = (c.w - rowW()) / 2;
    slots = [];
    let prefix = '';
    chars.forEach((ch, i) => {
      const x0 = g.measureText(prefix).width;
      prefix += ch;
      if (ch.trim() === '') return;
      slots.push({
        x: left + x0 + i * n('letterSpacing') * size + g.measureText(ch).width / 2,
        y: c.h * n('slotY'),
      });
    });
  }

  function build(): void {
    const text = String(p.text || ' ');
    const word = [...text].filter((ch) => ch.trim() !== '');
    const extras = Array.from(
      { length: n('extraLetters') },
      () => FIXED.ALPHABET[Math.floor(Math.random() * FIXED.ALPHABET.length)]!,
    );
    const m = size;
    magnets = [...word, ...extras].map((ch, i) => ({
      ch,
      slot: i < word.length ? i : -1,
      x: m + Math.random() * (c.w - 2 * m),
      y: m + Math.random() * (c.h - 2 * m),
      vx: 0,
      vy: 0,
      angle: (Math.random() - 0.5) * 2 * n('maxAngle'),
      ink: Math.floor(Math.random() * SHARED.INKS),
      locked: false,
    }));
  }

  function scatter(): void {
    const s = n('scatterSpeed');
    for (const mg of magnets) {
      mg.locked = false;
      mg.vx = (Math.random() - 0.5) * 2 * s;
      mg.vy = (Math.random() - 0.5) * 2 * s;
    }
    trail = [];
  }

  function shaken(): boolean {
    if (trail.length < 2) return false;
    let path = 0;
    let turns = 0;
    let lastDir = 0;
    for (let i = 1; i < trail.length; i++) {
      const dx = trail[i]!.x - trail[i - 1]!.x;
      path += Math.abs(dx);
      const dir = Math.sign(dx);
      if (dir !== 0 && lastDir !== 0 && dir !== lastDir) turns++;
      if (dir !== 0) lastDir = dir;
    }
    return path / (trail.length - 1) > n('shakeSpeed') && turns >= n('shakeTurns');
  }

  function drawMagnet(
    g: CanvasRenderingContext2D,
    mg: Magnet,
    x: number,
    y: number,
    a: number,
  ): void {
    const inks = [theme.c1, theme.c2, theme.c3];
    const off = n('shadowOffset') * size;
    g.save();
    g.translate(x, y);
    g.rotate(a);
    g.globalAlpha = n('shadowAlpha');
    g.fillStyle = theme.ink;
    g.fillText(mg.ch, off, off);
    g.globalAlpha = 1;
    g.fillStyle = inks[mg.ink]!;
    g.fillText(mg.ch, 0, 0);
    g.restore();
  }

  function draw(strays = Infinity): void {
    const g = c.ctx;
    c.clear();
    setFont(g);
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    let extras = 0;
    for (const locked of [false, true])
      for (const mg of magnets) {
        if (mg.locked !== locked) continue;
        if (mg.slot < 0 && extras++ >= strays) continue;
        drawMagnet(g, mg, mg.x, mg.y, mg.angle);
      }
  }

  return {
    resize() {
      c.fit();
      if (!fontsOk) return;
      layout();
      if (!magnets.length) build();
      const half = size / 2;
      for (const mg of magnets) {
        mg.x = Math.min(c.w - half, Math.max(half, mg.x));
        mg.y = Math.min(c.h - half, Math.max(half, mg.y));
      }
    },
    update(dt) {
      time += dt;
      ptr.sync();
      for (const _ of ptr.takeTaps()) {
        if (ptr.pointerType !== 'mouse' && time - lastTap < FIXED.DOUBLE_TAP) {
          scatter();
          lastTap = -Infinity;
        } else lastTap = time;
      }
      const mouse = ptr.pointerType === 'mouse';
      const pulling = mouse ? ptr.active : ptr.dragging;
      if (mouse && ptr.active && p.shakeToScatter) {
        trail.push({ t: time, x: ptr.x });
        trail = trail.filter((s) => time - s.t <= FIXED.SHAKE_WINDOW);
        if (shaken()) scatter();
      } else trail = [];
      const f = frameFactor(dt);
      const R = n('reach');
      const drag = n('friction') ** f;
      const half = size / 2;
      for (const mg of magnets) {
        if (mg.locked) {
          const slot = slots[mg.slot];
          if (!slot) continue;
          const k = Math.min(1, n('snapSpeed') * f);
          mg.x += (slot.x - mg.x) * k;
          mg.y += (slot.y - mg.y) * k;
          mg.angle += (0 - mg.angle) * Math.min(1, n('straighten') * f);
          continue;
        }
        if (pulling) {
          const dx = ptr.x - mg.x;
          const dy = ptr.y - mg.y;
          const d = Math.hypot(dx, dy);
          if (d < R && d > 0) {
            const a = n('pull') * (1 - d / R) * f;
            mg.vx += (dx / d) * a;
            mg.vy += (dy / d) * a;
          }
        }
        mg.vx *= drag;
        mg.vy *= drag;
        mg.x = Math.min(c.w - half, Math.max(half, mg.x + mg.vx * f));
        mg.y = Math.min(c.h - half, Math.max(half, mg.y + mg.vy * f));
        const slot = slots[mg.slot];
        if (slot && Math.hypot(slot.x - mg.x, slot.y - mg.y) < n('snap')) {
          mg.locked = true;
          mg.vx = 0;
          mg.vy = 0;
          ctx.sound.play('click');
        }
      }
      draw();
    },
    still() {
      ptr.takeTaps();
      const keep = magnets.map((mg) => ({ ...mg }));
      for (const mg of magnets) {
        const slot = slots[mg.slot];
        if (!slot) continue;
        mg.x = slot.x;
        mg.y = slot.y;
        mg.angle = 0;
        mg.locked = true;
      }
      draw(n('stillStrays'));
      magnets = keep;
    },
    setParams(next) {
      const rebuild = next.text !== p.text || next.extraLetters !== p.extraLetters;
      const relayout = params.some(
        (q) =>
          (q.group === 'Look' || q.phraseIn === 'text' || q.phraseIn === 'letterSize') &&
          next[q.id] !== p[q.id],
      );
      p = { ...next };
      if (!fontsOk || !c.w) return;
      if (relayout || rebuild) layout();
      if (rebuild) build();
    },
    setTheme(t) {
      theme = t;
    },
    restart() {
      build();
    },
    destroy() {
      ptr.destroy();
      c.destroy();
      magnets = [];
    },
  };
}

const scene: SceneModule = { meta, params, followUps, create };
export default scene;
