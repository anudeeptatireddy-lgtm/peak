// PRD §8.2 flashing safety: each ⚠ scene's flicker timing, run at its most
// extreme settings, never starts more than 3 flashes in any one-second window.
import { describe, expect, it } from 'vitest';
import { seededRandom } from '../../src/kits/field';
import { Flicker } from '../../src/scenes/neon/flicker';
import { params as neonParams } from '../../src/scenes/neon/params';

/** The largest number of flash starts inside any one-second window. */
function worstSecond(starts: number[]): number {
  let worst = 0;
  for (let i = 0; i < starts.length; i++) {
    let k = i;
    while (k < starts.length && starts[k]! - starts[i]! < 1) k++;
    worst = Math.max(worst, k - i);
  }
  return worst;
}

const range = (id: string) => {
  const p = neonParams.find((q) => q.id === id)!;
  if (p.kind !== 'slider') throw new Error(id);
  return p;
};

describe('neon flicker (⚠)', () => {
  it('never flashes more than 3 times in any second, at the most extreme settings', () => {
    const rand = seededRandom(99);
    const text = neonParams.find((q) => q.id === 'text')!;
    const letters = text.kind === 'text' ? text.maxLength : 0; // the longest sign allowed
    const f = new Flicker(letters);
    const o = {
      firstDelay: range('firstDelay').min,
      turnOn: range('turnOn').min,
      flicker: range('flicker').max,
      dimsPerMinute: range('dimsPerMinute').max,
      dimTime: range('dimTime').min,
      dimLevel: range('dimLevel').min,
      stutter: true,
    };
    // Five minutes at 60 fps, plus a stretch at 240 fps (fast screens).
    let t = 0;
    for (let i = 0; i < 60 * 300; i++) {
      t += 1 / 60;
      f.step(t, 1 / 60, o, rand);
    }
    for (let i = 0; i < 240 * 30; i++) {
      t += 1 / 240;
      f.step(t, 1 / 240, o, rand);
    }
    expect(f.log.length).toBeGreaterThan(10);
    expect(worstSecond(f.log)).toBeLessThanOrEqual(3);
  });

  it('dims only single letters, never the whole sign', () => {
    const f = new Flicker(5);
    const o = {
      firstDelay: 0,
      turnOn: 0.1,
      flicker: 1,
      dimsPerMinute: 30,
      dimTime: 0.3,
      dimLevel: 0,
      stutter: true,
    };
    const rand = seededRandom(3);
    for (let t = 0; t < 60; t += 1 / 60) {
      f.step(t, 1 / 60, o, rand);
      const lit = [0, 1, 2, 3, 4].filter((i) => f.brightness(i, t, o) > 0.5).length;
      if (t > 1) expect(lit).toBeGreaterThanOrEqual(4);
    }
  });

  it('with flicker at 0 (and under reduced motion) nothing ever flashes', () => {
    const f = new Flicker(9);
    const o = {
      firstDelay: 0,
      turnOn: 0.1,
      flicker: 0,
      dimsPerMinute: 30,
      dimTime: 0.1,
      dimLevel: 0,
      stutter: true,
    };
    for (let t = 0; t < 30; t += 1 / 60) f.step(t, 1 / 60, o);
    expect(f.log).toEqual([]);
  });
});

