/* Design a World: World Showcase / Expo capstone. Guided tour (5 required stops + student-chosen stops, with
   read-aloud narration), click-to-explore labels, Present mode, Standards Evidence (strong/weak/missing with Fix-it),
   checklist, reflection, peer feedback (Two Stars and a Wish, on this device or by feedback code), and exports
   (showcase PDF, offline slideshow HTML, labeled world PNG). Content: School Bot's showcase.json + showcase_prompts.json. */
(function () {
  'use strict';
  var S = window.DAW_STATE, WC = window.DAW_WORLDC, U = window.DAW_UI, A = window.DAW_ART, IT = window.DAW_ITEMS, M = window.DAW_MAP;
  var LZ = window.LZString;
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var SC = window.DAW_SHOWCASE = {};
  function app() { return window.DAW_APP; }
  function D() { return window.DAW_DESC; }
  function dx() { return D() && D().shared(); }
  function artOf(id) { return IT.get(id).art; }
  SC.data = function () { var w = WC && WC.data(); return (w && w.showcase) || {}; };
  SC.stops = function () { var d = SC.data(); return d.stops || []; };
  SC.stop = function (id) { return SC.stops().filter(function (s) { return s.id === id; })[0] || null; };
  SC.required = function () { return SC.stops().filter(function (s) { return s.liveTour === 'required'; }); };
  SC.choices = function () { return SC.stops().filter(function (s) { return s.liveTour !== 'required'; }); };
  SC.ensure = function (save) { var s = save.showcase = save.showcase || {}; s.picks = s.picks || []; s.checks = s.checks || {}; s.reflection = s.reflection || {}; s.self = s.self || {}; s.feedback = s.feedback || []; s.script = s.script || {}; return s; };
  SC.tour = function (save) { var sc = SC.ensure(save); return SC.stops().filter(function (s) { return s.liveTour === 'required' || sc.picks.indexOf(s.id) >= 0; }); };
  SC.tourReady = function (save) { var sc = SC.ensure(save); return sc.picks.filter(function (p) { var s = SC.stop(p); return s && s.liveTour !== 'required'; }).length >= 1; };
  SC.stopOfMission = function (mid) { return SC.stops().filter(function (s) { return (s.missions || []).indexOf(mid) >= 0; })[0] || null; };
  // self-assessment levels as words (saved as 1-4 for older saves; never shown as a number)
  SC.selfWord = function (v) {
    var sa = ((SC.data() || {}).reflection || {}).selfAssessment || [], scale = (sa[0] || {}).scale || '', m = new RegExp('(?:^|,)\\s*' + (+v) + '\\s*=\\s*([^,]+)').exec(scale);
    var w = m ? m[1].trim() : (['', 'not yet', 'getting there', 'I did it', 'I could teach it'][+v] || '');
    return w ? w.charAt(0).toUpperCase() + w.slice(1) : '';
  };
  // where each tour stop sits on the map: the first placed item from one of its missions (History Hall falls back to a history map mark)
  SC.pins = function (save, ix) {
    var used = {}, out = [];
    SC.tour(save).forEach(function (st, k) {
      var spot = null;
      (st.missions || []).some(function (mid) { var m = ix.byId[mid], t = m && save.world.tiles.filter(function (x) { return x.t === m.unlockItem; })[0]; if (t && !used[t.i + ',' + t.j]) { spot = { i: t.i, j: t.j }; return true; } return false; });
      if (!spot) ((save.history && save.history.marks) || []).some(function (mk) { if (mk.i != null && !used[mk.i + ',' + mk.j]) { spot = { i: mk.i, j: mk.j }; return true; } return false; });
      if (spot) { used[spot.i + ',' + spot.j] = 1; out.push({ n: k + 1, i: spot.i, j: spot.j, st: st }); }
    });
    return out;
  };
  // the world map with numbered tour-stop pins (cover slide, PDF cover)
  SC.pinnedMap = function (save, ix, opts) {
    var o = {}; Object.keys(opts || {}).forEach(function (k) { o[k] = opts[k]; }); o.ix = ix; o.forExport = true;
    return SC.addToSvg(M.build(save, o), SC.pins(save, ix).map(function (p) { var c = M.xy(p.i, p.j); return '<g class="sc-pin" transform="translate(' + c[0] + ' ' + (c[1] - 70) + ')" pointer-events="none"><circle r="16" fill="#c2255c" stroke="#fff" stroke-width="3"/><text y="6" text-anchor="middle" font-size="16" font-weight="800" fill="#fff" font-family="Lexend, Arial, sans-serif">' + p.n + '</text></g>'; }).join(''));
  };
  // map items can contain nested <svg> elements, so overlays go before the LAST closing tag
  SC.addToSvg = function (svg, extra) { var k = svg.lastIndexOf('</svg>'); return k < 0 ? svg + extra : svg.slice(0, k) + extra + svg.slice(k); };
  function stopTeks(st) { var t = st.teks || {}; if (Array.isArray(t)) return t; return [].concat(t.science || [], t.math || [], t.writing || [], t.socialStudies || []); }
  SC.stopTeks = stopTeks;
  SC.worldName = function (save) { var sc = SC.ensure(save); return sc.worldName || ((save.student.name || 'My') + '\u2019s World'); };

  // ---------- labels: the student's own work at each stop, each tagged with its TEKS ----------
  SC.labels = function (save, ix, st) {
    var out = [], x = dx(), Dd = D();
    (st.missions || []).forEach(function (mid) {
      var m = ix.byId[mid]; if (!m) return; var r = save.missions[mid], place = S.onMap(save, m.unlockItem) ? IT.name(save, m.unlockItem) : null;
      out.push({ kind: 'mission', id: mid, item: m.unlockItem, title: m.title, place: place, done: !!(r && r.done), text: r && r.done ? (r.explain.c + ' ' + r.explain.e + ' ' + r.explain.r).trim() : '', gt: r && r.gt || '', teks: S.covers(m).filter(function (v, k, a) { return a.indexOf(v) === k; }) });
    });
    var cats = st.evidenceCategories || [];
    if (x && save.describe) Object.keys(save.describe).forEach(function (k) {
      var rec = save.describe[k]; if (!rec || !rec.ok) return; var kind = k.split(':')[0], id = k.slice(kind.length + 1).split('@')[0];
      var want = (kind === 'lf' && cats.indexOf('landforms') >= 0) || (kind === 'org' && (cats.indexOf('organisms-adaptations') >= 0 || cats.indexOf('food-web') >= 0)) || (kind === 'ft' && (cats.indexOf('resources') >= 0 || cats.indexOf('energy-circuit') >= 0 || cats.indexOf('water-weather') >= 0)) || (kind === 'cmp' && cats.indexOf('organisms-adaptations') >= 0);
      if (!want) return; var th = Dd.side ? Dd.side(x, kind, id) : null, name = th ? th.name : (x.cmp && x.cmp[id] ? 'Compare: ' + id.replace(/-/g, ' ') : id);
      out.push({ kind: kind, id: k, title: (kind === 'org' ? 'Adaptations: ' : kind === 'lf' ? 'How it formed: ' : kind === 'cmp' ? '' : 'About: ') + name, text: rec.text || '', teks: (th && th.teks) || [], done: true });
    });
    (st.historyEvents || []).forEach(function (hid) {
      var arc = WC.arc(hid), a = save.history && save.history.arcs && save.history.arcs[hid]; if (!arc || !a) return;
      var ch = (arc.beats || []).map(function (b, bi) { var c = b.choices && b.choices[a.choices[bi]]; return c ? c.text : null; }).filter(Boolean);
      var art = Object.keys(save.writing || {}).filter(function (k) { return k.indexOf('h:' + hid + ':') === 0 && save.writing[k].words; }).map(function (k) { return save.writing[k]; })[0];
      var tn = arc.thenAndNow || {};
      out.push({ kind: 'history', id: hid, title: arc.title, done: !!a.done, text: 'My world chose: ' + ch.join(' Then: ') + '.', then: tn.what ? 'Then: ' + tn.what + (tn.when ? ' (' + tn.when + ')' : '') : '', artifact: art ? art.genre + ': ' + art.text : '', teks: arc.teks || [] });
    });
    if (cats.indexOf('economy') >= 0) { var b = IT.budget(save); out.push({ kind: 'economy', id: 'budget', title: 'My economy', text: 'Started with ' + b.start + ' coins, earned ' + (b.grants + b.income) + ', spent ' + b.spent + ', balance ' + b.balance + ' coins.', teks: ['SS.5.10A', 'SS.5.11A'].filter(function (t) { return ix.teks.some(function (r) { return r.id === t; }); }), done: true }); }
    if (cats.indexOf('history-then-and-now') >= 0 || cats.indexOf('government') >= 0) { var mt = WC.meters(save); if (Object.keys(save.history.arcs || {}).length) out.push({ kind: 'meters', id: 'meters', title: 'How my world is doing', text: 'Trust ' + mt.trust + ', unity ' + mt.unity + ', rights ' + mt.rights + ', economy ' + mt.economy + '.', teks: [], done: true }); }
    return out;
  };
  // narration lines with the student's own words filled in; unknown blanks stay as ___ for the student to fill
  SC.fill = function (save, ix, text, st) {
    var first = (SC.labels(save, ix, st).filter(function (l) { return l.place; })[0] || {}), arc = (st.historyEvents || []).map(function (h) { return save.history.arcs[h] && save.history.arcs[h].done ? WC.arc(h) : null; }).filter(Boolean)[0];
    var vals = { worldName: SC.worldName(save), name: save.student.name || 'your guide', place: first.place, landform: first.place };
    if (arc) { var tn = arc.thenAndNow || {}; vals.what = tn.what; vals.when = tn.when; vals.who = (tn.who || [])[0]; vals.outcome = tn.outcome; }
    return String(text || '').replace(/\{([^}]+)\}/g, function (x, k) { return vals[k] ? vals[k] : '___ (' + k.replace(/([A-Z])/g, ' $1').toLowerCase() + ')'; });
  };
  SC.script = function (save, ix, st) {
    var sc = SC.ensure(save); if (sc.script[st.id]) return sc.script[st.id]; var n = st.narration || {};
    return [n.opener].concat(n.lines || [], [n.transition]).filter(Boolean).map(function (l) { return SC.fill(save, ix, l, st); }).join('\n');
  };

  // ---------- Standards Evidence: strong / weak / missing for every TEKS, by School Bot's evidence rules ----------
  SC.rules = function () { var r = SC.data().evidenceRules || {}; var by = {}; (r.byCategory || []).forEach(function (c) { by[c.category] = c; }); (r.bySubject || []).forEach(function (c) { by[c.category] = c; }); return { levels: r.levels || { strong: 'Accurate, specific, and backed by evidence', weak: 'Partly accurate or general', missing: 'No explanation or evidence' }, by: by }; };
  var SUBJ_RULE = { science: 'science-overall', math: 'math-overall', writing: 'writing-overall', social_studies: 'socialStudies-overall' };
  function subjOf(c) { return String(c || '').replace('socialStudies', 'social_studies'); }
  // The rule for a TEKS row: the category of the stop where the student's mission for it is shown (same subject),
  // then a checklist item for that TEKS whose rule is in the same subject, then the subject-wide rule.
  SC.teksCategory = function (id, subject, missionIds) {
    var R = SC.rules().by, d = SC.data(), ok = function (cat) { return R[cat] && subjOf(R[cat].subject) === subject; };
    var mids = missionIds || []; for (var k = 0; k < mids.length; k++) { var st = SC.stopOfMission(mids[k]); if (!st) continue; var hit = Object.keys(R).filter(function (c) { return ok(c) && (R[c].stops || []).indexOf(st.id) >= 0; })[0] || (st.evidenceCategories || []).filter(ok)[0]; if (hit) return hit; }
    var ck = (d.checklist || []).filter(function (c) { return (c.teks || []).indexOf(id) >= 0 && ok(c.evidenceRule); })[0]; if (ck) return ck.evidenceRule;
    var st2 = SC.stops().filter(function (s) { return stopTeks(s).indexOf(id) >= 0; }).map(function (s) { return (s.evidenceCategories || []).filter(ok)[0]; }).filter(Boolean)[0]; if (st2) return st2;
    return SUBJ_RULE[subject] || 'science-overall';
  };
  function words(t) { return String(t || '').trim().split(/\s+/).filter(Boolean).length; }
  SC.evidence = function (save, ix) {
    var tr = S.tracker(save, ix), R = SC.rules(), rows = [];
    tr.rows.forEach(function (r) {
      var cat = SC.teksCategory(r.id, r.subject, (r.doneMissions && r.doneMissions.length ? r.doneMissions : r.missions)), rule = R.by[cat] || R.by[SUBJ_RULE[r.subject]] || {}, kw = (rule.keywords || []).map(function (k) { return k.toLowerCase(); }), status = 'missing', why = '', fix = null;
      var ms = r.missions.map(function (id) { return ix.byId[id]; }).filter(Boolean);
      if (r.done) {
        var strongM = r.doneMissions.filter(function (id) { var rec = save.missions[id], t = (rec.explain.c + ' ' + rec.explain.e + ' ' + rec.explain.r).toLowerCase(); return !rec.revealed && words(t) >= 20 && (!kw.length || kw.some(function (k) { return t.indexOf(k) >= 0; })) && !S.reviewReasons(save, ix, ix.byId[id]).length; });
        var guideOk = (r.guideDone || []).length > 0, histArt = (r.guideDone || []).some(function (g) { return WC.arcs().some(function (a) { return a.title === g && Object.keys(save.writing || {}).some(function (k) { return k.indexOf('h:' + a.id + ':') === 0 && save.writing[k].words >= 20; }); }); });
        // Field Guide: correct visual picks count as evidence; a written favorite on the same TEKS makes it strong.
        var FU = window.DAW_FUNC, ge = FU ? FU.guideEvidence(save, r.id) : { picks: [], written: [] }, guideStrong = ge.picks.length > 0 && ge.written.length > 0;
        if (strongM.length || histArt || guideStrong) { status = 'strong'; why = strongM.length ? 'Explained with evidence in \u201c' + ix.byId[strongM[0]].title + '\u201d.' : histArt ? 'History event finished with written ' + 'evidence.' : 'Correct picks in the Field Guide plus your written explanation (' + ge.written[0] + ').'; }
        else if (guideOk && !r.doneMissions.length) { status = 'weak'; why = ge.picks.length ? 'Correct picks in the Field Guide (' + ge.picks[0] + '). Star it as a favorite and write about it for stronger evidence.' : (ge.revealed || []).length ? 'The answer was shown; redo it on your own.' : 'Finished. Add a written explanation (20+ words) for stronger evidence.'; fix = { kind: 'guide' }; }
        else {
          status = 'weak'; var wid = r.doneMissions[0], wrec = wid && save.missions[wid];
          why = !wrec ? 'Finished, but add a written explanation with evidence.' : wrec.revealed ? 'The answer was shown; redo it on your own.' : S.reviewReasons(save, ix, ix.byId[wid]).length ? 'Needs review after a change in your world.' : words(wrec.explain.c + ' ' + wrec.explain.e + ' ' + wrec.explain.r) < 20 ? 'Your explanation is short. Add data or details (20+ words).' : 'Use the key words: ' + (rule.keywords || []).join(', ') + '.';
          if (wid) fix = { kind: 'explain', id: wid };
          if (ge.picks.length && !ge.written.length) why += ' Or star a Field Guide favorite for this and write about it.';
        }
      } else {
        why = ms.length ? 'Not finished yet.' : (r.guide || []).length ? 'Earn it in the ' + r.guide[0] + '.' : 'No activity in your world covers this yet.';
        if (ms.length) fix = { kind: 'mission', id: ms[0].id };
        else if ((r.guide || []).length) { var harc = WC.arcs().filter(function (a) { return (a.teks || []).indexOf(r.id) >= 0; })[0]; fix = harc ? { kind: 'history', id: harc.id } : { kind: 'guide' }; }
      }
      rows.push({ id: r.id, subject: r.subject, text: r.kid || r.text, category: cat, status: status, why: why, fix: fix, rule: rule[status] ? rule[status].description : (R.levels[status] || ''), teacherMove: rule.teacherMove || '' });
    });
    var cats = {}; rows.forEach(function (r) { var c = cats[r.category] = cats[r.category] || { category: r.category, strong: 0, weak: 0, missing: 0 }; c[r.status]++; });
    Object.keys(cats).forEach(function (k) { var c = cats[k]; c.status = c.missing === 0 && c.weak === 0 ? 'strong' : c.strong === 0 && c.weak === 0 ? 'missing' : 'weak'; });
    var n = { strong: 0, weak: 0, missing: 0 }; rows.forEach(function (r) { n[r.status]++; });
    return { rows: rows, categories: cats, counts: n, total: rows.length };
  };

  // ---------- peer feedback codes ----------
  SC.feedbackCode = function (fb) { var json = JSON.stringify(fb); return 'DAWF1.' + S.checksum(json) + '.' + LZ.compressToEncodedURIComponent(json); };
  SC.readFeedback = function (code) {
    var mm = /^DAWF(\d+)\.([0-9a-f]{8})\.([A-Za-z0-9+\-$]+)$/.exec(String(code || '').replace(/\s+/g, '')); if (!mm) return { ok: false, error: 'That is not a feedback code (they start with DAWF1.).' };
    var json = LZ.decompressFromEncodedURIComponent(mm[3]); if (!json) return { ok: false, error: 'The feedback code is incomplete.' };
    var fb; try { fb = JSON.parse(json); } catch (e) { return { ok: false, error: 'The feedback code is damaged.' }; }
    return { ok: S.checksum(json) === mm[2], verified: S.checksum(json) === mm[2], fb: fb, error: S.checksum(json) === mm[2] ? null : 'The feedback code was changed after it was made.' };
  };
  SC.addFeedback = function (save, fb) { var sc = SC.ensure(save); fb.at = fb.at || new Date().toISOString(); fb.id = fb.id || S.fnv1a(JSON.stringify(fb)); if (sc.feedback.some(function (f) { return f.id === fb.id; })) return false; sc.feedback.push(fb); return true; };
  SC.fields = function () { var f = ((SC.data().peerFeedback || {}).form || {}).fields; return f && f.length ? f : ['Visitor name', 'Stop I liked most', 'Star 1', 'Star 2', 'Wish', 'My question']; };

  // ---------- demo content (teacher preview / screenshots / tests) ----------
  SC.demo = function (save, ix) {
    var sc = SC.ensure(save), ch = SC.choices(); sc.picks = ch.slice(0, 2).map(function (s) { return s.id; }); sc.worldName = 'Harbor Bend';
    (SC.data().checklist || []).forEach(function (c, k) { if (k % 3 !== 2) sc.checks[c.id] = true; });
    ((SC.data().reflection || {}).prompts || []).slice(0, 3).forEach(function (p) { sc.reflection[p.id] = (p.frames || []).join(' ').replace(/\{[^}]+\}/g, 'my canyon and river'); });
    ((SC.data().reflection || {}).selfAssessment || []).forEach(function (c, k) { sc.self[c.criterion] = 3 + (k % 2); });
    sc.exit = 'One thing visitors learned from my world was how a river carves a canyon because my evidence showed the channel got deeper.';
    sc.wish = 'I would add a lake near the farms so the crops never dry out.';
    SC.addFeedback(save, { 'Visitor name': 'Ava', 'Tour guide name': save.student.name, 'World name': sc.worldName, 'Stop I liked most': 'Landform Trail', 'Star 1 (evidence I saw)': 'You used your stream table data to show the canyon got deeper.', 'Star 2 (science or history word used well)': 'You used the word deposition correctly at the delta.', 'Wish (one helpful suggestion)': 'I wish you would label the agent for each landform on the map.', 'My question': 'What would happen to the delta in a drought?', at: '2026-10-08T15:00:00.000Z' });
    return save;
  };

  // =================== UI (app only) ===================
  var TABS = [['tour', 'Tour'], ['explore', 'Explore'], ['evidence', 'Standards Evidence'], ['checklist', 'Checklist'], ['reflect', 'Reflection'], ['feedback', 'Peer feedback'], ['export', 'Share & export']];
  var STATUS_TXT = { strong: 'Strong', weak: 'Weak', missing: 'Missing' };
  function teksTags(t) { return (t || []).filter(function (v, k, a) { return a.indexOf(v) === k; }).map(function (id) { return '<span class="teks-chip">' + esc(id) + '</span>'; }).join(''); }
  function labelHtml(l) { return '<div class="sc-label k-' + esc(l.kind) + (l.done ? '' : ' todo') + '"><b>' + esc(l.title) + '</b>' + (l.place ? ' <small>at ' + esc(l.place) + '</small>' : '') + (l.text ? '<p>' + esc(l.text) + '</p>' : '<p class="small">Not finished yet.</p>') + (l.then ? '<p class="then">' + esc(l.then) + '</p>' : '') + (l.artifact ? '<p class="art"><i>' + esc(l.artifact.slice(0, 260)) + (l.artifact.length > 260 ? '\u2026' : '') + '</i></p>' : '') + '<div class="tags">' + teksTags(l.teks) + '</div></div>'; }
  SC.open = function (tab) {
    var save = app().save(), ix = app().ix(), sc = SC.ensure(save), md = U.modal({ title: 'World Showcase', full: true }); md.el.id = 'showcase-modal';
    var cur = tab || 'tour', stopIx = 0;
    function commit(q) { app().commit(q || null, { quiet: true, noRender: true }); }
    function paint() {
      md.body.innerHTML = '<div class="sc-head"><label class="wn">My world\u2019s name <input class="wname" maxlength="40" value="' + esc(SC.worldName(save)) + '"></label><button class="btn primary present-btn">' + A.icon('star', 16) + ' Present mode</button></div><div class="seg sc-tabs" role="tablist">' + TABS.concat(window.DAW_FUNUI && window.DAW_FUNUI.showcaseAchOn(save) ? [['myach', 'My Achievements']] : []).map(function (t) { return '<button class="seg-b' + (t[0] === cur ? ' on' : '') + '" role="tab" data-tab="' + t[0] + '">' + t[1] + '</button>'; }).join('') + '</div><div class="sc-body" data-tab="' + cur + '"></div>';
      var host = U.$('.sc-body', md.body);
      ({ tour: tour, explore: explore, evidence: evidence, checklist: checklist, reflect: reflect, feedback: feedback, export: exporter, myach: function (h) { window.DAW_FUNUI.showcaseAch(h); } })[cur](host);
    }
    function tour(host) {
      var req = SC.required(), chs = SC.choices(), t = SC.tour(save), st = t[Math.min(stopIx, t.length - 1)];
      host.innerHTML = '<div class="tour"><aside class="tour-stops"><h4>Required stops (' + req.length + ')</h4>' + req.map(function (s) { return '<button class="tstop req' + (st && s.id === st.id ? ' on' : '') + '" data-stop="' + esc(s.id) + '"><b>' + s.order + '. ' + esc(s.kidTitle) + '</b></button>'; }).join('') +
        '<h4>Pick at least one more</h4>' + chs.map(function (s) { var on = sc.picks.indexOf(s.id) >= 0; return '<label class="tpick' + (on ? ' on' : '') + '"><input type="checkbox" data-pick="' + esc(s.id) + '"' + (on ? ' checked' : '') + '> ' + esc(s.kidTitle) + (on ? ' <button class="btn small ghost go-stop" data-stop="' + esc(s.id) + '">Open</button>' : '') + '</label>'; }).join('') +
        (SC.tourReady(save) ? '<p class="small ok">' + A.icon('check', 14) + ' Your tour has ' + t.length + ' stops.</p>' : '<p class="small warn">Pick at least one more stop for your live tour.</p>') + '</aside>' +
        '<section class="tour-stop">' + (st ? stopPanel(st, t) : '') + '</section></div>';
    }
    function stopPanel(st, t) {
      var k = t.indexOf(st), labels = SC.labels(save, ix, st), fr = ((SC.data().frames || {}).byStop || {})[st.id] || [], voc = ((SC.data().frames || {}).vocabulary || {})[st.id] || [];
      return '<div class="stop-card" data-stop="' + esc(st.id) + '"><div class="sc-n">Stop ' + (k + 1) + ' of ' + t.length + (st.liveTour === 'required' ? ' \u00b7 required' : ' \u00b7 my choice') + ' \u00b7 about ' + (st.suggestedSeconds || 45) + ' seconds</div><h3>' + esc(st.kidTitle) + ': ' + esc(st.title) + '</h3><p class="lead">' + esc(st.worldFrame || '') + '</p><p><b>Your job:</b> ' + esc(st.prompt || '') + '</p>' +
        '<div class="narr"><h4>' + A.icon('flag', 15) + ' My tour script <span class="small">(edit it in your own words)</span></h4><textarea class="script" rows="5">' + esc(SC.script(save, ix, st)) + '</textarea><div class="btn-row left"><span class="say"></span><button class="btn small ghost reset-script">Start over from the narration</button></div></div>' +
        (st.mustShow && st.mustShow.length ? '<div class="must"><h4>Show visitors</h4><ul>' + st.mustShow.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div>' : '') +
        '<div class="labels"><h4>From my world</h4>' + (labels.length ? labels.map(labelHtml).join('') : '<p class="small">Build and finish the missions for this stop to fill it in.</p>') + '</div>' +
        (fr.length ? '<div class="frames"><h4>Sentence frames</h4><ul>' + fr.map(function (f) { return '<li>' + esc(f) + '</li>'; }).join('') + '</ul></div>' : '') + (voc.length ? '<p class="small"><b>Words to use:</b> ' + voc.map(esc).join(', ') + '</p>' : '') +
        '<div class="tags">' + teksTags(stopTeks(st)) + '</div><div class="btn-row">' + (k > 0 ? '<button class="btn ghost prev-stop">\u2190 Back</button>' : '') + (k < t.length - 1 ? '<button class="btn primary next-stop">Next stop \u2192</button>' : '<button class="btn primary present-btn">Present my tour \u2192</button>') + '</div></div>';
    }
    function explore(host) {
      var pins = {};
      SC.pins(save, ix).forEach(function (p) { pins[p.i + ',' + p.j] = { n: p.n, st: p.st }; });
      var svg = M.build(save, { ix: ix, full: true, labels: true, compass: true });
      var pinSvg = Object.keys(pins).map(function (key) { var p = key.split(','), pt = S.tileAt(save, +p[0], +p[1]), c = pt ? M.tileXY(pt) : M.xy(+p[0], +p[1]); return '<g class="sc-pin" transform="translate(' + c[0] + ' ' + (c[1] - 70) + ')" pointer-events="none"><circle r="15" fill="#c2255c" stroke="#fff" stroke-width="3"/><text y="5" text-anchor="middle" font-size="15" font-weight="800" fill="#fff" font-family="Lexend, sans-serif">' + pins[key].n + '</text></g>'; }).join('');
      host.innerHTML = '<p class="small">Tap any place on your world to see your labels. Numbered pins are your tour stops.</p><div class="explore"><div class="ex-map">' + SC.addToSvg(svg, pinSvg) + '</div><div class="ex-pop" aria-live="polite"><p class="small">Tap a place on the map.</p></div></div>';
      U.$('.ex-map', host).addEventListener('click', function (e) {
        var h = e.target.closest('[data-i]'); if (!h) return; var t = S.tileAt(save, +h.getAttribute('data-i'), +h.getAttribute('data-j')), pop = U.$('.ex-pop', host);
        if (!t) { pop.innerHTML = '<p class="small">Empty land.</p>'; return; }
        pop.innerHTML = SC.tileLabel(save, ix, t);
      });
    }
    function evidence(host) {
      var ev = SC.evidence(save, ix), lv = SC.rules().levels, subj = S.SUBJECTS;
      host.innerHTML = '<div class="ev-top"><div class="ev-count strong"><b>' + ev.counts.strong + '</b>Strong</div><div class="ev-count weak"><b>' + ev.counts.weak + '</b>Weak</div><div class="ev-count missing"><b>' + ev.counts.missing + '</b>Missing</div><p class="small">Strong: ' + esc(lv.strong) + '<br>Weak: ' + esc(lv.weak) + '<br>Missing: ' + esc(lv.missing) + '</p></div>' +
        '<div class="ev-cats">' + Object.keys(ev.categories).map(function (k) { var c = ev.categories[k]; return '<span class="ev-cat s-' + c.status + '">' + esc(k.replace(/-/g, ' ')) + ' <small>' + STATUS_TXT[c.status] + '</small></span>'; }).join('') + '</div>' +
        subj.map(function (sb) { var rs = ev.rows.filter(function (r) { return r.subject === sb.id; }); if (!rs.length) return ''; return '<h4>' + esc(sb.name) + ' <small>' + ['strong', 'weak', 'missing'].map(function (st) { return rs.filter(function (r) { return r.status === st; }).length + ' ' + STATUS_TXT[st].toLowerCase(); }).join(' \u00b7 ') + '</small></h4><table class="ev-table"><tr><th>TEKS</th><th>Skill</th><th>Status</th><th>Why</th><th></th></tr>' + rs.map(function (r) { return '<tr class="s-' + r.status + '" data-teks="' + esc(r.id) + '"><td><b>' + esc(r.id) + '</b></td><td>' + esc(r.text) + '</td><td><span class="ev-st s-' + r.status + '">' + STATUS_TXT[r.status] + '</span></td><td><small>' + esc(r.why) + '</small></td><td>' + (r.fix && r.status !== 'strong' ? '<button class="btn small ghost fixit" data-kind="' + esc(r.fix.kind) + '" data-id="' + esc(r.fix.id || '') + '">Fix it</button>' : '') + '</td></tr>'; }).join('') + '</table>'; }).join('');
    }
    function checklist(host) {
      var items = SC.data().checklist || [], n = items.filter(function (c) { return sc.checks[c.id]; }).length;
      host.innerHTML = '<p>Check each one when you can show it on your tour. This is your own checklist, not a score.</p>' + SC.stops().map(function (st) { var its = items.filter(function (c) { return c.stop === st.id; }); if (!its.length) return ''; return '<details class="ck-stop"' + (st.liveTour === 'required' || sc.picks.indexOf(st.id) >= 0 ? ' open' : '') + '><summary>' + esc(st.kidTitle) + (its.every(function (c) { return sc.checks[c.id]; }) ? ' <small>\u2714 all checked</small>' : '') + '</summary>' + its.map(function (c) { return '<label class="cbx"><input type="checkbox" data-ck="' + esc(c.id) + '"' + (sc.checks[c.id] ? ' checked' : '') + '> <span>' + esc(c.item) + '</span> ' + teksTags(c.teks) + '</label>'; }).join('') + '</details>'; }).join('');
    }
    function reflect(host) {
      var rf = SC.data().reflection || {}, ps = rf.prompts || [], need = rf.chooseAtLeast || 3, done = ps.filter(function (p) { return words(sc.reflection[p.id]) >= 10; }).length;
      host.innerHTML = '<p>Answer at least <b>' + need + '</b> of these (' + done + ' done).</p>' + ps.map(function (p) { return '<div class="rf"><label><b>' + esc(p.prompt) + '</b><span class="small">' + (p.frames || []).map(esc).join(' ') + '</span><textarea rows="4" data-rf="' + esc(p.id) + '">' + esc(sc.reflection[p.id] || '') + '</textarea></label><div class="tags">' + teksTags(p.teks) + '</div></div>'; }).join('') +
        ((rf.selfAssessment || []).length ? '<h4>How did I do? (for me, not a grade)</h4><table class="self self-words"><tr><th></th>' + [1, 2, 3, 4].map(function (v) { return '<th>' + esc(SC.selfWord(v)) + '</th>'; }).join('') + '</tr>' + rf.selfAssessment.map(function (c) { return '<tr><td>' + esc(c.question) + '</td>' + [1, 2, 3, 4].map(function (v) { return '<td><input type="radio" name="self-' + esc(c.criterion) + '" data-self="' + esc(c.criterion) + '" value="' + v + '"' + (sc.self[c.criterion] === v ? ' checked' : '') + ' aria-label="' + esc(SC.selfWord(v)) + '"></td>'; }).join('') + '</tr>'; }).join('') + '</table>' : '') +
        (rf.afterFeedback ? '<label class="field"><b>After feedback:</b> ' + esc(rf.afterFeedback) + '<textarea rows="3" class="wish">' + esc(sc.wish || '') + '</textarea></label>' : '') + (rf.exitTicket ? '<label class="field"><b>Exit ticket:</b> ' + esc(rf.exitTicket) + '<textarea rows="2" class="exit">' + esc(sc.exit || '') + '</textarea></label>' : '');
    }
    function feedback(host) {
      var g = SC.data().galleryWalk || {}, list = sc.feedback;
      host.innerHTML = '<p>' + esc(g.protocol || 'Two Stars and a Wish') + '</p><div class="btn-row left"><button class="btn primary add-fb">Add feedback on this device</button><a class="btn ghost" href="#feedback" target="_blank" rel="noopener">Open a visitor feedback form</a></div>' +
        '<div class="fb-import"><label class="field">Paste a visitor\u2019s feedback code <textarea rows="2" class="fb-code" placeholder="DAWF1..."></textarea></label><button class="btn ghost import-fb">Add feedback code</button></div>' +
        '<h4>Feedback I got (' + list.length + ')</h4>' + (list.length ? list.map(function (f) { return '<div class="fb-card">' + Object.keys(f).filter(function (k) { return ['at', 'id', 'v'].indexOf(k) < 0 && f[k]; }).map(function (k) { return '<p><b>' + esc(k) + ':</b> ' + esc(f[k]) + '</p>'; }).join('') + '</div>'; }).join('') : '<p class="small">No feedback yet.</p>');
    }
    function exporter(host) {
      host.innerHTML = '<ol class="ti-steps"><li><b>Showcase PDF</b> (every tour stop, my labels, Standards Evidence, reflection, and feedback). Choose <i>Save as PDF</i>. <button class="btn ghost sc-pdf">Print / Save as PDF</button></li><li><b>Slideshow</b>: one file that works offline in any browser (arrow keys). <button class="btn ghost sc-html">Download slideshow</button></li><li><b>Labeled world picture</b> (PNG) <button class="btn ghost sc-png">Download picture</button></li></ol><p class="small">These are also in <b>Turn in</b>.</p>';
    }
    md.body.addEventListener('click', function (e) {
      var t = e.target, b;
      if ((b = t.closest('.seg-b[data-tab]'))) { cur = b.getAttribute('data-tab'); paint(); return; }
      if (t.closest('.present-btn')) { md.close(); SC.present(); return; }
      if ((b = t.closest('.tstop, .go-stop'))) { e.preventDefault(); stopIx = SC.tour(save).map(function (s) { return s.id; }).indexOf(b.getAttribute('data-stop')); paint(); return; }
      if (t.closest('.next-stop')) { stopIx++; paint(); return; } if (t.closest('.prev-stop')) { stopIx = Math.max(0, stopIx - 1); paint(); return; }
      if (t.closest('.reset-script')) { var sid = t.closest('.stop-card').getAttribute('data-stop'); delete sc.script[sid]; commit(); paint(); return; }
      if ((b = t.closest('.fixit'))) { var kind = b.getAttribute('data-kind'), id = b.getAttribute('data-id'); md.close(); if (kind === 'mission') window.DAW_WORLDUI.go(id); else if (kind === 'explain') window.DAW_MISSION.open(id, { redo: true }); else if (kind === 'history') window.DAW_WORLDUI.history(id); else window.DAW_DESCUI.guide(); return; }
      if (t.closest('.add-fb')) { SC.feedbackForm('', { local: true, onDone: paint }); return; }
      if (t.closest('.import-fb')) { var r = SC.readFeedback(U.$('.fb-code', md.body).value); if (!r.fb) { U.toast(r.error, 'bad'); return; } if (!r.verified) U.toast(r.error, 'warn'); if (SC.addFeedback(save, r.fb)) { commit('Feedback added'); U.toast('Feedback added.', 'good'); } else U.toast('That feedback is already here.'); paint(); return; }
      if (t.closest('.sc-pdf')) SC.print(save, ix); if (t.closest('.sc-html')) SC.downloadSlides(save, ix); if (t.closest('.sc-png')) SC.downloadPng(save, ix);
    });
    md.body.addEventListener('change', function (e) {
      var t = e.target;
      if (t.matches('[data-pick]')) { var id = t.getAttribute('data-pick'); sc.picks = sc.picks.filter(function (p) { return p !== id; }); if (t.checked) sc.picks.push(id); commit(); paint(); }
      else if (t.matches('[data-ck]')) { if (t.checked) sc.checks[t.getAttribute('data-ck')] = true; else delete sc.checks[t.getAttribute('data-ck')]; commit(); }
      else if (t.matches('[data-self]')) { sc.self[t.getAttribute('data-self')] = +t.value; commit(); }
      else if (t.matches('.wname')) { sc.worldName = t.value.trim(); commit(); }
    });
    var tm = null;
    md.body.addEventListener('input', function (e) {
      var t = e.target;
      if (t.matches('.script')) sc.script[t.closest('.stop-card').getAttribute('data-stop')] = t.value;
      else if (t.matches('[data-rf]')) sc.reflection[t.getAttribute('data-rf')] = t.value;
      else if (t.matches('.wish')) sc.wish = t.value; else if (t.matches('.exit')) sc.exit = t.value; else return;
      clearTimeout(tm); tm = setTimeout(function () { commit(); }, 300); // keep every field right away; save once typing pauses
    });
    paint();
    var sayHost = function () { var s = U.$('.say', md.body); if (s && !s.firstChild) s.appendChild(U.speakBtn(function () { var ta = U.$('.script', md.body); return ta ? ta.value.replace(/___ \([^)]*\)/g, 'blank') : ''; })); };
    new MutationObserver(sayHost).observe(md.body, { childList: true, subtree: true }); sayHost();
    return md;
  };
  SC.tileLabel = function (save, ix, t) {
    var m = ix.byItem[t.t], st = m ? SC.stopOfMission(m.id) : null, x = dx(), Dd = D(), o = '<div class="tile-label"><h4>' + esc(IT.name(save, t.t)) + '</h4>';
    var c = M.tileCoord(t); o += '<p class="small">at (' + c.x + ', ' + c.y + ')' + (st ? ' \u00b7 tour stop: <b>' + esc(st.kidTitle) + '</b>' : '') + '</p>';
    if (m) { var r = save.missions[m.id]; o += r && r.done ? '<p><b>' + esc(m.title) + ':</b> ' + esc(r.explain.c) + ' ' + esc(r.explain.e) + '</p>' : '<p class="small">Mission not finished yet.</p>'; o += '<div class="tags">' + teksTags(S.covers(m)) + '</div>'; }
    if (x) { var th = Dd.thing(x, artOf(t.t)); if (th && save.describe[th.key]) o += '<p><b>Field Guide:</b> ' + esc(save.describe[th.key].text || '') + '</p><div class="tags">' + teksTags((th.def && th.def.teks) || []) + '</div>';
      (t.o || []).forEach(function (oid) { var g = x.org[oid], rec = save.describe['org:' + oid]; if (g) o += '<p><b>' + esc(g.name) + '</b>' + (rec && rec.ok ? ': ' + esc((rec.text || '').slice(0, 200)) : ' (adaptations not identified yet)') + '</p>'; }); }
    var mk = (save.history.marks || []).filter(function (h) { return h.i === t.i && h.j === t.j; }); mk.forEach(function (h) { o += '<p><b>History:</b> ' + esc(h.text) + '</p>'; });
    return o + '</div>';
  };
  // ---------- Present mode ----------
  function slides(save, ix) {
    var t = SC.tour(save), out = [{ title: SC.worldName(save), sub: 'A world tour by ' + (save.student.name || 'me'), map: true }];
    t.forEach(function (st, k) { out.push({ st: st, n: k + 1, title: st.kidTitle, sub: st.title, script: SC.script(save, ix, st), labels: SC.labels(save, ix, st).filter(function (l) { return l.done; }).slice(0, 4), teks: stopTeks(st) }); });
    out.push({ title: 'Thank you!', sub: 'Questions? Visitors: please leave Two Stars and a Wish.', end: true });
    return out;
  }
  function slideHtml(s, save, ix) {
    if (s.map) return '<div class="slide cover"><h1>' + esc(s.title) + '</h1><p>' + esc(s.sub) + '</p><div class="sl-map">' + SC.pinnedMap(save, ix, { labels: true, compass: true }) + '</div></div>';
    if (s.end) return '<div class="slide end"><h1>' + esc(s.title) + '</h1><p>' + esc(s.sub) + '</p></div>';
    return '<div class="slide stop"><div class="sl-n">Stop ' + s.n + '</div><h1>' + esc(s.title) + '</h1><h2>' + esc(s.sub) + '</h2><div class="sl-cols"><div class="sl-script">' + esc(s.script).replace(/\n/g, '<br>') + '</div><div class="sl-labels">' + s.labels.map(function (l) { return '<div class="sl-l"><b>' + esc(l.title) + '</b><span>' + esc((l.text || '').slice(0, 180)) + '</span><small>' + esc((l.teks || []).slice(0, 5).join(' \u00b7 ')) + '</small></div>'; }).join('') + '</div></div><div class="sl-teks">' + esc(s.teks.join(' \u00b7 ')) + '</div></div>';
  }
  SC.present = function () {
    var save = app().save(), ix = app().ix(), ss = slides(save, ix), k = 0, ov = U.el('div', { class: 'present', id: 'present', role: 'dialog', 'aria-label': 'Present mode' });
    function show() { ov.innerHTML = slideHtml(ss[k], save, ix) + '<div class="pr-bar"><button class="btn ghost pr-prev" aria-label="Previous">\u2190</button><span class="pr-n">' + (k + 1) + ' / ' + ss.length + '</span><span class="pr-say"></span><button class="btn ghost pr-next" aria-label="Next">\u2192</button><button class="btn ghost pr-x">Exit (Esc)</button></div>'; U.$('.pr-say', ov).appendChild(U.speakBtn(function () { return (ss[k].script || ss[k].title + '. ' + (ss[k].sub || '')).replace(/___ \([^)]*\)/g, 'blank'); })); }
    function key(e) { if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') { e.preventDefault(); k = Math.min(ss.length - 1, k + 1); show(); } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { k = Math.max(0, k - 1); show(); } else if (e.key === 'Escape') close(); }
    function close() { document.removeEventListener('keydown', key); ov.remove(); try { if (document.fullscreenElement) document.exitFullscreen(); } catch (er) {} }
    ov.addEventListener('click', function (e) { if (e.target.closest('.pr-next')) { k = Math.min(ss.length - 1, k + 1); show(); } else if (e.target.closest('.pr-prev')) { k = Math.max(0, k - 1); show(); } else if (e.target.closest('.pr-x')) close(); });
    document.addEventListener('keydown', key); document.body.appendChild(ov); show();
    try { if (ov.requestFullscreen && !app().testMode) ov.requestFullscreen().catch(function () {}); } catch (er) {}
    var sc = SC.ensure(save); sc.presented = new Date().toISOString(); app().commit(null, { quiet: true, noRender: true });
    return { next: function () { k = Math.min(ss.length - 1, k + 1); show(); }, close: close, count: ss.length };
  };
  // ---------- peer feedback form (presenter's device or a visitor's own device) ----------
  SC.feedbackForm = function (prefill, o) {
    o = o || {}; var save = app().save(), g = SC.data().galleryWalk || {}, md = U.modal({ title: 'Two Stars and a Wish', wide: true }); md.el.id = 'feedback-modal';
    var f = SC.fields(), local = !!o.local;
    md.body.innerHTML = '<p class="small">' + esc((g.norms || []).join(' ')) + '</p>' + f.map(function (k, i) { var star = /star/i.test(k), wish = /wish/i.test(k), q = /question/i.test(k); var val = /tour guide/i.test(k) && local ? save.student.name : /world name/i.test(k) && local ? SC.worldName(save) : ''; return '<label class="field">' + esc(k) + (star || wish || q ? '<textarea rows="2" data-f="' + i + '">' + esc(val) + '</textarea><span class="fb-frames">' + ((star ? g.starFrames : wish ? g.wishFrames : g.questionStems) || []).slice(0, 3).map(function (x) { return '<button type="button" class="ins frame" data-t="' + esc(x) + '">' + esc(x) + '</button>'; }).join('') + '</span>' : '<input data-f="' + i + '" value="' + esc(val) + '">') + '</label>'; }).join('') +
      '<div class="btn-row">' + (local ? '<button class="btn primary save-fb">Add to this world</button>' : '<button class="btn primary make-code">Make my feedback code</button>') + '</div><div class="fb-out"></div>';
    U.$$('.frame', md.body).forEach(function (b) { b.onclick = function () { var ta = b.closest('label').querySelector('textarea'); ta.value = b.getAttribute('data-t'); ta.focus(); }; });
    function read() { var fb = {}; f.forEach(function (k, i) { var el = U.$('[data-f="' + i + '"]', md.body); if (el && el.value.trim()) fb[k] = el.value.trim(); }); fb.v = 1; fb.at = new Date().toISOString(); return fb; }
    function enough(fb) { return Object.keys(fb).filter(function (k) { return /star|wish/i.test(k); }).length >= 2; }
    if (U.$('.save-fb', md.body)) U.$('.save-fb', md.body).onclick = function () { var fb = read(); if (!enough(fb)) { U.$('.fb-out', md.body).innerHTML = '<div class="fb bad">Write at least one star and a wish.</div>'; return; } SC.addFeedback(save, fb); app().commit('Feedback added', { quiet: true, noRender: true }); md.close(); U.toast('Thank you! Feedback saved.', 'good'); if (o.onDone) o.onDone(); };
    if (U.$('.make-code', md.body)) U.$('.make-code', md.body).onclick = function () { var fb = read(); if (!enough(fb)) { U.$('.fb-out', md.body).innerHTML = '<div class="fb bad">Write at least one star and a wish.</div>'; return; } var code = SC.feedbackCode(fb); U.$('.fb-out', md.body).innerHTML = '<p>Give this code to the tour guide (they paste it in <b>Showcase \u2192 Peer feedback</b>):</p><textarea class="fb-made" rows="3" readonly>' + esc(code) + '</textarea>'; };
    return md;
  };

  // ---------- exports ----------
  SC.printHtml = function (save, ix) {
    var t = SC.tour(save), ev = SC.evidence(save, ix), sc = SC.ensure(save), rf = SC.data().reflection || {}, o = ['<article class="report showcase-print">'];
    o.push('<section class="sp-page cover"><h1>' + esc(SC.worldName(save)) + '</h1><p><b>World Showcase</b> by ' + esc(save.student.name || 'Student') + (save.student.period ? ' \u00b7 Period ' + esc(save.student.period) : '') + '</p><div class="r-map">' + SC.pinnedMap(save, ix, { labels: true, legend: true, compass: true, scale: true }) + '</div><p>Tour: ' + t.map(function (s, k) { return (k + 1) + '. ' + esc(s.kidTitle); }).join(' \u00b7 ') + '</p></section>');
    t.forEach(function (st, k) { o.push('<section class="sp-page"><h2>Stop ' + (k + 1) + ': ' + esc(st.kidTitle) + ' \u2014 ' + esc(st.title) + '</h2><p><i>' + esc(st.worldFrame || '') + '</i></p><h3>My tour script</h3><p class="sp-script">' + esc(SC.script(save, ix, st)).replace(/\n/g, '<br>') + '</p><h3>From my world</h3>' + SC.labels(save, ix, st).map(labelHtml).join('') + '<p class="small">TEKS: ' + esc(stopTeks(st).join(', ')) + '</p></section>'); });
    o.push('<section class="sp-page"><h2>Standards Evidence</h2><p>Strong ' + ev.counts.strong + ' \u00b7 Weak ' + ev.counts.weak + ' \u00b7 Missing ' + ev.counts.missing + ' \u2014 statuses for your teacher, not a grade</p><table class="r-table small"><tr><th>TEKS</th><th>Status</th><th>Why</th></tr>' + ev.rows.map(function (r) { return '<tr><td>' + esc(r.id) + '</td><td>' + STATUS_TXT[r.status] + '</td><td>' + esc(r.why) + '</td></tr>'; }).join('') + '</table></section>');
    o.push('<section class="sp-page"><h2>Reflection</h2>' + (rf.prompts || []).filter(function (p) { return sc.reflection[p.id]; }).map(function (p) { return '<h3>' + esc(p.prompt) + '</h3><p>' + esc(sc.reflection[p.id]) + '</p>'; }).join('') + (Object.keys(sc.self).length ? '<h3>Self-assessment</h3><ul>' + Object.keys(sc.self).map(function (k) { return '<li>' + esc(k) + ': ' + esc(SC.selfWord(sc.self[k])) + '</li>'; }).join('') + '</ul>' : '') + (sc.wish ? '<h3>After feedback</h3><p>' + esc(sc.wish) + '</p>' : '') + (sc.exit ? '<h3>Exit ticket</h3><p>' + esc(sc.exit) + '</p>' : '') +
      '<h2>Peer feedback</h2>' + (sc.feedback.length ? sc.feedback.map(function (f) { return '<div class="fb-card">' + Object.keys(f).filter(function (k) { return ['at', 'id', 'v'].indexOf(k) < 0; }).map(function (k) { return '<p><b>' + esc(k) + ':</b> ' + esc(f[k]) + '</p>'; }).join('') + '</div>'; }).join('') : '<p class="small">None yet.</p>') + '</section></article>');
    return o.join('');
  };
  SC.print = function (save, ix) {
    var area = document.getElementById('print-area'); area.innerHTML = SC.printHtml(save, ix); document.body.classList.add('printing');
    var done = function () { document.body.classList.remove('printing'); window.removeEventListener('afterprint', done); }; window.addEventListener('afterprint', done);
    setTimeout(function () { window.print(); setTimeout(done, 1500); }, 250);
  };
  var SLIDE_CSS = 'body{margin:0;font-family:Lexend,Arial,sans-serif;background:#0b1d3a;color:#13294B}.slide{display:none;box-sizing:border-box;width:100vw;height:100vh;padding:4vh 5vw;background:#f4f8fb;overflow:hidden}.slide.on{display:block}h1{font-size:6vh;margin:0 0 1vh}h2{font-size:3.4vh;color:#5b6b7b;margin:0 0 2vh}.sl-n{font-weight:800;color:#c2255c;font-size:2.4vh}.sl-cols{display:grid;grid-template-columns:1.1fr 1fr;gap:3vw}.sl-script{font-size:3vh;line-height:1.45;background:#fff;border-radius:14px;padding:2vh 2vw;border-left:8px solid #c2255c}.sl-l{background:#fff;border-radius:12px;padding:1.4vh 1.2vw;margin-bottom:1.4vh;display:flex;flex-direction:column;gap:.5vh;font-size:2vh}.sl-l small{color:#1e78c8;font-weight:700}.sl-teks{position:absolute;bottom:7vh;font-size:1.8vh;color:#5b6b7b}.cover .sl-map svg{width:100%;max-height:72vh}.end{display:none;text-align:center;padding-top:30vh}.end.on{display:block}nav{position:fixed;bottom:1.5vh;right:2vw;display:flex;gap:8px;align-items:center;color:#13294B;font-weight:700;font-size:14px}nav button{font:inherit;padding:6px 14px;border-radius:8px;border:0;background:#13294B;color:#fff;cursor:pointer}';
  SC.slidesHtml = function (save, ix) {
    var ss = slides(save, ix);
    return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>' + esc(SC.worldName(save)) + ' \u2014 World Showcase</title><style>' + SLIDE_CSS + '</style></head><body>' +
      ss.map(function (s, k) { return slideHtml(s, save, ix).replace('class="slide', 'class="slide' + (k === 0 ? ' on' : '')); }).join('') +
      '<nav><button id="p" aria-label="Previous">\u2190</button><span id="n"></span><button id="x" aria-label="Next">\u2192</button></nav><script>(function(){var s=document.querySelectorAll(".slide"),k=0;function g(d){s[k].classList.remove("on");k=Math.max(0,Math.min(s.length-1,k+d));s[k].classList.add("on");document.getElementById("n").textContent=(k+1)+" / "+s.length;}document.getElementById("p").onclick=function(){g(-1)};document.getElementById("x").onclick=function(){g(1)};document.addEventListener("keydown",function(e){if(e.key==="ArrowRight"||e.key===" ")g(1);if(e.key==="ArrowLeft")g(-1);});g(0);})();<\/script><p hidden>Made with Design a World. Works offline; nothing is sent anywhere.</p></body></html>';
  };
  SC.downloadSlides = function (save, ix) { U.download(S.fileName(save, 'Showcase') + '.html', new Blob([SC.slidesHtml(save, ix)], { type: 'text/html' })); U.toast('Slideshow downloaded. Open it in any browser, even offline.', 'good'); };
  SC.png = function (save, ix) {
    var t = SC.tour(save), pins = SC.pins(save, ix);
    var svg = SC.addToSvg(M.build(save, { ix: ix, forExport: true, labels: true, compass: true, scale: true }), pins.map(function (p) { var c = M.xy(p.i, p.j); return '<g transform="translate(' + c[0] + ' ' + (c[1] - 70) + ')"><circle r="16" fill="#c2255c" stroke="#fff" stroke-width="3"/><text y="6" text-anchor="middle" font-size="16" font-weight="800" fill="#fff" font-family="Lexend, Arial, sans-serif">' + p.n + '</text></g>'; }).join(''));
    return new Promise(function (res, rej) {
      var img = new Image(); img.onerror = rej; img.onload = function () {
        var W = 1800, H = 1100, c = document.createElement('canvas'); c.width = W; c.height = H; var x = c.getContext('2d'), F = 'Lexend, Arial, sans-serif';
        x.fillStyle = '#f4f8fb'; x.fillRect(0, 0, W, H); x.fillStyle = '#13294B'; x.fillRect(0, 0, W, 100); x.fillStyle = '#fff'; x.font = '800 40px ' + F; x.fillText(SC.worldName(save), 36, 62); x.font = '400 20px ' + F; x.fillText('World Showcase by ' + (save.student.name || 'Student'), 36, 90);
        x.fillStyle = '#fff'; x.fillRect(24, 120, 1260, 760); x.drawImage(img, 24, 121, 1260, 772);
        var y = 160; x.fillStyle = '#13294B'; x.font = '800 26px ' + F; x.fillText('Tour stops', 1310, y); y += 40;
        t.forEach(function (st, k) { x.fillStyle = '#c2255c'; x.beginPath(); x.arc(1326, y - 8, 14, 0, 7); x.fill(); x.fillStyle = '#fff'; x.font = '800 15px ' + F; x.textAlign = 'center'; x.fillText(String(k + 1), 1326, y - 3); x.textAlign = 'left'; x.fillStyle = '#13294B'; x.font = '700 19px ' + F; x.fillText(st.kidTitle, 1350, y); x.font = '400 14px ' + F; x.fillStyle = '#5b6b7b'; x.fillText(stopTeks(st).slice(0, 6).join(' \u00b7 '), 1350, y + 20); y += 52; });
        var ev = SC.evidence(save, ix); y = 930; x.fillStyle = '#13294B'; x.font = '800 24px ' + F; x.fillText('Standards evidence: ' + ev.counts.strong + ' strong \u00b7 ' + ev.counts.weak + ' weak \u00b7 ' + ev.counts.missing + ' missing', 36, y);
        var lab = save.world.tiles.filter(function (tl) { return save.names[tl.t]; }).slice(0, 8).map(function (tl) { var c2 = M.tileCoord(tl); return save.names[tl.t] + ' (' + c2.x + ', ' + c2.y + ')'; }); x.font = '400 18px ' + F; x.fillStyle = '#343a40'; x.fillText('Named places: ' + (lab.join(' \u00b7 ') || 'none yet'), 36, y + 40);
        x.fillStyle = '#13294B'; x.fillRect(0, H - 44, W, 44); x.fillStyle = '#fff'; x.font = '400 15px ' + F; x.fillText('Design a World \u00b7 made ' + new Date().toLocaleDateString() + ' \u00b7 labels show the student\u2019s own places and tour stops', 36, H - 16);
        c.toBlob(function (b) { res(b); }, 'image/png');
      };
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    });
  };
  SC.downloadPng = function (save, ix) { return SC.png(save, ix).then(function (b) { U.download(S.fileName(save, 'Showcase') + '.png', b); U.toast('Labeled world picture downloaded.', 'good'); }).catch(function (e) { U.toast('Could not make the picture: ' + e, 'bad'); }); };
  // ---------- report sections (turn-in PDF and teacher.html) ----------
  SC.reportSection = function (save, ix) {
    var sc = SC.ensure(save); if (!SC.stops().length) return '';
    var ev = SC.evidence(save, ix), t = SC.tour(save), items = SC.data().checklist || [], ck = items.filter(function (c) { return sc.checks[c.id]; }).length, rf = SC.data().reflection || {};
    return '<section class="r-showcase"><h2>World Showcase</h2><p><b>' + esc(SC.worldName(save)) + '</b> \u00b7 tour: ' + t.map(function (s) { return esc(s.kidTitle); }).join(', ') + (SC.tourReady(save) ? '' : ' <span class="r-warn">(needs one more chosen stop)</span>') + (ck ? ' \u00b7 ' + ck + ' checklist items checked' : '') + (sc.presented ? ' \u00b7 presented' : '') + '</p>' +
      '<p><b>Standards Evidence:</b> ' + ev.counts.strong + ' strong \u00b7 ' + ev.counts.weak + ' weak \u00b7 ' + ev.counts.missing + ' missing</p>' +
      ((rf.prompts || []).filter(function (p) { return sc.reflection[p.id]; }).map(function (p) { return '<p><b>' + esc(p.prompt) + '</b><br>' + esc(sc.reflection[p.id]) + '</p>'; }).join('')) + (Object.keys(sc.self).length ? '<p><b>Self-assessment:</b> ' + Object.keys(sc.self).map(function (k) { return esc(k) + ': ' + esc(SC.selfWord(sc.self[k])); }).join(' \u00b7 ') + '</p>' : '') + (sc.exit ? '<p><b>Exit ticket:</b> ' + esc(sc.exit) + '</p>' : '') +
      (sc.feedback.length ? '<p><b>Peer feedback (' + sc.feedback.length + '):</b></p>' + sc.feedback.map(function (f) { return '<div class="fb-card">' + Object.keys(f).filter(function (k) { return ['at', 'id', 'v'].indexOf(k) < 0; }).map(function (k) { return '<b>' + esc(k) + ':</b> ' + esc(f[k]); }).join('<br>') + '</div>'; }).join('') : '') + '</section>';
  };
})();
