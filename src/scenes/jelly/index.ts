// `jelly`: Jelly cards (SCENES.md #49). Real buttons moved by springs: a drag moves the
// target and the card lags and leans; a tap squashes and tips it; both settle with damping.

import { createPointer } from '../../engine/pointer';
import { frameFactor } from '../../engine/time';
import type { Params, SceneContext, SceneInstance, SceneModule } from '../types';
import { SHARED } from '../shared';
import { FIXED } from './constants';
import { meta } from './meta';
import { params } from './params';
import { followUps } from './prompt';

interface Card {
  el: HTMLButtonElement;
  x: number;
  y: number;
  vx: number;
  vy: number;
  tx: number;
  ty: number;
  /** Rest position as shares of the stage, so a resize keeps the layout. */
  rx: number;
  ry: number;
  fan: number;
  squash: number;
  squashV: number;
  tip: number;
  tipV: number;
}

const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);

function parseLabels(text: string): string[] {
  const labels = text
    .split(',')
    .map((s) => s.trim().slice(0, FIXED.MAX_LABEL))
    .filter(Boolean)
    .slice(0, FIXED.MAX_CARDS);
  return labels.length ? labels : [FIXED.FALLBACK];
}

function create(host: HTMLElement, initial: Params, _ctx: SceneContext): SceneInstance {
  let p = { ...initial };
  const n = (id: string) => Number(p[id]);
  const ptr = createPointer(host);
  const ac = new AbortController();

  const wrap = document.createElement('div');
  Object.assign(wrap.style, {
    position: 'absolute',
    inset: '0',
    pointerEvents: 'none',
    overflow: 'hidden',
  });
  host.append(wrap);

  let cards: Card[] = [];
  let W = 0;
  let H = 0;
  let pressed: Card | null = null;
  let grab = { dx: 0, dy: 0, set: false };
  let start = { x: 0, y: 0 };
  let dragged = false;
  let fresh = true;

  const cardH = () => n('cardW') * n('cardRatio');

  function build(): void {
    wrap.replaceChildren();
    const labels = parseLabels(String(p.labels));
    const inks = ['var(--c1)', 'var(--c2)', 'var(--c3)'];
    cards = labels.map((text, i) => {
      const el = document.createElement('button');
      el.type = 'button';
      el.textContent = text;
      Object.assign(el.style, {
        position: 'absolute',
        left: '0',
        top: '0',
        pointerEvents: 'auto',
        touchAction: 'pan-y',
        cursor: 'grab',
        font: 'inherit',
        fontWeight: String(FIXED.WEIGHT),
        color: 'var(--ink)',
        background: 'var(--surface)',
        border: `${FIXED.BORDER}px solid ${inks[i % SHARED.INKS]}`,
        borderRadius: `${FIXED.RADIUS}px`,
        willChange: 'transform',
        userSelect: 'none',
      });
      const c: Card = {
        el,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        tx: 0,
        ty: 0,
        rx: 0.5,
        ry: 0.5,
        fan: (i - (labels.length - 1) / 2) * FIXED.FAN,
        squash: 0,
        squashV: 0,
        tip: 0,
        tipV: 0,
      };
      el.addEventListener(
        'pointerdown',
        () => {
          pressed = c;
          grab.set = false;
          dragged = false;
          start = { x: ptr.x, y: ptr.y };
        },
        { signal: ac.signal },
      );
      el.addEventListener('click', () => (dragged ? undefined : jiggle(c)), { signal: ac.signal });
      wrap.append(el);
      return c;
    });
    if (W) layout(true);
    else fresh = true;
    style();
  }

  function style(): void {
    for (const c of cards)
      Object.assign(c.el.style, { width: `${n('cardW')}px`, height: `${cardH()}px` });
  }

  /** Puts cards on their resting spots (or, on a resize, keeps them at their shares of the stage). */
  function layout(fresh: boolean): void {
    cards.forEach((c, i) => {
      if (fresh) {
        c.rx = 0.5 + ((i - (cards.length - 1) / 2) * FIXED.SPACING * n('cardW')) / (W || 1);
        c.ry = 0.5;
      }
      c.x = c.tx = c.rx * W;
      c.y = c.ty = c.ry * H;
    });
  }

  function jiggle(c: Card): void {
    c.squash = n('squish');
    c.squashV = 0;
    c.tip = (Math.random() < 0.5 ? -1 : 1) * FIXED.JIGGLE_TILT * n('wobble');
    c.tipV = 0;
  }

  function apply(): void {
    for (const c of cards) {
      const speed = Math.hypot(c.vx, c.vy);
      const lean = clamp(-c.vx * FIXED.LEAN_GAIN * n('wobble'), -FIXED.MAX_LEAN, FIXED.MAX_LEAN);
      const stretch = clamp(speed * FIXED.STRETCH_GAIN * n('wobble'), 0, FIXED.MAX_STRETCH);
      const sx = 1 + stretch + c.squash * FIXED.SPREAD;
      const sy = 1 - stretch * 0.5 - c.squash;
      c.el.style.transform = `translate(${(c.x - n('cardW') * 0.5).toFixed(2)}px, ${(c.y - cardH() * 0.5).toFixed(2)}px) rotate(${(c.fan + c.tip).toFixed(2)}deg) skewX(${lean.toFixed(2)}deg) scale(${sx.toFixed(3)}, ${sy.toFixed(3)})`;
    }
  }

  build();

  return {
    resize() {
      W = host.clientWidth;
      H = host.clientHeight;
      layout(fresh);
      fresh = false;
      apply();
    },
    update(dt) {
      const f = frameFactor(dt);
      ptr.sync();
      ptr.takeTaps();
      if (pressed) {
        if (!ptr.down) {
          pressed = null;
          grab.set = false;
        } else if (ptr.dragging) {
          if (!grab.set) grab = { dx: pressed.x - ptr.x, dy: pressed.y - ptr.y, set: true };
          pressed.tx = ptr.x + grab.dx;
          pressed.ty = ptr.y + grab.dy;
          pressed.rx = pressed.tx / (W || 1);
          pressed.ry = pressed.ty / (H || 1);
          pressed.fan = 0;
          if (Math.hypot(ptr.x - start.x, ptr.y - start.y) > FIXED.DRAG_SLOP) dragged = true;
        }
      }
      const damp = Math.pow(n('settle'), f);
      const k = n('stiffness') * f;
      for (const c of cards) {
        c.vx = (c.vx + (c.tx - c.x) * k) * damp;
        c.vy = (c.vy + (c.ty - c.y) * k) * damp;
        c.x += c.vx * f;
        c.y += c.vy * f;
        c.squashV = (c.squashV - c.squash * k) * damp;
        c.squash += c.squashV * f;
        c.tipV = (c.tipV - c.tip * k) * damp;
        c.tip += c.tipV * f;
      }
      apply();
    },
    still() {
      ptr.takeTaps();
      pressed = null;
      layout(true);
      cards.forEach((c, i) => {
        c.vx = c.vy = c.squash = c.squashV = c.tip = c.tipV = 0;
        c.fan = (i - (cards.length - 1) / 2) * FIXED.FAN;
      });
      apply();
    },
    setParams(next) {
      const rebuild = next.labels !== p.labels;
      p = { ...next };
      if (rebuild) build();
      else style();
      apply();
    },
    setTheme() {
      /* colors come from CSS variables */
    },
    restart() {
      pressed = null;
      cards.forEach((c, i) => {
        c.vx = c.vy = c.squash = c.squashV = c.tip = c.tipV = 0;
        c.fan = (i - (cards.length - 1) / 2) * FIXED.FAN;
      });
      layout(true);
      apply();
    },
    destroy() {
      ac.abort();
      ptr.destroy();
      wrap.remove();
      cards = [];
    },
  };
}

const scene: SceneModule = { meta, params, followUps, create };
export default scene;
