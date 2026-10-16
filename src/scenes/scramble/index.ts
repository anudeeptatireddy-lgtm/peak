// `scramble`: Decoding text (SCENES.md #4). A DOM scene: each character is a
// span that holds its real character invisibly (so widths never change) with the
// shown character laid on top.

import { ensureContrast } from '../../theme/color';
import type { Theme } from '../../theme/worlds';
import type { Params, SceneContext, SceneInstance, SceneModule } from '../types';
import { SHARED } from '../shared';
import { FIXED } from './constants';
import { meta } from './meta';
import { params } from './params';
import { followUps } from './prompt';

interface Letter {
  ch: string;
  shown: HTMLSpanElement;
  step: number;
}
interface Line {
  el: HTMLElement;
  letters: Letter[];
  /** Start time of the current decode, in scene seconds. */
  t0: number;
  index: number;
}

function create(host: HTMLElement, initial: Params, ctx: SceneContext): SceneInstance {
  let p = { ...initial };
  let theme: Theme = ctx.theme;
  let inks: string[] = [];
  let time = 0;
  let loopAt: number | null = null;
  const ac = new AbortController();

  const wrap = document.createElement('div');
  Object.assign(wrap.style, {
    position: 'absolute',
    inset: '0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
    // The site sets font-variation-settings on body; weight and width come from below.
    fontVariationSettings: 'normal',
    // Sizes follow the stage's width (cqw), which is the screen width in a full-screen section.
    containerType: 'inline-size',
  });
  host.append(wrap);

  let lines: Line[] = [];

  const charset = () => FIXED.CHARSETS[String(p.charset)] ?? FIXED.CHARSETS.symbols!;
  const endOf = (line: Line, j: number) =>
    line.t0 + Number(p.duration) + (j * Number(p.stagger)) / FIXED.MS;
  const doneAt = (line: Line) => endOf(line, Math.max(0, line.letters.length - 1));

  function pickInks(): void {
    inks = [theme.c1, theme.c2, theme.c3].map((c) =>
      ensureContrast(c, theme.ground, FIXED.ACCENT_CONTRAST),
    );
  }

  function build(): void {
    ac.signal.throwIfAborted();
    wrap.replaceChildren();
    const texts = [p.line1, p.line2, p.line3].map(String);
    lines = [];
    texts.forEach((text, index) => {
      if (!text) return;
      const el = document.createElement('p');
      const big = index === 0;
      Object.assign(el.style, {
        margin: '0',
        whiteSpace: 'pre',
        textAlign: 'center',
        pointerEvents: 'auto',
        fontFamily: 'Anybody, system-ui, sans-serif',
        lineHeight: String(p.lineHeight),
        color: big ? 'var(--ink)' : 'var(--ink-soft)',
      });
      const label = document.createElement('span');
      label.className = 'sr-only';
      label.textContent = text;
      const glyphs = document.createElement('span');
      glyphs.setAttribute('aria-hidden', 'true');
      el.append(label, glyphs);
      const line: Line = { el, letters: [], t0: lines.length * Number(p.lineDelay), index };
      for (const ch of text) {
        // Both layers share one grid cell: the hidden real character sets the width.
        const box = document.createElement('span');
        Object.assign(box.style, { display: 'inline-grid', justifyItems: 'center' });
        const real = document.createElement('span');
        real.textContent = ch;
        Object.assign(real.style, { visibility: 'hidden', gridArea: '1 / 1' });
        const shown = document.createElement('span');
        shown.style.gridArea = '1 / 1';
        box.append(real, shown);
        glyphs.append(box);
        line.letters.push({ ch, shown, step: -1 });
      }
      el.addEventListener(
        'pointerenter',
        () => {
          if (p.trigger === 'hover' && time >= doneAt(line)) start(line, time);
        },
        { signal: ac.signal },
      );
      wrap.append(el);
      lines.push(line);
    });
    layout();
  }

  function layout(): void {
    wrap.style.gap = `${p.gap}rem`;
    for (const line of lines) {
      const big = line.index === 0;
      Object.assign(line.el.style, {
        lineHeight: String(p.lineHeight),
        fontSize: big
          ? `clamp(${p.titleMin}rem, ${p.titleSize}cqw, ${p.titleMax}rem)`
          : `clamp(${p.lineMin}rem, ${p.lineSize}cqw, ${p.lineMax}rem)`,
        fontWeight: String(big ? p.titleWeight : p.lineWeight),
        fontStretch: `${big ? p.titleWidth : SHARED.PERCENT}%`,
      });
    }
  }

  function start(line: Line, t: number): void {
    line.t0 = t;
    for (const l of line.letters) l.step = -1;
  }

  function startAll(t: number): void {
    lines.forEach((line, i) => start(line, t + i * Number(p.lineDelay)));
    loopAt = null;
  }

  function render(t: number, live: boolean): void {
    const set = charset();
    const flick = Number(p.flicker);
    for (const line of lines) {
      line.letters.forEach((l, j) => {
        if (l.ch === ' ') {
          l.shown.textContent = ' ';
          return;
        }
        if (!live || t >= endOf(line, j)) {
          l.shown.textContent = l.ch;
          l.shown.style.color = '';
          return;
        }
        if (t < line.t0) {
          l.shown.textContent = '';
          return;
        }
        const step = Math.floor(((t - line.t0) * FIXED.MS) / flick);
        if (step !== l.step) {
          l.step = step;
          l.shown.textContent = set[Math.floor(Math.random() * set.length)]!;
        }
        l.shown.style.color = inks[(line.index + j) % SHARED.INKS]!;
      });
    }
  }

  pickInks();
  build();
  startAll(0);

  return {
    resize() {
      /* CSS sizes everything */
    },
    update(dt) {
      time += dt;
      if (p.trigger === 'loop' && lines.length && lines.every((l) => time >= doneAt(l))) {
        loopAt ??= time + Number(p.loopPause);
        if (time >= loopAt) startAll(time);
      }
      render(time, true);
    },
    still() {
      render(time, false);
    },
    setParams(next) {
      const rebuild =
        next.line1 !== p.line1 ||
        next.line2 !== p.line2 ||
        next.line3 !== p.line3 ||
        next.trigger !== p.trigger;
      p = { ...next };
      if (rebuild) {
        build();
        startAll(time);
      } else layout();
    },
    setTheme(t) {
      theme = t;
      pickInks();
    },
    restart() {
      startAll(time);
    },
    destroy() {
      ac.abort();
      wrap.remove();
      lines = [];
    },
  };
}

const scene: SceneModule = { meta, params, followUps, create };
export default scene;
