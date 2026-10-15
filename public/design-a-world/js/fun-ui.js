/* Design a World: fun layer UI. Sound (muted by default), the living map (weather, day and night, smoke,
   lights, wandering creatures), townsfolk, gentle nature surprises, celebrations, achievement toasts.
   Motion uses one throttled requestAnimationFrame loop that stops when the tab is hidden or motion is reduced. */
(function () {
  'use strict';
  var U = window.DAW_UI, S = window.DAW_STATE, A = window.DAW_ART, IT = window.DAW_ITEMS, M = window.DAW_MAP, F = window.DAW_FUNC, FA = window.DAW_FUNART, esc = U.esc;
  var FU = window.DAW_FUNUI = window.DAW_FUNUI || {};
  var Q = new URLSearchParams(location.search), TEST = Q.get('test') === '1';
  F.install(S, window.DAW_FUN_DATA, window.DAW_ACH_DATA, { artOf: function (id) { return IT.get(id).art; } });
  F.hook();
  function app() { return window.DAW_APP; }
  function save() { return app() && app().save(); }
  function ix() { return app().ix(); }
  function st() { var s = save(); return (s && s.settings) || {}; }
  FU.F = F;

  // ---------- teacher and student switches ----------
  FU.eventsLocked = function () {
    if (Q.get('events') === 'off') return true; if (TEST && Q.get('events') !== 'on') return true;
    try { if (localStorage.getItem('daw.teacher.eventsOff') === '1') return true; } catch (e) {} return false;
  };
  function evOpts() { return { events: FU.eventsLocked() ? false : undefined, unlockAll: app().unlockAll() }; }
  FU.eventsOn = function () { return !!save() && F.eventsOn(save(), evOpts()); };
  FU.motionOff = function () {
    if (st().calm) return true; if (TEST && Q.get('motion') !== 'on') return true;
    try { return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); } catch (e) { return false; }
  };

  // ---------- sound: WebAudio blips, off until the student turns it on ----------
  var ctx = null; FU.sfxLog = [];
  FU.soundOn = function () { return st().sound === true; };
  FU.audioReady = function () { return !!ctx; };
  var TUNES = {
    tap: [[660, 0.05, 'triangle']], soft: [[520, 0.06, 'sine']], place: [[392, 0.07, 'triangle'], [523, 0.09, 'triangle']],
    good: [[523, 0.08, 'sine'], [659, 0.08, 'sine'], [784, 0.12, 'sine']], bad: [[330, 0.1, 'sine'], [262, 0.14, 'sine']],
    chime: [[784, 0.1, 'sine'], [988, 0.1, 'sine'], [1319, 0.22, 'sine']], event: [[440, 0.12, 'triangle'], [349, 0.16, 'triangle']],
    cheer: [[523, 0.08, 'square'], [659, 0.08, 'square'], [784, 0.08, 'square'], [1047, 0.2, 'square']], flip: [[880, 0.04, 'triangle'], [1175, 0.05, 'triangle']], whoosh: [[220, 0.12, 'sawtooth'], [330, 0.1, 'triangle']], pop: [[740, 0.05, 'sine'], [988, 0.05, 'sine']], unlock: [[659, 0.08, 'sine'], [880, 0.08, 'sine'], [1319, 0.25, 'triangle']]
  };
  FU.sfx = function (kind) {
    var on = FU.soundOn(); FU.sfxLog.push({ kind: kind, played: on }); if (FU.sfxLog.length > 40) FU.sfxLog.shift();
    if (!on) return false;
    try { if (!ctx) { var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return false; ctx = new AC(); } if (ctx.state === 'suspended') ctx.resume(); } catch (e) { return false; }
    var t = ctx.currentTime + 0.01;
    (TUNES[kind] || TUNES.tap).forEach(function (n) {
      var o = ctx.createOscillator(), g = ctx.createGain(); o.type = n[2]; o.frequency.value = n[0];
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(n[2] === 'square' ? 0.03 : 0.08, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + n[1]);
      o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t + n[1] + 0.02); t += n[1] * 0.85;
    });
    return true;
  };
  var SPK = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 8.5a4.5 4.5 0 0 1 0 7M18.5 6a8 8 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
  var MUTE = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 9l6 6M22 9l-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
  FU.toggleSound = function () {
    var s = save(); s.settings.sound = !FU.soundOn(); app().commit(null, { quiet: true, noRender: true, noFun: true }); FU.refresh();
    U.toast(FU.soundOn() ? 'Sound is on.' : 'Sound is off.', '', 1800); if (FU.soundOn()) FU.sfx('chime');
  };
  FU.refresh = function () {
    var b = document.getElementById('sound-btn'); if (b) { var on = FU.soundOn(); b.innerHTML = on ? SPK : MUTE; b.setAttribute('aria-pressed', String(on)); b.setAttribute('aria-label', on ? 'Sound is on. Turn sound off' : 'Sound is off. Turn sound on'); b.title = on ? 'Sound on' : 'Sound off (tap to turn on)'; }
    var ab = document.getElementById('ach-btn'); if (ab && save()) { var c = F.achCounts(save()); ab.setAttribute('aria-label', 'Achievements: ' + c.earned + ' found'); var n = ab.querySelector('.n'); if (n) { n.textContent = c.earned || ''; n.hidden = !c.earned; } }
    document.body.classList.toggle('motion-off', FU.motionOff());
    startLoop();
  };

  // ---------- townsfolk ----------
  function npcOf(e) {
    if (!e) return null; if (e.npc) return F.npc(e.npc);
    return F.npcFor(e.need || e.mission || e.arc || e.world || e.id || '');
  }
  FU.portrait = function (npc, size) { return FA.portrait(npc, size); };
  FU.say = function (npc, line, cls) {
    if (!npc || !line) return '';
    return '<div class="npc-say ' + (cls || '') + '" data-npc="' + esc(npc.id) + '">' + FA.portrait(npc, 52) + '<div class="npc-bubble"><b>' + esc(npc.name) + '</b> <span class="npc-line">' + esc(line) + '</span></div><button class="icon-btn npc-speak" type="button" aria-label="Read aloud what ' + esc(npc.name) + ' says" title="Read aloud" data-say="' + esc(npc.name + ' says: ' + line) + '">' + SPK + '</button></div>';
  };
  FU.npcSay = function (e) {
    var npc = npcOf(e); if (!npc) return '';
    var kind = { upkeep: 'oops', fixed: 'fixed', need: 'need', world: 'need', story: 'hello', history: 'hello' }[e.kind] || 'hello';
    var title = e.title || ''; if (e.kind === 'need' && e.mission && ix().byId[e.mission]) title = ix().byId[e.mission].title;
    return FU.say(npc, F.line(npc, kind, { title: title }, e.id), 'small');
  };
  document.addEventListener('click', function (e) { var b = e.target.closest && e.target.closest('.npc-speak'); if (b) U.speak(b.getAttribute('data-say')); });

  // NPC quest dock on the map: the most useful thing to do next, in a townsperson's words
  var dockOpen = !TEST || Q.get('npc') === 'open', dockKey = null, dockTimer = null; FU.DOCK_MS = +(Q.get('npcms') || 10000);
  // tapping the map or the civ bar tucks the bubble away so it never eats a tap meant for the controls
  document.addEventListener('pointerdown', function (e) { if (dockOpen && e.target.closest && (e.target.closest('#map') || e.target.closest('#civ-bar')) && !e.target.closest('#npc-dock')) { dockOpen = false; clearTimeout(dockTimer); renderDock(); } }, true);
  function dockQuest() {
    var s = save(), x = ix(), WC = window.DAW_WORLDC, a = F.activeEvent(s);
    if (a) { var e = F.eventDef(a.id), n = F.npc(e.npc); return { npc: n, line: F.line(n, 'need', { title: e.name }, 'ev' + a.n) + ' ' + e.text, act: 'event', label: 'Help out' }; }
    if (WC && WC.data && WC.data()) {
      var bl = WC.upkeep(s, x).filter(function (u) { return !u.met && u.applies !== false; })[0];
      if (bl) { var n2 = F.npcFor(bl.id); return { npc: n2, line: F.line(n2, 'oops', {}, bl.id) + ' ' + bl.need.title + '. ' + (bl.need.fixHint || ''), act: 'board', label: 'World Needs' }; }
      var act = WC.activeNeeds(s, x, { unlockAll: app().unlockAll() })[0];
      if (act) { var n3 = F.npcFor(act.id); return { npc: n3, line: F.line(n3, 'need', { title: act.title }, act.id), act: 'need', m: act.id, label: 'Let\u2019s go' }; }
    }
    var fs = F.favStatus(s, x, S.currentStage(s, x, { unlockAll: app().unlockAll() }));
    if (!fs.met) { var n4 = F.npc('ada'); return { npc: n4, line: 'Pick ' + fs.need + ' Field Guide favorites for this stage and write a few sentences about each. I will put them in the town library!', act: 'guide', label: 'Field Guide' }; }
    var n5 = F.npc(F.npcs()[(new Date().getDate()) % F.npcs().length].id); return { npc: n5, line: F.line(n5, 'hello', {}, new Date().toDateString()), act: 'season', label: 'Survival Season' };
  }
  // keep the helper just below the civ bar, however many rows the bar uses
  FU.dock = function () { var host = document.querySelector('.center'), d = document.getElementById('npc-dock'), cb = document.getElementById('civ-bar'); if (!host || !d) return; if (cb && !cb.hidden) { var hr = host.getBoundingClientRect(), br = cb.getBoundingClientRect(); if (br.height) d.style.top = Math.max(96, Math.round(br.bottom - hr.top + 8)) + 'px'; } };
  function renderDock() {
    var host = document.querySelector('.center'); if (!host || !save()) return;
    var d = document.getElementById('npc-dock'); if (!d) { d = U.el('div', { id: 'npc-dock', class: 'npc-dock', role: 'region', 'aria-label': 'Town helper' }); host.appendChild(d); d.addEventListener('click', onDock); }
    FU.dock();
    var q = dockQuest(); FU.lastQuest = q;
    // a bubble never lingers: it hides itself after 10 s (the face stays, with a dot, to bring it back)
    var key = q.npc.id + '|' + q.line; if (dockOpen && key !== dockKey) { dockKey = key; clearTimeout(dockTimer); dockTimer = setTimeout(function () { if (dockOpen) { dockOpen = false; renderDock(); } }, FU.DOCK_MS); } d.classList.toggle('closed', !dockOpen); d.setAttribute('data-npc', q.npc.id); d.setAttribute('data-act', q.act);
    d.innerHTML = dockOpen ? '<button class="npc-face" type="button" aria-label="Hide ' + esc(q.npc.name) + '" title="Hide">' + FA.portrait(q.npc, 56) + '</button><div class="npc-bubble"><b>' + esc(q.npc.name) + '</b><span class="npc-line">' + esc(q.line) + '</span><span class="npc-acts"><button class="btn small primary npc-go" type="button">' + esc(q.label) + '</button><button class="icon-btn npc-speak" type="button" aria-label="Read aloud" data-say="' + esc(q.npc.name + ' says: ' + q.line) + '">' + SPK + '</button></span></div><button class="npc-x" type="button" aria-label="Close" title="Close">&times;</button>'
      : '<button class="npc-face" type="button" aria-label="Show ' + esc(q.npc.name) + '" title="' + esc(q.npc.name) + ' has something to say">' + FA.portrait(q.npc, 56) + '<span class="npc-dot"></span></button>';
  }
  function onDock(e) {
    if (e.target.closest('.npc-x')) { dockOpen = false; clearTimeout(dockTimer); renderDock(); return; }
    if (e.target.closest('.npc-face')) { dockOpen = !dockOpen; dockKey = null; renderDock(); return; }
    if (!e.target.closest('.npc-go')) return; var q = FU.lastQuest; FU.sfx('tap'); dockOpen = false; clearTimeout(dockTimer); renderDock();
    if (q.act === 'event') FU.respond(); else if (q.act === 'board') window.DAW_WORLDUI.board(); else if (q.act === 'need') window.DAW_WORLDUI.go(q.m); else if (q.act === 'guide') window.DAW_DESCUI.guide(); else FU.season();
  }

  // ---------- favorites gate text (World Needs board and stage celebration) ----------
  FU.favGateItems = function (sid) {
    var fs = F.favStatus(save(), ix(), sid); if (fs.met) return [];
    return [{ title: 'Field Guide favorites', hint: 'Star ' + fs.need + ' Field Guide entries from Stage ' + sid + ' and write a few sentences about each (' + fs.written + ' of ' + fs.need + ' written so far).' }];
  };

  // ---------- nature surprises ----------
  FU.eventActive = function (id) { var a = F.activeEvent(save()); return !!(a && a.id === id); };
  FU.boardEvent = function () {
    var a = F.activeEvent(save()); if (!a) return ''; var e = F.eventDef(a.id), n = F.npc(e.npc);
    return '<section class="nb-sec ev-now"><h3>Nature surprise: ' + esc(e.name) + '</h3>' + FU.say(n, F.line(n, 'need', { title: e.name }, 'ev' + a.n)) + '<p>' + esc(e.text) + '</p><div class="btn-row left"><button class="btn primary ev-respond">Help out</button></div></section>';
  };
  FU.respond = function () {
    var s = save(), a = F.activeEvent(s); if (!a) { U.toast('All calm in your world right now.'); return null; }
    var e = F.eventDef(a.id), n = F.npc(e.npc), md = U.modal({ titleHtml: FA.glyph[e.icon] ? '<span class="ev-ic">' + '<svg viewBox="0 0 24 24" width="22" height="22"><g>' + FA.glyph[e.icon].replace(/#fff/g, '#13294B') + '</g></svg></span> ' + esc(e.name) : esc(e.name), title: e.name, wide: true }); md.el.id = 'event-modal';
    md.body.innerHTML = FU.say(n, F.line(n, 'need', { title: e.name }, 'ev' + a.n)) + '<p class="lead">' + esc(e.text) + '</p><h4 class="q-lab">' + esc(e.question) + '</h4><div class="ev-choices">' + e.choices.map(function (c, k) { return '<button class="option ev-choice" data-k="' + k + '"><span class="box"></span><span>' + esc(c.text) + '</span></button>'; }).join('') + '</div><div class="ev-out" aria-live="polite"></div>';
    U.$$('.ev-choice', md.body).forEach(function (b) {
      b.onclick = function () {
        var r = F.respond(s, +b.getAttribute('data-k')), out = U.$('.ev-out', md.body);
        if (!r.ok) { b.classList.add('wrong'); b.disabled = true; FU.sfx('bad'); out.innerHTML = '<div class="fb bad"><p>' + esc(r.why || '') + '</p><p>Try another idea.</p></div>' + FU.say(n, F.line(n, 'oops', {}, 'o' + a.tries), 'small'); app().commit(null, { quiet: true, noRender: true, noFun: true }); return; }
        b.classList.add('picked'); U.$$('.ev-choice', md.body).forEach(function (x) { x.disabled = true; });
        out.innerHTML = '<div class="fb good"><p><b>' + esc(r.why) + '</b></p><p>' + esc(r.learn || '') + '</p></div>' + FU.say(n, F.line(n, 'fixed', {}, 'f' + a.n), 'small cheer') + '<div class="btn-row"><button class="btn primary done-ev">Back to my world</button></div>';
        FU.sfx('cheer'); FU.confetti(); app().commit('Nature surprise handled');
        U.$('.done-ev', md.body).onclick = md.close; U.$('.done-ev', md.body).focus();
      };
    });
    return md;
  };

  // ---------- confetti and celebrations ----------
  FU.confetti = function () {
    FU.lastConfetti = { at: Date.now(), shown: !FU.motionOff() }; if (FU.motionOff()) return false;
    var box = U.el('div', { class: 'confetti', 'aria-hidden': 'true' }), cols = ['#e8590c', '#2b8a3e', '#1c7ed6', '#fab005', '#c2255c', '#7048e8'], h = '';
    for (var k = 0; k < 70; k++) h += '<i style="left:' + (Math.random() * 100).toFixed(1) + '%;background:' + cols[k % cols.length] + ';animation-delay:' + (Math.random() * 0.5).toFixed(2) + 's;animation-duration:' + (1.6 + Math.random() * 1.2).toFixed(2) + 's;transform:rotate(' + Math.round(Math.random() * 360) + 'deg)"></i>';
    box.innerHTML = h; document.body.appendChild(box); setTimeout(function () { box.remove(); }, 3200); return true;
  };
  FU.readCard = function (el) { if (st().autoRead && el) setTimeout(function () { U.speak((el.innerText || '').slice(0, 900)); }, 300); };
  FU.celebrate = function (el, n, next) {
    var s = save(), x = ix(), card = el.querySelector('.cel-card'), mayor = F.npc('marisol'), nu = F.newUnlocks(s, x);
    var h2 = card.querySelector('h2'); h2.insertAdjacentHTML('afterend', FU.say(mayor, F.line(mayor, 'cheer', {}, 'stage' + n), 'cheer'));
    if (nu.length) {
      card.querySelector('.btn-row').insertAdjacentHTML('beforebegin', '<div class="unlock-reveal"><h3>' + A.icon('star', 18) + ' New unlock' + (nu.length > 1 ? 's' : '') + '!</h3><div class="ur-list">' + nu.map(function (k) { return '<div class="ur-card" data-skin="' + esc(k.id) + '">' + FU.skinPreview(k, 64) + '<span><b>' + esc(k.name) + '</b><small>' + (k.kind === 'building' ? 'Building look' : 'Map theme') + '</small></span><button class="btn small primary try-skin" data-skin="' + esc(k.id) + '">Try it</button></div>'; }).join('') + '</div></div>');
      F.markSeen(s, nu.map(function (k) { return k.id; })); app().commit(null, { quiet: true, noRender: true, noFun: true }); FU.sfx('unlock');
      U.$$('.try-skin', card).forEach(function (b) { b.onclick = function () { F.apply(s, x, b.getAttribute('data-skin')); app().commit('Changed look'); b.textContent = 'In use'; b.disabled = true; }; });
    }
    el.classList.add('party'); FU.confetti(); FU.sfx('cheer'); FU.readCard(card);
  };
  FU.skinPreview = function (sk, size) {
    var art = sk.kind === 'building' ? 'houses' : 'forest', id = 'pv-' + sk.id + '-' + Math.floor(Math.random() * 1e6);
    var f = sk.matrix ? '<feColorMatrix type="matrix" values="' + sk.matrix + '"/>' : sk.hue != null ? '<feColorMatrix type="hueRotate" values="' + sk.hue + '"/>' : '';
    return '<span class="skin-pv" aria-hidden="true">' + (f ? '<svg width="0" height="0" style="position:absolute"><filter id="' + id + '">' + f + '</filter></svg><span style="filter:url(#' + id + ');display:inline-block">' : '<span>') + A.thumb(art, size || 64, 3) + '</span></span>';
  };

  // ---------- achievements ----------
  FU.medal = function (def, tier, locked, size) { return FA.medal(def, tier, locked, size); };
  FU.toastAch = function (list) {
    if (!list || !list.length) return;
    if (list.length > 3) { U.toast('<span class="ach-toast">' + FA.medal(F.achDef(list[0].id), list[0].tier, false, 40) + '<span><b>' + list.length + ' achievements unlocked!</b><small>See them in Achievements.</small></span></span>', 'ach', 5000); FU.sfx('chime'); return; }
    list.forEach(function (a, k) {
      var d = F.achDef(a.id); setTimeout(function () { U.toast('<span class="ach-toast" data-ach="' + esc(a.id) + '">' + FA.medal(d, a.tier, false, 40) + '<span><small>Achievement unlocked!</small><b>' + esc(d.name) + (a.tierName ? ' (' + a.tierName.charAt(0).toUpperCase() + a.tierName.slice(1) + ')' : '') + '</b><small>' + esc(d.desc) + '</small></span></span>', 'ach', 4500); FU.sfx('chime'); }, k * 700);
    });
    FU.refresh();
  };
  var later = null;
  FU.checkNow = function () {
    var s = save(); if (!s) return []; var got = F.checkAch(s, ix());
    if (got.length) { app().commit(null, { quiet: true, noRender: true, noFun: true }); FU.toastAch(got); }
    return got;
  };
  FU.flag = function (k) { var s = save(); if (s && F.flag(s, k)) { app().commit(null, { quiet: true, noRender: true, noFun: true }); FU.checkNow(); return true; } return false; };

  // ---------- after every save (from app.commit) ----------
  FU.afterCommit = function (label, o) {
    var s = save(); if (!s) return null; F.ensure(s); o = o || {}; var out = { changed: false, ach: [], event: null };
    if (/^Placed /.test(label || '')) FU.sfx('place');
    if (label && !o.noRender) { var ev = F.tick(s, ix(), Math.random, evOpts()); if (ev) { out.event = ev; out.changed = true; } }
    if (o.noRender) { clearTimeout(later); later = setTimeout(FU.checkNow, 700); }
    else out.ach = F.checkAch(s, ix());
    return out;
  };
  FU.announce = function (out) {
    if (!out) return;
    if (out.event) { FU.sfx('event'); dockOpen = true; dockKey = null; renderDock(); }
    if (out.ach && out.ach.length) FU.toastAch(out.ach);
    FU.refresh();
  };
  // a loaded or migrated save: keep open stages open, award earned achievements quietly, one summary toast
  FU.onLoad = function (s) {
    if (!s) return; F.ensure(s); if (!s.fun.retro) return;
    F.grandfather(s, ix()); var got = F.checkAch(s, ix()); delete s.fun.retro; F.markSeen(s, F.newUnlocks(s, ix()).map(function (k) { return k.id; }));
    FU.retroCount = got.length;
    if (got.length) setTimeout(function () { U.toast('<span class="ach-toast retro">' + FA.medal(F.achDef(got[0].id), got[0].tier, false, 40) + '<span><b>Welcome back!</b><small>You already earned ' + got.length + ' achievement' + (got.length > 1 ? 's' : '') + '. Open Achievements to see them.</small></span></span>', 'ach', 6000); FU.sfx('chime'); FU.refresh(); }, 600);
  };
  FU.boot = function () {
    FU.refresh(); renderDock();
    if (!FU._bound) {
      FU._bound = true;
      document.addEventListener('visibilitychange', function () { if (document.hidden) stopLoop(true); else { loop.paused = false; startLoop(); } });
      // map tools and data flags for achievements (counted once; never speed or time)
      document.addEventListener('pointerup', function (e) { var t = document.body.getAttribute('data-tool'); if (e.target.closest && e.target.closest('#map')) { if (t === 'measure') FU.flag('toolMeasure'); } });
      document.addEventListener('click', function (e) {
        var t = document.body.getAttribute('data-tool'), tg = e.target;
        if (!tg.closest) return;
        if (t === 'volume' && tg.closest('#map .hit') && /Volume/.test((document.getElementById('readout') || {}).textContent || '')) FU.flag('toolVolume');
        if (tg.closest('#charts-modal .seg-b')) FU.flag('chartMade');
        if (tg.closest('#feedback-modal .save-fb, #feedback-modal .make-code')) setTimeout(function () { if (!document.querySelector('#feedback-modal .fb-out .fb.bad')) FU.flag('gaveFeedback'); }, 50);
      }, true);
    }
    startLoop();
  };
  FU.route = function (h) {
    if (h === 'binder') { FU.binder('cards'); return true; } if (h === 'achievements') { FU.binder('ach'); return true; } if (h === 'looks') { FU.binder('looks'); return true; }
    if (h === 'season') { FU.season(); return true; } if (h === 'event') { FU.respond(); return true; } return false;
  };
  // demo worlds: a little fun state so screenshots and teacher previews look alive
  FU.demo = function (s, x, stop) {
    F.ensure(s); var dx = window.DAW_DESC.shared(); if (!dx) return;
    if (stop >= 3) { var run = F.runSeason(dx, 'forest', 'mild', ['loblolly-pine', 'southern-pine-beetle', 'red-cockaded-woodpecker', 'turkey-tail-fungus'].filter(function (id) { return dx.org[id]; })); F.recordSeason(s, run); }
    x.stageIds.forEach(function (sid) { if (sid <= stop) F.demoFavs(s, x, sid); });
    F.setNick(s, 'black-bear', 'Bramble'); F.checkAch(s, x); F.markSeen(s, F.newUnlocks(s, x).map(function (k) { return k.id; }));
  };

  // ---------- the living map layer ----------
  var live = { svg: null, el: null, parts: null }, loop = { raf: 0, last: 0, frames: 0, running: false, paused: false };
  FU.live = function () { return { running: loop.running, frames: loop.frames, paused: loop.paused, motionOff: FU.motionOff(), hasLayer: !!(live.el && live.svg && document.body.contains(live.svg)), clouds: live.parts ? live.parts.clouds.length : 0, critters: live.parts ? live.parts.wander.length : 0, night: live.night || 0 }; };
  function trOf(el) { var m = /translate\(([-\d.]+)[ ,]+([-\d.]+)\)/.exec(el.getAttribute('transform') || ''); return m ? [+m[1], +m[2]] : [0, 0]; }
  var WATER = /river|lake|ocean|pond|delta|beach|aquifer|reservoir|bay|marsh/, SMOKE = /houses|workshop|townhall|school|careercenter/;
  FU.onPaint = function (svg) {
    if (!svg || !save()) return; live.svg = svg; var vb = svg.viewBox.baseVal, NS = 'http://www.w3.org/2000/svg';
    var a = F.activeEvent(save()), evk = a ? (F.eventDef(a.id).fx || {}).kind : null, o = [];
    var cloudsY = [vb.y + vb.height * 0.08, vb.y + vb.height * 0.16, vb.y + vb.height * 0.05], dark = evk === 'storm' || evk === 'flood';
    o.push('<rect class="night" x="' + (vb.x - vb.width) + '" y="' + (vb.y - vb.height) + '" width="' + vb.width * 3 + '" height="' + vb.height * 3 + '" fill="#0b1736" opacity="0" pointer-events="none"/>');
    o.push('<g class="stars" opacity="0">'); for (var k = 0; k < 22; k++) o.push('<circle cx="' + (vb.x + ((k * 137) % 100) / 100 * vb.width).toFixed(0) + '" cy="' + (vb.y + ((k * 61) % 30) / 100 * vb.height).toFixed(0) + '" r="' + (k % 3 ? 1.6 : 2.4) + '" fill="#fff"/>'); o.push('</g>');
    var items = Array.prototype.slice.call(svg.querySelectorAll('.items > .item'));
    o.push('<g class="lights" opacity="0">');
    items.forEach(function (it) { var art = it.getAttribute('data-art'); if (M.isBuilding(art) && it.getAttribute('data-fx') !== 'dark') { var p = trOf(it), kk = +(it.getAttribute('data-k') || 1); o.push('<g transform="translate(' + p[0] + ' ' + (p[1] - 16 * kk) + ') scale(' + kk + ')"><circle r="16" fill="#ffd43b" opacity=".28"/><circle cx="-6" cy="2" r="2.6" fill="#fff3bf"/><circle cx="6" cy="-2" r="2.6" fill="#fff3bf"/></g>'); } });
    o.push('</g><g class="smoke">');
    items.forEach(function (it) { var art = it.getAttribute('data-art'); if (SMOKE.test(art)) { var p = trOf(it), kk = +(it.getAttribute('data-k') || 1); for (var q = 0; q < 3; q++) o.push('<circle class="puff" data-x="' + (p[0] + 10 * kk) + '" data-y="' + (p[1] - 46 * kk) + '" data-ph="' + (q / 3) + '" cx="' + (p[0] + 10 * kk) + '" cy="' + (p[1] - 46 * kk - q * 9) + '" r="' + (3 + q * 2) + '" fill="#e9ecef" opacity="' + (0.5 - q * 0.12) + '"/>'); } });
    o.push('</g><g class="sparkles">');
    items.forEach(function (it) { var art = it.getAttribute('data-art'); if (WATER.test(art)) { var p = trOf(it), kk = +(it.getAttribute('data-k') || 1); [[-14, 2], [8, 8], [-2, -6]].forEach(function (d, q) { o.push('<path class="spark" data-ph="' + q + '" d="M' + (p[0] + d[0] * kk - 4) + ' ' + (p[1] + d[1] * kk) + ' h8" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".6"/>'); }); } });
    o.push('</g>');
    var cl = dark ? '#868e96' : '#ffffff';
    o.push('<g class="clouds">'); cloudsY.forEach(function (cy, q) { var sc = [1.1, 0.8, 0.95][q]; o.push('<g class="cloud" data-y="' + cy.toFixed(0) + '" data-s="' + sc + '" data-q="' + q + '" transform="translate(' + (vb.x + vb.width * (0.15 + q * 0.33)).toFixed(0) + ' ' + cy.toFixed(0) + ') scale(' + sc + ')" opacity=".88"><ellipse cx="0" cy="0" rx="46" ry="18" fill="' + cl + '"/><ellipse cx="-20" cy="-10" rx="22" ry="16" fill="' + cl + '"/><ellipse cx="14" cy="-14" rx="26" ry="20" fill="' + cl + '"/>' + (dark ? '<g class="rain">' + [-30, -15, 0, 15, 30].map(function (rx) { return '<path d="M' + rx + ' 22 l-5 14" stroke="#74c0fc" stroke-width="2.4" stroke-linecap="round"/><path d="M' + (rx + 7) + ' 44 l-5 14" stroke="#74c0fc" stroke-width="2.4" stroke-linecap="round"/>'; }).join('') + '</g>' : '') + '</g>'); }); o.push('</g>');
    var g = document.createElementNS(NS, 'g'); g.setAttribute('class', 'live'); g.setAttribute('pointer-events', 'none'); g.innerHTML = o.join(''); svg.appendChild(g); live.el = g;
    // tap a creature (Info tool) and it hops and says hi
    var cr = document.createElementNS(NS, 'g'); cr.setAttribute('class', 'critters'); var ch = [];
    items.forEach(function (it) { var p = trOf(it), kk = +(it.getAttribute('data-k') || 1); Array.prototype.forEach.call(it.querySelectorAll('.org-on'), function (on) { var q = trOf(on); ch.push('<circle class="critter-hit" data-org="' + esc(on.getAttribute('data-org')) + '" data-i="' + it.getAttribute('data-i') + '" data-j="' + it.getAttribute('data-j') + '" cx="' + (p[0] + (q[0] + 11) * kk) + '" cy="' + (p[1] + (q[1] + 10) * kk) + '" r="' + Math.max(9, 12 * kk) + '" fill="transparent"><title>Say hi</title></circle>'); }); });
    cr.innerHTML = ch.join(''); svg.appendChild(cr);
    cr.addEventListener('click', function (e) { var c = e.target.closest('.critter-hit'); if (!c) return; e.stopPropagation(); critterHi(svg, c); });
    live.parts = { night: g.querySelector('.night'), stars: g.querySelector('.stars'), lights: g.querySelector('.lights'), clouds: Array.prototype.slice.call(g.querySelectorAll('.cloud')), puffs: Array.prototype.slice.call(g.querySelectorAll('.puff')), sparks: Array.prototype.slice.call(g.querySelectorAll('.spark')), wander: Array.prototype.slice.call(svg.querySelectorAll('.org-on .wander')), flood: Array.prototype.slice.call(svg.querySelectorAll('.flood-tile')), vb: { x: vb.x, w: vb.width } };
    var comp = svg.querySelector('.compass'); if (comp) comp.addEventListener('click', compassTap);
    renderDock(); drawFrame(loop.t || 0); startLoop();
  };
  var tickles = {}, compassN = 0;
  function critterHi(svg, c) {
    var id = c.getAttribute('data-org'), w = svg.querySelector('.item[data-i="' + c.getAttribute('data-i') + '"][data-j="' + c.getAttribute('data-j') + '"] .org-on[data-org="' + id + '"] .wander');
    if (w && !FU.motionOff()) { w.classList.remove('hop'); void w.getBBox(); w.classList.add('hop'); setTimeout(function () { w.classList.remove('hop'); }, 700); }
    FU.sfx('tap'); var x = window.DAW_DESC.shared(), nm = (F.ensure(save()).nick[id]) || (x && x.org[id] ? x.org[id].name : 'This creature');
    U.toast(esc(nm) + ' says hi!', '', 1500); tickles[id] = 1; if (Object.keys(tickles).length >= 3) FU.flag('eggCritter');
  }
  function compassTap() { compassN++; var c = live.svg && live.svg.querySelector('.compass'); if (c && !FU.motionOff()) { c.classList.remove('spin'); void c.getBBox(); c.classList.add('spin'); } FU.sfx('tap'); if (compassN >= 5) { compassN = 0; if (FU.flag('eggCompass')) U.toast('The compass is dizzy! Which way is north again?', '', 3000); } }
  // day and night: 90-second cycle; with reduced motion it stays daytime
  function nightOf(t) { var p = (t % 90) / 90; return p < 0.55 ? 0 : p < 0.65 ? (p - 0.55) / 0.1 : p < 0.9 ? 1 : 1 - (p - 0.9) / 0.1; }
  FU.setTime = function (t) { FU._forceT = t; drawFrame(t); };
  function drawFrame(t) {
    var P = live.parts; if (!P) return; var still = FU.motionOff(); if (FU._forceT != null) t = FU._forceT; var n = still && FU._forceT == null ? 0 : nightOf(t); live.night = n;
    P.night.setAttribute('opacity', (0.42 * n).toFixed(3)); var mp = live.svg && live.svg.closest('.map'); if (mp && mp._n !== n) { mp._n = n; mp.style.setProperty('--night', n.toFixed(3)); } P.stars.setAttribute('opacity', n.toFixed(2)); P.lights.setAttribute('opacity', n.toFixed(2));
    P.clouds.forEach(function (c) { var q = +c.getAttribute('data-q'), w = P.vb.w + 240, x = P.vb.x - 120 + ((w * (0.15 + q * 0.33) + t * (6 + q * 3)) % w); c.setAttribute('transform', 'translate(' + x.toFixed(1) + ' ' + c.getAttribute('data-y') + ') scale(' + c.getAttribute('data-s') + ')'); var r = c.querySelector('.rain'); if (r) r.setAttribute('transform', 'translate(0 ' + ((t * 40) % 20).toFixed(1) + ')'); });
    P.puffs.forEach(function (p) { var life = (t * 0.35 + +p.getAttribute('data-ph')) % 1; p.setAttribute('cy', (+p.getAttribute('data-y') - life * 30).toFixed(1)); p.setAttribute('cx', (+p.getAttribute('data-x') + Math.sin(life * 6) * 3).toFixed(1)); p.setAttribute('r', (3 + life * 6).toFixed(1)); p.setAttribute('opacity', ((1 - life) * 0.55).toFixed(2)); });
    P.sparks.forEach(function (s, k) { s.setAttribute('opacity', (0.25 + 0.5 * Math.abs(Math.sin(t * 1.6 + k))).toFixed(2)); });
    P.wander.forEach(function (w, k) { var dx = Math.sin(t * 0.7 + k * 1.7) * 5, dy = Math.cos(t * 0.9 + k) * 1.6; w.setAttribute('transform', 'translate(' + dx.toFixed(1) + ' ' + dy.toFixed(1) + ')'); });
    P.flood.forEach(function (f, k) { f.setAttribute('opacity', (0.38 + 0.12 * Math.sin(t * 2 + k)).toFixed(2)); });
  }
  function step(ts) {
    loop.raf = 0;
    if (document.hidden) { stopLoop(true); return; }
    if (FU.motionOff() || !live.svg || !document.body.contains(live.svg)) { loop.running = false; return; }
    if (ts - loop.last >= 66) { loop.last = ts; loop.frames++; loop.t = ts / 1000; drawFrame(loop.t); } // about 15 frames a second
    loop.raf = requestAnimationFrame(step);
  }
  function startLoop() { if (loop.raf || document.hidden || FU.motionOff() || !live.svg) { if (FU.motionOff()) { loop.running = false; if (loop.raf) { cancelAnimationFrame(loop.raf); loop.raf = 0; } } return; } loop.running = true; loop.raf = requestAnimationFrame(step); }
  function stopLoop(hidden) { if (loop.raf) cancelAnimationFrame(loop.raf); loop.raf = 0; loop.running = false; if (hidden) loop.paused = true; }
  FU._loop = loop;
})();
