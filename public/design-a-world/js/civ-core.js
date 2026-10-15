/* Design a World: civilization layer ("god game"). Pure logic, no DOM, Node-testable.
   Students shape land, climate and biomes; settlements appear and grow on their own where the geography supports
   them (village -> town -> city, grouped into regions). Grade packs (data/packs/<id>.json) bring problems tied to
   social studies TEKS. The student responds (policy, reshaping the land, or writing a document); consequences
   unfold over the years; then the student reflects. Saved in save.civ (schema 7). Counts and statuses only:
   nothing here is a score. */
(function (root) {
  'use strict';
  var CC = {}, S = null, PACKS = null, ART = function (id) { return id; }, SCAN = null;
  function ESC(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (ch) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]; }); }
  var WATER = ['river', 'lake', 'pond', 'delta', 'oxbow', 'waterfall', 'beach', 'ocean', 'aquifer', 'floodplain'];
  var METERS = ['food', 'goods', 'trade', 'unity', 'rights', 'nature'];
  CC.METERS = METERS;
  CC.METER_NAMES = { food: 'Food', goods: 'Goods', trade: 'Trade', unity: 'Getting along', rights: 'Rights', nature: 'Nature' };
  CC.LEVELS = [{ id: 'village', name: 'Village', min: 0 }, { id: 'town', name: 'Town', min: 30 }, { id: 'city', name: 'City', min: 90 }];
  CC.MAX_SETTS = 10;

  CC.install = function (state, packs, opts) {
    S = state; PACKS = packs || {}; opts = opts || {}; if (opts.artOf) ART = opts.artOf; if (opts.scan) SCAN = opts.scan;
    var prev = S.getHooks().history;
    if (!prev || !prev.civWrapped) {
      var h = function (save, ix) {
        var r = prev ? prev(save, ix) : { covers: {}, done: {} }, c = CC.teks(save);
        var out = { covers: {}, done: {} };
        [r, c].forEach(function (x) { ['covers', 'done'].forEach(function (k) { Object.keys(x[k] || {}).forEach(function (t) { out[k][t] = (out[k][t] || []).concat(x[k][t]); }); }); });
        return out;
      };
      h.civWrapped = true; S.setHooks({ history: h });
    }
    return CC;
  };
  CC.artOf = function (x) { return ART(x); };
  CC.packs = function () { return PACKS; };
  CC.index = function () { return (PACKS && PACKS.index) || { packs: [], default: 'g5' }; };
  CC.pack = function (id) { return PACKS && PACKS[id] && PACKS[id].problems ? PACKS[id] : null; };
  CC.packInfo = function (id) { return CC.index().packs.filter(function (p) { return p.id === id; })[0] || null; };
  CC.ready = function (id) { var p = CC.packInfo(id); return !!(p && p.status === 'ready' && CC.pack(id)); };

  CC.blank = function () { return { v: 1, grade: null, started: false, year: 0, startYear: 0, ticks: 0, speed: 1, setts: [], probs: {}, m: {}, log: [], structs: [], gov: [], prices: [], pref: null, next: 1, homeland: null, lastClose: null }; };
  CC.ensure = function (save) {
    if (!save.civ || typeof save.civ !== 'object' || Array.isArray(save.civ)) save.civ = CC.blank();
    var c = save.civ, b = CC.blank(); Object.keys(b).forEach(function (k) { if (c[k] === undefined) c[k] = b[k]; });
    METERS.forEach(function (k) { if (typeof c.m[k] !== 'number') c.m[k] = 0; });
    return c;
  };
  // which grade pack: the save keeps the one it started with; before starting, the teacher's choice (or the default)
  // accept 'g5', '5', '5th', 'grade5', 'Grade 5'; an unknown id falls back to the default pack
  CC.normGrade = function (g) {
    if (g == null || g === '') return null; var x = String(g).trim().toLowerCase(), idx = CC.index(), packs = idx.packs || [];
    if (packs.some(function (p) { return p.id === x; })) return x;
    var m = x.match(/(\d+)/); if (m) { var hit = packs.filter(function (p) { return +p.grade === +m[1]; })[0]; if (hit) return hit.id; }
    return idx.default || 'g5';
  };
  CC.gradeOf = function (save, teacherGrade) { var c = save.civ || {}; return (c.started && c.grade) || CC.normGrade(teacherGrade) || c.grade || CC.index().default || 'g5'; };

  // ---------- geography ----------
  function N() { return S.WORLD; }
  function openBounds(save, ix) { return S.bounds(S.stageSize(ix, S.highestUnlocked(save, ix))); }
  CC.bounds = openBounds;
  function paintArr(save) { if (S.ensurePaint) S.ensurePaint(save); return S.BIO.decode(save.world.paint || '', N()); }
  function code(save, i, j, pa) { pa = pa || paintArr(save); var c = pa[j * N() + i]; return c === '.' ? 'g' : c; }
  CC.biomeAt = function (save, i, j) { return code(save, i, j); };
  function waterNear(save, i, j, r) { return save.world.tiles.some(function (t) { if (WATER.indexOf(ART(t.t)) < 0) return false; var s = S.sizeOf(t); return i >= t.i - r && i <= t.i + s - 1 + r && j >= t.j - r && j <= t.j + s - 1 + r; }); }
  function near(save, i, j, r, pa, fn) { var n = 0; for (var a = i - r; a <= i + r; a++) for (var b = j - r; b <= j + r; b++) if (a >= 0 && b >= 0 && a < N() && b < N() && fn(code(save, a, b, pa), a, b)) n++; return n; }
  function coastal(save, ix, i, j, pa) { var bd = openBounds(save, ix); return i <= bd.min || j <= bd.min || i >= bd.max || j >= bd.max || near(save, i, j, 1, pa, function (c) { return c === 'c'; }) > 0; }
  var BASE = { g: 3, f: 2, w: 1, d: 0, m: 0, t: -1, c: -9 };
  CC.suit = function (save, ix, i, j, pref) {
    var bd = openBounds(save, ix), pa = paintArr(save); if (i < bd.min || j < bd.min || i > bd.max || j > bd.max) return null;
    if (S.tileAt(save, i, j)) return null; var c = code(save, i, j, pa); if (c === 'c') return null;
    var hl = save.civ && save.civ.homeland; if (hl && Math.max(Math.abs(hl.i - i), Math.abs(hl.j - j)) <= 2) return null;
    var w = waterNear(save, i, j, 2), co = coastal(save, ix, i, j, pa), farm = near(save, i, j, 1, pa, function (x) { return x === 'g'; });
    var harsh = near(save, i, j, 1, pa, function (x) { return x === 't' || x === 'd'; });
    var s = BASE[c] + (w ? 3 : 0) + (co ? 2 : 0) + Math.floor(farm / 3) - (harsh >= 4 ? 1 : 0);
    if (pref === 'river' && w) s += 3; if (pref === 'coast' && co) s += 3; if (pref === 'farm') s += Math.floor(farm / 2);
    return { score: s, water: w, coast: co, biome: c, farm: farm };
  };
  CC.why = function (st) { var o = []; if (!st) return o; if (st.water) o.push('fresh water nearby'); if (st.coast) o.push('on the coast (harbor and trade)'); if (st.biome === 'g') o.push('flat grassland for farms'); if (st.biome === 'f') o.push('forest for wood'); if (st.farm >= 6) o.push('lots of farmland around it'); if (st.biome === 'w') o.push('wetland with fish and reeds'); return o; };
  function bestSpot(save, ix, pref) {
    var bd = openBounds(save, ix), best = null, c = save.civ;
    for (var j = bd.min; j <= bd.max; j++) for (var i = bd.min; i <= bd.max; i++) {
      if (c.setts.some(function (s) { return Math.max(Math.abs(s.i - i), Math.abs(s.j - j)) < 4; })) continue;
      var st = CC.suit(save, ix, i, j, pref); if (!st || st.score < 1) continue;
      var cx = (bd.min + bd.max) / 2, tie = -(Math.abs(i - cx) + Math.abs(j - cx)) / 100;
      if (!best || st.score + tie > best.v) best = { i: i, j: j, v: st.score + tie, st: st };
    }
    return best;
  }
  CC.regionOf = function (save, ix, j) { var bd = openBounds(save, ix), t = (j - bd.min) / Math.max(1, bd.max - bd.min + 1); return t < 1 / 3 ? 'north' : t < 2 / 3 ? 'middle' : 'south'; };
  CC.levelOf = function (pop) { var l = CC.LEVELS[0]; CC.LEVELS.forEach(function (x) { if (pop >= x.min) l = x; }); return l; };
  CC.regions = function (save, ix) {
    var c = CC.ensure(save), pk = CC.pack(c.grade) || {}, RG = pk.regions || {}, pa = paintArr(save), out = [];
    ['north', 'middle', 'south'].forEach(function (id) {
      var ss = c.setts.filter(function (s) { return CC.regionOf(save, ix, s.j) === id; }); if (!ss.length) return;
      var counts = {}; ss.forEach(function (s) { near(save, s.i, s.j, 3, pa, function (x) { counts[x] = (counts[x] || 0) + 1; return false; }); });
      var dom = Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a]; }), land = dom.filter(function (x) { return x !== 'c'; });
      var work = land.slice(0, 2).map(function (x) { return (pk.work || {})[x]; }).filter(Boolean); if (ss.some(function (s) { return s.coast; })) work.push((pk.work || {}).c);
      if (c.structs.some(function (st) { return st.type === 'mill' && CC.regionOf(save, ix, st.j) === id; })) work.unshift('factories');
      out.push({ id: id, name: (RG[id] || {}).name || id, style: (RG[id] || {}).style || '', then: (RG[id] || {}).then || '', setts: ss.length, pop: ss.reduce(function (a, s) { return a + s.pop; }, 0), biomes: counts, main: land.slice(0, 3).map(function (x) { return S.BIO.byCode[x] ? S.BIO.byCode[x].name : x; }), work: work.filter(function (v, k, a) { return v && a.indexOf(v) === k; }) });
    });
    return out;
  };
  CC.paintCount = function (save, ch) { var pa = paintArr(save), n = 0; for (var k = 0; k < pa.length; k++) if (pa[k] === ch) n++; return n; };

  // ---------- economy: supply and demand (prices in coins; a count, not a score) ----------
  CC.prices = function (save, ix) {
    var c = CC.ensure(save), pop = CC.totalPop(save), farm = 0, pa = paintArr(save);
    c.setts.forEach(function (s) { farm += near(save, s.i, s.j, 2, pa, function (x) { return x === 'g' || x === 'w'; }); });
    var dry = c.drought && c.year < c.drought, supply = Math.max(1, (2 + farm / 6 + c.m.food) * (dry ? 0.5 : 1)), demand = 1 + pop / 40;
    var gs = Math.max(1, 2 + c.m.goods + (c.structs.some(function (x) { return x.type === 'mill'; }) ? 3 : 0)), gd = 1 + pop / 50;
    var clamp = function (v) { return Math.max(2, Math.min(40, Math.round(v))); };
    return { grain: clamp(8 * demand / supply), tools: clamp(10 * gd / gs), supply: Math.round(supply * 10) / 10, demand: Math.round(demand * 10) / 10, toolSupply: gs, toolDemand: Math.round(gd * 10) / 10, dry: !!dry };
  };
  CC.totalPop = function (save) { return ((save.civ && save.civ.setts) || []).reduce(function (a, s) { return a + s.pop; }, 0); };
  CC.status = function (v) { return v >= 3 ? 'Thriving' : v >= 1 ? 'Doing well' : v >= 0 ? 'Steady' : v >= -2 ? 'Struggling' : 'In trouble'; };

  // ---------- problems ----------
  CC.problems = function (save) { var p = CC.pack(CC.ensure(save).grade); return p ? p.problems : []; };
  CC.problem = function (save, pid) { return CC.problems(save).filter(function (p) { return p.id === pid; })[0] || null; };
  CC.stateOf = function (save, pid) {
    var r = save.civ && save.civ.probs[pid]; if (!r) return 'later'; if (r.done) return 'done'; if (!r.choice) return 'open';
    var p = CC.problem(save, pid), o = p && optionOf(p, r.choice); if (o && o.kind === 'land' && !r.landDone) return 'land';
    if ((r.due || []).some(function (d) { return !d.shown; })) return 'unfolding'; return 'reflect';
  };
  function optionOf(p, oid) { return (p.options || []).filter(function (o) { return o.id === oid; })[0] || null; }
  CC.option = optionOf;
  CC.active = function (save) { return CC.problems(save).filter(function (p) { var s = CC.stateOf(save, p.id); return s === 'open' || s === 'land'; })[0] || null; };
  CC.byState = function (save) { var o = { open: [], land: [], unfolding: [], reflect: [], done: [], later: [] }; CC.problems(save).forEach(function (p) { o[CC.stateOf(save, p.id)].push(p); }); return o; };
  function chosen(save, pid) { var r = save.civ.probs[pid]; return !!(r && r.choice); }
  CC.triggerMet = function (save, ix, p) {
    var c = save.civ, t = p.trigger || {}, since = c.year - c.startYear;
    if (t.after && since < t.after) return false;
    if (t.done && !t.done.every(function (d) { return chosen(save, d); })) return false;
    if (t.setts && c.setts.length < t.setts) return false;
    if (t.pop && CC.totalPop(save) < t.pop) return false;
    if (t.level && !c.setts.some(function (s) { return CC.levelOf(s.pop).id === t.level; })) return false;
    if (t.regions && CC.regions(save, ix).length < t.regions) return false;
    if (t.water && !c.setts.some(function (s) { return s.water; })) return false;
    if (t.dry) { var pa = paintArr(save); if (!c.setts.some(function (s) { return near(save, s.i, s.j, 3, pa, function (x) { return x === 'g' || x === 'd'; }) >= 6; })) return false; }
    return true;
  };
  function log(c, text, kind) { c.log.push({ y: c.year, t: text, k: kind || 'note' }); if (c.log.length > 50) c.log.splice(0, c.log.length - 50); }
  CC.log = log;

  CC.start = function (save, ix, grade) {
    var c = CC.ensure(save); if (c.started) return { ok: false, reason: 'started' };
    if (!CC.ready(grade)) return { ok: false, reason: 'coming-soon' };
    var pk = CC.pack(grade); c.grade = grade; c.started = true; c.startYear = c.year = pk.startYear || 1600; c.speed = c.speed == null ? 1 : c.speed;
    // the American Indian nation's homeland: the best land on the far side of the island from the center (it was here first)
    var bd = openBounds(save, ix), best = null;
    for (var j = bd.min; j <= bd.max; j++) for (var i = bd.min; i <= bd.max; i++) { var st = CC.suit(save, ix, i, j); if (!st) continue; var edge = Math.min(i - bd.min, j - bd.min, bd.max - i, bd.max - j); var v = st.score - Math.abs(edge - 2); if (!best || v > best.v) best = { i: i, j: j, v: v }; }
    if (best) c.homeland = { i: best.i, j: best.j, name: (pk.nation || {}).name || 'First Nation' };
    log(c, 'The year is ' + c.year + '. ' + ((pk.nation || {}).label || 'An American Indian nation') + ' are already here.', 'start');
    openNext(save, ix); return { ok: true };
  };
  function openNext(save, ix) {
    var c = save.civ; if (CC.active(save)) return null;
    var gap = (CC.pack(c.grade) || {}).gapYears || 10; if (c.lastClose != null && c.year - c.lastClose < gap) return null;
    var p = CC.problems(save).filter(function (q) { return !c.probs[q.id] && CC.triggerMet(save, ix, q); })[0];
    if (!p) return null; c.probs[p.id] = { opened: c.year }; log(c, 'New problem: ' + p.title, 'problem'); return p;
  }
  CC.openNext = openNext;
  function found(save, ix) {
    var c = save.civ, pk = CC.pack(c.grade) || {}, b = bestSpot(save, ix, c.pref); if (!b) return null;
    var names = pk.names || [], nm = names[(c.next - 1) % Math.max(1, names.length)] || ('Town ' + c.next);
    var s = { id: 's' + c.next, name: nm, i: b.i, j: b.j, pop: 8, founded: c.year, water: !!b.st.water, coast: !!b.st.coast, why: CC.why(b.st) };
    c.next++; c.setts.push(s); log(c, nm + ' is founded (' + (s.why.join(', ') || 'open land') + ').', 'found'); return s;
  }
  CC.tick = function (save, ix) {
    var c = CC.ensure(save), out = { founded: [], grew: [], unfolded: [], opened: null, paused: null };
    if (!c.started || !CC.ready(c.grade)) { out.paused = 'not-started'; return out; }
    if (CC.active(save) && CC.stateOf(save, CC.active(save).id) === 'open') { out.paused = 'decision'; return out; }
    var pk = CC.pack(c.grade); c.year += pk.yearsPerTick || 5; c.ticks++;
    // consequences that come due
    Object.keys(c.probs).forEach(function (pid) { var r = c.probs[pid]; (r.due || []).forEach(function (d) { if (!d.shown && c.year >= d.y) { d.shown = c.year; log(c, d.text, 'later'); out.unfolded.push({ pid: pid, text: d.text }); } }); });
    // growth: settlements grow where the land supports them
    if (chosen(save, 'p-first-settlers') || !CC.problem(save, 'p-first-settlers')) {
      if (!c.setts.length) { var f = found(save, ix); if (f) out.founded.push(f); }
      var boost = (c.m.food > 0 ? 1 : 0) + (c.m.unity > 0 ? 1 : 0) + (c.growth || 0) - (c.m.food < -1 ? 1 : 0);
      c.setts.forEach(function (s) {
        var st = CC.suit(save, ix, s.i, s.j) || { score: 1 }, before = CC.levelOf(s.pop).id, cap = c.suburbs ? 260 : 200;
        s.pop = Math.min(cap, s.pop + Math.max(1, 2 + Math.floor(Math.max(0, st.score) / 2) + boost));
        var after = CC.levelOf(s.pop); if (after.id !== before) { log(c, s.name + ' has grown into a ' + after.name.toLowerCase() + '.', 'grow'); out.grew.push({ id: s.id, level: after.id }); }
      });
      if (c.setts.length && c.setts.length < CC.MAX_SETTS && CC.totalPop(save) >= 28 * c.setts.length) { var f2 = found(save, ix); if (f2) out.founded.push(f2); }
    }
    var pr = CC.prices(save, ix); c.prices.push({ y: c.year, grain: pr.grain, tools: pr.tools }); if (c.prices.length > 30) c.prices.shift();
    var op = openNext(save, ix); if (op) out.opened = op.id;
    return out;
  };

  // ---------- responding ----------
  function words(t) { return String(t || '').trim().split(/\s+/).filter(Boolean).length; }
  CC.words = words;
  CC.checkSort = function (p, answers) { var jobs = (p.sort && p.sort.jobs) || []; var wrong = jobs.map(function (jb, k) { return answers && answers[k] === jb.b ? -1 : k; }).filter(function (k) { return k >= 0; }); return { ok: !wrong.length, wrong: wrong }; };
  CC.tally = function (p) { var v = p.vote || {}, a = 0, b = 0; (v.ballots || []).forEach(function (x) { if (x === v.a) a++; else if (x === v.b) b++; }); return { a: a, b: b, winner: a > b ? v.a : b > a ? v.b : null }; };
  CC.safeOptions = function (p) { return (p.options || []).filter(function (o) { return !SCAN || !SCAN(o.text).length; }); };
  CC.choose = function (save, ix, pid, oid, extra, now) {
    var c = CC.ensure(save), p = CC.problem(save, pid), r = c.probs[pid]; extra = extra || {};
    if (!p || !r) return { ok: false, reason: 'not-open' }; if (r.choice) return { ok: false, reason: 'already' };
    var o = optionOf(p, oid); if (!o) return { ok: false, reason: 'no-option' };
    if (SCAN && SCAN(o.text).length) return { ok: false, reason: 'unsafe' };
    if (p.sort && !CC.checkSort(p, extra.sort).ok) return { ok: false, reason: 'sort', wrong: CC.checkSort(p, extra.sort).wrong };
    if (p.pick && (!extra.picks || extra.picks.length < (p.pick.min || 1))) return { ok: false, reason: 'picks' };
    if (p.vote) { var tl = CC.tally(p); if (+extra.voteA !== tl.a || +extra.voteB !== tl.b) return { ok: false, reason: 'vote', tally: tl }; }
    if (o.kind === 'document') {
      if (words(extra.text) < (o.minWords || 20)) return { ok: false, reason: 'words', need: o.minWords || 20 };
      S.saveWriting(save, 'civ-' + pid, { title: p.title, genre: o.genre || 'response', prompt: o.text, text: extra.text, checks: extra.checks || [] }, now);
      r.doc = 'civ-' + pid;
    }
    r.choice = oid; r.chosenAt = c.year; if (extra.picks) r.picks = extra.picks.slice(0, 12); if (p.vote) r.vote = CC.tally(p); if (p.sort) r.sorted = true;
    METERS.forEach(function (k) { if (o.effects && o.effects[k]) c.m[k] = Math.max(-5, Math.min(5, c.m[k] + o.effects[k])); });
    if (o.pref) c.pref = o.pref; if (o.gov) c.gov.push({ step: o.gov, y: c.year }); if (o.growth != null) c.growth = o.growth; if (o.suburb) c.suburbs = true;
    if (pid === 'p-prices') c.drought = c.year + 10;
    if (o.factory || o.build === 'dam') { var at = c.setts.filter(function (s) { return s.water; })[0] || c.setts[0]; if (at) c.structs.push({ type: o.factory ? 'mill' : 'dam', i: at.i, j: at.j, y: c.year }); }
    if (o.kind === 'land') r.base = CC.paintCount(save, o.task.paint);
    r.due = (o.later || []).map(function (l) { return { y: c.year + (l.in || 5), text: l.text }; });
    log(c, 'You chose: ' + o.text, 'choice');
    if (o.kind !== 'land') { c.lastClose = c.year; }
    return { ok: true, kind: o.kind };
  };
  // land responses: done when the student has reshaped the land (e.g. painted 3 more forest cells)
  CC.landProgress = function (save, pid) { var p = CC.problem(save, pid), r = save.civ.probs[pid], o = p && r && optionOf(p, r.choice); if (!o || o.kind !== 'land') return null; var have = CC.paintCount(save, o.task.paint) - (r.base || 0); return { have: Math.max(0, have), need: o.task.count, paint: o.task.paint, done: have >= o.task.count }; };
  CC.checkLand = function (save) {
    var c = CC.ensure(save), hit = [];
    Object.keys(c.probs).forEach(function (pid) { if (CC.stateOf(save, pid) !== 'land') return; var lp = CC.landProgress(save, pid); if (lp && lp.done) { var r = c.probs[pid]; r.landDone = c.year; var gap = c.year - r.chosenAt; (r.due || []).forEach(function (d) { d.y += gap; }); c.lastClose = c.year; log(c, 'You reshaped the land for: ' + CC.problem(save, pid).title, 'land'); hit.push(pid); } });
    return hit;
  };
  CC.EVALS = [{ id: 'worked', text: 'It worked well' }, { id: 'mixed', text: 'It helped and it hurt' }, { id: 'change', text: 'I would choose differently next time' }];
  CC.reflect = function (save, pid, ev, text) {
    var r = save.civ && save.civ.probs[pid]; if (!r || CC.stateOf(save, pid) !== 'reflect') return { ok: false, reason: 'not-ready' };
    if (!CC.EVALS.some(function (e) { return e.id === ev; })) return { ok: false, reason: 'eval' };
    if (words(text) < 8) return { ok: false, reason: 'words', need: 8 };
    r.eval = ev; r.why = String(text).slice(0, 2000); r.done = save.civ.year; log(save.civ, 'You looked back on: ' + CC.problem(save, pid).title, 'reflect'); return { ok: true };
  };

  // ---------- evidence (TEKS tracker) and summaries (counts and statuses only) ----------
  CC.teks = function (save) {
    var cov = {}, done = {}; if (!save || !save.civ) return { covers: cov, done: done };
    var g = save.civ.grade || CC.index().default, pk = CC.pack(g); if (!pk) return { covers: cov, done: done };
    pk.problems.forEach(function (p) { (p.teks || []).forEach(function (t) { (cov[t] = cov[t] || []).push('Civilization: ' + p.title); if (save.civ.probs[p.id] && save.civ.probs[p.id].done) (done[t] = done[t] || []).push('Civilization: ' + p.title); }); });
    return { covers: cov, done: done };
  };
  CC.summary = function (save, ix) {
    var c = save.civ; if (!c || !c.started) return null; var st = CC.byState(save);
    return { grade: c.grade, title: (CC.pack(c.grade) || {}).title || c.grade, year: c.year, years: c.year - c.startYear, setts: c.setts.length, pop: CC.totalPop(save), regions: ix ? CC.regions(save, ix).length : null, done: st.done.length, waiting: st.open.length + st.land.length + st.unfolding.length + st.reflect.length, total: CC.problems(save).length, gov: c.gov.map(function (g) { return g.step; }) };
  };
  // report / teacher view (statuses and counts only)
  CC.reportHtml = function (sv, ixx, esc) {
    var c = sv.civ; if (!c || !c.started) return ''; var sum = CC.summary(sv, ixx), o = ['<section class="r-civ"><h2>Civilizations (' + esc(sum.title) + ')</h2><p>Year ' + sum.year + ' (' + sum.years + ' years of history) \u00b7 ' + sum.setts + ' settlements \u00b7 ' + sum.pop + ' families \u00b7 ' + sum.regions + ' regions \u00b7 ' + sum.done + ' looked back on, of all ' + sum.total + ' problems that came up</p>'];
    CC.problems(sv).forEach(function (p) { var r = c.probs[p.id]; if (!r || !r.choice) return; var op = CC.option(p, r.choice), ev = CC.EVALS.filter(function (e) { return e.id === r.eval; })[0]; o.push('<div class="r-m"><h3>' + esc(p.title) + ' <small>' + esc(p.teks.join(', ')) + ' \u00b7 ' + (r.done ? 'looked back on' : 'in progress') + '</small></h3><p><b>Choice (' + r.chosenAt + '):</b> ' + esc(op ? op.text : r.choice) + '</p>' + (r.picks ? '<p><b>Rights protected:</b> ' + esc(r.picks.join(', ')) + '</p>' : '') + (r.vote ? '<p><b>Vote counted:</b> ' + r.vote.a + ' to ' + r.vote.b + '</p>' : '') + (ev ? '<p><b>Looking back:</b> ' + esc(ev.text) + '. ' + esc(r.why || '') + '</p>' : '') + '</div>'); });
    o.push('</section>'); return o.join('');
  };
  // ---------- map layer: symbolic houses, a homeland emblem, mills and dams (pointer-events none) ----------
  CC.svgLayer = function (sv, xy) {
    var esc = ESC;
    var c = sv.civ; if (!c || !c.started) return ''; var o = ['<g class="civ-layer" pointer-events="none" font-family="Lexend, sans-serif">'];
    if (c.homeland) { var h = xy(c.homeland.i, c.homeland.j); o.push('<g class="civ-home" transform="translate(' + h[0] + ' ' + h[1] + ')"><title>' + esc(c.homeland.name) + ' homeland</title><ellipse cx="0" cy="4" rx="26" ry="9" fill="rgba(112,72,232,.18)" stroke="#7048e8" stroke-width="1.5" stroke-dasharray="4 3"/>' + [-11, 0, 11].map(function (x, k) { return '<path d="M' + (x - 6) + ' ' + (3 - k % 2 * 3) + ' L' + x + ' ' + (-12 - k % 2 * 3) + ' L' + (x + 6) + ' ' + (3 - k % 2 * 3) + 'z" fill="#c9a26b" stroke="#7a5a2f" stroke-width="1"/>'; }).join('') + '<rect x="-58" y="10" width="116" height="15" rx="7.5" fill="rgba(112,72,232,.88)"/><text y="21" text-anchor="middle" font-size="9.5" font-weight="700" fill="#fff">' + esc(c.homeland.name) + ' homeland</text></g>'); }
    (c.structs || []).forEach(function (st) { var p = xy(st.i, st.j); if (st.type === 'mill') o.push('<g class="civ-mill" transform="translate(' + (p[0] + 18) + ' ' + (p[1] - 4) + ')"><title>Water-powered mill</title><circle r="7" fill="#fff" stroke="#495057" stroke-width="2"/><path d="M-7 0H7M0 -7V7M-5 -5L5 5M5 -5L-5 5" stroke="#495057" stroke-width="1.4"/></g>'); else o.push('<g class="civ-dam" transform="translate(' + (p[0] - 20) + ' ' + (p[1] + 6) + ')"><title>Dam</title><rect x="-10" y="-4" width="20" height="8" rx="2" fill="#adb5bd" stroke="#495057" stroke-width="1.3"/></g>'); });
    c.setts.forEach(function (s) {
      var p = xy(s.i, s.j), lv = CC.levelOf(s.pop).id, n = lv === 'city' ? 5 : lv === 'town' ? 3 : 1, spots = [[0, 0], [-9, 4], [9, 4], [-5, -6], [6, -6]];
      o.push('<g class="civ-sett lv-' + lv + '" data-s="' + esc(s.id) + '" transform="translate(' + p[0] + ' ' + p[1] + ')"><title>' + esc(s.name) + ': ' + lv + ', ' + s.pop + ' families</title><ellipse cx="0" cy="5" rx="' + (6 + n * 3) + '" ry="' + (2 + n) + '" fill="rgba(0,0,0,.16)"/>');
      spots.slice(0, n).sort(function (a, b) { return a[1] - b[1]; }).forEach(function (q, k) { var tall = lv === 'city' && k === n - 1 ? 8 : 0; o.push('<g transform="translate(' + q[0] + ' ' + q[1] + ')"><rect x="-4" y="' + (-6 - tall) + '" width="8" height="' + (7 + tall) + '" fill="#f8f0e3" stroke="#8a5a44" stroke-width="1"/><path d="M-5.5 ' + (-6 - tall) + ' L0 ' + (-11 - tall) + ' L5.5 ' + (-6 - tall) + 'z" fill="#c2553a"/></g>'); });
      var w = Math.min(110, s.name.length * 6.2 + 14); o.push('<rect x="' + (-w / 2) + '" y="9" width="' + w + '" height="14" rx="7" fill="rgba(19,41,75,.8)"/><text y="19.5" text-anchor="middle" font-size="9.5" font-weight="700" fill="#fff">' + esc(s.name) + '</text></g>');
    });
    o.push('</g>'); return o.join('');
  };

  root.DAW_CIVC = CC;
  if (typeof module !== 'undefined' && module.exports) module.exports = CC;
})(typeof window !== 'undefined' ? window : globalThis);
