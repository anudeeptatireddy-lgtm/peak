# peak: Scene catalog

The 50 scenes peak launches with. This file is the source of truth for each scene's details; the rules that apply to every scene (mix, flashing safety, phones, definition of done) are in `docs/PRD.md` §8.

**Sources.** Scenes 1–3, 21–23 come from `reference/peak-prototype.html`: port their physics and feel exactly, with params defaulting to the prototype's values. Scenes 26, 27, 35 and 36 come from `reference/riso-demo.html` (the riso demo built on 2026-10-16): same rule, their defaults are that file's constants. Scenes 4, 24, 25, 37, 45 and 46 keep the details they had in PRD v1.0 §8. Everything else is new.

**Format.** Each entry: use case, default world, technique, what happens, interactions, params, still frame (for reduced motion), mobile notes, tags, difficulty, time. Param notation: `id` Label: min–max (default). Text params list their max length. "Short side" means the smaller of the stage's width and height.

**Difficulty.** Easy, Medium, or Spicy. Spicy scenes are the wildest ones: they lean on the shared kits (PRD §16.8) and need the most tuning.

**Flashing.** Scenes marked ⚠ flash or flicker and must follow the safety rule in PRD §8.2: never more than 3 flashes per second, and no large or full-screen flashes.

**Settings.** Entries list each scene's main params. Every scene also has a collapsed **Advanced** group holding every other number that shapes it (PRD §8.5), with defaults equal to its source's constants; the full list lives in `src/scenes/<slug>/params.ts`.

**Phones.** Unless an entry says otherwise, drags that need free movement start only after a short press-and-hold (PRD §8.4), so a normal swipe still scrolls the page.

## Contents

| # | id | Title | Group | World | Difficulty |
|---|---|---|---|---|---|
| 1 | `particles` | Your name in particles | Text | Dreamhouse | Medium |
| 2 | `elastic` | Stretchy headline | Text | Spice Dunes | Easy |
| 3 | `velocity` | Scroll-reactive marquee | Text | Doomsday | Easy |
| 4 | `scramble` | Decoding text | Text | Neon Arcade | Easy |
| 5 | `marbles` | Text to marbles | Text | Cherry Cola | Spicy |
| 6 | `skid` | Skidding headline | Text | Newsprint | Spicy |
| 7 | `melt` | Melting text | Text | Golden Hour | Medium |
| 8 | `tumble` | Falling letters | Text | Toxic | Medium |
| 9 | `fridge` | Fridge magnets | Text | Glacier | Easy |
| 10 | `typewriter` | Typewriter | Text | Newsprint | Easy |
| 11 | `splitflap` | Split-flap board | Text | Blueprint | Medium |
| 12 | `kinetic` | Kinetic poster | Text | Newsprint | Medium |
| 13 | `shatter` | Shattering words | Text | Glacier | Medium |
| 14 | `flag` | Flag text | Text | Matcha | Medium |
| 15 | `extrude` | 3D letters | Text | Blueprint | Medium |
| 16 | `echo` | Echo trail | Text | Vapor Mall | Easy |
| 17 | `sand` | Sand text | Text | Spice Dunes | Medium |
| 18 | `neon` | Neon sign ⚠ | Text | Neon Arcade | Spicy |
| 19 | `rubber` | Rubber letters | Text | Lava Lamp | Medium |
| 20 | `fire` | Burning headline ⚠ | Text | Doomsday | Spicy |
| 21 | `ripple` | Ripple background | Physics | Abyss | Medium |
| 22 | `flow` | Living wallpaper | Physics | Glacier | Medium |
| 23 | `warp` | Hyperspace intro | Physics | Neon Arcade | Medium |
| 24 | `confetti` | Celebration burst | Physics | Dreamhouse | Easy |
| 25 | `goo` | Gooey blobs | Physics | Dreamhouse | Easy |
| 26 | `drop` | Ink-ball pile | Physics | Cherry Cola | Medium |
| 27 | `pluck` | Strings | Physics | Aurora | Easy |
| 28 | `cloth` | Tearable cloth | Physics | Blueprint | Spicy |
| 29 | `fireworks` | Fireworks ⚠ | Physics | Golden Hour | Medium |
| 30 | `blackhole` | Black hole | Physics | Doomsday | Spicy |
| 31 | `flock` | Flock | Physics | Aurora | Medium |
| 32 | `lightning` | Lightning ⚠ | Physics | Toxic | Spicy |
| 33 | `smoke` | Smoke | Physics | Aurora | Spicy |
| 34 | `filings` | Iron filings | Physics | Toxic | Medium |
| 35 | `overprint` | Overprint blobs | Shapes | Riso | Easy |
| 36 | `halftone` | Halftone paper | Shapes | Riso | Easy |
| 37 | `tilt` | Holographic card | Shapes | Abyss | Medium |
| 38 | `kaleido` | Kaleidoscope | Shapes | Vapor Mall | Easy |
| 39 | `morph` | Shape morph | Shapes | Matcha | Easy |
| 40 | `moire` | Moiré ⚠ | Shapes | Riso | Easy |
| 41 | `tunnel` | Infinite tunnel ⚠ | Shapes | Neon Arcade | Spicy |
| 42 | `lava` | Lava lamp | Shapes | Lava Lamp | Medium |
| 43 | `fold` | Paper fold | Shapes | Golden Hour | Medium |
| 44 | `glitch` | Glitch ⚠ | Shapes | Vapor Mall | Spicy |
| 45 | `magnetic` | Magnetic buttons | Interface | Matcha | Easy |
| 46 | `countdown` | Event countdown | Interface | Spice Dunes | Medium |
| 47 | `trail` | Cursor trail | Interface | Abyss | Easy |
| 48 | `curtain` | Page transitions | Interface | Cherry Cola | Medium |
| 49 | `jelly` | Jelly cards | Interface | Lava Lamp | Easy |
| 50 | `loaders` | Loading pack | Interface | Glacier | Easy |
| 51 | `fogged` | Fogged bottle | Industry | Aurora | Medium |
| 52 | `tailor` | Tailor's cut | Industry | Newsprint | Hard |
| 53 | `latte` | Latte pour | Industry | Spice Dunes | Hard |
| 54 | `slatted` | Slatted Sun | Realistic | Golden Hour | Spicy |
| 55 | `velvet` | Velvet Brush | Realistic | Cherry Cola | Spicy |
| 56 | `soap` | Soap Film | Realistic | Abyss | Spicy |
| 57 | `inkbloom` | Ink Bloom | Realistic | Newsprint | Spicy |
| 58 | `goldleaf` | Gold Leaf | Realistic | Doomsday | Spicy |
| 59 | `fizz` | Fizz | Realistic | Toxic | Spicy |
| 60 | `snowledge` | Snow Ledge | Realistic | Glacier | Spicy |
| 61 | `raking` | Raking Light | Realistic | Riso | Spicy |
| 62 | `pendulum` | Pendulum Field | Animated | Aurora | Medium |
| 63 | `anamorphic` | Anamorphic | Animated | Vapor Mall | Medium |
| 64 | `domino` | Domino Run | Animated | Matcha | Medium |
| 65 | `coilstairs` | Coil Stairs | Animated | Dreamhouse | Medium |
| 66 | `clockwork` | Clockwork | Animated | Blueprint | Spicy |
| 67 | `epicycles` | Epicycles | Animated | Neon Arcade | Medium |
| 68 | `clayframes` | Clay Frames | Animated | Lava Lamp | Medium |
| 69 | `stringart` | String Art | Animated | Newsprint | Medium |
| 70 | `shoreline` | Shoreline | Realistic | Spice Dunes | Spicy |
| 71 | `duskfacade` | Dusk Facade | Realistic | Vapor Mall | Medium |
| 72 | `microprint` | Microprint | Realistic | Matcha | Medium |
| 73 | `rakedgarden` | Raked Garden | Realistic | Newsprint | Medium |
| 74 | `ceilingstars` | Ceiling Stars | Realistic | Abyss | Medium |
| 75 | `wafershine` | Wafer Shine ⚠ | Realistic | Blueprint | Medium |
| 76 | `thinice` | Thin Ice | Realistic | Glacier | Spicy |
| 77 | `growthrings` | Growth Rings | Realistic | Golden Hour | Medium |
| 78 | `startrails` | Star Trails | Realistic | Doomsday | Medium |
| 79 | `pinwall` | Pin Wall | Realistic | Riso | Medium |
| 80 | `signalpaths` | Signal Paths | Animated | Aurora | Medium |
| 81 | `platformarrival` | Platform Arrival | Animated | Cherry Cola | Medium |
| 82 | `doorwave` | Door Wave | Animated | Dreamhouse | Medium |
| 83 | `resonanceplate` | Resonance Plate | Animated | Glacier | Spicy |
| 84 | `torchmap` | Torch Map ⚠ | Animated | Toxic | Medium |
| 85 | `doubling` | Doubling | Animated | Golden Hour | Medium |
| 86 | `peekaboo` | Peekaboo | Animated | Matcha | Medium |
| 87 | `gatherround` | Gather Round | Animated | Aurora | Medium |
| 88 | `tokenstream` | Token Stream | Animated | Neon Arcade | Medium |
| 89 | `infinitezoom` | Infinite Zoom | Animated | Vapor Mall | Spicy |

Every world hosts three scenes except Glacier and Neon Arcade, which host four, so the gallery reads as a patchwork of color (PRD §6.7). The 12 scenes featured on the home page are listed in PRD §6.1.

---

## Text and headlines (1–20)

### 1. `particles`: Your name in particles
- **Use case:** a portfolio or personal-page intro. **World:** Dreamhouse. **Technique:** particle system sampled from text, springs, repulsion, impulse.
- **What happens:** A word made of thousands of dots. On load the dots swarm in from random positions. The cursor carves a hole through the letters. A click explodes the dots outward; springs pull them back.
- **Interactions:** move, click/tap.
- **Params:** `text` Your word: 1–12 chars ("peak"). `density` How many dots: 1000–6000 (3800; Advanced `densitySmall` 1700 under 700px). `dotSize` Dot size: 0.5–1.5× (1.0; radius = grid gap × (0.32 + random × 0.22) × this). `stiffness` Snap-back strength (slowest dots): 0.005–0.1 (0.02; each dot adds random × 0.035, Advanced `stiffnessSpread`). `bounce` Bounciness: 0.70–0.97 (0.86; this is the per-frame damping multiplier). `cursorRadius` Cursor reach: 40–300px (150; the reach is 16% of the width, at least 70px, at most this). `cursorForce` Cursor push: 0–20 (9). `explosion` Click blast: 0–80 (40). `intro` Swarm in on load: on/off (on).
- **Still:** dots resting on their targets.
- **Mobile:** tap explodes; drag does nothing (keeps scroll working).
- **Tags:** Portfolio, Headlines. Difficulty: Medium. Time: ~20 min.

### 2. `elastic`: Stretchy headline
- **Use case:** a bold headline for an event poster or club page. **World:** Spice Dunes. **Technique:** variable font axes, Gaussian falloff, smoothing (lerp).
- **What happens:** Each letter of a big word swells wider and bolder as the cursor approaches, with a misprinted two-color shadow. When idle, a wave rolls through the letters.
- **Interactions:** move; on touch, drag sideways.
- **Params:** `text` Your word: 1–14 chars ("elastic"). `widthMin` Narrowest width: 50–100 (50). `widthMax` Widest width: 100–150 (150). `weightMin` Thinnest weight: 100–500 (200). `weightMax` Boldest weight: 500–900 (900). `reach` How many letters react: 0.5–3 (1.25). `waveSpeed` Idle wave speed: 0–5 (2.1). `misprint` Misprint offset: 0–0.1em (0.045). `smoothing` Smoothness: 2–20 (9).
- **Still:** one frozen moment of the idle wave.
- **Tags:** Events, Headlines. Difficulty: Easy. Time: ~15 min.

### 3. `velocity`: Scroll-reactive marquee
- **Use case:** an announcement banner or brand page. **World:** Doomsday. **Technique:** infinite marquee, scroll velocity, skew.
- **What happens:** Three rows of repeating text drift in alternating directions. Scrolling speeds them up, reverses them when you scroll back up, and tilts them with velocity.
- **Interactions:** scroll.
- **Params:** `line1` Row 1: ≤ 24 chars ("smooth"). `line2` Row 2 (outlined): ≤ 24 chars ("buttery"). `line3` Row 3: ≤ 32 chars ("sixty frames a second"). `baseSpeed` Drift speed: 0–5 (1). `boost` Scroll boost: 0–2 (0.8). `leanStrength` Lean amount: 0–1.5 (0.5). `maxLean` Max lean: 0–30° (18).
- **Note for scene pages:** a scene page doesn't scroll much, so the stage provides its own scroll area (an inner scroller three viewports tall) and velocity is read from that.
- **Still:** rows static, no skew.
- **Tags:** Landing pages, Events. Difficulty: Easy. Time: ~15 min.

### 4. `scramble`: Decoding text (new)
- **Use case:** portfolio titles, a "hacker" reveal. **World:** Neon Arcade. **Technique:** staggered character scramble, timing.
- **What happens:** Lines of text cycle through random characters, then resolve letter by letter into the real words. Hovering a line scrambles it again.
- **Params:** `line1`–`line3` Text: ≤ 40 chars each ("Hi, I'm [YOUR NAME]", "I make things move", "one letter at a time"). `duration` Decode time: 0.3–3s (1.2). `stagger` Delay between letters: 0–100ms (40). `charset` Scramble characters: letters / symbols / binary / blocks (symbols). `trigger` Plays when: on load / on hover / on loop (on hover, plus once on load).
- **Accessibility:** the real text is always in the DOM for screen readers (`aria-label` on the line, scrambling spans `aria-hidden`).
- **Still:** final text, no scramble.
- **Tags:** Portfolio, Headlines. Difficulty: Easy. Time: ~10 min.

### 5. `marbles`: Text to marbles
- **Use case:** a playful portfolio intro or a "smash it" landing headline. **World:** Cherry Cola. **Technique:** text to points, circle physics with a spatial hash, gravity, restitution, rolling friction, springs.
- **What happens:** A headline built from glass marbles, each with a small highlight and a soft shadow. A click shatters it: the marbles drop, bounce, roll, collide and pile up at the bottom. Click again and every marble flies back into its letter on a spring. While they're piled up, the cursor shoves the pile around.
- **Interactions:** click/tap to shatter or rebuild; move to shove the pile.
- **Params:** `text` Your headline: 1–12 chars ("marbles"). `count` Most marbles: 200–1500 (900; 400 under 700px). `marbleSize` Marble size: 4–16px (8; 6 under 700px). `gravity` Gravity: 0.1–1.5 (0.5). `bounce` Bounciness: 0–0.9 (0.45). `friction` Rolling friction: 0.9–0.999 (0.985; closer to 1 rolls longer). `returnSpeed` Fly-back strength: 0.02–0.2 (0.08). `shove` Cursor push: 0–20 (8). `autoRebuild` Rebuild by itself after: 0 (off)–20s (10).
- **Still:** the headline assembled, with a few marbles resting below it as a hint.
- **Mobile:** tap shatters and rebuilds; shoving the pile needs a press-and-hold.
- **Tags:** Headlines, Just for fun. Difficulty: Spicy. Time: ~30 min.

