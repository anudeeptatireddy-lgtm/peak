# Build: Echo trail

## What I want
A word drifts along a gentle looping path, or follows my cursor when it comes close, and leaves a trail of colored copies that fade out behind it, overlapping in the three accent colors.

## Look
- Colors ("Riso" palette): background #F4F2FF, text #1A1240, secondary text #4E4777, accents #EC1C7F, #2A47EA, #FF7A00.
- Where accent colors overlap, multiply them like ink on paper (canvas globalCompositeOperation "multiply").
- Font: "Anybody" from Google Fonts (variable width 50–150, weight 100–900), loaded with https://fonts.googleapis.com/css2?family=Anybody:ital,wdth,wght@0,50..150,100..900;1,50..150,100..900&display=swap, with a system sans-serif fallback.
- A full-screen canvas (100svh, at least 540px), transparent, cleared every frame. Size it for devicePixelRatio (capped at 2) and do all math in CSS pixels.

## How it moves
- The word is "echo" in Anybody weight 900, canvas fontStretch "expanded", drawn centered on its position (textAlign center, textBaseline middle). Font size = height × 0.24, scaled down if the word is wider than 60% of the width.
- Behind it draw 12 echoes, oldest first: echo k (1 to 12) is the word at the position it had k × 3 samples ago, in accent ((k − 1) mod 3), at opacity 0.85^k, using the blend mode above. Then draw the word itself on top in the main text color.
- Record the word's position 60 times a second (one sample per 1/60s of animation time, however fast the screen refreshes); echoes are 3 samples apart.
- When the pointer isn't pulling it, the word drifts toward a point on a looping path: (width / 2 + width × 0.26 × sin(t × 0.6), height / 2 + height × 0.16 × sin(t × 0.6 × 1.7 + 0.5)), t in seconds; each frame it moves 0.05 × f of the way there.
- When the pointer is within 260px of the word, the word follows it instead: each frame it moves 0.12 × f of the way to the pointer. A mouse counts whenever it is over the canvas, a finger while it touches (dragging sideways; vertical swipes still scroll).
- Run one requestAnimationFrame loop. dt = seconds since the last frame, clamped to 0.05; f = min(dt × 60, 2.5); t = seconds the loop has run (the sum of dt).
- The word starts at the path point for t = 0, and every recorded sample starts there too.
- Reduced-motion still frame: the word where the path puts it at t = 2.2s, with its echoes where the path put it at the earlier sample times.

## How people interact
- The canvas has touch-action: pan-y.

## Where this goes
Create a single index.html file with all CSS and JavaScript inline, ready to open by double-clicking it. Don't use any libraries or build tools.

## Rules
- Smooth on a mid-range laptop and a phone: one requestAnimationFrame loop, batched canvas drawing, devicePixelRatio capped at 2, pause when off-screen.
- Respect prefers-reduced-motion: start paused and show a meaningful still frame, with a visible Play/Pause button.
- Accessible: real buttons, visible keyboard focus, text contrast of at least 4.5:1, decorative canvases hidden from screen readers.
- Works on touch screens without blocking vertical scrolling.

## When you're done
I'm new to coding. When you're done: 1) tell me in simple steps how to open the page in my browser, 2) explain in two or three sentences how it works, 3) suggest three small changes I could ask you for next.