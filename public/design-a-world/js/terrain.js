/* Design a World: cozy board terrain. The static ground (island, beaches, soft blended colors, scattered trees,
   rocks and flowers, shadows) is painted once into an offscreen canvas and reused as one image until the world
   changes. All drawing is original (no outside art). Falls back to plain SVG shapes where there is no canvas. */
(function () {
  'use strict';
  var T = window.DAW_TERRAIN = {};
  var PAL = {
    grass: ['#9fc767', '#95bf5f', '#a9cd70', '#8fb95a', '#a2c463'], sand: '#ecd59c', water: '#71bddb', deep: '#4f9ecb', rock: '#b9aa98',
    snow: '#eef3f4', pave: '#d6cfbf', dirt: '#c9a56f', sea: '#5aa6cd', seaDeep: '#4b93bf', shallow: '#93d2e4', cliff: '#ad8352', cliff2: '#7f5f3b'
  };
  T.PAL = PAL;
  // painted biome grounds (js/biomes.js): a few close shades each, mixed with soft noise
  var BIOME_GROUND = { forest: ['#6c9a48', '#5f8f40', '#76a352', '#668f45'], desert: ['#e6c682', '#dfbb72', '#ebd092', '#e2c07a'], tundra: ['#dfe7e3', '#d3ddd8', '#e9efec', '#cfd9d2'], wetland: ['#86a866', '#7b9f5e', '#91b06d', '#7aa070'], alpine: ['#a9a08f', '#9d9483', '#b4ab9a', '#a2a08f'] };
  T.BIOME_GROUND = BIOME_GROUND;
  function hash(i, j, k) { var h = (Math.imul(i | 0, 374761393) + Math.imul(j | 0, 668265263) + Math.imul((k | 0) + 1, 1442695041)) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
  T.hash = hash;
  function noise(i, j) { return 0.5 + 0.25 * Math.sin(i * 0.55 + j * 0.21) + 0.25 * Math.sin(j * 0.47 - i * 0.18 + 1.7); }
  function mix(a, b, t) { var x = parseInt(a.slice(1), 16), y = parseInt(b.slice(1), 16); var r = Math.round(((x >> 16) & 255) * (1 - t) + ((y >> 16) & 255) * t), g = Math.round(((x >> 8) & 255) * (1 - t) + ((y >> 8) & 255) * t), bl = Math.round((x & 255) * (1 - t) + (y & 255) * t); return 'rgb(' + r + ',' + g + ',' + bl + ')'; }
  function colorOf(type, i, j) {
    if (!type || type === 'grass' || type === 'grass2') { var n = noise(i, j), h = hash(i, j, 3), base = PAL.grass[Math.floor(h * PAL.grass.length)]; return mix(base, n > 0.62 ? '#c4d77e' : '#7fae52', Math.abs(n - 0.5) * 0.5); }
    var bs = BIOME_GROUND[type];
    if (bs) { var n2 = noise(i + 3, j - 2), b2 = bs[Math.floor(hash(i, j, 4) * bs.length)]; return mix(b2, n2 > 0.6 ? '#fffbea' : '#3b3a2c', Math.abs(n2 - 0.5) * 0.3); }
    return PAL[type] || PAL.grass[0];
  }
  T.colorOf = colorOf;
  var cache = {}, order = [];
  T.stats = { builds: 0, lastMs: 0, hits: 0 };
  T.supported = function () { try { if (typeof document === 'undefined') return false; var c = document.createElement('canvas'); return !!(c.getContext && c.getContext('2d') && c.toDataURL); } catch (e) { return false; } };
  T.clear = function () { order.forEach(function (k) { if (cache[k].blob) try { URL.revokeObjectURL(cache[k].blob); } catch (e) { /* ignore */ } }); cache = {}; order = []; };

  // o: { N, HW, HH, xy(i, j) -> [x, y] cell centre, full {x, y, w, h}, b {min, max}, cells(i, j) -> {ground, occ, size, anchor}, key, night }
  T.render = function (o) {
    if (cache[o.key]) { T.stats.hits++; T.lastWasHit = true; return cache[o.key]; }
    T.lastWasHit = false;
    if (!T.supported()) return null;
    var t0 = (window.performance || Date).now(), K = o.scale || 1.2, F = o.full, W = Math.round(F.w * K), H = Math.round(F.h * K);
    var cv = document.createElement('canvas'); cv.width = W; cv.height = H; var g = cv.getContext('2d');
    var N = o.N, HW = o.HW, HH = o.HH, b = o.b;
    function tf(c) { c.setTransform(K, 0, 0, K, -F.x * K, -F.y * K); }
    function land(i, j) { return i >= b.min && i <= b.max && j >= b.min && j <= b.max; }
    // island outline: a union of soft ellipses, one per unlocked cell; edge cells wobble and corners round off
    function landPath(f, dy) {
      var p = new Path2D(), span = b.max - b.min;
      for (var i = b.min; i <= b.max; i++) for (var j = b.min; j <= b.max; j++) {
        var c = o.xy(i, j), di = Math.min(i - b.min, b.max - i), dj = Math.min(j - b.min, b.max - j), edge = di === 0 || dj === 0, r = f;
        if (edge) r *= 0.86 + hash(i, j, 7) * 0.4; // wobbly shoreline
        else if (di === 1 || dj === 1) r *= 1 + hash(i, j, 8) * 0.25;
        else r = Math.max(r, 1.2); // inner cells overlap fully, so the land has no gaps at cell corners
        if (di + dj < 3) r *= di + dj === 0 ? 0.5 : di + dj === 1 ? 0.72 : 0.9; // rounded corners
        p.moveTo(c[0] + HW * r, c[1] + (dy || 0)); p.ellipse(c[0], c[1] + (dy || 0), HW * r, HH * r, 0, 0, Math.PI * 2);
        if (edge && di + dj > 2 && span > 2 && hash(i, j, 9) < 0.3) { var bulge = 0.5 + hash(i, j, 10) * 0.45, oi = di === 0 ? (i === b.min ? -bulge : bulge) : 0, oj = dj === 0 ? (j === b.min ? -bulge : bulge) : 0, c2 = o.xy(i + oi, j + oj), rr = f * (0.55 + hash(i, j, 11) * 0.35); p.moveTo(c2[0] + HW * rr, c2[1] + (dy || 0)); p.ellipse(c2[0], c2[1] + (dy || 0), HW * rr, HH * rr, 0, 0, Math.PI * 2); }
      }
      return p;
    }
    // 1. sea with a soft lighter patch around the island
    g.fillStyle = PAL.sea; g.fillRect(0, 0, W, H); tf(g);
    var mid = o.xy((b.min + b.max) / 2, (b.min + b.max) / 2), R = (b.max - b.min + 4) * HW;
    var rg = g.createRadialGradient(mid[0], mid[1], R * 0.2, mid[0], mid[1], R * 1.4); rg.addColorStop(0, '#7cc0dd'); rg.addColorStop(1, PAL.seaDeep);
    g.save(); g.translate(mid[0], mid[1]); g.scale(1, 0.5); g.translate(-mid[0], -mid[1]); g.fillStyle = rg; g.fillRect(F.x - F.w, F.y - F.h * 2, F.w * 3, F.h * 5); g.restore();
    // gentle wave marks on open water
    g.strokeStyle = 'rgba(255,255,255,.22)'; g.lineWidth = 1.4; g.lineCap = 'round';
    for (var w = 0; w < 70; w++) { var wx = F.x + hash(w, 1, 21) * F.w, wy = F.y + hash(w, 2, 21) * F.h; g.beginPath(); g.moveTo(wx - 7, wy); g.quadraticCurveTo(wx - 3.5, wy - 3, wx, wy); g.quadraticCurveTo(wx + 3.5, wy - 3, wx + 7, wy); g.stroke(); }
    var outer = landPath(1.0), inner = landPath(0.84);
    // 2. shallow water halo and foam
    g.save(); g.filter = 'blur(' + Math.round(9 * K) + 'px)'; g.fillStyle = PAL.shallow; g.fill(landPath(1.4, 6)); g.restore();
    g.save(); g.filter = 'blur(' + Math.round(2 * K) + 'px)'; g.fillStyle = 'rgba(255,255,255,.55)'; g.fill(landPath(1.13, 5)); g.restore();
    // 3. board edge (earth side) with a soft drop shadow on the water
    g.save(); g.shadowColor = 'rgba(14,48,80,.38)'; g.shadowBlur = 22 * K; g.shadowOffsetY = 12 * K; g.fillStyle = PAL.cliff2; g.fill(landPath(1.0, 11)); g.restore();
    g.fillStyle = PAL.cliff; g.fill(landPath(1.0, 6));
    // 4. sandy beach ring
    g.fillStyle = PAL.sand; g.fill(outer);
    // 5. ground colors on their own canvas, blurred so neighbours blend (grass into sand into water)
    var gc = document.createElement('canvas'); gc.width = W; gc.height = H; var c2 = gc.getContext('2d'); tf(c2);
    var i, j, cell;
    for (i = b.min - 1; i <= b.max + 1; i++) for (j = b.min - 1; j <= b.max + 1; j++) { cell = land(i, j) ? o.cells(i, j) : null; var cc = o.xy(i, j); c2.fillStyle = cell ? colorOf(cell.ground, i, j) : PAL.sand; c2.beginPath(); c2.ellipse(cc[0], cc[1], HW * 1.2, HH * 1.2, 0, 0, Math.PI * 2); c2.fill(); }
    for (i = b.min; i <= b.max; i++) for (j = b.min; j <= b.max; j++) { cell = o.cells(i, j); if (cell.ground === 'water' || cell.ground === 'deep') { var cw = o.xy(i, j); c2.fillStyle = PAL.sand; c2.beginPath(); c2.ellipse(cw[0], cw[1], HW * 1.5, HH * 1.5, 0, 0, Math.PI * 2); c2.fill(); } }
    for (i = b.min; i <= b.max; i++) for (j = b.min; j <= b.max; j++) { cell = o.cells(i, j); if (cell.ground === 'water' || cell.ground === 'deep') { var cv2 = o.xy(i, j); c2.fillStyle = PAL[cell.ground]; c2.beginPath(); c2.ellipse(cv2[0], cv2[1], HW * 1.05, HH * 1.05, 0, 0, Math.PI * 2); c2.fill(); } }
    g.save(); g.clip(inner); g.setTransform(1, 0, 0, 1, 0, 0); g.filter = 'blur(' + Math.round(4 * K) + 'px)'; g.drawImage(gc, 0, 0); g.restore();
    // 6. painterly strokes and a faint hex-ish weave inside each cell
    g.save(); g.clip(inner); g.lineCap = 'round';
    for (i = b.min; i <= b.max; i++) for (j = b.min; j <= b.max; j++) {
      cell = o.cells(i, j); var p = o.xy(i, j), wet = cell.ground === 'water' || cell.ground === 'deep';
      for (var s = 0; s < 3; s++) { var u = (hash(i, j, 30 + s) - 0.5) * HW * 1.2, v = (hash(i, j, 40 + s) - 0.5) * HH * 1.2; g.strokeStyle = hash(i, j, 50 + s) < 0.5 ? 'rgba(255,255,240,.16)' : 'rgba(40,70,20,.12)'; if (wet) g.strokeStyle = 'rgba(255,255,255,.28)'; g.lineWidth = 2.2; g.beginPath(); g.moveTo(p[0] + u - 5, p[1] + v + 1.5); g.lineTo(p[0] + u + 5, p[1] + v - 1.5); g.stroke(); }
      g.strokeStyle = 'rgba(255,255,255,.07)'; g.lineWidth = 1; g.beginPath();
      for (var hx = 0; hx < 6; hx++) { var a = Math.PI / 3 * hx + Math.PI / 6, px = p[0] + Math.cos(a) * HW * 0.55, py = p[1] + Math.sin(a) * HH * 0.55; if (hx) g.lineTo(px, py); else g.moveTo(px, py); }
      g.closePath(); g.stroke();
    }
    // 7. soft ambient occlusion toward the shore, and contact shadows under placed things
    var ao = g.createRadialGradient(mid[0], mid[1], R * 0.25, mid[0], mid[1], R * 0.75); ao.addColorStop(0, 'rgba(255,255,220,.07)'); ao.addColorStop(1, 'rgba(30,50,20,.16)');
    g.save(); g.translate(mid[0], mid[1]); g.scale(1, 0.5); g.translate(-mid[0], -mid[1]); g.fillStyle = ao; g.fillRect(F.x - F.w, F.y - F.h * 2, F.w * 3, F.h * 5); g.restore();
    g.filter = 'blur(' + Math.round(3 * K) + 'px)'; g.fillStyle = 'rgba(28,48,22,.22)';
    for (i = b.min; i <= b.max; i++) for (j = b.min; j <= b.max; j++) { cell = o.cells(i, j); if (cell.anchor) { var sz = cell.size || 1, ca = o.xy(i + (sz - 1) / 2, j + (sz - 1) / 2); g.beginPath(); g.ellipse(ca[0] + 3, ca[1] + 3, HW * sz * 0.62, HH * sz * 0.62, 0, 0, Math.PI * 2); g.fill(); } }
    g.filter = 'none'; g.restore();
    // 8. little details on empty land: trees, rocks, flowers, tufts
    g.save(); g.clip(inner);
    for (i = b.min; i <= b.max; i++) for (j = b.min; j <= b.max; j++) {
      cell = o.cells(i, j); if (cell.occ) continue; var h = hash(i, j, 61), q = o.xy(i, j), ox = (hash(i, j, 62) - 0.5) * HW * 0.7, oy = (hash(i, j, 63) - 0.5) * HH * 0.6, x = q[0] + ox, y = q[1] + oy;
      var bc = cell.biome;
      if (bc === 'f') { if (h < 0.42) tree(g, x, y, 0.8 + hash(i, j, 64) * 0.45, hash(i, j, 65) * 0.7); else if (h < 0.62) { tree(g, x - 6, y - 1, 0.7, 0.2); tree(g, x + 5, y + 2, 0.85, 0.8); } else if (h < 0.8) tuft(g, x, y); continue; }
      if (bc === 'd') { if (h < 0.13) cactus(g, x, y, 0.8 + hash(i, j, 64) * 0.5); else if (h < 0.24) rock(g, x, y, 0.6 + hash(i, j, 66) * 0.5); else if (h < 0.36) dry(g, x, y); continue; }
      if (bc === 't') { if (h < 0.24) snow(g, x, y, 0.8 + hash(i, j, 64) * 0.6); else if (h < 0.3) { tree(g, x, y, 0.7, 0.1); snowcap(g, x, y, 0.7); } else if (h < 0.38) rock(g, x, y, 0.6); continue; }
      if (bc === 'w') { if (h < 0.34) reeds(g, x, y, hash(i, j, 64)); else if (h < 0.46) puddle(g, x, y, 0.8 + hash(i, j, 64) * 0.5); else if (h < 0.56) tuft(g, x, y); continue; }
      if (bc === 'c') { if (h < 0.3) { g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(x - 5, y); g.quadraticCurveTo(x, y - 3, x + 5, y); g.stroke(); } continue; }
      if (bc === 'm') { if (h < 0.26) peak(g, x, y, 0.8 + hash(i, j, 64) * 0.5); else if (h < 0.48) rock(g, x, y, 0.9 + hash(i, j, 66) * 0.6); else if (h < 0.56) tree(g, x, y, 0.65, 0.1); continue; }
      if (h < 0.08) tree(g, x, y, 0.75 + hash(i, j, 64) * 0.45, hash(i, j, 65));
      else if (h < 0.11) { tree(g, x - 6, y - 1, 0.65, 0.3); tree(g, x + 5, y + 2, 0.8, 0.7); }
      else if (h < 0.16) rock(g, x, y, 0.7 + hash(i, j, 66) * 0.5);
      else if (h < 0.3) flowers(g, x, y, hash(i, j, 67));
      else if (h < 0.5) tuft(g, x, y);
    }
    g.restore();
    var data = cv.toDataURL('image/jpeg', 0.86), blob = null;
    try { if (window.URL && URL.createObjectURL && window.Blob && window.atob) { var bin = atob(data.split(',')[1]), arr = new Uint8Array(bin.length); for (var k = 0; k < bin.length; k++) arr[k] = bin.charCodeAt(k); blob = URL.createObjectURL(new Blob([arr], { type: 'image/jpeg' })); } } catch (e) { blob = null; }
    var out = { data: data, blob: blob, x: F.x, y: F.y, w: F.w, h: F.h, ms: 0 };
    out.ms = Math.round((window.performance || Date).now() - t0); T.stats.builds++; T.stats.lastMs = out.ms;
    cache[o.key] = out; order.push(o.key); while (order.length > 4) { var old = order.shift(); if (cache[old] && cache[old].blob) try { URL.revokeObjectURL(cache[old].blob); } catch (e2) { /* ignore */ } delete cache[old]; }
    return out;
  };
  function tree(g, x, y, s, t) {
    g.fillStyle = 'rgba(30,50,20,.25)'; g.beginPath(); g.ellipse(x + 2 * s, y + 1.5 * s, 6 * s, 2.6 * s, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#7a5532'; g.fillRect(x - 0.9 * s, y - 5 * s, 1.8 * s, 5 * s);
    if (t < 0.5) { g.fillStyle = '#3f7d3a'; g.beginPath(); g.moveTo(x, y - 17 * s); g.lineTo(x + 6 * s, y - 3.5 * s); g.lineTo(x - 6 * s, y - 3.5 * s); g.closePath(); g.fill(); g.fillStyle = '#5c9a49'; g.beginPath(); g.moveTo(x, y - 17 * s); g.lineTo(x + 6 * s, y - 3.5 * s); g.lineTo(x, y - 3.5 * s); g.closePath(); g.fill(); }
    else { g.fillStyle = '#4c8a3c'; g.beginPath(); g.arc(x, y - 8 * s, 5.5 * s, 0, Math.PI * 2); g.fill(); g.fillStyle = '#6aa84f'; g.beginPath(); g.arc(x - 1.6 * s, y - 9.6 * s, 3.2 * s, 0, Math.PI * 2); g.fill(); }
  }
  function rock(g, x, y, s) { g.fillStyle = 'rgba(30,40,30,.22)'; g.beginPath(); g.ellipse(x + 1, y + 1.5, 5 * s, 2.2 * s, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = '#9c9488'; g.beginPath(); g.ellipse(x, y - 1.5 * s, 4.2 * s, 3 * s, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = '#c4bdb2'; g.beginPath(); g.ellipse(x - 1.2 * s, y - 2.6 * s, 2 * s, 1.3 * s, 0, 0, Math.PI * 2); g.fill(); }
  function flowers(g, x, y, t) { var cols = ['#fff3bf', '#ffa8a8', '#e599f7', '#ffffff', '#ffd43b']; for (var k = 0; k < 5; k++) { g.fillStyle = cols[(k + Math.floor(t * 5)) % 5]; g.beginPath(); g.arc(x + (hash(k, Math.floor(t * 100), 70) - 0.5) * 12, y + (hash(k, Math.floor(t * 100), 71) - 0.5) * 5, 1.3, 0, Math.PI * 2); g.fill(); } }
  function cactus(g, x, y, s) { g.fillStyle = 'rgba(80,60,20,.22)'; g.beginPath(); g.ellipse(x + 2, y + 1, 4 * s, 1.8 * s, 0, 0, Math.PI * 2); g.fill(); g.strokeStyle = '#4f8a46'; g.lineCap = 'round'; g.lineWidth = 3 * s; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y - 12 * s); g.moveTo(x, y - 6 * s); g.lineTo(x - 4 * s, y - 6 * s); g.lineTo(x - 4 * s, y - 10 * s); g.moveTo(x, y - 4 * s); g.lineTo(x + 4 * s, y - 4 * s); g.lineTo(x + 4 * s, y - 8 * s); g.stroke(); g.strokeStyle = 'rgba(255,255,255,.25)'; g.lineWidth = 1 * s; g.beginPath(); g.moveTo(x - 0.6 * s, y - 1); g.lineTo(x - 0.6 * s, y - 11 * s); g.stroke(); }
  function dry(g, x, y) { g.strokeStyle = 'rgba(150,110,50,.6)'; g.lineWidth = 1; g.beginPath(); g.moveTo(x, y); g.lineTo(x - 2, y - 3); g.moveTo(x, y); g.lineTo(x + 2, y - 3); g.moveTo(x, y); g.lineTo(x, y - 4); g.stroke(); }
  function snow(g, x, y, s) { g.fillStyle = 'rgba(255,255,255,.85)'; g.beginPath(); g.ellipse(x, y, 7 * s, 3 * s, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = 'rgba(190,210,225,.5)'; g.beginPath(); g.ellipse(x + 1.5 * s, y + 1 * s, 4 * s, 1.4 * s, 0, 0, Math.PI * 2); g.fill(); }
  function snowcap(g, x, y, s) { g.fillStyle = '#ffffff'; g.beginPath(); g.moveTo(x, y - 17 * s); g.lineTo(x + 3 * s, y - 10 * s); g.lineTo(x - 3 * s, y - 10 * s); g.closePath(); g.fill(); }
  function reeds(g, x, y, t) { g.strokeStyle = '#5d7d3a'; g.lineWidth = 1.1; g.lineCap = 'round'; for (var k = 0; k < 4; k++) { var dx = (k - 1.5) * 2.2; g.beginPath(); g.moveTo(x + dx, y); g.quadraticCurveTo(x + dx + 1, y - 5, x + dx + (k % 2 ? 2 : -1), y - 9 - (k % 2) * 2); g.stroke(); } g.fillStyle = '#8a5a2b'; g.fillRect(x - 0.8 + (t > 0.5 ? 2 : -2), y - 11, 1.8, 4); }
  function puddle(g, x, y, s) { g.fillStyle = 'rgba(80,150,190,.75)'; g.beginPath(); g.ellipse(x, y, 6 * s, 2.6 * s, 0, 0, Math.PI * 2); g.fill(); g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = 0.8; g.beginPath(); g.moveTo(x - 3 * s, y - 0.5); g.lineTo(x, y - 0.5); g.stroke(); }
  function peak(g, x, y, s) { g.fillStyle = 'rgba(40,40,30,.2)'; g.beginPath(); g.ellipse(x + 2, y + 1, 9 * s, 3 * s, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = '#8e8676'; g.beginPath(); g.moveTo(x - 9 * s, y); g.lineTo(x - 1 * s, y - 15 * s); g.lineTo(x + 8 * s, y); g.closePath(); g.fill(); g.fillStyle = '#b0a898'; g.beginPath(); g.moveTo(x - 1 * s, y - 15 * s); g.lineTo(x + 8 * s, y); g.lineTo(x + 1 * s, y); g.closePath(); g.fill(); g.fillStyle = '#ffffff'; g.beginPath(); g.moveTo(x - 1 * s, y - 15 * s); g.lineTo(x + 2.5 * s, y - 9 * s); g.lineTo(x - 3.6 * s, y - 10 * s); g.closePath(); g.fill(); }
  function tuft(g, x, y) { g.strokeStyle = 'rgba(60,110,40,.55)'; g.lineWidth = 1; g.beginPath(); g.moveTo(x, y); g.lineTo(x - 1.5, y - 3.5); g.moveTo(x, y); g.lineTo(x, y - 4.2); g.moveTo(x, y); g.lineTo(x + 1.6, y - 3.4); g.stroke(); }
})();
