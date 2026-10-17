# Build: Fogged bottle

## What I want
A pane of fogged glass over a colorful scene with a name on it. My cursor wipes the fog away in a soft trail, revealing sharp color and the name. Small beads form where I wipe and sometimes run down. Over a few seconds the fog creeps back in from the edges of each wiped area.

## Look
- Colors ("Riso" palette): background #F4F2FF, text #1A1240, secondary text #4E4777, accents #EC1C7F, #2A47EA, #FF7A00.
- Where accent colors overlap, multiply them like ink on paper (canvas globalCompositeOperation "multiply").
- Font: "Anybody" from Google Fonts (variable width 50–150, weight 100–900), loaded with https://fonts.googleapis.com/css2?family=Anybody:ital,wdth,wght@0,50..150,100..900;1,50..150,100..900&display=swap, with a system sans-serif fallback.
- Size the canvas for devicePixelRatio (capped at 2) and do all math in CSS pixels.

## How it moves
- A full-screen canvas (100svh, at least 540px). Behind the glass there is a colorful scene: a linear gradient at 135° through the three accent colors, with three soft circles on it in the accent colors at 0.8 opacity (center x, center y, radius as shares of the width, the height and the short side: (0.2, 0.3, 0.5), (0.8, 0.25, 0.45), (0.55, 0.85, 0.55)), and the name "Your brand" centered at 50% of the height in the main text color, Anybody weight 900, font size min(height × 0.22, width × 0.9 ÷ letter count ÷ 0.6). Over it lies a pane of fogged glass: a copy of that scene blurred by 16px (draw it at 1 ÷ blur size, then scale it up by doubling with smoothing until it is full size), then covered with the surface color at 0.8 opacity. The fog is only where the fog amount is high: keep a fog amount from 0 (clear) to 1 (thick) for every 4px square of the screen, all starting at 1, and show the sharp scene wherever it is low, blending smoothly: the picture you see is the sharp scene with the fogged copy over it at that cell's fog amount (build the fogged copy at 0.5 × the screen size, mask it by the fog amounts, then scale it up).
- Every frame the fog creeps back: for each cell below 1, fog += dt ÷ 6 × (0.3 + (1 − 0.3) × the largest fog amount among its four neighbors), up to 1, so a wiped area refills from its edges inwards (use the real dt in seconds).
- While the pointer is over the canvas (a finger while it touches), wipe: walk along the pointer's path every few pixels and, around each point, clear the fog in a circle of radius 6% of the width ÷ 2 with a soft edge: set each cell's fog amount to at most smoothstep(0, 1, (distance − radius × (1 − 0.45)) ÷ (radius × 0.45)), so the center is fully clear and the edge fades back to fog.
- Drips: for every 150px of wiping, with probability 0.3 start one drip at the pointer's x and 0.6 × the wipe radius below the pointer. A drip runs straight down at 80px per second for a random distance between 0.15 and 0.3 of the screen height (one Math.random() for the distance), clearing a line of half-width 3px as it goes, with a round bead of radius 4px at its head drawn in the surface color at 0.8 opacity with a faint outline; it disappears when it stops, leaving the clear line to fill back in like any wiped area.
- Run one requestAnimationFrame loop. dt = seconds since the last frame, clamped to 0.05.
- Reduced-motion still frame: all fog, except one band across the middle (wiped from 15% to 85% of the width at 50% of the height, at the wipe width), and two drips: at 30% of the width, run 14.000000000000002% of the height down from the band and at 60% of the width, run 10% of the height down from the band, each with its clear line and bead.

## How people interact
- The stage has touch-action: pan-y, so vertical swipes still scroll; dragging a finger sideways wipes.

## Where this goes
Create a single index.html file with all CSS and JavaScript inline, ready to open by double-clicking it. Don't use any libraries or build tools.

## Rules
- Smooth on a mid-range laptop and a phone: one requestAnimationFrame loop, batched canvas drawing, devicePixelRatio capped at 2, pause when off-screen.
- Respect prefers-reduced-motion: start paused and show a meaningful still frame, with a visible Play/Pause button.
- Accessible: real buttons, visible keyboard focus, text contrast of at least 4.5:1, decorative canvases hidden from screen readers.
- Works on touch screens without blocking vertical scrolling.

## When you're done
I'm new to coding. When you're done: 1) tell me in simple steps how to open the page in my browser, 2) explain in two or three sentences how it works, 3) suggest three small changes I could ask you for next.