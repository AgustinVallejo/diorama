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
                                    atmosphere → orbit
```

12 stops. **Deep Space used to be a 13th**, holding the cosmic sims while Orbit held
the picture. That left two empty stops in a row at the end — the atmosphere and then
orbit — which is the Foothills mistake again, and it split one subject across two
places for no reason: the sims and the system they are about belong in the same
frame. Orbit is the terminus now and every cosmic sim rings the system.

**The Foothills used to be a stop too** and the Flatirons used to hold zero
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
| `index.html` | The viewer: all CSS, all markup. Landmark geometry classes live here. |
| `route-app.js` | Camera, scene builders, sky/light tables, HUD. One `BUILD.<landmark>` function per surface landmark. |
| `build-data.js` | `node build-data.js` — regenerates `route-data.js` from `route.json` so the page works over `file://`. **Run it after every manifest edit** or the fallback goes stale. |
| `route-data.js` | Generated. Don't hand-edit. |
| `assets/sprites/skater/` | PhET skater sprites, 180x242 PNGs, consistently registered (head centre at about 49%/23% of the frame). Used for the beach character and the crowds. |
| `assets/sprites/kicker/` | PhET kicker sprites, SVG. Standing people; used in the beach and city crowds alongside the skaters. |
| `assets/thumbs/` | Generated. 87 sim screenshots, 240x158 PNG, 2.2 MB total — a 2x copy of PhET's 600x394. One per published slug. Regenerate by re-running the download in **Thumbnails** below. |

The `_png.ts` / `_svg.ts` sidecar modules that shipped with both asset folders have
been deleted (311 files). They are PhET's base64 build artefacts and nothing here
imports them; if you ever need one back, it is regenerable from the image.

The route is bracketed by two cards that share their styling. The opening sits over
the first stop so the nucleus is already turning behind the title. The ending is
reached by pushing past the last stop -- the only gesture there that can mean
"done" -- and is closed only by its own button, which travels home behind the card
and then hands back to the opening, so Start again means the title card too. It
arrives slowly and in three stages (ground, then message, then button) under
confetti in the seven topic colours: the legend's seven, so the route is what
comes down at the end. Pushing past takes END_PUSH wheel pixels and only counts
END_GRACE ms after arrival, or a trackpad's momentum tail would roll the credits
over a scene nobody got to look at.

Serve it rather than opening the file directly — `npx http-server -p 5177 -c-1` does it.
(`.claude/` is git-ignored, so its launch config does not travel with a clone.)
`file://` works via `route-data.js`, but the
fetch path is the one a live sim launch will use.

Current state: all 143 accounted for. 87 placed (76 primary + 11 variants), 2 off-route
tools, 54 excluded (40 pure math, 9 dev/test scaffolding, 2 deferred statistics sims,
3 repositories PhET never published a build of). **Nothing on the route lacks a
screenshot and a runnable URL** — that is the rule the last exclusion enforces.

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
- **nest** — a scene pinned to a point inside the next one out, via `NEST`. Two
  scenes use it, and both are the moments the route is about:

  The **beach** is pinned to the head of the character standing on the sand, so
  pulling out of the neuron lands you looking at the person who was carrying it.
  Change `HERO` and the anchor follows. That edge's zoom is **5.2**, the longest
  on the route: because the scene is nested, the ratio between the neural scene's
  size and the head's is fixed at `SCENE_W / headWidth / 2^zoom` and does not
  change through the move. At the 2.2 default that ratio is about seven, so the
  neurons were seven times the size of the head they are supposed to be inside
  for the whole transition, and the character arrived in the middle of a field of
  them. At 5.2 it is about one. If the neurons ever need to sit tighter inside the
  head, that number is the only lever — moving the cells around inside their own
  scene cannot fix it.

  **Orbit** is pinned to the blue planet, so leaving the atmosphere comes *out of a
  world* rather than backing away from a frame: the sky you were standing in shrinks
  onto the planet it belongs to while the system opens out around it. That edge's
  zoom is 3.0 rather than the 1.2 it used to be — a short pull back made the planet
  feel like a retreat, but once the move is anchored *to* the planet a long one does
  the opposite, and the further you pull the more the planet reads as a destination
  rather than as the frame shrinking. Change the body table and the anchor follows.

  Both anchors are read before any scene is built, which is why `HERO` and the
  `BODIES` table are both declared at the top of `route-app.js` rather than inside
  the builders that draw them. This is the same trap `headY()` fell into once: two
  copies of one position, drifting apart in silence.

