# Build: Skidding headline

## What I want
A big headline whose letters drive in one by one from off-screen like cars, overshoot their spots and skid to a stop with a tilt and a squash, leaving smoky skid marks that fade. Parked, they idle with a small engine shake. Scrolling down makes them peel out the other way in a puff of smoke; scrolling back up brings them back in. Clicking replays the entrance.

## Look
- Colors ("Riso" palette): background #F4F2FF, text #1A1240, secondary text #4E4777, accents #EC1C7F, #2A47EA, #FF7A00.
- Where accent colors overlap, multiply them like ink on paper (canvas globalCompositeOperation "multiply").
- Font: "Anybody" from Google Fonts (variable width 50–150, weight 100–900), loaded with https://fonts.googleapis.com/css2?family=Anybody:ital,wdth,wght@0,50..150,100..900;1,50..150,100..900&display=swap, with a system sans-serif fallback.
- A full-screen canvas (100svh, at least 540px), transparent, cleared every frame. Size it for devicePixelRatio (capped at 2) and do all math in CSS pixels.
- Draw in this order each frame: skid marks, smoke puffs, then the letters.

## How it moves
- The headline is "skid", drawn letter by letter on the canvas in the main text color: Anybody weight 900, canvas fontStretch "expanded", textAlign center, textBaseline alphabetic. Font size = min(height × 0.34, width × 0.26), then scaled down if the line (with spacing) is wider than 84% of the width. Lay the letters out in one centered row: letter i's left edge = row start + measureText(first i letters).width + i × 0.06 × font size, and its parked center is that edge plus half its own width (measureText of the letter). The row's middle (halfway between the text's actualBoundingBoxAscent and actualBoundingBoxDescent) sits at 50% of the height.
- Arriving: letter i (left to right) starts 90ms × i after the entrance begins. It drives in from the left, starting with its right edge 1 letter width beyond the left edge of the canvas, at 40px per frame × f, until it is 160px short of its parked spot (if it starts closer than that, it skips straight to skidding).
- Skidding: the letter slides from 160px short of its spot to 0.35 × its width past it, eased with ease-out-quad (1 − (1 − p)²) over 2 × that distance ÷ (speed × 60) seconds, so it starts at its driving speed. Then it settles back onto its spot with ease-in-out-cubic over 0.35s and is parked.
- While skidding, with s = sin(π × skid progress), the letter turns 12° × s clockwise and squashes: scale x by 1 − 0.18 × s and y by 1 + 0.18 × s, around the middle of its baseline (so it stays on the ground).
- Skid marks: every frame a letter skids, record two segments from its previous to its current position, one per tire, at its center x ± 0.28 × its width, along the baseline. Draw every segment as a line 3px wide in the secondary text color at opacity 0.35 × (1 − age ÷ 2.5s); remove it after 2.5s. Draw marks first, under everything.
- Smoke: each frame a letter skids, with probability 0.5 (one Math.random() call, letters left to right), puff a smoke circle at its rear tire on the baseline; a peeling-out letter puffs with probability min(1, 0.5 × 2). A puff starts at radius 14px and grows linearly to 3× that over 1.2s, rises 0.4px per frame × f, and fades from opacity 0.25 to 0 over its life. Draw puffs after the marks and before the letters, in the secondary text color.
- Parked letters idle with an engine shake: move letter i up and down by 0.8px × sin(t × 38 + i × 1.7), t in seconds.
- Scroll velocity: each frame take the change in scroll position ÷ max(dt × 60, 0.25), clamp it to ±140, and smooth it: velocity += (raw − velocity) × 0.2. When it goes above 4 (scrolling down) while the letters are in, they peel out to the right, rightmost first, 60ms apart: each accelerates from rest by 1.2px per frame² × f, leaning back (counterclockwise) by 12° × min(1, its speed ÷ entry speed) ÷ 2, and leaves no marks. When it goes below −4 (scrolling up) while they are out or leaving, the entrance plays again.
- Reduced-motion still frame: the letters parked (no shake), each with its two tire marks running 160px back from its parked center, at opacity 0.15.
- Run one requestAnimationFrame loop. dt = seconds since the last frame, clamped to 0.05; f = min(dt × 60, 2.5); t = seconds the loop has run.
- The first entrance starts when the letters are first laid out (once the Anybody font has loaded), at that moment’s t, not at page load. It plays again on a click or tap (on release) and when scrolling up brings the letters back, restarting every letter from the left; old marks and smoke stay until they fade. Handle clicks at the start of a frame, right after t += dt, so a replay starts at that frame’s t.
- Lay the letters out again on every resize and once the Anybody font has finished loading.
- If the page itself barely scrolls (a short page), give the section its own scroll area: an invisible scroller over it, three screens tall, that quietly jumps back by one screen whenever it gets within half a screen of either end, and read the scroll position from it (adding up the jumps).

## How people interact
- Scroll (wheel, trackpad or touch) to make the letters peel out or come back; click or tap to replay the entrance. Vertical swipes keep scrolling (touch-action: pan-y).

## Where this goes
Create a single index.html file with all CSS and JavaScript inline, ready to open by double-clicking it. Don't use any libraries or build tools.

## Rules
- Smooth on a mid-range laptop and a phone: one requestAnimationFrame loop, batched canvas drawing, devicePixelRatio capped at 2, pause when off-screen.
- Respect prefers-reduced-motion: start paused and show a meaningful still frame, with a visible Play/Pause button.
- Accessible: real buttons, visible keyboard focus, text contrast of at least 4.5:1, decorative canvases hidden from screen readers.
- Works on touch screens without blocking vertical scrolling.

## When you're done
I'm new to coding. When you're done: 1) tell me in simple steps how to open the page in my browser, 2) explain in two or three sentences how it works, 3) suggest three small changes I could ask you for next.