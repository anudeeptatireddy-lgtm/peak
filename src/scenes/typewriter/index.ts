// `typewriter`: Typewriter (SCENES.md #10). A DOM scene: every character is
// built up front and hidden, and typing reveals them one key at a time.

import { createPointer } from '../../engine/pointer';
import { SHARED } from '../shared';
import type { Params, SceneContext, SceneInstance, SceneModule } from '../types';
import { FIXED } from './constants';
import { meta } from './meta';
import { params } from './params';
import { followUps } from './prompt';

type Phase = 'delay' | 'typing' | 'pause' | 'slam' | 'done';

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
    containerType: 'inline-size',
  });
  const block = document.createElement('div');
  block.style.whiteSpace = 'pre';
  const label = document.createElement('p');
  label.className = 'sr-only';
  const layer = document.createElement('div');
  layer.setAttribute('aria-hidden', 'true');
  block.append(label, layer);
  wrap.append(block);
  host.append(wrap);

  const cursor = document.createElement('span');
  Object.assign(cursor.style, {
    position: 'absolute',
    top: '0',
    left: `${SHARED.PERCENT}%`,
    width: `${FIXED.CURSOR_WIDTH}em`,
    height: '1em',
    background: 'var(--c1)',
  });

  let lines: HTMLSpanElement[][] = [];
  let chars: string[][] = [];
  let phase: Phase = 'delay';
  let line = 0;
  let col = 0;
  let nextAt = 0;
  let phaseAt = 0;
  let time = 0;

  function layout(): void {
    Object.assign(block.style, {
      fontSize: `clamp(${p.sizeMin}rem, ${p.size}cqw, ${p.sizeMax}rem)`,
      fontWeight: String(p.weight),
      fontStretch: `${p.width}%`,
      lineHeight: String(p.lineHeight),
      color: 'var(--ink)',
    });
  }

  function build(): void {
    const texts = [p.line1, p.line2, p.line3].map(String).filter((s) => s.length);
    label.textContent = texts.join(' ');
    layer.replaceChildren();
    chars = texts.map((text) => [...text]);
    lines = texts.map((text) => {
      const row = document.createElement('div');
      const spans = [...text].map((ch) => {
        const s = document.createElement('span');
        s.textContent = ch;
        Object.assign(s.style, {
          display: 'inline-block',
          position: 'relative',
          visibility: 'hidden',
        });
        row.append(s);
        return s;
      });
      layer.append(row);
      return spans;
    });
    layout();
  }

  function reset(t: number): void {
    lines.forEach((spans, i) =>
      spans.forEach((s, j) => {
        s.style.visibility = 'hidden';
        s.style.opacity = '';
        s.style.transform = '';
        s.replaceChildren(chars[i]![j]!);
      }),
    );
    phase = 'delay';
    line = 0;
    col = 0;
    nextAt = t + n('startDelay');
    block.style.transform = '';
    placeCursor();
  }

  /** Reveals one key with its ink, specks, and schedules the next key. */
  function land(s: HTMLSpanElement, ch: string, t: number): void {
    s.style.visibility = 'visible';
    if (ch.trim() !== '') {
      const ink = n('ink');
      const a = Math.random();
      const b = Math.random();
      const c = Math.random();
      s.style.opacity = String(1 - ink * n('inkFade') * a);
      s.style.transform = `rotate(${((b - 0.5) * 2 * ink * n('inkTilt')).toFixed(3)}deg) translateY(${((c - 0.5) * 2 * ink * n('inkShift')).toFixed(4)}em)`;
      if (Math.random() < n('splatter')) {
        const count = 1 + Math.floor(Math.random() * FIXED.MAX_DOTS);
        for (let i = 0; i < count; i++) {
          const x = Math.random();
          const y = Math.random();
          const z = Math.random();
          const dot = document.createElement('span');
          const size = (0.5 + z * 0.5) * n('dotSize');
          Object.assign(dot.style, {
            position: 'absolute',
            left: `${((x - 0.5) * n('dotSpread') + 0.5).toFixed(3)}em`,
            top: `${((y - 0.5) * n('dotSpread') + 0.5).toFixed(3)}em`,
            width: `${size.toFixed(3)}em`,
            height: `${size.toFixed(3)}em`,
            borderRadius: `${SHARED.PERCENT / 2}%`,
            background: 'var(--ink)',
            opacity: String(n('dotAlpha')),
          });
          s.append(dot);
        }
      }
    }
    nextAt = t + (1 / n('speed')) * (1 + n('jitter') * (Math.random() - 0.5) * 2);
  }

  function placeCursor(): void {
    const row = lines[line];
    const last = col > 0 ? row?.[col - 1] : undefined;
    if (last) {
      cursor.style.left = `${SHARED.PERCENT}%`;
      last.append(cursor);
    } else if (row?.[0]) {
      cursor.style.left = '0';
      row[0].append(cursor);
      cursor.style.visibility = 'visible';
    }
  }

  function advance(t: number): void {
    if (phase === 'delay' && t >= nextAt) {
      phase = 'typing';
    }
    while (phase === 'typing' && t >= nextAt) {
      const row = lines[line];
      if (!row) {
        phase = 'done';
        phaseAt = t;
        break;
      }
      land(row[col]!, chars[line]![col]!, t);
      col++;
      if (col >= row.length) {
        phase = line + 1 < lines.length ? 'pause' : 'done';
        phaseAt = t;
      }
    }
    if (phase === 'pause' && t - phaseAt >= n('returnPause')) {
      phase = 'slam';
      phaseAt = t;
    }
    if (phase === 'slam') {
      const age = t - phaseAt;
      if (age >= n('slamTime')) {
        block.style.transform = '';
        line++;
        col = 0;
        phase = 'typing';
        nextAt = t;
      } else {
        const x =
          n('slam') *
          n('slamShift') *
          Math.exp((-age * FIXED.SLAM_DECAY) / n('slamTime')) *
          Math.sin(age * n('slamFreq'));
        block.style.transform = `translateX(${x.toFixed(2)}px)`;
      }
    }
    if (phase === 'done' && p.loop && t - phaseAt >= n('loopPause')) reset(t);
    placeCursor();
    const blinking = phase === 'done';
    cursor.style.opacity = blinking && Math.floor(t / n('blink')) % 2 === 1 ? '0' : '1';
  }

  function typeAll(): void {
    while (phase !== 'done') {
      if (phase === 'delay' || phase === 'pause' || phase === 'slam') {
        if (phase === 'pause' || phase === 'slam') {
          line++;
          col = 0;
        }
        phase = 'typing';
      }
      const row = lines[line];
      if (!row) {
        phase = 'done';
        break;
      }
      land(row[col]!, chars[line]![col]!, time);
      col++;
      if (col >= row.length) phase = line + 1 < lines.length ? 'pause' : 'done';
    }
    block.style.transform = '';
    placeCursor();
    cursor.style.opacity = '1';
  }

  build();
  reset(0);

  return {
    resize() {
      /* CSS sizes everything */
    },
    update(dt) {
      time += dt;
      ptr.sync();
      if (ptr.takeTaps().length) reset(time);
      advance(time);
    },
    still() {
      ptr.takeTaps();
      typeAll();
    },
    setParams(next) {
      const rebuild = next.line1 !== p.line1 || next.line2 !== p.line2 || next.line3 !== p.line3;
      p = { ...next };
      if (rebuild) {
        build();
        reset(time);
      } else layout();
    },
    setTheme() {
      /* colors come from CSS variables */
    },
    restart() {
      reset(time);
    },
    destroy() {
      ptr.destroy();
      wrap.remove();
      lines = [];
    },
  };
}

const scene: SceneModule = { meta, params, followUps, create };
export default scene;
