import type { Params } from '../types';

export function followUps(p: Params): string[] {
  return [
    'Play a soft sine tone at the current pitch, off until I click once, and fade it out when the sand settles.',
    `Use ${Math.min(30000, Number(p.grains) + 6000)} grains and make them a little smaller for a finer sand.`,
    'Make the plate round instead of square, using the circular plate’s modes.',
    'Let the microphone pick the pitch: the loudest note I hum tunes the plate.',
  ];
}
