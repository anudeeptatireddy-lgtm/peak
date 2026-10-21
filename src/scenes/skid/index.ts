// `skid`: Skidding headline (SCENES.md #6). Letters are laid out with the text
// kit; the skid follows easing-kit curves; scrolling drives peel-outs.

import { cursorSweep } from '../../kits/cursor';
import { createCanvas } from '../../engine/canvas';
import { fontsReady } from '../../engine/fonts';
import { innerScroller } from '../../engine/inner-scroll';
import { createPointer } from '../../engine/pointer';
import { addScrollSource } from '../../engine/scheduler';
import { createScrollSource } from '../../engine/scroll';
import { frameFactor } from '../../engine/time';
import { cubicInOut, quadOut } from '../../kits/easing';
import { fontString, letterBoxes } from '../../kits/text';
import type { Theme } from '../../theme/worlds';
import { SHARED } from '../shared';
import type { Params, SceneContext, SceneInstance, SceneModule } from '../types';
import { FIXED } from './constants';
import { meta } from './meta';
import { params } from './params';
import { followUps } from './prompt';

type Phase = 'wait' | 'drive' | 'skid' | 'settle' | 'parked' | 'leave' | 'gone';

interface Letter {
  ch: string;
  i: number;
  /** Parked center x and width. */
  cx: number;
  w: number;
  phase: Phase;
  /** When the current phase began (or, for wait/leave, when it starts). */
  start: number;
  off: number;
  v: number;
  skidFrom: number;
  skidTo: number;
  skidT: number;
  angle: number;
  sx: number;
  sy: number;
}
interface Mark {
  x0: number;
  x1: number;
  y: number;
  t: number;
}
interface Puff {
  x: number;
  y: number;
  t: number;
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

  const inner =
    host.dataset.innerScroll === 'true'
      ? innerScroller(host, {
          screens: FIXED.INNER_SCREENS,
          low: FIXED.RECENTER_LOW,
          high: FIXED.RECENTER_HIGH,
        })
      : null;
  // Follow cursor: a sideways mouse sweep counts as scrolling (off by default).
  const sweep = cursorSweep(host, inner ? inner.source : createScrollSource(), {
    on: () => !!p.cursor,
    px: () => Number(p.cursorSweep),
  });
  const source = sweep.source;
  const removeSource = addScrollSource(source);

  let letters: Letter[] = [];
  let marks: Mark[] = [];
  let puffs: Puff[] = [];
  let font = '';
  let baseline = 0;
  let time = 0;
  let out = false;

