# PhET Route — Handoff Brief

A personal, non-commercial project. Nothing customer-facing.

## What this is

A single continuous **route** through ~90 PhET simulations, running from the nucleus to
deep space and passing through human scale on the way. The user travels along it. Sims
appear as objects placed in the world at the point on the route where they belong.

The route has three sections and two **passages** (bespoke animated transitions that join
them):

```
nucleus → atom → molecule → cell
                              |
                    [passage: out of the head]
                              |
  beach → lighthouse → playground → city → lab → flatirons
                                                     |
                                        [passage: off the summit]
                                                     |
                                 atmosphere → orbit → deep space
```

13 stops. **The Foothills used to be a 14th** and the Flatirons used to hold zero
sims as a deliberate breath before the ascent. Both are gone: an empty stop read
as a stall, not a breath. The Foothills folded into the Flatirons — its three
sims now sit at the trailhead at the base of the slabs, its hills are the rear
parallax layer of that scene, and the breath is now the empty rock *above* the
slot row rather than an empty stop. It costs no stop and it reads better. Don't
re-split them without a reason.

The small scales are abstract (glow, particles, gradients). The ground is illustrated —
a stylised landscape you move laterally through. The large scales go abstract again.

**The two passages are the emotional core.** The first: a neuron fires, the camera pulls
back through dendrites and tissue and out through a character's temple, and they're on a
beach mid-frisbee-throw. Small things aren't in a jar, they're in you. The second: leave
the Flatirons and climb into orbit. Both are hand-animated, both come late (Stage 5).

## Files

| File | What it is |
|---|---|
| `route.json` | **Single source of truth.** Scales, topics, sections, landmarks, passages, every sim's placement, plus what was excluded and why. |
| `validate.js` | `node validate.js` — diffs the manifest against the original list, checks referential integrity, prints a density and topic-spread report. Run it after any manifest edit. |
| `original-list.txt` | The 143 raw PhET slugs. Only input to validation. |
| `index.html` | The grey-box viewer: all CSS, all markup. Landmark geometry classes live here. |
| `route-app.js` | Camera, scene builders, sky/light tables, HUD. One `BUILD.<landmark>` function per surface landmark. |
| `build-data.js` | `node build-data.js` — regenerates `route-data.js` from `route.json` so the page works over `file://`. **Run it after every manifest edit** or the fallback goes stale. |
| `route-data.js` | Generated. Don't hand-edit. |
| `energy skatepark/` | PhET skater sprites, 180x242 PNGs, consistently registered (head centre at about 49%/23% of the frame). The grey-box uses these for the beach character and the city crowd. |
| `soccer common/` | PhET kicker sprites, SVG. Standing people; used in the beach and city crowds alongside the skaters. |

The `_png.ts` / `_svg.ts` sidecar modules that shipped with both asset folders have
been deleted (311 files). They are PhET's base64 build artefacts and nothing here
imports them; if you ever need one back, it is regenerable from the image.

Serve it rather than opening the file directly — `.claude/launch.json` has an
`http-server` config on port 5177. `file://` works via `route-data.js`, but the
fetch path is the one Stage 2 will use.

Current state: all 143 accounted for. 90 placed (78 primary + 12 variants), 2 off-route
tools, 51 excluded (40 pure math, 9 dev/test scaffolding, 2 deferred statistics sims).

## The camera

Three moves between stops, all falling out of one set of world coordinates
(`W[]` in `route-app.js`, in units-at-exponent-zero so one pair of numbers spans
every scale — a scene at exponent E measures `2^E` world units per one of its own):

- **pan** — sideways, inside the human band.
- **climb** — straight up, and **no zoom at all**. You leave the Flatirons by
  *rising off it*: the rock drops out of the bottom of the frame and you are left
  in empty sky with the ground gone. The reveal is deliberately held for the *next*
  move — orbit zooms out, and the thing you climbed off turns out to be a planet.
  Launch, then reveal; doing both at once read as backing away rather than going up.
