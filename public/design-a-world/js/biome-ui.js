/* Design a World: the Biomes tool. Paint island cells with a biome brush (1 x 1 or 3 x 3), erase back to the default
   grassland, read a short climate card, and get a gentle heads-up when a repaint no longer fits a living thing there.
   Reuses: js/biomes.js (paint data), the Field Guide (habitat, Move it / explain), Survival Season, and achievements. */
(function () {
  'use strict';
  var BU = window.DAW_BIOMEUI = {}, B = window.DAW_BIOMES, U = window.DAW_UI, S = window.DAW_STATE, M = window.DAW_MAP, esc = U.esc;
  function app() { return window.DAW_APP; }
  function D() { return window.DAW_DESC; }
  function DU() { return window.DAW_DESCUI; }
  function FU() { return window.DAW_FUNUI; }
  BU.brush = 'f'; BU.size = 1; var stroke = null, lastCode = null, queue = [];
  BU.lastBiome = function () { var b = lastCode && B.byCode[lastCode]; return b ? b.dx : null; };
  function inOpen(i, j) { var s = app().save(), ix = app().ix(), bd = S.bounds(S.stageSize(ix, S.highestUnlocked(s, ix, app().opts ? app().opts() : {}))); return i >= bd.min && i <= bd.max && j >= bd.min && j <= bd.max; }
  function swatch(b) { return '<span class="bio-sw" style="background:' + b.icon + '"></span>'; }

  // ---------- panel ----------
  BU.panel = function (show) {
    var host = document.getElementById('biome-panel'); if (!host) return;
    host.hidden = !show; if (!show) return;
    host.innerHTML = '<div class="bio-head"><b>Paint biomes</b><span class="small">Tap or drag on your island.</span></div><div class="bio-chips" role="radiogroup" aria-label="Biome brush">' +
      B.LIST.map(function (b) { return '<span class="bio-pair"><button class="bio-chip' + (BU.brush === b.c ? ' on' : '') + '" role="radio" aria-checked="' + (BU.brush === b.c) + '" data-c="' + b.c + '">' + swatch(b) + esc(b.name) + '</button><button class="bio-i" data-i="' + b.c + '" title="About the ' + esc(b.name) + ' biome" aria-label="About the ' + esc(b.name) + ' biome">i</button></span>'; }).join('') +
      '<span class="bio-pair"><button class="bio-chip eraser' + (BU.brush === '.' ? ' on' : '') + '" role="radio" aria-checked="' + (BU.brush === '.') + '" data-c=".">&#9003; Eraser <small>(back to grassland)</small></button></span></div>' +
      '<div class="bio-size" role="radiogroup" aria-label="Brush size">Brush: ' + [1, 3].map(function (n) { return '<button class="bio-sz' + (BU.size === n ? ' on' : '') + '" role="radio" aria-checked="' + (BU.size === n) + '" data-n="' + n + '">' + n + ' \u00d7 ' + n + '</button>'; }).join('') + '</div>';
    host.onclick = function (e) {
      var c = e.target.closest('.bio-chip'), i = e.target.closest('.bio-i'), z = e.target.closest('.bio-sz');
      if (i) { BU.card(i.getAttribute('data-i')); return; }
      if (c) { BU.brush = c.getAttribute('data-c'); BU.panel(true); return; }
      if (z) { BU.size = +z.getAttribute('data-n'); BU.panel(true); }
    };
  };

  // ---------- painting (one stroke = pointer down .. up; the island art redraws once per stroke) ----------
  function overlay(cells) {
    var svg = document.querySelector('#map svg'); if (!svg) return; var g = svg.querySelector('.paint-stroke');
    if (!g) { g = document.createElementNS('http://www.w3.org/2000/svg', 'g'); g.setAttribute('class', 'paint-stroke'); g.setAttribute('pointer-events', 'none'); var hits = svg.querySelector('.hits'); svg.insertBefore(g, hits); }
    var col = BU.brush === '.' ? '#9fc767' : B.byCode[BU.brush].icon;
    cells.forEach(function (c) { var p = document.createElementNS('http://www.w3.org/2000/svg', 'polygon'); p.setAttribute('points', M.diamond(c.i, c.j)); p.setAttribute('fill', col); p.setAttribute('opacity', '.8'); g.appendChild(p); });
  }
  BU.brushAt = function (t) {
    var save = app().save(); if (!stroke) stroke = { before: save.world.paint || '', cells: [] };
    var r = B.paint(save, t.i, t.j, BU.brush, BU.size, inOpen); stroke.cells = stroke.cells.concat(r.changed); overlay(r.changed);
    if (!r.changed.length && !stroke.cells.length && !inOpen(t.i, t.j)) U.toast('That is open sea for now. Paint on your island.');
    return r.changed;
  };
  BU.brushEnd = function () {
    var st = stroke; stroke = null; if (!st || !st.cells.length) return null;
    var save = app().save(), name = BU.brush === '.' ? 'grassland' : B.byCode[BU.brush].name.toLowerCase();
    var mis = BU.misfits(save, st.before);
    app().commit('Painted ' + st.cells.length + ' cell' + (st.cells.length > 1 ? 's' : '') + ' ' + name);
    if (FU() && FU().checkNow) FU().checkNow();
    if (mis.length) { queue = mis.map(function (m) { m.cells = st.cells; return m; }); BU.nextMisfit(); }
    return { cells: st.cells.length, misfits: mis.length };
  };
  // living things that fit before the stroke and do not fit now
  BU.misfits = function (save, beforePaint) {
    var dx = DU().dx(), IT = window.DAW_ITEMS, now = save.world.paint, out = [];
    save.world.tiles.forEach(function (t) { (t.o || []).forEach(function (o) {
      var art = IT.get(t.t).art; save.world.paint = beforePaint; var was = D().fitsTile(dx, save, o, t, art), hb = D().habitat(dx, save, t, art); save.world.paint = now;
      var is = D().fitsTile(dx, save, o, t, art); if (was && !is) out.push({ org: o, tile: t, fromCode: hb.painted || null, toCode: B.tileCode(save, t) || B.DEFAULT });
    }); });
    save.world.paint = now; return out;
  };
  BU.nextMisfit = function () { var m = queue.shift(); if (m) BU.misfit(m); };
  function record(save, m, choice, text) {
    var to = B.byCode[m.toCode] || B.byCode[B.DEFAULT], from = B.byCode[m.fromCode] || null;
    D().saveRecord(save, 'rep:' + m.org + '@' + m.tile.u, { k: 'rep', org: m.org, tile: m.tile.u, from: from ? from.id : null, to: to.id, toName: to.name.toLowerCase(), choice: choice, text: text || '', ok: true });
  }
  // the gentle event: move it, change the biome back, or keep it and explain (adaptation evidence; no score)
  BU.misfit = function (m) {
    var save = app().save(), dx = DU().dx(), o = dx.org[m.org], to = B.byCode[m.toCode] || B.byCode[B.DEFAULT], IT = window.DAW_ITEMS;
    if (!o) return BU.nextMisfit();
    var better = DU().biomeTiles(save).filter(function (x) { return x.tile !== m.tile && o.biomes.some(function (b) { return x.ids.indexOf(b) >= 0; }) && (x.tile.o || []).length < 4 && (x.tile.o || []).indexOf(m.org) < 0; });
    var md = U.modal({ title: 'A home changed', wide: true }); md.el.id = 'repaint-modal';
    var npc = window.DAW_FUNC ? window.DAW_FUNC.npc('rae') : null, line = 'Your ' + o.name.toLowerCase() + '\u2019s home turned to ' + to.name.toLowerCase() + '! It usually lives in: ' + DU().biomeNames(o) + '. What should we do?';
    md.body.innerHTML = '<div class="event-card k-biome">' + (npc && FU() ? FU().say(npc, line) : '<p class="lead">' + esc(line) + '</p>') + '</div>' +
      '<p class="small">' + esc(to.name) + ': ' + esc(to.temp.toLowerCase()) + '; ' + esc(to.rain.charAt(0).toLowerCase() + to.rain.slice(1)) + '. Think about food, water, shelter, and temperature.</p>' +
      '<div class="wb-choices rp-choices"><section><h4>Move it</h4>' + (better.length ? '<select class="mv-to" aria-label="Move it to">' + better.map(function (x, k) { return '<option value="' + k + '">' + esc(x.label) + '</option>'; }).join('') + '</select><button class="btn primary rp-move">Move it there</button>' : '<p class="small">No other place fits it yet.</p>') + '</section>' +
      '<section><h4>Change it back</h4><p class="small">Undo this paint stroke.</p><button class="btn ghost rp-back">Change it back</button></section>' +
      '<section><h4>Keep it and explain</h4><textarea class="why" rows="3" aria-label="Why it can stay"></textarea><button class="btn ghost rp-keep">Keep it here</button></section></div><div class="dfb" aria-live="polite"></div>';
    function done(msg) { app().commit(msg); md.close(); U.toast(msg, 'good'); if (FU() && FU().checkNow) FU().checkNow(); setTimeout(BU.nextMisfit, 50); }
    if (U.$('.rp-move', md.body)) U.$('.rp-move', md.body).onclick = function () {
      var x = better[+U.$('.mv-to', md.body).value]; D().removeOrganism(save, m.tile, m.org); var r = D().addOrganism(save, dx, x.tile, IT.get(x.tile.t).art, m.org, '');
      if (!r.ok) { D().addOrganism(save, dx, m.tile, IT.get(m.tile.t).art, m.org, 'It stays here for now because it could not move, and it needs food, water, and shelter.'); U.$('.dfb', md.body).innerHTML = '<div class="fb bad">Could not move it there (' + esc(r.reason) + ').</div>'; return; }
      record(save, m, 'move'); done(o.name + ' moved to ' + IT.name(save, x.tile.t) + '.');
    };
    U.$('.rp-back', md.body).onclick = function () { B.restore(save, m.cells); queue = queue.filter(function (q) { return q.cells !== m.cells; }); record(save, m, 'back'); done('Changed the biome back.'); };
    U.$('.rp-keep', md.body).onclick = function () {
      var t = U.$('.why', md.body).value.trim();
      if (D().words(t) < 15 || !/food|eat|water|drink|shelter|hide|home|temperature|hot|cold|warm|cool|survive|prey|sun|snow|fur/i.test(t)) { U.$('.dfb', md.body).innerHTML = '<div class="fb bad">Write at least 15 words and explain a need: food, water, shelter, or temperature.</div>'; return; }
      D().saveRecord(save, 'why:' + m.org + '@' + m.tile.u, { k: 'why', org: m.org, tile: m.tile.u, biome: to.dx, text: t.slice(0, 2000), ok: true }); record(save, m, 'keep', t.slice(0, 2000)); done('Kept the ' + o.name.toLowerCase() + ' there, with your reason.');
    };
    return md;
  };

  // ---------- climate card ----------
  BU.card = function (code) {
    var b = B.byCode[code] || B.byCode[B.DEFAULT], dx = DU() && DU().dx(); lastCode = b.c;
    var live = dx ? (dx.data.organisms || []).filter(function (o) { return o.biomes.some(function (x) { return b.fits.indexOf(x) >= 0; }); }).slice(0, 6).map(function (o) { return o.name; }) : [];
    var md = U.modal({ title: b.name + ' biome' }); md.el.id = 'biome-card';
    md.body.innerHTML = '<div class="bio-card"><div class="bio-big" style="background:' + b.icon + '"></div><div><p><b>Temperature:</b> ' + esc(b.temp) + '.</p><p><b>Rain and snow:</b> ' + esc(b.rain) + '.</p><p>' + esc(b.fact) + '</p><p class="small">' + esc(B.CLIMATE) + '</p>' +
      '<p class="small"><b>Lives here (Field Guide):</b> ' + (live.length ? esc(live.join(', ')) : 'none of the living things in our Field Guide. That is a clue about how hard it is to survive here.') + '</p></div></div>' +
      (FU() && FU().season ? '<div class="btn-row"><button class="btn primary bio-season">Try a Survival Season here</button></div>' : '');
    var sb = U.$('.bio-season', md.body); if (sb) sb.onclick = function () { md.close(); FU().season({ biome: b.dx }); };
    if (FU() && FU().flag) FU().flag('bioCard-' + b.id);
    return md;
  };
  // Info tool on empty land: name the biome and offer its card
  BU.infoLine = function (t) { var save = app().save(), b = B.biomeAt(save, t.i, t.j); lastCode = b.c; return ' Biome: <b>' + esc(b.name) + '</b> <button class="btn small ghost bio-about" data-c="' + b.c + '">About this biome</button>'; };
  document.addEventListener('click', function (e) { var a = e.target.closest && e.target.closest('.bio-about'); if (a) BU.card(a.getAttribute('data-c')); });
})();
