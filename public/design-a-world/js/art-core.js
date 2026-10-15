/* Design a World: illustration core (isometric helpers, shared gradients, ground tiles).
   All art is original inline SVG. Coordinates are tile-local: tile centre = (0,0),
   diamond half-width 48, half-height 24. */
(function () {
  'use strict';
  var A = window.DAW_ART = window.DAW_ART || {};
  var HW = 48, HH = 24;
  A.HW = HW; A.HH = HH;

  function P(u, v, z) { return [(u - v) * HW, (u + v) * HH - (z || 0)]; }
  function pts(a) { return a.map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' '); }
  function poly(a, fill, extra) { return '<polygon points="' + pts(a) + '" fill="' + fill + '"' + (extra || '') + '/>'; }
  function hex2rgb(h) { h = h.replace('#', ''); if (h.length === 3) h = h.split('').map(function (c) { return c + c; }).join(''); return [parseInt(h.substr(0, 2), 16), parseInt(h.substr(2, 2), 16), parseInt(h.substr(4, 2), 16)]; }
  function shade(h, amt) { // amt -1..1 (negative = darker)
    var c = hex2rgb(h).map(function (x) { return Math.round(amt < 0 ? x * (1 + amt) : x + (255 - x) * amt); });
    return '#' + c.map(function (x) { return ('0' + Math.max(0, Math.min(255, x)).toString(16)).slice(-2); }).join('');
  }
  function rng(seed) { var s = (seed * 9301 + 49297) % 233280; return function () { s = (s * 9301 + 49297) % 233280; return s / 233280; }; }
  A.P = P; A.pts = pts; A.poly = poly; A.shade = shade; A.rng = rng;

  // Iso box. Visible faces: top, right-front (u = u1), left-front (v = v1).
  A.box = function (u0, v0, u1, v1, z0, h, col, opt) {
    opt = opt || {};
    var top = opt.top || shade(col, 0.18), L = opt.left || shade(col, -0.08), R = opt.right || shade(col, -0.28);
    var s = opt.stroke ? ' stroke="' + opt.stroke + '" stroke-width="0.6" stroke-linejoin="round"' : '';
    var z1 = z0 + h;
    return poly([P(u0, v1, z0), P(u1, v1, z0), P(u1, v1, z1), P(u0, v1, z1)], L, s) +
      poly([P(u1, v0, z0), P(u1, v1, z0), P(u1, v1, z1), P(u1, v0, z1)], R, s) +
      poly([P(u0, v0, z1), P(u1, v0, z1), P(u1, v1, z1), P(u0, v1, z1)], top, s);
  };
  // Striped (strata) box: colours listed bottom to top.
  A.strataBox = function (u0, v0, u1, v1, z0, h, bands, topCol) {
    var out = '', n = bands.length, z = z0, step = h / n;
    for (var i = 0; i < n; i++) {
      var c = bands[i], za = z, zb = z + step + 0.4;
      out += poly([P(u0, v1, za), P(u1, v1, za), P(u1, v1, zb), P(u0, v1, zb)], shade(c, -0.02));
      out += poly([P(u1, v0, za), P(u1, v1, za), P(u1, v1, zb), P(u1, v0, zb)], shade(c, -0.25));
      z += step;
    }
    out += poly([P(u0, v0, z0 + h), P(u1, v0, z0 + h), P(u1, v1, z0 + h), P(u0, v1, z0 + h)], topCol || shade(bands[n - 1], 0.15));
    return out;
  };
  // Gable-roof building. ridge along u.
  A.building = function (u0, v0, u1, v1, h, wall, roof, opt) {
    opt = opt || {};
    var r = opt.roofH || 12, vm = (v0 + v1) / 2, o = '';
    o += A.box(u0, v0, u1, v1, 0, h, wall);
    var e = 0.03;
    // back slope, front slope, gable end
    o += poly([P(u0 - e, v0 - e, h), P(u1 + e, v0 - e, h), P(u1 + e, vm, h + r), P(u0 - e, vm, h + r)], shade(roof, -0.1));
    o += poly([P(u0 - e, v1 + e, h), P(u1 + e, v1 + e, h), P(u1 + e, vm, h + r), P(u0 - e, vm, h + r)], roof);
    o += poly([P(u1, v0, h), P(u1, v1, h), P(u1, vm, h + r)], shade(wall, -0.32));
    o += '<line x1="' + P(u0 - e, vm, h + r)[0] + '" y1="' + P(u0 - e, vm, h + r)[1] + '" x2="' + P(u1 + e, vm, h + r)[0] + '" y2="' + P(u1 + e, vm, h + r)[1] + '" stroke="' + shade(roof, 0.35) + '" stroke-width="1.2" stroke-linecap="round"/>';
    if (opt.windows !== false) o += A.windows(u0, v1, u1, h, opt.winCol);
    if (opt.door) o += A.door(u0, v1, u1, opt.door);
    return o;
  };
  // windows on the left-front face (v = v1)
  A.windows = function (u0, v1, u1, h, col) {
    var o = '', n = Math.max(1, Math.round((u1 - u0) / 0.14)), w = (u1 - u0) / n;
    for (var i = 0; i < n; i++) {
      var a = u0 + w * i + w * 0.3, b = u0 + w * i + w * 0.7, z0 = h * 0.45, z1 = h * 0.8;
      o += poly([P(a, v1, z0), P(b, v1, z0), P(b, v1, z1), P(a, v1, z1)], col || '#BFE3FF', ' stroke="#ffffff" stroke-opacity=".7" stroke-width=".6"');
    }
    return o;
  };
  A.door = function (u0, v1, u1, col) {
    var m = (u0 + u1) / 2, a = m - 0.045, b = m + 0.045;
    return poly([P(a, v1, 0), P(b, v1, 0), P(b, v1, 9), P(a, v1, 9)], col);
  };
  A.shadow = function (x, y, rx, ry, op) { return '<ellipse cx="' + x + '" cy="' + y + '" rx="' + rx + '" ry="' + ry + '" fill="#0b2a1a" opacity="' + (op || 0.18) + '"/>'; };

  // Trees
  A.tree = function (u, v, s, kind) {
    var p = P(u, v, 0), x = p[0], y = p[1]; s = s || 1; var o = A.shadow(x + 3 * s, y + 1, 9 * s, 4 * s);
    if (kind === 'pine') {
      o += '<rect x="' + (x - 1.4 * s) + '" y="' + (y - 7 * s) + '" width="' + 2.8 * s + '" height="' + 7 * s + '" fill="#6b4423"/>';
      for (var i = 0; i < 3; i++) {
        var w = (11 - i * 3) * s, t = y - (6 + i * 7) * s, hh = 12 * s;
        o += '<path d="M' + (x - w) + ' ' + t + ' L' + x + ' ' + (t - hh) + ' L' + (x + w) + ' ' + t + ' Z" fill="url(#daw-pine)"/>';
        o += '<path d="M' + x + ' ' + (t - hh) + ' L' + (x + w) + ' ' + t + ' L' + x + ' ' + t + ' Z" fill="#1d5a32" opacity=".45"/>';
      }
    } else if (kind === 'cactus') { // prickly pear
      var pad = function (cx, cy, rx, ry, rot) { return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" transform="rotate(' + rot + ' ' + cx + ' ' + cy + ')" fill="url(#daw-cactus)" stroke="#2f6b3a" stroke-width=".6"/>'; };
      o += pad(x, y - 7 * s, 5 * s, 8 * s, 0) + pad(x - 6 * s, y - 15 * s, 4 * s, 6 * s, -25) + pad(x + 6 * s, y - 16 * s, 4 * s, 6.5 * s, 20) + pad(x + 1 * s, y - 21 * s, 3.4 * s, 5 * s, 5);
      o += '<circle cx="' + (x + 6 * s) + '" cy="' + (y - 22.5 * s) + '" r="' + 1.6 * s + '" fill="#e5487a"/><circle cx="' + (x - 6.5 * s) + '" cy="' + (y - 20.5 * s) + '" r="' + 1.4 * s + '" fill="#f2c94c"/>';
    } else if (kind === 'yucca') {
      o += '<rect x="' + (x - 1.2 * s) + '" y="' + (y - 12 * s) + '" width="' + 2.4 * s + '" height="' + 12 * s + '" fill="#7a5b3a"/>';
      for (var k = -3; k <= 3; k++) { var ang = k * 22 * Math.PI / 180; o += '<line x1="' + x + '" y1="' + (y - 12 * s) + '" x2="' + (x + Math.sin(ang) * 9 * s) + '" y2="' + (y - 12 * s - Math.cos(ang) * 9 * s) + '" stroke="#5f8f4a" stroke-width="' + 1.6 * s + '" stroke-linecap="round"/>'; }
    } else { // oak / round tree
      o += '<path d="M' + (x - 1.6 * s) + ' ' + y + ' L' + (x - 1.1 * s) + ' ' + (y - 11 * s) + ' L' + (x + 1.1 * s) + ' ' + (y - 11 * s) + ' L' + (x + 1.6 * s) + ' ' + y + 'Z" fill="#6b4423"/>';
      o += '<circle cx="' + (x - 5 * s) + '" cy="' + (y - 15 * s) + '" r="' + 7 * s + '" fill="url(#daw-leaf)"/>';
      o += '<circle cx="' + (x + 5 * s) + '" cy="' + (y - 16 * s) + '" r="' + 7.5 * s + '" fill="url(#daw-leaf)"/>';
      o += '<circle cx="' + x + '" cy="' + (y - 22 * s) + '" r="' + 8 * s + '" fill="url(#daw-leaf)"/>';
      o += '<circle cx="' + (x - 2.5 * s) + '" cy="' + (y - 25 * s) + '" r="' + 3 * s + '" fill="#bfe58a" opacity=".55"/>';
    }
    return o;
  };
  A.person = function (x, y, shirt, s) {
    s = s || 1;
    return A.shadow(x + 1, y, 3 * s, 1.4 * s, 0.2) + '<rect x="' + (x - 1.8 * s) + '" y="' + (y - 8 * s) + '" width="' + 3.6 * s + '" height="' + 6 * s + '" rx="' + 1.4 * s + '" fill="' + shirt + '"/>' +
      '<rect x="' + (x - 1.4 * s) + '" y="' + (y - 3 * s) + '" width="' + 2.8 * s + '" height="' + 3 * s + '" fill="#34495e"/>' +
      '<circle cx="' + x + '" cy="' + (y - 10 * s) + '" r="' + 2.1 * s + '" fill="#e0ac7e"/>';
  };
  A.flowers = function (r, n, cols, spread) {
    var o = ''; spread = spread || 1;
    for (var i = 0; i < n; i++) { var u = (r() - 0.5) * 0.85 * spread, v = (r() - 0.5) * 0.85 * spread, p = P(u, v, 0); o += '<circle cx="' + p[0].toFixed(1) + '" cy="' + (p[1] - 1).toFixed(1) + '" r="1.5" fill="' + cols[i % cols.length] + '"/>'; }
    return o;
  };

  // Shared gradients (rendered once per document and embedded in exported SVGs)
  A.defs = function () {
    function lg(id, a, b, x2, y2) { return '<linearGradient id="' + id + '" x1="0" y1="0" x2="' + (x2 == null ? 0 : x2) + '" y2="' + (y2 == null ? 1 : y2) + '"><stop offset="0" stop-color="' + a + '"/><stop offset="1" stop-color="' + b + '"/></linearGradient>'; }
    function rg(id, a, b) { return '<radialGradient id="' + id + '" cx=".35" cy=".3" r=".75"><stop offset="0" stop-color="' + a + '"/><stop offset="1" stop-color="' + b + '"/></radialGradient>'; }
    return '<defs>' +
      lg('daw-grass', '#9fd25a', '#5fa83a', 1, 1) + lg('daw-grass2', '#8fca50', '#56a03a', 1, 1) +
      lg('daw-water', '#5cc1ef', '#1f6fb8', 1, 1) + lg('daw-deep', '#2f8fd6', '#123f86', 1, 1) +
      lg('daw-sand', '#f7e2ae', '#ddb064', 1, 1) + lg('daw-rock', '#e08a58', '#a8492b', 1, 1) +
      lg('daw-snow', '#ffffff', '#c7e3f4', 1, 1) + lg('daw-ice', '#e9f7ff', '#8fc9ec', 0, 1) +
      lg('daw-pave', '#d7dbe0', '#aeb5bd', 1, 1) + lg('daw-dirt', '#c9a06a', '#8d6a3f', 1, 1) +
      lg('daw-sky', '#cfeaff', '#f4fbff') + lg('daw-pine', '#3f9a57', '#21673a') +
      lg('daw-cactus', '#7cc06a', '#3f8a49', 1, 0) + lg('daw-glass', '#bfe6ff', '#5aa7dc', 1, 1) +
      lg('daw-metal', '#f4f6f8', '#9aa4ae', 1, 0) + lg('daw-cloud', '#ffffff', '#c9d6e3') +
      lg('daw-storm', '#9aa9bb', '#5c6b7d') + lg('daw-mtnL', '#a99a8a', '#7d6e60') + lg('daw-mtnR', '#7a6b5d', '#54483d') +
      rg('daw-leaf', '#9ed46b', '#3f8d3c') + rg('daw-glow', 'rgba(255,240,150,.95)', 'rgba(255,220,90,0)') +
      rg('daw-sun', '#fff6b0', '#f7b733') + rg('daw-balloon', '#ff8a7a', '#d6342c') +
      '<filter id="daw-soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="1.4"/></filter>' +
      '</defs>';
  };

  // Ground tiles
  var GROUND = {
    grass: 'url(#daw-grass)', grass2: 'url(#daw-grass2)', water: 'url(#daw-water)', deep: 'url(#daw-deep)', sand: 'url(#daw-sand)',
    rock: 'url(#daw-rock)', snow: 'url(#daw-snow)', pave: 'url(#daw-pave)', dirt: 'url(#daw-dirt)'
  };
  A.ground = function (type, seed, opt) {
    opt = opt || {};
    var r = rng(seed || 1), d = [P(-0.5, -0.5), P(0.5, -0.5), P(0.5, 0.5), P(-0.5, 0.5)];
    var g = GROUND[type] || GROUND.grass;
    if (type === 'grass' && (seed % 3 === 0)) g = GROUND.grass2;
    var o = poly(d, g, opt.stroke === false ? '' : ' stroke="rgba(255,255,255,.18)" stroke-width=".8"');
    if (type === 'grass' || type === 'grass2') {
      for (var i = 0; i < 5; i++) { var u = (r() - 0.5) * 0.8, v = (r() - 0.5) * 0.8, p = P(u, v); o += '<path d="M' + p[0].toFixed(1) + ' ' + p[1].toFixed(1) + ' l-1.5 -3 M' + p[0].toFixed(1) + ' ' + p[1].toFixed(1) + ' l0 -3.6 M' + p[0].toFixed(1) + ' ' + p[1].toFixed(1) + ' l1.6 -3" stroke="#4d8f2e" stroke-width=".8" stroke-linecap="round" opacity=".7"/>'; }
    } else if (type === 'water' || type === 'deep') {
      for (var j = 0; j < 3; j++) { var p2 = P((r() - 0.5) * 0.6, (r() - 0.5) * 0.6); o += '<path d="M' + (p2[0] - 6).toFixed(1) + ' ' + p2[1].toFixed(1) + ' q3 -2.5 6 0 t6 0" fill="none" stroke="#ffffff" stroke-opacity=".55" stroke-width="1" stroke-linecap="round"/>'; }
    } else if (type === 'sand') {
      for (var k = 0; k < 3; k++) { var p3 = P((r() - 0.5) * 0.6, (r() - 0.5) * 0.6); o += '<path d="M' + (p3[0] - 9).toFixed(1) + ' ' + p3[1].toFixed(1) + ' q4.5 -3 9 0 t9 0" fill="none" stroke="#c4964f" stroke-opacity=".5" stroke-width=".9"/>'; }
    } else if (type === 'pave') {
      o += '<polygon points="' + pts([P(-0.5, -0.06), P(0.5, -0.06), P(0.5, 0.06), P(-0.5, 0.06)]) + '" fill="#8e969f" opacity=".35"/>';
    }
    return o;
  };
  A.lockedTile = function (seed) {
    var d = [P(-0.5, -0.5), P(0.5, -0.5), P(0.5, 0.5), P(-0.5, 0.5)], r = rng(seed + 7);
    var o = poly(d, '#b9c8bf', ' stroke="rgba(255,255,255,.35)" stroke-width=".8"');
    var cx = (r() - 0.5) * 16, cy = (r() - 0.5) * 6 - 6;
    o += '<g opacity=".92"><ellipse cx="' + cx + '" cy="' + cy + '" rx="20" ry="9" fill="#f4f8fb"/><ellipse cx="' + (cx + 12) + '" cy="' + (cy + 3) + '" rx="13" ry="7" fill="#e7eef4"/><ellipse cx="' + (cx - 11) + '" cy="' + (cy + 3) + '" rx="12" ry="6" fill="#eef3f7"/></g>';
    return o;
  };
})();
