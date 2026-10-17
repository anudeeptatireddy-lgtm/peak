// `countdown`: Event countdown (SCENES.md #46). A DOM scene with flip-clock digits (CSS 3D,
// driven by the animation clock) over a canvas for the celebration, which reuses the
// confetti scene's burst kit.

import { createCanvas, type CanvasHandle } from '../../engine/canvas';
import { frameFactor } from '../../engine/time';
import { Burst, type BurstOptions } from '../../kits/burst';
import { Batch } from '../../kits/render';
import type { Theme } from '../../theme/worlds';
import { SHARED } from '../shared';
import type { Params, SceneContext, SceneInstance, SceneModule } from '../types';
import { FIXED } from './constants';
import { meta } from './meta';
import { params } from './params';
import { followUps } from './prompt';

interface Card {
  el: HTMLDivElement;
  cur: string;
  prev: string;
  t0: number;
  render(c: Card, p: number): void;
}

const half = (top: boolean) => {
  const h = document.createElement('div');
  Object.assign(h.style, {
    position: 'absolute',
    left: '0',
    right: '0',
    [top ? 'top' : 'bottom']: '0',
    height: `${SHARED.PERCENT * 0.5}%`,
    overflow: 'hidden',
    background: 'var(--ink)',
    backfaceVisibility: 'hidden',
  });
  const s = document.createElement('span');
  Object.assign(s.style, {
    position: 'absolute',
    left: '0',
    right: '0',
    [top ? 'top' : 'bottom']: '0',
    height: `${SHARED.PERCENT * 2}%`,
    lineHeight: `${FIXED.CARD_H}em`,
    textAlign: 'center',
  });
  h.append(s);
  return { h, s };
};

