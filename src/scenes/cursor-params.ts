// The "Follow cursor" settings shared by scenes that don't react to the pointer on
// their own (owner, 2026-10-21; runtime in src/kits/cursor.ts). Off by default.

import type { Param } from './types';

/** For scroll-driven scenes: a sideways mouse sweep counts as scrolling. */
export function sweepParams(defaultPx: number): Param[] {
  return [
    {
      kind: 'toggle',
      id: 'cursor',
      label: 'Follow cursor',
      help: 'Moving the mouse sideways over the animation plays it, like scrolling.',
      group: 'Interaction',
      default: false,
      phrase: (v: boolean, all) =>
        v
          ? `Follow cursor: moving a mouse sideways over the canvas counts as scrolling. Each px it moves right adds ${all.cursorSweep} ÷ the canvas width px to the scroll position the scene reads (left takes it away), so one full left-to-right sweep is ${all.cursorSweep}px of scrolling. Touch is unchanged.`
          : 'The mouse position does not drive the scene; only scrolling does.',
    },
    {
      kind: 'slider',
      id: 'cursorSweep',
      label: 'Scroll per sweep',
      help: 'How much scrolling one full left-to-right mouse sweep counts as.',
      group: 'Interaction',
      when: { id: 'cursor', is: [true] },
      min: 200,
      max: 8000,
      step: 100,
      default: defaultPx,
      unit: 'px',
      phrase: (v: number) => `Sweep ${v}px.`,
      phraseIn: 'cursor',
    },
  ];
}

/** For everything else: the whole picture tilts toward the mouse. */
export const leanParams: Param[] = [
  {
    kind: 'toggle',
    id: 'cursor',
    label: 'Follow cursor',
    help: 'The whole animation tilts and shifts toward the mouse.',
    group: 'Interaction',
    default: false,
    phrase: (v: boolean, all) =>
      v
        ? `Follow cursor: while a mouse is over the stage, tilt everything toward it. With mx and my its position from −1 to 1 across the stage, aim for u = mx × ${all.cursorLean} and v = my × ${all.cursorLean}, ease u and v toward that by 1 − (1 − 0.1)^f per frame (back to 0 when the mouse leaves), and set the CSS transform of every layer the scene draws in (its canvas or HTML) to perspective(900px) rotateY(u × 12deg) rotateX(−v × 7.2deg) translate(u × 24px, v × 24px). Touch is unchanged.`
        : 'The picture does not tilt toward the mouse.',
  },
  {
    kind: 'slider',
    id: 'cursorLean',
    label: 'Lean amount',
    help: 'How far the animation tilts toward the mouse.',
    group: 'Interaction',
    when: { id: 'cursor', is: [true] },
    min: 0.1,
    max: 1,
    step: 0.05,
    default: 0.5,
    phrase: (v: number) => `Lean ${v}.`,
    phraseIn: 'cursor',
  },
];