### 6. `skid`: Skidding headline
- **Use case:** a bold event or portfolio headline with attitude. **World:** Newsprint. **Technique:** per-letter boxes, damped springs with overshoot, rotation, squash and stretch, fading skid-mark trails, scroll direction.
- **What happens:** Letters drive in one by one from off-screen like cars, overshoot their spots, and skid to a stop with a tilt and a squash, leaving smoky skid marks that fade. Parked, they idle with a small engine shake. Scrolling down makes them peel out the other way in a puff of smoke; scrolling back up brings them back in.
- **Interactions:** scroll; click/tap replays the entrance.
- **Params:** `text` Your headline: 1–12 chars ("skid"). `speed` Entry speed: 10–80 px per frame (40). `stagger` Delay between letters: 0–300ms (90). `overshoot` Overshoot: 0–1 (0.35). `tilt` Skid tilt: 0–25° (12). `squash` Squash: 0–0.4 (0.18). `marks` Skid marks last: 0.5–6s (2.5). `smoke` Smoke: 0–1 (0.5). `shake` Idle engine shake: 0–3px (0.8).
- **Note for scene pages:** like `velocity`, the stage provides its own inner scroll area so scrolling works on a short page.
- **Still:** letters parked in a row with faint skid marks behind them.
- **Mobile:** scrolling and tapping work as on desktop.
- **Tags:** Headlines, Events. Difficulty: Spicy. Time: ~30 min.

### 7. `melt`: Melting text
- **Use case:** a summer event poster or a surreal portfolio headline. **World:** Golden Hour. **Technique:** the word sliced into thin vertical strips, per-strip sag with noise, drips with gravity, lerp back.
- **What happens:** A big word slowly sags and drips like hot wax: thin strips of each letter stretch downward at different rates, and drips form and fall. Moving the cursor over a letter cools it: it snaps back up and hardens, then slowly starts melting again.
- **Interactions:** move (hover cools); on touch, drag sideways.
- **Params:** `text` Your word: 1–14 chars ("melt"). `meltSpeed` Melt speed: 0.1–3 (1). `dripLength` Longest drip: 0–60% of letter height (30). `drips` Drips: 0–30 (12). `stripWidth` Strip width: 1–6px (2). `coolRadius` Cooling reach: 40–300px (140). `recover` Hardening speed: 0.02–0.3 (0.1).
- **Still:** letters half melted, with a few drips hanging.
- **Mobile:** drag sideways to cool letters; vertical swipes still scroll.
- **Tags:** Headlines, Events. Difficulty: Medium. Time: ~20 min.

### 8. `tumble`: Falling letters
- **Use case:** a playful "about me" headline or a 404 page. **World:** Toxic. **Technique:** rigid boxes with rotation, collisions and stacking, grab and throw with release velocity.
- **What happens:** The letters of a headline drop from the top one by one and stack on the floor as tilted blocks. Grab any letter to drag and throw it; it tumbles and knocks the others over. A double-click (double-tap) drops them all again in order.
- **Interactions:** drag and throw; double-click/double-tap to restack.
- **Params:** `text` Your headline: 1–16 chars ("tumble"). `letterSize` Letter size: 8–30% of screen height (20). `gravity` Gravity: 0.1–1.5 (0.6). `bounce` Bounciness: 0–0.6 (0.2). `grip` Surface grip: 0–1 (0.5). `throwPower` Throw strength: 0.2–2 (1). `dropDelay` Delay between letters: 0–400ms (120).
- **Still:** the letters stacked in a leaning pile that still reads as the word.
- **Mobile:** press and hold a letter to grab it.
- **Tags:** Just for fun, Headlines. Difficulty: Medium. Time: ~25 min.

### 9. `fridge`: Fridge magnets
- **Use case:** a playful contact page or a "say hi" section. **World:** Glacier. **Technique:** per-letter boxes, attraction with falloff, springs, snapping to slots.
- **What happens:** Chunky magnet letters lie scattered at angles. When the cursor comes near, letters slide toward it like magnets. Bring them near the middle line and they click into place one by one to spell the word. Shake the cursor fast and they scatter again.
- **Interactions:** move to pull; a fast shake scatters.
- **Params:** `text` Word to spell: 1–12 chars ("hello"). `extraLetters` Extra random letters: 0–20 (6). `pull` Magnet pull: 0–1 (0.4). `reach` Magnet reach: 40–300px (160). `snap` Snap distance: 10–80px (36). `shakeToScatter` Shake to scatter: on/off (on).
- **Still:** the word spelled out, with a couple of stray letters nearby.
- **Mobile:** press and hold, then drag to pull letters; double-tap scatters.
- **Tags:** Portfolio, Just for fun. Difficulty: Easy. Time: ~20 min.

### 10. `typewriter`: Typewriter
- **Use case:** a writer's portfolio, a story intro, a manifesto. **World:** Newsprint. **Technique:** timed reveal with random rhythm, per-letter ink variation, splatter particles, an eased "slam" with a short shake.
- **What happens:** Lines type out key by key. Each strike leaves a slightly uneven, inky letter and a tiny ink splatter. At the end of a line the carriage slams back with a jolt and the next line starts. A cursor blinks at the end; clicking types everything again.
- **Interactions:** click/tap replays.
- **Params:** `line1`–`line3` Lines: ≤ 48 chars each ("Dear reader,", "this page types itself", "one key at a time."). `speed` Typing speed: 2–30 keys per second (12). `jitter` Rhythm wobble: 0–1 (0.4). `ink` Ink unevenness: 0–1 (0.5). `splatter` Ink splatter: 0–1 (0.3). `slam` Return slam: 0–1 (0.6). `loop` Start over when done: on/off (off).
- **Accessibility:** the full text is always in the DOM for screen readers; the typing layer is `aria-hidden`.
- **Still:** all lines typed, cursor shown without blinking.
- **Mobile:** same as desktop.
- **Tags:** Portfolio, Headlines. Difficulty: Easy. Time: ~15 min.

### 11. `splitflap`: Split-flap board
- **Use case:** an event schedule, a departures-board headline, a launch announcement. **World:** Blueprint. **Technique:** CSS 3D flip per tile, staggered timing, cycling through a character set.
- **What happens:** A board of flap tiles. Each tile flips through the characters (the top half falls, the bottom half lands) until it reaches its letter, so the message clatters into place. Every few seconds the board flips to the next message.
- **Interactions:** click/tap skips to the next message.
- **Params:** `messages` Messages: up to 4, ≤ 20 chars each ("NOW BOARDING", "GATE 50", "ON TIME"). `flipSpeed` Flip time: 40–300ms per flap (90). `stagger` Delay between tiles: 0–120ms (30). `hold` Time on each message: 1–15s (5). `charset` Characters: letters / letters and numbers (letters and numbers).
- **Accessibility:** the board has an `aria-label` with the current message; no live announcements (it would be chatty).
- **Still:** the first message, flaps at rest.
- **Mobile:** same as desktop; fewer columns under 700px if the message doesn't fit.
- **Tags:** Events, Headlines. Difficulty: Medium. Time: ~20 min.

### 12. `kinetic`: Kinetic poster
- **Use case:** an event poster or a manifesto page. **World:** Newsprint. **Technique:** a beat-based sequencer, easing curves, scale and rotate transforms on a strict grid.
- **What happens:** Bold words sit on a strict grid and change on a steady beat: one scales up, one turns 90°, two swap places, a block of color slides in, like a moving Swiss poster. The sequence lasts a few bars, then loops. A click switches to the next grid.
- **Interactions:** click/tap changes the grid.
- **Params:** `words` Words: up to 4, ≤ 12 chars each ("MOVE", "SHAPE", "TYPE", "TIME"). `tempo` Tempo: 40–160 beats per minute (96). `feel` Motion feel: soft / snappy / mechanical (snappy). `grid` Grid: 2×2 / 3×3 / stacked (2×2). `colorBlocks` Color blocks: on/off (on). `rotate` Allow turns: on/off (on).
- **Still:** one beat of the sequence, fully laid out.
- **Mobile:** stacked grid under 700px.
- **Tags:** Events, Headlines. Difficulty: Medium. Time: ~20 min.

### 13. `shatter`: Shattering words
- **Use case:** a dramatic reveal or a "break the ice" intro. **World:** Glacier. **Technique:** fracturing letter shapes into polygons, rigid shards with spin and gravity, springs back home.
- **What happens:** A line of words sits calmly. Click a word and it cracks along jagged lines into glass shards that fly out, spin and fall, catching small glints of light. After a moment the shards fly back and fuse, with a short shimmer along the cracks.
- **Interactions:** click/tap a word.
- **Params:** `text` Your words: 1–24 chars ("break the ice"). `shards` Shards per word: 6–60 (24). `force` Blast strength: 0–30 (12). `gravity` Gravity: 0–1.5 (0.4). `reform` Re-form after: 0.5–6s (2). `glint` Glints: 0–1 (0.6).
- **Accessibility:** the text stays in the DOM; the shards are drawn on an `aria-hidden` canvas.
- **Still:** the words whole, one of them with hairline cracks.
- **Mobile:** tap a word.
- **Tags:** Headlines, Portfolio. Difficulty: Medium. Time: ~25 min.

### 14. `flag`: Flag text
- **Use case:** a festival banner, a team or club page. **World:** Matcha. **Technique:** text drawn to an offscreen canvas, a warped mesh driven by layered sine waves, shading from the slope, a gust from the cursor.
- **What happens:** A headline printed on a fabric banner ripples in a steady breeze, with light and shade following the folds. Moving the cursor blows a gust that sends a stronger wave through the cloth.
- **Interactions:** move; on touch, drag sideways.
- **Params:** `text` Banner text: 1–16 chars ("flag"). `wind` Wind: 0–2 (0.8). `waveSize` Wave size: 0.2–3 (1). `waveSpeed` Wave speed: 0.2–4 (1.5). `shading` Fold shading: 0–1 (0.5). `gust` Gust strength: 0–3 (1.2). `pole` Show a pole: on/off (on).
- **Still:** the banner frozen mid-ripple.
- **Mobile:** drag sideways for a gust.
- **Tags:** Events, Headlines. Difficulty: Medium. Time: ~20 min.

### 15. `extrude`: 3D letters
- **Use case:** a chunky portfolio title or a product name. **World:** Blueprint. **Technique:** stacked copies of the text offset in depth, perspective rotation toward the cursor, springs.
- **What happens:** A chunky 3D word, built from stacked layers, turns to face the cursor and shows its sides; the front face is one ink and the depth shades through the others. Let go and it springs back with a little sway, then floats gently.
- **Interactions:** move; on touch, drag sideways.
- **Params:** `text` Your word: 1–12 chars ("extrude"). `depth` Depth: 4–60 layers (24). `maxTurn` Max turn: 0–45° (25). `spring` Springiness: 0.05–0.4 (0.12). `sideShade` Side shading: 0–1 (0.6). `float` Idle float: 0–1 (0.3).
- **Still:** the word at a slight angle.
- **Mobile:** drag sideways to turn it.
- **Tags:** Headlines, Portfolio. Difficulty: Medium. Time: ~20 min.

