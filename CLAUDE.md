# CLAUDE.md

A single continuous route through ~90 PhET simulations, nucleus to deep space,
passing through human scale. Personal, non-commercial. No framework, no build
step, no dependencies — plain DOM and CSS transforms, three files and a manifest.

**Read `HANDOFF.md` first.** That is the design brief: what the route is, the
decisions already made and why, the stage plan, and the open issues. This file is
only *how to work in the repo*. When a design decision changes, `HANDOFF.md`
changes with it — do not let the two drift.

## Commands

```bash
node validate.js     # manifest integrity + coverage + density report
node build-data.js   # regenerate route-data.js from route.json
```

Serve rather than opening `index.html` over `file://` — `.claude/launch.json` has
an `http-server` config on port 5177. The `file://` path works via the generated
`route-data.js` fallback, but the `fetch` path is the one Stage 2 will use, so
develop against it.

**After any `route.json` edit, run both, in this order.** `route-data.js` is
generated and must never be hand-edited; if you skip the rebuild, the file://
fallback silently serves a stale manifest.

## Layout

| File | What it is |
|---|---|
| `route.json` | Source of truth. Scales, topics, sections, landmarks, passages, sim placements, exclusions. |
| `route-data.js` | Generated from the above. Do not edit. |
| `validate.js` | Coverage against `original-list.txt`, referential integrity, `move`/`zoom` field checks. |
| `index.html` | All CSS and markup. Every geometry class lives here. |
| `route-app.js` | Camera, scene builders, sky/light tables, HUD. |
| `assets/sprites/skater/`, `assets/sprites/kicker/` | PhET sprite sets. Registration numbers are in `CHAR_KIND`. |
| `assets/thumbs/` | Generated. One 240x158 sim screenshot per published slug. |

`route-app.js` is one IIFE in labelled sections: constants → utils → state →
scenes → surface landmarks (`BUILD.<landmark>`, one per ground stop) → HUD →
sky/sun → loop → input. Tune via the tables at the top (`SKY`, `LIGHT`,
`ABSTRACT`, `SLOT`, `CHAR_KIND`) rather than by hardcoding values into builders.

## Invariants

These are load-bearing, and most of them fail *quietly* rather than loudly.

- **The camera works in world units** (`W[]`, units-at-exponent-zero, so one pair
  of numbers spans every scale). `exps[]` is the zoom in log2; `zis[]` counts zoom
  **edges**, not octaves.
- **Fades are measured in zoom edges.** A scene fades out over the one step that
  separates it, whatever that step's magnitude is. Measure it in octaves and
  changing any single edge's `zoom` silently leaves the neighbour visible from a
  stop it should be absent from.
- **Smaller scales draw in front of larger ones.** They are nested inside them.
  Reverse it and the neuron hides behind the character's skull.
- **`headY()` is the only place a head position is computed.** The camera's nest
  anchor and the beach scene both need it; they were written out separately once,
  drifted, and put a `NaN` through every scene transform. There is a finite check
  on the keyframes at boot — if it throws, an anchor went non-finite.
- **Neighbouring scenes fade to zero by one full step**, laterally and vertically.
  Deliberate: far layers lag *toward screen centre*, so holding a neighbour
  visible drags its scene-specific geometry into your frame. Each scene paints its
  own full-bleed ground bands (4000 units wide), which is what keeps the ground
  continuous without the neighbour's objects intruding.
- **Sim slots are exactly 120×80** — the size of a PhET sim icon, so Stage 2 can
  drop the real thumbnail in. If a landmark's rows stop fitting, change its
  `perRow` in `SLOT`, never the box.
- **Everything random is `rnd(seed, i)`.** Never `Math.random`. A crowd or a
  starfield that reshuffles on reload reads as a bug, not as life.

## Gotchas that have already cost time

- **Line endings.** `core.autocrlf=true`; the working tree is CRLF. Any script
  that patches source by exact string match must normalise `\r\n` → `\n` on read
  and write CRLF back, or every anchor silently matches zero times.
- **The preview pane throttles `requestAnimationFrame`** when it is not
  compositing. Timing measurements taken through it are meaningless — an early
  attempt "measured" the route at single-digit fps and that was the harness, not
  the page. Screenshots themselves advance the animation, so to see a settled
  stop take several small-scale screenshots and then a full one.
- **`backdrop-filter` on `.slot` is a trap.** There are ~78 of them inside layers
  that are transformed and opacity-animated every frame. If the glass look is
  wanted back, put it on the readout chip alone.
- **Adding geometry to a far layer can intrude on the neighbouring scene**, for
  the lag reason above. If a neighbour ever needs to be visible again, clip
  scene-specific far geometry; do not raise the fade.

## Style

Match the surrounding code: `var`, `function`, no ES6+ in `route-app.js`. Comments
explain *why*, not what — several constants encode a judgement reached by looking
at the thing, and a bare number loses that. Landmark geometry should be the sims
that live there; a landmark whose props have nothing to do with its sims is just
decoration.

## Verifying

Serve it and walk the affected stops in the browser pane, check the console, run
`validate.js`. Don't hand the user a change to check manually — look at it.

## Where the project is

Stage 1 (grey-box route) is essentially done and traverses end to end. The named
remaining Stage 1 item is **the city being overloaded** — see `HANDOFF.md`.

Next is **Stage 2, sim launch**: facade → click → expand → iframe with a
parent-DOM top bar → back restores the camera. Two things to know before starting
it: `meta.urlTemplatesVerified` in `route.json` is still `false` and everything in
Stage 2 assumes those two templates, and `HANDOFF.md`'s "modal trap" section is
non-negotiable — a live cross-origin iframe that touches the viewport edge is a
trap with no way out.

The user has asked about putting real screenshots or live sims into the slot
boxes, which is exactly this stage; the boxes are already sim-icon sized for it.
That conversation was not finished, so ask before assuming a direction.
