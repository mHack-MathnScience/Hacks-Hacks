/* Design a World: tracker, saves & checkpoints, turn-in, settings, help, place info. */
(function () {
  'use strict';
  var U = window.DAW_UI, S = window.DAW_STATE, A = window.DAW_ART, IT = window.DAW_ITEMS, M = window.DAW_MAP, R = window.DAW_REPORT, esc = U.esc;
  var P = window.DAW_PANELS = {};
  function app() { return window.DAW_APP; }
  var LONG_CODE = 8000;

  // ---------- TEKS tracker by subject ----------
  P.tracker = function (subject) {
    var save = app().save(), ix = app().ix(), tr = S.tracker(save, ix);
    var md = U.modal({ title: 'TEKS Tracker', wide: true }); md.el.id = 'tracker-modal';
    var cur = subject || 'science';
    function paint() {
      var b = tr.bySubject, rows = tr.rows.filter(function (r) { return r.subject === cur; }), sub = b.filter(function (x) { return x.id === cur; })[0];
      var strands = []; rows.forEach(function (r) { if (strands.indexOf(r.strand) < 0) strands.push(r.strand); });
      md.body.innerHTML = '<div class="tabs" role="tablist">' + b.map(function (x) { return '<button role="tab" class="tab' + (x.id === cur ? ' on' : '') + '" data-s="' + x.id + '" aria-selected="' + (x.id === cur) + '">' + esc(x.name) + ' <span class="tab-n">' + (x.total ? (function (c) { return c.notYet ? c.notYet + ' not yet' : '\u2714'; })(S.subjectCounts(tr, x.id)) : '\u2014') + '</span></button>'; }).join('') + '</div>' +
        '<div class="tracker-top"><div class="ev-box"><b>' + (sub.total ? sub.done : '\u2014') + '</b><span>' + (sub.total ? 'of ' + sub.total + ' have evidence' : 'none yet') + '</span></div><div><h3>' + esc(sub.name) + ': ' + sub.done + ' of ' + sub.total + ' TEKS have evidence</h3><p class="small">A TEKS turns green when you finish a mission that teaches it, describe something in your Field Guide that teaches it, or finish a history event that teaches it.' + (sub.covered < sub.total ? ' <b>' + (sub.total - sub.covered) + ' of these TEKS are not in this mission set yet</b> (shown in gray).' : '') + ' Your teacher looks at this evidence; it is not a grade. Overall: <b>' + S.evidenceLine(tr) + '</b>.</p></div></div>' +
        (rows.length ? strands.map(function (s) { return '<h4 class="strand">' + esc(s || '') + '</h4><div class="teks-rows">' + rows.filter(function (r) { return r.strand === s; }).map(function (r) {
          return '<div class="teks-row ' + (r.done ? (r.review ? 'review' : 'done') : r.sources ? 'todo' : 'none') + '"><span class="tk-id">' + esc(r.id) + '</span><span class="tk-txt"><b>' + esc(r.kid || '') + '</b><small>' + esc(r.text) + '</small><span class="tk-ms">' + r.missions.map(function (id) { var m = ix.byId[id], stt = S.missionState(save, ix, m, { unlockAll: app().unlockAll() }); return '<button class="mlink ' + stt + '" data-m="' + esc(id) + '">' + esc(m.title) + '</button>'; }).join('') + (r.guide || []).map(function (g) { return '<button class="mlink guide ' + (r.guideDone && r.guideDone.length ? 'done' : 'placed') + '" data-guide="1" title="' + esc(r.guideDone && r.guideDone.length ? 'Done: ' + r.guideDone.join(', ') : 'Describe things you place to earn this') + '">' + esc(g) + (r.guideDone && r.guideDone.length ? ' (' + r.guideDone.length + ')' : '') + '</button>'; }).join('') + '</span></span><span class="tk-st">' + (r.done ? A.icon('check', 22) : '<span class="dot-todo"></span>') + '</span></div>';
        }).join('') + '</div>'; }).join('') : '<div class="empty-subject">' + A.icon('flag', 22) + '<p>Your mission set has no <b>' + esc(sub.name) + '</b> TEKS yet. You can still practice ' + (cur === 'math' ? 'math with the map tools (coordinates, area, perimeter, volume) and charts' : cur === 'writing' ? 'writing in the Writing workspace' : 'social studies with the Budget and economy panel') + '.</p></div>') +
        '<h4 class="strand">Badges</h4><div class="badges">' + S.BADGES.map(function (bd) { var on = S.badges(save, ix).indexOf(bd.id) >= 0; return '<div class="badge-card' + (on ? ' earned' : '') + '">' + A.icon(on ? 'star' : 'lock', 24) + '<b>' + esc(bd.name) + '</b><small>' + esc(bd.desc) + '</small></div>'; }).join('') + '</div>';
    }
    md.body.addEventListener('click', function (e) {
      var t = e.target.closest('.tab'); if (t) { cur = t.getAttribute('data-s'); paint(); return; }
      var gl = e.target.closest('.mlink.guide'); if (gl) { md.close(); window.DAW_DESCUI.guide(); return; }
      var ml = e.target.closest('.mlink'); if (ml) { var id = ml.getAttribute('data-m'), m = ix.byId[id]; if (ml.classList.contains('locked')) { U.toast('That mission is in a stage you have not unlocked yet.'); return; } md.close(); app().goMission(m); }
    });
    paint(); return md;
  };

  // ---------- saves & checkpoints ----------
  P.saveFile = function (save, label) {
    var text = S.toFileText(save), name = S.fileName(save, label) + '.json';
    if (window.showSaveFilePicker && window.isSecureContext && !app().testMode) {
      return window.showSaveFilePicker({ suggestedName: name, types: [{ description: 'Design a World save', accept: { 'application/json': ['.json'] } }] })
        .then(function (h) { return h.createWritable(); }).then(function (w) { return w.write(text).then(function () { return w.close(); }); })
        .then(function () { U.toast('Save file saved.', 'good'); app().markExported(); })
        .catch(function (e) { if (e && e.name === 'AbortError') return; U.download(name, text, 'application/json'); app().markExported(); });
    }
    U.download(name, text, 'application/json'); U.toast('Save file downloaded: ' + name, 'good'); app().markExported(); return Promise.resolve();
  };
  P.copyCode = function (save, box) {
    var code = S.encodeCode(save);
    if (box) { box.value = code; box.select(); }
    U.copy(code).then(function () { U.toast('Code copied (' + code.length.toLocaleString() + ' characters).', 'good'); });
    return code;
  };
  P.saves = function () {
    var save = app().save(), ix = app().ix(), md = U.modal({ title: 'Save & Load', wide: true }); md.el.id = 'saves-modal';
    function paint() {
      save = app().save();
      var cps = save.checkpoints.slice().reverse();
      md.body.innerHTML = '<div class="save-grid"><section class="card"><h3>' + A.icon('check', 20) + ' Autosave is on</h3><p>Every change is saved in this browser right away. Last saved: <b class="last-saved">' + esc(U.fmtTime(save.updated)) + '</b>.</p><p class="small">Autosave lives only on this Chromebook and this browser profile. To keep your world safe, download a save file too.</p>' +
        '<div class="btn-col"><button class="btn primary dl">' + A.icon('flag', 16) + ' Download save file (.json)</button><button class="btn ghost cc">Copy save code</button></div><textarea class="code-box" rows="3" readonly placeholder="Your save code will appear here."></textarea><p class="small code-note"></p></section>' +
        '<section class="card"><h3>Load a save</h3><p>Open a save file, or paste a save code. This replaces the world on screen (your current world is kept as a checkpoint first).</p><label class="btn ghost file-btn">Open a save file<input type="file" accept=".json,application/json,text/plain" class="file-in" hidden></label><textarea class="load-box" rows="3" placeholder="Paste a save code that starts with ' + S.CODE_PREFIX + '..."></textarea><button class="btn primary load">Load this code</button><p class="load-msg small" aria-live="polite"></p></section></div>' +
        '<section class="card"><h3>Checkpoints</h3><p class="small">A checkpoint is saved automatically when you finish each stage. You can also make one any time. Restoring a checkpoint first saves your current world as a new checkpoint, so nothing is lost.</p><div class="cp-new"><input type="text" class="cp-name" maxlength="40" placeholder="Checkpoint name (optional)"><button class="btn ghost cp-add">Make a checkpoint now</button></div>' +
        '<div class="cp-list">' + (cps.length ? cps.map(function (c) { var st = /^Stage \d/.test(c.name); return '<div class="cp' + (st ? ' stage' : '') + '"><span class="cp-ic">' + A.icon(st ? 'flag' : 'star', 22) + '</span><span class="cp-txt"><b>' + esc(c.name) + '</b><small>' + esc(U.fmtTime(c.ts)) + ' \u00b7 ' + S.completedCount(c.snap) + ' missions \u00b7 ' + c.snap.world.tiles.length + ' places</small></span><span class="cp-btns"><button class="btn small ghost" data-a="file" data-id="' + c.id + '">Save file</button><button class="btn small ghost" data-a="code" data-id="' + c.id + '">Code</button><button class="btn small ghost" data-a="turnin" data-id="' + c.id + '">Turn in</button><button class="btn small" data-a="restore" data-id="' + c.id + '">Restore</button></span></div>'; }).join('') : '<p class="small">No checkpoints yet. Finish Stage 1 to get your first one.</p>') + '</div></section>' +
        '<section class="card danger-zone"><h3>Start a new world</h3><p class="small">Your current world is backed up in this browser first. Download a save file if you want to keep it for sure.</p><button class="btn danger new-world">Start a new world</button></section>';
    }
    function cpById(id) { var c = save.checkpoints.filter(function (x) { return x.id === id; })[0]; var s = S.migrate(S.clone(c.snap)); s.checkpoints = []; return { c: c, s: s }; }
    md.body.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      if (b.classList.contains('dl')) P.saveFile(save);
      else if (b.classList.contains('cc')) { var code = P.copyCode(save, U.$('.code-box', md.body)); U.$('.code-note', md.body).innerHTML = code.length > LONG_CODE ? '<b>This code is long (' + code.length.toLocaleString() + ' characters).</b> If it will not paste, attach your save file instead.' : 'Code length: ' + code.length.toLocaleString() + ' characters.'; }
      else if (b.classList.contains('load')) P.loadText(U.$('.load-box', md.body).value, function (ok) { if (ok) md.close(); else U.$('.load-msg', md.body).textContent = 'Could not load. Check the code.'; });
      else if (b.classList.contains('cp-add')) { var nm = U.$('.cp-name', md.body).value.trim() || 'My checkpoint'; S.addCheckpoint(save, nm, null); app().commit('Checkpoint: ' + nm); paint(); U.toast('Checkpoint saved: ' + nm, 'good'); }
      else if (b.classList.contains('new-world')) U.confirm('Start a new world?', 'Your current world will be backed up in this browser, and you will start over at Stage 1.', 'Start over', function () { app().newWorld(); md.close(); }, true);
      else if (b.getAttribute('data-a')) {
        var id = b.getAttribute('data-id'), x = cpById(id), a = b.getAttribute('data-a');
        if (a === 'file') P.saveFile(x.s, x.c.name);
        if (a === 'code') { var cd = P.copyCode(x.s, U.$('.code-box', md.body)); U.$('.code-note', md.body).textContent = 'Code for \u201c' + x.c.name + '\u201d (' + cd.length.toLocaleString() + ' characters).'; }
        if (a === 'turnin') { md.close(); P.turnIn(id); }
        if (a === 'restore') U.confirm('Restore this checkpoint?', 'Go back to <b>' + esc(x.c.name) + '</b>? Your world right now is saved as a checkpoint first, so you can come back to it.', 'Restore', function () { app().replaceSave(S.restoreCheckpoint(save, id), 'Restored ' + x.c.name); md.close(); });
      }
    });
    md.body.addEventListener('change', function (e) {
      if (!e.target.classList.contains('file-in') || !e.target.files[0]) return;
      U.readFile(e.target.files[0]).then(function (t) { P.loadText(t, function (ok) { if (ok) md.close(); else U.$('.load-msg', md.body).textContent = 'That file could not be loaded.'; }); });
    });
    paint(); return md;
  };
  P.loadText = function (text, cb) {
    var res = S.loadAny(text);
    if (!res.save) { U.toast(res.error || 'Could not load.', 'bad', 5000); cb && cb(false); return; }
    function go() {
      var cur = app().save(), s = res.save;
      if (cur && cur.world.tiles.length) S.addCheckpoint(cur, 'Before loading a save', null);
      if (res.kind === 'code' || !s.checkpoints || !s.checkpoints.length) s.checkpoints = (cur ? cur.checkpoints : []).concat(s.checkpoints || []);
      app().replaceSave(s, 'Loaded a ' + (res.kind === 'file' ? 'save file' : 'save code')); U.toast('Loaded ' + (s.student.name ? s.student.name + '\u2019s ' : '') + 'world.', 'good'); cb && cb(true);
    }
    if (!res.verified) U.confirm('This save was changed', 'The check number does not match, so this save may have been edited by hand or damaged. ' + esc(res.error || '') + '<br><br>Load it anyway?', 'Load anyway', go, true);
    else go();
  };

  // ---------- turn in ----------
  P.turnIn = function (cpId) {
    var save = app().save(), ix = app().ix(), md = U.modal({ title: 'Turn In My Work', wide: true }); md.el.id = 'turnin-modal';
    var src = cpId || 'now';
    function pick() { if (src === 'now') return { s: save, label: 'Current world' }; var c = save.checkpoints.filter(function (x) { return x.id === src; })[0]; var s = S.migrate(S.clone(c.snap)); s.checkpoints = []; return { s: s, label: c.name + ' (' + U.fmtTime(c.ts) + ')', short: c.name }; }
    function paint() {
      var p = pick(), sm = R.summary(p.s, ix), code = S.encodeCode(p.s);
      md.body.innerHTML = '<label class="src">What are you turning in? <select class="src-sel"><option value="now">Current world (now)</option>' + save.checkpoints.slice().reverse().map(function (c) { return '<option value="' + c.id + '"' + (c.id === src ? ' selected' : '') + '>' + esc(c.name) + ' \u2014 ' + esc(U.fmtTime(c.ts)) + '</option>'; }).join('') + '</select></label>' +
        '<div class="ti-sum"><div class="ti-map">' + M.build(p.s, { ix: ix, compass: true, forExport: true, labels: false }) + '</div><div><p><b>' + esc(p.s.student.name || 'Student') + '</b></p><p>' + sm.done + ' of ' + sm.total + ' missions finished \u00b7 ' + S.evidenceLine(sm.tracker) + ' \u00b7 ' + sm.words + ' words written</p>' + (sm.review.length ? '<p class="warn">' + sm.review.length + ' mission(s) need review.</p>' : '') + '</div></div>' +
        '<ol class="ti-steps"><li><b>Picture of my world</b> (PNG) <button class="btn ghost png">Download picture</button></li>' +
        '<li><b>Full report</b>: choose <i>Save as PDF</i> in the print window. <button class="btn ghost pdf">Print / Save as PDF</button></li>' +
        (window.DAW_SHOWCASE ? '<li><b>World Showcase</b>: <button class="btn ghost sc-pdf">Showcase PDF</button> <button class="btn ghost sc-html">Slideshow (HTML)</button> <button class="btn ghost sc-png">Labeled world picture</button></li>' : '') +
        '<li><b>Save file</b>: lets your teacher open your whole world. <button class="btn ghost file">Download save file</button></li>' +
        '<li><b>Turn-in code</b>: paste it in a private comment. <button class="btn primary code">Copy turn-in code</button><textarea class="code-box" rows="3" readonly>' + esc(code) + '</textarea><p class="small">' + (code.length > LONG_CODE ? '<b class="warn">This code is long (' + code.length.toLocaleString() + ' characters). Attach your save file instead of (or along with) the code.</b>' : code.length.toLocaleString() + ' characters. Check number: <b>' + code.split('.')[1] + '</b>') + '</p></li></ol>' +
        '<p class="small">In Google Classroom: open the assignment, choose <b>Add or create \u2192 File</b>, attach the picture or PDF and the save file, then click <b>Turn in</b>.</p>';
    }
    md.body.addEventListener('change', function (e) { if (e.target.classList.contains('src-sel')) { src = e.target.value; paint(); } });
    md.body.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return; var p = pick();
      if (b.classList.contains('png')) { b.disabled = true; R.png(p.s, ix, { source: p.label }).then(function (blob) { U.download(S.fileName(p.s, p.short) + '.png', blob); U.toast('Picture downloaded.', 'good'); b.disabled = false; }).catch(function (er) { b.disabled = false; U.toast('Could not make the picture: ' + er, 'bad'); }); }
      if (b.classList.contains('pdf')) R.print(p.s, ix, { source: p.label });
      if (b.classList.contains('file')) P.saveFile(p.s, p.short);
      if (b.classList.contains('sc-pdf')) window.DAW_SHOWCASE.print(p.s, ix); if (b.classList.contains('sc-html')) window.DAW_SHOWCASE.downloadSlides(p.s, ix); if (b.classList.contains('sc-png')) window.DAW_SHOWCASE.downloadPng(p.s, ix);
      if (b.classList.contains('code')) P.copyCode(p.s, U.$('.code-box', md.body));
    });
    paint(); return md;
  };

  // ---------- settings & help ----------
  P.settings = function () {
    var save = app().save(), st = save.settings, md = U.modal({ title: 'Settings' });
    md.body.innerHTML = '<label class="field">Your name <input class="nm" maxlength="40" value="' + esc(save.student.name) + '"></label><label class="field">Class period <input class="pd" maxlength="12" value="' + esc(save.student.period) + '"></label>' +
      '<div class="field voice-field"><b>Read-aloud voice</b> <small>(this computer only)</small><div class="btn-row"><select class="voice-sel" aria-label="Read-aloud voice"></select><button type="button" class="btn ghost voice-prev">Preview</button></div></div><label class="field">Read-aloud speed <input type="range" class="rate" min="0.6" max="1.3" step="0.05" value="' + (window.DAW_VOICE ? window.DAW_VOICE.rate() : 0.95) + '"></label>' +
      '<label class="cbx"><input type="checkbox" class="hist"' + (st.history !== false ? ' checked' : '') + '> History events (Then & Now)</label>' + '<label class="cbx"><input type="checkbox" class="big"' + (st.bigText ? ' checked' : '') + '> Bigger text</label><label class="cbx"><input type="checkbox" class="calm"' + (st.calm ? ' checked' : '') + '> Reduced motion (no moving clouds, creatures, or confetti)</label>' +
      '<label class="cbx"><input type="checkbox" class="snd"' + (st.sound === true ? ' checked' : '') + '> Sound effects</label><label class="cbx"><input type="checkbox" class="autoread"' + (st.autoRead ? ' checked' : '') + '> Read new messages aloud automatically</label>' +
      (window.DAW_FUNUI ? '<label class="cbx"><input type="checkbox" class="events"' + (window.DAW_FUNUI.eventsLocked() ? ' disabled' : st.events !== false ? ' checked' : '') + '> Random nature surprises (dry spells, storms, floods)' + (window.DAW_FUNUI.eventsLocked() ? ' <small>(turned off by your teacher)</small>' : '') + '</label>' : '') +
      '<div class="btn-row"><button class="btn primary ok">Save</button></div>';
    (function voiceUi() {
      var V = window.DAW_VOICE, sel = U.$('.voice-sel', md.body); if (!V || !sel) return;
      function opt(v, lab, on) { return '<option value="' + esc(v) + '"' + (on ? ' selected' : '') + '>' + esc(lab) + '</option>'; }
      function fill() {
        var kv = V.clipVoices(), cur = V.get(), ck = V.clipVoice(), vs = V.rank(V.voices(), { online: V.online() }), best = V.pick(), h = '';
        if (kv.length) h += '<optgroup label="Voices (work offline)">' + kv.map(function (k) { return opt('k:' + k, V.man().voices[k].name, cur.voice !== 'builtin' && k === ck); }).join('') + '</optgroup>';
        h += '<optgroup label="This computer\'s own voices">' + (vs.length ? vs.map(function (v) { return opt('b:' + v.name, V.label(v), (cur.voice === 'builtin' || !kv.length) && best && v.name === best.name); }).join('') : opt('b:', 'Default voice', !kv.length)) + '</optgroup>';
        sel.innerHTML = h;
      }
      function chosen() { var v = sel.value || ''; return v.indexOf('k:') === 0 ? { voice: v.slice(2), name: V.get().name } : { voice: 'builtin', name: v.slice(2) }; }
      fill(); if (window.speechSynthesis) window.speechSynthesis.addEventListener('voiceschanged', fill);
      U.$('.voice-prev', md.body).onclick = function () { V.set(Object.assign(chosen(), { rate: +U.$('.rate', md.body).value })); U.speak('Hi! This is how I will read your missions out loud.'); };
      md._voiceSave = function () { V.set(Object.assign(chosen(), { rate: +U.$('.rate', md.body).value })); };
    })();
    U.$('.ok', md.body).onclick = function () {
      save.student.name = U.$('.nm', md.body).value.trim(); save.student.period = U.$('.pd', md.body).value.trim();
      if (md._voiceSave) md._voiceSave(); st.history = U.$('.hist', md.body).checked; st.bigText = U.$('.big', md.body).checked; st.calm = U.$('.calm', md.body).checked; st.sound = U.$('.snd', md.body).checked; st.autoRead = U.$('.autoread', md.body).checked; var evb = U.$('.events', md.body); if (evb && !evb.disabled) st.events = evb.checked;
      app().commit('Settings'); md.close(); if (window.DAW_FUNUI) window.DAW_FUNUI.refresh();
    };
  };
  P.help = function () {
    var md = U.modal({ title: 'How to play', wide: true });
    md.body.innerHTML = '<div class="help"><ol><li><b>Pick a place</b> from the left panel and tap a spot on the map. New places start a <b>mission</b>.</li><li><b>Do the activity</b>, then <b>explain</b> it with a claim, evidence, and reasoning.</li><li>Finish every mission in a stage to <b>unlock the next stage</b>. Your map grows bigger.</li><li>Later missions use places you already built. If you remove one, those missions are marked <b>needs review</b>. Nothing is deleted.</li><li>Use the <b>map tools</b>: grid, coordinates, compass, scale, legend, measure area and perimeter, and find volume.</li><li>Use <b>Writing</b> for journals, stories, and proposals. Use <b>Budget</b> to plan your town. Use <b>Data</b> to make graphs.</li><li>Your work <b>autosaves</b>. Use <b>Save</b> to download a save file. Use <b>Turn in</b> when your teacher asks.</li></ol><p class="small">Tip: press the speaker button to hear text read aloud.</p></div>';
    U.$('.help', md.body).prepend(U.speakBtn(function () { return U.$('.help ol', md.body).innerText; }));
  };

  // ---------- place info (select tool) ----------
  function fieldGuide(save, tile) {
    var DU = window.DAW_DESCUI; if (!DU) return '';
    var th = DU.thingFor(tile.t), inf = DU.tileInfo(save, tile), o = '';
    if (th) {
      var r = window.DAW_DESC.rec(save, th.key);
      o += '<div class="fg-box ' + inf.status + '"><b>Field Guide:</b> ' + (inf.status === 'done' ? A.icon('check', 14) + ' described' + (r && r.rev > 1 ? ' (version ' + r.rev + ')' : '') : '\u270e needs a description. It does not count as placed until you describe it.') + ' <button class="btn small ' + (inf.status === 'done' ? 'ghost' : 'primary') + '" data-fg="desc">' + (inf.status === 'done' ? 'Edit description' : 'Describe it') + '</button></div>';
    }
    if (inf.biome) {
      var b = DU.dx().biome[inf.biome];
      o += '<div class="fg-box orgs"><b>Living things in this ' + esc(b.name.toLowerCase()) + ' (' + inf.orgs.length + '/4):</b><div class="fg-orgs">' + inf.orgs.map(function (x) { var od = DU.dx().org[x.id] || { name: x.id }; return '<span class="fg-org">' + DU.orgIcon(x.id, 34) + '<button class="linkish" data-fg="org" data-o="' + esc(x.id) + '">' + esc(od.name) + (x.done ? ' ' + A.icon('check', 12) : ' \u270e') + '</button><button class="x" data-fg="rmorg" data-o="' + esc(x.id) + '" aria-label="Remove ' + esc(od.name) + '">&times;</button></span>'; }).join('') + '</div>' + (inf.orgs.length < 4 ? '<button class="btn small primary" data-fg="lib">Add a plant or animal</button>' : '') + '</div>';
    }
    return o;
  }
  P.placeInfo = function (tile) {
    var save = app().save(), ix = app().ix(), d = IT.get(tile.t), m = ix.byItem[tile.t], c = M.tileCoord(tile), vol = M.volumeText(save, tile), ec = IT.econ(tile.t);
    var md = U.modal({ title: IT.name(save, tile.t) });
    var st = m ? S.missionState(save, ix, m, { unlockAll: app().unlockAll() }) : null, deps = S.dependents(save, ix, tile.t);
    md.body.innerHTML = '<div class="place"><div class="place-art">' + A.thumb(d.art, 130, tile.i * 13 + tile.j * 7 + 1) + '</div><div><p><b>Location:</b> (' + c.x + ', ' + c.y + ')</p>' + (m ? '<p><b>Mission:</b> ' + esc(m.title) + ' \u2014 ' + (st === 'done' ? 'done' : st === 'review' ? 'needs review' : 'not finished') + '</p>' : '<p class="small">A decoration' + (d.cost ? ' (cost ' + d.cost + ' coins)' : '') + '.</p>') +
      (ec ? '<p><b>Economy:</b> ' + esc(ec.role === 'producer' ? 'Producer of a good: ' : ec.role === 'provider' ? 'Provides a service: ' : 'Consumers: ') + esc(ec.what) + (ec.income ? ' (+' + ec.income + ' coins)' : '') + '</p>' : '') +
      (vol ? '<p class="vol">' + vol.html + '</p>' : '') + fieldGuide(save, tile) + '<label class="field">Name this place <input class="nm" maxlength="24" value="' + esc(save.names[tile.t] || '') + '" placeholder="' + esc(d.name) + '"></label></div></div>' +
      '<div class="btn-row"><button class="btn danger rm">Remove</button>' + (m ? '<button class="btn ghost op">' + (st === 'done' || st === 'review' ? 'Review mission' : 'Open mission') + '</button>' : '') + '<button class="btn primary ok">Done</button></div>';
    U.$$('[data-fg]', md.body).forEach(function (b) { b.onclick = function () {
      var DU = window.DAW_DESCUI, a = b.getAttribute('data-fg'), o = b.getAttribute('data-o'); md.close();
      if (a === 'desc') DU.openItem(tile.t); else if (a === 'lib') DU.library({ biome: DU.tileInfo(save, tile).biome, tile: tile }); else if (a === 'org') DU.organism(o, { tile: tile, biome: DU.tileInfo(save, tile).biome });
      else if (a === 'rmorg') { window.DAW_DESC.removeOrganism(save, tile, o); app().commit('Removed ' + o); P.placeInfo(tile); }
    }; });
    U.$('.ok', md.body).onclick = function () { var v = U.$('.nm', md.body).value.trim(); if (v !== (save.names[tile.t] || '')) { S.renameItem(save, tile.t, v); app().commit('Renamed'); } md.close(); };
    if (U.$('.op', md.body)) U.$('.op', md.body).onclick = function () { md.close(); window.DAW_MISSION.open(m.id); };
    U.$('.rm', md.body).onclick = function () {
      var go = function () { md.close(); app().erase(tile.i, tile.j); };
      if (deps.length) U.confirm('Remove this place?', deps.length + ' finished mission(s) use <b>' + esc(IT.name(save, tile.t)) + '</b>: ' + deps.map(function (id) { return esc(ix.byId[id].title); }).join(', ') + '. They will be marked <b>needs review</b>. Nothing will be deleted, and you can put the place back.', 'Remove', go, true);
      else go();
    };
  };
})();
