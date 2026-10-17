# Build: Neon sign

## What I want
A neon-tube sign. The tubes buzz on letter by letter with a short, gentle flicker, then glow steadily with a soft halo. Now and then one letter dims briefly and comes back. Hovering a letter makes it glow brighter.

## Look
- Colors ("Riso" palette): background #F4F2FF, text #1A1240, secondary text #4E4777, accents #EC1C7F, #2A47EA, #FF7A00.
- Where accent colors overlap, multiply them like ink on paper (canvas globalCompositeOperation "multiply").
- Font: "Anybody" from Google Fonts (variable width 50–150, weight 100–900), loaded with https://fonts.googleapis.com/css2?family=Anybody:ital,wdth,wght@0,50..150,100..900;1,50..150,100..900&display=swap, with a system sans-serif fallback.
- A full-screen canvas (100svh, at least 540px), transparent, cleared every frame. Size it for devicePixelRatio (capped at 2) and do all math in CSS pixels. Keep the sign text in a visually hidden element for screen readers.

## How it moves
- The sign says "open late". Lay it out as one centered line, its middle (halfway between actualBoundingBoxAscent and actualBoundingBoxDescent) at 46% of the height: Anybody weight 500, font size = height × 0.2, scaled down if wider than 84% of the width. Each letter is drawn on its own (strokeText at the x where it sits in the line, measured from the text before it) so it can have its own brightness. Letters of word k (split on spaces) are tubes in accent (k mod 3).
- Draw each letter as an outline (strokeText, round joins and caps): first 4 glow passes, widest first, each with lineWidth 5 + i × 1.8 × 5 (i from 4 down to 1) at opacity 0.6 × brightness × (1 − (i − 1) ÷ 4) ÷ 4, using additive blending ("lighter"); then the tube itself: lineWidth 5, its color mixed 55% toward the main text color (a hot core), at opacity brightness. Never use shadowBlur.
- The letters are italic.
- The tubes buzz on letter by letter: letter i starts warming up 0.5s + i × 0.35s after the start, and its brightness rises linearly from 0 to 1 over 0.35 × 0.6 seconds.
- Flicker 0.3: halfway through each letter's warm-up, with probability 0.3 (one Math.random() call), it stutters; once every letter is on, each frame with probability 0.3 × 8 × dt ÷ 60 a random letter (floor(random × letter count)) dims. A stutter or dim drops that one letter's brightness to 0.25 for 0.12s. Safety rule: a new flicker may only start if the last one started at least 1/3 second ago (never more than 3 a second), only single letters ever dim, and the background never flashes. Under reduced motion there is no flicker at all, even after Play.
- Hovering a letter (the pointer inside its box) makes its glow brighter: its boost eases toward 1 by 0.15 × f per frame while hovered and back toward 0 otherwise, and its glow opacity is multiplied by 1 + 0.6 × boost. On touch, tapping a letter sets its boost to 1, and it fades back over 1.2s.
- Letters may stutter as they warm up.
- Run one requestAnimationFrame loop. dt = seconds since the last frame, clamped to 0.05; f = min(dt × 60, 2.5); t = seconds the loop has run (the sum of dt).
- Lay the sign out again on every resize and once the Anybody font has finished loading.
- Reduced-motion still frame: the sign fully lit, no flicker.

## How people interact
- The canvas has touch-action: pan-y. A tap (on release) on a letter brightens it.

## Where this goes
Create a single index.html file with all CSS and JavaScript inline, ready to open by double-clicking it. Don't use any libraries or build tools.

## Rules
- Smooth on a mid-range laptop and a phone: one requestAnimationFrame loop, batched canvas drawing, devicePixelRatio capped at 2, pause when off-screen.
- Respect prefers-reduced-motion: start paused and show a meaningful still frame, with a visible Play/Pause button.
- Accessible: real buttons, visible keyboard focus, text contrast of at least 4.5:1, decorative canvases hidden from screen readers.
- Works on touch screens without blocking vertical scrolling.

## When you're done
I'm new to coding. When you're done: 1) tell me in simple steps how to open the page in my browser, 2) explain in two or three sentences how it works, 3) suggest three small changes I could ask you for next.