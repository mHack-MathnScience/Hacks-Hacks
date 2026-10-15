/* Design a World: item illustrations, part 2 (science buildings, town, matter, energy). */
(function () {
  'use strict';
  var A = window.DAW_ART, P = A.P, poly = A.poly, shade = A.shade;
  var I = A.item;
  function path(d, fill, extra) { return '<path d="' + d + '" fill="' + fill + '"' + (extra || '') + '/>'; }
  function sign(x, y, col, glyph) { return '<g transform="translate(' + x + ' ' + y + ')"><circle r="6.5" fill="#fff" stroke="' + col + '" stroke-width="1.4"/><g fill="' + col + '" stroke="' + col + '">' + glyph + '</g></g>'; }
  var G = {
    flask: '<path d="M-1.6 -3.6 h3.2 M-1 -3.6 v2 l-2.6 4.6 h7.2 l-2.6 -4.6 v-2" fill="none" stroke-width="1"/>',
    gear: '<circle r="2.2" fill="none" stroke-width="1.6"/><path d="M0 -4.4 v1.6 M0 4.4 v-1.6 M-4.4 0 h1.6 M4.4 0 h-1.6" stroke-width="1.4"/>',
    star: '<path d="M0 -4 L1.2 -1.2 L4 -1 L1.8 .9 L2.5 3.8 L0 2.2 L-2.5 3.8 L-1.8 .9 L-4 -1 L-1.2 -1.2Z" stroke="none"/>',
    ruler: '<rect x="-4" y="-1.6" width="8" height="3.2" fill="none" stroke-width=".9"/><path d="M-2 -1.6 v1.4 M0 -1.6 v1.8 M2 -1.6 v1.4" stroke-width=".7"/>'
  };

  I.fieldstation = function () {
    var o = A.shadow(2, 6, 26, 8);
    o += path('M-26 6 L-8 -22 L10 8 Z', '#4f8a4b') + path('M-8 -22 L10 8 L22 0 L4 -28 Z', '#3c6e3a') + path('M-14 5 L-8 -8 L-2 6 Z', '#24452a');
    o += '<line x1="4" y1="-28" x2="4" y2="-40" stroke="#6b4a26" stroke-width="1"/><path d="M4 -40 h9 l-2 3 l2 3 h-9" fill="#e0742b"/>';
    o += A.box(0.2, 0.18, 0.4, 0.32, 6, 1.5, '#a8763e') + '<line x1="16" y1="14" x2="16" y2="20" stroke="#6b4a26"/><line x1="26" y1="10" x2="26" y2="16" stroke="#6b4a26"/>';
    o += '<rect x="18" y="4" width="2" height="5" fill="#34495e"/><circle cx="19" cy="3.5" r="1.8" fill="#34495e"/>';
    o += A.person(-24, 16, '#2f6fb3');
    return o;
  };
  I.school = function () {
    var o = A.shadow(4, 8, 40, 12);
    o += A.building(-0.4, -0.3, 0.4, 0.22, 20, '#c0583e', '#4a5866', { door: '#2c3e50', roofH: 9 });
    o += A.box(-0.06, 0.22, 0.12, 0.3, 0, 12, '#ecf0f1');
    o += '<line x1="-2" y1="-40" x2="-2" y2="-56" stroke="#7f8c8d" stroke-width="1"/><path d="M-2 -56 h10 v6 h-10" fill="#2f6fb3"/><path d="M-2 -56 h4 v3 h-4" fill="#c0392b"/>';
    o += sign(-24, -18, '#2f6fb3', G.flask);
    return o;
  };
  I.toollab = function () {
    var o = A.shadow(4, 8, 34, 11);
    o += A.building(-0.34, -0.26, 0.3, 0.2, 18, '#4f7fb0', '#2c3e50', { door: '#1f2d3a', roofH: 10 });
    o += sign(-10, -36, '#e0742b', G.ruler);
    o += A.box(0.32, 0.22, 0.44, 0.34, 0, 6, '#d9a441');
    return o;
  };
  I.modellab = function () {
    var o = A.shadow(4, 8, 36, 11);
    o += A.building(-0.4, -0.38, 0.12, 0.0, 18, '#e9e4d8', '#5a6d7c', { door: '#5a6d7c', roofH: 9 });
    // stream table
    o += A.box(-0.02, 0.1, 0.46, 0.36, 6, 4, '#8c6239');
    o += poly([P(0.0, 0.14, 10.2), P(0.44, 0.14, 10.2), P(0.44, 0.32, 10.2), P(0.0, 0.32, 10.2)], 'url(#daw-sand)');
    o += '<path d="' + 'M' + P(0.02, 0.22, 10.4).join(' ') + ' Q' + P(0.2, 0.18, 10.4).join(' ') + ' ' + P(0.26, 0.25, 10.4).join(' ') + ' T' + P(0.43, 0.24, 10.4).join(' ') + '" stroke="#3ea3e3" stroke-width="2" fill="none" stroke-linecap="round"/>';
    o += '<line x1="8" y1="8" x2="8" y2="14" stroke="#6b4a26"/><line x1="30" y1="18" x2="30" y2="24" stroke="#6b4a26"/>';
    return o;
  };
  I.museum = function () {
    var o = A.shadow(4, 8, 40, 12);
    o += A.box(-0.42, -0.34, 0.42, 0.3, 0, 4, '#d9d4c7');
    o += A.box(-0.36, -0.3, 0.36, 0.16, 4, 18, '#efe9dc');
    for (var i = 0; i < 5; i++) { var u = -0.32 + i * 0.16, a = P(u, 0.24, 4), b = P(u, 0.24, 22); o += '<rect x="' + (a[0] - 1.6) + '" y="' + b[1] + '" width="3.2" height="' + (a[1] - b[1]) + '" fill="#fbf8f1" stroke="#cfc6b2" stroke-width=".5"/>'; }
    o += A.box(-0.38, -0.32, 0.38, 0.27, 22, 3, '#e3dccb');
    o += poly([P(-0.38, 0.27, 25), P(0.38, 0.27, 25), P(0, 0.27, 36)], '#f4efe3', ' stroke="#cfc6b2" stroke-width=".6"');
    o += poly([P(0.38, -0.32, 25), P(0.38, 0.27, 25), P(0, 0.27, 36), P(0, -0.32, 36)], '#b9ae98');
    o += sign(-1, -14, '#8e44ad', G.star);
    return o;
  };
  I.careercenter = function () {
    var o = A.shadow(4, 8, 32, 11);
    o += A.box(-0.28, -0.28, 0.28, 0.28, 0, 40, '#5aa7dc', { top: '#d6ecfa', left: '#7fc0ea', right: '#3f86bd' });
    for (var z = 6; z < 40; z += 6) o += '<polyline points="' + A.pts([P(-0.28, 0.28, z), P(0.28, 0.28, z), P(0.28, -0.28, z)]) + '" fill="none" stroke="#e8f5fd" stroke-width=".6" opacity=".8"/>';
    o += A.box(-0.1, 0.28, 0.1, 0.34, 0, 6, '#ecf0f1');
    o += sign(-12, -46, '#16a085', G.star);
    return o;
  };
  I.townhall = function () {
    var o = A.shadow(4, 8, 40, 12);
    o += A.building(-0.4, -0.28, 0.4, 0.24, 18, '#e7d9bf', '#7b4a3a', { door: '#5a3a2a', roofH: 8 });
    o += A.box(-0.1, -0.1, 0.1, 0.1, 18, 22, '#efe3cb');
    var c = P(0, 0.1, 32); o += '<circle cx="' + (c[0] - 2) + '" cy="' + c[1] + '" r="4" fill="#fff" stroke="#7b4a3a" stroke-width=".8"/><path d="M' + (c[0] - 2) + ' ' + c[1] + ' v-2.6 M' + (c[0] - 2) + ' ' + c[1] + ' h2" stroke="#333" stroke-width=".7"/>';
    var t = P(0, 0, 40); o += path('M' + (t[0] - 10) + ' ' + t[1] + ' Q' + t[0] + ' ' + (t[1] - 16) + ' ' + (t[0] + 10) + ' ' + t[1] + ' Z', '#4e7a9c');
    return o;
  };
  I.sciencefair = function () {
    var o = A.shadow(2, 8, 38, 12);
    o += A.box(-0.38, -0.3, 0.38, 0.3, 0, 12, '#f4f4f4', { stroke: '#d8d8d8' });
    for (var i = 0; i < 6; i++) { var u0 = -0.4 + i * 0.133, u1 = u0 + 0.133; o += poly([P(u0, -0.32, 12), P(u1, -0.32, 12), P(u1, 0, 24), P(u0, 0, 24)], i % 2 ? '#e74c3c' : '#fdfdfd'); o += poly([P(u0, 0.32, 12), P(u1, 0.32, 12), P(u1, 0, 24), P(u0, 0, 24)], i % 2 ? '#c0392b' : '#f1f1f1'); }
    o += '<rect x="-22" y="4" width="12" height="9" fill="#fff" stroke="#2f6fb3" stroke-width=".8"/><path d="M-20 11 v-3 M-17 11 v-5 M-14 11 v-2" stroke="#2f6fb3" stroke-width="1.6"/>';
    o += '<rect x="14" y="8" width="12" height="9" fill="#fff" stroke="#27ae60" stroke-width=".8"/><polyline points="16,15 19,12 22,13 25,9" stroke="#27ae60" fill="none" stroke-width="1"/>';
    return o;
  };
  I.ranger = function () {
    var o = A.shadow(4, 8, 32, 10);
    o += A.building(-0.32, -0.24, 0.28, 0.2, 14, '#9c6b3c', '#3f6b3a', { door: '#5a3a1e', roofH: 11 });
    for (var z = 2; z < 14; z += 3) o += '<polyline points="' + A.pts([P(-0.32, 0.2, z), P(0.28, 0.2, z), P(0.28, -0.24, z)]) + '" fill="none" stroke="#7a5230" stroke-width=".6"/>';
    o += '<rect x="20" y="0" width="12" height="8" rx="1" fill="#fff8e1" stroke="#7a5230"/><path d="M22 6 q3 -4 5 -1 t4 -2" stroke="#c0392b" fill="none" stroke-width=".8"/><line x1="26" y1="8" x2="26" y2="14" stroke="#7a5230"/>';
    o += A.tree(-0.42, 0.32, 0.7, 'pine');
    return o;
  };
  I.engineering = function () {
    var o = A.shadow(4, 8, 36, 11);
    o += A.box(-0.38, -0.36, 0.2, 0.06, 0, 16, '#d0d6dc');
    for (var i = 0; i < 3; i++) { var u0 = -0.38 + i * 0.193, u1 = u0 + 0.193; o += poly([P(u0, 0.06, 16), P(u1, 0.06, 16), P(u0 + 0.02, 0.06, 26)], '#3d5a73'); o += poly([P(u0 + 0.02, 0.06, 26), P(u1, 0.06, 16), P(u1, -0.36, 16), P(u0 + 0.02, -0.36, 26)], '#566f86'); }
    o += A.windows(-0.38, 0.06, 0.2, 14, '#ffe08a');
    // riverbank with stones + plants
    o += poly([P(0.24, -0.5), P(0.5, -0.5), P(0.5, 0.5), P(0.24, 0.5)], 'url(#daw-water)');
    for (var k = 0; k < 5; k++) { var p = P(0.24, -0.4 + k * 0.2, 0); o += '<ellipse cx="' + p[0] + '" cy="' + (p[1] - 1) + '" rx="3" ry="2" fill="#9aa0a6" stroke="#7d848a" stroke-width=".4"/>'; }
    o += '<path d="M-26 14 v-5 M-24 14 v-7 M-22 14 v-4 M-10 20 v-5 M-8 20 v-7" stroke="#3f8a3a" stroke-width="1.2" stroke-linecap="round"/>';
    o += sign(-12, -36, '#e0742b', G.gear);
    return o;
  };
  I.houses = function (seed) {
    var o = A.shadow(4, 8, 40, 12);
    o += A.building(-0.42, -0.42, -0.06, -0.12, 13, '#f3e3c3', '#b5523b', { door: '#7a3e2b', roofH: 9 });
    o += A.building(0.06, -0.06, 0.42, 0.24, 13, '#d7e6f0', '#3e6d8e', { door: '#2c4f68', roofH: 9 });
    o += A.tree(-0.2, 0.3, 0.7, 'oak') + A.tree(0.36, -0.36, 0.6, 'oak');
    o += A.person(-6, 18, '#e67e22', 0.8);
    return o;
  };
  // ---- matter ----
  I.workshop = function () {
    var o = A.shadow(4, 8, 36, 11);
    o += A.building(-0.36, -0.3, 0.32, 0.18, 16, '#a9563d', '#5b4a42', { door: '#3a2a22', roofH: 10, winCol: '#ffb347' });
    o += A.box(0.12, -0.26, 0.24, -0.14, 16, 20, '#8a4632');
    o += '<circle cx="6" cy="-52" r="4" fill="#d5d8dc" opacity=".8"/><circle cx="10" cy="-58" r="5" fill="#e5e8eb" opacity=".7"/><circle cx="4" cy="-64" r="5.5" fill="#eff1f3" opacity=".6"/>';
    o += '<ellipse cx="26" cy="12" rx="6" ry="2.4" fill="#7f8c8d"/><rect x="20" y="6" width="12" height="6" fill="url(#daw-metal)"/><ellipse cx="26" cy="6" rx="6" ry="2.4" fill="#bdc3c7"/>';
    return o;
  };
  I.quarry = function () {
    var o = '';
    o += A.box(-0.46, -0.46, 0.46, 0.46, 0, 2, '#b89a6a');
    o += poly([P(-0.36, -0.36, 2), P(0.36, -0.36, 2), P(0.36, 0.36, 2), P(-0.36, 0.36, 2)], '#9c7f52');
    o += '<path d="M-30 4 Q-14 -24 2 4 Z" fill="url(#daw-sand)"/><path d="M-14 -10 Q-8 -6 2 4 L-6 4 Z" fill="#c9994f" opacity=".6"/>';
    o += '<path d="M2 12 Q14 -8 28 12 Z" fill="#4b5157"/><path d="M14 -2 Q20 4 28 12 L20 12 Z" fill="#2f3438" opacity=".6"/>';
    o += '<g transform="translate(-4 -30)"><path d="M-6 0 v8 a6 6 0 0 0 12 0 v-8 h-4 v8 a2 2 0 0 1 -4 0 v-8 z" fill="#d63a2f"/><rect x="-6" y="-2" width="4" height="3" fill="#ecf0f1"/><rect x="2" y="-2" width="4" height="3" fill="#ecf0f1"/></g>';
    return o;
  };
  I.quarry.ground = 'dirt';
  I.lemonade = function () {
    var o = A.shadow(2, 8, 26, 8);
    o += A.box(-0.24, -0.1, 0.24, 0.14, 0, 12, '#f7f1e3');
    for (var i = 0; i < 4; i++) { var u0 = -0.28 + i * 0.14, u1 = u0 + 0.14; o += poly([P(u0, 0.18, 26), P(u1, 0.18, 26), P(u1, 0.3, 20), P(u0, 0.3, 20)], i % 2 ? '#f6c90e' : '#ffffff'); }
    o += '<line x1="' + P(-0.24, 0.14, 0)[0] + '" y1="' + P(-0.24, 0.14, 0)[1] + '" x2="' + P(-0.24, 0.18, 26)[0] + '" y2="' + P(-0.24, 0.18, 26)[1] + '" stroke="#8c6239" stroke-width="1.2"/>';
    o += '<line x1="' + P(0.24, 0.14, 0)[0] + '" y1="' + P(0.24, 0.14, 0)[1] + '" x2="' + P(0.24, 0.18, 26)[0] + '" y2="' + P(0.24, 0.18, 26)[1] + '" stroke="#8c6239" stroke-width="1.2"/>';
    o += '<path d="M-4 -8 h7 l-1 8 h-5 z" fill="#fff59d" stroke="#e0c341" stroke-width=".6"/><circle cx="7" cy="-3" r="2.4" fill="#f9e04b" stroke="#d4b92c" stroke-width=".5"/>';
    o += A.person(-18, 16, '#c0392b', 0.85);
    return o;
  };
  I.balloon = function () {
    var o = '<ellipse cx="6" cy="8" rx="12" ry="4" fill="#0b2a1a" opacity=".14"/>';
    o += '<g><path d="M-14 -52 a14 15 0 1 1 28 0 c0 9 -8 14 -10 20 h-8 c-2 -6 -10 -11 -10 -20 z" fill="url(#daw-balloon)"/>';
    o += '<path d="M-5 -66 c-4 6 -4 22 1 34 M5 -66 c4 6 4 22 -1 34" stroke="#ffd166" stroke-width="2.6" fill="none"/>';
    o += '<line x1="-4" y1="-32" x2="-3" y2="-24" stroke="#6b4a26" stroke-width=".6"/><line x1="4" y1="-32" x2="3" y2="-24" stroke="#6b4a26" stroke-width=".6"/><rect x="-4" y="-24" width="8" height="5" rx="1" fill="#a8763e"/></g>';
    o += '<path d="M-36 2 L-20 -6 L-4 2" stroke="#7f8c8d" stroke-width=".6" fill="none"/><path d="M-32 0 l2 4 l2 -4 M-24 -4 l2 4 l2 -4 M-16 -3 l2 4 l2 -4" fill="#e74c3c"/>';
    o += '<g transform="translate(26 -10)"><ellipse rx="5" ry="6" fill="#3498db"/><line y1="6" y2="16" stroke="#555" stroke-width=".5"/></g>';
    return o;
  };
  // ---- energy ----
  function lamp(x, y) { return '<line x1="' + x + '" y1="' + y + '" x2="' + x + '" y2="' + (y - 26) + '" stroke="#4a5560" stroke-width="1.6"/><path d="M' + x + ' ' + (y - 26) + ' q5 -3 8 0" stroke="#4a5560" stroke-width="1.4" fill="none"/><circle cx="' + (x + 8) + '" cy="' + (y - 24) + '" r="9" fill="url(#daw-glow)"/><circle cx="' + (x + 8) + '" cy="' + (y - 24.5) + '" r="2.2" fill="#fff6c2"/>'; }
  I.streetlight = function () {
    var o = A.shadow(4, 8, 30, 9);
    o += poly([P(-0.5, -0.1), P(0.5, -0.1), P(0.5, 0.1), P(-0.5, 0.1)], '#9aa3ab');
    o += A.building(-0.4, -0.42, -0.08, -0.16, 12, '#f0e2c4', '#a3503a', { winCol: '#ffe08a', roofH: 8 });
    o += lamp(-6, 10) + lamp(18, -2);
    return o;
  };
  I.powerstation = function () {
    var o = A.shadow(4, 8, 36, 11);
    o += A.box(-0.38, -0.38, 0.38, 0.38, 0, 1.5, '#c3c8cc');
    o += A.box(-0.3, -0.22, -0.06, 0.02, 1.5, 12, '#8e9aa5') + A.box(0.02, -0.22, 0.26, 0.02, 1.5, 12, '#8e9aa5');
    o += '<g stroke="#5d6770" stroke-width="1" fill="none"><path d="M10 18 L14 -26 L18 18 M11 6 h6 M12 -6 h4 M8 -18 h12"/><path d="M-26 10 L-22 -30 L-18 10 M-25 -2 h6 M-28 -22 h12"/></g>';
    o += '<path d="M-28 -22 Q-6 -16 8 -18 M-16 -22 Q2 -16 20 -18" stroke="#2c3e50" stroke-width=".6" fill="none"/>';
    o += '<path d="M-2 -8 l-4 7 h4 l-3 7 l8 -9 h-4 l3 -5 z" fill="#f6c90e" stroke="#d4a500" stroke-width=".5"/>';
    return o;
  };
  I.campsite = function () {
    var o = A.shadow(-6, 6, 22, 7);
    o += path('M-30 6 L-14 -18 L2 8 Z', '#e67e22') + path('M-14 -18 L2 8 L14 0 L-2 -24 Z', '#c0611a') + path('M-19 6 L-14 -4 L-9 7 Z', '#7a3a10');
    o += '<g transform="translate(20 10)"><ellipse rx="8" ry="3.4" fill="#7f8c8d"/><path d="M-5 0 l10 -3 M-5 -3 l10 3" stroke="#6b4423" stroke-width="2"/><path d="M0 -2 q-5 -6 0 -14 q2 6 4 4 q2 6 -4 10z" fill="#f39c12"/><path d="M0 -3 q-2 -4 0 -8 q2 4 2 4 q1 3 -2 4z" fill="#ffe08a"/><circle r="12" fill="url(#daw-glow)" opacity=".6"/></g>';
    o += '<g transform="translate(-6 16) rotate(-15)"><rect x="-5" y="-1.6" width="9" height="3.2" rx="1" fill="#2c3e50"/><path d="M4 -2.4 h2 v4.8 h-2z" fill="#95a5a6"/><path d="M6 -2 L26 -7 L26 7 L6 2 Z" fill="#fff6b0" opacity=".55"/></g>';
    return o;
  };
  I.lighthouse = function () {
    var o = '<ellipse cx="0" cy="6" rx="30" ry="12" fill="#7d7468"/><ellipse cx="-2" cy="2" rx="26" ry="10" fill="#9b9184"/>';
    o += '<path d="M-7 2 L-4 -40 L4 -40 L7 2 Z" fill="#fdfdfd"/><path d="M-6.4 -6 L6.4 -6 L5.8 -14 L-5.8 -14 Z M-5.2 -22 L5.2 -22 L4.7 -30 L-4.7 -30 Z" fill="#d63a2f"/><path d="M1 2 L4 -40 L7 2" fill="#000" opacity=".08"/>';
    o += '<rect x="-6" y="-42" width="12" height="2.5" fill="#2c3e50"/><rect x="-4" y="-50" width="8" height="8" fill="#fff6b0" stroke="#2c3e50" stroke-width=".8"/><path d="M-5 -50 L0 -56 L5 -50 Z" fill="#d63a2f"/>';
    o += '<path d="M4 -47 L44 -60 L44 -36 Z" fill="#fff6b0" opacity=".45"/><circle cx="0" cy="-46" r="10" fill="url(#daw-glow)"/>';
    return o;
  };
  I.lighthouse.ground = 'water';
})();
