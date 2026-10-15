/* Design a World: charts from world data (bar, line, dot plot) as SVG. Pure string builders. */
(function () {
  'use strict';
  var C = window.DAW_CHARTS = {};
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function niceMax(v) { if (v <= 5) return 5; var p = Math.pow(10, Math.floor(Math.log10(v))), n = v / p; return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p; }
  // data: {title, xLabel, yLabel, labels:[], values:[], unit}
  C.svg = function (type, d, w, h) {
    w = w || 640; h = h || 360;
    var L = 64, R = 20, Tp = 46, B = 70, pw = w - L - R, ph = h - Tp - B, n = d.labels.length, o = [];
    var max = niceMax(Math.max.apply(null, d.values.concat([1]))), steps = 5;
    if (type === 'dot') { max = Math.max.apply(null, d.values.concat([1])); }
    o.push('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h + '" class="chart-svg" role="img" aria-label="' + esc(d.title) + '" font-family="Lexend, sans-serif">');
    o.push('<rect width="' + w + '" height="' + h + '" fill="#fff"/><text x="' + w / 2 + '" y="26" text-anchor="middle" font-size="17" font-weight="800" fill="#13294B">' + esc(d.title) + '</text>');
    var slot = pw / Math.max(1, n);
    if (type !== 'dot') {
      for (var k = 0; k <= steps; k++) { var y = Tp + ph - ph * k / steps, v = max * k / steps; o.push('<line x1="' + L + '" x2="' + (L + pw) + '" y1="' + y + '" y2="' + y + '" stroke="#e9ecef"/><text x="' + (L - 8) + '" y="' + (y + 4) + '" text-anchor="end" font-size="11" fill="#495057">' + (Math.round(v * 10) / 10) + '</text>'); }
      o.push('<text transform="translate(16 ' + (Tp + ph / 2) + ') rotate(-90)" text-anchor="middle" font-size="12" font-weight="700" fill="#13294B">' + esc(d.yLabel || '') + '</text>');
    }
    o.push('<line x1="' + L + '" x2="' + (L + pw) + '" y1="' + (Tp + ph) + '" y2="' + (Tp + ph) + '" stroke="#13294B" stroke-width="2"/>');
    if (type !== 'dot') o.push('<line x1="' + L + '" x2="' + L + '" y1="' + Tp + '" y2="' + (Tp + ph) + '" stroke="#13294B" stroke-width="2"/>');
    var colors = ['#1e78c8', '#2e8b57', '#c0612b', '#7a4fb5', '#e8590c', '#0c8599', '#c2255c', '#5c940d'];
    if (type === 'bar') d.values.forEach(function (v, k) { var bh = ph * v / max, x = L + slot * k + slot * 0.18; o.push('<rect x="' + x + '" y="' + (Tp + ph - bh) + '" width="' + slot * 0.64 + '" height="' + bh + '" rx="3" fill="' + colors[k % colors.length] + '"/><text x="' + (x + slot * 0.32) + '" y="' + (Tp + ph - bh - 5) + '" text-anchor="middle" font-size="11" font-weight="700" fill="#13294B">' + v + '</text>'); });
    if (type === 'line') {
      var pts = d.values.map(function (v, k) { return [L + slot * k + slot / 2, Tp + ph - ph * v / max]; });
      o.push('<polyline points="' + pts.map(function (p) { return p.join(','); }).join(' ') + '" fill="none" stroke="#1e78c8" stroke-width="3" stroke-linejoin="round"/>');
      pts.forEach(function (p, k) { o.push('<circle cx="' + p[0] + '" cy="' + p[1] + '" r="5" fill="#fff" stroke="#1e78c8" stroke-width="3"/><text x="' + p[0] + '" y="' + (p[1] - 10) + '" text-anchor="middle" font-size="11" font-weight="700" fill="#13294B">' + d.values[k] + '</text>'); });
    }
    if (type === 'dot') { // one dot per unit, stacked above each label (counts must be whole numbers)
      var r = Math.min(9, slot / 3, ph / (2 * Math.max(1, max) + 1));
      d.values.forEach(function (v, k) { var cx = L + slot * k + slot / 2; for (var q = 0; q < Math.round(v); q++) o.push('<circle cx="' + cx + '" cy="' + (Tp + ph - r - 2 - q * (2 * r + 2)) + '" r="' + r + '" fill="' + colors[k % colors.length] + '"/>'); });
      o.push('<text x="' + (L + pw) + '" y="' + (Tp - 8) + '" text-anchor="end" font-size="11" fill="#495057">Each dot = 1 ' + esc(d.unit || '') + '</text>');
    }
    d.labels.forEach(function (lb, k) { var x = L + slot * k + slot / 2, s = String(lb); o.push('<text x="' + x + '" y="' + (Tp + ph + 18) + '" text-anchor="middle" font-size="' + (n > 8 ? 10 : 11) + '" fill="#13294B">' + esc(s.length > 14 ? s.slice(0, 13) + '\u2026' : s) + '</text>'); });
    o.push('<text x="' + (L + pw / 2) + '" y="' + (h - 18) + '" text-anchor="middle" font-size="12" font-weight="700" fill="#13294B">' + esc(d.xLabel || '') + '</text>');
    if (!n) o.push('<text x="' + w / 2 + '" y="' + (Tp + ph / 2) + '" text-anchor="middle" font-size="14" fill="#868e96">Build more of your world to see data here.</text>');
    o.push('</svg>');
    return o.join('');
  };
  // Datasets computed from the save
  C.datasets = function (save, ix, IT) {
    var S = window.DAW_STATE, CAT = { landforms: 'Landforms', water: 'Water', weather: 'Weather', ecosystems: 'Living things', people: 'People', resources: 'Resources', energy: 'Energy', matter: 'Matter', space: 'Space', forces: 'Forces' };
    function people(tiles) { return tiles.reduce(function (n, t) { var a = IT.get(t.t).art; return n + (a === 'houses' ? 40 : a === 'school' || a === 'townhall' || a === 'museum' ? 10 : a === 'farm' ? 6 : a === 'campsite' ? 4 : 0); }, 0); }
    function snaps() { var cps = save.checkpoints.filter(function (c) { return /^Stage \d/.test(c.name); }).map(function (c) { return { label: 'End of Stage ' + c.stage, s: c.snap }; }); cps.push({ label: 'Now', s: save }); return cps; }
    var cat = {}; save.world.tiles.forEach(function (t) { var c = CAT[IT.get(t.t).category] || 'Other'; cat[c] = (cat[c] || 0) + 1; });
    var water = save.world.tiles.filter(function (t) { return /river|lake|ocean|pond|delta|cloud|aquifer|glacier/.test(IT.get(t.t).art); }).length;
    var base = [1.9, 2.0, 2.6, 2.4, 4.5, 4.0, 2.1, 2.3, 3.3, 4.1, 2.8, 2.4]; // a central-Texas-like pattern (inches), scaled by water on the map
    var rain = base.map(function (v) { return Math.round(v * (0.8 + Math.min(water, 10) * 0.06) * 10) / 10; });
    var res = {}; save.world.tiles.forEach(function (t) { var e = IT.econ(t.t); if (e && e.role === 'producer') res[e.what] = (res[e.what] || 0) + 1; });
    var xp = {}; Object.keys(save.missions).forEach(function (k) { var r = save.missions[k]; if (r.done) { var b = String(r.xp); xp[b] = (xp[b] || 0) + 1; } });
    var xpk = Object.keys(xp).map(Number).sort(function (a, b) { return a - b; });
    return [
      { id: 'things', title: 'Things on My Map', xLabel: 'Type of place', yLabel: 'Number of places', unit: 'place', labels: Object.keys(cat), values: Object.keys(cat).map(function (k) { return cat[k]; }), best: 'bar' },
      { id: 'population', title: 'Population as My World Grew', xLabel: 'Time', yLabel: 'People', unit: 'person', labels: snaps().map(function (x) { return x.label; }), values: snaps().map(function (x) { return people(x.s.world.tiles); }), best: 'line' },
      { id: 'rainfall', title: 'Model Rainfall in My World', xLabel: 'Month', yLabel: 'Rain (inches)', unit: 'inch', labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], values: rain, best: 'line', note: 'Model data: more water features on your map means a little more rain.' },
      { id: 'resources', title: 'Resource Producers in My Town', xLabel: 'Resource', yLabel: 'Number of producers', unit: 'producer', labels: Object.keys(res), values: Object.keys(res).map(function (k) { return res[k]; }), best: 'dot' },
      { id: 'budget', title: 'My Budget Over Time', xLabel: 'Time', yLabel: 'Coins', unit: 'coin', labels: snaps().map(function (x) { return x.label; }), values: snaps().map(function (x) { return IT.budget(x.s).balance; }), best: 'line' },
      { id: 'xp', title: 'XP Earned per Mission', xLabel: 'XP for one mission', yLabel: 'Number of missions', unit: 'mission', labels: xpk.map(String), values: xpk.map(function (k) { return xp[k]; }), best: 'dot' }
    ];
  };
})();
