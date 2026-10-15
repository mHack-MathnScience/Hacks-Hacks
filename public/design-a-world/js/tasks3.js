/* Design a World: task renderers part 3 (math & economics): coordinate, measure, chart, budget. */
(function () {
  'use strict';
  var U = window.DAW_UI, esc = U.esc, T = window.DAW_TASKS, CK = window.DAW_CHECK;
  var COLORS = ['#1e78c8', '#e8590c', '#2e8b57', '#7a4fb5'];
  function niceStep(max) { return max <= 16 ? 1 : max <= 40 ? 5 : 10; }
  function fmt(v) { return Math.round(v * 1000) / 1000; }

  // ---- coordinate: plot ordered pairs in the first quadrant ----
  T.r.coordinate = function (host, task, m) {
    var X = task.xMax || 10, Y = task.yMax || 10, sx = niceStep(X), sy = niceStep(Y), W = 440, H = 400, L = 46, B = 40, pw = W - L - 16, ph = H - B - 16;
    var pts = {}, sel = null, labels = task.targets.map(function (t) { return t.label; });
    function px(x) { return L + pw * x / X; } function py(y) { return H - B - ph * y / Y; }
    host.innerHTML = (task.rule ? '<p class="rule">Rule: <b>' + esc(task.rule) + '</b></p>' : '') + '<div class="coord-wrap"><svg viewBox="0 0 ' + W + ' ' + H + '" class="coord-svg" aria-label="Coordinate grid"></svg><div class="coord-side"><p class="small">1. Tap a label. 2. Tap the grid where it goes. Move <b>right</b> for x, then <b>up</b> for y.</p><div class="coord-chips">' +
      task.targets.map(function (t, k) { return '<button type="button" class="chip cchip" data-l="' + esc(t.label) + '"><span class="cdot" style="background:' + COLORS[k % 4] + '"></span>' + esc(t.label) + ' <b>(' + t.x + ', ' + t.y + ')</b></button>'; }).join('') + '</div><p class="coord-read small" aria-live="polite"></p></div></div>' +
      '<div class="coord-q">' + (task.qOptions || task.qOpen ? '<h4>Now use your grid to answer the question above.</h4>' : '') + (task.qOptions ? '<div class="options qopts">' + task.qOptions.map(function (o, k) { return '<button type="button" class="option" role="radio" aria-checked="false" data-k="' + k + '"><span class="box"></span><span>' + esc(o) + '</span></button>'; }).join('') + '</div>' : task.qOpen ? '<textarea class="qtext" rows="2" placeholder="Write your answer..."></textarea>' : '') + '</div>';
    var svg = U.$('.coord-svg', host);
    function draw(marks) {
      var o = ['<rect width="' + W + '" height="' + H + '" fill="#fff"/>'];
      for (var x = 0; x <= X; x += sx) o.push('<line x1="' + px(x) + '" y1="' + py(0) + '" x2="' + px(x) + '" y2="' + py(Y) + '" stroke="#dbe4ec"/><text x="' + px(x) + '" y="' + (py(0) + 16) + '" text-anchor="middle" font-size="11" fill="#13294B">' + x + '</text>');
      for (var y = 0; y <= Y; y += sy) o.push('<line x1="' + px(0) + '" y1="' + py(y) + '" x2="' + px(X) + '" y2="' + py(y) + '" stroke="#dbe4ec"/><text x="' + (px(0) - 8) + '" y="' + (py(y) + 4) + '" text-anchor="end" font-size="11" fill="#13294B">' + y + '</text>');
      o.push('<line x1="' + px(0) + '" y1="' + py(0) + '" x2="' + (px(X) + 8) + '" y2="' + py(0) + '" stroke="#13294B" stroke-width="2.5"/><line x1="' + px(0) + '" y1="' + py(0) + '" x2="' + px(0) + '" y2="' + (py(Y) - 8) + '" stroke="#13294B" stroke-width="2.5"/><text x="' + (px(X)) + '" y="' + (H - 6) + '" text-anchor="end" font-size="12" font-weight="700" fill="#13294B">x</text><text x="12" y="' + (py(Y) + 4) + '" font-size="12" font-weight="700" fill="#13294B">y</text><text x="' + (px(0) - 6) + '" y="' + (py(0) + 30) + '" font-size="10" fill="#5b6b7b">(0, 0)</text>');
      labels.forEach(function (l, k) { var p = pts[l]; if (!p) return; var mk = marks && marks[l]; o.push('<g><circle cx="' + px(p[0]) + '" cy="' + py(p[1]) + '" r="8" fill="' + COLORS[k % 4] + '" stroke="' + (mk === 'wrong' ? '#c92a2a' : mk === 'right' ? '#2fb36d' : '#fff') + '" stroke-width="3"/><text x="' + (p[0] > X * 0.65 ? px(p[0]) - 11 : px(p[0]) + 11) + '" text-anchor="' + (p[0] > X * 0.65 ? 'end' : 'start') + '" y="' + (py(p[1]) - 9) + '" font-size="11" font-weight="700" fill="#13294B">' + esc(l) + ' (' + p[0] + ', ' + p[1] + ')</text></g>'); });
      o.push('<rect class="hitarea" x="' + (L - 12) + '" y="4" width="' + (pw + 24) + '" height="' + (ph + 24) + '" fill="transparent"/>');
      svg.innerHTML = o.join('');
      U.$$('.cchip', host).forEach(function (c) { c.classList.toggle('placed', !!pts[c.getAttribute('data-l')]); });
    }
    host.addEventListener('click', function (e) {
      var c = e.target.closest('.cchip'); if (c) { U.$$('.cchip', host).forEach(function (x) { x.classList.remove('selected'); }); sel = c.getAttribute('data-l'); c.classList.add('selected'); return; }
      var o = e.target.closest('.qopts .option'); if (o) { U.$$('.qopts .option', host).forEach(function (x) { x.setAttribute('aria-checked', 'false'); x.classList.remove('right', 'wrong'); }); o.setAttribute('aria-checked', 'true'); }
    });
    svg.addEventListener('click', function (e) {
      if (!sel) { U.$('.coord-read', host).textContent = 'Tap a label first.'; return; }
      var r = svg.getBoundingClientRect(), vx = (e.clientX - r.left) * W / r.width, vy = (e.clientY - r.top) * H / r.height;
      var x = Math.max(0, Math.min(X, Math.round((vx - L) / pw * X / sx) * sx)), y = Math.max(0, Math.min(Y, Math.round((H - B - vy) / ph * Y / sy) * sy));
      pts[sel] = [x, y]; U.$('.coord-read', host).textContent = sel + ' plotted at (' + x + ', ' + y + ').'; draw();
    });
    var api = {
      get: function () { var a = { points: JSON.parse(JSON.stringify(pts)) }; var o = U.$('.qopts .option[aria-checked=true]', host); if (o) a.q = +o.getAttribute('data-k'); var t = U.$('.qtext', host); if (t) a.qText = t.value; return a; },
      set: function (a) { if (!a) return; pts = JSON.parse(JSON.stringify(a.points || {})); if (a.q != null) U.$$('.qopts .option', host).forEach(function (x) { x.setAttribute('aria-checked', String(+x.getAttribute('data-k') === a.q)); }); if (a.qText && U.$('.qtext', host)) U.$('.qtext', host).value = a.qText; draw(); },
      mark: function (key) { var mk = {}; labels.forEach(function (l) { if (pts[l]) mk[l] = pts[l][0] === key.points[l][0] && pts[l][1] === key.points[l][1] ? 'right' : 'wrong'; }); draw(mk); var o = U.$('.qopts .option[aria-checked=true]', host); if (o && key.q != null) o.classList.add(+o.getAttribute('data-k') === key.q ? 'right' : 'wrong'); },
      reveal: function (key) { api.set({ points: key.points, q: key.q, qText: key.model ? key.model : undefined }); api.mark(key); }
    };
    draw(); return api;
  };

  // ---- measure: area, perimeter, volume with units ----
  T.r.measure = function (host, task) {
    var d = task.dimensions || {}, u = task.units || 'units', l = d.length, w = d.width, h = d.height, pic;
    if (task.kind === 'volume') {
      var s = 150 / Math.max(l, w, h), A = l * s * 0.87, Bw = w * s * 0.5, Hh = h * s, ox = 60, oy = 40 + Bw;
      var p = function (x, y) { return x.toFixed(1) + ',' + y.toFixed(1); };
      pic = '<svg viewBox="-50 0 420 260" class="measure-svg"><polygon points="' + [p(ox, oy + Hh), p(ox + A, oy + Hh), p(ox + A, oy), p(ox, oy)].join(' ') + '" fill="#74c0fc" stroke="#13294B" stroke-width="2"/><polygon points="' + [p(ox, oy), p(ox + A, oy), p(ox + A + Bw, oy - Bw), p(ox + Bw, oy - Bw)].join(' ') + '" fill="#a5d8ff" stroke="#13294B" stroke-width="2"/><polygon points="' + [p(ox + A, oy + Hh), p(ox + A + Bw, oy + Hh - Bw), p(ox + A + Bw, oy - Bw), p(ox + A, oy)].join(' ') + '" fill="#4dabf7" stroke="#13294B" stroke-width="2"/>' +
        '<text x="' + (ox + A / 2) + '" y="' + (oy + Hh + 22) + '" text-anchor="middle" font-size="14" font-weight="700" fill="#13294B">length ' + l + ' ' + esc(u) + '</text><text x="' + (ox + A + Bw / 2 + 8) + '" y="' + (oy + Hh - Bw / 2 + 18) + '" font-size="14" font-weight="700" fill="#13294B" transform="rotate(-30 ' + (ox + A + Bw / 2 + 8) + ' ' + (oy + Hh - Bw / 2 + 18) + ')">width ' + w + ' ' + esc(u) + '</text><text x="' + (ox - 8) + '" y="' + (oy + Hh / 2) + '" text-anchor="end" font-size="14" font-weight="700" fill="#13294B">height ' + h + ' ' + esc(u) + '</text></svg>';
    } else {
      var sc = 260 / Math.max(l, w * 1.6), rw = l * sc, rh = w * sc;
      pic = '<svg viewBox="0 0 360 ' + (rh + 70) + '" class="measure-svg"><rect x="' + ((360 - rw) / 2) + '" y="20" width="' + rw + '" height="' + rh + '" fill="#d3f9d8" stroke="#2b8a3e" stroke-width="4" stroke-dasharray="' + (task.kind === 'perimeter' ? '10 5' : '0') + '"/><text x="180" y="' + (rh + 44) + '" text-anchor="middle" font-size="14" font-weight="700" fill="#13294B">length ' + l + ' ' + esc(u) + '</text><text x="' + ((360 - rw) / 2 - 8) + '" y="' + (20 + rh / 2) + '" text-anchor="end" font-size="14" font-weight="700" fill="#13294B">' + w + ' ' + esc(u) + '</text></svg>';
    }
    var unitOpt = { linear: u, square: 'square ' + u, cubic: 'cubic ' + u };
    host.innerHTML = '<div class="measure"><figure class="diagram-card">' + pic + '</figure><div class="m-parts">' + task.parts.map(function (pt) {
      return '<div class="m-part" data-id="' + pt.id + '"><label>' + esc(pt.label) + '</label><div class="m-in"><input type="text" inputmode="decimal" class="mval" aria-label="' + esc(pt.label) + ' number"><select class="munit" aria-label="units"><option value="">units...</option>' + ['linear', 'square', 'cubic'].map(function (k) { return '<option value="' + k + '">' + esc(unitOpt[k]) + '</option>'; }).join('') + '</select></div></div>';
    }).join('') + '<p class="small">Area = length \u00d7 width. Perimeter = add all the sides. Volume = length \u00d7 width \u00d7 height.</p></div></div>';
    host.addEventListener('input', function (e) { e.target.classList.remove('right', 'wrong'); });
    var api = {
      get: function () { var a = { values: {}, units: {} }; U.$$('.m-part', host).forEach(function (p) { var id = p.getAttribute('data-id'); a.values[id] = U.$('.mval', p).value; a.units[id] = U.$('.munit', p).value; }); return a; },
      set: function (a) { if (!a) return; U.$$('.m-part', host).forEach(function (p) { var id = p.getAttribute('data-id'); U.$('.mval', p).value = (a.values || {})[id] != null ? a.values[id] : ''; U.$('.munit', p).value = (a.units || {})[id] || ''; }); },
      mark: function (key) { U.$$('.m-part', host).forEach(function (p) { var id = p.getAttribute('data-id'), v = U.$('.mval', p), s = U.$('.munit', p); if (v.value) v.classList.add(CK.checkers.same(v.value, key.values[id]) ? 'right' : 'wrong'); if (s.value) s.classList.add(s.value === key.units[id] ? 'right' : 'wrong'); }); },
      reveal: function (key) { api.set({ values: key.values, units: key.units }); api.mark(key); }
    };
    return api;
  };

  // ---- chart: build the graph from the data table, then answer questions ----
  function gcd(a, b) { return b ? gcd(b, a % b) : a; }
  function dk(v) { v = +v; return Number.isInteger(v) ? v + '.0' : String(v); }
  T.r.chart = function (host, task) {
    var d = task.data || {}, dot = task.chartType === 'dot', W = 560, H = 300, L = 50, B = 46, pw = W - L - 14, ph = H - B - 34;
    var cats = d.categories || [], series = d.series || [], bars = series.map(function (s) { return s.values.map(function () { return 0; }); });
    var all = [].concat.apply([], series.map(function (s) { return s.values; })), step = all.length ? all.reduce(function (a, b) { return gcd(a, Math.round(b)); }, 0) || 1 : 1;
    var max = Math.ceil(Math.max.apply(null, all.concat([10])) * 1.1 / (step * 2)) * step * 2;
    var sc = d.scale || {}, ticks = []; if (dot) for (var v = sc.min; v <= sc.max + 1e-9; v += sc.step) ticks.push(fmt(v));
    var dots = {}; ticks.forEach(function (t) { dots[dk(t)] = 0; });
    var table = dot ? '<table class="data small"><tr><th>Leaf / value (' + esc(task.units) + ')</th>' + d.values.map(function (x) { return '<td>' + x + '</td>'; }).join('') + '</tr></table>'
      : '<table class="data small"><tr><th></th>' + cats.map(function (c) { return '<th>' + esc(c) + '</th>'; }).join('') + '</tr>' + series.map(function (s, i) { return '<tr><th><span class="cdot" style="background:' + COLORS[i] + '"></span>' + esc(s.name) + '</th>' + s.values.map(function (x) { return '<td>' + x + '</td>'; }).join('') + '</tr>'; }).join('') + '</table>';
    var inputs = dot ? '<div class="dot-ctl">' + ticks.map(function (t) { return '<label>' + t + '<input type="number" min="0" max="20" class="dcount" data-v="' + dk(t) + '" value="0"></label>'; }).join('') + '</div>'
      : '<table class="data small my-graph"><tr><th>My bars</th>' + cats.map(function (c) { return '<th>' + esc(c) + '</th>'; }).join('') + '</tr>' + series.map(function (s, i) { return '<tr><th>' + esc(s.name) + '</th>' + cats.map(function (c, j) { return '<td><input type="number" min="0" step="' + step + '" class="bval" data-i="' + i + '" data-j="' + j + '" value="0"></td>'; }).join('') + '</tr>'; }).join('') + '</table>';
    host.innerHTML = '<div class="chart-task"><h4>Data table</h4>' + table + '<h4>Build the ' + (dot ? 'dot plot: tap above a number to add a dot (tap the top dot to remove one)' : 'bar graph: tap the graph to set each bar, or type the heights') + '</h4><svg viewBox="0 0 ' + W + ' ' + H + '" class="chart-build"></svg>' + inputs +
      '<h4>Answer the questions</h4><div class="cq">' + task.questions.map(function (q) { return '<label class="cq-row" data-q="' + q.id + '"><span>' + esc(q.text) + '</span>' + (q.options ? '<select class="qa"><option value="">Choose...</option>' + q.options.map(function (o) { return '<option>' + esc(o) + '</option>'; }).join('') + '</select>' : '<input type="text" inputmode="decimal" class="qa">') + '</label>'; }).join('') + '</div></div>';
    var svg = U.$('.chart-build', host);
    function draw() {
      var o = ['<rect width="' + W + '" height="' + H + '" fill="#fff"/>'];
      if (dot) {
        var n = ticks.length, slot = pw / n; o.push('<line x1="' + L + '" y1="' + (H - B) + '" x2="' + (L + pw) + '" y2="' + (H - B) + '" stroke="#13294B" stroke-width="2"/>');
        ticks.forEach(function (t, k) { var cx = L + slot * k + slot / 2, c = dots[dk(t)] || 0; o.push('<line x1="' + cx + '" y1="' + (H - B) + '" x2="' + cx + '" y2="' + (H - B + 6) + '" stroke="#13294B"/><text x="' + cx + '" y="' + (H - B + 20) + '" text-anchor="middle" font-size="12" fill="#13294B">' + t + '</text>'); for (var q = 0; q < c; q++) o.push('<circle cx="' + cx + '" cy="' + (H - B - 14 - q * 22) + '" r="9" fill="#1e78c8"/>'); o.push('<rect class="col" data-v="' + dk(t) + '" x="' + (cx - slot / 2) + '" y="10" width="' + slot + '" height="' + (H - B - 10) + '" fill="transparent"/>'); });
        o.push('<text x="' + (L + pw / 2) + '" y="' + (H - 6) + '" text-anchor="middle" font-size="12" font-weight="700" fill="#13294B">Length (' + esc(task.units) + ')</text>');
      } else {
        for (var k = 0; k <= 5; k++) { var y = H - B - ph * k / 5; o.push('<line x1="' + L + '" x2="' + (L + pw) + '" y1="' + y + '" y2="' + y + '" stroke="#e9ecef"/><text x="' + (L - 6) + '" y="' + (y + 4) + '" text-anchor="end" font-size="11" fill="#495057">' + fmt(max * k / 5) + '</text>'); }
        var slot2 = pw / cats.length, bw = slot2 * 0.7 / series.length;
        cats.forEach(function (c, j) { series.forEach(function (s, i) { var v = bars[i][j], bh = ph * v / max, x = L + slot2 * j + slot2 * 0.15 + bw * i; o.push('<rect x="' + x + '" y="' + (H - B - bh) + '" width="' + (bw - 2) + '" height="' + bh + '" fill="' + COLORS[i] + '"/>' + (v ? '<text x="' + (x + bw / 2) + '" y="' + (H - B - bh - 3) + '" text-anchor="middle" font-size="9" fill="#13294B">' + v + '</text>' : '') + '<rect class="barhit" data-i="' + i + '" data-j="' + j + '" x="' + x + '" y="' + (H - B - ph) + '" width="' + (bw - 2) + '" height="' + ph + '" fill="transparent"/>'); }); o.push('<text x="' + (L + slot2 * j + slot2 / 2) + '" y="' + (H - B + 16) + '" text-anchor="middle" font-size="12" fill="#13294B">' + esc(c) + '</text>'); });
        o.push('<line x1="' + L + '" y1="' + (H - B) + '" x2="' + (L + pw) + '" y2="' + (H - B) + '" stroke="#13294B" stroke-width="2"/><line x1="' + L + '" y1="' + (H - B) + '" x2="' + L + '" y2="' + (H - B - ph) + '" stroke="#13294B" stroke-width="2"/><text transform="translate(14 ' + (H - B - ph / 2) + ') rotate(-90)" text-anchor="middle" font-size="12" font-weight="700" fill="#13294B">Rain (' + esc(task.units) + ')</text>');
        series.forEach(function (s, i) { o.push('<rect x="' + (L + 10 + i * 130) + '" y="6" width="12" height="12" fill="' + COLORS[i] + '"/><text x="' + (L + 26 + i * 130) + '" y="16" font-size="12" fill="#13294B">' + esc(s.name) + '</text>'); });
      }
      svg.innerHTML = o.join('');
      U.$$('.bval', host).forEach(function (inp) { inp.value = bars[+inp.getAttribute('data-i')][+inp.getAttribute('data-j')]; });
      U.$$('.dcount', host).forEach(function (inp) { inp.value = dots[inp.getAttribute('data-v')] || 0; });
    }
    svg.addEventListener('click', function (e) {
      var r = svg.getBoundingClientRect(), vy = (e.clientY - r.top) * H / r.height;
      var bh = e.target.closest('.barhit'); if (bh) { var val = Math.max(0, Math.round(((H - B - vy) / ph * max) / step) * step); bars[+bh.getAttribute('data-i')][+bh.getAttribute('data-j')] = val; draw(); return; }
      var col = e.target.closest('.col'); if (col) { var key = col.getAttribute('data-v'), c = dots[key] || 0, topY = H - B - 14 - (c - 1) * 22; if (c && Math.abs(vy - topY) < 11) dots[key] = c - 1; else dots[key] = c + 1; draw(); }
    });
    host.addEventListener('change', function (e) {
      if (e.target.classList.contains('bval')) { bars[+e.target.getAttribute('data-i')][+e.target.getAttribute('data-j')] = Math.max(0, +e.target.value || 0); draw(); }
      if (e.target.classList.contains('dcount')) { dots[e.target.getAttribute('data-v')] = Math.max(0, Math.round(+e.target.value || 0)); draw(); }
      if (e.target.classList.contains('qa')) e.target.classList.remove('right', 'wrong');
    });
    var api = {
      get: function () { var a = { answers: {} }; if (dot) { a.dots = {}; Object.keys(dots).forEach(function (k) { if (dots[k]) a.dots[k] = dots[k]; }); } else a.bars = bars.map(function (r) { return r.slice(); }); U.$$('.cq-row', host).forEach(function (r) { a.answers[r.getAttribute('data-q')] = U.$('.qa', r).value; }); return a; },
      set: function (a) { if (!a) return; if (a.bars) bars = a.bars.map(function (r) { return r.slice(); }); if (a.dots) { Object.keys(dots).forEach(function (k) { dots[k] = 0; }); Object.keys(a.dots).forEach(function (k) { dots[k] = a.dots[k]; }); } U.$$('.cq-row', host).forEach(function (r) { var v = (a.answers || {})[r.getAttribute('data-q')]; U.$('.qa', r).value = v == null ? '' : v; }); draw(); },
      mark: function (key) { U.$$('.cq-row', host).forEach(function (r) { var q = r.getAttribute('data-q'), el = U.$('.qa', r); if (el.value !== '') el.classList.add(CK.checkers.same(el.value, key.answers[q]) ? 'right' : 'wrong'); }); },
      reveal: function (key) { api.set({ bars: key.bars, dots: key.dots, answers: key.answers }); api.mark(key); }
    };
    draw(); return api;
  };

  // ---- budget: decimals with money ----
  T.r.budget = function (host, task) {
    var cur = task.currency || 'coins', money = function (v) { return (+v).toFixed(2); };
    host.innerHTML = '<div class="budget-task"><div class="bt-start">Starting amount: <b>' + money(task.startingAmount) + ' ' + esc(cur) + '</b></div><p>' + esc(task.goal || '') + '</p>' +
      '<table class="data bt"><tr><th>Item</th><th>Cost each</th><th>How many</th><th>Line total</th></tr>' + task.items.map(function (it, k) {
        return '<tr data-k="' + k + '"><td>' + esc(it.name) + (it.required ? ' <small>(required)</small>' : ' <small>(optional)</small>') + '</td><td>' + money(it.cost) + '</td><td>' + (it.qty === 'choose' ? '<input type="number" min="0" max="20" class="bqty" data-name="' + esc(it.name) + '" value="0" aria-label="How many ' + esc(it.name) + '">' : it.qty) + '</td><td><input type="text" inputmode="decimal" class="bline" aria-label="Line total for ' + esc(it.name) + '"></td></tr>';
      }).join('') + '</table>' +
      '<div class="bt-sum"><label>Total of the <b>required</b> items <input type="text" inputmode="decimal" class="breq"></label><label>Total spent <input type="text" inputmode="decimal" class="bspent"></label><label>Final balance <input type="text" inputmode="decimal" class="bbal"></label></div>' +
      (task.question2 ? '<label class="field">' + esc(task.question2) + '<textarea class="bq2" rows="2"></textarea></label>' : '') + '<p class="small">Line up the decimal points. Estimate first to check that your answer makes sense.</p></div>';
    host.addEventListener('input', function (e) { e.target.classList.remove('right', 'wrong'); });
    var api = {
      get: function () { var c = {}; U.$$('.bqty', host).forEach(function (i) { c[i.getAttribute('data-name')] = +i.value || 0; }); return { choose: c, lines: U.$$('.bline', host).map(function (i) { return i.value; }), requiredTotal: U.$('.breq', host).value, totalSpent: U.$('.bspent', host).value, finalBalance: U.$('.bbal', host).value, q2: U.$('.bq2', host) ? U.$('.bq2', host).value : '' }; },
      set: function (a) { if (!a) return; U.$$('.bqty', host).forEach(function (i) { i.value = (a.choose || {})[i.getAttribute('data-name')] || 0; }); U.$$('.bline', host).forEach(function (i, k) { i.value = (a.lines || [])[k] || ''; }); U.$('.breq', host).value = a.requiredTotal == null ? '' : a.requiredTotal; U.$('.bspent', host).value = a.totalSpent == null ? '' : a.totalSpent; U.$('.bbal', host).value = a.finalBalance == null ? '' : a.finalBalance; if (U.$('.bq2', host)) U.$('.bq2', host).value = a.q2 || ''; },
      mark: function (key) { var S = CK.checkers.same, f = function (sel, v) { var el = U.$(sel, host); if (el.value !== '' && v != null) el.classList.add(S(el.value, v) ? 'right' : 'wrong'); }; f('.breq', key.requiredTotal); f('.bspent', key.totalSpent); f('.bbal', key.finalBalance); U.$$('.bqty', host).forEach(function (i) { var k = (key.choose || {})[i.getAttribute('data-name')]; if (k != null) i.classList.add(+i.value === k ? 'right' : 'wrong'); });
        U.$$('.bt tr[data-k]', host).forEach(function (tr) { var it = task.items[+tr.getAttribute('data-k')], q = it.qty === 'choose' ? +(U.$('.bqty', tr).value) : +it.qty, el = U.$('.bline', tr); if (el.value !== '') el.classList.add(S(el.value, Math.round(it.cost * q * 100) / 100) ? 'right' : 'wrong'); }); },
      reveal: function (key) { var lines = task.items.map(function (it) { var q = it.qty === 'choose' ? (key.choose || {})[it.name] || 0 : +it.qty; return money(it.cost * q); }); api.set({ choose: key.choose, lines: lines, requiredTotal: money(key.requiredTotal), totalSpent: money(key.totalSpent), finalBalance: money(key.finalBalance), q2: (key.ideas || []).slice(0, 2).join('; ') }); api.mark(key); }
    };
    return api;
  };
  // ---- follow-up renderers: numeric (fractions / mixed numbers allowed) and grid (one choice per row) ----
  T.r.numeric = function (host, task) {
    host.innerHTML = '<div class="numeric-task"><label class="field">Your answer <span class="num-row"><input type="text" class="num-in" inputmode="text" autocomplete="off" aria-label="Your answer">' + (task.unit ? ' <b class="unit">' + esc(task.unit) + '</b>' : '') + '</span></label><p class="hint-line">You can type a whole number, a decimal, a fraction (13/12), or a mixed number (1 1/12).</p></div>';
    var inp = U.$('.num-in', host); inp.addEventListener('input', function () { inp.classList.remove('right', 'wrong'); });
    var api = { get: function () { return inp.value.trim(); }, set: function (a) { inp.value = a == null ? '' : a; },
      mark: function (key) { if (inp.value) inp.classList.add(CK.checkers.numeric(task, key || task, inp.value).ok ? 'right' : 'wrong'); },
      reveal: function (key) { key = key || task; api.set((key.accepted || [])[0] != null ? key.accepted[0] : key.tol ? key.tol.value : ''); api.mark(key); } };
    return api;
  };
  T.r.grid = function (host, task) {
    var opts = task.options || ['yes', 'no'];
    host.innerHTML = '<table class="data grid-task"><thead><tr><th></th>' + opts.map(function (o) { return '<th>' + esc(o) + '</th>'; }).join('') + '</tr></thead><tbody>' + (task.rows || []).map(function (r, i) {
      return '<tr data-r="' + i + '"><th>' + esc(r) + '</th>' + opts.map(function (o, k) { return '<td><button type="button" class="option grid-opt" role="radio" aria-checked="false" data-k="' + k + '" aria-label="' + esc(r + ': ' + o) + '"><span class="box"></span></button></td>'; }).join('') + '</tr>';
    }).join('') + '</tbody></table>';
    host.addEventListener('click', function (e) { var b = e.target.closest('.grid-opt'); if (!b) return; var tr = b.closest('tr'); U.$$('.grid-opt', tr).forEach(function (o) { o.setAttribute('aria-checked', 'false'); o.classList.remove('right', 'wrong'); }); b.setAttribute('aria-checked', 'true'); });
    var api = {
      get: function () { return U.$$('tr[data-r]', host).map(function (tr) { var on = U.$('.grid-opt[aria-checked=true]', tr); return on ? +on.getAttribute('data-k') : null; }); },
      set: function (a) { U.$$('tr[data-r]', host).forEach(function (tr, i) { U.$$('.grid-opt', tr).forEach(function (o) { o.setAttribute('aria-checked', String((a || [])[i] === +o.getAttribute('data-k'))); }); }); },
      mark: function (key) { U.$$('tr[data-r]', host).forEach(function (tr, i) { var on = U.$('.grid-opt[aria-checked=true]', tr); if (on) on.classList.add(+on.getAttribute('data-k') === key[i] ? 'right' : 'wrong'); }); },
      reveal: function (key) { api.set(key); api.mark(key); }
    };
    return api;
  };
})();
