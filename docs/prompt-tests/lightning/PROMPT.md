# Build: Lightning

## What I want
Small glowing nodes scattered across a dark screen. Electric arcs jump from my cursor to the nearest node, crackling and branching; the node that gets hit glows and passes a weaker arc on to its neighbor. Every so often an arc jumps between two nodes by itself.

## Look
- Colors ("Riso" palette): background #F4F2FF, text #1A1240, secondary text #4E4777, accents #EC1C7F, #2A47EA, #FF7A00.
- Where accent colors overlap, multiply them like ink on paper (canvas globalCompositeOperation "multiply").
- Font: "Anybody" from Google Fonts (variable width 50–150, weight 100–900), loaded with https://fonts.googleapis.com/css2?family=Anybody:ital,wdth,wght@0,50..150,100..900;1,50..150,100..900&display=swap, with a system sans-serif fallback.
- A full-screen canvas (100svh, at least 540px), transparent over the background and cleared every frame. Size it for devicePixelRatio (capped at 2) and do all math in CSS pixels.

## How it moves
- Scatter 24 nodes at random (Math.random() for x, then y): x = (0.08 + random × (1 − 2 × 0.08)) × width, and y the same way with the height. Draw each node as a dot of radius 3px in the soft text color. A node that was hit has a glow (1 at the moment it's hit, × 0.93^f every frame after): draw a soft circle of radius 16px around it, a radial gradient from its arc's color at opacity glow × 0.5 to transparent, and the dot in that color at opacity glow on top.
- An arc lives 0.3s. Draw it (after the nodes) at opacity power × (1 − age ÷ 0.3) as polylines 2 × power px wide with round joins, in accent (hop mod 3). When the blend mode above is lighter, first stroke the same lines 3 times with lighter blending, 2 × power + 9, + 6 and + 3 px wide, at 0.0889, 0.178 and 0.267 × that opacity; and after the arc itself, stroke a core line half as wide in the main text color at the arc's opacity.
- Each arc is a jagged line made by midpoint displacement: split the straight line in half and push the new midpoint sideways (at right angles to that piece) by (random × 2 − 1) × 0.3 × 0.6 × the piece's length; repeat on every piece, levels = min(6, max(1, ceil(log2(length ÷ 8)))) times. Call Math.random() once per new midpoint, level by level, from the start of the line to the end.
- Then go through the arc's inner points in order; at each, with chance 0.4 × 0.12 (one Math.random() call), grow a branch: a jagged line made the same way with 2 fewer levels (at least 1), starting at that point, 0.45 × the distance left to the arc's end long, at the arc's overall angle minus 0.6 radians if the next Math.random() is below 0.5, plus otherwise.
- While the pointer is over the canvas (a finger after pressing and holding still for 0.25s, so swipes still scroll), it strikes: an arc from the pointer to the nearest node within 200px. With no node in reach nothing happens.
- From the node it hits, a strike jumps on up to 1 more times, each time to the nearest node within reach that this strike hasn't hit yet. Each hop is 0.6 × as strong as the one before (power, starting at 1).
- Strikes come at most 2 times a second: a new one only once max(0.34, 1 ÷ 2) seconds have passed since the last. Safety: never more than 3 strikes in a second, arcs stay thin lines, and the background never flashes.
- When nobody is pointing and 2.5s have passed since the last strike, a random node (floor(random × node count)) strikes its nearest neighbor within reach, with the same chain rules.
- Run one requestAnimationFrame loop. dt = seconds since the last frame, clamped to 0.05; f = min(dt × 60, 2.5). Each frame: age and remove arcs, fade the node glows, then strike if one is due, then draw.
- Scatter the nodes again on every resize.
- Reduced-motion still frame: one arc (no chain, full power, age 0) between the node nearest 30%/45% of the width/height and the node nearest 70%/55%, both glowing.

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