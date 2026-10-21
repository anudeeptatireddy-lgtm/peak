// `clockwork`: Clockwork (SCENES.md #66). A seeded zigzag chain of meshing gears behind
// the name; each gear's angle follows its neighbor's exactly (gear-train rule). The
// cursor winds a mainspring, an escapement ticks gear 0 one tooth at a time, and each
// tick swings the letters further into place around their nearest gear.

import { createCanvas } from '../../engine/canvas';
import { fontsReady } from '../../engine/fonts';
import { createPointer } from '../../engine/pointer';
import { ease, frameFactor } from '../../engine/time';
import { smoothstep } from '../../kits/easing';
import { seededRandom } from '../../kits/field';
import { applyFont, letterBoxes, offscreen } from '../../kits/text';
import { mixOklab } from '../../theme/color';
import type { Theme } from '../../theme/worlds';
import { SHARED } from '../shared';
import type { Params, SceneContext, SceneInstance, SceneModule } from '../types';
import { FIXED } from './constants';
import { meta } from './meta';
import { params } from './params';
import { followUps } from './prompt';

const DEG = Math.PI / FIXED.HALF_TURN;

interface Gear {
  x: number;
  y: number;
  r: number;
  teeth: number;
  /** Direction from the previous gear (radians). */
  phi: number;
  /** Exact meshed angle, and the drawn wobble spring. */
  a: number;
  wob: number;
  wv: number;
}

interface Glyph {
  ch: string;
  x: number;
  y: number;
  /** Center of the gear it swings around, and how far it hangs turned when unbuilt. */
  px: number;
  py: number;
  scatter: number;
}

