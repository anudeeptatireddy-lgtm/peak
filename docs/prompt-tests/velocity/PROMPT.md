# Build: Scroll-reactive marquee

## What I want
Three rows of huge repeating text that drift in alternating directions. When I scroll, they speed up, reverse direction when I scroll back up, and lean into the motion, then relax when I stop.

## Look
- Colors ("Riso" palette): background #F4F2FF, text #1A1240, secondary text #4E4777, accents #EC1C7F, #2A47EA, #FF7A00.
- Where accent colors overlap, multiply them like ink on paper (canvas globalCompositeOperation "multiply").
- Font: "Anybody" from Google Fonts (variable width 50–150, weight 100–900), loaded with https://fonts.googleapis.com/css2?family=Anybody:ital,wdth,wght@0,50..150,100..900;1,50..150,100..900&display=swap, with a system sans-serif fallback.
- No canvas: three rows of real text. The rows are decorative (aria-hidden); a visually hidden paragraph holds the three phrases for screen readers.

## How it moves
- Row 1 repeats "smooth" at font width 150 and weight 900, upright, in the main text color.
- Row 2 repeats "buttery" at font width 70 and weight 800, italic, outlined only: transparent fill with -webkit-text-stroke max(1.5px, 0.012em) in the main text color.
- Row 3 repeats "sixty frames a second" at font width 110 and weight 300, upright, in the first accent color (darkened if needed so it has at least 3:1 contrast on the background).
- Three full-width rows stacked in the middle of a full-screen section (100svh, at least 540px; the stack sits 8vh above center via bottom padding), 1vw apart (between 0.2 and 0.7rem). Each row: font size clamp(3rem, 12vw, 10rem), line-height 1.1, padding 0.02em top and bottom, overflow hidden, no wrapping. Inside each row, repeat the row's word in a flex group with gaps of 0.32em (and the same padding at the end) until the group is at least as wide as the screen, then put a copy of that group right after it.
- Each row has an offset that starts at random × 400 px (rows in order, one random number each). Every frame, offset += 1 × (1 + |scroll velocity| × boost) × dt × 60 × scroll direction × row direction (rows 1 and 3: +1, row 2: −1). Draw each row's track at translateX(−(offset mod group width)) so it wraps seamlessly.
- Scroll boost is 0.8. Scroll velocity: each frame take the change in scroll position ÷ max(dt × 60, 0.25), clamp it to ±140, and smooth it with velocity += (raw − velocity) × 0.2. Scroll direction is +1 or −1 and only changes when |raw| > 0.4; it starts at +1.
- The whole stack leans with skewX(−scroll velocity × 0.5 degrees), never more than 18 degrees either way.
- Run one requestAnimationFrame loop. dt = seconds since the last frame, clamped to 0.05; t = seconds the loop has run (the sum of dt).
- Measure the rows again (and rebuild their repeats) on every resize and once the font has loaded.
- Reduced-motion still frame: the rows in place, with no lean.

## How people interact
- Scrolling the page drives the speed, direction and lean, with touch scrolling too.
- If the page itself barely scrolls (a short page), give the section its own scroll area instead: an invisible scroller over it, three screens tall, that quietly jumps back by one screen whenever it gets within half a screen of either end, and read the scroll position from it (adding up the jumps).

## Where this goes
Create a single index.html file with all CSS and JavaScript inline, ready to open by double-clicking it. Don't use any libraries or build tools.

## Rules
- Smooth on a mid-range laptop and a phone: one requestAnimationFrame loop, batched canvas drawing, devicePixelRatio capped at 2, pause when off-screen.
- Respect prefers-reduced-motion: start paused and show a meaningful still frame, with a visible Play/Pause button.
- Accessible: real buttons, visible keyboard focus, text contrast of at least 4.5:1, decorative canvases hidden from screen readers.
- Works on touch screens without blocking vertical scrolling.

## When you're done
I'm new to coding. When you're done: 1) tell me in simple steps how to open the page in my browser, 2) explain in two or three sentences how it works, 3) suggest three small changes I could ask you for next.