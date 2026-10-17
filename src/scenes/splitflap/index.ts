// `splitflap`: Split-flap board (SCENES.md #11). A DOM scene: each tile has a
// static top and bottom half plus two flaps that turn in 3D.

import { createPointer } from '../../engine/pointer';
import { quadIn, quadOut } from '../../kits/easing';
import { SHARED } from '../shared';
import type { Params, SceneContext, SceneInstance, SceneModule } from '../types';
import { FIXED } from './constants';
import { meta } from './meta';
import { params } from './params';
import { followUps } from './prompt';

interface Half {
  el: HTMLDivElement;
  glyph: HTMLSpanElement;
}
interface Tile {
  el: HTMLDivElement;
  top: Half;
  bottom: Half;
  flapTop: Half;
  flapBottom: Half;
  line: HTMLDivElement;
  /** Index of the character showing, and of the one it is flipping toward. */
  cur: number;
  target: number;
  /** When the current flip started (or, if not flipping, when the next may start). */
  flipAt: number;
  flipping: boolean;
}

const HALF = `${SHARED.PERCENT / 2}%`;

function create(host: HTMLElement, initial: Params, _ctx: SceneContext): SceneInstance {
  let p = { ...initial };
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
  const board = document.createElement('div');
  board.setAttribute('role', 'img');
  board.style.display = 'flex';
  wrap.append(board);
  host.append(wrap);

  let tiles: Tile[] = [];
  let seq = '';
  let messages: string[] = [];
  let msg = 0;
  let time = 0;
  let landedAt: number | null = null;

  const messagesOf = () =>
    [p.msg1, p.msg2, p.msg3, p.msg4]
      .map((s) => String(s).toUpperCase())
      .filter((s) => s.trim().length);

  function makeHalf(bottom: boolean, flap: boolean): Half {
    const el = document.createElement('div');
    Object.assign(el.style, {
      position: 'absolute',
      left: '0',
      right: '0',
      height: HALF,
      top: bottom ? HALF : '0',
      overflow: 'hidden',
      background: 'var(--surface)',
      backfaceVisibility: 'hidden',
      transformOrigin: bottom ? 'top' : 'bottom',
      borderRadius: 'inherit',
    });
    if (bottom) Object.assign(el.style, { borderTopLeftRadius: '0', borderTopRightRadius: '0' });
    else Object.assign(el.style, { borderBottomLeftRadius: '0', borderBottomRightRadius: '0' });
    if (flap) el.style.visibility = 'hidden';
    const glyph = document.createElement('span');
    Object.assign(glyph.style, {
      position: 'absolute',
      left: '0',
      right: '0',
      textAlign: 'center',
      top: bottom ? `-${SHARED.PERCENT}%` : '0',
      color: 'var(--ink)',
    });
    el.append(glyph);
    return { el, glyph };
  }

  function build(): void {
    messages = messagesOf();
    if (!messages.length) messages = [' '];
    const base = FIXED.CHARSETS[String(p.charset)] ?? FIXED.CHARSETS.alnum!;
    const extra = [...new Set(messages.join(''))].filter((ch) => !base.includes(ch)).join('');
    seq = base + extra;
    const cols = Math.max(...messages.map((m) => [...m].length));
    board.replaceChildren();
    tiles = Array.from({ length: cols }, () => {
      const el = document.createElement('div');
      el.style.position = 'relative';
      el.setAttribute('aria-hidden', 'true');
      const top = makeHalf(false, false);
      const bottom = makeHalf(true, false);
      const flapBottom = makeHalf(true, true);
      const flapTop = makeHalf(false, true);
      const line = document.createElement('div');
      Object.assign(line.style, {
        position: 'absolute',
        left: '0',
        right: '0',
        background: 'var(--ground)',
        zIndex: '2',
      });
      el.append(top.el, bottom.el, flapBottom.el, flapTop.el, line);
      board.append(el);
      const t: Tile = {
        el,
        top,
        bottom,
        flapTop,
        flapBottom,
        line,
        cur: 0,
        target: 0,
        flipAt: 0,
        flipping: false,
      };
      setChars(t, 0, 0);
      return t;
    });
    size();
  }

  function size(): void {
    const cols = tiles.length || 1;
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const gap = n('gap');
    const w = Math.min(
      n('tileMax') * rem,
      (n('boardFit') * host.clientWidth) / (cols + (cols - 1) * gap),
    );
    const h = w * n('tileRatio');
    board.style.gap = `${(w * gap).toFixed(2)}px`;
    for (const t of tiles) {
      Object.assign(t.el.style, {
        width: `${w.toFixed(2)}px`,
        height: `${h.toFixed(2)}px`,
        perspective: `${(h * n('perspective')).toFixed(1)}px`,
        borderRadius: `${(w * n('radius')).toFixed(2)}px`,
      });
      const lh = h * n('splitLine');
      Object.assign(t.line.style, {
        height: `${lh.toFixed(2)}px`,
        top: `${(h / 2 - lh / 2).toFixed(2)}px`,
      });
      for (const half of [t.top, t.bottom, t.flapTop, t.flapBottom])
        Object.assign(half.glyph.style, {
          height: `${h.toFixed(2)}px`,
          lineHeight: `${h.toFixed(2)}px`,
          fontSize: `${(h * n('fontScale')).toFixed(2)}px`,
          fontWeight: String(p.weight),
        });
    }
  }

  function setChars(t: Tile, from: number, to: number): void {
    t.top.glyph.textContent = seq[to]!;
    t.bottom.glyph.textContent = seq[from]!;
    t.flapTop.glyph.textContent = seq[from]!;
    t.flapBottom.glyph.textContent = seq[to]!;
  }

  function show(m: number, t: number): void {
    msg = m % messages.length;
    const text = messages[msg]!;
    const chars = [...text];
    const pad = Math.floor((tiles.length - chars.length) / 2);
    board.setAttribute('aria-label', text.trim());
    tiles.forEach((tile, i) => {
      const ch = chars[i - pad] ?? ' ';
      tile.target = Math.max(0, seq.indexOf(ch));
      tile.flipAt = Math.max(tile.flipAt, t + (i * n('stagger')) / FIXED.MS);
    });
    landedAt = null;
  }

  function render(t: Tile, q: number): void {
    const shade = n('shade');
    if (q < 0.5) {
      const k = quadIn(q * 2);
      t.flapTop.el.style.visibility = 'visible';
      t.flapTop.el.style.transform = `rotateX(${(-FIXED.QUARTER * k).toFixed(2)}deg)`;
      t.flapTop.el.style.filter = `brightness(${(1 - shade * k).toFixed(3)})`;
      t.flapBottom.el.style.visibility = 'hidden';
    } else {
      const k = quadOut((q - 0.5) * 2);
      t.flapTop.el.style.visibility = 'hidden';
      t.flapBottom.el.style.visibility = 'visible';
      t.flapBottom.el.style.transform = `rotateX(${(FIXED.QUARTER * (1 - k)).toFixed(2)}deg)`;
      t.flapBottom.el.style.filter = `brightness(${(1 - shade * (1 - k)).toFixed(3)})`;
    }
  }

  function rest(t: Tile): void {
    t.flapTop.el.style.visibility = 'hidden';
    t.flapBottom.el.style.visibility = 'hidden';
    setChars(t, t.cur, t.cur);
  }

  function step(t: number): void {
    const dur = n('flipSpeed') / FIXED.MS;
    let moving = false;
    for (const tile of tiles) {
      // Catch up on any flips that finished since the last frame.
      while (tile.cur !== tile.target && t >= tile.flipAt + (tile.flipping ? dur : 0)) {
        if (tile.flipping) {
          tile.cur = (tile.cur + 1) % seq.length;
          tile.flipAt += dur;
          tile.flipping = false;
        } else {
          tile.flipping = true;
          setChars(tile, tile.cur, (tile.cur + 1) % seq.length);
        }
      }
      if (tile.flipping) {
        render(tile, Math.min(1, (t - tile.flipAt) / dur));
        moving = true;
      } else {
        rest(tile);
        if (tile.cur !== tile.target) moving = true;
        else tile.flipAt = Math.max(tile.flipAt, t);
      }
    }
    if (!moving) {
      landedAt ??= t;
      if (t - landedAt >= n('hold')) show(msg + 1, t);
    }
  }

  build();
  show(0, 0);

  return {
    resize() {
      size();
    },
    update(dt) {
      time += dt;
      ptr.sync();
      if (ptr.takeTaps().length) show(msg + 1, time);
      step(time);
    },
    still() {
      ptr.takeTaps();
      const text = messages[0]!;
      const chars = [...text];
      const pad = Math.floor((tiles.length - chars.length) / 2);
      board.setAttribute('aria-label', text.trim());
      tiles.forEach((tile, i) => {
        const keep = tile.cur;
        tile.cur = Math.max(0, seq.indexOf(chars[i - pad] ?? ' '));
        rest(tile);
        tile.cur = keep;
      });
    },
    setParams(next) {
      const rebuild =
        next.msg1 !== p.msg1 ||
        next.msg2 !== p.msg2 ||
        next.msg3 !== p.msg3 ||
        next.msg4 !== p.msg4 ||
        next.charset !== p.charset;
      p = { ...next };
      if (rebuild) {
        build();
        show(0, time);
      } else size();
    },
    setTheme() {
      /* colors come from CSS variables */
    },
    restart() {
      for (const t of tiles) {
        t.cur = 0;
        t.flipping = false;
        t.flipAt = time;
      }
      show(0, time);
    },
    destroy() {
      ptr.destroy();
      wrap.remove();
      tiles = [];
    },
  };
}

const scene: SceneModule = { meta, params, followUps, create };
export default scene;
