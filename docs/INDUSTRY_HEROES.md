# peak: 24 industry hero animations (candidate list, not yet in scope)

Owner-supplied on 2026-10-17 (author: @Anudeep). Status: **not in the PRD and not built.** The owner marks each one "keep" or "cut"; only kept ones would become scenes (each written so it can become a `/new-scene` prompt). Adding scenes beyond the 50 in `docs/SCENES.md` changes the project's scope, so nothing here is built until the owner says which to start.

Rules every spec follows: every number is a slider; nothing flashes more than 3 times a second; phones get a touch or scroll version of any hover effect; no brand or film names anywhere. "BRAND" is whatever name the visitor types. Each spec has the same five parts: what happens, how it feels, interaction (desktop and phone), key sliders, and the still frame for reduced motion.

## Where to start (the owner's suggestion)
Sketch three first: **Tailor's cut**, **Fogged bottle**, **Latte pour**.

## Difficulty
- **Medium (14):** 4 Foam swirl, 5 Flour dust, 6 Rolling pin, 8 Lipstick swipe, 10 Fogged bottle, 12 Instant print, 13 Darkroom tray, 14 Sauce swoosh, 15 Grill sear, 18 Paint roller, 20 Wax seal, 21 Chalk clap, 22 Plate drop, 23 Petal fall. Mostly 2D: masks, particles and simple textures.
- **Hard (7):** 1 Tailor's cut, 2 Loose thread, 3 Latte pour, 7 Cream swirl, 9 Mist, 16 Record press, 24 Lacing. Soft materials or many moving parts that must stay in sync.
- **Very hard (3):** 11 Caustics, 17 Plan to building, 19 Potter's wheel. Real 3D and light with no 3D library; worth building only if the sketch says wow.

## The list

**Fashion**
1. **Tailor's cut** (plays on load, hard): a heavy drape hangs in folds; a chalk line draws across it in 0.6 s; shears snip along it in bites; the halves fall away swinging and folding; BRAND sits behind with loose threads drifting down. Cursor is a breeze; phone drag ripples it; Replay. Sliders: fabric weight, cut speed (0.6 to 3 s, 1.4), cut path (straight, wavy, diagonal), fold depth (0 to 1, 0.6), threads (0 to 30, 12), pattern (plain, pinstripe, check). Still: halves mid-fall, BRAND visible.
2. **Loose thread** (cursor-driven, hard): BRAND hidden under a tight knit with one loose thread; the cursor pulls it and the knit unravels row by row into crinkly yarn; stopping stops it. Phone: drag down; scrolling up re-knits. Sliders: stitch size (4 to 20 px, 10), unravel speed (1 row per 40 px), crinkle (0 to 1, 0.7), thickness (2 to 8 px, 4), pattern (stockinette, rib, cable). Still: half unravelled, half of BRAND showing.

**Coffee**
3. **Latte pour** (plays on load, hard): top-down cup of espresso with tiger-striped crema; a milk stream pours, foam blooms in rings, then the stream drags BRAND in latte-art strokes; foam settles. Cup turns toward the cursor; phone tilt (after a tap to allow); Replay. Sliders: pour speed (3 s), foam thickness (0.6), crema darkness, foam spread (1.0), wobble (0.3), cup size (70% of height). Still: finished art with a curl of steam.
4. **Foam swirl** (cursor-driven, medium): BRAND in foam; the cursor drags it like a spoon; it relaxes back over about 3 s, slightly softer each time. Phone: drag. Sliders: stir strength (0 to 2, 1), stiffness (1 to 8 s, 3), swirl trail length, foam color, crema color. Still: BRAND with one swirl through the last letter.

