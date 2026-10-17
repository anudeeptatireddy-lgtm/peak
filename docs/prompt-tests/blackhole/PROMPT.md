# Build: Black hole

## What I want
A black hole in the middle of the screen. A faint grid around it bends into a funnel, and glowing particles drift in, orbit faster as they get close, stretch into streaks and vanish at its edge. I can press and hold to drag the hole around, and clicking releases a burst of new particles.

## Look
- Colors ("Riso" palette): background #F4F2FF, text #1A1240, secondary text #4E4777, accents #EC1C7F, #2A47EA, #FF7A00.
- Where accent colors overlap, multiply them like ink on paper (canvas globalCompositeOperation "multiply").
- Font: "Anybody" from Google Fonts (variable width 50–150, weight 100–900), loaded with https://fonts.googleapis.com/css2?family=Anybody:ital,wdth,wght@0,50..150,100..900;1,50..150,100..900&display=swap, with a system sans-serif fallback.
- A full-screen canvas (100svh, at least 540px), transparent over the background and cleared every frame. Size it for devicePixelRatio (capped at 2) and do all math in CSS pixels.

## How it moves
- Keep 1200 particles (500 on screens under 700px wide). Start each at a random spot on the canvas (Math.random() for x, then y). A particle that crosses the event horizon, or gets farther from the hole than the screen's diagonal, starts again off-screen: angle = random × 2π, then distance = half the screen's diagonal × (1 + random × 0.3) from the hole.
- Behind everything, a grid of lines 40px apart: vertical lines at x = width ÷ 2 + k × 40 for every whole k with −40 ≤ x ≤ width + 40, running from y = −40 to height + 40, and horizontal lines the same way. Draw each as a polyline with a point every 40 ÷ 3 px. Pull each point toward the hole: with d = its distance from the hole and R = the horizon radius, move it toward the hole by 3 × mass × R² ÷ (d + R), but never past the hole's center. Stroke all lines as one path, 1px wide, in the soft text color at opacity 0.3.
- The event horizon is a circle of radius 40px around the hole; a particle that gets closer than that is swallowed. Draw it last: filled with the background color, then its edge as a 2px line in the first accent color. When the blend mode above is lighter, give the edge a soft glow first: stroke it 4 times with lighter blending, 2 + 12, + 9, + 6 and + 3 px wide, at opacity 0.0375, 0.075, 0.1125 and 0.15.
- Draw each particle as a line from position − velocity × 3 to position, 1.5px wide with round caps, batched into one path per color: the first accent within 2.5 × R of the hole, the second within 6 × R, the third farther out, using the blend mode above.
- The hole's mass is 1. Each frame, for each particle, with (dx, dy) = hole − particle and r = its length: velocity += (dx, dy) ÷ r × 2000 × 1 ÷ r² × f; then velocity ×= 0.998^f; then position += velocity × f.
- Whenever a particle starts (or starts again) with (dx, dy) = particle − hole and r = its length, its velocity is 1 × √(2000 × mass ÷ r) × (−dy, dx) ÷ r px per frame, sideways to the hole, so it orbits; drag makes the orbits shrink until it falls in.
- Pressing and holding drags the hole: a press counts once it has lasted 0.2s (a finger must also hold still for 0.25s, so swipes still scroll); each frame hole += (pointer − hole) × (1 − (1 − 0.12)^f).
- A click or tap (on release, from a press shorter than 0.2s) releases 80 particles there: take the next 80 particles in turn (cycling through the list) and restart each at that point, moving in a random direction (angle = random × 2π) at random × 4 px per frame.
- Run one requestAnimationFrame loop. dt = seconds since the last frame, clamped to 0.05; f = min(dt × 60, 2.5).
- The hole starts in the middle. Each frame, in this order: handle clicks, move the hole, move the particles, draw (grid, particles, hole).
- Place the particles again on every resize.
- Reduced-motion still frame: the scene after 180 frames of the physics with f = 1 and no pointer.

## How people interact
- The canvas has touch-action: pan-y, so swipes still scroll.

## Where this goes
Create a single index.html file with all CSS and JavaScript inline, ready to open by double-clicking it. Don't use any libraries or build tools.

## Rules
- Smooth on a mid-range laptop and a phone: one requestAnimationFrame loop, batched canvas drawing, devicePixelRatio capped at 2, pause when off-screen.
- Respect prefers-reduced-motion: start paused and show a meaningful still frame, with a visible Play/Pause button.
- Accessible: real buttons, visible keyboard focus, text contrast of at least 4.5:1, decorative canvases hidden from screen readers.
- Works on touch screens without blocking vertical scrolling.

## When you're done
I'm new to coding. When you're done: 1) tell me in simple steps how to open the page in my browser, 2) explain in two or three sentences how it works, 3) suggest three small changes I could ask you for next.