/* Design a World: fun-pass engine (pure logic, Node-testable). Favorites rule, written-vs-visual evidence,
   survival seasons, gentle random world events, townsfolk (NPC) lines, unlockable skins/themes,
   collectible Field Guide cards, and achievements. Content: data/fun.json and data/achievements.json.
   Nothing here is a score: achievements and unlocks are play-only and never appear in teacher surfaces. */
(function (root) {
  'use strict';
  var F = {}, S = null, D = null, WC = null, FD = null, AD = null, ART = function (id) { return id; };
  F.install = function (state, funData, achData, opts) {
    S = state; FD = funData || { npcs: [], events: [], skins: [], seasons: { conditions: [], tolerate: {}, clues: {} }, favorites: { perStage: 2, minWords: 12 } };
    AD = achData || { list: [] }; opts = opts || {}; D = opts.desc || root.DAW_DESC || null; WC = opts.world || root.DAW_WORLDC || null; if (opts.artOf) ART = opts.artOf;
    return F;
  };
  // compose with the hooks installed by the Field Guide and world layers: stage gate also needs favorites;
  // the TEKS tracker also counts a survival season. Safe to call more than once.
  F.hook = function () {
    if (!S || !S.getHooks) return; var h = S.getHooks();
    var bt = h.teks && h.teks._fun ? h.teks._base : h.teks, bg = h.stageGate && h.stageGate._fun ? h.stageGate._base : h.stageGate;
    var teks = function (save) {
      var a = bt ? bt(save) : { covers: {}, done: {} }, b = F.seasonTeks(save), out = { covers: {}, done: {} };
      [a, b].forEach(function (src) { ['covers', 'done'].forEach(function (k) { Object.keys(src[k] || {}).forEach(function (t) { out[k][t] = uniq((out[k][t] || []).concat(src[k][t])); }); }); });
      return out;
    };
    var gate = function (save, ix, sid) { return (!bg || bg(save, ix, sid)) && (!!(save.fun && save.fun.noFavGate) || F.favGateMet(save, ix, sid)); };
    teks._fun = gate._fun = true; teks._base = bt; gate._base = bg; S.setHooks({ teks: teks, stageGate: gate });
  };
  // older saves: every stage that was open before the favorites rule stays open (recorded in save.unlocked)
  F.grandfather = function (save, ix) {
    if (!S || !ix) return 0; var f = F.ensure(save), n = 0; f.noFavGate = true; save.unlocked = save.unlocked || {};
    try { ix.stageIds.forEach(function (sid) { if (!save.unlocked[sid] && S.stageUnlocked(save, ix, sid, {})) { save.unlocked[sid] = nowIso(); n++; } }); } finally { delete f.noFavGate; }
    return n;
  };
  // demo worlds and teacher previews: star written entries so the favorites rule is met for a stage
  F.demoFavs = function (save, ix, sid) {
    var st = F.favStatus(save, ix, sid), need = st.need - st.written; if (need <= 0) return 0; var n = 0, r = save.describe || {};
    Object.keys(r).forEach(function (k) { if (n < need && /^(lf|ft|org):/.test(k) && F.written(r[k]) && !F.isFav(save, k)) { F.star(save, k, sid); n++; } });
    return n;
  };
  F.data = function () { return FD; }; F.achData = function () { return AD; };
  function words(t) { return String(t || '').trim().split(/\s+/).filter(Boolean).length; }
  function nowIso(n) { return (n ? new Date(n) : new Date()).toISOString(); }
  function dx() { return D && D.shared ? D.shared() : null; }
  function uniq(a) { return a.filter(function (v, k) { return a.indexOf(v) === k; }); }
  F.words = words;

  // ---------- save area (schema 5: save.fun) ----------
  F.blank = function () { return { v: 1, favs: [], seasons: [], events: [], flags: {}, ach: {}, nick: {}, skin: 'classic', theme: 'spring', ticks: 0, lastEv: 0, seenUnlocks: {} }; };
  F.ensure = function (save) {
    var f = save.fun = save.fun && typeof save.fun === 'object' ? save.fun : F.blank(), b = F.blank();
    Object.keys(b).forEach(function (k) { if (f[k] == null) f[k] = b[k]; });
    if (!Array.isArray(f.favs)) f.favs = []; if (!Array.isArray(f.seasons)) f.seasons = []; if (!Array.isArray(f.events)) f.events = [];
    return f;
  };
  F.flag = function (save, k, v) { var f = F.ensure(save); if (!f.flags[k]) { f.flags[k] = v || nowIso(); return true; } return false; };

  // ---------- written vs. visual evidence ----------
  F.minWords = function () { return (FD.favorites && FD.favorites.minWords) || 12; };
  // A record is "written" when it carries the student's own explanation (favorites, or older saves that required text).
  F.written = function (rec) {
    if (!rec || !rec.ok) return false;
    if (rec.k === 'org') { if (words(rec.text) >= F.minWords()) return true; var ex = rec.explain || {}, ks = Object.keys(ex); return ks.length > 0 && ks.every(function (k) { return words(ex[k]) >= 5; }) && words(ks.map(function (k) { return ex[k]; }).join(' ')) >= F.minWords(); }
    return words(rec.text) >= F.minWords();
  };
  F.evidenceKind = function (rec) { return !rec || !rec.ok ? 'none' : F.written(rec) ? 'written' : 'picks'; };

  // ---------- favorites (2 per stage, each with one short written explanation) ----------
  F.isFav = function (save, key) { return F.ensure(save).favs.some(function (x) { return x.key === key; }); };
  F.favOf = function (save, key) { return F.ensure(save).favs.filter(function (x) { return x.key === key; })[0] || null; };
  F.star = function (save, key, stage, now) { var f = F.ensure(save); if (F.isFav(save, key)) return F.favOf(save, key); var x = { key: key, stage: stage || 1, at: nowIso(now) }; f.favs.push(x); return x; };
  F.unstar = function (save, key) { var f = F.ensure(save); var n = f.favs.length; f.favs = f.favs.filter(function (x) { return x.key !== key; }); return f.favs.length < n; };
  function okKeys(save) { var r = save.describe || {}; return Object.keys(r).filter(function (k) { return r[k] && r[k].ok && /^(lf|ft|org):/.test(k); }); }
  F.favStatus = function (save, ix, sid) {
    var per = (FD.favorites && FD.favorites.perStage) || 2, f = F.ensure(save), recs = save.describe || {};
    var mine = f.favs.filter(function (x) { return x.stage === sid && recs[x.key] && recs[x.key].ok; });
    var others = f.favs.filter(function (x) { return x.stage !== sid; }).map(function (x) { return x.key; });
    var eligible = okKeys(save).filter(function (k) { return others.indexOf(k) < 0; }).length;
    var need = Math.min(per, eligible), written = mine.filter(function (x) { return F.written(recs[x.key]); });
    return { stage: sid, need: need, per: per, starred: mine.length, written: written.length, met: written.length >= need, keys: mine.map(function (x) { return x.key; }) };
  };
  F.favGateMet = function (save, ix, sid) { return F.favStatus(save, ix, sid).met; };
  F.favStagesDone = function (save, ix) { var st = {}; F.ensure(save).favs.forEach(function (x) { var r = (save.describe || {})[x.key]; if (F.written(r)) st[x.stage] = (st[x.stage] || 0) + 1; }); return Object.keys(st).filter(function (k) { return st[k] >= Math.min(2, (FD.favorites || {}).perStage || 2); }).length; };

  // ---------- Field Guide evidence per TEKS (visual picks vs. written) ----------
  function defFor(x, k) { var kind = k.slice(0, k.indexOf(':')), id = k.slice(k.indexOf(':') + 1); return kind === 'lf' ? x.lf[id] : kind === 'ft' ? x.ft[id] : kind === 'org' ? x.org[id] : null; }
  F.guideEvidence = function (save, teks) {
    var x = dx(), out = { picks: [], written: [], revealed: [] }; if (!x) return out;
    var recs = save.describe || {};
    Object.keys(recs).forEach(function (k) {
      var r = recs[k]; if (!r || !r.ok || !/^(lf|ft|org):/.test(k)) return; var d = defFor(x, k); if (!d || (d.teks || []).indexOf(teks) < 0) return;
      if (r.revealed) out.revealed.push(d.name); else out.picks.push(d.name);
      if (F.written(r)) out.written.push(d.name);
    });
    if (F.seasonTeksList().indexOf(teks) >= 0 && F.seasonEarned(save)) out.picks.push('Survival season');
    return out;
  };

  // ---------- survival season ----------
  F.seasonTeksList = function () { return ['5.13A', '5.13B', '5.12B']; };
  F.conditions = function () { return (FD.seasons && FD.seasons.conditions) || []; };
  F.cond = function (id) { return F.conditions().filter(function (c) { return c.id === id; })[0] || { id: id, name: id }; };
  function pickTrait(o, cond) {
    var re = new RegExp((FD.seasons.clues || {})[cond] || 'food', 'i'), ts = o.traits || [];
    return ts.filter(function (t) { return re.test(t.text + ' ' + (t.helps || '')); })[0] || ts[0] || null;
  }
  // Pure simulation. Each creature thrives or struggles, and the result says why (home, weather, food).
  F.runSeason = function (x, biome, condId, orgIds) {
    x = x || dx(); var tol = (FD.seasons.tolerate || {})[condId] || [], cond = F.cond(condId), bm = x.biome[biome] || { name: biome };
    var ids = uniq((orgIds || []).filter(function (id) { return x.org[id]; })).slice(0, (FD.seasons.maxOrgs || 6));
    var nm = function (id) { return x.org[id] ? x.org[id].name : id; };
    var res = ids.map(function (id) {
      var o = x.org[id], home = o.biomes.indexOf(biome) >= 0, tolerant = condId === 'mild' || o.biomes.some(function (b) { return tol.indexOf(b) >= 0; });
      var role = o.role || (o.kind === 'plant' ? 'producer' : 'consumer'), food = true, foodTxt = '';
      if (role === 'producer') { food = !(condId === 'dry' && !tolerant); foodTxt = food ? 'It makes its own food from sunlight, air, and water.' : 'Plants need water to make food, and there is very little.'; }
      else if (role === 'decomposer') { food = ids.length > 1; foodTxt = food ? 'It breaks down dead leaves and waste from the others.' : 'With no other living things, it has nothing to break down.'; }
      else { var eats = o.eats || [], here = eats.filter(function (e) { return ids.indexOf(e) >= 0; }); food = eats.length ? here.length > 0 : ids.some(function (y) { return y !== id && x.org[y] && (x.org[y].role === 'producer' || x.org[y].role === 'decomposer'); }); foodTxt = food ? (here.length ? 'It found food: ' + here.map(nm).join(', ') + '.' : 'It found small things to eat here.') : 'Nothing here for it to eat. It eats ' + (eats.map(nm).join(', ') || 'small plants and animals') + '.'; }
      var t = pickTrait(o, condId), status = home && tolerant && food ? 'thrive' : 'struggle', why = [];
      if (home) why.push('Its home is the ' + bm.name.toLowerCase() + '.'); else why.push('It usually lives in: ' + o.biomes.map(function (b) { return (x.biome[b] || {}).name || b; }).join(', ') + '. The ' + bm.name.toLowerCase() + ' does not give it what it needs.');
      if (!tolerant) why.push('The ' + String(cond.name || condId).toLowerCase() + ' is hard on it. Its traits fit other weather better.');
      why.push(foodTxt);
      if (t && status === 'thrive') why.push(t.text + ' (' + (t.type === 'behavior' ? 'a behavior' : 'a structure') + ', ' + (t.origin === 'learned' ? 'learned' : 'inherited') + '): ' + (t.helps || 'it helps it survive') + '.');
      else if (t) why.push('Its traits, like ' + t.text.toLowerCase() + ' (' + (t.origin === 'learned' ? 'learned' : 'inherited') + '), cannot change in one season. Living things need a home that fits their traits.');
      return { id: id, name: o.name, role: role, status: status, home: home, tolerant: tolerant, food: food, why: why, trait: t ? { text: t.text, type: t.type, origin: t.origin === 'learned' ? 'learned' : 'inherited' } : null };
    });
    var thr = res.filter(function (r) { return r.status === 'thrive'; }), has = function (role) { return thr.some(function (r) { return r.role === role; }); };
    var web = has('producer') && has('consumer') && has('decomposer') && res.filter(function (r) { return r.role === 'consumer'; }).every(function (r) { return r.food; });
    return { biome: biome, cond: condId, results: res, allThrive: res.length >= 3 && thr.length === res.length && has('producer'), foodWeb: web && thr.length === res.length, thriving: thr.length, total: res.length };
  };
  F.recordSeason = function (save, run, now) {
    var f = F.ensure(save), rec = { b: run.biome, c: run.cond, o: run.results.map(function (r) { return r.id; }), r: {}, all: !!run.allThrive, web: !!run.foodWeb, at: nowIso(now) };
    run.results.forEach(function (r) { rec.r[r.id] = r.status; }); f.seasons.push(rec); if (f.seasons.length > 30) f.seasons.splice(0, f.seasons.length - 30); return rec;
  };
  F.seasonEarned = function (save) { return F.ensure(save).seasons.some(function (r) { return r.all; }); };
  F.seasonComeback = function (save) { var a = F.ensure(save).seasons; for (var j = 0; j < a.length; j++) if (a[j].all) for (var i = 0; i < j; i++) if (!a[i].all && a[i].b === a[j].b) return true; return false; };
  F.seasonTeks = function (save) { var cov = {}, done = {}, ok = F.seasonEarned(save); F.seasonTeksList().forEach(function (t) { cov[t] = ['Survival season']; if (ok) done[t] = ['Survival season']; }); return { covers: cov, done: done }; };

  // ---------- gentle random world events (framed as needs; teacher can turn them off) ----------
  F.eventDef = function (id) { return (FD.events || []).filter(function (e) { return e.id === id; })[0] || null; };
  F.activeEvent = function (save) { return F.ensure(save).events.filter(function (e) { return !e.resolved; })[0] || null; };
  F.eventsOn = function (save, opts) { return !(opts && opts.events === false) && !(save.settings && save.settings.events === false); };
  function tilesArt(save) { return save.world.tiles.map(function (t) { return { t: t, art: ART(t.t) }; }); }
  F.eligibleEvents = function (save, ix, opts) {
    var hi = S && ix ? S.highestUnlocked(save, ix, opts) : 4, arts = tilesArt(save).map(function (x) { return x.art; }), orgs = 0; save.world.tiles.forEach(function (t) { orgs += (t.o || []).length; });
    return (FD.events || []).filter(function (e) { return (e.minStage || 1) <= hi && (!(e.needsArt || []).length || e.needsArt.some(function (a) { return arts.indexOf(a) >= 0; })) && orgs >= (e.needsOrgs || 0); });
  };
  F.startEvent = function (save, id, now) {
    var f = F.ensure(save), e = F.eventDef(id); if (!e || F.activeEvent(save)) return null;
    var fx = e.fx || {}, list = fx.on || fx.near || [], tiles = tilesArt(save).filter(function (x) { return list.indexOf(x.art) >= 0; }).map(function (x) { return x.t.u; });
    if (fx.kind === 'invasive') tiles = save.world.tiles.filter(function (t) { return (t.o || []).length; }).map(function (t) { return t.u; }).slice(0, 2);
    var rec = { id: id, n: f.events.length + 1, at: nowIso(now), tiles: tiles.slice(0, 6), resolved: false, tries: 0 }; f.events.push(rec); f.lastEv = f.ticks;
    if (WC) { WC.ensure(save); save.needs.events.push({ id: 'world:' + id + ':' + rec.n, kind: 'world', ev: id, npc: e.npc, title: e.name, text: e.text, at: rec.at }); }
    return rec;
  };
  // after each meaningful change: maybe start an event (deterministic when given rnd)
  F.tick = function (save, ix, rnd, opts) {
    var f = F.ensure(save), R = FD.eventRules || { minActions: 6, chance: 0.35, firstAfterStage: 1 }; f.ticks++;
    if (!F.eventsOn(save, opts) || F.activeEvent(save)) return null;
    if (S && ix && !S.stageComplete(save, ix, R.firstAfterStage || 1)) return null;
    if (f.ticks - (f.lastEv || 0) < (R.minActions || 6)) return null;
    var r = rnd || Math.random; if (r() > (R.chance || 0.35)) return null;
    var el = F.eligibleEvents(save, ix, opts), seen = f.events.map(function (e) { return e.id; });
    var fresh = el.filter(function (e) { return seen.indexOf(e.id) < 0; }), pool = fresh.length ? fresh : el; if (!pool.length) return null;
    return F.startEvent(save, pool[Math.floor(r() * pool.length) % pool.length].id);
  };
  F.respond = function (save, choiceIdx, now) {
    var a = F.activeEvent(save); if (!a) return { ok: false, reason: 'none' }; var e = F.eventDef(a.id), c = (e.choices || [])[choiceIdx]; if (!c) return { ok: false, reason: 'bad' };
    a.tries = (a.tries || 0) + 1;
    if (!c.ok) return { ok: false, why: c.why, choice: c };
    a.resolved = nowIso(now); a.choice = choiceIdx;
    if (WC) { WC.ensure(save); save.needs.events.forEach(function (x) { if (x.kind === 'world' && x.ev === a.id) x.ack = true; }); save.needs.events.push({ id: 'worldfix:' + a.id + ':' + a.n, kind: 'fixed', world: a.id, npc: e.npc, title: e.name + ': fixed!', text: c.why + ' ' + (e.learn || ''), at: a.resolved }); }
    return { ok: true, why: c.why, learn: e.learn, choice: c, event: a };
  };
  // map consequences of the active event
  F.eventFx = function (save) {
    var a = F.activeEvent(save), out = { kind: null, tiles: [], byArt: {} }; if (!a) return out; var e = F.eventDef(a.id); if (!e) return out;
    out.kind = (e.fx || {}).kind; out.tiles = a.tiles || []; out.id = a.id;
    if (out.kind === 'dry') ((e.fx || {}).on || []).forEach(function (art) { out.byArt[art] = 'dry'; });
    return out;
  };

  // ---------- townsfolk ----------
  F.npcs = function () { return FD.npcs || []; };
  F.npc = function (id) { return F.npcs().filter(function (n) { return n.id === id; })[0] || F.npcs()[0] || null; };
  F.npcFor = function (key) {
    key = String(key || ''); var up = (FD.upkeepNpc || {})[key]; if (up) return F.npc(up);
    var r = (FD.npcRules || []).filter(function (x) { return new RegExp(x.match, 'i').test(key); })[0]; return F.npc(r ? r.npc : 'marisol');
  };
  function hash(s) { var h = 2166136261; s = String(s); for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h; }
  F.line = function (npc, kind, vars, seed) {
    if (typeof npc === 'string') npc = F.npc(npc); if (!npc) return ''; var a = npc[kind] || npc.hello || [''];
    var t = a[hash(seed == null ? kind : seed) % a.length] || ''; vars = vars || {};
    return t.replace(/\{(\w+)\}/g, function (m, k) { return vars[k] != null ? vars[k] : ''; });
  };

  // ---------- cards and nicknames ----------
  F.cards = function (save) {
    var x = dx(), recs = save.describe || {}, out = []; if (!x) return out;
    function add(kind, d) { var k = kind + ':' + d.id, r = recs[k]; out.push({ key: k, kind: kind, id: d.id, name: d.name, art: d.art || ((d.items || [])[0]) || null, got: !!(r && r.ok), fav: F.isFav(save, k), written: F.written(r), nick: kind === 'org' ? (F.ensure(save).nick[d.id] || '') : '' }); }
    (x.data.landforms || []).forEach(function (d) { if (d.palette !== false) add('lf', d); }); (x.data.features || []).forEach(function (d) { add('ft', d); }); (x.data.organisms || []).forEach(function (d) { add('org', d); });
    return out;
  };
  F.setNick = function (save, orgId, name) { var f = F.ensure(save), v = String(name || '').replace(/[<>]/g, '').trim().slice(0, 20); if (v) f.nick[orgId] = v; else delete f.nick[orgId]; return v; };

  // ---------- skins and themes ----------
  F.skins = function (kind) { return (FD.skins || []).filter(function (s) { return !kind || s.kind === kind; }); };
  F.skin = function (id) { return (FD.skins || []).filter(function (s) { return s.id === id; })[0] || null; };
  F.isUnlocked = function (save, ix, sk) { var u = sk.unlock || {}; if (u.always) return true; if (u.stageComplete != null) return !!(S && ix && S.stageComplete(save, ix, u.stageComplete)); if (u.achievement) return !!(F.ensure(save).ach[u.achievement]); return false; };
  F.unlockedSkins = function (save, ix) { return (FD.skins || []).filter(function (s) { return F.isUnlocked(save, ix, s); }); };
  F.newUnlocks = function (save, ix) { var f = F.ensure(save); return F.unlockedSkins(save, ix).filter(function (s) { return !(s.unlock || {}).always && !f.seenUnlocks[s.id]; }); };
  F.markSeen = function (save, ids) { var f = F.ensure(save); (ids || []).forEach(function (id) { f.seenUnlocks[id] = nowIso(); }); };
  F.apply = function (save, ix, id) { var sk = F.skin(id); if (!sk || !F.isUnlocked(save, ix, sk)) return false; var f = F.ensure(save); if (sk.kind === 'building') { f.skin = id; if (id !== 'classic') F.flag(save, 'skinUsed'); } else { f.theme = id; if (id !== 'spring') F.flag(save, 'themeUsed'); } return true; };

  // ---------- achievements ----------
  F.ach = function () { return AD.list || []; };
  F.achDef = function (id) { return F.ach().filter(function (a) { return a.id === id; })[0] || null; };
  F.metrics = function (save, ix) {
    var x = dx(), recs = save.describe || {}, keys = okKeys(save), m = {}, f = F.ensure(save);
    var lfs = keys.filter(function (k) { return k.indexOf('lf:') === 0; }).map(function (k) { return x && x.lf[k.slice(3)]; }).filter(Boolean);
    var orgs = keys.filter(function (k) { return k.indexOf('org:') === 0; }).map(function (k) { return x && x.org[k.slice(4)]; }).filter(Boolean);
    var fts = keys.filter(function (k) { return k.indexOf('ft:') === 0; }).map(function (k) { return x && x.ft[k.slice(3)]; }).filter(Boolean);
    m.lfDistinct = lfs.length; m.orgDistinct = orgs.length;
    var ag = {}; lfs.forEach(function (l) { (l.agent || []).forEach(function (a) { ag[a] = 1; }); }); m.lfAgentsCore = ['water', 'wind', 'ice', 'gravity'].filter(function (a) { return ag[a]; }).length;
    var pr = {}; lfs.forEach(function (l) { (l.process || []).forEach(function (p) { pr[p] = 1; }); }); m.lfProcesses = Object.keys(pr).length;
    var ts = {}; lfs.forEach(function (l) { ts[l.timescale] = 1; }); m.lfFastAndSlow = ts.fast && ts.slow ? 1 : 0;
    m.orgLearned = orgs.some(function (o) { return (o.traits || []).some(function (t) { return t.origin === 'learned'; }); }) ? 1 : 0;
    var gr = {}; fts.forEach(function (t) { gr[t.group] = 1; }); m.ftGroups = Object.keys(gr).length;
    m.seasonAllThrive = f.seasons.some(function (r) { return r.all; }) ? 1 : 0; m.seasonFoodWeb = f.seasons.some(function (r) { return r.web; }) ? 1 : 0; m.seasonComeback = F.seasonComeback(save) ? 1 : 0;
    var bio = {}; if (x) save.world.tiles.forEach(function (t) { var b = D.biomeOf(x, ART(t.t)); if (b) bio[b] = 1; }); m.biomesTried = Object.keys(bio).length;
    var BI = root.DAW_BIOMES; m.biomesPainted = BI ? BI.kinds(save).length : 0; m.biomeCards = Object.keys(f.flags || {}).filter(function (k) { return k.indexOf('bioCard-') === 0; }).length;
    m.creaturesNamed = Object.keys(f.nick).filter(function (k) { return f.nick[k]; }).length;
    m.placesNamed = Object.keys(save.names || {}).filter(function (k) { return save.names[k]; }).length;
    var it = {}; save.world.tiles.forEach(function (t) { it[t.t] = 1; }); m.itemsVariety = Object.keys(it).length;
    var can = {}; save.world.tiles.forEach(function (t) { if (ART(t.t) === 'canyon') can[t.i + ',' + t.j] = t.s || 1; }); var best = 0;
    Object.keys(can).forEach(function (k) { var p = k.split(',').map(Number); [[1, 0], [0, 1]].forEach(function (d) { var n = 0, q = [p[0], p[1]], st; while ((st = can[q[0] + ',' + q[1]])) { n++; q = [q[0] + d[0] * st, q[1] + d[1] * st]; } if (n > best) best = n; }); }); m.canyonGiant = best;
    var et = {}; f.events.forEach(function (e) { if (e.resolved) et[e.id] = 1; }); m.eventTypesResolved = Object.keys(et).length; m.eventsResolved = et;
    m.upkeepFixed = ((save.needs && save.needs.events) || []).filter(function (e) { return e.kind === 'fixed' && !e.world; }).length;
    var up = (save.needs && save.needs.upkeep) || {}; m.cityLights = up['homes-need-power'] === 'met' && save.world.tiles.some(function (t) { return ART(t.t) === 'houses'; }) ? 1 : 0;
    m.describeRevised = keys.some(function (k) { return (recs[k].rev || 1) >= 2; }) ? 1 : 0;
    m.missionRevised = Object.keys(save.missions || {}).some(function (k) { return (save.missions[k].rev || 1) >= 2 && save.missions[k].done; }) ? 1 : 0;
    m.persistPick = keys.some(function (k) { return (recs[k].tries || 1) > 1 && !recs[k].revealed; }) ? 1 : 0;
    var g = {}; Object.keys(save.writing || {}).forEach(function (k) { var w = save.writing[k]; if (w && w.genre && words(w.text) >= 20) g[w.genre] = 1; }); m.genres = Object.keys(g).length; m.genreSet = g;
    m.arcsDone = Object.keys((save.history && save.history.arcs) || {}).filter(function (k) { return save.history.arcs[k].done; }).length;
    var sc = save.showcase || {}; m.presented = sc.presented ? 1 : 0; m.feedbackIn = (sc.feedback || []).length;
    m.reflectionDone = words(Object.keys(sc.reflection || {}).map(function (k) { return sc.reflection[k]; }).join(' ')) >= 30 ? 1 : 0;
    var SCm = root.DAW_SHOWCASE; m.tourReady = SCm && SCm.tourReady ? (SCm.tourReady(save) ? 1 : 0) : 0;
    m.favorites = f.favs.length; m.favStagesDone = F.favStagesDone(save, ix);
    m.cardKinds = ['lf', 'ft', 'org'].filter(function (k) { return keys.some(function (q) { return q.indexOf(k + ':') === 0; }); }).length;
    return m;
  };
  F.evalRule = function (r, save, ix, M) {
    if (!r) return false;
    if (r.all) return r.all.every(function (q) { return F.evalRule(q, save, ix, M); });
    if (r.any) return r.any.some(function (q) { return F.evalRule(q, save, ix, M); });
    if (r.metric) return (M[r.metric] || 0) >= (r.min != null ? r.min : 1);
    if (r.flag) return !!F.ensure(save).flags[r.flag];
    if (r.mission) return !!(save.missions[r.mission] && save.missions[r.mission].done);
    if (r.missions) return r.missions.every(function (id) { return save.missions[id] && save.missions[id].done; });
    if (r.event) return !!(M.eventsResolved || {})[r.event];
    if (r.writingGenre) return !!(M.genreSet || {})[r.writingGenre];
    if (r.stageComplete != null) return !!(S && ix && S.stageComplete(save, ix, r.stageComplete));
    return false;
  };
  F.TIER = ['', 'bronze', 'silver', 'gold'];
  // level reached for one achievement: 0 = locked; 1 = earned (or bronze); 2 silver; 3 gold
  F.reach = function (a, save, ix, M) {
    if (a.tiers) { var v = M[a.rule.metric] || 0; return a.tiers.filter(function (t) { return v >= t; }).length; }
    return F.evalRule(a.rule, save, ix, M) ? 1 : 0;
  };
  F.achState = function (save, ix) {
    var M = F.metrics(save, ix), f = F.ensure(save);
    return F.ach().map(function (a) { var got = f.ach[a.id], t = got ? got.tier || 1 : 0; return { def: a, tier: t, earned: t > 0, secret: !!a.secret, value: a.tiers ? (M[a.rule.metric] || 0) : null, next: a.tiers ? a.tiers[t] || null : null }; });
  };
  // records newly reached achievements/tiers; returns [{id, tier, name}]
  F.checkAch = function (save, ix, now) {
    var M = F.metrics(save, ix), f = F.ensure(save), out = [];
    F.ach().forEach(function (a) { var r = F.reach(a, save, ix, M), had = f.ach[a.id] ? f.ach[a.id].tier || 1 : 0; if (r > had) { f.ach[a.id] = { tier: r, at: nowIso(now) }; out.push({ id: a.id, tier: r, name: a.name, tierName: a.tiers ? F.TIER[r] : '' }); } });
    return out;
  };
  F.achCounts = function (save) { var f = F.ensure(save); return { earned: Object.keys(f.ach).length, total: F.ach().length }; };

  root.DAW_FUNC = F;
  if (typeof module !== 'undefined' && module.exports) module.exports = F;
})(typeof window !== 'undefined' ? window : globalThis);