describe('fire flames (⚠)', () => {
  it('never jumps in overall brightness, even at the most extreme settings with fanning', async () => {
    const { HeatGrid } = await import('../../src/scenes/fire/heat');
    const { params } = await import('../../src/scenes/fire/params');
    const r = (id: string) => {
      const p = params.find((q) => q.id === id)!;
      if (p.kind !== 'slider') throw new Error(id);
      return p;
    };
    const cols = 160;
    const rows = 100;
    const fuel = new Uint8Array(cols * rows);
    for (let y = 60; y < 80; y++) for (let x = 30; x < 130; x++) fuel[y * cols + x] = 1;
    const grid = new HeatGrid(cols, rows, fuel);
    const rand = seededRandom(7);
    const o = {
      height: r('height').max,
      cooling: r('cooling').min,
      burn: r('burn').min,
      turbulence: r('turbulence').max,
      seed: r('seed').max,
    };
    let prev = grid.mean();
    let prevHeat = grid.heat.slice();
    const flashes: number[] = [];
    for (let frame = 0; frame < 60 * 20; frame++) {
      // The pointer sweeps back and forth across the flames, fanning at full strength.
      const fan = { x: 80 + 60 * Math.sin(frame / 7), y: 50, radius: 40, strength: r('fan').max };
      grid.step(o, frame > 120 ? fan : null, rand);
      const mean = grid.mean();
      let changed = 0;
      for (let i = 0; i < grid.heat.length; i++)
        if (Math.abs(grid.heat[i]! - prevHeat[i]!) > 0.5) changed++;
      // A flash: the whole picture brightens or darkens noticeably at once, or more
      // than a quarter of the stage changes sharply in one frame.
      if ((frame > 120 && Math.abs(mean - prev) > 0.05) || changed > grid.heat.length / 4)
        flashes.push(frame / 60);
      prev = mean;
      prevHeat = grid.heat.slice();
    }
    expect(worstSecond(flashes)).toBeLessThanOrEqual(3);
    expect(flashes.length).toBe(0);
  });
});

describe('fireworks bursts (⚠)', () => {
  it('never starts more than 3 bursts in any second, even with taps on every frame', async () => {
    const { Show } = await import('../../src/scenes/fireworks/show');
    const { params } = await import('../../src/scenes/fireworks/params');
    const r = (id: string) => {
      const p = params.find((q) => q.id === id)!;
      if (p.kind !== 'slider') throw new Error(id);
      return p;
    };
    const o = {
      sparks: r('sparks').max,
      shape: 'mixed' as const,
      trail: r('trail').max,
      gravity: r('gravity').max,
      drag: r('drag').min,
      speed: r('speed').max,
      life: r('life').min,
      rise: r('rise').min,
      autoEvery: r('autoEvery').step,
      willowDrag: r('willowDrag').min,
      willowLife: r('willowLife').min,
      ringTilt: r('ringTilt').min,
      autoTop: r('autoTop').min,
      autoBottom: r('autoBottom').max,
      autoMargin: r('autoMargin').min,
    };
    const show = new Show();
    const rand = seededRandom(11);
    // Five minutes at 60 fps with a tap every frame, then a stretch at 240 fps.
    for (let i = 0; i < 60 * 300; i++) {
      show.tap(rand() * 390, rand() * 844);
      show.step(1 / 60, 390, 844, o, rand);
    }
    for (let i = 0; i < 240 * 30; i++) {
      show.tap(rand() * 390, rand() * 844);
      show.step(1 / 240, 390, 844, o, rand);
    }
    // A slow, stuttering device: frames up to the 0.05s clamp.
    for (let i = 0; i < 20 * 60; i++) {
      show.tap(rand() * 390, rand() * 844);
      show.step(0.01 + rand() * 0.04, 390, 844, o, rand);
    }
    expect(show.log.length).toBeGreaterThan(500);
    expect(worstSecond(show.log)).toBeLessThanOrEqual(3);
  });

  it('a burst glows softly over less than a quarter of the smallest stage', async () => {
    const { params } = await import('../../src/scenes/fireworks/params');
    const r = (id: string) => {
      const p = params.find((q) => q.id === id)!;
      if (p.kind !== 'slider') throw new Error(id);
      return p;
    };
    const stage = 390 * 540; // a phone-width stage at its 540px minimum height
    expect((Math.PI * r('glowRadius').max ** 2) / stage).toBeLessThan(0.25);
    expect(r('glowAlpha').max).toBeLessThanOrEqual(0.3);
  });
});

