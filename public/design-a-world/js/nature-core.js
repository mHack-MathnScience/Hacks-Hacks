/* Design a World: natural change (SimEarth-style) + Shaping Energy. Pure logic, Node-testable; extends DAW_CIVC.
   - The island changes on its own as the years pass: ice ages advance and retreat (leaving U-shaped valleys and
     moraines), rivers carve V-shaped valleys and canyons and build deltas, wind piles up sand dunes, and layers of
     sediment are pressed and cemented into rock. Landforms are kept in save.civ.nat and drawn with the existing art.
   - Settlements use them (delta farms, river-mouth ports, valley passes).
   - Problems tied to a landform open only after the student explains how it formed (process, agent, timescale)
     with multiple choice. A wrong answer gives a hint and another try; it never costs anything.
   - Shaping Energy (save.civ.energy) is PLAY-ONLY: earned once per mission / correct explanation / look-back, spent
     to change the world. It exists so students cannot just wreck the world: cost grows with how big and how
     destructive a change is, changes are capped in size, each era (50 years) allows only a few, changes that harm
     settlements need a preview + confirm, and the last change can be undone. Never shown in reports or teacher views. */
(function (root) {
  'use strict';
  var CC = root.DAW_CIVC || (typeof require === 'function' ? require('./civ-core.js') : null), S = null, DX = null;
  var NC = {};
  NC.ERA_YEARS = 50; NC.ERA_LIMIT = 3; NC.BIG_PER_ERA = 1; NC.MAX_CELLS = 9; NC.MAX_NAT = 24;
  // landforms the world makes on its own (ids match describe.json; rock-layers is defined here)
  NC.KINDS = {
    'glacial-u-valley': { name: 'U-shaped valley', art: 'glacier', use: 'pass', useText: 'a wide valley pass through the mountains' },
    'moraine': { name: 'Moraine', art: 'moraine', use: null },
    'v-shaped-valley': { name: 'V-shaped valley', art: 'vshapedvalley', use: null },
    'canyon': { name: 'Canyon', art: 'canyon', use: null },
    'delta': { name: 'Delta', art: 'delta', use: 'farm', useText: 'rich delta soil for farms' },
    'sand-dune': { name: 'Sand dunes', art: 'dune', use: null },
    'rock-layers': { name: 'Sedimentary rock layers', art: 'mesa', use: 'quarry', useText: 'layered rock for building stone' }
  };
  var ROCK = { id: 'rock-layers', name: 'Sedimentary rock layers', process: ['deposition'], agent: ['water'], timescale: 'slow', hint: 'Layers of sand and mud are dropped (deposition) by water, then pressed (compaction) and glued (cementation) over a very long time.' };

  NC.install = function (state, describeData) {
    S = state; DX = describeData || DX; if (!CC.__natWrapped) wrap(); return NC;
  };
  function lfData(id) { if (id === 'rock-layers') return ROCK; var l = ((DX && DX.landforms) || []).filter(function (x) { return x.id === id; })[0]; return l || null; }
  NC.lfData = lfData;
  function N() { return S.WORLD; }
  function pa(save) { if (S.ensurePaint) S.ensurePaint(save); return S.BIO.decode(save.world.paint || '', N()).slice(); }
  function setPa(save, a) { save.world.paint = S.BIO.encode(a); }
  function ensure(save) {
    var c = CC.ensure(save);
    if (!Array.isArray(c.nat)) c.nat = [];
    if (!c.ice || typeof c.ice !== 'object') c.ice = { phase: 'none', since: 0, cells: [], cycles: 0 };
    if (typeof c.climate !== 'number') c.climate = 0;
    if (!c.energy || typeof c.energy !== 'object') c.energy = { bal: 0, earned: {}, era: null, used: 0, big: 0, last: null };
    if (!c.quiz || typeof c.quiz !== 'object') c.quiz = {};
    return c;
  }
  NC.ensure = ensure;
  function bounds(save, ix) { return CC.bounds(save, ix); }
  function addNat(save, ix, lf, i, j, why) {
    var c = save.civ; if (c.nat.length >= NC.MAX_NAT) return null;
    if (c.nat.some(function (n) { return n.lf === lf && Math.max(Math.abs(n.i - i), Math.abs(n.j - j)) < 3; })) return null;
    var n = { id: 'n' + (c.nat.length + 1) + '-' + c.year, lf: lf, i: i, j: j, y: c.year, why: why }; c.nat.push(n);
    CC.log(c, 'Nature: ' + NC.KINDS[lf].name + ' formed. ' + why, 'nature'); return n;
  }
  function waterTiles(save, ART) { return save.world.tiles.filter(function (t) { return ['river', 'lake', 'pond', 'delta', 'oxbow', 'waterfall'].indexOf(ART(t.t)) >= 0; }); }
  function free(save, i, j) { return !S.tileAt(save, i, j) && !save.civ.setts.some(function (s) { return s.i === i && s.j === j; }); }
  // nearest open coast cell (edge of the open island or next to painted sea) from (i, j)
  function coastFrom(save, ix, i, j) {
    var bd = bounds(save, ix), a = pa(save), best = null;
    for (var y = bd.min; y <= bd.max; y++) for (var x = bd.min; x <= bd.max; x++) {
      var edge = x === bd.min || y === bd.min || x === bd.max || y === bd.max; if (!edge && [[1, 0], [-1, 0], [0, 1], [0, -1]].every(function (d) { return a[(y + d[1]) * N() + x + d[0]] !== 'c'; })) continue;
      if (a[y * N() + x] === 'c' || !free(save, x, y)) continue; var dd = Math.abs(x - i) + Math.abs(y - j); if (!best || dd < best.d) best = { i: x, j: y, d: dd };
    }
    return best;
  }
  function cellsWith(save, ix, codes) { var bd = bounds(save, ix), a = pa(save), o = []; for (var y = bd.min; y <= bd.max; y++) for (var x = bd.min; x <= bd.max; x++) if (codes.indexOf(a[y * N() + x]) >= 0) o.push({ i: x, j: y }); return o; }

  // ---------- natural change: called once per civilization tick ----------
  NC.tick = function (save, ix, ART) {
    var c = ensure(save), out = []; ART = ART || function (x) { return x; }; var since = c.year - c.startYear, a, k;
    // rivers carve, then build a delta where they meet the sea
    var wt = waterTiles(save, ART);
    if (wt.length && since >= 15) {
      var w = wt[0], bdv = bounds(save, ix), up = null;
      for (var rr = 2; rr <= 4 && !up; rr++) [[-1, -1], [-1, 0], [0, -1], [1, -1], [-1, 1], [1, 0], [0, 1], [1, 1]].some(function (d) { var i = w.i + d[0] * rr, j = w.j + d[1] * rr; if (i >= bdv.min && j >= bdv.min && i <= bdv.max && j <= bdv.max && free(save, i, j) && !c.setts.some(function (s) { return Math.max(Math.abs(s.i - i), Math.abs(s.j - j)) < 1; })) { up = { i: i, j: j }; return true; } return false; });
      if (up && !c.nat.some(function (n) { return n.lf === 'v-shaped-valley'; })) out.push(addNat(save, ix, 'v-shaped-valley', up.i, up.j, 'Running water cut down into the land upstream.'));
      var cs = coastFrom(save, ix, w.i, w.j); if (cs && since >= 25 && !c.nat.some(function (n) { return n.lf === 'delta'; })) out.push(addNat(save, ix, 'delta', cs.i, cs.j, 'The river slowed at the sea and dropped its sediment.'));
      var vv = c.nat.filter(function (n) { return n.lf === 'v-shaped-valley'; })[0]; if (vv && since >= 60 && !c.nat.some(function (n) { return n.lf === 'canyon'; })) out.push(addNat(save, ix, 'canyon', vv.i, vv.j, 'Over a very long time the river deepened its valley into a canyon.'));
    }
    // wind piles sand into dunes where it is dry
    var dry = cellsWith(save, ix, ['d']); if (dry.length < 3 && since >= 35) { var bc = coastFrom(save, ix, bounds(save, ix).max, bounds(save, ix).max); if (bc) dry = [{ i: bc.i, j: bc.j }]; } // no desert: sea wind piles beach sand into coastal dunes
    if (dry.length && since >= 10) { var dc = dry.filter(function (q) { return free(save, q.i, q.j); })[0]; if (dc && !c.nat.some(function (n) { return n.lf === 'sand-dune'; })) out.push(addNat(save, ix, 'sand-dune', dc.i, dc.j, dry.length >= 3 ? 'Wind blew sand until it piled up into dunes.' : 'Wind from the sea blew beach sand into dunes along the coast.')); }
    // deposition -> compaction + cementation into rock layers (after a delta or floodplain has been collecting sediment)
    var dl = c.nat.filter(function (n) { return n.lf === 'delta'; })[0]; if (dl && c.year - dl.y >= 40 && !c.nat.some(function (n) { return n.lf === 'rock-layers'; })) { var rb = bounds(save, ix); for (k = 0; k < 6; k++) { var ri = Math.min(rb.max, dl.i + (k % 3) - 1), rj = Math.min(rb.max, dl.j - 1 - Math.floor(k / 3)); if (free(save, ri, rj)) { out.push(addNat(save, ix, 'rock-layers', ri, rj, 'Layers of sediment were pressed (compaction) and glued (cementation) into rock.')); break; } } }
    // no softlock: if a problem waits for fresh water and no settlement has any, rain gathers into a stream within 20 years
    var needW = CC.problems(save).some(function (p) { return p.trigger && p.trigger.water && CC.stateOf(save, p.id) === 'later'; }) && c.setts.length && !c.setts.some(function (s) { return s.water; });
    if (!needW) c.waitWater = null; else if (c.waitWater == null) c.waitWater = c.year; else if (c.year - c.waitWater >= 20) {
      var sx = c.setts[0], aw = pa(save), bw = bounds(save, ix), put = 0;
      [[1, 0], [1, 1], [0, 1], [-1, 0], [0, -1], [-1, -1]].forEach(function (d) { var i = sx.i + d[0], j = sx.j + d[1]; if (put < 3 && i >= bw.min && j >= bw.min && i <= bw.max && j <= bw.max && free(save, i, j)) { aw[j * N() + i] = 'w'; put++; } });
      setPa(save, aw); sx.water = true; c.waitWater = null; c.stream = { i: sx.i, j: sx.j, y: c.year };
      CC.log(c, 'Nature: years of rain gathered into a stream and wetland beside ' + sx.name + '. Now it has fresh water.', 'nature'); out.push({ lf: 'stream', i: sx.i, j: sx.j, why: 'Rain gathered into a stream beside ' + sx.name + '.' });
    }
    // ice ages: cooler climate brings them sooner; ice spreads from the mountains / north, then melts back
    var period = 120 - 30 * c.climate; var landTask = CC.problems(save).some(function (p) { return CC.stateOf(save, p.id) === 'land'; });
    if (c.ice.phase === 'none' && !landTask && since >= 40 && c.year - (c.ice.since || c.startYear) >= period) startIce(save, ix);
    else if (c.ice.phase === 'advance' && c.year - c.ice.since >= 30) {
      a = pa(save); c.ice.cells.forEach(function (q) { if (a[q.j * N() + q.i] === 't') a[q.j * N() + q.i] = q.was; }); setPa(save, a);
      var mid = c.ice.cells[Math.floor(c.ice.cells.length / 2)], end = c.ice.cells[c.ice.cells.length - 1];
      if (mid && free(save, mid.i, mid.j)) out.push(addNat(save, ix, 'glacial-u-valley', mid.i, mid.j, 'The glacier scraped a wide U-shaped valley as it moved.'));
      if (end && free(save, end.i, end.j)) out.push(addNat(save, ix, 'moraine', end.i, end.j, 'The melting glacier dropped a ridge of rocks and sediment.'));
      CC.log(c, 'Nature: the ice age ends and the glacier melts back.', 'nature'); c.ice = { phase: 'none', since: c.year, cells: [], cycles: (c.ice.cycles || 0) + 1 };
    }
    return out.filter(Boolean);
  };
  function startIce(save, ix) {
    var c = save.civ, bd = bounds(save, ix), a = pa(save), cells = [];
    var mts = cellsWith(save, ix, ['m', 't']), seed = mts[0] || { i: Math.round((bd.min + bd.max) / 2), j: bd.min };
    for (var k = 0; k < 6; k++) { var i = Math.max(bd.min, Math.min(bd.max, seed.i)), j = Math.max(bd.min, Math.min(bd.max, seed.j + k)); var q = j * N() + i; if (a[q] === 'c' || c.setts.some(function (s) { return s.i === i && s.j === j; })) continue; cells.push({ i: i, j: j, was: a[q] }); a[q] = 't'; }
    setPa(save, a); c.ice = { phase: 'advance', since: c.year, cells: cells, cycles: c.ice.cycles || 0 };
    CC.log(c, 'Nature: an ice age begins. A glacier spreads down from the mountains. Villages stay clear of the ice.', 'nature');
  }
  NC.startIce = startIce;
  // settlements use landforms: bonus and a reason
  // what the next waiting problem still needs (shown in the 'All is calm' card so nothing is a mystery)
  NC.hint = function (save) { var c = save.civ || {}; if (c.waitWater != null) return 'The next problem needs a settlement near fresh water. Build a river or lake near a settlement, or let time pass: rain is gathering into a stream (about ' + Math.max(5, 20 - (c.year - c.waitWater)) + ' years).'; return ''; };
  NC.near = function (save, i, j, r) { return ((save.civ && save.civ.nat) || []).filter(function (n) { return Math.max(Math.abs(n.i - i), Math.abs(n.j - j)) <= (r || 2); }); };
  NC.useOf = function (save, s) { var u = []; NC.near(save, s.i, s.j, 2).forEach(function (n) { var k = NC.KINDS[n.lf]; if (k && k.use && u.indexOf(k.useText) < 0) u.push(k.useText); }); if (s.coast && s.water) u.push('a port at the river mouth'); return u; };

  // ---------- multiple-choice explanations (process, agent, timescale) from describe.json ----------
  var PRIMARY = { canyon: 'erosion', 'v-shaped-valley': 'erosion', 'glacial-u-valley': 'erosion', delta: 'deposition', 'sand-dune': 'deposition', moraine: 'deposition', 'rock-layers': 'deposition' };
  NC.PRIMARY = PRIMARY;
  var TS = { fast: 'Fast: seconds to days', medium: 'Medium: years to hundreds of years', slow: 'Slow: thousands to millions of years' };
  NC.questions = function (lfId) {
    var l = lfData(lfId); if (!l) return [];
    var mis = l.misconceptions || {};
    return [
      { id: 'process', q: 'Which process mostly made the ' + (l.name || lfId).toLowerCase() + '?', options: ['weathering', 'erosion', 'deposition'], answer: PRIMARY[lfId] || l.process[0], hint: l.hint || (PRIMARY[lfId] === 'deposition' ? 'This landform was built up: sediment was carried here and DROPPED.' : 'This landform was carved: moving water or ice CARRIED rock away.') },
      { id: 'agent', q: 'What moved the rock and sediment?', options: ['water', 'wind', 'ice', 'gravity'], answer: l.agent[0], hint: l.agent[0] === 'ice' ? 'Something frozen and very heavy slid slowly over the land.' : l.agent[0] === 'wind' ? 'It happens in dry, sandy places where air moves the grains.' : 'Look for a river or the sea nearby.' },
      { id: 'time', q: 'How long did it take to form?', options: ['fast', 'medium', 'slow'], labels: TS, answer: l.timescale, hint: l.timescale === 'slow' ? 'Most landforms take thousands to millions of years.' : l.timescale === 'fast' ? 'This one can change in a single storm or windy day.' : 'Think years to hundreds of years.' }
    ];
  };
  // answer one question; wrong gives a hint and another try (never a cost). Correct the first time it is solved earns energy once.
  NC.answer = function (save, lfId, qid, pick) {
    var c = ensure(save), qs = NC.questions(lfId), q = qs.filter(function (x) { return x.id === qid; })[0]; if (!q) return { ok: false, reason: 'no-question' };
    var rec = c.quiz[lfId] = c.quiz[lfId] || { tries: 0, ok: {} }; rec.tries++;
    if (pick !== q.answer) return { ok: false, correct: false, hint: q.hint };
    var first = !rec.ok[qid]; rec.ok[qid] = true; if (first) NC.earn(save, 'quiz:' + lfId + ':' + qid, 2);
    return { ok: true, correct: true, done: NC.explained(save, lfId) };
  };
  NC.explained = function (save, lfId) { var r = save.civ && save.civ.quiz && save.civ.quiz[lfId]; return !!(r && r.ok.process && r.ok.agent && r.ok.time); };

  // ---------- Shaping Energy (play only) ----------
  NC.earn = function (save, key, n) { var e = ensure(save).energy; if (e.earned[key]) return 0; e.earned[key] = n; e.bal += n; return n; };
  NC.balance = function (save) { return ensure(save).energy.bal; };
  NC.syncEarnings = function (save) { // missions finished and problems looked back on: each pays once, any time
    var got = 0; Object.keys(save.missions || {}).forEach(function (m) { if (save.missions[m].done) got += NC.earn(save, 'mission:' + m, 3); });
    Object.keys((save.civ && save.civ.probs) || {}).forEach(function (p) { if (save.civ.probs[p].done) got += NC.earn(save, 'lookback:' + p, 2); }); return got;
  };
  NC.TOOLS = [
    { id: 'biome', name: 'Paint a biome', base: 1, perCell: 1, needs: 0 },
    { id: 'raise', name: 'Raise mountains', base: 3, perCell: 1, needs: 0 },
    { id: 'river', name: 'Carve a river', base: 3, perCell: 1, needs: 0 },
    { id: 'town', name: 'Place a town', base: 6, perCell: 0, needs: 0 },
    { id: 'warmer', name: 'Shift climate warmer', base: 6, perCell: 0, needs: 10 },
    { id: 'cooler', name: 'Shift climate cooler', base: 6, perCell: 0, needs: 10 },
    { id: 'iceage', name: 'Start an ice age', base: 20, perCell: 0, needs: 30, big: true },
    { id: 'coast', name: 'Move the coastline', base: 12, perCell: 2, needs: 40, big: true }
  ];
  NC.tool = function (id) { return NC.TOOLS.filter(function (t) { return t.id === id; })[0] || null; };
  function eraOf(c) { return Math.floor((c.year - c.startYear) / NC.ERA_YEARS); }
  NC.eraInfo = function (save) { var c = ensure(save), e = c.energy, era = eraOf(c); if (e.era !== era) { e.era = era; e.used = 0; e.big = 0; } return { era: era, used: e.used, left: Math.max(0, NC.ERA_LIMIT - e.used), bigLeft: Math.max(0, NC.BIG_PER_ERA - e.big), nextEraYear: c.startYear + (era + 1) * NC.ERA_YEARS }; };
  function areaCells(save, ix, act) {
    var bd = bounds(save, ix), n = Math.max(1, Math.min(3, act.size || 1)), out = [];
    if (act.tool === 'river') { for (var k = 0; k < 3 * n && out.length < NC.MAX_CELLS; k++) out.push({ i: act.i + k, j: act.j }); }
    else for (var dj = 0; dj < n; dj++) for (var di = 0; di < n; di++) out.push({ i: act.i + di, j: act.j + dj });
    return out.filter(function (q) { return q.i >= bd.min && q.j >= bd.min && q.i <= bd.max && q.j <= bd.max; });
  }
  var CODE = { raise: 'm', river: 'w', coast: 'c' };
  // what a change would do, before doing it (cost, warnings). Destroying settlements, landforms or other biomes costs much more.
  NC.preview = function (save, ix, act) {
    var c = ensure(save), t = NC.tool(act.tool), info = NC.eraInfo(save); if (!t) return { allowed: false, reason: 'no-tool' };
    if (!c.started) return { allowed: false, reason: 'not-started' };
    if (info.left <= 0) return { allowed: false, reason: 'era-limit', era: info };
    var cells = ['warmer', 'cooler', 'iceage'].indexOf(t.id) >= 0 ? [] : areaCells(save, ix, act), a = pa(save), code = act.tool === 'biome' ? act.code : CODE[act.tool];
    if ((act.size || 1) > 3 || cells.length > NC.MAX_CELLS) return { allowed: false, reason: 'too-big' };
    if (['warmer', 'cooler', 'iceage'].indexOf(t.id) < 0) { var bdo = bounds(save, ix); if (act.i < bdo.min || act.j < bdo.min || act.i > bdo.max || act.j > bdo.max || !cells.length) return { allowed: false, reason: 'off-island', cells: [] }; }
    var setts = [], lfs = [], changed = 0, places = 0;
    cells.forEach(function (q) {
      var s = c.setts.filter(function (x) { return x.i === q.i && x.j === q.j; })[0]; if (s && t.id !== 'town') setts.push(s.name);
      NC.near(save, q.i, q.j, 0).forEach(function (n) { if (lfs.indexOf(NC.KINDS[n.lf].name) < 0) lfs.push(NC.KINDS[n.lf].name); });
      if (S.tileAt(save, q.i, q.j) && t.id !== 'biome') places++;
      if (code && a[q.j * N() + q.i] !== code) changed++;
    });
    if (t.id === 'town') { var st = CC.suit(save, ix, act.i, act.j); if (!st || c.setts.some(function (s) { return Math.max(Math.abs(s.i - act.i), Math.abs(s.j - act.j)) < 3; })) return { allowed: false, reason: 'no-room', cells: cells }; }
    if (t.id === 'iceage' && c.ice.phase !== 'none') return { allowed: false, reason: 'ice-now' };
    if (code && !changed && t.id !== 'town') return { allowed: false, reason: 'no-change', cells: cells };
    var near = []; if (t.id === 'iceage' || t.id === 'coast') c.setts.forEach(function (s) { if (cells.some(function (q) { return Math.max(Math.abs(q.i - s.i), Math.abs(q.j - s.j)) <= 1; }) && setts.indexOf(s.name) < 0) near.push(s.name); });
    var cost = t.base + t.perCell * changed + 15 * setts.length + 8 * lfs.length + 5 * places + 4 * near.length + (changed > 4 ? 2 * (changed - 4) : 0);
    var r = { allowed: true, tool: t.id, cells: cells, changed: changed, cost: cost, harms: { settlements: setts, landforms: lfs, places: places, nearby: near }, needsConfirm: !!(setts.length || lfs.length || places || near.length), era: info };
    if (NC.balance(save) < t.needs) { r.allowed = false; r.reason = 'locked'; r.needs = t.needs; }
    else if (info.left <= 0) { r.allowed = false; r.reason = 'era-limit'; }
    else if (t.big && info.bigLeft <= 0) { r.allowed = false; r.reason = 'big-era-limit'; }
    else if (NC.balance(save) < cost) { r.allowed = false; r.reason = 'energy'; }
    return r;
  };
  NC.shape = function (save, ix, act) {
    var p = NC.preview(save, ix, act); if (!p.allowed) return { ok: false, reason: p.reason, preview: p };
    if (p.needsConfirm && !act.confirm) return { ok: false, reason: 'confirm', preview: p };
    var c = save.civ, e = c.energy, snap = { paint: save.world.paint, setts: JSON.parse(JSON.stringify(c.setts)), nat: JSON.parse(JSON.stringify(c.nat)), climate: c.climate, ice: JSON.parse(JSON.stringify(c.ice)), cost: p.cost, big: !!NC.tool(act.tool).big, tool: act.tool, year: c.year, next: c.next };
    var a = pa(save), code = act.tool === 'biome' ? act.code : CODE[act.tool];
    if (code) { p.cells.forEach(function (q) { a[q.j * N() + q.i] = code; }); setPa(save, a); }
    // settlements in the way move peacefully to the nearest good spot (nobody is hurt); landforms there are worn away
    var moved = [];
    if (p.harms.settlements.length) c.setts = c.setts.filter(function (s) {
      if (p.harms.settlements.indexOf(s.name) < 0) return true;
      var to = NC.newHome(save, ix, s, p.cells);
      if (to) { s.i = to.i; s.j = to.j; s.water = !!to.st.water; s.coast = !!to.st.coast; s.why = CC.why(to.st); s.moved = (s.moved || 0) + 1; moved.push({ name: s.name, i: to.i, j: to.j }); CC.log(c, 'The families of ' + s.name + ' packed up and moved safely to new land nearby before the land changed.', 'shape'); return true; }
      moved.push({ name: s.name, left: true }); CC.log(c, 'There was no open land left for ' + s.name + ', so its families sailed away safely to find a new home across the sea. No one was hurt.', 'shape'); return false;
    });
    if (p.harms.landforms.length) c.nat = c.nat.filter(function (n) { return !p.cells.some(function (q) { return q.i === n.i && q.j === n.j; }); });
    if (act.tool === 'warmer') c.climate = Math.max(-2, snap.climate - 1);
    if (act.tool === 'cooler') c.climate = Math.min(2, snap.climate + 1);
    if (act.tool === 'iceage') startIce(save, ix);
    if (act.tool === 'town') { var pk = CC.pack(c.grade) || {}, names = pk.names || [], nm = names[(c.next - 1) % Math.max(1, names.length)] || 'Town ' + c.next, st = CC.suit(save, ix, act.i, act.j); c.setts.push({ id: 's' + c.next, name: nm, i: act.i, j: act.j, pop: 8, founded: c.year, water: !!st.water, coast: !!st.coast, why: CC.why(st), placed: true }); c.next++; }
    e.bal -= p.cost; e.used++; if (snap.big) e.big++; e.last = snap;
    CC.log(c, 'You shaped the world: ' + NC.tool(act.tool).name.toLowerCase() + '.', 'shape');
    return { ok: true, cost: p.cost, preview: p, moved: moved };
  };
  // nearest open, livable spot for a settlement that has to move (not under the change, not crowding another settlement)
  NC.newHome = function (save, ix, s, avoid) {
    var bd = bounds(save, ix), best = null, c = save.civ;
    for (var j = bd.min; j <= bd.max; j++) for (var i = bd.min; i <= bd.max; i++) {
      if ((avoid || []).some(function (q) { return q.i === i && q.j === j; })) continue;
      if (c.setts.some(function (o) { return o !== s && Math.max(Math.abs(o.i - i), Math.abs(o.j - j)) < 2; })) continue;
      var st = CC.suit(save, ix, i, j); if (!st || st.score < 1 || st.biome === 'm' || st.biome === 't') continue;
      var d = Math.abs(i - s.i) + Math.abs(j - s.j) - st.score / 10; if (!best || d < best.d) best = { i: i, j: j, d: d, st: st };
    }
    return best;
  };
  NC.undo = function (save) {
    var c = ensure(save), e = c.energy, s = e.last; if (!s) return { ok: false, reason: 'nothing' };
    save.world.paint = s.paint; c.setts = s.setts; c.nat = s.nat; c.climate = s.climate; c.ice = s.ice; c.next = s.next;
    e.bal += s.cost; e.used = Math.max(0, e.used - 1); if (s.big) e.big = Math.max(0, e.big - 1); e.last = null;
    CC.log(c, 'You undid your last change.', 'shape'); return { ok: true, refund: s.cost };
  };

  function natSvg(sv, xy) {
    var A = root.DAW_ART, o = ['<g class="nat-layer" pointer-events="none">'];
    sv.civ.nat.forEach(function (n) { var k = NC.KINDS[n.lf], p = xy(n.i, n.j); if (!k) return; var th = A && A.thumb ? String(A.thumb(k.art, 46, 2)) : '', sc = n.size && n.size !== 1 ? ' scale(' + n.size + ')' : '';
      o.push('<g class="nat-lf" data-lf="' + n.lf + '" transform="translate(' + (p[0] - 23) + ' ' + (p[1] - 30) + ')' + sc + '"><title>' + k.name + ' (formed by nature)</title>' + (th.indexOf('<svg') === 0 ? th : '<circle cx="23" cy="23" r="14" fill="#e9d8a6"/>') + '<rect x="1" y="44" width="44" height="11" rx="5.5" fill="rgba(46,125,50,.85)"/><text x="23" y="52.5" text-anchor="middle" font-size="7.5" font-weight="700" fill="#fff" font-family="Lexend, sans-serif">' + k.name.split(' ')[0] + '</text></g>'); });
    o.push('</g>'); return o.join('');
  }
  // the free biome brush may not paint over settlements (those changes go through Shape: preview, cost, undo)
  NC.guardPaint = function (save, prevPaint) {
    var c = ensure(save); if (!c.started || prevPaint == null) return 0; var n = N(), a = pa(save), b = S.BIO.decode(prevPaint, n), back = 0;
    var keep = c.setts.map(function (s) { return [s.i, s.j]; });
    keep.forEach(function (q) { var k = q[1] * n + q[0]; if (a[k] !== b[k]) { a[k] = b[k]; back++; } });
    if (back) setPa(save, a); return back;
  };
  // ---------- hook into the civilization engine ----------
  function wrap() {
    CC.__natWrapped = true;
    var tick = CC.tick, suit = CC.suit, choose = CC.choose, why = CC.why, start = CC.start;
    CC.tick = function (save, ix) { var r = tick(save, ix); if (!r.paused) { r.nature = NC.tick(save, ix, CC.artOf || null); } return r; };
    CC.start = function (save, ix, g) { ensure(save); var r = start(save, ix, g); if (r.ok) NC.syncEarnings(save); return r; };
    CC.suit = function (save, ix, i, j, pref) { var st = suit(save, ix, i, j, pref); if (!st || !save.civ || !Array.isArray(save.civ.nat)) return st; var nn = NC.near(save, i, j, 2); st.uses = []; nn.forEach(function (n) { var k = NC.KINDS[n.lf]; if (k && k.use) { st.score += 2; st.uses.push(k.useText); } if (n.lf === 'sand-dune' || n.lf === 'moraine') st.score -= 1; }); if (st.coast && st.water) st.uses.push('a port at the river mouth'); return st; };
    CC.why = function (st) { var o = why(st); (st && st.uses || []).forEach(function (u) { if (o.indexOf(u) < 0) o.push(u); }); return o; };
    var svg = CC.svgLayer; CC.svgLayer = function (sv, xy) { var base = svg(sv, xy); if (!base || !sv.civ || !(sv.civ.nat || []).length) return base; return natSvg(sv, xy) + base; };
    CC.choose = function (save, ix, pid, oid, extra, now) { var p = CC.problem(save, pid); if (p && p.landform && !NC.explained(save, p.landform)) return { ok: false, reason: 'quiz', landform: p.landform }; return choose(save, ix, pid, oid, extra, now); };
  }
  if (CC) { root.DAW_NATC = NC; CC.nature = NC; }
  if (typeof module !== 'undefined' && module.exports) module.exports = NC;
})(typeof window !== 'undefined' ? window : globalThis);
