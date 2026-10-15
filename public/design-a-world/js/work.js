/* Design a World: Writing workspace, Budget & economy panel, Data & charts panel. */
(function () {
  'use strict';
  var U = window.DAW_UI, S = window.DAW_STATE, A = window.DAW_ART, IT = window.DAW_ITEMS, CH = window.DAW_CHARTS, esc = U.esc;
  var W = window.DAW_WORK = {};
  function app() { return window.DAW_APP; }
  var RUBRIC = S.WRITING_CHECKLISTS; // writing checklists: criteria only (no points); shared with the report and teacher view
  W.HISTORY_GENRES = ['declaration', 'constitution', 'compromise', 'amendment', 'petition'];
  W.RUBRIC = RUBRIC;
  // Built-in prompts by stage (the mission file can add more with type "write")
  var PROMPTS = [
    { id: 'j1', stage: 1, genre: 'journal', title: 'Field Journal: How My Land Got Its Shape', prompt: 'Describe two landforms in your world. Explain how weathering, erosion, or deposition formed each one. Name the places on your map.' },
    { id: 'n1', stage: 1, genre: 'narrative', title: 'Story: The Journey of a Grain of Sand', prompt: 'Write a story told by a grain of sand that travels from a mountain to your delta. What moves it? Where does it stop?' },
    { id: 'i2', stage: 2, genre: 'informational', title: 'Weather Report for My World', prompt: 'Write a weather report for one week in your world. Use your rainfall graph from the Data panel. Explain the difference between weather and climate.' },
    { id: 'n2', stage: 2, genre: 'narrative', title: 'Story: A Water Drop\u2019s Trip', prompt: 'Tell the story of a water drop that moves through the water cycle in your world. Use the words evaporation, condensation, and precipitation.' },
    { id: 'i3', stage: 3, genre: 'informational', title: 'Field Guide: Who Eats Whom', prompt: 'Write a field guide page for one ecosystem in your world. Describe a producer, a consumer, and a decomposer, and how energy flows.' },
    { id: 'n3', stage: 3, genre: 'narrative', title: 'What If? A Change in My Ecosystem', prompt: 'Something changes in your world (a drought, a new animal, or a fire). Write what happens next to the plants and animals.' },
    { id: 'p4', stage: 4, genre: 'proposal', title: 'Town Proposal: Build It Here!', prompt: 'Propose one new building or project for your town. Say where it goes (give the coordinates), what it costs, and why it helps people and the environment. Use your budget and data.' },
    { id: 'l4', stage: 4, genre: 'proposal', title: 'Letter to the Town Council', prompt: 'Write a letter to your town council about saving a resource (water, energy, or land). Explain the problem, your solution, and its cost.' }
  ];
  W.PROMPTS = PROMPTS;
  W.entries = function (save, ix) {
    var hi = S.highestUnlocked(save, ix, { unlockAll: app() && app().unlockAll() }), out = [];
    ix.missions.filter(function (m) { return m.task.type === 'write' || m.task.type === 'writing'; }).forEach(function (m) { out.push({ id: 'm:' + m.id, group: 'Mission writing', title: m.title, genre: m.task.genre || 'response', prompt: m.task.question || m.prompt, mission: m.id, checklist: m.task.checklist, locked: !S.stageUnlocked(save, ix, m.stage, { unlockAll: app() && app().unlockAll() }), stage: m.stage }); });
    PROMPTS.forEach(function (p) { out.push({ id: p.id, group: 'Stage ' + p.stage + ' writing', title: p.title, genre: p.genre, prompt: p.prompt, locked: p.stage > hi, stage: p.stage }); });
    var WC = window.DAW_WORLDC; if (WC && WC.data()) WC.arcs().forEach(function (arc) { (arc.beats || []).forEach(function (b, bi) { var a = b.artifact, key = WC.artifactKey(arc.id, bi); if (!a) return; var st = save.history && save.history.arcs && save.history.arcs[arc.id]; if (!st && !save.writing[key]) return;
      out.push({ id: key, group: 'History writing', title: arc.title.split(':')[0] + ': ' + a.genre.charAt(0).toUpperCase() + a.genre.slice(1), genre: a.genre, prompt: a.prompt, frames: a.frames || [], checklist: a.rubric, keywords: a.keywordChecklist || [], model: a.modelAnswer || '', history: arc.id, locked: false }); }); });
    Object.keys(save.writing).filter(function (k) { return /^own:/.test(k); }).forEach(function (k) { var e = save.writing[k]; out.push({ id: k, group: 'My own writing', title: e.title || 'Untitled', genre: e.genre || 'journal', prompt: e.prompt || '', own: true }); });
    return out;
  };
  W.open = function (startId) {
    var save = app().save(), ix = app().ix(), md = U.modal({ title: 'Writing Workspace', full: true }); md.el.id = 'writing-modal';
    var cur = startId || null, timer = null;
    function list() { return W.entries(save, ix); }
    function vocab() { var v = []; ix.missions.forEach(function (m) { if (save.missions[m.id] && save.missions[m.id].done) (m.vocab || []).forEach(function (x) { if (v.indexOf(x.term) < 0) v.push(x.term); }); }); return v.slice(0, 40); }
    function places() { var p = []; save.world.tiles.forEach(function (t) { var n = IT.name(save, t.t), c = window.DAW_MAP.tileCoord(t), s = n + ' (' + c.x + ', ' + c.y + ')'; if (p.indexOf(s) < 0) p.push(s); }); return p.slice(0, 30); }
    function paint() {
      var es = list(), groups = []; es.forEach(function (e) { if (groups.indexOf(e.group) < 0) groups.push(e.group); });
      if (!cur) { var first = es.filter(function (e) { return !e.locked; })[0]; cur = first && first.id; }
      var e = es.filter(function (x) { return x.id === cur; })[0];
      md.body.innerHTML = '<div class="writing"><aside class="w-list">' + groups.map(function (g) { return '<h4>' + esc(g) + '</h4>' + es.filter(function (x) { return x.group === g; }).map(function (x) { var s = save.writing[x.id]; return '<button class="w-item' + (x.id === cur ? ' on' : '') + (x.locked ? ' locked' : '') + '" data-id="' + esc(x.id) + '"' + (x.locked ? ' disabled' : '') + '><span>' + (x.locked ? A.icon('lock', 14) + ' ' : '') + esc(x.title) + '</span><small>' + esc(x.genre) + (s && s.words ? ' \u00b7 ' + s.words + ' words' : '') + '</small></button>'; }).join(''); }).join('') + '<button class="btn ghost new-own">+ New writing</button></aside>' +
        '<section class="w-edit">' + (e ? editor(e) : '<p>Pick a writing prompt on the left.</p>') + '</section></div>';
      if (e) wire(e);
    }
    function editor(e) {
      var s = save.writing[e.id] || {}, cl = e.checklist && e.checklist.length ? e.checklist.map(function (c) { return typeof c === 'string' ? c : c.text || c.label; }) : RUBRIC[e.genre] || RUBRIC.journal;
      return '<div class="w-head"><span class="genre-tag">' + esc(e.genre) + '</span>' + (e.own ? '<input class="w-title" maxlength="80" value="' + esc(s.title || '') + '" placeholder="Title">' : '<h3>' + esc(e.title) + '</h3>') + '</div>' +
        (e.own ? '<label class="field">Kind of writing <select class="w-genre">' + Object.keys(RUBRIC).map(function (g) { return '<option' + (g === (s.genre || e.genre) ? ' selected' : '') + '>' + g + '</option>'; }).join('') + '</select></label>' : '<div class="w-prompt">' + esc(e.prompt) + '</div>') +
        (e.mission ? '<p class="small">This writing is part of a mission. Finish it inside the mission to get credit.</p>' : '') +
        (e.frames && e.frames.length ? '<div class="w-frames"><b>Sentence frames</b> <span class="small">(tap one to add it, then fill in the blanks)</span>' + e.frames.map(function (f) { return '<button class="ins frame" data-t="' + esc(f) + '">' + esc(f) + '</button>'; }).join('') + '</div>' : '') +
        (e.keywords && e.keywords.length ? '<div class="w-kw"><b>Key words to use:</b> ' + e.keywords.map(function (k) { return '<span class="kw" data-kw="' + esc(k.toLowerCase()) + '">' + esc(k) + '</span>'; }).join(' ') + '</div>' : '') +
        '<div class="w-tools"><span class="small">Add a word:</span>' + vocab().map(function (v) { return '<button class="ins" data-t="' + esc(v) + '">' + esc(v) + '</button>'; }).join('') + (places().length ? '<span class="small">Add a place:</span>' + places().map(function (v) { return '<button class="ins place" data-t="' + esc(v) + '">' + esc(v) + '</button>'; }).join('') : '') + '</div>' +
        '<textarea class="w-text" rows="14" aria-label="Your writing" spellcheck="true" placeholder="Start writing here...">' + esc(s.text || '') + '</textarea>' +
        '<div class="write-meta"><span class="wc">' + (s.words || 0) + ' words</span><span class="saved small"></span>' + (e.own ? '<button class="btn small danger del">Delete</button>' : '') + '</div>' +
        (e.model ? '<details class="w-model"><summary>See a model ' + esc(e.genre) + ' (after you write yours)</summary><p>' + esc(e.model) + '</p></details>' : '') +
        '<div class="checklist"><h4>Checklist: check each one when your writing does it</h4>' + cl.map(function (c, k) { return '<label class="cbx"><input type="checkbox" data-k="' + k + '"' + ((s.checks || [])[k] ? ' checked' : '') + '> <span>' + esc(c) + '</span></label>'; }).join('') + '<p class="small">Your teacher reads your writing and this checklist.</p></div>';
    }
    function wire(e) {
      var ta = U.$('.w-text', md.body);
      function data() { return { title: e.own ? (U.$('.w-title', md.body).value || 'Untitled') : e.title, genre: e.own ? U.$('.w-genre', md.body).value : e.genre, prompt: e.prompt, mission: e.mission || e.history || null, text: ta.value, checks: U.$$('.checklist input', md.body).map(function (c) { return c.checked; }) }; }
      function kwHints() { var low = ta.value.toLowerCase(); U.$$('.kw', md.body).forEach(function (k) { k.classList.toggle('used', low.indexOf(k.getAttribute('data-kw')) >= 0); }); }
      function persist() { var x = S.saveWriting(save, e.id, data()); app().commit(null, { quiet: true, noRender: true }); U.$('.saved', md.body).textContent = 'Saved ' + new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }); var it = U.$('.w-item.on small', md.body); if (it) it.textContent = x.genre + ' \u00b7 ' + x.words + ' words'; }
      ta.addEventListener('input', function () { U.$('.wc', md.body).textContent = U.words(ta.value) + ' words'; kwHints(); clearTimeout(timer); timer = setTimeout(persist, 500); });
      U.$('.w-edit', md.body).addEventListener('change', function (ev) { if (ev.target.matches('input[type=checkbox],select,.w-title')) { persist(); kwHints(); } });
      U.$$('.ins', md.body).forEach(function (b) { b.onclick = function () { var t = b.getAttribute('data-t'), p = ta.selectionStart || ta.value.length; ta.value = ta.value.slice(0, p) + (p && !/\s$/.test(ta.value.slice(0, p)) ? ' ' : '') + t + ' ' + ta.value.slice(p); ta.focus(); ta.dispatchEvent(new Event('input')); }; });
      if (U.$('.del', md.body)) U.$('.del', md.body).onclick = function () { U.confirm('Delete this writing?', 'This removes it from your world. A checkpoint is saved first.', 'Delete', function () { S.addCheckpoint(save, 'Before deleting writing', null); S.deleteWriting(save, e.id); app().commit('Deleted writing'); cur = null; paint(); }, true); };
      kwHints();
    }
    md.body.addEventListener('click', function (ev) {
      var it = ev.target.closest('.w-item'); if (it && !it.disabled) { clearTimeout(timer); cur = it.getAttribute('data-id'); paint(); return; }
      if (ev.target.closest('.new-own')) { var id = 'own:' + Date.now().toString(36); S.saveWriting(save, id, { title: 'My writing', genre: 'journal', text: '' }); app().commit('New writing'); cur = id; paint(); }
    });
    paint(); return md;
  };

  // ---------- budget & economy ----------
  W.budget = function () {
    var save = app().save(), ix = app().ix(), b = IT.budget(save), md = U.modal({ title: 'Budget & Economy', wide: true }); md.el.id = 'budget-modal';
    var rows = { producer: [], provider: [], consumer: [] }; save.world.tiles.forEach(function (t) { var e = IT.econ(t.t); if (e) rows[e.role].push({ t: t, e: e }); });
    var spent = {}; save.world.tiles.forEach(function (t) { var d = IT.get(t.t); if (d.cost) spent[d.name] = (spent[d.name] || 0) + d.cost; });
    function list(arr) { return arr.length ? '<ul class="econ-list">' + arr.map(function (x) { return '<li><span class="mini">' + A.thumb(IT.get(x.t.t).art, 34, 2) + '</span><b>' + esc(IT.name(save, x.t.t)) + '</b> <small>' + esc(x.e.what) + (x.e.income ? ' \u00b7 +' + x.e.income + ' coins' : '') + '</small></li>'; }).join('') + '</ul>' : '<p class="small">None yet.</p>'; }
    md.body.innerHTML = '<div class="budget-top"><div class="coin-big">' + b.balance.toLocaleString() + '<small>coins</small></div><table class="ledger"><tr><td>Starting budget</td><td>+' + b.start + '</td></tr><tr><td>Mission grants (100 per finished mission)</td><td>+' + b.grants + '</td></tr><tr><td>Income from producers and services</td><td>+' + b.income + '</td></tr><tr><td>Spent on buildings and roads</td><td>\u2212' + b.spent + '</td></tr><tr class="tot"><td>Balance</td><td>' + b.balance + '</td></tr></table></div>' +
      '<p class="small">Natural places (landforms, water, living things) are free. Mission places are paid for by grants. Extra buildings cost coins, and you cannot spend more than you have.</p>' +
      '<div class="econ-grid"><section><h4>Producers (make goods)</h4><p class="small">Goods are things you can touch, like food or fuel.</p>' + list(rows.producer) + '</section><section><h4>Service providers</h4><p class="small">Services are work people do for others, like teaching.</p>' + list(rows.provider) + '</section><section><h4>Consumers</h4><p class="small">Consumers buy and use goods and services. Families in your neighborhoods are consumers.</p>' + list(rows.consumer) + '</section></div>' +
      (Object.keys(spent).length ? '<h4>Where my coins went</h4><table class="ledger">' + Object.keys(spent).map(function (k) { return '<tr><td>' + esc(k) + '</td><td>\u2212' + spent[k] + '</td></tr>'; }).join('') + '</table>' : '') +
      '<h4>Price list (Stage 4 buildings)</h4><div class="price-list">' + IT.decor().filter(function (d) { return d.cost; }).map(function (d) { var e = IT.econ(d.id); return '<div class="price"><span class="mini">' + A.thumb(d.art, 40, 2) + '</span><b>' + esc(d.name) + '</b><span>' + d.cost + ' coins</span><small>' + (e ? esc(e.role === 'producer' ? 'makes ' + e.what : e.role === 'provider' ? 'service: ' + e.what : e.what) : '') + '</small></div>'; }).join('') + '</div>' +
      '<div class="think"><b>Think like an economist:</b> If you have 300 coins, which two buildings would you choose and why? Write your answer in the Writing workspace (Town Proposal).</div>';
  };

  // ---------- data & charts ----------
  W.charts = function (startId) {
    var save = app().save(), ix = app().ix(), md = U.modal({ title: 'Data & Graphs', wide: true }); md.el.id = 'charts-modal';
    var sets = CH.datasets(save, ix, IT), cur = startId || sets[0].id, type = null;
    function paint() {
      var d = sets.filter(function (s) { return s.id === cur; })[0], t = type || d.best;
      md.body.innerHTML = '<div class="chart-ctl"><label>Data <select class="ds">' + sets.map(function (s) { return '<option value="' + s.id + '"' + (s.id === cur ? ' selected' : '') + '>' + esc(s.title) + '</option>'; }).join('') + '</select></label><div class="seg" role="group" aria-label="Graph type">' + [['bar', 'Bar graph'], ['line', 'Line graph'], ['dot', 'Dot plot']].map(function (x) { return '<button class="seg-b' + (x[0] === t ? ' on' : '') + '" data-t="' + x[0] + '">' + x[1] + '</button>'; }).join('') + '</div></div>' +
        '<div class="chart-box">' + CH.svg(t, d) + '</div>' + (d.note ? '<p class="small">' + esc(d.note) + '</p>' : '') +
        '<table class="data small"><tr><th>' + esc(d.xLabel) + '</th>' + d.labels.map(function (l) { return '<td>' + esc(l) + '</td>'; }).join('') + '</tr><tr><th>' + esc(d.yLabel) + '</th>' + d.values.map(function (v) { return '<td>' + v + '</td>'; }).join('') + '</tr></table>' +
        '<div class="think"><b>Which graph fits?</b> Bar graphs compare groups. Line graphs show change over time. Dot plots show how often each number happens. ' + (t !== d.best ? 'Hint: this data may be easier to read as a <b>' + (d.best === 'dot' ? 'dot plot' : d.best + ' graph') + '</b>.' : 'Nice choice for this data!') + '</div>';
    }
    md.body.addEventListener('change', function (e) { if (e.target.classList.contains('ds')) { cur = e.target.value; type = null; paint(); } });
    md.body.addEventListener('click', function (e) { var b = e.target.closest('.seg-b'); if (b) { type = b.getAttribute('data-t'); paint(); } });
    paint(); return md;
  };
})();
