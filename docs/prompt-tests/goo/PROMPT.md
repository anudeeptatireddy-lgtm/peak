# Build: Gooey blobs

## What I want
Colored blobs orbit slowly and melt into each other when they touch. One blob follows my cursor on a spring and merges with whatever it passes. A click drops a new blob.

## Look
- Colors ("Riso" palette): background #F4F2FF, text #1A1240, secondary text #4E4777, accents #EC1C7F, #2A47EA, #FF7A00.
- Draw accent colors normally on top of each other: no blending or mix-blend-mode where they overlap, in this palette or any other.
- Font: "Anybody" from Google Fonts (variable width 50–150, weight 100–900), loaded with https://fonts.googleapis.com/css2?family=Anybody:ital,wdth,wght@0,50..150,100..900;1,50..150,100..900&display=swap, with a system sans-serif fallback.
- Blobs are filled in their accent color. Keep a visually hidden description for screen readers; the SVG is aria-hidden.

## How it moves
- A full-screen SVG (100svh, at least 540px) holds 8 blobs at the start: circles inside one group that has a "goo" filter, filling the whole SVG. Blob i is accent (i mod 3). For each blob call Math.random() in this order: orbit width = 0.3 × width × (0.5 + random × 0.5), orbit height = 0.26 × height × (0.5 + random × 0.5), phase = random × 2π, speed = 1 − 0.6 + random × 0.6 × 2, radius = 70 × (1 − 0.35 + random × 0.35 × 2).
- The goo filter: feGaussianBlur with stdDeviation 18 on SourceGraphic, then feColorMatrix (type matrix) keeping the colors and setting alpha to alpha × 22 − 10, then feComposite (operator atop) of SourceGraphic over that result, so blobs that come close melt into one shape with crisp edges. Set the filter's region to the SVG's box (filterUnits userSpaceOnUse) so it stays cheap.
- Each orbiting blob sits at (width / 2 + orbit width × cos(phase + t × 0.5 × speed), height / 2 + orbit height × sin(phase + t × 0.5 × speed)), t in seconds. Move blobs only with transform: translate(…).
- Blob 0 follows the pointer while it is over the SVG (a finger while it touches), on a spring: velocity = (velocity + (pointer − position) × 0.12 × f) × 0.8^f, position += velocity × f; otherwise it springs the same way back toward its own orbit point. A click or tap (on release) adds a blob at that point (up to 16 blobs; accent (blob index mod 3)), with an orbit that passes through it right then: with (dx, dy) from the center, orbit width = max(1, √2 × |dx|), orbit height = max(1, √2 × |dy|), speed = 1 and phase = atan2(dy ÷ orbit height, dx ÷ orbit width) − t × orbit speed; then one random call for its radius as above.
- Run one requestAnimationFrame loop. dt = seconds since the last frame, clamped to 0.05; f = min(dt × 60, 2.5); t = seconds the loop has run (the sum of dt).
- Reduced-motion still frame: every blob where its orbit puts it at t = 2.4s.

## How people interact
- The SVG has touch-action: pan-y.

## Where this goes
Create a single index.html file with all CSS and JavaScript inline, ready to open by double-clicking it. Don't use any libraries or build tools.

## Rules
- Smooth on a mid-range laptop and a phone: one requestAnimationFrame loop, batched canvas drawing, devicePixelRatio capped at 2, pause when off-screen.
- Respect prefers-reduced-motion: start paused and show a meaningful still frame, with a visible Play/Pause button.
- Accessible: real buttons, visible keyboard focus, text contrast of at least 4.5:1, decorative canvases hidden from screen readers.
- Works on touch screens without blocking vertical scrolling.

## When you're done
I'm new to coding. When you're done: 1) tell me in simple steps how to open the page in my browser, 2) explain in two or three sentences how it works, 3) suggest three small changes I could ask you for next.