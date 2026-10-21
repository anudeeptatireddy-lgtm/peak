// `kinetic`: Kinetic poster (SCENES.md #12). A DOM grid driven by a beat clock;
// every move is a transform eased with the easing kit.

import { cursorLean } from '../../kits/cursor';
import { createPointer } from '../../engine/pointer';
import { backOut, cubicInOut, linear, type Ease } from '../../kits/easing';
import { SHARED } from '../shared';
import type { Params, SceneContext, SceneInstance, SceneModule } from '../types';
import { FIXED } from './constants';
import { meta } from './meta';
import { params } from './params';
import { followUps } from './prompt';

interface Tween {
  from: number;
  to: number;
  start: number;
}
interface Cell {
  el: HTMLDivElement;
  block: HTMLDivElement;
  word: HTMLSpanElement;
  ink: number;
  /** Where the cell currently sits (a grid slot index). */
  slot: number;
  x: Tween;
  y: Tween;
  angle: Tween;
  fill: Tween;
  scaleAt: number;
}

const GRIDS = FIXED.GRIDS;
const tween = (v: number): Tween => ({ from: v, to: v, start: -Infinity });

function create(host: HTMLElement, initial: Params, _ctx: SceneContext): SceneInstance {
  let p = { ...initial };
  // Follow cursor: the whole picture tilts toward the mouse (off by default).
  const lean = cursorLean(host);
  const n = (id: string) => Number(p[id]);
  const ptr = createPointer(host);

  const wrap = document.createElement('div');
  Object.assign(wrap.style, {
    position: 'absolute',
    inset: '0',
    display: 'grid',
    placeItems: 'center',
    pointerEvents: 'none',
    fontVariationSettings: 'normal',
  });
  const label = document.createElement('p');
  label.className = 'sr-only';
  const poster = document.createElement('div');
  poster.setAttribute('aria-hidden', 'true');
  poster.style.position = 'relative';
  wrap.append(label, poster);
  host.append(wrap);

  let cells: Cell[] = [];
  let grid: string = String(p.grid);
  let cols = 1;
  let rows = 1;
  let cw = 0;
  let ch = 0;
  let time = 0;
  let nextBeat = 0;
  let builtFor = '';

  const words = () =>
    [p.word1, p.word2, p.word3, p.word4]
      .map((s) => String(s).toUpperCase())
      .filter((s) => s.trim().length);
  const effective = () => (host.clientWidth < SHARED.SMALL_SCREEN ? 'stacked' : grid);
  const pattern = () =>
    FIXED.PATTERN.filter((m) => (m !== 'turn' || p.rotate) && (m !== 'block' || p.colorBlocks));
  const ease = (): Ease =>
    p.feel === 'soft' ? cubicInOut : p.feel === 'mechanical' ? linear : backOut;
  const beatLen = () => FIXED.MINUTE / n('tempo');
  const moveLen = () =>
    beatLen() * n('moveBeats') * (p.feel === 'mechanical' ? FIXED.MECHANICAL : 1);

  function value(tw: Tween, t: number): number {
    const q = Math.min(1, Math.max(0, (t - tw.start) / moveLen()));
    return tw.from + (tw.to - tw.from) * ease()(q);
  }
  function retarget(tw: Tween, to: number, t: number): void {
    tw.from = value(tw, t);
    tw.to = to;
    tw.start = t;
  }

  const slotX = (slot: number) => (slot % cols) * cw;
  const slotY = (slot: number) => Math.floor(slot / cols) * ch;

  function build(): void {
    const list = words().length ? words() : [' '];
    label.textContent = list.join(' ');
    const g = effective();
    builtFor = g;
    if (g === 'stacked') {
      cols = 1;
      rows = list.length;
    } else {
      cols = Number(g.split('x')[0]);
      rows = cols;
    }
    poster.replaceChildren();
    cells = Array.from({ length: cols * rows }, (_, i) => {
      const el = document.createElement('div');
      Object.assign(el.style, { position: 'absolute', left: '0', top: '0' });
      const block = document.createElement('div');
      Object.assign(block.style, {
        position: 'absolute',
        inset: '0',
        background: `var(--c${(i % SHARED.INKS) + 1})`,
        transform: 'scaleX(0)',
      });
      const word = document.createElement('span');
      Object.assign(word.style, {
        position: 'absolute',
        inset: '0',
        display: 'grid',
        placeItems: 'center',
        whiteSpace: 'nowrap',
        lineHeight: '1',
      });
      word.textContent = list[i % list.length]!;
      el.append(block, word);
      poster.append(el);
      return {
        el,
        block,
        word,
        ink: i % SHARED.INKS,
        slot: i,
        x: tween(0),
        y: tween(0),
        angle: tween(0),
        fill: tween(0),
        scaleAt: -Infinity,
      };
    });
    size();
  }

  function size(): void {
    const w = n('posterFit') * host.clientWidth;
    const h = w * n('posterAspect');
    Object.assign(poster.style, { width: `${w.toFixed(1)}px`, height: `${h.toFixed(1)}px` });
    cw = w / cols;
    ch = h / rows;
    for (const c of cells) {
      Object.assign(c.el.style, { width: `${cw.toFixed(1)}px`, height: `${ch.toFixed(1)}px` });
      Object.assign(c.word.style, {
        fontWeight: String(p.weight),
        fontStretch: `${p.width}%`,
        fontSize: `${SHARED.PERCENT}px`,
      });
      const natural = c.word.scrollWidth || 1;
      const fs = Math.min((SHARED.PERCENT * n('fill') * cw) / natural, n('fill') * ch);
      c.word.style.fontSize = `${fs.toFixed(2)}px`;
      c.x = tween(slotX(c.slot));
      c.y = tween(slotY(c.slot));
    }
  }

  function act(beat: number, t: number): void {
    const moves = pattern();
    const count = cells.length;
    if (!moves.length || !count) return;
    const move = moves[beat % moves.length]!;
    const cell = cells[(beat * FIXED.HOP) % count]!;
    if (move === 'scale') cell.scaleAt = t;
    else if (move === 'turn') retarget(cell.angle, cell.angle.to === 0 ? FIXED.QUARTER : 0, t);
    else if (move === 'block') retarget(cell.fill, 1 - cell.fill.to, t);
    else if (move === 'swap' && count > 1) {
      const other = cells.find((c) => c.slot === (cell.slot + 1 + (beat % (count - 1))) % count)!;
      const a = cell.slot;
      cell.slot = other.slot;
      other.slot = a;
      for (const c of [cell, other]) {
        retarget(c.x, slotX(c.slot), t);
        retarget(c.y, slotY(c.slot), t);
      }
    }
  }

  function render(t: number): void {
    for (const c of cells) {
      const fill = value(c.fill, t);
      const q = (t - c.scaleAt) / beatLen();
      const s = q >= 0 && q < 1 ? 1 + (n('scaleAmt') - 1) * Math.sin(Math.PI * q) : 1;
      c.el.style.transform = `translate(${value(c.x, t).toFixed(1)}px, ${value(c.y, t).toFixed(1)}px)`;
      // Sliding in grows from the left; sliding out shrinks toward the right.
      c.block.style.transformOrigin = c.fill.to >= c.fill.from ? 'left' : 'right';
      c.block.style.transform = `scaleX(${Math.max(0, fill).toFixed(3)})`;
      c.word.style.color = fill > 0.5 ? 'var(--ground)' : 'var(--ink)';
      c.word.style.transform = `rotate(${value(c.angle, t).toFixed(2)}deg) scale(${s.toFixed(3)})`;
    }
  }

  build();

  return {
    resize() {
      // Crossing the phone width switches between the chosen grid and the stack.
      if (effective() !== builtFor) build();
      else size();
    },
    update(dt) {
      lean.update(dt, !!p.cursor, Number(p.cursorLean));
      time += dt;
      ptr.sync();
      if (ptr.takeTaps().length) {
        grid = GRIDS[(GRIDS.indexOf(grid as (typeof GRIDS)[number]) + 1) % GRIDS.length]!;
        build();
      }
      while (nextBeat * beatLen() <= time) {
        act(nextBeat, nextBeat * beatLen());
        nextBeat++;
      }
      render(time);
    },
    still() {
      lean.reset();
      ptr.takeTaps();
      build();
      for (let b = 0; b < FIXED.STILL_BEATS; b++) act(b, 0);
      for (const c of cells) {
        for (const tw of [c.x, c.y, c.angle, c.fill]) tw.from = tw.to;
        c.scaleAt = -Infinity;
      }
      render(time);
    },
    setParams(next) {
      const rebuild =
        next.word1 !== p.word1 ||
        next.word2 !== p.word2 ||
        next.word3 !== p.word3 ||
        next.word4 !== p.word4 ||
        next.grid !== p.grid;
      p = { ...next };
      if (next.grid !== grid && rebuild) grid = String(p.grid);
      if (rebuild) build();
      else size();
    },
    setTheme() {
      /* colors come from CSS variables */
    },
    restart() {
      build();
      nextBeat = Math.ceil(time / beatLen());
    },
    destroy() {
      lean.destroy();
      ptr.destroy();
      wrap.remove();
      cells = [];
    },
  };
}

const scene: SceneModule = { meta, params, followUps, create };
export default scene;
