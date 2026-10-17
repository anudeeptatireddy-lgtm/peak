import type { Param } from '../types';
import { FIXED } from './constants';

// Every number that shapes this scene is a param (owner, 2026-10-16).

export const params: Param[] = [
  /* ---------- Look ---------- */
  {
    kind: 'text',
    id: 'labels',
    label: 'Card labels',
    help: 'Up to six labels, separated by commas.',
    group: 'Look',
    maxLength: 108,
    default: 'Drag me, Tap me, Me too',
    key: true,
    phrase: (v: string, all) =>
      `A few cards in a full-screen section (100svh, at least 540px), labeled ${v} (split at commas, trimmed, at most ${FIXED.MAX_CARDS} cards, each label cut to ${FIXED.MAX_LABEL} characters; "${FIXED.FALLBACK}" if empty). Each card is a real button ${all.cardW}px wide and ${all.cardW} × ${all.cardRatio}px tall, in the surface color with a ${FIXED.BORDER}px border in an accent color (the first, second and third accent in turn), corner radius ${FIXED.RADIUS}px, with its label centered in the main text color (Anybody weight ${FIXED.WEIGHT}). At rest the cards stand in a row centered in the section, ${FIXED.SPACING} × the card width apart, each turned ${FIXED.FAN}° more than the one before so the row fans out around the middle card.`,
  },
  {
    kind: 'slider',
    id: 'cardW',
    label: 'Card width',
    help: 'Width of each card in pixels.',
    group: 'Look',
    min: 100,
    max: 240,
    step: 10,
    default: 150,
    unit: 'px',
    phrase: (v: number) => `Card width ${v}px.`,
    phraseIn: 'labels',
  },
  {
    kind: 'slider',
    id: 'cardRatio',
    label: 'Card height',
    help: 'Card height as a multiple of its width.',
    group: 'Look',
    min: 0.6,
    max: 1.5,
    step: 0.05,
    default: 1,
    phrase: (v: number) => `Card height ${v} × width.`,
    phraseIn: 'labels',
  },
  /* ---------- Motion ---------- */
  {
    kind: 'slider',
    id: 'wobble',
    label: 'Wobble',
    help: 'How much a card leans, stretches and tips when it moves or jiggles.',
    group: 'Motion',
    min: 0,
    max: 1,
    step: 0.05,
    default: 0.6,
    key: true,
    phrase: (v: number) =>
      `While a card moves, its lean (skewX) is −velocity x × ${FIXED.LEAN_GAIN} × ${v} degrees (at most ±${FIXED.MAX_LEAN}°) and its stretch is speed × ${FIXED.STRETCH_GAIN} × ${v} (at most ${FIXED.MAX_STRETCH}): scaleX = 1 + stretch, scaleY = 1 − stretch ÷ 2. Velocity is in pixels per frame.`,
  },
  {
    kind: 'slider',
    id: 'stiffness',
    label: 'Springiness',
    help: 'How hard a card is pulled to where it should be.',
    group: 'Motion',
    term: 'spring',
    min: 0.05,
    max: 0.4,
    step: 0.01,
    default: 0.15,
    key: true,
    phrase: (v: number, all) =>
      `Each card's centre follows its target with a spring each frame: velocity += (target − position) × ${v} × f, then velocity *= ${all.settle}^f, then position += velocity × f (x and y separately), f = min(dt × 60, 2.5). The jiggle (squash and tilt) uses the same spring toward 0 with the same damping.`,
  },
  {
    kind: 'slider',
    id: 'settle',
    label: 'Settle speed',
    help: 'How quickly the wobble dies out. Lower settles faster; higher keeps wobbling.',
    group: 'Motion',
    term: 'damping',
    min: 0.8,
    max: 0.98,
    step: 0.01,
    default: 0.88,
    phrase: (v: number) => `Damping ${v}.`,
    phraseIn: 'stiffness',
  },
  /* ---------- Interaction ---------- */
  {
    kind: 'slider',
    id: 'squish',
    label: 'Squish on tap',
    help: 'How much a card squashes when you tap it.',
    group: 'Interaction',
    min: 0,
    max: 0.4,
    step: 0.01,
    default: 0.15,
    key: true,
    phrase: (v: number) =>
      `A tap (or Enter or Space on a focused card) makes the card jiggle: its squash j is set to ${v} and then springs back to 0 (scaleY × (1 − j), scaleX × (1 + j × ${FIXED.SPREAD})), and it is tipped by ±${FIXED.JIGGLE_TILT}° × the wobble (random side) which also springs back. Dragging: pressing a card (on touch: pressing and holding about 250ms) lets the visitor drag it; its target follows the pointer (keeping the spot where it was grabbed) so the card lags behind and leans; on release the target stays where it was dropped, so the card wobbles to rest there. A press that moves less than ${FIXED.DRAG_SLOP}px is a tap, not a drag. Cards turn to straight once they have been dragged.`,
  },
];
