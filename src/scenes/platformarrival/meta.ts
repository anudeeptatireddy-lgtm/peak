import type { SceneMeta } from '../types';

export const meta: SceneMeta = {
  slug: 'platformarrival',
  title: 'Platform Arrival',
  summary: 'The view from a train window slows into a station whose sign shows your name.',
  useCase: 'A travel, rail, booking or tourism intro.',
  tags: ['Intros', 'Scroll'],
  difficulty: 'Medium',
  minutes: 45,
  world: 'cherry',
  terms: ['parallax', 'velocity', 'spring', 'stiffness', 'scroll-linked'],
  howItWorks: [
    'The landscape is a stack of flat layers, each a wavy ridge filled below. Far layers move slowly and near ones fast (**parallax**), which reads as depth.',
    'Scrolling sets where the train should be, and the train follows on a **spring**: its **stiffness** sets how hard it brakes, and a little bounce makes it overshoot and rock back.',
    'At full **velocity** thin speed streaks slide past; they fade as the train slows.',
    'The platform and its sign glide in on a curve that eases to zero speed exactly at the stop (**scroll-linked**).',
  ],
  whatElse: [
    'A booking page where each scroll section stops at a new city.',
    'A tourism site that arrives at the destination as you reach the offer.',
    'A timeline where stations are milestones.',
  ],
  wants:
    'The view from a train window: flat, layered landscapes in bold travel-poster colors racing past at different speeds, with speed streaks. Scrolling slows the train, a platform glides in, and a hanging station sign showing a name eases into the middle as the train stops with a small bounce. Scrolling back sends it off again.',
  lookLines: [
    'A full-screen canvas (100svh, at least 540px), transparent over the background (the sky) and cleared every frame. Size it for devicePixelRatio (capped at 2) and do all math in CSS pixels.',
  ],
  behaviorLines: [
    'Run one requestAnimationFrame loop. dt = seconds since the last frame, clamped to 0.05. The train starts at full speed (arrival 0, goal 0).',
    'Measure the sign again on every resize and once more when the Anybody font has finished loading; the sign is not drawn before the font loads.',
    'Reduced-motion still frame: stopped at the platform (arrival 1), the sign hanging straight in the middle, no streaks.',
  ],
  interactionLines: ['The canvas has touch-action: pan-y, so vertical swipes still scroll.'],
  unreleased: true,
};
