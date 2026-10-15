/* Design a World: mission flow (intro -> activity -> follow-up -> explain (CER) -> GT -> done), and revisit. */
(function () {
  'use strict';
  var U = window.DAW_UI, S = window.DAW_STATE, A = window.DAW_ART, T = window.DAW_TASKS, IT = window.DAW_ITEMS, esc = U.esc;
  var MS = window.DAW_MISSION = {};
  var SUBJ = { science: 'Science', math: 'Math', writing: 'Writing', social_studies: 'Social Studies' };
  function app() { return window.DAW_APP; }
  MS.fill = function (text, save) { return String(text || '').replace(/\{\{item:([^}]+)\}\}/g, function (x, id) { return IT.name(save, id); }); };
  function followOf(m) { return m.followUp || (m.task && m.task.followUp) || null; }
  function stageOf(ix, sid) { return ix.stages.filter(function (s) { return s.id === sid; })[0] || { title: '', color: '#1e78c8' }; }
  function teksChips(m) { var t = S.covers(m).filter(function (v, k, a) { return a.indexOf(v) === k; }); return t.map(function (id) { return '<span class="teks-chip' + ((m.teks || []).indexOf(id) >= 0 ? ' content' : '') + '" title="TEKS ' + esc(id) + '">' + esc(id) + '</span>'; }).join(''); }
  function fromWorld(m, save, ix) {
    var u = m.uses || []; if (!u.length) return '';
    return '<div class="from-world"><h4>' + A.icon('flag', 16) + ' From your world</h4><div class="fw-list">' + u.map(function (x) {
      if (x.item) { var on = S.onMap(save, x.item); return '<div class="fw' + (on ? '' : ' missing') + '"><span class="fw-thumb">' + A.thumb(IT.get(x.item).art, 44, 3) + '</span><span><b>' + esc(IT.name(save, x.item)) + '</b><small>' + (on ? 'on your map' : 'not on your map yet') + '</small></span></div>'; }
      var mm = ix.byId[x.answer], r = save.missions[x.answer]; if (!mm) return '';
      var said = r && r.explain && r.explain.c ? '\u201c' + esc(r.explain.c.slice(0, 90)) + (r.explain.c.length > 90 ? '\u2026' : '') + '\u201d' : (r && r.done ? 'finished' : 'not finished yet');
      return '<div class="fw answer"><span class="fw-thumb">' + A.icon('star', 30) + '</span><span><b>' + esc(mm.title) + '</b><small>You said: ' + said + '</small></span></div>';
    }).join('') + '</div></div>';
  }
  function vocabHtml(m) {
    if (!m.vocab || !m.vocab.length) return '';
    return '<div class="vocab"><h4>Word bank</h4>' + m.vocab.map(function (v) { return '<div class="vcard"><span class="vdef">' + esc(v.def) + '</span><span class="vterm">Science word: <b>' + esc(v.term) + '</b></span></div>'; }).join('') + '</div>';
  }

  // Build the task queue for a mission: pre steps, main task, follow-ups, post steps. Shared with the demo/tests.
  MS.units = function (m) {
    var steps = (m.steps || []).filter(function (st) { return st.task; }), out = [];
    function stepUnit(st) { return { kind: 'step', id: 'step:' + st.id, title: st.title, prompt: st.prompt, task: st.task, key: st.answerKey, feedback: st.feedback || {}, teks: st.teks || [] }; }
    steps.filter(function (st) { return !st.post; }).forEach(function (st) { out.push(stepUnit(st)); });
    out.push({ kind: 'main', id: 'main', title: (m.steps && m.steps.length) ? m.title : '', task: m.task, key: m.answerKey, feedback: m.feedback || {} });
    var fus = (m.task && m.task.followUps) || null, legacy = followOf(m);
    if (fus && fus.length) fus.forEach(function (f, i) { out.push({ kind: 'fu', id: 'fu:' + i, title: 'Follow-up', task: f, key: f.type === 'numeric' ? f : f.answerKey, feedback: { correct: 'Yes!', incorrect: f.hint || '' } }); });
    else if (legacy) out.push({ kind: 'fu', id: 'fu:0', legacy: true, title: 'Follow-up', task: { type: 'choice', question: legacy.question, options: legacy.options }, key: legacy.answerKey, feedback: { correct: 'Yes!', incorrect: 'Think about what you just did in the activity.' } });
    steps.filter(function (st) { return st.post; }).forEach(function (st) { out.push(stepUnit(st)); });
    return out;
  };
  MS.open = function (mid, opts) {
    opts = opts || {};
    var ix = app().ix(), m = ix.byId[mid]; if (!m) return;
    var save = app().save(), rec = save.missions[mid];
    if (rec && rec.done && !opts.redo && !opts.editExplain) return MS.revisit(mid);
    var st = stageOf(ix, m.stage), stepNames = ['Start', 'Activity', 'Explain', 'Challenge', 'Done'];
    var md = U.modal({ titleHtml: '<span class="stage-dot" style="background:' + st.color + '"></span>' + esc(m.title), wide: true, sticky: true });
    md.box.style.setProperty('--stage', st.color);
    var steps = U.el('ol', { class: 'steps' }, stepNames.map(function (s, k) { return '<li data-s="' + k + '">' + s + '</li>'; }).join(''));
    md.head.after(steps);
    var body = md.body, session = { tries: 0, hints: 0, revealed: false, firstTry: false, answer: null, followUp: null };
    function setStep(k) { U.$$('li', steps).forEach(function (li, n) { li.classList.toggle('on', n === k); li.classList.toggle('past', n < k); }); body.scrollTop = 0; }
    function meta() { return '<div class="m-meta"><span class="pill" style="background:' + st.color + '">Stage ' + m.stage + ': ' + esc(st.short || st.title) + '</span><span class="pill subj">' + esc(SUBJ[m.subject] || 'Science') + '</span>' + teksChips(m) + '</div>'; }

    function intro() {
      setStep(0);
      var prompt = MS.fill(m.prompt, save);
      body.innerHTML = meta() + '<div class="intro"><div class="intro-art">' + A.thumb(IT.get(m.unlockItem).art, 150, 5) + '</div><div class="intro-text"><p class="lead">' + esc(prompt) + '</p></div></div>' + fromWorld(m, save, ix) + vocabHtml(m) + '<div class="btn-row"><button class="btn primary big go" autofocus>Start the activity \u2192</button></div>';
      U.$('.intro-text', body).prepend(U.speakBtn(function () { return window.DAW_NARR.intro(m, function (t) { return MS.fill(t, save); }); }));
      U.$('.go', body).onclick = activity;
    }
    // Task queue: School Bot "steps" before the main task, the main task, its follow-up questions, then "post" steps.
    var units = MS.units(m), uix = 0;
    session.parts = (rec && rec.parts && opts.redo) ? JSON.parse(JSON.stringify(rec.parts)) : {};
    function activity() { runUnit(0); }
    function next(k) { if (k < units.length) runUnit(k); else explain(); }
    function runUnit(k) {
      setStep(1); uix = k;
      var u = units[k], task = u.task, key = u.key, fbk = u.feedback || {}, q = MS.fill(task.question || '', save), main = u.kind === 'main', tries = 0, realTries = 0, lastA = null, shown = false, hintN = 0;
      var progress = units.length > 1 ? '<div class="part-of"><b>Part ' + (k + 1) + ' of ' + units.length + '</b>' + (u.title ? ': ' + esc(u.title) : '') + '</div>' : '';
      var lead = u.prompt ? '<p class="lead step-prompt">' + esc(MS.fill(u.prompt, save)) + '</p>' : '';
      var diag = task.diagramText ? '<div class="scene">' + esc(task.diagramText) + '</div>' : '';
      body.innerHTML = meta() + progress + lead + diag + '<div class="q"><h3>' + esc(q) + '</h3></div><div class="task-host" data-type="' + esc(task.type) + '" data-unit="' + esc(u.id) + '"></div><div class="feedback" aria-live="polite"></div><div class="btn-row"><button class="btn ghost hint">Hint</button><button class="btn ghost reveal" hidden>Show me</button><button class="btn primary check">Check my answer</button></div>';
      U.$('.q', body).prepend(U.speakBtn(window.DAW_NARR.unit(u, function (t) { return MS.fill(t, save); })));
      var r = (T.r[task.type] || T.r.write)(U.$('.task-host', body), task, m, { onWrite: function (a) { if (main) autosaveWriting(a); } });
      if (main && rec && rec.answer != null && opts.redo) r.set(rec.answer);
      else if (!main && session.parts[u.id] != null && opts.redo) r.set(session.parts[u.id]);
      if (main && (task.type === 'write' || task.type === 'writing') && save.writing['m:' + m.id]) r.set(save.writing['m:' + m.id]);
      var fb = U.$('.feedback', body), hints = fbk.hints || [];
      U.$('.hint', body).onclick = function () {
        if (!hints.length) { fb.innerHTML = '<div class="fb hint-fb">' + esc(fbk.incorrect || (u.kind === 'fu' ? 'Think about what you just did in the activity.' : 'Read the question again.')) + '</div>'; return; }
        var h = hints[Math.min(hintN, hints.length - 1)]; hintN++; if (main) session.hints++; fb.innerHTML = '<div class="fb hint-fb">' + A.icon('star', 16) + ' <b>Hint:</b> ' + esc(h) + '</div>';
      };
      U.$('.reveal', body).onclick = function () { shown = true; if (main) session.revealed = true; r.reveal(key); fb.innerHTML = '<div class="fb">Here is a correct answer. Study it, then press <b>Check my answer</b>.</div>'; };
      U.$('.check', body).onclick = function () {
        var a = r.get(), res = window.DAW_CHECK.check(task, key, a); tries++; var aj = JSON.stringify(a); if (aj !== lastA || !res.ok) realTries++; lastA = aj; if (main) session.tries++; // every Check on a changed OR wrong state counts
        if (res.ok) {
          if (main) { if (session.tries === 1 && !session.revealed && !session.hints) session.firstTry = true; session.answer = a; }
          else { session.parts[u.id] = a; if (u.kind === 'fu' && u.legacy) session.followUp = a; }
          r.mark(key);
          fb.innerHTML = '<div class="fb good">' + A.icon('check', 20) + ' <b>' + esc(fbk.correct || (main ? 'Correct!' : 'Yes!')) + '</b></div>';
          if (main) fb.insertAdjacentHTML('beforeend', extras(m));
          else if (task.explain || task.work) fb.insertAdjacentHTML('beforeend', '<div class="worked"><b>Why:</b> ' + esc(task.explain || task.work) + '</div>');
          U.$$('.show-ans', fb).forEach(function (b) { b.onclick = function () { b.nextElementSibling.hidden = false; b.remove(); }; });
          var last = k === units.length - 1, btns = U.$('.btn-row', body);
          btns.innerHTML = '<button class="btn primary next" autofocus>' + (last ? 'Next: explain it \u2192' : 'Next \u2192') + '</button>'; U.$('.next', body).onclick = function () { next(k + 1); }; U.$('.next', body).focus();
          if (main && (task.type === 'write' || task.type === 'writing')) autosaveWriting(a, true);
        } else {
          if (tries >= 2) r.mark(key);
          fb.innerHTML = '<div class="fb bad"><b>' + (main ? 'Not yet.' : 'Try again.') + '</b> ' + esc(res.detail || '') + ' ' + esc(fbk.incorrect || '') + '</div>';
          var GCm = window.DAW_GC, md0 = GCm ? GCm.modeOf(save) : 'support';
          if (md0 !== 'support' && !U.$('.my-try', body)) { fb.insertAdjacentHTML('afterend', '<label class="my-try"><b>Show your thinking</b> <small>(write what you tried and why, in your own words)</small><textarea rows="2" class="my-try-t"></textarea></label>'); U.$('.my-try-t', body).oninput = function () { if (GCm.revealReady(md0, tries, main ? 3 : 2, this.value, { realTries: realTries, task: q + ' ' + (m.prompt || '') + ' ' + (task.questions || []).map(function (x) { return x.text || ''; }).join(' ') + ' ' + (fbk.incorrect || '') + ' ' + ((U.$('.task-host', body) || {}).textContent || '') })) U.$('.reveal', body).hidden = false; }; }
          if (GCm ? GCm.revealReady(md0, tries, main ? 3 : 2, U.$('.my-try-t', body) ? U.$('.my-try-t', body).value : '', { realTries: realTries, task: q + ' ' + (m.prompt || '') + ' ' + (task.questions || []).map(function (x) { return x.text || ''; }).join(' ') + ' ' + (fbk.incorrect || '') + ' ' + ((U.$('.task-host', body) || {}).textContent || '') }) : tries >= (main ? 3 : 2)) U.$('.reveal', body).hidden = false;
        }
      };
    }
    function extras(m) {
      var k = m.answerKey || {}, t = m.task, o = '';
      if (m.worked) o += '<div class="worked"><b>How to solve it</b>' + (typeof m.worked === 'string' ? '<p>' + esc(m.worked) + '</p>' : '<ul>' + Object.keys(m.worked).map(function (q) { var v = m.worked[q]; return '<li>' + esc(typeof v === 'string' ? v : JSON.stringify(v)) + '</li>'; }).join('') + '</ul>') + '</div>';
      if (k.model) o += '<div class="worked"><b>Compare with a model answer:</b> ' + esc(k.model) + '</div>';
      if (k.ideas && k.ideas.length) o += '<div class="worked"><b>Ideas that work:</b><ul>' + k.ideas.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div>';
      if (t.bonus) o += '<div class="worked bonus"><b>Bonus:</b> ' + esc(t.bonus.question) + ' <button type="button" class="btn small ghost show-ans">Show answer</button><span hidden> <b>' + esc(t.bonus.answer) + '</b> ' + esc(t.bonus.work || '') + '</span></div>';
      return o;
    }
    function autosaveWriting(a, final) {
      if (!a) return; var t = m.task;
      S.saveWriting(save, 'm:' + m.id, { title: m.title, genre: t.genre || 'response', mission: m.id, prompt: t.question || '', text: a.text, checks: a.checks });
      app().commit(final ? 'writing' : null, { quiet: true, noRender: true });
    }
    function explain() {
      setStep(2);
      var prev = (rec && rec.explain) || { c: '', e: '', r: '' }, ep = MS.fill(m.explainPrompt || 'Explain what you learned.', save);
      var ek = m.explainKeywords, kw = (Array.isArray(ek) ? ek : (ek && ek.keywords) || []).filter(Boolean), kwNeed = Math.min(kw.length, (ek && !Array.isArray(ek) && +ek.required) || 1), kwNote = false;
      var kwHtml = kw.length ? '<p class="small kw-hint">Words that make a strong explanation: ' + kw.map(function (w) { return '<b>' + esc(w) + '</b>'; }).join(', ') + '.</p>' : '';
      var reasonHints = m.answerKey && m.answerKey.reasoningMustInclude ? '<p class="small">Your reasoning should talk about: ' + m.answerKey.reasoningMustInclude.map(esc).join('; ') + '.</p>' : '';
      body.innerHTML = meta() + '<div class="q"><h3>Explain it: Claim, Evidence, Reasoning</h3><p>' + esc(ep) + '</p>' + reasonHints + '</div>' +
        '<div class="cer-write"><label><span class="cer-tag c">C</span> <b>Claim</b>: What is true? <textarea data-f="c" rows="2" placeholder="I claim that...">' + esc(prev.c) + '</textarea></label>' +
        '<label><span class="cer-tag e">E</span> <b>Evidence</b>: What did you see or find out? <textarea data-f="e" rows="3" placeholder="My evidence is...">' + esc(prev.e) + '</textarea></label>' +
        '<label><span class="cer-tag r">R</span> <b>Reasoning</b>: Why does your evidence prove your claim? Use a science word. <textarea data-f="r" rows="3" placeholder="This shows... because...">' + esc(prev.r) + '</textarea></label></div>' +
        '<div class="write-meta"><span class="wc">0 words</span> <span class="need">Write at least 12 words in all.</span></div><div class="feedback"></div>' +
        '<div class="btn-row">' + (opts.editExplain ? '<button class="btn ghost cancel">Cancel</button>' : '') + '<button class="btn primary next">' + (opts.editExplain ? 'Save my changes' : 'Next \u2192') + '</button></div>';
      U.$('.q', body).prepend(U.speakBtn(window.DAW_NARR.explain(m, function (t) { return MS.fill(t, save); })));
      var tas = U.$$('textarea', body), wc = U.$('.wc', body);
      function cur() { var o = {}; tas.forEach(function (t) { o[t.getAttribute('data-f')] = t.value.trim(); }); return o; }
      function count() { var c = cur(), n = U.words(c.c + ' ' + c.e + ' ' + c.r); wc.textContent = n + ' words'; wc.classList.toggle('met', n >= 12); return n; }
      tas.forEach(function (t) { t.addEventListener('input', count); }); count(); setTimeout(function () { if (tas.indexOf(document.activeElement) < 0) tas[0].focus(); }, 50);
      if (U.$('.cancel', body)) U.$('.cancel', body).onclick = md.close;
      U.$('.next', body).onclick = function () {
        var c = cur();
        if (count() < 12 || !c.c || !c.e || !c.r) { U.$('.feedback', body).innerHTML = '<div class="fb bad">Fill in all three parts (claim, evidence, reasoning) with at least 12 words in all.</div>'; return; }
        if (kw.length && !kwNote && !opts.editExplain) { var all = (c.c + ' ' + c.e + ' ' + c.r).toLowerCase(), used = kw.filter(function (w) { return all.indexOf(String(w).toLowerCase()) >= 0; });
          if (used.length < kwNeed) { kwNote = true; U.$('.feedback', body).innerHTML = '<div class="fb hint-fb">' + A.icon('star', 16) + ' Tip: try using ' + (kwNeed > 1 ? kwNeed + ' of' : 'one of') + ' these words: ' + kw.map(esc).join(', ') + '. Add one, or press <b>Next</b> again to keep going.</div>'; return; } }
        session.explain = c;
        if (opts.editExplain) { S.updateExplanation(save, ix, m.id, c, null); app().commit('Explanation updated: ' + m.title); md.close(); U.toast('Explanation saved. Your tracker is up to date.', 'good'); return; }
        gt();
      };
    }
    function gt() {
      setStep(3);
      var prevGt = (rec && rec.gt) || '';
      body.innerHTML = meta() + '<div class="gt-box"><div class="gt-badge">' + A.icon('star', 22) + ' GT Challenge (optional, +50 XP)</div><p class="lead">' + esc(MS.fill(m.gtExtension || 'Think deeper: how could you improve your world using what you learned?', save)) + '</p><textarea rows="5" class="gt-text" placeholder="Think deeper here...">' + esc(prevGt) + '</textarea></div><div class="btn-row"><button class="btn ghost skip">Skip for now</button><button class="btn primary next">Save and finish \u2192</button></div>';
      U.$('.gt-box', body).prepend(U.speakBtn(m.gtExtension || ''));
      U.$('.skip', body).onclick = function () { finish(''); };
      U.$('.next', body).onclick = function () { finish(U.$('.gt-text', body).value.trim()); };
    }
    function finish(gtText) {
      var before = S.badges(save, ix), stBefore = S.highestUnlocked(save, ix, { unlockAll: app().unlockAll() });
      var xp = session.revealed ? 40 : Math.max(60, 100 + (session.firstTry ? 50 : 0) - session.hints * 10 - Math.max(0, session.tries - 1) * 10);
      if (gtText && U.words(gtText) >= 8) xp += 50;
      var out = S.completeMission(save, ix, m.id, { answer: session.answer, followUp: session.followUp, parts: session.parts, explain: session.explain, gt: gtText, firstTry: session.firstTry, revealed: session.revealed, xp: xp });
      var newB = S.badges(save, ix).filter(function (b) { return before.indexOf(b) < 0; });
      app().commit('Finished: ' + m.title);
      done(xp, newB, out, stBefore);
    }
    function done(xp, newB, out, stBefore) {
      setStep(4);
      var item = m.unlockItem, needDesc = !!(window.DAW_DESCUI && window.DAW_DESCUI.needsFor(save, item)), stNow = S.highestUnlocked(save, ix, { unlockAll: app().unlockAll() });
      body.innerHTML = '<div class="m-done"><div class="burst">' + A.thumb(IT.get(item).art, 170, 5) + '</div><h3>Mission complete!</h3><p class="xp-earned">+' + xp + ' XP</p>' +
        (newB.length ? '<div class="new-badges">' + newB.map(function (b) { var d = S.BADGES.filter(function (x) { return x.id === b; })[0]; return '<div class="badge-card earned">' + A.icon('star', 28) + '<b>' + esc(d.name) + '</b><small>' + esc(d.desc) + '</small></div>'; }).join('') + '</div>' : '') +
        (out.stageCompleted ? '<div class="stage-done">' + A.icon('flag', 22) + ' <b>Stage ' + out.stageCompleted + ' complete!</b> A checkpoint named \u201c' + esc(out.checkpoint.name) + '\u201d was saved.' + (stNow !== stBefore ? ' <b>Stage ' + stNow + ' is now unlocked</b> and your map got bigger!' : '') + '</div>' : '') +
        '<label class="name-it">Give this place a name on your map: <input type="text" maxlength="24" value="' + esc(save.names[item] || '') + '" placeholder="' + esc(IT.get(item).name) + '"></label>' +
        (needDesc ? '<div class="fg-box needs">\u270e <b>One more step:</b> scientists describe what they find. Your ' + esc(IT.name(save, item)) + ' (' + esc(window.DAW_DESCUI.thingFor(item).def.name.toLowerCase()) + ') counts as placed after you describe its science in your Field Guide.</div>' : '') +
        '<div class="btn-row">' + (needDesc ? '<button class="btn ghost back">Later</button><button class="btn primary big describe-now" autofocus>Field Guide: describe the ' + esc(window.DAW_DESCUI.thingFor(item).def.name) + ' \u2192</button>' : '<button class="btn primary big back" autofocus>Back to my world</button>') + '</div></div>';
      function keepName() { var v = U.$('.name-it input', body).value.trim(); if (v && v !== save.names[item]) { S.renameItem(save, item, v); app().commit('Named ' + v); } }
      U.$('.back', body).onclick = function () { keepName(); md.close(); if (needDesc) U.toast(IT.name(save, item) + ' still needs a description (\u270e on the map).', 'warn', 3500); if (out.stageCompleted) app().celebrateStage(out.stageCompleted); };
      if (needDesc) U.$('.describe-now', body).onclick = function () { keepName(); md.close(); window.DAW_DESCUI.openItem(item, { onClose: function () { if (out.stageCompleted) app().celebrateStage(out.stageCompleted); } }); };
    }
    if (opts.editExplain) explain(); else if (opts.redo) activity(); else intro();
    return md;
  };

  MS.revisit = function (mid) {
    var ix = app().ix(), m = ix.byId[mid], save = app().save(), r = save.missions[mid], st = stageOf(ix, m.stage);
    var reasons = S.reviewReasons(save, ix, m, function (id) { return IT.name(save, id); });
    var md = U.modal({ titleHtml: '<span class="stage-dot" style="background:' + st.color + '"></span>' + esc(m.title) + ' <span class="done-tag">' + A.icon('check', 16) + ' Done</span>', wide: true });
    var deps = S.dependents(save, ix, m.unlockItem).length;
    md.body.innerHTML = '<div class="m-meta"><span class="pill" style="background:' + st.color + '">Stage ' + m.stage + '</span>' + teksChips(m) + '<span class="small">Finished ' + esc(U.fmtTime(r.completedAt)) + (r.rev > 1 ? ' \u00b7 updated ' + esc(U.fmtTime(r.updatedAt)) + ' (version ' + r.rev + ')' : '') + ' \u00b7 ' + r.xp + ' XP</span></div>' +
      (reasons.length ? '<div class="review-box"><b>' + A.icon('flag', 16) + ' Needs review</b><ul>' + reasons.map(function (x) { return '<li>' + esc(x.text) + '</li>'; }).join('') + '</ul><p class="small">Nothing was deleted. Read your explanation below. Edit it if it no longer fits, or mark it reviewed.</p></div>' : '') +
      '<div class="cer-show"><p><span class="cer-tag c">C</span> ' + esc(r.explain.c) + '</p><p><span class="cer-tag e">E</span> ' + esc(r.explain.e) + '</p><p><span class="cer-tag r">R</span> ' + esc(r.explain.r) + '</p>' + (r.gt ? '<p><span class="cer-tag gt">GT</span> ' + esc(r.gt) + '</p>' : '') + '</div>' +
      '<p class="small">Changing an answer updates only this mission. Your later stages stay safe.' + (deps ? ' ' + deps + ' later mission(s) use this place and will be asked to double-check.' : '') + '</p>' +
      '<div class="btn-row">' + (reasons.length ? '<button class="btn ghost ok">Mark reviewed (it still fits)</button>' : '') + '<button class="btn ghost redo">Redo the activity</button><button class="btn primary edit">Edit my explanation</button></div>';
    if (U.$('.ok', md.body)) U.$('.ok', md.body).onclick = function () { S.markReviewed(save, ix, mid); app().commit('Reviewed: ' + m.title); md.close(); U.toast('Marked as reviewed.', 'good'); };
    U.$('.redo', md.body).onclick = function () { md.close(); MS.open(mid, { redo: true }); };
    U.$('.edit', md.body).onclick = function () { md.close(); MS.open(mid, { editExplain: true }); };
  };
})();
