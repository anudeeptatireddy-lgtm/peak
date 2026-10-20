// `doorwave`: Door Wave (SCENES.md #82). An isometric block of doors; each door is
// a spring that swings open near the cursor, and the middle floor's rooms spell NAME.

import { createCanvas } from '../../engine/canvas';
import { fontsReady } from '../../engine/fonts';
import { innerScroller } from '../../engine/inner-scroll';
import { createPointer } from '../../engine/pointer';
import { addScrollSource } from '../../engine/scheduler';
import { createScrollSource } from '../../engine/scroll';
import { frameFactor } from '../../engine/time';
import { smoothstep } from '../../kits/easing';
import { applyFont } from '../../kits/text';
import { mixOklab } from '../../theme/color';
import type { Theme } from '../../theme/worlds';
import { SHARED } from '../shared';
import type { Params, SceneContext, SceneInstance, SceneModule } from '../types';
import { FIXED } from './constants';
import { meta } from './meta';
import { params } from './params';
import { followUps } from './prompt';

const ISO = FIXED.ISO;

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
  const source = inner ? inner.source : createScrollSource();
  const removeSource = addScrollSource(source);
  let fontsOk = false;
  let alive = true;
  let lastScroll: number | null = null;

  let cols = 0;
  let floors = 0;
  let cell = 0;
  let ox = 0;
  let oy = 0;
  let letterFloor = 0;
  let letters: string[] = [];
  let open = new Float32Array(0);
  let vel = new Float32Array(0);
  let linger = new Float32Array(0);
  let fontSize = 0;
  let quiet = 0;
  let phase = 0.5;
  let ink = { wall: '', side: '', roof: '', walk: '', room: '' };

  function colors(): void {
    ink = {
      wall: theme.surface,
      side: mixOklab(theme.c1, theme.surface, 0.5),
      roof: theme.c1,
      walk: mixOklab(theme.c2, theme.surface, 0.5),
      room: mixOklab(theme.surface, theme.c3, n('warmth')),
    };
  }

  function layout(): void {
    if (!c.w) return;
    colors();
    const small = c.w < SHARED.SMALL_SCREEN;
    const text = [...String(p.text || ' ')];
    floors = small ? n('floorsSmall') : n('floors');
    cols = Math.max(small ? n('doorsSmall') : n('doors'), text.length + 2);
    const wu = cols + FIXED.WALK + FIXED.DEPTH;
    const hu = cols * ISO + floors * FIXED.FLOOR_RATIO + (FIXED.WALK + FIXED.DEPTH) * ISO;
    cell = Math.min((c.w * n('fitWidth')) / wu, (c.h * n('fitHeight')) / hu);
    ox = (c.w - wu * cell) * 0.5 + FIXED.WALK * cell;
    oy = (c.h - hu * cell) * 0.5 + FIXED.DEPTH * ISO * cell;
    letterFloor = Math.floor((floors - 1) * 0.5);
    const start = Math.floor((cols - text.length) * 0.5);
    letters = new Array<string>(cols).fill('');
    text.forEach((ch, i) => (letters[start + i] = ch.trim()));
    const total = cols * floors;
    if (open.length !== total) {
      open = new Float32Array(total);
      vel = new Float32Array(total);
      linger = new Float32Array(total);
    }
    if (!fontsOk) return;
    const dw = cell * n('doorWidth');
    const dh = cell * FIXED.FLOOR_RATIO * FIXED.DOOR_HEIGHT;
    const g = c.ctx;
    fontSize = dh * n('letterSize');
    applyFont(g, { size: fontSize, weight: n('weight') });
    let widest = 0;
    for (const ch of letters) if (ch) widest = Math.max(widest, g.measureText(ch).width);
    if (widest > dw * FIXED.LETTER_FIT) fontSize *= (dw * FIXED.LETTER_FIT) / widest;
  }

  fontsReady().then(() => {
    if (!alive) return;
    fontsOk = true;
    layout();
  });

  /** Bottom-left corner of door (col i, floor j). */
  function doorBase(i: number, j: number): [number, number] {
    const along = i * cell + (cell - cell * n('doorWidth')) * 0.5;
    return [ox + along, oy + along * ISO + (j + 1) * cell * FIXED.FLOOR_RATIO];
  }

  function targets(x: number, y: number, dt: number, still: boolean): void {
    const dw = cell * n('doorWidth');
    const dh = cell * FIXED.FLOOR_RATIO * FIXED.DOOR_HEIGHT;
    const r = n('radius');
    for (let j = 0; j < floors; j++)
      for (let i = 0; i < cols; i++) {
        const k = j * cols + i;
        const [bx, by] = doorBase(i, j);
        const d = Math.hypot(bx + dw * 0.5 - x, by + dw * ISO * 0.5 - dh * 0.5 - y);
        const wave = 1 - smoothstep(r * FIXED.FULL_OPEN, r, d);
        const named = j === letterFloor && letters[i] !== '';
        if (named && (wave > FIXED.OPENED || still)) linger[k] = n('linger');
        else linger[k] = Math.max(0, linger[k]! - dt);
        const goal = named && linger[k]! > 0 ? 1 : wave;
        if (still) {
          open[k] = goal;
          vel[k] = 0;
        }
        tgt[k] = goal;
      }
  }
  let tgt = new Float32Array(0);

  function swing(f: number): void {
    const k = (Math.PI / (n('doorSpeed') * SHARED.FPS)) ** 2;
    const keep = (1 - n('damping') * (1 - n('overshoot'))) ** f;
    for (let i = 0; i < open.length; i++) {
      let v = (vel[i]! + (tgt[i]! - open[i]!) * k * f) * keep;
      let o = open[i]! + v * f;
      if (o < 0) {
        o = 0;
        v = 0;
      }
      open[i] = o;
      vel[i] = v;
    }
  }

  function draw(): void {
    const g = c.ctx;
    c.clear();
    if (!cell) return;
    const fh = cell * FIXED.FLOOR_RATIO;
    const H = floors * fh;
    const W = cols * cell;
    const back = FIXED.DEPTH * cell;
    const dw = cell * n('doorWidth');
    const dh = fh * FIXED.DOOR_HEIGHT;
    const walk = FIXED.WALK * cell;
    const theta = (n('openAngle') * Math.PI) / FIXED.HALF_TURN;
    g.lineWidth = FIXED.LINE;
    g.lineJoin = 'round';
    // Roof, side and front wall.
    const tx = ox + W;
    const ty = oy + W * ISO;
    g.fillStyle = ink.roof;
    g.beginPath();
    g.moveTo(ox, oy);
    g.lineTo(tx, ty);
    g.lineTo(tx + back, ty - back * ISO);
    g.lineTo(ox + back, oy - back * ISO);
    g.fill();
    g.fillStyle = ink.side;
    g.beginPath();
    g.moveTo(tx, ty);
    g.lineTo(tx + back, ty - back * ISO);
    g.lineTo(tx + back, ty - back * ISO + H);
    g.lineTo(tx, ty + H);
    g.fill();
    g.fillStyle = ink.wall;
    g.beginPath();
    g.moveTo(ox, oy);
    g.lineTo(tx, ty);
    g.lineTo(tx, ty + H);
    g.lineTo(ox, oy + H);
    g.fill();
    for (let j = 0; j < floors; j++) {
      const rooms = new Path2D();
      const leaves = new Path2D();
      const spill = new Path2D();
      for (let i = 0; i < cols; i++) {
        const [bx, by] = doorBase(i, j);
        rooms.moveTo(bx, by);
        rooms.lineTo(bx + dw, by + dw * ISO);
        rooms.lineTo(bx + dw, by + dw * ISO - dh);
        rooms.lineTo(bx, by - dh);
        rooms.closePath();
        const a = open[j * cols + i]! * theta;
        const ex = dw * (Math.cos(a) - Math.sin(a));
        const ey = dw * ISO * (Math.cos(a) + Math.sin(a));
        leaves.moveTo(bx, by);
        leaves.lineTo(bx + ex, by + ey);
        leaves.lineTo(bx + ex, by + ey - dh);
        leaves.lineTo(bx, by - dh);
        leaves.closePath();
        const s = Math.min(1, open[j * cols + i]!) * walk;
        if (s > 0) {
          spill.moveTo(bx, by);
          spill.lineTo(bx + dw, by + dw * ISO);
          spill.lineTo(bx + dw - s, by + dw * ISO + s * ISO);
          spill.lineTo(bx - s, by + s * ISO);
          spill.closePath();
        }
      }
      g.fillStyle = ink.room;
      g.fill(rooms);
      if (j === letterFloor && fontsOk && fontSize) {
        applyFont(g, { size: fontSize, weight: n('weight') });
        g.textAlign = 'center';
        g.textBaseline = 'middle';
        g.fillStyle = theme.ink;
        for (let i = 0; i < cols; i++) {
          if (!letters[i]) continue;
          const [bx, by] = doorBase(i, j);
          g.save();
          g.translate(bx + dw * 0.5, by + dw * ISO * 0.5 - dh * 0.5);
          g.transform(1, ISO, 0, 1, 0, 0);
          g.fillText(letters[i]!, 0, 0);
          g.restore();
        }
      }
      // Walkway with its light spill, then the doors, then the railing.
      const by0 = oy + (j + 1) * fh;
      g.fillStyle = ink.walk;
      g.beginPath();
      g.moveTo(ox, by0);
      g.lineTo(tx, ty + (j + 1) * fh);
      g.lineTo(tx - walk, ty + (j + 1) * fh + walk * ISO);
      g.lineTo(ox - walk, by0 + walk * ISO);
      g.fill();
      g.globalAlpha = n('spill');
      g.fillStyle = theme.c3;
      g.fill(spill);
      g.globalAlpha = 1;
      g.fillStyle = theme.c2;
      g.strokeStyle = theme.inkSoft;
      g.fill(leaves);
      g.stroke(leaves);
      const rail = fh * FIXED.RAIL;
      g.beginPath();
      g.moveTo(ox - walk, by0 + walk * ISO);
      g.lineTo(tx - walk, ty + (j + 1) * fh + walk * ISO);
      g.moveTo(ox - walk, by0 + walk * ISO - rail);
      g.lineTo(tx - walk, ty + (j + 1) * fh + walk * ISO - rail);
      g.stroke();
    }
  }

  function cursor(dt: number): [number, number] {
    if (ptr.active) {
      quiet = 0;
      return [ptr.x, ptr.y];
    }
    quiet += dt;
    if (quiet > n('idleDelay')) phase += dt / n('sweepTime');
    const q = 1 - Math.abs((phase % 2) - 1);
    const [bx, by] = doorBase(q * (cols - 1), letterFloor);
    const fh = cell * FIXED.FLOOR_RATIO;
    return [bx + cell * 0.5, by - fh * FIXED.DOOR_HEIGHT * 0.5];
  }

  return {
    resize() {
      if (!c.fit()) return;
      layout();
    },
    update(dt) {
      ptr.sync();
      ptr.takeTaps();
      const pos = source.read();
      const scrolled = lastScroll === null ? 0 : pos - lastScroll;
      lastScroll = pos;
      if (scrolled) {
        phase += scrolled / n('scrollPx');
        quiet = 0;
      }
      if (tgt.length !== open.length) tgt = new Float32Array(open.length);
      const [x, y] = cursor(dt);
      targets(x, y, dt, false);
      swing(frameFactor(dt));
      draw();
    },
    still() {
      ptr.takeTaps();
      if (tgt.length !== open.length) tgt = new Float32Array(open.length);
      phase = 0.5;
      const [x, y] = cursor(0);
      targets(x, y, 0, true);
      draw();
    },
    setParams(next) {
      p = { ...next };
      layout();
    },
    setTheme(th) {
      theme = th;
      colors();
    },
    restart() {
      open.fill(0);
      vel.fill(0);
      linger.fill(0);
      phase = 0.5;
      quiet = 0;
    },
    destroy() {
      alive = false;
      ptr.destroy();
      removeSource();
      inner?.el.remove();
      c.destroy();
    },
  };
}

const scene: SceneModule = { meta, params, followUps, create };
export default scene;
