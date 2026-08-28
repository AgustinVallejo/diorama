// GENERATED from route.json by build-data.js - do not edit by hand.
window.ROUTE_DATA = {
  "meta": {
    "name": "PhET Route",
    "version": "0.1.0",
    "description": "A single continuous route through PhET simulations, from the nucleus to deep space, passing through human scale.",
    "simUrlTemplate": "https://phet.colorado.edu/sims/html/{slug}/latest/{slug}_en.html",
    "thumbUrlTemplate": "https://phet.colorado.edu/sims/html/{slug}/latest/{slug}-screenshot.png",
    "urlTemplatesVerified": false,
    "notes": [
      "Verify both URL templates against 3-4 slugs before building against them (Stage 0 task).",
      "Landmark order is the route. Sim order is within-landmark placement.",
      "A sim's scale is inherited from its landmark; it is not stored per-sim.",
      "Stage 1 pacing pass: The Foothills was merged into The Flatirons. An empty stop before the ascent read as a stall, not a breath. The three foothills sims now sit at the trailhead, at the base of the slabs; the hills survive as the rear parallax layer of that scene."
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
    { "id": "ascent",  "label": "The Large",  "landmarks": ["atmosphere", "orbit", "deep-space"] }
  ],

  "passages": [
    {
      "id": "waking",
      "label": "Out of the head",
      "from": "neural-tissue",
      "to": "beach",
      "note": "A neuron fires; pull back through dendrites, through tissue, out through the temple. The character is mid-throw with a frisbee. Bespoke animation, not a camera move."
    },
    {
      "id": "ascent",
      "label": "Off the summit",
      "from": "flatirons",
      "to": "atmosphere",
      "note": "Leave the rock and climb. Sky darkens from dusk to stars. Bespoke animation, not a camera move."
    }
  ],

  "landmarks": [
    { "id": "nucleus-core",       "order": 1,  "scale": "nucleus",   "label": "The Core",          "art": "abstract", "note": "Glow and particle work. Stays grey-box longest without looking broken." },
    { "id": "electron-shell",     "order": 2,  "scale": "atom",      "label": "The Shell",         "art": "abstract", "note": "Where classical physics starts to fail. Narrative hinge." },
    { "id": "molecular-assembly", "order": 3,  "scale": "molecule",  "label": "The Assembly",      "art": "abstract" },
    { "id": "neural-tissue",      "order": 4,  "scale": "cell",      "label": "Neural Tissue",     "art": "abstract", "note": "Exit point for the 'waking' passage." },

    { "id": "beach",       "order": 5,  "scale": "human", "label": "The Beach",       "art": "illustrated", "note": "Arrival point. Daylight. The character is here." },
    { "id": "lighthouse",  "order": 6,  "scale": "human", "label": "The Lighthouse",  "art": "illustrated", "note": "Beam enters the water at the base — bending-light lives on that boundary." },
    { "id": "playground",  "order": 7,  "scale": "human", "label": "The Playground",  "art": "illustrated" },
    { "id": "city",        "order": 8,  "scale": "human", "label": "The City",        "art": "illustrated", "note": "Densest landmark. charges-and-fields and coulombs-law are a toggleable invisible layer over the whole street, not objects." },
    { "id": "lab-corridor","order": 9,  "scale": "human", "label": "The Lab",         "art": "illustrated", "zones": ["gases", "solutions", "spectrometry", "wave-bench"], "note": "Doors on both sides, one topic per room. Every instrument aims DOWN a scale — this is where the vertical axis becomes something you operate rather than travel." },
    { "id": "flatirons",   "order": 10, "scale": "human", "label": "The Flatirons",   "art": "illustrated", "note": "Dusk. Trailhead at the base of the slabs, foothills behind it. Last ground before the ascent — the sims sit low and the rock does the breathing. Boulder easter egg." },

    { "id": "atmosphere",  "order": 11, "scale": "planetary", "label": "The Atmosphere", "art": "abstract" },
    { "id": "orbit",       "order": 12, "scale": "cosmic",    "label": "Orbit",          "art": "abstract" },
    { "id": "deep-space",  "order": 13, "scale": "cosmic",    "label": "Deep Space",     "art": "abstract", "note": "Terminus." }
  ],

  "sims": [
    { "slug": "build-a-nucleus", "name": "Build a Nucleus", "landmark": "nucleus-core", "order": 1, "topic": "matter", "also": [] },
    { "slug": "rutherford-scattering", "name": "Rutherford Scattering", "landmark": "nucleus-core", "order": 2, "topic": "matter", "also": ["mechanics"] },
    { "slug": "alpha-decay", "name": "Alpha Decay", "landmark": "nucleus-core", "order": 3, "topic": "chance", "also": ["matter"] },
    { "slug": "beta-decay", "name": "Beta Decay", "landmark": "nucleus-core", "order": 4, "topic": "chance", "also": ["matter"] },
    { "slug": "radioactive-dating", "name": "Radioactive Dating Game", "landmark": "nucleus-core", "order": 5, "topic": "chance", "also": ["matter"] },

    { "slug": "build-an-atom", "name": "Build an Atom", "landmark": "electron-shell", "order": 1, "topic": "matter", "also": [] },
    { "slug": "isotopes-and-atomic-mass", "name": "Isotopes and Atomic Mass", "landmark": "electron-shell", "order": 2, "topic": "matter", "also": [] },
    { "slug": "models-of-the-hydrogen-atom", "name": "Models of the Hydrogen Atom", "landmark": "electron-shell", "order": 3, "topic": "matter", "also": ["waves-light"] },
    { "slug": "photoelectric-effect", "name": "Photoelectric Effect", "landmark": "electron-shell", "order": 4, "topic": "waves-light", "also": ["electromagnetism"] },
    { "slug": "quantum-bound-states", "name": "Quantum Bound States", "landmark": "electron-shell", "order": 5, "topic": "matter", "also": ["waves-light"] },
    { "slug": "quantum-wave-interference", "name": "Quantum Wave Interference", "landmark": "electron-shell", "order": 6, "topic": "waves-light", "also": ["chance"] },
    { "slug": "quantum-measurement", "name": "Quantum Measurement", "landmark": "electron-shell", "order": 7, "topic": "chance", "also": ["waves-light"] },
    { "slug": "quantum-coin-toss", "name": "Quantum Coin Toss", "landmark": "electron-shell", "order": 8, "topic": "chance", "also": [] },
    { "slug": "xray-diffraction", "name": "X-Ray Diffraction", "landmark": "electron-shell", "order": 9, "topic": "waves-light", "also": ["matter"] },

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
    { "slug": "fluid-pressure-and-flow", "name": "Fluid Pressure and Flow", "landmark": "beach", "order": 8, "topic": "matter", "also": ["mechanics"] },

    { "slug": "bending-light", "name": "Bending Light", "landmark": "lighthouse", "order": 1, "topic": "waves-light", "also": [], "note": "Place at the waterline — the beam crossing into the sea is the physical boundary the sim is about." },
    { "slug": "geometric-optics", "name": "Geometric Optics", "landmark": "lighthouse", "order": 2, "topic": "waves-light", "also": [] },
    { "slug": "geometric-optics-basics", "name": "Geometric Optics: Basics", "landmark": "lighthouse", "order": 2, "topic": "waves-light", "also": [], "variantOf": "geometric-optics", "variantKind": "basics" },
    { "slug": "optics-lab", "name": "Optics Lab", "landmark": "lighthouse", "order": 3, "topic": "waves-light", "also": [] },
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
    { "slug": "gravity-force-lab", "name": "Gravity Force Lab", "landmark": "playground", "order": 10, "topic": "gravity", "also": [], "note": "Two heavy spheres someone left there. Start of the gravity topic tour." },
    { "slug": "gravity-force-lab-basics", "name": "Gravity Force Lab: Basics", "landmark": "playground", "order": 10, "topic": "gravity", "also": [], "variantOf": "gravity-force-lab", "variantKind": "basics" },

    { "slug": "balloons-and-static-electricity", "name": "Balloons and Static Electricity", "landmark": "city", "order": 1, "topic": "electromagnetism", "also": [], "note": "A kid's birthday party in a front yard." },
    { "slug": "john-travoltage", "name": "John Travoltage", "landmark": "city", "order": 2, "topic": "electromagnetism", "also": [], "note": "A doorknob." },
    { "slug": "coulombs-law", "name": "Coulomb's Law", "landmark": "city", "order": 3, "topic": "electromagnetism", "also": ["gravity"], "note": "Invisible layer over the street, not an object. Pairs with gravity-force-lab — same law, different constant." },
    { "slug": "charges-and-fields", "name": "Charges and Fields", "landmark": "city", "order": 4, "topic": "electromagnetism", "also": [], "note": "Invisible layer over the street, not an object." },
    { "slug": "capacitor-lab-basics", "name": "Capacitor Lab: Basics", "landmark": "city", "order": 5, "topic": "electromagnetism", "also": [], "note": "Named -basics but has no parent in this set. Standalone, not a variant." },
    { "slug": "ohms-law", "name": "Ohm's Law", "landmark": "city", "order": 6, "topic": "electromagnetism", "also": [] },
    { "slug": "resistance-in-a-wire", "name": "Resistance in a Wire", "landmark": "city", "order": 7, "topic": "electromagnetism", "also": ["matter"] },
    { "slug": "circuit-construction-kit-dc", "name": "Circuit Construction Kit: DC", "landmark": "city", "order": 8, "topic": "electromagnetism", "also": [] },
    { "slug": "circuit-construction-kit-dc-virtual-lab", "name": "CCK: DC — Virtual Lab", "landmark": "city", "order": 8, "topic": "electromagnetism", "also": [], "variantOf": "circuit-construction-kit-dc", "variantKind": "virtual-lab" },
    { "slug": "circuit-construction-kit-black-box-study", "name": "CCK: Black Box Study", "landmark": "city", "order": 8, "topic": "electromagnetism", "also": [], "variantOf": "circuit-construction-kit-dc", "variantKind": "black-box" },
    { "slug": "circuit-construction-kit-ac", "name": "Circuit Construction Kit: AC", "landmark": "city", "order": 9, "topic": "electromagnetism", "also": [] },
    { "slug": "circuit-construction-kit-ac-virtual-lab", "name": "CCK: AC — Virtual Lab", "landmark": "city", "order": 9, "topic": "electromagnetism", "also": [], "variantOf": "circuit-construction-kit-ac", "variantKind": "virtual-lab" },
    { "slug": "magnet-and-compass", "name": "Magnet and Compass", "landmark": "city", "order": 10, "topic": "electromagnetism", "also": [] },
    { "slug": "magnets-and-electromagnets", "name": "Magnets and Electromagnets", "landmark": "city", "order": 11, "topic": "electromagnetism", "also": [] },
    { "slug": "faradays-law", "name": "Faraday's Law", "landmark": "city", "order": 12, "topic": "electromagnetism", "also": [] },
    { "slug": "faradays-electromagnetic-lab", "name": "Faraday's Electromagnetic Lab", "landmark": "city", "order": 13, "topic": "electromagnetism", "also": [] },
    { "slug": "generator", "name": "Generator", "landmark": "city", "order": 14, "topic": "electromagnetism", "also": ["mechanics"], "note": "The windmill. Where the city's power visibly comes from." },

    { "slug": "states-of-matter", "name": "States of Matter", "landmark": "lab-corridor", "zone": "gases", "order": 1, "topic": "matter", "also": ["mechanics"] },
    { "slug": "states-of-matter-basics", "name": "States of Matter: Basics", "landmark": "lab-corridor", "zone": "gases", "order": 1, "topic": "matter", "also": ["mechanics"], "variantOf": "states-of-matter", "variantKind": "basics" },
    { "slug": "gas-properties", "name": "Gas Properties", "landmark": "lab-corridor", "zone": "gases", "order": 2, "topic": "matter", "also": ["mechanics"], "idleMotion": true },
    { "slug": "gases-intro", "name": "Gases Intro", "landmark": "lab-corridor", "zone": "gases", "order": 2, "topic": "matter", "also": ["mechanics"], "variantOf": "gas-properties", "variantKind": "intro" },
    { "slug": "diffusion", "name": "Diffusion", "landmark": "lab-corridor", "zone": "gases", "order": 3, "topic": "matter", "also": ["chance"], "idleMotion": true },
    { "slug": "concentration", "name": "Concentration", "landmark": "lab-corridor", "zone": "solutions", "order": 4, "topic": "matter", "also": [] },
    { "slug": "molarity", "name": "Molarity", "landmark": "lab-corridor", "zone": "solutions", "order": 5, "topic": "matter", "also": [] },
    { "slug": "ph-scale", "name": "pH Scale", "landmark": "lab-corridor", "zone": "solutions", "order": 6, "topic": "matter", "also": [] },
    { "slug": "ph-scale-basics", "name": "pH Scale: Basics", "landmark": "lab-corridor", "zone": "solutions", "order": 6, "topic": "matter", "also": [], "variantOf": "ph-scale", "variantKind": "basics" },
    { "slug": "acid-base-solutions", "name": "Acid-Base Solutions", "landmark": "lab-corridor", "zone": "solutions", "order": 7, "topic": "matter", "also": [] },
    { "slug": "beers-law-lab", "name": "Beer's Law Lab", "landmark": "lab-corridor", "zone": "spectrometry", "order": 8, "topic": "matter", "also": ["waves-light"], "note": "The room where the two big topics meet — light used as a ruler for matter." },
    { "slug": "normal-modes", "name": "Normal Modes", "landmark": "lab-corridor", "zone": "wave-bench", "order": 9, "topic": "waves-light", "also": ["mechanics"] },
    { "slug": "fourier-making-waves", "name": "Fourier: Making Waves", "landmark": "lab-corridor", "zone": "wave-bench", "order": 10, "topic": "waves-light", "also": [] },

    { "slug": "energy-forms-and-changes", "name": "Energy Forms and Changes", "landmark": "flatirons", "order": 1, "topic": "mechanics", "also": ["matter"], "note": "Campfire at the trailhead, under the slabs. Spans four scales conceptually — expect ghost nodes." },
    { "slug": "eating-exercise-and-energy", "name": "Eating, Exercise and Energy", "landmark": "flatirons", "order": 2, "topic": "life", "also": ["mechanics"], "note": "A hiker starting up the trail." },
    { "slug": "natural-selection", "name": "Natural Selection", "landmark": "flatirons", "order": 3, "topic": "life", "also": ["chance"], "idleMotion": true, "note": "Rabbits in the scrub at the base." },

    { "slug": "greenhouse-effect", "name": "The Greenhouse Effect", "landmark": "atmosphere", "order": 1, "topic": "waves-light", "also": ["life"], "note": "Visible in the sky from every surface landmark. Pairs downward with molecules-and-light." },

    { "slug": "gravity-and-orbits", "name": "Gravity and Orbits", "landmark": "orbit", "order": 1, "topic": "gravity", "also": [], "idleMotion": true },
    { "slug": "keplers-laws", "name": "Kepler's Laws", "landmark": "orbit", "order": 2, "topic": "gravity", "also": [] },
    { "slug": "my-solar-system", "name": "My Solar System", "landmark": "orbit", "order": 3, "topic": "gravity", "also": [], "idleMotion": true },

    { "slug": "blackbody-spectrum", "name": "Blackbody Spectrum", "landmark": "deep-space", "order": 1, "topic": "waves-light", "also": ["matter"], "note": "Terminus. Closes the light topic that began at color-vision, and points back down to photoelectric-effect." }
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
    ]
  }
};
