/* Design a World: more organism library icons (64x64, same flat-shaded style as art-organisms.js).
   Texas organisms from the GT content library. All art is original inline SVG. */
(function () {
  'use strict';
  var A = window.DAW_ART, O = A.organism, sh = A.shade;
  function e(cx, cy, rx, ry, f, x) { return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" fill="' + f + '"' + (x || '') + '/>'; }
  function c(cx, cy, r, f, x) { return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + f + '"' + (x || '') + '/>'; }
  function p(d, f, x) { return '<path d="' + d + '" fill="' + (f || 'none') + '"' + (x || '') + '/>'; }
  function s(d, col, w, x) { return '<path d="' + d + '" fill="none" stroke="' + col + '" stroke-width="' + w + '" stroke-linecap="round" stroke-linejoin="round"' + (x || '') + '/>'; }
  function r(x, y, w, h, f, rx) { return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + (rx == null ? 2 : rx) + '" fill="' + f + '"/>'; }
  function eye(x, y, rr) { return c(x, y, rr || 1.5, '#1b1b1b') + c(x + 0.5, y - 0.5, (rr || 1.5) * 0.35, '#fff'); }
  function rng(n, f) { var o = ''; for (var k = 0; k < n; k++) o += f(k); return o; }
  var SH = e(32, 57, 21, 3.4, '#0b2a1a', ' opacity=".14"'), WATER = '<path d="M4 50 q7 -4 14 0 t14 0 t14 0 t14 0 V60 H4z" fill="#74c0fc" opacity=".55"/>';
  var SOIL = p('M4 46 q14 -4 28 0 t28 0 V60 H4z', '#7a5536') + c(14, 52, 1.6, '#5e3f27') + c(40, 55, 1.3, '#5e3f27') + c(52, 50, 1.1, '#5e3f27');
  // six insect legs around a body centre
  function legs6(cx, cy, col, span) { span = span || 9; return [-1, 0, 1].map(function (k) { return s('M' + (cx + k * 5) + ' ' + cy + ' l-' + (span * 0.4) + ' -' + span + ' M' + (cx + k * 5) + ' ' + cy + ' l' + (span * 0.2) + ' ' + span, col, 1.4); }).join(''); }
  function bird(body, wing, belly, o) {
    o = o || {};
    return SH + s('M30 46 l-2 10 M35 46 l1 10', o.leg || '#5c4a3a', 1.6) + p('M22 36 L4 44 L8 38 L3 36z', o.tail || wing) + e(32, 38, 13, 9, body) + e(33, 42, 9, 5, belly) +
      p('M22 34 q10 -8 20 2 q-8 6 -20 4z', wing) + c(44, 27, 7, o.head || body) + p('M50 26 l' + (o.bill || 7) + ' 2 l-' + (o.bill || 7) + ' 2z', o.billc || '#3b3b3b') + eye(46, 25) + (o.extra || '');
  }
  function crane(body, o) {
    o = o || {};
    return SH + (o.water ? WATER : '') + s('M28 40 l-2 17 M33 40 l2 17', '#3d3d3d', 1.8) + e(30, 34, 12.6, 8.6, sh(body, -0.3)) + e(30, 34, 12, 8, body) + p('M18 32 q-8 4 -8 10 q6 -2 10 -6z', o.tail || sh(body, -0.25)) +
      s('M38 30 q6 -6 4 -14 q-1 -4 2 -6', sh(body, -0.3), 5) + c(45, 10, 4.3, sh(body, -0.3)) + s('M38 30 q6 -6 4 -14 q-1 -4 2 -6', body, 3.4) + c(45, 10, 3.6, body) + c(46, 8.4, 2, '#e03131') + p('M48 10 l10 2 l-10 1.6z', '#5c5f66') + eye(46, 10, 1.1) + (o.extra || '');
  }
  O.pitcherplant = SH + e(32, 55, 15, 3, '#5b7a3a') + [[22, 54, 18, -8], [32, 55, 30, 0], [42, 54, 22, 8]].map(function (q) {
    return '<g transform="rotate(' + q[3] + ' ' + q[0] + ' ' + q[1] + ')">' + p('M' + (q[0] - 4) + ' ' + q[1] + ' L' + (q[0] - 5) + ' ' + (q[1] - q[2]) + ' q5 -5 10 0 L' + (q[0] + 4) + ' ' + q[1] + 'z', '#b5c94a') + p('M' + (q[0] - 5) + ' ' + (q[1] - q[2]) + ' q5 -9 11 -2 q-5 -1 -11 2z', '#9fb43c') +
      s('M' + (q[0] - 2) + ' ' + (q[1] - q[2] + 4) + ' v' + (q[2] - 8), '#a33a2b', 0.8, ' opacity=".6"') + e(q[0], q[1] - q[2] + 1, 4, 1.4, '#5e2b1f') + '</g>';
  }).join('');
  O.southernpinebeetle = SH + r(6, 6, 52, 50, '#7b5a3c', 6) + s('M14 10 v42 M28 8 v46 M44 10 v42', '#5e432b', 1.4) + legs6(32, 34, '#2b1d14', 10) + e(32, 34, 8, 13, '#4a2e1c') + c(32, 19, 5, '#3a2416') + s('M32 22 v25', '#2b1a10', 1) + s('M29 16 l-3 -4 M35 16 l3 -4', '#2b1d14', 1.2) + e(29, 30, 2, 5, '#6b4630', ' opacity=".6"');
  O.goldensilkorbweaver = s('M4 4 L60 60 M60 4 L4 60 M32 2 V62 M2 32 H62', '#e6c34a', 0.8, ' opacity=".8"') + [8, 16, 24].map(function (rr) { return '<circle cx="32" cy="32" r="' + rr + '" fill="none" stroke="#e6c34a" stroke-width=".7" opacity=".8"/>'; }).join('') +
    [-50, -25, 25, 50].map(function (a) { return s('M32 30 l' + (Math.cos(a * Math.PI / 180) * -16).toFixed(1) + ' ' + (Math.sin(a * Math.PI / 180) * 16).toFixed(1) + ' l-3 6 M32 30 l' + (Math.cos(a * Math.PI / 180) * 16).toFixed(1) + ' ' + (Math.sin(a * Math.PI / 180) * 16).toFixed(1) + ' l3 6', '#3b2a1a', 1.3); }).join('') +
    e(32, 38, 5, 9, '#e8b22e') + s('M29 34 h6 M28 38 h8 M29 42 h6', '#7a5a14', 1) + e(32, 27, 3.6, 3.4, '#7a5a3a') + c(30.5, 26, 0.8, '#111') + c(33.5, 26, 0.8, '#111');
  O.redcockadedwoodpecker = SH + r(36, 2, 14, 58, '#7d5a3c', 4) + s('M40 6 v50 M46 4 v52', '#5e432b', 1.2) + p('M44 18 q4 6 0 12 q-3 -6 0 -12z', '#f2e0a0', ' opacity=".9"') +
    p('M22 48 l-6 10 l8 -6z', '#222') + e(28, 36, 7, 13, '#1f1f22') + rng(5, function (k) { return s('M23 ' + (30 + k * 4) + ' h8', '#f1f3f5', 1.4); }) + e(30, 38, 3, 9, '#e9ecef') + c(30, 20, 6, '#1f1f22') + e(28, 21, 3.2, 2.2, '#f8f9fa') + c(25.5, 17, 1.2, '#e03131') + p('M35 19 l7 1 l-7 2z', '#495057') + eye(31, 18, 1.2);
  O.turkeytailfungus = SH + p('M4 50 q2 -8 10 -8 h38 q8 0 8 8 q0 6 -8 6 H12 q-8 0 -8 -6z', '#7a5536') + c(14, 49, 3, '#5e3f27') + c(50, 49, 2.4, '#5e3f27') +
    [[22, 40, 13, '#8a5a3a'], [40, 40, 12, '#7b4d34'], [31, 34, 11, '#9a6a44']].map(function (q) {
      return p('M' + (q[0] - q[2]) + ' ' + q[1] + ' a' + q[2] + ' ' + q[2] + ' 0 0 1 ' + (2 * q[2]) + ' 0z', q[3]) + [0.75, 0.5, 0.28].map(function (f, k) { return p('M' + (q[0] - q[2] * f) + ' ' + q[1] + ' a' + (q[2] * f) + ' ' + (q[2] * f) + ' 0 0 1 ' + (2 * q[2] * f) + ' 0', 'none', ' stroke="' + ['#e9d8b8', '#4a3020', '#d9b98c'][k] + '" stroke-width="1.6"'); }).join('') + p('M' + (q[0] - q[2]) + ' ' + q[1] + ' a' + q[2] + ' ' + q[2] + ' 0 0 1 ' + (2 * q[2]) + ' 0', 'none', ' stroke="#f3ead9" stroke-width="1.2"');
    }).join('');
  O.fiddlercrab = SH + p('M4 52 q14 -4 28 -2 t28 2 V60 H4z', '#8b7355') + e(10, 50, 5, 2, '#2b2118') + s('M24 44 l-6 8 M28 45 l-4 9 M38 45 l4 9 M42 44 l6 8', '#c2703d', 1.6) + e(32, 40, 13, 7, '#d9822b') + e(32, 38, 9, 3, '#eba05a', ' opacity=".6"') +
    s('M28 34 v-6 M36 34 v-6', '#c2703d', 1.4) + c(28, 27, 1.8, '#1b1b1b') + c(36, 27, 1.8, '#1b1b1b') + s('M44 38 l6 -8', '#d9822b', 3) + p('M46 30 q8 -16 16 -6 q-2 6 -8 4 q2 -4 -2 -4 q-3 2 -4 8z', '#f3d34a') + s('M20 38 l-5 -3', '#d9822b', 2.4) + p('M15 35 l-5 -2 l2 4z', '#e8a15a');
  O.bluecrab = WATER + SH + s('M20 42 l-10 6 M22 45 l-8 8 M42 45 l8 8 M44 42 l10 6', '#4f7fb5', 1.8) + p('M12 46 l-4 0 l2 4z M52 46 l4 0 l-2 4z', '#4f7fb5') +
    p('M10 36 Q32 26 54 36 Q50 46 32 47 Q14 46 10 36z', '#5b7f97') + p('M10 36 L4 34 L12 40z M54 36 L60 34 L52 40z', '#5b7f97') + e(32, 38, 15, 4, '#7b9fb5', ' opacity=".5"') +
    s('M18 34 l-8 -10 M46 34 l8 -10', '#2f6db5', 3) + p('M10 24 q-6 -6 0 -10 q2 6 4 4 q0 6 -4 6z M54 24 q6 -6 0 -10 q-2 6 -4 4 q0 6 4 6z', '#2f6db5') + p('M8 16 l-1 -3 M56 16 l1 -3', 'none') + c(10, 17, 1, '#e8590c') + c(54, 17, 1, '#e8590c') + c(28, 32, 1.4, '#111') + c(36, 32, 1.4, '#111');
  O.whoopingcrane = crane('#f1f3f5', { water: true, tail: '#ced4da', extra: p('M18 30 q-6 2 -6 8 q4 -1 6 -4z', '#212529') });
  O.sandhillcrane = crane('#9aa0a6', { water: true, tail: '#7d838a' });
  O.antelopehornmilkweed = SH + s('M32 57 v-28 M32 46 q-8 -2 -12 -10 M32 42 q8 -2 12 -10', '#4f8a3c', 2.4) + e(20, 38, 7, 2.6, '#5f9e48', ' transform="rotate(-35 20 38)"') + e(44, 34, 7, 2.6, '#5f9e48', ' transform="rotate(35 44 34)"') + e(26, 50, 7, 2.2, '#5f9e48', ' transform="rotate(-20 26 50)"') +
    c(32, 20, 11, '#d8e6c4') + rng(12, function (k) { var a = k * 30 * Math.PI / 180, rr = k % 2 ? 7 : 4; return c((32 + Math.cos(a) * rr).toFixed(1), (20 + Math.sin(a) * rr).toFixed(1), 2.2, k % 3 ? '#f1f5e8' : '#c9a7d6') + c((32 + Math.cos(a) * rr).toFixed(1), (20 + Math.sin(a) * rr).toFixed(1), 0.8, '#b48ec4'); });
  O.grasshopper = SH + s('M6 56 q4 -16 2 -30 M58 56 q-2 -14 2 -26', '#6aa84f', 2) + p('M18 40 L30 24 L34 28 L26 44z', '#5a9a3e') + s('M30 24 L44 52', '#4e8a34', 2.4) + s('M20 40 l-4 12 M26 40 l-2 12', '#4e8a34', 1.4) +
    e(32, 38, 18, 6, '#7cc04a') + p('M16 36 q16 -8 30 0 q-14 2 -30 0z', '#5f9e3c') + c(50, 36, 6, '#86c95a') + eye(52, 34, 1.6) + s('M52 30 q4 -12 10 -16 M50 30 q0 -12 4 -18', '#5f9e3c', 1);
  O.earthworm = SOIL + p('M4 40 q12 -6 22 0', 'none') + s('M8 54 C14 40 26 44 30 50 S46 58 52 44 S58 32 50 30', '#e8a0a8', 6) + rng(8, function (k) { var xs = [12, 17, 23, 29, 36, 43, 50, 54], ys = [48, 44, 46, 50, 54, 52, 44, 36]; return c(xs[k], ys[k], 0.9, '#c76f7b'); }) + e(39, 54, 4, 2.6, '#d98591') + c(50, 30, 3, '#e8a0a8');
  O.ashejuniper = SH + p('M28 56 L29 40 L35 40 L36 56z', '#8a5a3c') + s('M30 44 v10 M33 42 v12', '#b0805c', 1) + p('M32 4 C14 14 10 30 14 42 Q32 50 50 42 C54 30 50 14 32 4z', '#3e6b4a') + p('M32 4 C24 14 22 30 24 44 Q14 42 14 42 C10 30 14 14 32 4z', '#335c3e') +
    rng(9, function (k) { var q = [[22, 22], [40, 18], [30, 30], [44, 34], [20, 36], [36, 40], [28, 14], [46, 26], [26, 42]][k]; return c(q[0], q[1], 1.8, '#6b8fbf') + c(q[0] - 0.5, q[1] - 0.6, 0.6, '#c7d6ec'); });
  O.moth = '<g transform="rotate(-6 32 32)">' + p('M32 28 C22 8 4 14 6 30 C8 36 22 34 32 32z', '#8c7a5b') + p('M32 28 C42 8 60 14 58 30 C56 36 42 34 32 32z', '#8c7a5b') + p('M32 32 C24 38 12 44 16 52 C22 54 30 44 32 34z', '#a3906d') + p('M32 32 C40 38 52 44 48 52 C42 54 34 44 32 34z', '#a3906d') +
    c(18, 24, 3.4, '#5e4f37') + c(46, 24, 3.4, '#5e4f37') + s('M10 28 q8 -6 18 -2 M54 28 q-8 -6 -18 -2', '#6d5d42', 1) + e(32, 32, 2.6, 11, '#4a3d2a') + s('M31 22 q-4 -8 -10 -10 M33 22 q4 -8 10 -10', '#4a3d2a', 1) + '</g>' +
    e(46, 56, 10, 3, '#4c8a3a') + rng(6, function (k) { return c(38 + k * 3, 55 - (k % 2), 2.2, '#7bbf4f'); });
  O.goldencheekedwarbler = bird('#2b2b2b', '#1c1c1c', '#f1f3f5', { head: '#f5c518', bill: 5, extra: s('M41 25 l8 0', '#1b1b1b', 1.4) + rng(3, function (k) { return s('M27 ' + (40 + k * 3) + ' l3 1', '#2b2b2b', 1); }) }) ;
  O.northernmockingbird = bird('#8d939a', '#6c727a', '#e9ecef', { bill: 6, extra: r(26, 34, 7, 3, '#f8f9fa', 1) + p('M4 44 l-1 3 l5 -2z', '#f8f9fa') + s('M54 20 q3 -3 6 -2 M55 24 q4 -1 6 1', '#868e96', 1) });
  O.mexicanfreetailedbat = '<rect x="0" y="0" width="64" height="64" rx="10" fill="#4c4c7a" opacity=".22"/>' + c(52, 12, 5, '#fff3bf') +
    p('M32 30 C26 18 12 16 4 22 C8 24 9 28 8 32 C12 30 16 32 18 36 C22 32 26 34 28 38z', '#3b3330') + p('M32 30 C38 18 52 16 60 22 C56 24 55 28 56 32 C52 30 48 32 46 36 C42 32 38 34 36 38z', '#3b3330') +
    e(32, 34, 5, 8, '#5a4a42') + c(32, 25, 4.4, '#5a4a42') + p('M28 23 l-1 -6 l4 4z M36 23 l1 -6 l-4 4z', '#5a4a42') + c(30.5, 25, 0.9, '#fff') + c(33.5, 25, 0.9, '#fff') + s('M32 41 v8', '#3b3330', 1.4);
  O.lechuguilla = SH + e(32, 55, 16, 3, '#b08a5a') + [-70, -50, -30, -12, 12, 30, 50, 70].map(function (a) {
    var dx = Math.sin(a * Math.PI / 180), dy = Math.cos(a * Math.PI / 180), L = 18 - Math.abs(a) / 10;
    return p('M' + (32 - dy * 2.6).toFixed(1) + ' 54 L' + (32 + dx * L).toFixed(1) + ' ' + (54 - dy * L).toFixed(1) + ' L' + (32 + dy * 2.6).toFixed(1) + ' 54z', Math.abs(a) > 40 ? '#7a9a5a' : '#8fb06a');
  }).join('') + s('M33 40 L36 6', '#8a7a4a', 2) + rng(6, function (k) { return e(36 - k * 0.4 + (k % 2 ? 2.4 : -2.4), 8 + k * 4, 2.2, 1.4, k < 3 ? '#e8c547' : '#c94f4f'); });
  O.creosotebush = SH + s('M32 56 L22 30 M32 56 L32 24 M32 56 L42 28 M30 50 L16 40 M34 50 L48 40', '#6b5a43', 1.8) +
    rng(18, function (k) { var q = [[22, 30], [32, 24], [42, 28], [16, 40], [48, 40], [26, 36], [38, 34], [20, 44], [44, 46], [28, 26], [36, 22], [46, 34], [18, 34], [24, 22], [40, 40], [30, 40], [50, 30], [14, 46]][k]; return e(q[0], q[1], 3.4, 2, k % 3 ? '#6b8f3a' : '#89a94a', ' transform="rotate(' + (k * 40) + ' ' + q[0] + ' ' + q[1] + ')"'); }) +
    c(24, 22, 1.6, '#f5d33b') + c(42, 26, 1.6, '#f5d33b') + c(48, 36, 1.4, '#f5d33b') + rng(4, function (k) { return c(18 + k * 9, 33 + (k % 2) * 6, 0.8, '#fff', ' opacity=".9"'); });
  O.harvesterant = SH + p('M4 54 q14 -3 28 0 t28 0 V60 H4z', '#c9a06a') + legs6(30, 42, '#6e1f12', 9) + e(18, 40, 8, 6, '#a6311c') + e(30, 40, 4, 3.4, '#b5381f') + c(40, 38, 5.4, '#b5381f') + c(42, 36, 1.2, '#111') + s('M43 34 q4 -8 10 -10 M41 33 q2 -8 6 -12', '#6e1f12', 1.2) + e(48, 42, 5, 3.6, '#e8d2a0') + s('M45 40 l4 4', '#c4a46a', 0.8);
  O.deserttermite = SH + p('M4 50 q14 -3 28 0 t28 0 V60 H4z', '#c49a6c') + p('M6 50 C10 30 20 26 30 30 S50 26 58 40 L56 50z', '#a8754a') + p('M14 46 C18 36 26 34 34 36 S48 36 52 44', 'none', ' stroke="#8a5a36" stroke-width="7" stroke-linecap="round"') +
    [[20, 40], [34, 37], [46, 40]].map(function (q) { return legs6(q[0], q[1], '#c9a77a', 3) + e(q[0], q[1], 4.4, 2.2, '#f1e3c8') + c(q[0] + 4.4, q[1], 1.6, '#d9a85a'); }).join('');
  O.javelina = SH + r(17, 42, 4, 12, '#2d2a28', 1.6) + r(23, 42, 4, 12, '#2d2a28', 1.6) + r(38, 42, 4, 12, '#2d2a28', 1.6) + r(44, 42, 4, 12, '#2d2a28', 1.6) + e(31, 36, 18, 11, '#5f5b57') +
    rng(9, function (k) { return s('M' + (16 + k * 3.6) + ' ' + (28 - (k % 3)) + ' l1 -4', '#3f3b38', 1.2); }) + p('M42 30 q4 6 0 14', 'none', ' stroke="#d8d2c6" stroke-width="3"') + p('M46 28 L60 36 L58 40 L46 42z', '#5f5b57') + e(59, 38, 2.6, 3, '#3f3b38') + c(59, 37.4, 0.7, '#111') + p('M47 26 l2 -5 l3 5z', '#4a4643') + eye(51, 31, 1.2) + p('M55 41 l1 3 l1 -3z', '#f1f3f5');
  O.pronghorn = SH + s('M18 40 l-4 16 M24 40 l2 16 M38 40 l-2 16 M44 40 l6 15', '#8a5a2c', 3) + e(31, 34, 16, 9, '#c98a4a') + e(31, 39, 12, 4, '#f8f1e6') + e(16, 33, 4, 5, '#f8f1e6') +
    p('M42 30 L46 18 L52 20 L48 32z', '#c98a4a') + s('M44 22 l5 2 M43 26 l5 2', '#f8f1e6', 1.6) + e(52, 18, 6, 4.6, '#c98a4a') + p('M56 17 l6 2 l-6 3z', '#3b2a1e') + eye(53, 16, 1.2) + s('M50 14 q-1 -6 2 -9 l1 3 M54 14 q1 -6 4 -8 l-1 3', '#2b1d14', 1.8);
  O.dungbeetle = SH + p('M4 54 q14 -3 28 0 t28 0 V60 H4z', '#b8935e') + c(20, 40, 13, '#7a5a36') + c(16, 36, 3, '#8f6c45') + c(24, 46, 2.4, '#5e4328') + c(22, 32, 1.6, '#5e4328') +
    s('M36 46 l-6 -10 M40 48 l-4 8 M46 48 l2 8 M50 46 l6 8', '#1b1b1b', 1.6) + e(44, 42, 9, 7, '#1f1f22') + p('M44 35 v14', 'none', ' stroke="#3a3a40" stroke-width="1"') + e(41, 40, 3, 2, '#4a4a55', ' opacity=".7"') + c(53, 40, 3.6, '#2b2b30') + p('M55 38 l5 -3 l-2 4z', '#2b2b30');
})();