- **nest** — a scene pinned to a point inside the next one out, via `NEST`. Only
  the beach uses it, and it is what makes the first passage work: the neural-tissue
  scene is pinned to the head of the character standing on the sand, so pulling out
  of the neuron lands you looking at the person who was carrying it. Change
  `HERO` and the anchor follows; the camera keyframes read it before any scene is
  built, which is why `HERO` is declared at the top of the file.

A landmark can name its own move in `route.json` (`"move": "pan" | "zoom" | "climb"`,
validated). Only the atmosphere does; everything else falls out of the default rule
— pan inside the human band, zoom elsewhere. A zoom edge can also set its own
magnitude (`"zoom": 1.2` on orbit, default `ZOOM_STEP` 2.2): a full step out of the
atmosphere made the planet feel like a retreat rather than an arrival.

Two corollaries, both load-bearing:

- **Smaller scales draw in front of larger ones** (`zIndex = 1000 - ds*10`). They are
  nested *inside* them. Reverse it and the neuron hides behind the skull.
- **A neighbouring scale is gone by one stop, in both directions.** The fade is
  measured in zoom *edges* (`zis`, incremented once per zoom transition), not in
  octaves — so changing one edge's magnitude does not change how anything fades.
  Measure it in octaves and shortening the atmosphere-to-orbit pull back leaves the
  planet hanging in the sky above the Flatirons. An earlier long trailing fade kept
  three scales faintly stacked; it was pretty, and it broke both ends: coming out of
  the head you could still see the neuron over the beach, and the atom's specks
  drifted through what is supposed to be the void around the nucleus. Full strength
  mid-transition, absent on arrival.

Passages also fade the scene's own labels out from under the banner, via a single
`--passage` variable on `<body>` driven by the banner's alpha. The one moment the
sim names are irrelevant is the one moment they were covering the picture.

## The abstract scales

They are not all the same kind of emptiness, so each names its own contents in
`ABSTRACT` (`route-app.js`) rather than sharing one generic rings-and-glow scene:

| Landmark | What it is |
|---|---|
| The Core | **Void and one object.** No rings, no specks, no glow, no star field — the nucleus is a packed cluster of nucleons and nothing else is in the frame. |
| The Shell | Rings and particles: the generic abstract treatment. |
| The Assembly | **Several molecules**, each a few spheres joined by bonds, at varying sizes. This is the band where things stop being single particles and start being structures. |
| Neural Tissue | **Cells.** A soma with dendrites fanning off it and one long axon, six of them at varying sizes. The centre one is what lands on the character's temple during the passage. |
| The Atmosphere | Thin air. The ground is gone, the limb glows below, nothing else — and **zero sims, on purpose**. See below. |
| Orbit | The planet, and every planet-scale sim — including Gravity Force Lab, which moved out of the playground: two masses and one inverse-square law, out where that law is the only thing left. |
| Deep Space | Rings and particles again, with a full star field. |

## Sprites

Two PhET families, registered differently on their own canvases, so each carries its
own numbers in `CHAR_KIND` (measured with `getBBox`, not guessed):

- **skater** (`energy skatepark/`, PNG) fills its 180x242 canvas edge to edge.
- **kicker** (`soccer common/`, SVG) stands in the *left half* of a 235x322 board
  with air above the head — `cx` is 0.271, nowhere near centre.

`character()` normalises both to a requested height so a person is a person
whichever family they came from. There are people at the beach, through the city,
in the lab corridor and at the Flatirons trailhead; the stick figure is gone
entirely, along with its CSS. **`headY()` is the single source of truth for where
a head is**, used by both the camera's nest anchor and the scene that draws the
sprite; they were written out separately once and silently drifted, which put a
`NaN` through every scene transform. There is now a finite-check on the keyframes
at boot so that failure is loud instead of a blank world.

### The Atmosphere holds zero sims

Deliberately, and it is *not* the mistake the Foothills was. The Foothills was an
empty stop on a flat walk, so it read as a stall. The Atmosphere is the top of a
vertical launch: the emptiness is the content — you have just left the ground and
there is nothing up here yet. It is a beat inside a two-part move (launch, then
reveal), which is also why the pull back to orbit is deliberately short. The
Greenhouse Effect moved up to Orbit to sit with the other planet-scale sims.

