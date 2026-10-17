# Build: Text to marbles

## What I want
A big headline built from small glass marbles, each with a soft shadow and a little highlight. When I click, it shatters: the marbles drop, bounce, roll, collide and pile up at the bottom of the screen. Clicking again makes every marble fly back into its letter. While they’re piled up, my cursor shoves the pile around.

## Look
- Colors ("Riso" palette): background #F4F2FF, text #1A1240, secondary text #4E4777, accents #EC1C7F, #2A47EA, #FF7A00.
- Where accent colors overlap, multiply them like ink on paper (canvas globalCompositeOperation "multiply").
- Font: "Anybody" from Google Fonts (variable width 50–150, weight 100–900), loaded with https://fonts.googleapis.com/css2?family=Anybody:ital,wdth,wght@0,50..150,100..900;1,50..150,100..900&display=swap, with a system sans-serif fallback.
- A full-screen canvas (100svh, at least 540px), transparent, cleared every frame, on the page background. Size it for devicePixelRatio (capped at 2) and do all math in CSS pixels.

## How it moves
- The headline is "marbles". Draw it once on a hidden canvas the size of the screen: Anybody weight 900, canvas fontStretch "expanded", textAlign center, textBaseline middle, centered horizontally at 42% of the height. Font size = min(height × 0.42, width × 0.24); if the text is then wider than 88% of the width (94% on screens under 700px wide), scale the size down so it fits exactly.
- Use at most 900 marbles (400 on screens under 700px wide).
- Marbles have radius 8px (3.5px on screens under 700px wide). Sample the hidden canvas on a square grid with spacing round(2 × radius × 1.05) px, row by row from the top-left corner (top to bottom, left to right in each row); each grid point whose alpha is above 127 becomes a marble's home. If that gives more marbles than allowed, widen the spacing by 1px and sample again, until it fits or the spacing reaches 6 marble diameters.
- While shattered, every frame each marble's vertical velocity grows by 0.5 × f (gravity, px per frame²).
- Collisions keep 0.45 of the speed along the hit (restitution 0.45).
- A marble touching the floor keeps 0.985^f of its horizontal velocity each frame (rolling friction).
- While rebuilding, each marble flies home on a spring and doesn't collide: velocity = (velocity + (home − position) × 0.08 × f) × 0.82^f, then position += velocity × f.
- While shattered, the pointer pushes marbles within 70px of it straight away from it: velocity += (unit vector from the pointer to the marble) × 8 × 0.1 × (1 − distance ÷ 70) × f, applied before gravity each frame. A mouse pushes whenever it is over the canvas; a finger only after it has been held still for 0.25s (press and hold), so swipes still scroll.
- If nobody clicks, the headline rebuilds by itself 10s after it shattered.
- A click while the headline is whole shatters it: each marble, in index order, gets velocity x = (random − 0.5) × 5 and y = −random × 5 (Math.random() in that order).
- While shattered, after gravity, each marble keeps 0.999^f of its velocity each frame (air drag).
- Draw each frame in three batched layers: first every marble's shadow (a circle of the marble's radius, 0.35 × radius lower, in the darker of the background and main text colors at 0.18 opacity) as one path; then the bodies (full circles in their accent color, one path per accent, using the blend mode above); then every highlight (a circle of 0.32 × radius, 0.3 × radius up and to the left of the center, in the lighter of the background and main text colors at 0.75 opacity) as one path.
- Reduced-motion still frame: the headline assembled (every marble at home), except the last 7 marbles, which rest on the floor side by side, touching, centered horizontally.
- Run one requestAnimationFrame loop. dt = seconds since the last frame, clamped to 0.05; f = min(dt × 60, 2.5).
- Each marble picks its accent color when it is created, with one Math.random() call: floor(random × 3). Create marbles in home order.
- Sample the homes again on every resize and once the Anybody font has finished loading. Marble i keeps its position, velocity and color and gets home i; new marbles start at their home, and extra old marbles are removed.
- The headline starts whole, every marble at home. A click (on release) toggles between shattering it and rebuilding it.
- Each frame while shattered: the pointer push, then gravity, then air drag, then move every marble (position += velocity × f). Then resolve collisions: find overlapping pairs with a spatial hash grid (cell size = one marble diameter, rebuilt every frame); for each pair (i < j), push them apart along the line between their centers so they just touch, split by mass (mass = radius², so half each here), and if they are moving toward each other, apply an impulse along that line: impulse = −(1 + restitution) × (relative velocity along the line) ÷ (1/m₁ + 1/m₂). Then the walls: the floor is the bottom of the canvas and the side walls are its edges (no ceiling); a marble past a wall is put back against it, its velocity into the wall reversed and multiplied by the restitution, and on the floor it also gets the rolling friction.

## How people interact
- Listen for pointer events on the canvas (touch-action: pan-y). A click or tap (on release) shatters or rebuilds.

## Where this goes
Create a single index.html file with all CSS and JavaScript inline, ready to open by double-clicking it. Don't use any libraries or build tools.

## Rules
- Smooth on a mid-range laptop and a phone: one requestAnimationFrame loop, batched canvas drawing, devicePixelRatio capped at 2, pause when off-screen.
- Respect prefers-reduced-motion: start paused and show a meaningful still frame, with a visible Play/Pause button.
- Accessible: real buttons, visible keyboard focus, text contrast of at least 4.5:1, decorative canvases hidden from screen readers.
- Works on touch screens without blocking vertical scrolling.

## When you're done
I'm new to coding. When you're done: 1) tell me in simple steps how to open the page in my browser, 2) explain in two or three sentences how it works, 3) suggest three small changes I could ask you for next.