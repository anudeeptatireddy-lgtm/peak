# Build: Living wallpaper

## What I want
A full-screen living wallpaper: thousands of tiny particles drift along an invisible, slowly shifting current and leave soft fading trails. When I press and hold, a whirlpool forms around my cursor or finger and stirs them.

## Look
- Colors ("Riso" palette): background #F4F2FF, text #1A1240, secondary text #4E4777, accents #EC1C7F, #2A47EA, #FF7A00.
- Where accent colors overlap, multiply them like ink on paper (canvas globalCompositeOperation "multiply").
- Font: "Anybody" from Google Fonts (variable width 50–150, weight 100–900), loaded with https://fonts.googleapis.com/css2?family=Anybody:ital,wdth,wght@0,50..150,100..900;1,50..150,100..900&display=swap, with a system sans-serif fallback.
- Size the canvas for devicePixelRatio (capped at 2) and draw in CSS pixels.

## How it moves
- A full-screen canvas (100svh, at least 540px) filled with the background color. Use round(clamp(width × height ÷ 620, 500, 2200)) particles, a third in each accent color (particle i gets accent i mod 3). Each particle spawns at a random spot (random × width, random × height) with a life of 40 + random × 220 frames (call Math.random() in that order: x, y, life).
- Every frame each particle moves (cos(angle), sin(angle)) × 1.7 × f pixels, where f = min(dt × 60, 2.5) and angle is the current at its position.
- The current's angle at (x, y), with t = seconds the animation has run and s = 0.0026: sin(x × s + t × 0.23) × 1.9 + cos(y × s × 1.4 − t × 0.17) × 1.6 + sin((x − y) × s × 0.6 + t × 0.11) × 1.3.
- Never clear the canvas. Each frame, first paint the background color over everything at opacity min(1, 0.075 × f) (this fades old trails), then draw each particle's step as a line from its old to its new position at 90% opacity with round caps, one path per accent color, using the blend mode above. Each frame every particle's life drops by 1 (not by f); when it runs out, or the particle is more than 5px off screen, it respawns.
- While a mouse button or finger is held down on the canvas, a particle within R = clamp(shorter side × 0.35, 140, 280) px of the pointer gets extra velocity ((−dy/d) × 7 − (dx/d) × 1.2, (dx/d) × 7 − (dy/d) × 1.2) × (1 − d/R), where (dx, dy) is from the pointer to the particle and d its length: an orbit with a slight pull inward.
- Trails are 1.4px thick with round ends.
- Run one requestAnimationFrame loop. dt = seconds since the last frame, clamped to 0.05; t = seconds the loop has run (the sum of dt).
- Rebuild all particles and repaint the background on every resize; repaint the background whenever the background color changes (this clears the trails).
- Reduced-motion still frame: repaint the background, then run 70 steps with t = step ÷ 60 and f = 1, without the stir.

## How people interact
- Stir with a mouse button held down. On touch, the stir starts once a finger has been held still for a quarter of a second, so normal swipes still scroll the page (touch-action: pan-y; once stirring, stop the page from scrolling).

## Where this goes
Create a single index.html file with all CSS and JavaScript inline, ready to open by double-clicking it. Don't use any libraries or build tools.

## Rules
- Smooth on a mid-range laptop and a phone: one requestAnimationFrame loop, batched canvas drawing, devicePixelRatio capped at 2, pause when off-screen.
- Respect prefers-reduced-motion: start paused and show a meaningful still frame, with a visible Play/Pause button.
- Accessible: real buttons, visible keyboard focus, text contrast of at least 4.5:1, decorative canvases hidden from screen readers.
- Works on touch screens without blocking vertical scrolling.

## When you're done
I'm new to coding. When you're done: 1) tell me in simple steps how to open the page in my browser, 2) explain in two or three sentences how it works, 3) suggest three small changes I could ask you for next.