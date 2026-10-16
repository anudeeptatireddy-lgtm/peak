# Build: Ripple background

## What I want
A calm, full-screen grid of small dots. When I click, a ring ripples out from that spot, pushing the dots outward and lighting them up in color as it passes. My cursor pushes nearby dots away. When nobody is interacting, ripples start by themselves every few seconds.

## Look
- Colors ("Riso" palette): background #F4F2FF, text #1A1240, secondary text #4E4777, accents #EC1C7F, #2A47EA, #FF7A00.
- Where accent colors overlap, multiply them like ink on paper (canvas globalCompositeOperation "multiply").
- Font: "Anybody" from Google Fonts (variable width 50–150, weight 100–900), loaded with https://fonts.googleapis.com/css2?family=Anybody:ital,wdth,wght@0,50..150,100..900;1,50..150,100..900&display=swap, with a system sans-serif fallback.
- The canvas is transparent over the background and cleared every frame. Size it for devicePixelRatio (capped at 2) and draw in CSS pixels.

## How it moves
- A full-screen canvas (100svh, at least 540px) holds a square grid of dots 26px apart (20px on screens under 700px wide): floor(width / spacing) + 1 columns and floor(height / spacing) + 1 rows, centered on the screen. Each dot remembers its rest position.
- Draw resting dots (glow under 0.08, or never touched by a ring) as circles of radius 1.3px in the secondary text color at 38% opacity, all in one path. Glowing dots get radius 1.3 + glow × 3.6px in their ring's color, one path per accent color, using the blend mode above.
- For each ring and each dot: k = (distance from the ring's center − age × ring speed) ÷ 60. If |k| < 2.5: g = e^(−k²) × e^(−age × fade), the dot is displaced outward from the ring's center by sin(k × 2) × g × push, and its glow target grows by g. The ring with the largest g colors the dot.
- A ring has a center, a start time and a color (the three accents in turn). It grows at 480px per second. Keep at most 8 rings (drop the oldest) and remove rings older than 5 seconds.
- Ring push is 20px.
- Ring fade is 0.55 per second (in e^(−age × fade)).
- When nobody has clicked for 3.5 seconds, start a ripple every 2.6 seconds (the first one right away) at a random spot: x = width × (0.2 + random × 0.6), y = height × (0.2 + random × 0.5).
- While the pointer is over the canvas, a dot whose rest position is within 120px of it is pushed away by s² × 22px (s = 1 − distance / 120), its glow target grows by s × 0.6, and if that is its strongest effect it takes the second accent color.
- Each frame, every dot eases 25% of the way to its rest position plus its displacement, and its glow eases 25% of the way to min(glow target, 1.4). Its color index updates whenever something colors it, and stays otherwise.
- Run one requestAnimationFrame loop. dt = seconds since the last frame, clamped to 0.05; t = seconds the loop has run (the sum of dt). Ring start times and ages use t.
- A click lands between frames: its ring starts at the previous frame's t.
- Rebuild the grid on every resize (all dots back to rest).
- Automatic ring positions call Math.random() for x, then y.
- Reduced-motion still frame: two rings from (width / 2, 45% of the height), 0.9s and 0.35s old, in the first and second accent, with no easing (dots jump straight to their displaced position and glow).

## How people interact
- Click or tap (on release): a ring at that point, which also counts as the latest click for the automatic ripples.
- pointermove and pointerdown on the canvas make the pointer active (a finger only while it is down); pointerleave and pointercancel make it inactive.

## Where this goes
Create a single index.html file with all CSS and JavaScript inline, ready to open by double-clicking it. Don't use any libraries or build tools.

## Rules
- Smooth on a mid-range laptop and a phone: one requestAnimationFrame loop, batched canvas drawing, devicePixelRatio capped at 2, pause when off-screen.
- Respect prefers-reduced-motion: start paused and show a meaningful still frame, with a visible Play/Pause button.
- Accessible: real buttons, visible keyboard focus, text contrast of at least 4.5:1, decorative canvases hidden from screen readers.
- Works on touch screens without blocking vertical scrolling.

## When you're done
I'm new to coding. When you're done: 1) tell me in simple steps how to open the page in my browser, 2) explain in two or three sentences how it works, 3) suggest three small changes I could ask you for next.