A landmark can also name a **`pace`**, which stretches the settle time of the edge
*arriving* at it. The beach is 5.0, the atmosphere 4.0 and Orbit 4.0 — the three
edges that are the point of the route rather than a way of getting between
stops. The spring is
linear, so settle time does not depend on distance and every edge otherwise takes
the same time; stiffness scales as 1/pace², damping as 1/pace, so the motion keeps
its shape and only its clock changes. The edge is named by the landmark you arrive
at, which is also how `move` and `zoom` are named, so `edgePace()` has to look the
other way at a stop boundary when you are travelling backwards, or leaving the
beach would borrow the lighthouse's pace. One consequence worth knowing: a long
jump that crosses the beach edge crawls through it. That is the edge doing its job,
not a bug.

A landmark can also name a **`hold`**: the fraction of the edge spent on the zoom
alone, camera pinned where it already was, before any travel starts. Only the beach
does, at 0.62.

Most edges are one move — zoom and travel together, and it reads as one gesture. A
**nested** edge is two, and running them together ruins it. Coming out of the head,
the camera has to end up looking at the middle of a beach, which is off to one side
of the character; do that while zooming and the neuron field slides into a corner
while it shrinks, so the one thing the whole passage exists to show — that the small
scales were inside a person — never lands in front of you. With a hold: zoom out of
the neurons with the head dead centre, and *then*, scale settled, pan off the head
into the beach. Each half is eased on its own so the handover is a pause rather than
a corner, and the scene fade tracks the zoom half rather than the clock, so the
neurons are gone before the pan starts.

Orbit is nested too and does not have a hold yet. It is the obvious next candidate
if that move ever reads the same way.

A landmark can name its own move in `route.json` (`"move": "pan" | "zoom" | "climb"`,
validated). Only the atmosphere does; everything else falls out of the default rule
— pan inside the human band, zoom elsewhere. A zoom edge can also set its own
magnitude (default `ZOOM_STEP` 2.2; the beach sets 5.2 and Orbit 3.0, both for
reasons written up where those landmarks are described).

Two corollaries, both load-bearing:

- **Smaller scales draw in front of larger ones** (`zIndex = 1000 - ds*10`). They are
  nested *inside* them. Reverse it and the neuron hides behind the skull.
- **A neighbouring scale is gone by one stop, in both directions.** The fade is
  measured in *edges* (`zis`), not in octaves — so changing one edge's magnitude
  does not change how anything fades. **A zoom counts as an edge and so does a
  climb; a pan does not.** The climb was excluded at first, on the grounds that it
  changes no exponent and the offset fade would handle the ground going away. That
  held while the camera stayed put and stopped holding the moment the pull back to
  Orbit began sliding sideways: two thirds of the way through it, the whole human
  band came back on screen at a sixth of its size, city and all, sitting under the
  planet. Counting the climb puts the band a full edge below the atmosphere and two
  below Orbit, which is where it belongs — leaving the ground is the one move whose
  entire point is that the ground goes away.
  Measure it in octaves and shortening the atmosphere-to-orbit pull back leaves the
  planet hanging in the sky above the Flatirons. An earlier long trailing fade kept
  three scales faintly stacked; it was pretty, and it broke both ends: coming out of
  the head you could still see the neuron over the beach, and the atom's specks
  drifted through what is supposed to be the void around the nucleus. Full strength
  mid-transition, absent on arrival.

**A passage does not announce itself.** There was a banner across the middle of
the frame naming it, and it was the one thing guaranteed to be in the way at the
one moment the picture is supposed to carry itself. What is left is the effect:
a tint over the frame, and a single `--passage` variable on `<body>` that fades
the scene's own labels out while it lasts. The moment the sim names are
irrelevant is the moment they would be covering the thing you came for. Both
passages still carry their notes in the manifest, where they are notes to
whoever is editing it.

