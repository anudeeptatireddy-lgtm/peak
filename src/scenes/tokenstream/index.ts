// `tokenstream`: Token Stream (SCENES.md #88). A sentence types in, splits into colored
// chunks like a language model's tokens, flies into a stack, is weighed while chips
// swap places, and the name's chunks dock into the finished name with an overshoot.
// One progress P (scroll, a sideways drag, or the idle player) drives five stages.

import { cursorSweep } from '../../kits/cursor';
import { createCanvas } from '../../engine/canvas';
import { fontsReady } from '../../engine/fonts';
import { innerScroller } from '../../engine/inner-scroll';
import { createPointer } from '../../engine/pointer';
import { addScrollSource } from '../../engine/scheduler';
import { createScrollSource } from '../../engine/scroll';
import { clamp01, cubicInOut, lerp } from '../../kits/easing';
import { seededRandom } from '../../kits/field';
import { applyFont } from '../../kits/text';
import { ensureContrast, mixOklab } from '../../theme/color';
import type { Theme } from '../../theme/worlds';
import { SHARED } from '../shared';
import type { Params, SceneContext, SceneInstance, SceneModule } from '../types';
import { FIXED } from './constants';
import { meta } from './meta';
import { params, SENTENCES } from './params';
import { followUps } from './prompt';

type Idle = 'up' | 'top' | 'down' | 'bottom';

interface Chunk {
  text: string;
  /** Index of its first character in the full sentence. */
  start: number;
  /** Which word it is part of (pieces of one word are linked). */
  word: number;
  /** Its index among the name's chunks, or −1. */
  nameIdx: number;
  /** Text widths at font size 1, in the sentence weight and the name weight. */
  w1: number;
  w1n: number;
  /** Left edge of its text at font size 1, in the sentence and in the name. */
  x1: number;
  /** Its sentence line, the left edge of its text within that line, and its index there. */
  row: number;
  rx1: number;
  k: number;
  x1n: number;
  /** Stack slot shown now (eased), and the wobble phase of its weight bar. */
  kx: number;
  ky: number;
  phase: number;
}

const WORD = /[\p{L}\p{N}']+|[^\p{L}\p{N}'\s]/gu;
const NAME_WORD = /\S+/gu;

/** Back-out easing with strength s: overshoots, then settles at 1. */
function backOut(t: number, s: number): number {
  const q = t - 1;
  return 1 + (s + 1) * q * q * q + s * q * q;
}

