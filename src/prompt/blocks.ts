// Fixed prompt blocks (PRD §10.2, §10.3, §10.5). Plain text, no DOM.

export type Target = 'new' | 'existing' | 'react';
export type Detail = 'detailed' | 'quick';
export type Experience = 'new' | 'experienced';

export interface PromptOptions {
  target: Target;
  detail: Detail;
  experience: Experience;
}

export const DEFAULT_OPTIONS: PromptOptions = {
  target: 'new',
  detail: 'detailed',
  experience: 'new',
};

export const FONT_URL =
  'https://fonts.googleapis.com/css2?family=Anybody:ital,wdth,wght@0,50..150,100..900;1,50..150,100..900&display=swap';

export const TARGET_BLOCKS: Record<Target, string> = {
  new: "Create a single index.html file with all CSS and JavaScript inline, ready to open by double-clicking it. Don't use any libraries or build tools.",
  existing:
    "First, look at my project's files and figure out what framework and styling it uses. Add this as a component that fits how the project is already built. Don't change unrelated files. When you finish, tell me which files you added or changed and how to put the component on a page.",
  react:
    'Write this as a single React component file (.jsx, or .tsx if my project uses TypeScript) with no extra libraries. Include a short usage example.',
};

export const QUICK_TARGET: Record<Target, string> = {
  new: 'One index.html file, CSS and JS inline, no libraries.',
  existing:
    'Add it to my existing project as a component that fits its framework; tell me which files changed.',
  react: 'One React component file, no extra libraries, with a usage example.',
};

export const RULES = [
  'Smooth on a mid-range laptop and a phone: one requestAnimationFrame loop, batched canvas drawing, devicePixelRatio capped at 2, pause when off-screen.',
  'Respect prefers-reduced-motion: start paused and show a meaningful still frame, with a visible Play/Pause button.',
  'Accessible: real buttons, visible keyboard focus, text contrast of at least 4.5:1, decorative canvases hidden from screen readers.',
  'Works on touch screens without blocking vertical scrolling.',
];

export const EXPERIENCE_BLOCKS: Record<Experience, string> = {
  new: "I'm new to coding. When you're done: 1) tell me in simple steps how to open the page in my browser, 2) explain in two or three sentences how it works, 3) suggest three small changes I could ask you for next.",
  experienced: 'Keep the explanation short: list the files and the key parameters I can tweak.',
};

export const QUICK_CLOSER = 'Keep it smooth, accessible, and respectful of reduced motion.';