## The abstract scales

They are not all the same kind of emptiness, so each names its own contents in
`ABSTRACT` (`route-app.js`) rather than sharing one generic rings-and-glow scene:

| Landmark | What it is |
|---|---|
| The Core | **Void and one object.** No rings, no specks, no glow, no star field — the nucleus is a packed cluster of nucleons and nothing else is in the frame. |
| The Shell | **An atom.** The same nucleon cluster as the stop below, with four shells drawn round it and electrons riding them — 2, 4, 4, 3 filling outward. Its scale is **not** a free parameter: see below. The shells are circles, so the electrons sit on circles; they used to ride an ellipse of the same radius, which put every one of them off its own shell. |
| Molecular Scale | **Several molecules**, each a few spheres joined by bonds, at varying sizes. This is the band where things stop being single particles and start being structures, and where the gases sims live — a box of molecules seen directly is this scale, not a room off a corridor. |
| Neural Tissue | **Cells.** A soma with dendrites fanning off it and one long axon, six of them at varying sizes. The centre one is what lands on the character's temple during the passage. |
| The Atmosphere | Thin air. The ground is gone and the limb glows below. One sim: the Greenhouse Effect, which is the only place on the route where you are standing inside the thing being simulated. The limb is deliberately the same blue as the planet at Orbit, because it is the same planet. |
| Orbit | **The system, and the terminus.** The sun holds the centre and six bodies ride squashed ellipses round it, the one you climbed off among them — the third out, the only one with a rim light. The reveal pulled one step further than it used to be: not just "that was a planet" but "that planet is one of several going round a star". Every cosmic sim rings it. The orbit radii are sized to fit *inside* the slot ring, so the sims sit around the picture rather than across it — if you resize one, resize the other. The ringed planet's ring is two clipped halves of one ellipse, drawn either side of the ball in DOM order, because a single ellipse over the disc reads as a hoop resting on a circle. |

## What each surface landmark is made of

Landmark geometry should be the sims that live there. Beyond that, a few things
that were got wrong once and are worth not getting wrong again:

- **The sea is a band of small parallel highlights**, longer and brighter towards
  the shore, with a foam line where it meets the sand. Nothing on this water
  moves, and one flat band of colour reads as a painted stripe however good the
  colour is. The waterline is 96 units below the horizon rather than 46, purely
  to have somewhere to put them; the sand line is `HERO.ground` rather than its
  own constant, because the two have to be equal and were written out twice.
- **The rock comes out of a hill that is in the same layer as it is.** Forested
  mounds are drawn in the mid layer immediately before the slabs, at slab scale,
  overlapping them, with the slabs' feet buried in them. The range used to live
  entirely in the far layer, which parallaxes separately and reads as a painted
  backdrop — the slabs stood *in front of* scenery rather than standing *in* it,
  and no amount of reshaping them fixed that. The conifers on a mound go along its
  skyline rather than scattered over its face: the only place a tree is legible
  against a hill of the same colour is where it breaks the edge.
- **The Flatirons are four overlapping wedges**, not a picket of separate cones
  and not the rounded rectangles before that. A flatiron is a slanting triangular
  face: a short steep drop on the right from the summit and a long straight
  dip-slope down to the left, which is what the `.slab` clip-path draws
  (`--a1`/`--a2` place the summit, which is a short edge rather than a point —
  a single vertex reads as a cone however good the profile below it is). Height
  is only about 1.1x the base; taller than that and they go pointy. They are
  drawn right to left so the left-hand ones are nearest and cut across the big
  one behind, hazed by depth, standing in a green shoulder with pines at the
  foot. The pines are what give the rock its size.
- **The lighthouse beam is three wedges, not one.** A CSS border triangle is one
  flat colour the whole way out, which is what made the old beam read as a pale
  shape rather than as light. These are clipped rectangles — a wide soft spill, a
  brighter cone, a hard core — each narrow at the lens, widening out to sea, and
  each fading along its length. The halo at the lens matters as much as the beam:
  without it the light appears to start from nothing.
