// Mini demos for the word bank (PRD §12): tiny scenes with the scene interface and no
// params panel (at most one slider). They are wrapped as scene modules so the usual
// mount, scheduler and theme code runs them: paused until on screen, a still frame under
// reduced motion, and a clean destroy.

import { createCanvas } from '../engine/canvas';
import { createPointer, type PointerState } from '../engine/pointer';
import { frameFactor } from '../engine/time';
import type { Param, SceneInstance, SceneModule } from '../scenes/types';
import type { Theme } from '../theme/worlds';

export interface DemoSlider {
  label: string;
  min: number;
  max: number;
  step: number;
  default: number;
}

export interface Env {
  w: number;
  h: number;
  theme: Theme;
  /** The slider's value (or 0 when the demo has none). */
  v: number;
  ptr: PointerState;
}

export interface Logic {
  /** Advance by dt seconds; f is the frame factor; t is the demo's clock in seconds. */
  step(dt: number, f: number, t: number): void;
  draw(g: CanvasRenderingContext2D): void;
  /** The frame shown under reduced motion (defaults to drawing after a short warm-up). */
  warm?: number;
}

export interface DemoDef {
  slider?: DemoSlider;
  make(env: Env): Logic;
}

const SLIDER_ID = 'value';

export function demoModule(id: string, def: DemoDef): SceneModule {
  const params: Param[] = def.slider
    ? [
        {
          kind: 'slider',
          id: SLIDER_ID,
          label: def.slider.label,
          help: def.slider.label,
          group: 'Look',
          min: def.slider.min,
          max: def.slider.max,
          step: def.slider.step,
          default: def.slider.default,
          phrase: () => '',
        },
      ]
    : [];
  return {
    meta: {
      slug: id,
      title: id,
      summary: '',
      useCase: '',
      tags: [],
      difficulty: 'Easy',
      minutes: 1,
      world: 'riso',
      terms: [],
      howItWorks: [],
      whatElse: [],
      wants: '',
      lookLines: [],
      behaviorLines: [],
      interactionLines: [],
    },
    params,
    followUps: () => [],
    create(host, initial, ctx): SceneInstance {
      const c = createCanvas(host);
      const ptr = createPointer(host);
      const env: Env = {
        w: 0,
        h: 0,
        theme: ctx.theme,
        v: Number(initial[SLIDER_ID] ?? 0),
        ptr,
      };
      let logic: Logic | null = null;
      let time = 0;
      const make = () => {
        env.w = c.w;
        env.h = c.h;
        logic = def.make(env);
        time = 0;
      };
      const frame = () => {
        c.clear();
        logic?.draw(c.ctx);
      };
      return {
        resize() {
          if (c.fit() || !logic) make();
          frame();
        },
        update(dt) {
          ptr.sync();
          ptr.takeTaps();
          time += dt;
          logic?.step(dt, frameFactor(dt), time);
          frame();
        },
        still() {
          ptr.takeTaps();
          if (!logic) return;
          // Run a moment of the demo so the still frame shows it mid-motion.
          make();
          const warm = logic!.warm ?? 1;
          for (let i = 0; i < warm * 60; i++) {
            time += 1 / 60;
            logic!.step(1 / 60, 1, time);
          }
          frame();
        },
        setParams(next) {
          env.v = Number(next[SLIDER_ID] ?? env.v);
        },
        setTheme(t) {
          env.theme = t;
        },
        restart() {
          make();
        },
        destroy() {
          ptr.destroy();
          c.destroy();
          logic = null;
        },
      };
    },
  };
}
