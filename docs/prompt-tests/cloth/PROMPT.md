# Build: Tearable cloth

## What I want
A sheet of cloth hanging from a rail at the top of the screen, swaying gently in a breeze. I can grab it and drag it around; it swings and stretches, and if I pull hard enough it tears apart. Double-clicking hangs a fresh sheet.

## Look
- Colors ("Riso" palette): background #F4F2FF, text #1A1240, secondary text #4E4777, accents #EC1C7F, #2A47EA, #FF7A00.
- Where accent colors overlap, multiply them like ink on paper (canvas globalCompositeOperation "multiply").
- Font: "Anybody" from Google Fonts (variable width 50–150, weight 100–900), loaded with https://fonts.googleapis.com/css2?family=Anybody:ital,wdth,wght@0,50..150,100..900;1,50..150,100..900&display=swap, with a system sans-serif fallback.
- The canvas is transparent over the background and cleared every frame. Size it for devicePixelRatio (capped at 2) and do all math in CSS pixels.

## How it moves
- A full-screen canvas (100svh, at least 540px) shows a hanging sheet: a grid of points 32 across (20 on screens under 700px wide), 70% of the width wide and centered, its top row on a rail at 12% of the height. Point spacing s = sheet width ÷ (columns − 1); rows = max(2, round(height × 0.6 ÷ s) + 1). Points start exactly on the grid, at rest. Create the links point by point, row by row from the top-left: for each point, first a link to its right neighbor (if any), then to the one below (if any); every link's rest length is s.
- Pin top-row points so they never move: every 4th one counting from the left (columns 0, 4, 8, …) plus the last one.
- Draw every unbroken link as a straight line 1.2px wide (round caps), colored by how close it is to tearing: share = (length ÷ rest length − 1) ÷ (tear − 1); the first accent color below 1/3, the second below 2/3, the third from there on. Batch the lines into one path per color. Then draw the rail, a line 2px wide in the soft text color across the top of the sheet at its rest position, and each pinned point as a dot of radius 3px in the main text color.
- Each frame, move every point that isn't pinned or held (verlet): velocity = (position − previous position) × 0.99^f; previous = position; position += velocity; y += 0.25 × f².
- Right after that, a breeze pushes each of those points sideways: x += 0.2 × 0.15 × sin(t × 1.3 − (column + row) × 0.12) × f², t in seconds, so soft waves roll across the sheet.
- Then relax the links 5 times. Each pass goes through the links in creation order, skipping broken ones: with d = the link's current length, if d is past the tear limit the link breaks for good; otherwise move both ends along the link so its length is back to its rest length, half each, or all of it on the free end when the other end is pinned or held.
- The tear limit is 3 × a link's rest length, so the sheet tears where you pull hard.
- Grab: when a press starts (a mouse button at once; a finger after holding still for 0.25s, so swipes still scroll), take every point that isn't pinned within 40px of the pointer and remember its offset from the pointer. While held, each frame (after moving the points) set each one's previous position to its position, then its position to the pointer plus its offset; held points count as pinned for the links. On release they are free again and keep the pointer's last movement as their velocity. Two clicks or taps (on release) within 0.35s and 30px of each other, from presses that moved less than 30px, hang a fresh sheet.
- Run one requestAnimationFrame loop. dt = seconds since the last frame, clamped to 0.05; f = min(dt × 60, 2.5); t = seconds the loop has run (the sum of dt).
- Each frame, in this order: check for double-clicks, start or end a grab, move the points (gravity and breeze), move the held point to the pointer, relax the links, draw.
- Hang a fresh sheet on every resize.
- Reduced-motion still frame: the sheet after 240 frames of the physics with f = 1 (t advancing 1/60s each) and no pointer.

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