If it ever starts feeling like a stall, the fix is to shorten the climb or fold it
into the passage — not to park a sim there.

## Two axes

**Scale** is the vertical axis and it *is* the route order. **Topic** is not spatial —
it's an overlay. Toggling a topic lights up its sims wherever they fall and draws
connecting lines across the route. Constellation lines over a landscape. This is what
gives a one-dimensional route the feeling of depth, and it's the main interaction idea
worth protecting.

**Topic queries must use `topic` + `also`, not `topic` alone.** Electromagnetism and
mechanics have every primary-tagged sim in the human band; their cross-scale reach lives
entirely in the `also` arrays (`neuron`, `molecule-polarity`, `photoelectric-effect`,
`atomic-interactions`). Query primary only and the overlay lights one landmark and dies.
Render primary nodes solid, secondary dimmer.

## Decisions already made — don't relitigate without reason

- **Hosted iframes, not local sim repos.** Unbuilt local needs ~100 sibling repos; built
  local is several MB per sim, hundreds of MB total. Hosted is PhET's supported embed
  path, CC-BY, CDN-backed, and gives shareable URLs. Keep *thumbnails* local so the map
  itself renders with no network.
- **Plain DOM + CSS transforms.** The camera is discrete stops on a line — a `translate3d`
  and a `scale` on a few containers. Pixi is the fallback if parallax gets heavy.
  `scenery-stack` (PhET's own libs, packaged for outside use) was considered: its DOM
  renderer would let an iframe live inside the scene graph, but transformed cross-origin
  iframes go blurry and hit-test badly anyway, so you'd snap to scale 1 on activation and
  lose the advantage. Thin outside docs, small community. Not worth it.
- **Facades, not live embeds.** A warm PhET sim looks almost identical to its screenshot,
  because these sims are static until you drag something. Static thumbnail with
  `pointer-events: none`, one click to activate, exactly one live iframe at a time.
  6 sims have idle motion (`idleMotion: true` in the manifest) — give those a short
  looping clip, not a live iframe.
- **`-basics` twins are not their own nodes.** They're a difficulty toggle on the parent.
  Same for `-virtual-lab` and the black-box study. See `variantOf` / `variantKind`.
  `capacitor-lab-basics` is named `-basics` but has no parent here — it's standalone.

## The modal trap — the one real UX hazard

A PhET sim is a cross-origin iframe. Once the pointer is over a live one, the parent page
gets **zero** events: wheel-to-zoom stops reaching your canvas, `Escape` never fires, you
can't read or reset anything. Entering costs one click; leaving requires an exit you built.

Two rules, both cheap, both non-negotiable:

1. Facade until activated (above).
2. **A live sim never touches the viewport edge.** Keep a visible gutter of parent-owned
   chrome around it — back button, breadcrumb, scrim. The gutter is where the mouse goes
   to escape. Edge-to-edge iframe = trap.

Also: set `allow` restrictively or several sims will chirp at once.

## Stages

- **0 — Manifest.** ✅ Done. One task remains: **verify the two URL templates in
  `meta` against 3–4 slugs including a hyphenated one**, then set `urlTemplatesVerified`.
  Everything in Stage 2 assumes them.
- **1 — Grey-box route.** ← *you are here, and it traverses.* Geometry for landmarks,
  labeled boxes for sim slots at real sim-icon size. Discrete camera stops, eased
  transitions, arrows / scroll / drag / dot-strip all work. Built on top of that:
  three parallax depth layers per scene (`--pf` / `--pxu` / `--pyu`, see the CSS), a
  single light source that travels the route so the day arc runs alongside the scale
  arc (morning at the beach → sunset behind the Flatirons → stars by orbit), a star
  field that fades in over the ascent, and real PhET character sprites at the beach
  and through the city. Remaining: the pacing work below.
- **2 — Sim launch.** Facade → click → expand → iframe with a parent-DOM top bar → back
  restores exact camera position. Snap camera to scale 1 during expansion.
- **3 — Topic overlay.** Build **waves-light first** (16 sims across 5 scales — it
  exercises the whole route). Gravity second.
- **4 — Art.** 4a: the beach alone, full treatment, to get a real per-scene cost. 4b: city,
  lab, playground, Flatirons, then the abstract scales last (they survive grey-box longest).
  Likely half the total effort.
- **5 — The two passages.**
- **6 — Polish.** URL state, local thumbnails, basics toggle, keyboard/focus across the
  iframe boundary, touch.

Honest cut line: after **4a**. Grey-boxed route + one finished scene + working launch +
topic overlay is already a real thing.

## Stage 1 scope

Build only what the route needs: **discrete stops on a line.** Do not build a general
camera that supports arbitrary paths, free pan, or continuous zoom until something asks
for it. This is the most likely place to over-engineer.

Pacing is the deliverable, and it can't be designed on paper — you need to *feel* that the
atom section ends too fast or the city drags. **Expect to reorder stops and split or merge
landmarks after an hour of moving through it.** That's the stage working, not failing.
Edit `route.json` and re-run `validate.js` rather than hard-coding positions in markup.

## Known issues to resolve in Stage 1

- **A neighbouring scene fades out completely by one stop.** It used to hold at 44%,
  which looked like nice continuity and was actually a bug: the far layer lags
  *toward screen centre*, so at the playground the city's skyline was dragged into
  frame and sat behind the swings. Each scene paints its own full-bleed ground
  bands, so the ground still reads as continuous while a neighbour's objects stay
  in their own scene. If you ever want the neighbour visible again, the fix is to
  clip scene-specific far geometry, not to raise the fade.
- **Landmark geometry should be the sims that live there.** The playground carries a
  seesaw (balancing-act), a spring stand (masses-and-springs, hookes-law), a swing
  with a second pendulum (pendulum-lab) and a skate bowl (energy-skate-park); the
  lab has a kitted bench outside each door, one per zone (`labKit`). This is worth
  keeping up as sims move — a landmark whose props have nothing to do with its sims
  is just decoration.
- **The city is overloaded** — 14 primary + 3 variants, against 3 at the Flatirons. Its
  slot rows now stack three high and fill the sky above the skyline. Either split it into
  two adjacent landmarks (residential street: static + circuits / power district:
  magnetism + generation), or let the camera pan laterally *within* the city so it's a
  short side-scroller inside the larger route. The second is more interesting and reuses
  machinery the lab corridor wants anyway. **This is the biggest remaining Stage 1 item.**
- **The ground band is dead weight at some stops.** Everything below `GROUND_Y` is the
  near layer's territory, and where a landmark has no foreground element (currently the
  Lab most of all) the bottom third is flat dark nothing. Fix per-landmark by adding near
  geometry, not by moving `GROUND_Y`.
