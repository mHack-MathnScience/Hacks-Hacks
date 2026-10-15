/* Design a World: task renderers part 1 (choice, multi, sort, match, label, order, cer, write).
   Every renderer returns {get(), set(answer), mark(key), reveal(key)} and works by tap OR drag. */
(function () {
  'use strict';
  var U = window.DAW_UI, esc = U.esc;
  var T = window.DAW_TASKS = { r: {} };

  // ---- shared tap-or-drag "pick and place" ----
  T.pickPlace = function (root, onChange) {
    var sel = null;
    function cap(t) { return +(t.getAttribute('data-cap') || 999); }
    function chipsIn(t) { return U.$$('.chip', t); }
    function select(c) { if (sel) sel.classList.remove('selected'); sel = c === sel ? null : c; if (sel) sel.classList.add('selected'); root.classList.toggle('picking', !!sel); }
    function move(c, t) {
      if (!c || !t || c.parentNode === t) { select(null); return; }
      var pool = U.$('.pool', root), from = c.parentNode;
      if (chipsIn(t).length >= cap(t)) { var out = chipsIn(t)[0]; (from && from !== pool && from.classList.contains('drop') ? from : pool).appendChild(out); }
      t.appendChild(c); c.classList.remove('selected'); sel = null; root.classList.remove('picking'); U.$$('.drop,.pool', root).forEach(function (d) { d.classList.remove('right', 'wrong'); }); U.$$('.chip', root).forEach(function (d) { d.classList.remove('right', 'wrong'); });
      onChange && onChange();
    }
    root.addEventListener('click', function (e) {
      var c = e.target.closest('.chip'), t = e.target.closest('.drop,.pool');
      if (c && root.contains(c)) { if (sel && sel !== c && c.parentNode !== U.$('.pool', root) && c.parentNode.classList.contains('drop') && sel.parentNode !== c.parentNode) { move(sel, c.parentNode); return; } select(c); return; }
      if (t && sel) move(sel, t);
    });
    root.addEventListener('keydown', function (e) { if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('.drop,.pool') && sel) { e.preventDefault(); move(sel, e.target); } });
    root.addEventListener('dragstart', function (e) { var c = e.target.closest('.chip'); if (!c) return; sel = c; c.classList.add('dragging'); try { e.dataTransfer.setData('text/plain', 'chip'); e.dataTransfer.effectAllowed = 'move'; } catch (x) {} });
    root.addEventListener('dragend', function (e) { var c = e.target.closest('.chip'); if (c) c.classList.remove('dragging'); U.$$('.over', root).forEach(function (d) { d.classList.remove('over'); }); });
    root.addEventListener('dragover', function (e) { var t = e.target.closest('.drop,.pool'); if (t && sel) { e.preventDefault(); t.classList.add('over'); } });
    root.addEventListener('dragleave', function (e) { var t = e.target.closest('.drop,.pool'); if (t) t.classList.remove('over'); });
    root.addEventListener('drop', function (e) { var t = e.target.closest('.drop,.pool'); if (t && sel) { e.preventDefault(); t.classList.remove('over'); move(sel, t); } });
    return { move: move };
  };
  function chip(v, html, extra) { return '<button type="button" class="chip' + (extra ? ' ' + extra : '') + '" draggable="true" data-v="' + v + '">' + html + '</button>'; }
  T.chip = chip;
  function opt(t) { return typeof t === 'string' ? t : (t && (t.text || t.name || t.label)) || ''; }
  T.opt = opt;

  // ---- choice / multi ----
  function choices(host, task, m, multi) {
    var order = U.seedShuffle(task.options, m.id).sort(function (a, b) { return a - b; }); // keep author order for choice lists (they are often numeric)
    host.innerHTML = '<div class="options' + (multi ? ' multi' : '') + '" role="' + (multi ? 'group' : 'radiogroup') + '">' + order.map(function (k) {
      return '<button type="button" class="option" role="' + (multi ? 'checkbox' : 'radio') + '" aria-checked="false" data-k="' + k + '"><span class="box"></span><span>' + esc(opt(task.options[k])) + '</span></button>';
    }).join('') + '</div>' + (multi ? '<p class="hint-line">Pick <b>all</b> that are true.</p>' : '');
    var box = U.$('.options', host);
    box.addEventListener('click', function (e) {
      var b = e.target.closest('.option'); if (!b) return;
      if (!multi) U.$$('.option', box).forEach(function (o) { o.setAttribute('aria-checked', 'false'); });
      b.setAttribute('aria-checked', multi ? String(b.getAttribute('aria-checked') !== 'true') : 'true');
      U.$$('.option', box).forEach(function (o) { o.classList.remove('right', 'wrong'); });
    });
    var api = {
      get: function () { var on = U.$$('.option[aria-checked=true]', box).map(function (o) { return +o.getAttribute('data-k'); }); return multi ? on.sort() : (on.length ? on[0] : null); },
      set: function (a) { U.$$('.option', box).forEach(function (o) { var k = +o.getAttribute('data-k'); o.setAttribute('aria-checked', String(multi ? (a || []).indexOf(k) >= 0 : a === k)); }); },
      mark: function (key) { U.$$('.option[aria-checked=true]', box).forEach(function (o) { var k = +o.getAttribute('data-k'), ok = multi ? key.indexOf(k) >= 0 : key === k; o.classList.add(ok ? 'right' : 'wrong'); }); },
      reveal: function (key) { api.set(key); api.mark(key); }
    };
    return api;
  }
  T.r.choice = function (h, t, m) { return choices(h, t, m, false); };
  T.r.multi = function (h, t, m) { return choices(h, t, m, true); };

  // ---- sort ----
  T.r.sort = function (host, task, m) {
    var ord = U.seedShuffle(task.items, m.id);
    host.innerHTML = '<div class="pp sort"><div class="pool" tabindex="0" aria-label="Cards to sort">' + ord.map(function (k) { return chip(k, esc(opt(task.items[k]))); }).join('') + '</div>' +
      '<div class="bins">' + task.bins.map(function (b, k) { return '<div class="bin"><div class="bin-title">' + esc(opt(b)) + '</div><div class="drop" tabindex="0" data-bin="' + k + '" aria-label="' + esc(opt(b)) + '"></div></div>'; }).join('') + '</div>' +
      '<p class="hint-line">Tap a card, then tap a group. You can also drag.</p></div>';
    var root = U.$('.pp', host); T.pickPlace(root);
    function chipEl(k) { return U.$('.chip[data-v="' + k + '"]', root); }
    var api = {
      get: function () { return task.items.map(function (x, k) { var p = chipEl(k).parentNode; return p.hasAttribute('data-bin') ? +p.getAttribute('data-bin') : null; }); },
      set: function (a) { (a || []).forEach(function (b, k) { if (b != null && b >= 0) U.$('.drop[data-bin="' + b + '"]', root).appendChild(chipEl(k)); }); },
      mark: function (key) { task.items.forEach(function (x, k) { var c = chipEl(k), p = c.parentNode; if (p.hasAttribute('data-bin')) c.classList.add(+p.getAttribute('data-bin') === key[k] ? 'right' : 'wrong'); }); },
      reveal: function (key) { api.set(key); api.mark(key); }
    };
    return api;
  };

  // ---- match / label ----
  T.r.match = function (host, task, m) {
    var left = task.left || [], right = task.right || [], ord = U.seedShuffle(right, m.id + 'r');
    var diagram = task.diagramText ? '<figure class="diagram-card">' + (window.DAW_ART.diagram && window.DAW_ART.diagram.forText ? window.DAW_ART.diagram.forText(task.diagramText) : '') + '<figcaption>' + window.DAW_ART.icon('flag', 16) + ' ' + esc(task.diagramText) + '</figcaption></figure>' : '';
    host.innerHTML = diagram + '<div class="pp match"><div class="pairs">' + left.map(function (l, k) {
      return '<div class="pair"><div class="left"><span class="num">' + (task.type === 'label' ? String.fromCharCode(65 + k) : k + 1) + '</span>' + esc(opt(l)) + '</div><div class="arrow">\u2192</div><div class="drop" data-cap="1" tabindex="0" data-row="' + k + '" aria-label="Answer for ' + esc(opt(l)) + '"></div></div>';
    }).join('') + '</div><div class="pool" tabindex="0" aria-label="Answers">' + ord.map(function (k) { return chip(k, esc(opt(right[k]))); }).join('') + '</div><p class="hint-line">Tap an answer card, then tap the empty box it matches. You can also drag.</p></div>';
    var root = U.$('.pp', host); T.pickPlace(root);
    function chipEl(k) { return U.$('.chip[data-v="' + k + '"]', root); }
    var api = {
      get: function () { return left.map(function (x, k) { var c = U.$('.drop[data-row="' + k + '"] .chip', root); return c ? +c.getAttribute('data-v') : null; }); },
      set: function (a) { (a || []).forEach(function (v, k) { if (v != null && chipEl(v)) U.$('.drop[data-row="' + k + '"]', root).appendChild(chipEl(v)); }); },
      mark: function (key) { left.forEach(function (x, k) { var c = U.$('.drop[data-row="' + k + '"] .chip', root); if (c) c.classList.add(+c.getAttribute('data-v') === key[k] ? 'right' : 'wrong'); }); },
      reveal: function (key) { U.$$('.chip', root).forEach(function (c) { U.$('.pool', root).appendChild(c); }); api.set(key); api.mark(key); }
    };
    return api;
  };
  T.r.label = T.r.match;

  // ---- order ----
  T.r.order = function (host, task, m) {
    var ord = U.seedShuffle(task.items, m.id + 'o');
    host.innerHTML = '<ol class="order-list">' + ord.map(function (k) { return '<li class="order-item" draggable="true" data-v="' + k + '"><span class="grip" aria-hidden="true">\u2630</span><span class="txt">' + esc(opt(task.items[k])) + '</span><span class="mv"><button type="button" class="icon-btn up" aria-label="Move up">\u25b2</button><button type="button" class="icon-btn down" aria-label="Move down">\u25bc</button></span></li>'; }).join('') + '</ol><p class="hint-line">Use the arrows, or drag a step, to put them in order (first at the top).</p>';
    var list = U.$('.order-list', host), dragEl = null;
    function clear() { U.$$('.order-item', list).forEach(function (li) { li.classList.remove('right', 'wrong'); }); }
    list.addEventListener('click', function (e) {
      var li = e.target.closest('.order-item'); if (!li) return;
      if (e.target.closest('.up') && li.previousElementSibling) list.insertBefore(li, li.previousElementSibling);
      if (e.target.closest('.down') && li.nextElementSibling) list.insertBefore(li.nextElementSibling, li);
      clear(); (e.target.closest('button') || li).focus();
    });
    list.addEventListener('dragstart', function (e) { dragEl = e.target.closest('.order-item'); if (dragEl) { dragEl.classList.add('dragging'); try { e.dataTransfer.setData('text/plain', 'o'); } catch (x) {} } });
    list.addEventListener('dragend', function () { if (dragEl) dragEl.classList.remove('dragging'); dragEl = null; clear(); });
    list.addEventListener('dragover', function (e) {
      if (!dragEl) return; e.preventDefault(); var li = e.target.closest('.order-item'); if (!li || li === dragEl) return;
      var r = li.getBoundingClientRect(); list.insertBefore(dragEl, e.clientY < r.top + r.height / 2 ? li : li.nextElementSibling);
    });
    var api = {
      get: function () { return U.$$('.order-item', list).map(function (li) { return +li.getAttribute('data-v'); }); },
      set: function (a) { (a || []).forEach(function (v) { var li = U.$('.order-item[data-v="' + v + '"]', list); if (li) list.appendChild(li); }); },
      mark: function (key) { U.$$('.order-item', list).forEach(function (li, k) { li.classList.add(+li.getAttribute('data-v') === key[k] ? 'right' : 'wrong'); }); },
      reveal: function (key) { api.set(key); api.mark(key); }
    };
    return api;
  };

  // ---- cer (pick claim + evidence; reasoning is written in the Explain step) ----
  T.r.cer = function (host, task, m) {
    var claims = task.claims || [], ev = task.evidence || [];
    host.innerHTML = '<div class="cer-pick"><h4><span class="cer-tag c">C</span> Pick the best claim</h4><div class="options claims" role="radiogroup">' + claims.map(function (c, k) { return '<button type="button" class="option" role="radio" aria-checked="false" data-k="' + k + '"><span class="box"></span><span>' + esc(opt(c)) + '</span></button>'; }).join('') + '</div>' +
      '<h4><span class="cer-tag e">E</span> Pick <b>all</b> the evidence that supports YOUR claim</h4><div class="options multi evid" role="group">' + ev.map(function (c, k) { return '<button type="button" class="option" role="checkbox" aria-checked="false" data-k="' + k + '"><span class="box"></span><span>' + esc(opt(c)) + '</span></button>'; }).join('') + '</div>' +
      '<p class="hint-line"><span class="cer-tag r">R</span> You will write your reasoning next.</p></div>';
    var cl = U.$('.claims', host), evb = U.$('.evid', host);
    host.addEventListener('click', function (e) {
      var b = e.target.closest('.option'); if (!b) return;
      if (b.parentNode === cl) U.$$('.option', cl).forEach(function (o) { o.setAttribute('aria-checked', 'false'); });
      b.setAttribute('aria-checked', b.parentNode === cl ? 'true' : String(b.getAttribute('aria-checked') !== 'true'));
      U.$$('.option', host).forEach(function (o) { o.classList.remove('right', 'wrong'); });
    });
    function sel(box) { return U.$$('.option[aria-checked=true]', box).map(function (o) { return +o.getAttribute('data-k'); }); }
    function ok(key, c) { return key.claims ? key.claims.indexOf(c) >= 0 : key.claim === c; }
    function sup(key, c) { return key.claims ? (key.evidenceFor[String(c)] || []) : key.evidence; }
    var api = {
      get: function () { return { claim: sel(cl).length ? sel(cl)[0] : null, evidence: sel(evb).sort() }; },
      set: function (a) { a = a || {}; U.$$('.option', cl).forEach(function (o) { o.setAttribute('aria-checked', String(+o.getAttribute('data-k') === a.claim)); }); U.$$('.option', evb).forEach(function (o) { o.setAttribute('aria-checked', String((a.evidence || []).indexOf(+o.getAttribute('data-k')) >= 0)); }); },
      mark: function (key) { var a = api.get(); U.$$('.option[aria-checked=true]', cl).forEach(function (o) { o.classList.add(ok(key, a.claim) ? 'right' : 'wrong'); }); if (ok(key, a.claim)) U.$$('.option[aria-checked=true]', evb).forEach(function (o) { o.classList.add(sup(key, a.claim).indexOf(+o.getAttribute('data-k')) >= 0 ? 'right' : 'wrong'); }); },
      reveal: function (key) { var c = key.claims ? key.claims[0] : key.claim; api.set({ claim: c, evidence: sup(key, c) }); api.mark(key); }
    };
    return api;
  };

  // ---- write / writing ----
  T.r.write = function (host, task, m, ctx) {
    var cl = task.checklist || [], need = task.minWords || 40;
    host.innerHTML = '<div class="write-task">' + (task.genre ? '<div class="genre-tag">' + esc(task.genre) + '</div>' : '') +
      '<textarea class="writer" rows="9" aria-label="Your writing" placeholder="' + esc(task.starter || 'Start writing here...') + '"></textarea>' +
      '<div class="write-meta"><span class="wc">0 words</span> <span class="need">Goal: ' + need + '+ words</span></div>' +
      (cl.length ? '<div class="checklist"><h4>Checklist: check each one when your writing does it</h4>' + cl.map(function (c, k) { return '<label class="cbx"><input type="checkbox" data-k="' + k + '"> <span>' + esc(opt(c)) + '</span></label>'; }).join('') + '</div>' : '') + '</div>';
    var ta = U.$('.writer', host), wc = U.$('.wc', host);
    function upd() { var n = U.words(ta.value); wc.textContent = n + ' word' + (n === 1 ? '' : 's'); wc.classList.toggle('met', n >= need); if (ctx && ctx.onWrite) ctx.onWrite(api.get()); }
    ta.addEventListener('input', upd);
    host.addEventListener('change', function () { if (ctx && ctx.onWrite) ctx.onWrite(api.get()); });
    var api = {
      get: function () { return { text: ta.value, checks: U.$$('input[type=checkbox]', host).map(function (c) { return c.checked; }) }; },
      set: function (a) { if (!a) return; ta.value = a.text || ''; U.$$('input[type=checkbox]', host).forEach(function (c, k) { c.checked = !!(a.checks || [])[k]; }); upd(); },
      mark: function () {}, reveal: function () {}
    };
    return api;
  };
  T.r.writing = T.r.write;
})();
