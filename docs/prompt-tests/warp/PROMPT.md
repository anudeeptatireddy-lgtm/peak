# Build: Hyperspace intro

## What I want
A full-screen starfield drifting toward me. When I press and hold, it accelerates into light-speed streaks and slows back down when I let go. A button follows my cursor a little when I get near it, like a magnet.

## Look
- Colors ("Riso" palette): background #F4F2FF, text #1A1240, secondary text #4E4777, accents #EC1C7F, #2A47EA, #FF7A00.
- Where accent colors overlap, multiply them like ink on paper (canvas globalCompositeOperation "multiply").
- Font: "Anybody" from Google Fonts (variable width 50–150, weight 100–900), loaded with https://fonts.googleapis.com/css2?family=Anybody:ital,wdth,wght@0,50..150,100..900;1,50..150,100..900&display=swap, with a system sans-serif fallback.
- Size the canvas for devicePixelRatio (capped at 2) and draw in CSS pixels.

## How it moves
- A full-screen canvas (100svh, at least 540px), transparent, cleared every frame. Use 900 stars (420 on screens under 700px wide). A star has x and y between −1 and 1, a depth z, and a color. To (re)spawn a star call Math.random() in this order: x = random × 2 − 1, y = random × 2 − 1, then z (a new star at start: 0.05 + random × (1 − 0.05); a star that respawns: 0.9 + random × (1 − 0.9)), then color: if random < 0.72 it uses the main text color, otherwise a second random picks one of the three accents (floor(random × 3)). Rebuild all stars on every resize.
- Speed starts at 0.09 and eases toward its target every frame: speed += (target − speed) × (1 − e^(−dt × k)), with k = 1.4 while speeding up and 2.2 while slowing down. The target is 0.09 at rest. Each frame every star's z drops by speed × dt; below 0.03 it respawns.
- While pressing, the target speed is 1.7 depth units per second.
- Project a star to the screen at (center x + x / z × F, center y + y / z × F), where the center is (width / 2, height × 0.45) and F = 0.55 × the larger screen side. Draw the stars in index order. A star whose projected position is more than 60px off screen is skipped this frame and respawns right there, as a respawning star (far away, like one that got too close). Draw it as a line from its position at depth min(1.2, z + speed × 0.09 + 0.004) to its current position (+0.01px in x so a zero-length line still shows), round caps. Stars with z > 0.6 are far (width 0.9px, opacity 0.45); z > 0.28 middle (width 1.8px, opacity 0.75); the rest near (width 3px, opacity 1). Batch lines into 12 paths (4 colors × 3 distance bands) and stroke them color by color (the main text color first, then the three accents in order), far, middle, then near within each color, with the blend mode above.
- A pill-shaped button in the main text color with the background color for its label sits centered horizontally, 64% down the canvas. When the mouse is within 170px of the button's resting center, its target offset is 32% of the distance toward the mouse (otherwise 0), and its offset eases toward the target by 1 − e^(−dt × 12) each frame (transform: translate).
- The button says "Back to the top".
- Run one requestAnimationFrame loop. dt = seconds since the last frame, clamped to 0.05; t = seconds the loop has run (the sum of dt).
- Each frame, in this order: ease the speed, move every star (respawning any that got too close), draw (respawning any that left the screen), then move the button.
- Reduced-motion still frame: the stars drawn with only the resting streak.

## How people interact
- Press and hold anywhere on the canvas (mouse or touch) to warp; letting go slows back to cruise.
- The button follows the mouse only, not touch. Clicking it scrolls back to the top of the page (smoothly, unless reduced motion is on).

## Where this goes
Create a single index.html file with all CSS and JavaScript inline, ready to open by double-clicking it. Don't use any libraries or build tools.

## Rules
- Smooth on a mid-range laptop and a phone: one requestAnimationFrame loop, batched canvas drawing, devicePixelRatio capped at 2, pause when off-screen.
- Respect prefers-reduced-motion: start paused and show a meaningful still frame, with a visible Play/Pause button.
- Accessible: real buttons, visible keyboard focus, text contrast of at least 4.5:1, decorative canvases hidden from screen readers.
- Works on touch screens without blocking vertical scrolling.

## When you're done
I'm new to coding. When you're done: 1) tell me in simple steps how to open the page in my browser, 2) explain in two or three sentences how it works, 3) suggest three small changes I could ask you for next.