**Bakery**
5. **Flour dust** (cursor-driven, medium): floured board hides BRAND pressed in dough; the cursor blows flour away in puffs that resettle; cleared dough gets dusted again slowly. Sliders: flour amount (1.0), blow strength (0 to 3, 1.2), resettle time (0 to 20 s, 8), puff size, dough color, grain visibility. Still: two thirds cleared, flour piled at one edge.
6. **Rolling pin** (scroll-driven, medium): a lumpy dough ball; scrolling rolls a pin across, flattening it and embossing BRAND; scrolling back bunches it up. Sliders: dough softness (0.5), emboss depth (0 to 1, 0.6), pin speed, flour specks (0 to 200, 60), dough color. Still: flattened sheet with BRAND, pin at the bottom edge.

**Beauty and skincare**
7. **Cream swirl** (plays on load, hard): a glossy dollop twists into a peak, then an invisible spatula smooths it, leaving BRAND pressed in with ridges. Cursor dents the cream; phone drag. Sliders: thickness (0.7), sheen (0.8), swirl turns (1 to 6, 3), smooth speed (1.2 s), tint (white, blush, sand), dent recovery (1 to 6 s, 2.5). Still: smoothed surface with BRAND and a highlight.
8. **Lipstick swipe** (scroll-driven, medium): scrolling writes BRAND in one bold waxy stroke with uneven edges and shine; scrolling back wipes it. Sliders: stroke width (7% of width), wax texture (0.6), shine (0.5), shade (red, berry, nude, coral, custom), pressure variation (0.4). Still: BRAND fully written with shine.

**Perfume**
9. **Mist** (plays on load, hard): an atomizer puff sprays glittering droplets across the screen that settle and bead up on glass only where the letters are. Cursor is a breath of air; Replay. Sliders: droplets (500 to 6,000, 2,500), drift speed, sparkle (0.5), bead size, tint, settle time (1 to 6 s, 3). Still: BRAND in beaded droplets with strays.
10. **Fogged bottle** (cursor-driven, medium): fogged glass over a colored scene with BRAND behind; the cursor wipes fog away; drips form and run; fog creeps back. Phone: drag. Sliders: fog thickness (0.8), wipe width (6% of width), fog return (2 to 20 s, 6), drip chance (0.3), blur. Still: one wiped band with BRAND and two drips.

**Jewelry**
11. **Caustics** (cursor-driven, very hard): a cut gem turns toward the cursor, throwing shifting rainbow-edged light patterns; at one sweet spot they spell BRAND, then break apart; at rest it drifts back and holds. Phone tilt or drag. Sliders: cut (round, emerald, pear), color (clear, sapphire, emerald, ruby), sparkle (0.6), rainbow spread (0.4), turn sensitivity, hold time (1 to 10 s, 3). Still: gem at the sweet spot with BRAND in light.

**Photography**
12. **Instant print** (cursor-driven, medium): a print slides out crooked and develops over about 8 s, BRAND emerging; shaking (fast cursor movement) wobbles it and speeds development. Phone: swipe side to side or shake after a tap to allow. Replay. Sliders: develop time (2 to 20 s, 8), shake boost (0 to 3, 1.5), warmth, grain (0.4), border size, tilt (4 degrees). Still: developed print, slightly tilted.
13. **Darkroom tray** (plays on load, medium): red safelight, paper in a rocking tray; BRAND rises from grey to black as ripples pass. Cursor makes ripples. Sliders: develop speed (6 s), ripple size (0.4), rocking speed, safelight (red, amber), contrast, paper tone. Still: developed print with one ripple.

**Food and restaurants**
14. **Sauce swoosh** (plays on load, medium): a brush drags a glossy sauce across a white plate in one stroke that is BRAND, with dry streaks and flicked drops. Cursor drags a fingertip through; Replay. Sliders: stroke speed (0.3 to 2 s, 0.7), thickness (0.7), dry streaks (0.5), flick drops (0 to 12, 5), sauce color, plate color. Still: finished swoosh with drops.
15. **Grill sear** (scroll-driven, medium): a glowing grate; scrolling sears BRAND letter by letter with ember edges and rising smoke. Cursor fans the smoke. Sliders: char darkness (0.8), ember glow (0.5), smoke amount (0.6), smoke rise speed, grate spacing, surface (steak, bread, vegetable). Still: BRAND seared with one curl of smoke.