- **The playground's apparatus stands on four different baselines.** Everything in
  that scene is on one layer, so how far down the ground plane a thing sits is the
  only depth cue there is; four objects sharing one y read as a shelf. Nearer ones
  sit lower and are drawn later so they overlap what is behind them.
- **The skate bowl is a hole.** It used to be a U-shaped outline sitting *on* the
  ground, which read as a piece of string. It is now dug into the ground plane and
  hangs below it, with deck either side, coping on the rim, and an inset shadow at
  the lip that is what makes it read as depth rather than as a dark shape painted
  on the grass.
- **City buildings are opaque.** They were a grid of hairlines over a translucent
  panel, so the sky and the blocks behind showed through and the skyline read as
  scaffolding. Now the block is solid and the windows are cut out of it: glass
  bands with opaque piers laid over the top.
- **The city's turbine has exactly one place it can stand.** Two full rows of seven
  sim boxes cover the sky from x 66 to 1134 and the HUD owns both edges, so the
  only clear sky in the scene is the strip above the rows. That is why the slot
  rows sit lower than they used to and why the rotor is up at y 40 with its mast
  running down behind the buildings. If the city is ever split (see below), this
  can relax.
- **Overhead cable is a bottom border with a tall elliptical radius.** Cheapest
  honest catenary there is; a straight run between poles reads as a fence rail.
- **In the lab, people are drawn before the benches.** The other way round,
  anyone standing further down the corridor than a bench came out on top of it —
  feet at the bench's own height, in front of its legs, which reads as standing
  on the table. Nothing in that scene parallaxes, so the only depth cue is size
  and how far down the floor a body stands, and that cue only works if the paint
  order agrees with it. They stand in the gaps the doors and benches leave.
- **The lab is a 2x2 block of zones**, one row of sims each — three of them now
  that gases has gone to Molecular Scale, so the fourth cell is empty. Stacked in
  rows they read as one long list and the corridor behind them disappeared. At a
  1000x600 window the readout card owns everything above y 170 out to x 454 and
  the ruler everything past x 1041, so the whole block sits below the readout and
  between those edges; the HUD is a fixed size in screen pixels, so it swallows
  *fewer* scene units the larger the window — that is the worst case, not the
  typical one. The two bands are pushed as far apart as the scene allows, because
  packed tight they read as one block of boxes rather than as separate groups and
  the labels alone were not enough; the doors are 74 units rather than 100 to pay
  for the gap. The left column is flush with the scene edge and the right column
  is flush with the ruler — **right-aligned, not placed at a fixed x**, which is
  what keeps the frame filled when a zone is narrow. With one sim in spectrometry
  a left-aligned right column left the last third of the corridor empty. The door
  pitch follows the zone count for the same reason.
- **The Flatirons range is generated, not three triangles.** `ridge()` builds a
  clip-path from n peaks at irregular spacing, each with its own height and
  asymmetry and a saddle dropped between neighbours; two ranges at different
  opacity do the aerial perspective. Conifers along its base and at the trailhead
  are what give the slabs a size — rock is just a shape until something
  tree-shaped stands next to it.

### One nucleus, seen at two scales

The cluster at the centre of the atom is the *same object* as the nucleus one stop
down, drawn at exactly the scale that stop renders at from here — `2^(exps[i-1] -
exps[i])`, computed in `abstractScene` and handed to `atomShells`. Because scene
*i-1* is itself rendered at that scale relative to scene *i*, the two clusters land
on the same pixels at every camera position, and the crossfade between the scenes
is invisible: one object, zoomed.

It was 0.34, picked by eye, which is 1.6x too big. The transition dissolved one
nucleus into a differently-sized nucleus sitting in the same place, which is a
strange thing to watch and hard to name when you see it.

**So the scale is not a knob.** If the nucleus should be bigger at the atom, make
it bigger in `nucleusCluster` — which makes it bigger at the nucleus stop too,
because it is the same object. That is exactly what happened here: the cluster grew
from 100 to 160 units wide so that at 0.218 it is still a thing with visible
nucleons rather than a smudge, and the Core reads better for it. The alternative
lever is the *zoom magnitude* of that edge, which is also fine to move — just never
the scale on its own.

## Sprites

Two PhET families, registered differently on their own canvases, so each carries its
own numbers in `CHAR_KIND` (measured with `getBBox`, not guessed):

