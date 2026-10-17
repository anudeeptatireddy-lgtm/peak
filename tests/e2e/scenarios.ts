// Scripted moments for comparing two renders of a scene frame by frame: the
// prototype or a prompt-test page (`proto`) against ours. Used by parity.spec.ts
// and prompt-parity.spec.ts.
import type { Page } from '@playwright/test';

export type Pair = { proto: Page; ours: Page };
export type Scenario = (
  pp: Pair,
  step: (ms: number) => Promise<void>,
  view: { width: number; height: number },
) => AsyncGenerator<string>;

const both = async (pp: Pair, fn: (p: Page) => Promise<unknown>) => {
  for (const p of [pp.proto, pp.ours]) await fn(p);
};

/** Each scenario yields a name whenever both pages should be screenshotted and compared. */
export const SCENARIOS: Record<string, Scenario> = {
  async *particles(pp, step, { width, height }) {
    await step(500);
    yield 'intro';
    await step(6000);
    yield 'settled';
    const x = Math.round(width * 0.35);
    const y = Math.round(height * (width < 700 ? 0.4 : 0.43));
    await both(pp, (p) => p.mouse.move(x, y));
    await step(400);
    yield 'cursor';
    await both(pp, (p) => p.mouse.click(x + 40, y));
    await step(300);
    yield 'blast';
  },
  async *elastic(pp, step, { width, height }) {
    await step(1500);
    yield 'idle-wave';
    await both(pp, (p) => p.mouse.move(Math.round(width * 0.3), Math.round(height * 0.45)));
    await step(700);
    yield 'hover';
  },
  async *velocity(_pp, step) {
    await step(300);
    yield 'start';
    await step(2000);
    yield 'drift';
  },
  async *ripple(pp, step, { width, height }) {
    // The prototype's very first frame can run before its canvas is sized, so on a
    // phone its first automatic ring starts at the top-left corner (a prototype race,
    // see DECISIONS). Compare once that ring has expired (rings live 5 seconds).
    await step(5300);
    yield 'auto-ripples';
    await both(pp, (p) => p.mouse.move(Math.round(width * 0.3), Math.round(height * 0.5)));
    await step(300);
    yield 'cursor';
    await both(pp, (p) => p.mouse.click(Math.round(width * 0.6), Math.round(height * 0.4)));
    await step(500);
    yield 'click';
  },
  async *flow(pp, step, { width, height }) {
    // A flow field never settles, and a loading frame or two can differ between the
    // pages, so the live field is compared by where its ink is (inkGrid). The
    // prototype's reduced-motion still frame is blank, so there is nothing to compare
    // there; ours draws the 70 steps PRD SCENES #22 asks for (see DECISIONS).
    await step(2000);
    yield 'signature:trails';
    await both(pp, (p) => p.mouse.move(Math.round(width * 0.5), Math.round(height * 0.5)));
    await both(pp, (p) => p.mouse.down());
    await step(1500);
    yield 'signature:stir';
    await both(pp, (p) => p.mouse.up());
  },
  async *warp(pp, step, { width, height }) {
    await step(1000);
    yield 'cruise';
    await both(pp, (p) => p.mouse.move(Math.round(width * 0.3), Math.round(height * 0.3)));
    await both(pp, (p) => p.mouse.down());
    await step(1500);
    yield 'warp';
    await both(pp, (p) => p.mouse.up());
    await step(800);
    yield 'slowing';
  },
  async *scramble(_pp, step) {
    // Mid-decode the scrambling characters come from Math.random in a fixed order,
    // so seeded pages should flicker identically; then the settled text.
    await step(400);
    yield 'decoding';
    await step(3200);
    yield 'settled';
  },
  async *marbles(pp, step, { width, height }) {
    await step(800);
    yield 'whole';
    await both(pp, (p) => p.mouse.click(Math.round(width * 0.5), Math.round(height * 0.45)));
    await step(250);
    yield 'shatter';
    // A settling pile is chaotic: compare where its ink is, not every pixel.
    await step(2500);
    yield 'signature:pile';
    await both(pp, (p) => p.mouse.click(Math.round(width * 0.5), Math.round(height * 0.45)));
    await step(2500);
    yield 'rebuilt';
  },
  async *skid(pp, step, { width, height }) {
    await step(450);
    yield 'arriving';
    await step(2500);
    yield 'parked';
    await both(pp, (p) => p.mouse.click(Math.round(width * 0.5), Math.round(height * 0.3)));
    await step(600);
    yield 'replay';
  },
  async *echo(pp, step, { width, height }) {
    await step(1500);
    yield 'drift';
    await both(pp, (p) => p.mouse.move(Math.round(width * 0.62), Math.round(height * 0.4)));
    await step(800);
    yield 'follow';
  },
  async *neon(_pp, step) {
    await step(700);
    yield 'warming';
    await step(5000);
    yield 'lit';
  },
  async *fire(pp, step, { width, height }) {
    // Flames are per-cell noise: compare where the fire is, not every pixel.
    await step(1500);
    yield 'signature:flames';
    await both(pp, (p) => p.mouse.move(Math.round(width * 0.3), Math.round(height * 0.45)));
    await step(800);
    yield 'signature:fanned';
  },
  async *pluck(pp, step, { width, height }) {
    await step(500);
    yield 'rest';
    // Sweep across the strings, then let them ring.
    await both(pp, (p) => p.mouse.move(Math.round(width * 0.2), Math.round(height * 0.5)));
    for (let k = 1; k <= 12; k++) {
      await both(pp, (p) =>
        p.mouse.move(Math.round(width * (0.2 + k * 0.05)), Math.round(height * 0.5)),
      );
      await step(16);
    }
    await step(200);
    yield 'ringing';
    await both(pp, (p) => p.mouse.move(Math.round(width * 0.5), Math.round(height * 0.02)));
    await step(3500);
    yield 'ghost';
  },
  async *drop(pp, step, { width, height }) {
    await step(1200);
    yield 'falling';
    await step(4000);
    yield 'signature:pile';
    await both(pp, (p) => p.mouse.click(Math.round(width * 0.5), Math.round(height * 0.3)));
    await step(400);
    yield 'signature:tap';
  },
};
