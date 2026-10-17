# Build: Moiré

## What I want
Two or three layers of fine rings, lines or dots lie on top of each other and interfere into big shimmering bands. Moving my cursor slides and turns one layer, and when I leave it alone the pattern drifts slowly. The motion is slow enough that no spot ever pulses more than three times a second.

## Look
- Colors ("Riso" palette): background #F4F2FF, text #1A1240, secondary text #4E4777, accents #EC1C7F, #2A47EA, #FF7A00.
- Where accent colors overlap, multiply them like ink on paper (canvas globalCompositeOperation "multiply").
- Font: "Anybody" from Google Fonts (variable width 50–150, weight 100–900), loaded with https://fonts.googleapis.com/css2?family=Anybody:ital,wdth,wght@0,50..150,100..900;1,50..150,100..900&display=swap, with a system sans-serif fallback.
- Size the canvas for devicePixelRatio (capped at 2) and do all math in CSS pixels.
- Draw each pattern slightly bigger than the screen (1.1 × the diagonal) so no corner is empty when it turns. Layer 1 stays fixed and is drawn in the first accent color, layer 2 in the second and layer 3 in the third, each with the blend mode above.

## How it moves
- A full-screen canvas (100svh, at least 540px), transparent, cleared every frame, with 2 stacked layers of the same pattern (rings), each drawn in its own accent color with the blend mode above. Rings: circles around the layer's center with radii 8px, 16px, 24px and so on out past 1.1 × the half diagonal, each stroked 2px thick. Layer 1 is centered on the screen and never moves. Layer 2 is moved by (offset x, offset y) and rotated by its turn angle about the screen center.
- Only two layers: layer 1 in the first accent color, layer 2 in the second.
- With no pointer over the canvas, layer 2's target drifts: x = short side × 0.1 × 0.3 × sin(t × 0.3), y = short side × 0.1 × 0.3 × sin(t × 0.3 × 1.3 + 1.1), turn = 6° × 0.3 × sin(t × 0.3 × 0.7).
- Each frame layer 2 moves toward its target by a share 1 − (1 − 0.08)^f of the remaining distance (slide and turn), but never by more than the speed caps below. h is the cap share for 2 layers.
- While the pointer is over the canvas (a finger while it touches), layer 2's target is: offset = (pointer − screen center) × 0.15, turn = 6° × clamp((pointer x − center x) ÷ (width ÷ 2), −1, 1).
- Run one requestAnimationFrame loop. dt = seconds since the last frame, clamped to 0.05; f = min(dt × 60, 2.5); t = seconds the loop has run (the sum of dt).
- Safety: the layers move toward their target, but never faster than a speed cap so the bands beat at most 3 times a second at any spot. Let h = 3 ÷ 2 (÷ 1.5 when there are 3 layers, because the third moves relative to the second too). Layer 2 may slide at most h × spacing pixels per second and turn at most h × spacing ÷ R radians per second, where R is half the screen diagonal. Each frame cap the slide distance at h × spacing × dt and the turn at h × spacing ÷ R × dt.
- Layer 3 slides and turns -0.5 × as much as layer 2 (the opposite way).
- Reduced-motion still frame: layer 2 shifted sideways by 0.35 × the spacing and turned 3°, nothing moving.

## How people interact
- The stage has touch-action: pan-y, so vertical swipes still scroll; on a phone, dragging sideways shifts the pattern.

## Where this goes
Create a single index.html file with all CSS and JavaScript inline, ready to open by double-clicking it. Don't use any libraries or build tools.

## Rules
- Smooth on a mid-range laptop and a phone: one requestAnimationFrame loop, batched canvas drawing, devicePixelRatio capped at 2, pause when off-screen.
- Respect prefers-reduced-motion: start paused and show a meaningful still frame, with a visible Play/Pause button.
- Accessible: real buttons, visible keyboard focus, text contrast of at least 4.5:1, decorative canvases hidden from screen readers.
- Works on touch screens without blocking vertical scrolling.

## When you're done
I'm new to coding. When you're done: 1) tell me in simple steps how to open the page in my browser, 2) explain in two or three sentences how it works, 3) suggest three small changes I could ask you for next.