  function layout(): void {
    const g = c.ctx;
    const text = String(p.text || ' ');
    const chars = [...text];
    let size = Math.min(c.h * n('textHeight'), c.w * n('textWidth'));
    const setFont = () => {
      font = fontString({ size, weight: n('fontWeight') });
      g.font = font;
      try {
        g.fontStretch = String(p.letterWidth) as CanvasFontStretch;
      } catch {
        /* older browsers */
      }
    };
    setFont();
    const rowWidth = () =>
      g.measureText(text).width + (chars.length - 1) * n('letterSpacing') * size;
    const maxW = c.w * n('fitWidth');
    if (rowWidth() > maxW) {
      size *= maxW / rowWidth();
      setFont();
    }
    const left = (c.w - rowWidth()) / 2;
    const m = g.measureText(text);
    baseline = c.h * n('textY') + (m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2;
    const boxes = letterBoxes(g, text, left, baseline);
    const old = letters;
    letters = boxes.map((b) => {
      const w = g.measureText(b.ch).width;
      const prev = old[b.i];
      return {
        ch: b.ch,
        i: b.i,
        cx: b.x + b.i * n('letterSpacing') * size + w / 2,
        w,
        phase: prev?.phase ?? 'parked',
        start: prev?.start ?? 0,
        off: prev?.off ?? 0,
        v: prev?.v ?? 0,
        skidFrom: prev?.skidFrom ?? 0,
        skidTo: prev?.skidTo ?? 0,
        skidT: prev?.skidT ?? 1,
        angle: 0,
        sx: 1,
        sy: 1,
      };
    });
  }

  function entrance(t: number): void {
    out = false;
    for (const l of letters) {
      l.phase = 'wait';
      l.start = t + (l.i * n('stagger')) / FIXED.MS;
      l.angle = 0;
      l.sx = 1;
      l.sy = 1;
    }
  }

  function peelOut(t: number): void {
    out = true;
    const last = letters.length - 1;
    for (const l of letters) {
      if (l.phase === 'gone') continue;
      l.phase = 'leave';
      l.v = 0;
      l.start = t + ((last - l.i) * n('leaveStagger')) / FIXED.MS;
    }
  }

  function beginSkid(l: Letter, from: number): void {
    l.phase = 'skid';
    l.start = time;
    l.skidFrom = from;
    l.skidTo = n('overshoot') * l.w;
    l.skidT = (2 * (l.skidTo - from)) / (n('speed') * SHARED.FPS) || 1;
  }

  function puff(x: number, y: number, chance: number): void {
    if (Math.random() < chance) puffs.push({ x, y, t: time });
  }

  function step(l: Letter, f: number): void {
    const spread = n('tireSpread') * l.w;
    const before = l.cx + l.off;
    switch (l.phase) {
      case 'wait': {
        if (time < l.start) return;
        // Right edge one letter width past the left edge of the canvas.
        const from = -(l.cx + l.w / 2 + l.w);
        const brake = -n('brakeDist');
        if (from >= brake) beginSkid(l, from);
        else {
          l.phase = 'drive';
          l.off = from;
        }
        return;
      }
      case 'drive':
        l.off += n('speed') * f;
        if (l.off >= -n('brakeDist')) beginSkid(l, -n('brakeDist'));
        return;
      case 'skid': {
        const q = Math.min(1, (time - l.start) / l.skidT);
        l.off = l.skidFrom + (l.skidTo - l.skidFrom) * quadOut(q);
        const s = Math.sin(Math.PI * q);
        l.angle = n('tilt') * FIXED.DEG * s;
        l.sx = 1 - n('squash') * s;
        l.sy = 1 + n('squash') * s;
        const now = l.cx + l.off;
        marks.push({ x0: before - spread, x1: now - spread, y: baseline, t: time });
        marks.push({ x0: before + spread, x1: now + spread, y: baseline, t: time });
        puff(now - spread, baseline, n('smoke'));
        if (q >= 1) {
          l.phase = 'settle';
          l.start = time;
        }
        return;
      }
      case 'settle': {
        const q = Math.min(1, (time - l.start) / n('settleTime'));
        l.off = l.skidTo * (1 - cubicInOut(q));
        l.angle = 0;
        l.sx = 1;
        l.sy = 1;
        if (q >= 1) {
          l.phase = 'parked';
          l.off = 0;
        }
        return;
      }
      case 'leave': {
        if (time < l.start) return;
        l.v += n('peelAccel') * f;
        l.off += l.v * f;
        l.angle = (-n('tilt') * FIXED.DEG * Math.min(1, l.v / n('speed'))) / 2;
        l.sx = 1;
        l.sy = 1;
        puff(l.cx + l.off - spread, baseline, Math.min(1, n('smoke') * 2));
        if (l.cx + l.off - l.w / 2 > c.w) l.phase = 'gone';
        return;
      }
      default:
        return;
    }
  }

  function draw(shake: boolean, stillMarks: boolean): void {
    const g = c.ctx;
    c.clear();
    g.strokeStyle = theme.inkSoft;
    g.lineWidth = n('markWidth');
    g.lineCap = 'butt';
    const life = n('marks');
    for (const m of marks) {
      g.globalAlpha = n('markAlpha') * Math.max(0, 1 - (time - m.t) / life);
      g.beginPath();
      g.moveTo(m.x0, m.y);
      g.lineTo(m.x1, m.y);
      g.stroke();
    }
    if (stillMarks) {
      g.globalAlpha = n('stillMarks');
      g.beginPath();
      for (const l of letters) {
        const spread = n('tireSpread') * l.w;
        for (const side of [-1, 1]) {
          g.moveTo(l.cx + side * spread - n('brakeDist'), baseline);
          g.lineTo(l.cx + side * spread, baseline);
        }
      }
      g.stroke();
    }
    g.fillStyle = theme.inkSoft;
    const plife = n('smokeLife');
    for (const pf of puffs) {
      const a = Math.min(1, (time - pf.t) / plife);
      g.globalAlpha = n('smokeAlpha') * (1 - a);
      const r = n('smokeSize') * (1 + (n('smokeGrow') - 1) * a);
      g.beginPath();
      g.arc(pf.x, pf.y, r, 0, SHARED.TAU);
      g.fill();
    }
    g.globalAlpha = 1;
    g.fillStyle = theme.ink;
    g.font = font;
    try {
      g.fontStretch = String(p.letterWidth) as CanvasFontStretch;
    } catch {
      /* older browsers */
    }
    g.textAlign = 'center';
    g.textBaseline = 'alphabetic';
    for (const l of letters) {
      if (l.phase === 'gone' || l.phase === 'wait') continue;
      const dy =
        shake && (l.phase === 'parked' || (l.phase === 'leave' && time < l.start))
          ? n('shake') * Math.sin(time * n('shakeSpeed') + l.i * FIXED.SHAKE_PHASE)
          : 0;
      g.save();
      g.translate(l.cx + l.off, baseline + dy);
      g.rotate(l.angle);
      g.scale(l.sx, l.sy);
      g.fillText(l.ch, 0, 0);
      g.restore();
    }
  }

  return {
    resize() {
      c.fit();
      if (!fontsOk) {
        letters = [];
        return;
      }
      const first = letters.length === 0;
      layout();
      if (first) entrance(time);
    },
    update(dt) {
      time += dt;
      ptr.sync();
      if (ptr.takeTaps().length) entrance(time);
      const v = source.velocity.vel;
      const th = n('scrollThreshold');
      if (!out && v > th) peelOut(time);
      else if (out && v < -th) entrance(time);
      const f = frameFactor(dt);
      for (const l of letters) step(l, f);
      for (const pf of puffs) pf.y -= n('smokeRise') * f;
      marks = marks.filter((m) => time - m.t < n('marks'));
      puffs = puffs.filter((pf) => time - pf.t < n('smokeLife'));
      draw(true, false);
    },
    still() {
      ptr.takeTaps();
      const keep = letters.map((l) => ({ ...l }));
      for (const l of letters) {
        l.phase = 'parked';
        l.off = 0;
        l.angle = 0;
        l.sx = 1;
        l.sy = 1;
      }
      const keepMarks = marks;
      const keepPuffs = puffs;
      marks = [];
      puffs = [];
      draw(false, true);
      letters = keep;
      marks = keepMarks;
      puffs = keepPuffs;
    },
    setParams(next) {
      const relayout = params.some(
        (q) => (q.group === 'Look' || q.phraseIn === 'text') && next[q.id] !== p[q.id],
      );
      p = { ...next };
      if (relayout && fontsOk && c.w) layout();
    },
    setTheme(t) {
      theme = t;
    },
    restart() {
      entrance(time);
    },
    destroy() {
      sweep.destroy();
      removeSource();
      inner?.el.remove();
      ptr.destroy();
      c.destroy();
      letters = [];
      marks = [];
      puffs = [];
    },
  };
}

const scene: SceneModule = { meta, params, followUps, create };
export default scene;
