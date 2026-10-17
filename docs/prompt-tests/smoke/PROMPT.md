# Build: Smoke

## What I want
Soft colored smoke that pours from my cursor and swirls, curls and fades behind it. Faster movement makes bigger swirls. When I leave it alone, a slow plume rises from the bottom of the screen.

## Look
- Colors ("Riso" palette): background #F4F2FF, text #1A1240, secondary text #4E4777, accents #EC1C7F, #2A47EA, #FF7A00.
- Where accent colors overlap, multiply them like ink on paper (canvas globalCompositeOperation "multiply").
- Font: "Anybody" from Google Fonts (variable width 50–150, weight 100–900), loaded with https://fonts.googleapis.com/css2?family=Anybody:ital,wdth,wght@0,50..150,100..900;1,50..150,100..900&display=swap, with a system sans-serif fallback.
- A full-screen canvas (100svh, at least 540px), transparent over the background and cleared every frame. Size it for devicePixelRatio (capped at 2).

## How it moves
- The smoke is a stable-fluids simulation (Jos Stam's method) on a coarse grid 128 cells across (48 on screens under 700px wide) and round(128 × height ÷ width) cells down, plus a one-cell border, solved with 6 Gauss–Seidel passes. It carries three dye fields, one per accent color, all moved by the same flow. Each step: diffuse the velocity by the viscosity, project, advect the velocity by itself, project again, then advect each dye (no dye diffusion).
- The current smoke color drifts through the three accents, 5s each: with p = (t ÷ 5) mod 3, accent k gets weight max(0, 1 − d), where d = |p − k| wrapped around (min(d, 3 − d)). Draw the grid into a small offscreen image (one pixel per cell): its color is the dye-weighted mix of the three accents and its alpha is min(1, total dye × 1.2). Then draw that image scaled up over the whole canvas with image smoothing on, using the blend mode above.
- Viscosity = 0.1 × 0.0005.
- After each step, multiply every dye cell by 0.985^f, so the smoke fades.
- Before each step, add swirl (vorticity confinement): per cell, curl = (vy right − vy left − (vx below − vx above)) ÷ 2; at each inner cell take the gradient of |curl| (central differences, ÷ 2), normalize it to N, and add (N.y, −N.x) × curl × 20 × dt to the velocity.
- At the start, and once the pointer has been away (off the canvas, not just still over it) for 1s, a slow plume rises from the bottom: each frame splat at x = width × (0.5 + 0.12 × sin(t × 0.4)), y = height − 36px, adding velocity (0, −0.6 × 0.6) and dye 0.3 × 0.6.
- While the pointer is over the canvas (a finger while it touches), splat at the pointer every frame: each cell whose center is within 36px of it, with weight = 1 − distance ÷ 36, gets velocity += (pointer movement since last frame ÷ f) × 60 ÷ width (and ÷ height for y) × 2 × weight, and dye += 0.4 × min(1, pointer speed in px per frame ÷ 8) × weight, split between the accents by the current color weights (a still pointer pours nothing).
- Run one requestAnimationFrame loop. dt = seconds since the last frame, clamped to 0.05; f = min(dt × 60, 2.5); t = seconds the loop has run (the sum of dt).
- Each frame, in this order: splat from the pointer or the plume, add the swirl (vorticity confinement), step the fluid with dt, fade the dye, draw.
- Make a fresh, empty grid on every resize.
- Performance: the fluid only ever runs on the coarse grid; one frame must stay well under 8ms at the defaults.
- Reduced-motion still frame: the plume after 150 frames of the simulation with f = 1 and dt = 1/60, no pointer.

## How people interact
- The canvas has touch-action: pan-y, so vertical swipes still scroll.

## Where this goes
Create a single index.html file with all CSS and JavaScript inline, ready to open by double-clicking it. Don't use any libraries or build tools.

## Rules
- Smooth on a mid-range laptop and a phone: one requestAnimationFrame loop, batched canvas drawing, devicePixelRatio capped at 2, pause when off-screen.
- Respect prefers-reduced-motion: start paused and show a meaningful still frame, with a visible Play/Pause button.
- Accessible: real buttons, visible keyboard focus, text contrast of at least 4.5:1, decorative canvases hidden from screen readers.
- Works on touch screens without blocking vertical scrolling.

## When you're done
I'm new to coding. When you're done: 1) tell me in simple steps how to open the page in my browser, 2) explain in two or three sentences how it works, 3) suggest three small changes I could ask you for next.