- **skater** (`assets/sprites/skater/`, PNG) fills its 180x242 canvas edge to edge.
- **kicker** (`assets/sprites/kicker/`, SVG) stands in the *left half* of a 235x322 board
  with air above the head — `cx` is 0.271, nowhere near centre.

`character()` normalises both to a requested height so a person is a person
whichever family they came from. There are people at the beach, through the city,
in the lab corridor and at the Flatirons trailhead; the stick figure is gone
entirely, along with its CSS. **`headY()` is the single source of truth for where
a head is**, used by both the camera's nest anchor and the scene that draws the
sprite; they were written out separately once and silently drifted, which put a
`NaN` through every scene transform. There is now a finite-check on the keyframes
at boot so that failure is loud instead of a blank world.

### Placement is by scale, not by topic

The route's axis is scale, so a sim goes where its subject *is*, not where its
topic has friends. Three moves made that rule true where it had not been:

- **Charges and Fields** dropped from the city to the nucleus. Point charges and
  the field they make are the same picture at any scale, and down here the charges
  are the protons in the cluster you are looking at. Coulomb's Law stays in the
  city as the sideways pair — same law, different scale — and is still the
  invisible layer over the street.
- **The gases zone** — States of Matter, Gas Properties, Diffusion — left the Lab
  for Molecular Scale. Every one of them is a box of molecules seen directly,
  which is a scale, not a room off a corridor. That drops the Lab to three zones.
- **The Greenhouse Effect** rose from Orbit to the Atmosphere, which is what it is
  about, and which makes the Atmosphere the one stop on the route where you are
  standing inside the thing being simulated.

The Atmosphere therefore no longer holds zero sims, and the long argument that
used to live here for why it should is retired. What survives of it: the emptiness
up there was never the problem the Foothills was. The Foothills was an empty stop
on a flat walk and read as a stall; the Atmosphere is the top of a vertical launch,
where having almost nothing in the frame *is* the content. One sim does not change
that — it is still a beat inside a two-part move. There is now no empty stop on
the route at all.

## Launching a sim

**Every slot is an `<a target="_blank">` to the sim on phet.colorado.edu.** Click
one and it opens in its own tab.

This retires the whole in-page launch design, and with it the modal-trap section
that used to be the scariest thing in this file. Nothing cross-origin is ever
embedded in the route, so there is no live iframe to get trapped inside, no
gutter of parent chrome to maintain around it, and no camera state to save and
restore. It also costs nothing to build and gets middle-click, ctrl-click and
copy-link-address for free, which a div with a click handler would not.

Two things it does need:

- `rel="noopener noreferrer"`, because `target="_blank"` otherwise hands the sim
  a live `window.opener` back into this page.
- A way to tell a click from a drag. The viewport listens for pointer gestures to
  travel the route, and a drag that happens to start on a slot must not also open
  a tab when it ends. `dragged` is set once a gesture moves more than 4px, and the
  slot's click handler calls `preventDefault` when it is set. Four pixels because
  a real click is never perfectly still. `dragged` is cleared on the next
  pointerdown, not on pointerup — the click the browser fires at the end of a drag
  arrives *after* pointerup, and clearing it there would let every drag that ended
  on a slot open a tab.
- **Pointer capture is taken late, and this is load-bearing.** The viewport used to
  call `setPointerCapture` in its pointerdown handler. While an element holds
  pointer capture the browser retargets the compatibility mouse events to it —
  `click` included — so every click on a sim slot was being delivered to the
  viewport instead of to the link, and the link simply never fired. Hover still
  worked, because that is a pointer event and not a compatibility one, which is
  exactly what makes this look like a styling problem rather than an input one.
  Capture is now taken on the first pointermove that clears the slop and never on
  a plain press. It still does its job: it only matters once a gesture is a drag,
  and by then the slop is already exceeded.

If an in-page launch is ever wanted after all, the modal-trap rules still apply
and are worth reading in the git history of this file before starting.

## Thumbnails

Every slot draws the sim's own screenshot. The picture is the identification; the
caption along the bottom is for the pairs that look alike, and `t` drops the
captions so you can read the route as pictures.