function create(host: HTMLElement, initial: Params, ctx: SceneContext): SceneInstance {
  let p = { ...initial };
  const n = (id: string) => Number(p[id]);
  let theme: Theme = ctx.theme;
  // The confetti canvas only exists once there is something to celebrate.
  let c: CanvasHandle | null = null;
  const canvas = (): CanvasHandle => {
    if (!c) {
      c = createCanvas(host);
      c.fit();
    }
    return c;
  };
  const burst = new Burst();
  const batch = new Batch(SHARED.INKS);

  const wrap = document.createElement('div');
  Object.assign(wrap.style, {
    position: 'absolute',
    inset: '0',
    display: 'grid',
    placeItems: 'center',
    alignContent: 'center',
    gap: '1rem',
    padding: '1rem',
    pointerEvents: 'none',
    textAlign: 'center',
    fontVariationSettings: 'normal',
  });
  const eventEl = document.createElement('p');
  const row = document.createElement('div');
  const msg = document.createElement('p');
  const live = document.createElement('p');
  live.className = 'sr-only';
  live.setAttribute('aria-live', 'polite');
  Object.assign(eventEl.style, { margin: '0', color: 'var(--ink)' });
  Object.assign(msg.style, { margin: '0', color: 'var(--ink)', visibility: 'hidden' });
  Object.assign(row.style, { display: 'flex', flexWrap: 'wrap', justifyContent: 'center' });
  wrap.append(live, eventEl, row, msg);
  host.append(wrap);

  let cards: Card[] = [];
  let target =
    Date.now() + FIXED.DEFAULT_DAYS * FIXED.DAY * FIXED.HOUR * FIXED.MINUTE * FIXED.SECOND;
  let time = 0;
  let digitsKey = '';
  let wasRunning = false;
  let announced = -1;
  let done = false;

  const resolveTarget = () => {
    if (!p.inWeek) {
      const t = new Date(String(p.target)).getTime();
      if (!Number.isNaN(t)) target = t;
    }
  };

  function makeCard(style: string): Card {
    const el = document.createElement('div');
    Object.assign(el.style, {
      position: 'relative',
      width: `${FIXED.CARD_W}em`,
      height: `${FIXED.CARD_H}em`,
      borderRadius: `${FIXED.CARD_RADIUS}em`,
      color: 'var(--ground)',
      fontWeight: String(FIXED.DIGIT_WEIGHT),
      perspective: `${FIXED.PERSPECTIVE}em`,
    });
    if (style === 'flip') {
      const top = half(true);
      const bot = half(false);
      const front = half(true);
      const back = half(false);
      front.h.style.transformOrigin = 'center bottom';
      back.h.style.transformOrigin = 'center top';
      el.append(top.h, bot.h, front.h, back.h);
      return {
        el,
        cur: '',
        prev: '',
        t0: -Infinity,
        render(card, prog) {
          const flipping = prog < 1;
          top.s.textContent = card.cur;
          bot.s.textContent = flipping ? card.prev : card.cur;
          front.s.textContent = card.prev;
          back.s.textContent = card.cur;
          front.h.style.visibility = flipping && prog < 0.5 ? 'visible' : 'hidden';
          back.h.style.visibility = flipping && prog >= 0.5 ? 'visible' : 'hidden';
          front.h.style.transform = `rotateX(${-prog * 2 * FIXED.QUARTER}deg)`;
          back.h.style.transform = `rotateX(${(1 - prog) * 2 * FIXED.QUARTER}deg)`;
        },
      };
    }
    Object.assign(el.style, {
      overflow: style === 'slide' ? 'hidden' : 'visible',
      background: 'var(--ink)',
    });
    const mk = () => {
      const s = document.createElement('div');
      Object.assign(s.style, {
        position: 'absolute',
        inset: '0',
        lineHeight: `${FIXED.CARD_H}em`,
        textAlign: 'center',
        backfaceVisibility: 'hidden',
      });
      el.append(s);
      return s;
    };
    const oldEl = mk();
    const newEl = mk();
    return {
      el,
      cur: '',
      prev: '',
      t0: -Infinity,
      render(card, prog) {
        oldEl.textContent = card.prev;
        newEl.textContent = card.cur;
        oldEl.style.visibility = prog < 1 ? 'visible' : 'hidden';
        if (style === 'slide') {
          oldEl.style.transform = `translateY(${-prog * SHARED.PERCENT}%)`;
          newEl.style.transform = `translateY(${(1 - prog) * SHARED.PERCENT}%)`;
        } else {
          oldEl.style.transformOrigin = 'center bottom';
          newEl.style.transformOrigin = 'center top';
          oldEl.style.transform = `rotateX(${prog * FIXED.QUARTER}deg)`;
          newEl.style.transform = `rotateX(${-(1 - prog) * FIXED.QUARTER}deg)`;
          oldEl.style.opacity = String(1 - prog);
          newEl.style.opacity = String(prog);
        }
      },
    };
  }

  /** The digits of each unit for `ms` milliseconds left. */
  function split(ms: number): string[] {
    const s = Math.floor(ms / FIXED.SECOND);
    const d = Math.floor(s / (FIXED.DAY * FIXED.HOUR * FIXED.MINUTE));
    const parts = [
      String(d).padStart(FIXED.MIN_DAY_DIGITS, '0'),
      String(Math.floor(s / (FIXED.HOUR * FIXED.MINUTE)) % FIXED.DAY).padStart(2, '0'),
      String(Math.floor(s / FIXED.MINUTE) % FIXED.HOUR).padStart(2, '0'),
      String(s % FIXED.MINUTE).padStart(2, '0'),
    ];
    return parts;
  }

  function layout(): void {
    wrap.style.fontSize = `${n('digitSize')}rem`;
    Object.assign(eventEl.style, {
      fontSize: `${FIXED.EVENT_SIZE}em`,
      fontWeight: String(FIXED.DIGIT_WEIGHT),
    });
    eventEl.textContent = String(p.event);
    Object.assign(msg.style, {
      fontSize: `${FIXED.TIME_SIZE}em`,
      fontWeight: String(FIXED.DIGIT_WEIGHT),
    });
    msg.textContent = FIXED.TIME_TEXT;
    row.style.gap = `${n('gap')}rem`;
  }

  function build(parts: string[]): void {
    row.replaceChildren();
    cards = [];
    digitsKey = parts.map((x) => x.length).join();
    parts.forEach((digits, u) => {
      const unit = document.createElement('div');
      Object.assign(unit.style, {
        display: 'grid',
        justifyItems: 'center',
        gap: `${FIXED.LABEL_GAP}em`,
      });
      const pair = document.createElement('div');
      Object.assign(pair.style, { display: 'flex', gap: `${FIXED.PAIR_GAP}em` });
      for (const ch of digits) {
        const card = makeCard(String(p.style));
        card.cur = card.prev = ch;
        pair.append(card.el);
        cards.push(card);
        card.render(card, 1);
      }
      const label = document.createElement('div');
      Object.assign(label.style, {
        fontSize: `${FIXED.LABEL_SIZE}em`,
        color: 'var(--ink-soft)',
      });
      label.textContent = FIXED.LABELS[u]!;
      unit.append(pair, label);
      row.append(unit);
    });
  }

  function tick(animate: boolean): void {
    const ms = Math.max(0, target - Date.now());
    const parts = split(ms);
    if (parts.map((x) => x.length).join() !== digitsKey) build(parts);
    const chars = parts.join('');
    cards.forEach((card, i) => {
      const ch = chars[i]!;
      if (ch !== card.cur) {
        card.prev = card.cur;
        card.cur = ch;
        card.t0 = animate ? time : -Infinity;
      }
      card.render(card, animate ? clamp((time - card.t0) / n('flipTime')) : 1);
    });
    const running = ms > 0;
    done = !running;
    msg.style.visibility = done ? 'visible' : 'hidden';
    if (!running && wasRunning && animate && p.celebrate && !ctx.reducedMotion) celebrate();
    wasRunning = running;
    const minutes = Math.floor(ms / (FIXED.SECOND * FIXED.MINUTE));
    if (minutes !== announced) {
      announced = minutes;
      live.textContent = done
        ? `${p.event}: ${FIXED.TIME_TEXT}`
        : `${p.event}: ${Number(parts[0])} days, ${Number(parts[1])} hours, ${Number(parts[2])} minutes left`;
    }
  }

  const clamp = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

  const options = (): BurstOptions => ({
    count: FIXED.BURST.count * (ctx.quality === 'preview' ? SHARED.PREVIEW_SCALE : 1),
    direction: -Math.PI / 2,
    spread: FIXED.BURST.spread * FIXED.DEG,
    speed: FIXED.BURST.speed,
    speedRange: FIXED.BURST.speedRange,
    size: FIXED.BURST.size,
    spin: FIXED.BURST.spin,
    flutter: FIXED.BURST.flutter,
    shapes: ['square', 'ribbon', 'circle'],
  });
  function celebrate(): void {
    const cv = canvas();
    burst.fire(cv.w * 0.5, cv.h * FIXED.BURST_Y, options(), SHARED.INKS);
    ctx.sound.play('pop');
  }

  resolveTarget();
  layout();
  tick(false);

  return {
    resize() {
      c?.fit();
    },
    update(dt) {
      time += dt;
      tick(true);
      if (c && burst.pieces.length) {
        burst.step(
          frameFactor(dt),
          FIXED.BURST.gravity,
          FIXED.BURST.drag,
          FIXED.BURST.wobble,
          FIXED.BURST.flutter,
          c.h,
        );
        c.clear();
        c.ctx.globalCompositeOperation = theme.blend;
        burst.draw(
          c.ctx,
          batch,
          [theme.c1, theme.c2, theme.c3],
          ['square', 'ribbon', 'circle'],
          FIXED.BURST.ribbon,
        );
        c.ctx.globalCompositeOperation = 'source-over';
      }
    },
    still() {
      tick(false);
    },
    setParams(next) {
      const rebuild = next.style !== p.style;
      p = { ...next };
      resolveTarget();
      layout();
      if (rebuild) digitsKey = '';
      tick(false);
    },
    setTheme(t) {
      theme = t;
    },
    restart() {
      time = 0;
      burst.pieces = [];
      c?.clear();
      wasRunning = false;
      resolveTarget();
      tick(false);
    },
    destroy() {
      c?.destroy();
      wrap.remove();
      cards = [];
    },
  };
}

const scene: SceneModule = { meta, params, followUps, create };
export default scene;
