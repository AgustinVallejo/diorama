# PhET Diorama

A single continuous route through 87 PhET simulations, from the nucleus to deep
space, passing through human scale on the way.

You travel along one unbroken path. Sims are not listed — they are placed in the
world at the point on the route where they belong, so *Build a Nucleus* sits in
the core of an atom and *Kepler's Laws* sits out among the planets. Clicking one
opens it at phet.colorado.edu.

No framework, no build step, no dependencies: plain DOM and CSS transforms.

## Running it

Serve it rather than opening `index.html` from the filesystem:

```bash
npx http-server -p 5177 -c-1
```

Then open <http://localhost:5177>. The `file://` path does work — the manifest has
a generated `route-data.js` fallback for exactly that — but the `fetch` path is
the one being developed against.

## The route

Twelve stops across seven scales, in three sections joined by two bespoke
animated passages:

| | Scale | Stops |
|---|---|---|
| **The Small** | nucleus → atom → molecule → cell | The Core, The Shell, Molecular Scale, Neural Tissue |
| **The Ground** | human | The Beach, The Lighthouse, The Playground, The City, The Lab, The Flatirons |
| **The Large** | planetary → cosmic | The Atmosphere, Orbit |

The small scales are nested inside a person's head — the descent ends in neural
tissue and the passage out of it pulls back through the character standing on the
beach. Sky and light travel with the route: morning at the beach, sunset behind
the Flatirons, black at either end.

Sims carry one of seven topics — Matter, Waves & Light, Electromagnetism, Motion &
Energy, Gravity, Life, Chance & Measurement — which colour the dot on each slot
and the legend.

## Controls

| | |
|---|---|
| scroll, drag | travel |
| `↑` `↓` `←` `→`, `PageUp` `PageDown`, `space`, `j` `k` | stop to stop |
| `Home` `End` | either end of the route |
| click a sim | open it at phet.colorado.edu |
| `l` | legend |
| `t` | captions off, pictures only |
| `h` | hide the HUD |

Pushing past the last stop ends the route.

## What is in here

| File | What it is |
|---|---|
| `route.json` | Source of truth. Scales, topics, sections, landmarks, passages, sim placements, exclusions. |
| `route-data.js` | Generated from it by `build-data.js`, so the page also works over `file://`. Never hand-edited. |
| `index.html` | All CSS and markup. |
| `route-app.js` | Camera, scene builders, sky and light tables, HUD. |
| `validate.js` | Manifest integrity, plus coverage against `original-list.txt`. |
| `original-list.txt` | Every sim considered — the denominator the coverage report checks against. |
| `assets/` | PhET sprite sets and one local screenshot per sim. |

```bash
node validate.js     # manifest integrity + coverage + density report
node build-data.js   # regenerate route-data.js from route.json
```

Run both after any `route.json` edit, in that order.

Of the 143 sims considered, 87 are placed (76 primary and 11 variants), 2 are
tools that sit off the route, and 54 are excluded — 40 pure maths, 9 dev and test
scaffolding, 2 deferred, 3 unpublished.

## Status

Stage 1, the route itself, traverses end to end. Stage 2 is launching a sim in
place rather than in a new tab.

Two documents carry the detail, and they are the ones to read before changing
anything:

- **`HANDOFF.md`** — the design brief. What the route is, every decision already
  made and why, the stage plan, the open issues.
- **`CLAUDE.md`** — how to work in the repo. Commands, the load-bearing
  invariants, and the gotchas that have already cost time.

## Credits

The simulations, the sprite sets in `assets/sprites/`, and the screenshots in
`assets/thumbs/` are the work of [PhET Interactive
Simulations](https://phet.colorado.edu) at the University of Colorado Boulder,
© University of Colorado Boulder. Each asset folder keeps the `license.json` it
shipped with.

This is a personal, non-commercial project by Agustín Vallejo, built with Claude.
It is not affiliated with or endorsed by PhET.
