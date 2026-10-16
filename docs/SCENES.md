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
