# Build: Glitch

## What I want
A calm headline in the middle of the page. When I hover or tap it, it tears into horizontal slices that jump sideways while its three ink colors split apart, then snaps clean after a short burst. Now and then a small glitch happens by itself. Only the headline glitches, never the whole screen, and nothing flashes more than three times a second.

## Look
- Colors ("Riso" palette): background #F4F2FF, text #1A1240, secondary text #4E4777, accents #EC1C7F, #2A47EA, #FF7A00.
- Where accent colors overlap, multiply them like ink on paper (canvas globalCompositeOperation "multiply").
- Font: "Anybody" from Google Fonts (variable width 50–150, weight 100–900), loaded with https://fonts.googleapis.com/css2?family=Anybody:ital,wdth,wght@0,50..150,100..900;1,50..150,100..900&display=swap, with a system sans-serif fallback.
- Size the canvas for devicePixelRatio (capped at 2) and do all math in CSS pixels.

## How it moves
- A full-screen canvas (100svh, at least 540px), transparent, cleared every frame. The headline "glitch" is centered at 50% of the height, in Anybody weight 900 and font stretch 100%, font size = min(height × 0.3, width × 0.9 ÷ letter count × 1.6), one line, textAlign center, textBaseline middle. When calm it is drawn once in the main text color. During a burst it is drawn as three color channels (one copy each in the first, second and third accent color, at 0.85 opacity, with the blend mode above), cut into 8 horizontal slices of equal height, each slice shifted sideways. Draw each channel into its own offscreen image with 0.6 × the font size of padding so nothing is cut off, then draw the slices from it.
- Color split 6px: at the middle of a burst the first channel is moved 6px left, the third 6px right and the second stays put (multiply by the burst envelope below).
- When a burst starts, give each slice a random sideways jump: with probability 0.5 it jumps (otherwise 0), by (random between −1 and 1) × 0.5 × 0.4 × the font size (one Math.random() for whether it jumps and one for how far, per slice, top to bottom; the same jumps for all three channels). The jumps are fixed for the whole burst.
- A burst lasts 0.3s. Its envelope e rises and falls smoothly: e = sin(π × p), p = time into the burst ÷ 0.3. Slice jumps and the color split are multiplied by e, so the headline tears apart then snaps clean.
- A burst also starts by itself: after each burst, wait 4s × a random number between 0.5 and 1.5 before the next automatic one.
- A burst starts when the pointer moves onto the headline (its text box), and when the headline is clicked or tapped.
- Run one requestAnimationFrame loop. dt = seconds since the last frame, clamped to 0.05; t = seconds the loop has run (the sum of dt).
- Safety: a burst changes the picture twice, once when it starts and once when it ends. Keep a list of the times of recent changes. A new burst of length L starting now may begin only if adding its two changes (now and now + L) leaves no more than 3 changes inside any window shorter than 1 second; otherwise ignore the trigger (a hover that is refused tries again on the next frame while the pointer is still over the headline). Nothing is ever inverted, and only the headline's own pixels move.
- Reduced motion: never start a burst, not even automatic ones, and show only the still frame.
- Reduced-motion still frame: the clean headline in the main text color with the three channels drawn with their resting split, no slices.

## How people interact
- The stage has touch-action: pan-y, so vertical swipes still scroll; tapping the headline starts a burst.

## Where this goes
Create a single index.html file with all CSS and JavaScript inline, ready to open by double-clicking it. Don't use any libraries or build tools.

## Rules
- Smooth on a mid-range laptop and a phone: one requestAnimationFrame loop, batched canvas drawing, devicePixelRatio capped at 2, pause when off-screen.
- Respect prefers-reduced-motion: start paused and show a meaningful still frame, with a visible Play/Pause button.
- Accessible: real buttons, visible keyboard focus, text contrast of at least 4.5:1, decorative canvases hidden from screen readers.
- Works on touch screens without blocking vertical scrolling.

## When you're done
I'm new to coding. When you're done: 1) tell me in simple steps how to open the page in my browser, 2) explain in two or three sentences how it works, 3) suggest three small changes I could ask you for next.