### 16. `echo`: Echo trail
- **Use case:** a dreamy hero headline. **World:** Vapor Mall. **Technique:** a ring buffer of past positions, afterimages drawn with blend modes and fading opacity.
- **What happens:** A word drifts along a gentle looping path (or follows the cursor when it's close) and leaves a trail of colored copies that fade out behind it, overlapping in the three accent colors.
- **Interactions:** move.
- **Params:** `text` Your word: 1–12 chars ("echo"). `copies` Echoes: 2–30 (12). `spacing` Echo spacing: 1–10 frames (3). `fade` Fade: 0.5–0.98 per echo (0.85). `follow` Follow the cursor: on/off (on). `pathSpeed` Idle drift speed: 0–2 (0.6).
- **Still:** the word with its echoes frozen behind it.
- **Mobile:** drag sideways to pull the word; otherwise it drifts.
- **Tags:** Headlines, Just for fun. Difficulty: Easy. Time: ~15 min.

### 17. `sand`: Sand text
- **Use case:** a beach event page or a calm portfolio intro. **World:** Spice Dunes. **Technique:** text to points, particles pushed by a wind force in the swipe direction, drag, springs home.
- **What happens:** A word made of thousands of sand grains. A swipe blows grains off in the direction of the swipe in a drifting cloud. After a pause they drift back and settle into the letters.
- **Interactions:** swipe or fast cursor movement.
- **Params:** `text` Your word: 1–12 chars ("sand"). `grains` Grains: 1000–8000 (4000; 1800 under 700px). `wind` Swipe wind: 0–3 (1.2). `drift` Drift randomness: 0–1 (0.4). `returnDelay` Drift back after: 0.5–8s (2). `returnSpeed` Drift-back speed: 0.01–0.1 (0.03).
- **Still:** the word intact, with a small drift of grains to one side.
- **Mobile:** sideways swipes blow the sand; vertical swipes still scroll.
- **Tags:** Headlines, Portfolio. Difficulty: Medium. Time: ~20 min.

### 18. `neon`: Neon sign ⚠
- **Use case:** a café, bar or late-night event page. **World:** Neon Arcade. **Technique:** stroked letter paths, glow layers with additive blending, flicker timing.
- **What happens:** A neon-tube sign. The tubes buzz on letter by letter with a short, gentle flicker, then glow steadily with a soft halo. Now and then one letter dims briefly and comes back. Hovering a letter makes it glow brighter.
- **Interactions:** move (hover brightens).
- **Params:** `text` Sign text: 1–14 chars ("open late"). `tube` Tube thickness: 2–12px (5). `glow` Glow size: 0–1 (0.6). `turnOn` Turn-on time per letter: 0.1–1s (0.35). `flicker` Flicker: 0–1 (0.3). `style` Letter style: upright / italic (italic).
- **Safety:** flicker changes at most 3 times per second and only dims single letters; the whole sign never flashes. Under reduced motion there is no flicker.
- **Still:** the sign fully lit.
- **Mobile:** tap a letter to brighten it.
- **Tags:** Headlines, Events. Difficulty: Spicy. Time: ~25 min.

### 19. `rubber`: Rubber letters
- **Use case:** a playful headline that begs to be touched. **World:** Lava Lamp. **Technique:** each letter as a soft body (verlet points and constraints), drag, damped wobble.
- **What happens:** Big, soft letters. Grab one and pull: it stretches like rubber toward your pull. Let go and it snaps back and wobbles until it settles.
- **Interactions:** drag.
- **Params:** `text` Your word: 1–10 chars ("rubber"). `stretch` Stretchiness: 0.2–2 (1). `snap` Snap-back strength: 0.05–0.5 (0.2). `wobble` Wobble (damping per frame): 0.8–0.98 (0.9; higher wobbles longer). `maxStretch` Max stretch: 1–4× letter size (2.5).
- **Still:** one letter caught mid-wobble.
- **Mobile:** press and hold a letter to grab it.
- **Tags:** Just for fun, Headlines. Difficulty: Medium. Time: ~25 min.

### 20. `fire`: Burning headline ⚠
- **Use case:** a bold launch or "hot new thing" headline. **World:** Doomsday. **Technique:** a low-resolution heat buffer seeded from the letter edges, cooling upward with noise, colored from the world's accents; the cursor adds heat and wind.
- **What happens:** Flames lick up from the top edges of a headline, flickering and curling. Moving the cursor near the word fans the flames toward it and makes them taller.
- **Interactions:** move; on touch, drag sideways.
- **Params:** `text` Your headline: 1–12 chars ("hot"). `height` Flame height: 0.2–2 (1). `cooling` Cooling: 0.5–3 (1.2; higher means shorter flames). `turbulence` Turbulence: 0–2 (0.8). `fan` Fan strength: 0–3 (1.2). `detail` Detail: low / medium / high (medium; low on phones).
- **Safety:** flicker is smooth and local to the flames; no large brightness jumps.
- **Still:** flames frozen mid-flicker.
- **Mobile:** drag sideways to fan the flames.
- **Tags:** Headlines, Events. Difficulty: Spicy. Time: ~30 min.

---

## Particles and physics (21–34)

### 21. `ripple`: Ripple background
- **Use case:** an interactive background for a landing page. **World:** Abyss. **Technique:** dot grid, wave propagation, decay.
- **What happens:** A calm dot grid. Clicks drop expanding rings that displace and light up dots. The cursor pushes dots away. When idle, automatic ripples appear.
- **Interactions:** move, click/tap.
- **Params:** `spacing` Dot spacing: 12–48px (26; 20 under 700px). `speed` Ring speed: 100–1200px/s (480). `ringWidth` Ring width: 20–160px (60). `push` Ring push: 0–60px (20). `fade` Fade speed: 0.1–2 (0.55). `autoEvery` Auto ripple every: 0 (off)–10s (2.6). `cursorRadius` Cursor reach: 0–300px (120).
- **Still:** two frozen rings at the center.
- **Tags:** Backgrounds, Landing pages. Difficulty: Medium. Time: ~20 min.

### 22. `flow`: Living wallpaper
- **Use case:** a calm animated background, or just something to play with. **World:** Glacier. **Technique:** flow field, trails, vortex.
- **What happens:** Thousands of particles ride a shifting invisible current, leaving fading trails. Press and hold to stir a whirlpool.
- **Interactions:** press and hold.
- **Params:** `count` Particles: 300–4000 (2200, also capped by area ÷ 620). `speed` Current speed: 0.3–5 (1.7). `zoom` Swirl size: 0.0005–0.008 (0.0026; smaller = bigger swirls). `trail` Trail length: 0.01–0.3 fade per frame (0.075; UI shows this inverted, longer = smaller number). `stir` Stir strength: 0–20 (7). `lineWidth` Line thickness: 0.5–4px (1.4).
- **Still:** ~70 simulated steps so trails are visible.
- **Tags:** Backgrounds, Just for fun. Difficulty: Medium. Time: ~20 min.

### 23. `warp`: Hyperspace intro
- **Use case:** a launch page or dramatic intro. **World:** Neon Arcade. **Technique:** 3D projection, starfield, easing, magnetic button.
- **What happens:** A drifting starfield. Press and hold to accelerate into light-speed streaks. A magnetic button follows the cursor.
- **Interactions:** press and hold; hover the button.
- **Params:** `stars` Stars: 100–2000 (900; 420 under 700px). `cruise` Cruise speed: 0–0.5 (0.09). `warpSpeed` Warp speed: 0.5–4 (1.7). `streak` Streak length: 0–0.3 (0.09). `magnet` Button pull: 0–0.8 (0.32). `buttonText` Button label: ≤ 24 chars ("Back to the top").
- **Still:** static starfield.
- **Tags:** Landing pages, Events. Difficulty: Medium. Time: ~20 min.

### 24. `confetti`: Celebration burst (new)
- **Use case:** a birthday or congratulations page. **World:** Dreamhouse. **Technique:** particle physics with gravity, drag, rotation, wobble.
- **What happens:** A big message in the middle (set with the stretchy-headline style). Clicks fire confetti from the click point; an automatic burst fires periodically. Pieces tumble, flutter, and fall off the screen.
- **Params:** `message` Message: ≤ 40 chars ("Happy birthday!"). `count` Pieces per burst: 50–600 (220). `gravity` Gravity: 0–2 (0.5). `spread` Spread: 20–360° (120). `drag` Air drag: 0.9–0.995 (0.97). `shapes` Shapes: mixed / squares / ribbons / circles (mixed). `autoEvery` Auto burst every: 0 (off)–10s (4).
- **Still:** a frozen mid-air burst.
- **Tags:** Events, Just for fun. Difficulty: Easy. Time: ~15 min.

### 25. `goo`: Gooey blobs (new)
- **Use case:** a playful background or menu. **World:** Dreamhouse. **Technique:** SVG "goo" filter (`feGaussianBlur` + `feColorMatrix` alpha threshold), springs, orbits.
- **What happens:** Colored blobs orbit slowly and melt into each other when they touch. One blob follows the cursor on a spring and merges with whatever it passes. A click drops a new blob (max 16).
- **Params:** `blobs` Blob count: 3–16 (8). `size` Blob size: 30–140px (70). `goo` Gooeyness: 5–30 (18, the blur amount). `orbit` Orbit speed: 0–2 (0.5). `follow` Follow springiness: 0.02–0.3 (0.12).
- **Still:** blobs frozen mid-orbit, a few merged.
- **Performance:** cap the filter region to the stage; animate with `transform` only.
- **Tags:** Backgrounds, Just for fun. Difficulty: Easy. Time: ~15 min.

### 26. `drop`: Ink-ball pile
- **Use case:** a playful footer or a "drop us a line" contact section. **World:** Cherry Cola. **Technique:** circle physics with gravity, impulse collisions with position correction, 3 substeps per frame, the cursor as a pusher. Source: `reference/riso-demo.html`.
- **What happens:** Balls in the three inks fall in and pile up at the bottom, their colors overprinting where they overlap. Tap to drop another ball where you tap. Move through the pile to shove it around and watch it settle.
- **Interactions:** click/tap to drop a ball; move to shove.
- **Params:** `start` Starting balls: 0–60 (screen width ÷ 40, kept between 14 and 38). `maxBalls` Most balls: 20–150 (90; the oldest disappears first). `sizeMin` Smallest ball: 1–6% of short side (3, kept between 12 and 26px). `sizeMax` Largest ball: 3–12% of short side (7.5, kept between 26 and 70px). `gravity` Gravity: 0.1–1.2 (0.42). `floorBounce` Floor bounce: 0–0.8 (0.3). `ballBounce` Ball bounce: 0–0.8 (0.25). `shove` Cursor size: 4–20% of short side (9, kept between 44 and 90px).
- **Fixed physics from the demo:** sizes are skewed toward small balls (size = min + (max − min) × random^1.7); the floor sits at 94% of the stage height; wall bounce 0.5; floor friction 0.97 per frame.
- **Still:** the settled pile.
- **Mobile:** tap drops a ball; shoving needs a press-and-hold.
- **Tags:** Just for fun, Backgrounds. Difficulty: Medium. Time: ~20 min.

### 27. `pluck`: Strings
- **Use case:** an interactive header for a musician, or a playful section divider. **World:** Aurora. **Technique:** damped springs, a triangle-shaped string bend, crossing detection, glow from blend modes. Source: `reference/riso-demo.html`.
- **What happens:** Vertical strings span the screen. Sweeping across them grabs each string in turn; it bends with the cursor until pulled too far, then lets go and rings with a damped vibration. Resting strings are soft gray; ringing ones light up in the accents, and in dark worlds they glow (a soft colored halo around a near-white core). When idle, an invisible hand strums them now and then.
- **Interactions:** move across the strings; on touch, drag sideways.
- **Params:** `spacing` String spacing: 16–80px (screen width ÷ 34, kept between 22 and 44). `pull` Bend before release: 1–3× spacing (1.9, kept between 42 and 84px). `tension` Lowest string tension: 0.01–0.1 (0.03). `tensionSpread` Extra tension across the row: 0–0.15 (0.08). `ring` Ring time (damping per frame): 0.95–0.998 (0.987; closer to 1 rings longer). `ghostStrum` Strum by itself when idle: on/off (on; after 3s, a 2.1s sweep). `glow` Glowing strings in dark worlds: on/off (on).
- **Still:** a few strings bent mid-vibration.
- **Mobile:** sideways drags strum; vertical swipes still scroll.
- **Sound hook:** a soft pluck per string (§9.8).
- **Tags:** Landing pages, Just for fun. Difficulty: Easy. Time: ~15 min.

### 28. `cloth`: Tearable cloth
- **Use case:** a show-off background or an interactive "pull back the curtain" reveal. **World:** Blueprint. **Technique:** verlet points with distance constraints, gravity, pinned points, tearing when a link stretches too far, grabbing.
- **What happens:** A sheet hangs from a rail and sways gently in a breeze. Drag it to swing and stretch it; pull hard enough and it tears. A double-click (double-tap) hangs a fresh sheet.
- **Interactions:** drag; double-click/double-tap resets.
- **Params:** `detail` Cloth detail: 10–60 points across (32; 20 under 700px). `stiffness` Stiffness: 1–8 passes per frame (3). `gravity` Gravity: 0–1.5 (0.5). `tear` Tear resistance: 1.5–6× rest length (3; higher is harder to tear). `wind` Breeze: 0–1 (0.2). `pins` Pinned along the top: every point / every 4th / corners only (every 4th).
- **Still:** the sheet hanging in a gentle curve.
- **Mobile:** press and hold to grab.
- **Tags:** Just for fun, Backgrounds. Difficulty: Spicy. Time: ~30 min.

### 29. `fireworks`: Fireworks ⚠
- **Use case:** a New Year's, party or launch page. **World:** Golden Hour. **Technique:** particles with gravity and drag, trails, staggered bursts.
- **What happens:** Tap to launch a rocket that climbs, slows and bursts into sparks with fading trails; the sparks fall and fade out. An automatic launch every few seconds keeps it lively.
- **Interactions:** click/tap to launch.
- **Params:** `sparks` Sparks per burst: 40–400 (160; 80 under 700px). `gravity` Gravity: 0–0.3 (0.06). `drag` Air drag: 0.9–0.995 (0.975). `trail` Trail length: 0–20 (8). `shape` Burst shape: sphere / ring / willow / mixed (mixed). `autoEvery` Auto launch every: 0 (off)–10s (3).
- **Safety:** bursts brighten only around themselves; at most 3 bursts start per second, however fast you tap; nothing lights up the whole screen.
- **Still:** three frozen bursts at different heights.
- **Mobile:** tap to launch.
- **Tags:** Events, Just for fun. Difficulty: Medium. Time: ~20 min.

### 30. `blackhole`: Black hole
- **Use case:** a dramatic space-themed hero or background. **World:** Doomsday. **Technique:** a line grid bent by an inverse-distance pull, orbiting particles that spiral in, streaks, glow.
- **What happens:** A grid of lines bends into a funnel around a black hole. Particles drift in, orbit faster as they get close, stretch into streaks and vanish at the edge. Press and hold to drag the hole around; a click releases a burst of new particles.
- **Interactions:** press and hold to move; click/tap for a burst.
- **Params:** `mass` Pull strength: 0.2–3 (1). `horizon` Event horizon size: 10–120px (40). `particles` Particles: 200–3000 (1200; 500 under 700px). `grid` Grid spacing: 20–80px (40). `spin` Spin: 0–2 (0.8). `follow` Follow the cursor without pressing: on/off (off).
- **Still:** the warped grid with a ring of particles.
- **Mobile:** tap for a burst; press and hold to move the hole.
- **Tags:** Backgrounds, Just for fun. Difficulty: Spicy. Time: ~30 min.

### 31. `flock`: Flock
- **Use case:** a calm, alive background for a landing page. **World:** Aurora. **Technique:** boids (separation, alignment, cohesion) with a spatial hash, cursor avoidance.
- **What happens:** Hundreds of small arrow-shaped birds swirl in flocks, keeping their distance, lining up with their neighbors and sticking together. The cursor is a predator: they scatter away from it and regroup behind it.
- **Interactions:** move.
- **Params:** `count` Birds: 50–1500 (500; 220 under 700px). `speed` Speed: 1–6 (3). `separation` Personal space: 0–3 (1.5). `alignment` Follow neighbors: 0–3 (1). `cohesion` Stay together: 0–3 (1). `fear` Cursor fear: 0–5 (2). `look` Look: birds / fish / dots (birds).
- **Still:** the flock frozen mid-swirl.
- **Mobile:** drag sideways to chase them.
- **Tags:** Backgrounds, Just for fun. Difficulty: Medium. Time: ~25 min.

### 32. `lightning`: Lightning ⚠
- **Use case:** an electric hero for a tech or music event. **World:** Toxic. **Technique:** jagged bolts by midpoint displacement, branching, glow from blend modes, a node network.
- **What happens:** Small glowing nodes are scattered across the screen. Electric arcs jump from the cursor to the nearest nodes, crackling and branching; a node that gets hit glows and passes a weaker arc to its neighbor.
- **Interactions:** move.
- **Params:** `nodes` Nodes: 5–60 (24). `reach` Arc reach: 60–400px (200). `branching` Branching: 0–1 (0.4). `crackle` Crackle: 0–1 (0.6). `chain` Chain to neighbors: 0–3 hops (1). `strikes` Strikes per second: 1–3 (2; the safety rule caps it at 3).
- **Safety:** at most 3 strikes per second; arcs are thin lines; the background never flashes.
- **Still:** a single frozen arc between two nodes.
- **Mobile:** press and hold to draw arcs.
- **Tags:** Backgrounds, Events. Difficulty: Spicy. Time: ~30 min.

### 33. `smoke`: Smoke
- **Use case:** a moody, atmospheric background. **World:** Aurora. **Technique:** a simple low-resolution fluid (advection, diffusion, pressure on a coarse grid), dye, smooth upscaling.
- **What happens:** Soft colored smoke pours from the cursor and swirls, curls and fades behind it. Faster movement makes bigger swirls. When idle, a slow plume rises from the bottom.
- **Interactions:** move.
- **Params:** `detail` Detail: 64–256 cells across (128; 64 on phones). `thickness` Thickness (viscosity): 0–1 (0.1). `fade` Fade: 0.9–0.999 per frame (0.985). `swirl` Swirl: 0–50 (20). `force` Push strength: 0–5 (2). `colorCycle` Cycle through the accents: on/off (on).
- **Performance:** the fluid runs on the coarse grid only; it must stay inside the 8ms frame budget at defaults.
- **Still:** a frozen plume.
- **Mobile:** drag sideways to stir; the idle plume keeps it alive.
- **Tags:** Backgrounds, Just for fun. Difficulty: Spicy. Time: ~35 min.

### 34. `filings`: Iron filings
- **Use case:** a science-y or "drawn to you" background. **World:** Toxic. **Technique:** a magnetic field from one or more dipoles, thousands of short lines turning to follow it.
- **What happens:** Thousands of tiny iron filings lie scattered. A magnet follows the cursor and the filings turn to trace its field lines, clustering near the poles. A click leaves a magnet behind.
- **Interactions:** move; click/tap to place a magnet.
- **Params:** `count` Filings: 500–6000 (3000; 1200 under 700px). `length` Filing length: 3–20px (8). `strength` Magnet strength: 0.2–3 (1). `turnSpeed` Turn speed: 0.02–0.5 (0.15). `magnet` Magnet type: bar / single pole (bar). `maxMagnets` Most magnets: 1–4 (3; the oldest is removed).
- **Still:** filings aligned around one bar magnet in the middle.
- **Mobile:** tap to place magnets.
- **Tags:** Backgrounds, Just for fun. Difficulty: Medium. Time: ~20 min.

---

## Shapes and optical (35–44)

### 35. `overprint`: Overprint blobs
- **Use case:** a bold, playful hero background. **World:** Riso. **Technique:** three springs with different stiffness, squash and stretch from velocity, wobbly edges from sine harmonics, blend modes. Source: `reference/riso-demo.html`.
- **What happens:** Three big ink blobs chase the cursor, each on a spring of a different speed, arranged in a slowly turning triangle. Where they overlap, the inks mix into new colors (multiplied in light worlds, glowing in dark ones). Fast movement stretches them along their direction of travel. A click makes them jump in a quick staggered pulse. When idle, they wander.
- **Interactions:** move; click/tap to make them jump.
- **Params:** `size` Blob size: 10–35% of short side (21). `fastSpring` Fastest ink's spring: 0.03–0.2 (0.075). `slowSpring` Slowest ink's spring: 0.01–0.1 (0.024). `spread` Spread between inks: 0–1× blob size (0.55). `wobble` Edge wobble: 0–0.15 (0.055). `stretch` Stretch with speed: 0–1 (0.45). `jump` Click jump: 0–0.3 (0.11).
- **Fixed physics from the demo:** the middle ink's spring is 0.042; damping per frame is 0.80, 0.84 and 0.87 (fast to slow); a second wobble harmonic of 0.035; jumps are 70ms apart.
- **Still:** the three blobs overlapping in a trefoil.
- **Mobile:** drag sideways to pull them; tap to make them jump.
- **Tags:** Backgrounds, Landing pages. Difficulty: Easy. Time: ~15 min.

### 36. `halftone`: Halftone paper
- **Use case:** a print-inspired hero for a studio, shop or zine. **World:** Riso. **Technique:** a hexagonal dot grid, smoothstep falloff, displacement, misregistration offsets that grow with speed, expanding ripples. Source: `reference/riso-demo.html`.
- **What happens:** A sheet of small gray halftone dots. Around the cursor the dots swell, push outward and split into the three inks, slightly out of register like a riso print; moving fast exaggerates the misprint. Clicks send rings rolling through the dots. When idle, the swell wanders by itself.
- **Interactions:** move; click/tap for a ripple.
- **Params:** `spacing` Dot spacing: 12–40px (short side ÷ 30, kept between 18 and 30). `reach` Swell size: 10–60% of short side (34). `swell` Dot growth: 0–1× spacing (0.4). `push` Push outward: 0–1× spacing (0.55). `misprint` Most misprint: 0–1× spacing (0.6). `rippleSpeed` Ripple speed: 2–30px per frame (11). `rippleFade` Ripple fade: 0.9–0.99 per frame (0.968).
- **Still:** the swell resting toward the upper right.
- **Mobile:** tap for ripples; the swell wanders on its own.
- **Tags:** Backgrounds, Landing pages. Difficulty: Easy. Time: ~15 min.

### 37. `tilt`: Holographic card (new)
- **Use case:** a profile card, ID badge, or product card. **World:** Abyss. **Technique:** CSS 3D perspective, pointer-driven rotation, springs, glare, holographic foil.
- **What happens:** A card with a name and title tilts toward the cursor in 3D. A glare highlight and a rainbow foil sheen slide across it as it tilts. On phones it can follow the device's tilt after the visitor taps "Use motion" (iOS requires a permission request triggered by a tap).
- **Params:** `name` Name: ≤ 28 chars ("[YOUR NAME]"). `role` Title: ≤ 36 chars ("Creative coder"). `maxTilt` Max tilt: 0–30° (14). `glare` Glare: 0–1 (0.5). `foil` Foil shine: 0–1 (0.6). `spring` Springiness: 0.05–0.4 (0.15). `gyro` Follow phone tilt: on/off (off).
- **Still:** card at a slight fixed angle.
- **Tags:** Portfolio. Difficulty: Medium. Time: ~20 min.

### 38. `kaleido`: Kaleidoscope
- **Use case:** a "make your own pattern" toy or a mesmerizing background. **World:** Vapor Mall. **Technique:** drawing into one wedge, mirrored and rotated around a center, slow rotation, fading strokes.
- **What happens:** Draw with the cursor and your strokes are mirrored into a symmetrical kaleidoscope that slowly turns. Old strokes fade so it never fills up. When idle, it draws by itself.
- **Interactions:** move to draw.
- **Params:** `segments` Mirror segments: 3–16 (8). `turnSpeed` Turn speed: 0–1 (0.15). `brush` Brush size: 1–20px (4). `fade` Fade: 0–0.1 per frame (0.01). `autoDraw` Draw by itself when idle: on/off (on). `alternate` Mirror every other segment: on/off (on).
- **Still:** a finished pattern.
- **Mobile:** press and hold, then draw.
- **Tags:** Just for fun, Backgrounds. Difficulty: Easy. Time: ~15 min.

### 39. `morph`: Shape morph
- **Use case:** a friendly hero or a logo-like animation. **World:** Matcha. **Technique:** resampling shapes to the same number of points, point-by-point interpolation with easing and overshoot.
- **What happens:** A shape smoothly melts into the next (circle, then star, then heart, then blob, and around again) with a jelly overshoot each time. The three inks follow slightly out of step. A click skips to the next shape.
- **Interactions:** click/tap skips ahead.
- **Params:** `shapes` Shapes: any of circle, square, triangle, star, heart, blob, flower (circle, star, heart, blob). `duration` Morph time: 0.3–3s (1.2). `hold` Hold time: 0–5s (1). `feel` Easing: smooth / bouncy / snappy (bouncy). `layers` Ink layers: 1–3 (3). `size` Shape size: 20–80% of short side (50).
- **Still:** one shape halfway into the next.
- **Mobile:** tap skips ahead.
- **Tags:** Backgrounds, Just for fun. Difficulty: Easy. Time: ~15 min.

### 40. `moire`: Moiré ⚠
- **Use case:** an op-art background or a hypnotic section break. **World:** Riso. **Technique:** two or three line, ring or dot patterns overlaid with blend modes, small offsets and rotations.
- **What happens:** Two patterns of fine lines or rings lie on top of each other. Moving the cursor slides and turns one layer, and large shimmering interference waves sweep across.
- **Interactions:** move.
- **Params:** `pattern` Pattern: lines / rings / dots (rings). `spacing` Line spacing: 3–20px (8). `thickness` Line thickness: 0.5–6px (2). `turn` Turn with the cursor: 0–20° (6). `drift` Idle drift: 0–1 (0.3). `layers` Layers: 2–3 (2).
- **Safety:** moiré can be intense: drift speed is capped so bright and dark bands sweep past any spot at most 3 times per second.
- **Still:** a static interference pattern.
- **Mobile:** drag sideways to shift the pattern.
- **Tags:** Backgrounds. Difficulty: Easy. Time: ~10 min.

### 41. `tunnel`: Infinite tunnel ⚠
- **Use case:** a dramatic intro or a music page. **World:** Neon Arcade. **Technique:** rings projected in 3D with perspective, a twisting path from smooth noise, speed control.
- **What happens:** You fly through an endless tunnel of glowing rings and stripes that twists and turns. The cursor steers; pressing and holding speeds up.
- **Interactions:** move to steer; press and hold to boost.
- **Params:** `speed` Flight speed: 0.2–4 (1). `twist` Twist: 0–2 (0.8). `rings` Rings: 20–120 (60). `ringShape` Ring shape: circle / square / hexagon (circle). `stripes` Stripes per ring: 0–24 (12). `boost` Hold to boost: 1–4× (2.5).
- **Safety:** ring spacing grows with speed so light and dark never alternate across the screen more than 3 times per second.
- **Still:** the tunnel at rest.
- **Mobile:** press and hold to boost; it steers itself.
- **Tags:** Landing pages, Just for fun. Difficulty: Spicy. Time: ~30 min.

### 42. `lava`: Lava lamp
- **Use case:** a cozy, retro background. **World:** Lava Lamp. **Technique:** metaballs (summed radial fields with a threshold) rendered at low resolution; heating at the bottom, cooling at the top.
- **What happens:** Soft blobs of wax rise from the bottom, cool and sink, stretching, merging and splitting like a lava lamp. A click warms the lamp and sends more blobs up.
- **Interactions:** click/tap to warm it.
- **Params:** `blobs` Blobs: 3–24 (10). `size` Blob size: 20–120px (60). `speed` Flow speed: 0.1–2 (0.5). `merge` Merge softness: 0.5–2 (1). `detail` Detail: low / medium / high (medium; low on phones). `glowEdge` Glowing edge: on/off (on).
- **Still:** blobs frozen mid-rise, two of them merging.
- **Mobile:** tap to warm.
- **Tags:** Backgrounds, Just for fun. Difficulty: Medium. Time: ~20 min.

### 43. `fold`: Paper fold
- **Use case:** a storytelling landing page or an invitation. **World:** Golden Hour. **Technique:** CSS 3D transforms on panels with crease shading, scroll-linked progress, easing.
- **What happens:** A sheet with a headline is split into panels that fold and unfold like origami as you scroll: panels hinge, creases shade, and at the end the sheet folds up small.
- **Interactions:** scroll.
- **Params:** `text` Text on the paper: 1–24 chars ("unfold me"). `panels` Panels: 2–8 (4). `direction` Fold: horizontal / vertical / accordion (accordion). `angle` Fold angle: 30–180° (150). `shading` Crease shading: 0–1 (0.5).
- **Note for scene pages:** like `velocity`, the stage provides its own inner scroll area.
- **Still:** the sheet half folded.
- **Mobile:** scroll as normal.
- **Tags:** Landing pages, Events. Difficulty: Medium. Time: ~20 min.

### 44. `glitch`: Glitch ⚠
- **Use case:** a tech, music or portfolio headline with an edge. **World:** Vapor Mall. **Technique:** color-channel offsets with blend modes, horizontal slice displacement, timed bursts.
- **What happens:** A headline looks calm until you hover it: it tears into horizontal slices that jump sideways while its three ink channels split apart, then snaps clean after a short burst. Now and then a tiny glitch happens by itself.
- **Interactions:** move (hover triggers a burst).
- **Params:** `text` Your headline: 1–16 chars ("glitch"). `intensity` Intensity: 0–1 (0.5). `slices` Slices: 2–20 (8). `split` Color split: 0–20px (6). `burst` Burst length: 0.1–1s (0.3). `autoEvery` Random glitch every: 0 (off)–10s (4).
- **Safety:** at most 3 bursts per second; only the headline glitches, never the whole screen; no color inversion.
- **Still:** the clean headline with a slight color split.
- **Mobile:** tap the headline for a burst.
- **Tags:** Headlines, Portfolio. Difficulty: Spicy. Time: ~20 min.

---

## Interface and micro-interactions (45–50)

### 45. `magnetic`: Magnetic buttons (new)
- **Use case:** navigation or call-to-action buttons that feel alive. **World:** Matcha. **Technique:** pointer attraction, springs, squash on press.
- **What happens:** A row of buttons. Each one is pulled toward the cursor when it's near, its label moving a bit more than its body (parallax), and squishes slightly when pressed.
- **Params:** `labels` Button labels: up to 4, ≤ 16 chars each ("Start", "Explore", "Contact"). `pull` Pull strength: 0–0.8 (0.35). `radius` Pull reach: 40–300px (120). `spring` Springiness: 0.05–0.4 (0.18). `squish` Press squish: 0–0.3 (0.1).
- **Still:** buttons at rest.
- **Tags:** Portfolio, Landing pages. Difficulty: Easy. Time: ~10 min.

### 46. `countdown`: Event countdown (new)
- **Use case:** a countdown page for a party, launch, or exam. **World:** Spice Dunes. **Technique:** flip digits with CSS 3D, timing, state change.
- **What happens:** Days, hours, minutes, seconds flip like an airport board. At zero, it celebrates (reuses the confetti burst) and shows "It's time."
- **Params:** `event` Event name: ≤ 32 chars ("Launch party"). `target` Date and time: datetime (default: 7 days from page load, local time). `style` Digit style: flip / slide / roll (flip). `celebrate` Celebrate at zero: on/off (on).
- **Accessibility:** a visually hidden live region announces the remaining time once a minute, not every second.
- **Still:** digits static, updating without animation.
- **Tags:** Events. Difficulty: Medium. Time: ~20 min.

### 47. `trail`: Cursor trail
- **Use case:** a portfolio that feels alive under your hand. **World:** Abyss. **Technique:** a follow-the-leader chain of points with lerp, a smooth curve through them, width taper.
- **What happens:** A glowing ribbon follows the cursor, curling smoothly behind it and tapering at the tail. When the cursor stops, the tail catches up and coils. When idle, it swims around by itself. The normal cursor stays visible (PRD §18).
- **Interactions:** move.
- **Params:** `look` Look: ribbon / snake / dots (ribbon). `length` Length: 5–120 points (40). `follow` Follow tightness: 0.05–0.6 (0.3). `width` Width: 2–40px (14). `taper` Taper: 0–1 (0.8). `color` Color: one accent / blend through all three (blend through all three).
- **Still:** the ribbon curled in an S.
- **Mobile:** drag sideways to lead it; otherwise it swims.
- **Tags:** Portfolio, Just for fun. Difficulty: Easy. Time: ~10 min.

### 48. `curtain`: Page transitions
- **Use case:** moving between pages of a portfolio or small site. **World:** Cherry Cola. **Technique:** clip-path wipes and irises, transformed curtain panels, easing, staggering.
- **What happens:** A tiny three-page site plays inside the stage. Clicking a link plays a transition before the next page appears: theater curtains close and open, a diagonal wipe, an iris circle, or slats.
- **Interactions:** click/tap the links.
- **Params:** `style` Transition: curtain / wipe / iris / slats / random (curtain). `duration` Duration: 0.3–2s (0.9). `feel` Easing: smooth / snappy / bouncy (smooth). `stagger` Slat stagger: 0–150ms (60). `pages` Page names: 3, ≤ 16 chars each ("Home", "Work", "Contact").
- **Accessibility:** focus moves to the new page's heading; under reduced motion every transition becomes a short fade.
- **Still:** the first page, no transition.
- **Mobile:** same as desktop.
- **Tags:** Portfolio, Landing pages. Difficulty: Medium. Time: ~20 min.

### 49. `jelly`: Jelly cards
- **Use case:** cards for projects, links or products that feel squishy and fun. **World:** Lava Lamp. **Technique:** springs on scale, skew and position, drag with lag, damped wobble.
- **What happens:** A few cards sit on the stage. Tap one and it jiggles. Drag it and it lags and leans like jelly, then wobbles to rest where you drop it.
- **Interactions:** click/tap to jiggle; drag to move.
- **Params:** `labels` Card labels: up to 6, ≤ 16 chars each ("Drag me", "Tap me", "Me too"). `wobble` Wobble: 0–1 (0.6). `stiffness` Springiness: 0.05–0.4 (0.15). `settle` Settle speed (damping per frame): 0.8–0.98 (0.88). `squish` Squish on tap: 0–0.4 (0.15).
- **Accessibility:** cards are real buttons; Enter or Space jiggles them.
- **Still:** cards at rest, slightly fanned.
- **Mobile:** tap jiggles; press and hold to drag.
- **Tags:** Portfolio, Just for fun. Difficulty: Easy. Time: ~15 min.

### 50. `loaders`: Loading pack
- **Use case:** loading screens and spinners that don't look like everyone else's. **World:** Glacier. **Technique:** six small loops: staggered scale, squash-and-stretch bounce, stroke drawing with dash offset, stacking bars, a morphing square, an orbiting pair.
- **What happens:** A grid of six original loading animations: a dot chase, a bouncing trio, a self-drawing ring, stacking bars, a morphing square and an orbiting pair. Clicking one shows it large in the middle.
- **Interactions:** click/tap a loader to feature it.
- **Params:** `featured` Show large: dots / bounce / ring / bars / morph / orbit (ring). `speed` Speed: 0.25–3× (1). `size` Size: 16–120px (48). `thickness` Line thickness: 1–10px (4). `colors` Colors: one accent / all three (all three).
- **Prompt note:** the prompt asks for CSS-only loaders where possible, so they're easy to drop into any site.
- **Still:** every loader at a mid frame.
- **Mobile:** two columns of three.
- **Tags:** Landing pages, Portfolio. Difficulty: Easy. Time: ~10 min.

---

## Industry heroes (51–53, gallery only; owner added 2026-10-17)
Three of the candidates in `docs/INDUSTRY_HEROES.md`. They appear in the gallery only, never on the home page. "BRAND" is whatever name the visitor types.

### 51. `fogged`: Fogged bottle
- **Use case:** a perfume, skincare or drinks brand reveal. **World:** Aurora. **Technique:** a low-resolution fog mask, a blurred copy of the scene behind it, a soft wipe brush, regrowth from the edges, simple drips.
- **What happens:** The screen is a pane of fogged glass: the colorful scene behind it (with the name on it) is blurred and washed white. The cursor wipes the fog away in a soft-edged trail, revealing sharp color and the name. Small beads form where you wipe and run down, leaving thin clear lines. Over a few seconds the fog creeps back in from the edges of every wiped area.
- **Interactions:** move to wipe (a finger drag on phones, sideways).
- **Params:** `text` Name: 1–16 chars ("Your brand"). `fog` Fog thickness: 0–1 (0.8). `wipe` Wipe width: 2–20% of the width (6). `returnTime` Fog return: 2–20s (6). `drip` Drip chance: 0–1 (0.3). `blur` Blur behind the fog: 2–40px (16). Advanced: `creep` Edge creep, `dripSpeed` Drip speed.
- **Still:** one wiped band across the middle with the name readable and two drips running down.
- **Mobile:** drag sideways to wipe.
- **Tags:** Reveals, Brands. Difficulty: Medium. Time: ~30 min.

### 52. `tailor`: Tailor's cut
- **Use case:** a fashion or tailoring brand intro. **World:** Newsprint. **Technique:** a Verlet cloth hanging from a pinned top row, a chalk line, shears that remove the links between the two halves, a lift and a fall, loose threads.
- **What happens:** A heavy drape of cloth hangs in soft folds. A dashed chalk line draws itself across it, shears snip along it in short bites with the cloth bunching at each cut, then the top half lifts away and the bottom half drops to reveal the name behind. A few loose threads drift down. The cursor is a breeze on the cloth before the cut. Restart plays it again.
- **Interactions:** move (breeze); Restart to replay.
- **Params:** `text` Name: 1–16 chars ("Your brand"). `weight` Fabric weight: 0–1 (0.5). `fold` Fold depth: 0–1 (0.6). `pattern` Fabric pattern: plain / pinstripe / check (plain). `cutPath` Cut path: straight / wavy / diagonal (straight). `cutSpeed` Cut speed: 0.6–3s (1.4). `threads` Loose threads: 0–30 (12). `breeze` Cursor breeze: 0–1 (0.5). Advanced: chalk time, snips, cut height.
- **Still:** the halves mid-fall with the name between them.
- **Mobile:** drag a finger across the cloth for the breeze.
- **Tags:** Brands, Intros. Difficulty: Spicy (hard). Time: ~40 min.

### 53. `latte`: Latte pour
- **Use case:** a café brand intro. **World:** Spice Dunes. **Technique:** a foam-amount grid, a falling stream that blooms in rings and then zigzags through the letters, diffusion to settle.
- **What happens:** Looking straight down into a cup of dark coffee with a speckled, tiger-striped crema, a thin stream of milk pours in from the top edge. Where it lands white foam blooms in soft rings, then the stream drags through the surface filling the letters of the name in loose strokes. The stream lifts away and the foam settles, its edges softening. The cup turns a few degrees toward the cursor (on phones, with the tilt after a tap). Restart pours again.
- **Interactions:** move (the cup turns); Restart to pour again.
- **Params:** `text` Name: 1–16 chars ("Your brand"). `cupSize` Cup size: 40–95% of the height (70). `foam` Foam thickness: 0–1 (0.6). `crema` Crema darkness: 0–1 (0.5). `pourTime` Pour speed: 1.5–8s (3). `spread` Foam spread: 0.4–2 (1). `wobble` Pour wobble: 0–1 (0.3). `turn` Cup turn: 0–15° (6). `gyro` Follow phone tilt (off).
- **Still:** the finished latte art with two faint curls of steam above.
- **Mobile:** tilt the phone after tapping "Use motion".
- **Tags:** Brands, Intros. Difficulty: Spicy (hard). Time: ~40 min.

---

## Realistic and animated additions (54–69; owner added 2026-10-20)
Sixteen more scenes. **Not a build wave:** only the two pilots (`velvet` 55 and `soap` 56) are built now. The other fourteen go in a **Drops backlog** (`docs/PLAN.md`), released one per week after launch through `/new-scene`. They are gallery only (never the home page; the Tour stays the first 50). "NAME" is the brand name the visitor types (param `text`, 1–16 chars, default "Your brand"). Worlds are proposals; the owner can change them. Names were checked against the no-brand-names rule (the owner renamed Slinky Stairs to Coil Stairs and Claymation to Clay Frames because the old names are trademarks).

**Realistic scenes (51–53 and 54–61) are held to the Realism standard (PRD §8.8):** WebGL shading with a Canvas 2D or still-frame fallback, three quality tiers (full, balanced, phone), a side-by-side against the owner's reference photo or video (kept in the git-ignored `reference/realism/<slug>/`, never committed), and a prompt that spells out the shading recipe (the Quick prompt is exempt from the 150-word limit and keeps the full recipe). **Prompt tests: only for the two pilots, and only after the owner approves their look.** Every scene has a quality tier param `quality` Quality: full / balanced / phone (auto) among its Advanced settings. Existing REALISTIC scenes: `fogged` (51), `tailor` (52), `latte` (53), re-checked against §8.8 (`docs/DECISIONS.md`).

### REALISTIC

### 54. `slatted`: Slatted Sun
- **Use case:** a hero for a design studio, architecture, interiors or hospitality brand. **World:** Golden Hour. **Technique:** a shader that traces the sun through a row of slats with cut-outs onto a wall, with a penumbra that widens with distance, a warm-to-cool light gradient and dust motes drawn only inside the beams.
- **What happens:** A warm plaster wall with slatted blinds. Scrolling tilts the slats open; stripes of sunlight pass through cut-outs in the slats and, at one exact angle, snap into NAME projected sharp on the wall, then stretch and blur as the slats keep turning. The cursor moves the sun.
- **Interactions:** scroll (or drag sideways on phones) tilts the slats; move the cursor to move the sun.
- **Real details:** shadow edges soft far from the slats and sharp close to them; a warm-to-cool gradient across the light; dust motes visible only inside the beams; plaster micro-texture on the wall; slight wood grain and a soft edge highlight on each slat.
- **Params:** `text` Name. `slatAngle` Slat angle: 0–90° (45). `warmth` Light warmth: 2500–6500K (3800). `softness` Edge softness: 0–1 (0.5). `dust` Dust amount: 0–1 (0.4). `slatCount` Slats: 5–20 (12). `sunHeight` Sun height: 10–80° (35). `snapAngle` Angle where NAME snaps sharp: 0–90° (40). `plaster` Wall texture: 0–1 (0.5). Advanced: slat thickness, cut-out size, light intensity, ambient light, dust size and drift speed, beam falloff, quality.
- **Still:** the slats at the snap angle with NAME sharp on the wall and a few motes in the beams.
- **Mobile:** drag sideways to tilt; the phone tier drops dust to a few motes and uses a half-resolution shadow pass.
- **Tags:** Realistic, Brands, Landing pages. Difficulty: Spicy. Time: ~60 min.

### 55. `velvet`: Velvet Brush (pilot)
- **Use case:** a fashion, luxury or furniture brand intro. **World:** Cherry Cola. **Technique:** a per-pixel fiber-direction field, an anisotropic sheen shader against a light direction, a fiber noise layer, and a slow relax of the field back to rest.
- **What happens:** The whole screen is crushed velvet. Moving the cursor brushes the pile, leaving lighter and darker trails where the fibers flip. NAME is already pre-brushed the other way, so it shows up only as a change in sheen. Strokes slowly relax back to rest.
- **Interactions:** move or drag to brush; on phones a finger drag brushes (after the usual press and hold, or immediately in Just play).
- **Real details:** sheen that changes with fiber direction relative to the light; fiber-level noise; a slight dent (a small darkening and normal shift) along fast strokes; soft pile-edge shading where fibers lie over each other.
- **Params:** `text` Name. `pileLength` Pile length: 0–1 (0.5). `sheen` Sheen: 0–1 (0.6). `brushWidth` Brush width: 2–20% of the width (7). `relax` Relax time: 2–30s (10). `lightAngle` Light angle: 0–360° (45). `lightHeight` Light height: 10–80° (40). `dent` Dent along fast strokes: 0–1 (0.4). Advanced: fiber noise scale, fiber noise strength, sheen sharpness, ambient light, base color depth, brush softness, brush pressure from speed, quality.
- **Still:** a broad brushed swoop with NAME visible as a sheen shift.
- **Mobile:** drag to brush; the phone tier halves the field resolution and drops the dent pass.
- **Tags:** Realistic, Brands, Portfolio. Difficulty: Spicy. Time: ~60 min.

### 56. `soap`: Soap Film (pilot)
- **Use case:** a wellness, beauty or cleaning brand reveal. **World:** Abyss. **Technique:** a film-thickness field (height map) feeding a thin-film interference shader (reflected color computed from thickness and viewing angle), drainage so the top thins first, a swirl flow, and a pop into droplets.
- **What happens:** A soap film is stretched across a thin dark wire bent into NAME. Its colors come from real thin-film interference, calculated from the film's thickness. The film drains, so the top thins to black first. The cursor is a breath: the film bulges and swirls, and if you blow too hard it pops into droplets, then a fresh film slides across.
- **Interactions:** move to breathe on the film (a finger drag on phones); press to blow harder.
- **Real details:** interference colors that really cycle with thickness (magenta, gold, cyan bands) and fade to black as it thins; slow marbling swirls; a bright specular reflection of a window-like light; a thick drip edge at the wire; droplets that wobble and fall.
- **Params:** `text` Name. `thickness` Film thickness: 200–1200nm (600). `drainage` Drainage speed: 0.1–3× (1). `swirl` Swirl: 0–1 (0.5). `popSensitivity` Pop sensitivity: 0–1 (0.5). `wireWidth` Wire width: 1–8px (3). `refractive` Film refractive index: 1.2–1.5 (1.33). `reflection` Window reflection: 0–1 (0.6). `breath` Breath strength: 0–2 (1). Advanced: viscosity, film regrowth time, droplet count and size, light angle, color saturation, noise scale, quality.
- **Still:** a film with the full color gradient, the top thinning to black, NAME clear along the wire.
- **Mobile:** drag to breathe; the phone tier halves film resolution and caps droplets.
- **Tags:** Realistic, Brands, Backgrounds. Difficulty: Spicy. Time: ~60 min.

### 57. `inkbloom`: Ink Bloom
- **Use case:** a calligraphy, tea, stationery or ceramics brand. **World:** Newsprint. **Technique:** a paper fiber field (anisotropic diffusion), a wetness map that ink diffuses along, pigment that settles into the grain and dries to darker edges (a coffee-ring effect).
- **What happens:** A brush touches wet rice paper and NAME blooms, feathering out along the paper fibers. The edges dry darker, like a coffee ring, and pigment settles into the grain. The cursor re-wets the paper, so the ink moves again.
- **Interactions:** move to re-wet the paper; click to touch down a fresh drop; Restart to write NAME again.
- **Real details:** feathering that follows visible fibers; darker dried edges; granulation where pigment settles; slight paper translucency (a soft texture showing through); a faint water ring.
- **Params:** `text` Name. `wetness` Wetness: 0–1 (0.6). `inkLoad` Ink load: 0–1 (0.6). `fiber` Fiber strength: 0–1 (0.6). `dryTime` Dry time: 2–40s (12). `brush` Re-wet width: 2–20% (6). `edgeDark` Edge darkening: 0–1 (0.5). `granulation` Granulation: 0–1 (0.4). `paperTone` Paper warmth: 0–1 (0.5). Advanced: diffusion rate, fiber noise scale, ink color, translucency, drip chance, quality.
- **Still:** NAME fully bloomed and dry, edges dark, a faint ring beside it.
- **Mobile:** drag to re-wet; phone tier halves the diffusion grid.
- **Tags:** Realistic, Brands, Portfolio. Difficulty: Spicy. Time: ~60 min.

### 58. `goldleaf`: Gold Leaf
- **Use case:** a jewelry, spirits, luxury or restaurant brand. **World:** Doomsday. **Technique:** leaf pieces as thin cloth-like quads with flutter physics and a tear model, a crinkled normal map, a metallic shader with the cursor as the light, burnishing that smooths the leaf on the letters.
- **What happens:** Gold leaf drifts down onto a dark board. The cursor is a soft brush: loose leaf flutters, tears and flakes away, and the leaf on the letters burnishes into a crinkled, gleaming NAME. The cursor is also the light.
- **Interactions:** move to brush and to move the light; click to puff a gust.
- **Real details:** crinkle highlights that change as the light moves; ragged torn edges; a slightly reddish base showing through thin spots; tiny flakes that tumble and settle; the board's dark matte grain.
- **Params:** `text` Name. `crinkle` Crinkle: 0–1 (0.6). `flakes` Flake count: 20–600 (250). `drift` Drift: 0–1 (0.4). `shine` Shine: 0–1 (0.7). `leafSize` Leaf size: 10–80px (34). `tear` Tear amount: 0–1 (0.5). `burnish` Burnish speed: 0.1–3× (1). `lightHeight` Light height: 10–80° (35). Advanced: flutter strength, edge roughness, base color, metal tint, grain, gust force, quality.
- **Still:** NAME burnished and gleaming with a few loose flakes mid-air.
- **Mobile:** drag as the brush and light; phone tier caps flakes at a third.
- **Tags:** Realistic, Brands. Difficulty: Spicy. Time: ~70 min.

### 59. `fizz`: Fizz
- **Use case:** a drinks, brewery, soda or energy brand. **World:** Toxic. **Technique:** bubble particles spawned along the letter mask with growth, wobble and drag; a refraction shader per bubble (bright rim, dark edge, small highlight); a liquid backdrop with light shafts; a tap burst.
- **What happens:** A close-up inside a soda, no glass rim. Bubbles form only along the letters, swell, wobble and break away in rising streams; bigger bubbles rise faster. A fast cursor flick taps the glass and releases a burst, then NAME slowly re-forms.
- **Interactions:** a fast flick taps the glass; move gently to nudge bubbles.
- **Real details:** each bubble with a bright rim, a darker inner edge and a tiny window highlight; bubbles that merge; speed that rises with size; slight wobble; a faint liquid color gradient and rising light shafts; tiny micro-bubbles in the haze.
- **Params:** `text` Name. `rate` Bubble rate: 0.2–3× (1). `maxSize` Max size: 4–40px (18). `riseSpeed` Rise speed: 0.2–3× (1). `tapStrength` Tap strength: 0–2 (1). `wobble` Wobble: 0–1 (0.4). `haze` Micro-bubble haze: 0–1 (0.4). `liquidColor` Liquid tint: 0–1 (0.5). `reform` Re-form time: 2–20s (8). Advanced: merge chance, drag, rim brightness, highlight size, shaft strength, quality.
- **Still:** NAME fully formed with bubbles breaking away at the top of the letters.
- **Mobile:** a flick taps the glass; phone tier halves bubble count and skips the haze pass.
- **Tags:** Realistic, Brands. Difficulty: Spicy. Time: ~60 min.

### 60. `snowledge`: Snow Ledge
- **Use case:** an outdoor, winter, travel or cozy-lifestyle brand. **World:** Glacier. **Technique:** a falling-flake particle system settling into a height field built over an invisible letter mask, with overhangs, a subsurface-scatter-style shader (bluish shadows, a soft glow where light passes through), and wind that lifts powder and slides clumps.
- **What happens:** Snow falls onto invisible letters and piles into soft caps on every top edge, with overhangs, bluish shadows and a soft glow where light passes through. The cursor is wind: powder puffs off and clumps slide off. NAME is readable only by where the snow rests.
- **Interactions:** move for wind; click for a gust; Restart to snow again.
- **Real details:** soft rounded caps with a crisp thin top edge; bluish shadow in hollows; sparkle on a few crystals; powder that puffs in the air; clumps that crack and slide; slightly uneven depth.
- **Params:** `text` Name. `snowfall` Snowfall: 0–1 (0.5). `stickiness` Stickiness: 0–1 (0.6). `wind` Wind: 0–2 (1). `flakeSize` Flake size: 1–8px (3). `depth` Pile depth: 0–1 (0.5). `glow` Light glow: 0–1 (0.5). `sparkle` Sparkle: 0–1 (0.3). `lightAngle` Light angle: 0–360° (60). Advanced: slide threshold, overhang limit, powder puff size, shadow blue, ambient light, quality.
- **Still:** snow caps on every letter with a few flakes in the air.
- **Mobile:** drag for wind; phone tier uses fewer flakes and a coarser height field.
- **Tags:** Realistic, Brands. Difficulty: Spicy. Time: ~70 min.

### 61. `raking`: Raking Light
- **Use case:** a stationery, print, editorial, architecture or luxury brand. **World:** Riso. **Technique:** a heightfield for thick cotton paper (tooth and fibers) with NAME pressed in as a blind emboss, lit by a low raking lamp with normal-mapped shading and soft shadow rims.
- **What happens:** Blank, thick cotton paper. The cursor is a low lamp sweeping across it, and NAME, pressed into the paper with no ink, appears only through the shadows and highlights the light creates. Scrolling moves the lamp like the sun across a day.
- **Interactions:** move the cursor to move the lamp; scroll sweeps the lamp across a day.
- **Real details:** paper tooth and fibers; soft highlight rims on the raised edges; a warm lamp falloff; a faint shadow pooled on the far side of each pressed edge; slightly uneven impression depth.
- **Params:** `text` Name. `embossDepth` Emboss depth: 0–1 (0.5). `lampHeight` Lamp height: 5–60° (20). `roughness` Paper roughness: 0–1 (0.5). `warmth` Light warmth: 2500–6500K (3500). `lampSize` Lamp softness: 0–1 (0.5). `fibers` Visible fibers: 0–1 (0.4). `impression` Impression unevenness: 0–1 (0.3). `daySweep` Day sweep by scroll: 0–1 (0.7). Advanced: tooth scale, rim width, falloff exponent, ambient light, paper tone, quality.
- **Still:** the lamp low on one side with NAME readable through shadow and highlight only.
- **Mobile:** drag to move the lamp; phone tier uses a half-resolution height field.
- **Tags:** Realistic, Brands, Portfolio. Difficulty: Spicy. Time: ~60 min.

### ANIMATED

### 62. `pendulum`: Pendulum Field
- **Use case:** a science, music, data or studio intro. **World:** Aurora. **Technique:** a grid of bobs on circular paths with slightly different periods, phased so that at one exact time all bobs pass through target points sampled from NAME; scroll scrubs time.
- **What happens:** Hundreds of bobs swing in circles at slightly different speeds. At one exact moment they all pass through points on the letters and form NAME, then drift apart again. Scroll scrubs time.
- **Interactions:** scroll scrubs time (drag sideways on phones); hover slows time.
- **Params:** `text` Name. `bobs` Bobs: 100–900 (400). `radius` Swing radius: 5–60px (24). `spread` Period spread: 0–1 (0.3). `cycle` Cycle length: 4–30s (12). `bobSize` Bob size: 1–10px (3). `trail` Trail: 0–1 (0.3). `hold` Hold on the name: 0–1 (0.3). Advanced: phase jitter, easing, colors per ring.
- **Still:** the moment NAME forms.
- **Mobile:** 200 bobs; sideways drag scrubs.
- **Tags:** Animated, Intros, Backgrounds. Difficulty: Medium. Time: ~30 min.

### 63. `anamorphic`: Anamorphic
- **Use case:** a creative studio or portfolio hero. **World:** Vapor Mall. **Technique:** flat-colored shards at 3D positions that project to NAME from exactly one camera position; the camera orbits with the cursor or the phone's tilt.
- **What happens:** Flat-colored shards float in 3D. Moving the cursor (or tilting the phone) orbits the view, and at the sweet spot they line up into NAME.
- **Interactions:** move to orbit; on phones tilt after "Use motion", or drag.
- **Params:** `text` Name. `shards` Shards: 40–400 (160). `depth` Depth spread: 0–1 (0.6). `orbit` Orbit range: 5–60° (30). `shardSize` Shard size: 4–40px (14). `snap` Snap tolerance: 0–1 (0.3). `float` Float amount: 0–1 (0.3). `perspective` Perspective: 0.3–2 (1). Advanced: shard shapes, color count, easing.
- **Still:** the sweet-spot view with NAME aligned.
- **Mobile:** 80 shards; drag or tilt.
- **Tags:** Animated, Portfolio. Difficulty: Medium. Time: ~35 min.

### 64. `domino`: Domino Run
- **Use case:** a launch, countdown or storytelling intro. **World:** Matcha. **Technique:** rigid-body dominoes along a path traced from NAME, a simple topple chain with timing, tilt and settling; faces landing up form the name.
- **What happens:** Dominoes in a winding path trace NAME. Scrolling topples them one after another, and the faces landing up print the name. Scrolling back stands them up again.
- **Interactions:** scroll (or drag sideways) topples the chain; click a domino to flick it.
- **Params:** `text` Name. `dominoes` Dominoes: 60–400 (200). `size` Domino size: 6–40px (16). `spacing` Spacing: 1–3× (1.6). `speed` Topple speed: 0.3–3× (1). `tilt` Lean on topple: 0–1 (0.7). `clack` Settle bounce: 0–1 (0.3). `twoTone` Two-tone faces: on / off (on). Advanced: gravity, friction, wobble.
- **Still:** halfway toppled, NAME half printed.
- **Mobile:** 100 dominoes.
- **Tags:** Animated, Intros. Difficulty: Medium. Time: ~40 min.

### 65. `coilstairs`: Coil Stairs
- **Use case:** a playful brand, a kids' product or a scrolling headline. **World:** Dreamhouse. **Technique:** each letter is a spring-coil mesh with a flip-down animation along stair steps, landing and settling with a spring wobble; scroll drives progress.
- **What happens:** Each letter is a coiled spring that flips down a staircase as you scroll and lands on the bottom step.
- **Interactions:** scroll (or drag sideways) drives the flips; click a letter to give it a nudge.
- **Params:** `text` Name. `coils` Coils per letter: 4–24 (12). `coilThickness` Coil thickness: 1–8px (3). `steps` Stairs: 3–10 (6). `stepHeight` Step height: 20–120px (60). `bounce` Landing bounce: 0–1 (0.5). `stagger` Stagger: 0–1 (0.4). `letterSize` Letter size: 30–200px (110). Advanced: spring stiffness, damping, flip arc.
- **Still:** all letters landed on the bottom step, coils relaxed.
- **Mobile:** 8 coils per letter; fewer stairs.
- **Tags:** Animated, Headlines, Intros. Difficulty: Medium. Time: ~40 min.

### 66. `clockwork`: Clockwork
- **Use case:** a watch, engineering, craft or automotive brand. **World:** Blueprint. **Technique:** meshing gears built from NAME's outline pieces, gear-train angular-velocity rules, an escapement tick, and the cursor winding a mainspring.
- **What happens:** NAME is built from meshing gears. Moving the cursor winds them, and an escapement ticks the letters into place one tick at a time.
- **Interactions:** move to wind; click for one tick.
- **Params:** `text` Name. `gears` Gears: 6–30 (14). `teeth` Teeth per gear: 8–40 (20). `wind` Wind speed: 0–2 (1). `tick` Tick rate: 0.5–3 per second (1). `backlash` Looseness: 0–1 (0.2). `gearColor` Gear tint: 0–1 (0.5). `letterBuild` Letter build speed: 0.2–3× (1). Advanced: tooth shape, axle size, escapement swing.
- **Still:** all letters placed, gears at rest.
- **Mobile:** 8 gears; drag to wind.
- **Tags:** Animated, Brands. Difficulty: Spicy. Time: ~60 min.

### 67. `epicycles`: Epicycles
- **Use case:** a math, music, data or technical brand. **World:** Neon Arcade. **Technique:** a Fourier series of NAME's outline drawn as a chain of spinning circles; the cursor sets how many circles are active.
- **What happens:** A chain of spinning circles traces NAME's outline. The cursor adds or removes circles, from blobby to crisp.
- **Interactions:** move up and down to change circle count; click to restart the trace.
- **Params:** `text` Name. `circles` Circles: 3–200 (60). `speed` Spin speed: 0.2–3× (1). `trail` Trail length: 0.2–1 (0.8). `showCircles` Show circles: 0–1 (0.6). `lineWidth` Line width: 1–8px (2). `glow` Glow: 0–1 (0.5). `wobble` Slow drift: 0–1 (0.1). Advanced: outline sampling density, easing, colors per ring.
- **Still:** the finished trace with the circles faint.
- **Mobile:** drag up and down; 80 circles at most.
- **Tags:** Animated, Backgrounds, Intros. Difficulty: Medium. Time: ~30 min.

### 68. `clayframes`: Clay Frames
- **Use case:** a food, kids' or craft brand. **World:** Lava Lamp. **Technique:** a stop-motion look by stepping the scene at a low frame rate with per-frame outline jitter and a finger-print dent texture; the cursor leaves thumbprints that slowly settle.
- **What happens:** Clay letters at a choppy 12 frames per second with jittery outlines. The cursor squishes them with thumbprints.
- **Interactions:** move or press to squish; thumbprints relax over time.
- **Params:** `text` Name. `fps` Frame rate: 6–24 (12). `jitter` Outline jitter: 0–1 (0.5). `thumb` Thumbprint size: 10–80px (36). `relax` Relax time: 2–30s (10). `letterSize` Letter size: 40–220px (120). `clayTexture` Clay texture: 0–1 (0.5). `squish` Squish amount: 0–1 (0.6). Advanced: lighting, edge softness, color variation.
- **Still:** one frame with two thumbprints.
- **Mobile:** drag to squish; same frame rate.
- **Tags:** Animated, Brands, Just for fun. Difficulty: Medium. Time: ~35 min.

### 69. `stringart`: String Art
- **Use case:** a craft, jewelry, design-studio or portfolio hero. **World:** Newsprint. **Technique:** a thread that races from nail to nail, drawing straight lines that build NAME by density as you scroll; the cursor plucks the threads with a spring.
- **What happens:** A thread races from nail to nail and builds NAME from straight lines as you scroll. The cursor plucks the threads.
- **Interactions:** scroll (or drag sideways) draws more thread; move to pluck.
- **Params:** `text` Name. `nails` Nails: 60–360 (180). `threads` Thread count: 200–2400 (1200). `threadWidth` Thread width: 0.5–3px (1). `pluck` Pluck strength: 0–2 (1). `tension` Thread tension: 0.1–1 (0.5). `speed` Draw speed: 0.3–3× (1). `threadColor` Thread tint: 0–1 (0.5). Advanced: nail size, route search depth, damping.
- **Still:** the finished piece with threads at rest.
- **Mobile:** 120 nails and 700 threads.
- **Tags:** Animated, Portfolio, Brands. Difficulty: Medium. Time: ~40 min.

---

## Batch 2 (70–89; owner added 2026-10-20)
Twenty more scenes, **specs only**: nothing is built. They join the **Drops backlog** (`docs/PLAN.md`) after launch, one per week through `/new-scene`, in the order set there (the top five first). Before any of them is built the owner gets its token estimate and says OK. Prompt tests are opt-in per scene, with a token estimate first. "NAME" is the brand name the visitor types (param `text`, 1–16 chars, default "Your brand"); like every scene each also has an Advanced group (every other number that shapes it, with defaults, plus `quality`).

**Rules for all of them.** Same definition of done as every scene (PRD §8.4). Every number is a param or a `FIXED` constant with a reason (§8.5). Each has a phone version and a reduced-motion still frame, supports pause, and cleans up on destroy. REALISTIC scenes (70–79) follow the Realism standard (PRD §8.8): WebGL shaders allowed (no libraries), procedural textures by default, a side-by-side against the owner's reference, cut if still fake after two rounds; their Quick prompt is exempt from the 150-word limit and keeps the full shading recipe. The owner is asked for each reference only when that scene is next to build (it goes in the git-ignored `reference/realism/<slug>/`). ANIMATED scenes (80–89) have a designed, graphic look, but the motion must feel physical: overshoot, wobble, settle, react to neighbors. Flashing: nothing flashes more than 3 times a second whatever the cursor or tilt does (§8.2); `wafershine` and `torchmap` are marked ⚠ and get a flash test. Tilt on phones needs the usual "Use motion" opt-in (iOS asks permission from a tap) and always has a drag or scroll alternative. Difficulty: the owner's "hard" is Spicy here.

**Names and ids.** The owner's suggested ids had hyphens; ids in this repo are lowercase letters only, so `wafer-shine` is `wafershine`, `raked-garden` is `rakedgarden`, and so on. Two titles were renamed because they are film, game or brand names: "Fog of War" is now **Torch Map** (`torchmap`), and "Gathering" is now **Gather Round** (`gatherround`). All twenty titles and ids are checked by `tests/unit/names.test.ts`. Microprint is an original document design and must never imitate real currency (no real banknote layout, portraits, seals, serial-number format or denominations).

**New use-case tags** (recorded now; each is added to the gallery filters only when its first scene ships, so there are no empty filters; at that point older scenes that fit are tagged too): Tech & AI, Travel, Real estate, Wellness, Gaming, Finance, Kids, Nonprofits.

**Worlds** are proposals. **Defaults** were picked to look best inside each slider's range and are listed in parentheses.

### REALISTIC

### 70. `shoreline`: Shoreline
- **Use case:** travel, resorts, coastal real estate. **World:** Spice Dunes. **Trigger:** scroll moves the tide. **Technique:** a water-thickness map advancing and retreating over a sand height field, foam from noise at the leading edge, a wetness texture that dries over time, refraction of the sand under thin water.
- **What happens:** A top-down view of a beach. Thin sheets of seawater slide up the sand with a lacy foam edge and drain back. Each retreat leaves the sand dark and glossy around NAME drawn in it, so the name sharpens with every wave.
- **Real details:** wet sand darker and glossy before drying lighter; foam lace breaking into bubbles; the water's thin leading edge bending the sand beneath it.
- **Interactions:** scroll moves the tide in and out (drag sideways on phones); with no scroll a slow tide continues on its own.
- **Params:** `text` Name. `reach` Wave reach: 10–80% of the screen (45). `foam` Foam lace: 0–1 (0.6). `dryTime` Dry time: 2–30s (12). `grain` Sand grain: 0–1 (0.5). Advanced: tide period, foam bubble size, wet-sand darkness, water clarity, sun angle, quality.
- **Reference to ask for (when it is next):** a top-down video of waves on wet sand.
- **Still:** the name sharp in wet sand with a thin foam line at the edge. **Mobile:** same on scroll; balanced tier, fewer foam bubbles.
- **Tags:** Realistic, Travel, Real estate. Difficulty: Spicy. Time: ~90 min.

### 71. `duskfacade`: Dusk Facade
- **Use case:** real estate, hotels, city guides. **World:** Vapor Mall. **Trigger:** scroll moves dusk into night. **Technique:** a straight-on building grid with per-window interior shaders (lamp, curtains, plant, passing shadow), a sky gradient with reflections on unlit glass, a soft glow spill onto the wall.
- **What happens:** A straight-on view of an apartment building at dusk. As you scroll, the sky deepens and windows switch on one by one, each with its own warm interior. The lit windows spell NAME, and by full night it reads clearly.
- **Real details:** every window different; sky reflections on unlit glass; a faint glow spilling onto the wall around lit windows.
- **Interactions:** scroll (or drag sideways) moves time from dusk to night; on phones tilt shifts the reflections after "Use motion".
- **Params:** `text` Name. `floors` Floors: 6–30 (14). `warmth` Light warmth: 2200–4000K (2900). `variety` Window variety: 0–1 (0.7). `switchOn` Switch-on speed: 0.2–3s (1.2). Advanced: windows per floor, glass reflectivity, glow spill, sky colors, shadow chance, quality.
- **Reference to ask for (when it is next):** a straight-on photo of an apartment building at dusk.
- **Still:** full night with NAME lit. **Mobile:** fewer floors, simpler interiors.
- **Tags:** Realistic, Real estate, Travel. Difficulty: Medium. Time: ~75 min.

### 72. `microprint`: Microprint
- **Use case:** banks, fintech, insurance, security. **World:** Matcha. **Trigger:** cursor-driven. **Technique:** a procedural engraved-pattern field (guilloche-style wavy lines) drawn as tiny repeated NAME text along each line, a magnifying loupe pass with lens distortion and a slight color fringe, paper fibers under the ink.
- **What happens:** Engraved, certificate-style paper with fine wavy security patterns. The cursor is a jeweler's loupe: under magnification every line turns out to be tiny repeated text of NAME, and a central engraved emblem resolves into the name in micro-lettering.
- **Real details:** lens distortion at the loupe edge with a slight color fringe; ink sitting on paper fibers with tiny breaks; the soft shadow of the loupe rim.
- **Rule:** an original document design only. It must never imitate real currency (no real banknote layout, portrait, seal, serial format or denomination); the emblem is an abstract original rosette.
- **Interactions:** move the cursor (drag or tilt on phones) to move the loupe.
- **Params:** `text` Name. `loupe` Loupe size: 60–300px (160). `zoom` Magnification: 2–12× (6). `sharpness` Ink sharpness: 0–1 (0.7). `paper` Paper texture: 0–1 (0.5). Advanced: line spacing, wave amplitude, color fringe, rim shadow, ink color, quality.
- **Reference to ask for (when it is next):** close-up photos of fine engraved paper under a magnifier (not real currency).
- **Still:** the loupe resting over the emblem. **Mobile:** drag or tilt to move the loupe; balanced tier.
- **Tags:** Realistic, Finance, Tech & AI. Difficulty: Medium. Time: ~75 min.

### 73. `rakedgarden`: Raked Garden
- **Use case:** spas, wellness and meditation apps, hotels. **World:** Newsprint. **Trigger:** cursor-driven. **Technique:** a height map lit by a low sun, a rake stamp that carves parallel grooves, groove paths bent around invisible letters by a distance field, grain spill noise at groove edges.
- **What happens:** Fine pale gravel from above. The cursor drags a wooden rake that carves parallel grooves. The grooves bend smoothly around invisible letters, so NAME appears as smooth, untouched islands with raked lines flowing around them like water around stones.
- **Real details:** each groove shadowed on one side and highlighted on the other by a low sun; grains spilling and settling at groove edges; slightly uneven tooth spacing.
- **Interactions:** move the cursor to rake (drag on phones).
- **Params:** `text` Name. `teeth` Rake teeth: 3–12 (7). `depth` Groove depth: 0–1 (0.6). `grain` Grain size: 0–1 (0.4). `sunAngle` Sun angle: 10–60° (28). Advanced: tooth spacing variation, spill amount, sun direction, bend smoothness, quality.
- **Reference to ask for (when it is next):** photos of raked gravel or sand in low sunlight.
- **Still:** a fully raked garden with NAME as smooth islands. **Mobile:** drag to rake; coarser height map.
- **Tags:** Realistic, Wellness, Travel. Difficulty: Medium. Time: ~70 min.

### 74. `ceilingstars`: Ceiling Stars
- **Use case:** kids' brands, bedtime and sleep apps, toy stores. **World:** Abyss. **Trigger:** cursor-driven. **Technique:** a per-sticker charge value raised by a soft flashlight beam and decaying like real phosphorescence (fast then lingering), a bumpy plaster normal map, sticker shapes with peeling edges.
- **What happens:** A dark bedroom ceiling. The cursor is a warm flashlight beam. Glow-in-the-dark star stickers it passes keep glowing after the beam moves on. The stickers spell NAME, so sweeping the beam charges the name, which slowly fades if left alone.
- **Real details:** a soft beam with a bright core and gradual falloff; glow that fades like real glow-in-the-dark plastic; bumpy plaster and slightly peeling sticker edges.
- **Interactions:** move the cursor (drag or tilt on phones) to move the flashlight.
- **Params:** `text` Name. `beam` Beam size: 60–400px (200). `charge` Charge speed: 0–1 (0.5). `fadeTime` Fade time: 3–60s (20). `glowColor` Glow color, green to blue: 0–1 (0.2). Advanced: star size, star count, plaster roughness, beam warmth, afterglow tail, quality.
- **Reference to ask for (when it is next):** a video of glow stickers fading in the dark.
- **Still:** NAME fully charged and glowing. **Mobile:** drag or tilt; fewer, larger stars.
- **Tags:** Realistic, Kids, Wellness. Difficulty: Medium. Time: ~70 min.

### 75. `wafershine`: Wafer Shine ⚠
- **Use case:** AI and chip startups, deep tech, hardware. **World:** Blueprint. **Trigger:** cursor-driven (the cursor sets the viewing angle). **Technique:** a grid of tiny chips; diffraction colors from the real grating equation (sin θ = m λ ÷ d) per wavelength, a mirror reflection of a soft studio light, dust and chipped edges; NAME is patterned into the chips with a different grid spacing.
- **What happens:** A polished silicon wafer covered in a grid of tiny chips. Moving the cursor changes the viewing angle, and rainbow bands sweep across the grid like light on the back of a CD. NAME is patterned into the chips, so at certain angles it shimmers out in rainbow while the rest stays mirror-gray.
- **Real details:** rainbow colors calculated from grid spacing and angle with the diffraction formula; a mirror reflection of a soft studio light; microscopic dust and chipped edges.
- **Flash safety:** brightness change is rate-limited, so fast cursor or tilt movement can never cause more than 3 flashes per second, and no large area ever flashes (PRD §8.2). A flash test like moiré's runs at the most extreme settings and fastest movement.
- **Interactions:** move the cursor to change the angle; on phones tilt after "Use motion" (drag as the alternative).
- **Params:** `text` Name. `spacing` Grid spacing: 600–3000nm (1600). `angleRange` Light angle range: 5–45° (25). `sharpness` Reflection sharpness: 0–1 (0.6). `dust` Dust: 0–1 (0.3). Advanced: chip size, name grid offset, light size, chip edge chipping, rainbow saturation, brightness change limit, quality.
- **Reference to ask for (when it is next):** a video of a CD or DVD back tilted under a lamp.
- **Still:** NAME in rainbow at its best angle. **Mobile:** tilt or drag; balanced tier.
- **Tags:** Realistic, Tech & AI. Difficulty: Medium. Time: ~75 min.

### 76. `thinice`: Thin Ice
- **Use case:** adventure games, outdoor brands, winter travel. **World:** Glacier. **Trigger:** cursor-driven (speed matters). **Technique:** a crack-growth graph along hidden paths that follow NAME, fracture planes drawn as bright lines that catch light at angles, a frost layer that grows back, trapped bubbles at several depths.
- **What happens:** A frozen lake from above: dark, clear ice with trapped bubbles and frost. Moving the cursor fast sends cracks racing out along hidden paths, so NAME appears as white fracture lines. Moving slowly lets frost creep back over the cracks.
- **Real details:** white fracture planes that catch the light at angles; cracks that branch and stop at random; columns of trapped bubbles at different depths.
- **Interactions:** move the cursor fast to crack (swipe fast on phones).
- **Params:** `text` Name. `crackSpeed` Crack speed: 0–1 (0.6). `branching` Branching: 0–1 (0.5). `frost` Frost regrowth: 2–60s (20). `clarity` Ice clarity: 0–1 (0.7). Advanced: bubble count and depth, crack width, fracture brightness, light angle, quality.
- **Reference to ask for (when it is next):** photos of cracked lake ice, or ice from a freezer tray.
- **Still:** NAME fully cracked. **Mobile:** swipe fast; fewer bubbles.
- **Tags:** Realistic, Travel, Gaming. Difficulty: Spicy. Time: ~90 min. Realism risk: medium-high (cut if still fake after two rounds).

### 77. `growthrings`: Growth Rings
- **Use case:** environmental nonprofits, sustainability, furniture, wellness. **World:** Golden Hour. **Trigger:** scroll-driven (time-lapse). **Technique:** ring radii from a growth-year series with varying widths, a distance field from NAME that bends the rings like grain around a knot, light and dark early and late wood per ring, a heartwood core, radial cracks and saw marks.
- **What happens:** A freshly cut cross-section of a tree trunk. Scrolling passes the years: new rings grow outward, each a slightly different width. The rings bend around NAME the way grain bends around a knot, so the name forms inside the grain as the tree grows.
- **Real details:** light and dark wood within each ring; fine radial cracks and saw marks; a darker heartwood core.
- **Interactions:** scroll (or drag sideways) passes the years.
- **Params:** `text` Name. `rings` Rings: 20–300 (120). `variation` Ring variation: 0–1 (0.5). `bend` Grain bend: 0–1 (0.6). `tone` Wood tone: 0–1 (0.5). Advanced: crack count, saw-mark strength, heartwood size, bark edge, light angle, quality.
- **Reference to ask for (when it is next):** a photo of a cut tree stump or wood slice.
- **Still:** the full-grown trunk with NAME in the grain. **Mobile:** same on scroll; coarser texture.
- **Tags:** Realistic, Nonprofits, Wellness. Difficulty: Medium. Time: ~70 min.

### 78. `startrails`: Star Trails
- **Use case:** travel, camping, astronomy, retreats. **World:** Doomsday. **Trigger:** scroll advances the hours. **Technique:** stars on circles around a pole star over a drawn exposure time, star color from blue-white to orange, haze that dims arcs near the horizon, photo grain, a mountain silhouette; a few bright stars placed as NAME keep their formation as the sky rotates.
- **What happens:** A night sky over a dark mountain silhouette, like a long-exposure photo. Every star draws an arc around the pole star. A few bright stars arranged as NAME keep their formation as they wheel, and at one moment the name sits upright above the peaks.
- **Real details:** star colors from blue-white to orange; arcs dimming near the horizon haze; faint sky glow and photo grain.
- **Interactions:** scroll (or drag sideways) advances the hours.
- **Params:** `text` Name. `hours` Hours: 0–8 (4). `stars` Stars: 500–5000 (2500). `haze` Haze: 0–1 (0.4). `grain` Grain: 0–1 (0.4). Advanced: pole position, arc brightness, star color spread, glow color, mountain shape, quality.
- **Reference to ask for (when it is next):** a long-exposure star-trail photo the owner takes or finds under a free license.
- **Still:** NAME upright above the peaks. **Mobile:** same on scroll; fewer stars (a third).
- **Tags:** Realistic, Travel. Difficulty: Medium. Time: ~60 min.

### 79. `pinwall`: Pin Wall
- **Use case:** AI and tech startups, product launches, agencies. **World:** Riso. **Trigger:** cursor-driven. **Technique:** a height field of pins driven by a spring each, a pressed-in NAME as a permanent target height, per-pin shading from height (highlight shift, soft shadows from raised pins onto lower ones).
- **What happens:** A wall of thousands of polished metal pins seen head-on. The cursor presses them from behind, and they slide forward in a soft bulge that follows you. NAME stays permanently pressed out, and the pins around it ripple as the bulge passes.
- **Real details:** each pin head with a tiny metal highlight that shifts with its height; soft shadows from raised pins onto lower ones; a slight lag and wobble as the pins settle.
- **Interactions:** move the cursor to press (drag on phones).
- **Params:** `text` Name. `spacing` Pin spacing: 4–14px (8). `depth` Press depth: 0–1 (0.7). `settle` Settle speed: 0–1 (0.5). `shine` Metal shine: 0–1 (0.7). Advanced: bulge width, spring stiffness, damping, shadow softness, pin head size, quality.
- **Reference to ask for (when it is next):** a video of a pin-impression toy being pressed.
- **Still:** NAME pressed out, everything else flat. **Mobile:** drag to press; larger pins (spacing floor raised).
- **Tags:** Realistic, Tech & AI. Difficulty: Medium. Time: ~70 min.

### ANIMATED

### 80. `signalpaths`: Signal Paths
- **Use case:** AI startups, data tools, developer platforms. **World:** Aurora. **Trigger:** cursor-driven. **Technique:** a graph of nodes with faint edges, pulses with a bright head and soft tail travelling along edges, edge weights that grow with use ("learning") and fade, and weights seeded so the strongest routes converge on NAME.
- **What happens:** A field of glowing nodes with faint connections. Moving the cursor fires signals along the connections; paths that fire often grow thicker and brighter, like learning. After a few seconds of movement, the strongest paths have routed themselves into NAME.
- **Design:** pulses with a bright head and a soft tail; connections that thicken smoothly; a calm dark palette with one accent. Pulses are small and capped, so nothing flashes more than 3 times a second.
- **Interactions:** move the cursor to fire signals (drag on phones; an idle demo plays when untouched).
- **Params:** `text` Name. `nodes` Nodes: 50–600 (250). `speed` Signal speed: 0.5–4 (2). `learning` Learning rate: 0–1 (0.5). `fade` Fade: 0–1 (0.4). Advanced: connection range, pulse tail length, glow, thickness limit, quality.
- **Still:** NAME traced in bright paths. **Mobile:** 120 nodes; drag to fire.
- **Tags:** Animated, Tech & AI. Difficulty: Medium. Time: ~40 min.

### 81. `platformarrival`: Platform Arrival
- **Use case:** travel, rail and booking sites, tourism boards. **World:** Cherry Cola. **Trigger:** scroll slows the train. **Technique:** parallax layers scrolling at different speeds, speed streaks at full speed, an eased stop with a rock back, a platform and station sign sliding in.
- **What happens:** The view from a train window: flat, layered landscapes racing past at different speeds. Scrolling slows the train, a platform slides in, and a station sign glides into place showing NAME as the train stops with a small bounce.
- **Design:** stretched layers and speed lines at full speed; a smooth ease into the stop with a rock back; bold travel-poster colors.
- **Interactions:** scroll (or drag sideways) slows the train to a stop.
- **Params:** `text` Name. `layers` Layers: 3–8 (5). `topSpeed` Top speed: 0–1 (0.7). `bounce` Stop bounce: 0–1 (0.5). `landscape` Landscape: plains / hills / coast (hills). Advanced: streak length, rock-back amount, sign swing, layer colors, quality.
- **Still:** stopped at the platform, sign in view. **Mobile:** fewer layers.
- **Tags:** Animated, Travel. Difficulty: Medium. Time: ~45 min.

### 82. `doorwave`: Door Wave
- **Use case:** real estate, property apps, coworking. **World:** Dreamhouse. **Trigger:** cursor-driven. **Technique:** an isometric block of doors, each a spring that swings open with overshoot when the cursor is near, warm light spilling onto the walkway, some rooms holding a letter so the central open doors spell NAME.
- **What happens:** An isometric apartment block with dozens of front doors. As the cursor passes, doors swing open in a wave around it, revealing lit rooms, some holding a letter. With the doors near the center open, the letters line up to spell NAME across the building.
- **Design:** doors swing with a small overshoot; warm light spills onto the walkways; consistent isometric angles and a limited palette.
- **Interactions:** move the cursor (drag across the building on phones, or scroll to sweep).
- **Params:** `text` Name. `floors` Floors: 3–12 (6). `doorSpeed` Door speed: 0.1–1s (0.4). `radius` Wave radius: 50–400px (200). `overshoot` Overshoot: 0–1 (0.5). Advanced: door width, light warmth, light spill, spring damping, quality.
- **Still:** the center doors open, NAME visible. **Mobile:** fewer floors and doors.
- **Tags:** Animated, Real estate. Difficulty: Medium. Time: ~50 min.

### 83. `resonanceplate`: Resonance Plate
- **Use case:** wellness, sound baths, music and meditation apps. **World:** Glacier. **Trigger:** cursor-driven (horizontal position tunes the pitch). **Technique:** sand grains moving toward the zero lines of a square plate's vibration modes (Chladni figures, computed from the plate equation cos(nπx)cos(mπy) − cos(mπx)cos(nπy)), with a pitch mapped to the mode, a slight magnetic lock to the pitch whose pattern is NAME (a distance field blended into the mode).
- **What happens:** A metal plate covered in fine sand vibrates. Moving the cursor left and right changes the pitch, and the sand dances into the plate's real vibration patterns. At one special pitch, the pattern resolves into NAME.
- **Design:** grains jitter and migrate to the still lines; patterns morph smoothly as the pitch changes; a gentle magnetic lock near the brand's pitch.
- **Interactions:** move the cursor left and right (drag on phones).
- **Params:** `text` Name. `grains` Grains: 2000–30000 (12000). `strength` Vibration strength: 0–1 (0.6). `pitchRange` Pitch range (highest mode number): 4–16 (10). `lock` Lock strength: 0–1 (0.6). Advanced: jitter, grain size, plate edge, name pitch position, morph speed, quality.
- **Still:** the sand settled into NAME. **Mobile:** 5000 grains; drag to tune.
- **Tags:** Animated, Wellness. Difficulty: Spicy. Time: ~75 min.

### 84. `torchmap`: Torch Map ⚠ (renamed from "Fog of War")
- **Use case:** games, game studios, esports, escape rooms. **World:** Toxic. **Trigger:** cursor-driven. **Technique:** a stylized top-down map under a fog grid, a torch radius that clears fog with a soft edge, a memory layer for explored cells, NAME laid out as a path of stone tiles, a small non-flashing celebration at the end.
- **What happens:** A stylized top-down map hidden under dark fog. The cursor carries a torch that clears fog around it, and explored areas stay dimly revealed. NAME is laid out as a path of stone tiles, uncovered piece by piece.
- **Design:** a gently flickering torch radius (never more than 3 flickers per second, and only a small change in size, so nothing flashes); explored areas remembered in muted color; a celebration when the last letter is found that is a slow glow and drifting sparks, with no flashing.
- **Flash safety:** a flash test checks the torch flicker and the celebration at their most extreme settings (PRD §8.2).
- **Interactions:** move the cursor (drag to explore on phones).
- **Params:** `text` Name. `torch` Torch radius: 40–300px (140). `fog` Fog thickness: 0–1 (0.85). `memory` Memory dimness: 0–1 (0.5). `mapSize` Map size: 1–3 screens (2). Advanced: flicker amount (capped), tile size, map colors, sparkle count, quality.
- **Still:** the map fully explored, NAME revealed. **Mobile:** drag to explore; map size capped at 2 screens.
- **Tags:** Animated, Gaming. Difficulty: Medium. Time: ~50 min.

### 85. `doubling`: Doubling
- **Use case:** fintech, savings and investing apps. **World:** Golden Hour. **Trigger:** scroll-driven. **Technique:** coin objects that split in two each step with a spin, sliding into stacks with spring settling, stack heights following the silhouette of NAME, a counter that eases between numbers.
- **What happens:** A single coin on a table. Each scroll step splits every coin in two, and the coins slide into neat stacks. The stacks' heights form a rising chart that ends as the silhouette of NAME.
- **Design:** coins split with a small spin; stacks wobble, then settle; a counter eases between numbers.
- **Interactions:** scroll (or drag sideways) advances the doublings.
- **Params:** `text` Name. `doublings` Doublings: 4–12 (8). `splitSpeed` Split speed: 0.1–1s (0.4). `wobble` Wobble: 0–1 (0.5). `coinSize` Coin size: 6–24px (12). Advanced: stack spacing, spin amount, settle damping, counter style, quality.
- **Still:** the finished stacks forming NAME. **Mobile:** same on scroll; fewer doublings shown.
- **Tags:** Animated, Finance. Difficulty: Medium. Time: ~45 min.

### 86. `peekaboo`: Peekaboo
- **Use case:** kids' brands, toys, children's learning apps. **World:** Matcha. **Trigger:** cursor-driven. **Technique:** chunky NAME letters with original animal characters in layers behind them, eyes that track the cursor with a lag, a duck-and-peek state machine with squash and stretch, each animal with its own timing.
- **What happens:** Big chunky letters spell NAME, with little original animals hiding behind them. Their eyes follow the cursor; when it gets close they duck behind the letters, then peek out the other side once it moves away.
- **Design:** eyes track with a slight lag; a quick squash on ducking; each animal has its own timing. All animals are original designs, not known characters.
- **Interactions:** move the cursor; on phones tap near a letter to make the animals hide, and tilt to look around after "Use motion".
- **Params:** `text` Name. `animals` Animals: 3–15 (8). `shyness` Shyness distance: 40–300px (150). `peekDelay` Peek delay: 0.2–3s (1). `bounce` Bounce: 0–1 (0.5). Advanced: eye lag, squash amount, animal sizes, color variety, quality.
- **Still:** the animals peeking out. **Mobile:** tap or tilt; fewer animals.
- **Tags:** Animated, Kids. Difficulty: Medium. Time: ~50 min.

### 87. `gatherround`: Gather Round (renamed from "Gathering")
- **Use case:** nonprofits, community groups, civic campaigns. **World:** Aurora. **Trigger:** scroll-driven. **Technique:** top-down figures steered to target points sampled from NAME with separation so they step around each other, varied speeds and paths, a counter of how many are standing together.
- **What happens:** A few small figures walk onto an empty plaza seen from above. As you scroll, more arrive from every edge, each finding a spot, until together they form NAME. A counter shows how many are standing together.
- **Design:** varied walking speeds and paths; figures stepping around each other; gentle color variety within one palette.
- **Interactions:** scroll (or drag sideways) brings more people.
- **Params:** `text` Name. `crowd` Crowd size: 100–3000 (800). `walkSpeed` Walking speed: 0.5–2 (1). `variety` Variety: 0–1 (0.6). `tightness` Formation tightness: 0–1 (0.7). Advanced: figure size, separation strength, color count, counter style, quality.
- **Still:** the full crowd forming NAME. **Mobile:** 300 people.
- **Tags:** Animated, Nonprofits. Difficulty: Medium. Time: ~45 min.

### 88. `tokenstream`: Token Stream
- **Use case:** AI startups, developer tools, education. **World:** Neon Arcade. **Trigger:** scroll-driven. **Technique:** a sentence split into colored chunks, chunks flying into a stack, a weighing shuffle, then docking into NAME with a snap and a small overshoot, thin lines linking related chunks.
- **What happens:** A sentence appears, then splits into colored chunks the way an AI model breaks text into tokens. The chunks fly into a stack, shuffle as if being weighed, and reassemble into NAME.
- **Design:** each chunk keeps its color the whole way; a satisfying snap as each one docks; thin lines linking related chunks.
- **Interactions:** scroll (or drag sideways) drives the stages.
- **Params:** `text` Name. `chunk` Chunk size: 1–6 letters (3). `shuffle` Shuffle time: 0.2–2s (0.8). `lines` Line opacity: 0–1 (0.4). `overshoot` Snap overshoot: 0–0.5 (0.2). Advanced: sentence shown, stack layout, chunk colors, line count, quality.
- **Still:** the assembled name with its colored chunks. **Mobile:** same on scroll.
- **Tags:** Animated, Tech & AI. Difficulty: Medium. Time: ~40 min.

### 89. `infinitezoom`: Infinite Zoom
- **Use case:** real estate, travel, tech, agencies. **World:** Vapor Mall. **Trigger:** scroll-driven. **Technique:** a recursive scene where NAME is made of flat-illustrated buildings, a camera zoom into one window where the same scene reappears at a smaller scale, an exact scale-by-N loop so there is no visible seam, with a slight rotation.
- **What happens:** NAME is made of buildings seen from above. Scrolling zooms into one window, where a picture on a tiny room's wall shows NAME made of buildings again. The zoom loops forever with no visible seam.
- **Design:** a seamless loop with no visible cut; a slight rotation while zooming; crisp, flat illustration that holds up at every scale.
- **Interactions:** scroll (or drag sideways) zooms in and out forever.
- **Params:** `text` Name. `zoomSpeed` Zoom speed: 0.2–3 (1). `depth` Loop depth: 2–6 levels (4). `rotation` Rotation: 0–30° (10). `detail` Detail: 0–1 (0.6). Advanced: window position, building density, level scale factor, line weight, quality.
- **Still:** the top-level view of NAME. **Mobile:** same on scroll; fewer levels drawn at once.
- **Tags:** Animated, Real estate, Tech & AI. Difficulty: Spicy. Time: ~75 min.

---

## Backlog: needs a spec from the owner
Ideas the owner has mentioned that have **no spec in this repo yet**. Nothing is built or invented for them until the owner writes or approves a spec.
- **Jello wordmark** (a realistic jelly or gelatin wordmark). Not in `docs/SCENES.md` or `docs/INDUSTRY_HEROES.md`. Note: "Jello" is a trademark, so the public name must be different (for example "Jelly wordmark" or "Gelatin wordmark"). The existing `jelly` scene (Jelly cards, #49) and `melt` (#7) are different scenes.
- **The other industry heroes.** `docs/INDUSTRY_HEROES.md` is the owner's candidate list from 2026-10-17 (24 one-line ideas). Three were specced and built (`fogged`, `tailor`, `latte`, #51–53). The remaining 21 have only a one-line sketch there, not a full entry like the ones above, so they need a spec before any build.
