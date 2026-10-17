import type { SceneMeta } from '../types';

export const meta: SceneMeta = {
  slug: 'fireworks',
  title: 'Fireworks',
  summary: 'Tap to launch a rocket that climbs, slows and bursts into sparks with fading trails.',
  useCase: "A New Year's, party or launch page.",
  tags: ['Events', 'Just for fun'],
  difficulty: 'Medium',
  minutes: 20,
  world: 'golden',
  terms: ['particle-system', 'gravity', 'drag', 'trail'],
  howItWorks: [
    'A rocket rises along an easing curve, so it slows as it reaches the spot you tapped.',
    'There it bursts into a **particle system**: a few hundred sparks fly out in a sphere, a ring or a drooping willow.',
    'Every frame **drag** slows each spark a little and **gravity** pulls it down, and each one draws a **trail** through its last few positions.',
    'For safety, bursts are spaced at least a third of a second apart, however fast you tap, and each one only glows softly around itself.',
  ],
  whatElse: [
    'A New Year countdown that ends in a show.',
    'A launch page that celebrates when the product goes live.',
    'A "you did it" screen at the end of a course.',
  ],
  wants:
    'Fireworks across the whole screen. Tapping launches a rocket that climbs to where I tapped, slows down and bursts into colored sparks with fading trails, which droop and fade as they fall. A rocket also goes up by itself every few seconds so it never looks empty.',
  lookLines: [
    'A full-screen canvas (100svh, at least 540px), transparent over the background and cleared every frame. Size it for devicePixelRatio (capped at 2) and do all math in CSS pixels.',
  ],
  behaviorLines: [
    'Run one requestAnimationFrame loop. dt = seconds since the last frame, clamped to 0.05; f = min(dt × 60, 2.5); t = seconds the loop has run (the sum of dt).',
    'Each frame, in this order: queue an automatic rocket if one is due, launch a queued rocket if allowed, move rockets and burst the ones that arrived, move sparks, draw.',
    'Safety: at most 3 bursts start in any one second, however fast I tap; nothing lights up the whole screen and the background never flashes.',
    'Reduced-motion still frame: three bursts (sphere, ring, willow, in the three accents) at 25%/34%, 50%/20% and 75%/40% of the width/height, 30 frames after they burst, with no rockets.',
  ],
  interactionLines: ['The canvas has touch-action: pan-y, so swipes still scroll.'],
};
