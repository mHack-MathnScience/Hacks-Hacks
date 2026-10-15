/* Design a World: turn-in report (print/PDF HTML), PNG image, and summary used by teacher.html. */
(function () {
  'use strict';
  var S = window.DAW_STATE, IT = window.DAW_ITEMS, M = window.DAW_MAP, esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var R = window.DAW_REPORT = {};
  var FD = window.DAW_DESC, artOf = function (id) { return IT.get(id).art; }, FDX = FD ? FD.hook(S, artOf) : null;
  R.guide = function (save) { return FDX ? { counts: FD.counts(save, FDX, artOf), rows: FD.rows(save, FDX), todo: FD.todo(save, FDX, artOf) } : null; };
  function guideSection(save) {
    var g = R.guide(save); if (!g) return '';
    var c = g.counts, o = ['<section class="r-guide"><h2>Field Guide: descriptions and adaptations</h2><p><b>' + c.done + '</b> described \u00b7 <b>' + c.todo + '</b> still need a description \u00b7 <b>' + c.organisms + '</b> plants and animals placed \u00b7 <b>' + c.gt + '</b> GT predictions/comparisons</p>'];
    if (g.todo.length) o.push('<p class="r-warn"><b>Needs a description:</b> ' + g.todo.map(function (t) { return esc(t.name); }).join(', ') + '</p>');
    if (g.rows.length) o.push('<table class="r-table rep-guide"><tr><th>Type</th><th>What</th><th>Identified</th><th>In the student\u2019s words</th></tr>' + g.rows.map(function (r) { return '<tr><td><span class="gtag">' + esc(r.group) + '</span>' + (r.rev > 1 ? '<br><small>revised ' + (r.rev - 1) + 'x</small>' : '') + '</td><td><b>' + esc(r.name) + '</b>' + (r.biome ? '<br><small>in ' + esc(r.biome) + '</small>' : '') + (r.ok ? '' : '<br><small>not finished</small>') + '</td><td>' + esc(r.picks || '') + '</td><td>' + esc(r.text) + (r.gt ? '<br><i>GT predict: ' + esc(r.gt) + '</i>' : '') + '</td></tr>'; }).join('') + '</table>');
    else o.push('<p class="small">No descriptions yet.</p>');
    o.push('</section>'); return o.join('');
  }
  // the writing checklist as criteria the student ticked or not (no count, no points)
  function checklistLabels(key, e, ix) {
    var raw = null, WC = window.DAW_WORLDC, m;
    if (/^m:/.test(key) && ix && (m = ix.byId[key.slice(2)]) && m.task) raw = m.task.checklist;
    else if (/^h:/.test(key) && WC && WC.data()) { var p = key.split(':'), arc = WC.arcs().filter(function (a) { return a.id === p[1]; })[0], b = arc && (arc.beats || [])[+p[2]]; raw = b && b.artifact && b.artifact.rubric; }
    if (!raw || !raw.length) raw = (S.WRITING_CHECKLISTS || {})[e.genre] || (S.WRITING_CHECKLISTS || {}).journal || [];
    return raw.map(function (c) { return typeof c === 'string' ? c : c.text || c.label || ''; });
  }
  function checklistHtml(key, e, ix) {
    var ck = e.checks || []; if (!ck.some(function (v) { return v != null; })) return '';
    var labels = checklistLabels(key, e, ix);
    return '<ul class="r-check small">' + ck.map(function (v, k) { return labels[k] ? '<li>' + (v ? '\u2714 ' : '\u2610 ') + esc(labels[k]) + '</li>' : ''; }).join('') + '</ul>';
  }
  R.checklistLabels = checklistLabels;
  R.guideSection = guideSection;
  R.historySection = function (save, ix) {
    var WC = window.DAW_WORLDC; if (!WC || !WC.data()) return ''; var hs = (save.history && save.history.arcs) || {}, ids = Object.keys(hs); if (!ids.length) return '';
    var m = WC.meters(save), o = ['<section class="r-history"><h2>History events (Then & Now)</h2><p>Trust ' + m.trust + ' \u00b7 Unity ' + m.unity + ' \u00b7 Rights ' + m.rights + ' \u00b7 Economy ' + m.economy + '</p>'];
    WC.arcs().forEach(function (arc) { var a = hs[arc.id]; if (!a) return; o.push('<div class="r-m"><h3>' + esc(arc.title) + ' <small>' + (a.done ? '\u2714 finished' : 'in progress') + ' \u00b7 ' + esc((arc.teks || []).join(', ')) + '</small></h3>' + (arc.beats || []).map(function (b, bi) { var c = b.choices && b.choices[a.choices[bi]]; if (!c) return ''; var w = save.writing && save.writing['h:' + arc.id + ':' + bi]; return '<p><b>Choice:</b> ' + esc(c.text) + (c.mapEffect ? ' <small>(' + esc(c.mapEffect) + ')</small>' : '') + '</p>' + (w && w.words ? '<p><b>' + esc(w.genre) + ' (' + w.words + ' words):</b> ' + esc(w.text) + '</p>' : ''); }).join('') + (a.tn && arc.thenAndNow && arc.thenAndNow.compareQuestions ? '<div class="r-tn"><p><b>Then & Now answers</b> <small>(student answer, then the answer key, for the teacher to review)</small></p><ol class="small">' + arc.thenAndNow.compareQuestions.map(function (q, qi) { return '<li>' + esc(q.question) + '<br><b>Student:</b> ' + esc(WC.answerText(q, a.tn[qi])) + (WC.keyText(q) ? '<br><i>Key: ' + esc(WC.keyText(q)) + '</i>' : '') + '</li>'; }).join('') + '</ol></div>' : '') + '</div>'); });
    o.push('</section>'); return o.join('');
  };
  function fmt(iso) { if (!iso) return ''; var d = new Date(iso); return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) + ' ' + d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }); }
  R.summary = function (save, ix) {
    if (S.applyAliases) S.applyAliases(save, ix);
    var tr = S.tracker(save, ix), stages = ix.stages.map(function (st) { var ms = S.stageMissions(ix, st.id); return { id: st.id, title: st.title, color: st.color, total: ms.length, done: ms.filter(function (m) { return save.missions[m.id] && save.missions[m.id].done; }).length, complete: S.stageComplete(save, ix, st.id) }; });
    var review = ix.missions.filter(function (m) { return S.missionState(save, ix, m) === 'review'; }).map(function (m) { return m.id; });
    var w = Object.keys(save.writing || {}).map(function (k) { return save.writing[k]; }), words = w.reduce(function (n, e) { return n + (e.words || 0); }, 0);
    return { tracker: tr, stages: stages, done: S.completedCount(save), total: ix.missions.length, review: review, writingCount: w.filter(function (e) { return e.words; }).length, words: words, budget: IT.budget(save), tiles: save.world.tiles.length, guide: R.guide(save) && R.guide(save).counts };
  };
  R.html = function (save, ix, opts) {
    opts = opts || {}; var sm = R.summary(save, ix), o = [];
    var code = opts.code || S.encodeCode(save), sum = code.split('.')[1];
    o.push('<article class="report">');
    o.push('<header class="r-head"><div><h1>Design a World: Turn-in Report</h1><p><b>' + esc(save.student.name || 'Student') + '</b>' + (save.student.period ? ' \u00b7 Period ' + esc(save.student.period) : '') + ' \u00b7 ' + esc(opts.source || 'Current world') + '</p><p class="small">Made ' + esc(fmt(new Date().toISOString())) + ' \u00b7 Last saved ' + esc(fmt(save.updated)) + ' \u00b7 Check number ' + esc(sum) + '</p></div><div class="r-big"><b>' + sm.tracker.done + ' of ' + sm.tracker.total + '</b><span>TEKS have evidence</span></div></header>');
    o.push('<section class="r-map">' + M.build(save, { ix: ix, legend: true, compass: true, scale: true, forExport: true, labels: true }) + '</section>');
    o.push('<section class="r-cards"><div><b>' + sm.done + ' of ' + sm.total + '</b><span>missions finished</span></div><div><b>' + sm.words + '</b><span>words written</span></div><div><b>' + sm.budget.balance + '</b><span>coins left</span></div><div><b>' + sm.tiles + '</b><span>places built</span></div>' + (sm.guide ? '<div><b>' + sm.guide.done + ' of ' + sm.guide.total + '</b><span>places described</span></div>' : '') + '</section>');
    o.push('<section><h2>TEKS evidence by subject</h2><p class="small">Counts of TEKS, not a grade. The full done / not-yet list is at the end of this report.</p><table class="r-table"><tr><th>Subject</th><th>Have evidence</th><th>Not yet</th><th>Not in this game</th></tr>' + sm.tracker.bySubject.filter(function (b) { return b.total; }).map(function (b) { var c = S.subjectCounts(sm.tracker, b.id); return '<tr><td>' + esc(b.name) + '</td><td>' + c.evidence + '</td><td>' + c.notYet + '</td><td>' + c.notInGame + '</td></tr>'; }).join('') + '</table>');
    o.push('<h2>Stages</h2><table class="r-table"><tr><th>Stage</th><th>Missions</th><th>Status</th></tr>' + sm.stages.map(function (s) { return '<tr><td>' + s.id + '. ' + esc(s.title) + '</td><td>' + s.done + ' of ' + s.total + ' finished</td><td>' + (s.complete ? '\u2714 Complete' + (save.stageDone[s.id] ? ' (' + esc(fmt(save.stageDone[s.id])) + ')' : '') : 'In progress') + '</td></tr>'; }).join('') + '</table>');
    if (sm.review.length) o.push('<p class="r-warn"><b>Needs review:</b> ' + sm.review.map(function (id) { return esc(ix.byId[id].title); }).join(', ') + '</p>');
    o.push('</section>');
    o.push('<section class="r-missions"><h2>Missions and explanations</h2>');
    ix.missions.forEach(function (m) {
      var r = save.missions[m.id]; if (!r || !r.done) { if (opts.all) o.push('<div class="r-m todo"><h3>' + esc(m.title) + '</h3><p class="small">Not finished</p></div>'); return; }
      o.push('<div class="r-m"><h3>' + esc(m.title) + ' <small>Stage ' + m.stage + ' \u00b7 ' + esc(S.covers(m).filter(function (v, k, a) { return a.indexOf(v) === k; }).join(', ')) + (r.firstTry ? ' \u00b7 first try' : '') + (r.revealed ? ' \u00b7 answer shown' : '') + (r.rev > 1 ? ' \u00b7 revised ' + (r.rev - 1) + 'x' : '') + '</small></h3>' +
        '<p><b>Claim:</b> ' + esc(r.explain.c) + '</p><p><b>Evidence:</b> ' + esc(r.explain.e) + '</p><p><b>Reasoning:</b> ' + esc(r.explain.r) + '</p>' + (r.gt ? '<p><b>GT challenge:</b> ' + esc(r.gt) + '</p>' : '') + '</div>');
    });
    o.push('</section>');
    o.push(guideSection(save));
    o.push(R.historySection(save, ix));
    if (window.DAW_CIVC && window.DAW_CIVC.reportHtml) o.push(window.DAW_CIVC.reportHtml(save, ix, esc));
    if (window.DAW_SHOWCASE) o.push(window.DAW_SHOWCASE.reportSection(save, ix));
    var wk = Object.keys(save.writing || {}).filter(function (k) { return save.writing[k].words; });
    if (wk.length) {
      o.push('<section class="r-writing"><h2>Writing</h2>');
      wk.forEach(function (k) { var e = save.writing[k]; o.push('<div class="r-w"><h3>' + esc(e.title || 'Untitled') + ' <small>' + esc(e.genre) + ' \u00b7 ' + e.words + ' words \u00b7 ' + esc(fmt(e.updated)) + '</small></h3>' + (e.prompt ? '<p class="small"><i>Prompt: ' + esc(e.prompt) + '</i></p>' : '') + '<div class="r-text">' + esc(e.text).replace(/\n/g, '<br>') + '</div>' + checklistHtml(k, e, ix) + '</div>'); });
      o.push('</section>');
    }
    var SCX = window.DAW_SHOWCASE, evBy = {}; if (SCX && SCX.stops().length) SCX.evidence(save, ix).rows.forEach(function (r) { evBy[r.id] = r; });
    var ST = { strong: 'Strong', weak: 'Weak', missing: 'Missing' }, hasEv = Object.keys(evBy).length > 0;
    o.push('<section class="r-teks"><h2>TEKS tracker</h2><p class="small">Done / not yet for each TEKS' + (hasEv ? ', with the Standards Evidence status (strong, weak, missing) and why' : '') + '. These are for the teacher to score from; the game gives no grade.</p><table class="r-table small"><tr><th>TEKS</th><th>Skill</th><th>Done</th>' + (hasEv ? '<th>Evidence</th><th>Why</th>' : '') + '</tr>' + sm.tracker.rows.map(function (r) { var e = evBy[r.id]; return '<tr><td>' + esc(r.id) + '</td><td>' + esc(r.kid || r.text) + '</td><td>' + (r.done ? (r.review ? '\u2714 (review)' : '\u2714') : r.sources ? 'not yet' : 'not in this game') + '</td>' + (hasEv ? '<td>' + (e ? ST[e.status] : '') + '</td><td>' + (e ? esc(e.why) : '') + '</td>' : '') + '</tr>'; }).join('') + '</table></section>');
    o.push('<footer class="r-foot">Turn-in code check number: <b>' + esc(sum) + '</b>. Your teacher can paste your code into the Teacher View to see this report. The check number shows if the code was changed. (It is tamper-resistant, not secure.)</footer></article>');
    return o.join('');
  };
  R.print = function (save, ix, opts) {
    var area = document.getElementById('print-area'); if (!area) { area = document.createElement('div'); area.id = 'print-area'; document.body.appendChild(area); }
    area.innerHTML = R.html(save, ix, opts); document.body.classList.add('printing');
    var done = function () { document.body.classList.remove('printing'); window.removeEventListener('afterprint', done); };
    window.addEventListener('afterprint', done);
    setTimeout(function () { window.print(); setTimeout(done, 1500); }, 250);
  };
  function svgImage(svg) { return new Promise(function (res, rej) { var img = new Image(); img.onload = function () { res(img); }; img.onerror = rej; img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg); }); }
  function wrap(ctx, text, x, y, maxW, lh, maxLines) { var words = String(text).split(/\s+/), line = '', n = 0; for (var k = 0; k < words.length; k++) { var t = line ? line + ' ' + words[k] : words[k]; if (ctx.measureText(t).width > maxW && line) { ctx.fillText(line, x, y); y += lh; line = words[k]; if (++n >= (maxLines || 99) - 1) { ctx.fillText(line + (k < words.length - 1 ? '\u2026' : ''), x, y); return y + lh; } } else line = t; } if (line) { ctx.fillText(line, x, y); y += lh; } return y; }
  R.png = function (save, ix, opts) {
    opts = opts || {}; var sm = R.summary(save, ix), code = opts.code || S.encodeCode(save), sum = code.split('.')[1];
    var svg = M.build(save, { ix: ix, legend: true, compass: true, scale: true, forExport: true });
    var fontReady = document.fonts && document.fonts.load ? Promise.all([document.fonts.load('800 30px Lexend'), document.fonts.load('400 16px Lexend')]).catch(function () {}) : Promise.resolve();
    return fontReady.then(function () { return svgImage(svg); }).then(function (img) {
      var W = 1600, H = 1500, c = document.createElement('canvas'); c.width = W; c.height = H; var x = c.getContext('2d'), F = 'Lexend, Arial, sans-serif';
      x.fillStyle = '#f4f8fb'; x.fillRect(0, 0, W, H);
      x.fillStyle = '#13294B'; x.fillRect(0, 0, W, 120);
      x.fillStyle = '#fff'; x.font = '800 42px ' + F; x.fillText('Design a World', 40, 62); x.font = '400 22px ' + F; x.fillText((save.student.name || 'Student') + (save.student.period ? '  \u00b7  Period ' + save.student.period : '') + '  \u00b7  ' + (opts.source || 'Current world'), 40, 100);
      x.textAlign = 'right'; x.font = '800 40px ' + F; x.fillText(sm.tracker.done + ' of ' + sm.tracker.total, W - 40, 66); x.font = '400 18px ' + F; x.fillText('TEKS have evidence', W - 40, 100); x.textAlign = 'left';
      x.fillStyle = '#fff'; x.fillRect(30, 140, 1040, 640); x.drawImage(img, 30, 141, 1040, 637);
      // right column: stats
      var cx = 1100, cy = 170; x.fillStyle = '#13294B'; x.font = '800 26px ' + F; x.fillText('TEKS evidence', cx, cy); cy += 40;
      sm.tracker.bySubject.filter(function (b) { return b.total; }).forEach(function (b) { var c = S.subjectCounts(sm.tracker, b.id); x.font = '600 18px ' + F; x.fillStyle = '#13294B'; x.fillText(b.name, cx, cy); x.font = '400 16px ' + F; x.fillStyle = '#495057'; x.fillText(c.evidence + ' have evidence \u00b7 ' + c.notYet + ' not yet' + (c.notInGame ? ' \u00b7 ' + c.notInGame + ' not in this game' : ''), cx, cy + 24); cy += 56; });
      sm.stages.forEach(function (s) { x.fillStyle = s.color; x.beginPath(); x.arc(cx + 10, cy - 6, 9, 0, 7); x.fill(); x.fillStyle = '#13294B'; x.font = '400 17px ' + F; x.fillText('Stage ' + s.id + ': ' + s.done + ' of ' + s.total + ' missions' + (s.complete ? '  \u2714' : ''), cx + 28, cy); cy += 32; });
      cy += 10; [['Missions finished', sm.done + ' of ' + sm.total], ['Words written', sm.words], ['Coins left', sm.budget.balance], ['Places built', sm.tiles]].forEach(function (p) { x.font = '400 18px ' + F; x.fillStyle = '#495057'; x.fillText(p[0], cx, cy); x.font = '800 18px ' + F; x.fillStyle = '#13294B'; x.fillText(String(p[1]), cx + 220, cy); cy += 32; });
      // explanations
      var y = 830; x.fillStyle = '#13294B'; x.font = '800 26px ' + F; x.fillText('My explanations', 40, y); y += 36;
      var done = ix.missions.filter(function (m) { return save.missions[m.id] && save.missions[m.id].done; }), col = 0, colW = 740, yStart = y;
      done.slice(0, 16).forEach(function (m) { var r = save.missions[m.id]; var X = 40 + col * (colW + 40); x.font = '700 16px ' + F; x.fillStyle = '#13294B'; x.fillText(m.title.slice(0, 60), X, y); x.font = '400 14px ' + F; x.fillStyle = '#343a40'; y = wrap(x, 'Claim: ' + r.explain.c, X, y + 20, colW, 18, 2); y += 10; if (y > H - 110 && col === 0) { col = 1; y = yStart; } });
      if (done.length > 16) { x.font = '400 14px ' + F; x.fillText('+ ' + (done.length - 16) + ' more in the full report', 40 + col * (colW + 40), Math.min(y + 8, H - 70)); }
      if (!done.length) { x.font = '400 16px ' + F; x.fillStyle = '#868e96'; x.fillText('No missions finished yet.', 40, y); }
      x.fillStyle = '#13294B'; x.fillRect(0, H - 50, W, 50); x.fillStyle = '#fff'; x.font = '400 16px ' + F; x.fillText('Check number ' + sum + '  \u00b7  Made ' + fmt(new Date().toISOString()) + '  \u00b7  Tamper-resistant, not secure', 40, H - 18);
      return new Promise(function (res) { c.toBlob(function (b) { res(b); }, 'image/png'); });
    });
  };
})();
