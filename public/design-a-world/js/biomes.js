/* Design a World: painted biomes. Students paint island cells with a biome brush; each cell stores one letter.
   The whole map is saved as a short run-length string in save.world.paint (e.g. "40.3f21.3f"); "." means not painted
   (default grassland look) and trailing "." runs are left out, so an unpainted island is "". Pure logic, no DOM. */
(function (root) {
  'use strict';
  var B = {};
  var CLIMATE = 'Climate is the usual weather in a place over many years. Weather is what is happening today.';
  B.CLIMATE = CLIMATE;
  // dx: the Field Guide biome this paint counts as; fits: Field Guide biomes whose plants and animals can live here
  B.LIST = [
    { c: 'g', id: 'grassland', name: 'Grassland', ground: 'grass', dx: 'grassland', fits: ['grassland'], icon: '#a3c45a', temp: 'Hot summers and cold winters', rain: 'Some rain: about 25 to 75 cm a year', fact: 'Too dry for many trees, but just right for grasses and wildflowers.' },
    { c: 'f', id: 'forest', name: 'Forest', ground: 'forest', dx: 'forest', fits: ['forest'], icon: '#4f8a3c', temp: 'Mild: warm summers and cool winters', rain: 'Lots of rain: about 75 to 150 cm a year', fact: 'Tall trees make shade, so the forest floor stays cool and damp.' },
    { c: 'd', id: 'desert', name: 'Desert', ground: 'desert', dx: 'desert', fits: ['desert'], icon: '#e2bf77', temp: 'Hot days and cool or cold nights', rain: 'Very little rain: less than 25 cm a year', fact: 'Dry air lets heat escape at night, so desert nights can be cold.' },
    { c: 't', id: 'tundra', name: 'Tundra', ground: 'tundra', dx: 'tundra', fits: ['tundra'], icon: '#dfe8e6', temp: 'Very cold: below freezing most of the year', rain: 'Very little rain or snow: about 15 to 25 cm a year', fact: 'The ground under the surface stays frozen all year. Texas has no tundra; it is far to the north.' },
    { c: 'w', id: 'wetland', name: 'Wetland', ground: 'wetland', dx: 'coast', fits: ['coast', 'freshwater'], icon: '#7fa36a', temp: 'Warm and humid, like the Gulf Coast', rain: 'Lots of rain: about 100 to 150 cm a year', fact: 'The soil stays soaked, so reeds and marsh grasses grow where most trees cannot.' },
    { c: 'c', id: 'coast', name: 'Ocean & Coast', ground: 'water', dx: 'ocean', fits: ['ocean', 'coast'], icon: '#5aa6cd', temp: 'Mild: the ocean keeps it from getting very hot or very cold', rain: 'Medium rain; sea breezes bring moist air', fact: 'Water heats up and cools down more slowly than land.' },
    { c: 'm', id: 'mountain', name: 'Mountain', ground: 'alpine', dx: 'mountain', fits: ['mountain'], icon: '#a39886', temp: 'Cooler the higher you go', rain: 'More rain and snow on the high slopes', fact: 'Air gets colder as you climb, so peaks can have snow while valleys are warm.' }
  ];
  B.byCode = {}; B.byId = {}; B.LIST.forEach(function (b) { B.byCode[b.c] = b; B.byId[b.id] = b; });
  B.DEFAULT = 'g';
  // placed items that tell us the biome of an old save (Field Guide biome groups)
  B.FROM_ART = { desert: 'd', dune: 'd', prairie: 'g', plain: 'g', meadow: 'g', forest: 'f', trees: 'f', preserve: 'f', pond: 'w', lake: 'w', river: 'w', oxbow: 'w', floodplain: 'w', delta: 'w', ocean: 'c', orcapod: 'c', beach: 'c', barrier: 'c', mountain: 'm', glacier: 'm', canyon: 'm', mesa: 'm', butte: 'm' };
  // soft Field Guide hints: landforms that usually form in some biomes (never blocks)
  B.LANDFORM_FIT = { dune: ['d', 'c'], glacier: ['t', 'm'], delta: ['c', 'w'], beach: ['c'], barrier: ['c'], oxbow: ['w', 'g'], floodplain: ['w', 'g'], canyon: ['d', 'm'], mesa: ['d'], butte: ['d'] };

  var memo = { s: null, n: 0, a: null };
  B.decode = function (str, n) {
    n = n || 24; if (memo.a && memo.s === str && memo.n === n) return memo.a;
    var a = new Array(n * n), k = 0, re = /(\d*)([a-z.])/g, m; for (var q = 0; q < a.length; q++) a[q] = '.';
    str = String(str || ''); while ((m = re.exec(str)) && k < a.length) { var c = m[2], r = m[1] ? Math.min(+m[1], a.length - k) : 1; if (c !== '.' && !B.byCode[c]) c = '.'; for (var z = 0; z < r; z++) a[k++] = c; }
    memo = { s: str, n: n, a: a }; return a;
  };
  B.encode = function (a) {
    var out = '', k = 0; var end = a.length; while (end > 0 && a[end - 1] === '.') end--;
    while (k < end) { var c = a[k], r = 1; while (k + r < end && a[k + r] === c) r++; out += (r > 1 ? r : '') + c; k += r; }
    return out;
  };
  function N(save) { return (root.DAW_STATE && root.DAW_STATE.WORLD) || 24; }
  function str(save) { return (save && save.world && typeof save.world.paint === 'string') ? save.world.paint : ''; }
  B.at = function (save, i, j) { var n = N(save); if (i < 0 || j < 0 || i >= n || j >= n) return '.'; return B.decode(str(save), n)[j * n + i]; };
  B.biomeAt = function (save, i, j) { return B.byCode[B.at(save, i, j)] || B.byCode[B.DEFAULT]; };
  // paint a size x size brush centred on (i, j). ok(i, j) limits it to open land. code '.' = eraser (back to default).
  B.paint = function (save, i, j, code, size, ok) {
    var n = N(save), a = B.decode(str(save), n).slice(), r = Math.floor((size || 1) / 2), cells = [];
    if (code !== '.' && !B.byCode[code]) return { changed: [] };
    for (var x = i - r; x <= i + r; x++) for (var y = j - r; y <= j + r; y++) {
      if (x < 0 || y < 0 || x >= n || y >= n || (ok && !ok(x, y))) continue;
      var k = y * n + x; if (a[k] !== code) { cells.push({ i: x, j: y, was: a[k] }); a[k] = code; }
    }
    if (cells.length) save.world.paint = B.encode(a);
    return { changed: cells };
  };
  B.restore = function (save, cells) { var n = N(save), a = B.decode(str(save), n).slice(); cells.forEach(function (c) { a[c.j * n + c.i] = c.was; }); save.world.paint = B.encode(a); };
  // the brush under a placed thing: most common painted letter in its footprint (null if none painted)
  B.tileCode = function (save, t) {
    var s = t.s > 1 ? t.s : 1, cnt = {}, best = null; for (var a = 0; a < s; a++) for (var b = 0; b < s; b++) { var c = B.at(save, t.i + a, t.j + b); if (c !== '.') cnt[c] = (cnt[c] || 0) + 1; }
    Object.keys(cnt).forEach(function (c) { if (!best || cnt[c] > cnt[best]) best = c; }); return best;
  };
  B.counts = function (save) { var a = B.decode(str(save), N(save)), c = {}; a.forEach(function (x) { c[x] = (c[x] || 0) + 1; }); return c; };
  B.kinds = function (save) { var c = B.counts(save), k = {}; Object.keys(c).forEach(function (x) { k[x === '.' ? B.DEFAULT : x] = 1; }); return Object.keys(k); };
  // old saves: paint the cells under placed biome items (artOf(itemId) -> art)
  B.infer = function (tiles, n, artOf) {
    n = n || 24; var a = new Array(n * n); for (var q = 0; q < a.length; q++) a[q] = '.';
    if (!artOf) return '';
    (tiles || []).forEach(function (t) { var c = B.FROM_ART[artOf(t.t)]; if (!c) return; var s = t.s > 1 ? t.s : 1; for (var x = 0; x < s; x++) for (var y = 0; y < s; y++) { var i = t.i + x, j = t.j + y; if (i < n && j < n) a[j * n + i] = c; } });
    return B.encode(a);
  };
  B.valid = function (v) { return typeof v === 'string' && v.length <= 4000 && /^(\d*[a-z.])*$/.test(v); };
  root.DAW_BIOMES = B;
  if (typeof module !== 'undefined' && module.exports) module.exports = B;
})(typeof window !== 'undefined' ? window : globalThis);
