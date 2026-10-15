/* Design a World: isometric world map (SVG), map tools (grid, coordinates, compass, scale bar,
   legend, area/perimeter and volume measuring). The same builder makes the export image. */
(function () {
  'use strict';
  var A = window.DAW_ART, S = window.DAW_STATE, IT = window.DAW_ITEMS;
  // Finer board (schema 6): N x N cells, each half the old tile size, so the board covers the same picture.
  // A cell's centre sits where the old tile grid would put it: an old tile (a, b) is exactly cells 2a..2a+1, 2b..2b+1.
  var M = window.DAW_MAP = {}, N = S.WORLD || 24, HW = 24, HH = 12, TR = window.DAW_TERRAIN;
  M.N = N; M.HW = HW; M.HH = HH;
  var BUILD = /houses|school|townhall|museum|station|lab$|center|ranger|fair|workshop|observatory|lighthouse|market|bank|plant|mill|factory|recycl|library|hospital|shop|store|tower|overlook/;
  M.isBuilding = function (art) { return BUILD.test(String(art || '')); };
  function colorFilter(id, sk) { return sk && (sk.matrix || sk.hue != null) ? '<filter id="' + id + '">' + (sk.matrix ? '<feColorMatrix type="matrix" values="' + sk.matrix + '"/>' : '<feColorMatrix type="hueRotate" values="' + sk.hue + '"/>') + '</filter>' : ''; }
  function xy(i, j) { return [(i - j) * HW, (i + j - 1) * HH]; }
  M.xy = xy;
  // Ordered pairs: first quadrant, origin at the board's west corner, one unit per cell side.
  M.coord = function (i, j) { return { x: i, y: N - 1 - j }; };
  M.fromCoord = function (x, y) { return { i: x, j: N - 1 - y }; };
  function sz(t) { return S.sizeOf ? S.sizeOf(t) : 1; }
  M.tileCoord = function (t) { return { x: t.i, y: N - 1 - (t.j + sz(t) - 1) }; }; // a big thing's lower-left cell
  M.tileXY = function (t) { var n = sz(t); return xy(t.i + (n - 1) / 2, t.j + (n - 1) / 2); };
  M.scaleOf = function (n) { return n > 1 ? n / 2 : 0.56; }; // art is drawn for a 2 x 2 footprint
  var FULL = { x: -620, y: -130, w: 1240, h: 760 };
  M.viewFor = function (b) { // frame the unlocked land plus a ring of clouds
    var lo = Math.max(0, b.min - 1), hi = Math.min(N - 1, b.max + 1);
    if (lo === 0 && hi === N - 1) return FULL;
    var x0 = xy(lo, hi)[0] - HW - 30, x1 = xy(hi, lo)[0] + HW + 30, y0 = xy(lo, lo)[1] - HH - 100, y1 = xy(hi, hi)[1] + HH + 50;
    var w = x1 - x0, h = y1 - y0, want = FULL.w / FULL.h;
    if (w / h < want) { var nw = h * want; x0 -= (nw - w) / 2; w = nw; } else { var nh = w / want; y0 -= (nh - h) / 2; h = nh; }
    return { x: Math.round(x0), y: Math.round(y0), w: Math.round(w), h: Math.round(h) };
  };

  function diamond(i, j, inset) { var c = xy(i, j), k = 1 - (inset || 0); return A.pts([[c[0], c[1] - HH * k], [c[0] + HW * k, c[1]], [c[0], c[1] + HH * k], [c[0] - HW * k, c[1]]]); }
  // outline of an n x n (or w x h) block of cells starting at (i, j)
  function block(i, j, w, h) { h = h || w; var t = xy(i, j), r = xy(i + w - 1, j), bt = xy(i + w - 1, j + h - 1), l = xy(i, j + h - 1); return A.pts([[t[0], t[1] - HH], [r[0] + HW, r[1]], [bt[0], bt[1] + HH], [l[0] - HW, l[1]]]); }
  M.block = block; M.diamond = diamond;
  function gridPath(lo, hi) { var d = ''; for (var k = lo; k <= hi + 1; k++) { var a = xy(k - 0.5, lo - 0.5), c = xy(k - 0.5, hi + 0.5), e = xy(lo - 0.5, k - 0.5), f = xy(hi + 0.5, k - 0.5); d += 'M' + a[0] + ' ' + a[1] + 'L' + c[0] + ' ' + c[1] + 'M' + e[0] + ' ' + e[1] + 'L' + f[0] + ' ' + f[1]; } return d; }
  // the cozy terrain under everything: canvas image when possible, plain soft shapes otherwise
  function terrain(save, ix, b, opts) {
    var occ = {}, grid = [], parts = [];
    save.world.tiles.forEach(function (t) { var n = sz(t), art = A.item[IT.get(t.t).art], gr = (art && art.ground) || null; parts.push(t.i + ',' + t.j + ',' + n + ',' + (gr || '')); for (var a = 0; a < n; a++) for (var c = 0; c < n; c++) occ[(t.i + a) + ',' + (t.j + c)] = { ground: gr, occ: true, size: n, anchor: a === 0 && c === 0 }; });
    // painted biomes: empty cells take the painted ground; a placed thing keeps its own ground unless that is plain grass
    if (S.ensurePaint) S.ensurePaint(save);
    var BIO = S.BIO, pstr = (save.world && typeof save.world.paint === 'string') ? save.world.paint : '', pa = BIO ? BIO.decode(pstr, N) : null;
    var cells = function (i, j) {
      var p = pa && i >= 0 && j >= 0 && i < N && j < N ? pa[j * N + i] : '.', br = p !== '.' && BIO ? BIO.byCode[p] : null, c = occ[i + ',' + j];
      if (c) return { ground: c.ground && c.ground !== 'grass' ? c.ground : (br ? br.ground : c.ground), occ: true, size: c.size, anchor: c.anchor, biome: p };
      return { ground: br ? br.ground : null, occ: false, biome: p };
    };
    var key = b.min + '/' + b.max + '|' + parts.sort().join(';') + '|' + pstr;
    var out = TR && TR.render({ N: N, HW: HW, HH: HH, xy: xy, full: FULL, b: b, cells: cells, key: key });
    if (out) return { svg: '<image class="terrain" href="' + (opts.live && out.blob ? out.blob : out.data) + '" x="' + out.x + '" y="' + out.y + '" width="' + out.w + '" height="' + out.h + '" preserveAspectRatio="none"/>', ms: TR.lastWasHit ? 0 : out.ms, cached: !!TR.lastWasHit };
    // fallback (no canvas): sea plus soft cell shapes
    var o = ['<rect x="' + FULL.x + '" y="' + FULL.y + '" width="' + FULL.w + '" height="' + FULL.h + '" fill="#5aa6cd"/>'];
    for (var i = b.min; i <= b.max; i++) for (var j = b.min; j <= b.max; j++) { var cl = TR ? TR.colorOf(cells(i, j).ground, i, j) : '#9fc767'; o.push('<polygon points="' + diamond(i, j, -0.04) + '" fill="' + cl + '"/>'); }
    return { svg: o.join(''), ms: 0 };
  }

  // opts: {ix, unlockAll, grid, coords, compass, scale, legend, highlightUid, measure:{a:{i,j},b:{i,j}}, forExport, title}
  M.build = function (save, opts) {
    opts = opts || {};
    var ix = opts.ix, size = S.stageSize(ix, S.highestUnlocked(save, ix, { unlockAll: opts.unlockAll })), b = S.bounds(size);
    var o = [], VB = opts.full || opts.forExport ? FULL : M.viewFor(b);
    o.push('<svg xmlns="http://www.w3.org/2000/svg" class="world-svg" viewBox="' + VB.x + ' ' + VB.y + ' ' + VB.w + ' ' + VB.h + '" role="img" aria-label="World map">');
    o.push(A.defs());
    // visible consequences of unmet world needs (also work in the exported PNG)
    o.push('<defs><filter id="daw-dry"><feColorMatrix type="matrix" values="0.55 0.35 0.1 0 0.08  0.45 0.4 0.1 0 0.04  0.3 0.25 0.1 0 0  0 0 0 1 0"/></filter><filter id="daw-dark"><feComponentTransfer><feFuncR type="linear" slope="0.38"/><feFuncG type="linear" slope="0.4"/><feFuncB type="linear" slope="0.55"/></feComponentTransfer></filter></defs>');
    var WC = window.DAW_WORLDC, eff = WC && WC.data && WC.data() && S.hooks().needActive ? WC.effects(save, ix) : { byArt: {}, fewer: false };
    // fun layer: unlocked building skins / biome themes and the consequences of a gentle world event
    var FU = window.DAW_FUNC, fun = FU && FU.data && FU.data() && save.fun ? save.fun : null, skin = fun && FU.skin(fun.skin), theme = fun && FU.skin(fun.theme), evx = fun ? FU.eventFx(save) : { kind: null, tiles: [], byArt: {} };
    var skinF = colorFilter('daw-skin', skin), themeF = colorFilter('daw-theme', theme);
    if (skinF || themeF) o.push('<defs>' + skinF + themeF + '</defs>');
    if (evx.kind === 'dry') { var bya = {}; Object.keys(eff.byArt || {}).forEach(function (k) { bya[k] = eff.byArt[k]; }); Object.keys(evx.byArt).forEach(function (k) { if (!bya[k]) bya[k] = 'dry'; }); eff = { byArt: bya, fewer: eff.fewer }; }
    var evTiles = {}; (evx.tiles || []).forEach(function (u) { var tt = save.world.tiles.filter(function (q) { return q.u === u; })[0]; if (tt) evTiles[tt.i + ',' + tt.j] = tt; });
    if (opts.forExport) o.push('<rect x="' + VB.x + '" y="' + VB.y + '" width="' + VB.w + '" height="' + VB.h + '" fill="#4b93bf"/>');
    var tiles = {}; save.world.tiles.forEach(function (t) { tiles[t.i + ',' + t.j] = t; });
    var ter = terrain(save, ix, b, opts); M.lastTerrainMs = ter.ms;
    o.push('<g class="ground"' + (themeF ? ' filter="url(#daw-theme)"' : '') + '>' + ter.svg + '</g>');
    // event consequences on the ground (static, so they show with reduced motion and in the exported image)
    var i, j;
    if (evx.kind === 'flood') { o.push('<g class="ev-flood" pointer-events="none" filter="url(#daw-soft)">'); Object.keys(evTiles).forEach(function (k) { var t0 = evTiles[k], n = sz(t0), c0 = M.tileXY(t0); [[0, 0, 1.25], [-0.8, 0.5, 0.8], [0.8, 0.6, 0.75], [0.1, -0.7, 0.7]].forEach(function (dd) { o.push('<ellipse class="flood-tile" cx="' + (c0[0] + dd[0] * HW * n).toFixed(1) + '" cy="' + (c0[1] + dd[1] * HH * n).toFixed(1) + '" rx="' + (HW * n * dd[2]).toFixed(1) + '" ry="' + (HH * n * dd[2]).toFixed(1) + '" fill="#4dabf7" opacity=".5"/>'); }); }); o.push('</g>'); }
    // square grid: hidden unless Grid, (x, y) or Measure is on (CSS shows it for those tools); exports draw it only when asked
    if (!opts.forExport || opts.grid || opts.coords) o.push('<g class="grid' + (opts.grid || opts.coords ? ' on' : '') + '" pointer-events="none"><path d="' + gridPath(0, N - 1) + '" fill="none" stroke="#ffffff" stroke-opacity=".13" stroke-width=".8"/><path d="' + gridPath(b.min, b.max) + '" fill="none" stroke="#fffbe8" stroke-opacity=".7" stroke-width="1.1"/></g>');
    if (opts.measure && opts.measure.a && opts.measure.b) {
      var ma = opts.measure.a, mb = opts.measure.b, i0 = Math.min(ma.i, mb.i), i1 = Math.max(ma.i, mb.i), j0 = Math.min(ma.j, mb.j), j1 = Math.max(ma.j, mb.j);
      o.push('<polygon class="measure-rect" points="' + block(i0, j0, i1 - i0 + 1, j1 - j0 + 1) + '" fill="rgba(255,196,0,.28)" stroke="#e8a400" stroke-width="2.5" stroke-dasharray="7 4" pointer-events="none"/>');
    }
    // items, back to front
    var list = save.world.tiles.slice().sort(function (a, c2) { return (a.i + a.j + sz(a)) - (c2.i + c2.j + sz(c2)) || a.i - c2.i; });
    o.push('<g class="items">');
    list.forEach(function (t) {
      var def = IT.get(t.t), f = A.item[def.art] || A.item.houses, n = sz(t), c3 = M.tileXY(t), k = M.scaleOf(n), kb = n > 1 ? 1 : 0.8, by = Math.round(-62 * k - (n > 1 ? 0 : 4));
      var m = ix.byItem[t.t], pending = m && !(save.missions[m.id] && save.missions[m.id].done), review = m && !pending && S.reviewReasons(save, ix, m).length, waiting = pending && S.hooks().needActive && S.missionState(save, ix, m, { unlockAll: opts.unlockAll }) === 'waiting', fx = eff.byArt[def.art];
      var FD = window.DAW_DESC, fdx = FD && FD.shared(), fg = fdx ? FD.tileInfo(save, fdx, def.art, t) : { status: 'none', orgs: [] }, needsDesc = !pending && fg.status === 'needs';
      var bld = skinF && BUILD.test(def.art);
      o.push('<g class="item' + (pending ? ' pending' : '') + (needsDesc ? ' needs-desc' : '') + (opts.highlightUid === t.u ? ' pop' : '') + '" data-i="' + t.i + '" data-j="' + t.j + '" data-s="' + n + '" data-k="' + k + '" data-fg="' + fg.status + '" data-art="' + esc(def.art) + '" transform="translate(' + c3[0] + ' ' + c3[1] + ')"' + (fx ? ' data-fx="' + fx + '"' : '') + (pending ? ' opacity=".66"' : needsDesc ? ' opacity=".72"' : '') + '><g class="art" transform="scale(' + k + ')">' + (fx ? '<g filter="url(#daw-' + fx + ')">' : '') + (bld ? '<g filter="url(#daw-skin)">' : '') + f(t.i * 13 + t.j * 7 + 1) + (bld ? '</g>' : '') + (fx ? '</g>' : ''));
      var ek = evTiles[t.i + ',' + t.j] && evx.kind;
      if (ek === 'slide') o.push('<g class="ev-slide" pointer-events="none"><path d="M-30 6 l10 -8 l12 4 l6 10 z" fill="#8f8478" stroke="#6b5f54"/><path d="M4 12 l8 -7 l10 3 l2 8 z" fill="#a69c90" stroke="#6b5f54"/><circle cx="-6" cy="16" r="4" fill="#7a6f63"/></g>');
      if (ek === 'invasive') o.push('<g class="ev-invasive" pointer-events="none">' + [[-24, 8], [-10, 14], [6, 10], [18, 16], [-2, 2]].map(function (q) { return '<g transform="translate(' + q[0] + ' ' + q[1] + ')"><ellipse rx="6" ry="3" fill="#5c940d"/><ellipse cx="3" cy="-1" rx="4" ry="2" fill="#82c91e"/></g>'; }).join('') + '</g>');
      if (fx) o.push('<g class="fx-badge" transform="translate(26 -44)" pointer-events="none"><circle r="10" fill="' + (fx === 'dry' ? '#e8590c' : '#343a40') + '" stroke="#fff" stroke-width="2"/><text y="4.5" text-anchor="middle" font-size="12" font-weight="800" fill="#fff" font-family="Lexend, sans-serif">' + (fx === 'dry' ? '\u2600' : '\u263e') + '</text></g>');
      var shownOrgs = eff.fewer ? fg.orgs.filter(function (x, k) { return k % 2 === 0; }) : fg.orgs; if (eff.fewer && fg.orgs.length > 1) o.push('<g class="fx-fewer" data-hidden="' + (fg.orgs.length - shownOrgs.length) + '"></g>'); fg = { status: fg.status, orgs: shownOrgs };
      if (fg.orgs.length) { var OP = [[-30, 2], [8, 2], [-20, 14], [-2, 14]]; fg.orgs.forEach(function (x, k) { var p = OP[k % 4]; o.push('<g class="org-on" data-org="' + esc(x.id) + '" transform="translate(' + p[0] + ' ' + p[1] + ')" pointer-events="none"><g class="wander"><ellipse cx="11" cy="21" rx="9" ry="3" fill="rgba(0,0,0,.18)"/>' + A.organismSvg(x.art || 'mouse', 22) + (x.done ? '' : '<circle cx="20" cy="2" r="4.5" fill="#7048e8" stroke="#fff" stroke-width="1.5"/>') + '</g></g>'); }); }
      o.push('</g>');
      if (needsDesc) o.push('<g class="desc-badge" transform="translate(0 ' + by + ') scale(' + kb + ')"><circle r="11" fill="#7048e8" stroke="#fff" stroke-width="2.5"/><text y="5" text-anchor="middle" font-size="14" font-weight="800" fill="#fff" font-family="Lexend, sans-serif">\u270e</text></g>');
      if (waiting) o.push('<g class="wait-badge" transform="translate(0 ' + by + ') scale(' + kb + ')"><circle r="11" fill="#868e96" stroke="#fff" stroke-width="2.5"/><text y="4" text-anchor="middle" font-size="12" font-weight="800" fill="#fff" font-family="Lexend, sans-serif">\u2026</text></g>');
      else if (pending) o.push('<g class="pend-badge" transform="translate(0 ' + by + ') scale(' + kb + ')"><circle r="11" fill="#f08c00" stroke="#fff" stroke-width="2.5"/><text y="5" text-anchor="middle" font-size="15" font-weight="800" fill="#fff" font-family="Lexend, sans-serif">!</text></g>');
      if (review) o.push('<g class="rev-badge" transform="translate(0 ' + by + ') scale(' + kb + ')"><circle r="11" fill="#e8590c" stroke="#fff" stroke-width="2.5"/><text y="5" text-anchor="middle" font-size="13" font-weight="800" fill="#fff" font-family="Lexend, sans-serif">?</text></g>');
      if (save.names[t.t] && opts.labels !== false) o.push('<g transform="translate(0 ' + Math.round(30 * Math.max(k, 0.7)) + ')" pointer-events="none"><rect x="' + (-Math.min(60, save.names[t.t].length * 3.6 + 8)) + '" y="-9" width="' + Math.min(120, save.names[t.t].length * 7.2 + 16) + '" height="16" rx="8" fill="rgba(19,41,75,.78)"/><text y="3" text-anchor="middle" font-size="10" font-weight="600" fill="#fff" font-family="Lexend, sans-serif">' + esc(save.names[t.t].slice(0, 16)) + '</text></g>');
      o.push('</g>');
    });
    o.push('</g>');
    // history landmarks: small symbolic pennants (never people or violence)
    var marks = (save.history && save.history.marks) || []; if (marks.length) { o.push('<g class="h-marks" pointer-events="none">'); marks.forEach(function (mk, k) { var cm = xy(mk.i, mk.j), col = ['#7048e8', '#1c7ed6', '#2b8a3e', '#e8590c', '#c2255c'][k % 5]; o.push('<g class="h-mark" data-arc="' + esc(mk.arc) + '" transform="translate(' + (cm[0] + 14) + ' ' + (cm[1] + 3) + ') scale(.8)"><title>' + esc(mk.text || '') + '</title><ellipse cx="0" cy="2" rx="7" ry="2.5" fill="rgba(0,0,0,.2)"/><rect x="-1.2" y="-30" width="2.4" height="32" fill="#495057"/><path d="M1 -30 l18 6 l-18 6z" fill="' + col + '" stroke="#fff" stroke-width="1"/><circle cx="0" cy="-31" r="2.4" fill="#fab005"/></g>'); }); o.push('</g>'); }
    // civilizations (god game): settlements, homeland, mills, dams; symbolic only
    if (window.DAW_CIVC && window.DAW_CIVC.svgLayer) o.push(window.DAW_CIVC.svgLayer(save, xy));
    // hit layer (tile diamonds on top so taps always land)
    if (!opts.forExport) { o.push('<g class="hits">'); for (i = 0; i < N; i++) for (j = 0; j < N; j++) o.push('<polygon class="hit" data-i="' + i + '" data-j="' + j + '" points="' + diamond(i, j) + '" fill="transparent"/>'); o.push('<polygon class="hover" points="0,0" fill="rgba(255,255,255,.3)" stroke="#fff" stroke-width="1.6" pointer-events="none" visibility="hidden"/><polygon class="foot" points="0,0" fill="rgba(64,192,87,.32)" stroke="#2b8a3e" stroke-width="2" stroke-dasharray="5 3" pointer-events="none" visibility="hidden"/><g class="hover-xy" pointer-events="none" visibility="hidden"><rect x="-26" y="-30" width="52" height="20" rx="10" fill="#13294B" opacity=".88"/><text y="-15.5" text-anchor="middle" font-family="Lexend, sans-serif" font-size="12" font-weight="700" fill="#fff"></text></g></g>'); }
    if (opts.coords) {
      // first-quadrant axes along the board's two front edges; every cell gets a tick, labels every 1 or 2 so they stay readable
      var step = VB.w > 900 ? 2 : 1, fs = VB.w > 900 ? 15 : 12, ax = [];
      var x0 = xy(-0.5, N - 0.5), x1 = xy(N - 0.5, N - 0.5), y1 = xy(-0.5, -0.5);
      o.push('<g class="coords" font-family="Lexend, sans-serif" font-size="' + fs + '" font-weight="700" fill="#13294B" pointer-events="none">');
      o.push('<path d="M' + x0[0] + ' ' + x0[1] + 'L' + x1[0] + ' ' + x1[1] + 'M' + x0[0] + ' ' + x0[1] + 'L' + y1[0] + ' ' + y1[1] + '" stroke="#13294B" stroke-width="2.2" fill="none"/>');
      for (i = 0; i < N; i++) { var cx = xy(i, N - 0.5); ax.push('M' + cx[0] + ' ' + cx[1] + 'l-4 4'); if (i % step === 0) o.push('<text x="' + (cx[0] - 9) + '" y="' + (cx[1] + 18) + '" text-anchor="middle">' + i + '</text>'); }
      for (j = 0; j < N; j++) { var cy = xy(-0.5, j); ax.push('M' + cy[0] + ' ' + cy[1] + 'l-4 -4'); if ((N - 1 - j) % step === 0) o.push('<text x="' + (cy[0] - 12) + '" y="' + (cy[1] - 4) + '" text-anchor="end">' + (N - 1 - j) + '</text>'); }
      o.push('<path d="' + ax.join('') + '" stroke="#13294B" stroke-width="1.6" fill="none"/>');
      o.push('<circle cx="' + x0[0] + '" cy="' + x0[1] + '" r="4" fill="#13294B"/><text x="' + (x0[0] - 8) + '" y="' + (x0[1] + 22) + '" text-anchor="end" font-size="' + (fs - 1) + '">(0, 0)</text>');
      o.push('<text x="' + (x1[0] - 40) + '" y="' + (x1[1] + 44) + '" font-size="' + (fs + 1) + '">x-axis \u2192</text><text x="' + (y1[0] - 90) + '" y="' + (y1[1] + 30) + '" font-size="' + (fs + 1) + '" transform="rotate(-26.6 ' + (y1[0] - 90) + ' ' + (y1[1] + 30) + ')">y-axis \u2192</text>');
      o.push('</g>');
    }
    var sc = VB.w / FULL.w, ov = function (x, y) { return 'translate(' + (VB.x + x * sc) + ' ' + (VB.y + y * sc) + ') scale(' + sc + ')'; };
    if (evx.kind === 'storm') o.push('<g class="ev-storm" pointer-events="none"><rect x="' + VB.x + '" y="' + VB.y + '" width="' + VB.w + '" height="' + VB.h + '" fill="#495057" opacity=".16"/></g>');
    if (opts.compass) o.push('<g class="compass" transform="' + ov(1140, 60) + '" font-family="Lexend, sans-serif" font-weight="800"' + (opts.forExport ? ' pointer-events="none"' : '') + '><title>Compass</title><circle r="34" fill="#fff" stroke="#13294B" stroke-width="2" opacity=".95"/><path d="M0 -28 L7 0 L0 6 L-7 0 Z" fill="#c92a2a"/><path d="M0 28 L7 0 L0 -6 L-7 0 Z" fill="#13294B"/><text y="-36" text-anchor="middle" font-size="13" fill="#c92a2a">N</text><text y="49" text-anchor="middle" font-size="12" fill="#13294B">S</text><text x="44" y="5" text-anchor="middle" font-size="12" fill="#13294B">E</text><text x="-44" y="5" text-anchor="middle" font-size="12" fill="#13294B">W</text></g>');
    if (opts.scale) o.push('<g transform="translate(' + (VB.x + 38 * sc) + ' ' + (VB.y + VB.h - 40 * sc) + ')" font-family="Lexend, sans-serif" font-size="13" fill="#13294B" pointer-events="none"><rect x="-8" y="-28" width="282" height="44" rx="8" fill="#fff" opacity=".92"/>' + [0, 1, 2, 3, 4, 5].map(function (q) { return '<rect x="' + (q * CELL).toFixed(1) + '" y="0" width="' + CELL.toFixed(1) + '" height="8" fill="' + (q % 2 ? '#fff' : '#13294B') + '" stroke="#13294B" stroke-width=".8"/>'; }).join('') + [0, 2, 4, 6].map(function (q) { return '<text x="' + (q * CELL - 3).toFixed(1) + '" y="-8">' + q + (q === 6 ? ' km' : '') + '</text>'; }).join('') + '<text x="' + (6 * CELL + 8).toFixed(1) + '" y="9" font-size="10">1 cell side = 1 km</text></g>');
    if (opts.legend) {
      var seen = {}, rows = [];
      save.world.tiles.forEach(function (t) { var d2 = IT.get(t.t); if (!seen[d2.art]) { seen[d2.art] = 1; rows.push(t.t); } });
      if (rows.length) {
        var lh = 22, show = rows.slice(0, 16), hgt = 34 + show.length * lh;
        o.push('<g transform="' + ov(992, 730 - hgt) + '" font-family="Lexend, sans-serif" pointer-events="none"><rect x="0" y="0" width="230" height="' + hgt + '" rx="10" fill="#fff" opacity=".95" stroke="#d0dae3"/><text x="12" y="22" font-size="13" font-weight="800" fill="#13294B">Legend</text>');
        show.forEach(function (id, k) { var d3 = IT.get(id); o.push('<g transform="translate(24 ' + (40 + k * lh) + ') scale(.22)">' + A.ground(A.item[d3.art].ground || 'grass', 3) + A.item[d3.art](3) + '</g><text x="44" y="' + (44 + k * lh) + '" font-size="11" fill="#13294B">' + esc(IT.name(save, id).slice(0, 26)) + '</text>'); });
        if (rows.length > show.length) o.push('<text x="12" y="' + (hgt - 6) + '" font-size="10" fill="#5b6b7b">+' + (rows.length - show.length) + ' more</text>');
        o.push('</g>');
      }
    }
    if (opts.title) o.push('<text x="' + (VB.x + 24) + '" y="' + (VB.y + 40) + '" font-family="Lexend, sans-serif" font-size="26" font-weight="800" fill="#13294B">' + esc(opts.title) + '</text>');
    o.push('</svg>');
    return o.join('');
  };
  var CELL = Math.sqrt(HW * HW + HH * HH); // one cell side in map units (the scale bar uses it)
  M.CELL = CELL;
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  M.measureText = function (a, b) {
    var w = Math.abs(a.i - b.i) + 1, h = Math.abs(a.j - b.j) + 1;
    return { w: w, h: h, area: w * h, perim: 2 * (w + h), html: '<b>Rectangle:</b> ' + w + ' km \u00d7 ' + h + ' km<br><b>Area</b> = ' + w + ' \u00d7 ' + h + ' = <b>' + (w * h) + ' square km</b><br><b>Perimeter</b> = 2 \u00d7 (' + w + ' + ' + h + ') = <b>' + 2 * (w + h) + ' km</b>' };
  };
  M.volumeText = function (save, t) {
    var p = IT.prism(t.t); if (!p) return null;
    var v = p[0] * p[1] * p[2];
    return { v: v, html: '<b>' + esc(IT.name(save, t.t)) + '</b> is shaped like a rectangular prism.<br>' + p[0] + ' m \u00d7 ' + p[1] + ' m \u00d7 ' + p[2] + ' m<br><b>Volume</b> = l \u00d7 w \u00d7 h = <b>' + v.toLocaleString() + ' cubic meters</b>' };
  };

  // Live map controller
  M.mount = function (host, api) {
    var state = { measure: null, dragging: false, lastHover: null };
    function paint(highlightUid) {
      var save = api.save(), st = save.settings || {}, t0 = (window.performance || Date).now();
      host.innerHTML = M.build(save, { ix: api.ix(), unlockAll: api.unlockAll(), grid: st.grid, coords: st.coords, compass: st.compass !== false, scale: st.scale !== false, legend: st.legend, highlightUid: highlightUid, measure: state.measure, live: true });
      var svg = host.querySelector('svg'); svg.style.width = (100 * (st.zoom || 1)) + '%';
      host.classList.toggle('grid-on', !!(st.grid || st.coords));
      if (window.DAW_FUNUI) window.DAW_FUNUI.onPaint(svg);
      M.lastPaintMs = Math.round((window.performance || Date).now() - t0);
      if (state.lastHover) showHover(state.lastHover);
    }
    function tileFrom(e) { var t = e.target.closest && e.target.closest('[data-i]'); return t ? { i: +t.getAttribute('data-i'), j: +t.getAttribute('data-j') } : null; }
    // hover: placing shows the footprint where the thing would go (green) or a red cell when it does not fit;
    // Grid, (x, y) and Measure show the cell under the pointer; (x, y) also shows its ordered pair.
    function showHover(t) {
      var hv = host.querySelector('.hover'), ft = host.querySelector('.foot'), lab = host.querySelector('.hover-xy'); if (!hv) return;
      var save = api.save(), st = save.settings || {}, tool = api.tool(), sel = api.selected ? api.selected() : null;
      hv.setAttribute('visibility', 'hidden'); ft.setAttribute('visibility', 'hidden'); ft.removeAttribute('fill-opacity'); lab.setAttribute('visibility', 'hidden');
      if (!t) return;
      if (tool === 'place' && sel) {
        var n = S.footprint(sel), fit = S.fitAt(save, api.ix(), t.i, t.j, n, { unlockAll: api.unlockAll() });
        if (fit) { ft.setAttribute('points', block(fit.i, fit.j, n)); ft.setAttribute('fill', 'rgba(64,192,87,.32)'); ft.setAttribute('stroke', '#2b8a3e'); ft.setAttribute('data-ok', '1'); ft.setAttribute('data-s', n); ft.setAttribute('data-ai', fit.i); ft.setAttribute('data-aj', fit.j); }
        else { ft.setAttribute('points', diamond(t.i, t.j)); ft.setAttribute('fill', 'rgba(224,49,49,.28)'); ft.setAttribute('stroke', '#c92a2a'); ft.setAttribute('data-ok', '0'); ft.setAttribute('data-s', n); }
        ft.setAttribute('visibility', 'visible');
      } else if (tool === 'biome' && api.brushSize) {
        var bz = api.brushSize(), rr = Math.floor(bz / 2); ft.setAttribute('points', block(t.i - rr, t.j - rr, bz)); ft.setAttribute('fill', api.brushColor()); ft.setAttribute('fill-opacity', '.55'); ft.setAttribute('stroke', '#ffffff'); ft.setAttribute('data-ok', '1'); ft.setAttribute('data-s', bz); ft.setAttribute('visibility', 'visible');
      } else if (tool === 'erase' || tool === 'volume') {
        var tl = S.tileAt(save, t.i, t.j); if (tl) { ft.setAttribute('points', block(tl.i, tl.j, sz(tl))); ft.setAttribute('fill', tool === 'erase' ? 'rgba(224,49,49,.22)' : 'rgba(255,196,0,.25)'); ft.setAttribute('stroke', tool === 'erase' ? '#c92a2a' : '#e8a400'); ft.setAttribute('visibility', 'visible'); }
      } else if (st.grid || st.coords || tool === 'measure') { hv.setAttribute('points', diamond(t.i, t.j)); hv.setAttribute('visibility', 'visible'); }
      if (st.coords) { var c = M.coord(t.i, t.j), p = xy(t.i, t.j); lab.setAttribute('transform', 'translate(' + p[0] + ' ' + p[1] + ')'); lab.querySelector('text').textContent = '(' + c.x + ', ' + c.y + ')'; lab.setAttribute('visibility', 'visible'); }
    }
    M.showHover = function (t) { state.lastHover = t; showHover(t); };
    host.addEventListener('pointermove', function (e) {
      var t = tileFrom(e); if (!host.querySelector('.hover')) return;
      if (!t) { state.lastHover = null; showHover(null); return; }
      state.lastHover = t; showHover(t);
      var c = M.coord(t.i, t.j); api.hover(t, c);
      if (state.painting && api.tool() === 'biome') api.brushAt(t);
      if (state.dragging && api.tool() === 'measure') { state.measure.b = t; paint(); api.measured(M.measureText(state.measure.a, state.measure.b)); }
    });
    host.addEventListener('pointerleave', function () { state.lastHover = null; showHover(null); api.hover(null); });
    host.addEventListener('pointerdown', function (e) {
      var t = tileFrom(e); if (!t) return;
      if (api.tool() === 'biome' && api.brushAt) { state.painting = true; api.brushAt(t); e.preventDefault(); return; }
      if (api.tool() === 'measure') { state.dragging = true; state.measure = { a: t, b: t }; paint(); api.measured(M.measureText(t, t)); e.preventDefault(); }
    });
    window.addEventListener('pointerup', function () { state.dragging = false; if (state.painting) { state.painting = false; api.brushEnd(); } });
    host.addEventListener('click', function (e) { var t = tileFrom(e); if (t && api.tool() !== 'measure' && api.tool() !== 'biome') api.tap(t); });
    return { paint: paint, hover: M.showHover, hasMeasure: function () { return !!state.measure; }, clearMeasure: function () { state.measure = null; paint(); } };
  };
})();
