# Build: Decoding text

## What I want
Three lines of text that flicker through random characters and then resolve, letter by letter from left to right, into the real words. Hovering a line scrambles it again.

## Look
- Colors ("Riso" palette): background #F4F2FF, text #1A1240, secondary text #4E4777, accents #EC1C7F, #2A47EA, #FF7A00.
- Where accent colors overlap, multiply them like ink on paper (canvas globalCompositeOperation "multiply").
- Font: "Anybody" from Google Fonts (variable width 50–150, weight 100–900), loaded with https://fonts.googleapis.com/css2?family=Anybody:ital,wdth,wght@0,50..150,100..900;1,50..150,100..900&display=swap, with a system sans-serif fallback.
- A scrambling character uses accent ((line index + j) mod 3) (line index 0, 1, 2; j its position in the line), adjusted in lightness only if needed so it has at least 3:1 contrast with the background. A settled character uses its line’s color.

## How it moves
- Three lines of text: "Hi, I'm [YOUR NAME]", "I make things move" and "one letter at a time" (leave out any empty line). Stack them in a column centered horizontally and vertically in a full-screen section (100svh, at least 540px), 0.6rem apart. Line 1: font size clamp(1.6rem, 7vw, 6rem), weight 800, font-stretch 110%, in the main text color. Lines 2 and 3: font size clamp(1.1rem, 3vw, 2.2rem), weight 500, font-stretch 100%, in the secondary text color. Every line: line-height 1.1, centered, no wrapping (white-space: pre).
- While a character scrambles it shows random picks from these symbols characters: "!<>-_\\/[]{}=+*^?#$%&@~" (a JavaScript string).
- Decoding a line that starts at time t0: character j of the line (counting from 0, spaces included) scrambles from t0 until t0 + 1.2s + j × 40ms, then shows its real character for good. Spaces never scramble.
- Line i (0, 1, 2) starts decoding 0.25s × i after the animation starts; before that it shows nothing (its characters are blank, but still take up their space). After that, a line decodes again whenever the pointer enters it (pointerenter, which also covers a tap), if its last decode has finished.
- A scrambling character changes every 50ms: whenever floor((t − t0) × 1000 ÷ 50) differs from its last value (including the first frame), pick a new character with one Math.random() call: charset[floor(random × charset length)].
- Build each line as one block holding a visually hidden copy of the whole line (for screen readers) and, marked aria-hidden, one inline-block span per character. Each span is an inline-grid (justify-items: center) holding two layers in the same grid cell (grid-area 1 / 1): the real character with visibility: hidden, which fixes the span’s width, and the character currently shown. So nothing shifts while the line scrambles.
- Run one requestAnimationFrame loop. dt = seconds since the last frame, clamped to 0.05; t = seconds the loop has run (the sum of dt). Start times use t.
- Each frame, update lines in order and characters left to right (this fixes the order of the Math.random() calls).
- Reduced-motion still frame: every line fully settled, no scrambling.

## How people interact
- Only the lines themselves take pointer events; the rest of the section ignores them, so it never blocks scrolling.

## Where this goes
Create a single index.html file with all CSS and JavaScript inline, ready to open by double-clicking it. Don't use any libraries or build tools.

## Rules
- Smooth on a mid-range laptop and a phone: one requestAnimationFrame loop, batched canvas drawing, devicePixelRatio capped at 2, pause when off-screen.
- Respect prefers-reduced-motion: start paused and show a meaningful still frame, with a visible Play/Pause button.
- Accessible: real buttons, visible keyboard focus, text contrast of at least 4.5:1, decorative canvases hidden from screen readers.
- Works on touch screens without blocking vertical scrolling.

## When you're done
I'm new to coding. When you're done: 1) tell me in simple steps how to open the page in my browser, 2) explain in two or three sentences how it works, 3) suggest three small changes I could ask you for next.