- **A long jump feels slow, but the spring isn't the cause.** It's linear, so its settle
  time doesn't depend on distance. Frame rate is what to look at — `.slot` deliberately
  has no `backdrop-filter` for this reason, and the readout only rewrites when the
  nearest stop changes. Measure in a real window; a background or non-compositing tab
  throttles `requestAnimationFrame` and will lie to you.
- **Sim slots are exactly 120x80** — the size of a PhET sim icon, so Stage 2 can drop
  the real thumbnail straight in. Everything inside is clipped to that box; the name
  clamps to three lines. If a landmark's rows stop fitting, change its `perRow` in
  `SLOT`, not the box.
- **The sprites and the grey-box are at different fidelities now.** Real characters
  against flat geometry looks unfinished, which is honest for this stage but means
  tonal judgements made now (the ground tints, mostly) will need redoing at Stage 4.
  The Flatirons hiker is still a stick figure on purpose — a skateboarder at a
  trailhead read wrong, and neither folder has a hiking pose.
- **Some sims belong to more than one place.** `friction` shows literal atoms; 
  `energy-forms-and-changes` spans four scales; `wave-interference` is both classical and 
  quantum. Plan for ghost nodes — translucent repeats at the secondary location — so the 
  same icon is visible from multiple altitudes. The repetition is the point: it's how you 
  *feel* that a concept is scale-invariant.
