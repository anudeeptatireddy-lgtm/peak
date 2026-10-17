# Build: Tailor's cut

## What I want
A heavy drape of cloth hangs in soft folds. A chalk line draws itself across it, shears snip along it, then the top half lifts away and the bottom half drops, swinging and folding, to reveal a name behind. Loose threads drift down. The cursor is a breeze on the cloth.

## Look
- Colors ("Riso" palette): background #F4F2FF, text #1A1240, secondary text #4E4777, accents #EC1C7F, #2A47EA, #FF7A00.
- Where accent colors overlap, multiply them like ink on paper (canvas globalCompositeOperation "multiply").
- Font: "Anybody" from Google Fonts (variable width 50–150, weight 100–900), loaded with https://fonts.googleapis.com/css2?family=Anybody:ital,wdth,wght@0,50..150,100..900;1,50..150,100..900&display=swap, with a system sans-serif fallback.
- Size the canvas for devicePixelRatio (capped at 2) and do all math in CSS pixels.

## How it moves
- A full-screen canvas (100svh, at least 540px), transparent, redrawn every frame. Behind everything, the name "Your brand" centered in the main text color, Anybody weight 900, font size min(height × 0.3, width × 0.9 ÷ letter count ÷ 0.75). In front of it hangs a sheet of cloth, 0.9 × the width wide and 0.92 × the height tall, centered, made of a grid of points joined by links (Verlet physics: each point moves by its last move times drag, plus gravity; each frame relax every link toward its rest length 8 times). The grid has 36 columns (20 on screens under 700px wide) and as many rows as keep the cells square. The whole top row is pinned. Fabric weight 0.5: gravity = lerp(0.25, 0.9, weight) px per frame² and drag = lerp(0.99, 0.97, weight) per frame (f = min(dt × 60, 2.5), gravity × f²). The cloth sways a little by itself: every free point at column i and row j gets a sideways push of 0.04 × sin(t × 1.1 − (i + j) × 0.2) px per frame². Draw each cell as a filled quad in the first accent color, except cells that straddle the cut (see below). Fold shading: compare a cell's current area with its rest area; where the cloth is squeezed (area ratio below 1) darken it toward the main text color by fold depth 0.6 × (1 − ratio) × 2 (at most 1); quantize to 8 shades and draw one path per shade. The fabric is plain.
- The cut path is straight. The cut passes between two rows of the grid in every column: in column i of 36 (rows counted down from 0) it runs below row j(i) = round(rows × 0.5) (the same for every column). A point is "above the cut" if its row is at or above j(its column), otherwise "below". Any link between an above point and a below point is cut. The whole thing runs on a timeline in seconds from the start: 0.4s of just hanging, then the chalk line draws itself over 0.6s: a dashed line (dashes 10px, gaps 7px, 3px thick, the page background color at 0.9 opacity) through the cloth points on row j(i), drawn left to right as far as the chalk has got and following the cloth as it moves. Then the shears cut left to right over 1.4s in 8 bites: bite k moves the cut front during the first 0.6 of its slot (smoothstep) and rests for the rest. A link is cut once the front has passed the smaller column of its two points. At the start of each bite, kick every point within 4 cells of the front down by 3px so the cloth bunches. Draw the shears at the front, following the cloth: two blades 70px long in the main text color, pivoted together, opening to 0.4 radians and closing once per bite. Do not draw cells that straddle the cut, so a gap shows. 0.35s after the cut finishes, the top half lifts away: its pinned row rises, speeding up (speed starts at 1px per frame and increases by 0.12 px per frame²) until the whole top half is above the screen, while the bottom half, now unpinned, falls with the cloth physics and leaves the screen (skip anything more than 200px off screen). Then only the name remains.
- When the cut finishes, 12 loose threads start along the cut at random columns (one Math.random() each), each a chain of 5 points 14px apart, hanging down from the cut at that point, falling with gravity 0.05 px per frame² and drag 0.95, drawn as thin lines in the first accent color mixed halfway toward the main text color; they drift past the name and off screen.
- Until the cut starts, the pointer (a finger while it touches) is a breeze: each frame every free cloth point within 140px of it is pushed sideways by the pointer's horizontal move since the last frame × 0.5 × (1 − distance ÷ 140). The Restart button starts the whole thing again from the beginning.
- Run one requestAnimationFrame loop. dt = seconds since the last frame, clamped to 0.05; f = min(dt × 60, 2.5); t = seconds the loop has run (the sum of dt).
- Reduced-motion still frame: run the whole timeline at 60 frames a second up to 0.6s after the top half starts lifting, then draw that frame (the halves mid-fall, the name visible between them).

## How people interact
- The stage has touch-action: pan-y, so vertical swipes still scroll; a finger dragged across the cloth is the breeze.

## Where this goes
Create a single index.html file with all CSS and JavaScript inline, ready to open by double-clicking it. Don't use any libraries or build tools.

## Rules
- Smooth on a mid-range laptop and a phone: one requestAnimationFrame loop, batched canvas drawing, devicePixelRatio capped at 2, pause when off-screen.
- Respect prefers-reduced-motion: start paused and show a meaningful still frame, with a visible Play/Pause button.
- Accessible: real buttons, visible keyboard focus, text contrast of at least 4.5:1, decorative canvases hidden from screen readers.
- Works on touch screens without blocking vertical scrolling.

## When you're done
I'm new to coding. When you're done: 1) tell me in simple steps how to open the page in my browser, 2) explain in two or three sentences how it works, 3) suggest three small changes I could ask you for next.