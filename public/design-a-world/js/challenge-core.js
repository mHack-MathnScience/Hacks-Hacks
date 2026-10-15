/* Design a World: GT challenge layer for the civilization pack. Pure logic, Node-testable; wraps DAW_CIVC + DAW_NATC.
   CHALLENGE is the default. SUPPORT is opt-in (teacher.html setting, or ?mode=support per student).
   Challenge: less starting Shaping Energy, fewer changes per era, competing needs (farms / forest / water),
   open-ended problems with several valid answers justified in writing (claim, evidence, reasoning: a minimum and a
   checklist, never graded), "Show me" only after 2 tries or a written attempt, predictions about landforms
   (predict, watch, look back), consequence chains, and optional Grade 6 stretch challenges (outside G5 coverage).
   Statuses and words only: no scores, grades, points or percentages. */
(function (root) {
  'use strict';
  var req = typeof require === 'function';
  var CC = root.DAW_CIVC || (req ? require('./civ-core.js') : null), NC = root.DAW_NATC || (req ? require('./nature-core.js') : null);
  var GC = {}, S = null;
  GC.CFG = {
    challenge: { name: 'Challenge', startEnergy: 4, eraLimit: 2, cerMin: 6, predMin: 4, carryCap: 35, earn: { mission: 1, quiz: 1, lookback: 1, pred: 1 } },
    support: { name: 'Support', startEnergy: 10, eraLimit: 3, cerMin: 4, predMin: 3, carryCap: 80, earn: {} }
  };
  GC.normMode = function (m) { return /^\s*(support|supported|easy|easier)\s*$/i.test(String(m || '')) ? 'support' : 'challenge'; };
  GC.modeOf = function (save) { return GC.normMode(save && save.civ && save.civ.mode); };
  GC.setMode = function (save, m) { CC.ensure(save).mode = GC.normMode(m); return save.civ.mode; };
  // mode is locked per save when the world is made. ?mode only counts for a brand-new world; afterwards only a NEWER
  // teacher setting can change it, and the change is noted. teacher = { mode, at } or null.
  GC.fresh = function (save) { var c = save.civ || {}; return !c.started && !Object.keys(save.missions || {}).some(function (k) { return save.missions[k].done; }); };
  GC.resolveMode = function (save, url, teacher, now) {
    var c = CC.ensure(save); now = now || Date.now();
    if (!c.mode) { if (url && GC.fresh(save)) { c.mode = GC.normMode(url); c.modeBy = 'link'; } else if (teacher && teacher.mode) { c.mode = GC.normMode(teacher.mode); c.modeBy = 'teacher'; } else { c.mode = 'challenge'; c.modeBy = 'default'; } c.modeAt = now; return { mode: c.mode, changed: true }; }
    if (teacher && teacher.mode && (+teacher.at || 0) > (c.modeAt || 0) && GC.normMode(teacher.mode) !== c.mode) {
      c.mode = GC.normMode(teacher.mode); c.modeAt = +teacher.at; c.modeBy = 'teacher';
      c.modeNote = 'changed to ' + GC.CFG[c.mode].name + ' by the teacher setting on ' + new Date(+teacher.at).toISOString().slice(0, 10); if (c.log) CC.log(c, 'Your teacher set the challenge level to ' + GC.CFG[c.mode].name + '.', 'note'); return { mode: c.mode, changed: true };
    }
    return { mode: c.mode, changed: false };
  };
  GC.cfg = function (save) { return GC.CFG[GC.modeOf(save)]; };
  function words(t) { return String(t || '').trim().split(/\s+/).filter(Boolean).length; }
  GC.words = words;
  // ---------- real words: distinct, word-like, not keyboard mash or repeats ----------
  var SHORT = ' a i an am as at be by do go he if in is it me my no of on or so to up us we oh ok ';
  var ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm', 'abcdefghijklmnopqrstuvwxyz', '1234567890'];
  function inRow(g) { return ROWS.some(function (row) { return row.indexOf(g) >= 0 || row.split('').reverse().join('').indexOf(g) >= 0; }); }
  function mash(w) { if (w.length < 3) return false; var all = true; for (var k = 0; k + 3 <= w.length; k++) if (!inRow(w.slice(k, k + 3))) { all = false; break; } if (all) return true; var v = (w.match(/[aeiouy]/g) || []).length; return w.length >= 4 && v <= 1 && inRow(w.slice(0, 3)) && inRow(w.slice(-3)); }
  GC.isRealWord = function (w) {
    w = String(w || '').toLowerCase().replace(/^[^a-z0-9]+|[^a-z0-9]+$/g, ''); if (!w) return false;
    if (/^\d+([.,]\d+)?%?$/.test(w)) return true; // numbers count as real (evidence often has them)
    if (!/^[a-z][a-z'-]*$/.test(w)) return false;
    if (w.length < 3) return SHORT.indexOf(' ' + w + ' ') >= 0;
    if (!/[aeiouy]/.test(w)) return false; if (/(.)\1\1/.test(w)) return false; if (/[bcdfghjklmnpqrstvwxz]{6,}/.test(w)) return false; if (/^(.{1,3})\1+$/.test(w)) return false;
    return !mash(w);
  };
  GC.realWords = function (t) { var toks = String(t || '').toLowerCase().split(/[^a-z0-9'%.-]+/).map(function (x) { return x.replace(/^[^a-z0-9]+|[^a-z0-9%]+$/g, ''); }).filter(Boolean), seen = {}, out = []; toks.forEach(function (w) { if (GC.isRealWord(w) && !seen[w]) { seen[w] = 1; out.push(w); } }); return out; };
  GC.realCount = function (t) { var toks = String(t || '').trim().split(/\s+/).filter(Boolean), real = GC.realWords(t); if (toks.length >= 5) { var cnt = {}; toks.forEach(function (x) { x = x.toLowerCase(); cnt[x] = (cnt[x] || 0) + 1; }); var top = Math.max.apply(null, Object.keys(cnt).map(function (k) { return cnt[k]; })); if (top / toks.length > 0.3 && real.length < 8) return Math.min(real.length, 2); } return real.length; };
  var STOP = ' about after again also because been before being both could does doing each from have having here into itself just like many more most much must other over same should some such than that their them then there these they this those through under very want were what when where which while will with would your yours ';
  GC.topicWords = function (text) { var o = {}; String(text || '').toLowerCase().split(/[^a-z]+/).forEach(function (w) { if (w.length >= 5 && STOP.indexOf(' ' + w + ' ') < 0) o[w.replace(/ies$/, 'y').replace(/([^s])s$/, '$1')] = 1; }); return Object.keys(o); };
  GC.GEO = ['farm', 'field', 'forest', 'tree', 'wood', 'water', 'river', 'delta', 'sediment', 'soil', 'sand', 'dune', 'wind', 'rain', 'flood', 'dam', 'lake', 'pond', 'wetland', 'valley', 'canyon', 'erosion', 'erode', 'deposit', 'weather', 'rock', 'layer', 'glacier', 'ice', 'coast', 'sea', 'ocean', 'food', 'crop', 'parcel', 'town', 'village', 'family', 'families', 'settler', 'resource', 'plant', 'animal', 'island', 'map'];
  function stem(w) { return w.replace(/ies$/, 'y').replace(/([^s])s$/, '$1'); }
  function matchT(w, t) { return w.length >= 3 && (w === t || (t.length >= 4 && w.indexOf(t) === 0) || (w.length >= 4 && t.indexOf(w) === 0)); }
  // distinct real words of text that match a topic word
  GC.topicHits = function (text, topics) { return GC.realWords(text).filter(function (w) { return STOP.indexOf(' ' + w + ' ') < 0; }).map(stem).filter(function (w) { return (topics || []).some(function (t) { return matchT(w, t); }); }).filter(function (w, i, a) { return a.indexOf(w) === i; }); };
  function hasTopic(text, topics) { return GC.topicHits(text, topics).length > 0; }
  GC.hasTopic = hasTopic;
  GC.CONNECT = /\b(because|cause[sd]?|so|since|therefore|thus|which means|this means|that means|so that|as a result|that is why|that's why|thats why|this shows|which shows|it shows|which is why|due to|leads? to|led to|in order to|then|if)\b/i;
  // too generic to show the answer is about THIS problem
  var GENERIC = ['island', 'map', 'family', 'families', 'town', 'village', 'settler', 'people', 'thing', 'place'];
  GC.GEO_CORE = GC.GEO.filter(function (w) { return GENERIC.indexOf(w) < 0; });
  function seq(t) { return String(t || '').toLowerCase().split(/[^a-z0-9]+/).filter(Boolean); }
  // mostly copied: at least 60% of the answer's 3-word runs also appear in the source text
  GC.copied = function (text, src) { var a = seq(text), b = seq(src); if (a.length < 5 || b.length < 3) return false; var g = {}; for (var i = 0; i + 3 <= b.length; i++) g[b.slice(i, i + 3).join(' ')] = 1; var n = 0, hit = 0; for (var j = 0; j + 3 <= a.length; j++) { n++; if (g[a.slice(j, j + 3).join(' ')]) hit++; } return n > 0 && hit / n >= 0.6; };
  // numbers and observed details that really exist in this world (or the task text)
  GC.worldFacts = function (save, extra) {
    var nums = {}, names = [], c = (save && save.civ) || {};
    function addN(v) { if (typeof v === 'number' && isFinite(v)) { nums[String(Math.round(v))] = 1; nums[String(v)] = 1; } }
    String(extra || '').replace(/\d+(\.\d+)?/g, function (m) { nums[m] = 1; nums[String(Math.round(+m))] = 1; return m; });
    addN(c.year); addN((c.year || 0) - (c.startYear || 0)); addN((c.setts || []).length); addN((c.nat || []).length); addN(((save && save.world && save.world.tiles) || []).length);
    (c.setts || []).forEach(function (st) { Object.keys(st).forEach(function (k) { if (k !== 'i' && k !== 'j') addN(st[k]); }); });
    (GC._needs || []).forEach(function (r) { addN(r.have); addN(r.need); });
    if (c.m) Object.keys(c.m).forEach(function (k) { addN(c.m[k]); });
    (c.nat || []).forEach(function (n) { var k = NC && NC.KINDS && NC.KINDS[n.lf]; String((k && k.name) || n.lf || '').toLowerCase().split(/[^a-z]+/).forEach(function (w) { if (w.length >= 4) names.push(stem(w)); }); });
    return { nums: nums, names: names };
  };
  GC.CAUSE_EFFECT = /\b(when|after|once|if|because)\b.+\b(got|get|gets|became|become|turned|turn|grew|washed|wash|dried|fell|rose|flooded|flood|died|dropped|went|stopped|started|was|were|is|are)\b/i;
  GC.EXPLAIN = /\b(hold|holds|held|feed|feeds|fed|help|helps|helped|protect|protects|cause|causes|keep|keeps|kept|grow|grows|need|needs|give|gives|stop|stops|prevent|prevents|provide|provides|make|makes|let|lets|save|saves|support|supports)\b/i;
  var CUE = /\b(saw|see|seen|noticed|notice|counted|count|observed|watched|measured|table|chart|map|shows?|showed|there (is|are|was|were)|we have|has|had|grew|dropped|moved|looked)\b/i;
  // Evidence: a number that is really in the world/task, a landform that is really on the island, or an observed detail
  GC.evidenceOk = function (save, text, topics, src) {
    var f = GC.worldFacts(save, src), ns = String(text || '').match(/\d+(\.\d+)?/g) || [];
    if (ns.length) return ns.some(function (n) { return f.nums[n] || f.nums[String(Math.round(+n))]; }) ? { ok: true } : { ok: false, fake: true }; // a made-up number is not evidence
    if (f.names.length && GC.topicHits(text, f.names).length) return { ok: true };
    if (CUE.test(text || '') && GC.topicHits(text, topics).length >= 1) return { ok: true };
    if (GC.CAUSE_EFFECT.test(text || '') && GC.topicHits(text, topics).length >= 1) return { ok: true }; // an observed cause and effect
    return { ok: false, fake: ns.length > 0 };
  };

  // "Show me": Support keeps the old rule; Challenge needs more tries, or the Support tries plus a real written attempt
  GC.WROTE_MIN = 6;
  // a real written attempt: 6+ different real words, at least 2 different words about the task, not pasted from it
  GC.realAttempt = function (text, taskText) { var tw = GC.topicWords(taskText || ''); if (GC.realCount(text) < GC.WROTE_MIN || GC.copied(text, taskText)) return false; return !tw.length || GC.topicHits(text, tw.concat(GC.GEO_CORE)).length >= 2; };
  // every task stays reachable: after this many checks Show me always opens in Challenge (still later than Support)
  GC.FALLBACK_EXTRA = 3;

  GC.revealReady = function (mode, tries, supportTries, wrote, o) {
    o = o || {}; if (GC.normMode(mode) === 'support') return tries >= supportTries;
    var real = o.realTries != null ? o.realTries : tries;
    return real >= Math.max(3, supportTries + 1) || (tries >= supportTries && GC.realAttempt(wrote, o.task || '')) || tries >= supportTries + GC.FALLBACK_EXTRA;
  };

  // ---------- competing needs ----------
  GC.needs = function (save, ix) {
    var c = save.civ || {}, setts = (c.setts || []).length, pop = CC.totalPop(save);
    var water = save.world.tiles.filter(function (t) { return ['river', 'lake', 'pond', 'delta', 'oxbow', 'waterfall'].indexOf(CC.artOf(t.t)) >= 0; }).length + CC.paintCount(save, 'w');
    var rows = [
      { id: 'farm', name: 'Farmland (food)', have: CC.paintCount(save, 'g'), need: Math.max(4, Math.ceil(pop / 12)) },
      { id: 'forest', name: 'Forest (wood, soil)', have: CC.paintCount(save, 'f'), need: Math.max(3, setts * 2) },
      { id: 'water', name: 'Water', have: water, need: Math.max(1, setts) }
    ];
    rows.forEach(function (r) { r.status = r.have >= r.need ? 'Enough' : 'Short'; }); GC._needs = rows; return rows;
  };

  // ---------- claim, evidence, reasoning ----------
  GC.CER_PARTS = [{ id: 'claim', name: 'Claim', help: 'What is your answer?' }, { id: 'evidence', name: 'Evidence', help: 'Which facts or numbers from the island support it?' }, { id: 'reasoning', name: 'Reasoning', help: 'Why does that evidence support your claim?' }];
  GC.CHECKLIST = ['My claim answers the question.', 'My evidence uses a fact or number from the problem or my island.', 'My reasoning explains why the evidence supports my claim.', 'I thought about a cost or a point of view.'];
  // topics: words from the problem (or prompt) plus island/landform words
  // a friendly tip that never blocks saving (shown as a toast in the browser)
  GC.tip = function (ck) { if (ck && ck.nudges && ck.nudges.length && typeof window !== 'undefined' && window.DAW_UI && window.DAW_UI.toast) window.DAW_UI.toast(ck.nudges[0].text, '', 4500); };
  GC.checkCer = function (save, cer, topicText) {
    var min = GC.cfg(save).cerMin, topics = GC.topicWords(topicText).concat(GC.GEO_CORE), f = GC.worldFacts(save, topicText); topics = topics.concat(f.names); cer = cer || {};
    var short = GC.CER_PARTS.filter(function (p) { return GC.realCount(cer[p.id]) < min; }).map(function (p) { return p.id; }), missing = [], nudges = [];
    function add(k, need, text) { missing.push({ part: k, need: need, text: text }); }
    short.forEach(function (k) { add(k, 'words', PNAME[k] + ': add a little more (at least ' + min + ' different real words; repeats and made-up words do not count).'); });
    GC.CER_PARTS.forEach(function (p) { var k = p.id, t = cer[k] || ''; if (short.indexOf(k) >= 0) return;
      if (GC.copied(t, topicText)) return add(k, 'own-words', PNAME[k] + ': say it in your own words instead of copying the problem.');
      if (!hasTopic(t, topics)) return add(k, 'topic', PNAME[k] + ': connect it to this problem. Name what it is about (like ' + (GC.topicWords(topicText).slice(0, 3).concat(['farms', 'water']).slice(0, 3).join(', ')) + ').');
      if (k === 'evidence') { var ev = GC.evidenceOk(save, t, topics, topicText); if (!ev.ok) return add(k, 'fact', ev.fake ? 'Evidence: that number is not on your map or in the problem. Use one you actually saw (like a number from the needs table).' : 'Evidence: add a fact you saw on your map or in the problem (a number from the needs table, or a landform on your island).'); }
      if (k === 'reasoning' && !GC.CONNECT.test(t) && !GC.EXPLAIN.test(t)) nudges.push({ part: k, need: 'connector', text: 'Tip for Reasoning: a linking word like "because", "so", or "this shows" makes your why even clearer.' });
    });
    return { ok: !missing.length, short: short, missing: missing, nudges: nudges, min: min };
  };
  var PNAME = { claim: 'Claim', evidence: 'Evidence', reasoning: 'Reasoning' };
  GC.allocMin = function (save, p) { var m = p.open && p.open.min; return m ? m[GC.modeOf(save)] || m.challenge : {}; };
  GC.checkAlloc = function (save, p, alloc) {
    var o = p.open, min = GC.allocMin(save, p), sum = 0, low = []; alloc = alloc || {};
    o.items.forEach(function (it) { var v = Math.max(0, Math.floor(+alloc[it.id] || 0)); sum += v; if (v < (min[it.id] || 0)) low.push(it.id); });
    return { ok: sum === o.total && !low.length, sum: sum, total: o.total, low: low, min: min };
  };

  // ---------- predictions ----------
  GC.PRED = {
    'delta': { years: 50, q: 'In 50 years, what will the delta look like?', options: [['bigger', 'Bigger: more sediment builds it out'], ['smaller', 'Smaller: waves wash it away'], ['same', 'About the same']], outcome: function (save) { return damBuilt(save) ? 'smaller' : 'bigger'; } },
    'v-shaped-valley': { years: 50, q: 'In 50 years, what will the V-shaped valley look like?', options: [['deeper', 'Deeper and wider: the river keeps cutting'], ['filled', 'Filled in with sediment'], ['same', 'About the same']], outcome: function () { return 'deeper'; } },
    'sand-dune': { years: 50, q: 'In 50 years, where will the sand dune be?', options: [['moved', 'It moved downwind'], ['gone', 'It disappeared for good'], ['same', 'In the same spot, the same size']], outcome: function () { return 'moved'; } }
  };
  function damBuilt(save) { var r = save.civ.probs['p-dam']; return !!(r && r.choice === 'dam' && !(save.civ.probs['p-delta-sediment'] && save.civ.probs['p-delta-sediment'].choice === 'flush')); }
  GC.PRED_TOPICS = { 'delta': ['river', 'sediment', 'sand', 'mud', 'deposit', 'drop', 'sea', 'ocean', 'coast', 'wave', 'water', 'dam', 'delta', 'grow', 'grew', 'build', 'shrink', 'bigger', 'larger', 'smaller', 'wash', 'spread'], 'v-shaped-valley': ['river', 'water', 'erosion', 'erode', 'cut', 'carve', 'deep', 'wide', 'rock', 'valley', 'canyon', 'flow', 'sediment', 'weather', 'deeper', 'wider', 'grew', 'steep'], 'sand-dune': ['wind', 'sand', 'blow', 'move', 'dune', 'grain', 'dry', 'pile', 'deposit', 'erosion', 'desert', 'beach', 'moved', 'shift', 'downwind', 'gone', 'travel'] };
  function predCheck(save, lf, text) { var min = GC.cfg(save).predMin, tp = GC.PRED_TOPICS[lf] || GC.GEO_CORE, k = GC.PRED[lf];
    if (GC.realCount(text) < min) return { ok: false, reason: 'words', need: min, text: 'Add a little more: at least ' + min + ' different real words.' };
    if (k && GC.copied(text, k.q + ' ' + k.options.map(function (o) { return o[1]; }).join(' '))) return { ok: false, reason: 'own-words', text: 'Say it in your own words instead of copying the question.' };
    var h = GC.topicHits(text, tp).length; if (h < 2) return { ok: false, reason: 'topic', text: (h ? 'Good start. Add how it happens' : 'Say what makes it change') + ', using words like ' + tp.slice(0, 4).join(', ') + '.' };
    return { ok: true }; }
  GC.predCheck = predCheck;
  GC.preds = function (save) { var c = CC.ensure(save); if (!Array.isArray(c.preds)) c.preds = []; return c.preds; };
  GC.predict = function (save, id, pick, text) {
    var pr = GC.preds(save).filter(function (x) { return x.id === id; })[0]; if (!pr || pr.status !== 'ask') return { ok: false, reason: 'not-open' };
    var k = GC.PRED[pr.lf]; if (!k.options.some(function (o) { return o[0] === pick; })) return { ok: false, reason: 'pick' };
    var pc = predCheck(save, pr.lf, text); if (!pc.ok) return pc;
    pr.pick = pick; pr.text = String(text).slice(0, 600); pr.made = save.civ.year; pr.due = save.civ.year + k.years; pr.status = 'waiting'; return { ok: true, due: pr.due };
  };
  GC.reflectPred = function (save, id, self, text) {
    var pr = GC.preds(save).filter(function (x) { return x.id === id; })[0]; if (!pr || pr.status !== 'look') return { ok: false, reason: 'not-ready' };
    if (['yes', 'partly', 'no'].indexOf(self) < 0) return { ok: false, reason: 'self' }; var pc = predCheck(save, pr.lf, text); if (!pc.ok) return pc;
    pr.self = self; pr.look = String(text).slice(0, 600); pr.status = 'done'; pr.lookedAt = save.civ.year; NC.earn(save, 'pred:' + pr.id, 2); return { ok: true };
  };
  function natTick(save, ix, out) {
    var c = save.civ, ps = GC.preds(save);
    (c.nat || []).forEach(function (n) { if (n && n.id && GC.PRED[n.lf] && !ps.some(function (p) { return p.nid === n.id; })) ps.push({ id: 'pr-' + n.id, lf: n.lf, nid: n.id, y: c.year, status: 'ask' }); });
    ps.forEach(function (p) {
      if (p.status !== 'waiting' || c.year < p.due) return;
      p.actual = GC.PRED[p.lf].outcome(save); p.status = 'look';
      var n = (c.nat || []).filter(function (x) { return x.id === p.nid; })[0];
      if (n) { if (p.lf === 'delta') n.size = Math.max(0.6, (n.size || 1) + (p.actual === 'bigger' ? 0.4 : -0.3)); if (p.lf === 'sand-dune') { var bd = CC.bounds(save, ix); if (n.i + 1 <= bd.max) n.i += 1; n.moved = (n.moved || 0) + 1; } if (p.lf === 'v-shaped-valley') n.deeper = true; }
      CC.log(c, 'Nature: 50 years later, look at the ' + (NC.KINDS[p.lf] || { name: p.lf }).name.toLowerCase() + '. Was your prediction right?', 'nature');
    });
  }
  GC.predText = function (lf, v) { var k = GC.PRED[lf], o = k && k.options.filter(function (x) { return x[0] === v; })[0]; return o ? o[1] : v; };
  GC.PRED_STATUS = { ask: 'Not predicted yet', waiting: 'Predicted, watching', look: 'Ready to look back', done: 'Looked back' };

  // ---------- stretch (Grade 6, outside G5 coverage) ----------
  GC.stretchItems = function (save) { var pk = CC.pack(CC.ensure(save).grade) || {}; return ((pk.stretch || {}).items) || []; };
  GC.stretchOpen = function (save, it) { return !it.after || (save.civ.nat || []).some(function (n) { return n.lf === it.after; }); };
  GC.answerStretch = function (save, id, cer) {
    var it = GC.stretchItems(save).filter(function (x) { return x.id === id; })[0]; if (!it) return { ok: false, reason: 'none' }; if (!GC.stretchOpen(save, it)) return { ok: false, reason: 'not-yet' };
    var ck = GC.checkCer(save, cer, it.prompt + ' ' + it.title + ' metamorphic igneous sedimentary rock cycle heat pressure melt conservation efficient technology compete biotic abiotic light'); if (!ck.ok) return { ok: false, reason: 'cer', short: ck.short, min: ck.min, missing: ck.missing }; GC.tip(ck);
    var c = save.civ; c.stretch = c.stretch || {}; c.stretch[id] = { cer: clip(cer), y: c.year }; return { ok: true };
  };
  function clip(cer) { var o = {}; GC.CER_PARTS.forEach(function (p) { o[p.id] = String((cer || {})[p.id] || '').slice(0, 1500); }); return o; }

  function topicOf(p) { return [p.title, p.situation, (p.facts || []).join(' '), (p.voices || []).map(function (v) { return v.says; }).join(' '), (p.options || []).map(function (o) { return o.text; }).join(' '), (p.open && p.open.question) || ''].join(' '); }
  GC.topicOf = topicOf;
  // ---------- install: wrap the engine ----------
  GC.install = function (state) { S = state; if (!CC.__gcWrapped) wrap(); return GC; };
  function wrap() {
    CC.__gcWrapped = true;
    var problems = CC.problems, trig = CC.triggerMet, choose = CC.choose, start = CC.start, tick = CC.tick, report = CC.reportHtml, summary = CC.summary, era = NC.eraInfo;
    CC.modeOf = GC.modeOf;
    // chains: a follow-up problem exists only if the choice that causes it was made
    CC.problems = function (save) { var c = save.civ || {}; return problems(save).filter(function (p) { var ch = p.trigger && p.trigger.chose; if (!ch) return true; return Object.keys(ch).every(function (src) { var r = c.probs && c.probs[src]; return !r || !r.choice || ch[src].indexOf(r.choice) >= 0; }); }); };
    CC.triggerMet = function (save, ix, p) {
      var ch = p.trigger && p.trigger.chose;
      if (ch) { var c = save.civ, ok = Object.keys(ch).every(function (src) { var r = c.probs[src]; return r && ch[src].indexOf(r.choice) >= 0 && c.year - (r.chosenAt || 0) >= (p.trigger.yearsAfter || 0); }); if (!ok) return false; }
      return trig(save, ix, p);
    };
    CC.choose = function (save, ix, pid, oid, extra, now) {
      var p = CC.problem(save, pid); extra = extra || {};
      if (p && p.open && save.civ.probs[pid] && !save.civ.probs[pid].choice) {
        if (p.open.kind === 'allocate') { var ca = GC.checkAlloc(save, p, extra.alloc); if (!ca.ok) return { ok: false, reason: 'alloc', check: ca }; }
        var ck = GC.checkCer(save, extra.cer, topicOf(p)); if (!ck.ok) return { ok: false, reason: 'cer', short: ck.short, min: ck.min, missing: ck.missing }; GC.tip(ck);
      }
      var r = choose(save, ix, pid, oid, extra, now); if (!r.ok || !p || !p.open) return r;
      var rec = save.civ.probs[pid]; rec.cer = clip(extra.cer); rec.mode = GC.modeOf(save);
      if (p.open.kind === 'allocate') { rec.alloc = {}; var m = save.civ.m; p.open.items.forEach(function (it) { var v = Math.floor(+extra.alloc[it.id] || 0); rec.alloc[it.id] = v; Object.keys(it.effects || {}).forEach(function (k) { m[k] = Math.max(-5, Math.min(5, m[k] + Math.round(it.effects[k] * v / 4))); }); }); }
      if (S && S.saveWriting) S.saveWriting(save, 'civ-' + pid, { title: p.title, genre: 'cer', prompt: p.open.question, text: GC.CER_PARTS.map(function (q) { return q.name + ': ' + rec.cer[q.id]; }).join('\n'), checks: extra.checks || [] }, now);
      return r;
    };
    CC.start = function (save, ix, g) { var r = start(save, ix, g); if (r.ok) { GC.setMode(save, save.civ.mode); NC.earn(save, 'start', GC.cfg(save).startEnergy); } return r; };
    CC.tick = function (save, ix) { var r = tick(save, ix); if (!r.paused) natTick(save, ix, r.nature); return r; };
    // each new era, unspent energy above the carry-over cap is lost, so the budget stays meaningful later on
    NC.eraInfo = function (save) { var i = era(save), cf = GC.cfg(save), e = save.civ.energy; if (e.capEra !== i.era) { if (e.capEra != null && e.bal > cf.carryCap) { e.capped = (e.capped || 0) + (e.bal - cf.carryCap); e.bal = cf.carryCap; } e.capEra = i.era; } i.limit = cf.eraLimit; i.left = Math.max(0, cf.eraLimit - e.used); i.carryCap = cf.carryCap; return i; };
    var earn = NC.earn; NC.earn = function (save, key, n) { var t = GC.cfg(save).earn[String(key).split(':')[0]]; return earn(save, key, t != null ? t : n); };
    CC.summary = function (save, ix) { var s = summary(save, ix); if (!s) return s; s.mode = GC.CFG[GC.modeOf(save)].name; s.justified = Object.keys(save.civ.probs).filter(function (k) { return save.civ.probs[k].cer; }).length; s.predictions = GC.preds(save).filter(function (p) { return p.status !== 'ask'; }).length; s.predLooked = GC.preds(save).filter(function (p) { return p.status === 'done'; }).length; s.stretch = Object.keys(save.civ.stretch || {}).length; return s; };
    CC.reportHtml = function (sv, ixx, esc) {
      var base = report(sv, ixx, esc); if (!base) return base; var c = sv.civ, o = [];
      o.push('<div class="r-gt"><p><b>Mode:</b> ' + esc(GC.CFG[GC.modeOf(sv)].name) + (c.modeNote ? ' <small>(' + esc(c.modeNote) + ')</small>' : '') + '</p>');
      var js = CC.problems(sv).filter(function (p) { return c.probs[p.id] && c.probs[p.id].cer; });
      if (js.length) { o.push('<h3>Justifications (claim, evidence, reasoning)</h3>'); js.forEach(function (p) { var r = c.probs[p.id], op = CC.option(p, r.choice); o.push('<div class="r-cer"><h4>' + esc(p.title) + '</h4>' + (r.alloc ? '<p><b>Land plan:</b> ' + p.open.items.map(function (it) { return esc(it.name) + ' ' + r.alloc[it.id]; }).join(', ') + '</p>' : '<p><b>Chose:</b> ' + esc(op ? op.text : r.choice) + '</p>') + GC.CER_PARTS.map(function (q) { return '<p><b>' + q.name + ':</b> ' + esc(r.cer[q.id]) + '</p>'; }).join('') + '</div>'); }); }
      var ps = GC.preds(sv).filter(function (p) { return p.status !== 'ask'; });
      if (ps.length) { o.push('<h3>Predictions</h3><ul class="r-preds">'); ps.forEach(function (p) { o.push('<li><b>' + esc((NC.KINDS[p.lf] || { name: p.lf }).name) + '</b> (' + esc(GC.PRED_STATUS[p.status]) + '): predicted \u201c' + esc(GC.predText(p.lf, p.pick)) + '\u201d. ' + esc(p.text) + (p.status === 'done' ? ' <br><b>Looking back:</b> ' + esc(GC.predText(p.lf, p.actual)) + ' happened. The student said their prediction was ' + esc({ yes: 'right', partly: 'partly right', no: 'not right' }[p.self]) + '. ' + esc(p.look) : '') + '</li>'); }); o.push('</ul>'); }
      var st = c.stretch || {}, items = GC.stretchItems(sv).filter(function (it) { return st[it.id]; });
      if (items.length) { o.push('<h3>Stretch challenges (Grade 6 TEKS, outside Grade 5 coverage)</h3>'); items.forEach(function (it) { o.push('<div class="r-cer"><h4>' + esc(it.title) + ' <small>' + esc(it.teks.join(', ')) + ' \u00b7 stretch</small></h4>' + GC.CER_PARTS.map(function (q) { return '<p><b>' + q.name + ':</b> ' + esc(st[it.id].cer[q.id]) + '</p>'; }).join('') + '</div>'); }); }
      o.push('</div>');
      return base.replace(/<\/section>$/, o.join('') + '</section>');
    };
  }
  root.DAW_GC = GC;
  if (typeof window !== 'undefined' && root.DAW_STATE && !root.DAW_NATUI_PENDING) GC.install(root.DAW_STATE);
  if (typeof module !== 'undefined' && module.exports) module.exports = GC;
})(typeof window !== 'undefined' ? window : globalThis);
