// The 24 mini demos, one per word (PRD §12). Each is small and teaches one idea; colors
// come from the theme. Positions are in CSS pixels in a box a few hundred px wide and
// under 240px tall.

import { backOut, cubicIn, cubicInOut, cubicOut, lerp, smoothstep } from '../kits/easing';
import { makeNoise } from '../kits/field';
import type { DemoDef, Env } from './framework';

const TAU = Math.PI * 2;
const dot = (g: CanvasRenderingContext2D, x: number, y: number, r: number, color: string) => {
  g.fillStyle = color;
  g.beginPath();
  g.arc(x, y, r, 0, TAU);
  g.fill();
};
const label = (g: CanvasRenderingContext2D, env: Env, text: string, x: number, y: number) => {
  g.font = '12px system-ui, sans-serif';
  g.fillStyle = env.theme.inkSoft;
  g.textBaseline = 'middle';
  g.fillText(text, x, y);
};
const track = (g: CanvasRenderingContext2D, env: Env, y: number) => {
  g.strokeStyle = env.theme.inkSoft;
  g.globalAlpha = 0.3;
  g.lineWidth = 2;
  g.beginPath();
  g.moveTo(24, y);
  g.lineTo(env.w - 24, y);
  g.stroke();
  g.globalAlpha = 1;
};
const pingpong = (t: number, period: number) => {
  const u = (t % (period * 2)) / period;
  return u < 1 ? u : 2 - u;
};

/** A ball that chases a target on a spring; used by several demos. */
function springBall(stiffness: () => number, damping: () => number) {
  const s = { x: 0, vx: 0 };
  return {
    s,
    step(target: number, f: number) {
      s.vx = (s.vx + (target - s.x) * stiffness() * f) * damping() ** f;
      s.x += s.vx * f;
    },
  };
}