function create(host: HTMLElement, initial: Params, ctx: SceneContext): SceneInstance {
  let p = { ...initial };
  const n = (id: string) => Number(p[id]);
  let theme: Theme = ctx.theme;
  const c = createCanvas(host);
  const ptr = createPointer(host);
  let fontsOk = false;
  let stillShown = false;

  let gears: Gear[] = [];
  let glyphs: Glyph[] = [];
  let module = 1;
  let fontSize = 0;
  let inks: string[] = [];

  let energy = 0;
  let drive = 0;
  let driveTarget = 0;
  let ticks = 0;
  let sinceTick = 0;
  let rock = 0;
  let build = 0;
  let shown = 0;
  let held = 0;
  let unwinding = false;
  let quiet = 0;

  function colors(): void {
    const acc = [theme.c1, theme.c2, theme.c3];
    inks = acc.map((a) => mixOklab(theme.inkSoft, a, n('gearColor')));
  }

  function layout(): void {
    colors();
    if (!c.w) return;
    const small = c.w < SHARED.SMALL_SCREEN;
    const count = Math.max(2, small ? n('gearsSmall') : n('gears'));
    const rand = seededRandom(FIXED.SEED);
    const text = String(p.text || ' ');
    // Measure the name (fallback font until the web font has loaded).
    const probe = offscreen(1, 1);
    fontSize = c.h * n('textHeight');
    applyFont(probe.ctx, { size: fontSize, weight: n('weight') });
    const wide = probe.ctx.measureText(text).width;
    if (wide > c.w * n('fitWidth')) fontSize *= (c.w * n('fitWidth')) / wide;
    applyFont(probe.ctx, { size: fontSize, weight: n('weight') });
    const nameW = probe.ctx.measureText(text).width;
    const boxes = letterBoxes(probe.ctx, text, c.w * 0.5, c.h * 0.5, 'center');
    probe.free();
    // Chain in module units, then scale and center.
    const chain: Gear[] = [];
    for (let k = 0; k < count; k++) {
      const teeth = Math.max(
        FIXED.MIN_TEETH,
        Math.round(n('teeth') * (1 + n('variety') * (rand() * 2 - 1))),
      );
      const r = teeth * 0.5;
      const prev = chain[k - 1];
      const phi = (rand() * 2 - 1) * n('zigzag') * DEG;
      chain.push({
        x: prev ? prev.x + (prev.r + r) * Math.cos(phi) : 0,
        y: prev ? prev.y + (prev.r + r) * Math.sin(phi) : 0,
        r,
        teeth,
        phi,
        a: 0,
        wob: 0,
        wv: 0,
      });
    }
    let x0 = Infinity;
    let x1 = -Infinity;
    let y0 = Infinity;
    let y1 = -Infinity;
    for (const g of chain) {
      const out = g.r + FIXED.ADDENDUM;
      x0 = Math.min(x0, g.x - out);
      x1 = Math.max(x1, g.x + out);
      y0 = Math.min(y0, g.y - out);
      y1 = Math.max(y1, g.y + out);
    }
    module = Math.min(
      (nameW * FIXED.GEAR_SPAN) / (x1 - x0),
      (c.h * FIXED.GEAR_HEIGHT) / Math.max(1, y1 - y0),
    );
    const mx = (x0 + x1) * 0.5;
    const my = (y0 + y1) * 0.5;
    gears = chain.map((g) => ({
      ...g,
      x: c.w * 0.5 + (g.x - mx) * module,
      y: c.h * 0.5 + (g.y - my) * module,
      r: g.r * module,
    }));
    glyphs = boxes.map((b) => {
      const x = b.x + b.w * 0.5;
      const y = c.h * 0.5;
      let best = gears[0]!;
      for (const g of gears)
        if (Math.hypot(g.x - x, g.y - y) < Math.hypot(best.x - x, best.y - y)) best = g;
      return { ch: b.ch, x, y, px: best.x, py: best.y, scatter: (rand() * 2 - 1) * FIXED.SCATTER };
    });
    build = Math.min(build, glyphs.length);
    shown = Math.min(shown, glyphs.length);
    mesh();
  }

  /** Gear-train rule: every gear's angle follows its neighbor's so the teeth mesh. */
  function mesh(): void {
    gears.forEach((g, k) => {
      if (!k) {
        g.a = drive;
        return;
      }
      const prev = gears[k - 1]!;
      const u = ((g.phi - prev.a) * prev.teeth) / SHARED.TAU;
      g.a = g.phi + Math.PI - ((0.5 - u) * SHARED.TAU) / g.teeth;
    });
  }

  fontsReady().then(() => {
    fontsOk = true;
    layout();
    if (stillShown) still();
  });

  function tick(): void {
    driveTarget += SHARED.TAU / (gears[0]?.teeth ?? 1);
    ticks++;
    if (!unwinding)
      build = Math.min(glyphs.length, build + n('letterBuild') * FIXED.BUILD_PER_TICK);
    for (const g of gears) g.wv += 1;
  }

  function gearPath(path: Path2D, g: Gear, angle: number): void {
    const pitch = SHARED.TAU / g.teeth;
    const root = g.r - FIXED.DEDENDUM * module;
    const tip = g.r + FIXED.ADDENDUM * module;
    const tipHalf = FIXED.TIP_HALF * n('toothShape') * pitch;
    const rootHalf = FIXED.ROOT_HALF * pitch;
    for (let j = 0; j < g.teeth; j++) {
      const a = angle + pitch * j;
      const pts: [number, number][] = [
        [root, a - rootHalf],
        [tip, a - tipHalf],
        [tip, a + tipHalf],
        [root, a + rootHalf],
      ];
      pts.forEach(([rr, aa], m) => {
        const x = g.x + rr * Math.cos(aa);
        const y = g.y + rr * Math.sin(aa);
        if (j || m) path.lineTo(x, y);
        else path.moveTo(x, y);
      });
    }
    path.closePath();
    const hole = n('axle') * g.r;
    path.moveTo(g.x + hole, g.y);
    path.arc(g.x, g.y, hole, 0, SHARED.TAU, true);
  }

  function draw(): void {
    const g = c.ctx;
    c.clear();
    if (!gears.length) return;
    // Gears, one path per color.
    const paths = inks.map(() => new Path2D());
    gears.forEach((gear, k) => {
      const wobble = n('backlash') * FIXED.BACKLASH_TOOTH * gear.wob * (SHARED.TAU / gear.teeth);
      gearPath(paths[k % SHARED.INKS]!, gear, gear.a + wobble);
    });
    g.globalAlpha = FIXED.GEAR_ALPHA;
    paths.forEach((path, k) => {
      g.fillStyle = inks[k]!;
      g.fill(path, 'evenodd');
    });
    g.globalAlpha = 1;
    // Mainspring spiral and escapement on gear 0, in the text color.
    const g0 = gears[0]!;
    const detail = new Path2D();
    const turns = FIXED.SPIRAL_MIN + FIXED.SPIRAL_TURNS * energy;
    const r0 = n('axle') * g0.r;
    const r1 = FIXED.SPIRAL_SHARE * g0.r;
    for (let s = 0; s <= FIXED.SPIRAL_STEPS; s++) {
      const t = s / FIXED.SPIRAL_STEPS;
      const a = g0.a + turns * SHARED.TAU * t;
      const rr = r0 + (r1 - r0) * t;
      const x = g0.x + rr * Math.cos(a);
      const y = g0.y + rr * Math.sin(a);
      if (s) detail.lineTo(x, y);
      else detail.moveTo(x, y);
    }
    const ax = g0.x;
    const ay = g0.y - FIXED.ANCHOR_DIST * g0.r;
    const spread = FIXED.PALLET * g0.r;
    const swing = rock * n('swing') * DEG;
    for (const side of [-1, 1]) {
      const a = Math.PI * 0.5 + swing + (side * spread) / (FIXED.ANCHOR_DIST * g0.r);
      const reach = FIXED.ANCHOR_DIST * g0.r - (g0.r - spread);
      detail.moveTo(ax, ay);
      detail.lineTo(ax + reach * Math.cos(a), ay + reach * Math.sin(a));
    }
    detail.moveTo(ax + FIXED.LINE * 2, ay);
    detail.arc(ax, ay, FIXED.LINE * 2, 0, SHARED.TAU);
    g.strokeStyle = theme.ink;
    g.lineWidth = FIXED.LINE;
    g.lineCap = 'round';
    g.stroke(detail);
    // Letters, swung around their gears until built.
    if (!fontsOk) return;
    applyFont(g, { size: fontSize, weight: n('weight') });
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillStyle = theme.ink;
    glyphs.forEach((L, i) => {
      const b = Math.min(1, Math.max(0, shown - i));
      const turn = (1 - smoothstep(0, 1, b)) * L.scatter;
      g.globalAlpha = FIXED.LETTER_FADE + (1 - FIXED.LETTER_FADE) * b;
      g.save();
      g.translate(L.px, L.py);
      g.rotate(turn);
      g.fillText(L.ch, L.x - L.px, L.y - L.py);
      g.restore();
    });
    g.globalAlpha = 1;
  }

  function still(): void {
    stillShown = true;
    ptr.takeTaps();
    energy = 0.5;
    shown = glyphs.length;
    for (const gear of gears) gear.wob = 0;
    mesh();
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
      ptr.sync();
      // Wind with the mouse, or with a drag on touch screens.
      const side = Math.min(c.w, c.h) || 1;
      const moved = Math.hypot(ptr.x - ptr.px, ptr.y - ptr.py);
      const winding =
        (ptr.active && ptr.pointerType === 'mouse') || (ptr.down && ptr.pointerType !== 'mouse');
      if (winding && moved > 0) {
        energy = Math.min(1, energy + (moved / side) * n('wind') * FIXED.WIND_GAIN);
        quiet = 0;
      } else {
        quiet += dt;
        if (quiet >= n('idleWait')) energy = Math.min(1, energy + n('autoWind') * dt);
      }
      // Escapement: ticks at the tick rate while the spring has energy; taps tick once.
      sinceTick += dt;
      if (sinceTick >= 1 / n('tick') && energy >= FIXED.TICK_COST) {
        sinceTick = 0;
        energy -= FIXED.TICK_COST;
        tick();
      }
      ptr.takeTaps().forEach(() => tick());
      rock += ((ticks % 2 ? 1 : -1) - rock) * ease(FIXED.TICK_EASE, f);
      drive += (driveTarget - drive) * ease(FIXED.TICK_EASE, f);
      for (const g of gears) {
        g.wv += -g.wob * FIXED.WOBBLE_K * f;
        g.wv *= FIXED.WOBBLE_DAMP ** f;
        g.wob += g.wv * f;
      }
      mesh();
      // Build, hold, then come apart and start over.
      if (glyphs.length && build >= glyphs.length && !unwinding) {
        held += dt;
        if (held >= n('hold')) unwinding = true;
      }
      if (unwinding) {
        build = Math.max(0, build - n('unwind') * dt);
        if (build <= 0) [unwinding, held] = [false, 0];
      }
      shown += (build - shown) * (unwinding ? 1 : ease(FIXED.TICK_EASE, f));
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
      colors();
      if (stillShown) still();
    },
    restart() {
      energy = drive = driveTarget = build = shown = held = quiet = sinceTick = 0;
      ticks = 0;
      unwinding = false;
      for (const g of gears) g.wob = g.wv = 0;
      mesh();
    },
    destroy() {
      ptr.destroy();
      c.destroy();
      gears = [];
      glyphs = [];
    },
  };
}

const scene: SceneModule = { meta, params, followUps, create };
export default scene;
