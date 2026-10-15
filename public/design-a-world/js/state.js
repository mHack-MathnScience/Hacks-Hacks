/* Design a World: save model, progression rules, checkpoints, save files/codes.
   Pure logic (no DOM) so it can be unit-tested in Node. */
(function (root) {
  'use strict';
  var LZ = root.LZString || (typeof require === 'function' ? require('./vendor/lz-string.min.js') : null);
  var SCHEMA = 7, APP = 'design-a-world', FILE_FORMAT = 'design-a-world-save', CODE_PREFIX = 'DAW7';
  // Map grid. Schema 6 doubled the resolution: each old tile is now 2 x 2 cells (RES = 2). Stage sizes in the
  // mission data stay in old tile units and are multiplied by RES. A placed thing covers s x s cells (s = 1 or 2),
  // anchored at its smallest (i, j). Migration (schema 5 -> 6) maps an old tile (i, j) to the cells (2i, 2j) with s = 2,
  // so old worlds look the same and every coordinate is exactly doubled.
  var RES = 2, WORLD = 12 * RES, FP_FN = null, ART_FN = null;
  // Painted biomes (js/biomes.js): save.world.paint is a run-length string, one letter per cell.
  var BIO = root.DAW_BIOMES || (typeof require === 'function' ? require('./biomes.js') : null);
  // Hooks set by the Field Guide (describe-core): is an item described? extra TEKS sources? extra XP?
  // Hooks set by the world engine (world-core): is a mission's need active? open or guided? stage needs met? history TEKS?
  var HOOK = { described: null, teks: null, xp: null, needActive: null, freedom: null, stageGate: null, history: null };
  function getHooks() { var o = {}; Object.keys(HOOK).forEach(function (k) { o[k] = HOOK[k]; }); return o; }
  function setHooks(h) { Object.keys(h || {}).forEach(function (k) { HOOK[k] = h[k]; }); }
  var LEVEL_XP = 300;

  function fnv1a(str) { var h = 0x811c9dc5; for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return ('0000000' + h.toString(16)).slice(-8); }
  function checksum(json) { return fnv1a('daw|' + json); }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function nowIso(now) { return (now ? new Date(now) : new Date()).toISOString(); }
  function rid() { return Math.random().toString(36).slice(2, 10); }

  // ---------- data index ----------
  function index(data) {
    var ix = { data: data, byId: {}, byItem: {}, stages: data.stages || [{ id: 1, title: 'World', mapSize: WORLD }], teks: data.teks, missions: data.missions };
    data.missions.forEach(function (m) { ix.byId[m.id] = m; if (!ix.byItem[m.unlockItem]) ix.byItem[m.unlockItem] = m; if (!m.stage) m.stage = 1; m.requires = m.requires || []; m.uses = m.uses || []; });
    ix.items = {}; (data.items || []).forEach(function (it) { ix.items[it.id] = it; });
    data.missions.forEach(function (m) { if (!ix.items[m.unlockItem]) ix.items[m.unlockItem] = { id: m.unlockItem, name: null, art: m.unlockItem, category: m.category, stage: m.stage, mission: m.id }; });
    ix.aliases = { missions: (data.aliases && data.aliases.missions) || {}, items: (data.aliases && data.aliases.items) || {} }; // old id -> merged/renamed id (mission audit)
    ix.subjects = data.subjects || ['science'];
    ix.stageIds = ix.stages.map(function (s) { return s.id; });
    ix.lastStage = ix.stageIds[ix.stageIds.length - 1];
    ix.dataHash = fnv1a(data.missions.map(function (m) { return m.id + ':' + m.stage; }).join(','));
    return ix;
  }

  // ---------- new / validate / migrate ----------
  function newSave(name, period, now) {
    var t = nowIso(now);
    return { schema: SCHEMA, app: APP, id: rid(), created: t, updated: t, student: { name: name || '', period: period || '' },
      world: { tiles: [], nextUid: 1, paint: '' }, names: {}, missions: {}, stageDone: {}, writing: {}, describe: {}, needs: { seen: {}, events: [], flags: {}, upkeep: {} }, history: { arcs: {}, marks: [] }, showcase: {}, unlocked: {}, fun: blankFun(), civ: blankCiv(), checkpoints: [], settings: {} };
  }
  // schema 5: play-only fun data (favorites, seasons, world events, achievements, skins). Never shown to teachers as a score.
  // schema 7: civilization layer (js/civ-core.js). Settlements, problems, choices, reflections. Counts and statuses only.
  function blankCiv() { return { v: 1, grade: null, started: false, year: 0, startYear: 0, ticks: 0, speed: 1, setts: [], probs: {}, m: {}, log: [], structs: [], gov: [], prices: [], pref: null, next: 1, homeland: null, lastClose: null }; }
  function blankFun() { return { v: 1, favs: [], seasons: [], events: [], flags: {}, ach: {}, nick: {}, skin: 'classic', theme: 'spring', ticks: 0, lastEv: 0, seenUnlocks: {} }; }
  function migrate(s) {
    if (!s || typeof s !== 'object') return s;
    if (!s.schema || s.schema < 2) { // schema 1 (never shipped) -> 2: add the progressive-stage fields
      s.schema = 2; s.stageDone = s.stageDone || {}; s.checkpoints = s.checkpoints || []; s.names = s.names || {};
    }
    s.world = s.world || { tiles: [], nextUid: 1 }; s.world.tiles = s.world.tiles || [];
    s.names = s.names || {}; s.missions = s.missions || {}; s.stageDone = s.stageDone || {}; s.checkpoints = s.checkpoints || []; s.settings = s.settings || {};
    s.student = s.student || { name: '', period: '' }; s.writing = s.writing || {};
    if (s.schema < 3) { // schema 2 -> 3: Field Guide descriptions. Every placed thing is kept; anything that
      // needs a description simply shows as "needs description" until the student writes one.
      s.schema = 3; s.describe = s.describe || {}; s.migrated = { from: 2, at: new Date().toISOString(), seen: false };
    }
    s.describe = s.describe || {};
    if (s.schema < 4) { // schema 3 -> 4: world needs/events, history arcs, showcase. Stages already open stay open.
      var from = s.schema; s.schema = 4; s.needs = s.needs || {}; s.history = s.history || {}; s.showcase = s.showcase || {}; s.unlocked = s.unlocked || {};
      s.unlocked[1] = s.unlocked[1] || s.created || new Date().toISOString(); Object.keys(s.stageDone || {}).forEach(function (k) { s.unlocked[+k + 1] = s.unlocked[+k + 1] || s.stageDone[k]; });
      if (!s.migrated || s.migrated.from >= 3) s.migrated = s.migrated && s.migrated.from < 3 ? s.migrated : { from: from, at: new Date().toISOString(), seen: true };
    }
    if (s.schema < 5) { // schema 4 -> 5: fun pass. Nothing is removed. Achievements already earned are awarded quietly (retro) on the next load.
      s.schema = 5; s.fun = s.fun && typeof s.fun === 'object' ? s.fun : blankFun(); s.fun.retro = true;
    }
    if (!s.fun || typeof s.fun !== 'object' || Array.isArray(s.fun)) s.fun = blankFun();
    if (s.schema < 6) { // schema 5 -> 6: finer map grid. Old tile (i, j) -> cells (2i, 2j) as a 2 x 2 footprint; marks move to the same spot.
      s.schema = 6;
      s.world.tiles.forEach(function (t) { if (typeof t.i === 'number' && typeof t.j === 'number') { t.i = t.i * RES; t.j = t.j * RES; t.s = RES; } });
      ((s.history && s.history.marks) || []).forEach(function (m) { if (typeof m.i === 'number' && typeof m.j === 'number') { m.i = m.i * RES + (RES - 1) / 2; m.j = m.j * RES + (RES - 1) / 2; } });
      s.world.grid = { res: RES, from: 'old tile (i, j) -> cells (2i, 2j), size 2 x 2; coordinates doubled' };
    }
    if (s.schema < 7) { // schema 6 -> 7: civilization layer. Nothing changes in the world; civilizations start when the student chooses.
      s.schema = 7; if (!s.civ || typeof s.civ !== 'object') s.civ = blankCiv();
    }
    if (!s.civ || typeof s.civ !== 'object' || Array.isArray(s.civ)) s.civ = blankCiv();
    ensurePaint(s); // after the grid migration, so cells line up
    s.needs = s.needs || {}; s.needs.seen = s.needs.seen || {}; s.needs.events = s.needs.events || []; s.needs.flags = s.needs.flags || {}; s.needs.upkeep = s.needs.upkeep || {};
    s.history = s.history || {}; s.history.arcs = s.history.arcs || {}; s.history.marks = s.history.marks || []; s.showcase = s.showcase || {}; s.unlocked = s.unlocked || {};
    if (Array.isArray(s.checkpoints)) s.checkpoints.forEach(function (c) { if (c && c.snap) { c.snap.describe = c.snap.describe || {}; c.snap.needs = c.snap.needs || { seen: {}, events: [], flags: {}, upkeep: {} }; c.snap.history = c.snap.history || { arcs: {}, marks: [] }; c.snap.showcase = c.snap.showcase || {}; c.snap.fun = c.snap.fun || blankFun(); c.snap.civ = c.snap.civ || blankCiv(); } });
    return s;
  }
  // Mission audit: when missions are merged or renamed, move old progress onto the surviving id.
  // A cut mission (alias to null/'') keeps its record under save.retired so nothing is lost.
  function applyAliases(s, ix) {
    var am = (ix && ix.aliases && ix.aliases.missions) || {}, ai = (ix && ix.aliases && ix.aliases.items) || {}, moved = 0;
    Object.keys(am).forEach(function (old) {
      var r = s.missions[old]; if (!r || ix.byId[old]) return; var to = am[old];
      if (to && ix.byId[to]) { var cur = s.missions[to]; if (!cur || (!cur.done && r.done) || ((cur.rev || 0) < (r.rev || 0) && r.done)) { s.missions[to] = r; } (s.missions[to].mergedFrom = s.missions[to].mergedFrom || []).indexOf(old) < 0 && s.missions[to].mergedFrom.push(old); }
      else { s.retired = s.retired || {}; s.retired[old] = r; }
      delete s.missions[old]; moved++;
    });
    Object.keys(ai).forEach(function (old) {
      if (!ai[old] || (ix.items && ix.items[old])) return;
      s.world.tiles.forEach(function (t) { if (t.t === old) { t.t = ai[old]; moved++; } });
      if (s.names[old] && !s.names[ai[old]]) { s.names[ai[old]] = s.names[old]; } delete s.names[old];
    });
    return moved;
  }
  function validate(s) {
    var e = [];
    if (!s || typeof s !== 'object') return ['Not a save.'];
    if (s.app !== APP) e.push('This is not a Design a World save.');
    if (typeof s.schema !== 'number') e.push('Missing save version.');
    else if (s.schema > SCHEMA) e.push('This save is from a newer version of the game (v' + s.schema + ').');
    if (!s.world || !Array.isArray(s.world.tiles)) e.push('World map is missing.');
    else s.world.tiles.forEach(function (t, k) { if (typeof t.i !== 'number' || typeof t.j !== 'number' || typeof t.t !== 'string' || t.i < 0 || t.j < 0 || t.i + sizeOf(t) > WORLD || t.j + sizeOf(t) > WORLD) e.push('Bad map tile #' + k); });
    if (!s.missions || typeof s.missions !== 'object') e.push('Mission progress is missing.');
    if (!s.student || typeof s.student !== 'object') e.push('Student info is missing.');
    if (s.writing && typeof s.writing !== 'object') e.push('Writing entries are damaged.');
    if (s.describe && (typeof s.describe !== 'object' || Array.isArray(s.describe))) e.push('Field Guide descriptions are damaged.');
    if (s.world && Array.isArray(s.world.tiles)) s.world.tiles.forEach(function (t, k) { if (t.o != null && !Array.isArray(t.o)) e.push('Bad living things on tile #' + k); });
    if (s.needs && (typeof s.needs !== 'object' || (s.needs.events && !Array.isArray(s.needs.events)))) e.push('World needs are damaged.');
    if (s.history && (typeof s.history !== 'object' || (s.history.arcs && typeof s.history.arcs !== 'object') || (s.history.marks && !Array.isArray(s.history.marks)))) e.push('History events are damaged.');
    if (s.showcase && (typeof s.showcase !== 'object' || Array.isArray(s.showcase))) e.push('Showcase is damaged.');
    if (s.world && s.world.paint != null && !(BIO ? BIO.valid(s.world.paint) : typeof s.world.paint === 'string')) e.push('Painted biomes are damaged.');
    if (s.fun && (typeof s.fun !== 'object' || Array.isArray(s.fun) || (s.fun.favs && !Array.isArray(s.fun.favs)))) e.push('Game extras are damaged.');
    return e;
  }

  // ---------- world ----------
  function bounds(size) { var off = Math.floor((WORLD - size) / 2); return { min: off, max: off + size - 1, size: size }; }
  function stageSize(ix, sid) { var st = ix.stages.filter(function (s) { return s.id === sid; })[0]; return st && st.mapSize ? st.mapSize * RES : WORLD; }
  function inBounds(ix, save, i, j, opts) { var b = bounds(stageSize(ix, highestUnlocked(save, ix, opts))); return i >= b.min && i <= b.max && j >= b.min && j <= b.max; }
  function sizeOf(t) { return t && t.s > 1 ? t.s : 1; }
  function coversCell(t, i, j) { var n = sizeOf(t); return i >= t.i && i < t.i + n && j >= t.j && j < t.j + n; }
  function tileAt(save, i, j) { var a = save.world.tiles; for (var k = 0; k < a.length; k++) if (coversCell(a[k], i, j)) return a[k]; return null; }
  function setFootprint(fn) { FP_FN = fn; }
  function setArtOf(fn) { ART_FN = fn; }
  // saves from before painted biomes: paint the cells under placed biome items (forest, desert, lake...); the rest stays default grassland
  function ensurePaint(s) { if (!s || !s.world || typeof s.world.paint === 'string') return false; if (!BIO || !ART_FN) return false; s.world.paint = BIO.infer(s.world.tiles, WORLD, function (id) { try { return ART_FN(id); } catch (e) { return null; } }); return true; }
  function footprint(itemId) { var n = FP_FN ? FP_FN(itemId) : 1; return n > 1 ? Math.min(n, 3) : 1; }
  // Where a thing of size n would go if the student taps cell (i, j): the first anchor whose n x n cells are all free and
  // unlocked, trying anchors that keep the tapped cell inside the footprint (tapped cell first as the top-left).
  function fitAt(save, ix, i, j, n, opts) {
    n = n || 1; var best = null;
    for (var di = 0; di < n && !best; di++) for (var dj = 0; dj < n && !best; dj++) {
      var ai = i - di, aj = j - dj, ok = true;
      for (var a = 0; a < n && ok; a++) for (var c = 0; c < n && ok; c++) { var x = ai + a, y = aj + c; if (x < 0 || y < 0 || x >= WORLD || y >= WORLD || !inBounds(ix, save, x, y, opts) || tileAt(save, x, y)) ok = false; }
      if (ok) best = { i: ai, j: aj, s: n };
    }
    return best;
  }
  function onMap(save, itemId) { return save.world.tiles.some(function (t) { return t.t === itemId; }); }
  function mastered(save, ix, itemId) { var m = ix.byItem[itemId]; return !m || !!(save.missions[m.id] && save.missions[m.id].done); }
  function described(save, itemId) { return !HOOK.described || HOOK.described(save, itemId); }
  function itemReady(save, ix, itemId) { return onMap(save, itemId) && mastered(save, ix, itemId) && described(save, itemId); }

  // ---------- progression ----------
  function stageMissions(ix, sid) { return ix.missions.filter(function (m) { return m.stage === sid; }); }
  function stageComplete(save, ix, sid) { var ms = stageMissions(ix, sid); return ms.length > 0 && ms.every(function (m) { return save.missions[m.id] && save.missions[m.id].done; }); }
  function stageUnlocked(save, ix, sid, opts) {
    if (opts && opts.unlockAll) return true;
    var k = ix.stageIds.indexOf(sid); if (k <= 0) return true;
    if (HOOK.stageGate && save.unlocked && save.unlocked[sid]) return true; // once open, a stage stays open
    for (var n = 0; n < k; n++) { if (!stageComplete(save, ix, ix.stageIds[n])) return false; if (HOOK.stageGate && !HOOK.stageGate(save, ix, ix.stageIds[n])) return false; }
    return true;
  }
  function highestUnlocked(save, ix, opts) { var h = ix.stageIds[0]; ix.stageIds.forEach(function (s) { if (stageUnlocked(save, ix, s, opts)) h = s; }); return h; }
  function currentStage(save, ix, opts) { for (var k = 0; k < ix.stageIds.length; k++) { var s = ix.stageIds[k]; if (!stageComplete(save, ix, s)) return stageUnlocked(save, ix, s, opts) ? s : ix.stageIds[Math.max(0, k - 1)]; } return ix.lastStage; }
  function missingRequirements(save, ix, m) { return (m.requires || []).filter(function (id) { return !itemReady(save, ix, id); }); }
  function reviewReasons(save, ix, m, nameOf) {
    var r = save.missions[m.id], out = []; if (!r || !r.done) return out;
    nameOf = nameOf || function (id) { return id; };
    var items = (m.requires || []).concat((m.uses || []).filter(function (u) { return u.item; }).map(function (u) { return u.item; }));
    items.filter(function (v, k) { return items.indexOf(v) === k; }).forEach(function (id) {
      if (!onMap(save, id) && ix.byItem[id] && (r.deps && r.deps.items && r.deps.items.indexOf(id) >= 0)) out.push({ kind: 'item', id: id, text: 'You removed ' + nameOf(id) + ' from the map. This mission used it.' });
    });
    (m.uses || []).filter(function (u) { return u.answer; }).forEach(function (u) {
      var a = save.missions[u.answer], was = r.deps && r.deps.answers ? r.deps.answers[u.answer] : undefined;
      if (a && was !== undefined && a.rev > was) out.push({ kind: 'answer', id: u.answer, text: 'You changed your answer for \u201c' + (ix.byId[u.answer] ? ix.byId[u.answer].title : u.answer) + '\u201d. Check that this mission still fits.' });
    });
    if (r.dataHash && ix.dataHash && r.dataHash !== ix.dataHash && false) out.push({ kind: 'data', text: 'Mission content was updated.' });
    return out;
  }
  function missionState(save, ix, m, opts) {
    var r = save.missions[m.id];
    if (r && r.done) return reviewReasons(save, ix, m).length ? 'review' : 'done';
    if (!stageUnlocked(save, ix, m.stage, opts)) return 'locked';
    var miss = missingRequirements(save, ix, m).length;
    if (HOOK.needActive) { // sandbox: the world asks for a mission when it needs it; open places can be built any time
      if (!miss && HOOK.needActive(save, ix, m)) return onMap(save, m.unlockItem) ? 'placed' : 'ready';
      if (onMap(save, m.unlockItem)) return 'waiting';
      if (miss && freedomOf(m) !== 'open') return 'needs';
      return 'build';
    }
    if (miss) return 'needs';
    return onMap(save, m.unlockItem) ? 'placed' : 'ready';
  }
  function freedomOf(m) { return HOOK.freedom ? HOOK.freedom(m) : (m.freedom || 'guided'); }
  var SUBJECTS = [{ id: 'science', name: 'Science' }, { id: 'math', name: 'Math' }, { id: 'writing', name: 'Writing' }, { id: 'social_studies', name: 'Social Studies' }];
  function teksSubject(t) { if (t.subject) return t.subject === 'social-studies' ? 'social_studies' : t.subject; var id = t.id || t; return /^ELA\./.test(id) ? 'writing' : /^SS\./.test(id) ? 'social_studies' : /^MA\./.test(id) ? 'math' : 'science'; }
  function covers(m) { return (m.teks || []).concat(m.practices || []); }
  function tracker(save, ix) {
    var extra = HOOK.teks ? HOOK.teks(save) : { covers: {}, done: {} }, hist = HOOK.history ? HOOK.history(save, ix) : { covers: {}, done: {} };
    var rows = ix.teks.map(function (t) {
      var subj = teksSubject(t), fgCov = (extra.covers[t.id] || []).concat(hist.covers[t.id] || []), fgDone = (extra.done[t.id] || []).concat(hist.done[t.id] || []);
      var ms = ix.missions.filter(function (m) { return covers(m).indexOf(t.id) >= 0; });
      var done = ms.filter(function (m) { return save.missions[m.id] && save.missions[m.id].done; });
      var review = done.filter(function (m) { return reviewReasons(save, ix, m).length; });
      return { id: t.id, subject: subj, strand: t.strand, kid: t.kid, text: t.text, missions: ms.map(function (m) { return m.id; }), done: done.length > 0 || fgDone.length > 0, doneMissions: done.map(function (m) { return m.id; }), review: review.length > 0 && review.length === done.length && !fgDone.length, guide: fgCov, guideDone: fgDone, sources: ms.length + fgCov.length };
    });
    var n = rows.filter(function (r) { return r.done; }).length;
    var bySubject = SUBJECTS.map(function (sb) { var rs = rows.filter(function (r) { return r.subject === sb.id; }), d = rs.filter(function (r) { return r.done; }).length; return { id: sb.id, name: sb.name, total: rs.length, done: d, covered: rs.filter(function (r) { return r.sources; }).length }; }); // counts only: no percentages (the teacher does the scoring)
    var cov = rows.filter(function (r) { return r.sources; });
    return { rows: rows, done: n, total: rows.length, covered: cov.length, allCoveredDone: cov.every(function (r) { return r.done; }), bySubject: bySubject };
  }
  function completedCount(save) { return Object.keys(save.missions).filter(function (k) { return save.missions[k].done; }).length; }
  function totalXP(save) { var x = 0; Object.keys(save.missions).forEach(function (k) { if (save.missions[k].done) x += save.missions[k].xp || 0; }); if (HOOK.xp) x += HOOK.xp(save); return x; }
  function level(save) { var x = totalXP(save); return { level: 1 + Math.floor(x / LEVEL_XP), into: x % LEVEL_XP, need: LEVEL_XP, xp: x }; }

  // writing checklists (criteria only, never points); the editor, the report, and the teacher view all use these
  var WRITING_CHECKLISTS = {
    journal: ['I wrote a clear topic sentence.', 'I used at least 3 science words.', 'I named a place in my world as evidence.', 'My facts are in an order that makes sense.', 'I wrote a conclusion.', 'I checked capitals, punctuation, and spelling.'],
    narrative: ['My story has a character and a setting in my world.', 'It has a beginning, a middle, and an end.', 'I used time-order words (first, then, finally).', 'The science in my story is correct.', 'I used details that help readers picture it.', 'I checked capitals, punctuation, and spelling.'],
    proposal: ['I clearly say what I want to build and where, with a coordinate like (4, 7).', 'I give at least 2 reasons with evidence (data, budget, or science).', 'I explain the cost and how it fits my budget.', 'I answer someone who might disagree.', 'I end with a strong conclusion.', 'I checked capitals, punctuation, and spelling.'],
    informational: ['I introduce my topic clearly.', 'I grouped facts under headings or in paragraphs.', 'I used science words and explained them.', 'I used data or a graph from my world.', 'I wrote a conclusion.', 'I checked capitals, punctuation, and spelling.'],
    response: ['I answered every part of the prompt.', 'I used evidence from my world.', 'I used science words correctly.', 'I checked capitals, punctuation, and spelling.'],
    // history artifacts (each history event can bring its own rubric; these are the defaults)
    declaration: ['I state the rights all people have.', 'I list the unfair acts or problems clearly.', 'I explain why we are making this declaration.', 'I use social studies words (rights, independence, government, consent).', 'I checked capitals, punctuation, and spelling.'],
    constitution: ['I say that the people agree to govern themselves.', 'I name the purpose of our government.', 'I explain how leaders are chosen and laws are made.', 'I protect the rights of everyone, including people already living on the land.', 'I checked capitals, punctuation, and spelling.'],
    compromise: ['I explain what each side wants.', 'I describe a plan where each side gives a little.', 'I explain why the plan is fair.', 'I use social studies words (compromise, representation, tariff, vote).', 'I checked capitals, punctuation, and spelling.'],
    amendment: ['I state exactly what the change to the constitution says.', 'I explain the problem it fixes.', 'I explain who it protects.', 'I use social studies words (amendment, rights, citizen, equal protection).', 'I checked capitals, punctuation, and spelling.'],
    petition: ['I address the leaders who can make the change.', 'I describe the problem with facts.', 'I ask for a specific, peaceful change.', 'I give reasons and evidence.', 'I checked capitals, punctuation, and spelling.']
  };
  // neutral progress wording (no percentages): the teacher does the scoring
  function evidenceLine(tr) { return tr.done + ' of ' + tr.total + ' TEKS have evidence'; }
  function subjectCounts(tr, subj) { var rs = tr.rows.filter(function (r) { return r.subject === subj; }); return { evidence: rs.filter(function (r) { return r.done; }).length, notYet: rs.filter(function (r) { return !r.done && r.sources; }).length, notInGame: rs.filter(function (r) { return !r.done && !r.sources; }).length, total: rs.length }; }
  var BADGES = [
    { id: 'first', name: 'First Discovery', desc: 'Finish your first mission.', test: function (s) { return completedCount(s) >= 1; } },
    { id: 'stage1', name: 'Earth Shaper', desc: 'Complete Stage 1: Earth & Materials.', test: function (s, ix) { return stageComplete(s, ix, 1); } },
    { id: 'stage2', name: 'Weather Watcher', desc: 'Complete Stage 2: Water, Weather & Sky.', test: function (s, ix) { return stageComplete(s, ix, 2); } },
    { id: 'stage3', name: 'Ecosystem Engineer', desc: 'Complete Stage 3: Ecosystems & Organisms.', test: function (s, ix) { return stageComplete(s, ix, 3); } },
    { id: 'stage4', name: 'Town Planner', desc: 'Complete Stage 4: People, Resources, Energy & Forces.', test: function (s, ix) { return stageComplete(s, ix, 4); } },
    { id: 'practices', name: 'Practice Pro', desc: 'Use every science practice and theme (5.1\u20135.5).', test: function (s, ix) { return tracker(s, ix).rows.filter(function (r) { return /^5\.[1-5][A-G]$/.test(r.id); }).every(function (r) { return r.done; }); } },
    { id: 'gt5', name: 'Deep Thinker', desc: 'Answer 5 GT challenges.', test: function (s) { var d = s.describe || {}; return Object.keys(s.missions).filter(function (k) { return s.missions[k].gt && s.missions[k].gt.trim().split(/\s+/).length >= 8; }).length + Object.keys(d).filter(function (k) { return d[k].ok && (d[k].k === 'cmp' || (d[k].gt && d[k].gt.trim().split(/\s+/).length >= 8)); }).length >= 5; } },
    { id: 'field10', name: 'Field Scientist', desc: 'Describe 10 things in your Field Guide.', test: function (s) { var d = s.describe || {}; return Object.keys(d).filter(function (k) { return d[k].ok && /^(lf|ft|org):/.test(k); }).length >= 10; } },
    { id: 'naturalist', name: 'Naturalist', desc: 'Identify the adaptations of 5 plants or animals.', test: function (s) { var d = s.describe || {}; return Object.keys(d).filter(function (k) { return d[k].ok && /^org:/.test(k); }).length >= 5; } },
    { id: 'firsttry', name: 'Sharp Eye', desc: 'Get 10 missions right on the first try.', test: function (s) { return Object.keys(s.missions).filter(function (k) { return s.missions[k].firstTry; }).length >= 10; } },
    { id: 'builder', name: 'World Builder', desc: 'Place 30 things on your map.', test: function (s) { return s.world.tiles.length >= 30; } },
    { id: 'namer', name: 'Map Maker', desc: 'Name 5 places in your world.', test: function (s) { return Object.keys(s.names).filter(function (k) { return s.names[k]; }).length >= 5; } },
    { id: 'teks100', name: 'TEKS Master', desc: 'Finish a mission for every TEKS in your mission set.', test: function (s, ix) { return tracker(s, ix).allCoveredDone; } },
    { id: 'sci100', name: 'Science Star', desc: 'Finish a mission or Field Guide entry for every Science TEKS.', test: function (s, ix) { var b = tracker(s, ix).bySubject[0]; return b.total > 0 && b.done === b.total; } }
  ];
  function badges(save, ix) { return BADGES.filter(function (b) { try { return b.test(save, ix); } catch (e) { return false; } }).map(function (b) { return b.id; }); }

  // ---------- actions ----------
  function touch(save, now) { save.updated = nowIso(now); }
  function placeItem(save, ix, i, j, itemId, opts) {
    if (tileAt(save, i, j)) return { ok: false, reason: 'occupied' };
    if (!inBounds(ix, save, i, j, opts)) return { ok: false, reason: 'locked-area' };
    var n = (opts && opts.size) || footprint(itemId), fit = fitAt(save, ix, i, j, n, opts);
    if (!fit) return { ok: false, reason: 'no-room', size: n };
    var m = ix.byItem[itemId];
    if (m) {
      if (!stageUnlocked(save, ix, m.stage, opts)) return { ok: false, reason: 'locked-stage' };
      var miss = missingRequirements(save, ix, m), open = freedomOf(m) === 'open' && !!HOOK.needActive; if (miss.length && !open && !(save.missions[m.id] && save.missions[m.id].done)) return { ok: false, reason: 'needs', missing: miss };
      if (!mastered(save, ix, itemId) && onMap(save, itemId)) return { ok: false, reason: 'pending' };
    }
    var tile = { i: fit.i, j: fit.j, t: itemId, u: save.world.nextUid++ }; if (n > 1) tile.s = n;
    save.world.tiles.push(tile); touch(save, opts && opts.now);
    var start = m && !mastered(save, ix, itemId) && (!HOOK.needActive || (!miss.length && HOOK.needActive(save, ix, m)));
    return { ok: true, tile: tile, startMission: start ? m.id : null, waiting: !!(m && !mastered(save, ix, itemId) && !start) };
  }
  function dependents(save, ix, itemId) { // done missions that would need review if the LAST copy of itemId is removed
    var copies = save.world.tiles.filter(function (t) { return t.t === itemId; }).length; if (copies > 1) return [];
    return ix.missions.filter(function (m) {
      var r = save.missions[m.id]; if (!r || !r.done || m.unlockItem === itemId) return false;
      return (m.requires || []).indexOf(itemId) >= 0 || (m.uses || []).some(function (u) { return u.item === itemId; });
    }).map(function (m) { return m.id; });
  }
  function eraseTile(save, ix, i, j, opts) {
    var t = tileAt(save, i, j); if (!t) return { ok: false, reason: 'empty' };
    var dep = dependents(save, ix, t.t);
    save.world.tiles = save.world.tiles.filter(function (x) { return x !== t; }); touch(save, opts && opts.now);
    return { ok: true, removed: t, flagged: dep };
  }
  function renameItem(save, itemId, name, now) { save.names[itemId] = String(name || '').slice(0, 40); touch(save, now); }
  function depsFor(save, ix, m) {
    var d = { items: [], answers: {} };
    (m.requires || []).forEach(function (id) { if (d.items.indexOf(id) < 0) d.items.push(id); });
    (m.uses || []).forEach(function (u) { if (u.item && d.items.indexOf(u.item) < 0 && onMap(save, u.item)) d.items.push(u.item); if (u.answer) d.answers[u.answer] = save.missions[u.answer] ? save.missions[u.answer].rev : 0; });
    return d;
  }
  // rec: {answer, followUp, explain:{c,e,r}, gt, firstTry, revealed, xp}
  function completeMission(save, ix, mid, rec, opts) {
    var m = ix.byId[mid]; if (!m) throw new Error('Unknown mission ' + mid);
    var now = opts && opts.now, prev = save.missions[mid], t = nowIso(now);
    var r = { done: true, rev: (prev ? prev.rev || 0 : 0) + 1, completedAt: prev && prev.completedAt ? prev.completedAt : t, updatedAt: t,
      answer: rec.answer, followUp: rec.followUp, parts: rec.parts && Object.keys(rec.parts).length ? rec.parts : undefined, explain: rec.explain || { c: '', e: '', r: '' }, gt: rec.gt || '',
      firstTry: !!(rec.firstTry || (prev && prev.firstTry)), revealed: !!rec.revealed && !(prev && prev.done && !prev.revealed),
      xp: Math.max(rec.xp || 0, prev ? prev.xp || 0 : 0), deps: depsFor(save, ix, m) };
    save.missions[mid] = r; touch(save, now);
    var out = { record: r, stageCompleted: null, checkpoint: null };
    if (stageComplete(save, ix, m.stage) && !save.stageDone[m.stage]) {
      save.stageDone[m.stage] = t; out.stageCompleted = m.stage;
      var st = ix.stages.filter(function (s) { return s.id === m.stage; })[0];
      out.checkpoint = addCheckpoint(save, 'Stage ' + m.stage + ' Checkpoint' + (st ? ': ' + st.title : ''), m.stage, now);
    }
    return out;
  }
  function updateExplanation(save, ix, mid, explain, gt, now) { // re-answering just the explanation
    var r = save.missions[mid]; if (!r || !r.done) return false;
    r.explain = explain; if (gt != null) r.gt = gt; r.rev = (r.rev || 0) + 1; r.updatedAt = nowIso(now); r.deps = depsFor(save, ix, ix.byId[mid]); touch(save, now); return true;
  }
  function markReviewed(save, ix, mid, now) { var r = save.missions[mid]; if (!r) return false; r.deps = depsFor(save, ix, ix.byId[mid]); r.reviewedAt = nowIso(now); touch(save, now); return reviewReasons(save, ix, ix.byId[mid]).length === 0; }

  // ---------- writing workspace ----------
  function countWords(t) { return String(t || '').trim().split(/\s+/).filter(Boolean).length; }
  function saveWriting(save, id, entry, now) {
    var prev = save.writing[id] || { rev: 0, created: nowIso(now) };
    var e = { title: String(entry.title != null ? entry.title : prev.title || '').slice(0, 80), genre: entry.genre || prev.genre || 'journal', mission: entry.mission || prev.mission || null,
      prompt: entry.prompt != null ? entry.prompt : prev.prompt || '', text: String(entry.text != null ? entry.text : prev.text || '').slice(0, 20000),
      checks: entry.checks || prev.checks || [], created: prev.created, updated: nowIso(now), rev: (prev.rev || 0) + 1 };
    e.words = countWords(e.text); save.writing[id] = e; touch(save, now); return e;
  }
  function deleteWriting(save, id, now) { if (!save.writing[id]) return false; delete save.writing[id]; touch(save, now); return true; }

  // ---------- checkpoints ----------
  function snapshot(save) { var c = clone(save); delete c.checkpoints; return c; }
  function addCheckpoint(save, name, stage, now) {
    var cp = { id: rid(), name: name, stage: stage || null, ts: nowIso(now), snap: snapshot(save) };
    save.checkpoints.push(cp);
    var manual = save.checkpoints.filter(function (c) { return !/^Stage \d/.test(c.name); }); // keep the 10 newest manual/auto-backup ones
    if (manual.length > 10) { var drop = manual[0]; save.checkpoints = save.checkpoints.filter(function (c) { return c !== drop; }); }
    touch(save, now); return cp;
  }
  function restoreCheckpoint(save, cpId, now) {
    var cp = save.checkpoints.filter(function (c) { return c.id === cpId; })[0]; if (!cp) return null;
    var keep = save.checkpoints.slice();
    var before = { id: rid(), name: 'Before restoring \u201c' + cp.name + '\u201d', stage: null, ts: nowIso(now), snap: snapshot(save) };
    keep.push(before);
    var s = migrate(clone(cp.snap)); s.checkpoints = keep; touch(s, now); return s;
  }

  // ---------- files & codes ----------
  function forCode(save) { var c = snapshot(save); delete c.settings; return c; }
  function encodeCode(save) { var json = JSON.stringify(forCode(save)); return CODE_PREFIX + '.' + checksum(json) + '.' + LZ.compressToEncodedURIComponent(json); }
  function decodeCode(text) {
    var s = String(text || '').replace(/\s+/g, ''), mm = /^DAW(\d+)\.([0-9a-f]{8})\.([A-Za-z0-9+\-$]+)$/.exec(s);
    if (!mm) return { ok: false, error: 'That does not look like a Design a World code. Codes start with DAW (for example DAW7.).' };
    var json = LZ.decompressFromEncodedURIComponent(mm[3]);
    if (!json) return { ok: false, error: 'The code is incomplete or damaged. Copy the whole code and try again.' };
    var obj; try { obj = JSON.parse(json); } catch (e) { return { ok: false, error: 'The code is damaged.' }; }
    var verified = checksum(json) === mm[2];
    obj = migrate(obj); var errs = validate(obj);
    if (errs.length) return { ok: false, error: errs.join(' '), save: obj, verified: verified };
    return { ok: verified, verified: verified, save: obj, kind: 'code', error: verified ? null : 'The code was changed after it was made (checksum does not match).' };
  }
  function toFileText(save, now) { var json = JSON.stringify(save); return JSON.stringify({ format: FILE_FORMAT, schema: SCHEMA, exportedAt: nowIso(now), checksum: checksum(json), save: save }, null, 1); }
  function parseFileText(text) {
    var obj; try { obj = JSON.parse(text); } catch (e) { return decodeCode(text); }
    if (!obj || obj.format !== FILE_FORMAT || !obj.save) return { ok: false, error: 'This file is not a Design a World save file.' };
    var verified = checksum(JSON.stringify(obj.save)) === obj.checksum;
    var s = migrate(obj.save), errs = validate(s);
    if (errs.length) return { ok: false, error: errs.join(' '), save: s, verified: verified };
    return { ok: verified, verified: verified, save: s, kind: 'file', error: verified ? null : 'The save file was changed after it was made (checksum does not match).' };
  }
  function loadAny(text) { var t = String(text || '').trim(); if (!t) return { ok: false, error: 'Nothing to load.' }; return t.charAt(0) === '{' ? parseFileText(t) : decodeCode(t); }
  function fileName(save, label) {
    var n = (save.student && save.student.name || 'student').replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'student';
    var d = new Date(save.updated || Date.now()); var ds = d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
    return 'DesignAWorld-' + n + (label ? '-' + label.replace(/[^A-Za-z0-9]+/g, '') : '') + '-' + ds;
  }

  var api = { blankFun: blankFun, blankCiv: blankCiv, CODE_PREFIX: CODE_PREFIX, WRITING_CHECKLISTS: WRITING_CHECKLISTS, evidenceLine: evidenceLine, subjectCounts: subjectCounts, setHooks: setHooks, getHooks: getHooks, applyAliases: applyAliases, described: described, SCHEMA: SCHEMA, APP: APP, WORLD: WORLD, RES: RES, sizeOf: sizeOf, coversCell: coversCell, setArtOf: setArtOf, ensurePaint: ensurePaint, BIO: BIO, fitAt: fitAt, footprint: footprint, setFootprint: setFootprint, LEVEL_XP: LEVEL_XP, BADGES: BADGES, fnv1a: fnv1a, checksum: checksum, clone: clone,
    index: index, newSave: newSave, migrate: migrate, validate: validate, bounds: bounds, stageSize: stageSize, inBounds: inBounds, tileAt: tileAt, onMap: onMap,
    mastered: mastered, itemReady: itemReady, stageMissions: stageMissions, stageComplete: stageComplete, stageUnlocked: stageUnlocked, highestUnlocked: highestUnlocked,
    currentStage: currentStage, missingRequirements: missingRequirements, reviewReasons: reviewReasons, missionState: missionState, tracker: tracker,
    completedCount: completedCount, totalXP: totalXP, level: level, badges: badges, placeItem: placeItem, dependents: dependents, eraseTile: eraseTile,
    renameItem: renameItem, completeMission: completeMission, updateExplanation: updateExplanation, markReviewed: markReviewed, addCheckpoint: addCheckpoint,
    restoreCheckpoint: restoreCheckpoint, snapshot: snapshot, encodeCode: encodeCode, decodeCode: decodeCode, toFileText: toFileText, parseFileText: parseFileText,
    loadAny: loadAny, freedomOf: freedomOf, hooks: function () { return HOOK; }, fileName: fileName, SUBJECTS: SUBJECTS, teksSubject: teksSubject, countWords: countWords, saveWriting: saveWriting, deleteWriting: deleteWriting, covers: covers };
  root.DAW_STATE = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