**The template in `meta` was wrong.** `{slug}-screenshot.png` 404s on every sim on
PhET's CDN — it was a guess and nothing had ever fetched it. The real names are
`{slug}-600.png` (600x394, the screenshot with the sim's nav bar along the bottom)
and `{slug}-128.png` (128x84, the same picture as an icon). Both are
`Access-Control-Allow-Origin: *`. `urlTemplatesVerified` is now true — not
spot-checked but exhaustive: all 87 published sims were fetched, screenshot and
run URL both, and all 87 of each came back 200.

**A slug here is a PhET repository name, not a published sim name.** That is what
`original-list.txt` holds, and for 79 of the 87 the two happen to coincide. Eight
do not, and they carry a `phet` object in the manifest:

- **Eight legacy Java sims** live at `/sims/{project}/{sim}-600.png` — no `html/`,
  no `latest/` — and the project can bundle several sims. `nuclear-physics` holds
  three of ours. Four also renamed on publication: `radioactive-dating` →
  `radioactive-dating-game`, `photoelectric-effect` → `photoelectric`,
  `quantum-bound-states` → `bound-states`, `eating-exercise-and-energy` →
  `eating-and-exercise`. They run under CheerpJ, and its build is per
  *project*, not per sim: one page loads the whole Java project and picks a sim out
  of it with `?simulation=`, so all three nuclear-physics sims share a URL that
  differs only in the query. Expect a slow cold start, and probably a different
  affordance from an HTML sim.
Three more repositories — `xray-diffraction`, `optics-lab` and
`circuit-construction-kit-black-box-study` — PhET never published a build of at
all. No screenshot, no runnable URL. They are **excluded** rather than placed, in
their own `unpublished` bucket, so they stay accounted for against the original
list without holding a slot on the route. For a while they were drawn as empty dark
boxes with a `no build` badge, at the Shell and the Lighthouse and as a variant
chip in the city; a box with no picture in a row of pictures reads as a loading
failure, not as a fact about PhET. If one of them ever ships, move it back out of
`excluded` and it needs nothing else.

Resolve through `assets(sim)` in `route-app.js`, never by pasting a template.
Anything that turns out to be exceptional belongs in the manifest next to the sim,
not in a branch in the code.

The authority on all of this is PhET's own metadata service, which is worth
re-querying if a slug ever stops resolving:

    https://phet.colorado.edu/services/metadata/1.3/simulations?format=json&summary&locale=en

It lists every project with its sims, and `common.html` / `common.legacy` hold the
canonical URL templates.

### Why the pictures are local, and knocked back

`assets/thumbs/` holds all 87 at 240x158 so the route paints with no network, per the
hosted-iframes decision. 240 is 2x the 120x80 slot: 128 is soft on a retina panel
and 600 is 74 MB of decoded bitmap across 78 slots, which is real cost against a
camera that has to hold frame rate. They load eagerly — the set is 2.2 MB, and
`loading="lazy"` cannot judge a scene that is transformed and scaled down, so it
either loads everything anyway or pops a slot in halfway through a move.

Two things about how they sit in the scene, both learned by looking:

- **Every thumbnail is dimmed** (`saturate(.86) brightness(.82)`). PhET screenshots
  are lit for a white page. Undimmed, 78 bright rectangles read as the subject and
  the landscape they are placed in reads as background — which is backwards.
- **The slot frame is two rings, dark inside light.** One hairline can only hold an
  edge against one kind of background and these boxes cross a whole day: a white
  border vanishes into the noon sky over the playground, a dark one vanishes into
  the void around the nucleus.

Frame rate with 78 images in play has **not** been measured in a real window — it
was checked in a hidden preview pane, where `requestAnimationFrame` is frozen and
any number would have been a lie. Measure it before trusting it.

## The readout

Section, landmark, scale, sim count. **Not the landmark's `note`** — that is
documentation for whoever is editing the manifest, and on screen it was a
paragraph of prose sitting over the picture at every single stop. If something in
a note needs to reach the viewer, it needs to be in the picture.

A landmark holding exactly one sim puts it in the middle of the frame rather than
out on the slot ring. A lone box on an ellipse reads as the first of a set that
failed to load.

The passage banner is gone entirely — see **The camera** above.

## The opening

A card over the first stop: the title, one line of what this is, and a Begin
button. It sits over the route rather than over a blank, so the nucleus is
already turning behind the title, and the HUD is held at zero until it is
dismissed so there is nothing but the picture and the words.

Anything dismisses it — the button, a click anywhere on it, a key, a scroll —
and **whatever did so is spent on the dismissal rather than also travelling**.
Without that, the first flick of a trackpad lands you two stops in before you
have finished reading the subtitle. `dismissOpening()` returns whether it did
anything, so the wheel and keydown handlers can bail on the gesture that opened
the route.

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

- **0 — Manifest.** ✅ Done, templates verified — see **Thumbnails** below.
- **1 — The route itself.** ← *you are here, and it traverses.* Drawn geometry for
  landmarks, each sim showing its own screenshot at 1.2x sim-icon size. Discrete camera stops, eased
  transitions, arrows / scroll / drag / dot-strip all work. Built on top of that:
  three parallax depth layers per scene (`--pf` / `--pxu` / `--pyu`, see the CSS), a
  single light source that travels the route so the day arc runs alongside the scale
  arc (morning at the beach → sunset behind the Flatirons → stars by orbit), a star
  field that fades in over the ascent, real PhET character sprites at the beach
  and through the city, and **each slot showing its own sim's screenshot**.
  Remaining: the pacing work below.
- **2 — Sim launch.** The facade half is done — a slot *is* the screenshot now, and
  `assets(sim)` in `route-app.js` already returns the run URL to point an iframe at.
  Remaining: click → expand → iframe with a parent-DOM top bar → back restores exact
  camera position. Snap camera to scale 1 during expansion.
- **3 — Topic overlay.** Build **waves-light first** (16 sims across 5 scales — it
  exercises the whole route). Gravity second.
- **4 — Art.** 4a: the beach alone, full treatment, to get a real per-scene cost. 4b: city,
  lab, playground, Flatirons, then the abstract scales last (they hold up longest
  without illustration).
  Likely half the total effort.
- **5 — The two passages.**
- **6 — Polish.** URL state, local thumbnails, basics toggle, keyboard/focus across the
  iframe boundary, touch.

Honest cut line: after **4a**. The drawn route + one finished scene + working launch +
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

- **The neighbour-offset fade is measured against the viewport, not against the
  scene's own width.** The two agree for a lateral or vertical neighbour, which
  sits at the same exponent as the camera, and that is every case the fade was
  written for. They disagree violently for a nested scene: the neural tissue is
  inside a head, so in its own units the camera is thousands of widths away while
  on screen it is a thumbnail near the middle of the frame. Measured the old way
  it was declared an intruder and killed a fifth of the way into the move, while
  still four times the size of the head — and the longer the nested edge's zoom,
  the earlier it died. Do not put this back on scene-relative units to "fix" a
  nested scene lingering; raise the zoom or fix the fade in edges.
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
- **Sim slots are 144x96** — 1.2x a PhET sim icon and the same 3:2 its screenshot
  ships in, so the picture drops in with no letterboxing. Everything inside is
  clipped to the box; the name clamps to two lines. Every row width in `SLOT` was
  checked against `SCENE_W` at this size, so if you scale it again, check them
  again. If a landmark's rows stop fitting, change its `perRow`, not the box.
- **The sprites, the screenshots and the drawn geometry are at three different
  fidelities.** Real characters and real sim art against flat CSS shapes looks
  unfinished, which is honest for where this is but means
  tonal judgements made now (the ground tints, mostly) will need redoing at Stage 4.
  The Flatirons hiker is still a stick figure on purpose — a skateboarder at a
  trailhead read wrong, and neither folder has a hiking pose.
- **Some sims belong to more than one place.** `friction` shows literal atoms; 
  `energy-forms-and-changes` spans four scales; `wave-interference` is both classical and 
  quantum. Plan for ghost nodes — translucent repeats at the secondary location — so the 
  same icon is visible from multiple altitudes. The repetition is the point: it's how you 
  *feel* that a concept is scale-invariant.
