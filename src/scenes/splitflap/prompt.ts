import type { Params } from '../types';

export function followUps(p: Params): string[] {
  return [
    'Add a soft clattering sound while tiles flip, off until I click once.',
    'Turn it into a two-row schedule: a time on the left and a destination on the right.',
    `Make each flip slower (${Number(p.flipSpeed) * 2}ms) for a heavier, older board.`,
    'Load the messages from a list I can edit at the top of the file.',
  ];
}
