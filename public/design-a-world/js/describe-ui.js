/* Design a World: Field Guide UI. Students DESCRIBE and IDENTIFY the science of what they place:
   landforms (process, agent, time scale + written description), resources / water / weather / energy
   (identify + describe), and organisms (adaptations: structure vs behavior, inherited vs learned,
   how each helps it survive; wrong-biome justify-or-move). Plus GT compare and predict. */
(function () {
  'use strict';
  var U = window.DAW_UI, S = window.DAW_STATE, A = window.DAW_ART, IT = window.DAW_ITEMS, M = window.DAW_MAP, D = window.DAW_DESC, esc = U.esc;
  // Show me: Support = after 3 tries; Challenge = after 2 tries or a written attempt (8+ words in the description box)
  function RV(tries, rootEl) { var G = window.DAW_GC, s = window.DAW_APP && window.DAW_APP.save(); if (!G || !s) return tries >= 3; var ta = rootEl && rootEl.querySelector('textarea'); var tk = rootEl && rootEl.querySelector('.prompt, h2, h3, p'); return G.revealReady(G.modeOf(s), tries, 3, ta ? ta.value : '', { task: tk ? tk.textContent : '' }); }
  var DU = window.DAW_DESCUI = {}, dx = D.shared() || D.index(null), XP = { lf: 30, ft: 25, org: 40, gt: 20, cmp: 50 };
  function app() { return window.DAW_APP; }
  function artOf(itemId) { return IT.get(itemId).art; }
  DU.dx = function () { return dx; };
  DU.biomeTiles = function (save) { return biomeTiles(save); };
  DU.biomeNames = function (o) { return biomeNames(o); };
  DU.artOf = artOf;
  DU.init = function () { D.hook(S, artOf); };
  // status for the map: 'needs' | 'done' | 'none', plus organisms on the tile
  DU.tileInfo = function (save, tile) { return D.tileInfo(save, dx, artOf(tile.t), tile); };
  DU.needsFor = function (save, itemId) { return D.status(save, dx, artOf(itemId)) === 'needs'; };
  DU.thingFor = function (itemId) { return D.thing(dx, artOf(itemId)); };
  DU.todo = function (save) { return D.todo(save, dx, artOf); };
  DU.counts = function (save) { return D.counts(save, dx, artOf); };
  DU.rows = function (save) { return D.rows(save, dx); };
  DU.openItem = function (itemId, opts) {
    var th = DU.thingFor(itemId); if (!th) return null;
    return th.kind === 'lf' ? DU.landform(th.id, opts) : DU.feature(th.id, opts);
  };

  // ---------- shared bits ----------
  function chips(name, options, chosen, multi) {
    return '<div class="chips" role="group" data-g="' + name + '" data-multi="' + (multi ? 1 : 0) + '">' + options.map(function (o) {
      var id = typeof o === 'string' ? o : o.id, label = typeof o === 'string' ? o : o.label, on = multi ? (chosen || []).indexOf(id) >= 0 : chosen === id;
      return '<button type="button" class="chipbtn' + (on ? ' on' : '') + '" data-v="' + esc(id) + '" aria-pressed="' + on + '">' + esc(label) + '</button>';
    }).join('') + '</div>';
  }
  function chipVal(root, name) {
    var g = U.$('.chips[data-g="' + name + '"]', root); if (!g) return null;
    var on = U.$$('.chipbtn.on', g).map(function (b) { return b.getAttribute('data-v'); });
    return g.getAttribute('data-multi') === '1' ? on : on[0] || null;
  }
  function wireChips(root, onChange) {
    root.addEventListener('click', function (e) {
      var b = e.target.closest('.chipbtn'); if (!b || b.disabled) return; var g = b.closest('.chips');
      if (g.getAttribute('data-multi') !== '1') U.$$('.chipbtn', g).forEach(function (x) { if (x !== b) { x.classList.remove('on'); x.setAttribute('aria-pressed', 'false'); } });
      b.classList.toggle('on'); b.setAttribute('aria-pressed', String(b.classList.contains('on'))); if (onChange) onChange(g.getAttribute('data-g'), b);
    });
  }
  function frameChips(frames, target) {
    return '<div class="frames"><span class="small">Sentence frames (tap to add):</span>' + frames.map(function (f) { return '<button type="button" class="frame" data-t="' + esc(f) + '">' + esc(f) + '</button>'; }).join('') + '</div>';
  }
  function wireFrames(root, ta) {
    U.$$('.frame', root).forEach(function (b) { b.onclick = function () { var t = b.getAttribute('data-t'); ta.value = (ta.value && !/\s$/.test(ta.value) ? ta.value + ' ' : ta.value) + t + ' '; ta.focus(); ta.dispatchEvent(new Event('input', { bubbles: true })); }; });
  }
  function counter(ta, el, need) { function u() { var n = D.words(ta.value); el.textContent = n + ' words' + (need ? ' (goal ' + need + '+)' : ''); el.classList.toggle('met', !need || n >= need); } ta.addEventListener('input', u); u(); }
  function fb(root, ok, msgs, good) { U.$('.dfb', root).innerHTML = '<div class="fb ' + (ok ? 'good' : 'bad') + '">' + (ok ? '<b>' + esc(good || 'Correct!') + '</b>' : '<b>Not yet.</b><ul>' + msgs.map(function (m) { return '<li>' + esc(m) + '</li>'; }).join('') + '</ul>') + '</div>'; }
  function head(art, title, sub, extra) { return '<div class="d-head"><div class="d-art">' + art + '</div><div><p class="lead">' + esc(sub || '') + '</p>' + (extra || '') + '</div></div>'; }
  function revMeta(r) { return r ? '<p class="small d-rev">Saved ' + esc(U.fmtTime(r.updated)) + (r.rev > 1 ? ' \u00b7 version ' + r.rev : '') + (r.ok ? ' \u00b7 ' + A.icon('check', 12) + ' complete' : '') + '</p>' : ''; }
  function finish(save, key, rec, md, label, after) {
    var before = S.badges(save, app().ix());
    D.saveRecord(save, key, rec); app().commit(label);
    var nb = S.badges(save, app().ix()).filter(function (b) { return before.indexOf(b) < 0; });
    md.close(); U.toast(label + (rec.xp ? ' +' + rec.xp + ' XP' : '') + (nb.length ? ' \u2605 New badge: ' + nb.map(function (b) { return S.BADGES.filter(function (x) { return x.id === b; })[0].name; }).join(', ') : ''), 'good', 3500);
    if (after) after(rec);
  }
  function defaultFrames(lf) {
    return lf.frames && lf.frames.length ? lf.frames : ['My ' + lf.name.toLowerCase() + ' formed when ___ (water / wind / ice / gravity) ___.', 'First, ___ broke the rock into pieces (weathering).', 'Next, ___ carried the pieces away (erosion).', 'Then the pieces were dropped ___ (deposition).', 'This took ___ (seconds / years / thousands of years).'];
  }

  // ---------- favorites: star an entry and write one short explanation (the strongest evidence) ----------
  function FU() { return window.DAW_FUNC; }
  function curStage() { var s = app().save(), ix = app().ix(); return S.currentStage(s, ix, { unlockAll: app().unlockAll() }); }
  function favBox(key, prev, ph, frames) {
    var fu = FU(), on = !!(fu && fu.isFav(app().save(), key)), st = fu ? fu.favStatus(app().save(), app().ix(), curStage()) : null, hasText = !!(prev && prev.text);
    return '<section class="fav-box' + (on || hasText ? ' open' : '') + '"><div class="fav-head"><button type="button" class="btn fav-toggle' + (on ? ' on' : '') + '" aria-pressed="' + on + '">' + A.icon('star', 18) + ' <span>' + (on ? 'Favorite!' : 'Make it a favorite') + '</span></button><span class="small fav-note">Optional. Pick ' + (st ? st.per : 2) + ' favorites each stage for your Showcase and write one short explanation for each.' + (st ? ' <b>Stage ' + st.stage + ': ' + st.written + ' of ' + st.need + ' written.</b>' : '') + '</span></div>' +
      '<div class="fav-write"' + (on || hasText ? '' : ' hidden') + '>' + frameChips(frames) + '<textarea class="dtext" rows="2" aria-label="Your explanation" placeholder="' + esc(ph) + '">' + esc(prev ? prev.text || '' : '') + '</textarea><div class="write-meta"><span class="wc"></span><span class="small">Written explanations are your strongest evidence.</span></div></div></section>';
  }
  function wireFav(root) {
    var b = U.$('.fav-toggle', root), box = U.$('.fav-box', root), wr = U.$('.fav-write', root);
    b.onclick = function () { var on = !b.classList.contains('on'); b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on)); U.$('span', b).textContent = on ? 'Favorite!' : 'Make it a favorite'; box.classList.toggle('open', on || !!U.$('.dtext', root).value.trim()); wr.hidden = !(on || U.$('.dtext', root).value.trim()); if (on) U.$('.dtext', root).focus(); if (window.DAW_FUNUI) DAW_FUNUI.sfx('tap'); };
    var ta = U.$('.dtext', root); counter(ta, U.$('.fav-box .wc', root), FU() ? FU().minWords() : 12); wireFrames(U.$('.fav-box', root), ta);
  }
  function favOn(root) { var b = U.$('.fav-toggle', root); return !!(b && b.classList.contains('on')); }
  function applyFav(save, key, on) { var fu = FU(); if (!fu) return; if (on) fu.star(save, key, curStage()); else fu.unstar(save, key); }
  // the written part is optional, but if the student writes (or stars), it must be a real explanation
  function favText(root, kind, def) {
    var t = U.$('.dtext', root).value.trim(), on = favOn(root); if (!t && !on) return { ok: true, text: '' };
    var r = D.checkFavorite(kind, def, t, FU() ? FU().minWords() : 12);
    if (!r.ok) return { ok: false, msgs: (on && !t ? ['Favorites need one short explanation.'] : []).concat(r.missing), hint: t && !on ? 'Finish your explanation, or clear it to save your picks only.' : '' };
    return { ok: true, text: t };
  }
  function showNeeds(root, r) { U.$('.dfb2', root).innerHTML = '<div class="fb bad"><b>Your explanation needs:</b><ul>' + r.msgs.map(function (m) { return '<li>' + esc(m) + '</li>'; }).join('') + '</ul>' + (r.hint ? '<p class="small">' + esc(r.hint) + '</p>' : '') + '</div>'; }
  function sfx(k) { if (window.DAW_FUNUI) DAW_FUNUI.sfx(k); }
  // drag a token onto a target (pointer events; tapping the token works too)
  function dragTokens(root, tokSel, dropSel, onDrop) {
    root.addEventListener('pointerdown', function (e) {
      var tok = e.target.closest(tokSel); if (!tok || e.button > 0) return; var sx = e.clientX, sy = e.clientY, ghost = null, moved = false;
      function mv(ev) { if (!moved && Math.abs(ev.clientX - sx) + Math.abs(ev.clientY - sy) < 8) return; if (!moved) { moved = true; ghost = tok.cloneNode(true); ghost.className += ' drag-ghost'; document.body.appendChild(ghost); tok.classList.add('dragging'); } ghost.style.left = ev.clientX + 'px'; ghost.style.top = ev.clientY + 'px'; var over = document.elementFromPoint(ev.clientX, ev.clientY); U.$$(dropSel, root).forEach(function (d) { d.classList.toggle('drop-over', !!(over && d.contains(over))); }); }
      function up(ev) { document.removeEventListener('pointermove', mv); document.removeEventListener('pointerup', up); if (!moved) return; ghost.remove(); tok.classList.remove('dragging'); var over = document.elementFromPoint(ev.clientX, ev.clientY), d = over && over.closest(dropSel); U.$$(dropSel, root).forEach(function (x) { x.classList.remove('drop-over'); }); if (d && root.contains(d)) onDrop(tok, d); tok._dragged = true; setTimeout(function () { tok._dragged = false; }, 50); }
      document.addEventListener('pointermove', mv); document.addEventListener('pointerup', up);
    });
    root.addEventListener('click', function (e) { var tok = e.target.closest(tokSel); if (tok && tok._dragged) { e.stopImmediatePropagation(); e.preventDefault(); } }, true);
  }
  var AGENT_IC = { water: 'water', wind: 'weather', ice: 'water', gravity: 'landforms', volcanic: 'energy' };
  var AGENT_LB = { water: 'Water', wind: 'Wind', ice: 'Ice', gravity: 'Gravity', volcanic: 'Volcano' };
  var PROC_LB = { weathering: ['Weathering', 'break'], erosion: ['Erosion', 'move'], deposition: ['Deposition', 'drop'] };
  function bigChips(name, opts, chosen, multi, cls) {
    return '<div class="chips big ' + (cls || '') + '" role="group" data-g="' + name + '" data-multi="' + (multi ? 1 : 0) + '">' + opts.map(function (o) { var on = multi ? (chosen || []).indexOf(o.id) >= 0 : chosen === o.id; return '<button type="button" class="chipbtn tile' + (on ? ' on' : '') + '" data-v="' + esc(o.id) + '" aria-pressed="' + on + '">' + (o.icon || '') + '<span>' + o.label + '</span></button>'; }).join('') + '</div>';
  }

  // ---------- landform: drag the agent, watch the time-lapse, tap the process and time (visual picks) ----------
  // soft biome hint for a landform (never a block): where it usually forms vs. the biome painted under it
  DU.fitHint = function (save, lf) {
    var BI = window.DAW_BIOMES, want = BI && BI.LANDFORM_FIT[lf.art]; if (!want) return '';
    var t = save.world.tiles.filter(function (x) { return artOf(x.t) === lf.art; })[0], here = t ? BI.byCode[BI.tileCode(save, t) || BI.DEFAULT] : null;
    var names = want.map(function (c) { return BI.byCode[c].name.toLowerCase(); }), ok = here && want.indexOf(here.c) >= 0;
    return '<p class="small fit-hint' + (ok ? ' fits' : '') + '"><b>Biome hint:</b> a ' + esc(lf.name.toLowerCase()) + ' usually forms in ' + esc(names.join(' or ')) + ' land.' + (here ? (ok ? ' Yours is in ' + esc(here.name.toLowerCase()) + ', a good match.' : ' Yours is in ' + esc(here.name.toLowerCase()) + '. That is OK on your map; think about what force would build it there.') : '') + '</p>';
  };
  DU.landform = function (lfId, opts) {
    opts = opts || {}; var lf = dx.lf[lfId]; if (!lf) return null;
    var save = app().save(), key = 'lf:' + lfId, prev = D.rec(save, key) || null, tries = 0, revealed = !!(prev && prev.revealed);
    var md = U.modal({ title: 'Field Guide: ' + lf.name, wide: true, sticky: true }); md.el.id = 'describe-modal'; md.el.classList.add('describe-wrap', 'fg-visual');
    var o = dx.options, ts = dx.timescales, agents = (o.agent || ['water', 'wind', 'ice', 'gravity']);
    var TL = window.DAW_TL;
    md.body.innerHTML = '<div class="fg-play"><div class="fg-left">' + TL.markup(lf.name) + '<p class="small fg-sub">' + esc(lf.simple || ('How did this ' + lf.name.toLowerCase() + ' form?')) + (lf.texas ? ' Texas example: ' + esc(lf.texas) + '.' : '') + '</p>' + DU.fitHint(save, lf) + '</div><div class="fg-right">' + revMeta(prev) +
      '<div class="fg-step"><h4><span class="d-n">1</span> Who did the work? <span class="small">Drag a force onto the land, or tap it.</span></h4>' + bigChips('agent', agents.map(function (a) { return { id: a, label: AGENT_LB[a] || a, icon: A.icon(AGENT_IC[a] || 'landforms', 20) }; }), prev && prev.agent, true, 'agent-toks') + '</div>' +
      '<div class="fg-step"><h4><span class="d-n">2</span> What happened? <span class="small">Pick all the main ones.</span></h4>' + bigChips('process', (o.process || ['weathering', 'erosion', 'deposition']).map(function (p) { return { id: p, label: (PROC_LB[p] || [p])[0] + ' <small>(' + (PROC_LB[p] || ['', ''])[1] + ')</small>', icon: A.icon(p === 'weathering' ? 'resources' : p === 'erosion' ? 'forces' : 'landforms', 20) }; }), prev && prev.process, true) + '</div>' +
      '<div class="fg-step"><h4><span class="d-n">3</span> How long did it take? <span class="small">Read the clock.</span></h4>' + bigChips('time', ts.map(function (t) { return { id: t.id, label: esc(t.label) }; }), prev && prev.time, false, 'time-toks') + '</div>' +
      '<div class="dfb" aria-live="polite"></div></div></div>' +
      favBox(key, prev, 'My ' + lf.name.toLowerCase() + ' formed when...', defaultFrames(lf).slice(0, 3)) +
      '<details class="gt-mini"><summary>' + A.icon('star', 14) + ' GT Predict (optional)</summary><p>' + esc(lf.predict || ('Predict how your ' + lf.name.toLowerCase() + ' will change over the next 10,000 years. Explain why.')) + '</p><textarea class="dgt" rows="2" aria-label="Your prediction">' + esc(prev ? prev.gt || '' : '') + '</textarea></details>' +
      '<details class="model"' + (prev && prev.ok ? '' : ' hidden') + '><summary>Compare with a scientist\u2019s steps</summary>' + landformSteps(lf) + '</details>' +
      '<div class="dfb2" aria-live="polite"></div><div class="btn-row sticky-foot">' + (opts.later !== false ? '<button class="btn ghost later">' + (prev ? 'Cancel' : 'Later') + '</button>' : '') + '<button class="btn ghost dreveal" hidden>Show me</button><button class="btn ghost dcheck">Check my picks</button><button class="btn primary dsave">Save to my Field Guide</button></div>';
    var root = md.body, tl = U.$('.tl-box', root), gt = U.$('.dgt', root), allowed = lf.agent.concat(lf.agentOk || []);
    wireChips(root, function (g, b) { if (g === 'agent') playAgent(b); else sfx('tap'); }); wireFav(root);
    U.$('.fg-sub', root).prepend(U.speakBtn(window.DAW_NARR.landform(lf)));
    function playAgent(btn) {
      var ag = chipVal(root, 'agent') || []; if (!ag.length) return; var a = btn && btn.classList.contains('on') ? btn.getAttribute('data-v') : ag[ag.length - 1], ok = allowed.indexOf(a) >= 0;
      sfx(ok ? 'whoosh' : 'soft');
      TL.play(tl, { agent: a, ok: ok, timescale: lf.timescale, art: lf.art, name: lf.name });
      if (!ok) U.$('.dfb', root).innerHTML = '<div class="fb bad">' + esc((lf.misconceptions || {})[a] || (AGENT_LB[a] || a) + ' did not do most of the work here. Try another force.') + '</div>'; else U.$('.dfb', root).innerHTML = '';
    }
    dragTokens(root, '.agent-toks .chipbtn', '.tl-box', function (tok) { if (!tok.classList.contains('on')) tok.click(); else playAgent(tok); });
    if (prev && prev.agent && prev.agent.length) TL.play(tl, { agent: prev.agent[0], ok: true, timescale: lf.timescale, art: lf.art, name: lf.name, instant: true });
    function picks() { return { process: chipVal(root, 'process'), agent: chipVal(root, 'agent'), time: chipVal(root, 'time') }; }
    function check() {
      var r = D.checkLandformPicks(lf, picks()); tries++;
      fb(root, r.ok, r.msgs, 'Correct! Save it, or make it a favorite and explain it.');
      sfx(r.ok ? 'good' : 'soft');
      if (r.ok) U.$('.model', root).hidden = false;
      if (!r.ok && RV(tries, root)) U.$('.dreveal', root).hidden = false;
      return r.ok;
    }
    U.$('.dcheck', root).onclick = check;
    U.$('.dreveal', root).onclick = function () {
      revealed = true;
      [['process', lf.process], ['agent', lf.agent], ['time', [lf.timescale]]].forEach(function (g) { U.$$('.chips[data-g="' + g[0] + '"] .chipbtn', root).forEach(function (b) { var on = g[1].indexOf(b.getAttribute('data-v')) >= 0; b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on)); }); });
      playAgent(); check();
    };
    if (U.$('.later', root)) U.$('.later', root).onclick = function () { md.close(); if (!prev) U.toast(lf.name + ' needs its Field Guide picks. Look for the \u270e badge on your map.', 'warn', 3500); if (opts.onClose) opts.onClose(false); };
    U.$('.dsave', root).onclick = function () {
      var p = picks(), r = D.checkLandformPicks(lf, p);
      if (!r.ok) { tries++; fb(root, false, r.msgs); sfx('soft'); if (RV(tries, root)) U.$('.dreveal', root).hidden = false; U.$('.dfb2', root).innerHTML = '<div class="fb bad">Check your picks first.</div>'; return; }
      var t = favText(root, 'lf', lf); if (!t.ok) { showNeeds(root, t); return; }
      var g = gt.value.trim(), xp = XP.lf + (D.words(g) >= 8 ? XP.gt : 0) + (t.text ? 15 : 0);
      applyFav(save, key, favOn(root));
      finish(save, key, { k: 'lf', process: p.process, agent: p.agent, time: p.time, text: t.text.slice(0, 3000), gt: g.slice(0, 2000), ok: true, mode: t.text ? 'written' : 'picks', tries: (prev ? prev.tries || 0 : 0) + Math.max(1, tries), revealed: revealed, xp: xp }, md, lf.name + ' added to your Field Guide.', opts.onClose && function (rec) { opts.onClose(rec); });
    };
    return md;
  };

  function cap(t) { t = String(t || ''); return t.charAt(0).toUpperCase() + t.slice(1); }
  function landformSteps(lf) {
    var st = lf.steps || {}, list = (lf.stepsList || []).length ? lf.stepsList : null;
    var ag = (lf.agent || []).join(' and '), P = lf.process || [], has = function (p) { return P.indexOf(p) >= 0; };
    var gen = { break: has('weathering') ? ag + ' breaks rock into smaller pieces (weathering).' : 'Not the main process here.', move: has('erosion') ? ag + ' carries the pieces away (erosion).' : 'Not the main process here.', drop: has('deposition') ? ag + ' drops the sediment in a new place (deposition).' : 'Not the main process here.' };
    var h = list ? '<ol>' + list.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ol>'
      : '<ol><li><b>Break:</b> ' + esc(st.break || cap(gen.break)) + '</li><li><b>Move:</b> ' + esc(st.move || cap(gen.move)) + '</li><li><b>Drop:</b> ' + esc(st.drop || cap(gen.drop)) + '</li></ol>';
    if (lf.model) h += '<p class="small"><b>Model it:</b> ' + esc(lf.model) + '</p>';
    if ((lf.stepsScience || []).length) h += '<p class="small"><b>In science words:</b> ' + lf.stepsScience.map(esc).join(' ') + '</p>';
    return h;
  }

  // ---------- resources, water, weather, energy: quick picks (+ optional favorite explanation) ----------
  DU.feature = function (ftId, opts) {
    opts = opts || {}; var ft = dx.ft[ftId]; if (!ft) return null;
    var save = app().save(), key = 'ft:' + ftId, prev = D.rec(save, key), tries = 0, revealed = !!(prev && prev.revealed);
    var md = U.modal({ title: 'Field Guide: ' + ft.name, wide: true, sticky: true }); md.el.id = 'describe-modal'; md.el.classList.add('describe-wrap', 'fg-visual');
    var GL = { resource: 'Natural resource', water: 'Water feature', weather: 'Weather feature', energy: 'Energy source' };
    md.body.innerHTML = '<div class="fg-play"><div class="fg-left ft-left"><div class="ft-art">' + A.thumb(artOfFeature(ft), 170, 4) + '</div><p class="lead fg-sub">' + esc(ft.prompt || (GL[ft.group] + ': tap the right answers.')) + '</p><p class="small">' + esc(GL[ft.group] || '') + '</p></div><div class="fg-right">' + revMeta(prev) +
      (ft.checks || []).map(function (c, n) { return '<div class="fg-step"><h4><span class="d-n">' + (n + 1) + '</span> ' + esc(c.label) + '</h4>' + bigChips('c-' + c.id, c.options.map(function (op, k) { return { id: String(k), label: esc(op) }; }), prev && prev.answers && prev.answers[c.id] != null ? String(prev.answers[c.id]) : null, false) + '</div>'; }).join('') +
      '<div class="dfb" aria-live="polite"></div></div></div>' +
      favBox(key, prev, 'This ' + ft.name.toLowerCase() + ' is...', ft.frames && ft.frames.length ? ft.frames.slice(0, 3) : ['This ' + ft.name.toLowerCase() + ' is ___ because ___.']) +
      (ft.gt ? '<details class="gt-mini"><summary>' + A.icon('star', 14) + ' GT Predict (optional)</summary><p>' + esc(ft.gt) + '</p><textarea class="dgt" rows="2" aria-label="Your prediction">' + esc(prev ? prev.gt || '' : '') + '</textarea></details>' : '') +
      (ft.model ? '<details class="model"' + (prev && prev.ok ? '' : ' hidden') + '><summary>Compare with a scientist\u2019s description</summary><p>' + esc(ft.model) + '</p></details>' : '') +
      '<div class="dfb2" aria-live="polite"></div><div class="btn-row sticky-foot"><button class="btn ghost later">' + (prev ? 'Cancel' : 'Later') + '</button><button class="btn ghost dreveal" hidden>Show me</button><button class="btn ghost dcheck">Check</button><button class="btn primary dsave">Save to my Field Guide</button></div>';
    var root = md.body, gt = U.$('.dgt', root);
    wireChips(root, function () { sfx('tap'); }); wireFav(root);
    U.$('.fg-sub', root).prepend(U.speakBtn((ft.prompt || '') + ' ' + (ft.checks || []).map(function (c) { return c.label; }).join(' ')));
    function answers() { var a = {}; (ft.checks || []).forEach(function (c) { var v = chipVal(root, 'c-' + c.id); a[c.id] = v == null ? null : +v; }); return a; }
    function check() { var r = D.checkFeature(ft, answers()); tries++; fb(root, r.ok, r.msgs, 'Correct! Save it, or make it a favorite and explain it.'); sfx(r.ok ? 'good' : 'soft'); if (r.ok && U.$('.model', root)) U.$('.model', root).hidden = false; if (!r.ok && RV(tries, root)) U.$('.dreveal', root).hidden = false; return r; }
    U.$('.dcheck', root).onclick = check;
    U.$('.dreveal', root).onclick = function () { revealed = true; (ft.checks || []).forEach(function (c) { U.$$('.chips[data-g="c-' + c.id + '"] .chipbtn', root).forEach(function (b) { var on = +b.getAttribute('data-v') === c.answer; b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on)); }); }); check(); };
    U.$('.later', root).onclick = function () { md.close(); if (opts.onClose) opts.onClose(false); };
    U.$('.dsave', root).onclick = function () {
      var a = answers(), r = D.checkFeature(ft, a); if (!r.ok) { tries++; fb(root, false, r.msgs); sfx('soft'); if (RV(tries, root)) U.$('.dreveal', root).hidden = false; U.$('.dfb2', root).innerHTML = '<div class="fb bad">Check your picks first.</div>'; return; }
      var t = favText(root, 'ft', ft); if (!t.ok) { showNeeds(root, t); return; }
      var g = gt ? gt.value.trim() : '';
      applyFav(save, key, favOn(root));
      finish(save, key, { k: 'ft', answers: a, text: t.text.slice(0, 3000), gt: g.slice(0, 2000), ok: true, mode: t.text ? 'written' : 'picks', tries: (prev ? prev.tries || 0 : 0) + Math.max(1, tries), revealed: revealed, xp: XP.ft + (D.words(g) >= 8 ? XP.gt : 0) + (t.text ? 15 : 0) }, md, ft.name + ' added to your Field Guide.', opts.onClose && function (rec) { opts.onClose(rec); });
    };
    return md;
  };
  function artOfFeature(ft) { return (ft.items || [])[0] || 'houses'; }

  // ---------- organisms ----------
  function biomeTiles(save) {
    return save.world.tiles.filter(function (t) { return D.biomeOf(dx, artOf(t.t)); }).map(function (t) {
      var c = M.tileCoord(t), h = D.habitat(dx, save, t, artOf(t.t)), b = dx.biome[h.id] || { id: h.id, name: h.id }; return { tile: t, biome: b, ids: h.ids, label: IT.name(save, t.t) + ' (' + b.name + ') at (' + c.x + ', ' + c.y + ')' };
    });
  }
  function nm(id) { return dx.org[id] ? dx.org[id].name : String(id).replace(/-/g, ' '); }
  function nms(a) { return (a || []).map(nm).join(', '); }
  function biomeNames(o) { return o.biomes.map(function (b) { return (dx.biome[b] || {}).name || b; }).join(', '); }
  DU.orgIcon = function (id, size) { var o = dx.org[id] || {}; return A.organismSvg(o.art || (o.kind === 'plant' ? 'grass' : 'mouse'), size || 48); };
  DU.library = function (opts) {
    opts = opts || {}; var save = app().save(), filt = opts.biome || 'all', sel = opts.org || null;
    var md = U.modal({ title: 'Organism Library', full: true }); md.el.id = 'library-modal';
    function paint() {
      var tiles = biomeTiles(save), mine = {}; if (sel && dx.org[sel]) tiles.sort(function (a, b) { return (dx.org[sel].biomes.indexOf(b.biome.id) >= 0) - (dx.org[sel].biomes.indexOf(a.biome.id) >= 0); }); tiles.forEach(function (x) { mine[x.biome.id] = 1; });
      var list = dx.data.organisms.filter(function (o) { return filt === 'all' || (filt === 'mine' ? o.biomes.some(function (b) { return mine[b]; }) : o.biomes.indexOf(filt) >= 0); });
      var placed = {}; D.placedOrganisms(save).forEach(function (p) { placed[p.org] = (placed[p.org] || 0) + 1; });
      var o = sel && dx.org[sel];
      md.body.innerHTML = '<div class="lib"><div class="lib-main"><p class="lead">Choose plants and animals for your biomes. For each one, you will identify its <b>adaptations</b> and explain how they help it survive.</p>' +
        '<div class="chips lib-filter">' + [{ id: 'all', label: 'All (' + dx.data.organisms.length + ')' }, { id: 'mine', label: 'Fits my map' }].concat(dx.data.biomes.map(function (b) { return { id: b.id, label: b.name }; })).map(function (b) { return '<button type="button" class="chipbtn' + (filt === b.id ? ' on' : '') + '" data-f="' + b.id + '">' + esc(b.label) + '</button>'; }).join('') + '</div>' +
        '<div class="lib-grid">' + list.map(function (x) { var st = D.isDone(save, 'org:' + x.id) ? 'done' : placed[x.id] ? 'needs' : ''; return '<button type="button" class="org-card' + (sel === x.id ? ' on' : '') + '" data-o="' + x.id + '">' + DU.orgIcon(x.id, 64) + '<b>' + esc(x.name) + '</b><small>' + esc(biomeNames(x)) + '</small>' + (st ? '<span class="oc-st ' + st + '">' + (st === 'done' ? A.icon('check', 12) : '\u270e') + '</span>' : '') + '</button>'; }).join('') + '</div></div>' +
        '<aside class="lib-side">' + (o ? '<div class="org-detail">' + DU.orgIcon(o.id, 110) + '<h3>' + esc(o.name) + '</h3><p class="small">' + esc(o.kind) + ' \u00b7 ' + esc(o.role || '') + '</p><p><b>Lives in:</b> ' + esc(biomeNames(o)) + '</p>' + (o.region ? '<p><b>Texas:</b> ' + esc(o.region) + '</p>' : '') +
          (o.eats && o.eats.length ? '<p><b>Eats:</b> ' + esc(nms(o.eats)) + '</p>' : '') + (o.eatenBy && o.eatenBy.length ? '<p><b>Eaten by:</b> ' + esc(nms(o.eatenBy)) + '</p>' : '') +
          (tiles.length ? '<label class="field">Add it to <select class="to">' + tiles.map(function (x, k) { var fit = o.biomes.indexOf(x.biome.id) >= 0; return '<option value="' + k + '"' + (opts.tile && x.tile === opts.tile ? ' selected' : '') + '>' + esc(x.label) + (fit ? '' : ' \u2014 not its usual home') + '</option>'; }).join('') + '</select></label><button class="btn primary add">Add to my world</button>' : '<p class="fb bad">Place a biome first: forest, prairie, desert, pond, lake, ocean, beach, or mountain.</p>') +
          (D.isDone(save, 'org:' + o.id) ? '<button class="btn ghost redo">Edit its adaptations</button>' : '') + '</div>' : '<p class="small">Tap a plant or animal to see where it lives.</p>') + '</aside></div>';
      U.$$('.lib-filter .chipbtn', md.body).forEach(function (b) { b.onclick = function () { filt = b.getAttribute('data-f'); paint(); }; });
      U.$$('.org-card', md.body).forEach(function (b) { b.onclick = function () { sel = b.getAttribute('data-o'); paint(); }; });
      if (U.$('.add', md.body)) U.$('.add', md.body).onclick = function () { var x = tiles[+U.$('.to', md.body).value]; md.close(); DU.add(sel, x.tile); };
      if (U.$('.redo', md.body)) U.$('.redo', md.body).onclick = function () { md.close(); DU.organism(sel, {}); };
    }
    paint(); return md;
  };
  DU.add = function (orgId, tile) {
    var save = app().save(), art = artOf(tile.t);
    if ((tile.o || []).indexOf(orgId) >= 0) { U.toast('That ' + dx.org[orgId].name + ' is already there.'); return; }
    if (!D.fitsTile(dx, save, orgId, tile, art)) return DU.wrongBiome(orgId, tile);
    var r = D.addOrganism(save, dx, tile, art, orgId, '');
    if (!r.ok) { U.toast({ full: 'That place is full (4 living things). Pick another biome.', 'not-biome': 'Living things go in a biome (forest, prairie, desert, pond, ocean, beach, or mountain).' }[r.reason] || 'Could not add it.', 'bad'); return; }
    app().commit('Added ' + dx.org[orgId].name);
    if (!D.isDone(save, 'org:' + orgId)) DU.organism(orgId, { tile: tile, biome: r.biome });
    else U.toast(dx.org[orgId].name + ' added. You already identified its adaptations.', 'good');
  };
  DU.wrongBiome = function (orgId, tile) {
    var save = app().save(), o = dx.org[orgId], here = dx.biome[D.habitat(dx, save, tile, artOf(tile.t)).id], better = biomeTiles(save).filter(function (x) { return x.tile !== tile && o.biomes.some(function (b) { return x.ids.indexOf(b) >= 0; }) && (x.tile.o || []).length < 4; });
    var md = U.modal({ title: 'Will it survive here?', wide: true }); md.el.id = 'wrongbiome-modal';
    md.body.innerHTML = '<div class="wb">' + DU.orgIcon(orgId, 96) + '<div><p class="lead">A <b>' + esc(o.name) + '</b> usually lives in: <b>' + esc(biomeNames(o)) + '</b>.<br>Your <b>' + esc(IT.name(save, tile.t)) + '</b> is a <b>' + esc(here.name) + '</b>: ' + esc(here.desc || '') + '</p><p>Think about what it needs: food, water, shelter, and the right temperature. Then choose.</p></div></div>' +
      '<div class="wb-choices"><section><h4>Move it</h4>' + (better.length ? '<select class="mv-to">' + better.map(function (x, k) { return '<option value="' + k + '">' + esc(x.label) + '</option>'; }).join('') + '</select><button class="btn primary move">Move it there</button>' : '<p class="small">You do not have a ' + esc(biomeNames(o)) + ' place yet. Build one, or explain below.</p>') + '</section>' +
      '<section><h4>Keep it here and explain why</h4>' + frameChips(['The ' + o.name.toLowerCase() + ' could survive in the ' + here.name.toLowerCase() + ' because ___.', 'It would find food by ___ and shelter in ___.']) + '<textarea class="why" rows="3" aria-label="Why it can live here"></textarea><div class="write-meta"><span class="wc"></span></div><button class="btn ghost keep">Keep it here</button></section></div><div class="dfb" aria-live="polite"></div>';
    var ta = U.$('.why', md.body); counter(ta, U.$('.wc', md.body), 15); wireFrames(md.body, ta);
    if (U.$('.move', md.body)) U.$('.move', md.body).onclick = function () { var x = better[+U.$('.mv-to', md.body).value]; md.close(); DU.add(orgId, x.tile); };
    U.$('.keep', md.body).onclick = function () {
      var t = ta.value.trim();
      if (D.words(t) < 15 || !/food|eat|water|drink|shelter|hide|home|temperature|hot|cold|warm|cool|survive|prey|sun/i.test(t)) { fb(md.body, false, ['Write at least 15 words and explain a need: food, water, shelter, or temperature.']); return; }
      var r = D.addOrganism(save, dx, tile, artOf(tile.t), orgId, t); if (!r.ok) { fb(md.body, false, ['Could not add it here (' + r.reason + ').']); return; }
      app().commit('Added ' + o.name + ' (with a reason)'); md.close();
      if (!D.isDone(save, 'org:' + orgId)) DU.organism(orgId, { tile: tile, biome: r.biome });
    };
    return md;
  };
  // adaptation task: drag (or tap) the trait cards that really help onto the creature (tricks mixed in), then tap
  // body part / action and born with it / learned. One short explanation only for favorites.
  DU.organism = function (orgId, opts) {
    opts = opts || {}; var o = dx.org[orgId]; if (!o) return null;
    var save = app().save(), key = 'org:' + orgId, prev = D.rec(save, key), tries = 0, revealed = !!(prev && prev.revealed);
    var bid = opts.biome || (prev && prev.biome) || o.biomes[0], biome = dx.biome[bid] || { name: bid };
    var all = o.traits.map(function (t) { return { id: t.id, text: t.text }; }).concat((o.distractors || []).map(function (d) { return { id: d.id, text: d.text }; }));
    all = U.seedShuffle(all, o.id).map(function (k) { return all[k]; });
    var picks = prev ? (prev.picks || []).slice() : [], tags = prev ? JSON.parse(JSON.stringify(prev.tags || {})) : {};
    var md = U.modal({ title: 'Adaptations: ' + o.name, wide: true, sticky: true }); md.el.id = 'adapt-modal'; md.el.classList.add('describe-wrap', 'fg-visual');
    function txt(id) { return (all.filter(function (x) { return x.id === id; })[0] || {}).text || id; }
    function rowHtml(id) {
      var g = tags[id] || {};
      return '<div class="ad-row" data-t="' + id + '"><div class="ad-txt">' + esc(txt(id)) + '</div><div class="ad-tags">' + chips('type-' + id, [{ id: 'structure', label: 'Body part' }, { id: 'behavior', label: 'Action' }], g.type, false) + chips('origin-' + id, [{ id: 'inherited', label: 'Born with it' }, { id: 'learned', label: 'Learned' }], g.origin, false) + '</div></div>';
    }
    function paintRows() {
      U.$('.ad-rows', md.body).innerHTML = picks.length ? picks.map(rowHtml).join('') : '<p class="small">Drag or tap the traits on the right. Each one lands on the ' + esc(o.name.toLowerCase()) + ' and gets a row here.</p>';
      U.$('.cr-on', md.body).innerHTML = picks.map(function (id) { return '<span class="cr-chip">' + esc(txt(id)) + '</span>'; }).join('');
    }
    md.body.innerHTML = '<div class="fg-play"><div class="fg-left"><div class="creature-drop" aria-label="Drop traits on the creature">' + DU.orgIcon(orgId, 150) + '<div class="cr-on"></div><div class="tl-drop-hint">Drop traits here</div></div><p class="small fg-sub">' + esc(o.name) + ' in the ' + esc(biome.name) + '. ' + (o.role ? 'Food web role: ' + esc(o.role) + '.' : '') + ' Eats: ' + esc(nms(o.eats) || '\u2014') + '.</p></div><div class="fg-right">' + revMeta(prev) +
      '<div class="fg-step"><h4><span class="d-n">1</span> Which traits help it survive? <span class="small">Careful: some are tricks.</span></h4><div class="chips trait-toks" data-g="picks" data-multi="1">' + all.map(function (t) { var on = picks.indexOf(t.id) >= 0; return '<button type="button" class="chipbtn trait' + (on ? ' on' : '') + '" data-v="' + t.id + '" aria-pressed="' + on + '">' + esc(t.text) + '</button>'; }).join('') + '</div></div>' +
      '<div class="fg-step"><h4><span class="d-n">2</span> Sort each one <span class="small"><b>Body part</b> = structure. <b>Action</b> = behavior. <b>Born with it</b> = inherited (instinct). <b>Learned</b> = taught or practiced.</span></h4><div class="ad-rows"></div></div>' +
      '<div class="dfb" aria-live="polite"></div></div></div>' +
      favBox(key, prev, 'The ' + o.name.toLowerCase() + ' survives because its...', ['The ' + o.name.toLowerCase() + ' has ___ that helps it ___.', 'This trait is inherited / learned because ___.']) +
      '<div class="dfb2" aria-live="polite"></div><div class="btn-row sticky-foot"><button class="btn ghost later">' + (prev ? 'Cancel' : 'Later') + '</button><button class="btn ghost dreveal" hidden>Show me</button><button class="btn primary dsave">Check and save</button></div>';
    paintRows(); wireFav(md.body);
    U.$('.fg-sub', md.body).prepend(U.speakBtn(o.name + '. Which traits help it survive in the ' + biome.name + '? Then sort each one: body part or action, born with it or learned.'));
    function togglePick(v, b) { var k = picks.indexOf(v); if (k >= 0) picks.splice(k, 1); else picks.push(v); b.classList.toggle('on', k < 0); b.setAttribute('aria-pressed', String(k < 0)); paintRows(); sfx(k < 0 ? 'pop' : 'tap'); }
    md.body.addEventListener('click', function (e) {
      var b = e.target.closest('.chipbtn'); if (!b) return; var g = b.closest('.chips'), name = g.getAttribute('data-g'), v = b.getAttribute('data-v');
      if (name === 'picks') { togglePick(v, b); return; }
      var m = /^(type|origin)-(.+)$/.exec(name); if (!m) return; tags[m[2]] = tags[m[2]] || {}; tags[m[2]][m[1]] = v; sfx('tap');
      U.$$('.chipbtn', g).forEach(function (x) { var on = x === b; x.classList.toggle('on', on); x.setAttribute('aria-pressed', String(on)); });
    });
    dragTokens(md.body, '.trait-toks .chipbtn', '.creature-drop', function (tok) { if (!tok.classList.contains('on')) togglePick(tok.getAttribute('data-v'), tok); });
    U.$('.later', md.body).onclick = function () { md.close(); };
    U.$('.dreveal', md.body).onclick = function () {
      revealed = true; picks = o.traits.map(function (t) { return t.id; });
      o.traits.forEach(function (t) { tags[t.id] = { type: t.type, origin: t.origin === 'learned' ? 'learned' : 'inherited' }; });
      U.$$('.chips[data-g="picks"] .chipbtn', md.body).forEach(function (b) { var on = picks.indexOf(b.getAttribute('data-v')) >= 0; b.classList.toggle('on', on); b.classList.remove('wrong'); b.setAttribute('aria-pressed', String(on)); });
      paintRows(); fb(md.body, true, [], 'Here are the real adaptations. Save when you are ready.');
    };
    U.$('.dsave', md.body).onclick = function () {
      var ans = { picks: picks.slice(), tags: tags, explain: {} }, r = D.checkOrganism(o, ans, { noExplain: true }); tries++;
      if (!r.ok) {
        fb(md.body, false, r.msgs); sfx('soft'); if (RV(tries, md.body)) U.$('.dreveal', md.body).hidden = false;
        U.$$('.chips[data-g="picks"] .chipbtn', md.body).forEach(function (b) { b.classList.toggle('wrong', r.wrongPicks.indexOf(b.getAttribute('data-v')) >= 0); });
        U.$$('.ad-row', md.body).forEach(function (row) { var id = row.getAttribute('data-t'); row.classList.toggle('wrong', r.wrongType.indexOf(id) >= 0 || r.wrongOrigin.indexOf(id) >= 0 || r.wrongPicks.indexOf(id) >= 0); });
        return;
      }
      var t = favText(md.body, 'org', o); if (!t.ok) { showNeeds(md.body, t); return; }
      var tg = {}; o.traits.forEach(function (x) { tg[x.id] = tags[x.id]; });
      var keepEx = prev && prev.explain ? prev.explain : {};
      applyFav(save, key, favOn(md.body));
      finish(save, key, { k: 'org', picks: o.traits.map(function (x) { return x.id; }), tags: tg, explain: keepEx, text: t.text.slice(0, 600), biome: bid, ok: true, mode: t.text ? 'written' : 'picks', tries: (prev ? prev.tries || 0 : 0) + tries, revealed: revealed, xp: XP.org + (t.text ? 15 : 0) }, md, o.name + ' adaptations saved to your Field Guide.');
    };
    return md;
  };

  // ---------- GT compare two organisms ----------
  DU.compare = function (cmpId) {
    var save = app().save(), list = dx.data.gtCompare || [], c = dx.cmp[cmpId] || null;
    var md = U.modal({ title: 'GT Challenge: Compare', wide: true, sticky: true }); md.el.id = 'compare-modal'; md.el.classList.add('describe-wrap');
    function sideName(x, n) { var d = D.side(dx, x['k' + n] || 'org', x[n]); return d ? d.name : x[n]; }
    function col(kind, id) {
      if (kind === 'lf' || kind === 'ft') {
        var d = D.side(dx, kind, id), rr = D.rec(save, kind + ':' + id); if (!d) return '<div class="cmp-col"></div>';
        var facts = kind === 'lf' ? ['<b>Process:</b> ' + esc(d.process.join(', ')), '<b>Agent:</b> ' + esc(d.agent.join(', ')), '<b>Time scale:</b> ' + esc(d.timescale)] : (d.checks || []).map(function (q) { return '<b>' + esc(q.label) + '</b> ' + esc(q.options[q.answer] || ''); });
        return '<div class="cmp-col">' + A.thumb(kind === 'lf' ? d.art : artOfFeature(d), 80, 3) + '<h4>' + esc(d.name) + '</h4><ul>' + facts.map(function (f) { return '<li>' + f + '</li>'; }).join('') + '</ul>' + (rr && rr.text ? '<p class="small">Your description: ' + esc(rr.text) + '</p>' : '<p class="small">Tip: describe it in your Field Guide first.</p>') + '</div>';
      }
      var o = dx.org[id], r = D.rec(save, 'org:' + id); if (!o) return '<div class="cmp-col"></div>';
      return '<div class="cmp-col">' + DU.orgIcon(id, 80) + '<h4>' + esc(o.name) + '</h4><p class="small">Lives in: ' + esc(biomeNames(o)) + '</p><ul>' + o.traits.map(function (t) { return '<li><b>' + esc(t.text) + '</b> <span class="tag">' + t.type + ' \u00b7 ' + (t.origin === 'learned' ? 'learned' : 'inherited') + '</span>' + (r && r.explain && r.explain[t.id] ? '<br><small>Your note: ' + esc(r.explain[t.id]) + '</small>' : '') + '</li>'; }).join('') + '</ul></div>';
    }
    function paint() {
      var prev = c ? D.rec(save, 'cmp:' + c.id) : null;
      var orgPair = c && (c.ka || 'org') === 'org' && (c.kb || 'org') === 'org';
      md.body.innerHTML = '<p class="lead">Pick a pair. Tell how they are alike and how they are different, using science words.</p><label class="field">Pair <select class="cmp-pair">' + list.map(function (x) { var done = D.isDone(save, 'cmp:' + x.id); return '<option value="' + x.id + '"' + (c && c.id === x.id ? ' selected' : '') + '>' + esc(sideName(x, 'a') + ' vs. ' + sideName(x, 'b')) + (done ? ' \u2713' : '') + '</option>'; }).join('') + '</select></label>' +
        (c ? '<div class="cmp">' + col(c.ka || 'org', c.a) + col(c.kb || 'org', c.b) + '</div><p class="q-lab"><b>' + esc(c.prompt) + '</b></p>' + frameChips(orgPair ? ['Both the ___ and the ___ have ___ that help them ___.', 'But the ___ has ___, while the ___ has ___.', 'This is because their environments are ___.'] : ['Both the ___ and the ___ ___.', 'But the ___ ___, while the ___ ___.', 'This matters because ___.']) +
          '<textarea class="ctext" rows="5" aria-label="Your comparison">' + esc(prev ? prev.text : '') + '</textarea><div class="write-meta"><span class="wc"></span></div><div class="dfb" aria-live="polite"></div><div class="btn-row"><button class="btn ghost later">Close</button><button class="btn primary csave">Save comparison</button></div>' : '');
      var sel = U.$('.cmp-pair', md.body); sel.onchange = function () { c = dx.cmp[sel.value]; paint(); };
      if (!c) return;
      var ta = U.$('.ctext', md.body); counter(ta, U.$('.wc', md.body), 25); wireFrames(md.body, ta);
      U.$('.later', md.body).onclick = function () { md.close(); };
      U.$('.csave', md.body).onclick = function () { var r = D.checkCompare(c, dx, ta.value); if (!r.ok) { fb(md.body, false, r.missing); return; } finish(save, 'cmp:' + c.id, { k: 'cmp', a: c.a, b: c.b, text: ta.value.trim().slice(0, 3000), ok: true, xp: XP.cmp }, md, 'Comparison saved.'); };
    }
    if (!c && list.length) c = list[0];
    paint(); return md;
  };

  // ---------- the Field Guide panel ----------
  DU.guide = function () {
    var save = app().save(), md = U.modal({ title: 'My Field Guide', full: true }); md.el.id = 'guide-modal';
    function paint() {
      var todo = DU.todo(save), rows = D.rows(save, dx), cnt = DU.counts(save);
      function sect(title, filter) { var rs = rows.filter(filter); return '<h4 class="strand">' + esc(title) + ' (' + rs.length + ')</h4>' + (rs.length ? '<div class="g-rows">' + rs.map(function (r) { var canStar = /^(lf|ft|org):/.test(r.key) && r.ok; return '<div class="g-row">' + (canStar ? '<button class="star-btn' + (r.fav ? ' on' : '') + '" data-star="' + esc(r.key) + '" aria-pressed="' + r.fav + '" title="' + (r.fav ? 'Favorite' : 'Make it a favorite') + '" aria-label="Favorite: ' + esc(r.name) + '">' + A.icon('star', 22) + '</button>' : '') + '<div><b>' + esc(r.name) + '</b> ' + (r.ok ? '<span class="ok-tag">' + A.icon('check', 12) + ' done</span>' : '') + (r.ok && canStar ? ' <span class="ev-kind ' + r.evidence + '">' + (r.evidence === 'written' ? 'Written' : 'Picks') + '</span>' : '') + (r.rev > 1 ? ' <span class="small">v' + r.rev + '</span>' : '') + '<br><small>' + esc(r.picks || '') + '</small>' + (r.text ? '<p class="g-text">' + esc(r.text) + '</p>' : '') + (r.gt ? '<p class="g-text gt">GT: ' + esc(r.gt) + '</p>' : '') + '</div>' + (r.kind !== 'why' ? '<button class="btn small ghost edit" data-k="' + esc(r.key) + '">Edit</button>' : '') + '</div>'; }).join('') + '</div>' : '<p class="small">Nothing yet.</p>'); }
      var fu = window.DAW_FUNC, fs = fu ? fu.favStatus(save, app().ix(), curStage()) : null;
      md.body.innerHTML = '<div class="g-top"><div class="ring" style="--p:' + (cnt.total ? Math.round(100 * cnt.done / cnt.total) : 0) + '"><b>' + cnt.done + '/' + cnt.total + '</b></div><div><p class="lead">Tap the science for everything you place. A <b>\u270e</b> on the map means it still needs its picks.</p>' + (fs ? '<p class="fav-status' + (fs.met ? ' met' : '') + '">' + A.icon('star', 16) + ' <b>Stage ' + fs.stage + ' favorites: ' + fs.written + ' of ' + fs.need + ' written.</b> Star ' + fs.per + ' favorites each stage and write one short explanation for each. They star in your Showcase.</p>' : '') + '<div class="btn-row fg-start"><button class="btn primary lib">Organism Library</button><button class="btn ghost binder">Card Binder</button><button class="btn ghost season">Survival Season</button><button class="btn ghost cmp">GT: Compare</button></div></div></div>' +
        '<h4 class="strand">Needs a description (' + todo.length + ')</h4>' + (todo.length ? '<div class="g-todo">' + todo.map(function (t) { var c = M.tileCoord(t.tile); return '<button class="g-item todo-item" data-k="' + esc(t.key) + '" data-u="' + t.tile.u + '">' + (t.kind === 'org' ? DU.orgIcon(t.id, 36) : A.thumb(artOf(t.tile.t), 40, 3)) + '<span><b>' + esc(t.name) + '</b><small>(' + c.x + ', ' + c.y + ')</small></span><span class="pen">\u270e Describe</span></button>'; }).join('') + '</div>' : '<p class="small">' + A.icon('check', 14) + ' All caught up!</p>') +
        sect('Landforms', function (r) { return r.kind === 'lf'; }) + sect('Living things', function (r) { return r.kind === 'org' || r.kind === 'why'; }) + sect('Resources, water, weather & energy', function (r) { return r.kind === 'ft'; }) + sect('GT comparisons', function (r) { return r.kind === 'cmp'; });
      U.$('.lib', md.body).onclick = function () { md.close(); DU.library(); };
      U.$('.cmp', md.body).onclick = function () { md.close(); DU.compare(); };
      U.$('.binder', md.body).onclick = function () { md.close(); window.DAW_FUNUI.binder(); };
      U.$('.season', md.body).onclick = function () { md.close(); window.DAW_FUNUI.season(); };
      U.$$('[data-star]', md.body).forEach(function (b) { b.onclick = function () { var k = b.getAttribute('data-star'); if (fu && fu.isFav(save, k)) { fu.unstar(save, k); app().commit(null, { quiet: true, noRender: true }); paint(); return; } md.close(); DU.openKey(k, null, { star: true }); }; });
      U.$$('[data-k]:not([data-star])', md.body).forEach(function (b) { b.onclick = function () { md.close(); DU.openKey(b.getAttribute('data-k'), +b.getAttribute('data-u') || null); }; });
    }
    paint(); return md;
  };
  DU.openKey = function (key, uid, o2) {
    var k = key.slice(0, key.indexOf(':')), id = key.slice(key.indexOf(':') + 1), save = app().save(), md = null;
    var tile = uid ? save.world.tiles.filter(function (t) { return t.u === uid; })[0] : null;
    if (k === 'lf') md = DU.landform(id); else if (k === 'ft') md = DU.feature(id); else if (k === 'cmp') return DU.compare(id);
    else if (k === 'org') md = DU.organism(id, { tile: tile, biome: tile ? D.habitat(dx, app().save(), tile, artOf(tile.t)).id : null });
    if (md && o2 && o2.star) { var b = U.$('.fav-toggle', md.body); if (b && !b.classList.contains('on')) b.click(); }
    return md;
  };
  DU.init();
})();
