# Build: Stretchy headline

## What I want
A huge headline where each letter swells wider and bolder as my cursor gets close, with a slightly misprinted two-color shadow. When I am not touching it, a slow wave rolls through the letters.

## Look
- Colors ("Riso" palette): background #F4F2FF, text #1A1240, secondary text #4E4777, accents #EC1C7F, #2A47EA, #FF7A00.
- Where accent colors overlap, multiply them like ink on paper (canvas globalCompositeOperation "multiply").
- Font: "Anybody" from Google Fonts (variable width 50–150, weight 100–900), loaded with https://fonts.googleapis.com/css2?family=Anybody:ital,wdth,wght@0,50..150,100..900;1,50..150,100..900&display=swap, with a system sans-serif fallback.
- No canvas: the headline is real text in the page, on the background color.

## How it moves
- The headline is "elastic": one inline-block span per letter (marked aria-hidden, with the whole word in a visually hidden span for screen readers), in a single line, font size clamp(4.5rem, 21vw, 19rem), line-height 0.9, in the main text color, centered in a full-screen section (100svh, at least 540px) and lifted 6vh above the middle (a bottom margin of 6vh on the line).
- Each letter has an influence value v from 0 to 1. Its font width ("wdth" axis) is 50 + v × 100 (from 50 to 150).
- Its weight ("wght" axis) is round(200 + v × 700) (from 200 to 900). Set font-variation-settings to "wdth" (one decimal), "wght" (whole number) on each letter every frame, and set font-weight to the same weight.
- Each letter has two hard shadows (no blur): text-shadow: 0.045·v em 0.03·v em 0 [first accent], −0.045·v em −0.03·v em 0 [second accent] (offsets rounded to 4 decimals), and lifts by translateY(−0.05·v em).
- While the pointer is over the section, measure the word's box each frame and split its width evenly between the letters (step = word width ÷ letter count). Letter i's target is e^(−k²) with k = (word left + step × (i + 0.5) − pointer x) ÷ (step × 1.25).
- When the pointer is away, letter i targets (0.5 + 0.5 × sin(t × 2.1 − i × 0.85))², where t is the seconds the animation has been running.
- Every frame each letter's influence moves toward its target by 1 − e^(−dt × 9) of the remaining distance (dt in seconds). Influence starts at 0.5.
- Run one requestAnimationFrame loop. dt = seconds since the last frame, clamped to 0.05; t = seconds the loop has run (the sum of dt).
- Reduced-motion still frame: every letter at the idle-wave value for t = 0.4.

## How people interact
- pointermove and pointerdown on the section set the pointer position and make it active; pointerleave and pointercancel make it inactive, and so does lifting a finger.
- On touch, drag sideways across the word; vertical swipes still scroll the page (touch-action: pan-y on the section).

## Where this goes
Create a single index.html file with all CSS and JavaScript inline, ready to open by double-clicking it. Don't use any libraries or build tools.

## Rules
- Smooth on a mid-range laptop and a phone: one requestAnimationFrame loop, batched canvas drawing, devicePixelRatio capped at 2, pause when off-screen.
- Respect prefers-reduced-motion: start paused and show a meaningful still frame, with a visible Play/Pause button.
- Accessible: real buttons, visible keyboard focus, text contrast of at least 4.5:1, decorative canvases hidden from screen readers.
- Works on touch screens without blocking vertical scrolling.

## When you're done
I'm new to coding. When you're done: 1) tell me in simple steps how to open the page in my browser, 2) explain in two or three sentences how it works, 3) suggest three small changes I could ask you for next.