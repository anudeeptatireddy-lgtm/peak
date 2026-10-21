// `peekaboo`: Peekaboo (SCENES.md #86). Original animal heads drawn behind chunky
// letters; each springs between a peek spot and a hiding spot behind its letter, with
// squash and stretch, its own timing, and pupils that follow the cursor with a lag.

import { createCanvas } from '../../engine/canvas';
import { fontsReady } from '../../engine/fonts';
import { createPointer } from '../../engine/pointer';
import { ease, frameFactor } from '../../engine/time';
import { seededRandom } from '../../kits/field';
import { applyFont, letterBoxes, type LetterBox } from '../../kits/text';
import { ensureContrast, mixOklab } from '../../theme/color';
import type { Theme } from '../../theme/worlds';
import { SHARED } from '../shared';
import type { Params, SceneContext, SceneInstance, SceneModule } from '../types';
import { FIXED } from './constants';
import { meta } from './meta';
import { params } from './params';
import { followUps } from './prompt';

const clamp1 = (v: number) => (v < -1 ? -1 : v > 1 ? 1 : v);

interface OrientationApi {
  requestPermission?: () => Promise<string>;
}

interface Animal {
  letter: LetterBox;
  kind: number;
  r: number;
  /** Peek spots and the hiding spot. */
  top: [number, number];
  left: [number, number];
  right: [number, number];
  hide: [number, number];
  prefersTop: boolean;
  timing: number;
  stiff: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  hidden: boolean;
  away: number;
  side: 'top' | 'left' | 'right';
  lx: number;
  ly: number;
}

