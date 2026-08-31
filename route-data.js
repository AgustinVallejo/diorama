// GENERATED from route.json by build-data.js - do not edit by hand.
window.ROUTE_DATA = {
  "meta": {
    "name": "PhET Route",
    "version": "0.1.0",
    "description": "A single continuous route through PhET simulations, from the nucleus to deep space, passing through human scale.",
    "simUrlTemplate": "https://phet.colorado.edu/sims/html/{slug}/latest/{slug}_en.html",
    "thumbUrlTemplate": "https://phet.colorado.edu/sims/html/{slug}/latest/{slug}-600.png",
    "thumbSmallUrlTemplate": "https://phet.colorado.edu/sims/html/{slug}/latest/{slug}-128.png",
    "thumbLocalTemplate": "thumbs/{slug}.png",
    "legacySimUrlTemplate": "https://phet.colorado.edu/sims/cheerpj/{project}/latest/{project}.html?simulation={sim}",
    "legacyThumbUrlTemplate": "https://phet.colorado.edu/sims/{project}/{sim}-600.png",
    "urlTemplatesVerified": true,
    "notes": [
      "URL templates verified 2026-08-28 against the PhET metadata service (services/metadata/1.3/simulations) and then every one of the 87 published sims was fetched, screenshot and run URL both, all 200. The old {slug}-screenshot.png guess 404s on every sim; the real names are {slug}-600.png (600x394) and {slug}-128.png (128x84).",
      "These slugs are PhET *repository* names, which is what original-list.txt holds. For eleven sims the repository name is not the published sim name: eight are legacy Java sims served from /sims/{project}/ where the project bundles several sims (nuclear-physics holds three), and three were never published at all. Those eleven carry a \"phet\" object; everything else resolves from the slug alone.",
      "thumbs/ holds a local 240x158 copy of every published screenshot (2.2 MB, 87 files) so the route renders with no network. The 600px original is the upgrade path for an expanded sim card.",
      "Landmark order is the route. Sim order is within-landmark placement.",
      "A sim's scale is inherited from its landmark; it is not stored per-sim.",
      "The Foothills was merged into The Flatirons. An empty stop before the ascent read as a stall, not a breath. The three foothills sims now sit at the trailhead, at the base of the slabs; the hills survive as the rear parallax layer of that scene.",
      "The atmosphere is nested on the blue planet at Orbit, the way the beach is nested on the neuron, so the last move comes out of a world rather than backing away from a frame. The anchor is read from the body table in route-app.js, which is why that table lives at the top of the file with HERO.",
      "The gases zone left the Lab for Molecular Scale - a box of molecules seen directly is not a room off a corridor - which drops the Lab to three zones. Charges and Fields dropped to the nucleus and the Greenhouse Effect rose to the atmosphere; both were placed by topic before and are placed by scale now.",
      "Deep Space was folded into Orbit. Two empty stops in a row at the end read as a stall, and the cosmic sims all belong to one picture anyway - the system, with its sims in a ring around it.",
      "Three repositories PhET never published a build of - xray-diffraction, optics-lab, circuit-construction-kit-black-box-study - are excluded rather than placed. Nothing on the route lacks a screenshot and a runnable URL.",
      "A landmark may name a hold: the fraction of the edge spent zooming, camera pinned, before any travel starts. Only the beach does. A nested edge is two moves and running them together ruins it - the neurons slide into a corner while shrinking and the one thing the passage exists to show never lands in front of you.",
      "A climb counts as a fade edge and a pan does not, so the whole human band is a full edge below the atmosphere and two below Orbit. Without it the city came back on screen partway through the pull back to Orbit.",
      "The beach edge is 5.2 octaves rather than the 2.2 default. The neural scene is nested on the character head, so its size relative to the head through the whole move is fixed by 2^zoom: at 2.2 the neurons were seven times the head when the character appeared, which is not being inside anything.",
      "A landmark may name a pace, which stretches the settle time of the edge arriving at it. Only the beach does: coming out of a head has to be slower than a zoom between two abstract scales or it reads as one."
    ]
  },

  "scales": [
    { "id": "nucleus",   "label": "Nucleus",        "approxMeters": 1e-15 },
    { "id": "atom",      "label": "Atom",           "approxMeters": 1e-10 },
    { "id": "molecule",  "label": "Molecule",       "approxMeters": 1e-9 },
    { "id": "cell",      "label": "Cell",           "approxMeters": 1e-6 },
    { "id": "human",     "label": "Human",          "approxMeters": 1e0 },
    { "id": "planetary", "label": "Planetary",      "approxMeters": 1e7 },
    { "id": "cosmic",    "label": "Solar & Stellar","approxMeters": 1e11 }
  ],

  "topics": [
    { "id": "matter",           "label": "Matter",           "blurb": "What things are made of, and how that structure determines behaviour." },
    { "id": "waves-light",      "label": "Waves & Light",    "blurb": "Oscillation and radiation, from a rope on a dock to the spectrum of a star." },
    { "id": "electromagnetism", "label": "Electromagnetism",  "blurb": "Charge, field, current, and magnetism." },
    { "id": "mechanics",        "label": "Motion & Energy",  "blurb": "Forces, collisions, and the conservation of energy." },
    { "id": "gravity",          "label": "Gravity",          "blurb": "One inverse-square law, from two lead spheres to Kepler's orbits." },
    { "id": "life",             "label": "Life",             "blurb": "Cells, organisms, and populations." },
    { "id": "chance",           "label": "Chance & Measurement", "blurb": "Randomness at the bottom producing reliable statistics at the top." }
  ],

  "sections": [
    { "id": "descent", "label": "The Small",  "landmarks": ["nucleus-core", "electron-shell", "molecular-assembly", "neural-tissue"] },
    { "id": "surface", "label": "The Ground", "landmarks": ["beach", "lighthouse", "playground", "city", "lab-corridor", "flatirons"] },
    { "id": "ascent",  "label": "The Large",  "landmarks": ["atmosphere", "orbit"] }
  ],

  "passages": [
    {
      "id": "waking",
      "label": "Out of the head",
      "from": "neural-tissue",
      "to": "beach",
      "note": "A neuron fires; pull back through dendrites, through tissue, out through the temple. The character is mid-throw with a frisbee."
    },
    {
      "id": "ascent",
      "label": "Off the summit",
      "from": "flatirons",
      "to": "atmosphere",
      "note": "Leave the rock and climb. Sky darkens from dusk to stars."
    }
  ],

  "landmarks": [
    { "id": "nucleus-core",       "order": 1,  "scale": "nucleus",   "label": "The Core",          "art": "abstract", "note": "Void and one object. The nucleus is the only thing in the frame, and it is the same object you see small at the centre of the atom one step up." },
    { "id": "electron-shell",     "order": 2,  "scale": "atom",      "label": "The Shell",         "art": "abstract", "note": "Where classical physics starts to fail. Narrative hinge." },
    { "id": "molecular-assembly", "order": 3,  "scale": "molecule",  "label": "Molecular Scale",   "art": "abstract", "note": "Where things stop being single particles and start being structures." },
    { "id": "neural-tissue",      "order": 4,  "scale": "cell",      "label": "Neural Tissue",     "art": "abstract", "note": "Exit point for the 'waking' passage." },

    { "id": "beach",       "order": 5,  "scale": "human", "label": "The Beach",       "art": "illustrated", "zoom": 5.2, "pace": 5.0, "hold": 0.62, "note": "Arrival point. Daylight. The character is here. The edge into it is the longest zoom on the route, the slowest, and the only one split in two: 5.2 octaves so the neural scene is no bigger than the head it sits in, 5x the settle time, and a hold of 0.62 so the zoom out of the neurons finishes with the head dead centre before any pan towards the beach begins." },
    { "id": "lighthouse",  "order": 6,  "scale": "human", "label": "The Lighthouse",  "art": "illustrated", "note": "Beam enters the water at the base — bending-light lives on that boundary." },
    { "id": "playground",  "order": 7,  "scale": "human", "label": "The Playground",  "art": "illustrated" },
    { "id": "city",        "order": 8,  "scale": "human", "label": "The City",        "art": "illustrated", "note": "Densest landmark. coulombs-law is a toggleable invisible layer over the whole street, not an object." },
    { "id": "lab-corridor","order": 9,  "scale": "human", "label": "The Lab",         "art": "illustrated", "zones": ["solutions", "spectrometry", "wave-bench"], "note": "Doors on both sides, one topic per room. Every instrument aims DOWN a scale — this is where the vertical axis becomes something you operate rather than travel." },
    { "id": "flatirons",   "order": 10, "scale": "human", "label": "The Flatirons",   "art": "illustrated", "note": "Dusk. Trailhead at the base of the slabs, foothills behind it. Last ground before the ascent — the sims sit low and the rock does the breathing. Boulder easter egg." },

    { "id": "atmosphere",  "order": 11, "scale": "planetary", "label": "The Atmosphere", "art": "abstract", "move": "climb", "pace": 4.0, "note": "Reached by going straight up off the Flatirons - a pure vertical launch, no zoom, and paced at 4x because a launch that is over quickly is not a launch. The ground is gone; the limb glows below and there is nothing else here but thin air and the one sim that is about this air. The top of the launch, not a destination." },
    { "id": "orbit",       "order": 12, "scale": "cosmic",    "label": "Orbit",          "art": "abstract", "zoom": 3.0, "note": "Terminus, and the reveal. You come out of the blue planet: the atmosphere is nested on it, so the sky you were in shrinks onto the world it belongs to and the system opens out around it. A short pull back used to make the planet feel like a retreat rather than an arrival; anchored to the planet, a long one does the opposite." }
  ],

  "sims": [
    { "slug": "build-a-nucleus", "name": "Build a Nucleus", "landmark": "nucleus-core", "order": 1, "topic": "matter", "also": [] },
    { "slug": "rutherford-scattering", "name": "Rutherford Scattering", "landmark": "nucleus-core", "order": 2, "topic": "matter", "also": ["mechanics"] },
    { "slug": "alpha-decay", "name": "Alpha Decay", "landmark": "nucleus-core", "order": 3, "topic": "chance", "also": ["matter"] , "phet": { "project": "nuclear-physics", "sim": "alpha-decay", "kind": "legacy" } },
    { "slug": "beta-decay", "name": "Beta Decay", "landmark": "nucleus-core", "order": 4, "topic": "chance", "also": ["matter"] , "phet": { "project": "nuclear-physics", "sim": "beta-decay", "kind": "legacy" } },
    { "slug": "radioactive-dating", "name": "Radioactive Dating Game", "landmark": "nucleus-core", "order": 5, "topic": "chance", "also": ["matter"] , "phet": { "project": "nuclear-physics", "sim": "radioactive-dating-game", "kind": "legacy" } },

    { "slug": "build-an-atom", "name": "Build an Atom", "landmark": "electron-shell", "order": 1, "topic": "matter", "also": [] },
    { "slug": "isotopes-and-atomic-mass", "name": "Isotopes and Atomic Mass", "landmark": "electron-shell", "order": 2, "topic": "matter", "also": [] },
    { "slug": "models-of-the-hydrogen-atom", "name": "Models of the Hydrogen Atom", "landmark": "electron-shell", "order": 3, "topic": "matter", "also": ["waves-light"] },
    { "slug": "photoelectric-effect", "name": "Photoelectric Effect", "landmark": "electron-shell", "order": 4, "topic": "waves-light", "also": ["electromagnetism"] , "phet": { "project": "photoelectric", "sim": "photoelectric", "kind": "legacy" } },
    { "slug": "quantum-bound-states", "name": "Quantum Bound States", "landmark": "electron-shell", "order": 5, "topic": "matter", "also": ["waves-light"] , "phet": { "project": "bound-states", "sim": "bound-states", "kind": "legacy" } },
    { "slug": "quantum-wave-interference", "name": "Quantum Wave Interference", "landmark": "electron-shell", "order": 6, "topic": "waves-light", "also": ["chance"] , "phet": { "project": "quantum-wave-interference", "sim": "quantum-wave-interference", "kind": "legacy" } },
    { "slug": "quantum-measurement", "name": "Quantum Measurement", "landmark": "electron-shell", "order": 7, "topic": "chance", "also": ["waves-light"] },
    { "slug": "quantum-coin-toss", "name": "Quantum Coin Toss", "landmark": "electron-shell", "order": 8, "topic": "chance", "also": [] },

    { "slug": "build-a-molecule", "name": "Build a Molecule", "landmark": "molecular-assembly", "order": 1, "topic": "matter", "also": [] },
    { "slug": "molecule-shapes", "name": "Molecule Shapes", "landmark": "molecular-assembly", "order": 2, "topic": "matter", "also": [] },
    { "slug": "molecule-shapes-basics", "name": "Molecule Shapes: Basics", "landmark": "molecular-assembly", "order": 2, "topic": "matter", "also": [], "variantOf": "molecule-shapes", "variantKind": "basics" },
    { "slug": "molecule-polarity", "name": "Molecule Polarity", "landmark": "molecular-assembly", "order": 3, "topic": "matter", "also": ["electromagnetism"] },
    { "slug": "atomic-interactions", "name": "Atomic Interactions", "landmark": "molecular-assembly", "order": 4, "topic": "matter", "also": ["mechanics"] },
    { "slug": "molecules-and-light", "name": "Molecules and Light", "landmark": "molecular-assembly", "order": 5, "topic": "waves-light", "also": ["matter"] },
    { "slug": "balancing-chemical-equations", "name": "Balancing Chemical Equations", "landmark": "molecular-assembly", "order": 6, "topic": "matter", "also": [] },
    { "slug": "reactants-products-and-leftovers", "name": "Reactants, Products and Leftovers", "landmark": "molecular-assembly", "order": 7, "topic": "matter", "also": [] },

    { "slug": "neuron", "name": "Neuron", "landmark": "neural-tissue", "order": 1, "topic": "life", "also": ["electromagnetism"], "note": "Anchor of the waking passage. Cross-link to capacitor-lab-basics is the best surprising edge in the whole map." },
    { "slug": "membrane-transport", "name": "Membrane Transport", "landmark": "neural-tissue", "order": 2, "topic": "life", "also": ["matter"] },
    { "slug": "gene-expression-essentials", "name": "Gene Expression Essentials", "landmark": "neural-tissue", "order": 3, "topic": "life", "also": [] },

    { "slug": "waves-intro", "name": "Waves Intro", "landmark": "beach", "order": 1, "topic": "waves-light", "also": [] },
    { "slug": "wave-interference", "name": "Wave Interference", "landmark": "beach", "order": 2, "topic": "waves-light", "also": ["chance"] },
    { "slug": "wave-on-a-string", "name": "Wave on a String", "landmark": "beach", "order": 3, "topic": "waves-light", "also": [], "idleMotion": true, "note": "Rope tied to a dock piling." },
    { "slug": "sound-waves", "name": "Sound Waves", "landmark": "beach", "order": 4, "topic": "waves-light", "also": [] },
    { "slug": "buoyancy", "name": "Buoyancy", "landmark": "beach", "order": 5, "topic": "matter", "also": ["mechanics"] },
    { "slug": "buoyancy-basics", "name": "Buoyancy: Basics", "landmark": "beach", "order": 5, "topic": "matter", "also": ["mechanics"], "variantOf": "buoyancy", "variantKind": "basics" },
    { "slug": "density", "name": "Density", "landmark": "beach", "order": 6, "topic": "matter", "also": [] },
    { "slug": "under-pressure", "name": "Under Pressure", "landmark": "beach", "order": 7, "topic": "matter", "also": ["mechanics"] },
    { "slug": "fluid-pressure-and-flow", "name": "Fluid Pressure and Flow", "landmark": "beach", "order": 8, "topic": "matter", "also": ["mechanics"] , "phet": { "project": "fluid-pressure-and-flow", "sim": "fluid-pressure-and-flow", "kind": "legacy" } },

    { "slug": "bending-light", "name": "Bending Light", "landmark": "lighthouse", "order": 1, "topic": "waves-light", "also": [], "note": "Place at the waterline — the beam crossing into the sea is the physical boundary the sim is about." },
    { "slug": "geometric-optics", "name": "Geometric Optics", "landmark": "lighthouse", "order": 2, "topic": "waves-light", "also": [] },
    { "slug": "geometric-optics-basics", "name": "Geometric Optics: Basics", "landmark": "lighthouse", "order": 2, "topic": "waves-light", "also": [], "variantOf": "geometric-optics", "variantKind": "basics" },
    { "slug": "color-vision", "name": "Color Vision", "landmark": "lighthouse", "order": 4, "topic": "waves-light", "also": ["life"] },

    { "slug": "forces-and-motion-basics", "name": "Forces and Motion: Basics", "landmark": "playground", "order": 1, "topic": "mechanics", "also": [] },
    { "slug": "friction", "name": "Friction", "landmark": "playground", "order": 2, "topic": "mechanics", "also": ["matter"], "note": "Genuinely two-scale — the sim literally shows atoms. Ghost node at molecular-assembly." },
    { "slug": "collision-lab", "name": "Collision Lab", "landmark": "playground", "order": 3, "topic": "mechanics", "also": [] },
    { "slug": "balancing-act", "name": "Balancing Act", "landmark": "playground", "order": 4, "topic": "mechanics", "also": ["gravity"], "note": "The seesaw." },
    { "slug": "pendulum-lab", "name": "Pendulum Lab", "landmark": "playground", "order": 5, "topic": "mechanics", "also": ["gravity"], "note": "The swing set." },
    { "slug": "masses-and-springs", "name": "Masses and Springs", "landmark": "playground", "order": 6, "topic": "mechanics", "also": [] },
    { "slug": "masses-and-springs-basics", "name": "Masses and Springs: Basics", "landmark": "playground", "order": 6, "topic": "mechanics", "also": [], "variantOf": "masses-and-springs", "variantKind": "basics" },
    { "slug": "hookes-law", "name": "Hooke's Law", "landmark": "playground", "order": 7, "topic": "mechanics", "also": [] },
    { "slug": "energy-skate-park", "name": "Energy Skate Park", "landmark": "playground", "order": 8, "topic": "mechanics", "also": ["gravity"], "note": "The bowl." },
    { "slug": "energy-skate-park-basics", "name": "Energy Skate Park: Basics", "landmark": "playground", "order": 8, "topic": "mechanics", "also": ["gravity"], "variantOf": "energy-skate-park", "variantKind": "basics" },
    { "slug": "projectile-motion", "name": "Projectile Motion", "landmark": "playground", "order": 9, "topic": "mechanics", "also": ["gravity"], "note": "Cannon at the far edge, aimed toward the city." },
    { "slug": "gravity-force-lab", "name": "Gravity Force Lab", "landmark": "orbit", "order": 5, "topic": "gravity", "also": [], "note": "Two masses and one inverse-square law, out where that law is the only thing left. Sits with the orbital sims it explains; pairs sideways with coulombs-law in the city - same law, different constant." },
    { "slug": "gravity-force-lab-basics", "name": "Gravity Force Lab: Basics", "landmark": "orbit", "order": 5, "topic": "gravity", "also": [], "variantOf": "gravity-force-lab", "variantKind": "basics" },

    { "slug": "balloons-and-static-electricity", "name": "Balloons and Static Electricity", "landmark": "city", "order": 1, "topic": "electromagnetism", "also": [], "note": "A kid's birthday party in a front yard." },
    { "slug": "john-travoltage", "name": "John Travoltage", "landmark": "city", "order": 2, "topic": "electromagnetism", "also": [], "note": "A doorknob." },
    { "slug": "coulombs-law", "name": "Coulomb's Law", "landmark": "city", "order": 3, "topic": "electromagnetism", "also": ["gravity"], "note": "Invisible layer over the street, not an object. Pairs with gravity-force-lab — same law, different constant." },
    { "slug": "charges-and-fields", "name": "Charges and Fields", "landmark": "nucleus-core", "order": 6, "topic": "electromagnetism", "also": [], "note": "The field the protons in the cluster are making. Pairs sideways with coulombs-law in the city - same law, different scale." },
    { "slug": "capacitor-lab-basics", "name": "Capacitor Lab: Basics", "landmark": "city", "order": 5, "topic": "electromagnetism", "also": [], "note": "Named -basics but has no parent in this set. Standalone, not a variant." },
    { "slug": "ohms-law", "name": "Ohm's Law", "landmark": "city", "order": 6, "topic": "electromagnetism", "also": [] },
    { "slug": "resistance-in-a-wire", "name": "Resistance in a Wire", "landmark": "city", "order": 7, "topic": "electromagnetism", "also": ["matter"] },
    { "slug": "circuit-construction-kit-dc", "name": "Circuit Construction Kit: DC", "landmark": "city", "order": 8, "topic": "electromagnetism", "also": [] },
    { "slug": "circuit-construction-kit-dc-virtual-lab", "name": "CCK: DC — Virtual Lab", "landmark": "city", "order": 8, "topic": "electromagnetism", "also": [], "variantOf": "circuit-construction-kit-dc", "variantKind": "virtual-lab" },
    { "slug": "circuit-construction-kit-ac", "name": "Circuit Construction Kit: AC", "landmark": "city", "order": 9, "topic": "electromagnetism", "also": [] },
    { "slug": "circuit-construction-kit-ac-virtual-lab", "name": "CCK: AC — Virtual Lab", "landmark": "city", "order": 9, "topic": "electromagnetism", "also": [], "variantOf": "circuit-construction-kit-ac", "variantKind": "virtual-lab" },
    { "slug": "magnet-and-compass", "name": "Magnet and Compass", "landmark": "city", "order": 10, "topic": "electromagnetism", "also": [] },
    { "slug": "magnets-and-electromagnets", "name": "Magnets and Electromagnets", "landmark": "city", "order": 11, "topic": "electromagnetism", "also": [] },
    { "slug": "faradays-law", "name": "Faraday's Law", "landmark": "city", "order": 12, "topic": "electromagnetism", "also": [] },
    { "slug": "faradays-electromagnetic-lab", "name": "Faraday's Electromagnetic Lab", "landmark": "city", "order": 13, "topic": "electromagnetism", "also": [] },
    { "slug": "generator", "name": "Generator", "landmark": "city", "order": 14, "topic": "electromagnetism", "also": ["mechanics"], "note": "The windmill. Where the city's power visibly comes from." },

    { "slug": "states-of-matter", "name": "States of Matter", "landmark": "molecular-assembly", "order": 8, "topic": "matter", "also": ["mechanics"] },
    { "slug": "states-of-matter-basics", "name": "States of Matter: Basics", "landmark": "molecular-assembly", "order": 8, "topic": "matter", "also": ["mechanics"], "variantOf": "states-of-matter", "variantKind": "basics" },
    { "slug": "gas-properties", "name": "Gas Properties", "landmark": "molecular-assembly", "order": 9, "topic": "matter", "also": ["mechanics"], "idleMotion": true },
    { "slug": "gases-intro", "name": "Gases Intro", "landmark": "molecular-assembly", "order": 9, "topic": "matter", "also": ["mechanics"], "variantOf": "gas-properties", "variantKind": "intro" },
    { "slug": "diffusion", "name": "Diffusion", "landmark": "molecular-assembly", "order": 10, "topic": "matter", "also": ["chance"], "idleMotion": true },
    { "slug": "concentration", "name": "Concentration", "landmark": "lab-corridor", "zone": "solutions", "order": 4, "topic": "matter", "also": [] },
    { "slug": "molarity", "name": "Molarity", "landmark": "lab-corridor", "zone": "solutions", "order": 5, "topic": "matter", "also": [] },
    { "slug": "ph-scale", "name": "pH Scale", "landmark": "lab-corridor", "zone": "solutions", "order": 6, "topic": "matter", "also": [] },
    { "slug": "ph-scale-basics", "name": "pH Scale: Basics", "landmark": "lab-corridor", "zone": "solutions", "order": 6, "topic": "matter", "also": [], "variantOf": "ph-scale", "variantKind": "basics" },
    { "slug": "acid-base-solutions", "name": "Acid-Base Solutions", "landmark": "lab-corridor", "zone": "solutions", "order": 7, "topic": "matter", "also": [] },
    { "slug": "beers-law-lab", "name": "Beer's Law Lab", "landmark": "lab-corridor", "zone": "spectrometry", "order": 8, "topic": "matter", "also": ["waves-light"], "note": "The room where the two big topics meet — light used as a ruler for matter." },
    { "slug": "normal-modes", "name": "Normal Modes", "landmark": "lab-corridor", "zone": "wave-bench", "order": 9, "topic": "waves-light", "also": ["mechanics"] },
    { "slug": "fourier-making-waves", "name": "Fourier: Making Waves", "landmark": "lab-corridor", "zone": "wave-bench", "order": 10, "topic": "waves-light", "also": [] },

    { "slug": "energy-forms-and-changes", "name": "Energy Forms and Changes", "landmark": "flatirons", "order": 1, "topic": "mechanics", "also": ["matter"], "note": "Campfire at the trailhead, under the slabs. Spans four scales conceptually — expect ghost nodes." },
    { "slug": "eating-exercise-and-energy", "name": "Eating, Exercise and Energy", "landmark": "flatirons", "order": 2, "topic": "life", "also": ["mechanics"], "note": "A hiker starting up the trail." , "phet": { "project": "eating-and-exercise", "sim": "eating-and-exercise", "kind": "legacy" } },
    { "slug": "natural-selection", "name": "Natural Selection", "landmark": "flatirons", "order": 3, "topic": "life", "also": ["chance"], "idleMotion": true, "note": "Rabbits in the scrub at the base." },

    { "slug": "greenhouse-effect", "name": "The Greenhouse Effect", "landmark": "atmosphere", "order": 1, "topic": "waves-light", "also": ["life"], "note": "The one sim at the top of the launch, and the only place on the route where you are inside the thing being simulated. Visible in the sky from every surface landmark; pairs downward with molecules-and-light." },

    { "slug": "gravity-and-orbits", "name": "Gravity and Orbits", "landmark": "orbit", "order": 1, "topic": "gravity", "also": [], "idleMotion": true },
    { "slug": "keplers-laws", "name": "Kepler's Laws", "landmark": "orbit", "order": 2, "topic": "gravity", "also": [] },
    { "slug": "my-solar-system", "name": "My Solar System", "landmark": "orbit", "order": 3, "topic": "gravity", "also": [], "idleMotion": true },

    { "slug": "blackbody-spectrum", "name": "Blackbody Spectrum", "landmark": "orbit", "order": 6, "topic": "waves-light", "also": ["matter"], "note": "Last of the route. Closes the light topic that began at color-vision, and points back down to photoelectric-effect." }
  ],

  "tools": {
    "note": "Not on the route. PhET files these under Math, but they are the toolkit for the mechanics sims. Surface as a side drawer available from any landmark.",
    "sims": [
      { "slug": "vector-addition", "name": "Vector Addition" },
      { "slug": "vector-addition-equations", "name": "Vector Addition: Equations" }
    ]
  },

  "excluded": {
    "math": [
      "area-builder", "area-model-algebra", "area-model-decimals", "area-model-introduction",
      "area-model-multiplication", "arithmetic", "build-a-fraction", "calculus-grapher",
      "center-and-variability", "curve-fitting", "equality-explorer", "equality-explorer-basics",
      "equality-explorer-two-variables", "estimation", "expression-exchange", "fraction-comparison",
      "fraction-matcher", "fractions-equality", "fractions-intro", "fractions-mixed-numbers",
      "function-builder", "function-builder-basics", "graphing-lines", "graphing-quadratics",
      "graphing-slope-intercept", "least-squares-regression", "make-a-ten", "mean-share-and-balance",
      "number-compare", "number-line-distance", "number-line-integers", "number-line-operations",
      "number-pairs", "number-play", "plinko-probability", "proportion-playground", "quadrilateral",
      "ratio-and-proportion", "trig-tour", "unit-rates"
    ],
    "dev": [
      "blast", "bumper", "chains", "description-demo", "example-sim",
      "interaction-dashboard", "phet-io-test-sim", "simula-rasa", "wilder"
    ],
    "deferred": [
      "projectile-data-lab", "projectile-sampling-distributions"
    ],
    "unpublished": [
      "xray-diffraction", "optics-lab", "circuit-construction-kit-black-box-study"
    ]
  }
};