function create(host: HTMLElement, initial: Params, ctx: SceneContext): SceneInstance {
  let p = { ...initial };
  const n = (id: string) => Number(p[id]);
  let theme: Theme = ctx.theme;
  const c = createCanvas(host);
  const ptr = createPointer(host);
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
  let fontsOk = false;
  let stillShown = false;
  let lastScroll: number | null = null;

  let full = '';
  let chunks: Chunk[] = [];
  let names = 0;
  let links: [number, number][] = [];
  /** slotOf[i]: the stack slot chunk i is heading for. */
  let slotOf: number[] = [];
  let rand = seededRandom(FIXED.SEED);
  let sS = 1;
  let sK = 1;
  let sN = 1;
  /** The sentence's lines: first character, text, width at font size 1, chunk count. */
  let rows: { from: number; text: string; w1: number; n: number }[] = [];
  let nameW1 = 0;

  let chipInk: string[] = [];
  let textInk: string[] = [];
  let plainInk = '';

  let P = 1 / FIXED.STAGES;
  let quiet = 0;
  let idle: Idle = 'up';
  let held = 0;
  let swapClock = 0;
  let time = 0;

  function inks(): void {
    const acc = [theme.c1, theme.c2, theme.c3];
    chipInk = acc.map((a) => mixOklab(a, theme.ground, FIXED.CHIP_MIX));
    textInk = chipInk.map((bg) => ensureContrast(theme.ink, bg, FIXED.CONTRAST));
    plainInk = ensureContrast(theme.ink, theme.ground, FIXED.CONTRAST);
  }

  function split(text: string, re: RegExp, offset: number, word0: number, isName: boolean): void {
    const k = Math.max(1, Math.round(n('chunk')));
    let word = word0;
    for (const m of text.matchAll(re)) {
      const letters = Array.from(m[0]);
      let at = offset + (m.index ?? 0);
      for (let i = 0; i < letters.length; i += k) {
        const piece = letters.slice(i, i + k).join('');
        chunks.push({
          text: piece,
          start: at,
          word,
          nameIdx: isName ? names++ : -1,
          w1: 0,
          w1n: 0,
          x1: 0,
          x1n: 0,
          row: 0,
          rx1: 0,
          k: 0,
          kx: 0,
          ky: 0,
          phase: 0,
        });
        at += piece.length;
      }
      word++;
    }
  }

  function slot(j: number): { x: number; y: number } {
    const chipH = FIXED.CHIP_H * sK;
    const step = chipH * FIXED.STACK_STEP;
    const barRoom = chipH * (FIXED.BAR_GAP + FIXED.BAR_LEN);
    const cx = c.w * 0.5 - barRoom * 0.5;
    const cy = c.h * FIXED.STACK_Y;
    if (p.stack === 'grid') {
      const cols = Math.ceil(Math.sqrt(chunks.length));
      const rows = Math.ceil(chunks.length / cols);
      const colW = colUnit() * sK;
      const col = j % cols;
      const row = Math.floor(j / cols);
      return { x: cx + (col - (cols - 1) * 0.5) * colW, y: cy + (row - (rows - 1) * 0.5) * step };
    }
    return { x: cx, y: cy + (j - (chunks.length - 1) * 0.5) * step };
  }

  /** Extra room per docked chunk at font size 1: both paddings plus the seam. */
  function dockStep(): number {
    return FIXED.CHIP_PAD * 2 + FIXED.DOCK_GAP;
  }

  /** Width of one grid column at font size 1: the widest chip plus its bar. */
  function colUnit(): number {
    const widest = Math.max(...chunks.map((ch) => ch.w1));
    return widest + FIXED.CHIP_PAD * 2 + FIXED.CHIP_H * (FIXED.BAR_GAP + FIXED.BAR_LEN);
  }

  function layout(): void {
    inks();
    if (!fontsOk || !c.w) return;
    const name = String(p.text || ' ');
    const [pre = '', post = ''] = (SENTENCES[String(p.sentence)] ?? '').split('NAME');
    full = pre + name + post;
    chunks = [];
    names = 0;
    split(pre, WORD, 0, 0, false);
    const w0 = chunks.length ? chunks[chunks.length - 1]!.word + 1 : 0;
    split(name, NAME_WORD, pre.length, w0, true);
    const w1 = chunks.length ? chunks[chunks.length - 1]!.word + 1 : 0;
    split(post, WORD, pre.length + name.length, w1, false);

    // Measure at a big size and scale down: canvas text width grows in step with size.
    const g = c.ctx;
    const big = SHARED.PERCENT;
    applyFont(g, { size: big, weight: FIXED.SENTENCE_WEIGHT });
    const fullW1 = g.measureText(full).width / big;
    for (const ch of chunks) {
      ch.w1 = g.measureText(ch.text).width / big;
      ch.x1 = g.measureText(full.slice(0, ch.start)).width / big;
    }
    const count = chunks.length;
    const fit = (w1: number, m: number) =>
      Math.min(
        c.h * FIXED.SENTENCE_MAX,
        (c.w * FIXED.SENTENCE_FIT) / (w1 + (m - 1) * FIXED.SPLIT_GAP),
      );
    // Too small on one line: break before the word start nearest the middle.
    let cut = 0;
    if (fit(fullW1, count) < FIXED.WRAP_PX)
      chunks.forEach((ch, i) => {
        if (i === 0 || ch.word === chunks[i - 1]!.word) return;
        const best = cut ? Math.abs(chunks[cut]!.x1 - fullW1 * 0.5) : Infinity;
        if (Math.abs(ch.x1 - fullW1 * 0.5) < best) cut = i;
      });
    const starts = cut ? [0, cut] : [0];
    rows = starts.map((first, r) => {
      const last = r + 1 < starts.length ? starts[r + 1]! : count;
      const from = chunks[first]!.start;
      const to = last < count ? chunks[last]!.start : full.length;
      const text = full.slice(from, to).trim();
      for (let i = first; i < last; i++) {
        const ch = chunks[i]!;
        ch.row = r;
        ch.rx1 = ch.x1 - chunks[first]!.x1;
        ch.k = i - first;
      }
      return { from, text, w1: g.measureText(text).width / big, n: last - first };
    });
    applyFont(g, { size: big, weight: n('weight') });
    nameW1 = g.measureText(name).width / big;
    for (const ch of chunks) {
      if (ch.nameIdx < 0) continue;
      ch.w1n = g.measureText(ch.text).width / big;
      ch.x1n = g.measureText(name.slice(0, ch.start - pre.length)).width / big;
    }

    sS = Math.min(...rows.map((r) => fit(r.w1, r.n)));
    const step = FIXED.CHIP_H * FIXED.STACK_STEP;
    if (p.stack === 'grid') {
      const cols = Math.ceil(Math.sqrt(count));
      const rows = Math.ceil(count / cols);
      sK = Math.min(
        sS * FIXED.STACK_MAX,
        (c.h * FIXED.STACK_FIT) / (rows * step),
        (c.w * FIXED.SENTENCE_FIT) / (cols * colUnit()),
      );
    } else sK = Math.min(sS * FIXED.STACK_MAX, (c.h * FIXED.STACK_FIT) / (count * step));
    sN = Math.min(
      c.h * n('textHeight'),
      (c.w * n('fitWidth')) / (nameW1 + (names - 1) * dockStep() + FIXED.CHIP_PAD * 2),
    );

    rand = seededRandom(FIXED.SEED);
    slotOf = chunks.map((_, i) => i);
    chunks.forEach((ch, i) => {
      const s = slot(i);
      ch.kx = s.x;
      ch.ky = s.y;
      ch.phase = rand() * SHARED.TAU;
    });
    links = [];
    for (let i = 1; i < count; i++)
      if (chunks[i]!.word === chunks[i - 1]!.word) links.push([i - 1, i]);
    const nameAt = chunks.flatMap((ch, i) => (ch.nameIdx >= 0 ? [i] : []));
    for (let k = 0; k < n('lineCount') && count > 1 && nameAt.length; k++) {
      const a = nameAt[Math.floor(rand() * nameAt.length)]!;
      let b = Math.floor(rand() * (count - 1));
      if (b >= a) b++;
      links.push([a, b]);
    }
  }

  fontsReady().then(() => {
    fontsOk = true;
    layout();
    if (stillShown) still();
  });

  /** Local progress of item i of m within a stage at progress u, with the stagger. */
  function local(u: number, i: number, m: number): number {
    const s = n('stagger');
    const start = m > 1 ? (i / (m - 1)) * s : 0;
    return clamp01((u - start) / (1 - s));
  }

  function stages(): number[] {
    return Array.from({ length: FIXED.STAGES }, (_, k) => clamp01(P * FIXED.STAGES - k));
  }

  function settle(dt: number): void {
    const [, , uFly = 0, uWeigh = 0] = stages();
    if (uFly < 1) slotOf = chunks.map((_, i) => i);
    else if (uWeigh > 0 && uWeigh < 1 && chunks.length > 1) {
      swapClock += dt;
      while (swapClock >= n('shuffle')) {
        swapClock -= n('shuffle');
        const a = Math.floor(rand() * chunks.length);
        let b = Math.floor(rand() * (chunks.length - 1));
        if (b >= a) b++;
        [slotOf[a], slotOf[b]] = [slotOf[b]!, slotOf[a]!];
      }
    }
    const k = 1 - Math.exp((-dt * FIXED.SETTLE) / n('shuffle'));
    chunks.forEach((ch, i) => {
      const s = slot(slotOf[i]!);
      ch.kx += (s.x - ch.kx) * k;
      ch.ky += (s.y - ch.ky) * k;
    });
  }

  function draw(): void {
    const g = c.ctx;
    c.clear();
    if (!chunks.length) return;
    const [uType = 0, uSplit = 0, uFly = 0, uWeigh = 0, uDock = 0] = stages();
    const count = chunks.length;
    const rowY = (r: number) =>
      c.h * FIXED.SENTENCE_Y + (r - (rows.length - 1) * 0.5) * FIXED.CHIP_H * FIXED.STACK_STEP * sS;

    if (uSplit <= 0) {
      // Stage 1: plain text typing in.
      const typed = Math.round(uType * full.length);
      applyFont(g, { size: sS, weight: FIXED.SENTENCE_WEIGHT });
      g.textAlign = 'left';
      g.textBaseline = 'middle';
      g.fillStyle = plainInk;
      rows.forEach((row, r) => {
        const shown = row.text.slice(0, Math.max(0, typed - row.from));
        g.fillText(shown, c.w * 0.5 - row.w1 * sS * 0.5, rowY(r));
      });
      return;
    }

    const gap = FIXED.SPLIT_GAP * sS * uSplit;
    const left = rows.map((row) => c.w * 0.5 - (row.w1 * sS + (row.n - 1) * gap) * 0.5);
    const nameLeft = c.w * 0.5 - (nameW1 + (names - 1) * dockStep()) * sN * 0.5;
    const nameY = c.h * FIXED.NAME_Y;
    const sink = FIXED.SINK * FIXED.CHIP_H * sK;
    const swing = (ch: Chunk, i: number) => (slot(slotOf[i]!).y - ch.ky) * FIXED.SWAP_SIDE;

    // Where each chip is now: center, font size, text width, weight, opacity.
    const at = chunks.map((ch, i) => {
      let x = left[ch.row]! + ch.rx1 * sS + ch.k * gap + ch.w1 * sS * 0.5;
      let y = rowY(ch.row);
      let size = sS;
      let tw = ch.w1 * sS;
      let wt: number = FIXED.SENTENCE_WEIGHT;
      let alpha = 1;
      if (uFly > 0) {
        const e = cubicInOut(local(uFly, i, count));
        x = lerp(x, ch.kx + swing(ch, i), e);
        y = lerp(y, ch.ky, e);
        size = lerp(size, sK, e);
        tw = ch.w1 * size;
      }
      if (uDock > 0) {
        if (ch.nameIdx >= 0) {
          const e = backOut(local(uDock, ch.nameIdx, names), n('overshoot') * FIXED.BACK_SCALE);
          const nx = nameLeft + ch.x1n * sN + ch.nameIdx * dockStep() * sN + ch.w1n * sN * 0.5;
          x = lerp(x, nx, e);
          y = lerp(y, nameY, e);
          size = lerp(size, sN, e);
          tw = lerp(ch.w1 * sK, ch.w1n * sN, e);
          wt = lerp(wt, n('weight'), clamp01(e));
        } else {
          alpha = 1 - uDock;
          y += sink * cubicInOut(uDock);
        }
      }
      return { x, y, size, tw, wt, alpha };
    });

    // Link lines, behind the chips.
    if (n('lines') > 0) {
      const steady = new Path2D();
      const fading = new Path2D();
      for (const [a, b] of links) {
        const A = at[a]!;
        const B = at[b]!;
        const path = A.alpha < 1 || B.alpha < 1 ? fading : steady;
        const len = Math.hypot(B.x - A.x, B.y - A.y);
        path.moveTo(A.x, A.y);
        path.quadraticCurveTo((A.x + B.x) * 0.5, (A.y + B.y) * 0.5 - len * FIXED.ARC, B.x, B.y);
      }
      g.strokeStyle = theme.inkSoft;
      g.lineWidth = 1;
      g.globalAlpha = n('lines') * uSplit;
      g.stroke(steady);
      g.globalAlpha = n('lines') * uSplit * (1 - uDock);
      g.stroke(fading);
      g.globalAlpha = 1;
    }

    const colors = Math.max(1, Math.min(SHARED.INKS, n('chunkColors')));
    const rect = (path: Path2D, q: (typeof at)[number], dy: number) => {
      const h = FIXED.CHIP_H * q.size;
      const w = q.tw + FIXED.CHIP_PAD * q.size * 2;
      path.roundRect(q.x - w * 0.5, q.y - h * 0.5 + dy, w, h, h * FIXED.CHIP_ROUND);
    };
    // Steady chips (alpha 1) and fading ones, per color, so draws stay batched.
    for (const fadingPass of [false, true]) {
      const alpha = fadingPass ? 1 - uDock : 1;
      if (alpha <= 0) continue;
      const shadow = new Path2D();
      const fills = chipInk.map(() => new Path2D());
      at.forEach((q, i) => {
        if (q.alpha < 1 !== fadingPass) return;
        if (p.quality === 'high') rect(shadow, q, FIXED.SHADOW * FIXED.CHIP_H * q.size);
        rect(fills[i % colors]!, q, 0);
      });
      g.globalAlpha = alpha * uSplit;
      if (p.quality === 'high') {
        g.fillStyle = theme.line;
        g.fill(shadow);
      }
      fills.forEach((path, k) => {
        g.fillStyle = chipInk[k]!;
        g.fill(path);
      });
      g.globalAlpha = alpha;
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      at.forEach((q, i) => {
        if (q.alpha < 1 !== fadingPass) return;
        applyFont(g, { size: q.size, weight: Math.round(q.wt) });
        g.fillStyle = uSplit < 1 ? plainInk : textInk[i % colors]!;
        g.fillText(chunks[i]!.text, q.x, q.y);
      });
    }

    // Weight bars while the stack is weighed.
    const barA = Math.min(1, uWeigh * 2) * (1 - uDock);
    if (uFly >= 1 && barA > 0) {
      const bars = chipInk.map(() => new Path2D());
      at.forEach((q, i) => {
        const ch = chunks[i]!;
        const h = FIXED.CHIP_H * q.size;
        const target = ch.nameIdx >= 0 ? FIXED.WEIGHT_HIGH : FIXED.WEIGHT_LOW;
        const wobble = FIXED.WOBBLE * Math.sin(time * FIXED.WOBBLE_RATE * SHARED.TAU + ch.phase);
        const weight = clamp01(lerp(0.5, target, uWeigh) + wobble);
        const x0 = q.x + q.tw * 0.5 + FIXED.CHIP_PAD * q.size + FIXED.BAR_GAP * h;
        const t = FIXED.BAR_THICK * h;
        bars[i % colors]!.rect(x0, q.y - t * 0.5, weight * FIXED.BAR_LEN * h, t);
      });
      g.globalAlpha = barA;
      bars.forEach((path, k) => {
        g.fillStyle = chipInk[k]!;
        g.fill(path);
      });
      g.globalAlpha = 1;
    }
    g.globalAlpha = 1;
  }

  function still(): void {
    stillShown = true;
    ptr.takeTaps();
    P = 1;
    draw();
  }

  return {
    resize() {
      if (!c.fit()) return;
      layout();
    },
    update(dt) {
      stillShown = false;
      time += dt;
      ptr.sync();
      ptr.takeTaps();
      const pos = source.read();
      const scrolled = lastScroll === null ? 0 : pos - lastScroll;
      lastScroll = pos;
      let moved = scrolled / n('scrub');
      if (ptr.down) moved += (ptr.x - ptr.px) / n('scrub');
      if (moved) {
        P = clamp01(P + moved);
        quiet = held = 0;
        idle = moved > 0 ? 'up' : 'down';
      } else {
        quiet += dt;
        if (quiet >= n('idleWait')) {
          const rate = dt / n('idleTime');
          if (idle === 'up') {
            P = Math.min(1, P + rate);
            if (P >= 1) [idle, held] = ['top', 0];
          } else if (idle === 'down') {
            P = Math.max(0, P - rate);
            if (P <= 0) [idle, held] = ['bottom', 0];
          } else {
            held += dt;
            if (held >= n('idleHold')) idle = idle === 'top' ? 'down' : 'up';
          }
        }
      }
      settle(dt);
      draw();
    },
    still,
    setParams(next) {
      p = { ...next };
      layout();
      if (stillShown) still();
    },
    setTheme(th) {
      theme = th;
      inks();
      if (stillShown) still();
    },
    restart() {
      P = 1 / FIXED.STAGES;
      quiet = held = swapClock = 0;
      idle = 'up';
      layout();
    },
    destroy() {
      sweep.destroy();
      ptr.destroy();
      removeSource();
      inner?.el.remove();
      c.destroy();
      chunks = [];
    },
  };
}

const scene: SceneModule = { meta, params, followUps, create };
export default scene;
