'use strict';
/* PhET Route.
   Discrete camera stops on a line. Zoom between scale bands, lateral pan across
   the human band. Landmarks are drawn in CSS; each sim is its own screenshot.

   Two things carry the feeling of depth, and both are cheap:
   per-scene parallax layers (far / mid / near), and a single light source that
   travels with the route — morning at the beach, sunset behind the Flatirons,
   stars by orbit. The day arc and the scale arc run together. */
(function () {

  // ---------------------------------------------------------------- constants
  var SCENE_W = 1200, SCENE_H = 700;   // world units per scene
  var PAN_UNIT = 1200;                 // scene units per lateral stop
  var CLIMB_UNIT = 940;                // scene units per vertical stop (the ascent)
  var ZOOM_STEP = 2.2;                 // log2 units per zoom stop (~4.6x)
  var GROUND_Y = 500;                  // ground line inside a surface scene

  /* Where a scene sits inside the NEXT one out, in that larger scene's own
     coordinates. Without an entry a scene is simply concentric with its parent.
     The beach entry is what makes the small scales live inside a person's head:
     the neural-tissue scene is pinned to the character's skull, so pulling back
     out of the neuron lands you looking at the character who was carrying it. */
  var NEST = {};                       // beach fills this in once it places its character

  /* Two sprite families, registered differently on their own canvases, so each
     needs its own numbers. Measured with getBBox in the browser:

       aspect - canvas w/h
       cx     - horizontal centre of the figure, as a fraction of canvas width
       feet   - where the soles land, as a fraction of canvas height
       body   - fraction of canvas height the figure occupies, so a requested
                height means the same thing for both families
       head   - head centre, as a fraction of canvas height

     Skaters fill their canvas edge to edge. Kickers stand in the left half of a
     235x322 board with air above the head, which is why cx is nowhere near .5. */
  var CHAR_KIND = {
    skater: {
      dir: 'assets/sprites/skater/', ext: '.png',
      aspect: 180 / 242, cx: 0.50, feet: 1.00, body: 1.00, head: 0.23,
      poses: ['Left', 'Right'],
      regions: [['africa', [1, 2, 3, 4, 5, 6]], ['asia', [1, 2, 3, 4, 5, 6]],
                ['latinAmerica', [1, 2, 3, 4, 5, 6]], ['oceania', [1, 2, 3, 4, 6]],
                ['usa', [1, 2, 3, 4, 5, 6]], ['africaModest', [6]]],
      name: function (region, n) { return region + 'Skater' + n; }
    },
    kicker: {
      dir: 'assets/sprites/kicker/', ext: '.svg',
      aspect: 235 / 322, cx: 0.271, feet: 0.958, body: 0.851, head: 0.18,
      poses: ['Standing', 'Standing', 'PoisedToKick'],
      regions: [['africa', [1, 2, 3, 4, 7, 11, 13, 14, 15]],
                ['africaModest', [1, 2, 3, 5, 7, 11, 13]],
                ['asia', [1, 2, 3, 4, 5, 6, 7, 9, 10, 11, 12, 13, 14, 15]],
                ['latinAmerica', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]],
                ['oceania', [1, 2, 6, 8, 11, 14]],
                ['usa', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]]],
      name: function (region, n) { return region + 'Kicker' + (n < 10 ? '0' + n : n); }
    }
  };
  var CAST = [];                           // both families in one list
  Object.keys(CHAR_KIND).forEach(function (k) {
    CHAR_KIND[k].regions.forEach(function (r) {
      r[1].forEach(function (n) {
        CAST.push({ kind: k, path: r[0] + '/' + CHAR_KIND[k].name(r[0], n) });
      });
    });
  });

  /* Where a sprite's head lands, given where its feet are and how tall it stands.
     The camera anchor and the beach scene must agree on this to the pixel, so it
     lives in one place rather than being written out twice. */
  function headY(kind, groundY, h) {
    var K = CHAR_KIND[kind], hc = h / K.body;
    return groundY - K.feet * hc + K.head * hc;
  }

  /* The one character the route is about. Declared up here because the camera
     keyframes need the head position before any scene is built. */
  var HERO = { kind: 'skater', x: 430, ground: GROUND_Y + 96, h: 156 };
  NEST.beach = { x: HERO.x, y: headY(HERO.kind, HERO.ground, HERO.h) };

  /* The system at Orbit. Up here with HERO for the same reason: the camera needs
     the blue planet's position before any scene is built, because the atmosphere
     is pinned to it. Radii are sized to fit inside the slot ring (SLOT_RX /
     SLOT_RY) so the sims sit around the picture rather than across it. Body
     diameters are on no scale at all and could not be — Earth drawn to the scale
     of its own orbit is a third of a pixel.

       r  orbit radius     d  diameter     a  angle round the ellipse */
  var SQUASH = 0.42;                          // orbits seen near their own plane
  var BODIES = [
    { r: 106, d: 20, cls: 'rocky',  a: 2.35 },
    { r: 151, d: 30, cls: 'cloudy', a: 0.62 },
    { r: 206, d: 48, cls: 'home',   a: 3.62 },   // the one you climbed off
    { r: 254, d: 25, cls: 'rusty',  a: 5.31 },
    { r: 319, d: 58, cls: 'giant',  a: 1.18 },
    // low and left: at 4.15 the ringed one sat behind the readout card, which is
    // the one part of the frame the HUD owns at every stop
    { r: 380, d: 46, cls: 'ringed', a: 2.55 }
  ];
  function bodyAt(b) {
    return { x: SCENE_W / 2 + Math.cos(b.a) * b.r,
             y: SCENE_H / 2 + Math.sin(b.a) * b.r * SQUASH };
  }
  /* The last move comes out of the planet rather than backing away from a frame.
     Same mechanism as the beach: the atmosphere is pinned to the blue body, so
     the sky you were standing in shrinks onto the world it belongs to while the
     system opens out around it. */
  var HOME = BODIES.filter(function (b) { return b.cls === 'home'; })[0];
  NEST.orbit = bodyAt(HOME);

  var TOPIC_COLOR = {
    matter: '#c084fc',
    'waves-light': '#fbbf24',
    electromagnetism: '#38bdf8',
    mechanics: '#34d399',
    gravity: '#f472b6',
    life: '#a3e635',
    chance: '#fb923c'
  };

  // sky: [zenith, horizon] per landmark, interpolated along the route
  var SKY = {
    'nucleus-core':       ['#050409', '#010103'],   // void. nothing in it but the nucleus
    'electron-shell':     ['#101f4d', '#05060f'],
    'molecular-assembly': ['#0b3038', '#04141a'],
    'neural-tissue':      ['#3a0f33', '#0d0410'],
    'beach':              ['#5fb6e8', '#dfeccb'],
    'lighthouse':         ['#74c0e6', '#d2e4d4'],
    'playground':         ['#8ecbe8', '#dbe7c8'],
    'city':               ['#93bad6', '#dcdcc8'],
    'lab-corridor':       ['#9fb0c0', '#e0d8c6'],
    'flatirons':          ['#43356a', '#ec9a58'],   // dusk: violet zenith, burning horizon
    'atmosphere':         ['#0c1330', '#3d5486'],   // the limb of the planet, seen from above
    'orbit':              ['#02030a', '#04060e']    // space, so the system reads
  };

  /* The light source. x/y are viewport percentages, r its radius in px, a its
     opacity, star the strength of the star field behind it. Read down the table
     and you get the day: sun climbing from the left across the ground band,
     setting behind the Flatirons, gone by orbit. */
  var LIGHT = {
    'nucleus-core':       { x: 50, y: 42, r: 40,  c: '#ffffff', a: 0,   star: 0 },
    'electron-shell':     { x: 50, y: 42, r: 40,  c: '#ffffff', a: 0,   star: .22 },
    'molecular-assembly': { x: 50, y: 42, r: 40,  c: '#ffffff', a: 0,   star: .30 },
    'neural-tissue':      { x: 50, y: 42, r: 40,  c: '#ffffff', a: 0,   star: .14 },
    'beach':              { x: 24, y: 17, r: 62,  c: '#fff7de', a: .95, star: 0 },
    'lighthouse':         { x: 37, y: 19, r: 64,  c: '#fff4d2', a: .90, star: 0 },
    'playground':         { x: 51, y: 15, r: 60,  c: '#fffbea', a: .95, star: 0 },
    'city':               { x: 65, y: 21, r: 64,  c: '#ffeec6', a: .78, star: 0 },
    'lab-corridor':       { x: 77, y: 31, r: 70,  c: '#ffe4b6', a: .32, star: 0 },
    'flatirons':          { x: 88, y: 66, r: 116, c: '#ff9a4e', a: .95, star: .22 },
    'atmosphere':         { x: 92, y: 92, r: 120, c: '#ff7a44', a: .60, star: .80 },
    // the scene draws its own sun, so the travelling light source is nearly out
    'orbit':              { x: 106, y: 94, r: 48, c: '#fff2d8', a: .18, star: 1 }
  };

  /* The abstract scales are not all the same kind of emptiness. The nucleus is a
     void with one object in it; the molecule band is a crowd of little assemblies;
     the atmosphere is sky with the ground gone; orbit is where the planet shows up. */
  var ABSTRACT = {
    'nucleus-core':       { core: 'nucleus' },
    // the same nucleus as the stop below, now small enough to be a detail, with
    // the shells drawn round it and an electron riding each one
    'electron-shell':     { rings: 4, glow: true, core: 'atom' },
    'molecular-assembly': { glow: true, core: 'molecules' },
    'neural-tissue':      { specks: 14, glow: true, core: 'neurons' },
    'atmosphere':         { core: 'none', thinAir: true },
    'orbit':              { core: 'none', system: true }
  };
  var ABSTRACT_DEFAULT = { rings: 4, specks: 24, glow: true, core: 'plain' };

  // where a landmark's sim slots hang, and how wide the rows run
  var SLOT = {
    beach:        { perRow: 4, y: GROUND_Y - 232 },
    lighthouse:   { perRow: 4, y: GROUND_Y - 250 },
    playground:   { perRow: 5, y: GROUND_Y - 286 },
    // Lower than it was. Two full rows of seven cover the sky from 66 to 1134 and
    // the HUD owns both edges, so the only clear sky in this scene is the strip
    // above the rows - which is where the turbine's rotor has to live.
    city:         { perRow: 7, y: GROUND_Y - 260 },
    // the sims sit low at the trailhead so the slabs and the dusk stay clear
    flatirons:    { perRow: 3, y: GROUND_Y - 112 }
  };
  var SLOT_DEFAULT = { perRow: 5, y: GROUND_Y - 250 };
  /* The ring an abstract scale hangs its slots on. Wide enough that at Orbit the
     boxes sit outside the outermost planet's path rather than across it: the
     inside of the ring is at SLOT_RX - SLOT_W/2 horizontally and SLOT_RY - SLOT_H/2
     vertically, and the system is sized to fit within that. */
  var SLOT_RX = 470, SLOT_RY = 272;
  /* A PhET screenshot is 600x394 and its icon is 128x84; both are 3:2 and change
     nothing but how much of the picture you can read. 144x96 is 1.2x the icon -
     enough that a sim is recognisable at a glance without the boxes starting to
     compete with the landscape they hang over. Every row width below was checked
     against SCENE_W at this size; if you scale it again, check them again. */
  var SLOT_W = 144, SLOT_H = 96, SLOT_GAP = 10, SLOT_ROW = 108;

  // ------------------------------------------------------------------- utils
  function el(tag, cls, style, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (style) n.setAttribute('style', style);
    if (text != null) n.textContent = text;
    return n;
  }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function smooth(v) { v = clamp(v, 0, 1); return v * v * (3 - 2 * v); }
  function hex(c) {
    return [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
  }
  function mixRGB(a, b, t) {
    var A = hex(a), B = hex(b);
    return [Math.round(lerp(A[0], B[0], t)), Math.round(lerp(A[1], B[1], t)),
      Math.round(lerp(A[2], B[2], t))];
  }
  function css(rgb, a) {
    return a == null ? 'rgb(' + rgb.join(',') + ')' : 'rgba(' + rgb.join(',') + ',' + a + ')';
  }
  // deterministic pseudo-random from a string + index
  function rnd(seed, i) {
    var h = 2166136261;
    var s = seed + ':' + i;
    for (var k = 0; k < s.length; k++) { h ^= s.charCodeAt(k); h = (h * 16777619) >>> 0; }
    return ((h >>> 8) % 10000) / 10000;
  }

  // ------------------------------------------------------------------- state
  var R, stops, exps, zis, W, scenes = [], scaleById = {}, sectionOf = {}, passages = [];
  var simCount = {};
  var progress = 0, targetP = 0, vel = 0, lastT = 0, snapTimer = null, settled = false;
  var dragged = false;                     // the last pointer gesture travelled
  var world, viewport, fit = 1;
  var humanFirst = 0, humanLast = 0;

  function boot(data) {
    R = data;
    stops = R.landmarks.slice().sort(function (a, b) { return a.order - b.order; });
    R.scales.forEach(function (s) { scaleById[s.id] = s; });
    R.sections.forEach(function (sec) {
      sec.landmarks.forEach(function (id) { sectionOf[id] = sec; });
    });
    R.sims.forEach(function (s) { simCount[s.landmark] = (simCount[s.landmark] || 0) + 1; });

    /* Camera keyframes in world units — units-at-exponent-zero, so one pair of
       numbers covers every scale. A scene at exponent E measures 2^E world units
       per one of its own, and a world displacement d lands on screen at d*2^-camE.

       Three kinds of move between stops:
         pan   - sideways, inside the human band.
         climb - straight up, through the ascent. You leave the Flatirons by
                 rising off it, not by backing away from it.
         nest  - the next scene is pinned to a point inside this one (the beach,
                 pinned to the neuron, which is why the head works). */
    exps = []; W = []; zis = [];
    stops.forEach(function (lm, i) {
      if (i === 0) { exps[0] = 0; zis[0] = 0; W[0] = { x: 0, y: 0 }; return; }
      var prev = stops[i - 1];
      /* A landmark may name its own move in the manifest; otherwise pan inside
         the human band and zoom everywhere else. Only the atmosphere names one,
         and it names "climb": leaving the Flatirons is a pure vertical launch
         with no zoom at all, so the rock drops out of frame and you are left in
         empty sky. The reveal is the NEXT move — orbit zooms out, and the thing
         you climbed off turns out to be a planet. */
      var move = lm.move || (prev.scale === 'human' && lm.scale === 'human' ? 'pan' : 'zoom');
      var pan = move === 'pan', climb = move === 'climb';
      /* A zoom edge may be shorter or longer than the default: orbit sets 1.2,
         because a full step out of the atmosphere made the planet feel like a
         retreat rather than an arrival. zis counts zoom EDGES, not octaves, so
         changing the magnitude of one edge does not change how neighbouring
         scenes fade — see the loop. */
      exps[i] = (pan || climb) ? exps[i - 1] : exps[i - 1] + (lm.zoom || ZOOM_STEP);
      /* A climb counts as a fade edge; a pan does not. Leaving the ground is the
         one move whose whole point is that the ground goes away, and the climb
         changes no exponent, so without this the entire human band sits at zero
         fade distance from the atmosphere and only the offset fade holds it back.
         That was enough while the camera stayed put, and stopped being enough the
         moment the pull back to Orbit started sliding sideways: two thirds of the
         way through it the city was back on screen, a sixth of its size, under
         the planet. Counting the climb puts the whole band a full edge away at
         the atmosphere and two away at Orbit. */
      zis[i] = zis[i - 1] + (pan ? 0 : 1);
      var u = Math.pow(2, exps[i - 1]);      // world units per unit of the lower scene
      W[i] = {
        x: W[i - 1].x + (pan ? PAN_UNIT * u : 0),
        y: W[i - 1].y - (climb ? CLIMB_UNIT * u : 0)
      };
      var nest = NEST[lm.id];
      if (nest) {                            // pin so that nest lands exactly on W[i-1]
        var v = Math.pow(2, exps[i]);
        W[i].x = W[i - 1].x - (nest.x - SCENE_W / 2) * v;
        W[i].y = W[i - 1].y - (nest.y - SCENE_H / 2) * v;
      }
    });

    W.forEach(function (w, i) {
      if (!isFinite(w.x) || !isFinite(w.y) || !isFinite(exps[i])) {
        throw new Error('camera keyframe ' + i + ' (' + stops[i].id + ') is not finite: ' +
          JSON.stringify({ x: w.x, y: w.y, exp: exps[i] }) +
          ' — check NEST anchors and the move rules');
      }
    });

    humanFirst = -1;
    stops.forEach(function (lm, i) {
      if (lm.scale !== 'human') return;
      if (humanFirst < 0) humanFirst = i;
      humanLast = i;
    });

    var idx = {};
    stops.forEach(function (lm, i) { idx[lm.id] = i; });
    passages = R.passages.map(function (p) {
      return { p: p, from: idx[p.from], to: idx[p.to] };
    });

    viewport = document.getElementById('viewport');
    world = document.getElementById('world');
    buildStars();
    buildScenes();
    buildHud();
    attachInput();
    onResize();
    window.addEventListener('resize', onResize);
    requestAnimationFrame(frame);
  }

  // -------------------------------------------------------------------- sky
  function buildStars() {
    var host = document.getElementById('stars');
    for (var i = 0; i < 170; i++) {
      var sz = 1 + rnd('star', i) * 1.5;
      host.appendChild(el('i', null, 'left:' + (rnd('sx', i) * 100).toFixed(2) + '%;top:' +
        (rnd('sy', i) * 100).toFixed(2) + '%;width:' + sz.toFixed(2) + 'px;height:' +
        sz.toFixed(2) + 'px;opacity:' + (0.35 + rnd('so', i) * 0.65).toFixed(2) + ';'));
    }
  }

  // ------------------------------------------------------------------ scenes
  function simsFor(id) {
    return R.sims.filter(function (s) { return s.landmark === id; })
      .sort(function (a, b) { return a.order - b.order; });
  }

  /* Where a sim's picture and its playable build live.

     A slug in the manifest is a PhET *repository* name, and for most sims that is
     also the published sim name, so both URLs fall out of the slug alone. Eight do
     not, and they carry a "phet" object in route.json: legacy Java sims whose
     project bundles several sims under one folder (nuclear-physics holds three of
     ours). Resolve through here rather than pasting a template — meta holds the
     same strings, and reality disagrees with them often enough that the manifest,
     not the code, is where an exception belongs.

     Every sim on the route has a build. The three repositories PhET never
     published are excluded in the manifest rather than placed and drawn as empty
     boxes, so there is no missing-build case to render.

     The thumbnail is local (assets/thumbs/, 240x158, a 2x copy of PhET's 600x394
     screenshot) so the route paints with no network at all. The remote 600 is the
     upgrade path for an expanded sim card, where the picture gets big enough
     that 240 would show. */
  var PHET = 'https://phet.colorado.edu/sims/';
  function assets(sim) {
    var p = sim.phet || {};
    var legacy = p.kind === 'legacy';
    var project = p.project || sim.slug, name = p.sim || sim.slug;
    return {
      thumb: 'assets/thumbs/' + sim.slug + '.png',
      thumbFull: legacy ? PHET + project + '/' + name + '-600.png'
        : PHET + 'html/' + project + '/latest/' + name + '-600.png',
      /* A CheerpJ build is per *project*, not per sim: one page loads the whole
         Java project and picks a sim out of it with ?simulation=. Three of ours
         come out of nuclear-physics that way. */
      run: legacy ? PHET + 'cheerpj/' + project + '/latest/' + project + '.html?simulation=' + name
        : PHET + 'html/' + project + '/latest/' + name + '_en.html'
    };
  }

  /* A slot is the sim's own screenshot, at the size PhET ships its icon in, with
     the labels on top of it rather than instead of it. The middle of the box stays
     clear on purpose — the picture is the identification now, and the caption is
     there for the pairs that look alike. Press t to drop the captions and read the
     route as pictures. */
  function simBox(sim, variants) {
    var color = TOPIC_COLOR[sim.topic] || '#94a3b8';
    var a = assets(sim);
    /* An anchor, not a div with a click handler. The sim opens in its own tab,
       which is also the whole answer to the modal-trap problem an in-page iframe
       would have had: nothing cross-origin ever gets between you and the route.
       Being a real link means middle-click, ctrl-click, and copy-link-address all
       work without any of it being written here. */
    var box = el('a', 'slot', 'border-left-color:' + color + ';');
    box.href = a.run;
    box.target = '_blank';
    box.rel = 'noopener noreferrer';
    box.title = sim.name + '  ·  ' + sim.slug + '  ·  opens at phet.colorado.edu';
    // a drag that happens to start on a slot is travel, not a click
    box.addEventListener('click', function (e) { if (dragged) e.preventDefault(); });

    var img = el('img', 'slot-thumb');
    img.src = a.thumb;
    img.alt = '';
    /* Not lazy. The whole set is local and the browser cannot judge visibility
       here anyway — a distant scene is a transformed, scaled-down layer that never
       intersects the viewport in the way an intersection test expects, so lazy
       either loads everything at boot regardless or pops a slot in halfway through
       a move. Load it up front and be done. */
    img.decoding = 'async';
    // a missing local file falls back to the CDN rather than leaving a hole
    img.onerror = function () { if (img.src !== a.thumbFull) img.src = a.thumbFull; };
    box.appendChild(img);

    // corner badges ride above the picture, clear of the caption along the bottom
    if (variants.length) {
      var vars = el('div', 'slot-vars');
      variants.forEach(function (v) {
        vars.appendChild(el('span', 'variant', null, v.variantKind));
      });
      box.appendChild(vars);
    }

    var cap = el('div', 'slot-cap');
    cap.appendChild(el('span', 'dot', 'background:' + color + ';'));
    (sim.also || []).forEach(function (t) {
      cap.appendChild(el('span', 'dot dot-sec', 'background:' + (TOPIC_COLOR[t] || '#64748b') + ';'));
    });
    cap.appendChild(el('span', 'slot-name', null, sim.name));
    box.appendChild(cap);
    return box;
  }

  /* Rows of slot boxes stacked upward from y. The bottom row drops a leader line
     to a peg on the ground, so a label reads as belonging to a place rather than
     floating in the sky. */
  function layoutRows(host, groups, opts) {
    var perRow = opts.perRow, x0 = opts.x, yBase = opts.y;
    var rows = [];
    for (var i = 0; i < groups.length; i += perRow) rows.push(groups.slice(i, i + perRow));
    rows.forEach(function (row, ri) {
      var y = yBase - (rows.length - 1 - ri) * SLOT_ROW;
      var totalW = row.length * SLOT_W + (row.length - 1) * SLOT_GAP;
      var sx = opts.center ? x0 - totalW / 2 : x0;
      row.forEach(function (g, ci) {
        var x = sx + ci * (SLOT_W + SLOT_GAP);
        var b = simBox(g.sim, g.variants);
        b.style.left = x + 'px';
        b.style.top = y + 'px';
        host.appendChild(b);
        if (ri === rows.length - 1 && opts.groundY != null) {
          var top = y + SLOT_H, h = opts.groundY - top;
          if (h > 4) {
            host.appendChild(el('div', 'leader', 'left:' + (x + SLOT_W / 2) + 'px;top:' +
              top + 'px;height:' + h + 'px;'));
            host.appendChild(el('div', 'peg', 'left:' + (x + SLOT_W / 2) + 'px;top:' +
              opts.groundY + 'px;'));
          }
        }
      });
    });
    return rows.length;
  }

  function groupSims(list) {
    var byslug = {}, groups = [];
    list.forEach(function (s) {
      if (!s.variantOf) { var g = { sim: s, variants: [] }; byslug[s.slug] = g; groups.push(g); }
    });
    list.forEach(function (s) {
      if (s.variantOf && byslug[s.variantOf]) byslug[s.variantOf].variants.push(s);
      else if (s.variantOf) groups.push({ sim: s, variants: [] });
    });
    return groups;
  }

  function depthLayers(host) {
    var L = {};
    ['far', 'mid', 'near'].forEach(function (k) {
      L[k] = el('div', 'layer layer-' + k);
      host.appendChild(L[k]);
    });
    return L;
  }
  function boxer(layer) {
    return function (x, y, w, h, cls, style) {
      var n = el('div', 'shape ' + (cls || ''), 'left:' + x + 'px;top:' + y + 'px;width:' +
        w + 'px;height:' + h + 'px;' + (style || ''));
      layer.appendChild(n);
      return n;
    };
  }
  // a hairline between two points, for perspective runs and trail switchbacks
  function line(layer, x1, y1, x2, y2, style) {
    var dx = x2 - x1, dy = y2 - y1;
    layer.appendChild(el('div', 'shape thin', 'left:' + x1 + 'px;top:' + y1 + 'px;width:' +
      Math.sqrt(dx * dx + dy * dy).toFixed(1) + 'px;height:1px;transform-origin:0 50%;' +
      'transform:rotate(' + (Math.atan2(dy, dx) * 180 / Math.PI).toFixed(2) + 'deg);' +
      (style || '')));
  }
  function groundBand(layer, y, style) {
    layer.appendChild(el('div', 'ground', 'top:' + y + 'px;height:' + (SCENE_H + 90 - y) +
      'px;' + (style || '')));
    layer.appendChild(el('div', 'horizon', 'top:' + y + 'px;'));
  }
  function hazeBand(layer, y) {
    layer.appendChild(el('div', 'haze', 'top:' + (y - 130) + 'px;'));
  }
  function foreBand(layer, y, ticks, seed) {
    layer.appendChild(el('div', 'fore', 'top:' + y + 'px;height:' + (SCENE_H + 110 - y) + 'px;'));
    if (!ticks) return;
    var b = boxer(layer);
    // spread past the scene edges: the near layer overshoots the camera by .42
    // of a pan unit, so ticks must exist well outside 0..SCENE_W
    ticks = Math.round(ticks * 2.2);
    for (var i = 0; i < ticks; i++) {
      var x = -900 + i * (3000 / ticks) + rnd(seed, i) * 22;
      var h = 12 + rnd(seed, i + 40) * 20;
      b(x, y - h, 2, h, 'thin', 'opacity:.4;transform:rotate(' +
        ((rnd(seed, i + 80) - .5) * 22).toFixed(1) + 'deg);');
    }
  }

  /* A mountain range as one clipped polygon: n peaks at irregular spacing, each
     with its own height and its own asymmetry, and a saddle dropped between
     neighbours. Everything comes from rnd(), so the range is the same range on
     every reload — a skyline that reshuffles reads as a bug, not as terrain. */
  function ridge(layer, seed, x, groundY, w, h, n, alpha) {
    var pts = [], i, fx, fh;
    for (i = 0; i <= n; i++) {
      // peak: x jittered off its slot, height between .45 and 1 of the budget
      fx = (i + (rnd(seed, i) - 0.5) * 0.55) / n;
      fh = 0.45 + rnd(seed, i + 40) * 0.55;
      if (i > 0) {                                   // saddle before this peak
        var sx = (i - 0.5 + (rnd(seed, i + 80) - 0.5) * 0.4) / n;
        var sh = fh * (0.30 + rnd(seed, i + 120) * 0.34);
        pts.push([sx * 100, (1 - sh) * 100]);
      }
      pts.push([clamp(fx, 0, 1) * 100, (1 - fh) * 100]);
    }
    pts.unshift([0, 100]);
    pts.push([100, 100]);
    var poly = pts.map(function (p) {
      return p[0].toFixed(2) + '% ' + p[1].toFixed(2) + '%';
    }).join(',');
    layer.appendChild(el('div', 'shape range', 'left:' + x + 'px;top:' + (groundY - h) +
      'px;width:' + w + 'px;height:' + h + 'px;opacity:' + alpha +
      ';clip-path:polygon(' + poly + ');'));
  }

  /* A forested shoulder: a dome of dark timber with conifers standing along its
     skyline. The trees go on the silhouette, not scattered over the face, because
     the only place a tree is legible against a mound of the same colour is where
     it breaks the edge. Sized in the same units as whatever it stands next to —
     these are meant to be the hill the rock comes out of, not scenery behind it. */
  function forestMound(layer, seed, x, groundY, w, h, tone) {
    var b = boxer(layer);
    b(x, groundY - h, w, h + 6, 'mound', 'opacity:' + tone + ';');
    var n = Math.round(w / 26);
    for (var i = 0; i < n; i++) {
      var u = (i + 0.5) / n;                        // 0..1 across the mound
      // height of the dome at u, for an ellipse capped at h
      var dome = h * Math.sqrt(Math.max(0, 1 - Math.pow((u - 0.5) * 2, 2)));
      var th = (13 + rnd(seed, i) * 17) * (0.6 + tone * 0.5);
      layer.appendChild(el('div', 'shape conifer', 'left:' +
        (x + u * w - th * 0.29).toFixed(1) + 'px;top:' +
        (groundY - dome - th * 0.72).toFixed(1) + 'px;width:' + (th * 0.58).toFixed(1) +
        'px;height:' + th.toFixed(1) + 'px;opacity:' + (tone * 0.95).toFixed(2) + ';'));
    }
  }

  function ball(layer, cls, x, y, d, style) {
    layer.appendChild(el('div', cls, 'left:' + (x - d / 2).toFixed(1) + 'px;top:' +
      (y - d / 2).toFixed(1) + 'px;width:' + d.toFixed(1) + 'px;height:' + d.toFixed(1) +
      'px;' + (style || '')));
  }

  /* A nucleus is a packed cluster of nucleons, not one smooth ball. Alternating
     tones stand in for protons and neutrons. */
  function nucleusCluster(layer, seed, cx, cy, k) {
    k = k || 1;
    var n = 13, d = 64 * k;
    for (var i = 0; i < n; i++) {
      var a = i * 2.399963;                      // golden angle, so it packs evenly
      var r = 48 * k * Math.sqrt(i / n);
      ball(layer, 'nucleon' + (i % 2 ? ' neutron' : ''),
        cx + Math.cos(a) * r, cy + Math.sin(a) * r, d,
        'z-index:' + (10 + Math.round(Math.sin(a) * 10)) + ';');
    }
  }

  /* One rung up from the nucleus: the same cluster, small, with the shells drawn
     round it and electrons sitting ON them rather than scattered. The point of
     the stop is that the electrons are in orbits, so nothing here is loose - a
     field of random specks said "particles somewhere" when the picture needed to
     say "particles bound to a shell". Shells fill outward the way real ones do,
     2 then 8, capped at four per ring so the frame stays readable.

     k is not a free parameter. It is exactly the scale the stop below renders at
     from here, so this cluster and that one land on the same pixels: identical
     object, identical size, identical position, and the crossfade between the two
     scenes is invisible. Pick k by eye instead and the transition dissolves one
     nucleus into a different-sized nucleus, which is what it used to do. If the
     nucleus wants to be bigger here, make it bigger in nucleusCluster - which
     makes it bigger at the stop below too, because it is the same object. */
  function atomShells(ringLayer, coreLayer, seed, cx, cy, rings, k) {
    nucleusCluster(coreLayer, seed, cx, cy, k);
    var perRing = [2, 4, 4, 3];
    for (var r = 0; r < rings; r++) {
      var rad = 110 + r * 75;                    // matches the ring radii below
      var n = perRing[r] || 3;
      for (var i = 0; i < n; i++) {
        var a = (i / n) * Math.PI * 2 + rnd(seed + 'e', r * 8 + i) * 1.4 + r * 0.7;
        ball(ringLayer, 'electron', cx + Math.cos(a) * rad, cy + Math.sin(a) * rad, 14);
      }
    }
  }

  /* Several small assemblies rather than one object: this is the band where
     things stop being single particles and start being structures. */
  function molecules(layer, seed) {
    var SHAPES = [
      [[0, 0, 54], [-46, 26, 34], [46, 26, 34]],                    // bent, like water
      [[0, 0, 50], [-52, 0, 32], [52, 0, 32]],                      // linear
      [[0, 0, 46], [-40, -30, 30], [40, -30, 30], [0, 48, 30]],     // tetrahedral-ish
      [[-26, 0, 44], [26, 0, 44]],                                  // diatomic
      [[0, -28, 42], [-38, 22, 36], [38, 22, 36], [0, 56, 28]]
    ];
    var spots = [[600, 350, 1.15], [268, 214, .72], [934, 250, .66],
                 [352, 508, .62], [880, 512, .78], [604, 128, .5]];
    spots.forEach(function (sp, i) {
      var shape = SHAPES[Math.floor(rnd(seed, i) * SHAPES.length) % SHAPES.length];
      var k = sp[2], rot = (rnd(seed, i + 31) - 0.5) * 60;
      var g = el('div', 'molecule', 'left:' + sp[0] + 'px;top:' + sp[1] +
        'px;transform:rotate(' + rot.toFixed(1) + 'deg);opacity:' +
        (0.5 + k * 0.5).toFixed(2) + ';');
      // bonds first, so the atoms sit on top of them
      for (var b = 1; b < shape.length; b++) {
        line(g, shape[0][0] * k, shape[0][1] * k, shape[b][0] * k, shape[b][1] * k,
          'height:' + (7 * k).toFixed(1) + 'px;opacity:.5;border-radius:4px;');
      }
      shape.forEach(function (at, ai) {
        ball(g, 'atom' + (ai ? ' atom-b' : ''), at[0] * k, at[1] * k, at[2] * k);
      });
      layer.appendChild(g);
    });
  }

  function neurite(w, o) {
    return 'height:' + w.toFixed(1) + 'px;border-radius:' + w.toFixed(1) +
      'px;background:rgba(186,214,255,.7);opacity:' + o + ';';
  }

  /* Cells, not a blob. A soma with dendrites fanning off it and one long axon
     ending in terminals — enough shape that the scale reads as tissue, and the
     centre one is what ends up at the character's temple during the passage. */
  function neurons(layer, seed) {
    var cells = [[600, 350, 1.00], [258, 206, 0.58], [946, 470, 0.66],
                 [872, 172, 0.46], [316, 536, 0.52], [640, 610, 0.40]];
    cells.forEach(function (c, i) {
      var k = c[2], soma = 58 * k;
      var g = el('div', 'neuron-cell', 'left:' + c[0] + 'px;top:' + c[1] +
        'px;opacity:' + (0.45 + k * 0.55).toFixed(2) + ';');
      var nd = 6;
      for (var d = 0; d < nd; d++) {
        var a = (d / nd) * Math.PI * 2 + rnd(seed, i * 17 + d) * 0.6;
        var len = (74 + rnd(seed, i * 17 + d + 40) * 56) * k;
        var x2 = Math.cos(a) * len, y2 = Math.sin(a) * len;
        line(g, Math.cos(a) * soma * 0.42, Math.sin(a) * soma * 0.42, x2, y2,
          neurite(4.4 * k, 0.6));
        var b = a + (rnd(seed, i * 17 + d + 80) - 0.5) * 1.3;   // one fork at the tip
        line(g, x2, y2, x2 + Math.cos(b) * len * 0.46, y2 + Math.sin(b) * len * 0.46,
          neurite(2.6 * k, 0.45));
      }
      var aa = rnd(seed, i + 211) * Math.PI * 2;                // the axon
      var alen = (210 + rnd(seed, i + 307) * 140) * k;
      var ax = Math.cos(aa) * alen, ay = Math.sin(aa) * alen * 0.7;
      line(g, 0, 0, ax, ay, neurite(5.2 * k, 0.55));
      for (var t = 0; t < 3; t++) {                             // terminals
        var ta = aa + (t - 1) * 0.5;
        line(g, ax, ay, ax + Math.cos(ta) * 48 * k, ay + Math.sin(ta) * 48 * k,
          neurite(3 * k, 0.5));
      }
      ball(g, 'soma', 0, 0, soma);
      layer.appendChild(g);
    });
  }

  /* Orbit. The sun holds the centre and the planets ride ellipses round it, all
     of them squashed to 0.42 so the frame reads as a system seen near its plane
     rather than as a set of concentric circles. Sizes are not to scale and could
     not be - Earth at the same scale as its orbit is a third of a pixel. */
  function systemScene(L, lm, cx, cy) {
    BODIES.forEach(function (b, i) {
      var rx = b.r, ry = b.r * SQUASH;
      L.far.appendChild(el('div', 'orbit-path', 'left:' + (cx - rx) + 'px;top:' +
        (cy - ry) + 'px;width:' + (rx * 2) + 'px;height:' + (ry * 2) + 'px;opacity:' +
        (0.34 - i * 0.03).toFixed(2) + ';'));
      var p = bodyAt(b), d = b.d;
      /* A ring passes behind its planet on the far side and in front on the near
         side. A single ellipse over the disc reads as a hoop lying on top of a
         circle, which is what it was; two halves of the same ellipse, one drawn
         before the ball and one after, put the planet inside its rings. */
      if (b.cls === 'ringed') {
        var rw = d * 2.3, rh = d * 0.68;
        var geom = 'left:' + (p.x - rw / 2).toFixed(1) + 'px;top:' + (p.y - rh / 2).toFixed(1) +
          'px;width:' + rw.toFixed(1) + 'px;height:' + rh.toFixed(1) + 'px;';
        L.mid.appendChild(el('div', 'body-ring ring-back', geom));
        ball(L.mid, 'body ' + b.cls, p.x, p.y, d);
        L.mid.appendChild(el('div', 'body-ring ring-front', geom));
      } else {
        ball(L.mid, 'body ' + b.cls, p.x, p.y, d);
        // the one you climbed off carries an atmosphere, because it is the thing
        // the previous stop was inside of
        if (b.cls === 'home') {
          L.mid.appendChild(el('div', 'home-air', 'left:' + (p.x - d) + 'px;top:' +
            (p.y - d) + 'px;width:' + (d * 2) + 'px;height:' + (d * 2) + 'px;'));
        }
      }
    });
    ball(L.mid, 'sun', cx, cy, 84);
    L.mid.appendChild(el('div', 'sun-corona', 'left:' + (cx - 86) + 'px;top:' +
      (cy - 86) + 'px;width:172px;height:172px;'));
  }

  function abstractScene(lm, host, groups, si) {
    var L = depthLayers(host);
    var A = ABSTRACT[lm.id] || ABSTRACT_DEFAULT;
    var cx = SCENE_W / 2, cy = SCENE_H / 2;

    for (var r = 0; r < (A.rings || 0); r++) {
      var d = 220 + r * 150;                     // radius 110 + r*75, see atomShells
      L.far.appendChild(el('div', 'ring', 'width:' + d + 'px;height:' + d + 'px;left:' +
        (cx - d / 2) + 'px;top:' + (cy - d / 2) + 'px;opacity:' + (0.5 - r * 0.09)));
    }
    for (var i = 0; i < (A.specks || 0); i++) {
      var a = rnd(lm.id, i) * Math.PI * 2, rad = 110 + rnd(lm.id, i + 99) * 370;
      var sz = 3 + rnd(lm.id, i + 7) * 7;
      L.far.appendChild(el('div', 'speck', 'width:' + sz + 'px;height:' + sz + 'px;left:' +
        (cx + Math.cos(a) * rad) + 'px;top:' + (cy + Math.sin(a) * rad * 0.55) + 'px;'));
    }
    if (A.glow) L.mid.appendChild(el('div', 'glow'));

    if (A.core === 'nucleus') {
      nucleusCluster(L.mid, lm.id, cx, cy);
    } else if (A.core === 'atom') {
      // the scale the stop below renders at from here — see atomShells
      var below = Math.pow(2, exps[si - 1] - exps[si]);
      atomShells(L.far, L.mid, lm.id, cx, cy, A.rings || 0, below);
    } else if (A.core === 'molecules') {
      molecules(L.mid, lm.id);
    } else if (A.core === 'neurons') {
      neurons(L.mid, lm.id);
    } else if (A.core !== 'none') {
      var core = 70 + (lm.order % 3) * 18;
      ball(L.mid, 'core', cx, cy, core);
    }

    // The last of the ground, seen from far above — and then it is gone.
    if (A.thinAir) {
      L.far.appendChild(el('div', 'limb-haze', 'left:-1400px;top:' + (SCENE_H - 60) +
        'px;width:4000px;height:340px;'));
      for (var t = 0; t < 40; t++) {
        L.far.appendChild(el('div', 'speck', 'width:2px;height:2px;left:' +
          (rnd(lm.id + 'air', t) * SCENE_W) + 'px;top:' +
          (rnd(lm.id + 'airy', t) * SCENE_H) + 'px;opacity:.35;'));
      }
    }
    // The reveal, pulled one step further: the thing you climbed off is a planet,
    // and it is one of several going round a star. The blue one is deliberately
    // the third out and the only one with a rim light - it is the one you left.
    if (A.system) systemScene(L, lm, cx, cy);

    /* Sim slots on a ring — unless there is only one, in which case it goes in
       the middle of the frame. A lone box out on the ellipse reads as the first
       of a set that failed to load. */
    var n = groups.length;
    if (n === 1) {
      var only = simBox(groups[0].sim, groups[0].variants);
      only.style.left = (SCENE_W / 2 - SLOT_W / 2) + 'px';
      only.style.top = (SCENE_H / 2 - SLOT_H / 2) + 'px';
      L.near.appendChild(only);
      return;
    }
    groups.forEach(function (g, i) {
      // offset off top-dead-centre: that band belongs to the plate
      var ang = -Math.PI / 2 + 0.55 + (i / Math.max(n, 1)) * Math.PI * 2;
      var b = simBox(g.sim, g.variants);
      b.style.left = (SCENE_W / 2 + Math.cos(ang) * SLOT_RX - SLOT_W / 2) + 'px';
      b.style.top = (SCENE_H / 2 + Math.sin(ang) * SLOT_RY - SLOT_H / 2) + 'px';
      L.near.appendChild(b);
    });
  }

  /* A PhET sprite standing on the ground at x, h units tall, from either family.
     Deterministic pick — a street that reshuffles itself on every refresh reads as
     a bug, not as life. opts.kind pins the family. */
  function character(seed, i, x, groundY, h, opts) {
    opts = opts || {};
    var pool = opts.kind
      ? CAST.filter(function (c) { return c.kind === opts.kind; })
      : CAST;
    var who = pool[Math.floor(rnd(seed, i) * pool.length) % pool.length];
    var K = CHAR_KIND[who.kind];
    var pose = K.poses[Math.floor(rnd(seed, i + 977) * K.poses.length) % K.poses.length];
    // scale the whole canvas so the figure inside it comes out h units tall
    var hc = h / K.body, wc = hc * K.aspect;
    return el('div', 'char', 'left:' + (x - K.cx * wc).toFixed(1) + 'px;top:' +
      (groundY - K.feet * hc).toFixed(1) + 'px;width:' + wc.toFixed(1) + 'px;height:' +
      hc.toFixed(1) + 'px;background-image:url("' +
      encodeURI(K.dir + who.path + pose + K.ext) + '");' + (opts.style || ''));
  }

  // ------------------------------------------------------- surface landmarks
  var BUILD = {};

  BUILD.beach = function (L, lm) {
    var f = boxer(L.far), m = boxer(L.mid), n = boxer(L.near);
    // the sand line IS where the hero stands; one number, not two
    var sea = GROUND_Y, sand = HERO.ground;
    hazeBand(L.far, sea);
    f(-1400, sea, 4000, sand - sea + 4, 'water');
    /* Swell. Water reads as water because of what moves across it, and with
       nothing moving here the next best thing is a lot of small parallel
       highlights at slightly different lengths and depths — a flat band with a
       colour on it reads as a painted stripe. They thin out towards the horizon
       (the ones nearest the top are shortest and faintest) so the strip has
       some depth in 46 units. */
    for (var w = 0; w < 46; w++) {
      var wt = rnd('swell', w);                      // 0 near horizon, 1 near shore
      var wy = sea + 5 + wt * (sand - sea - 16);
      var ww = 50 + wt * 190 + rnd('swellw', w) * 70;
      f(-900 + rnd('swellx', w) * 2900, wy, ww, 2.5 + wt * 4, 'swell',
        'opacity:' + (0.22 + wt * 0.55).toFixed(2) + ';');
    }
    f(-1400, sand - 13, 4000, 13, 'foam');         // the line the water breaks on
    f(-140, sea - 62, 360, 62, 'hill far-tone');
    f(980, sea - 44, 300, 44, 'hill far-tone');
    for (var i = 0; i < 5; i++) {
      f(240 + i * 160, sea - 150 - rnd('gull', i) * 90, 9, 2, 'thin', 'opacity:.5;');
    }
    groundBand(L.mid, sand,
      'background:linear-gradient(180deg,rgba(190,176,140,.62),rgba(84,78,62,.8));');
    m(-1400, sand, 4000, 10, 'thin', 'opacity:.22;');            // wet-sand line
    // The arrival. The neural-tissue scene is pinned to this sprite's head (see
    // NEST.beach), so the 'out of the head' passage is a camera move, not a cut.
    L.mid.appendChild(character('hero', 0, HERO.x, HERO.ground, HERO.h, { kind: HERO.kind }));
    var hy = headY(HERO.kind, HERO.ground, HERO.h);
    m(HERO.x + 96, hy + 30, 34, 10, 'outline', 'border-radius:50%;opacity:.85;');  // frisbee
    L.mid.appendChild(character('beachfolk', 3, 1010, sand, 104));
    foreBand(L.near, GROUND_Y + 176, 26, 'dune');
    /* A parasol, in the near layer so it is the one thing between you and the
       sea. It is also the only saturated colour on this beach, which is what
       makes the rest of it read as sand rather than as grey. */
    umbrella(L.near, 812, GROUND_Y + 186, 210);
    L.near.appendChild(character('beachfolk', 7, 250, GROUND_Y + 172, 150));
  };

  /* Pole, canopy, and the ellipse of shade it throws. The canopy is a half disc
     cut out of a conic gradient, which is the cheapest way to get the gores of a
     real parasol; a plain half circle reads as a mushroom. */
  function umbrella(layer, x, groundY, h) {
    var w = h * 1.15, cy = groundY - h;
    layer.appendChild(el('div', 'shade', 'left:' + (x - w * 0.42) + 'px;top:' +
      (groundY - 9) + 'px;width:' + (w * 0.84) + 'px;height:18px;'));
    layer.appendChild(el('div', 'shape pole', 'left:' + (x - 2.5) + 'px;top:' +
      (cy + 10) + 'px;width:5px;height:' + (h - 10) + 'px;'));
    layer.appendChild(el('div', 'canopy', 'left:' + (x - w / 2) + 'px;top:' + cy +
      'px;width:' + w + 'px;height:' + (w * 0.34) + 'px;'));
  }

  BUILD.lighthouse = function (L, lm) {
    var f = boxer(L.far), m = boxer(L.mid), n = boxer(L.near);
    var sea = GROUND_Y, rock = GROUND_Y + 62;
    hazeBand(L.far, sea);
    f(-1400, sea, 4000, 66, 'water');
    f(860, sea - 78, 420, 78, 'hill far-tone');
    groundBand(L.mid, rock);
    m(150, rock - 300, 58, 300, 'solid');
    m(138, rock - 334, 82, 34, 'solid');
    /* The beam. Three passes, because one flat wedge read as a pale triangle
       rather than as light: a wide soft spill, a brighter cone inside it, and a
       hard core down the middle. All three are narrow at the lens and widen out
       to sea, and all three fade along their length - the old wedge held one
       constant tint the whole way out, which is what made it read as a shape
       instead of as something being lit. The halo at the lens is what sells the
       source; without it the beam appears to start from nothing. */
    var lampY = rock - 328;
    L.mid.appendChild(el('div', 'beam beam-spill', 'left:214px;top:' + (lampY - 152) + 'px;'));
    L.mid.appendChild(el('div', 'beam beam-cone', 'left:214px;top:' + (lampY - 88) + 'px;'));
    L.mid.appendChild(el('div', 'beam beam-core', 'left:214px;top:' + (lampY - 34) + 'px;'));
    L.mid.appendChild(el('div', 'lamp-glow', 'left:92px;top:' + (lampY - 62) + 'px;'));
    m(0, rock - 12, 96, 12, 'solid', 'opacity:.7;');
    m(300, rock + 26, 300, 9, 'solid', 'opacity:.75;');            // jetty
    m(340, rock + 35, 8, 40, 'solid'); m(540, rock + 35, 8, 40, 'solid');
    /* Keepers and visitors. The rock and the jetty are the only flat ground in
       the scene, so they stand on those, and clear of the tower base where the
       lamp glow is brightest. */
    L.mid.appendChild(character('keeper', 1, 268, rock + 4, 104, { kind: 'kicker' }));
    L.mid.appendChild(character('keeper', 5, 452, rock + 26, 96));
    L.mid.appendChild(character('keeper', 8, 618, rock + 26, 92, { kind: 'kicker' }));
    L.far.appendChild(character('keeperfar', 2, 980, rock - 34, 54, { style: 'opacity:.5;' }));
    foreBand(L.near, GROUND_Y + 178, 12, 'kelp');
    n(-60, GROUND_Y + 122, 210, 90, 'rock');
    n(430, GROUND_Y + 150, 240, 92, 'rock');
    n(760, GROUND_Y + 128, 180, 74, 'rock');
    n(1040, GROUND_Y + 146, 220, 96, 'rock');
    L.near.appendChild(character('keeper', 12, 246, GROUND_Y + 196, 172));
  };

  BUILD.playground = function (L, lm) {
    var f = boxer(L.far), m = boxer(L.mid), n = boxer(L.near);
    hazeBand(L.far, GROUND_Y);
    for (var i = 0; i < 11; i++) {
      var w = 90 + rnd('tree', i) * 70, h = 90 + rnd('tree', i + 30) * 80;
      f(-300 + i * 168, GROUND_Y - h, w, h, 'tree far-tone');
    }
    groundBand(L.mid, GROUND_Y,
      'background:linear-gradient(180deg,rgba(96,124,84,.6),rgba(26,38,28,.8));');

    /* Each apparatus stands on its own baseline rather than all four on the
       horizon. Everything here is on one layer, so the only depth cue available
       is how far down the ground plane a thing sits — four objects sharing one y
       read as a shelf. Nearer ones sit lower and are drawn later, so they
       overlap what is behind them. */
    var gSwing = GROUND_Y - 18, gSpring = GROUND_Y - 6,
        gSee = GROUND_Y + 30, gBowl = GROUND_Y + 54;
    var g;

    // swings — pendulum-lab
    g = gSwing;
    m(40, g - 158, 11, 158, 'solid'); m(220, g - 158, 11, 158, 'solid');
    m(40, g - 166, 191, 10, 'solid');
    m(80, g - 156, 3, 92, 'thin'); m(150, g - 156, 3, 92, 'thin');
    m(74, g - 66, 16, 5, 'solid'); m(144, g - 66, 16, 5, 'solid');
    // a second pendulum on the same frame, swung out, with a round bob
    line(L.mid, 196, g - 156, 172, g - 74, 'height:2px;opacity:.7;');
    ball(L.mid, 'bob', 172, g - 68, 18);

    // spring stand — masses-and-springs, hookes-law
    g = gSpring;
    m(660, g - 150, 8, 150, 'solid'); m(800, g - 150, 8, 150, 'solid');
    m(654, g - 158, 154, 9, 'solid');
    m(692, g - 149, 22, 54, 'spring'); m(752, g - 149, 22, 76, 'spring');
    m(686, g - 95, 34, 24, 'solid', 'border-radius:3px;');   // hanging masses
    m(746, g - 73, 34, 24, 'solid', 'border-radius:3px;');

    // seesaw — balancing-act. One plank pivoting on the fulcrum, not two halves.
    g = gSee;
    m(310, g - 30, 40, 30, 'peak fulcrum');
    m(200, g - 42, 260, 8, 'solid', 'transform:rotate(-11deg);');
    ball(L.mid, 'bob', 208, g - 26, 24);          // the load sitting on the low end

    /* Skate bowl — energy-skate-park. It used to be a U-shaped outline sitting
       ON the ground, which read as a piece of string. A bowl is a hole, so this
       one is dug into the ground plane and hangs below it: deck either side,
       coping capping the rim, and a transition line inside so the wall has a
       surface for the eye to run down. */
    g = gBowl;
    var bx = 850, bw = 320;
    m(bx - 68, g - 9, 76, 9, 'solid', 'opacity:.85;');            // deck, left
    m(bx + bw - 8, g - 9, 76, 9, 'solid', 'opacity:.85;');        // deck, right
    m(bx, g - 4, bw, 130, 'bowl');
    m(bx - 12, g - 13, 32, 9, 'coping'); m(bx + bw - 20, g - 13, 32, 9, 'coping');
    L.mid.appendChild(el('div', 'bowl-line', 'left:' + (bx + 18) + 'px;top:' +
      (g + 8) + 'px;width:' + (bw - 36) + 'px;height:98px;'));
    L.mid.appendChild(character('skaters', 3, bx + 46, g + 100, 86, { kind: 'skater' }));

    /* People, spread over all three layers so the crowd gains depth from the
       parallax offsets rather than sitting on one flat plane. */
    [[96, gSwing + 8, 96], [500, gSee + 12, 104], [610, gSpring + 14, 92],
     [1116, gBowl - 6, 100]].forEach(function (p, k) {
      L.mid.appendChild(character('parkmid', k, p[0], p[1], p[2]));
    });
    [[-30, 58], [386, 54], [742, 60], [1180, 56]].forEach(function (p, k) {
      L.far.appendChild(character('parkfar', k, p[0], GROUND_Y - 4, p[1],
        { style: 'opacity:.5;' }));
    });

    foreBand(L.near, GROUND_Y + 172, 0);
    [250, 902].forEach(function (x, k) {
      L.near.appendChild(character('parknear', k, x, GROUND_Y + 198, 174));
    });
    for (var k = 0; k < 22; k++) n(-340 + k * 92, GROUND_Y + 118, 4, 56, 'thin', 'opacity:.38;');
    n(-1400, GROUND_Y + 112, 4000, 3, 'thin', 'opacity:.34;');                      // fence rail
  };

  /* A run of overhead cable between two poles. Two wires, each a div with only a
     bottom border and a tall elliptical radius, which is the cheapest honest
     catenary in flat CSS - a straight line between poles reads as a fence rail. */
  function cableRun(layer, x1, x2, y, sag, style) {
    var w = x2 - x1;
    [0, 7].forEach(function (dy, i) {
      layer.appendChild(el('div', 'cable', 'left:' + x1 + 'px;top:' + (y + dy) +
        'px;width:' + w + 'px;height:' + (sag + dy * 0.4) + 'px;' + (style || '')));
    });
  }

  BUILD.city = function (L, lm) {
    var f = boxer(L.far), m = boxer(L.mid), n = boxer(L.near);
    hazeBand(L.far, GROUND_Y);
    var fh = [140, 210, 170, 250, 190, 160, 230, 200, 150, 240, 180];
    for (var i = 0; i < fh.length; i++) f(-260 + i * 152, GROUND_Y - fh[i], 118, fh[i], 'building far-tone');
    /* A wind turbine past the end of the street: the generation end of the
       city, and the only thing in the scene that says where the current in all
       these circuits comes from. It turns, which makes it the one moving thing
       on the route - a single compositor transform on one element, so it costs
       nothing the camera would notice.

       It stands in the far layer, so it only reads if the mid skyline gets out
       of its way; the two blocks in front of it are deliberately short (see hs
       below) and the whole skyline steps down towards it. */
    /* Tall on purpose: the rotor has to clear the top slot row (which starts at
       GROUND_Y-260-SLOT_ROW) or it is simply behind a wall of sim boxes, and it
       has to stay left of x 1041 or it is behind the ruler. The mast runs down
       behind the buildings, which is what makes it read as standing beyond the
       far end of the street rather than floating over it. */
    var wx = 980, wtop = 16, blade = 84;
    f(wx - 5, wtop + 26, 10, GROUND_Y - wtop - 26, 'mast');
    f(wx - 12, wtop + 14, 24, 19, 'solid', 'border-radius:4px;');   // nacelle
    var hub = el('div', 'turbine', 'left:' + wx + 'px;top:' + (wtop + 24) + 'px;');
    for (var bl = 0; bl < 3; bl++) {
      hub.appendChild(el('div', 'blade', 'height:' + blade + 'px;transform:rotate(' +
        (bl * 120) + 'deg);'));
    }
    L.far.appendChild(hub);
    groundBand(L.mid, GROUND_Y,
      'background:linear-gradient(180deg,rgba(74,78,86,.7),rgba(22,25,30,.85));');
    // the last two are short so the turbine behind them is visible; the street
    // reads as stepping down out of downtown towards the power district
    var hs = [180, 300, 230, 380, 260, 320, 210, 150, 130];
    for (var j = 0; j < hs.length; j++) m(40 + j * 128, GROUND_Y - hs[j], 96, hs[j], 'building');
    m(1150, GROUND_Y - 260, 9, 260, 'solid');
    m(1136, GROUND_Y - 268, 38, 9, 'solid');
    /* Overhead cables, strung pole to pole down the street. The poles are in the
       mid layer with the buildings; the wires sag between them. */
    var poleY = GROUND_Y - 196;
    [-140, 200, 540, 880, 1220].forEach(function (px, k) {
      m(px - 4, poleY, 9, 196 + 24, 'solid', 'opacity:.9;');       // pole
      m(px - 34, poleY + 8, 68, 6, 'solid', 'opacity:.85;');       // crossarm
      if (k) cableRun(L.mid, px - 340, px, poleY + 12, 34);
    });
    L.mid.appendChild(el('div', 'field-layer', 'top:' + (GROUND_Y - 400) + 'px;height:400px;'));
    L.mid.appendChild(el('div', 'note-tag', 'left:14px;top:' + (GROUND_Y - 452) +
      'px;width:250px;line-height:1.55;',
      'coulombs-law + charges-and-fields: an invisible layer over the whole street, not objects'));
    // People on the sidewalk. Spread across all three layers so the crowd gains
    // depth from the parallax rather than sitting on one flat plane.
    [90, 335, 610, 880, 1120].forEach(function (x, k) {
      L.mid.appendChild(character('citymid', k, x, GROUND_Y + 4, 92 + rnd('cityh', k) * 22));
    });
    [-40, 470, 1240].forEach(function (x, k) {
      L.far.appendChild(character('cityfar', k, x, GROUND_Y - 2, 58 + rnd('cityfh', k) * 12,
        { style: 'opacity:.5;' }));
    });
    foreBand(L.near, GROUND_Y + 150, 0);
    n(-1400, GROUND_Y + 96, 4000, 4, 'thin', 'opacity:.4;');                        // curb
    n(180, GROUND_Y + 104, 200, 44, 'solid', 'border-radius:10px 16px 4px 4px;');  // parked car
    n(760, GROUND_Y + 108, 176, 40, 'solid', 'border-radius:10px 16px 4px 4px;');
    n(1090, GROUND_Y - 120, 8, 300, 'solid', 'opacity:.9;');                       // near lamp post
    [520, 990].forEach(function (x, k) {
      L.near.appendChild(character('citynear', k, x, GROUND_Y + 152, 168));
    });
  };

  /* Glassware and rigs, one set per lab zone. Small, but it is the difference
     between a corridor of doors and a corridor of doors that does chemistry. */
  function labKit(layer, zone, x, y) {
    var b = boxer(layer);
    if (zone === 'solutions') {                   // flask, beaker, test tubes
      b(x + 14, y - 46, 38, 46, 'flask');
      b(x + 22, y - 20, 22, 20, 'fill');
      b(x + 66, y - 34, 26, 34, 'glass');
      b(x + 68, y - 16, 22, 14, 'fill');
      for (var t = 0; t < 3; t++) b(x + 106 + t * 11, y - 30, 7, 30, 'glass');
      b(x + 102, y - 8, 36, 8, 'solid');          // rack
    } else if (zone === 'spectrometry') {         // source, slit, detector
      b(x + 12, y - 30, 26, 30, 'solid');
      b(x + 66, y - 34, 14, 34, 'glass');         // sample cuvette
      b(x + 68, y - 22, 10, 22, 'fill');
      b(x + 112, y - 30, 30, 30, 'solid');
      b(x + 38, y - 18, 28, 3, 'thin', 'opacity:.75;');   // the beam, crossing both
      b(x + 80, y - 18, 32, 3, 'thin', 'opacity:.75;');
    } else {                                      // wave-bench: a driven string
      b(x + 10, y - 40, 20, 40, 'solid');         // oscillator
      b(x + 128, y - 34, 14, 34, 'solid');        // far post
      layer.appendChild(el('div', 'shape wavelet', 'left:' + (x + 30) +
        'px;top:' + (y - 34) + 'px;width:98px;height:16px;'));
    }
  }

  /* The one interior. Everything lives in the mid layer on purpose: a back wall
     at a fixed distance does not parallax, and an opaque band wide enough to
     survive far-layer drift would black out the city you just walked out of.
     The depth here comes from the perspective run, not from layer offsets. */
  BUILD['lab-corridor'] = function (L, lm) {
    var m = boxer(L.mid);
    m(-30, -300, SCENE_W + 60, GROUND_Y + 300, 'interior');       // walls + ceiling
    for (var i = 0; i < 8; i++) m(46 + i * 148, 10, 108, 9, 'thin', 'opacity:.5;');
    m(-30, 40, SCENE_W + 60, 1, 'thin', 'opacity:.16;');          // ceiling / wall join
    m(-30, GROUND_Y - 170, SCENE_W + 60, 1, 'thin', 'opacity:.12;');  // dado line
    groundBand(L.mid, GROUND_Y,
      'background:linear-gradient(180deg,rgba(60,64,74,.96),rgba(26,29,35,.98));');
    // floor and ceiling running away to a vanishing point mid-frame
    [[-30, SCENE_H + 60, 480, GROUND_Y - 20], [1230, SCENE_H + 60, 720, GROUND_Y - 20],
     [-30, 48, 480, GROUND_Y - 300], [1230, 48, 720, GROUND_Y - 300]]
      .forEach(function (p) { line(L.mid, p[0], p[1], p[2], p[3], 'opacity:.22;'); });
    /* Door pitch follows the zone count. A door plus its bench is 282 wide, so
       290 is the floor; above that the doors spread to fill the corridor instead
       of bunching at the left end and leaving a third of the wall bare, which is
       what happened the moment the gases zone left for Molecular Scale. */
    var pitch = clamp((SCENE_W - 140) / Math.max((lm.zones || []).length, 1), 290, 380);
    /* People first, benches after. Drawn the other way round, anyone standing
       further down the corridor than a bench came out on top of it — feet at the
       bench's own height, in front of its legs, which reads as standing on the
       table. Nothing in here parallaxes, so the only depth cue is size and how
       far down the floor a body stands, and that cue only works if the paint
       order agrees with it. They stand in the gaps the benches and doors leave:
       roughly x 340..410, 700..765 and past 1050 at this pitch. */
    var gaps = [[366, 26, 112], [736, 74, 152], [1112, 14, 100], [118, 46, 128]];
    gaps.forEach(function (p, k) {
      L.mid.appendChild(character('labfolk', k, p[0], GROUND_Y + p[1], p[2],
        { kind: 'kicker' }));
    });
    (lm.zones || []).forEach(function (z, zi) {
      var x = 60 + zi * pitch;
      /* 74 rather than 100. The 2x2 block of zones above needs the wall clear
         down to GROUND_Y-126 to keep any air between its two bands, and a
         slightly short door on a far wall costs nothing. */
      m(x, GROUND_Y - 74, 118, 74, 'door');
      m(x + 104, GROUND_Y - 40, 8, 3, 'thin', 'opacity:.6;');     // handle
      L.mid.appendChild(el('div', 'zone-tag', 'left:' + x + 'px;top:' + (GROUND_Y + 12) + 'px;', z));
      // a bench outside each room, kitted for what happens inside it
      var bx = x + 132, by = GROUND_Y + 44;
      m(bx, by, 150, 7, 'solid');                                  // bench top
      m(bx + 6, by + 7, 6, 30, 'solid'); m(bx + 138, by + 7, 6, 30, 'solid');
      labKit(L.mid, z, bx, by);
    });
    m(-30, GROUND_Y + 6, SCENE_W + 60, 90, 'thin', 'opacity:.06;');   // floor sheen
    m(-34, GROUND_Y - 560, 58, 640, 'interior', 'opacity:1;');        // jambs frame the corridor
    m(1206, GROUND_Y - 560, 58, 640, 'interior', 'opacity:1;');
  };

  /* The Flatirons, after the merge. The old Foothills landmark folded in here:
     its hills are now the far layer, its three sims sit at the trailhead at the
     base of the slabs. The rock stays empty above the slot row — that is where
     the breath went, and it costs no stop. */
  BUILD.flatirons = function (L, lm) {
    var f = boxer(L.far), m = boxer(L.mid), n = boxer(L.near);
    hazeBand(L.far, GROUND_Y);
    // the old Foothills, now the far layer. They have to sit in the gaps beside
    // the slabs or the slabs simply eat them.
    f(-420, GROUND_Y - 176, 560, 176, 'hill far-tone');
    f(-80, GROUND_Y - 118, 300, 118, 'hill far-tone');
    f(930, GROUND_Y - 236, 520, 236, 'hill far-tone');
    f(1300, GROUND_Y - 150, 420, 150, 'hill far-tone');
    f(-1400, GROUND_Y - 3, 4000, 3, 'thin', 'opacity:.2;');
    /* The range behind the slabs — drawn first so the foothills sit in front of
       it. Three isoceles triangles read as a child's drawing of mountains, so
       this is a generated ridge line instead: asymmetric peaks at irregular
       spacing with a saddle between each pair. Two ranges at different opacity
       do the aerial perspective. */
    ridge(L.far, 'range-back', -420, GROUND_Y, 2100, 560, 9, 0.30);
    ridge(L.far, 'range-front', -300, GROUND_Y, 1900, 400, 7, 0.40);
    /* Conifers along the base of the range and up the near slope. They are the
       thing that gives the rock a size — a slab is just a shape until something
       tree-shaped stands next to it. */
    for (var c = 0; c < 26; c++) {
      var th = 34 + rnd('conif', c) * 40;
      f(-300 + c * 62 + rnd('conif', c + 60) * 34, GROUND_Y - th + 2,
        th * 0.62, th, 'conifer far-tone');
    }

    /* A green shoulder under the rock. In the photograph the slabs come out of
       a meadow, and the default dark band made them look like they were standing
       on tarmac. Warm because the sun is behind them and low. */
    groundBand(L.mid, GROUND_Y,
      'background:linear-gradient(180deg,rgba(112,132,74,.76),rgba(44,50,32,.88));');
    /* The hill the rock comes out of, in the SAME layer as the slabs and drawn
       just before them. The range used to live entirely in the far layer, which
       parallaxes separately and reads as a painted backdrop — the slabs stood in
       front of scenery instead of standing in it. These are at slab scale, they
       overlap the slabs, and the slabs' feet are buried in them. */
    [[-260, 620, 250, 0.62], [180, 780, 360, 0.78], [700, 700, 300, 0.70],
     [1120, 560, 220, 0.58]].forEach(function (mo, mi) {
      forestMound(L.mid, 'mound' + mi, mo[0], GROUND_Y + 12, mo[1], mo[2], mo[3]);
    });
    /* The slabs. They were rounded rectangles on a skew, which is not what a
       flatiron is: a flatiron is a slanting triangular face, wide at the bottom
       where it meets the hillside and coming to a point at the top, with the
       long dip-slope running up to the left and a short steep drop on the right.
       Each one is a clipped wedge rather than a box (see .slab). */
    /* Four of them, overlapping, and wide rather than pointy — height is only
       about 1.1x the base. Spaced out into a picket of five separate cones they
       read as a child's mountains, which is the same failure the old range had.
       Drawn right to left so the left-hand ones are nearest and cut across the
       big one behind, which is how they stack in the photograph, and hazed by
       depth so the far ones sit back. */
    var SLABS = [
      // x, base width, height, where the apex sits along the top, haze
      [780, 270, 230, 0.80, 0.34],
      [540, 390, 320, 0.83, 0.20],
      [240, 470, 400, 0.85, 0.08],
      [ 40, 390, 280, 0.80, 0.00]
    ];
    SLABS.forEach(function (s, i) {
      var x = s[0], w = s[1], h = s[2], apex = s[3];
      var y = GROUND_Y - h + 18;                   // the foot is buried in the slope
      /* The summit is a short edge, not a point. A single vertex reads as a cone
         however good the profile below it is, and these are slabs. */
      var g = el('div', 'shape slab', 'left:' + x + 'px;top:' + y + 'px;width:' + w +
        'px;height:' + h + 'px;--a1:' + ((apex - 0.07) * 100).toFixed(0) + '%;--a2:' +
        (apex * 100).toFixed(0) + '%;--haze:' + s[4] + ';');
      // bedding planes running up the face, the way the sandstone is layered
      for (var b = 1; b < 4; b++) {
        g.appendChild(el('div', 'bed', 'top:' + (18 + b * 20 + rnd('bed', i * 7 + b) * 34) + '%;'));
      }
      L.mid.appendChild(g);
    });
    /* Pines at the foot of the slabs, in front of the rock. This is the whole
       reason the slabs read as huge: dark conifer shapes at a known size, right
       where the rock meets the ground. */
    for (var p = 0; p < 22; p++) {
      var ph = 40 + rnd('pine', p) * 52;
      m(-120 + p * 62 + rnd('pine', p + 30) * 30, GROUND_Y - ph + 10,
        ph * 0.58, ph, 'conifer', 'opacity:.9;');
    }
    // trailhead: campfire, hiker, scrub, rabbits — all on the open ground plane
    for (var i = 0; i < 7; i++) {
      var a = (i / 7) * Math.PI * 2;
      m(196 + Math.cos(a) * 28, GROUND_Y + 104 + Math.sin(a) * 11, 12, 8, 'solid',
        'border-radius:50%;opacity:.8;');
    }
    L.mid.appendChild(el('div', 'shape fire', 'left:178px;top:' + (GROUND_Y + 72) +
      'px;width:38px;height:38px;'));
    L.mid.appendChild(character('trailhead', 1, 298, GROUND_Y + 40, 116, { kind: 'kicker' }));
    // a stand of trees at the trailhead, at ground scale rather than range scale
    [[70, 86], [1064, 104], [1148, 74]].forEach(function (p, i) {
      m(p[0], GROUND_Y + 30 - p[1], p[1] * 0.6, p[1], 'conifer');
    });
    m(830, GROUND_Y + 34, 92, 38, 'scrub'); m(960, GROUND_Y + 46, 68, 30, 'scrub');
    m(866, GROUND_Y + 30, 14, 10, 'solid', 'border-radius:50%;');   // rabbit
    m(880, GROUND_Y + 22, 4, 9, 'thin');                            // ear
    m(982, GROUND_Y + 42, 13, 9, 'solid', 'border-radius:50%;');
    // more people at the trailhead — it is the last ground, it should feel used
    // clear of 410..790, which is where the slot row hangs — a head behind a
    // sim label reads as a glitch rather than as a person
    L.mid.appendChild(character('trailhead', 4, 906, GROUND_Y + 30, 104, { kind: 'kicker' }));
    L.mid.appendChild(character('trailhead', 9, 168, GROUND_Y + 74, 96));

    foreBand(L.near, GROUND_Y + 176, 0);
    // scrub, not tally marks: the straight ticks read as marks on the ground
    for (var b = 0; b < 9; b++) {
      n(-260 + b * 190 + rnd('sage', b) * 60, GROUND_Y + 150 + rnd('sage', b + 20) * 26,
        44 + rnd('sage', b + 40) * 34, 20 + rnd('sage', b + 60) * 12, 'scrub');
    }
    n(-210, GROUND_Y + 108, 250, 126, 'rock');                      // the boulder easter egg
    n(1030, GROUND_Y + 122, 210, 104, 'rock');
    L.near.appendChild(character('trailhead', 12, 470, GROUND_Y + 196, 176));
    n(636, GROUND_Y + 104, 5, 66, 'solid');                         // trail sign
    n(618, GROUND_Y + 98, 62, 14, 'solid', 'border-radius:2px;');
    L.near.appendChild(el('div', 'note-tag', 'left:694px;top:' + (GROUND_Y + 100) + 'px;',
      'trailhead — the ascent passage starts here'));
  };

  function surfaceScene(lm, host, groups) {
    var L = depthLayers(host);
    (BUILD[lm.id] || function () { groundBand(L.mid, GROUND_Y); })(L, lm);

    if (!groups.length) return;
    if (lm.id === 'lab-corridor') {
      /* Four zones in a 2x2 block rather than four stacked rows. Stacked, the
         zones read as one long list and the corridor behind them disappears;
         quartered, each zone is a group you take in at once and the wall stays
         visible between them. Every zone lays out in a single row, so its perRow
         is however many sims it holds - the quadrant is the unit here, not the
         row width. The right column is placed from its own width so the widest
         zone (solutions, four sims) still lands inside the scene. */
      var zones = lm.zones || [];
      /* Zones fill a 2x2 block, each one a single row of however many sims it
         holds. Three constraints shape it, all of them the HUD or the wall:

         - The readout card owns everything above y 170 out to x 454 at a 1000x600
           window, and the ruler everything past x 1041, so the whole block sits
           below the readout and between those two edges. That is the worst case,
           not the typical one: the HUD is a fixed size in screen pixels, so it
           swallows fewer scene units the larger the window gets.
         - The two bands are pushed as far apart as the scene allows. Packed tight
           they read as one block of boxes rather than as separate groups, and the
           labels alone were not enough to separate them. The doors below shrank
           to 74 units to pay for the gap.
         - The left column is flush with the scene edge and the right column is
           flush with the ruler. Right-aligning that column rather than starting
           it at a fixed x is what keeps the frame filled when a zone is narrow:
           with one sim in spectrometry, a left-aligned right column left the last
           third of the corridor empty. */
      var LEFT = 10, RIGHT = 1030, ROW_Y = [GROUND_Y - 311, GROUND_Y - 170];
      zones.slice(0, 4).forEach(function (z, zi) {
        var g = groups.filter(function (x) { return x.sim.zone === z; });
        if (!g.length) return;
        var w = g.length * SLOT_W + (g.length - 1) * SLOT_GAP;
        var y = ROW_Y[zi >> 1], x = (zi & 1) ? RIGHT - w : LEFT;
        L.mid.appendChild(el('div', 'zone-label', 'left:' + x + 'px;top:' +
          (y - 17) + 'px;', z));
        layoutRows(L.mid, g, { perRow: g.length, x: x, y: y, center: false });
      });
      return;
    }
    var cfg = SLOT[lm.id] || SLOT_DEFAULT;
    layoutRows(L.near, groups, {
      perRow: cfg.perRow, x: SCENE_W / 2, y: cfg.y, center: true,
      groundY: GROUND_Y
    });
  }

  function buildScenes() {
    stops.forEach(function (lm, i) {
      var sc = el('div', 'scene', 'width:' + SCENE_W + 'px;height:' + SCENE_H + 'px;margin-left:' +
        (-SCENE_W / 2) + 'px;margin-top:' + (-SCENE_H / 2) + 'px;');
      sc.appendChild(el('div', 'scene-frame'));
      var groups = groupSims(simsFor(lm.id));
      if (lm.scale === 'human') surfaceScene(lm, sc, groups); else abstractScene(lm, sc, groups, i);

      var plate = el('div', 'plate', 'top:26px;');
      plate.appendChild(el('div', 'plate-rule'));
      plate.appendChild(el('div', 'plate-label', null, lm.label));
      sc.appendChild(plate);

      world.appendChild(sc);
      scenes.push({ lm: lm, node: sc, exp: exps[i], zi: zis[i], w: W[i], shown: true });
    });
  }

  // --------------------------------------------------------------------- hud
  var hud = {};
  function buildHud() {
    hud.landmark = document.getElementById('h-landmark');
    hud.section = document.getElementById('h-section');
    hud.scale = document.getElementById('h-scale');
    hud.count = document.getElementById('h-count');
    hud.tint = document.getElementById('passage-tint');
    hud.sky = document.getElementById('sky');
    hud.stars = document.getElementById('stars');
    hud.sun = document.getElementById('celestial');

    var ruler = document.getElementById('ruler');
    hud.ticks = [];
    R.scales.slice().reverse().forEach(function (s) {
      var t = el('div', 'tick');
      t.appendChild(el('span', 'tick-dash'));
      t.appendChild(el('span', 'tick-label', null, s.label));
      ruler.appendChild(t);
      hud.ticks.push({ id: s.id, node: t });
    });
    hud.marker = el('div', 'ruler-marker');
    ruler.appendChild(hud.marker);

    // lateral sub-track: the human band is six stops on one rung of the ruler
    hud.lat = document.getElementById('lat');
    hud.latFill = document.getElementById('lat-fill');
    ruler.appendChild(hud.lat);
    var humanTick = hud.ticks.filter(function (t) { return t.id === 'human'; })[0];
    if (humanTick) hud.lat.style.top = (humanTick.node.offsetTop + humanTick.node.offsetHeight + 7) + 'px';

    var legend = document.getElementById('legend');
    R.topics.forEach(function (t) {
      var n = R.sims.filter(function (s) { return s.topic === t.id && !s.variantOf; }).length;
      var row = el('div');
      row.appendChild(el('span', 'sw', 'background:' + (TOPIC_COLOR[t.id] || '#94a3b8') + ';'));
      row.appendChild(el('span', null, null, t.label));
      row.appendChild(el('span', 'n', null, String(n)));
      legend.appendChild(row);
    });

    var dots = document.getElementById('dots');
    var prevSection = null;
    hud.dots = stops.map(function (lm, i) {
      var sec = sectionOf[lm.id] ? sectionOf[lm.id].id : '';
      var d = el('button', 'dot-stop' + (prevSection && sec !== prevSection ? ' gap' : ''));
      prevSection = sec;
      d.title = lm.label;
      d.appendChild(el('span', 'dot-mark'));
      d.appendChild(el('span', 'dot-name', null, lm.label));
      d.addEventListener('click', function () { goTo(i); });
      dots.appendChild(d);
      return d;
    });
  }

  // The readout only changes when the nearest stop does; the exponent only when
  // it rounds to a new tenth. No reason to rewrite either 60 times a second.
  var hudStop = -1, hudExp = null;

  function updateHud() {
    var i = clamp(Math.round(progress), 0, stops.length - 1);
    var lm = stops[i];
    if (i !== hudStop) {
      hudStop = i;
      hud.landmark.textContent = lm.label;
      hud.section.textContent = (sectionOf[lm.id] ? sectionOf[lm.id].label : '') +
        ' · stop ' + (i + 1) + '/' + stops.length;
      var n = simCount[lm.id] || 0;
      hud.count.textContent = n + (n === 1 ? ' sim' : ' sims');
    }

    var lo = clamp(Math.floor(progress), 0, stops.length - 1), hi = clamp(lo + 1, 0, stops.length - 1);
    var f = clamp(progress - lo, 0, 1);
    var e1 = Math.log(scaleById[stops[lo].scale].approxMeters) / Math.LN10;
    var e2 = Math.log(scaleById[stops[hi].scale].approxMeters) / Math.LN10;
    var ex = Math.round(lerp(e1, e2, f) * 10) / 10;
    if (ex !== hudExp) { hudExp = ex; hud.scale.innerHTML = '10<sup>' + ex + '</sup> m'; }

    var order = R.scales.map(function (s) { return s.id; });
    var p = lerp(order.indexOf(stops[lo].scale), order.indexOf(stops[hi].scale), f);
    hud.marker.style.top = ((1 - p / (order.length - 1)) * 100) + '%';
    hud.ticks.forEach(function (t) { t.node.classList.toggle('on', t.id === lm.scale); });

    // lateral track, only while the human band is in play
    var span = Math.max(humanLast - humanFirst, 1);
    var lt = (progress - humanFirst) / span;
    hud.lat.style.opacity = smooth((1.18 - Math.abs(lt - 0.5) * 2) / 0.5).toFixed(3);
    hud.latFill.style.width = (clamp(lt, 0, 1) * 100).toFixed(1) + '%';

    hud.dots.forEach(function (d, k) {
      d.classList.toggle('on', k === i);
      d.classList.toggle('near', Math.abs(k - progress) < 1.3);
    });

    var best = null;
    passages.forEach(function (pg) {
      var a = Math.min(pg.from, pg.to), b = Math.max(pg.from, pg.to);
      if (progress > a && progress < b) {
        var t = (progress - a) / (b - a);
        var alpha = smooth(Math.sin(t * Math.PI) * 1.7);
        if (!best || alpha > best.alpha) best = { pg: pg, alpha: alpha };
      }
    });
    /* No banner: a passage does not announce itself. What survives is the tint
       and --passage, which fades the scene's own labels out underneath it — the
       one moment the sim names are irrelevant is the one moment they would be
       covering the picture. */
    if (best) {
      document.body.style.setProperty('--passage', best.alpha.toFixed(3));
      hud.tint.style.opacity = best.alpha * 0.32;
    } else {
      hud.tint.style.opacity = 0;
      document.body.style.setProperty('--passage', '0');
    }
  }

  // --------------------------------------------------------------- sky + sun
  function paintSky(lo, hi, f) {
    var A = SKY[stops[lo].id], B = SKY[stops[hi].id];
    var top = mixRGB(A[0], B[0], f), bot = mixRGB(A[1], B[1], f);
    hud.sky.style.background = 'linear-gradient(180deg,' + css(top) + ' 0%,' + css(bot) + ' 100%)';

    var P = LIGHT[stops[lo].id], Q = LIGHT[stops[hi].id];
    var r = lerp(P.r, Q.r, f), a = lerp(P.a, Q.a, f);
    var c = mixRGB(P.c, Q.c, f);
    var s = hud.sun.style;
    s.opacity = a.toFixed(3);
    if (a > 0.004) {
      s.left = lerp(P.x, Q.x, f).toFixed(2) + '%';
      s.top = lerp(P.y, Q.y, f).toFixed(2) + '%';
      s.width = s.height = (r * 2).toFixed(1) + 'px';
      s.background = 'radial-gradient(circle,' + css(c) + ' 0 34%,' + css(c, .42) + ' 48%,' +
        css(c, 0) + ' 72%)';
      s.boxShadow = '0 0 ' + (r * 2.6).toFixed(0) + 'px ' + (r * 1.1).toFixed(0) + 'px ' +
        css(c, .16);
    }
    hud.stars.style.opacity = lerp(P.star, Q.star, f).toFixed(3);
  }

  // -------------------------------------------------------------------- loop
  /* Most edges are one move: zoom and travel together and it reads as one
     gesture. A nested edge is two, and running them together ruins it. Coming
     out of the head, the camera has to end up looking at the middle of a beach,
     which is off to one side of the character — do that while zooming and the
     neuron field slides into a corner and shrinks, and the one thing the whole
     passage exists to show, that the small scales were inside a person, never
     lands in front of you.

     A landmark can name a "hold": the fraction of the edge spent on the zoom
     alone, with the camera pinned to where it already was, before any travel
     starts. Zoom out of the neurons with the head dead centre; then, with the
     scale settled, pan off the head into the beach. Each half is eased on its
     own so the handover is a pause rather than a corner.

     The fade tracks the zoom half, not the clock, so the neuron scene is gone by
     the time the pan begins. */
  function camera() {
    var lo = clamp(Math.floor(progress), 0, stops.length - 1);
    var hi = clamp(lo + 1, 0, stops.length - 1);
    var f = clamp(progress - lo, 0, 1);
    var hold = stops[hi].hold || 0;
    var fz = f, fp = f;
    if (hold > 0 && hold < 1) {
      fz = smooth(f / hold);
      fp = smooth((f - hold) / (1 - hold));
    }
    return {
      E: lerp(exps[lo], exps[hi], fz),
      z: lerp(zis[lo], zis[hi], fz),
      x: lerp(W[lo].x, W[hi].x, fp),
      y: lerp(W[lo].y, W[hi].y, fp)
    };
  }

  /* How long the edge you are currently on takes to settle.

     The spring is linear, so settle time does not depend on how far you are
     travelling - every edge takes the same time whatever its magnitude. That is
     right for almost all of them and wrong for exactly one: coming out of the
     head has to be slower than a zoom between two abstract scales, or it reads
     as one. A landmark can name a "pace" in the manifest and the edge INTO it
     stretches by that factor (stiffness goes as 1/pace^2, damping as 1/pace, so
     the motion keeps its shape and only its clock changes).

     The edge is named by the landmark you are arriving at, which is also how
     move and zoom are named, so going backwards has to look the other way at a
     stop boundary or leaving the beach would borrow the lighthouse's pace. */
  function edgePace() {
    var base = targetP < progress ? Math.ceil(progress) - 1 : Math.floor(progress);
    var i = clamp(base + 1, 1, stops.length - 1);
    return stops[i].pace || 1;
  }

  function frame(t) {
    var dt = lastT ? Math.min((t - lastT) / 1000, 0.05) : 0.016;
    lastT = t;
    var pace = edgePace();
    var k = 42 / (pace * pace), c = 2 * Math.sqrt(42) * 0.92 / pace;
    vel += (k * (targetP - progress) - c * vel) * dt;
    progress += vel * dt;
    if (Math.abs(targetP - progress) < 0.0004 && Math.abs(vel) < 0.002) { progress = targetP; vel = 0; }

    /* When the last stop was reached, for the outro's grace period. */
    if (progress >= stops.length - 1 - 0.02) { if (!endArrivedAt) endArrivedAt = t; }
    else endArrivedAt = 0;

    // parked at a stop: render one last frame, then idle until something moves
    var moving = progress !== targetP || vel !== 0;
    if (!moving && settled) { requestAnimationFrame(frame); return; }
    settled = !moving;

    var cam = camera();
    var toScreen = Math.pow(2, -cam.E);
    for (var i = 0; i < scenes.length; i++) {
      var s = scenes[i];
      var ds = s.exp - cam.E;
      var sc = Math.pow(2, ds);
      /* Measured in zoom EDGES, not octaves. Scenes fade out over the one step
         that separates them whatever that step's magnitude is, so shortening the
         atmosphere-to-orbit pull back does not leave the planet hanging in the
         sky above the Flatirons. Symmetric: the old long trailing fade kept three
         scales faintly stacked, which was pretty until smaller scales started
         drawing in front — coming out of the head you could still see the neuron's
         sphere over the beach, and the atom's specks drifted through what is
         supposed to be the void around the nucleus. Full strength mid-transition,
         absent on arrival. */
      var a = smooth((1.02 - Math.abs(s.zi - cam.z)) / 0.44);
      var wx = s.w.x - cam.x, wy = s.w.y - cam.y;
      var dx = wx * toScreen, dy = wy * toScreen;   // screen offset of this scene
      var local = Math.pow(2, -s.exp);              // world units -> this scene's units
      var offx = wx * local, offy = wy * local;
      /* Neighbours fade instead of popping: sideways along the ground band, and
         downward as the ascent leaves them underneath you. Gone by a full step —
         each scene paints its own full-bleed ground, so the band stays continuous
         while the neighbour's *objects* stay in their own scene. Held at 44% this
         put the city's skyline over the playground, because the far layer lags
         toward screen centre and drags scene-specific geometry with it. */
      /* Measured against the VIEWPORT, not against the scene's own width. The
         two agree for a lateral or vertical neighbour, which sits at the same
         exponent as the camera, and that is every case this fade was written
         for. They disagree violently for a nested scene: the neural tissue is
         inside a head, so in its own units the camera is thousands of widths
         away, while on screen it is a thumbnail sitting near the middle of the
         frame. Measured the old way it was declared an intruder and killed a
         fifth of the way through the move — while it was still four times the
         size of the head it is supposed to be inside. */
      var off = Math.max(Math.abs(dx) / SCENE_W, Math.abs(dy) / SCENE_H);
      if (off > 0.004) a *= smooth((1.0 - off) / 0.34);
      if (a <= 0.008) {
        if (s.shown) { s.node.style.display = 'none'; s.shown = false; }
        continue;
      }
      if (!s.shown) { s.node.style.display = ''; s.shown = true; }
      s.node.style.opacity = a;
      s.node.style.transform = 'translate(' + dx.toFixed(2) + 'px,' + dy.toFixed(2) +
        'px) scale(' + sc.toFixed(5) + ')';
      s.node.style.setProperty('--pxu', offx.toFixed(2) + 'px');
      s.node.style.setProperty('--pyu', offy.toFixed(2) + 'px');
      // Labels die quickly once a scene is oversized. Otherwise the scene you are
      // zooming into throws head-height sim names across the frame — worst during
      // the two passages, which are the moments that need a clear picture.
      var la = clamp(Math.min((sc - 0.3) / 0.35, (1.9 - sc) / 0.7), 0, 1);
      s.node.style.setProperty('--lbl', la.toFixed(3));
      // Smaller scales draw in front of larger ones — they are nested inside them.
      // This is what lets the neuron glow sit on the character's temple instead of
      // being hidden behind their head, and it keeps the looming next scale behind
      // the one you are actually standing in.
      s.node.style.zIndex = String(1000 - Math.round(ds * 10));
    }

    var lo = clamp(Math.floor(progress), 0, stops.length - 1);
    var hi = clamp(lo + 1, 0, stops.length - 1);
    paintSky(lo, hi, clamp(progress - lo, 0, 1));

    updateHud();
    requestAnimationFrame(frame);
  }

  function onResize() {
    fit = Math.min(window.innerWidth / (SCENE_W * 1.05), window.innerHeight / (SCENE_H * 1.16));
    world.style.transform = 'scale(' + fit + ')';
  }

  // ------------------------------------------------------------------- input
  function goTo(i) { targetP = clamp(i, 0, stops.length - 1); }
  function step(d) { goTo(Math.round(targetP) + d); }
  function scheduleSnap() {
    if (snapTimer) clearTimeout(snapTimer);
    snapTimer = setTimeout(function () {
      targetP = clamp(Math.round(targetP), 0, stops.length - 1);
    }, 170);
  }

  /* The opening card. It sits over the first stop rather than over nothing, so
     the nucleus is already turning behind the title. Anything at all dismisses
     it — the button, a click, a key, a scroll — and whatever did so is spent on
     the dismissal rather than also travelling the route, or the first flick of a
     trackpad would land you two stops in before you had read the subtitle. */
  var opening = true;
  function dismissOpening() {
    if (!opening) return false;
    opening = false;
    document.body.classList.remove('opening');
    var card = document.getElementById('opening');
    if (card) setTimeout(function () { card.style.display = 'none'; }, 700);
    return true;
  }

  /* The outro. The route ends at Orbit with nowhere further to travel, so a
     push past the end is the one gesture left that can only mean "done" --
     which is also why it takes a firm one. A trackpad's momentum tail runs on
     for a good while after the flick that carried you to the last stop, and at
     a lower threshold it would close the route the instant you arrived.

     Arrival is measured on `progress`, not on `targetP`: a hard flick from two
     stops out sets the target immediately, and testing that would roll the
     credits while the camera was still flying towards the last scene. */
  var END_PUSH = 260;                    // wheel pixels past the end
  var END_GRACE = 450;                   // ms of arrival to ignore first
  var endPush = 0, endArrivedAt = 0, ending = false;

  /* Arrived, and stood there a moment. The grace period is the whole point:
     the flick that carries you to the last stop keeps delivering momentum
     deltas long after the camera has settled, and without it that tail rolls
     the credits over a scene you never got to look at. */
  function atEnd() {
    return endArrivedAt !== 0 && performance.now() - endArrivedAt >= END_GRACE;
  }

  /* Wheel deltas arrive as increments, a drag as an absolute distance from
     where the finger went down; `absolute` keeps the drag from summing its own
     position every pointermove. */
  function pushEnd(px, absolute) {
    if (opening || ending || !atEnd()) { endPush = 0; return; }
    endPush = absolute ? Math.max(endPush, px) : endPush + px;
    if (endPush >= END_PUSH) showEnding();
  }

  /* Confetti in the seven topic colours -- the legend's seven, so the route is
     what comes down at the end. rnd() rather than Math.random, like everything
     else here; the arrangement is fixed but each piece runs its own loop at its
     own speed, so it never reads as a repeating pattern.

     The negative animation-delay is the point of the whole thing: it starts
     every piece part-way through its fall, so the card fades up onto confetti
     already coming down instead of onto an empty sky that fills a beat later. */
  var CONFETTI = 84;
  function buildConfetti(host) {
    var keys = Object.keys(TOPIC_COLOR);
    for (var i = 0; i < CONFETTI; i++) {
      var dur = 5.5 + rnd('confetti-dur', i) * 6.5;
      host.appendChild(el('i', null,
        'left:' + (rnd('confetti-x', i) * 100).toFixed(2) + '%;' +
        'background:' + TOPIC_COLOR[keys[i % keys.length]] + ';' +
        '--dx:' + ((rnd('confetti-dx', i) - 0.5) * 30).toFixed(1) + 'vw;' +
        '--spin:' + Math.round(360 + rnd('confetti-spin', i) * 1080) + 'deg;' +
        'animation-duration:' + dur.toFixed(2) + 's;' +
        'animation-delay:' + (-rnd('confetti-t', i) * dur).toFixed(2) + 's;' +
        // a third of them round, so it is not a shower of identical tickets
        (rnd('confetti-shape', i) > 0.66 ? 'border-radius:50%;' : '')));
    }
  }

  function showEnding() {
    if (ending) return;
    ending = true;
    endPush = 0;
    var card = document.getElementById('ending');
    if (card) card.style.display = '';
    var box = document.getElementById('confetti');
    if (box && !box.firstChild) buildConfetti(box);   // built once, then reused
    document.body.classList.add('ending');
  }

  /* Start again means the route starts again, title card and all, so this hands
     back to the opening rather than dropping you at the nucleus mid-journey.
     The two cards cross-fade, which works because they are the same card.

     Travel home BEFORE the fade: neither card is fully opaque, so resetting
     afterwards would show the route snapping from deep space back to the
     nucleus through them. */
  function restart() {
    if (!ending) return;
    ending = false;
    endPush = 0;
    progress = targetP = 0;
    vel = 0;
    endArrivedAt = 0;
    settled = false;                     // parked frames are skipped; force one

    document.body.classList.remove('ending');
    var outro = document.getElementById('ending');
    if (outro) setTimeout(function () { outro.style.display = 'none'; }, 700);

    var intro = document.getElementById('opening');
    if (intro) {
      intro.style.display = '';
      /* It was display:none. Adding the class in the same frame would give the
         browser one style to compute rather than two, and the card would appear
         instantly instead of fading; reading a layout property forces the
         intermediate recalc. */
      void intro.offsetWidth;
    }
    opening = true;
    document.body.classList.add('opening');
  }

  function attachInput() {
    var card = document.getElementById('opening');
    if (card) card.addEventListener('click', function () { dismissOpening(); });
    var endBtn = document.querySelector('#ending button');
    if (endBtn) endBtn.addEventListener('click', restart);

    window.addEventListener('wheel', function (e) {
      e.preventDefault();
      if (ending) return;                // no driving the route behind the card
      if (dismissOpening()) return;
      var d = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
      targetP = clamp(targetP + d * 0.0022, 0, stops.length - 1);
      if (d > 0) pushEnd(d); else endPush = 0;
      scheduleSnap();
    }, { passive: false });

    window.addEventListener('keydown', function (e) {
      var k = e.key;
      if (ending) return;
      if (dismissOpening()) { e.preventDefault(); return; }
      if (k === 'ArrowDown' || k === 'ArrowRight' || k === 'PageDown' || k === ' ' || k === 'j') {
        pushEnd(END_PUSH);               // a keypress is already a firm push
        step(1); e.preventDefault();
      } else if (k === 'ArrowUp' || k === 'ArrowLeft' || k === 'PageUp' || k === 'k') {
        step(-1); e.preventDefault();
      } else if (k === 'Home') { goTo(0); }
      else if (k === 'End') { goTo(stops.length - 1); }
      else if (k === 'l') { document.body.classList.toggle('hide-legend'); }
      else if (k === 'h') { document.body.classList.toggle('hide-hud'); }
      else if (k === 't') { document.body.classList.toggle('bare-slots'); }
    });

    var drag = null;
    /* Capture is taken LATE, on the first pointermove that clears the slop, and
       never on a plain press. While an element holds pointer capture the browser
       retargets the compatibility mouse events to it — including `click` — so
       capturing here on pointerdown meant every click on a sim slot was delivered
       to the viewport instead of to the link, and the link silently never fired.
       Hover still worked, which is what made it look like a styling problem.

       Taken late it still does its job: it only matters once a gesture is a drag,
       and by then the slop is already exceeded. */
    viewport.addEventListener('pointerdown', function (e) {
      if (ending) return;
      drag = { y: e.clientY, p: targetP, id: e.pointerId };
      dragged = false;
    });
    viewport.addEventListener('pointermove', function (e) {
      if (!drag) return;
      // 4px of slop: a click on a slot is never perfectly still
      if (!dragged && Math.abs(e.clientY - drag.y) > 4) {
        dragged = true;
        // a pointer that has already gone away throws; losing the capture is a
        // better outcome than losing the rest of the handler
        try { viewport.setPointerCapture(drag.id); } catch (err) { /* gone */ }
      }
      if (!dragged) return;
      var raw = drag.p + (drag.y - e.clientY) / 240;
      targetP = clamp(raw, 0, stops.length - 1);
      pushEnd((raw - (stops.length - 1)) * 240, true);
    });
    viewport.addEventListener('pointerup', function () {
      if (!drag) return;
      drag = null;
      endPush = 0;                       // a new gesture starts the push over
      targetP = clamp(Math.round(targetP), 0, stops.length - 1);
    });
  }

  // -------------------------------------------------------------------- init
  (function initApp() {
    var fallback = window.ROUTE_DATA;
    if (window.fetch && location.protocol !== 'file:') {
      fetch('route.json', { cache: 'no-store' })
        .then(function (r) { return r.ok ? r.json() : fallback; })
        .then(function (d) { boot(d || fallback); })
        .catch(function () { boot(fallback); });
    } else {
      boot(fallback);
    }
  })();

})();