export const DEMOS: Record<string, DemoDef> = {
  easing: {
    slider: { label: 'Easing strength', min: 0, max: 1, step: 0.05, default: 0.8 },
    make(env) {
      return {
        step() {},
        warm: 0,
        draw(g) {
          const t = pingpong(performance.now() / 1000, 1.4);
          const eased = t + (cubicInOut(t) - t) * env.v;
          const x = (u: number) => 24 + u * (env.w - 48);
          track(g, env, env.h * 0.35);
          track(g, env, env.h * 0.7);
          dot(g, x(t), env.h * 0.35, 12, env.theme.inkSoft);
          dot(g, x(eased), env.h * 0.7, 12, env.theme.c1);
          label(g, env, 'Linear', 24, env.h * 0.2);
          label(g, env, 'Eased', 24, env.h * 0.55);
        },
      };
    },
  },
  'ease-in-out': {
    make(env) {
      let t = 0;
      return {
        step(dt) {
          t += dt;
        },
        draw(g) {
          const u = pingpong(t, 1.6);
          const x = (v: number) => 24 + v * (env.w - 48);
          const rows: [string, number, string][] = [
            ['Ease-in', cubicIn(u), env.theme.c1],
            ['Ease-out', cubicOut(u), env.theme.c2],
            ['Ease-in-out', cubicInOut(u), env.theme.c3],
          ];
          rows.forEach(([name, v, color], i) => {
            const y = env.h * (0.22 + i * 0.28);
            track(g, env, y);
            dot(g, x(v), y, 10, color);
            label(g, env, name, 24, y - 16);
          });
        },
      };
    },
  },
  spring: {
    make(env) {
      const ball = springBall(
        () => 0.12,
        () => 0.9,
      );
      let t = 0;
      return {
        step(_dt, f, now) {
          t = now;
          const target = env.ptr.active ? env.ptr.x : env.w / 2 + Math.sin(t * 1.3) * env.w * 0.3;
          ball.step(target, f);
        },
        draw(g) {
          const y = env.h / 2;
          const target = env.ptr.active ? env.ptr.x : env.w / 2 + Math.sin(t * 1.3) * env.w * 0.3;
          g.strokeStyle = env.theme.inkSoft;
          g.lineWidth = 2;
          g.beginPath();
          g.moveTo(target, y);
          for (let i = 1; i <= 14; i++)
            g.lineTo(lerp(target, ball.s.x, i / 14), y + (i % 2 ? -6 : 6));
          g.lineTo(ball.s.x, y);
          g.stroke();
          dot(g, target, y, 5, env.theme.inkSoft);
          dot(g, ball.s.x, y, 15, env.theme.c1);
        },
      };
    },
  },
  stiffness: {
    slider: { label: 'Stiffness of the top ball', min: 0.03, max: 0.4, step: 0.01, default: 0.25 },
    make(env) {
      const stiff = springBall(
        () => env.v,
        () => 0.88,
      );
      const soft = springBall(
        () => 0.04,
        () => 0.88,
      );
      return {
        step(_dt, f, t) {
          const target = env.w / 2 + Math.sign(Math.sin(t * 0.9)) * env.w * 0.3;
          stiff.step(target, f);
          soft.step(target, f);
        },
        draw(g) {
          dot(g, stiff.s.x, env.h * 0.3, 14, env.theme.c1);
          dot(g, soft.s.x, env.h * 0.7, 14, env.theme.c2);
          label(g, env, 'Your stiffness', 24, env.h * 0.14);
          label(g, env, 'Soft (0.04)', 24, env.h * 0.54);
        },
      };
    },
  },
  damping: {
    slider: { label: 'Damping', min: 0.6, max: 0.98, step: 0.01, default: 0.88 },
    make(env) {
      const ball = springBall(
        () => 0.15,
        () => env.v,
      );
      let last = 0;
      return {
        step(_dt, f, t) {
          if (Math.floor(t / 2) !== last) {
            last = Math.floor(t / 2);
            ball.s.vx = env.w * 0.06;
          }
          ball.step(env.w / 2, f);
        },
        draw(g) {
          track(g, env, env.h / 2);
          dot(g, ball.s.x, env.h / 2, 16, env.theme.c1);
          label(g, env, 'It gets a kick every 2 seconds', 24, env.h * 0.2);
        },
      };
    },
  },
  velocity: {
    make(env) {
      const p = { x: 0, y: 0, vx: 0, vy: 0 };
      return {
        step(_dt, f, t) {
          const cx = env.w / 2 + Math.cos(t * 0.9) * env.w * 0.3;
          const cy = env.h / 2 + Math.sin(t * 1.4) * env.h * 0.28;
          p.vx = (cx - p.x) / Math.max(f, 0.001);
          p.vy = (cy - p.y) / Math.max(f, 0.001);
          p.x = cx;
          p.y = cy;
        },
        draw(g) {
          dot(g, p.x, p.y, 12, env.theme.c1);
          g.strokeStyle = env.theme.c2;
          g.lineWidth = 3;
          g.beginPath();
          g.moveTo(p.x, p.y);
          g.lineTo(p.x + p.vx * 6, p.y + p.vy * 6);
          g.stroke();
          label(g, env, 'The line is its velocity: longer means faster', 12, 14);
        },
      };
    },
  },
  momentum: {
    make(env) {
      const p = { x: 0.2, vx: 0 };
      let last = 0;
      return {
        step(_dt, f, t) {
          if (Math.floor(t / 4) !== last || t < 0.05) {
            last = Math.floor(t / 4);
            p.x = 0.1;
            p.vx = 0.022;
          }
          p.x += p.vx * f;
          p.vx *= 0.985 ** f;
        },
        draw(g) {
          track(g, env, env.h / 2);
          dot(g, 24 + p.x * (env.w - 48), env.h / 2, 14, env.theme.c1);
          label(g, env, 'One flick at the start, then it coasts', 24, env.h * 0.3);
        },
      };
    },
  },
  impulse: {
    make(env) {
      const p = { y: 0, vy: 0 };
      let last = -1;
      return {
        step(_dt, f, t) {
          const floor = env.h * 0.75;
          if (p.y === 0) p.y = floor;
          if (Math.floor(t / 1.6) !== last) {
            last = Math.floor(t / 1.6);
            p.vy = -9;
          }
          p.vy += 0.5 * f;
          p.y += p.vy * f;
          if (p.y > floor) {
            p.y = floor;
            p.vy = 0;
          }
        },
        draw(g) {
          g.fillStyle = env.theme.inkSoft;
          g.globalAlpha = 0.3;
          g.fillRect(24, env.h * 0.75 + 14, env.w - 48, 3);
          g.globalAlpha = 1;
          dot(g, env.w / 2, p.y, 14, env.theme.c1);
          label(g, env, 'A sudden kick every 1.6 seconds', 24, 16);
        },
      };
    },
  },
  gravity: {
    slider: { label: 'Gravity', min: 0.1, max: 1.2, step: 0.05, default: 0.5 },
    make(env) {
      const balls = Array.from({ length: 5 }, (_, i) => ({
        x: (i + 1) / 6,
        y: 20 + i * 12,
        vy: 0,
      }));
      return {
        step(_dt, f) {
          for (const b of balls) {
            b.vy += env.v * f;
            b.y += b.vy * f;
            const floor = env.h - 18;
            if (b.y > floor) {
              b.y = floor;
              b.vy *= -0.8;
              if (Math.abs(b.vy) < 1.2) b.vy = -(6 + env.v * 6);
            }
          }
        },
        draw(g) {
          balls.forEach((b, i) =>
            dot(
              g,
              24 + b.x * (env.w - 48),
              b.y,
              11,
              [env.theme.c1, env.theme.c2, env.theme.c3][i % 3]!,
            ),
          );
        },
      };
    },
  },
  drag: {
    slider: { label: 'Drag (kept each frame)', min: 0.9, max: 1, step: 0.005, default: 0.97 },
    make(env) {
      const p = { x: 0, vx: 0 };
      let last = -1;
      return {
        step(_dt, f, t) {
          if (Math.floor(t / 3.5) !== last) {
            last = Math.floor(t / 3.5);
            p.x = 24;
            p.vx = 14;
          }
          p.x += p.vx * f;
          p.vx *= env.v ** f;
        },
        draw(g) {
          track(g, env, env.h / 2);
          dot(g, Math.min(p.x, env.w - 24), env.h / 2, 13, env.theme.c1);
          label(g, env, 'Thrown at the same speed each time', 24, env.h * 0.3);
        },
      };
    },
  },
  lerp: {
    slider: {
      label: 'Smoothing (how far it moves each frame)',
      min: 0.02,
      max: 0.5,
      step: 0.01,
      default: 0.1,
    },
    make(env) {
      const p = { x: 0, y: 0 };
      const target = (t: number) => ({
        x: env.ptr.active ? env.ptr.x : env.w / 2 + Math.cos(t * 1.2) * env.w * 0.3,
        y: env.ptr.active ? env.ptr.y : env.h / 2 + Math.sin(t * 1.7) * env.h * 0.28,
      });
      let t0 = 0;
      return {
        step(_dt, f, t) {
          t0 = t;
          const a = target(t);
          const k = 1 - (1 - env.v) ** f;
          p.x = lerp(p.x || a.x, a.x, k);
          p.y = lerp(p.y || a.y, a.y, k);
        },
        draw(g) {
          const a = target(t0);
          dot(g, a.x, a.y, 5, env.theme.inkSoft);
          dot(g, p.x, p.y, 14, env.theme.c1);
          label(g, env, 'Small dot: target. Big dot: lerped.', 12, 14);
        },
      };
    },
  },
  stagger: {
    slider: { label: 'Delay between dots (ms)', min: 0, max: 200, step: 10, default: 90 },
    make(env) {
      let t = 0;
      return {
        step(dt) {
          t += dt;
        },
        draw(g) {
          const n = 9;
          for (let i = 0; i < n; i++) {
            const u = pingpong(t - (i * env.v) / 1000, 0.7);
            const x = 28 + (i * (env.w - 56)) / (n - 1);
            dot(g, x, env.h / 2 - cubicInOut(u) * 40 + 20, 10, env.theme.c1);
          }
        },
      };
    },
  },
  parallax: {
    make(env) {
      const layers = [0.15, 0.45, 1].map((depth, k) => ({
        depth,
        dots: Array.from({ length: 6 + k * 3 }, (_, i) => ({
          x: (i * 53 + k * 29) % 100,
          y: (i * 37 + k * 17) % 100,
        })),
      }));
      let sway = 0;
      return {
        step(_dt, _f, t) {
          sway = env.ptr.active ? (env.ptr.x / env.w - 0.5) * 2 : Math.sin(t * 0.8);
        },
        draw(g) {
          layers.forEach((layer, k) => {
            const shift = -sway * layer.depth * 60;
            for (const d of layer.dots)
              dot(
                g,
                ((((d.x / 100) * env.w + shift) % env.w) + env.w) % env.w,
                (d.y / 100) * env.h,
                4 + k * 4,
                [env.theme.c3, env.theme.c2, env.theme.c1][k]!,
              );
          });
        },
      };
    },
  },
  'scroll-linked': {
    make(env) {
      return {
        step() {},
        warm: 0,
        draw(g) {
          // How far this box has travelled up through the screen, 0 to 1.
          const el = (g.canvas as HTMLCanvasElement).getBoundingClientRect();
          const prog = Math.min(1, Math.max(0, 1 - (el.top + el.height / 2) / innerHeight));
          g.fillStyle = env.theme.inkSoft;
          g.globalAlpha = 0.25;
          g.fillRect(24, env.h * 0.7, env.w - 48, 10);
          g.globalAlpha = 1;
          g.fillStyle = env.theme.c1;
          g.fillRect(24, env.h * 0.7, (env.w - 48) * prog, 10);
          dot(g, 24 + (env.w - 48) * prog, env.h * 0.35, 14, env.theme.c2);
          label(g, env, `Scroll the page: ${Math.round(prog * 100)}%`, 24, env.h * 0.15);
        },
      };
    },
  },
  marquee: {
    make(env) {
      let x = 0;
      return {
        step(_dt, f) {
          x += 1.6 * f;
        },
        draw(g) {
          g.font = '800 34px Anybody, system-ui, sans-serif';
          g.textBaseline = 'middle';
          const word = 'peak  tweak  copy  ';
          const w = g.measureText(word).width || 1;
          [0, 1].forEach((row) => {
            g.fillStyle = row ? env.theme.c1 : env.theme.ink;
            const off = (row ? x : -x) % w;
            for (let k = -1; k * w < env.w + w; k++)
              g.fillText(word, k * w + (row ? off : off + w), env.h * (0.3 + row * 0.4));
          });
        },
      };
    },
  },
  'particle-system': {
    slider: { label: 'Particles per burst', min: 10, max: 200, step: 10, default: 80 },
    make(env) {
      type P = { x: number; y: number; vx: number; vy: number; life: number };
      let ps: P[] = [];
      let last = -1;
      const burst = (x: number, y: number) => {
        for (let i = 0; i < env.v; i++) {
          const a = Math.random() * TAU;
          const s = 1 + Math.random() * 4;
          ps.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 1, life: 1 });
        }
      };
      return {
        step(dt, f, t) {
          if (Math.floor(t / 1.8) !== last) {
            last = Math.floor(t / 1.8);
            burst(env.w / 2, env.h / 2);
          }
          for (const p of ps) {
            p.vy += 0.1 * f;
            p.x += p.vx * f;
            p.y += p.vy * f;
            p.life -= dt * 0.6;
          }
          ps = ps.filter((p) => p.life > 0);
        },
        draw(g) {
          for (const p of ps) {
            g.globalAlpha = Math.max(0, p.life);
            dot(g, p.x, p.y, 3, env.theme.c1);
          }
          g.globalAlpha = 1;
        },
      };
    },
  },
  'flow-field': {
    make(env) {
      const noise = makeNoise(5);
      const ps = Array.from({ length: 90 }, (_, i) => ({ x: (i * 37) % 100, y: (i * 61) % 100 }));
      let t = 0;
      return {
        step(dt, f) {
          t += dt * 0.2;
          for (const p of ps) {
            const a = noise.noise3(p.x * 0.012, p.y * 0.012, t) * TAU * 1.5;
            p.x += Math.cos(a) * 1.2 * f;
            p.y += Math.sin(a) * 1.2 * f;
            if (p.x < 0 || p.x > env.w || p.y < 0 || p.y > env.h) {
              p.x = Math.random() * env.w;
              p.y = Math.random() * env.h;
            }
          }
        },
        draw(g) {
          for (const p of ps) dot(g, p.x, p.y, 2.5, env.theme.c1);
          // The invisible arrows, drawn faintly.
          g.strokeStyle = env.theme.inkSoft;
          g.globalAlpha = 0.25;
          for (let x = 20; x < env.w; x += 40)
            for (let y = 20; y < env.h; y += 40) {
              const a = noise.noise3(x * 0.012, y * 0.012, t) * TAU * 1.5;
              g.beginPath();
              g.moveTo(x, y);
              g.lineTo(x + Math.cos(a) * 10, y + Math.sin(a) * 10);
              g.stroke();
            }
          g.globalAlpha = 1;
        },
      };
    },
  },
  trail: {
    slider: { label: 'Trail length', min: 5, max: 60, step: 5, default: 30 },
    make(env) {
      const pts: { x: number; y: number }[] = [];
      return {
        step(_dt, _f, t) {
          pts.unshift({
            x: env.w / 2 + Math.cos(t * 1.6) * env.w * 0.32,
            y: env.h / 2 + Math.sin(t * 2.3) * env.h * 0.3,
          });
          pts.length = Math.min(pts.length, 60);
        },
        draw(g) {
          const n = Math.min(env.v, pts.length);
          for (let i = n - 1; i >= 0; i--) {
            g.globalAlpha = 1 - i / n;
            dot(g, pts[i]!.x, pts[i]!.y, 10 * (1 - i / (n * 1.4)), env.theme.c1);
          }
          g.globalAlpha = 1;
        },
      };
    },
  },
  'blend-mode': {
    make(env) {
      return {
        step() {},
        warm: 0,
        draw(g) {
          const r = Math.min(env.h * 0.32, env.w * 0.2);
          g.globalCompositeOperation = env.theme.blend;
          dot(g, env.w / 2 - r * 0.6, env.h / 2, r, env.theme.c1);
          dot(g, env.w / 2 + r * 0.6, env.h / 2, r, env.theme.c2);
          g.globalCompositeOperation = 'source-over';
          label(g, env, `Where they overlap: ${env.theme.blend}`, 12, 14);
        },
      };
    },
  },
  'variable-font': {
    slider: { label: 'Wider letters', min: 0, max: 1, step: 0.05, default: 0.6 },
    make(env) {
      let t = 0;
      return {
        step(dt) {
          t += dt;
        },
        draw(g) {
          const weight = Math.round(lerp(100, 900, (Math.sin(t * 1.4) + 1) / 2));
          g.font = `${weight} 64px Anybody, system-ui, sans-serif`;
          try {
            g.fontStretch = env.v > 0.75 ? 'expanded' : env.v > 0.4 ? 'normal' : 'condensed';
          } catch {
            /* older browsers */
          }
          g.fillStyle = env.theme.ink;
          g.textAlign = 'center';
          g.textBaseline = 'middle';
          g.fillText('Aa', env.w / 2, env.h * 0.5);
          g.textAlign = 'left';
          label(g, env, `Weight ${weight}`, 12, 14);
        },
      };
    },
  },
  opacity: {
    slider: { label: 'Lowest opacity', min: 0, max: 1, step: 0.05, default: 0.2 },
    make(env) {
      let t = 0;
      return {
        step(dt) {
          t += dt;
        },
        draw(g) {
          const o = lerp(env.v, 1, (Math.sin(t * 2) + 1) / 2);
          g.globalAlpha = o;
          dot(g, env.w / 2, env.h / 2, Math.min(env.h * 0.32, 50), env.theme.c1);
          g.globalAlpha = 1;
          label(g, env, `Opacity ${o.toFixed(2)}`, 12, 14);
        },
      };
    },
  },
  transform: {
    make(env) {
      let t = 0;
      const names = ['Move', 'Scale', 'Rotate', 'Skew'];
      return {
        step(dt) {
          t += dt;
        },
        draw(g) {
          const k = Math.floor(t / 1.5) % 4;
          const u = smoothstep(0, 1, (t % 1.5) / 1.5);
          const m = u < 0.5 ? u * 2 : (1 - u) * 2;
          g.save();
          g.translate(env.w / 2, env.h / 2);
          if (k === 0) g.translate((m - 0.5) * env.w * 0.4, 0);
          if (k === 1) g.scale(1 + m * 0.8, 1 + m * 0.8);
          if (k === 2) g.rotate(m * 1.2);
          if (k === 3) g.transform(1, 0, m * 0.8 - 0.4, 1, 0, 0);
          g.fillStyle = env.theme.c1;
          g.fillRect(-28, -28, 56, 56);
          g.restore();
          label(g, env, names[k]!, 12, 14);
        },
      };
    },
  },
  'frame-rate': {
    slider: {
      label: 'Frames per second for the bottom dot',
      min: 4,
      max: 60,
      step: 2,
      default: 12,
    },
    make(env) {
      let t = 0;
      return {
        step(dt) {
          t += dt;
        },
        draw(g) {
          const x = (time: number) => 24 + ((time * 0.35) % 1) * (env.w - 48);
          const choppy = Math.floor(t * env.v) / env.v;
          track(g, env, env.h * 0.35);
          track(g, env, env.h * 0.7);
          dot(g, x(t), env.h * 0.35, 12, env.theme.c1);
          dot(g, x(choppy), env.h * 0.7, 12, env.theme.c2);
          label(g, env, 'Smooth', 24, env.h * 0.2);
          label(g, env, `${env.v} frames per second`, 24, env.h * 0.55);
        },
      };
    },
  },
  'reduced-motion': {
    make(env) {
      let t = 0;
      return {
        step(dt) {
          t += dt;
        },
        draw(g) {
          const half = env.w / 2;
          const y = env.h / 2 + Math.sin(t * 3) * env.h * 0.2;
          dot(g, half / 2, y, 14, env.theme.c1);
          dot(g, half + half / 2, env.h / 2, 14, env.theme.c1);
          g.strokeStyle = env.theme.inkSoft;
          g.globalAlpha = 0.3;
          g.beginPath();
          g.moveTo(half, 14);
          g.lineTo(half, env.h - 14);
          g.stroke();
          g.globalAlpha = 1;
          label(g, env, 'Motion on', 12, env.h - 12);
          label(g, env, 'Reduced motion: holds still', half + 12, env.h - 12);
        },
      };
    },
  },
};

// Spring-with-overshoot helper kept for demos that want a bouncy entrance.
export const bouncy = backOut;
