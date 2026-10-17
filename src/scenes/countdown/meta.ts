import type { SceneMeta } from '../types';
import { FIXED } from './constants';

export const meta: SceneMeta = {
  slug: 'countdown',
  title: 'Event countdown',
  summary:
    'Days, hours, minutes and seconds flip like an airport board, and confetti bursts at zero.',
  useCase: 'A countdown page for a party, launch or exam.',
  tags: ['Events'],
  difficulty: 'Medium',
  minutes: 20,
  world: 'dunes',
  terms: ['transform', 'easing', 'frame-rate'],
  howItWorks: [
    'Every second the page checks the real clock, subtracts it from your target time and splits what is left into days, hours, minutes and seconds.',
    'When a digit changes, the old digit and the new one swap with a 3D **transform**: a flap turns over the middle line, or the digit slides or rolls.',
    'The change is driven by a progress number that runs from 0 to 1, so it pauses with the rest of the page.',
    'At zero the page shows "It\'s time." and fires a burst of confetti.',
  ],
  whatElse: [
    'A countdown for a birthday party or wedding.',
    'A launch page that counts down to release.',
    'An exam timer for a class.',
  ],
  wants:
    'A countdown with the days, hours, minutes and seconds flipping like an airport board. At zero it shows "It\'s time." and bursts confetti.',
  lookLines: [
    'Size the confetti canvas for devicePixelRatio (capped at 2) and do all math in CSS pixels.',
    `When the time reaches zero, hide nothing: the digits stay at 00 and the words "${FIXED.TIME_TEXT}" appear under them at ${FIXED.TIME_SIZE} × the digit size in the main text color. If the target is already in the past when the page loads, show them straight away with no confetti.`,
    'Accessibility: keep a visually hidden live region (polite) that says the time left, such as "Launch party: 6 days, 23 hours, 59 minutes left", and update it only once a minute, never every second.',
  ],
  behaviorLines: [
    'Run one requestAnimationFrame loop. dt = seconds since the last frame, clamped to 0.05; f = min(dt × 60, 2.5).',
    'Reduced-motion still frame: the digits showing the time left right now, with no animation and no confetti.',
  ],
  interactionLines: [],
};
