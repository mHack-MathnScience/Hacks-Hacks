/* Design a World: item illustrations, part 1 (landforms, water, weather). */
(function () {
  'use strict';
  var A = window.DAW_ART, P = A.P, poly = A.poly, shade = A.shade, pts = A.pts;
  var I = A.item = A.item || {};
  function path(d, fill, extra) { return '<path d="' + d + '" fill="' + fill + '"' + (extra || '') + '/>'; }
  function lerp(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]; }
  var STRATA = ['#8f3a22', '#c45a33', '#e8a46a', '#b54e2c', '#f2c591', '#d4703f'];

  // Plateau block with a carved V-notch canyon running from the back corner to the front corner.
  I.canyon = function (seed) {
    var H = 16, o = '', bands = STRATA, n = bands.length;
    // front faces with strata
    for (var k = 0; k < n; k++) {
      var za = H * k / n, zb = H * (k + 1) / n + 0.3;
      o += poly([[-48, -za], [0, 24 - za], [0, 24 - zb], [-48, -zb]], shade(bands[k], 0.02));
      o += poly([[0, 24 - za], [48, -za], [48, -zb], [0, 24 - zb]], shade(bands[k], -0.25));
    }
    // plateau top
    o += poly([[0, -24 - H], [48, -H], [0, 24 - H], [-48, -H]], '#cf9c63');
    // notch centreline (screen) back -> front
    var cl = [[0, -40], [6, -28], [-5, -16], [5, -4], [0, 8]];
    var rimL = cl.map(function (p) { return [p[0] - 14, p[1]]; }), rimR = cl.map(function (p) { return [p[0] + 14, p[1]]; });
    var flL = cl.map(function (p) { return [p[0] - 4, p[1] + 14]; }), flR = cl.map(function (p) { return [p[0] + 4, p[1] + 14]; });
    // clamp front rim onto the front faces
    rimL[4] = [-14, 1]; rimR[4] = [14, 1]; flL[4] = [-4, 22]; flR[4] = [4, 22];
    function wall(rim, fl, light) {
      var s = '';
      for (var b = 0; b < n; b++) {
        var t0 = 1 - b / n, t1 = 1 - (b + 1) / n - 0.01, top = [], bot = [];
        for (var i = 0; i < rim.length; i++) { top.push(lerp(rim[i], fl[i], t1)); bot.push(lerp(rim[i], fl[i], t0)); }
        s += poly(top.concat(bot.reverse()), shade(bands[b], light ? 0.08 : -0.3));
      }
      return s;
    }
    o += wall(rimR, flR, false) + wall(rimL, flL, true);
    o += poly(flL.concat(flR.slice().reverse()), '#b06a43');
    var rv = cl.map(function (p) { return [p[0] - 2.2, p[1] + 14]; }).concat(cl.map(function (p) { return [p[0] + 2.2, p[1] + 14]; }).reverse());
    rv[4] = [-2.2, 22.5]; rv[5] = [2.2, 22.5];
    o += poly(rv, 'url(#daw-water)');
    o += '<polyline points="' + pts(cl.map(function (p) { return [p[0], p[1] + 14]; })) + '" fill="none" stroke="#e8f7ff" stroke-width=".6" opacity=".8"/>';
    // junipers on rim
    var jr = [[-30, -20], [-24, -10], [26, -22], [32, -12], [-36, -14], [20, -6]];
    jr.forEach(function (p) { o += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="2.6" fill="#4f7d3a"/><circle cx="' + (p[0] - .8) + '" cy="' + (p[1] - .8) + '" r="1" fill="#7fae5a"/>'; });
    return o;
  };
  I.canyon.ground = 'rock';

  I.mesa = function () {
    var o = A.shadow(6, 6, 34, 12, 0.15);
    o += poly([P(-0.42, -0.42), P(0.42, -0.42), P(0.42, 0.42), P(-0.42, 0.42)], '#c98a5a'); // talus apron
    o += A.strataBox(-0.3, -0.3, 0.3, 0.3, 0, 34, STRATA.concat(['#c86438']), '#bfa36a');
    o += '<circle cx="-6" cy="-36" r="2.4" fill="#5d8a3f"/><circle cx="6" cy="-34" r="2" fill="#5d8a3f"/><circle cx="0" cy="-40" r="1.8" fill="#6f9b4a"/>';
    return o;
  };
  I.mesa.ground = 'sand';

  I.mountain = function () {
    var o = A.shadow(8, 8, 40, 13, 0.18);
    o += path('M-44 4 L-6 -60 L2 -54 L4 22 Z', 'url(#daw-mtnL)');
    o += path('M2 -54 L-6 -60 L44 0 L4 22 Z', 'url(#daw-mtnR)');
    o += path('M-6 -60 L-17 -41 L-11 -43 L-7 -37 L-2 -44 L4 -40 L12 -46 Z', '#ffffff');
    o += path('M-6 -60 L12 -46 L4 -40 L2 -54 Z', '#dfeaf2');
    o += path('M-30 -14 L-22 -8 M-18 -24 L-10 -18 M14 -18 L22 -12', 'none', ' stroke="#5d5045" stroke-width="1" opacity=".5"');
    o += A.tree(-0.32, 0.36, 0.7, 'pine') + A.tree(0.38, 0.3, 0.75, 'pine') + A.tree(0.12, 0.44, 0.6, 'pine');
    return o;
  };

  I.glacier = function () {
    var o = '';
    // exposed valley floor in front (left behind after retreat)
    o += poly([[-14, 0], [14, 0], [14, 17], [0, 24], [-14, 17]], '#9fbf7a');
    // left wall (lit inner face)
    o += path('M-48 0 L-42 -22 L-30 -40 L-18 -50 L-15 -36 Q-15 -6 -14 17 L-48 0 Z', '#8d8072');
    o += path('M-18 -50 L-15 -36 Q-15 -6 -14 17 L-24 12 Q-26 -14 -24 -40 Z', '#b3a594');
    o += path('M-30 -40 L-18 -50 L-15 -36 L-22 -38 L-26 -33 Z', '#ffffff');
    // right wall (shaded inner face)
    o += path('M48 0 L42 -22 L30 -40 L18 -50 L15 -36 Q15 -6 14 17 L48 0 Z', '#6f6357');
    o += path('M18 -50 L15 -36 Q15 -6 14 17 L22 12 Q25 -14 24 -40 Z', '#857868');
    o += path('M30 -40 L18 -50 L15 -36 L22 -37 L27 -31 Z', '#e3edf4');
    // glacier tongue filling the U wall to wall
    o += path('M-15 -40 L15 -40 Q15 -14 14 -2 Q0 6 -14 -2 Q-15 -14 -15 -40 Z', 'url(#daw-ice)');
    o += path('M-14 -2 Q0 6 14 -2 L14 2 Q0 10 -14 2 Z', '#7fb7da');
    o += path('M-8 -30 l6 3 M2 -22 l7 2 M-6 -14 l5 3', 'none', ' stroke="#9cc6e2" stroke-width="1" stroke-linecap="round"');
    // moraine piles + meltwater
    o += path('M0 6 Q-3 12 1 17 T0 23', 'none', ' stroke="#5cb8ea" stroke-width="1.6" stroke-linecap="round"');
    [[-10, 8], [-7, 12], [9, 9], [6, 14], [-4, 16], [11, 13]].forEach(function (p) { o += '<ellipse cx="' + p[0] + '" cy="' + p[1] + '" rx="2.2" ry="1.3" fill="#8d8d8d"/><ellipse cx="' + (p[0] - .5) + '" cy="' + (p[1] - .4) + '" rx="1" ry=".6" fill="#c4c4c4"/>'; });
    return o;
  };
  I.glacier.ground = 'grass';

  I.dune = function () {
    var o = '';
    o += path('M-40 4 C-26 -4 -12 -24 2 -24 C6 -18 10 -8 18 4 Z', '#f4dca2');
    o += path('M2 -24 C6 -18 10 -8 18 4 L4 4 C3 -6 3 -16 2 -24 Z', '#c9994f');
    o += path('M-6 12 C2 6 12 -6 22 -6 C26 -2 30 6 36 12 Z', '#f1d597');
    o += path('M22 -6 C26 -2 30 6 36 12 L24 12 C24 6 23 0 22 -6 Z', '#c08f48');
    o += path('M-32 0 q4 -3 8 -2 M-26 -6 q4 -3 8 -2 M-20 -12 q4 -3 7 -3 M0 6 q4 -3 8 -2 M6 1 q4 -3 7 -2', 'none', ' stroke="#d6ad66" stroke-width=".8" stroke-linecap="round"');
    o += path('M-46 -14 h10 M-44 -9 h14 M-46 -4 h8', 'none', ' stroke="#ffffff" stroke-width="1" stroke-linecap="round" opacity=".8"');
    return o;
  };
  I.dune.ground = 'sand';

  I.delta = function () {
    var land = [[-0.5, -0.14], [-0.5, 0.14], [-0.15, 0.34], [0.2, 0.43], [0.42, 0.22], [0.46, -0.04], [0.34, -0.3], [0.04, -0.42], [-0.22, -0.32]];
    var o = poly(land.map(function (q) { return P(q[0] * 1.06, q[1] * 1.06); }), '#cfe7f3', ' opacity=".6"'); // sediment plume
    o += poly(land.map(function (q) { return P(q[0], q[1]); }), 'url(#daw-sand)');
    o += poly([[-0.5, -0.1], [-0.5, 0.1], [-0.05, 0.24], [0.1, 0.1], [0.08, -0.18], [-0.2, -0.22]].map(function (q) { return P(q[0], q[1]); }), '#8fbf5a', ' opacity=".85"');
    function ch(list, w) { return '<polyline points="' + pts(list.map(function (q) { return P(q[0], q[1]); })) + '" fill="none" stroke="#3ea3e3" stroke-width="' + w + '" stroke-linecap="round" stroke-linejoin="round"/>'; }
    o += ch([[-0.5, 0], [-0.25, 0.01], [-0.05, 0.02]], 3.2);
    o += ch([[-0.05, 0.02], [0.18, 0.18], [0.36, 0.3]], 2) + ch([[-0.05, 0.02], [0.24, 0.0], [0.46, -0.02]], 2) + ch([[-0.05, 0.02], [0.12, -0.16], [0.3, -0.3]], 2);
    o += ch([[0.18, 0.18], [0.16, 0.38]], 1.2) + ch([[0.12, -0.16], [0.02, -0.38]], 1.2) + ch([[0.24, 0], [0.4, 0.14]], 1.1);
    return o;
  };
  I.delta.ground = 'water';

  I.river = function (seed) {
    var top = [], bot = [], bankT = [], bankB = [];
    for (var i = 0; i <= 10; i++) { var u = -0.5 + i / 10, c = Math.sin(i / 10 * Math.PI * 2) * 0.08; top.push(P(u, c - 0.1)); bot.push(P(u, c + 0.1)); bankT.push(P(u, c - 0.16)); bankB.push(P(u, c + 0.16)); }
    var o = poly(bankT.concat(bankB.slice().reverse()), '#d9c08a');
    o += poly(top.concat(bot.slice().reverse()), 'url(#daw-water)');
    o += '<polyline points="' + pts(top.map(function (p) { return [p[0] + 2, p[1] + 3]; })) + '" fill="none" stroke="#e9f8ff" stroke-width=".8" opacity=".7"/>';
    o += '<ellipse cx="-26" cy="-2" rx="2.4" ry="1.4" fill="#8e8e8e"/><ellipse cx="22" cy="2" rx="2" ry="1.2" fill="#9a9a9a"/>';
    o += '<path d="M-14 -16 v-6 M-12 -16 v-8 M-10 -16 v-5 M18 16 v-6 M20 16 v-8" stroke="#4f7d2e" stroke-width="1" stroke-linecap="round"/>';
    return o;
  };

  I.ocean = function () {
    var o = '<path d="M-6 2 h18 l-3 4 h-12 z" fill="#8b5a2b"/><path d="M2 1 V-20 L13 0 Z" fill="#ffffff"/><path d="M1 1 V-16 L-7 0 Z" fill="#f2f2f2"/><line x1="1.5" y1="2" x2="1.5" y2="-21" stroke="#5a3a1a" stroke-width=".8"/>';
    o += '<path d="M-30 -6 q3 -2 6 0 M20 10 q3 -2 6 0 M-18 12 q3 -2 6 0 M26 -8 q3 -2 6 0" stroke="#ffffff" stroke-width="1.2" fill="none" stroke-linecap="round"/>';
    return o;
  };
  I.ocean.ground = 'deep';

  I.aquifer = function () {
    var o = A.shadow(-6, 4, 14, 5);
    // stock tank
    o += '<ellipse cx="14" cy="8" rx="13" ry="6.5" fill="#9aa4ae"/><rect x="1" y="1" width="26" height="7" fill="url(#daw-metal)"/><ellipse cx="14" cy="1" rx="13" ry="6.5" fill="#b8c1c9"/><ellipse cx="14" cy="1" rx="11" ry="5.2" fill="url(#daw-water)"/>';
    // windmill tower
    o += '<path d="M-14 6 L-8 -40 L-2 6 M-12.5 -6 L-3.5 -6 M-11 -20 L-5 -20 M-13 -2 L-5.5 -20 M-3 -2 L-10.5 -20" stroke="#6d7680" stroke-width="1.3" fill="none"/>';
    var cx = -8, cy = -44, b = '';
    for (var i = 0; i < 12; i++) { var a = i * Math.PI / 6; b += '<line x1="' + cx + '" y1="' + cy + '" x2="' + (cx + Math.cos(a) * 11).toFixed(1) + '" y2="' + (cy + Math.sin(a) * 11).toFixed(1) + '" stroke="#c9d1d8" stroke-width="2.2"/>'; }
    o += b + '<circle cx="' + cx + '" cy="' + cy + '" r="11" fill="none" stroke="#7d8790" stroke-width=".8"/><circle cx="' + cx + '" cy="' + cy + '" r="2" fill="#5a636b"/>';
    o += '<path d="M-6 -44 L10 -44 L14 -50 L14 -38 L10 -44" fill="#d24b3a" stroke="#a63a2c" stroke-width=".6"/>';
    o += '<path d="M-6 4 Q2 8 4 6" stroke="#4aa6e0" stroke-width="1.6" fill="none"/>';
    return o;
  };

  I.lake = function () {
    var o = '<ellipse cx="-2" cy="2" rx="34" ry="15" fill="#c9b27e"/><ellipse cx="-2" cy="2" rx="31" ry="13" fill="url(#daw-water)"/>';
    o += '<path d="M-20 0 q3 -2 6 0 M-4 8 q3 -2 6 0" stroke="#fff" stroke-width="1" fill="none" opacity=".7"/>';
    // dock
    o += A.box(0.08, -0.06, 0.48, 0.04, 2, 2, '#a8763e');
    o += '<line x1="12" y1="6" x2="12" y2="10" stroke="#6b4a26" stroke-width="1.4"/><line x1="26" y1="13" x2="26" y2="17" stroke="#6b4a26" stroke-width="1.4"/>';
    o += '<circle cx="-14" cy="4" r="2.4" fill="#d9a066"/><rect x="-8" y="-4" width="5" height="3" rx="1" fill="#f6f6f6" stroke="#ccc" stroke-width=".4"/>';
    o += A.person(20, 4, '#e0742b', 0.9);
    return o;
  };

  I.cloud = function () {
    var o = '<ellipse cx="2" cy="8" rx="26" ry="9" fill="#1d3b2a" opacity=".16"/>';
    o += '<g stroke="#5aa8e6" stroke-width="1.3" stroke-linecap="round" opacity=".85">';
    for (var i = 0; i < 9; i++) { var x = -16 + i * 4.2; o += '<line x1="' + x + '" y1="' + (-28 + (i % 3) * 3) + '" x2="' + (x - 4) + '" y2="' + (-12 + (i % 2) * 6) + '"/>'; }
    o += '</g>';
    o += '<g><circle cx="-14" cy="-38" r="11" fill="url(#daw-storm)"/><circle cx="2" cy="-44" r="15" fill="url(#daw-storm)"/><circle cx="17" cy="-37" r="11" fill="url(#daw-storm)"/><rect x="-20" y="-38" width="44" height="10" rx="5" fill="#6d7c8e"/>';
    o += '<circle cx="-4" cy="-50" r="8" fill="#c9d4df" opacity=".8"/><circle cx="8" cy="-52" r="6" fill="#dfe7ee" opacity=".7"/></g>';
    o += '<path d="M6 -28 L1 -18 L5 -18 L0 -8 L10 -21 L6 -21 L9 -28 Z" fill="#ffd84a" stroke="#e0a800" stroke-width=".5"/>';
    return o;
  };

  I.weatherstation = function () {
    var o = A.shadow(2, 6, 16, 5);
    o += '<g stroke="#7a828a" stroke-width="1.2"><line x1="-12" y1="6" x2="-12" y2="-12"/><line x1="-2" y1="9" x2="-2" y2="-10"/><line x1="-16" y1="3" x2="-16" y2="-14"/></g>';
    o += A.box(-0.32, -0.12, -0.08, 0.08, 14, 13, '#f7f7f5', { stroke: '#c9ccd0' });
    o += '<path d="M-17 -18 l10 5 M-17 -21 l10 5 M-17 -24 l10 5" stroke="#cfd3d7" stroke-width=".8"/>';
    o += '<line x1="16" y1="6" x2="16" y2="-46" stroke="#8a929a" stroke-width="1.6"/>';
    o += '<g transform="translate(16 -46)"><line x1="-9" y1="0" x2="9" y2="0" stroke="#59626b" stroke-width="1"/><line x1="0" y1="-4" x2="0" y2="4" stroke="#59626b" stroke-width="1"/><circle cx="-9" cy="0" r="2.4" fill="#2f6fb3"/><circle cx="9" cy="0" r="2.4" fill="#2f6fb3"/><circle cx="0" cy="-4" r="2" fill="#2f6fb3"/></g>';
    o += '<line x1="16" y1="-32" x2="26" y2="-32" stroke="#8a929a" stroke-width="1.2"/><path d="M26 -34 L38 -31 L38 -29 L26 -30 Z" fill="#f08a24"/><path d="M30 -33 v3.4 M34 -32 v2.8" stroke="#fff" stroke-width="1"/>';
    return o;
  };
})();