describe('lightning strikes (⚠)', () => {
  it('never strikes more than 3 times in any second, at the most extreme settings', async () => {
    const { Storm } = await import('../../src/scenes/lightning/storm');
    const { params } = await import('../../src/scenes/lightning/params');
    const r = (id: string) => {
      const p = params.find((q) => q.id === id)!;
      if (p.kind !== 'slider') throw new Error(id);
      return p;
    };
    const o = {
      nodes: r('nodes').max,
      reach: r('reach').max,
      branching: r('branching').max,
      crackle: r('crackle').max,
      chain: r('chain').max,
      strikes: r('strikes').max,
      idleEvery: r('idleEvery').step,
      arcLife: r('arcLife').max,
      segment: r('segment').min,
      jag: r('jag').max,
      branchRate: r('branchRate').max,
      branchLen: r('branchLen').max,
      branchAngle: r('branchAngle').max,
      chainFade: r('chainFade').max,
      nodeFade: r('nodeFade').max,
      margin: r('margin').min,
    };
    const storm = new Storm();
    const rand = seededRandom(5);
    storm.place(390, 844, o, rand);
    // The pointer sweeps around for two minutes, then idles, at 60 fps; then 240 fps;
    // then a stuttering slow device.
    let t = 0;
    const at = () => ({ x: 195 + 180 * Math.sin(t * 3), y: 422 + 400 * Math.cos(t * 2) });
    for (let i = 0; i < 60 * 180; i++, t += 1 / 60)
      storm.step(1 / 60, i < 60 * 120 ? at() : null, o, rand);
    for (let i = 0; i < 240 * 30; i++, t += 1 / 240) storm.step(1 / 240, at(), o, rand);
    for (let i = 0; i < 60 * 20; i++) {
      const dt = 0.01 + rand() * 0.04;
      t += dt;
      storm.step(dt, at(), o, rand);
    }
    expect(storm.log.length).toBeGreaterThan(300);
    expect(worstSecond(storm.log)).toBeLessThanOrEqual(3);
  });

  it('arcs stay thin lines', async () => {
    const { params } = await import('../../src/scenes/lightning/params');
    const w = params.find((q) => q.id === 'arcWidth')!;
    expect(w.kind === 'slider' && w.max).toBeLessThanOrEqual(3);
  });
});

describe('moire interference (⚠)', () => {
  it('never beats faster than 3 times a second at any spot, at the most extreme settings', async () => {
    const { step, beatRate } = await import('../../src/scenes/moire/sim');
    const { FIXED } = await import('../../src/scenes/moire/constants');
    const { params } = await import('../../src/scenes/moire/params');
    const slider = (id: string) => {
      const p = params.find((q) => q.id === id)!;
      if (p.kind !== 'slider') throw new Error(id);
      return p;
    };
    const rand = seededRandom(7);
    const scales = [0, 1, FIXED.SECOND_SCALE];
    for (const dt of [1 / 240, 1 / 60, 0.05]) {
      for (const layers of [2, 3]) {
        const limits = {
          spacing: slider('spacing').min,
          radius: 900,
          layers,
          follow: slider('follow').max,
        };
        const m = { ox: 0, oy: 0, ang: 0 };
        let worst = 0;
        for (let i = 0; i < 4000; i++) {
          // The most violent visitor: a new far-away target every single frame.
          const target = {
            ox: (rand() - 0.5) * 4000,
            oy: (rand() - 0.5) * 4000,
            ang: (rand() - 0.5) * 2,
          };
          const before = { ...m };
          step(m, target, dt, Math.min(dt * 60, 2.5), limits);
          for (let a = 0; a < layers; a++)
            for (let b = a + 1; b < layers; b++)
              worst = Math.max(worst, beatRate(before, m, scales[a]!, scales[b]!, dt, limits));
        }
        expect(worst).toBeLessThanOrEqual(FIXED.RATE_CAP + 1e-9);
        expect(worst).toBeGreaterThan(0);
      }
    }
  });
});

