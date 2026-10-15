/* Design a World: GT challenge layer UI (open-ended problems with claim/evidence/reasoning, competing needs,
   predictions, stretch tab). Words and statuses only: the checklist is a self-check and is never graded. */
(function () {
  'use strict';
  var U = window.DAW_UI, S = window.DAW_STATE, CC = window.DAW_CIVC, NC = window.DAW_NATC, GC = window.DAW_GC, esc = U.esc;
  var Q = new URLSearchParams(location.search), GU = window.DAW_GCUI = {}, st = { cer: {}, alloc: {}, checks: {}, pred: {}, look: {} };
  function app() { return window.DAW_APP; }
  function save() { return app().save(); }
  function ix() { return app().ix(); }
  // teacher setting (this computer) or ?mode= (per student link); default Challenge
  GU.loadedAt = Date.now(); // ?mode only counts for a world made after this page opened
  GU.teacherSetting = function () { try { var v = localStorage.getItem('daw.teacher.mode'); if (!v) return null; return { mode: GC.normMode(v), at: +(localStorage.getItem('daw.teacher.modeAt') || 0) }; } catch (e) { return null; } };
  GU.applyMode = function () { var s = save(); if (!s) return; var made = Date.parse(s.created || '') || 0, url = made >= GU.loadedAt ? Q.get('mode') : null; var r = GC.resolveMode(s, url, GU.teacherSetting()); if (r.changed && window.DAW_APP && DAW_APP.persist) DAW_APP.persist(); if (r.changed && s.civ.modeBy === 'teacher' && s.civ.modeNote && !GU._noted) { GU._noted = true; U.toast('Your teacher set the challenge level to ' + GC.CFG[r.mode].name + '.', '', 4000); } };
  function redraw() { if (window.DAW_CIVUI && window.DAW_CIVUI.redraw) window.DAW_CIVUI.redraw(); }
  function cerHtml(key, q) {
    var v = st.cer[key] || {}, min = GC.cfg(save()).cerMin, ch = st.checks[key] || [];
    return '<div class="gc-cer" data-k="' + esc(key) + '"><h4>Justify it in writing' + (q ? ': ' + esc(q) : '') + '</h4><p class="small">There is more than one good answer. Your teacher reads your thinking. At least ' + min + ' different real words in each part. Evidence needs a fact, number, or something you saw; Reasoning needs a word like because or so.</p>' +
      GC.CER_PARTS.map(function (p) { var n = GC.realCount(v[p.id]); return '<label class="gc-part"><b>' + p.name + '</b> <small>' + esc(p.help) + '</small><textarea rows="2" data-cer="' + p.id + '">' + esc(v[p.id] || '') + '</textarea><span class="gc-wc small' + (n >= min ? ' good' : '') + '">' + n + ' / ' + min + ' words</span></label>'; }).join('') +
      '<div class="gc-check small"><b>Check your own work</b> (just for you):' + GC.CHECKLIST.map(function (c, k) { return '<label class="cbx"><input type="checkbox" data-ck="' + k + '"' + (ch.indexOf(k) >= 0 ? ' checked' : '') + '> ' + esc(c) + '</label>'; }).join('') + '</div></div>';
  }
  GU.needsHtml = function () { var rows = GC.needs(save(), ix()); return '<div class="gc-needs"><h4>Competing needs</h4><p class="small">Land is limited. More of one need means less for another.</p><table class="civ-tbl"><tr><th>Need</th><th>Have</th><th>Need</th><th>Status</th></tr>' + rows.map(function (r) { return '<tr><td>' + esc(r.name) + '</td><td>' + r.have + '</td><td>' + r.need + '</td><td class="' + (r.status === 'Enough' ? 'good' : 'gc-short') + '">' + r.status + '</td></tr>'; }).join('') + '</table></div>'; };
  GU.openHtml = function (p) {
    var o = [];
    if (p.open.kind === 'allocate') {
      var a = st.alloc[p.id] || {}, min = GC.allocMin(save(), p), sum = p.open.items.reduce(function (t, it) { return t + (Math.floor(+a[it.id]) || 0); }, 0);
      o.push(GU.needsHtml() + '<div class="gc-alloc"><h4>Your land plan: share ' + p.open.total + ' parcels</h4>' + p.open.items.map(function (it) { return '<label>' + esc(it.name) + ' <input type="number" min="0" max="' + p.open.total + '" data-al="' + it.id + '" value="' + esc(a[it.id] != null ? a[it.id] : '') + '"> <small>at least ' + (min[it.id] || 0) + '</small></label>'; }).join('') + '<p class="gc-sum small">' + sum + ' of ' + p.open.total + ' parcels used</p></div>');
    }
    o.push(cerHtml(p.id, p.open.question)); return o.join('');
  };
  GU.collect = function (pid) { return { cer: st.cer[pid] || {}, alloc: st.alloc[pid] || {}, checks: st.checks[pid] || [] }; };
  GU.clear = function (pid) { delete st.cer[pid]; delete st.alloc[pid]; delete st.checks[pid]; };
  var PART = { claim: 'Claim', evidence: 'Evidence', reasoning: 'Reasoning' };
  GU.cerMsg = function (r) { r = r || {}; if (r.missing && r.missing.length) return r.missing.map(function (m) { return m.text; }).join(' '); return 'Write at least ' + r.min + ' words in: ' + (r.short || []).map(function (k) { return PART[k]; }).join(', ') + '.'; };
  GU.allocMsg = function (r) { r = r || {}; var c = r.check || {}; if (c.sum !== c.total) return 'Use exactly ' + c.total + ' parcels (you used ' + c.sum + ').'; return 'Every need needs some land: give more to ' + (c.low || []).join(', ') + '.'; };
  GU.predHtml = function () {
    var s = save(), ps = GC.preds(s), o = [];
    ps.filter(function (p) { return p.status === 'ask'; }).slice(0, 1).forEach(function (p) {
      var k = GC.PRED[p.lf], v = st.pred[p.id] || {};
      o.push('<article class="civ-card gc-pred" data-pr="' + esc(p.id) + '"><header><h3>&#128301; Predict: ' + esc(NC.KINDS[p.lf].name) + '</h3></header><p>Nature just made a ' + esc(NC.KINDS[p.lf].name.toLowerCase()) + ' on your island. ' + esc(k.q) + '</p><div class="nat-opts">' + k.options.map(function (op) { return '<button class="chipbtn gc-pick' + (v.pick === op[0] ? ' on' : '') + '" data-v="' + op[0] + '">' + esc(op[1]) + '</button>'; }).join('') + '</div><label class="gc-part">Why do you think so? (one sentence)<textarea rows="2" class="gc-ptext">' + esc(v.text || '') + '</textarea></label><button class="btn primary gc-psave">Save my prediction</button></article>');
    });
    ps.filter(function (p) { return p.status === 'look'; }).forEach(function (p) {
      var v = st.look[p.id] || {};
      o.push('<article class="civ-card gc-look" data-pr="' + esc(p.id) + '"><header><h3>&#128301; Look back: ' + esc(NC.KINDS[p.lf].name) + '</h3></header><p><b>You predicted:</b> ' + esc(GC.predText(p.lf, p.pick)) + '. ' + esc(p.text) + '</p><p><b>What happened after 50 years:</b> ' + esc(GC.predText(p.lf, p.actual)) + '. Look at it on the map.</p><p>Was your prediction right?</p><div class="nat-opts">' + [['yes', 'Yes'], ['partly', 'Partly'], ['no', 'No']].map(function (x) { return '<button class="chipbtn gc-self' + (v.self === x[0] ? ' on' : '') + '" data-v="' + x[0] + '">' + x[1] + '</button>'; }).join('') + '</div><label class="gc-part">What does the evidence show? (one sentence)<textarea rows="2" class="gc-ltext">' + esc(v.text || '') + '</textarea></label><button class="btn primary gc-lsave">Save my look back</button></article>');
    });
    var w = ps.filter(function (p) { return p.status === 'waiting'; });
    if (w.length) o.push('<p class="small gc-watch">&#128301; Watching: ' + w.map(function (p) { return esc(NC.KINDS[p.lf].name) + ' (look back in year ' + p.due + ')'; }).join(', ') + '</p>');
    return o.join('');
  };
  GU.stretchHtml = function () {
    var s = save(), pk = CC.pack(s.civ.grade) || {}, items = GC.stretchItems(s), done = s.civ.stretch || {};
    return '<p><b>Optional stretch challenges.</b> ' + esc((pk.stretch || {}).note || '') + '</p>' + items.map(function (it) {
      var open = GC.stretchOpen(s, it), d = done[it.id];
      return '<article class="civ-card gc-stretch" data-st="' + esc(it.id) + '"><header><h3>' + esc(it.title) + '</h3><small class="civ-teks">' + esc(it.teks.join(' \u00b7 ')) + ' \u00b7 stretch (Grade 6)</small></header><p class="small"><i>TEKS ' + esc(it.teks[0]) + ': ' + esc(it.teksText[it.teks[0]]) + '</i></p><p>' + esc(it.prompt) + '</p>' +
        (d ? '<p class="good">Saved in year ' + d.y + '. Your teacher can read it.</p>' : open ? cerHtml('st:' + it.id) + '<button class="btn primary gc-ssave" data-st="' + esc(it.id) + '">Save my answer</button>' : '<p class="small">Opens when nature makes ' + esc(NC.KINDS[it.after].name.toLowerCase()) + ' on your island.</p>') + '</article>';
    }).join('');
  };
  document.addEventListener('input', function (e) {
    var t = e.target, box = t.closest && t.closest('.gc-cer');
    if (box && t.hasAttribute('data-cer')) { var k = box.getAttribute('data-k'); (st.cer[k] = st.cer[k] || {})[t.getAttribute('data-cer')] = t.value; var wc = t.parentNode.querySelector('.gc-wc'), n = GC.realCount(t.value), min = GC.cfg(save()).cerMin; if (wc) { wc.textContent = n + ' / ' + min + ' real words'; wc.classList.toggle('good', n >= min); } return; }
    if (t.hasAttribute && t.hasAttribute('data-al')) { var card = t.closest('.civ-card'), pid = card && card.getAttribute('data-p'); (st.alloc[pid] = st.alloc[pid] || {})[t.getAttribute('data-al')] = t.value; var p = CC.problem(save(), pid), sum = p.open.items.reduce(function (a, it) { return a + (Math.floor(+st.alloc[pid][it.id]) || 0); }, 0), el = card.querySelector('.gc-sum'); if (el) el.textContent = sum + ' of ' + p.open.total + ' parcels used'; return; }
    if (t.classList && t.classList.contains('gc-ptext')) { var id = t.closest('.gc-pred').getAttribute('data-pr'); (st.pred[id] = st.pred[id] || {}).text = t.value; }
    if (t.classList && t.classList.contains('gc-ltext')) { var id2 = t.closest('.gc-look').getAttribute('data-pr'); (st.look[id2] = st.look[id2] || {}).text = t.value; }
  });
  document.addEventListener('change', function (e) { var t = e.target, box = t.closest && t.closest('.gc-cer'); if (box && t.hasAttribute('data-ck')) { var k = box.getAttribute('data-k'), a = st.checks[k] = st.checks[k] || [], n = +t.getAttribute('data-ck'); if (t.checked && a.indexOf(n) < 0) a.push(n); if (!t.checked) a.splice(a.indexOf(n), 1); } });
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.gc-pick, .gc-psave, .gc-self, .gc-lsave, .gc-ssave'); if (!b) return; var s = save();
    if (b.classList.contains('gc-pick')) { var id = b.closest('.gc-pred').getAttribute('data-pr'); (st.pred[id] = st.pred[id] || {}).pick = b.getAttribute('data-v'); redraw(); return; }
    if (b.classList.contains('gc-self')) { var id3 = b.closest('.gc-look').getAttribute('data-pr'); (st.look[id3] = st.look[id3] || {}).self = b.getAttribute('data-v'); redraw(); return; }
    if (b.classList.contains('gc-psave')) { var pid = b.closest('.gc-pred').getAttribute('data-pr'), v = st.pred[pid] || {}, r = GC.predict(s, pid, v.pick, v.text); if (!r.ok) { U.toast(r.reason === 'pick' ? 'Pick what you think will happen first.' : r.text || 'Write a sentence about why.', 'warn', 4500); return; } app().commit('Made a prediction', { noFun: true }); U.toast('Prediction saved. Let time pass and watch.', 'good'); redraw(); return; }
    if (b.classList.contains('gc-lsave')) { var lid = b.closest('.gc-look').getAttribute('data-pr'), lv = st.look[lid] || {}, rr = GC.reflectPred(s, lid, lv.self, lv.text); if (!rr.ok) { U.toast(rr.reason === 'self' ? 'Choose yes, partly, or no first.' : rr.text || 'Write a sentence about the evidence.', 'warn', 4500); return; } app().commit('Looked back on a prediction', { noFun: true }); U.toast('Saved. Scientists check predictions against evidence, just like you.', 'good'); redraw(); return; }
    if (b.classList.contains('gc-ssave')) { var sid = b.getAttribute('data-st'), r2 = GC.answerStretch(s, sid, st.cer['st:' + sid]); if (!r2.ok) { U.toast(r2.reason === 'cer' ? GU.cerMsg(r2) : 'Not open yet.', 'warn'); return; } delete st.cer['st:' + sid]; app().commit('Stretch challenge', { noFun: true }); U.toast('Stretch answer saved.', 'good'); redraw(); }
  });
})();
