/* Design a World: world needs, story events, upkeep consequences, and history arcs (pure logic, Node-testable).
   Data comes from data/world.json (built by tools/import_world.py from School Bot's mission triggers and history
   events, plus default upkeep needs). Tasks come from what the world needs right then. */
(function (root) {
  'use strict';
  var WC = {}, S = null, DATA = null, ART = function (id) { return id; }, KIND = function () { return null; }, ORGS = function () { return { animals: 0, plants: 0, all: 0 }; };
  var METERS = ['trust', 'unity', 'rights', 'economy'];
  WC.METERS = METERS;

  // ---------- safety scan: choice text must never offer enslaving/buying/selling people, profiting from slavery, or violence ----------
  // Each rule: [pattern, label, unless]. "unless" is checked against the sentence holding the match, so
  // "end the slave trade" or "help people escape slavery" are not flagged, but "start the slave trade" is.
  var ABOLISH = /\b(end|ends|ending|ban|bans|banning|abolish\w*|free|freed|freeing|freedom|stop|stops|outlaw\w*|resist\w*|escape\w*|oppose\w*|against|illegal|protest\w*|petition\w*|forbid\w*|prohibit\w*|emancipat\w*)\b/i;
  var BAN = /\b(end|ends|ending|ban|bans|banning|abolish\w*|stop|stops|outlaw\w*|oppose\w*|against|illegal|forbid\w*|prohibit\w*)\b/i;
  var HARM = [
    [/\benslav(e|es|ing)\b/i, 'enslaving people', ABOLISH],
    [/\b(buy|buys|buying|sell|sells|selling|purchase|purchasing|trade|trading|own|owning)\b[^.]{0,30}\b(people|persons|person|humans|slaves|enslaved|workers as property|captives)\b/i, 'buying, selling, or owning people', BAN],
    [/\b(slave\s*trade|slave\s*market|slave\s*labor)\b/i, 'slave trade', ABOLISH],
    [/\bprofit\w*\b[^.]{0,40}\b(slave\w*|enslav\w*)\b/i, 'profiting from slavery'],
    [/\b(kill|killing|murder|massacre|shoot|shooting|stab|whip|whipping|torture|execute|bomb|burn down|raid|ambush|conquer|slaughter)\b/i, 'violence'],
    [/\b(attack|attacks|attacking|fight|fighting|battle|go to war|declare war|start a war|invade|destroy)\b/i, 'combat as a game action'],
    [/\b(weapon|weapons|gun|guns|cannon|cannons|sword|swords|army attack)\b/i, 'weapons']
  ];
  WC.scanText = function (text) {
    var t = String(text || ''), hits = [];
    t.split(/(?<=[.!?;])\s+/).forEach(function (sent) {
      HARM.forEach(function (h) { var mm = h[0].exec(sent); if (mm && !(h[2] && h[2].test(sent.replace(mm[0], ''))) && !hits.some(function (x) { return x.rule === h[1]; })) hits.push({ rule: h[1], match: mm[0] }); });
    });
    return hits;
  };
  WC.scanChoice = function (choice) { return WC.scanText((choice && choice.text) || choice); };
  WC.scanArc = function (arc) {
    var out = [];
    (arc.beats || []).forEach(function (b, bi) { (b.choices || []).forEach(function (c, ci) { var h = WC.scanChoice(c); if (h.length) out.push({ arc: arc.id, beat: bi, choice: ci, text: c.text, hits: h }); }); });
    return out;
  };
  WC.safeChoices = function (beat) { return (beat.choices || []).map(function (c, k) { return { c: c, k: k }; }).filter(function (x) { return !WC.scanChoice(x.c).length; }); };

  // ---------- setup ----------
  WC.install = function (state, data, opts) {
    S = state; DATA = data || { missions: {}, needs: [], events: [], history: { arcs: [] } }; opts = opts || {};
    if (opts.artOf) ART = opts.artOf; if (opts.kindOf) KIND = opts.kindOf; if (opts.orgs) ORGS = opts.orgs;
    DATA.missions = DATA.missions || {}; DATA.needs = DATA.needs || []; DATA.events = DATA.events || []; DATA.history = DATA.history || { arcs: [] };
    S.setHooks({
      needActive: function (save, ix, m) { return WC.isActive(save, ix, m); },
      freedom: function (m) { var w = DATA.missions[m.id]; return (w && w.freedom) || m.freedom || 'guided'; },
      stageGate: function (save, ix, sid) { return WC.stageNeedsMet(save, ix, sid); },
      history: function (save, ix) { return WC.historyTeks(save, ix); }
    });
    return WC;
  };
  WC.data = function () { return DATA; };
  WC.ensure = function (save) {
    save.needs = save.needs || {}; save.needs.seen = save.needs.seen || {}; save.needs.events = save.needs.events || []; save.needs.flags = save.needs.flags || {}; save.needs.upkeep = save.needs.upkeep || {};
    save.history = save.history || {}; save.history.arcs = save.history.arcs || {}; save.history.marks = save.history.marks || [];
    return save;
  };

  // ---------- predicates ----------
  function tilesWithArt(save, arts) { return save.world.tiles.filter(function (t) { return arts.indexOf(ART(t.t)) >= 0; }).length; }
  function unlockedNoGate(save, ix, sid) { var k = ix.stageIds.indexOf(sid); if (k <= 0) return true; for (var n = 0; n < k; n++) if (!S.stageComplete(save, ix, ix.stageIds[n])) return false; return true; }
  WC.meters = function (save) {
    var m = { trust: 0, unity: 0, rights: 0, economy: 0 }, arcs = (save.history && save.history.arcs) || {};
    Object.keys(arcs).forEach(function (hid) { var a = arcs[hid], arc = WC.arc(hid); if (!arc || !a.choices) return; a.choices.forEach(function (ci, bi) { var b = (arc.beats || [])[bi], c = b && b.choices && b.choices[ci]; if (c && c.consequences) METERS.forEach(function (k) { m[k] += +c.consequences[k] || 0; }); }); });
    return m;
  };
  WC.evalPred = function (p, save, ix) {
    if (!p) return true;
    if (p.always) return true;
    if (p.all) return p.all.every(function (q) { return WC.evalPred(q, save, ix); });
    if (p.any) return p.any.length ? p.any.some(function (q) { return WC.evalPred(q, save, ix); }) : true;
    if (p.not) return !WC.evalPred(p.not, save, ix);
    if (p.placed) return S.onMap(save, p.placed);
    if (p.hasArt) return tilesWithArt(save, p.hasArt) >= (p.min != null ? +p.min : 1);
    if (p.done) return !!(save.missions[p.done] && save.missions[p.done].done);
    if (p.stage != null) return unlockedNoGate(save, ix, p.stage);
    if (p.stageComplete != null) return S.stageComplete(save, ix, p.stageComplete);
    if (p.stageRest) { var ex = p.stageRest.except || []; return S.stageMissions(ix, p.stageRest.stage).every(function (m) { return ex.indexOf(m.id) >= 0 || (save.missions[m.id] && save.missions[m.id].done); }); }
    if (p.count) {
      var n = 0, o = ORGS(save);
      if (p.count === 'animals' || p.count === 'plants' || p.count === 'organisms') n = p.count === 'organisms' ? o.all : o[p.count];
      else if (p.count === 'tiles') n = save.world.tiles.length;
      else n = save.world.tiles.filter(function (t) { return KIND(ART(t.t)) === p.count; }).length;
      return n >= (p.min != null ? +p.min : 1);
    }
    if (p.plantsPerAnimal != null) { var oo = ORGS(save); return oo.plants >= Math.ceil(oo.animals * p.plantsPerAnimal); }
    if (p.meter) { var v = WC.meters(save)[p.meter] || 0, x = +p.value || 0; return p.op === '<=' ? v <= x : p.op === '>=' ? v >= x : p.op === '<' ? v < x : p.op === '>' ? v > x : v === x; }
    if (p.history) { var a = save.history && save.history.arcs && save.history.arcs[p.history]; return !!(a && a.done); }
    if (p.historyStarted) return !!(save.history && save.history.arcs && save.history.arcs[p.historyStarted]);
    if (p.fired) return ((save.needs && save.needs.events) || []).some(function (e) { return e.id === p.fired; });
    if (p.flag) return !!(save.needs && save.needs.flags && save.needs.flags[p.flag]);
    return true; // unknown predicate kinds never block play
  };

  // ---------- mission needs ----------
  WC.mission = function (mid) { return DATA.missions[mid] || null; };
  function pending(save, ix, sid) { return S.stageMissions(ix, sid).filter(function (m) { return !(save.missions[m.id] && save.missions[m.id].done); }); }
  function reqsMet(save, ix, m) { return !S.missingRequirements(save, ix, m).length; }
  // Active needs for one stage: missions whose trigger is true right now (and whose required places are ready).
  // Fallback so play never stalls: if nothing in an unlocked, unfinished stage is active, the first pending mission is.
  WC.stageNeeds = function (save, ix, sid, opts) {
    if (!S.stageUnlocked(save, ix, sid, opts)) return [];
    var pend = pending(save, ix, sid); if (!pend.length) return [];
    var act = pend.filter(function (m) { var w = DATA.missions[m.id]; return reqsMet(save, ix, m) && WC.evalPred(w && w.pred, save, ix); });
    if (!act.length) { var f = pend.filter(function (m) { return reqsMet(save, ix, m); })[0] || pend[0]; act = [f]; act.fallback = true; }
    return act;
  };
  WC.activeNeeds = function (save, ix, opts) { var out = []; ix.stageIds.forEach(function (sid) { out = out.concat(WC.stageNeeds(save, ix, sid, opts)); }); return out; };
  WC.isActive = function (save, ix, m) { return WC.stageNeeds(save, ix, m.stage).indexOf(m) >= 0; };

  // ---------- upkeep needs and visible consequences ----------
  WC.upkeep = function (save, ix) {
    return DATA.needs.map(function (n) {
      var applies = (n.stage == null || unlockedNoGate(save, ix, n.stage)) && WC.evalPred(n.when, save, ix), met = !applies || WC.evalPred(n.fixed, save, ix);
      return { need: n, id: n.id, applies: applies, met: met };
    });
  };
  WC.stageNeedsMet = function (save, ix, sid) { return WC.upkeep(save, ix).every(function (u) { return u.met || u.need.blocksStage !== sid; }); };
  WC.blockers = function (save, ix, sid) { return WC.upkeep(save, ix).filter(function (u) { return !u.met && u.need.blocksStage === sid; }); };
  // effects: {byArt: {art: 'dry'|'dark'}, fewer: bool, list: [...]}
  WC.effects = function (save, ix) {
    var out = { byArt: {}, fewer: false, list: [] };
    WC.upkeep(save, ix).forEach(function (u) {
      if (u.met) return; var e = u.need.effect || {}; out.list.push({ id: u.id, kind: e.kind, title: u.need.title });
      if (e.kind === 'fewer') out.fewer = true; else (e.on || []).forEach(function (a) { if (!out.byArt[a]) out.byArt[a] = e.kind; });
    });
    return out;
  };

  // ---------- story events: newly active needs, upkeep changes, ambient events, history arcs ----------
  // Returns new event cards (and records them) without changing anything else; call after every change.
  WC.sync = function (save, ix, opts) {
    WC.ensure(save); var nd = save.needs, cards = [], now = (opts && opts.now) || new Date().toISOString();
    function add(e) { e.at = now; nd.events.push(e); cards.push(e); if (nd.events.length > 80) nd.events.splice(0, nd.events.length - 80); }
    // stage unlocks are remembered so a later unmet need never takes progress away
    save.unlocked = save.unlocked || {}; ix.stageIds.forEach(function (sid) { if (!save.unlocked[sid] && S.stageUnlocked(save, ix, sid, opts)) save.unlocked[sid] = now; });
    WC.activeNeeds(save, ix, opts).forEach(function (m) {
      if (nd.seen[m.id]) return; nd.seen[m.id] = now; var w = DATA.missions[m.id] || {}, tr = w.trigger || m.trigger || {};
      add({ id: 'need:' + m.id, kind: 'need', type: tr.type || 'need', mission: m.id, title: m.title, text: tr.narrative || m.prompt || '' });
    });
    WC.upkeep(save, ix).forEach(function (u) {
      var was = nd.upkeep[u.id]; var st = u.met ? 'met' : 'unmet';
      if (u.applies && was !== st) { if (st === 'unmet') add({ id: 'upkeep:' + u.id, kind: 'upkeep', need: u.id, title: u.need.title, text: u.need.text, effect: (u.need.effect || {}).kind }); else if (was === 'unmet') add({ id: 'fixed:' + u.id, kind: 'fixed', need: u.id, title: u.need.fixedTitle || (u.need.title + ': fixed!'), text: u.need.fixedText || 'Your world is back to normal.' }); }
      if (u.applies) nd.upkeep[u.id] = st;
    });
    DATA.events.forEach(function (ev) { if (nd.flags['ev:' + ev.id]) return; if (WC.evalPred(ev.when, save, ix)) { nd.flags['ev:' + ev.id] = now; add({ id: ev.id, kind: 'story', title: ev.title, text: ev.text }); } });
    if (WC.historyOn(save, opts)) WC.availableArcs(save, ix, opts).forEach(function (arc) { var k = 'arc:' + arc.id; if (nd.flags[k]) return; nd.flags[k] = now; add({ id: 'history:' + arc.id, kind: 'history', arc: arc.id, title: arc.title, text: (arc.trigger && arc.trigger.narrative) || '' }); });
    return cards;
  };
  WC.unacked = function (save) { return ((save.needs && save.needs.events) || []).filter(function (e) { return !e.ack; }); };
  WC.ack = function (save, id) { ((save.needs && save.needs.events) || []).forEach(function (e) { if (!id || e.id === id) e.ack = true; }); };

  // ---------- history arcs ----------
  WC.arcs = function () { return (DATA.history && DATA.history.arcs) || []; };
  WC.arc = function (hid) { return WC.arcs().filter(function (a) { return a.id === hid; })[0] || null; };
  WC.historyOn = function (save, opts) { return !(opts && opts.history === false) && !(save.settings && save.settings.history === false); };
  WC.arcAvailable = function (save, ix, arc, opts) { return S.stageUnlocked(save, ix, arc.stage || 1, opts) && WC.evalPred(arc.pred, save, ix); };
  WC.availableArcs = function (save, ix, opts) { var hs = (save.history && save.history.arcs) || {}; return WC.arcs().filter(function (a) { return !(hs[a.id] && hs[a.id].done) && WC.arcAvailable(save, ix, a, opts); }); };
  WC.arcState = function (save, hid) { WC.ensure(save); return save.history.arcs[hid] || null; };
  WC.start = function (save, hid, now) { WC.ensure(save); var a = save.history.arcs[hid]; if (!a) a = save.history.arcs[hid] = { beat: 0, choices: [], started: now || new Date().toISOString(), done: false, tn: {} }; return a; };
  // choose an option in the current beat (only safe options are allowed); returns the outcome to show
  WC.choose = function (save, hid, choiceIdx, opts) {
    var arc = WC.arc(hid); if (!arc) return { ok: false, reason: 'unknown' };
    var a = WC.start(save, hid), beat = (arc.beats || [])[a.beat]; if (!beat) return { ok: false, reason: 'no-beat' };
    var c = (beat.choices || [])[choiceIdx]; if (!c) return { ok: false, reason: 'bad-choice' };
    if (WC.scanChoice(c).length) return { ok: false, reason: 'unsafe' };
    a.choices[a.beat] = choiceIdx; a.updated = (opts && opts.now) || new Date().toISOString();
    var mark = null; if (c.mapEffect && opts && opts.place) mark = opts.place(arc, c);
    if (mark) { save.history.marks = save.history.marks.filter(function (x) { return !(x.arc === hid && x.beat === a.beat); }); mark.arc = hid; mark.beat = a.beat; mark.text = c.mapEffect; save.history.marks.push(mark); }
    return { ok: true, choice: c, consequences: c.consequences || {}, meters: WC.meters(save), mark: mark, artifact: beat.artifact || null };
  };
  WC.nextBeat = function (save, hid) { var arc = WC.arc(hid), a = WC.start(save, hid); a.beat = Math.min(a.beat + 1, (arc.beats || []).length); return a.beat < (arc.beats || []).length; };
  WC.artifactKey = function (hid, beat) { return 'h:' + hid + ':' + beat; };
  // Then & Now compare questions: grade one answer
  WC.checkCompare = function (q, ans) {
    if (q.type === 'choice') return ans === q.answer;
    if (q.type === 'order') { var o = ans || [], k2 = q.answer || q.choices || []; return o.length === k2.length && k2.every(function (x, i) { return o[i] === x; }); }
    if (q.type === 'multi') { var a = (ans || []).slice().sort(), b = (q.answer || []).slice().sort(); return a.length === b.length && a.every(function (x, i) { return x === b[i]; }); }
    if (q.type === 'match') { var pairs = (q.choices || []).map(function (s) { return String(s).split(/\s*\u2192\s*|\s*->\s*/); }); return pairs.every(function (p) { return ans && ans[p[0]] === p[1]; }); }
    if (q.type === 'sort') { var ok = true; Object.keys(q.answer || {}).forEach(function (bin) { q.answer[bin].forEach(function (it) { if (!ans || ans[it] !== bin) ok = false; }); }); return ok; }
    return String(ans || '').trim().split(/\s+/).filter(Boolean).length >= 5; // open response
  };
  // plain-text answers for the report / teacher view (the student's answer next to the key; no score)
  WC.answerText = function (q, ans) {
    if (ans == null || ans === '') return '(no answer)';
    if (Array.isArray(ans)) return ans.join(q.type === 'order' ? ' \u2192 ' : ', ');
    if (typeof ans === 'object') return Object.keys(ans).map(function (k) { return k + ' \u2192 ' + ans[k]; }).join('; ');
    return String(ans);
  };
  WC.keyText = function (q) {
    if (q.type === 'match') return (q.choices || []).join('; ');
    if (q.type === 'sort') return Object.keys(q.answer || {}).map(function (bin) { return bin + ': ' + q.answer[bin].join(', '); }).join('; ');
    if (q.type === 'order') return (q.answer || q.choices || []).join(' \u2192 ');
    if (q.type === 'multi') return (q.answer || []).join(', ');
    if (q.type === 'choice') return String(q.answer);
    return q.modelAnswer || '';
  };
  WC.finish = function (save, hid, now) { var a = WC.start(save, hid); a.done = true; a.finished = now || new Date().toISOString(); return a; };
  // tracker: each arc covers its TEKS; finished arcs count as done
  WC.historyTeks = function (save) {
    var cov = {}, done = {}, hs = (save.history && save.history.arcs) || {};
    WC.arcs().forEach(function (arc) { (arc.teks || []).forEach(function (t) { (cov[t] = cov[t] || []).push('History: ' + arc.title); if (hs[arc.id] && hs[arc.id].done) (done[t] = done[t] || []).push(arc.title); }); });
    return { covers: cov, done: done };
  };

  root.DAW_WORLDC = WC;
  if (typeof module !== 'undefined' && module.exports) module.exports = WC;
})(typeof window !== 'undefined' ? window : globalThis);