**Music**
16. **Record press** (cursor-driven, hard): a spinning vinyl with BRAND pressed into the grooves around the label; the cursor scratches it (slows, reverses, warps the letters); it spins back up with a wobble. Phone: drag around the record. Optional soft scratch sound, off by default. Sliders: spin speed, groove shine (0.6), scratch strength, spin-up time (0.3 to 3 s, 1), vinyl color (black, red, clear blue, marbled), label color. Still: record at rest, BRAND along the top.

**Architecture and interiors**
17. **Plan to building** (scroll-driven, very hard): a blueprint with BRAND as a floor plan; scrolling tilts the camera and raises the outlines into buildings floor by floor, ending as a skyline with long shadows. Cursor orbits a few degrees. Sliders: floors per letter (2 to 20, 8), build speed, end tilt (20 to 60 degrees, 40), window density, blueprint color, material (concrete, glass, brick). Still: finished skyline in three-quarter view.
18. **Paint roller** (scroll-driven, medium): a roller travels down a wall as you scroll; fresh stippled paint appears with BRAND as the skipped stencil; wet shine dries matte; a couple of drips. Sliders: roller width, texture (0.6), drips (0 to 6, 2), dry time (0 to 10 s, 4), paint color, wall color. Still: painted wall with BRAND stencil and two drips.

**Ceramics and craft**
19. **Potter's wheel** (scroll-driven, very hard): wet clay spins on a wheel; scrolling pulls it up into BRAND in ridged clay letters, then the wheel stops. Cursor speeds the wheel. Sliders: wheel speed, wobble (0.3), wetness (0.6), throwing-line depth, clay color. Still: clay letters on the stopped wheel.
20. **Wax seal** (plays on load, medium): wax drips on an envelope flap, a brass seal presses an embossed monogram (first letter of BRAND), the flap opens and a card with BRAND slides out. Cursor tilts the envelope; phone tilt; Replay. Sliders: wax color (red, forest, navy, gold), spread, press depth, step timing (4 s), envelope color, card font weight. Still: open envelope, broken seal, card with BRAND.

**Fitness**
21. **Chalk clap** (plays on load, medium): a dim screen with a hanging chalk cloud; a clap bursts it outward; BRAND is revealed as dust thins, with chalk on the letter tops. Cursor waves dust aside; Replay. Sliders: burst strength (1.0), dust (500 to 8,000, 3,000), settle time (1 to 8 s, 3.5), dust color, dust on letters (0.4). Still: BRAND with chalk on top and a thin haze.
22. **Plate drop** (plays on load, medium): an iron plate slams onto a rubber floor in front of BRAND; one screen jolt, dust ring, letters bounce, plate rattles to rest. Cursor nudges the plate; phone tap drops it again. Sliders: weight, jolt strength (0.6), dust ring size, letter bounce (0.4), plate color. Still: plate flat, BRAND behind, thin dust ring.

**Weddings and events**
23. **Petal fall** (cursor-driven, medium): hundreds of petals drift down and settle into BRAND (or two names joined by "&"); now and then one lifts away and another replaces it. Cursor is a breeze that scatters petals; they return after a few seconds. Sliders: count (200 to 2,000, 900), type (rose, cherry blossom, mixed), fall speed, flutter (0.6), breeze, return time (1 to 10 s, 4), colors. Still: BRAND in petals with a few loose ones.

**Sneakers and streetwear**
24. **Lacing** (plays on load, hard): a flat lace threads through scattered eyelets, tracing BRAND in blocky strokes, then ties a bow whose ends swing. Cursor tugs the loose ends; Replay unlaces and relaces. Sliders: lace speed (3 s), width, tug snap (0.6), lace color, eyelet metal (silver, gold, black), background (canvas, suede, mesh). Still: BRAND fully laced, bow tied.
