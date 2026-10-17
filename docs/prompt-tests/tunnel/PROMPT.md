# Build: Infinite tunnel

## What I want
I fly through an endless tunnel of glowing rings and stripes that twists and turns. My cursor steers, and pressing and holding speeds me up. The rings spread further apart as I go faster, so nothing ever flashes more than three times a second.

## Look
- Colors ("Riso" palette): background #F4F2FF, text #1A1240, secondary text #4E4777, accents #EC1C7F, #2A47EA, #FF7A00.
- Where accent colors overlap, multiply them like ink on paper (canvas globalCompositeOperation "multiply").
- Font: "Anybody" from Google Fonts (variable width 50–150, weight 100–900), loaded with https://fonts.googleapis.com/css2?family=Anybody:ital,wdth,wght@0,50..150,100..900;1,50..150,100..900&display=swap, with a system sans-serif fallback.
- Size the canvas for devicePixelRatio (capped at 2) and do all math in CSS pixels.
- After the rings, add a soft glow of fog at the vanishing point: a radial gradient from the background color at 0.85 opacity at the center to transparent at 0.35 × the short side.

## How it moves
- A full-screen canvas (100svh, at least 540px), cleared every frame, drawn with the blend mode above. You fly through a tunnel of 60 rings, each a circle (a 48-sided polygon) of world radius 400. Ring k (k = 1 to 60) lies at depth z = (k − frac) × gap in front of the camera, where gap is the ring spacing and frac (0 to 1) is how far the camera is between two rings. Perspective: a point at (x, y, z) is drawn at (center x + x × focal ÷ z, center y + y × focal ÷ z), where focal = short side × 1. Skip rings with z below 20. Draw rings from far to near. Ring colors cycle through the three accents, flowing past with the rings.
- Stripes: 12 of them. For each stripe s, at angle 2π × s ÷ 12 around the ring, draw a line from that point on one ring to the same angle on the next ring (on a square or hexagon, the point on its outline in that direction), in the second accent color at 0.6 opacity, 3px thick.
- Rings are drawn 3px thick with round joins, one path per color.
- Flight speed v = 1 × 600 world units per second (× the boost while boosting). Each frame, travel += v × dt and frac += v × dt ÷ gap; when frac reaches 1, subtract 1 (a ring has passed). Safety: gap = max(120, v ÷ 3) so rings pass any spot at most 3 times a second, whatever the speed.
- The tunnel winds along a smooth simplex-noise path (noise seed 41): a ring at distance d along the tunnel (d = travel + its depth) is shifted by (noise(d × 0.0003, 0), noise(d × 0.0003, 11.3)) × 0.6 × the ring radius, minus the same for the camera's own spot so the tunnel bends ahead of you, and turned by 0.8 × π × noise(d × 0.0003 × 0.5, 37.5) radians.
- While the mouse button is held (on touch: after a press-and-hold of about 250ms), the speed multiplier eases toward 2.5, otherwise toward 1: boost += (target − boost) × (1 − (1 − 0.06)^f).
- The camera sits off the tunnel's middle by (cam x, cam y), eased toward its target each frame: cam += (target − cam) × (1 − (1 − 0.06)^f). While the pointer is over the canvas the target is 0.4 × the ring radius × the pointer's position across the screen from the center, from −1 to 1 on each axis. Otherwise it wanders by itself: (noise(t × 0.25, 0), noise(t × 0.25, 11.3)) × 0.4 × the ring radius.
- Run one requestAnimationFrame loop. dt = seconds since the last frame, clamped to 0.05; f = min(dt × 60, 2.5); t = seconds the loop has run (the sum of dt).
- Reduced-motion still frame: the tunnel at rest, with frac = 0.25, no steering and no boost.

## How people interact
- The stage has touch-action: pan-y, so vertical swipes still scroll. On a phone it steers itself, and a press-and-hold boosts.

## Where this goes
Create a single index.html file with all CSS and JavaScript inline, ready to open by double-clicking it. Don't use any libraries or build tools.

## Rules
- Smooth on a mid-range laptop and a phone: one requestAnimationFrame loop, batched canvas drawing, devicePixelRatio capped at 2, pause when off-screen.
- Respect prefers-reduced-motion: start paused and show a meaningful still frame, with a visible Play/Pause button.
- Accessible: real buttons, visible keyboard focus, text contrast of at least 4.5:1, decorative canvases hidden from screen readers.
- Works on touch screens without blocking vertical scrolling.

## When you're done
I'm new to coding. When you're done: 1) tell me in simple steps how to open the page in my browser, 2) explain in two or three sentences how it works, 3) suggest three small changes I could ask you for next.