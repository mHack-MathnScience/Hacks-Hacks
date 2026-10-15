/* Design a World: natural change + Shaping Energy UI. Energy appears ONLY here, in play (bar chip + Shape dialog);
   never in reports, the teacher page or exports. Shape dialog: pick a tool, a spot and a size, PREVIEW (cost and
   warnings), confirm if it would hurt settlements or landforms, then do it. The last change can be undone. */
(function () {
  'use strict';
  var U = window.DAW_UI, S = window.DAW_STATE, CC = window.DAW_CIVC, NC = window.DAW_NATC, CU = window.DAW_CIVUI, esc = U.esc;
  NC.install(S, window.DAW_DESCRIBE_DATA);
  var NU = window.DAW_NATUI = {}, md = null, sel = { tool: 'raise', x: null, y: null, size: 1, code: 'f', confirm: false }, last = null, fb = {};
  function app() { return window.DAW_APP; }
  function save() { return app().save(); }
  function ix() { return app().ix(); }
  var REASON = { 'off-island': 'That spot is off your island (still open sea). Pick x and y on the land.', 'locked': 'Save up more Shaping Energy to unlock this tool.', 'era-limit': 'You have used all your changes for this era. Let time pass to the next era.', 'big-era-limit': 'Only one big change per era. Let time pass.', 'energy': 'Not enough Shaping Energy yet. Finish missions and explain landforms to earn more.', 'too-big': 'That is too big a change at once (3 by 3 at most).', 'no-room': 'A town needs open land, away from other settlements.', 'no-change': 'That spot already looks like that.', 'ice-now': 'An ice age is already happening.', 'not-started': 'Start civilizations first.', 'confirm': 'This change hurts something. Read the warning and tick the box to go ahead.' };
  NU.reasonText = function (r) { return REASON[r] || 'Not now.'; };

  // ---------- quiz (explain the landform before the problem opens) ----------
  NU.quizHtml = function (p) {
    var l = NC.lfData(p.landform), name = (NC.KINDS[p.landform] || {}).name || (l && l.name) || p.landform, rec = (save().civ.quiz || {})[p.landform] || { ok: {} };
    var o = ['<div class="nat-quiz" data-lf="' + esc(p.landform) + '"><h4>&#9968; First, explain the landform: ' + esc(name) + '</h4><p>' + esc(p.landformWhy || '') + '</p>'];
    NC.questions(p.landform).forEach(function (q) {
      var done = rec.ok[q.id], f = fb[p.landform + q.id];
      o.push('<div class="nat-q' + (done ? ' done' : '') + '" data-q="' + q.id + '"><p><b>' + esc(q.q) + '</b>' + (done ? ' <span class="good">&#10003; Yes!</span>' : '') + '</p><div class="nat-opts">' + q.options.map(function (a) { return '<button class="chipbtn nat-ans' + (done && a === q.answer ? ' on' : '') + '" data-a="' + a + '"' + (done ? ' disabled' : '') + '>' + esc(q.labels ? q.labels[a] : a) + '</button>'; }).join('') + '</div>' + (f && !done ? '<p class="nat-hint">&#128161; Not quite. Hint: ' + esc(f) + ' Try again.</p>' : '') + '</div>');
    });
    o.push('<p class="small">Wrong answers just give a hint. Take your time.</p></div>'); return o.join('');
  };
  NU.needsQuiz = function (p) { return !!(p && p.landform && !NC.explained(save(), p.landform)); };
  document.addEventListener('click', function (e) {
    var b = e.target.closest('.nat-ans'); if (!b) return; var qz = b.closest('.nat-quiz'), lf = qz.getAttribute('data-lf'), q = b.closest('.nat-q').getAttribute('data-q');
    var r = NC.answer(save(), lf, q, b.getAttribute('data-a'));
    if (!r.correct) fb[lf + q] = r.hint; else delete fb[lf + q];
    app().commit('Explained a landform', { noRender: true, noFun: true });
    if (r.done) U.toast('You explained how it formed. Now decide.', 'good');
    if (CU.redraw) CU.redraw(); if (md) draw();
  });

  // ---------- energy chip + Shape button in the civ bar ----------
  NU.barHtml = function () { var c = save().civ; if (!c || !c.started) return ''; NC.ensure(save()); return '<span class="nat-energy" title="Shaping Energy: earned by finishing missions and explaining landforms. Spend it to shape the world.">&#9889; <b>' + NC.balance(save()) + '</b> <small>Shaping Energy</small></span><button class="btn small nat-shape">&#9968; Shape</button>'; };
  var prevPaint = null;
  NU.afterCommit = function () { var s = save(); if (!s || !s.civ || !s.civ.started) { prevPaint = s && s.world.paint; return; }
    if (prevPaint != null && prevPaint !== s.world.paint) { var back = NC.guardPaint(s, prevPaint); if (back) { app().commit('Protected settlements', { noFun: true }); U.toast('The free brush cannot paint where a settlement stands. Use Shape (with a preview) for that.', 'warn', 4500); } }
    prevPaint = s.world.paint; var got = NC.syncEarnings(s); if (got) U.toast('&#9889; +' + got + ' Shaping Energy', 'good', 2500); };
  NU.natureToasts = function (list) { (list || []).slice(-2).forEach(function (n) { U.toast('&#9968; Nature: ' + esc(n.why), '', 4500); }); };

  // ---------- Shape dialog ----------
  NU.open = function () {
    if (md) md.close(); var bd = CC.bounds(save(), ix()); if (sel.x == null) { var c0 = window.DAW_MAP.coord(Math.round((bd.min + bd.max) / 2), Math.round((bd.min + bd.max) / 2)); sel.x = c0.x; sel.y = c0.y; }
    md = U.modal({ title: 'Shape the world', wide: true, onClose: function () { md = null; CU.bar(); } }); md.el.id = 'shape-modal'; draw();
    md.body.addEventListener('click', onClick); md.body.addEventListener('change', onChange);
  };
  function act() { var p = window.DAW_MAP.fromCoord(+sel.x, +sel.y); return { tool: sel.tool, i: p.i, j: p.j, size: +sel.size, code: sel.code, confirm: sel.confirm }; }
  function draw() {
    if (!md) return; var s = save(), info = NC.eraInfo(s), bal = NC.balance(s), pv = NC.preview(s, ix(), act()), cellsTool = ['warmer', 'cooler', 'iceage'].indexOf(sel.tool) < 0;
    var o = ['<p>&#9889; You have <b>' + bal + '</b> Shaping Energy. Changes left this era: <b>' + info.left + ' of ' + (info.limit || NC.ERA_LIMIT) + '</b> (next era in year ' + info.nextEraYear + '). Big changes are expensive, and hurting settlements or landforms costs the most.</p><div class="nat-tools">'];
    NC.TOOLS.forEach(function (t) { var lock = bal < t.needs; o.push('<button class="chipbtn nat-tool' + (sel.tool === t.id ? ' on' : '') + (lock ? ' locked' : '') + '" data-t="' + t.id + '">' + esc(t.name) + (lock ? ' <small>(save ' + t.needs + ' to unlock)</small>' : '') + '</button>'); });
    o.push('</div>');
    if (cellsTool) o.push('<div class="nat-where"><label>x <input type="number" class="nat-x" min="0" max="23" value="' + esc(sel.x) + '"></label> <label>y <input type="number" class="nat-y" min="0" max="23" value="' + esc(sel.y) + '"></label>' + (sel.tool !== 'town' ? ' <label>Size <select class="nat-size">' + [1, 2, 3].map(function (n) { return '<option value="' + n + '"' + (+sel.size === n ? ' selected' : '') + '>' + n + ' by ' + n + '</option>'; }).join('') + '</select></label>' : '') + (sel.tool === 'biome' ? ' <label>Biome <select class="nat-code">' + S.BIO.LIST.filter(function (b) { return b.c !== 'c'; }).map(function (b) { return '<option value="' + b.c + '"' + (sel.code === b.c ? ' selected' : '') + '>' + esc(b.name) + '</option>'; }).join('') + '</select></label>' : '') + '</div>');
    o.push('<div class="nat-preview"><h4>Preview</h4>');
    if (pv.cost != null) o.push('<p>Cost: <b>' + pv.cost + '</b> Shaping Energy' + (pv.cells && pv.cells.length ? ' &middot; ' + pv.changed + ' cell' + (pv.changed === 1 ? '' : 's') + ' change' : '') + '</p>');
    var h = pv.harms || {}, warn = [];
    if ((h.settlements || []).length) warn.push('The families of <b>' + h.settlements.map(esc).join(', ') + '</b> would have to pack up and move to new land nearby (no one is hurt; if there is no open land, they sail away to a new home).');
    if ((h.landforms || []).length) warn.push('This would wear away: <b>' + h.landforms.map(esc).join(', ') + '</b>.');
    if (h.places) warn.push(h.places + ' thing' + (h.places === 1 ? '' : 's') + ' you built would be covered.');
    if ((h.nearby || []).length) warn.push('This would change the land right next to <b>' + h.nearby.map(esc).join(', ') + '</b>.');
    if (warn.length) o.push('<div class="nat-warn" role="alert">&#9888; ' + warn.join(' ') + '<label class="cbx"><input type="checkbox" class="nat-confirm"' + (sel.confirm ? ' checked' : '') + '> I understand. Do it anyway.</label></div>');
    if (!pv.allowed) o.push('<p class="nat-no">' + esc(NU.reasonText(pv.reason)) + '</p>');
    o.push('</div><div class="nat-actions"><button class="btn primary nat-do"' + (pv.allowed && (!pv.needsConfirm || sel.confirm) ? '' : ' disabled') + '>Shape it</button> <button class="btn nat-undo"' + (s.civ.energy.last ? '' : ' disabled') + '>&#8630; Undo my last change</button></div>' + (last ? '<p class="small">' + esc(last) + '</p>' : ''));
    md.body.innerHTML = o.join('');
  }
  NU.redraw = draw;
  function onChange(e) { var t = e.target; if (t.classList.contains('nat-x')) sel.x = t.value; if (t.classList.contains('nat-y')) sel.y = t.value; if (t.classList.contains('nat-size')) sel.size = t.value; if (t.classList.contains('nat-code')) sel.code = t.value; if (t.classList.contains('nat-confirm')) sel.confirm = t.checked; else sel.confirm = false; draw(); }
  function onClick(e) {
    var b;
    if ((b = e.target.closest('.nat-tool'))) { sel.tool = b.getAttribute('data-t'); sel.confirm = false; draw(); return; }
    if (e.target.closest('.nat-do')) { var r = NC.shape(save(), ix(), act()); if (!r.ok) { U.toast(NU.reasonText(r.reason), 'warn', 4000); draw(); return; } sel.confirm = false; last = 'Done. It cost ' + r.cost + '. ' + (r.moved || []).map(function (m) { return m.left ? m.name + ' had no open land left, so its families sailed away safely to a new home.' : m.name + ' moved safely to new land at (' + window.DAW_MAP.coord(m.i, m.j).x + ', ' + window.DAW_MAP.coord(m.i, m.j).y + ').'; }).join(' ') + ' You can undo it.'; app().commit('Shaped the world'); U.toast('The world changes.', 'good'); draw(); return; }
    if (e.target.closest('.nat-undo')) { var u = NC.undo(save()); if (u.ok) { last = 'Undone. Your Shaping Energy came back.'; app().commit('Undid a change'); U.toast('Undone.', 'good'); } draw(); }
  }
})();
