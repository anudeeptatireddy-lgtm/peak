// `torchmap`: Torch Map (SCENES.md #84, ⚠). A map wider than the screen under a fog
// grid; the torch lowers each cell's fog with a soft edge, and every cell remembers the
// most light it has had. The name is a path of stone tiles; finding them all starts a
// slow glow and drifting sparks (no flashing; timing in light.ts, tested in flash.test).

import { createCanvas } from '../../engine/canvas';
import { fontsReady } from '../../engine/fonts';
import { createPointer } from '../../engine/pointer';
import { ease, frameFactor } from '../../engine/time';
import { smoothstep } from '../../kits/easing';
import { seededRandom } from '../../kits/field';
import { offscreen, textMask } from '../../kits/text';
import { luminance, mixOklab, parseHex, withAlpha } from '../../theme/color';
import type { Theme } from '../../theme/worlds';
import { SHARED } from '../shared';
import type { Params, SceneContext, SceneInstance, SceneModule } from '../types';
import { FIXED } from './constants';
import { glowLevel, torchScale } from './light';
import { meta } from './meta';
import { params } from './params';
import { followUps } from './prompt';

type Off = ReturnType<typeof offscreen>;

function create(host: HTMLElement, initial: Params, ctx: SceneContext): SceneInstance {
  let p = { ...initial };
  const n = (id: string) => Number(p[id]);
  let theme: Theme = ctx.theme;
  const c = createCanvas(host);
  const ptr = createPointer(host);
  let fontsOk = false;
  let stillShown = false;

  let mapW = 0;
  let map: Off | null = null;
  let fogOff: Off | null = null;
  let fogData: ImageData | null = null;
  let cols = 0;
  let rows = 0;
  let cell = 1;
  let mem = new Float32Array(0);
  let light = new Float32Array(0);
  // Stone tiles: centers, fog cell index, found flags, and one path for the glow.
  let tx = new Float32Array(0);
  let ty = new Float32Array(0);
  let tcell = new Int32Array(0);
  let found = new Uint8Array(0);
  let foundCount = 0;
  let stones = new Path2D();
  let nameL = 0;
  let nameR = 0;
  let nameT = 0;
  let nameB = 0;

  let camX = 0;
  let camTarget = 0;
  let torchX = 0;
  let torchY = 0;
  let torchOn = false;
  let quiet = 0;
  let idleX = 0;
  let time = 0;
  let since = -1;
  let sparkX = new Float32Array(0);
  let sparkY = new Float32Array(0);
  let sparkAge = new Float32Array(0);
  const rand = seededRandom(FIXED.SEED);

  const fogInk = () => (luminance(theme.ground) < luminance(theme.ink) ? theme.ground : theme.ink);

  function drawMap(): void {
    if (!map || !mapW) return;
    const g = map.ctx;
    const h = c.h;
    g.setTransform(c.dpr, 0, 0, c.dpr, 0, 0);
    g.fillStyle = theme.surface;
    g.fillRect(0, 0, mapW, h);
    const r = seededRandom(FIXED.SEED);
    const tile = n('tileSize');
    const kinds = [new Path2D(), new Path2D(), new Path2D()];
    const count = Math.round((mapW * h) / FIXED.FEATURE_AREA);
    const near = (x: number, y: number, rad: number) =>
      x > nameL - rad && x < nameR + rad && y > nameT - rad && y < nameB + rad;
    for (let i = 0; i < count; i++) {
      const x = r() * mapW;
      const y = r() * h;
      const s = tile * (FIXED.FEATURE_MIN + r() * (FIXED.FEATURE_MAX - FIXED.FEATURE_MIN));
      const kind = Math.floor(r() * SHARED.INKS);
      if (near(x, y, s + tile * FIXED.FEATURE_CLEAR)) continue;
      const path = kinds[kind]!;
      if (kind === 1) path.rect(x - s * 0.5, y - s * 0.5, s, s);
      else {
        path.moveTo(x + s, y);
        path.ellipse(x, y, s, kind ? s * 0.5 : s, 0, 0, SHARED.TAU);
      }
    }
    const tint = n('mapTint');
    const inks = [theme.c1, theme.inkSoft, theme.c3].map((k) => mixOklab(theme.surface, k, tint));
    kinds.forEach((path, k) => {
      g.fillStyle = inks[k]!;
      g.fill(path);
    });
    g.fillStyle = mixOklab(theme.inkSoft, theme.surface, FIXED.STONE_MIX);
    g.fill(stones);
  }

  function layout(): void {
    if (!fontsOk || !c.w) return;
    const w = c.w;
    const h = c.h;
    const small = w < SHARED.SMALL_SCREEN;
    const screens = small ? Math.min(FIXED.MAP_CAP_SMALL, n('mapSize')) : n('mapSize');
    mapW = Math.round(w * screens);
    const { data } = textMask(mapW, h, String(p.text || ' '), {
      heightShare: n('textHeight'),
      fitShare: Math.min(FIXED.MAP_FIT, (n('fitWidth') * w) / mapW),
      weight: n('weight'),
    });
    const tile = n('tileSize');
    const s = tile * FIXED.TILE_FILL;
    const xs: number[] = [];
    const ys: number[] = [];
    stones = new Path2D();
    nameL = nameT = Infinity;
    nameR = nameB = -Infinity;
    const H = Math.round(h);
    for (let y = tile * 0.5; y < h; y += tile)
      for (let x = tile * 0.5; x < mapW; x += tile) {
        const i = (Math.min(H - 1, Math.floor(y)) * mapW + Math.floor(x)) * SHARED.RGBA;
        if (data[i + SHARED.RGBA - 1]! <= FIXED.ALPHA_CUTOFF) continue;
        xs.push(x);
        ys.push(y);
        stones.rect(x - s * 0.5, y - s * 0.5, s, s);
        nameL = Math.min(nameL, x);
        nameR = Math.max(nameR, x);
        nameT = Math.min(nameT, y);
        nameB = Math.max(nameB, y);
      }
    cell = n('fogCell');
    cols = Math.ceil(mapW / cell);
    rows = Math.ceil(h / cell);
    mem = new Float32Array(cols * rows);
    light = new Float32Array(cols * rows);
    tx = Float32Array.from(xs);
    ty = Float32Array.from(ys);
    tcell = Int32Array.from(
      xs.map((x, i) => Math.floor(ys[i]! / cell) * cols + Math.floor(x / cell)),
    );
    found = new Uint8Array(xs.length);
    foundCount = 0;
    since = -1;
    map?.free();
    map = offscreen(mapW * c.dpr, h * c.dpr);
    fogOff?.free();
    fogOff = offscreen(cols, rows);
    fogData = fogOff.ctx.createImageData(cols, rows);
    drawMap();
    camX = camTarget = Math.max(0, (mapW - w) * 0.5);
    idleX = nameL;
  }

  fontsReady().then(() => {
    fontsOk = true;
    layout();
    if (stillShown) still();
  });

  function shine(r: number): void {
    light.fill(0);
    if (!torchOn) return;
    const inner = r * (1 - n('soft'));
    const c0 = Math.max(0, Math.floor((torchX - r) / cell));
    const c1 = Math.min(cols - 1, Math.ceil((torchX + r) / cell));
    const r0 = Math.max(0, Math.floor((torchY - r) / cell));
    const r1 = Math.min(rows - 1, Math.ceil((torchY + r) / cell));
    for (let j = r0; j <= r1; j++)
      for (let i = c0; i <= c1; i++) {
        const d = Math.hypot((i + 0.5) * cell - torchX, (j + 0.5) * cell - torchY);
        const v = 1 - smoothstep(inner, r, d);
        const k = j * cols + i;
        light[k] = v;
        if (v > mem[k]!) mem[k] = v;
      }
  }

  function draw(glow: number, r: number): void {
    const g = c.ctx;
    g.fillStyle = theme.surface;
    g.fillRect(0, 0, c.w, c.h);
    if (!map || !fogOff || !fogData) return;
    g.drawImage(map.canvas, -camX, 0, mapW, c.h);
    if (torchOn) {
      const sx = torchX - camX;
      const grad = g.createRadialGradient(sx, torchY, 0, sx, torchY, r);
      grad.addColorStop(0, theme.c2);
      grad.addColorStop(1, withAlpha(theme.c2, 0));
      g.globalAlpha = FIXED.TORCH_ALPHA;
      g.fillStyle = grad;
      g.fillRect(sx - r, torchY - r, r * 2, r * 2);
      g.globalAlpha = 1;
    }
    // Fog: one byte of opacity per cell, scaled up with smoothing for soft edges.
    const rgb = parseHex(fogInk());
    const [fr, fg, fb] = [rgb.r, rgb.g, rgb.b].map((v) => Math.round(v * FIXED.BYTE));
    const keep = 1 - n('memory');
    const px = fogData.data;
    for (let k = 0; k < mem.length; k++) {
      const a = n('fog') * (1 - light[k]!) * (1 - mem[k]! * keep);
      const o = k * SHARED.RGBA;
      px[o] = fr!;
      px[o + 1] = fg!;
      px[o + 2] = fb!;
      px[o + SHARED.RGBA - 1] = Math.round(a * FIXED.BYTE);
    }
    fogOff.ctx.putImageData(fogData, 0, 0);
    g.imageSmoothingEnabled = true;
    g.drawImage(fogOff.canvas, -camX, 0, cols * cell, rows * cell);
    if (glow > 0) {
      g.save();
      g.translate(-camX, 0);
      g.globalAlpha = FIXED.GLOW_ALPHA * glow;
      g.fillStyle = theme.c1;
      g.fill(stones);
      g.globalAlpha = glow;
      const sparks = new Path2D();
      const life = FIXED.SPARK_LIFE;
      const size = FIXED.SPARK_SIZE;
      for (let i = 0; i < sparkAge.length; i++) {
        if (sparkAge[i]! < 0) continue;
        const y = sparkY[i]! - sparkAge[i]! * FIXED.SPARK_RISE;
        sparks.moveTo(sparkX[i]! + size, y);
        sparks.arc(sparkX[i]!, y, size * Math.sin((Math.PI * sparkAge[i]!) / life), 0, SHARED.TAU);
      }
      g.fillStyle = theme.c2;
      g.fill(sparks);
      g.restore();
    }
  }

  function still(): void {
    stillShown = true;
    ptr.takeTaps();
    mem.fill(1);
    torchOn = false;
    light.fill(0);
    sparkAge.fill(-1);
    camX = Math.max(0, (nameL + nameR - c.w) * 0.5);
    draw(1, 0);
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
      ptr.takeTaps();
      const w = c.w;
      const span = Math.max(0, mapW - w);
      const pointing = (ptr.active && ptr.pointerType === 'mouse') || ptr.down;
      if (pointing && w) {
        quiet = 0;
        camTarget = Math.min(1, Math.max(0, ptr.x / w)) * span;
        torchX = camX + ptr.x;
        torchY = ptr.y;
        torchOn = true;
      } else {
        quiet += dt;
        torchOn = quiet >= n('idleWait') && nameR > nameL;
        if (torchOn) {
          const r = n('torch');
          idleX += n('idleSpeed') * dt;
          if (idleX > nameR + r) idleX = nameL - r;
          const phase = (SHARED.TAU * FIXED.IDLE_WAVES * idleX) / FIXED.PER_THOUSAND;
          torchX = idleX;
          torchY = (nameT + nameB) * 0.5 + Math.sin(phase) * (nameB - nameT) * FIXED.IDLE_WEAVE;
          camTarget = Math.min(span, Math.max(0, torchX - w * 0.5));
        }
      }
      camX += (camTarget - camX) * ease(n('pan'), f);
      const r = n('torch') * torchScale(time, n('flicker'), n('flickerRate'));
      shine(r);
      // Found stones, then the celebration and the fog's return.
      for (let i = 0; i < found.length; i++)
        if (!found[i] && mem[tcell[i]!]! > FIXED.FOUND) {
          found[i] = 1;
          foundCount++;
        }
      if (since < 0 && found.length && foundCount === found.length) {
        since = 0;
        const total = n('sparkles');
        sparkX = new Float32Array(total);
        sparkY = new Float32Array(total);
        sparkAge = new Float32Array(total).fill(-1);
      }
      let glow = 0;
      if (since >= 0) {
        since += dt;
        const over = since - n('hold');
        glow = glowLevel(since, FIXED.GLOW_RISE) * (1 - smoothstep(0, n('regrow'), over));
        if (over > 0) {
          let left = 0;
          for (let k = 0; k < mem.length; k++) {
            mem[k] = Math.max(0, mem[k]! - dt / n('regrow'));
            left = Math.max(left, mem[k]!);
          }
          if (left <= 0) {
            since = -1;
            found.fill(0);
            foundCount = 0;
          }
        }
        for (let i = 0; i < sparkAge.length; i++) {
          sparkAge[i] = sparkAge[i]! < 0 ? -1 : sparkAge[i]! + dt;
          if ((sparkAge[i]! < 0 || sparkAge[i]! > FIXED.SPARK_LIFE) && over < 0 && tx.length) {
            const t = Math.floor(rand() * tx.length);
            sparkX[i] = tx[t]!;
            sparkY[i] = ty[t]!;
            sparkAge[i] = rand() * FIXED.SPARK_LIFE * 0.5;
          } else if (sparkAge[i]! > FIXED.SPARK_LIFE) sparkAge[i] = -1;
        }
      }
      draw(glow, r);
    },
    still,
    setParams(next) {
      p = { ...next };
      layout();
      if (stillShown) still();
    },
    setTheme(th) {
      theme = th;
      drawMap();
      if (stillShown) still();
    },
    restart() {
      mem.fill(0);
      found.fill(0);
      foundCount = 0;
      since = -1;
      quiet = time = 0;
      idleX = nameL;
    },
    destroy() {
      ptr.destroy();
      map?.free();
      fogOff?.free();
      map = fogOff = null;
      c.destroy();
    },
  };
}

const scene: SceneModule = { meta, params, followUps, create };
export default scene;
