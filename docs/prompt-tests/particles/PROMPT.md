# Build: Your name in particles

## What I want
A full-screen intro where my word is made of thousands of small dots. When the page loads, the dots swarm in from all over the screen and settle into the letters. Moving my cursor pushes dots out of the way, and clicking makes them explode outward and then pull back into the word.

## Look
- Colors ("Riso" palette): background #F4F2FF, text #1A1240, secondary text #4E4777, accents #EC1C7F, #2A47EA, #FF7A00.
- Where accent colors overlap, multiply them like ink on paper (canvas globalCompositeOperation "multiply").
- Font: "Anybody" from Google Fonts (variable width 50–150, weight 100–900), loaded with https://fonts.googleapis.com/css2?family=Anybody:ital,wdth,wght@0,50..150,100..900;1,50..150,100..900&display=swap, with a system sans-serif fallback.
- A full-screen canvas covering the whole viewport (100svh tall, at least 540px), on the page background. The canvas itself is transparent and is cleared every frame.
- Size the canvas for devicePixelRatio (capped at 2) and do all drawing and sampling math in CSS pixels.
- Each dot is a filled circle in one of the three accent colors, picked at random per dot. Draw all dots of one color as a single path and fill it once, color by color in the order of the three accents, using the blend mode above.

## How it moves
- The word is "peak".
- Use at most 3,800 dots on screens 700px wide or more.
- Each dot is a filled circle whose radius is a random value between 0.32 and 0.54 times the grid spacing, picked once per dot.
- Each dot is tied to its home by a spring. Its stiffness is 0.02 + random × 0.035, picked once per dot, so dots arrive at different times. Each frame: velocity += (home − position) × stiffness × f.
- Damping: after adding the forces, multiply each dot's velocity by 0.86^f every frame, then move it by velocity × f (closer to 1 is bouncier and slower to settle).
- On the first build, start every dot at a random spot on the screen with a random velocity between −6 and +6 on each axis, so they swarm into the word.
- The cursor's reach R is 16% of the screen width, but at least 70px and at most 150px.
- While the pointer is over the canvas (mouse, or a finger while it touches), a dot at distance d < R from it gets pushed straight away from it by (1 − d / R)² × 9 per frame (times f).
- On click (on release, so a touch that turns into a scroll never triggers it), every dot gets a kick away from the click point: strength = 40 × (0.35 + random × 0.65) × max(0.3, 1 − distance / the larger screen side), plus a random jitter between −3 and +3 on each axis.
- Use at most 1,700 dots on screens under 700px wide.
- Font size starts at min(screen height × 0.46, screen width × 0.42).
- If the measured word is wider than 82% of the screen width (92% under 700px), scale the font size down so it fits exactly.
- The word is centered horizontally, with its vertical middle (textBaseline "middle") at 43% of the screen height (40% under 700px).
- Draw the word once on a hidden canvas the size of the screen (in CSS pixels, not device pixels) in Anybody at weight 900, with ctx.fontStretch = "expanded" (set it again every time you set ctx.font), filled in black, textAlign "center". Load the font from Google Fonts and wait for it (document.fonts.load, giving up after 2.5 seconds) before sampling; draw nothing until then.
- Sample the hidden canvas on a square grid: the spacing starts at max(3, round(font size / 80)) px; keep a grid point when its pixel's alpha is above 140. While there are more points than the dot limit, increase the spacing by 1px and sample again, up to 14px.
- Every frame: f = min(dt × 60, 2.5), where dt is the seconds since the last frame (clamped to 0.05). For each dot: acceleration = (home − position) × its stiffness, plus the cursor push; velocity = (velocity + acceleration × f) × damping^f; position += velocity × f.
- Whenever the canvas is resized (and once the font has loaded), sample the word again: dot number i gets home number i. Existing dots keep their position, velocity and color and glide to their new homes; only dots beyond the old count are new. Every dot picks a new stiffness and radius on each rebuild.
- To make the result exactly reproducible: collect grid points row by row (top to bottom, left to right in each row), and when building each dot call Math.random() in exactly this order: x position, y position, x velocity, y velocity (these four only for new dots during the swarm-in), then stiffness, then radius, then color (color only for new dots).
- Reduced-motion still frame: every dot sits exactly at its home.

## How people interact
- Listen for pointer events on the canvas: pointermove and pointerdown update the pointer position and mark it active; pointerleave and pointercancel mark it inactive.
- A click (on release) explodes the word. On touch, a tap explodes it and a finger pushes dots while it is down; vertical swipes still scroll the page (touch-action: pan-y on the canvas).

## Where this goes
Create a single index.html file with all CSS and JavaScript inline, ready to open by double-clicking it. Don't use any libraries or build tools.

## Rules
- Smooth on a mid-range laptop and a phone: one requestAnimationFrame loop, batched canvas drawing, devicePixelRatio capped at 2, pause when off-screen.
- Respect prefers-reduced-motion: start paused and show a meaningful still frame, with a visible Play/Pause button.
- Accessible: real buttons, visible keyboard focus, text contrast of at least 4.5:1, decorative canvases hidden from screen readers.
- Works on touch screens without blocking vertical scrolling.

## When you're done
I'm new to coding. When you're done: 1) tell me in simple steps how to open the page in my browser, 2) explain in two or three sentences how it works, 3) suggest three small changes I could ask you for next.