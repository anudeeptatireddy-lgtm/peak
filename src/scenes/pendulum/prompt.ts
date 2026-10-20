import type { Params } from '../types';

export function followUps(p: Params): string[] {
  return [
    'Make the name form exactly when my page finishes loading, then drift apart slowly.',
    `Use ${Math.min(900, Number(p.bobs) + 200)} bobs and a longer trail for a denser, silkier look.`,
    'Add a soft chime each time the name forms, off until I click once.',
    'Show my tagline under the name in plain text that fades in while the name holds.',
  ];
}
