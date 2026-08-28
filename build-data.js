// Regenerates route-data.js from route.json so index.html works over file://
// Run: node build-data.js
const fs = require('fs');
const path = require('path');
const src = path.join(__dirname, 'route.json');
const out = path.join(__dirname, 'route-data.js');
const json = fs.readFileSync(src, 'utf8');
JSON.parse(json); // fail loudly on malformed manifest
fs.writeFileSync(out,
  '// GENERATED from route.json by build-data.js - do not edit by hand.\n' +
  'window.ROUTE_DATA = ' + json.trim() + ';\n');
console.log('wrote route-data.js (' + json.length + ' bytes of manifest)');
