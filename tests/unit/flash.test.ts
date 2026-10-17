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
