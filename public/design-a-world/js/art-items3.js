/* Design a World: item illustrations, part 3 (space, resources, forces, ecosystems, free items),
   plus organism icons, category glyphs, and mission diagrams. */
(function () {
  'use strict';
  var A = window.DAW_ART, P = A.P, poly = A.poly, shade = A.shade;
  var I = A.item;
  function path(d, fill, extra) { return '<path d="' + d + '" fill="' + fill + '"' + (extra || '') + '/>'; }

  // ---- space ----
  I.observatory = function () {
    var o = A.shadow(4, 8, 30, 10);
    o += A.box(-0.28, -0.28, 0.28, 0.28, 0, 16, '#e9edf0');
    var c = P(0, 0, 16);
    o += '<path d="M' + (c[0] - 20) + ' ' + c[1] + ' a20 20 0 0 1 40 0 z" fill="url(#daw-metal)"/><path d="M' + (c[0] - 3) + ' ' + (c[1] - 19.7) + ' h6 v19.7 h-6z" fill="#34495e"/>';
    o += '<line x1="' + c[0] + '" y1="' + (c[1] - 10) + '" x2="' + (c[0] + 10) + '" y2="' + (c[1] - 26) + '" stroke="#2c3e50" stroke-width="3" stroke-linecap="round"/>';
    o += '<g transform="translate(-30 -44)"><circle r="5" fill="#f5f0dc"/><circle cx="2" cy="-1" r="4.4" fill="#cdd9ea"/></g><path d="M26 -50 l1 2 l2 .3 l-1.5 1.4 l.4 2 l-1.9 -1 l-1.9 1 l.4 -2 l-1.5 -1.4 l2 -.3z" fill="#f6c90e"/>';
    return o;
  };
  I.overlook = function () {
    var o = A.strataBox(-0.46, -0.46, 0.46, 0.46, 0, 10, ['#b54e2c', '#e8a46a', '#c45a33'], '#9fc46a');
    o += '<path d="M-30 -8 L22 -34" stroke="#6b4423" stroke-width="1.2"/><path d="M-30 -14 L22 -40" stroke="#6b4423" stroke-width="1.2"/>';
    for (var i = 0; i < 5; i++) { var x = -30 + i * 13, y = -8 - i * 6.5; o += '<line x1="' + x + '" y1="' + y + '" x2="' + x + '" y2="' + (y - 8) + '" stroke="#6b4423" stroke-width="1.2"/>'; }
    o += A.box(-0.04, 0.0, 0.2, 0.08, 10, 4, '#a8763e') + A.person(10, -10, '#8e44ad', 0.9);
    o += '<path d="M10 -10 L40 4" stroke="#1d3b2a" stroke-width="2.4" opacity=".25" stroke-linecap="round"/>';
    o += '<circle cx="-40" cy="-36" r="7" fill="url(#daw-sun)"/><circle cx="-40" cy="-36" r="14" fill="url(#daw-glow)" opacity=".6"/>';
    return o;
  };
  I.sundial = function () {
    var o = '<ellipse cx="0" cy="4" rx="30" ry="14" fill="#c9b99a"/><ellipse cx="0" cy="2" rx="26" ry="12" fill="#e6dcc6"/>';
    for (var h = 0; h < 12; h++) { var a = Math.PI * (h / 11), x = Math.cos(a) * 22, y = 2 - Math.sin(a) * 10; o += '<line x1="' + (x * 0.82).toFixed(1) + '" y1="' + (2 - Math.sin(a) * 8.2).toFixed(1) + '" x2="' + x.toFixed(1) + '" y2="' + y.toFixed(1) + '" stroke="#8a7b62" stroke-width=".7"/>'; }
    o += '<path d="M0 2 L22 -2 L18 6 Z" fill="#1d3b2a" opacity=".3"/><path d="M-1 2 L1 2 L0 -18 Z" fill="#7a6a50"/><path d="M0 2 L0 -18 L6 2 Z" fill="#a8946f"/>';
    o += A.tree(-0.42, -0.1, 0.55, 'oak') + A.tree(0.38, -0.4, 0.5, 'oak');
    return o;
  };
  // ---- resources ----
  I.oilwell = function () {
    var o = A.shadow(2, 8, 30, 9);
    o += A.box(-0.36, -0.12, 0.3, 0.12, 0, 3, '#7f8c8d');
    o += '<path d="M-6 0 L0 -26 L6 0" stroke="#34495e" stroke-width="2" fill="none"/>';
    o += '<g transform="rotate(-8 0 -26)"><rect x="-26" y="-29" width="40" height="5" rx="1.5" fill="#2c3e50"/><path d="M-26 -31 q-7 4 -6 12 l5 -3 q-1 -5 3 -6 z" fill="#2c3e50"/><line x1="-29" y1="-18" x2="-29" y2="2" stroke="#2c3e50" stroke-width=".8"/></g>';
    o += '<rect x="10" y="-12" width="10" height="12" fill="#c0392b"/><circle cx="15" cy="-8" r="5" fill="#2c3e50" stroke="#95a5a6"/>';
    o += '<ellipse cx="28" cy="14" rx="7" ry="3" fill="#bdc3c7"/><rect x="21" y="2" width="14" height="12" fill="url(#daw-metal)"/><ellipse cx="28" cy="2" rx="7" ry="3" fill="#ecf0f1"/>';
    return o;
  };
  I.oilwell.ground = 'dirt';
  I.recycle = function () {
    var o = A.shadow(4, 8, 36, 11);
    o += A.building(-0.4, -0.4, 0.2, 0.0, 16, '#5fae6a', '#2e6b4a', { door: '#24513a', roofH: 9 });
    var cols = ['#2f7fd0', '#3fa34d', '#f2b600'];
    for (var i = 0; i < 3; i++) { var u = -0.1 + i * 0.16; o += A.box(u, 0.14, u + 0.12, 0.28, 0, 9, cols[i]); }
    o += '<g transform="translate(-14 -34)"><circle r="6.5" fill="#fff" stroke="#2e6b4a" stroke-width="1.2"/><path d="M-3 2 l3 -5 l3 5 z M-3 2" fill="none" stroke="#2e6b4a" stroke-width="1.2"/></g>';
    return o;
  };
  function turbine(x, y, h, rot) {
    var o = A.shadow(x + 2, y, 6, 2);
    o += '<path d="M' + (x - 1.6) + ' ' + y + ' L' + (x - 0.7) + ' ' + (y - h) + ' L' + (x + 0.7) + ' ' + (y - h) + ' L' + (x + 1.6) + ' ' + y + ' Z" fill="url(#daw-metal)"/>';
    o += '<g transform="translate(' + x + ' ' + (y - h) + ')"><g transform="rotate(' + rot + ')">';
    for (var i = 0; i < 3; i++) o += '<path d="M0 0 L-1.6 -2 L0 -22 L1.6 -2 Z" fill="#f7f9fa" stroke="#c7ced4" stroke-width=".4" transform="rotate(' + (i * 120) + ')"/>';
    o += '</g><circle r="1.8" fill="#dfe4e8" stroke="#aab3bb" stroke-width=".4"/></g>';
    return o;
  }
  I.windfarm = function () { return turbine(-14, 2, 46, 10) + turbine(16, 14, 40, 50); };
  I.farm = function () {
    var o = '';
    for (var r = 0; r < 6; r++) { var v = -0.45 + r * 0.08; o += poly([P(0.0, v), P(0.46, v), P(0.46, v + 0.04), P(0.0, v + 0.04)], '#4f8f2e'); }
    o += A.building(-0.44, -0.04, -0.06, 0.32, 16, '#b33a2c', '#5b4a42', { windows: false, roofH: 12 });
    var d = P(-0.25, 0.32, 0); o += '<rect x="' + (d[0] - 4) + '" y="' + (d[1] - 11) + '" width="8" height="10" fill="#fff" opacity=".9"/><path d="M' + (d[0] - 4) + ' ' + (d[1] - 11) + ' l8 10 M' + (d[0] + 4) + ' ' + (d[1] - 11) + ' l-8 10" stroke="#b33a2c" stroke-width="1"/>';
    o += '<rect x="20" y="-30" width="9" height="30" fill="url(#daw-metal)"/><ellipse cx="24.5" cy="-30" rx="4.5" ry="3" fill="#95a5a6"/>';
    return o;
  };
  I.farm.ground = 'dirt';
  // ---- forces ----
  I.sportsfield = function () {
    var o = poly([P(-0.46, -0.46), P(0.46, -0.46), P(0.46, 0.46), P(-0.46, 0.46)], '#6cbf4a');
    o += '<polygon points="' + A.pts([P(-0.42, -0.42), P(0.42, -0.42), P(0.42, 0.42), P(-0.42, 0.42)]) + '" fill="none" stroke="#fff" stroke-width="1"/><line x1="' + P(0, -0.42)[0] + '" y1="' + P(0, -0.42)[1] + '" x2="' + P(0, 0.42)[0] + '" y2="' + P(0, 0.42)[1] + '" stroke="#fff" stroke-width="1"/>';
    o += '<line x1="-22" y1="-11" x2="22" y2="11" stroke="#a8763e" stroke-width="1.6"/><rect x="-1.5" y="-2" width="3" height="4" fill="#e74c3c"/>';
    o += A.person(-26, -10, '#d63a2f') + A.person(-20, -7, '#d63a2f') + A.person(20, 13, '#2f6fb3') + A.person(26, 16, '#2f6fb3');
    return o;
  };
  I.rockettrack = function () {
    var o = '<line x1="-30" y1="6" x2="-30" y2="-34" stroke="#6b4423" stroke-width="2"/><line x1="30" y1="14" x2="30" y2="-20" stroke="#6b4423" stroke-width="2"/>';
    o += '<line x1="-30" y1="-32" x2="30" y2="-18" stroke="#ecf0f1" stroke-width=".8"/>';
    o += '<g transform="translate(4 -24) rotate(13)"><ellipse cx="0" cy="5" rx="10" ry="6" fill="url(#daw-balloon)"/><rect x="-5" y="-1" width="10" height="2" fill="#f1c40f"/><path d="M-10 5 l-3 -1.5 v3 z" fill="#c0392b"/><path d="M-14 3 h-8 M-15 6 h-10 M-14 9 h-7" stroke="#fff" stroke-width="1" stroke-linecap="round"/></g>';
    for (var i = 0; i < 4; i++) { var p = P(-0.3 + i * 0.2, 0.32); o += '<line x1="' + p[0] + '" y1="' + p[1] + '" x2="' + p[0] + '" y2="' + (p[1] - 3) + '" stroke="#fff" stroke-width="1"/>'; }
    return o;
  };
  I.ramplab = function () {
    var o = A.shadow(0, 8, 30, 8);
    o += A.box(-0.42, -0.1, -0.2, 0.12, 0, 6, '#2f6fb3') + A.box(-0.42, -0.1, -0.2, 0.12, 6, 6, '#d63a2f') + A.box(-0.42, -0.1, -0.2, 0.12, 12, 6, '#27ae60');
    o += poly([P(-0.2, -0.06, 18), P(-0.2, 0.08, 18), P(0.36, 0.08, 0), P(0.36, -0.06, 0)], '#d9b77e');
    o += poly([P(-0.2, 0.08, 18), P(0.36, 0.08, 0), P(-0.2, 0.08, 0)], '#b8935a');
    var c = P(0.46, 0.06, 0); o += '<rect x="' + (c[0] - 6) + '" y="' + (c[1] - 6) + '" width="11" height="4.5" rx="1.6" fill="#e67e22"/><circle cx="' + (c[0] - 3.5) + '" cy="' + (c[1] - 1) + '" r="1.7" fill="#2c3e50"/><circle cx="' + (c[0] + 2.5) + '" cy="' + (c[1] - 1) + '" r="1.7" fill="#2c3e50"/>';
    return o;
  };
  // ---- ecosystems ----
  function tufts(r, n, col, h) { var o = ''; for (var i = 0; i < n; i++) { var p = P((r() - 0.5) * 0.85, (r() - 0.5) * 0.85); o += '<path d="M' + p[0].toFixed(1) + ' ' + p[1].toFixed(1) + ' q-2 -' + h + ' -4 -' + (h + 2) + ' M' + p[0].toFixed(1) + ' ' + p[1].toFixed(1) + ' q0 -' + h + ' 1 -' + (h + 3) + ' M' + p[0].toFixed(1) + ' ' + p[1].toFixed(1) + ' q2 -' + h + ' 4 -' + (h + 1) + '" stroke="' + col + '" stroke-width="1" fill="none" stroke-linecap="round"/>'; } return o; }
  function bison(x, y, s) { s = s || 1; return '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')">' + A.shadow(0, 0, 9, 2.4) + '<path d="M-8 -2 q-1 -8 6 -9 q6 -1 9 2 q3 1 3 6 l0 3 h-2 v-2 h-10 v2 h-2 z" fill="#5a3b24"/><path d="M-8 -8 q-4 1 -4 5 l3 1 z" fill="#3d2716"/><path d="M-11 -7 l-1.5 -1.5" stroke="#e8dcc0" stroke-width=".6"/></g>'; }
  I.prairie = function (seed) {
    var r = A.rng(seed || 3), o = tufts(r, 14, '#b9a24a', 6) + tufts(r, 8, '#6f9b3a', 5);
    o += A.flowers(r, 10, ['#3b5bdb', '#4c6ef5', '#f59f00', '#e8590c']);
    o += bison(6, 6, 1.1);
    return o;
  };
  I.forest = function () { return A.tree(-0.25, -0.25, 1, 'pine') + A.tree(0.2, -0.3, 0.9, 'oak') + A.tree(-0.3, 0.15, 0.85, 'oak') + A.tree(0.25, 0.15, 1.05, 'pine') + A.tree(0.02, 0.38, 0.8, 'oak') + '<path d="M-36 6 h10" stroke="#7a5230" stroke-width="2.4" stroke-linecap="round"/><circle cx="-26" cy="4" r="2" fill="#c0392b"/><circle cx="-25" cy="3.4" r=".6" fill="#fff"/>'; };
  I.meadow = function (seed) {
    var r = A.rng(seed || 5), o = tufts(r, 10, '#5e9c34', 4) + A.flowers(r, 16, ['#ffffff', '#f7d046', '#e64980', '#9c36b5']);
    o += '<g transform="translate(-10 4)">' + A.shadow(0, 2, 5, 1.6) + '<ellipse cx="0" cy="-2" rx="5" ry="3.6" fill="#a68a6d"/><circle cx="4" cy="-5" r="2.6" fill="#a68a6d"/><ellipse cx="4" cy="-10" rx="1" ry="3" fill="#a68a6d"/><ellipse cx="5.6" cy="-9.6" rx="1" ry="3" fill="#b89c7f"/><circle cx="-5" cy="-2" r="1.4" fill="#fff"/></g>';
    o += '<path d="M8 -40 q6 -5 12 0 q6 -5 12 0" stroke="#5a3b24" stroke-width="2" fill="none" stroke-linecap="round"/>';
    return o;
  };
  I.pond = function () {
    var o = '<ellipse cx="-2" cy="2" rx="32" ry="14" fill="#7a6a3a"/><ellipse cx="-2" cy="2" rx="29" ry="12" fill="#3f8f8a"/><ellipse cx="-6" cy="0" rx="18" ry="6" fill="#5fb3a8" opacity=".5"/>';
    [[-16, 2], [-4, 8], [8, -2]].forEach(function (p) { o += '<path d="M' + p[0] + ' ' + p[1] + ' m-4 0 a4 2 0 1 0 8 0 l-4 0 z" fill="#4c9a3c"/>'; });
    o += '<circle cx="-4" cy="6.5" r="1.2" fill="#f8c8dc"/>';
    o += '<path d="M24 4 v-14 M27 6 v-16 M21 6 v-11" stroke="#5f7d2e" stroke-width="1.1"/><rect x="23" y="-14" width="2" height="5" rx="1" fill="#7a4e2a"/><rect x="26" y="-15" width="2" height="5" rx="1" fill="#7a4e2a"/>';
    o += '<g transform="translate(-26 -2)"><path d="M0 0 v-8" stroke="#6c7a89" stroke-width=".8"/><ellipse cx="1" cy="-12" rx="4" ry="3" fill="#8fa3b5"/><path d="M3 -14 q2 -6 0 -9" stroke="#8fa3b5" stroke-width="1.6" fill="none"/><path d="M0 -23 l-5 1" stroke="#e0a800" stroke-width="1"/></g>';
    return o;
  };
  I.preserve = function (seed) {
    var r = A.rng(seed || 9), o = A.flowers(r, 14, ['#3b5bdb', '#e8590c', '#fcc419']);
    o += A.tree(-0.28, -0.3, 0.9, 'oak') + A.tree(0.3, -0.2, 0.8, 'pine') + A.tree(-0.36, 0.1, 0.7, 'pine');
    o += '<rect x="8" y="2" width="16" height="9" rx="1.5" fill="#7a5230"/><rect x="9.5" y="3.5" width="13" height="6" rx="1" fill="#a8763e"/><path d="M11 7 q3 -3 5 0 q2 -3 5 0" stroke="#3f6b3a" fill="none" stroke-width="1"/><line x1="12" y1="11" x2="12" y2="18" stroke="#5a3a1e" stroke-width="1.2"/><line x1="20" y1="11" x2="20" y2="18" stroke="#5a3a1e" stroke-width="1.2"/>';
    return o;
  };
  I.desert = function () {
    var o = A.tree(-0.25, -0.15, 1.1, 'cactus') + A.tree(0.28, -0.25, 0.9, 'yucca') + A.tree(0.18, 0.3, 0.8, 'cactus');
    o += '<ellipse cx="-24" cy="12" rx="6" ry="3" fill="#b08a5a"/><ellipse cx="-25" cy="11" rx="3" ry="1.4" fill="#c9a476"/>';
    o += '<g transform="translate(-4 14)"><ellipse cx="0" cy="0" rx="5" ry="2.4" fill="#b8925e"/><path d="M5 0 l4 1 M-5 0 l-5 2" stroke="#b8925e" stroke-width="1.2"/><circle cx="-2" cy="-1" r=".6" fill="#7a5a30"/><circle cx="1" cy="-.6" r=".6" fill="#7a5a30"/></g>';
    return o;
  };
  I.desert.ground = 'sand';
  I.beach = function () {
    var o = poly([P(0.05, -0.5), P(0.5, -0.5), P(0.5, 0.5), P(-0.05, 0.5)], 'url(#daw-water)');
    o += '<path d="' + 'M' + P(0.05, -0.5).join(' ') + ' Q' + P(0.12, -0.1).join(' ') + ' ' + P(0, 0.1).join(' ') + ' T' + P(-0.05, 0.5).join(' ') + '" stroke="#fff" stroke-width="1.6" fill="none" opacity=".85"/>';
    o += '<ellipse cx="-22" cy="-2" rx="9" ry="4" fill="#d9b46a"/>';
    [[-14, 0, 20], [-6, 3, 22], [2, 6, 25], [-10, 8, 20]].forEach(function (t) { o += '<g transform="translate(' + t[0] + ' ' + t[1] + ') rotate(' + t[2] + ')"><ellipse rx="2.6" ry="1.8" fill="#3a5a40"/><circle cx="2.8" cy="0" r="1" fill="#556b4a"/></g>'; });
    o += '<path d="M-2 -18 v-10 M-2 -28 q-8 -2 -12 4 M-2 -28 q8 -3 12 3 M-2 -28 q-3 -6 -8 -6 M-2 -28 q4 -7 9 -5" stroke="#3f8a3a" stroke-width="1.6" fill="none" stroke-linecap="round"/><path d="M-3 -18 q1 -6 1 -10" stroke="#8c6239" stroke-width="1.8" fill="none"/>';
    return o;
  };
  I.beach.ground = 'sand';
  I.orcapod = function () {
    function fin(x, y, s) { return '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')"><ellipse cx="0" cy="0" rx="12" ry="3" fill="#0f1a24"/><path d="M-2 -1 Q0 -14 4 -16 Q2 -8 4 -1 Z" fill="#0f1a24"/><ellipse cx="6" cy="-.6" rx="3" ry="1.2" fill="#f4f7fa"/><path d="M-14 1 q-4 -3 -2 -6" stroke="#0f1a24" stroke-width="1.6" fill="none"/><path d="M-12 2 q12 3 24 0" stroke="#fff" stroke-width=".8" opacity=".6" fill="none"/></g>'; }
    return fin(-12, -2, 1) + fin(14, 8, 0.8) + fin(0, 14, 0.6);
  };
  I.orcapod.ground = 'deep';
  // ---- free decor ----
  I.plain = function (seed) { var r = A.rng(seed || 2); return tufts(r, 8, '#4f8f2e', 4) + A.flowers(r, 6, ['#fff', '#f7d046', '#3b5bdb']); };
  I.road = function () { return '<polygon points="' + A.pts([P(-0.5, -0.16), P(0.5, -0.16), P(0.5, 0.16), P(-0.5, 0.16)]) + '" fill="#6c757d"/><line x1="' + P(-0.45, 0)[0] + '" y1="' + P(-0.45, 0)[1] + '" x2="' + P(0.45, 0)[0] + '" y2="' + P(0.45, 0)[1] + '" stroke="#fff3bf" stroke-width="1.2" stroke-dasharray="4 4"/>'; };
  I.trees = function () { return A.tree(-0.2, -0.2, 0.9, 'oak') + A.tree(0.2, 0.0, 1, 'pine') + A.tree(-0.1, 0.3, 0.75, 'oak'); };

  // ---- organism icons (64x64 viewBox, centred at 32,32) ----
  var ORG = A.organism = {
    grass: '<path d="M14 54 q2 -20 -4 -32 M22 54 q0 -24 4 -38 M30 54 q-2 -18 -8 -28 M38 54 q2 -26 10 -36 M46 54 q0 -16 6 -24" stroke="#4f9a2e" stroke-width="3.4" fill="none" stroke-linecap="round"/><path d="M10 54 h44" stroke="#7a5a30" stroke-width="3" stroke-linecap="round"/>',
    rabbit: '<ellipse cx="30" cy="40" rx="16" ry="11" fill="#b08f6e"/><circle cx="44" cy="30" r="8" fill="#b08f6e"/><ellipse cx="42" cy="14" rx="3" ry="10" fill="#b08f6e"/><ellipse cx="48" cy="15" rx="3" ry="10" fill="#c4a383"/><circle cx="47" cy="29" r="1.4" fill="#222"/><circle cx="15" cy="38" r="4" fill="#fff"/><ellipse cx="38" cy="50" rx="6" ry="3" fill="#9a7a5a"/>',
    mouse: '<ellipse cx="30" cy="40" rx="14" ry="9" fill="#9e9e9e"/><circle cx="42" cy="34" r="7" fill="#a8a8a8"/><circle cx="40" cy="26" r="5" fill="#bdbdbd"/><circle cx="40" cy="26" r="2.6" fill="#f3b4c4"/><circle cx="46" cy="33" r="1.3" fill="#222"/><path d="M16 42 q-10 4 -8 12" stroke="#c48b9f" stroke-width="2" fill="none"/>',
    snake: '<path d="M10 46 q10 -14 20 0 t20 0 q6 -10 2 -20" stroke="#5f8f3a" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M10 46 q10 -14 20 0 t20 0 q6 -10 2 -20" stroke="#a7c76a" stroke-width="2" fill="none" stroke-dasharray="3 5"/><ellipse cx="52" cy="22" rx="6" ry="4.6" fill="#5f8f3a"/><circle cx="54" cy="21" r="1.2" fill="#222"/><path d="M58 23 l5 1 m-5 -1 l5 -2" stroke="#d6336c" stroke-width="1"/>',
    hawk: '<path d="M32 30 L4 22 Q14 30 18 36 Z M32 30 L60 22 Q50 30 46 36 Z" fill="#7a5230"/><ellipse cx="32" cy="36" rx="7" ry="11" fill="#9c6b3c"/><circle cx="32" cy="24" r="5.6" fill="#9c6b3c"/><path d="M32 26 l3 2 l-3 1 z" fill="#f2c94c"/><circle cx="34" cy="23" r="1.2" fill="#222"/><path d="M28 47 l4 8 l4 -8 z" fill="#c0392b"/>',
    mushroom: '<rect x="27" y="32" width="10" height="20" rx="4" fill="#f4ead5"/><path d="M10 34 q22 -30 44 0 z" fill="#d6452f"/><circle cx="24" cy="24" r="3" fill="#fff"/><circle cx="38" cy="22" r="2.6" fill="#fff"/><circle cx="31" cy="29" r="2" fill="#fff"/><path d="M8 54 h48" stroke="#7a5a30" stroke-width="3" stroke-linecap="round"/>',
    algae: '<path d="M16 56 q-6 -14 2 -24 q8 -10 0 -22 M30 56 q6 -16 -2 -26 q-6 -8 2 -20 M44 56 q-6 -12 2 -22 q6 -8 0 -18" stroke="#2f9e44" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="20" cy="30" r="2" fill="#8ce99a"/><circle cx="40" cy="24" r="2" fill="#8ce99a"/>',
    tadpole: '<ellipse cx="26" cy="32" rx="12" ry="9" fill="#4a3f35"/><path d="M38 32 q10 -8 20 2 q-10 2 -20 2" fill="#6b5b4d"/><circle cx="22" cy="29" r="2" fill="#fff"/><circle cx="22" cy="29" r="1" fill="#000"/>',
    minnow: '<path d="M10 32 q16 -14 36 0 q-20 14 -36 0 z" fill="#adb5bd"/><path d="M46 32 l10 -8 v16 z" fill="#868e96"/><circle cx="18" cy="30" r="1.8" fill="#222"/><path d="M20 34 q12 3 24 -2" stroke="#e9ecef" stroke-width="1.4" fill="none"/>',
    bass: '<path d="M6 32 q20 -20 42 0 q-22 20 -42 0 z" fill="#5c940d"/><path d="M48 32 l12 -10 v20 z" fill="#4a7a0a"/><path d="M14 32 q16 6 32 0" stroke="#2b4a06" stroke-width="2.4" fill="none"/><circle cx="14" cy="28" r="2" fill="#ffd43b"/><path d="M6 33 l6 1" stroke="#2b4a06" stroke-width="1.6"/>',
    heron: '<path d="M30 58 v-18 M34 58 v-18" stroke="#495057" stroke-width="1.6"/><ellipse cx="34" cy="34" rx="12" ry="8" fill="#8fa3b5"/><path d="M26 30 q-6 -10 2 -18" stroke="#8fa3b5" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="29" cy="12" r="4" fill="#a5b6c6"/><path d="M26 12 l-12 2" stroke="#e0a800" stroke-width="2"/><circle cx="29" cy="11" r="1" fill="#222"/><path d="M44 30 l10 6" stroke="#6c7a89" stroke-width="3"/>',
    bacteria: '<g fill="#9775fa" stroke="#6741d9" stroke-width="1.2"><rect x="10" y="18" width="20" height="9" rx="4.5" transform="rotate(-20 20 22)"/><rect x="32" y="26" width="20" height="9" rx="4.5" transform="rotate(25 42 30)"/><circle cx="22" cy="42" r="6"/><rect x="34" y="42" width="16" height="8" rx="4"/></g>'
  };
  A.organismSvg = function (k, size) { return '<svg viewBox="0 0 64 64" width="' + (size || 48) + '" height="' + (size || 48) + '" aria-hidden="true">' + (ORG[k] || '<circle cx="32" cy="32" r="20" fill="#adb5bd"/>') + '</svg>'; };

  // ---- category / stage glyphs (24x24, currentColor) ----
  A.glyph = {
    landforms: '<path d="M2 20 L9 8 L13 14 L16 10 L22 20 Z" fill="currentColor"/>',
    water: '<path d="M12 3 C8 9 5 12 5 15 a7 7 0 0 0 14 0 c0 -3 -3 -6 -7 -12z" fill="currentColor"/>',
    weather: '<path d="M7 18 a4.5 4.5 0 0 1 .5 -9 a6 6 0 0 1 11 2 a3.5 3.5 0 0 1 -.5 7z" fill="currentColor"/>',
    ecosystems: '<path d="M5 19 C5 9 12 4 20 4 C20 13 15 19 6 19 M6 19 L14 11" fill="currentColor" stroke="currentColor" stroke-width="1.4"/>',
    people: '<path d="M3 20 V10 L8 6 L13 10 V20 Z M14 20 V4 H21 V20 Z" fill="currentColor"/>',
    resources: '<path d="M12 3 l3 5 h-6 z M5 13 l3 -2 l3 5 l-6 0 z M19 13 l-3 -2 l-3 5 l6 0 z" fill="currentColor"/><circle cx="12" cy="13" r="2" fill="currentColor"/>',
    energy: '<path d="M13 2 L5 13 h6 l-2 9 l9 -12 h-6 z" fill="currentColor"/>',
    space: '<circle cx="9" cy="12" r="5" fill="currentColor"/><path d="M17 5 a6 6 0 1 0 3 11 a5 5 0 0 1 -3 -11z" fill="currentColor"/>',
    matter: '<path d="M9 3 h6 M10 3 v6 l-5 10 a1.5 1.5 0 0 0 1.3 2 h11.4 a1.5 1.5 0 0 0 1.3 -2 l-5 -10 v-6" fill="none" stroke="currentColor" stroke-width="2"/><path d="M7.5 15 h9 l2 4 h-13z" fill="currentColor"/>',
    forces: '<path d="M2 12 h8 M7 8 l4 4 l-4 4 M22 12 h-8 M17 8 l-4 4 l4 4" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="2" fill="currentColor"/><path d="M8 11 V8 a4 4 0 0 1 8 0 v3" fill="none" stroke="currentColor" stroke-width="2"/>',
    check: '<path d="M5 12 l5 5 l9 -10" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>',
    speaker: '<path d="M4 9 h4 l5 -4 v14 l-5 -4 h-4 z" fill="currentColor"/><path d="M16 8 a5 5 0 0 1 0 8 M18.5 5.5 a8.5 8.5 0 0 1 0 13" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
    star: '<path d="M12 2 l3 6.5 l7 .8 l-5.2 4.8 l1.4 7 L12 17.6 L5.8 21 l1.4 -7 L2 9.3 l7 -.8z" fill="currentColor"/>',
    flag: '<path d="M5 21 V3 M5 4 h12 l-3 4 l3 4 h-12" fill="currentColor" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>'
  };
  A.icon = function (k, size) { return '<svg viewBox="0 0 24 24" width="' + (size || 20) + '" height="' + (size || 20) + '" aria-hidden="true">' + (A.glyph[k] || '') + '</svg>'; };

  // thumbnail of an item on its ground tile
  A.thumb = function (id, size, seed) {
    var f = I[id] || I.plain;
    return '<svg viewBox="-54 -74 108 104" width="' + (size || 64) + '" height="' + Math.round((size || 64) * 0.963) + '" aria-hidden="true">' + A.ground(f.ground || 'grass', seed || 4) + f(seed || 4) + '</svg>';
  };

  // ---- mission diagrams ----
  A.diagram = {};
  A.diagram.watercycle = function () {
    return '<svg viewBox="0 0 400 260" class="diagram" aria-label="Water cycle diagram">' +
      '<rect width="400" height="260" fill="url(#daw-sky)"/>' +
      '<circle cx="46" cy="42" r="22" fill="url(#daw-sun)"/><circle cx="46" cy="42" r="40" fill="url(#daw-glow)" opacity=".5"/>' +
      '<path d="M210 120 L280 70 L330 110 L400 80 L400 260 L190 260 Z" fill="#7d6e60"/><path d="M280 70 l-14 12 l10 -2 l6 8 l6 -10 z" fill="#fff"/>' +
      '<path d="M200 170 Q260 150 300 175 T400 170 L400 260 L180 260Z" fill="#6fb04a"/>' +
      '<path d="M0 200 Q100 190 200 205 L200 260 L0 260Z" fill="url(#daw-water)"/>' +
      '<path d="M380 180 Q300 200 260 215 T190 222" stroke="#3ea3e3" stroke-width="7" fill="none" stroke-linecap="round"/>' +
      '<g fill="#ffffff" stroke="#c7d3de"><ellipse cx="200" cy="52" rx="44" ry="20"/><ellipse cx="236" cy="62" rx="30" ry="16"/><ellipse cx="168" cy="62" rx="28" ry="14"/></g>' +
      '<g fill="url(#daw-storm)"><ellipse cx="320" cy="62" rx="36" ry="17"/><ellipse cx="290" cy="70" rx="22" ry="12"/></g>' +
      '<g stroke="#3a8fd6" stroke-width="2.4" stroke-linecap="round">' + [0, 1, 2, 3, 4, 5].map(function (i) { return '<line x1="' + (300 + i * 9) + '" y1="' + (86 + (i % 2) * 6) + '" x2="' + (294 + i * 9) + '" y2="' + (110 + (i % 2) * 6) + '"/>'; }).join('') + '</g>' +
      '<g stroke="#9bd0f2" stroke-width="3" fill="none" stroke-dasharray="4 6" stroke-linecap="round"><path d="M70 190 q-8 -40 4 -80"/><path d="M110 190 q-6 -50 10 -90"/></g>' +
      '<path d="M74 106 l-6 10 h12z M120 96 l-6 10 h12z" fill="#9bd0f2"/>' +
      '<path d="M235 205 l-14 10 l16 2" stroke="#1f6fb8" stroke-width="3" fill="none"/>' +
      '</svg>';
  };
  A.shadowArt = function (val) { // val -1..1 : negative = shadow to the west (left)
    var len = 10 + Math.abs(val) * 34, dir = val < 0 ? -1 : 1;
    if (Math.abs(val) < 0.05) len = 6;
    var sunX = 50 - val * 40, sunY = 18 + Math.abs(val) * 22;
    return '<svg viewBox="0 0 100 60" width="96" height="58" aria-hidden="true"><rect width="100" height="60" rx="6" fill="#e9f4fb"/><rect y="44" width="100" height="16" fill="#9fcf6a"/>' +
      '<circle cx="' + sunX + '" cy="' + sunY + '" r="6" fill="url(#daw-sun)"/>' +
      '<path d="M50 48 L' + (50 + dir * len * (Math.abs(val) < 0.05 ? 0.3 : 1)) + ' 50 L50 52 Z" fill="#1d3b2a" opacity=".45"/><rect x="48.8" y="28" width="2.4" height="20" fill="#6b4423"/>' +
      '<text x="6" y="56" font-size="7" fill="#2c3e50">W</text><text x="88" y="56" font-size="7" fill="#2c3e50">E</text></svg>';
  };
})();
