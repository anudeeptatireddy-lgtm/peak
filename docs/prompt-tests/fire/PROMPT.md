# Build: Burning headline

## What I want
Flames lick up from the top edges of a headline, flickering and curling. Moving my cursor near the word fans the flames toward it and makes them taller.

## Look
- Colors ("Riso" palette): background #F4F2FF, text #1A1240, secondary text #4E4777, accents #EC1C7F, #2A47EA, #FF7A00.
- Where accent colors overlap, multiply them like ink on paper (canvas globalCompositeOperation "multiply").
- Font: "Anybody" from Google Fonts (variable width 50–150, weight 100–900), loaded with https://fonts.googleapis.com/css2?family=Anybody:ital,wdth,wght@0,50..150,100..900;1,50..150,100..900&display=swap, with a system sans-serif fallback.
- A full-screen canvas (100svh, at least 540px), transparent, cleared every frame. Size it for devicePixelRatio (capped at 2) and do all math in CSS pixels.

## How it moves
- The headline is "hot": Anybody weight 900, canvas fontStretch "expanded", textAlign center, textBaseline middle, centered horizontally at 62% of the height; font size = height × 0.3, scaled down if wider than 78% of the width. Draw it on top of the flames in the main text color. The same text drawn on a hidden canvas marks the fuel: every heat-grid cell whose center the letters cover is fuel.
- The flames live on a heat grid with 5px cells (medium detail; 8px cells on screens under 700px wide), each holding a heat from 0 to 1. Draw it into a small offscreen image (one pixel per cell) and scale it up over the canvas with smoothing on. Heat maps to color: transparent at 0, the first accent fading in up to 0.35, then mixing (in OKLab) to the second accent at 0.7 and to the third accent at 1.
- Each frame: set every fuel cell to heat 1; then, rows from the top down, every other cell takes the heat of the cell one row below, shifted sideways by round((random − 0.5) × 2 × 0.8) cells (clamped to the grid), minus random × 1.2 × 0.05 ÷ 1 (two Math.random() calls per cell, in that order), never below 0.
- The pointer fans the flames: for a cell within 200px of it, with near = 1 − distance ÷ 200, the sideways shift also gets sign(pointer x − cell x) × 1.2 × near cells, and its heat loss is multiplied by 1 − min(0.8, 1.2 × near × 0.5), so flames lean toward the pointer and grow taller. A mouse fans whenever it is over the canvas, a finger while it drags (sideways; vertical swipes still scroll).
- Run one requestAnimationFrame loop. dt = seconds since the last frame, clamped to 0.05; run one heat step per frame.
- Rebuild the grid and the fuel (all cold) on every resize and once the Anybody font has finished loading.
- Safety (PRD flashing rules): the flicker is small and local, the background never flashes. Under reduced motion, each frame the shown heat only moves 15% of the way toward the new heat, so flames flow without flickering, even after Play.
- Reduced-motion still frame: the flames after 90 steps from cold, without the pointer.

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