/* Design a World: Field Guide engine (describe & identify). Pure logic, no DOM, unit-testable.
   Records live in save.describe:
     'lf:<landformId>'  {k:'lf', process[], agent[], time, text, gt, ok, tries, revealed, rev, created, updated, xp}
     'ft:<featureId>'   {k:'ft', answers{checkId:index|[...]}, text, gt, ok, ...}
     'org:<organismId>' {k:'org', picks[], tags{traitId:{type,origin}}, explain{traitId:text}, biome, ok, ...}
     'why:<orgId>@<tileUid>' {k:'why', text, biome, tile}   (justified a placement outside its usual biome)
     'cmp:<compareId>'  {k:'cmp', a, b, text, ok, ...}      (GT compare two organisms)
   Organisms placed in a biome tile are listed on the tile: tile.o = [organismId, ...]. */
(function (root) {
  'use strict';
  var D = {};
  var PROC_WORDS = { weathering: /weather|break|broke|crack|dissolv|wear|grind|scrap|pound/i, erosion: /erod|erosion|carr(y|ies|ied)|mov(e|es|ed|ing)|wash|blow|drag|transport|slid|pull/i, deposition: /deposit|drop|dropp|settl|pil(e|ed|es)|build|built|left behind|laid/i };
  var AGENT_WORDS = { water: /water|river|stream|rain|flood|wave|current|sea|ocean/i, wind: /wind|breez|blow/i, ice: /ice|glacier|frozen|freez|frost/i, gravity: /gravity|fall|fell|slid|slope|downhill/i, volcanic: /volcan|lava|magma|erupt/i };
  var TIME_WORDS = { fast: /second|minute|hour|day|week|quick|fast|sudden|all at once|storm/i, medium: /year|decade|centur|hundred/i, slow: /thousand|million|billion|very long|long time|slow|ages|forever/i };
  D.PROC_WORDS = PROC_WORDS; D.AGENT_WORDS = AGENT_WORDS; D.TIME_WORDS = TIME_WORDS;
  function words(t) { return String(t || '').trim().split(/\s+/).filter(Boolean).length; }
  function nowIso(now) { return (now ? new Date(now) : new Date()).toISOString(); }
  function uniq(a) { return a.filter(function (v, k) { return a.indexOf(v) === k; }); }
  D.words = words;

  D.index = function (data) {
    data = data || { landforms: [], organisms: [], features: [], biomes: [], gtCompare: [], options: {} };
    var dx = { data: data, lf: {}, org: {}, ft: {}, biome: {}, cmp: {}, byArt: {}, biomeByArt: {}, options: data.options || {} };
    (data.landforms || []).forEach(function (l) { dx.lf[l.id] = l; if (l.art && !dx.byArt[l.art]) dx.byArt[l.art] = { kind: 'lf', id: l.id }; });
    (data.features || []).forEach(function (f) { dx.ft[f.id] = f; (f.items || []).forEach(function (a) { if (!dx.byArt[a]) dx.byArt[a] = { kind: 'ft', id: f.id }; }); });
    (data.biomes || []).forEach(function (b) { dx.biome[b.id] = b; (b.items || []).forEach(function (a) { if (!dx.biomeByArt[a]) dx.biomeByArt[a] = b.id; }); });
    (data.organisms || []).forEach(function (o) { dx.org[o.id] = o; });
    // painted-only biomes (tundra) get a Field Guide name too; no organism in the guide lists them as home
    var BI = root.DAW_BIOMES; if (BI) BI.LIST.forEach(function (b) { if (!dx.biome[b.dx]) dx.biome[b.dx] = { id: b.dx, name: b.name, items: [], desc: b.temp + '. ' + b.rain + '.', painted: true }; });
    (data.gtCompare || []).forEach(function (c) { dx.cmp[c.id] = c; });
    dx.timescales = (dx.options.timescale || [{ id: 'fast', label: 'Fast' }, { id: 'medium', label: 'Medium' }, { id: 'slow', label: 'Slow' }]);
    return dx;
  };
  D.thing = function (dx, art) { var k = dx.byArt[art]; if (!k) return null; return { kind: k.kind, id: k.id, key: k.kind + ':' + k.id, def: k.kind === 'lf' ? dx.lf[k.id] : dx.ft[k.id] }; };
  D.rec = function (save, key) { return (save.describe || {})[key] || null; };
  D.isDone = function (save, key) { var r = D.rec(save, key); return !!(r && r.ok); };
  // status for an item art: 'none' (nothing to describe), 'needs', 'done'
  D.status = function (save, dx, art) { var t = D.thing(dx, art); if (!t) return 'none'; return D.isDone(save, t.key) ? 'done' : 'needs'; };
  D.described = function (save, dx, art) { return D.status(save, dx, art) !== 'needs'; };
  D.biomeOf = function (dx, art) { return dx.biomeByArt[art] || null; };
  // habitat of a placed thing: the painted biome under it wins for land biome items; ponds, lakes and the ocean keep their
  // own water habitat and also count the painted one. Unpainted cells keep the item's own biome (as before painting existed).
  D.habitat = function (dx, save, tile, art) {
    var b = D.biomeOf(dx, art), BI = root.DAW_BIOMES, c = BI && save && tile ? BI.tileCode(save, tile) : null, br = c ? BI.byCode[c] : null;
    if (!br) return { id: b, ids: b ? [b] : [], painted: null };
    if (b === 'freshwater' || b === 'ocean') return { id: b, ids: [b].concat(br.fits), painted: c };
    return { id: br.dx, ids: br.fits.slice(), painted: c };
  };
  D.fitsTile = function (dx, save, orgId, tile, art) { var o = dx.org[orgId], h = D.habitat(dx, save, tile, art); return !!(o && o.biomes.some(function (x) { return h.ids.indexOf(x) >= 0; })); };
  D.fits = function (dx, orgId, art) { var o = dx.org[orgId], b = D.biomeOf(dx, art); return !!(o && b && o.biomes.indexOf(b) >= 0); };
  D.orgStatus = function (save, orgId) { return D.isDone(save, 'org:' + orgId) ? 'done' : 'needs'; };

  // ---------- checks ----------
  function setCheck(chosen, need, ok, labelFor, mis, what) {
    chosen = chosen || []; var allowed = need.concat(ok || []);
    var wrong = chosen.filter(function (x) { return allowed.indexOf(x) < 0; });
    var missing = need.filter(function (x) { return chosen.indexOf(x) < 0; });
    var good = wrong.length === 0 && missing.length === 0; // every main one, plus only accepted extras
    var msgs = wrong.map(function (x) { return (mis && mis[x]) || ('\u201c' + labelFor(x) + '\u201d is not the main ' + 'one here. Think about what really happened.'); });
    if (!wrong.length && missing.length) msgs.push(what === 'agent' ? 'Agent: you are missing ' + (missing.length > 1 ? 'some' : 'one') + '. Which force did most of the work: water, wind, ice, or gravity?' : 'Process: you are missing ' + (missing.length > 1 ? 'some' : 'one') + '. Think about all of the Break \u2192 Move \u2192 Drop steps.');
    return { ok: good, wrong: wrong, missing: missing, msgs: msgs };
  }
  D.checkLandformPicks = function (lf, ans) {
    ans = ans || {};
    var id = function (x) { return x; };
    var p = setCheck(ans.process, lf.process, lf.processOk, id, lf.misconceptions, 'process');
    var a = setCheck(ans.agent, lf.agent, lf.agentOk, id, lf.misconceptions, 'agent');
    var tOk = !!ans.time && (ans.time === lf.timescale || (lf.timescaleOk || []).indexOf(ans.time) >= 0);
    var tMsg = tOk ? [] : [ans.time ? ((lf.misconceptions || {})[ans.time] || 'Think again about how long this took. Is it a fast change or a slow change?') : 'Pick how long it took.'];
    if (!ans.process || !ans.process.length) p.msgs = ['Pick the process (weathering, erosion, or deposition).'];
    if (!ans.agent || !ans.agent.length) a.msgs = ['Pick the agent that did the work (water, wind, ice, or gravity).'];
    return { ok: p.ok && a.ok && tOk, process: p, agent: a, time: { ok: tOk, msgs: tMsg }, msgs: p.msgs.concat(a.msgs, tMsg) };
  };
  // the written description must use the student's own words and name a process, an agent, and a time scale
  D.checkLandformText = function (lf, ans, text, minWords) {
    var need = minWords || 15, n = words(text), miss = [];
    if (n < need) miss.push('Write at least ' + need + ' words (you have ' + n + ').');
    var procs = (lf.process || []).concat(lf.processOk || []), agents = (lf.agent || []).concat(lf.agentOk || []);
    if (!procs.some(function (p) { return PROC_WORDS[p] && PROC_WORDS[p].test(text); })) miss.push('Name the process: weathering (break), erosion (move), or deposition (drop).');
    if (!agents.some(function (a) { return AGENT_WORDS[a] && AGENT_WORDS[a].test(text); })) miss.push('Name the agent that did the work (water, wind, ice, or gravity).');
    var ts = [lf.timescale].concat(lf.timescaleOk || []);
    if (!ts.some(function (t) { return TIME_WORDS[t] && TIME_WORDS[t].test(text); })) miss.push('Say how long it took (for example: \u201cover thousands of years\u201d).');
    var kw = lf.keywords || [], need2 = Math.min(lf.minKeywords || 0, kw.length);
    if (need2) { var hits = kw.filter(function (k) { return new RegExp(k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').slice(0, 8), 'i').test(text); }); if (hits.length < need2) miss.push('Use at least ' + need2 + ' science words about how it formed, such as: ' + kw.slice(0, 6).join(', ') + '.'); }
    return { ok: miss.length === 0, missing: miss, words: n };
  };
  D.checkFeature = function (ft, answers) {
    answers = answers || {}; var res = { ok: true, items: {}, msgs: [] };
    (ft.checks || []).forEach(function (c) {
      var a = answers[c.id], key = c.answer, ok;
      if (Array.isArray(key)) ok = Array.isArray(a) && a.length === key.length && key.every(function (k) { return a.indexOf(k) >= 0; });
      else ok = a === key;
      res.items[c.id] = ok; if (!ok) { res.ok = false; res.msgs.push(a == null ? 'Answer: \u201c' + c.label + '\u201d' : ((c.feedback || {})[String(a)] || 'Look again at \u201c' + c.label + '\u201d.')); }
    });
    return res;
  };
  D.checkFeatureText = function (ft, text) {
    var need = ft.minWords || 15, n = words(text), miss = [];
    if (n < need) miss.push('Write at least ' + need + ' words (you have ' + n + ').');
    var w = ft.words || [];
    if (w.length) { var hit = w.filter(function (x) { return new RegExp(x.replace(/[^a-z]/gi, '').slice(0, 6), 'i').test(text); }); var k2 = Math.min(ft.minKw || 2, w.length); if (hit.length < k2) miss.push('Use at least ' + k2 + ' science words, such as: ' + w.slice(0, 8).join(', ') + '.'); }
    return { ok: miss.length === 0, missing: miss, words: n };
  };
  // ans: {picks:[traitIds and distractorIds], tags:{tId:{type, origin}}, explain:{tId:text}}
  D.checkOrganism = function (org, ans, opts) {
    ans = ans || {}; var picks = ans.picks || [], tags = ans.tags || {}, ex = ans.explain || {}, minW = (opts && opts.minWords) || 5, noEx = !!(opts && opts.noExplain);
    var tids = org.traits.map(function (t) { return t.id; });
    var wrongPicks = picks.filter(function (p) { return tids.indexOf(p) < 0; });
    var missed = tids.filter(function (t) { return picks.indexOf(t) < 0; });
    var wrongType = [], wrongOrigin = [], missingExplain = [];
    org.traits.forEach(function (t) {
      if (picks.indexOf(t.id) < 0) return;
      var g = tags[t.id] || {};
      if (g.type !== t.type) wrongType.push(t.id);
      var inh = t.origin === 'learned' ? 'learned' : 'inherited';
      if (g.origin !== inh) wrongOrigin.push(t.id);
      if (!noEx && words(ex[t.id]) < minW) missingExplain.push(t.id);
    });
    var byId = {}; org.traits.forEach(function (t) { byId[t.id] = t; }); (org.distractors || []).forEach(function (d) { byId[d.id] = d; });
    var msgs = [];
    wrongPicks.forEach(function (d) { msgs.push('\u201c' + byId[d].text + '\u201d: ' + (byId[d].why || 'this organism does not have that trait.')); });
    if (missed.length) msgs.push('You missed ' + missed.length + ' real adaptation' + (missed.length > 1 ? 's' : '') + '. Look at the picture and think about what helps it live in its home.');
    wrongType.forEach(function (t) { msgs.push('\u201c' + byId[t].text + '\u201d is ' + (byId[t].type === 'structure' ? 'a body part, so it is a structure.' : 'something it does, so it is a behavior.')); });
    wrongOrigin.forEach(function (t) { var tr = byId[t]; msgs.push('\u201c' + tr.text + '\u201d is ' + (tr.origin === 'learned' ? 'learned: the young are taught or practice it.' : tr.type === 'structure' ? 'inherited: it is born with this body part.' : 'an instinct (inherited): it does this without being taught.')); });
    if (missingExplain.length) msgs.push('Explain how each adaptation helps it survive (' + minW + '+ words each).');
    return { ok: !wrongPicks.length && !missed.length && !wrongType.length && !wrongOrigin.length && !missingExplain.length, wrongPicks: wrongPicks, missed: missed, wrongType: wrongType, wrongOrigin: wrongOrigin, missingExplain: missingExplain, msgs: msgs };
  };
  // Favorites: one short written explanation (the stronger evidence). Landforms name the agent and process and
  // how long it took; features use a science word; creatures say how a trait helps it survive.
  D.checkFavorite = function (kind, def, text, minWords) {
    var need = minWords || 12, n = words(text), miss = [];
    if (kind === 'lf') { var r = D.checkLandformText(Object.assign({}, def, { minKeywords: 0 }), null, text, need); return r; }
    if (kind === 'ft') return D.checkFeatureText(Object.assign({}, def, { minWords: need, minKw: 1 }), text);
    if (n < need) miss.push('Write at least ' + need + ' words (you have ' + n + ').');
    var tw = (def.traits || []).map(function (t) { return t.text.split(/\s+/).filter(function (w) { return w.length > 3; }); }).reduce(function (a, b) { return a.concat(b); }, []);
    if (!/help|surviv|safe|eat|food|hide|catch|cool|warm|water|protect|escape|find/i.test(text)) miss.push('Say how a trait helps it survive (for example: it helps it find food or stay safe).');
    if (tw.length && !tw.some(function (w) { return new RegExp(w.replace(/[^a-z]/gi, '').slice(0, 5), 'i').test(text); })) miss.push('Name one of its traits, such as: ' + (def.traits || []).slice(0, 2).map(function (t) { return t.text.toLowerCase(); }).join(' or ') + '.');
    return { ok: miss.length === 0, missing: miss, words: n };
  };
  // a GT comparison can pair two organisms, two landforms, or two features
  D.side = function (dx, kind, id) { return kind === 'lf' ? dx.lf[id] : kind === 'ft' ? dx.ft[id] : dx.org[id]; };
  D.cmpSides = function (dx, cmp) { return [D.side(dx, cmp.ka || 'org', cmp.a), D.side(dx, cmp.kb || 'org', cmp.b)]; };
  D.checkCompare = function (cmp, dx, text) {
    var sd = D.cmpSides(dx, cmp), a = sd[0], b = sd[1], n = words(text), miss = [];
    if (n < 25) miss.push('Write at least 25 words (you have ' + n + ').');
    function named(o) { var first = o.name.split(/[\s(]/).filter(function (w) { return w.length > 3; }); return first.some(function (w) { return new RegExp(w.slice(0, 5), 'i').test(text); }); }
    if (a && !named(a)) miss.push('Name the ' + a.name + '.'); if (b && !named(b)) miss.push('Name the ' + b.name + '.');
    if (!/both|alike|same|similar/i.test(text)) miss.push('Tell one way they are alike (use \u201cboth\u201d).');
    if (!/but|while|whereas|differ|instead|however|unlike/i.test(text)) miss.push('Tell one way they are different (use \u201cbut\u201d or \u201cwhile\u201d).');
    return { ok: miss.length === 0, missing: miss, words: n };
  };

  // ---------- records ----------
  D.saveRecord = function (save, key, rec, now) {
    save.describe = save.describe || {};
    var prev = save.describe[key], t = nowIso(now);
    rec.rev = (prev ? prev.rev || 0 : 0) + 1; rec.created = prev ? prev.created : t; rec.updated = t;
    if (prev && prev.xp && !(rec.xp > prev.xp)) rec.xp = prev.xp;
    save.describe[key] = rec; save.updated = t; return rec;
  };
  D.addOrganism = function (save, dx, tile, art, orgId, justification, now) {
    if (!tile || !dx.org[orgId]) return { ok: false, reason: 'unknown' };
    if (!D.biomeOf(dx, art)) return { ok: false, reason: 'not-biome' };
    var hab = D.habitat(dx, save, tile, art), biome = hab.id;
    tile.o = tile.o || [];
    if (tile.o.indexOf(orgId) >= 0) return { ok: false, reason: 'already' };
    if (tile.o.length >= 4) return { ok: false, reason: 'full' };
    var fits = dx.org[orgId].biomes.some(function (x) { return hab.ids.indexOf(x) >= 0; });
    if (!fits && words(justification) < 15) return { ok: false, reason: 'needs-justify', biome: biome };
    tile.o.push(orgId);
    if (!fits) D.saveRecord(save, 'why:' + orgId + '@' + tile.u, { k: 'why', org: orgId, tile: tile.u, biome: biome, text: String(justification).slice(0, 2000), ok: true }, now);
    save.updated = nowIso(now);
    return { ok: true, fits: fits, biome: biome };
  };
  D.removeOrganism = function (save, tile, orgId, now) { if (!tile || !tile.o) return false; var k = tile.o.indexOf(orgId); if (k < 0) return false; tile.o.splice(k, 1); save.updated = nowIso(now); return true; };
  D.placedOrganisms = function (save) { var out = []; save.world.tiles.forEach(function (t) { (t.o || []).forEach(function (o) { out.push({ org: o, tile: t }); }); }); return out; };

  // everything on the map that still needs a description (tiles by kind, plus organisms)
  D.todo = function (save, dx, artOf) {
    var seen = {}, out = [];
    save.world.tiles.forEach(function (t) {
      var th = D.thing(dx, artOf(t.t));
      if (th && !D.isDone(save, th.key) && !seen[th.key]) { seen[th.key] = 1; out.push({ key: th.key, kind: th.kind, id: th.id, name: th.def.name, tile: t }); }
      (t.o || []).forEach(function (o) { var k = 'org:' + o; if (!D.isDone(save, k) && !seen[k] && dx.org[o]) { seen[k] = 1; out.push({ key: k, kind: 'org', id: o, name: dx.org[o].name, tile: t }); } });
    });
    return out;
  };
  // TEKS credit from finished descriptions (for the tracker)
  D.teksSources = function (save, dx) {
    var covers = {}, done = {};
    function add(map, t, label) { (map[t] = map[t] || []).indexOf(label) < 0 && map[t].push(label); }
    (dx.data.landforms || []).forEach(function (l) { (l.teks || []).forEach(function (t) { add(covers, t, 'Field Guide: landforms'); }); });
    (dx.data.features || []).forEach(function (f) { (f.teks || []).forEach(function (t) { add(covers, t, 'Field Guide: ' + f.group); }); });
    (dx.data.organisms || []).forEach(function (o) { (o.teks || []).forEach(function (t) { add(covers, t, 'Field Guide: adaptations'); }); });
    function cmpTeks(c) { var sd = D.cmpSides(dx, c); if ((c.ka || 'org') === 'org' && (c.kb || 'org') === 'org') return ['5.13A']; return uniq([].concat((sd[0] || {}).teks || [], (sd[1] || {}).teks || [])); }
    (dx.data.gtCompare || []).forEach(function (c) { cmpTeks(c).forEach(function (t) { add(covers, t, 'Field Guide: GT compare'); }); });
    Object.keys(save.describe || {}).forEach(function (k) {
      var r = save.describe[k]; if (!r || !r.ok) return;
      var id = k.slice(k.indexOf(':') + 1), def = r.k === 'lf' ? dx.lf[id] : r.k === 'ft' ? dx.ft[id] : r.k === 'org' ? dx.org[id] : null;
      if (def) (def.teks || []).forEach(function (t) { add(done, t, def.name); });
      if (r.k === 'cmp' && dx.cmp[id]) cmpTeks(dx.cmp[id]).forEach(function (t) { add(done, t, 'GT compare'); });
      // a biome change that no longer fits a living thing: moving it, or explaining why it can stay, is adaptation evidence
      if (r.k === 'rep' && (r.choice === 'move' || r.choice === 'keep') && dx.org[r.org]) (dx.org[r.org].teks || []).filter(function (t) { return /^5\.13[AB]$/.test(t); }).forEach(function (t) { add(done, t, 'Biome change: ' + dx.org[r.org].name); });
    });
    return { covers: covers, done: done };
  };
  D.counts = function (save, dx, artOf) {
    var todo = D.todo(save, dx, artOf), recs = save.describe || {}, ok = Object.keys(recs).filter(function (k) { return recs[k].ok && /^(lf|ft|org):/.test(k); });
    return { done: ok.length, todo: todo.length, total: ok.length + todo.length, organisms: D.placedOrganisms(save).length, gt: Object.keys(recs).filter(function (k) { return recs[k].gt && words(recs[k].gt) >= 8 || recs[k].k === 'cmp' && recs[k].ok; }).length };
  };
  D.xp = function (save) { var x = 0, r = save.describe || {}; Object.keys(r).forEach(function (k) { if (r[k].ok) x += r[k].xp || 0; }); return x; };

  // readable rows for the report and teacher view
  D.rows = function (save, dx) {
    var out = [], recs = save.describe || {};
    function tsLabel(id) { var t = dx.timescales.filter(function (x) { return x.id === id; })[0]; return t ? t.label : id || ''; }
    Object.keys(recs).sort().forEach(function (k) {
      var r = recs[k], id = k.slice(k.indexOf(':') + 1), row = { key: k, kind: r.k, ok: !!r.ok, rev: r.rev || 1, updated: r.updated, text: r.text || '', gt: r.gt || '' };
      if (r.k === 'lf') { var l = dx.lf[id]; row.name = l ? l.name : id; row.group = 'Landform'; row.picks = 'Process: ' + (r.process || []).join(', ') + ' \u00b7 Agent: ' + (r.agent || []).join(', ') + ' \u00b7 Time: ' + tsLabel(r.time); }
      else if (r.k === 'ft') { var f = dx.ft[id]; row.name = f ? f.name : id; row.group = f ? f.group.charAt(0).toUpperCase() + f.group.slice(1) : 'Feature'; row.picks = f ? (f.checks || []).map(function (c) { var a = (r.answers || {})[c.id]; return c.label + ' ' + (Array.isArray(a) ? a.map(function (i) { return c.options[i]; }).join(', ') : c.options[a] || '\u2014'); }).join(' \u00b7 ') : ''; }
      else if (r.k === 'org') { var o = dx.org[id]; row.name = o ? o.name : id; row.group = 'Organism'; row.biome = r.biome ? (dx.biome[r.biome] || {}).name || r.biome : ''; row.picks = o ? (r.picks || []).map(function (p) { var t = o.traits.filter(function (x) { return x.id === p; })[0]; var g = (r.tags || {})[p] || {}; return t ? t.text + ' (' + (g.type || '?') + ', ' + (g.origin || '?') + ')' : 'NOT A TRAIT: ' + ((o.distractors || []).filter(function (x) { return x.id === p; })[0] || {}).text; }).join('; ') : ''; row.text = o ? o.traits.map(function (t) { return (r.explain || {})[t.id] ? t.text + ': ' + r.explain[t.id] : ''; }).filter(Boolean).join(' | ') : ''; }
      else if (r.k === 'why') { var o2 = dx.org[r.org]; row.name = (o2 ? o2.name : r.org) + ' in ' + ((dx.biome[r.biome] || {}).name || r.biome); row.group = 'Placement reason'; row.picks = 'Usually lives in: ' + (o2 ? o2.biomes.map(function (b) { return (dx.biome[b] || {}).name || b; }).join(', ') : ''); }
      else if (r.k === 'rep') { var o3 = dx.org[r.org]; row.name = (o3 ? o3.name : r.org) + ': home turned to ' + (r.toName || r.to); row.group = 'Biome change'; row.picks = { move: 'Moved it to a place that fits', back: 'Changed the biome back', keep: 'Kept it there and explained why' }[r.choice] || r.choice; }
      else if (r.k === 'cmp') { var c = dx.cmp[id] || { a: r.a, b: r.b }, sd = D.cmpSides(dx, c); row.name = 'Compare: ' + ((sd[0] || {}).name || r.a) + ' & ' + ((sd[1] || {}).name || r.b); row.group = 'GT compare'; row.picks = c.prompt || ''; }
      if (r.k === 'org' && r.text) row.text = r.text + (row.text ? ' | ' + row.text : '');
      var FU = root.DAW_FUNC; row.evidence = r.k === 'why' || r.k === 'cmp' || (r.k === 'rep' && r.text) ? 'written' : r.k === 'rep' ? 'picks' : FU ? FU.evidenceKind(r) : (r.text ? 'written' : 'picks'); row.fav = !!(FU && save.fun && FU.isFav(save, k));
      out.push(row);
    });
    return out;
  };
  // a complete, correct record (used for the demo world, teacher preview, and tests)
  function cap(t) { return t.charAt(0).toUpperCase() + t.slice(1); }
  D.model = function (dx, key, opt) {
    opt = opt || {}; var k = key.slice(0, key.indexOf(':')), id = key.slice(key.indexOf(':') + 1);
    if (k === 'lf') { var l = dx.lf[id]; if (!l) return null; var AG = { water: 'moving water', wind: 'the wind', ice: 'a glacier of ice', gravity: 'gravity' }, PV = { weathering: 'weathering broke the rock', erosion: 'erosion carried the pieces away', deposition: 'deposition dropped the sediment' };
      var tl = (dx.timescales.filter(function (x) { return x.id === l.timescale; })[0] || {}).label || l.timescale;
      return { k: 'lf', process: l.process.slice(), agent: l.agent.slice(), time: l.timescale, text: 'My ' + l.name.toLowerCase() + ' formed because of ' + l.agent.map(function (a) { return AG[a] || a; }).join(' and ') + '. ' + cap(l.process.map(function (p) { return PV[p] || p; }).join(', then ')) + '. This change is ' + String(tl).toLowerCase() + ', so it took ' + (l.timescale === 'fast' ? 'only minutes or days' : l.timescale === 'medium' ? 'many years' : 'thousands of years or more') + '.' + ((l.stepsScience || []).length ? ' ' + l.stepsScience.join(' ') : '') + ((l.keywords || []).length ? ' Science words: ' + l.keywords.join(', ') + '.' : ''), gt: opt.gt ? 'Over time the ' + l.name.toLowerCase() + ' will keep changing because ' + l.agent.join(' and ') + ' will keep breaking, moving, and dropping sediment.' : '', ok: true, tries: 1, xp: 30 + (opt.gt ? 20 : 0) }; }
    if (k === 'ft') { var f = dx.ft[id]; if (!f) return null; var a = {}; (f.checks || []).forEach(function (c) { a[c.id] = c.answer; });
      return { k: 'ft', answers: a, text: 'The ' + f.name.toLowerCase() + ' matters in my world. ' + (f.checks || []).map(function (c) { return c.label.replace(/\?$/, '') + ': ' + c.options[c.answer] + '.'; }).join(' ') + ' Key words: ' + (f.words || []).join(', ') + '.', gt: '', ok: true, tries: 1, xp: 25 }; }
    if (k === 'org') { var o = dx.org[id]; if (!o) return null; var tg = {}, ex = {}; o.traits.forEach(function (t) { tg[t.id] = { type: t.type, origin: t.origin === 'learned' ? 'learned' : 'inherited' }; ex[t.id] = (t.helps && words(t.helps) >= 5) ? t.helps : 'It helps the ' + o.name.toLowerCase() + ' survive: ' + (t.helps || 'it gets food, water, or safety.'); });
      return { k: 'org', picks: o.traits.map(function (t) { return t.id; }), tags: tg, explain: ex, biome: opt.biome || o.biomes[0], ok: true, tries: 1, xp: 40 }; }
    if (k === 'cmp') { var c = dx.cmp[id]; if (!c) return null; var sd = D.cmpSides(dx, c), A1 = sd[0], B1 = sd[1];
      var fact = function (x, kind) { return kind === 'lf' ? 'formed by ' + x.process.join(' and ') + ' from ' + x.agent.join(' and ') : kind === 'ft' ? 'is part of ' + x.group + ' in my world' : 'has ' + x.traits[0].text.toLowerCase(); };
      return { k: 'cmp', a: c.a, b: c.b, text: 'Both the ' + A1.name + ' and the ' + B1.name + ' are important parts of my world and change it over time. But the ' + A1.name + ' ' + fact(A1, c.ka || 'org') + ', while the ' + B1.name + ' ' + fact(B1, c.kb || 'org') + ', so they are different.', ok: true, xp: 50 }; }
    return null;
  };
  // one shared index of the page's Field Guide data (game, teacher view, report)
  var SH = null;
  D.shared = function () { if (!SH && root.DAW_DESCRIBE_DATA) SH = D.index(root.DAW_DESCRIBE_DATA); return SH; };
  D.tileInfo = function (save, dx, art, tile) {
    var orgs = (tile.o || []).map(function (o) { return { id: o, art: (dx.org[o] || {}).art, done: D.isDone(save, 'org:' + o) }; });
    return { status: D.status(save, dx, art), orgs: orgs, biome: D.biomeOf(dx, art) };
  };
  // wire the Field Guide into the state engine (gating, tracker credit, XP)
  D.hook = function (S, artOf) {
    var dx = D.shared(); if (!dx || !S || !S.setHooks) return null;
    S.setHooks({ described: function (save, itemId) { return D.described(save, dx, artOf(itemId)); }, teks: function (save) { return D.teksSources(save, dx); }, xp: function (save) { return D.xp(save); } });
    return dx;
  };
  root.DAW_DESC = D;
  if (typeof module !== 'undefined' && module.exports) module.exports = D;
})(typeof window !== 'undefined' ? window : globalThis);
