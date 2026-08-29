'use strict';
/* PhET Route - Stage 1 grey-box.
   Discrete camera stops on a line. Zoom between scale bands, lateral pan across
   the human band. No art: coloured geometry standing in for landmarks and sims.

   Two things carry the feeling of depth at this stage, and both are cheap:
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

  var CHAR_BASE = 'energy skatepark/';
  var CHAR_W = 180, CHAR_H = 242;      // the sprite sheet's own pixel size
  var CHAR_HEAD = { x: 0.49, y: 0.23 };// head centre as a fraction of the sprite
  var SKATERS = [];
  [['africa', [1, 2, 3, 4, 5, 6]], ['asia', [1, 2, 3, 4, 5, 6]],
   ['latinAmerica', [1, 2, 3, 4, 5, 6]], ['oceania', [1, 2, 3, 4, 6]],
   ['usa', [1, 2, 3, 4, 5, 6]], ['africaModest', [6]]].forEach(function (r) {
    r[1].forEach(function (n) { SKATERS.push(r[0] + '/' + r[0] + 'Skater' + n); });
  });

  /* The one character the route is about. Declared up here because the camera
     keyframes need the head position before any scene is built. */
  var HERO = { x: 430, ground: GROUND_Y + 46, h: 156 };
  NEST.beach = { x: HERO.x, y: HERO.ground - HERO.h * (1 - CHAR_HEAD.y) };

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
    'nucleus-core':       ['#2a0b3d', '#08040f'],
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
    'orbit':              ['#04060f', '#0e1836'],
    'deep-space':         ['#000000', '#04050c']
  };

  /* The light source. x/y are viewport percentages, r its radius in px, a its
     opacity, star the strength of the star field behind it. Read down the table
     and you get the day: sun climbing from the left across the ground band,
     setting behind the Flatirons, gone by orbit. */
  var LIGHT = {
    'nucleus-core':       { x: 50, y: 42, r: 40,  c: '#ffffff', a: 0,   star: .55 },
    'electron-shell':     { x: 50, y: 42, r: 40,  c: '#ffffff', a: 0,   star: .46 },
    'molecular-assembly': { x: 50, y: 42, r: 40,  c: '#ffffff', a: 0,   star: .30 },
    'neural-tissue':      { x: 50, y: 42, r: 40,  c: '#ffffff', a: 0,   star: .14 },
    'beach':              { x: 24, y: 17, r: 62,  c: '#fff7de', a: .95, star: 0 },
    'lighthouse':         { x: 37, y: 19, r: 64,  c: '#fff4d2', a: .90, star: 0 },
    'playground':         { x: 51, y: 15, r: 60,  c: '#fffbea', a: .95, star: 0 },
    'city':               { x: 65, y: 21, r: 64,  c: '#ffeec6', a: .78, star: 0 },
    'lab-corridor':       { x: 77, y: 31, r: 70,  c: '#ffe4b6', a: .32, star: 0 },
    'flatirons':          { x: 88, y: 66, r: 116, c: '#ff9a4e', a: .95, star: .22 },
    'atmosphere':         { x: 97, y: 86, r: 94,  c: '#ff6a3d', a: .70, star: .74 },
    'orbit':              { x: 106, y: 94, r: 58, c: '#fff2d8', a: .50, star: 1 },
    'deep-space':         { x: 112, y: 98, r: 24, c: '#ffffff', a: .16, star: 1 }
  };

  // where a landmark's sim slots hang, and how wide the rows run
  var SLOT = {
    beach:        { perRow: 4, y: GROUND_Y - 214 },
    lighthouse:   { perRow: 4, y: GROUND_Y - 240 },
    playground:   { perRow: 5, y: GROUND_Y - 272 },
    city:         { perRow: 7, y: GROUND_Y - 300 },
    // the sims sit low at the trailhead so the slabs and the dusk stay clear
    flatirons:    { perRow: 3, y: GROUND_Y - 92 }
  };
  var SLOT_DEFAULT = { perRow: 5, y: GROUND_Y - 240 };
  // 120x80 is the size of a PhET sim icon. These boxes stand in for one, so they
  // are exactly that size and Stage 2 can drop the thumbnail straight in.
  var SLOT_W = 120, SLOT_H = 80, SLOT_GAP = 10, SLOT_ROW = 92;

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
  var R, stops, exps, W, scenes = [], scaleById = {}, sectionOf = {}, passages = [];
  var simCount = {};
  var progress = 0, targetP = 0, vel = 0, lastT = 0, snapTimer = null, settled = false;
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
    exps = []; W = [];
    stops.forEach(function (lm, i) {
      if (i === 0) { exps[0] = 0; W[0] = { x: 0, y: 0 }; return; }
      var prev = stops[i - 1];
      var pan = prev.scale === 'human' && lm.scale === 'human';
      var climb = sectionOf[lm.id] && sectionOf[lm.id].id === 'ascent';
      exps[i] = pan ? exps[i - 1] : exps[i - 1] + ZOOM_STEP;
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

  function simBox(sim, variants) {
    var color = TOPIC_COLOR[sim.topic] || '#94a3b8';
    var box = el('div', 'slot', 'border-left-color:' + color + ';');
    box.appendChild(el('div', 'slot-name', null, sim.name));
    // variants sit under the name; the meta row is pinned to the bottom edge, so
    // everything stays inside the 120x80 the real thumbnail will occupy
    if (variants.length) {
      var vars = el('div', 'slot-vars');
      variants.forEach(function (v) {
        vars.appendChild(el('span', 'variant', null, v.variantKind));
      });
      box.appendChild(vars);
    }
    var meta = el('div', 'slot-meta');
    meta.appendChild(el('span', 'dot', 'background:' + color + ';'));
    (sim.also || []).forEach(function (t) {
      meta.appendChild(el('span', 'dot dot-sec', 'background:' + (TOPIC_COLOR[t] || '#64748b') + ';'));
    });
    if (sim.idleMotion) meta.appendChild(el('span', 'idle', null, 'idle'));
    meta.appendChild(el('span', 'slug', null, sim.slug));
    box.appendChild(meta);
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

  function abstractScene(lm, host, groups) {
    var L = depthLayers(host);
    for (var r = 0; r < 4; r++) {
      var d = 220 + r * 150;
      L.far.appendChild(el('div', 'ring', 'width:' + d + 'px;height:' + d + 'px;left:' +
        (SCENE_W / 2 - d / 2) + 'px;top:' + (SCENE_H / 2 - d / 2) + 'px;opacity:' +
        (0.5 - r * 0.09)));
    }
    for (var i = 0; i < 26; i++) {
      var a = rnd(lm.id, i) * Math.PI * 2, rad = 110 + rnd(lm.id, i + 99) * 370;
      var sz = 3 + rnd(lm.id, i + 7) * 7;
      L.far.appendChild(el('div', 'speck', 'width:' + sz + 'px;height:' + sz + 'px;left:' +
        (SCENE_W / 2 + Math.cos(a) * rad) + 'px;top:' +
        (SCENE_H / 2 + Math.sin(a) * rad * 0.55) + 'px;'));
    }
    L.mid.appendChild(el('div', 'glow'));
    var core = 70 + (lm.order % 3) * 18;
    L.mid.appendChild(el('div', 'core', 'width:' + core + 'px;height:' + core + 'px;left:' +
      (SCENE_W / 2 - core / 2) + 'px;top:' + (SCENE_H / 2 - core / 2) + 'px;'));

    // sim slots on an ellipse
    var n = groups.length;
    groups.forEach(function (g, i) {
      var ang = -Math.PI / 2 + (i / Math.max(n, 1)) * Math.PI * 2;
      var b = simBox(g.sim, g.variants);
      b.style.left = (SCENE_W / 2 + Math.cos(ang) * 396 - SLOT_W / 2) + 'px';
      b.style.top = (SCENE_H / 2 + Math.sin(ang) * 245 - SLOT_H / 2) + 'px';
      L.near.appendChild(b);
    });
  }

  /* A PhET skater sprite standing on the ground at x. Deterministic pick, so the
     crowd is the same every load — a city that reshuffles itself on refresh reads
     as a bug. Returns the node; the head sits at (x, y - h*(1-CHAR_HEAD.y)). */
  function character(seed, i, x, groundY, h, opts) {
    opts = opts || {};
    var who = SKATERS[Math.floor(rnd(seed, i) * SKATERS.length) % SKATERS.length];
    var face = rnd(seed, i + 977) < 0.5 ? 'Left' : 'Right';
    var w = h * (CHAR_W / CHAR_H);
    return el('div', 'char', 'left:' + (x - w / 2).toFixed(1) + 'px;top:' + (groundY - h) +
      'px;width:' + w.toFixed(1) + 'px;height:' + h + 'px;background-image:url("' +
      encodeURI(CHAR_BASE + who + face + '.png') + '");' + (opts.style || ''));
  }

  function stickFigure(x, y, cls) {
    var g = el('div', 'figure' + (cls ? ' ' + cls : ''), 'left:' + x + 'px;top:' + y + 'px;');
    g.appendChild(el('div', 'f-head'));
    g.appendChild(el('div', 'f-body'));
    g.appendChild(el('div', 'f-arm f-arm-a'));
    g.appendChild(el('div', 'f-arm f-arm-b'));
    g.appendChild(el('div', 'f-leg f-leg-a'));
    g.appendChild(el('div', 'f-leg f-leg-b'));
    g.appendChild(el('div', 'f-frisbee'));
    if (cls === 'hiking') g.appendChild(el('div', 'f-pole'));
    return g;
  }

  // ------------------------------------------------------- surface landmarks
  var BUILD = {};

  BUILD.beach = function (L, lm) {
    var f = boxer(L.far), m = boxer(L.mid), n = boxer(L.near);
    var sea = GROUND_Y, sand = GROUND_Y + 46;
    hazeBand(L.far, sea);
    f(-1400, sea, 4000, 50, 'water');
    f(-140, sea - 62, 360, 62, 'hill far-tone');
    f(980, sea - 44, 300, 44, 'hill far-tone');
    for (var i = 0; i < 5; i++) {
      f(240 + i * 160, sea - 150 - rnd('gull', i) * 90, 9, 2, 'thin', 'opacity:.5;');
    }
    groundBand(L.mid, sand,
      'background:linear-gradient(180deg,rgba(190,176,140,.62),rgba(84,78,62,.8));');
    m(-1400, sand, 4000, 10, 'thin', 'opacity:.22;');            // wet-sand line
    m(120, sand - 12, 220, 12, 'solid');                        // dock deck
    m(150, sand, 9, 66, 'solid'); m(300, sand, 9, 66, 'solid'); // pilings
    // The arrival. The neural-tissue scene is pinned to this sprite's head (see
    // NEST.beach), so the 'out of the head' passage is a camera move, not a cut.
    L.mid.appendChild(character('hero', 0, HERO.x, HERO.ground, HERO.h));
    var hy = HERO.ground - HERO.h * (1 - CHAR_HEAD.y);
    m(HERO.x + 96, hy + 30, 34, 10, 'outline', 'border-radius:50%;opacity:.85;');  // frisbee
    m(880, sand - 38, 66, 38, 'solid', 'border-radius:50% 50% 0 0;');  // bucket
    L.mid.appendChild(character('beachfolk', 3, 1010, sand, 104));
    foreBand(L.near, GROUND_Y + 176, 26, 'dune');
    n(760, GROUND_Y + 150, 130, 8, 'solid', 'border-radius:4px;opacity:.8;');  // towel
    L.near.appendChild(character('beachfolk', 7, 250, GROUND_Y + 172, 150));
  };

  BUILD.lighthouse = function (L, lm) {
    var f = boxer(L.far), m = boxer(L.mid), n = boxer(L.near);
    var sea = GROUND_Y, rock = GROUND_Y + 62;
    hazeBand(L.far, sea);
    f(-1400, sea, 4000, 66, 'water');
    f(860, sea - 78, 420, 78, 'hill far-tone');
    groundBand(L.mid, rock);
    m(150, rock - 300, 58, 300, 'solid');
    m(138, rock - 334, 82, 34, 'solid');
    L.mid.appendChild(el('div', 'beam', 'left:220px;top:' + (rock - 328) + 'px;'));
    m(0, rock - 12, 96, 12, 'solid', 'opacity:.7;');
    m(300, rock + 26, 300, 9, 'solid', 'opacity:.75;');            // jetty
    m(340, rock + 35, 8, 40, 'solid'); m(540, rock + 35, 8, 40, 'solid');
    foreBand(L.near, GROUND_Y + 178, 12, 'kelp');
    n(-60, GROUND_Y + 122, 210, 90, 'rock');
    n(430, GROUND_Y + 150, 240, 92, 'rock');
    n(760, GROUND_Y + 128, 180, 74, 'rock');
    n(1040, GROUND_Y + 146, 220, 96, 'rock');
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
    m(120, GROUND_Y - 158, 11, 158, 'solid'); m(300, GROUND_Y - 158, 11, 158, 'solid');
    m(120, GROUND_Y - 166, 191, 10, 'solid');
    m(160, GROUND_Y - 156, 3, 88, 'thin'); m(230, GROUND_Y - 156, 3, 88, 'thin');
    m(158, GROUND_Y - 70, 9, 4, 'solid'); m(228, GROUND_Y - 70, 9, 4, 'solid');
    m(880, GROUND_Y - 74, 230, 74, 'outline', 'border-radius:0 0 150px 150px;');  // skate bowl
    m(620, GROUND_Y - 26, 118, 8, 'solid');                                        // bench
    m(626, GROUND_Y - 18, 6, 18, 'solid'); m(726, GROUND_Y - 18, 6, 18, 'solid');
    foreBand(L.near, GROUND_Y + 172, 0);
    for (var k = 0; k < 22; k++) n(-340 + k * 92, GROUND_Y + 118, 4, 56, 'thin', 'opacity:.38;');
    n(-1400, GROUND_Y + 112, 4000, 3, 'thin', 'opacity:.34;');                      // fence rail
  };

  BUILD.city = function (L, lm) {
    var f = boxer(L.far), m = boxer(L.mid), n = boxer(L.near);
    hazeBand(L.far, GROUND_Y);
    var fh = [140, 210, 170, 250, 190, 160, 230, 200, 150, 240, 180];
    for (var i = 0; i < fh.length; i++) f(-260 + i * 152, GROUND_Y - fh[i], 118, fh[i], 'building far-tone');
    groundBand(L.mid, GROUND_Y,
      'background:linear-gradient(180deg,rgba(74,78,86,.7),rgba(22,25,30,.85));');
    var hs = [180, 300, 230, 380, 260, 320, 200, 420, 240];
    for (var j = 0; j < hs.length; j++) m(40 + j * 128, GROUND_Y - hs[j], 96, hs[j], 'building');
    m(1150, GROUND_Y - 260, 9, 260, 'solid');
    m(1136, GROUND_Y - 268, 38, 9, 'solid');
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
    (lm.zones || []).forEach(function (z, zi) {
      var x = 60 + zi * 290;
      m(x, GROUND_Y - 100, 118, 100, 'door');
      m(x + 104, GROUND_Y - 56, 8, 3, 'thin', 'opacity:.6;');     // handle
      L.mid.appendChild(el('div', 'zone-tag', 'left:' + x + 'px;top:' + (GROUND_Y + 12) + 'px;', z));
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

    groundBand(L.mid, GROUND_Y);
    m(120, GROUND_Y - 396, 246, 396, 'slab', 'transform:skewX(-13deg);');
    m(396, GROUND_Y - 468, 272, 468, 'slab', 'transform:skewX(-11deg);');
    m(698, GROUND_Y - 344, 226, 344, 'slab', 'transform:skewX(-15deg);');
    // the trail crosses the open ground toward the notch, in front of the rock
    [[190, 74, 190, -7], [330, 52, 200, -6], [490, 32, 190, -5], [630, 16, 170, -4]]
      .forEach(function (s) {
        m(s[0], GROUND_Y + s[1], s[2], 0, null,
          'border-top:2px dashed rgba(255,255,255,.34);transform:rotate(' + s[3] + 'deg);');
      });
    // trailhead: campfire, hiker, scrub, rabbits — all on the open ground plane
    for (var i = 0; i < 7; i++) {
      var a = (i / 7) * Math.PI * 2;
      m(196 + Math.cos(a) * 28, GROUND_Y + 104 + Math.sin(a) * 11, 12, 8, 'solid',
        'border-radius:50%;opacity:.8;');
    }
    L.mid.appendChild(el('div', 'shape fire', 'left:178px;top:' + (GROUND_Y + 72) +
      'px;width:38px;height:38px;'));
    L.mid.appendChild(stickFigure(298, GROUND_Y - 26, 'hiking'));
    m(830, GROUND_Y + 34, 92, 38, 'scrub'); m(960, GROUND_Y + 46, 68, 30, 'scrub');
    m(866, GROUND_Y + 30, 14, 10, 'solid', 'border-radius:50%;');   // rabbit
    m(880, GROUND_Y + 22, 4, 9, 'thin');                            // ear
    m(982, GROUND_Y + 42, 13, 9, 'solid', 'border-radius:50%;');

    foreBand(L.near, GROUND_Y + 176, 18, 'sage');
    n(-210, GROUND_Y + 108, 250, 126, 'rock');                      // the boulder easter egg
    n(1030, GROUND_Y + 122, 210, 104, 'rock');
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
      var zones = lm.zones || [];
      zones.forEach(function (z, zi) {
        var g = groups.filter(function (x) { return x.sim.zone === z; });
        if (!g.length) return;
        // tighter pitch than the outdoor stops: four zones have to clear the doors
        var y = GROUND_Y - 190 - (zones.length - 1 - zi) * 88;
        L.mid.appendChild(el('div', 'zone-label', 'left:4px;top:' + (y + 30) + 'px;', z));
        layoutRows(L.mid, g, { perRow: 6, x: 120, y: y, center: false });
      });
      return;
    }
    var cfg = SLOT[lm.id] || SLOT_DEFAULT;
    layoutRows(L.near, groups, {
      perRow: cfg.perRow, x: SCENE_W / 2, y: cfg.y, center: true, groundY: GROUND_Y
    });
  }

  function buildScenes() {
    stops.forEach(function (lm, i) {
      var sc = el('div', 'scene', 'width:' + SCENE_W + 'px;height:' + SCENE_H + 'px;margin-left:' +
        (-SCENE_W / 2) + 'px;margin-top:' + (-SCENE_H / 2) + 'px;');
      sc.appendChild(el('div', 'scene-frame'));
      var groups = groupSims(simsFor(lm.id));
      if (lm.scale === 'human') surfaceScene(lm, sc, groups); else abstractScene(lm, sc, groups);

      var plate = el('div', 'plate', 'top:26px;');
      plate.appendChild(el('div', 'plate-rule'));
      plate.appendChild(el('div', 'plate-label', null, lm.label));
      sc.appendChild(plate);

      world.appendChild(sc);
      scenes.push({ lm: lm, node: sc, exp: exps[i], w: W[i], shown: true });
    });
  }

  // --------------------------------------------------------------------- hud
  var hud = {};
  function buildHud() {
    hud.landmark = document.getElementById('h-landmark');
    hud.section = document.getElementById('h-section');
    hud.scale = document.getElementById('h-scale');
    hud.count = document.getElementById('h-count');
    hud.note = document.getElementById('h-note');
    hud.banner = document.getElementById('banner');
    hud.bannerTitle = document.getElementById('banner-title');
    hud.bannerNote = document.getElementById('banner-note');
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
      hud.note.textContent = lm.note || '';
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
    if (best) {
      hud.banner.style.opacity = best.alpha;
      hud.bannerTitle.textContent = 'passage — ' + best.pg.p.label;
      hud.bannerNote.textContent = best.pg.p.note;
      hud.tint.style.opacity = best.alpha * 0.32;
    } else {
      hud.banner.style.opacity = 0;
      hud.tint.style.opacity = 0;
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
  function camera() {
    var lo = clamp(Math.floor(progress), 0, stops.length - 1);
    var hi = clamp(lo + 1, 0, stops.length - 1);
    var f = clamp(progress - lo, 0, 1);
    return {
      E: lerp(exps[lo], exps[hi], f),
      x: lerp(W[lo].x, W[hi].x, f),
      y: lerp(W[lo].y, W[hi].y, f)
    };
  }

  function frame(t) {
    var dt = lastT ? Math.min((t - lastT) / 1000, 0.05) : 0.016;
    lastT = t;
    var k = 42, c = 2 * Math.sqrt(k) * 0.92;
    vel += (k * (targetP - progress) - c * vel) * dt;
    progress += vel * dt;
    if (Math.abs(targetP - progress) < 0.0004 && Math.abs(vel) < 0.002) { progress = targetP; vel = 0; }

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
      // behind you: long fade, so three scales of history stay faintly stacked.
      // ahead of you: short fade, or the next scale's rings loom over the whole
      // frame as a stray dashed circle rather than a hint of what is coming.
      var a = ds <= 0 ? smooth((ds + 6.2) / 4.2) : smooth((2.7 - ds) / 1.8);
      var wx = s.w.x - cam.x, wy = s.w.y - cam.y;
      var dx = wx * toScreen, dy = wy * toScreen;   // screen offset of this scene
      var local = Math.pow(2, -s.exp);              // world units -> this scene's units
      var offx = wx * local, offy = wy * local;
      // Neighbours fade instead of popping: sideways along the ground band, and
      // downward as the ascent leaves them underneath you.
      var off = Math.max(Math.abs(offx) / SCENE_W, Math.abs(offy) / SCENE_H);
      if (off > 0.004) a *= smooth((1.16 - off) / 0.34);
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

  function attachInput() {
    window.addEventListener('wheel', function (e) {
      e.preventDefault();
      var d = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
      targetP = clamp(targetP + d * 0.0022, 0, stops.length - 1);
      scheduleSnap();
    }, { passive: false });

    window.addEventListener('keydown', function (e) {
      var k = e.key;
      if (k === 'ArrowDown' || k === 'ArrowRight' || k === 'PageDown' || k === ' ' || k === 'j') {
        step(1); e.preventDefault();
      } else if (k === 'ArrowUp' || k === 'ArrowLeft' || k === 'PageUp' || k === 'k') {
        step(-1); e.preventDefault();
      } else if (k === 'Home') { goTo(0); }
      else if (k === 'End') { goTo(stops.length - 1); }
      else if (k === 'g') { document.body.classList.toggle('show-grid'); }
      else if (k === 'l') { document.body.classList.toggle('hide-legend'); }
      else if (k === 'h') { document.body.classList.toggle('hide-hud'); }
    });

    var drag = null;
    viewport.addEventListener('pointerdown', function (e) {
      drag = { y: e.clientY, p: targetP };
      viewport.setPointerCapture(e.pointerId);
    });
    viewport.addEventListener('pointermove', function (e) {
      if (!drag) return;
      targetP = clamp(drag.p + (drag.y - e.clientY) / 240, 0, stops.length - 1);
    });
    viewport.addEventListener('pointerup', function () {
      if (!drag) return;
      drag = null;
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
