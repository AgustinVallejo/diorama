#!/usr/bin/env node
// Validates route.json against the original PhET sim list and checks internal consistency.
// Run: node validate.js

const fs = require('fs');
const path = require('path');

const route = JSON.parse(fs.readFileSync(path.join(__dirname, 'route.json'), 'utf8'));
const original = fs.readFileSync(path.join(__dirname, 'original-list.txt'), 'utf8')
  .split('\n').map(s => s.trim()).filter(Boolean);

const errors = [];
const warnings = [];

// --- Coverage: every original sim accounted for exactly once ---
const placed = route.sims.map(s => s.slug);
const tools = route.tools.sims.map(s => s.slug);
const excluded = [...route.excluded.math, ...route.excluded.dev, ...route.excluded.deferred];
const accounted = [...placed, ...tools, ...excluded];

const originalSet = new Set(original);
const accountedSet = new Set(accounted);

const missing = original.filter(s => !accountedSet.has(s));
const phantom = accounted.filter(s => !originalSet.has(s));

const seen = new Map();
accounted.forEach(s => seen.set(s, (seen.get(s) || 0) + 1));
const dupes = [...seen.entries()].filter(([, n]) => n > 1).map(([s]) => s);

if (missing.length) errors.push(`UNACCOUNTED (in list, nowhere in manifest): ${missing.join(', ')}`);
if (phantom.length) errors.push(`PHANTOM (in manifest, not in list — typo?): ${phantom.join(', ')}`);
if (dupes.length) errors.push(`DUPLICATED across manifest sections: ${dupes.join(', ')}`);

// --- Referential integrity ---
const landmarkIds = new Set(route.landmarks.map(l => l.id));
const scaleIds = new Set(route.scales.map(s => s.id));
const topicIds = new Set(route.topics.map(t => t.id));
const placedSet = new Set(placed);

const MOVES = new Set(['pan', 'zoom', 'climb']);
route.landmarks.forEach(l => {
  if (!scaleIds.has(l.scale)) errors.push(`Landmark "${l.id}" has unknown scale "${l.scale}"`);
  if (l.move && !MOVES.has(l.move)) {
    errors.push(`Landmark "${l.id}" has unknown move "${l.move}" (expected pan | zoom | climb)`);
  }
  if (l.zoom !== undefined && !(typeof l.zoom === 'number' && l.zoom > 0)) {
    errors.push(`Landmark "${l.id}" has a non-positive zoom override "${l.zoom}"`);
  }
});

route.sims.forEach(s => {
  if (!landmarkIds.has(s.landmark)) errors.push(`Sim "${s.slug}" has unknown landmark "${s.landmark}"`);
  if (!topicIds.has(s.topic)) errors.push(`Sim "${s.slug}" has unknown topic "${s.topic}"`);
  (s.also || []).forEach(t => {
    if (!topicIds.has(t)) errors.push(`Sim "${s.slug}" has unknown secondary topic "${t}"`);
    if (t === s.topic) warnings.push(`Sim "${s.slug}" lists its primary topic in "also"`);
  });
  if (s.variantOf) {
    if (!placedSet.has(s.variantOf)) errors.push(`Sim "${s.slug}" is a variant of unplaced "${s.variantOf}"`);
    const parent = route.sims.find(p => p.slug === s.variantOf);
    if (parent && parent.landmark !== s.landmark) {
      warnings.push(`Variant "${s.slug}" sits at a different landmark than its parent "${s.variantOf}"`);
    }
  }
  if (s.zone) {
    const lm = route.landmarks.find(l => l.id === s.landmark);
    if (!lm.zones || !lm.zones.includes(s.zone)) {
      errors.push(`Sim "${s.slug}" has zone "${s.zone}" not declared on landmark "${s.landmark}"`);
    }
  }
});

// --- Section / passage integrity ---
const sectionLandmarks = route.sections.flatMap(s => s.landmarks);
route.landmarks.forEach(l => {
  if (!sectionLandmarks.includes(l.id)) errors.push(`Landmark "${l.id}" belongs to no section`);
});
const ordered = [...route.landmarks].sort((a, b) => a.order - b.order).map(l => l.id);
if (JSON.stringify(ordered) !== JSON.stringify(sectionLandmarks)) {
  errors.push('Section landmark order does not match landmark "order" fields');
}
route.passages.forEach(p => {
  const fi = ordered.indexOf(p.from), ti = ordered.indexOf(p.to);
  if (fi === -1 || ti === -1) errors.push(`Passage "${p.id}" references an unknown landmark`);
  else if (ti !== fi + 1) errors.push(`Passage "${p.id}" does not join adjacent landmarks`);
});

// --- Report ---
const byLandmark = {};
route.sims.forEach(s => { (byLandmark[s.landmark] ||= []).push(s); });

console.log('\n=== ROUTE ===\n');
route.sections.forEach(sec => {
  console.log(`  ${sec.label.toUpperCase()}`);
  sec.landmarks.forEach(id => {
    const lm = route.landmarks.find(l => l.id === id);
    const sims = byLandmark[id] || [];
    const variants = sims.filter(s => s.variantOf).length;
    const primary = sims.length - variants;
    const bar = '#'.repeat(primary);
    console.log(
      `    ${String(lm.order).padStart(2)}. ${lm.label.padEnd(16)} ${String(primary).padStart(2)} sims` +
      `${variants ? ` (+${variants} var)` : '       '}  ${bar}`
    );
    const p = route.passages.find(x => x.from === id);
    if (p) console.log(`        ~~~ passage: ${p.label} ~~~`);
  });
  console.log('');
});

console.log('=== TOPIC SPREAD (primary only) ===\n');
route.topics.forEach(t => {
  const prim = route.sims.filter(s => s.topic === t.id && !s.variantOf);
  const sec = route.sims.filter(s => (s.also || []).includes(t.id) && !s.variantOf);
  const spans = new Set(prim.map(s => route.landmarks.find(l => l.id === s.landmark).scale));
  console.log(`  ${t.label.padEnd(22)} ${String(prim.length).padStart(2)} primary, ${String(sec.length).padStart(2)} secondary — spans ${spans.size} scale(s)`);
});

console.log('\n=== TOTALS ===\n');
const variantCount = route.sims.filter(s => s.variantOf).length;
console.log(`  original list      ${original.length}`);
console.log(`  placed on route    ${placed.length}  (${placed.length - variantCount} primary + ${variantCount} variants)`);
console.log(`  tools (off route)  ${tools.length}`);
console.log(`  excluded           ${excluded.length}  (math ${route.excluded.math.length}, dev ${route.excluded.dev.length}, deferred ${route.excluded.deferred.length})`);
console.log(`  accounted          ${accounted.length}`);
console.log(`  idle-motion sims   ${route.sims.filter(s => s.idleMotion).length}  (candidates for looping clips)`);

if (warnings.length) {
  console.log('\n=== WARNINGS ===\n');
  warnings.forEach(w => console.log(`  ! ${w}`));
}
if (errors.length) {
  console.log('\n=== ERRORS ===\n');
  errors.forEach(e => console.log(`  X ${e}`));
  console.log('');
  process.exit(1);
}
console.log('\nAll checks passed.\n');
