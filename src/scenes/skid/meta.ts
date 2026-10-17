import type { SceneMeta } from '../types';

export const meta: SceneMeta = {
  slug: 'skid',
  title: 'Skidding headline',
  summary: 'Letters drive in like cars, overshoot and skid to a stop. Scroll and they peel out.',
  useCase: 'A bold event or portfolio headline with attitude.',
  tags: ['Headlines', 'Events'],
  difficulty: 'Spicy',
  minutes: 30,
  world: 'newsprint',
  terms: ['easing', 'stagger', 'velocity', 'trail', 'scroll-linked'],
  howItWorks: [
    'Each letter drives in from the left, one after another: a **stagger** of a few milliseconds.',
    'Near its spot it skids: its position follows an **easing** curve that starts at full speed, slides past the spot, then settles back.',
    'While it skids it tilts and squashes, and its tires leave marks that fade like a **trail**, with puffs of smoke.',
    'Scrolling down makes the letters peel out to the right; scrolling back up brings them back: the motion is **scroll-linked**.',
  ],
  whatElse: [
    'An event poster headline that arrives with a screech.',
    'Navigation items that drive in when the page loads.',
    'A racing-themed 404 page.',
  ],
  wants:
    'A big headline whose letters drive in one by one from off-screen like cars, overshoot their spots and skid to a stop with a tilt and a squash, leaving smoky skid marks that fade. Parked, they idle with a small engine shake. Scrolling down makes them peel out the other way in a puff of smoke; scrolling back up brings them back in. Clicking replays the entrance.',
  lookLines: [
    'A full-screen canvas (100svh, at least 540px), transparent, cleared every frame. Size it for devicePixelRatio (capped at 2) and do all math in CSS pixels.',
    'Draw in this order each frame: skid marks, smoke puffs, then the letters.',
  ],
  behaviorLines: [
    'Run one requestAnimationFrame loop. dt = seconds since the last frame, clamped to 0.05; f = min(dt × 60, 2.5); t = seconds the loop has run.',
    'The first entrance starts when the letters are first laid out (once the Anybody font has loaded), at that moment’s t, not at page load. It plays again on a click or tap (on release) and when scrolling up brings the letters back, restarting every letter from the left; old marks and smoke stay until they fade. Handle clicks at the start of a frame, right after t += dt, so a replay starts at that frame’s t.',
    'Lay the letters out again on every resize and once the Anybody font has finished loading.',
    'If the page itself barely scrolls (a short page), give the section its own scroll area: an invisible scroller over it, three screens tall, that quietly jumps back by one screen whenever it gets within half a screen of either end, and read the scroll position from it (adding up the jumps).',
  ],
  interactionLines: [
    'Scroll (wheel, trackpad or touch) to make the letters peel out or come back; click or tap to replay the entrance. Vertical swipes keep scrolling (touch-action: pan-y).',
  ],
};
