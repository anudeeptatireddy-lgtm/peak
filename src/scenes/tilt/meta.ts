import type { SceneMeta } from '../types';
import { FIXED } from './constants';

export const meta: SceneMeta = {
  slug: 'tilt',
  title: 'Holographic card',
  summary: 'A card that tilts toward your cursor, with a sliding glare and a rainbow foil sheen.',
  useCase: 'A profile card, ID badge or product card.',
  tags: ['Portfolio', 'Cards'],
  difficulty: 'Medium',
  minutes: 20,
  world: 'abyss',
  terms: ['spring', 'damping', 'transform'],
  howItWorks: [
    'The card sits inside a **transform** with perspective, so turning it a few degrees makes one edge look closer, like a real card in your hand.',
    'The turn aims at the cursor, and a **spring** pulls the card toward that aim, so it glides and settles with a little wobble you can calm with **damping**.',
    'A soft glare and a rainbow foil layer slide across the card as it turns, which is what makes it look holographic.',
    'On a phone, tap "Use motion" and the card follows how you lean the device.',
  ],
  whatElse: [
    'A profile or portfolio card on a personal site.',
    'A conference badge or membership card.',
    'A product or collectible card that shimmers on hover.',
  ],
  wants:
    'A card with a name and a title in the middle of the page that tilts in 3D toward my cursor. A glare highlight and a rainbow foil sheen slide across it as it tilts, and it springs back to rest when I leave. On a phone it can follow how I tilt the device after I tap "Use motion".',
  lookLines: [
    `The name is set at ${FIXED.NAME_SIZE} × the card width in Anybody weight ${FIXED.NAME_WEIGHT}, and the title under it at ${FIXED.ROLE_SIZE} × the card width in weight ${FIXED.ROLE_WEIGHT} in the soft text color, with padding of ${FIXED.PADDING} × the card width. The card casts a soft shadow of the main text color: offset ${FIXED.SHADOW_OFFSET} × the card width down, blur ${FIXED.SHADOW_BLUR}px, at ${FIXED.SHADOW_ALPHA}% strength.`,
  ],
  behaviorLines: [
    'Run one requestAnimationFrame loop. dt = seconds since the last frame, clamped to 0.05; f = min(dt × 60, 2.5); t = seconds the loop has run (the sum of dt).',
    `Reduced-motion still frame: the card turned ${FIXED.STILL_TILT[0]}° about the x axis and ${FIXED.STILL_TILT[1]}° about the y axis, with the glare and foil to match, and nothing moving.`,
  ],
  interactionLines: [
    'The stage has touch-action: pan-y, so vertical swipes still scroll.',
    `A phone's tilt counts as a full lean at ${FIXED.GYRO_RANGE}° either way, measured from ${FIXED.GYRO_REST}° of pitch (a phone held to read). iOS only reports tilt after a permission request made from a tap, so ask for it only when "Use motion" is tapped, and keep the pointer working if it is denied.`,
  ],
};