function create(host: HTMLElement, initial: Params, ctx: SceneContext): SceneInstance {
  let p = { ...initial };
  const n = (id: string) => Number(p[id]);
  let theme: Theme = ctx.theme;
  const c = createCanvas(host);
  const ptr = createPointer(host);
  const ac = new AbortController();
  let fontsOk = false;
  let stillShown = false;

  let boxes: LetterBox[] = [];
  let size = 0;
  let animals: Animal[] = [];
  let fur: string[] = [];
  let letterInks: string[] = [];
  let quiet = 0;
  let time = 0;
  let tap: { x: number; y: number; left: number } | null = null;
  let gyroOn = false;
  let gyroU = 0;
  let gyroV = 0;
  let button: HTMLButtonElement | undefined;

  function inks(): void {
    const acc = [theme.c1, theme.c2, theme.c3];
    letterInks = acc.map((a) => ensureContrast(a, theme.ground, FIXED.CONTRAST));
    fur = acc.map((_, k) => mixOklab(theme.inkSoft, acc[(k + 1) % SHARED.INKS]!, n('variety')));
  }

  function font(): void {
    applyFont(c.ctx, { size, weight: n('weight') });
  }

  function layout(): void {
    inks();
    if (!fontsOk || !c.w) return;
    const text = String(p.text || ' ');
    size = c.h * n('textHeight');
    font();
    const wide = c.ctx.measureText(text).width;
    if (wide > c.w * n('fitWidth')) size *= (c.w * n('fitWidth')) / wide;
    font();
    boxes = letterBoxes(c.ctx, text, c.w * 0.5, c.h * FIXED.BASELINE, 'center');
    const solid = boxes.filter((b) => b.ch.trim());
    const small = c.w < SHARED.SMALL_SCREEN;
    const count = solid.length ? (small ? n('animalsSmall') : n('animals')) : 0;
    const rand = seededRandom(FIXED.SEED);
    const per = new Map<number, number>();
    const slots = Array.from({ length: count }, (_, k) => Math.floor((k * solid.length) / count));
    slots.forEach((li) => per.set(li, (per.get(li) ?? 0) + 1));
    const seen = new Map<number, number>();
    animals = slots.map((li, k) => {
      const b = solid[li]!;
      const share = per.get(li)!;
      const nth = seen.get(li) ?? 0;
      seen.set(li, nth + 1);
      const tall = b.ascent || size * FIXED.CAP;
      const r = Math.min(n('animalSize') * size, FIXED.HIDE_FIT * Math.min(b.w / share, tall));
      const cx = b.x + (b.w * (nth + 0.5)) / share;
      const top = b.y - tall;
      const mid = b.y - tall * 0.5;
      const prefersTop = rand() < FIXED.TOP_SHARE;
      const a: Animal = {
        letter: b,
        kind: k % SHARED.INKS,
        r,
        top: [cx, top - r * FIXED.PEEK_TOP],
        left: [b.x - r * FIXED.PEEK_SIDE, mid],
        right: [b.x + b.w + r * FIXED.PEEK_SIDE, mid],
        hide: [cx, mid],
        prefersTop,
        timing: 1 + (rand() * 2 - 1) * FIXED.TIMING_SPREAD,
        stiff: 1 + (rand() * 2 - 1) * FIXED.STIFF_SPREAD,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        hidden: false,
        away: 0,
        side: prefersTop ? 'top' : rand() < 0.5 ? 'left' : 'right',
        lx: 0,
        ly: 0,
      };
      [a.x, a.y] = spot(a);
      return a;
    });
  }

  function spot(a: Animal): [number, number] {
    return a.hidden ? a.hide : a[a.side];
  }

  fontsReady().then(() => {
    fontsOk = true;
    layout();
    if (stillShown) still();
  });

  function draw(): void {
    const g = c.ctx;
    c.clear();
    if (!boxes.length) return;
    const heads = fur.map(() => new Path2D());
    const whites = new Path2D();
    const pupils = new Path2D();
    const noses = new Path2D();
    const cheeks = new Path2D();
    const high = p.quality === 'high';
    for (const a of animals) {
      const sq = Math.max(
        -FIXED.SQUASH_MAX,
        Math.min(FIXED.SQUASH_MAX, a.vy * FIXED.SQUASH_GAIN * n('squash')),
      );
      const rx = a.r * (1 + sq);
      const ry = a.r * (1 - sq);
      const path = heads[a.kind]!;
      path.moveTo(a.x + rx, a.y);
      path.ellipse(a.x, a.y, rx, ry, 0, 0, SHARED.TAU);
      const ear = a.r * FIXED.EAR;
      for (const s of [-1, 1]) {
        const ex = a.x + s * FIXED.EAR_GAP * rx;
        const ey = a.y - FIXED.EAR_Y * ry;
        if (a.kind === 0) {
          path.moveTo(ex + ear, ey);
          path.arc(ex, ey, ear, 0, SHARED.TAU);
        } else if (a.kind === 1) {
          path.moveTo(ex - ear, ey + ear * 0.5);
          path.lineTo(ex + s * ear * 0.5, ey - ear * 2);
          path.lineTo(ex + ear, ey + ear * 0.5);
          path.closePath();
        } else {
          const ly = a.y - FIXED.EAR_LONG * ry;
          path.moveTo(ex + ear * 0.5, ly);
          path.ellipse(ex, ly, ear * 0.5, ear * 2, 0, 0, SHARED.TAU);
        }
      }
      const er = a.r * FIXED.EYE_R;
      const pr = er * FIXED.PUPIL;
      for (const s of [-1, 1]) {
        const ex = a.x + s * FIXED.EYE_GAP * rx;
        const ey = a.y + FIXED.EYE_Y * ry;
        whites.moveTo(ex + er, ey);
        whites.arc(ex, ey, er, 0, SHARED.TAU);
        const px = ex + a.lx * er * FIXED.PUPIL_TRAVEL;
        const py = ey + a.ly * er * FIXED.PUPIL_TRAVEL;
        pupils.moveTo(px + pr, py);
        pupils.arc(px, py, pr, 0, SHARED.TAU);
        if (high) {
          const cx = a.x + s * FIXED.CHEEK_X * rx;
          const cy = a.y + FIXED.CHEEK_Y * ry;
          cheeks.moveTo(cx + a.r * FIXED.CHEEK, cy);
          cheeks.arc(cx, cy, a.r * FIXED.CHEEK, 0, SHARED.TAU);
        }
      }
      if (high) {
        const ny = a.y + FIXED.NOSE_Y * ry;
        noses.moveTo(a.x + a.r * FIXED.NOSE, ny);
        noses.arc(a.x, ny, a.r * FIXED.NOSE, 0, SHARED.TAU);
      }
    }
    heads.forEach((path, k) => {
      g.fillStyle = fur[k]!;
      g.fill(path);
    });
    g.fillStyle = theme.surface;
    g.fill(whites);
    g.fillStyle = theme.ink;
    g.fill(pupils);
    if (high) {
      g.fill(noses);
      g.globalAlpha = FIXED.CHEEK_ALPHA;
      g.fillStyle = theme.c2;
      g.fill(cheeks);
      g.globalAlpha = 1;
    }
    // The letters, drawn last, hide whatever is behind them.
    font();
    g.textAlign = 'left';
    g.textBaseline = 'alphabetic';
    boxes.forEach((b, i) => {
      g.fillStyle = letterInks[i % SHARED.INKS]!;
      g.fillText(b.ch, b.x, b.y);
    });
  }

  function near(a: Animal, x: number, y: number): boolean {
    const b = a.letter;
    const dx = Math.max(b.x - x, 0, x - (b.x + b.w));
    const dy = Math.max(b.y - (b.ascent || size * FIXED.CAP) - y, 0, y - b.y);
    const [sx, sy] = a[a.side];
    const d = Math.min(Math.hypot(dx, dy), Math.hypot(x - sx, y - sy));
    return d < n('shyness');
  }

  function onOrient(e: DeviceOrientationEvent): void {
    gyroU = clamp1((e.gamma ?? 0) / FIXED.GYRO_RANGE);
    gyroV = clamp1(((e.beta ?? 0) - FIXED.GYRO_REST) / FIXED.GYRO_RANGE);
  }

  async function enableMotion(): Promise<void> {
    const api = DeviceOrientationEvent as unknown as OrientationApi;
    if (typeof api.requestPermission === 'function') {
      try {
        if ((await api.requestPermission()) !== 'granted') return;
      } catch {
        return;
      }
    }
    if (ac.signal.aborted) return;
    window.addEventListener('deviceorientation', onOrient, { signal: ac.signal });
    gyroOn = true;
    syncButton();
  }

  function syncButton(): void {
    const wanted =
      !!p.gyro &&
      typeof DeviceOrientationEvent !== 'undefined' &&
      (typeof (DeviceOrientationEvent as unknown as OrientationApi).requestPermission ===
        'function' ||
        window.matchMedia('(pointer: coarse)').matches);
    if (!wanted) {
      button?.remove();
      button = undefined;
      return;
    }
    if (!button) {
      button = document.createElement('button');
      button.type = 'button';
      Object.assign(button.style, {
        position: 'absolute',
        bottom: `${FIXED.BUTTON_BOTTOM}rem`,
        left: `${SHARED.PERCENT * 0.5}%`,
        transform: `translateX(-${SHARED.PERCENT * 0.5}%)`,
        pointerEvents: 'auto',
        minHeight: `${FIXED.BUTTON_HEIGHT}rem`,
        padding: `0 ${FIXED.BUTTON_PAD}rem`,
        border: '1px solid var(--line)',
        borderRadius: `${FIXED.PILL}px`,
        background: 'var(--surface)',
        color: 'var(--ink)',
        font: 'inherit',
      });
      button.addEventListener('click', () => void enableMotion(), { signal: ac.signal });
      host.append(button);
    }
    button.textContent = gyroOn ? 'Motion is on' : 'Use motion';
    button.disabled = gyroOn;
  }
  syncButton();

  function still(): void {
    stillShown = true;
    ptr.takeTaps();
    for (const a of animals) {
      a.hidden = false;
      [a.x, a.y] = spot(a);
      a.vx = a.vy = a.lx = a.ly = 0;
    }
    draw();
  }

  return {
    resize() {
      if (!c.fit()) return;
      layout();
    },
    update(dt) {
      stillShown = false;
      const f = frameFactor(dt);
      time += dt;
      ptr.sync();
      for (const t of ptr.takeTaps())
        if (ptr.pointerType !== 'mouse') tap = { x: t.x, y: t.y, left: FIXED.TAP_HOLD };
      if (tap && (tap.left -= dt) <= 0) tap = null;
      // Where the "visitor" is: the mouse, a recent tap, or the idle wanderer.
      let cur: [number, number] | null = null;
      if (ptr.active && ptr.pointerType === 'mouse') {
        cur = [ptr.x, ptr.y];
        quiet = 0;
      } else if (tap) {
        cur = [tap.x, tap.y];
        quiet = 0;
      } else {
        quiet += dt;
        if (quiet >= n('idleWait')) {
          const a = (SHARED.TAU * time) / FIXED.IDLE_PERIOD;
          cur = [
            c.w * (0.5 + FIXED.IDLE_REACH * Math.sin(a)),
            c.h * (0.5 + FIXED.IDLE_REACH * Math.sin(FIXED.IDLE_RATIO * a)),
          ];
        }
      }
      const damp = (FIXED.DAMP_MIN + n('bounce') * FIXED.DAMP_RANGE) ** f;
      const k = ease(n('eyeLag'), f);
      for (const a of animals) {
        if (cur && near(a, cur[0], cur[1])) {
          a.hidden = true;
          a.away = 0;
        } else {
          a.away += dt;
          if (a.hidden && a.away >= n('peekDelay') * a.timing) {
            a.hidden = false;
            if (!a.prefersTop && cur) a.side = cur[0] < a.hide[0] ? 'right' : 'left';
          }
        }
        const [tx, ty] = spot(a);
        const s = n('stiffness') * a.stiff;
        a.vx = (a.vx + (tx - a.x) * s * f) * damp;
        a.vy = (a.vy + (ty - a.y) * s * f) * damp;
        a.x += a.vx * f;
        a.y += a.vy * f;
        // Pupils look toward the visitor (or the phone's tilt) with a lag.
        let lx = 0;
        let ly = 0;
        if (gyroOn && !cur) [lx, ly] = [gyroU, gyroV];
        else if (cur) {
          const d = Math.hypot(cur[0] - a.x, cur[1] - a.y) || 1;
          [lx, ly] = [(cur[0] - a.x) / d, (cur[1] - a.y) / d];
        }
        a.lx += (lx - a.lx) * k;
        a.ly += (ly - a.ly) * k;
      }
      draw();
    },
    still,
    setParams(next) {
      p = { ...next };
      layout();
      syncButton();
      if (stillShown) still();
    },
    setTheme(th) {
      theme = th;
      inks();
      if (stillShown) still();
    },
    restart() {
      quiet = time = 0;
      tap = null;
      for (const a of animals) {
        a.hidden = false;
        [a.x, a.y] = spot(a);
        a.vx = a.vy = 0;
      }
    },
    destroy() {
      ac.abort();
      ptr.destroy();
      button?.remove();
      button = undefined;
      c.destroy();
      animals = [];
    },
  };
}

const scene: SceneModule = { meta, params, followUps, create };
export default scene;
