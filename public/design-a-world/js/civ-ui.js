/* Design a World: civilization layer UI (god game). Year bar + time-speed control over the map, settlements drawn on
   the island, and the Civilization dialog (problem, regions, prices, government, timeline, Then & Now).
   Statuses and counts only: no scores. Time pauses for decisions, when a dialog is open, and when the tab is hidden. */
(function () {
  'use strict';
  var U = window.DAW_UI, S = window.DAW_STATE, CC = window.DAW_CIVC, esc = U.esc;
  var Q = new URLSearchParams(location.search);
  var CU = window.DAW_CIVUI = {}, timer = null, lastTick = 0, md = null, tab = 'problem', sortAns = {}, picks = [], draft = {};
  var SPEEDS = [{ n: 0, label: 'Pause', ms: 0, icon: '&#10074;&#10074;' }, { n: 1, label: 'Slow', ms: 4000, icon: '&#9654;' }, { n: 2, label: 'Medium', ms: 2000, icon: '&#9654;&#9654;' }, { n: 3, label: 'Fast', ms: 1000, icon: '&#9654;&#9654;&#9654;' }];
  var SYS_ICON = { settle: '&#8962;', trade: '&#162;', move: '&#10140;', gov: '&#9878;', env: '&#10047;' };
  function app() { return window.DAW_APP; }
  function save() { return app().save(); }
  function ix() { return app().ix(); }
  function WC() { return window.DAW_WORLDC; }
  CC.install(S, window.DAW_PACKS || {}, { artOf: function (id) { return window.DAW_ITEMS.get(id).art; }, scan: function (t) { return WC() ? WC().scanText(t) : []; } });

  // teacher's grade choice (teacher.html writes it on this computer; ?grade= works on any computer)
  CU.teacherGrade = function () { var g = Q.get('grade'); if (g) return g; try { return localStorage.getItem('daw.teacher.grade') || null; } catch (e) { return null; } };
  CU.grade = function () { return CC.gradeOf(save(), CU.teacherGrade()); };
  function civ() { return CC.ensure(save()); }
  function coord(i, j) { var c = window.DAW_MAP.coord(i, j); return '(' + c.x + ', ' + c.y + ')'; }
  function pname(pid) { var p = CC.problem(save(), pid); return p ? p.title : pid; }

  CU.svg = function (sv, xy) { return CC.svgLayer(sv, xy); };

  // ---------- the bar over the map ----------
  CU.bar = function () {
    var host = document.getElementById('civ-bar'); if (!host || !save()) return; if (window.DAW_GCUI) window.DAW_GCUI.applyMode(); var c = civ(), g = CU.grade(), info = CC.packInfo(g);
    if (!c.started) {
      host.innerHTML = '<span class="civ-ic" aria-hidden="true">&#9878;</span>' + (CC.ready(g) ? '<span><b>Civilizations</b> <small>' + esc(info.title) + '</small></span><button class="btn small primary civ-start">Start civilizations</button>' : '<span><b>Civilizations</b> <small>' + esc(info ? info.title : g) + ': coming soon</small></span>');
    } else {
      var act = CC.active(save()), st = CC.byState(save()), sp = SPEEDS[c.speed] || SPEEDS[1], waiting = act && CC.stateOf(save(), act.id) === 'open';
      host.innerHTML = '<span class="civ-year" title="Year on your island"><small>Year</small><b>' + c.year + '</b></span><span class="civ-speed" role="radiogroup" aria-label="Time speed">' + SPEEDS.map(function (s) { return '<button class="civ-sp' + (c.speed === s.n ? ' on' : '') + '" role="radio" aria-checked="' + (c.speed === s.n) + '" data-n="' + s.n + '" title="' + s.label + '" aria-label="' + s.label + '">' + s.icon + '</button>'; }).join('') + '</span>' +
        '<span class="civ-pop" title="Settlements and families">' + c.setts.length + ' settlement' + (c.setts.length === 1 ? '' : 's') + ' &middot; ' + CC.totalPop(save()) + ' families</span>' +
        (waiting ? '<button class="btn small civ-alert" title="A problem needs your decision. Time waits for you.">&#9873; ' + esc(act.title) + '</button>' : act ? '<button class="btn small civ-land">&#127912; Reshape the land</button>' : st.reflect.length ? '<button class="btn small civ-think">&#9998; Look back (' + st.reflect.length + ')</button>' : '') +
        '<button class="btn small ghost civ-open">Civilization</button>' + (window.DAW_NATUI ? window.DAW_NATUI.barHtml() : '');
      host.classList.toggle('paused', !!waiting || c.speed === 0);
    }
    host.hidden = false;
    if (window.DAW_FUNUI && window.DAW_FUNUI.dock) window.DAW_FUNUI.dock();
  };
  function onBar(e) {
    var b = e.target; if (b.closest('.nat-shape')) { window.DAW_NATUI.open(); return; } if (b.closest('.civ-start')) { CU.start(); return; }
    var sp = b.closest('.civ-sp'); if (sp) { civ().speed = +sp.getAttribute('data-n'); app().commit('Time speed', { noRender: true, noFun: true }); CU.bar(); CU.schedule(); return; }
    if (b.closest('.civ-alert') || b.closest('.civ-open') || b.closest('.civ-land') || b.closest('.civ-think')) CU.open(b.closest('.civ-think') ? 'problem' : null);
  }
  CU.start = function () {
    var r = CC.start(save(), ix(), CU.grade()); if (!r.ok) { U.toast(r.reason === 'coming-soon' ? 'This grade pack is coming soon.' : 'Civilizations already started.'); return; }
    app().commit('Civilizations started'); U.toast('Settlers are coming. Time waits while you decide.', 'good'); CU.open('problem');
  };

  // ---------- time ----------
  CU.schedule = function () {
    if (timer) clearInterval(timer); timer = null; if (app().testMode || Q.get('civ') === 'manual') return;
    timer = setInterval(function () { var c = save() && save().civ; if (!c || !c.started) return; var sp = SPEEDS[c.speed] || SPEEDS[0]; if (!sp.ms || document.hidden || document.querySelector('.modal-wrap') || window.DAW_APP.tool() === 'biome') return; var now = Date.now(); if (now - lastTick < sp.ms) return; lastTick = now; CU.advance(1); }, 500);
  };
  CU.advance = function (n) {
    var changed = false, opened = null, unf = [];
    for (var k = 0; k < (n || 1); k++) { var r = CC.tick(save(), ix()); if (r.paused) break; if (r.founded.length || r.grew.length || (r.nature || []).length) changed = true; if (window.DAW_NATUI) window.DAW_NATUI.natureToasts(r.nature); if (r.opened) opened = r.opened; unf = unf.concat(r.unfolded); r.founded.forEach(function (f) { U.toast('&#8962; ' + esc(f.name) + ' is founded at ' + coord(f.i, f.j) + '.', 'good', 3500); }); r.grew.forEach(function (g) { var s = civ().setts.filter(function (x) { return x.id === g.id; })[0]; U.toast(esc(s.name) + ' is now a ' + g.level + '.', 'good', 3000); }); if (opened) break; }
    app().commit('Time passes', { noRender: !changed, noFun: true }); CU.bar();
    unf.slice(-2).forEach(function (u) { U.toast(esc(u.text), '', 4500); });
    if (opened) { U.toast('&#9873; A new problem needs you: ' + esc(pname(opened)), 'warn', 4000); }
    return { changed: changed, opened: opened };
  };
  CU.afterCommit = function () { if (!save() || !save().civ || !save().civ.started) return; if (window.DAW_NATUI) window.DAW_NATUI.afterCommit(); var hit = CC.checkLand(save()); if (hit.length) { U.toast('Land reshaped. Now watch what happens over the years.', 'good'); } CU.bar(); };

  // ---------- dialog ----------
  CU.open = function (which) {
    if (md) md.close(); tab = which || tab || 'problem'; if (!civ().started) { CU.start(); return; }
    md = U.modal({ title: 'Civilization: ' + ((CC.pack(civ().grade) || {}).title || ''), wide: true, onClose: function () { md = null; CU.bar(); } }); md.el.id = 'civ-modal'; draw();
  };
  CU.close = function () { if (md) md.close(); };
  var TABS = [['problem', 'Problem'], ['regions', 'Regions'], ['prices', 'Prices'], ['gov', 'Government'], ['timeline', 'Timeline'], ['history', 'Then & Now'], ['stretch', 'Stretch (Gr 6)']];
  function draw() {
    if (!md) return; var st = CC.byState(save());
    md.body.innerHTML = '<div class="tabs civ-tabs">' + TABS.map(function (t) { return '<button class="tab' + (tab === t[0] ? ' on' : '') + '" data-t="' + t[0] + '">' + t[1] + (t[0] === 'problem' && (st.open.length + st.reflect.length + st.land.length) ? ' <span class="tab-n">' + (st.open.length + st.reflect.length + st.land.length) + '</span>' : '') + '</button>'; }).join('') + '</div><div class="civ-body">' + ({ problem: problemTab, regions: regionsTab, prices: pricesTab, gov: govTab, timeline: timelineTab, history: historyTab, stretch: function () { return window.DAW_GCUI ? window.DAW_GCUI.stretchHtml() : ''; } }[tab] || problemTab)() + '</div>';
    md.body.onclick = onClick; md.body.oninput = onInput;
  }
  CU.tab = function (t) { tab = t; draw(); };
  function meters() { var c = civ(); return '<div class="civ-meters">' + CC.METERS.map(function (k) { var v = c.m[k] || 0; return '<span class="civ-m ' + (v > 0 ? 'up' : v < 0 ? 'down' : '') + '"><small>' + CC.METER_NAMES[k] + '</small><b>' + CC.status(v) + '</b></span>'; }).join('') + '</div>'; }
  function sysChip(p) { var sy = ((CC.pack(civ().grade) || {}).systems || []).filter(function (s) { return s.id === p.system; })[0] || { name: p.system }; return '<span class="civ-sys sys-' + esc(p.system) + '">' + (SYS_ICON[p.system] || '') + ' ' + esc(sy.name) + '</span>'; }
  function problemTab() {
    var sv = save(), act = CC.active(sv), st = CC.byState(sv), o = [meters()];
    if (window.DAW_GCUI) o.push(window.DAW_GCUI.predHtml());
    if (act) o.push(problemCard(act));
    if (st.reflect.length) st.reflect.forEach(function (p) { o.push(reflectCard(p)); });
    st.unfolding.forEach(function (p) { o.push(unfoldCard(p)); });
    if (!act && !st.reflect.length && !st.unfolding.length) o.push('<div class="civ-quiet"><h3>All is calm for now</h3>' + (window.DAW_NATC && window.DAW_NATC.hint(sv) ? '<p class="nat-hint civ-need">&#128161; ' + esc(window.DAW_NATC.hint(sv)) + '</p>' : '') + '<p>Let time pass (&#9654;) and keep shaping your land. Your civilizations will grow, and new problems will come. ' + st.done.length + ' looked back on, of all ' + CC.problems(sv).length + ' problems that came up so far.</p></div>');
    return o.join('');
  }
  function problemCard(p) {
    var sv = save(), r = civ().probs[p.id], state = CC.stateOf(sv, p.id), o = ['<article class="civ-card" data-p="' + esc(p.id) + '"><header>' + sysChip(p) + '<h3>' + esc(p.title) + '</h3><button type="button" class="speak-btn civ-read" data-read="' + esc(p.id) + '" title="Read this problem aloud" aria-label="Read this problem aloud">' + window.DAW_ART.icon('speaker', 18) + '<span>Read</span></button><small class="civ-teks">' + esc(p.teks.join(' \u00b7 ')) + '</small></header>'];
    o.push('<p class="civ-sit">' + esc(p.situation) + '</p><div class="civ-cols"><div><h4>Points of view</h4><ul class="civ-voices">' + p.voices.map(function (v) { return '<li><b>' + esc(v.who) + ':</b> \u201c' + esc(v.says) + '\u201d</li>'; }).join('') + '</ul></div><div><h4>What we know</h4><ul class="civ-facts">' + p.facts.map(function (f) { return '<li>' + esc(f) + '</li>'; }).join('') + '</ul></div></div>');
    if (state !== 'land' && window.DAW_NATUI && window.DAW_NATUI.needsQuiz(p)) { o.push(window.DAW_NATUI.quizHtml(p) + '</article>'); return o.join(''); }
    if (state === 'land') { var lp = CC.landProgress(sv, p.id), b = S.BIO.byCode[lp.paint]; o.push('<div class="civ-land-task"><p><b>You chose:</b> ' + esc(CC.option(p, r.choice).text) + '</p><p>Reshape the land: paint <b>' + lp.need + ' more ' + esc(b.name) + '</b> cells on your island. <b>' + lp.have + ' of ' + lp.need + '</b> painted.</p><button class="btn primary civ-paint" data-c="' + lp.paint + '">Open the ' + esc(b.name) + ' brush</button></div></article>'); return o.join(''); }
    if (p.sort) o.push('<div class="civ-sort"><h4>Step 1: Sort the jobs into the three branches</h4>' + p.sort.jobs.map(function (jb, k) { var a = sortAns[p.id + k] || ''; var fb = draft.sortChecked && a ? (a === jb.b ? ' good' : ' bad') : ''; return '<label class="civ-job' + fb + '"><span>' + esc(jb.text) + '</span><select data-sort="' + k + '"><option value="">Choose a branch</option>' + p.sort.branches.map(function (bb) { return '<option value="' + bb.id + '"' + (a === bb.id ? ' selected' : '') + '>' + esc(bb.name) + '</option>'; }).join('') + '</select></label>'; }).join('') + '<button class="btn small civ-sortcheck">Check my sort</button> <span class="civ-sortfb">' + (draft.sortChecked ? (CC.checkSort(p, sortArr(p)).ok ? '<b class="good">All sorted correctly. Checks and balances: each branch can limit the others.</b>' : 'Some jobs are in the wrong branch (red). Try again.') : '') + '</span></div>');
    if (p.pick) o.push('<div class="civ-pick"><h4>Pick at least ' + p.pick.min + ' rights to protect</h4>' + p.pick.rights.map(function (rt) { return '<label class="cbx"><input type="checkbox" data-right="' + esc(rt) + '"' + (picks.indexOf(rt) >= 0 ? ' checked' : '') + '> ' + esc(rt) + '</label>'; }).join('') + '</div>');
    if (p.vote) { var v = p.vote; o.push('<div class="civ-vote"><h4>' + esc(v.question) + ' Count the ballots</h4><div class="civ-ballots">' + v.ballots.map(function (bl) { return '<span class="ballot ' + (bl === v.a ? 'a' : 'b') + '">' + esc(bl) + '</span>'; }).join('') + '</div><label>' + esc(v.a) + ' votes <input type="number" min="0" max="99" class="civ-va" value="' + esc(draft.va || '') + '"></label> <label>' + esc(v.b) + ' votes <input type="number" min="0" max="99" class="civ-vb" value="' + esc(draft.vb || '') + '"></label></div>'); }
    if (p.open && window.DAW_GCUI) { o.push(window.DAW_GCUI.openHtml(p)); if (p.open.kind === 'allocate') { o.push('<div class="civ-opts btn-row"><button class="btn primary civ-choose" data-o="' + esc(p.options[0].id) + '">Use my land plan</button></div></article>'); return o.join(''); } }
    o.push('<h4>' + (p.sort || p.pick || p.vote ? 'Step 2: ' : '') + (p.open ? 'Choose a fix (more than one can work)' : 'Your options') + '</h4><div class="civ-opts">' + CC.safeOptions(p).map(function (op) {
      var doc = op.kind === 'document', open = draft.doc === op.id, cl = doc && S.WRITING_CHECKLISTS[op.genre] || [];
      return '<div class="civ-opt kind-' + op.kind + '" data-o="' + esc(op.id) + '"><p class="civ-ot">' + (op.kind === 'land' ? '&#127912; ' : doc ? '&#9998; ' : '') + esc(op.text) + '</p><p class="small"><b class="good">Good:</b> ' + esc(op.pros) + '</p><p class="small"><b class="civ-cost">Cost:</b> ' + esc(op.cons) + '</p>' +
        (doc ? (open ? '<textarea class="civ-doc" rows="5" placeholder="Write your ' + esc(op.genre) + ' here (at least ' + (op.minWords || 20) + ' words)">' + esc(draft.text || '') + '</textarea><div class="civ-wc small">' + CC.words(draft.text) + ' / ' + (op.minWords || 20) + ' words</div><ul class="civ-cl small">' + cl.map(function (c) { return '<li>' + esc(c) + '</li>'; }).join('') + '</ul><button class="btn primary civ-choose" data-o="' + esc(op.id) + '">Sign it and send it</button>' : '<button class="btn civ-write" data-o="' + esc(op.id) + '">Write it</button>') : '<button class="btn primary civ-choose" data-o="' + esc(op.id) + '">Choose this</button>') + '</div>';
    }).join('') + '</div><p class="small civ-hint">Time waits while you decide. Think about the points of view, the good, and the cost. Your teacher looks at your thinking.</p></article>');
    return o.join('');
  }
  function sortArr(p) { return p.sort.jobs.map(function (jb, k) { return sortAns[p.id + k] || ''; }); }
  function unfoldCard(p) { var r = civ().probs[p.id], o = CC.option(p, r.choice); var shown = (r.due || []).filter(function (d) { return d.shown; }), next = (r.due || []).filter(function (d) { return !d.shown; })[0]; return '<article class="civ-card unfold" data-p="' + esc(p.id) + '"><header>' + sysChip(p) + '<h3>' + esc(p.title) + '</h3></header><p><b>You chose (' + r.chosenAt + '):</b> ' + esc(o ? o.text : '') + '</p><ul class="civ-later">' + shown.map(function (d) { return '<li><b>' + d.shown + ':</b> ' + esc(d.text) + '</li>'; }).join('') + (next ? '<li class="pending">More will happen by ' + next.y + '. Let time pass (&#9654;).</li>' : '') + '</ul></article>'; }
  function reflectCard(p) {
    var r = civ().probs[p.id], o = CC.option(p, r.choice), d = draft['r-' + p.id] || {};
    return '<article class="civ-card reflect" data-p="' + esc(p.id) + '"><header>' + sysChip(p) + '<h3>Look back: ' + esc(p.title) + '</h3></header><p><b>You chose (' + r.chosenAt + '):</b> ' + esc(o ? o.text : '') + '</p><ul class="civ-later">' + (r.due || []).map(function (x) { return '<li><b>' + x.shown + ':</b> ' + esc(x.text) + '</li>'; }).join('') + '</ul>' + thenNow(p) +
      '<h4>How did it go?</h4><div class="chips civ-evals">' + CC.EVALS.map(function (e) { return '<button class="chipbtn' + (d.ev === e.id ? ' on' : '') + '" data-ev="' + e.id + '">' + esc(e.text) + '</button>'; }).join('') + '</div><label class="field">' + esc(p.reflect) + '<textarea class="civ-why" rows="3" data-p="' + esc(p.id) + '" placeholder="At least 8 words">' + esc(d.text || '') + '</textarea></label><button class="btn primary civ-reflect" data-p="' + esc(p.id) + '">Save my thinking</button></article>';
  }
  function thenNow(p) {
    var arc = p.arc && WC() ? WC().arc(p.arc) : null, tn = (arc && arc.thenAndNow) || {};
    return '<div class="civ-tn"><h4>&#128220; Then &amp; Now</h4><p>' + esc(p.thenNow || '') + '</p>' + (arc ? '<details><summary>More from the history event \u201c' + esc(arc.title) + '\u201d</summary>' + (tn.what ? '<p><b>What:</b> ' + esc(tn.what) + '</p>' : '') + (tn.when ? '<p><b>When:</b> ' + esc(tn.when) + '</p>' : '') + (tn.outcome ? '<p><b>What happened:</b> ' + esc(tn.outcome) + '</p>' : '') + (tn.now || tn.today ? '<p><b>Today:</b> ' + esc(tn.now || tn.today) + '</p>' : '') + ((tn.sources || []).length ? '<p class="small">Sources: ' + tn.sources.map(function (s) { return esc(s.citation || s); }).join('; ') + '</p>' : '') + '</details>' : '') + '</div>';
  }
  function bars(rows, unit) { var mx = Math.max.apply(null, rows.map(function (r) { return r.v; }).concat([1])), w = 360; return '<svg class="civ-chart" viewBox="0 0 ' + (w + 230) + ' ' + (rows.length * 30 + 24) + '" role="img" aria-label="Bar graph">' + rows.map(function (r, k) { var L = Math.round(w * r.v / mx); return '<text x="0" y="' + (k * 30 + 19) + '" font-size="12" font-weight="700" fill="#13294B">' + esc(r.label) + '</text><rect x="130" y="' + (k * 30 + 6) + '" width="' + Math.max(2, L) + '" height="18" rx="4" fill="' + (r.color || '#1c7ed6') + '"/><text x="' + (136 + L) + '" y="' + (k * 30 + 19) + '" font-size="12" fill="#13294B">' + r.v + ' ' + unit + '</text>'; }).join('') + '</svg>'; }
  function regionsTab() {
    var sv = save(), rg = CC.regions(sv, ix()), c = civ();
    return (window.DAW_GCUI ? window.DAW_GCUI.needsHtml() : '') + '<p>Your island splits into regions by where people live and what the land is like. Use the map\u2019s compass, grid and legend to find each place.</p>' + (rg.length ? '<table class="civ-tbl"><tr><th>Region</th><th>Settlements</th><th>Families</th><th>Land and climate</th><th>How people earn a living</th></tr>' + rg.map(function (g) { return '<tr><td><b>' + esc(g.name) + '</b><br><small>' + esc(g.style) + '</small></td><td>' + g.setts + '</td><td>' + g.pop + '</td><td>' + esc(g.main.join(', ')) + '</td><td>' + esc(g.work.join(', ')) + '</td></tr>'; }).join('') + '</table><h4>Where people live (families per region)</h4>' + bars(rg.map(function (g, k) { return { label: g.name, v: g.pop, color: ['#2b8a3e', '#1c7ed6', '#e8590c'][k % 3] }; }), 'families') : '<p class="small">No settlements yet.</p>') +
      '<h4>Settlements</h4><table class="civ-tbl"><tr><th>Name</th><th>Size</th><th>Where (x, y)</th><th>Why people settled here</th><th>Founded</th></tr>' + c.setts.map(function (s) { return '<tr><td>' + esc(s.name) + '</td><td>' + CC.levelOf(s.pop).name + ' (' + s.pop + ' families)</td><td>' + coord(s.i, s.j) + '</td><td>' + esc((s.why || []).join(', ')) + '</td><td>' + s.founded + '</td></tr>'; }).join('') + '</table>' +
      (c.homeland ? '<p class="civ-nation"><b>' + esc(c.homeland.name) + ' homeland</b> at ' + coord(c.homeland.i, c.homeland.j) + ': ' + esc(((CC.pack(c.grade) || {}).nation || {}).about || '') + '</p>' : '') +
      '<p class="small"><b>Map legend:</b> one roof = village, three = town, five with a tall building = city; purple ring = an American Indian nation\u2019s homeland; gray bar = dam; wheel = mill.</p>';
  }
  function pricesTab() {
    var pr = CC.prices(save(), ix()), hist = civ().prices.slice(-16), w = 460, hgt = 120, mx = Math.max.apply(null, hist.map(function (h) { return Math.max(h.grain, h.tools); }).concat([10]));
    var line = function (k, col) { return hist.length > 1 ? '<polyline fill="none" stroke="' + col + '" stroke-width="2.5" points="' + hist.map(function (h, n) { return (40 + n * (w - 50) / (hist.length - 1)).toFixed(1) + ',' + (hgt - h[k] / mx * (hgt - 14)).toFixed(1); }).join(' ') + '"/>' : ''; };
    return '<div class="civ-prices"><div class="civ-price"><small>Grain</small><b>' + pr.grain + ' coins a sack</b><span class="small">Supply ' + (pr.supply < pr.demand ? 'is lower than' : 'meets') + ' demand' + (pr.dry ? ' (dry year)' : '') + '</span></div><div class="civ-price"><small>Tools and cloth</small><b>' + pr.tools + ' coins each</b><span class="small">Supply ' + (pr.toolSupply < pr.toolDemand ? 'is lower than' : 'meets') + ' demand</span></div></div><p>When supply goes down and demand stays the same, prices go up. When there is more to sell, prices go down.</p><h4>Prices over time</h4><svg class="civ-chart" viewBox="0 0 ' + w + ' ' + (hgt + 20) + '" role="img" aria-label="Line graph of prices"><line x1="40" y1="' + hgt + '" x2="' + w + '" y2="' + hgt + '" stroke="#adb5bd"/>' + line('grain', '#e8590c') + line('tools', '#1c7ed6') + (hist.length ? '<text x="40" y="' + (hgt + 16) + '" font-size="11">' + hist[0].y + '</text><text x="' + (w - 30) + '" y="' + (hgt + 16) + '" font-size="11">' + hist[hist.length - 1].y + '</text>' : '') + '</svg><p class="small"><span style="color:#e8590c">&#9632;</span> grain &nbsp; <span style="color:#1c7ed6">&#9632;</span> tools and cloth (coins)</p>';
  }
  var GOV = [['compact', 'Compact: people agree to make rules together'], ['assembly', 'Representative assembly'], ['declaration', 'Declaration of independence'], ['constitution', 'Constitution: three branches, checks and balances'], ['bill', 'Bill of rights']];
  function govTab() { var g = civ().gov; return '<p>How your island governs itself so far:</p><ol class="civ-gov">' + GOV.map(function (x) { var hit = g.filter(function (y) { return y.step === x[0]; })[0]; return '<li class="' + (hit ? 'done' : '') + '">' + (hit ? '&#10003; ' : '') + esc(x[1]) + (hit ? ' <small>(' + hit.y + ')</small>' : ' <small>not yet</small>') + '</li>'; }).join('') + '</ol>' + (g.filter(function (y) { return ['monarchy', 'governor', 'one'].indexOf(y.step) >= 0; }).length ? '<p class="small">Other choices you tried: ' + g.filter(function (y) { return ['monarchy', 'governor', 'one'].indexOf(y.step) >= 0; }).map(function (y) { return esc({ monarchy: 'rules from a monarch', governor: 'a governor chosen by a monarch', one: 'one strong leader' }[y.step]) + ' (' + y.y + ')'; }).join(', ') + '</p>' : '') + '<p class="small">Documents you wrote are in the <b>Writing</b> workspace.</p>'; }
  function timelineTab() { return '<ol class="civ-log" reversed>' + civ().log.slice().reverse().map(function (l) { return '<li class="k-' + esc(l.k) + '"><b>' + l.y + '</b> ' + esc(l.t) + '</li>'; }).join('') + '</ol>'; }
  function historyTab() { var sv = save(), ps = CC.problems(sv).filter(function (p) { return civ().probs[p.id] && civ().probs[p.id].choice; }); return ps.length ? ps.map(function (p) { return '<article class="civ-card"><header>' + sysChip(p) + '<h3>' + esc(p.title) + '</h3></header>' + thenNow(p) + '</article>'; }).join('') : '<p>Then &amp; Now connections appear after you make your first choice.</p>'; }

  function onInput(e) {
    var t = e.target;
    if (t.classList.contains('civ-doc')) { draft.text = t.value; var wc = md.body.querySelector('.civ-wc'); if (wc) wc.textContent = CC.words(t.value) + wc.textContent.replace(/^\d+/, ''); }
    if (t.classList.contains('civ-why')) { var k = 'r-' + t.getAttribute('data-p'); draft[k] = draft[k] || {}; draft[k].text = t.value; }
    if (t.classList.contains('civ-va')) draft.va = t.value; if (t.classList.contains('civ-vb')) draft.vb = t.value;
    if (t.hasAttribute('data-sort')) { var act = CC.active(save()); sortAns[act.id + t.getAttribute('data-sort')] = t.value; draft.sortChecked = false; }
    if (t.hasAttribute('data-right')) { var rt = t.getAttribute('data-right'); picks = picks.filter(function (x) { return x !== rt; }); if (t.checked) picks.push(rt); }
  }
  function onClick(e) {
    var t = e.target, b;
    if ((b = t.closest('.tab'))) { tab = b.getAttribute('data-t'); draw(); return; }
    var act = CC.active(save());
    if ((b = t.closest('.civ-sortcheck'))) { draft.sortChecked = true; draw(); return; }
    if ((b = t.closest('.civ-write'))) { draft.doc = b.getAttribute('data-o'); draw(); var ta = md.body.querySelector('.civ-doc'); if (ta) ta.focus(); return; }
    if ((b = t.closest('.civ-paint'))) { var code = b.getAttribute('data-c'); md.close(); app().setTool('biome'); var BU = window.DAW_BIOMEUI; if (BU) { BU.brush = code; BU.panel(true); } U.toast('Paint ' + S.BIO.byCode[code].name + ' on your island.', 'good'); return; }
    if ((b = t.closest('.civ-choose')) && act) {
      var oid = b.getAttribute('data-o'), ex = { text: draft.text || '', sort: act.sort ? sortArr(act) : null, picks: picks.slice(), voteA: draft.va, voteB: draft.vb }; if (window.DAW_GCUI) { var gx = window.DAW_GCUI.collect(act.id); ex.cer = gx.cer; ex.alloc = gx.alloc; ex.checks = gx.checks; }
      var r = CC.choose(save(), ix(), act.id, oid, ex);
      if (!r.ok) { U.toast({ words: 'Write at least ' + r.need + ' words first.', sort: 'Sort all the jobs into the right branches first (Step 1).', picks: 'Pick at least ' + ((act.pick || {}).min || 1) + ' rights first.', vote: 'Count the ballots again: your totals do not match.', unsafe: 'That option is not available.', cer: window.DAW_GCUI ? window.DAW_GCUI.cerMsg(r) : 'Write your claim, evidence and reasoning first.', alloc: window.DAW_GCUI ? window.DAW_GCUI.allocMsg(r) : 'Check your land plan.' }[r.reason] || 'Not yet.', 'warn', 4000); return; }
      draft = {}; picks = []; if (window.DAW_GCUI) window.DAW_GCUI.clear(act.id); app().commit('Civilization choice: ' + act.title, { noFun: true }); U.toast(r.kind === 'land' ? 'Now reshape the land.' : 'Decision made. Watch what happens over the years.', 'good'); draw(); return;
    }
    if ((b = t.closest('.civ-evals .chipbtn'))) { var pid = b.closest('.civ-card').getAttribute('data-p'), k = 'r-' + pid; draft[k] = draft[k] || {}; draft[k].ev = b.getAttribute('data-ev'); draw(); return; }
    if ((b = t.closest('.civ-reflect'))) { var p2 = b.getAttribute('data-p'), d = draft['r-' + p2] || {}; var rr = CC.reflect(save(), p2, d.ev, d.text); if (!rr.ok) { U.toast(rr.reason === 'eval' ? 'Pick how it went first.' : 'Write at least 8 words about why.', 'warn'); return; } delete draft['r-' + p2]; app().commit('Looked back: ' + pname(p2), { noFun: true }); U.toast('Saved. This counts as evidence in your TEKS tracker.', 'good'); draw(); }
  }
  CU.redraw = function () { if (md) draw(); };
  CU.reportSection = function (sv, ixx) { return CC.reportHtml(sv, ixx, esc); };
  function boot() {
    var host = document.getElementById('civ-bar'); if (host) host.addEventListener('click', onBar);
    CU.bar(); CU.schedule();
    if (location.hash === '#civ') CU.open('problem');
  }
  CU.boot = boot;
  document.addEventListener('click', function (e) { var b = e.target.closest && e.target.closest('.civ-read'); if (!b || !window.DAW_NARR) return; var p = CC.problem(save(), b.getAttribute('data-read')); if (p) U.speak(window.DAW_NARR.problem(p)); });
})();
