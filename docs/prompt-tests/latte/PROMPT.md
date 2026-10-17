# Build: Latte pour

## What I want
Looking straight down into a cup of dark coffee with a speckled, tiger-striped crema, a thin stream of milk pours in from the top edge. Where it lands white foam blooms in soft rings, then the stream drags through the surface, filling the letters of a name in loose latte-art strokes. The stream lifts away and the foam settles, edges softening. The cup turns a few degrees toward the cursor.

## Look
- Colors ("Riso" palette): background #F4F2FF, text #1A1240, secondary text #4E4777, accents #EC1C7F, #2A47EA, #FF7A00.
- Where accent colors overlap, multiply them like ink on paper (canvas globalCompositeOperation "multiply").
- Font: "Anybody" from Google Fonts (variable width 50–150, weight 100–900), loaded with https://fonts.googleapis.com/css2?family=Anybody:ital,wdth,wght@0,50..150,100..900;1,50..150,100..900&display=swap, with a system sans-serif fallback.
- Size the canvas for devicePixelRatio (capped at 2) and do all math in CSS pixels.

## How it moves
- A full-screen canvas (100svh, at least 540px), transparent, redrawn every frame, showing a cup of coffee seen from straight above, centered. The coffee is a disc of radius R = screen height × 70% ÷ 2. Around it: a cup rim ring at 1.1 × R and a saucer ring at 1.32 × R, both in the surface color with a 3px outline in the main text color. The coffee is stored on a grid of 4px cells over the disc, each with a foam amount from 0 (just crema) to 1 (white foam), all starting at 0. Crema color = the first accent color mixed toward the main text color by crema darkness 0.5, with a fixed tiger-striped, speckled texture on top (random numbers from a generator seeded 91): 28 radial streaks from the center at 0.15 opacity and about 14 small speckles per 1000 cells at 0.35 opacity, in lighter and darker versions of the crema. Foam color = the surface color. A cell is drawn as crema mixed toward foam by smoothstep(0, 1, foam amount × 0.6 × 2) (foam thickness 0.6). The name "Your brand" is poured in foam: rasterize it (Anybody weight 800, centered in the disc, font size 0.32 × the disc diameter) onto the grid to know which cells are letters.
- The pour takes T = 3s from the start. Phase 1 (0 to 0.25 × T): the milk stream falls in a thin straight line (3.5px wide × foam spread 1, in the surface color) from 1.25 × R above the center, straight down to the center of the coffee, and lays foam there: a gaussian of radius 3.5px × 1 that adds 2.4 × foam per second, plus 3 rings of foam, each 2.5 cells wide, spreading outward from the landing spot at 28 cells per second, each ring laying foam at 0.35 (taking the larger of that and what is there) until it reaches 0.4 × R, started in turn, evenly spread over this phase. Phase 2 (0.25 × T to 0.85 × T): the landing spot follows a path that traces the letters: scan the name's rows from top to bottom, 0.8 × the spot size apart, and in each row visit the runs of letter cells left to right, then right to left in the next row (a zigzag that fills each letter), moving at a constant speed so the whole path takes this phase; foam is laid down along the way: as the spot moves each frame, stamp the foam gaussian every half spot-size along its move, each stamp adding 0.7 × (foam thickness + 0.35) only on the pouring parts, and only on cells that are part of a letter or within 0 cell of one (so the letters keep their shape; the bloom at the start is not limited this way) (the jumps between runs lay nothing), so the strokes are continuous even though the spot moves far each frame. Phase 3 (0.85 × T to T): the stream shortens and stops laying foam, lifting away (shrink its length to 0). Add a wobble to the landing spot: x and y each move by 0.3 × 14px × sin(t × 5.5 and a different phase for each axis). Then for 2.5s the foam settles: each frame move every cell's foam toward the average of its four neighbors by 0.6 × dt, so edges soften. Use real dt in seconds for everything.
- After the pour, the whole cup (coffee, rim and saucer, turned about the center) turns toward the pointer: its angle eases toward 6° × clamp((pointer x − center x) ÷ (width ÷ 2), −1, 1) each frame by 1 − (1 − 0.05)^f (f = min(dt × 60, 2.5)). The Restart button pours again.
- The cup follows only the pointer; there is no motion button.
- Run one requestAnimationFrame loop. dt = seconds since the last frame, clamped to 0.05; f = min(dt × 60, 2.5); t = seconds since the pour started.
- Reduced-motion still frame: run the whole pour and the 2.5s of settling at 60 frames a second, then draw: the finished latte art with 2 faint curls of steam above the cup (wavy lines rising to 0.45 × R above the cup, in the main text color at 0.35 opacity).

## How people interact
- The stage has touch-action: pan-y, so vertical swipes still scroll. On phones the cup can turn with the device tilt after a tap on "Use motion".

## Where this goes
Create a single index.html file with all CSS and JavaScript inline, ready to open by double-clicking it. Don't use any libraries or build tools.

## Rules
- Smooth on a mid-range laptop and a phone: one requestAnimationFrame loop, batched canvas drawing, devicePixelRatio capped at 2, pause when off-screen.
- Respect prefers-reduced-motion: start paused and show a meaningful still frame, with a visible Play/Pause button.
- Accessible: real buttons, visible keyboard focus, text contrast of at least 4.5:1, decorative canvases hidden from screen readers.
- Works on touch screens without blocking vertical scrolling.

## When you're done
I'm new to coding. When you're done: 1) tell me in simple steps how to open the page in my browser, 2) explain in two or three sentences how it works, 3) suggest three small changes I could ask you for next.