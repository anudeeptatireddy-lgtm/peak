// `confetti`: Celebration burst (SCENES.md #24). A DOM message over a canvas of
// confetti from the shared burst kit (also used by `countdown`).

import { cursorLean } from '../../kits/cursor';
import { createCanvas } from '../../engine/canvas';
import { createPointer } from '../../engine/pointer';
import { frameFactor } from '../../engine/time';
import { Burst, type BurstOptions } from '../../kits/burst';
import { Batch } from '../../kits/render';
import type { Theme } from '../../theme/worlds';
import { SHARED } from '../shared';
import type { Params, SceneContext, SceneInstance, SceneModule } from '../types';
import { FIXED } from './constants';
import { meta } from './meta';
import { params } from './params';
import { followUps } from './prompt';

function create(host: HTMLElement, initial: Params, ctx: SceneContext): SceneInstance {
  let p = { ...initial };
  // Follow cursor: the whole picture tilts toward the mouse (off by default).
  const lean = cursorLean(host);
  const n = (id: string) => Number(p[id]);
  let theme: Theme = ctx.theme;
  const c = createCanvas(host);
  const ptr = createPointer(host);
  const burst = new Burst();
  const batch = new Batch(SHARED.INKS);
  let time = 0;
  let nextAuto = 0;

  const wrap = document.createElement('div');
  Object.assign(wrap.style, {
    position: 'absolute',
    inset: '0',
    display: 'grid',
    placeItems: 'center',
    pointerEvents: 'none',
    fontVariationSettings: 'normal',
    containerType: 'inline-size',
    textAlign: 'center',
  });
  const msg = document.createElement('p');
  msg.style.margin = '0';
  wrap.append(msg);
  host.append(wrap);

  function style(): void {
    msg.textContent = String(p.message);
    Object.assign(msg.style, {
      fontSize: `clamp(${p.msgMin}rem, ${p.msgSize}cqw, ${p.msgMax}rem)`,
      fontWeight: String(p.msgWeight),
      fontStretch: `${p.msgWidth}%`,
      lineHeight: '1',
      color: 'var(--ink)',
    });
  }
  style();

  const shapes = () => FIXED.SHAPES[String(p.shapes)] ?? FIXED.SHAPES.mixed!;
  const options = (): BurstOptions => ({
    count: n('count') * (ctx.quality === 'preview' ? SHARED.PREVIEW_SCALE : 1),
    direction: FIXED.UP,
    spread: n('spread') * FIXED.DEG,
    speed: n('speed'),
    speedRange: n('speedRange'),
    size: n('size'),
    spin: n('spin'),
    flutter: n('flutterSpeed'),
    shapes: shapes(),
  });

  function autoBurst(): void {
    const m = n('autoX');
    burst.fire(c.w * (m + Math.random() * (1 - 2 * m)), c.h * n('autoY'), options(), SHARED.INKS);
    ctx.sound.play('pop');
  }

  function draw(): void {
    c.clear();
    c.ctx.globalCompositeOperation = theme.blend;
    burst.draw(c.ctx, batch, [theme.c1, theme.c2, theme.c3], shapes(), n('ribbon'));
    c.ctx.globalCompositeOperation = 'source-over';
  }

  const step = (f: number) =>
    burst.step(f, n('gravity'), n('drag'), n('wobble'), n('flutterSpeed'), c.h);

  return {
    resize() {
      c.fit();
    },
    update(dt) {
      lean.update(dt, !!p.cursor, Number(p.cursorLean));
      time += dt;
      ptr.sync();
      for (const tap of ptr.takeTaps()) burst.fire(tap.x, tap.y, options(), SHARED.INKS);
      if (n('autoEvery') > 0 && time >= nextAuto) {
        autoBurst();
        nextAuto = time + n('autoEvery');
      }
      step(frameFactor(dt));
      draw();
    },
    still() {
      lean.reset();
      ptr.takeTaps();
      const keep = burst.pieces;
      burst.pieces = [];
      burst.fire(c.w / 2, c.h * n('autoY'), options(), SHARED.INKS);
      for (let i = 0; i < FIXED.STILL_FRAMES; i++) step(1);
      draw();
      burst.pieces = keep;
    },
    setParams(next) {
      p = { ...next };
      style();
    },
    setTheme(t) {
      theme = t;
    },
    restart() {
      burst.pieces = [];
      nextAuto = time;
    },
    destroy() {
      lean.destroy();
      ptr.destroy();
      c.destroy();
      wrap.remove();
      burst.pieces = [];
    },
  };
}

const scene: SceneModule = { meta, params, followUps, create };
export default scene;
