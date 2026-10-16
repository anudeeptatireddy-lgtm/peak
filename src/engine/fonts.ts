// Waits for the Anybody font (PRD §16.4), giving up after a timeout so pages
// never hang on a slow network. Text-sampled scenes rebuild once it resolves.

let ready: Promise<void> | null = null;

export function fontsReady(timeoutMs = 2500): Promise<void> {
  if (ready) return ready;
  if (typeof document === 'undefined' || !document.fonts) return (ready = Promise.resolve());
  const loads = Promise.all([
    document.fonts.load('900 120px Anybody'),
    document.fonts.load('italic 800 120px Anybody'),
    document.fonts.load('400 120px Anybody'),
  ]).then(() => document.fonts.ready);
  ready = Promise.race([loads, new Promise((r) => setTimeout(r, timeoutMs))])
    .then(() => undefined)
    .catch(() => undefined);
  return ready;
}