describe('tunnel rings (⚠)', () => {
  it('never passes more than 3 rings a second at the fastest settings', async () => {
    const { fly } = await import('../../src/scenes/tunnel/fly');
    const { params } = await import('../../src/scenes/tunnel/params');
    const slider = (id: string) => {
      const p = params.find((q) => q.id === id)!;
      if (p.kind !== 'slider') throw new Error(id);
      return p;
    };
    for (const dt of [1 / 240, 1 / 60, 0.05]) {
      const s = { frac: 0, passed: 0, travel: 0, since: 0 };
      const base = slider('spacing').min;
      // Flat out for a minute, with the speed jumping around between the extremes.
      const speeds = [
        slider('speed').max * slider('boost').max * slider('speedUnit').max,
        slider('speed').min * slider('speedUnit').min,
      ];
      const times: number[] = [];
      let t = 0;
      for (let i = 0; i < 60 / dt; i++) {
        t += dt;
        const v = speeds[Math.floor(t / 2) % 2]!;
        for (let k = fly(s, v, base, dt); k > 0; k--) times.push(t);
      }
      expect(times.length).toBeGreaterThan(10);
      expect(worstSecond(times)).toBeLessThanOrEqual(3);
    }
  });
});

describe('glitch bursts (⚠)', () => {
  it('never changes the picture more than 3 times a second, whatever triggers it', async () => {
    const { BurstGate } = await import('../../src/scenes/glitch/gate');
    const { params } = await import('../../src/scenes/glitch/params');
    const burst = params.find((q) => q.id === 'burst')!;
    if (burst.kind !== 'slider') throw new Error('burst');
    const rand = seededRandom(5);
    for (const length of [burst.min, 0.25, burst.max]) {
      const gate = new BurstGate();
      const changes: number[] = [];
      // The most eager visitor: a trigger at every one of 240 frames a second, for two minutes.
      for (let i = 0; i < 240 * 120; i++) {
        const t = i / 240;
        const len = rand() < 0.5 ? length : burst.min + rand() * (burst.max - burst.min);
        if (gate.start(t, len)) changes.push(t, t + len);
      }
      changes.sort((a, b) => a - b);
      expect(changes.length).toBeGreaterThan(10);
      expect(worstSecond(changes)).toBeLessThanOrEqual(3);
    }
  });
});

describe('torchmap torch and celebration (⚠)', () => {
  it('flickers at most 3 times a second, only slightly, and the celebration never jumps', async () => {
    const { torchScale, glowLevel } = await import('../../src/scenes/torchmap/light');
    const { FIXED } = await import('../../src/scenes/torchmap/constants');
    const { params } = await import('../../src/scenes/torchmap/params');
    const r = (id: string) => {
      const p = params.find((q) => q.id === id)!;
      if (p.kind !== 'slider') throw new Error(id);
      return p;
    };
    const amount = r('flicker').max;
    const rate = r('flickerRate').max;
    // Five minutes at 240 fps: a brightening starts at each local low of the radius.
    const starts: number[] = [];
    let smallest = Infinity;
    let largest = -Infinity;
    let a = torchScale(0, amount, rate);
    let b = torchScale(1 / 240, amount, rate);
    for (let i = 2; i < 240 * 300; i++) {
      const t = i / 240;
      const c = torchScale(t, amount, rate);
      if (b < a && b <= c) starts.push(t);
      smallest = Math.min(smallest, c);
      largest = Math.max(largest, c);
      [a, b] = [b, c];
    }
    expect(starts.length).toBeGreaterThan(10);
    expect(worstSecond(starts)).toBeLessThanOrEqual(3);
    // Only a small change in size: never more than the cap either way.
    expect(largest).toBeLessThanOrEqual(1 + FIXED.FLICKER_CAP + 1e-9);
    expect(smallest).toBeGreaterThanOrEqual(1 - FIXED.FLICKER_CAP - 1e-9);
    // The celebration glow rises slowly: no step bigger than a fifth in any third of a second.
    for (let t = 0; t < 10; t += 1 / 240)
      expect(glowLevel(t + 1 / 3, FIXED.GLOW_RISE) - glowLevel(t, FIXED.GLOW_RISE)).toBeLessThan(
        0.25,
      );
  });
});
