import type { Param } from '../types';
import { FIXED } from './constants';

// Every number that shapes this scene is a param (owner, 2026-10-16).

const plain = (iso: string) => iso.replace('T', ' at ');

export const params: Param[] = [
  /* ---------- Look ---------- */
  {
    kind: 'text',
    id: 'event',
    label: 'Event name',
    help: 'What you are counting down to.',
    group: 'Look',
    maxLength: 32,
    default: 'Launch party',
    key: true,
    phrase: (v: string, all) =>
      `A full-screen section (100svh, at least 540px) centered on the page: the event name "${v}" in the main text color at ${FIXED.EVENT_SIZE} × the digit size, then a row of four units (${FIXED.LABELS.join(', ')}) each made of flip-clock digit cards, each unit's label under it in the soft text color at ${FIXED.LABEL_SIZE} × the digit size. Digits are Anybody weight ${FIXED.DIGIT_WEIGHT} at ${all.digitSize}rem. Every digit is its own card ${FIXED.CARD_W}em wide and ${FIXED.CARD_H}em tall (em of the digit size), corner radius ${FIXED.CARD_RADIUS}em, the main text color as its background with the page background color for the digit. Two cards per unit (${FIXED.MIN_DAY_DIGITS} for days, or 3 once there are 100 or more), ${FIXED.PAIR_GAP}em apart, units ${all.gap}rem apart (wrapping on a narrow screen).`,
  },
  {
    kind: 'slider',
    id: 'digitSize',
    label: 'Digit size',
    help: 'Size of the digits in rem (a rem is the page base text size).',
    group: 'Look',
    min: 2,
    max: 8,
    step: 0.25,
    default: 4.5,
    unit: 'rem',
    phrase: (v: number) => `Digit size ${v}rem.`,
    phraseIn: 'event',
  },
  {
    kind: 'slider',
    id: 'gap',
    label: 'Gap between units',
    help: 'Space between days, hours, minutes and seconds, in rem.',
    group: 'Look',
    min: 0.5,
    max: 3,
    step: 0.25,
    default: 1.25,
    unit: 'rem',
    phrase: (v: number) => `Unit gap ${v}rem.`,
    phraseIn: 'event',
  },
  {
    kind: 'select',
    id: 'style',
    label: 'Digit style',
    help: 'How a digit changes: flip like an airport board, slide up, or roll like a drum.',
    group: 'Look',
    options: [
      { value: 'flip', label: 'Flip' },
      { value: 'slide', label: 'Slide' },
      { value: 'roll', label: 'Roll' },
    ],
    default: 'flip',
    key: true,
    phrase: (v: string, all) =>
      `When a digit changes it animates for ${all.flipTime}s with progress p from 0 to 1 (driven by the animation clock, so it freezes when paused). ${
        v === 'flip'
          ? `Flip: each card is two halves. The top half shows the new digit, the bottom half the old one. A flap hinged on the middle line shows the old digit's top half turning down about the x axis from 0° to −90° while p < 0.5 (then it disappears), and then the new digit's bottom half turning down from 90° to 0° while p ≥ 0.5; at p = 1 the bottom half becomes the new digit. Use perspective ${FIXED.PERSPECTIVE}em on the card and hide back faces.`
          : v === 'slide'
            ? 'Slide: inside a card that clips its content, the old digit slides up out of the card by translateY(−100% × p) while the new digit slides up into place from translateY(100% × (1 − p)).'
            : `Roll: like a drum turning toward you. Inside a clipped card with perspective ${FIXED.PERSPECTIVE}em, the old digit rotates about the x axis by 90° × p around its bottom edge while fading out, and the new digit rotates from −90° × (1 − p) around its top edge while fading in.`
      }`,
  },
  /* ---------- Motion ---------- */
  {
    kind: 'slider',
    id: 'flipTime',
    label: 'Change time',
    help: 'How long a digit takes to change, in seconds.',
    group: 'Motion',
    min: 0.1,
    max: 1,
    step: 0.05,
    default: 0.5,
    unit: 's',
    phrase: (v: number) => `Change time ${v}s.`,
    phraseIn: 'style',
  },
  /* ---------- Interaction ---------- */
  {
    kind: 'toggle',
    id: 'inWeek',
    label: 'Count down to 7 days from now',
    help: 'On: the target is one week after the page loads. Off: use the date and time below.',
    group: 'Look',
    default: true,
    key: true,
    phrase: (v: boolean, all) =>
      v
        ? `The countdown target is ${FIXED.DEFAULT_DAYS} days after the page loads, in the visitor's local time. Time left = target − now (the real clock), split into days, hours (0–${FIXED.DAY - 1}), minutes (0–${FIXED.HOUR - 1}) and seconds (0–${FIXED.MINUTE - 1}), updated every second.`
        : `The countdown target is ${plain(String(all.target))} in the visitor's local time. Time left = target − now (the real clock), split into days, hours (0–${FIXED.DAY - 1}), minutes (0–${FIXED.HOUR - 1}) and seconds (0–${FIXED.MINUTE - 1}), updated every second.`,
  },
  {
    kind: 'datetime',
    id: 'target',
    label: 'Date and time',
    help: 'The moment you are counting down to, in your local time.',
    group: 'Look',
    when: { id: 'inWeek', is: [false] },
    default: () => '2031-01-01T09:00',
    phrase: (v: string) => `Target ${plain(v)}.`,
    phraseIn: 'inWeek',
  },
  {
    kind: 'toggle',
    id: 'celebrate',
    label: 'Celebrate at zero',
    help: 'Burst confetti when the countdown reaches zero while the page is open.',
    group: 'Interaction',
    default: true,
    phrase: (v: boolean) =>
      v
        ? `When the time left first reaches zero while the page is open, fire one burst of ${FIXED.BURST.count} confetti pieces upward from the bottom center (at ${FIXED.BURST_Y * 100}% of the height) over the digits: spread ${FIXED.BURST.spread}°, speed ${FIXED.BURST.speed} plus up to ${FIXED.BURST.speedRange}, size ${FIXED.BURST.size}px, spin ±${FIXED.BURST.spin}, flutter ${FIXED.BURST.flutter}, gravity ${FIXED.BURST.gravity}, drag ${FIXED.BURST.drag}, wobble ${FIXED.BURST.wobble}, ribbons ${FIXED.BURST.ribbon} × as long as wide, a mix of squares, ribbons and circles in the three accent colors, on a canvas behind the digits. Pieces tumble like cards (width follows cos of a phase) and are removed when they fall below the screen.`
        : 'No confetti at zero.',
  },
];
