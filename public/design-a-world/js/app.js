/* Design a World: app shell (boot, header, palette, missions panel, map tools, autosave, routes). */
(function () {
  'use strict';
  var U = window.DAW_UI, S = window.DAW_STATE, A = window.DAW_ART, IT = window.DAW_ITEMS, M = window.DAW_MAP, MS = window.DAW_MISSION, P = window.DAW_PANELS, W = window.DAW_WORK, esc = U.esc;
  var Q = new URLSearchParams(location.search), PREVIEW = Q.get('unlock') === 'all', DEMO = Q.get('demo'), TEST = Q.get('test') === '1';
  var KEY = DEMO ? 'daw.demo.' + DEMO + '.v2' : PREVIEW ? 'daw.preview.v2' : 'daw.save.v2', BACKUP = 'daw.backup.v2';
  var ix = S.index(window.DAW_DATA), save = null, tool = 'place', selected = null, mapCtl = null, viewStage = null, lastPlacedUid = null, storageOk = true;
  IT.init(ix);
  var APP = window.DAW_APP = {
    ix: function () { return ix; }, save: function () { return save; }, unlockAll: function () { return PREVIEW; }, testMode: TEST,
    settings: function () { return (save && save.settings) || {}; },
    commit: commit, persist: function () { persist(); }, replaceSave: replaceSave, newWorld: newWorld, erase: erase, goMission: goMission, celebrateStage: celebrateStage, render: render,
    markExported: function () { save.settings.lastExport = new Date().toISOString(); persist(); renderStatus(); },
    place: place, select: function (id) { selectItem(id); }, setTool: setTool, buildDemo: buildDemo, opts: function () { return opts(); }, tool: function () { return tool; }
  };
  // ---------- persistence ----------
  function persist() {
    try { localStorage.setItem(KEY, JSON.stringify(save)); storageOk = true; }
    catch (e) { storageOk = false; }
  }
  function load() { try { var t = localStorage.getItem(KEY); if (!t) return null; var s = S.migrate(JSON.parse(t)); S.applyAliases(s, ix); return S.validate(s).length ? null : s; } catch (e) { return null; } }
  function commit(label, opts) {
    opts = opts || {}; save.updated = new Date().toISOString(); if (WU()) WU().sync(); var fun = window.DAW_FUNUI && !opts.noFun ? window.DAW_FUNUI.afterCommit(label, opts) : null; if (fun && fun.changed && WU()) WU().sync(); persist();
    if (!opts.noRender) render(); else renderStatus();
    if (fun) window.DAW_FUNUI.announce(fun);
    if (window.DAW_CIVUI && !opts.noCiv) window.DAW_CIVUI.afterCommit();
    if (!storageOk) U.toast('Autosave is full or blocked in this browser. Please download a save file now (Save button).', 'bad', 6000);
  }
  function replaceSave(s, label) { save = S.migrate(s); S.applyAliases(save, ix); if (window.DAW_FUNUI) window.DAW_FUNUI.onLoad(save); if (WU()) WU().sync(); persist(); viewStage = null; render(); if (label) U.toast(label, 'good'); }
  function newWorld() {
    try { localStorage.setItem(BACKUP, JSON.stringify(save)); } catch (e) {}
    var n = save.student, s = S.newSave(n.name, n.period); s.settings = save.settings; replaceSave(s, 'New world started. Your old world is backed up in this browser.');
  }
  // ---------- actions ----------
  function opts() { return { unlockAll: PREVIEW }; }
  function DU() { return window.DAW_DESCUI; }
  function WU() { return window.DAW_WORLDUI; }
  // explain missing requirements, separating "finish its mission" from "describe it in the Field Guide"
  function needText(list) {
    var desc = [], build = [];
    (list || []).forEach(function (x) { var m = ix.byItem[x]; if (S.onMap(save, x) && (!m || (save.missions[m.id] && save.missions[m.id].done)) && DU() && DU().needsFor(save, x)) desc.push(IT.name(save, x)); else build.push(IT.name(save, x)); });
    return (build.length ? 'First build and finish: ' + build.join(', ') + '. ' : '') + (desc.length ? 'Describe in your Field Guide (\u270e): ' + desc.join(', ') + '.' : '');
  }
  APP.needText = needText;
  function stageOf(sid) { return ix.stages.filter(function (s) { return s.id === sid; })[0]; }
  function selectItem(id) { selected = id; setTool('place'); renderPalette(); var d = IT.get(id); setReadout('<b>' + esc(d.name) + '</b> selected. Tap an open spot on the map, or type coordinates below.'); }
  function place(i, j, id) {
    id = id || selected; if (!id) { U.toast('Pick a place from the left panel first.'); return { ok: false }; }
    var d = IT.get(id);
    if (d.decor) {
      if (d.stage > S.highestUnlocked(save, ix, opts())) { U.toast(d.name + ' unlocks in Stage ' + d.stage + '.'); return { ok: false, reason: 'locked-stage' }; }
      if (d.cost && IT.budget(save).balance < d.cost) { U.toast('Not enough coins. ' + d.name + ' costs ' + d.cost + ' coins. Finish missions to earn grants.', 'bad'); return { ok: false, reason: 'budget' }; }
    }
    var r = S.placeItem(save, ix, i, j, id, opts());
    if (!r.ok) {
      var msg = { occupied: 'That spot is taken. Pick an open spot, or use Erase.', 'locked-area': 'That spot is still open sea. Finish this stage to make your island bigger.', 'no-room': 'Not enough open land here. ' + IT.name(save, id) + ' needs ' + r.size + ' \u00d7 ' + r.size + ' cells. Try a roomier spot.', 'locked-stage': 'This place unlocks in a later stage.', pending: 'Finish the mission for ' + IT.name(save, id) + ' first (tap it on the map).', needs: needText(r.missing) }[r.reason] || 'You cannot place that here.';
      U.toast(msg, 'bad'); return r;
    }
    lastPlacedUid = r.tile.u; commit('Placed ' + d.name); lastPlacedUid = null;
    if (r.startMission) setTimeout(function () { MS.open(r.startMission); }, TEST ? 0 : 350);
    else if (r.waiting) U.toast(d.name + ' is built! Its mission starts when your world needs it (see World Needs).', '', 4000);
    else {
      if (d.cost) U.toast('-' + d.cost + ' coins for ' + d.name + '.', '');
      // Field Guide: a landform or feature does not count as placed until the student describes it
      if (DU() && DU().needsFor(save, id)) setTimeout(function () { DU().openItem(id); }, TEST ? 0 : 300);
      else if (DU() && DU().tileInfo(save, r.tile).biome && !(r.tile.o || []).length) U.toast('Add plants and animals to your ' + d.name + ': tap it with Info, or open the Field Guide.', '', 4000);
    }
    return r;
  }
  function erase(i, j) {
    var r = S.eraseTile(save, ix, i, j, opts()); if (!r.ok) return;
    commit('Removed');
    if (r.flagged.length) U.toast(r.flagged.length + ' finished mission(s) now need review. Nothing was deleted.', 'warn', 5000);
  }
  function goMission(m) {
    var st = S.missionState(save, ix, m, opts());
    if (st === 'locked') { U.toast('This mission is in Stage ' + m.stage + '. Finish the earlier stages first.'); return; }
    if (st === 'needs') { U.toast(needText(S.missingRequirements(save, ix, m)), 'bad', 4500); return; }
    if (st === 'ready' || st === 'build') { selectItem(m.unlockItem); U.toast('Now tap an open spot on the map to place ' + IT.name(save, m.unlockItem) + '.' + (st === 'build' ? ' Its mission starts when your world needs it.' : '')); return; }
    if (st === 'waiting') { U.toast(IT.name(save, m.unlockItem) + ' is built. Its mission starts when your world needs it. Open World Needs to see what your world needs now.', '', 4500); return; }
    MS.open(m.id);
  }
  function celebrateStage(n) {
    var next = ix.stageIds[ix.stageIds.indexOf(n) + 1], WC = window.DAW_WORLDC, FUI = window.DAW_FUNUI, locked = next && !S.stageUnlocked(save, ix, next, opts());
    var gated = locked ? (WC ? WC.blockers(save, ix, n).map(function (u) { return { title: u.need.title, hint: u.need.fixHint || '' }; }) : []).concat(FUI ? FUI.favGateItems(n) : []) : [];
    if (gated.length) { var g = U.el('div', { class: 'celebrate', role: 'status' }, '<div class="cel-card">' + A.icon('flag', 40) + '<h2>Stage ' + n + ' missions complete!</h2><p>A checkpoint was saved. Before <b>Stage ' + next + '</b> opens:</p><ul class="gate-list">' + gated.map(function (u) { return '<li><b>' + esc(u.title) + '</b>: ' + esc(u.hint) + '</li>'; }).join('') + '</ul><div class="btn-row"><button class="btn ghost board">World Needs</button>' + (FUI && FUI.favGateItems(n).length ? '<button class="btn ghost favs">Field Guide favorites</button>' : '') + '<button class="btn primary ok">Keep building</button></div></div>'); document.body.appendChild(g); if (FUI) FUI.readCard(g); U.$('.ok', g).focus(); U.$('.ok', g).onclick = function () { g.remove(); }; U.$('.board', g).onclick = function () { g.remove(); WU().board(); }; if (U.$('.favs', g)) U.$('.favs', g).onclick = function () { g.remove(); DU().guide(); }; return; }
    var b = U.el('div', { class: 'celebrate', role: 'status' }, '<div class="cel-card">' + A.icon('flag', 40) + '<h2>Stage ' + n + ' complete!</h2><p>A checkpoint was saved.' + (next ? ' <b>Stage ' + next + ': ' + esc(stageOf(next).title) + '</b> is unlocked.' : ' You finished every stage!') + '</p><p class="small">Tip: download a save file to keep your world safe.</p><div class="btn-row"><button class="btn ghost sv">Download save file</button><button class="btn primary ok">Keep building</button></div></div>');
    document.body.appendChild(b); if (FUI) FUI.celebrate(b, n, next); U.$('.ok', b).focus();
    U.$('.ok', b).onclick = function () { b.remove(); }; U.$('.sv', b).onclick = function () { P.saveFile(save, 'Stage' + n); b.remove(); };
  }
  function setTool(t) {
    tool = t; U.$$('.tool').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-tool') === t)); }); document.body.setAttribute('data-tool', t);
    if (t !== 'measure' && mapCtl && mapCtl.hasMeasure()) mapCtl.clearMeasure();
    if (window.DAW_BIOMEUI) window.DAW_BIOMEUI.panel(t === 'biome');
    var tips = { measure: 'Drag across the map to measure a rectangle: you get its <b>area</b> and <b>perimeter</b>.', volume: 'Tap a building, tank, or reservoir to find its <b>volume</b>.', erase: 'Tap a place to remove it.', select: 'Tap a place to see its info, rename it, or open its mission.', biome: 'Pick a biome, then tap or drag on your island to paint it. Tap <b>i</b> to learn its climate.' };
    if (tips[t]) setReadout(tips[t]);
  }
  function setReadout(html) { var r = U.$('#readout'); if (r) r.innerHTML = html; }
  // ---------- rendering ----------
  function render() { renderHeader(); renderPalette(); renderMissions(); mapCtl.paint(lastPlacedUid); renderToggles(); renderStatus(); document.body.classList.toggle('big-text', !!save.settings.bigText); document.body.classList.toggle('calm', !!save.settings.calm || TEST); if (window.DAW_CIVUI) window.DAW_CIVUI.bar(); }
  function renderHeader() {
    var hi = S.highestUnlocked(save, ix, opts()), lv = S.level(save), tr = S.tracker(save, ix);
    U.$('#stepper').innerHTML = ix.stages.map(function (st) {
      var done = S.stageComplete(save, ix, st.id), un = S.stageUnlocked(save, ix, st.id, opts()), ms = S.stageMissions(ix, st.id), n = ms.filter(function (m) { return save.missions[m.id] && save.missions[m.id].done; }).length;
      return '<button class="step' + (done ? ' done' : '') + (un ? '' : ' locked') + (st.id === (viewStage || S.currentStage(save, ix, opts())) ? ' on' : '') + '" data-stage="' + st.id + '" style="--c:' + st.color + '" title="' + esc(st.title) + '"><span class="step-n">' + (done ? A.icon('check', 14) : un ? st.id : A.icon('lock', 13)) + '</span><span class="step-t"><b>' + esc(st.short || st.title) + '</b><small>' + n + '/' + ms.length + '</small></span></button>';
    }).join('<span class="step-line"></span>');
    U.$('#xp').innerHTML = '<span class="lvl">Lv ' + lv.level + '</span><span class="xpbar"><i style="width:' + Math.round(100 * lv.into / lv.need) + '%"></i></span><span class="xpn">' + lv.xp + ' XP</span>';
    U.$('#teks-btn .n').textContent = tr.done; U.$('#teks-btn').title = 'TEKS tracker: ' + S.evidenceLine(tr); // a count, not a percent
    var gb = U.$('#guide-btn .n'); if (gb && DU()) { var cn = DU().counts(save); gb.textContent = cn.todo ? cn.todo : ''; gb.hidden = !cn.todo; U.$('#guide-btn').setAttribute('aria-label', 'Field Guide' + (cn.todo ? ', ' + cn.todo + ' need a description' : '')); }
    U.$('#coins').textContent = IT.budget(save).balance.toLocaleString();
    U.$('#who').textContent = save.student.name || 'Explorer';
    document.title = 'Design a World' + (save.student.name ? ' \u00b7 ' + save.student.name : '');
  }
  function renderPalette() {
    var hi = S.highestUnlocked(save, ix, opts()), o = [];
    ix.stages.forEach(function (st) {
      var un = S.stageUnlocked(save, ix, st.id, opts()), ms = S.stageMissions(ix, st.id);
      o.push('<div class="pal-group' + (un ? '' : ' locked') + '"><h4 style="--c:' + st.color + '">' + (un ? '' : A.icon('lock', 12) + ' ') + 'Stage ' + st.id + ': ' + esc(st.short || st.title) + '</h4><div class="pal-items">');
      ms.forEach(function (m) {
        var s = S.missionState(save, ix, m, opts()), d = IT.get(m.unlockItem);
        o.push('<button class="pal' + (selected === m.unlockItem ? ' on' : '') + ' st-' + s + '" data-item="' + esc(m.unlockItem) + '" data-m="' + esc(m.id) + '" title="' + esc(d.name + ' \u2014 ' + m.title) + '" aria-label="' + esc(d.name + ', ' + s) + '"><span class="pal-th">' + A.thumb(d.art, 54, 3) + '</span><span class="pal-name">' + esc(IT.name(save, m.unlockItem)) + '</span><span class="pal-st">' + stateIcon(s) + '</span></button>');
      });
      o.push('</div></div>');
    });
    var dec = IT.decor(), CATS = [['landforms', 'Landforms'], ['water', 'Water'], ['weather', 'Weather'], ['ecosystems', 'Living places'], ['resources', 'Resources'], ['energy', 'Energy'], ['people', 'People & town']];
    var pal = function (d) {
      var lk = d.stage > hi; return '<button class="pal small' + (selected === d.id ? ' on' : '') + (lk ? ' st-locked' : '') + '" data-item="' + d.id + '" title="' + esc(d.name) + (lk ? ' (Stage ' + d.stage + ')' : '') + '"><span class="pal-th">' + A.thumb(d.art, 40, 3) + '</span><span class="pal-name">' + esc(d.name) + '</span>' + (d.cost ? '<span class="cost">' + d.cost + '</span>' : '') + (lk ? '<span class="pal-st">' + A.icon('lock', 12) + '</span>' : '') + '</button>';
    };
    o.push('<div class="pal-group decor"><h4>Extra places</h4>' + CATS.concat([['', 'More']]).map(function (c) {
      var ds = dec.filter(function (d) { return c[0] ? d.category === c[0] : !CATS.some(function (k) { return k[0] === d.category; }); }); if (!ds.length) return '';
      return '<h5 class="pal-sub">' + esc(c[1]) + '</h5><div class="pal-items">' + ds.map(pal).join('') + '</div>';
    }).join('') + '</div>');
    U.$('#palette').innerHTML = o.join('');
  }
  function stateIcon(s) { return { locked: A.icon('lock', 13), needs: '<span class="sdot needs" title="Needs other places first"></span>', build: '<span class="sdot build" title="Open: build it any time"></span>', waiting: '<span class="sdot waiting" title="Built: waiting until your world needs it">\u2026</span>', ready: '<span class="sdot ready" title="Your world needs this: place it"></span>', placed: '<span class="sdot placed" title="Mission waiting">!</span>', done: A.icon('check', 14), review: '<span class="sdot review" title="Needs review">?</span>' }[s] || ''; }
  function renderMissions() {
    var cur = viewStage || S.currentStage(save, ix, opts()), st = stageOf(cur), ms = S.stageMissions(ix, cur), n = ms.filter(function (m) { return save.missions[m.id] && save.missions[m.id].done; }).length, un = S.stageUnlocked(save, ix, cur, opts());
    var LBL = { locked: 'Locked', needs: 'Build first', build: 'Open', waiting: 'Waiting', ready: 'Place it', placed: 'Start mission', done: 'Done', review: 'Needs review' };
    U.$('#missions').innerHTML = '<div id="needs-inline"></div><div class="stage-card" style="--c:' + st.color + '"><div class="sc-top"><span class="sc-n">Stage ' + st.id + '</span>' + (S.stageComplete(save, ix, cur) ? '<span class="sc-done">' + A.icon('check', 14) + ' Complete</span>' : '') + '</div><h3>' + esc(st.title) + '</h3><p>' + esc(st.subtitle || '') + '</p><div class="pbar"><i style="width:' + Math.round(100 * n / ms.length) + '%"></i></div><small>' + n + ' of ' + ms.length + ' missions</small>' + (un ? '' : '<p class="lock-note">' + A.icon('lock', 14) + ' Finish Stage ' + (cur - 1) + ' to unlock.</p>') + '</div>' +
      '<ul class="mlist">' + ms.map(function (m) { var s = S.missionState(save, ix, m, opts()); return '<li><button class="mrow st-' + s + '" data-m="' + esc(m.id) + '"><span class="mr-ic">' + stateIcon(s) + '</span><span class="mr-t"><b>' + esc(m.title) + '</b><small>' + esc(S.covers(m).filter(function (v, k, a) { return a.indexOf(v) === k; }).join(' \u00b7 ')) + '</small></span><span class="mr-a">' + LBL[s] + '</span></button></li>'; }).join('') + '</ul>';
    if (WU()) WU().inline(U.$('#needs-inline'));
  }
  function renderToggles() { var st = save.settings; U.$$('.tog').forEach(function (b) { var k = b.getAttribute('data-k'), on = k === 'compass' || k === 'scale' ? st[k] !== false : !!st[k]; b.setAttribute('aria-pressed', String(on)); }); }
  function renderStatus() {
    var el = U.$('#saved'); if (!el || !save) return;
    el.innerHTML = (storageOk ? A.icon('check', 14) + ' Autosaved ' : '<b class="warn">Autosave failed</b> ') + new Date(save.updated).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit' });
    el.setAttribute('data-ts', save.updated);
  }
  // ---------- demo world (for teacher preview, screenshots, and tests) ----------
  function demoAnswer(m, task, key) {
    var t = task || m.task, k = key !== undefined ? key : m.answerKey;
    switch (t.type) {
      case 'cer': var c = k.claims ? k.claims[0] : k.claim; return { claim: c, evidence: k.claims ? k.evidenceFor[String(c)] : k.evidence };
      case 'build-web': return (k.edges || []).concat(k.optional || []);
      case 'circuit': if (t.mode === 'parts') { var pk = []; ['wire', 'switch', 'device'].forEach(function (kd) { for (var q = 0; q < t.parts.length; q++) if (t.parts[q].kind === kd && pk.indexOf(q) < 0) { pk.push(q); break; } }); for (var q2 = 0; q2 < t.parts.length && pk.length < (t.slots || 4); q2++) if (t.parts[q2].kind !== 'insulator' && pk.indexOf(q2) < 0) pk.push(q2); return { slots: pk, switchClosed: true }; } var g = []; t.materials.forEach(function (x, q) { if (x.conductor && g.length < (t.gaps || 2)) g.push(q); }); return { gaps: g, switchClosed: true };
      case 'orbit': return t.mode === 'table' ? k : { angle: k.angle };
      case 'investigate': return { change: k.change, measure: k.measure, ran: true };
      case 'write': case 'writing': return { text: 'In my world the river carved a canyon and dropped sand at the delta. ' + Array(Math.ceil((t.minWords || 40) / 12) + 2).join('I used evidence from my map and science words to explain my thinking. '), checks: (t.checklist || []).map(function () { return true; }) };
      case 'coordinate': return { points: k.points, q: k.q, qText: k.model };
      case 'measure': return { values: k.values, units: k.units };
      case 'chart': return { bars: k.bars, dots: k.dots, answers: k.answers };
      case 'numeric': return (k.accepted || [])[0] != null ? k.accepted[0] : String(k.tol ? k.tol.value : '');
      case 'budget': return { choose: k.choose, requiredTotal: k.requiredTotal, totalSpent: k.totalSpent, finalBalance: k.finalBalance, q2: (k.ideas || []).slice(0, 2).join('; ') };
      default: return k;
    }
  }
  function demoParts(m) { var p = {}; MS.units(m).forEach(function (u) { if (u.kind !== 'main') p[u.id] = demoAnswer(m, u.task, u.key); }); return p; }
  APP.demoAnswer = demoAnswer; APP.demoParts = demoParts;
  function BIO_H(i, j) { return window.DAW_TERRAIN ? window.DAW_TERRAIN.hash(i, j, 99) : 0; }
  function buildDemo(upToStage) {
    var s = S.newSave('Demo Student', '3'), stop = upToStage || 99, spots = [];
    for (var r = 0; r < S.WORLD; r++) for (var a = 0; a < S.WORLD; a++) spots.push([a, r]);
    spots.sort(function (p, q) { var c = (S.WORLD - 1) / 2; return (Math.abs(p[0] - c) + Math.abs(p[1] - c)) - (Math.abs(q[0] - c) + Math.abs(q[1] - c)) || p[0] - q[0]; });
    var water = false;
    ix.missions.slice().sort(function (x, y) { return x.stage - y.stage; }).forEach(function (m) {
      if (m.stage > stop) return;
      if (window.DAW_FUNC && m.stage > 1) for (var fs = 1; fs < m.stage; fs++) window.DAW_FUNC.demoFavs(s, ix, ix.stageIds[fs - 1]);
      if (m.stage >= 2 && !water) { water = true; ['d-river', 'd-lake'].forEach(function (id) { for (var q = spots.length - 1; q >= 0; q--) { var r2 = S.placeItem(s, ix, spots[q][0], spots[q][1], id); if (r2.ok || r2.reason === 'locked-stage') break; } }); }
      if (!S.onMap(s, m.unlockItem)) for (var k = 0; k < spots.length; k++) { var res = S.placeItem(s, ix, spots[k][0], spots[k][1], m.unlockItem); if (res.ok || res.reason === 'needs' || res.reason === 'locked-stage') break; }
      S.completeMission(s, ix, m.id, { answer: demoAnswer(m), parts: demoParts(m), followUp: (m.followUp || m.task.followUp || {}).answerKey, explain: { c: 'I claim that ' + m.title.toLowerCase() + ' shows how my world works.', e: 'My evidence is what I saw in the activity and on my map.', r: 'This shows the science idea because the evidence matches the claim.' }, gt: m.stage % 2 ? 'I would test this again with more trials to make my results stronger and more reliable.' : '', firstTry: true, xp: 150 });
      demoGuide(s, true);
    });
    if (stop >= 4) { [['d-houses', 4, 18], ['d-houses', 6, 20], ['d-farm', 18, 4], ['d-windfarm', 20, 6], ['d-trees', 2, 2], ['d-trees', 3, 6], ['d-road', 8, 20], ['d-trees', 21, 15]].forEach(function (d) { S.placeItem(s, ix, d[1], d[2], d[0]); }); }
    // demo biomes: paint under biome places, then (finished demo) a few painted patches on open land
    var BIO = S.BIO; if (BIO) { s.world.paint = BIO.infer(s.world.tiles, S.WORLD, function (id) { return IT.get(id).art; });
      if (stop >= 4) [['t', 4, 4, 3], ['m', 19, 4, 2], ['d', 19, 19, 3], ['f', 4, 16, 3], ['w', 13, 19, 2], ['c', 9, 21, 2]].forEach(function (pt) {
        for (var di = -pt[3]; di <= pt[3]; di++) for (var dj = -pt[3]; dj <= pt[3]; dj++) { var x = pt[1] + di, y = pt[2] + dj; if (Math.abs(di) + Math.abs(dj) <= pt[3] + (BIO_H(x, y) > 0.5 ? 1 : 0) && !S.tileAt(s, x, y)) BIO.paint(s, x, y, pt[0], 1); } }); }
    demoGuide(s); if (window.DAW_WORLDUI) { if (stop >= 4) window.DAW_WORLDUI.demoHistory(s, ix); window.DAW_WORLDC.sync(s, ix, {}); window.DAW_WORLDC.ack(s); }
    if (stop >= 4 && window.DAW_SHOWCASE) window.DAW_SHOWCASE.demo(s, ix);
    S.saveWriting(s, 'j1', { title: W.PROMPTS[0].title, genre: 'journal', prompt: W.PROMPTS[0].prompt, text: 'My canyon formed when the river slowly weathered and eroded the rock over a very long time. The sand it carried was deposited at the delta near (6, 3). These are constructive and destructive changes working together.', checks: [true, true, true, true, false, true] });
    if (stop >= 4) S.saveWriting(s, 'p4', { title: W.PROMPTS[6].title, genre: 'proposal', prompt: W.PROMPTS[6].prompt, text: 'I propose building a wind farm at (10, 3) on the ridge. It costs 250 coins and makes clean electricity, so the town burns less coal. Some people say it is noisy, but it is far from the houses.', checks: [true, true, true, true, true, false] });
    s.names[ix.missions[0].unlockItem] = 'Base Camp';
    demoGuide(s);
    if (window.DAW_FUNUI) window.DAW_FUNUI.demo(s, ix, stop);
    return s;
  }
  // demo Field Guide: every placed landform/feature described, plus plants and animals in each biome
  function demoGuide(s, noOrgs) {
    var D = window.DAW_DESC, dx = DU().dx(), n = 0, used = {};
    s.world.tiles.forEach(function (t) {
      var th = D.thing(dx, IT.get(t.t).art); if (th && !s.describe[th.key]) D.saveRecord(s, th.key, D.model(dx, th.key, { gt: (n++ % 3) === 0 }));
      var b = D.biomeOf(dx, IT.get(t.t).art); if (!b || noOrgs) return;
      dx.data.organisms.filter(function (o) { return o.biomes.indexOf(b) >= 0 && !used[o.id]; }).slice(0, 2).forEach(function (o) {
        used[o.id] = 1; if (D.addOrganism(s, dx, t, IT.get(t.t).art, o.id, '').ok) D.saveRecord(s, 'org:' + o.id, D.model(dx, 'org:' + o.id, { biome: b }));
      });
    });
    if (noOrgs) return;
    var c = (dx.data.gtCompare || [])[0]; if (c) D.saveRecord(s, 'cmp:' + c.id, D.model(dx, 'cmp:' + c.id));
  }
  // ---------- boot ----------
  function bindUI() {
    U.$('#stepper').addEventListener('click', function (e) { var b = e.target.closest('.step'); if (!b) return; var sid = +b.getAttribute('data-stage'); viewStage = sid; if (!S.stageUnlocked(save, ix, sid, opts())) U.toast('Stage ' + sid + ' unlocks after you finish Stage ' + (sid - 1) + '.'); render(); });
    U.$('#palette').addEventListener('click', function (e) {
      var b = e.target.closest('.pal'); if (!b) return; var id = b.getAttribute('data-item'), mid = b.getAttribute('data-m');
      if (mid) { var m = ix.byId[mid], s = S.missionState(save, ix, m, opts()); if (s === 'locked' || s === 'needs' || s === 'waiting') return goMission(m); if (s === 'placed') return MS.open(mid); }
      else if (b.classList.contains('st-locked')) { U.toast(IT.get(id).name + ' unlocks in Stage ' + IT.get(id).stage + '.'); return; }
      selectItem(id);
    });
    U.$('#missions').addEventListener('click', function (e) { var b = e.target.closest('.mrow'); if (b) goMission(ix.byId[b.getAttribute('data-m')]); });
    if (WU()) WU().bindInline(U.$('#missions'));
    U.$('#maptools').addEventListener('click', function (e) {
      var t = e.target.closest('.tool'); if (t) { setTool(t.getAttribute('data-tool')); return; }
      var g = e.target.closest('.tog'); if (g) { var k = g.getAttribute('data-k'), st = save.settings; st[k] = (k === 'compass' || k === 'scale') ? st[k] === false : !st[k]; commit(null, { quiet: true }); return; }
      var z = e.target.closest('.zoom'); if (z) { save.settings.zoom = Math.max(1, Math.min(2.2, (save.settings.zoom || 1) + (+z.getAttribute('data-d')))); commit(null, { quiet: true }); return; }
    });
    U.$('#coord-form').addEventListener('submit', function (e) {
      e.preventDefault(); var x = +U.$('#cx').value, y = +U.$('#cy').value;
      var hiC = S.WORLD - 1; if (!(x >= 0 && x <= hiC && y >= 0 && y <= hiC) || x % 1 || y % 1 || U.$('#cx').value === '' || U.$('#cy').value === '') { U.toast('Use whole numbers from 0 to ' + hiC + ' for x and y.', 'bad'); return; }
      var p = M.fromCoord(x, y); if (tool !== 'place' || !selected) { U.toast('Pick a place from the left panel first.'); return; } place(p.i, p.j);
    });
    var bind = { 'teks-btn': function () { P.tracker(); }, 'save-btn': function () { P.saves(); }, 'turnin-btn': function () { P.turnIn(); }, 'writing-btn': function () { W.open(); }, 'budget-btn': function () { W.budget(); }, 'charts-btn': function () { W.charts(); }, 'settings-btn': P.settings, 'help-btn': P.help, 'ach-btn': function () { window.DAW_FUNUI.binder('ach'); }, 'sound-btn': function () { window.DAW_FUNUI.toggleSound(); }, 'guide-btn': function () { DU().guide(); }, 'needs-btn': function () { WU().board(); }, 'showcase-btn': function () { window.DAW_SHOWCASE.open(); } };
    Object.keys(bind).forEach(function (id) { var b = document.getElementById(id); if (b) b.addEventListener('click', bind[id]); });
    mapCtl = M.mount(U.$('#map'), {
      save: function () { return save; }, ix: function () { return ix; }, unlockAll: function () { return PREVIEW; }, tool: function () { return tool; }, selected: function () { return selected; },
      hover: function (t, c) { U.$('#hover-xy').textContent = t ? '(' + c.x + ', ' + c.y + ')' : ''; },
      measured: function (r) { setReadout(r.html); },
      brushAt: function (t) { return window.DAW_BIOMEUI.brushAt(t); }, brushEnd: function () { return window.DAW_BIOMEUI.brushEnd(); }, brushSize: function () { return window.DAW_BIOMEUI ? window.DAW_BIOMEUI.size : 1; }, brushColor: function () { var B = window.DAW_BIOMES, c = window.DAW_BIOMEUI && window.DAW_BIOMEUI.brush; return c && B.byCode[c] ? B.byCode[c].icon : '#9fc767'; },
      tap: function (t) {
        var tile = S.tileAt(save, t.i, t.j);
        if (tool === 'biome') return;
        if (tool === 'erase') { if (tile) { var deps = S.dependents(save, ix, tile.t); if (deps.length) U.confirm('Remove this place?', deps.length + ' finished mission(s) use it. They will be marked <b>needs review</b> (nothing is deleted).', 'Remove', function () { erase(t.i, t.j); }, true); else erase(t.i, t.j); } return; }
        if (tool === 'volume') { if (!tile) return; var v = M.volumeText(save, tile); setReadout(v ? v.html : '<b>' + esc(IT.name(save, tile.t)) + '</b> is not shaped like a rectangular prism. Try a building, a tank, or the lake.'); return; }
        if (tile) { var m = ix.byItem[tile.t]; if (tool === 'place' && m && !(save.missions[m.id] && save.missions[m.id].done)) { if (S.missionState(save, ix, m, opts()) === 'waiting') { goMission(m); return; } MS.open(m.id); return; } P.placeInfo(tile); return; }
        if (tool === 'place') place(t.i, t.j); else if (tool === 'select') setReadout('Empty land at (' + M.coord(t.i, t.j).x + ', ' + M.coord(t.i, t.j).y + ').' + (window.DAW_BIOMEUI ? window.DAW_BIOMEUI.infoLine(t) : ''));
      }
    });
    window.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !document.querySelector('.modal-wrap')) { selected = null; renderPalette(); setReadout(''); } });
  }
  function welcome(cb) {
    var w = U.el('div', { class: 'welcome', id: 'welcome' }, '<div class="wel-card"><div class="wel-art">' + A.thumb('canyon', 120, 3) + A.thumb('lighthouse', 120, 4) + A.thumb('forest', 120, 5) + '</div><h1>Design a World</h1><p class="lead">Build your own world, one science mission at a time.</p>' +
      '<form class="wel-form"><label class="field">Your first name <input id="wel-name" maxlength="40" required autocomplete="off" autofocus></label><label class="field">Class period <input id="wel-period" maxlength="12" autocomplete="off"></label><button class="btn primary big" type="submit">Start my world \u2192</button></form>' +
      '<details class="wel-load"><summary>I already have a save file or code</summary><label class="btn ghost file-btn">Open a save file<input type="file" id="wel-file" accept=".json,application/json,text/plain" hidden></label><textarea id="wel-code" rows="3" placeholder="Or paste your save code (starts with DAW)"></textarea><button class="btn ghost" id="wel-load-code" type="button">Load code</button></details><p class="small">No account needed. Your work saves in this browser. Nothing is sent anywhere.</p></div>');
    document.body.appendChild(w);
    U.$('.wel-form', w).addEventListener('submit', function (e) { e.preventDefault(); save = S.newSave(U.$('#wel-name').value.trim(), U.$('#wel-period').value.trim()); persist(); w.remove(); cb(); P.help(); });
    function fromText(t) { var r = S.loadAny(t); if (!r.save) { U.toast(r.error || 'Could not load.', 'bad', 5000); return; } if (!r.verified) U.toast('Warning: this save was changed after it was made.', 'warn', 5000); save = r.save; S.applyAliases(save, ix); persist(); w.remove(); cb(); U.toast('Welcome back' + (save.student.name ? ', ' + save.student.name : '') + '!', 'good'); }
    U.$('#wel-file', w).addEventListener('change', function (e) { if (e.target.files[0]) U.readFile(e.target.files[0]).then(fromText); });
    U.$('#wel-load-code', w).addEventListener('click', function () { fromText(U.$('#wel-code').value); });
  }
  function route() {
    var h = decodeURIComponent(location.hash.slice(1)); if (!h) return;
    if (h === 'tracker') P.tracker(); else if (h.indexOf('tracker=') === 0) P.tracker(h.slice(8)); else if (h === 'saves') P.saves(); else if (h === 'turnin') P.turnIn(); else if (h === 'writing') W.open(); else if (h === 'budget') W.budget(); else if (h === 'charts') W.charts(); else if (h === 'help') P.help(); else if (h === 'guide') DU().guide(); else if (h === 'organisms') DU().library(); else if (h === 'compare') DU().compare(); else if (h.indexOf('describe=') === 0) DU().openKey(h.slice(9));
    else if (h.indexOf('mission=') === 0) { var m = ix.byId[h.slice(8)]; if (m) MS.open(m.id, save.missions[m.id] && save.missions[m.id].done ? { redo: true } : {}); }
    else if (h === 'civ' && window.DAW_CIVUI) window.DAW_CIVUI.open('problem'); else if (h === 'needs') WU().board(); else if (h.indexOf('history=') === 0) WU().history(h.slice(8)); else if (h === 'showcase') window.DAW_SHOWCASE.open(); else if (h === 'present') window.DAW_SHOWCASE.present(); else if (h === 'evidence') window.DAW_SHOWCASE.open('evidence'); else if (h === 'feedback' || h.indexOf('feedback=') === 0) window.DAW_SHOWCASE.feedbackForm(h.slice(9));
    else if (window.DAW_FUNUI && window.DAW_FUNUI.route(h)) return;
    else if (h === 'report') { var ov = U.el('div', { class: 'report-overlay', id: 'report-view' }, window.DAW_REPORT.html(save, ix, { source: 'Current world' })); document.body.appendChild(ov); }
  }
  // shown once after an older save (before the Field Guide) is upgraded; nothing is removed
  function migratedNotice() {
    if (!save.migrated || save.migrated.seen) return;
    save.migrated.seen = true; persist();
    var n = DU() ? DU().counts(save).todo : 0; if (!n) return;
    var md = U.modal({ title: 'New: your Field Guide' }); md.el.id = 'migrated-modal';
    md.body.innerHTML = '<p class="lead">Your world is safe. Everything you built is still here.</p><p>Scientists describe what they find. <b>' + n + ' thing' + (n > 1 ? 's' : '') + '</b> on your map now need a description. Look for the <b>\u270e</b> badge, or open the Field Guide.</p><div class="btn-row"><button class="btn ghost later">Later</button><button class="btn primary go" autofocus>Open my Field Guide</button></div>';
    U.$('.later', md.body).onclick = md.close; U.$('.go', md.body).onclick = function () { md.close(); DU().guide(); };
  }
  function start() {
    bindUI();
    if (PREVIEW) document.body.appendChild(U.el('div', { class: 'preview-banner' }, 'Teacher preview: all stages unlocked. This preview saves separately from student work.'));
    if (DEMO) document.body.appendChild(U.el('div', { class: 'preview-banner demo' }, 'Demo world (saved separately). <a href="./index.html">Go to my own world</a>'));
    if (/^https?:$/.test(location.protocol)) { var ml = document.createElement('link'); ml.rel = 'manifest'; ml.href = 'manifest.webmanifest'; document.head.appendChild(ml); }
    if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol) && !TEST) navigator.serviceWorker.register('sw.js').catch(function () {});
    var go = function () { if (window.DAW_FUNUI) window.DAW_FUNUI.onLoad(save); if (WU() && save) { WU().sync(); persist(); } render(); if (window.DAW_FUNUI) window.DAW_FUNUI.boot(); if (window.DAW_CIVUI) window.DAW_CIVUI.boot(); migratedNotice(); route(); window.DAW_READY = true; document.body.classList.add('ready'); };
    if (DEMO) { save = load() || buildDemo(DEMO === 'full' ? 99 : +DEMO); persist(); go(); return; }
    save = load(); if (save) go(); else welcome(go);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
