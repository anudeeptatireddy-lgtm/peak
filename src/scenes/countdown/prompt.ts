import type { Params } from '../types';

export function followUps(p: Params): string[] {
  return [
    `Add a small line under "${p.event}" saying the date and time of the event in the visitor's language.`,
    'Let people add the event to their calendar with one button.',
    'Play a short chime when the countdown reaches zero, off until the visitor clicks once.',
    'Change the page color through the palette as the time runs down.',
  ];
}
