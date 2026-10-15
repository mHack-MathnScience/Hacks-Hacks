/* Design a World: World Needs board, story event cards, upkeep consequences, and history events (choices,
   artifacts, Then & Now). Content: School Bot's mission triggers and history_events.json; defaults for upkeep. */
(function () {
  'use strict';
  var U = window.DAW_UI, S = window.DAW_STATE, A = window.DAW_ART, IT = window.DAW_ITEMS, WC = window.DAW_WORLDC, esc = U.esc;
  var WU = window.DAW_WORLDUI = {};
  var Q = new URLSearchParams(location.search), HIST_OFF = Q.get('history') === 'off'; try { if (localStorage.getItem('daw.teacher.historyOff') === '1') HIST_OFF = true; } catch (e) {}
  function app() { return window.DAW_APP; }
  function D() { return window.DAW_DESC; }
  function dx() { return D() && D().shared(); }
  function opts() { return { unlockAll: app().unlockAll(), history: HIST_OFF ? false : undefined }; }
  WC.install(S, window.DAW_WORLD_DATA, {
    artOf: function (id) { return IT.get(id).art; },
    kindOf: function (art) { var x = dx(); if (!x) return null; var th = D().thing(x, art); if (th) return th.kind; return D().biomeOf(x, art) ? 'biome' : null; },
    orgs: function (save) { var x = dx(), o = { animals: 0, plants: 0, all: 0 }; save.world.tiles.forEach(function (t) { (t.o || []).forEach(function (id) { var g = x && x.org[id]; o.all++; if (g && g.kind === 'animal') o.animals++; else if (g && g.kind === 'plant') o.plants++; }); }); return o; }
  });
  WU.historyOn = function (save) { return WC.historyOn(save, opts()); };
  var TYPE = { need: 'Need', event: 'Event', choice: 'Choice', story: 'Story' };
  var FXTXT = { dry: 'Drying out', dark: 'Dark at night', fewer: 'Animals leaving' };

  // ---------- sync after every change: new event cards ----------
  WU.sync = function () { var save = app().save(), ix = app().ix(); return WC.sync(save, ix, opts()); };
  function stateOf(m) { return S.missionState(app().save(), app().ix(), m, opts()); }
  function actBtn(m) {
    var st = stateOf(m), L = { ready: 'Place it', placed: 'Start mission', needs: 'What it needs', build: 'Build it', waiting: 'Built', locked: 'Locked', done: 'Done', review: 'Review' };
    return '<button class="btn small ' + (st === 'placed' || st === 'ready' ? 'primary' : 'ghost') + ' need-go" data-m="' + esc(m.id) + '">' + L[st] + '</button>';
  }
  function needCard(m, compact) {
    var w = WC.mission(m.id) || {}, tr = w.trigger || m.trigger || {}, fr = S.freedomOf(m);
    return '<li class="need-card t-' + esc(tr.type || 'need') + '" data-m="' + esc(m.id) + '"><span class="nc-ic">' + A.thumb(IT.get(m.unlockItem).art, compact ? 34 : 46, 3) + '</span><span class="nc-t"><span class="nc-tags"><span class="tag ttype">' + esc(TYPE[tr.type] || 'Need') + '</span><span class="tag fr-' + fr + '" title="' + (fr === 'open' ? 'Build it anywhere, any time' : 'Guided: needs the places listed first') + '">' + (fr === 'open' ? 'Open' : 'Guided') + '</span><span class="tag st">Stage ' + m.stage + '</span></span><b>' + esc(m.title) + '</b>' + (compact ? '' : '<small>' + esc(tr.narrative || m.prompt || '') + '</small>') + '</span>' + actBtn(m) + '</li>';
  }
  WU.go = function (mid) {
    var m = app().ix().byId[mid]; if (!m) return; var st = stateOf(m);
    if (st === 'build') { app().select(m.unlockItem); U.toast('Tap an open spot to build ' + IT.name(app().save(), m.unlockItem) + '. Its mission starts when your world needs it.'); return; }
    app().goMission(m);
  };
  function FUI() { return window.DAW_FUNUI; }
  function eventCard(e) {
    var ic = { need: 'flag', story: 'star', upkeep: 'flag', fixed: 'check', history: 'star', world: 'flag' }[e.kind] || 'star';
    var live = e.kind === 'world' && FUI() && FUI().eventActive(e.ev);
    var act = e.kind === 'world' ? (live ? '<button class="btn small primary ev-world">Help out</button>' : '') : e.kind === 'need' ? '<button class="btn small primary ev-act" data-m="' + esc(e.mission) + '">Answer the need</button>' : e.kind === 'history' ? '<button class="btn small primary ev-hist" data-h="' + esc(e.arc) + '">Open the history event</button>' : e.kind === 'upkeep' ? '<button class="btn small primary ev-board">How to fix it</button>' : '';
    return '<div class="event-card k-' + esc(e.kind) + (e.effect ? ' fx-' + esc(e.effect) : '') + '" role="status" data-ev="' + esc(e.id) + '"><div class="ec-head">' + A.icon(ic, 18) + ' <span class="ec-kind">' + esc({ need: 'Your world needs something', story: 'Story event', upkeep: 'Uh oh!', fixed: 'Fixed!', history: 'History event', world: 'Nature surprise' }[e.kind] || 'Event') + '</span></div><h4>' + esc(e.title) + '</h4>' + (FUI() ? FUI().npcSay(e) : '') + '<p>' + esc(e.text) + '</p><div class="btn-row">' + act + '<button class="btn small ghost ev-ok">Got it</button></div></div>';
  }
  // ---------- right panel: event card + top needs ----------
  WU.inline = function (host) {
    var save = app().save(), ix = app().ix(), un = WC.unacked(save), act = WC.activeNeeds(save, ix, opts()), bl = WC.upkeep(save, ix).filter(function (u) { return !u.met; });
    var o = '';
    // consequences ("Uh oh!" / "Fixed!") are shown first so students see why something changed on the map
    var urgent = un.filter(function (e) { return e.kind === 'upkeep' || e.kind === 'fixed' || e.kind === 'world'; }), shown = urgent.length ? urgent[urgent.length - 1] : un[un.length - 1];
    if (un.length) o += eventCard(shown) + (un.length > 1 ? '<p class="small ev-more">' + (un.length - 1) + ' more event' + (un.length > 2 ? 's' : '') + ' on the <a href="#needs" class="open-board">World Needs board</a>.</p>' : '');
    o += '<div class="needs-inline"><div class="ni-head"><b>' + A.icon('flag', 15) + ' World needs now</b><button class="btn small ghost open-board">All needs</button></div>';
    if (bl.length) o += '<ul class="upkeep-mini">' + bl.map(function (u) { return '<li class="fx-' + esc((u.need.effect || {}).kind) + '"><b>' + esc(u.need.title) + '</b> <small>' + esc(u.need.fixHint || '') + '</small></li>'; }).join('') + '</ul>';
    o += act.length ? '<ul class="need-list compact">' + act.slice(0, 3).map(function (m) { return needCard(m, true); }).join('') + '</ul>' + (act.length > 3 ? '<p class="small">+' + (act.length - 3) + ' more on the board</p>' : '') : (bl.length ? '' : '<p class="small">Nothing urgent. Build freely or explore!</p>');
    o += '</div>';
    host.innerHTML = o;
    var cnt = U.$('#needs-btn .n'); if (cnt) { var n = act.length + bl.length; cnt.textContent = n || ''; cnt.hidden = !n; }
  };
  function bindCards(root, after) {
    root.addEventListener('click', function (e) {
      var save = app().save(), t = e.target, card = t.closest('.event-card');
      if (t.closest('.ev-world')) { WC.ack(save, card.getAttribute('data-ev')); app().commit(null, { quiet: true }); if (after) after(); FUI().respond(); return; }
      if (t.closest('.ev-ok')) { WC.ack(save, card.getAttribute('data-ev')); app().commit(null, { quiet: true }); return; }
      if (t.closest('.ev-act')) { WC.ack(save, card.getAttribute('data-ev')); app().commit(null, { quiet: true }); if (after) after(); WU.go(t.closest('.ev-act').getAttribute('data-m')); return; }
      if (t.closest('.ev-hist')) { WC.ack(save, card.getAttribute('data-ev')); app().commit(null, { quiet: true }); if (after) after(); WU.history(t.closest('.ev-hist').getAttribute('data-h')); return; }
      if (t.closest('.ev-board') || t.closest('.open-board')) { e.preventDefault(); if (card) { WC.ack(save, card.getAttribute('data-ev')); app().commit(null, { quiet: true }); } WU.board(); return; }
      var g = t.closest('.need-go'); if (g) { if (after) after(); WU.go(g.getAttribute('data-m')); return; }
      var h = t.closest('.arc-go'); if (h) { if (after) after(); WU.history(h.getAttribute('data-h')); }
    });
  }
  WU.bindInline = function (host) { bindCards(host); };
  function meterBars(save) {
    var m = WC.meters(save); return '<div class="meters">' + WC.METERS.map(function (k) { var v = m[k], pct = Math.max(0, Math.min(100, 50 + v * 6)); return '<div class="meter m-' + k + '"><span>' + k.charAt(0).toUpperCase() + k.slice(1) + '</span><span class="mbar"><i style="width:' + pct + '%"></i></span><b>' + (v > 0 ? '+' : '') + v + '</b></div>'; }).join('') + '</div>';
  }
  WU.meterBars = meterBars;
  // ---------- the World Needs board ----------
  WU.board = function () {
    var save = app().save(), ix = app().ix(), md = U.modal({ title: 'World Needs', wide: true }); md.el.id = 'needs-modal';
    function paint() {
      var act = WC.activeNeeds(save, ix, opts()), up = WC.upkeep(save, ix).filter(function (u) { return u.applies; }), cur = S.currentStage(save, ix, opts()), nxt = ix.stageIds[ix.stageIds.indexOf(cur) + 1];
      var gate = S.stageComplete(save, ix, cur) && nxt && !S.stageUnlocked(save, ix, nxt, opts()) ? WC.blockers(save, ix, cur).map(function (u) { return { title: u.need.title, hint: u.need.fixHint || '' }; }).concat(FUI() ? FUI().favGateItems(cur) : []) : [];
      var arcs = WC.historyOn(save, opts()) ? WC.arcs() : [], hs = save.history.arcs;
      var o = '<p class="lead">Your world asks for what it needs right now. Answer any need in any order. Build open places anywhere, any time.</p>';
      if (gate.length) o += '<div class="gate-box">' + A.icon('lock', 16) + ' <b>Stage ' + nxt + ' opens when these are done:</b><ul>' + gate.map(function (u) { return '<li>' + esc(u.title) + ': ' + esc(u.hint) + '</li>'; }).join('') + '</ul></div>';
      o += '<section class="nb-sec"><h3>Needs right now (' + act.length + ')</h3>' + (act.length ? '<ul class="need-list">' + act.map(function (m) { return needCard(m, false); }).join('') + '</ul>' : '<p>No needs right now. Your world is happy!</p>') + '</section>';
      if (FUI()) o += FUI().boardEvent();
      o += '<section class="nb-sec"><h3>Keeping your world healthy</h3>' + (up.length ? '<ul class="upkeep-list">' + up.map(function (u) { var e = u.need.effect || {}; return '<li class="up ' + (u.met ? 'met' : 'unmet') + ' fx-' + esc(e.kind || '') + '" data-need="' + esc(u.id) + '"><span class="up-st">' + (u.met ? A.icon('check', 16) + ' OK' : '\u26a0 ' + esc(FXTXT[e.kind] || 'Needs help')) + '</span><b>' + esc(u.need.title) + '</b><small>' + esc(u.met ? (u.need.fixedText || 'Taken care of.') : u.need.text) + '</small>' + (u.met ? '' : '<small class="fix">How to fix: ' + esc(u.need.fixHint || '') + '</small>') + '</li>'; }).join('') + '</ul>' : '<p class="small">As your world grows, it will need water, food, and energy.</p>') + '</section>';
      if (arcs.length) o += '<section class="nb-sec"><h3>History events</h3>' + meterBars(save) + '<ul class="arc-list">' + arcs.map(function (arc) { var st = hs[arc.id], av = WC.arcAvailable(save, ix, arc, opts()); return '<li class="arc ' + (st && st.done ? 'done' : av ? 'open' : 'later') + '"><b>' + esc(arc.title) + '</b><small>Stage ' + arc.stage + ' \u00b7 ' + esc((arc.teks || []).slice(0, 4).join(' ')) + (arc.teks && arc.teks.length > 4 ? ' \u2026' : '') + '</small>' + (st && st.done ? '<span class="tag done">' + A.icon('check', 12) + ' Done</span><button class="btn small ghost arc-go" data-h="' + esc(arc.id) + '">Then & Now</button>' : av ? '<button class="btn small primary arc-go" data-h="' + esc(arc.id) + '">' + (st ? 'Continue' : 'Open') + '</button>' : '<span class="tag">Later</span>') + '</li>'; }).join('') + '</ul></section>';
      var log = save.needs.events.slice(-12).reverse();
      o += '<section class="nb-sec"><h3>Story log</h3>' + (log.length ? '<ol class="ev-log">' + log.map(function (e) { return '<li class="k-' + esc(e.kind) + '"><b>' + esc(e.title) + '</b> <small>' + esc(e.text) + '</small></li>'; }).join('') + '</ol>' : '<p class="small">Events will appear here as your world changes.</p>') + '</section>';
      md.body.innerHTML = o;
    }
    bindCards(md.body, function () { md.close(); });
    md.body.addEventListener('click', function (e) { if (e.target.closest('.ev-respond')) { md.close(); FUI().respond(); } });
    paint(); return md;
  };

  // ---------- history events ----------
  function placeMark(arc) {
    var save = app().save(), ix = app().ix(), b = S.bounds(S.stageSize(ix, S.highestUnlocked(save, ix, opts()))), near = null;
    (arc.uses || []).some(function (u) { var t = save.world.tiles.filter(function (x) { return x.t === u; })[0]; if (t) near = t; return !!t; });
    var c = near ? [near.i, near.j] : [Math.round((b.min + b.max) / 2), Math.round((b.min + b.max) / 2)], best = null, bd = 1e9, used = {};
    save.history.marks.forEach(function (mk) { used[Math.floor(mk.i) + ',' + Math.floor(mk.j)] = 1; });
    for (var i = b.min; i <= b.max; i++) for (var j = b.min; j <= b.max; j++) { if (S.tileAt(save, i, j) || used[i + ',' + j]) continue; var d = Math.abs(i - c[0]) + Math.abs(j - c[1]); if (d < bd) { bd = d; best = { i: i, j: j }; } }
    if (!best) save.world.tiles.some(function (t) { if (!used[t.i + ',' + t.j]) { best = { i: t.i, j: t.j }; return true; } return false; });
    return best;
  }
  function chips(cons) { return '<span class="cons">' + WC.METERS.map(function (k) { var v = +((cons || {})[k]) || 0; return v ? '<span class="cchip ' + (v > 0 ? 'up' : 'down') + '">' + k + ' ' + (v > 0 ? '+' : '') + v + '</span>' : ''; }).join('') + '</span>'; }
  WU.history = function (hid, o2) {
    var save = app().save(), ix = app().ix(), arc = WC.arc(hid); if (!arc) return;
    if (!WC.historyOn(save, opts()) && !(o2 && o2.preview)) { U.toast('History events are turned off in Settings.'); return; }
    var md = U.modal({ titleHtml: A.icon('star', 18) + ' ' + esc(arc.title), wide: true, sticky: true }); md.el.id = 'history-modal';
    var st = WC.start(save, hid), body = md.body;
    function head() { return '<div class="m-meta"><span class="pill subj">Social Studies</span>' + (arc.teks || []).map(function (t) { return '<span class="teks-chip content">' + esc(t) + '</span>'; }).join('') + '</div>'; }
    function beat() {
      var beats = arc.beats || [];
      if (st.done || st.beat >= beats.length) return thenNow();
      var b = beats[st.beat], safe = WC.safeChoices(b), chosen = st.choices[st.beat];
      body.innerHTML = head() + (st.beat === 0 && arc.trigger && arc.trigger.narrative ? '<p class="lead">' + esc(arc.trigger.narrative) + '</p>' : '') + (beats.length > 1 ? '<div class="part-of"><b>Part ' + (st.beat + 1) + ' of ' + beats.length + '</b></div>' : '') +
        '<div class="h-situation"><p><b>' + esc(b.situation || '') + '</b></p></div>' +
        (b.perspectives && b.perspectives.length ? '<div class="persp"><h4>Listen to different perspectives</h4>' + b.perspectives.map(function (p) { return '<div class="pcard"><b>' + esc(p.who) + '</b><span>\u201c' + esc(p.view) + '\u201d</span></div>'; }).join('') + '</div>' : '') +
        '<h4>What will your world do?</h4><div class="h-choices">' + safe.map(function (x) { return '<button class="option h-choice' + (chosen === x.k ? ' picked' : '') + '" data-k="' + x.k + '"><span class="box"></span><span>' + esc(x.c.text) + '</span></button>'; }).join('') + '</div><div class="h-out" aria-live="polite"></div>';
      U.$('.h-situation', body).prepend(U.speakBtn(window.DAW_NARR.history(b)));
      U.$$('.h-choice', body).forEach(function (btn) { btn.onclick = function () { choose(+btn.getAttribute('data-k')); }; });
      if (chosen != null) outcome(b.choices[chosen], b);
    }
    function choose(k) {
      var r = WC.choose(save, hid, k, { place: function () { return placeMark(arc); } });
      if (!r.ok) { U.toast(r.reason === 'unsafe' ? 'That option is not available.' : 'Could not choose that.', 'bad'); return; }
      app().commit('History choice', { quiet: true });
      U.$$('.h-choice', body).forEach(function (b) { b.classList.toggle('picked', +b.getAttribute('data-k') === k); });
      outcome(r.choice, arc.beats[st.beat]);
    }
    function outcome(c, b) {
      var out = U.$('.h-out', body), art = b.artifact, key = WC.artifactKey(hid, st.beat), prev = save.writing[key];
      out.innerHTML = '<div class="fb good h-result"><p>' + esc(c.feedback || '') + '</p>' + chips(c.consequences) + (c.mapEffect ? '<p class="map-fx">' + A.icon('flag', 14) + ' <b>On your map:</b> ' + esc(c.mapEffect) + '</p>' : '') + meterBars(save) + '</div>' +
        (art ? '<div class="artifact" data-key="' + esc(key) + '"><h4>' + A.icon('star', 16) + ' Write your ' + esc(art.genre) + '</h4><p>' + esc(art.prompt || '') + '</p><div class="w-frames">' + (art.frames || []).map(function (f) { return '<button class="ins frame" data-t="' + esc(f) + '">' + esc(f) + '</button>'; }).join('') + '</div>' +
          '<textarea class="art-text" rows="6" placeholder="Use the sentence frames to start.">' + esc(prev ? prev.text : '') + '</textarea><div class="w-kw"><b>Key words:</b> ' + (art.keywordChecklist || []).map(function (k) { return '<span class="kw" data-kw="' + esc(k.toLowerCase()) + '">' + esc(k) + '</span>'; }).join(' ') + '</div><div class="write-meta"><span class="wc">0 words</span> <span class="small">Saved in your Writing workspace (History writing) so you can revise it later.</span></div><div class="art-fb"></div></div>' : '') +
        '<div class="btn-row">' + (art ? '<button class="btn ghost later">Write it later</button>' : '') + '<button class="btn primary next">' + (st.beat + 1 < (arc.beats || []).length ? 'Next part \u2192' : 'Then & Now \u2192') + '</button></div>';
      if (art) {
        var ta = U.$('.art-text', out), timer = null;
        var upd = function () { var low = ta.value.toLowerCase(); U.$('.wc', out).textContent = U.words(ta.value) + ' words'; U.$$('.kw', out).forEach(function (k) { k.classList.toggle('used', low.indexOf(k.getAttribute('data-kw')) >= 0); }); };
        var keep = function () { S.saveWriting(save, key, { title: arc.title.split(':')[0] + ': ' + art.genre.charAt(0).toUpperCase() + art.genre.slice(1), genre: art.genre, mission: hid, prompt: art.prompt || '', text: ta.value, checks: [] }); app().commit(null, { quiet: true, noRender: true }); };
        ta.addEventListener('input', function () { upd(); clearTimeout(timer); timer = setTimeout(keep, 400); }); upd();
        U.$$('.frame', out).forEach(function (f) { f.onclick = function () { ta.value = (ta.value ? ta.value.replace(/\s*$/, ' ') : '') + f.getAttribute('data-t') + ' '; ta.focus(); ta.dispatchEvent(new Event('input')); }; });
        U.$('.later', out).onclick = function () { if (ta.value.trim()) keep(); next(); };
        U.$('.next', out).onclick = function () { if (U.words(ta.value) < 20) { U.$('.art-fb', out).innerHTML = '<div class="fb bad">Write at least 20 words (use the frames), or choose <b>Write it later</b>.</div>'; return; } clearTimeout(timer); keep(); next(); };
      } else U.$('.next', out).onclick = next;
    }
    function next() { WC.nextBeat(save, hid); app().commit(null, { quiet: true }); beat(); }
    function thenNow() {
      var tn = arc.thenAndNow || {}, qs = tn.compareQuestions || [];
      var mine = (arc.beats || []).map(function (b, bi) { var c = b.choices && b.choices[st.choices[bi]]; return c ? '<li><b>' + esc(c.text) + '</b>' + (c.mapEffect ? '<small>' + esc(c.mapEffect) + '</small>' : '') + '</li>' : ''; }).join('');
      body.innerHTML = head() + '<h3 class="tn-title">Then & Now</h3><div class="then-now"><section class="then"><h4>Then: real history</h4>' + (tn.what ? '<p><b>What:</b> ' + esc(tn.what) + '</p>' : '') + (tn.when ? '<p><b>When:</b> ' + esc(tn.when) + '</p>' : '') + (tn.who && tn.who.length ? '<p><b>Who:</b></p><ul>' + tn.who.map(function (w) { return '<li>' + esc(w) + '</li>'; }).join('') + '</ul>' : '') + (tn.outcome ? '<p><b>What happened:</b> ' + esc(tn.outcome) + '</p>' : '') +
        (tn.sources && tn.sources.length ? '<div class="sources"><h5>Sources</h5>' + tn.sources.map(function (s) { return '<blockquote class="src ' + esc(s.type || '') + '">' + (s.type === 'quote' ? '\u201c' + esc(s.excerpt) + '\u201d' : esc(s.excerpt)) + '<cite>' + (s.type === 'paraphrase' && !/^\s*paraphras/i.test(s.citation || '') ? 'Paraphrase. ' : '') + esc(s.citation || '') + '</cite></blockquote>'; }).join('') + '</div>' : '') + '</section>' +
        '<section class="now"><h4>Now: your world</h4>' + (mine ? '<ul class="my-choices">' + mine + '</ul>' : '<p>' + esc((arc.trigger && arc.trigger.narrative) || '') + '</p>') + meterBars(save) + '</section></div>' +
        (qs.length ? '<div class="tn-qs"><h4>Compare then and now</h4>' + qs.map(function (q, qi) { return qHtml(q, qi); }).join('') + '</div>' : '') + '<div class="tn-fb" aria-live="polite"></div><div class="btn-row">' + (st.done ? '<button class="btn primary close-h">Close</button>' : '<button class="btn primary check-tn">' + (qs.length ? 'Check my answers' : 'Finish') + '</button>') + '</div>';
      if (st.done && st.tn) restore(qs);
      if (U.$('.close-h', body)) U.$('.close-h', body).onclick = md.close;
      var tries = 0;
      if (U.$('.check-tn', body)) U.$('.check-tn', body).onclick = function () {
        var ans = {}, okAll = true; tries++;
        qs.forEach(function (q, qi) { var a = readQ(q, qi); ans[qi] = a; var ok = WC.checkCompare(q, a), el = U.$('.tnq[data-q="' + qi + '"]', body); el.classList.toggle('right', ok); el.classList.toggle('wrong', !ok); if (!ok) okAll = false; if (!ok && tries >= 2 && q.explanation) U.$('.tn-ex', el).hidden = false; });
        st.tn = ans;
        if (okAll || tries >= 2) {
          WC.finish(save, hid); app().commit('History event finished: ' + arc.title);
          U.$('.tn-fb', body).innerHTML = '<div class="fb good">' + A.icon('check', 18) + ' <b>' + (okAll ? 'All correct!' : 'Read the explanations, then keep going.') + '</b> This history event is finished. Your writing is in the Writing workspace.</div>';
          U.$$('.tn-ex', body).forEach(function (x) { x.hidden = false; });
          U.$('.btn-row', body).innerHTML = '<button class="btn primary close-h">Back to my world</button>'; U.$('.close-h', body).onclick = md.close;
        } else U.$('.tn-fb', body).innerHTML = '<div class="fb bad">Some answers need another look. Try again.</div>';
      };
    }
    function qHtml(q, qi) {
      var c = q.choices || [], inner = '';
      if (q.type === 'choice' || q.type === 'multi') inner = '<div class="options' + (q.type === 'multi' ? ' multi' : '') + '">' + c.map(function (x, k) { return '<label class="tn-opt"><input type="' + (q.type === 'multi' ? 'checkbox' : 'radio') + '" name="tnq' + qi + '" value="' + k + '"> ' + esc(x) + '</label>'; }).join('') + '</div>';
      else if (q.type === 'match') { var pairs = c.map(function (s) { return String(s).split(/\s*\u2192\s*|\s*->\s*/); }), rights = pairs.map(function (p) { return p[1]; }).slice().sort(); inner = pairs.map(function (p, k) { return '<label class="tn-row">' + esc(p[0]) + ' <select data-left="' + esc(p[0]) + '"><option value="">Choose\u2026</option>' + rights.map(function (r) { return '<option>' + esc(r) + '</option>'; }).join('') + '</select></label>'; }).join(''); }
      else if (q.type === 'sort') { var bins = Object.keys(q.answer || {}); inner = c.map(function (it) { return '<label class="tn-row">' + esc(it) + ' <select data-item="' + esc(it) + '"><option value="">Choose\u2026</option>' + bins.map(function (b) { return '<option>' + esc(b) + '</option>'; }).join('') + '</select></label>'; }).join(''); }
      else if (q.type === 'order') { var mixed = c.slice().sort(function (a, b) { return S.fnv1a(a) < S.fnv1a(b) ? -1 : 1; }); if (mixed.join('|') === c.join('|')) mixed.reverse(); inner = '<p class="small">Number them 1 (first) to ' + c.length + ' (last).</p>' + mixed.map(function (it) { return '<label class="tn-row">' + esc(it) + ' <select data-item="' + esc(it) + '"><option value="">#</option>' + c.map(function (x, k) { return '<option value="' + (k + 1) + '">' + (k + 1) + '</option>'; }).join('') + '</select></label>'; }).join(''); }
      else inner = '<textarea rows="3" class="tn-open" placeholder="Write 2 or more sentences."></textarea>' + ((q.keywordChecklist || []).length ? '<p class="small">Try to use: ' + q.keywordChecklist.map(esc).join(', ') + '</p>' : '') + (q.modelAnswer ? '<details class="tn-ex small" hidden><summary>Compare with a model answer</summary>' + esc(q.modelAnswer) + '</details>' : '');
      return '<div class="tnq" data-q="' + qi + '" data-type="' + esc(q.type) + '"><p><b>' + (qi + 1) + '. ' + esc(q.question) + '</b></p>' + inner + '<p class="tn-ex small" hidden>' + esc(q.explanation || '') + '</p></div>';
    }
    function readQ(q, qi) {
      var el = U.$('.tnq[data-q="' + qi + '"]', body), c = q.choices || [];
      if (q.type === 'choice') { var r = U.$('input:checked', el); return r ? c[+r.value] : null; }
      if (q.type === 'multi') return U.$$('input:checked', el).map(function (x) { return c[+x.value]; });
      if (q.type === 'match') { var o = {}; U.$$('select', el).forEach(function (s) { o[s.getAttribute('data-left')] = s.value; }); return o; }
      if (q.type === 'sort') { var o2 = {}; U.$$('select', el).forEach(function (s) { o2[s.getAttribute('data-item')] = s.value; }); return o2; }
      if (q.type === 'order') { var arr = []; U.$$('select', el).forEach(function (s) { if (s.value) arr[+s.value - 1] = s.getAttribute('data-item'); }); return arr; }
      var t = U.$('textarea', el); return t ? t.value : '';
    }
    function restore(qs) { qs.forEach(function (q, qi) { var a = st.tn[qi], el = U.$('.tnq[data-q="' + qi + '"]', body), c = q.choices || []; if (a == null || !el) return; if (q.type === 'choice') U.$$('input', el).forEach(function (x) { x.checked = c[+x.value] === a; }); else if (q.type === 'multi') U.$$('input', el).forEach(function (x) { x.checked = (a || []).indexOf(c[+x.value]) >= 0; }); else if (q.type === 'match') U.$$('select', el).forEach(function (s) { s.value = a[s.getAttribute('data-left')] || ''; }); else if (q.type === 'sort') U.$$('select', el).forEach(function (s) { s.value = a[s.getAttribute('data-item')] || ''; }); else if (q.type === 'order') U.$$('select', el).forEach(function (s) { var k = (a || []).indexOf(s.getAttribute('data-item')); s.value = k >= 0 ? String(k + 1) : ''; }); else if (U.$('textarea', el)) U.$('textarea', el).value = a || ''; el.classList.toggle('right', WC.checkCompare(q, a)); }); U.$$('.tn-ex', body).forEach(function (x) { x.hidden = false; }); }
    if (st.done) thenNow(); else beat();
    return md;
  };
  WU.answerFor = function (q) { if (q.type === 'match') { var o = {}; (q.choices || []).forEach(function (s) { var p = String(s).split(/\s*\u2192\s*|\s*->\s*/); o[p[0]] = p[1]; }); return o; } if (q.type === 'sort') { var o2 = {}; Object.keys(q.answer || {}).forEach(function (b) { q.answer[b].forEach(function (it) { o2[it] = b; }); }); return o2; } if (q.type === 'writing' || q.type === 'open' || !q.type) return q.modelAnswer || 'I compared my world with the real history and found what was the same and different.'; return q.answer; };
  // demo world: finish every available arc with the first safe choice, a model artifact, and correct Then & Now answers
  WU.demoHistory = function (save, ix) {
    var guard = 0, placed = 0;
    while (guard++ < 30) {
      var av = WC.availableArcs(save, ix, {}); if (!av.length) break;
      av.forEach(function (arc) {
        var st = WC.start(save, arc.id);
        (arc.beats || []).forEach(function (b, bi) { var safe = WC.safeChoices(b), pick = safe[0] ? safe[0].k : 0; st.beat = bi; WC.choose(save, arc.id, pick, { place: function () { var NW = S.WORLD, b2 = S.bounds(NW), used = {}; save.history.marks.forEach(function (m) { used[Math.floor(m.i) + ',' + Math.floor(m.j)] = 1; }); for (var k = 0; k < NW * NW; k++) { var i = (10 + k * 7) % NW, j = (6 + k * 5) % NW; if (i >= b2.min && !S.tileAt(save, i, j) && !used[i + ',' + j]) { placed++; return { i: i, j: j }; } } return null; } });
          if (b.artifact) S.saveWriting(save, WC.artifactKey(arc.id, bi), { title: arc.title.split(':')[0] + ': ' + b.artifact.genre, genre: b.artifact.genre, mission: arc.id, prompt: b.artifact.prompt || '', text: b.artifact.modelAnswer || 'We agree to work together and make fair laws.', checks: [] }); });
        st.beat = (arc.beats || []).length; st.tn = {}; ((arc.thenAndNow || {}).compareQuestions || []).forEach(function (q, qi) { st.tn[qi] = WU.answerFor(q); });
        WC.finish(save, arc.id);
      });
    }
    return save;
  };
})();
