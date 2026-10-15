/* Design a World: extra landform illustrations for the Field Guide (butte, floodplain, cave,
   alluvial fan, barrier island, waterfall, landslide, oxbow lake, natural arch). Original SVG. */
(function () {
  'use strict';
  var A = window.DAW_ART, P = A.P, poly = A.poly, shade = A.shade, pts = A.pts, I = A.item;
  function path(d, fill, extra) { return '<path d="' + d + '" fill="' + fill + '"' + (extra || '') + '/>'; }
  var STRATA = ['#8f3a22', '#c45a33', '#e8a46a', '#b54e2c', '#f2c591', '#d4703f'];
  function rocks(list, col) { return list.map(function (q) { return '<ellipse cx="' + q[0] + '" cy="' + q[1] + '" rx="' + (q[2] || 2.4) + '" ry="' + ((q[2] || 2.4) * 0.6) + '" fill="' + (col || '#a07a5a') + '"/>'; }).join(''); }

  I.butte = function () {
    var o = A.shadow(4, 6, 26, 10, 0.15);
    o += poly([P(-0.36, -0.36), P(0.36, -0.36), P(0.36, 0.36), P(-0.36, 0.36)], '#cf9563');
    o += rocks([[-20, 6, 3], [18, 8, 2.6], [-8, 14, 2.2], [12, -2, 2]], '#b0704a');
    o += A.strataBox(-0.16, -0.16, 0.16, 0.16, 0, 46, STRATA.concat(['#c86438', '#e8a46a']), '#b99a62');
    o += '<circle cx="-2" cy="-48" r="1.8" fill="#5d8a3f"/><circle cx="3" cy="-46" r="1.5" fill="#6f9b4a"/>';
    return o;
  };
  I.butte.ground = 'sand';

  I.floodplain = function () {
    var o = poly([P(-0.5, -0.5), P(0.5, -0.5), P(0.5, 0.5), P(-0.5, 0.5)], '#7c5a3a', ' opacity=".18"');
    var top = [], bot = [];
    for (var i = 0; i <= 10; i++) { var u = -0.5 + i / 10, c = Math.sin(i / 10 * Math.PI * 1.6) * 0.12 - 0.22; top.push(P(u, c - 0.08)); bot.push(P(u, c + 0.08)); }
    o += poly(top.concat(bot.slice().reverse()), 'url(#daw-water)');
    // flat rich silt fields with crop rows
    o += poly([P(-0.42, 0.0), P(0.42, 0.0), P(0.42, 0.44), P(-0.42, 0.44)], '#8a6a42');
    for (var k = 0; k < 6; k++) { var v = 0.04 + k * 0.07; o += '<polyline points="' + pts([P(-0.4, v), P(0.4, v)]) + '" stroke="#6f9b3a" stroke-width="2.2" stroke-linecap="round"/>'; }
    o += '<path d="M' + P(-0.5, -0.06).join(' ') + ' L' + P(0.5, -0.06).join(' ') + '" stroke="#c9a77a" stroke-width="3" opacity=".8"/>';
    o += '<path d="M' + P(-0.3, -0.02).join(' ') + ' q4 -2 8 0 M' + P(0.15, -0.03).join(' ') + ' q4 -2 8 0" stroke="#5aa7dc" stroke-width="1" fill="none" opacity=".6"/>';
    return o;
  };
  I.floodplain.ground = 'grass';

  I.cave = function () {
    var o = A.shadow(6, 6, 38, 12, 0.16);
    o += path('M-44 4 C-40 -24 -20 -40 4 -40 C26 -40 42 -24 44 4 L0 26 Z', '#bdb3a2');
    o += path('M4 -40 C26 -40 42 -24 44 4 L0 26 C8 4 10 -20 4 -40 Z', '#9c907e');
    o += path('M-24 -18 h20 M-30 -8 h24 M8 -28 h18 M14 -14 h22', 'none', ' stroke="#a69a88" stroke-width="1.2" stroke-linecap="round"');
    o += path('M-14 14 C-16 -4 -8 -16 2 -16 C12 -16 16 -4 14 12 L0 19 Z', '#2b2622');
    o += path('M-8 -12 l2 7 l2 -8 M2 -16 l1.5 8 l1.5 -8 M8 -12 l1 6 l2 -6', '#d9cfbd');
    o += path('M-6 16 l2 -7 l2 6 M6 14 l1.6 -6 l1.6 5', '#cfc4b0');
    o += '<ellipse cx="0" cy="18" rx="9" ry="3" fill="#4dabf7" opacity=".6"/>';
    o += '<circle cx="-30" cy="-30" r="3" fill="#5d8a3f"/><circle cx="28" cy="-30" r="2.6" fill="#5d8a3f"/><circle cx="-36" cy="-20" r="2.2" fill="#6f9b4a"/>';
    return o;
  };
  I.cave.ground = 'rock';

  I.fan = function () {
    var o = '';
    o += path('M-48 -2 L-20 -46 L6 -30 L-6 -10 Z', 'url(#daw-mtnL)');
    o += path('M6 -30 L-6 -10 L-20 -46 Z', 'url(#daw-mtnR)', ' opacity=".8"');
    o += path('M-14 -18 C10 -18 34 -6 44 6 C30 18 6 24 -6 22 C-18 14 -22 -2 -14 -18 Z', '#e2c48c');
    o += path('M-14 -18 C-2 -10 18 2 30 14 M-14 -18 C-6 -4 4 10 12 22 M-14 -18 C0 -12 30 -4 44 6', 'none', ' stroke="#c69c5a" stroke-width="1.4" stroke-linecap="round"');
    o += path('M-20 -40 q4 10 0 14 q-2 6 6 8', 'none', ' stroke="#5aa7dc" stroke-width="2" stroke-linecap="round"');
    o += rocks([[-8, -12, 2.2], [4, -4, 1.8], [16, 4, 1.6], [24, 12, 1.4], [-2, 8, 1.6]], '#a78b62');
    return o;
  };
  I.fan.ground = 'sand';

  I.barrier = function () {
    var o = poly([P(-0.5, -0.5), P(0.5, -0.5), P(0.5, 0.5), P(-0.5, 0.5)], 'url(#daw-water)');
    o += poly([P(-0.5, -0.16), P(0.5, -0.06), P(0.5, 0.1), P(-0.5, 0.0)], '#f2dca4');
    o += poly([P(-0.5, -0.1), P(0.5, 0.0), P(0.5, 0.05), P(-0.5, -0.05)], '#e6c784');
    o += '<polyline points="' + pts([P(-0.5, 0.03), P(0.5, 0.13)]) + '" fill="none" stroke="#ffffff" stroke-width="1.6" opacity=".85"/>';
    [[-0.3, -0.06], [-0.05, -0.03], [0.22, 0.0]].forEach(function (q) { var p = P(q[0], q[1]); o += '<path d="M' + p[0] + ' ' + p[1] + ' q-2 -6 -5 -8 M' + p[0] + ' ' + p[1] + ' q1 -7 4 -9 M' + p[0] + ' ' + p[1] + ' v-8" stroke="#7a9a4a" stroke-width="1.2" fill="none" stroke-linecap="round"/>'; });
    o += '<path d="M-30 -20 q4 -2 8 0 M10 -24 q4 -2 8 0 M-6 24 q4 -2 8 0" stroke="#e9f8ff" stroke-width="1" fill="none"/>';
    return o;
  };
  I.barrier.ground = 'water';

  I.waterfall = function () {
    var o = '';
    o += A.strataBox(-0.5, -0.5, 0.5, -0.02, 0, 30, ['#7d6e60', '#8f8070', '#a39383', '#8a7b6b'], '#7fae5a');
    o += poly([P(-0.08, -0.5, 30), P(0.08, -0.5, 30), P(0.08, -0.02, 30), P(-0.08, -0.02, 30)], 'url(#daw-water)');
    o += poly([P(-0.08, -0.02, 30), P(0.08, -0.02, 30), P(0.08, -0.02, 0), P(-0.08, -0.02, 0)], '#7cc7f2');
    o += path('M' + P(-0.05, -0.02, 28).join(' ') + ' v26 M' + P(0.0, -0.02, 29).join(' ') + ' v27 M' + P(0.05, -0.02, 28).join(' ') + ' v26', 'none', ' stroke="#ffffff" stroke-width="1" opacity=".75"');
    o += poly([P(-0.2, -0.02), P(0.2, -0.02), P(0.2, 0.5), P(-0.2, 0.5)], 'url(#daw-water)');
    o += '<ellipse cx="' + P(0, 0.04)[0] + '" cy="' + P(0, 0.04)[1] + '" rx="10" ry="3.5" fill="#ffffff" opacity=".75"/>';
    o += A.tree(-0.35, 0.2, 0.7, 'oak') + A.tree(0.35, 0.3, 0.6, 'pine');
    return o;
  };

  I.landslide = function () {
    var o = A.shadow(6, 8, 38, 12, 0.16);
    o += path('M-46 6 L-10 -52 L4 -46 L10 20 Z', 'url(#daw-mtnL)');
    o += path('M4 -46 L44 4 L10 20 Z', 'url(#daw-mtnR)');
    o += path('M-12 -44 C-18 -26 -14 -10 -4 2 C6 10 18 14 30 16 L22 22 C4 22 -10 14 -18 2 C-24 -12 -22 -30 -12 -44 Z', '#a8875f');
    o += path('M-12 -44 L-4 -46 L-6 -38 Z', '#6b5a48');
    o += rocks([[-14, -20, 3], [-8, -6, 3.4], [2, 4, 3], [12, 10, 2.6], [22, 16, 3.2], [-18, -2, 2.2], [6, 16, 2.4], [28, 20, 2]], '#7d6a55');
    o += path('M-2 -30 l6 4 M4 -18 l6 4 M12 -6 l6 3', 'none', ' stroke="#e9ecef" stroke-width="1.2" stroke-linecap="round" opacity=".8"');
    return o;
  };
  I.landslide.ground = 'dirt';

  I.oxbow = function () {
    var o = '';
    var river = [], rb = [];
    for (var i = 0; i <= 10; i++) { var v = -0.5 + i / 10, c = 0.3 + Math.sin(i / 10 * Math.PI) * 0.06; river.push(P(c - 0.07, v)); rb.push(P(c + 0.07, v)); }
    o += poly(river.concat(rb.slice().reverse()), 'url(#daw-water)');
    // crescent lake
    var outer = [], inner = [];
    for (var k = 0; k <= 16; k++) { var a = Math.PI * (0.15 + 0.7 * k / 16); outer.push(P(-0.05 + Math.cos(a) * -0.3, Math.sin(a) * 0.34 - 0.18)); inner.push(P(-0.05 + Math.cos(a) * -0.18, Math.sin(a) * 0.22 - 0.18)); }
    o += poly(outer.concat(inner.slice().reverse()), 'url(#daw-water)');
    o += '<polyline points="' + pts(outer) + '" fill="none" stroke="#c9a77a" stroke-width="2.4"/>';
    o += A.tree(-0.1, -0.15, 0.6, 'oak') + A.tree(0.05, 0.3, 0.55, 'oak');
    o += '<path d="M-30 6 v-5 M-28 6 v-6 M-26 6 v-4" stroke="#4f7d2e" stroke-width="1" stroke-linecap="round"/>';
    return o;
  };

  I.arch = function () {
    var o = A.shadow(6, 6, 36, 11, 0.15);
    o += path('M-40 6 L-38 -34 L36 -34 L40 6 L22 6 L22 -6 C22 -22 -20 -22 -20 -6 L-20 6 Z', '#d0784a');
    o += path('M36 -34 L44 -26 L46 12 L40 6 Z', '#a8552f');
    o += path('M-38 -34 L36 -34 L44 -26 L-30 -26 Z', '#e89a68');
    o += path('M-36 -22 h14 M-34 -12 h10 M26 -24 h10 M28 -14 h8', 'none', ' stroke="#b25a32" stroke-width="1.2" stroke-linecap="round"');
    o += path('M-20 6 L-20 -6 C-20 -22 22 -22 22 -6 L22 6 L16 6 C16 -12 -14 -12 -14 6 Z', '#a8552f', ' opacity=".55"');
    o += '<circle cx="-30" cy="-38" r="2.2" fill="#5d8a3f"/><circle cx="26" cy="-38" r="2" fill="#6f9b4a"/>';
    return o;
  };
  I.arch.ground = 'sand';
})();
