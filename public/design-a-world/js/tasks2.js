/* Design a World: task renderers part 2 (build-web, circuit, orbit, investigate). */
(function () {
  'use strict';
  var U = window.DAW_UI, A = window.DAW_ART, esc = U.esc, T = window.DAW_TASKS;
  // extra organism icons used by imported food webs
  A.organism.sun = A.organism.sun || '<circle cx="32" cy="32" r="26" fill="url(#daw-glow)" opacity=".7"/><g stroke="#f59f00" stroke-width="4" stroke-linecap="round">' + [0, 45, 90, 135, 180, 225, 270, 315].map(function (a) { var r = a * Math.PI / 180; return '<line x1="' + (32 + Math.cos(r) * 19) + '" y1="' + (32 + Math.sin(r) * 19) + '" x2="' + (32 + Math.cos(r) * 27) + '" y2="' + (32 + Math.sin(r) * 27) + '"/>'; }).join('') + '</g><circle cx="32" cy="32" r="14" fill="url(#daw-sun)"/>';
  A.organism.berry = A.organism.berry || '<ellipse cx="32" cy="38" rx="22" ry="17" fill="#2f9e44"/><ellipse cx="24" cy="30" rx="12" ry="10" fill="#40c057"/><ellipse cx="40" cy="30" rx="12" ry="10" fill="#37b24d"/>' + [[22, 36], [30, 42], [40, 38], [34, 30], [26, 28], [44, 44]].map(function (p) { return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="4.2" fill="#c2255c"/><circle cx="' + (p[0] - 1.3) + '" cy="' + (p[1] - 1.3) + '" r="1.2" fill="#fff" opacity=".7"/>'; }).join('') + '<rect x="30" y="52" width="4" height="8" fill="#8a5a2b"/>';
  A.organism.fungi = A.organism.fungi || A.organism.mushroom;

  // ---- build-web ----
  T.r['build-web'] = function (host, task, m) {
    var orgs = task.organisms || [], edges = [], sel = null, W = 1000, H = 600;
    function pos(o) { return [o.x * W / 100, o.y * H / 100]; }
    host.innerHTML = '<p class="hint-line strong">Tap the <b>food</b> first, then tap the <b>eater</b>. The arrow shows energy moving from food to eater. Tap an arrow to remove it.</p><div class="web-board"><svg viewBox="0 0 ' + W + ' ' + H + '" class="web-svg"><defs><marker id="wa" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#e8590c"/></marker><marker id="wa2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#2b8a3e"/></marker><marker id="wa3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#c92a2a"/></marker></defs><g class="arrows"></g></svg>' +
      orgs.map(function (o) { return '<button type="button" class="org" data-id="' + esc(o.id) + '" style="left:' + o.x + '%;top:' + o.y + '%"><span class="org-ic">' + A.organismSvg(o.icon || o.id, 46) + '</span><span class="org-name">' + esc(o.name) + '</span><span class="org-role">' + esc(o.role || '') + '</span></button>'; }).join('') + '</div><div class="web-count">Arrows: <b>0</b></div>';
    var board = U.$('.web-board', host), g = U.$('.arrows', host), marks = {};
    function byId(id) { return orgs.filter(function (o) { return o.id === id; })[0]; }
    function draw() {
      g.innerHTML = edges.map(function (e, k) {
        var a = pos(byId(e[0])), b = pos(byId(e[1])), dx = b[0] - a[0], dy = b[1] - a[1], L = Math.sqrt(dx * dx + dy * dy) || 1, r = 52;
        var x1 = a[0] + dx / L * r, y1 = a[1] + dy / L * r, x2 = b[0] - dx / L * (r + 6), y2 = b[1] - dy / L * (r + 6), mk = marks[e[0] + '>' + e[1]];
        var col = mk === 'right' ? '#2b8a3e' : mk === 'wrong' ? '#c92a2a' : '#e8590c', mid = mk === 'right' ? 'wa2' : mk === 'wrong' ? 'wa3' : 'wa';
        return '<g class="edge" data-k="' + k + '"><line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="transparent" stroke-width="26"/><line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + col + '" stroke-width="5" stroke-linecap="round" marker-end="url(#' + mid + ')"/></g>';
      }).join('');
      U.$('.web-count b', host).textContent = edges.length;
    }
    board.addEventListener('click', function (e) {
      var ed = e.target.closest('.edge'); if (ed) { edges.splice(+ed.getAttribute('data-k'), 1); marks = {}; draw(); return; }
      var b = e.target.closest('.org'); if (!b) return; var id = b.getAttribute('data-id');
      if (!sel) { sel = id; b.classList.add('selected'); return; }
      U.$$('.org', board).forEach(function (o) { o.classList.remove('selected'); });
      if (sel !== id && !edges.some(function (x) { return x[0] === sel && x[1] === id; })) { edges = edges.filter(function (x) { return !(x[0] === id && x[1] === sel); }); edges.push([sel, id]); marks = {}; }
      sel = null; draw();
    });
    var api = {
      get: function () { return edges.map(function (e) { return e.slice(); }); },
      set: function (a) { edges = (a || []).filter(function (e) { return byId(e[0]) && byId(e[1]); }).map(function (e) { return e.slice(); }); draw(); },
      mark: function (key) { var ok = (key.edges || []).concat(key.optional || []).map(function (e) { return e[0] + '>' + e[1]; }); marks = {}; edges.forEach(function (e) { var s = e[0] + '>' + e[1]; marks[s] = ok.indexOf(s) >= 0 ? 'right' : 'wrong'; }); draw(); },
      reveal: function (key) { var all = (key.edges || []).concat(key.optional || []); api.set(key.minCorrect ? all : (key.edges || []).concat((key.optional || []).slice(0, key.minOptional || 0))); api.mark(key); }
    };
    draw(); return api;
  };

  // ---- circuit (gaps mode and parts mode) ----
  T.r.circuit = function (host, task, m) {
    var parts = task.mode === 'parts', list = parts ? (task.parts || []) : (task.materials || []), n = parts ? (task.slots || 4) : (task.gaps || 2), closed = false;
    var slotPos = parts ? (n >= 5 ? [[26, 8], [62, 8], [88, 34], [88, 72], [50, 86]] : [[30, 8], [70, 8], [88, 50], [50, 86]]) : [[34, 8], [66, 8]];
    host.innerHTML = '<div class="pp circuit"><div class="circuit-board"><svg viewBox="0 0 400 260" class="circ-svg"></svg>' +
      slotPos.slice(0, n).map(function (p, k) { return '<div class="drop slot" data-cap="1" tabindex="0" data-slot="' + k + '" style="left:' + p[0] + '%;top:' + p[1] + '%" aria-label="Spot ' + (k + 1) + '"><span class="slot-n">' + (k + 1) + '</span></div>'; }).join('') + '</div>' +
      '<div class="circ-controls"><button type="button" class="btn switch-btn" aria-pressed="false">' + A.icon('flag', 16) + ' <span>Close the switch</span></button><span class="circ-status" aria-live="polite"></span></div>' +
      '<div class="pool" tabindex="0" aria-label="Parts">' + list.map(function (p, k) { return T.chip(k, esc(p.name) + (parts && p.kind !== 'wire' ? '<small>' + esc(p.kind) + '</small>' : '')); }).join('') + '</div>' +
      '<p class="hint-line">' + (parts ? 'Tap a part, then tap a numbered spot in the loop. Parts can be used once. ' : 'Tap a material, then tap a gap. ') + 'Then close the switch to test.</p></div>';
    var root = U.$('.pp', host), svg = U.$('.circ-svg', host), sw = U.$('.switch-btn', host), status = U.$('.circ-status', host);
    T.pickPlace(root, function () { closed = false; draw(); });
    function slots() { var out = []; for (var k = 0; k < n; k++) { var c = U.$('.drop[data-slot="' + k + '"] .chip', root); out.push(c ? +c.getAttribute('data-v') : null); } return out; }
    function draw() {
      var res = window.DAW_CHECK.check(task, m.answerKey || {}, api.get()), lit = res.lit;
      var sl = slots().map(function (k) { return k == null ? null : list[k]; }), hasSw = parts ? sl.some(function (p) { return p && p.kind === 'switch'; }) : true;
      sw.disabled = parts && !hasSw; sw.setAttribute('aria-pressed', String(closed)); U.$('span', sw).textContent = closed ? 'Open the switch' : 'Close the switch';
      var wire = lit ? '#f59f00' : '#495057', o = [];
      o.push('<rect x="40" y="30" width="320" height="200" rx="26" fill="none" stroke="' + wire + '" stroke-width="7"' + (lit ? ' class="flow"' : '') + '/>');
      // battery (left side)
      o.push('<g transform="translate(40 130)"><rect x="-22" y="-40" width="44" height="80" rx="8" fill="#343a40"/><rect x="-22" y="-40" width="44" height="26" rx="6" fill="#fab005"/><rect x="-8" y="-50" width="16" height="10" rx="2" fill="#adb5bd"/><text y="8" text-anchor="middle" font-size="16" font-weight="800" fill="#fff" font-family="Lexend, sans-serif">+ \u2212</text><text y="62" text-anchor="middle" font-size="12" fill="#13294B" font-family="Lexend, sans-serif" font-weight="700">battery</text></g>');
      if (!parts) {
        o.push('<g transform="translate(360 130)">' + bulb(lit) + '</g>');
        o.push('<g transform="translate(200 230)">' + switchArt(closed) + '</g>');
      } else {
        var devs = res.devices || [];
        o.push('<text x="200" y="140" text-anchor="middle" font-family="Lexend, sans-serif" font-size="' + (lit ? 18 : 14) + '" font-weight="800" fill="' + (lit ? '#2b8a3e' : '#868e96') + '">' + (lit ? '\u2714 Energy flows: ' + esc(devs.map(function (d) { var p = list.filter(function (x) { return x.name === d; })[0]; return d + (p && p.output ? ' \u2192 ' + p.output : ''); }).join(', ')) : 'Complete the loop') + '</text>');
        if (lit && devs.some(function (d) { return /bulb/i.test(d); })) o.push('<circle cx="200" cy="100" r="30" fill="url(#daw-glow)"/>');
      }
      svg.innerHTML = A.defs() + o.join('');
      status.textContent = res.detail || '';
      status.className = 'circ-status ' + (lit ? 'ok' : '');
    }
    function bulb(on) { return (on ? '<circle cy="-20" r="40" fill="url(#daw-glow)"/>' : '') + '<circle cy="-20" r="20" fill="' + (on ? '#ffe066' : '#e9ecef') + '" stroke="#868e96" stroke-width="2"/><path d="M-6 -16 q6 -10 12 0" fill="none" stroke="' + (on ? '#f08c00' : '#868e96') + '" stroke-width="2"/><rect x="-10" y="0" width="20" height="14" rx="3" fill="#868e96"/><text y="34" text-anchor="middle" font-size="12" fill="#13294B" font-family="Lexend, sans-serif" font-weight="700">bulb</text>'; }
    function switchArt(c) { return '<rect x="-34" y="-14" width="68" height="28" rx="8" fill="#fff" stroke="#495057" stroke-width="2"/><circle cx="-20" r="4" fill="#495057"/><circle cx="20" r="4" fill="#495057"/><line x1="-20" y1="0" x2="' + (c ? 20 : 12) + '" y2="' + (c ? 0 : -16) + '" stroke="#c92a2a" stroke-width="4" stroke-linecap="round"/><text y="30" text-anchor="middle" font-size="12" fill="#13294B" font-family="Lexend, sans-serif" font-weight="700">switch ' + (c ? '(closed)' : '(open)') + '</text>'; }
    sw.addEventListener('click', function () { closed = !closed; draw(); });
    var api = {
      get: function () { return parts ? { slots: slots(), switchClosed: closed } : { gaps: slots(), switchClosed: closed }; },
      set: function (a) { if (!a) return; (a.slots || a.gaps || []).forEach(function (v, k) { var c = U.$('.chip[data-v="' + v + '"]', root); if (v != null && c) U.$('.drop[data-slot="' + k + '"]', root).appendChild(c); }); closed = !!a.switchClosed; draw(); },
      mark: function () { var a = slots(); a.forEach(function (v, k) { if (v == null) return; var p = list[v], bad = parts ? p.kind === 'insulator' : !p.conductor; U.$('.drop[data-slot="' + k + '"] .chip', root).classList.add(bad ? 'wrong' : 'right'); }); },
      reveal: function () {
        U.$$('.chip', root).forEach(function (c) { U.$('.pool', root).appendChild(c); });
        var pick = [];
        if (parts) { var f = function (kind) { for (var k = 0; k < list.length; k++) if (list[k].kind === kind && pick.indexOf(k) < 0) return k; return null; }; pick = [f('wire'), f('switch'), f('device')]; while (pick.length < n) { var w = null; for (var k = 0; k < list.length; k++) if (list[k].kind !== 'insulator' && pick.indexOf(k) < 0) { w = k; break; } pick.push(w); } }
        else { list.forEach(function (p, k) { if (p.conductor && pick.length < n) pick.push(k); }); }
        api.set(parts ? { slots: pick, switchClosed: true } : { gaps: pick, switchClosed: true });
      }
    };
    draw(); return api;
  };

  // ---- orbit: spin Earth (angle mode) or fill the sky table (table mode) ----
  var HOUR = { 'midnight': 0, 'sunrise': 6, 'early morning': 7, 'morning': 9, 'noon': 12, 'midday': 12, 'afternoon': 15, 'late afternoon': 16, 'sunset': 18, 'evening': 19, 'night': 22 };
  function earthSvg(hour) {
    var ang = hour * 15, r = 70, a = ang * Math.PI / 180, ox = Math.cos(a) * r, oy = -Math.sin(a) * r, o = [];
    o.push('<svg viewBox="-200 -110 400 220" class="orbit-svg" aria-label="Earth spinning, Sun on the left">' + A.defs() + '<rect x="-200" y="-110" width="400" height="220" fill="#0b1d3a"/>');
    for (var k = 0; k < 40; k++) o.push('<circle cx="' + ((k * 97) % 400 - 200) + '" cy="' + ((k * 53) % 220 - 110) + '" r="' + (k % 3 ? 0.8 : 1.4) + '" fill="#fff" opacity=".7"/>');
    o.push('<circle cx="-170" cy="0" r="38" fill="url(#daw-glow)"/><circle cx="-170" cy="0" r="22" fill="url(#daw-sun)"/><text x="-170" y="48" text-anchor="middle" fill="#ffd43b" font-size="12" font-family="Lexend, sans-serif" font-weight="700">Sun</text>');
    o.push('<g opacity=".25">' + [-60, -30, 0, 30, 60].map(function (y) { return '<line x1="-140" y1="' + y + '" x2="-80" y2="' + y + '" stroke="#ffd43b" stroke-width="2" stroke-dasharray="6 6"/>'; }).join('') + '</g>');
    o.push('<g transform="translate(40 0)"><circle r="' + r + '" fill="#1c7ed6"/><path d="M0 -' + r + ' A' + r + ' ' + r + ' 0 0 1 0 ' + r + ' Z" fill="#0b1d3a" opacity=".62"/>');
    o.push('<g transform="rotate(' + (-ang) + ')"><path d="M-30 -20 q20 -26 44 -6 q10 18 -8 30 q-24 8 -36 -24z" fill="#2f9e44" opacity=".9"/><path d="M20 30 q16 -6 24 10 q-8 14 -24 -10z" fill="#2f9e44" opacity=".9"/></g>');
    o.push('<circle r="5" fill="#fff"/><text y="-' + (r + 8) + '" text-anchor="middle" fill="#dee2e6" font-size="10" font-family="Lexend, sans-serif">North Pole view, spins \u21ba</text>');
    o.push('<g transform="translate(' + ox + ' ' + oy + ') rotate(' + (90 - ang) + ')"><line x1="0" y1="0" x2="0" y2="-20" stroke="#fff" stroke-width="3"/><circle cx="0" cy="-24" r="5" fill="#ffd43b" stroke="#fff"/></g>');
    o.push('</g><text x="190" y="100" text-anchor="end" fill="#fff" font-size="13" font-family="Lexend, sans-serif" font-weight="700">' + clock(hour) + '</text></svg>');
    return o.join('');
  }
  function clock(h) { h = ((h % 24) + 24) % 24; var hh = Math.floor(h), mm = Math.round((h - hh) * 60); return (hh % 12 === 0 ? 12 : hh % 12) + ':' + ('0' + mm).slice(-2) + (hh < 12 ? ' AM' : ' PM'); }
  function skySvg(hour) {
    var day = hour > 6 && hour < 18, f = (hour - 6) / 12, alt = day ? Math.sin(Math.PI * f) : 0, sx = 30 + f * 340, sy = 150 - alt * 120;
    var pole = 60, shadow = day ? Math.min(150, pole / Math.max(0.12, alt * 1.6)) : 0, dir = f < 0.5 ? 1 : -1, o = [];
    o.push('<svg viewBox="0 0 400 200" class="sky-svg" aria-label="What the observer sees">' + A.defs());
    o.push('<rect width="400" height="200" fill="' + (day ? 'url(#daw-sky)' : '#0b1d3a') + '"/>');
    if (day) o.push('<circle cx="' + sx + '" cy="' + sy + '" r="34" fill="url(#daw-glow)"/><circle cx="' + sx + '" cy="' + sy + '" r="16" fill="url(#daw-sun)"/>');
    else o.push('<circle cx="320" cy="44" r="12" fill="#f1f3f5"/><circle cx="326" cy="40" r="11" fill="#0b1d3a"/>');
    o.push('<rect y="150" width="400" height="50" fill="' + (day ? '#69a84f' : '#2b3a2a') + '"/>');
    if (day) { var top = Math.abs(f - 0.5) < 0.06; o.push(top ? '<ellipse cx="200" cy="156" rx="10" ry="4" fill="#000" opacity=".35"/><text x="216" y="170" font-size="10" fill="#13294B" font-family="Lexend, sans-serif">short shadow (north)</text>' : '<polygon points="200,151 ' + (200 + dir * shadow) + ',153 ' + (200 + dir * shadow) + ',157 200,157" fill="#000" opacity=".35"/>'); }
    o.push('<rect x="198" y="' + (150 - pole) + '" width="4" height="' + pole + '" fill="#495057"/><path d="M202 ' + (150 - pole) + ' l22 7 l-22 7z" fill="#c92a2a"/>');
    o.push('<g font-family="Lexend, sans-serif" font-size="12" font-weight="700" fill="' + (day ? '#13294B' : '#dee2e6') + '"><text x="10" y="190">East</text><text x="200" y="190" text-anchor="middle">South (facing)</text><text x="390" y="190" text-anchor="end">West</text></g></svg>');
    return o.join('');
  }
  T.earthSvg = earthSvg; T.skySvg = skySvg;
  T.r.orbit = function (host, task, m) {
    var table = task.mode === 'table', hour = table ? 9 : ((task.start || 0) / 15);
    host.innerHTML = '<div class="orbit-wrap"><div class="orbit-views"><div class="ov">' + '</div><div class="sv"></div></div>' +
      '<label class="spin"><span>Spin Earth</span><input type="range" min="0" max="23.5" step="0.5" value="' + hour + '" aria-label="Time of day"><span class="clock"></span></label>' +
      (table ? '<table class="sky-table"><thead><tr><th>Time</th><th>Where is the Sun?</th><th>Flagpole shadow</th><th></th></tr></thead><tbody>' + task.times.map(function (t) {
        return '<tr data-t="' + esc(t) + '"><th>' + esc(t) + '</th><td><select data-f="sun" aria-label="Sun at ' + esc(t) + '"><option value="">Choose...</option>' + task.sunOptions.map(function (o) { return '<option>' + esc(o) + '</option>'; }).join('') + '</select></td><td><select data-f="shadow" aria-label="Shadow at ' + esc(t) + '"><option value="">Choose...</option>' + task.shadowOptions.map(function (o) { return '<option>' + esc(o) + '</option>'; }).join('') + '</select></td><td><button type="button" class="btn small ghost goto">Spin to ' + esc(t) + '</button></td></tr>';
      }).join('') + '</tbody></table><p class="hint-line">Spin Earth to each time and watch the sky. (Northern Hemisphere, facing south.)</p>' : '<p class="hint-line">Drag the slider to spin Earth. Each step is half an hour.</p>') + '</div>';
    var rng = U.$('input[type=range]', host);
    function paint() { hour = +rng.value; U.$('.ov', host).innerHTML = earthSvg(hour); U.$('.sv', host).innerHTML = skySvg(hour); U.$('.clock', host).textContent = clock(hour); }
    rng.addEventListener('input', paint);
    host.addEventListener('click', function (e) { var g = e.target.closest('.goto'); if (g) { var t = g.closest('tr').getAttribute('data-t'); rng.value = HOUR[t] != null ? HOUR[t] : 12; paint(); } });
    host.addEventListener('change', function (e) { if (e.target.tagName === 'SELECT') e.target.classList.remove('right', 'wrong'); });
    paint();
    var api = table ? {
      get: function () { var rows = {}; U.$$('tr[data-t]', host).forEach(function (tr) { rows[tr.getAttribute('data-t')] = { sun: U.$('[data-f=sun]', tr).value, shadow: U.$('[data-f=shadow]', tr).value }; }); return { rows: rows }; },
      set: function (a) { if (!a || !a.rows) return; U.$$('tr[data-t]', host).forEach(function (tr) { var r = a.rows[tr.getAttribute('data-t')] || {}; U.$('[data-f=sun]', tr).value = r.sun || ''; U.$('[data-f=shadow]', tr).value = r.shadow || ''; }); },
      mark: function (key) { U.$$('tr[data-t]', host).forEach(function (tr) { var k = key.rows[tr.getAttribute('data-t')]; if (!k) return; ['sun', 'shadow'].forEach(function (f) { var s = U.$('[data-f=' + f + ']', tr); if (s.value) s.classList.add(s.value === k[f] ? 'right' : 'wrong'); }); }); },
      reveal: function (key) { api.set(key); api.mark(key); }
    } : {
      get: function () { return { angle: hour * 15 }; },
      set: function (a) { if (a && a.angle != null) { rng.value = a.angle / 15; paint(); } },
      mark: function () {}, reveal: function (key) { rng.value = key.angle / 15; paint(); }
    };
    return api;
  };

  // ---- investigate: pick the variable to change and what to measure, then run trials ----
  T.r.investigate = function (host, task, m) {
    var vars = task.variables || [], meas = task.measures || [], ran = false;
    host.innerHTML = '<div class="inv"><div class="inv-col"><h4>1. What will you CHANGE? (independent variable)</h4><div class="options" data-g="change">' + vars.map(function (v) { return '<button type="button" class="option" role="radio" aria-checked="false" data-k="' + esc(v.id) + '"><span class="box"></span><span>' + esc(v.name) + '<small> (' + esc(v.levels.join(', ')) + ')</small></span></button>'; }).join('') + '</div></div>' +
      '<div class="inv-col"><h4>2. What will you MEASURE? (dependent variable)</h4><div class="options" data-g="measure">' + meas.map(function (v, k) { return '<button type="button" class="option" role="radio" aria-checked="false" data-k="' + k + '"><span class="box"></span><span>' + esc(v) + '</span></button>'; }).join('') + '</div></div>' +
      '<div class="inv-run"><button type="button" class="btn primary run">\u25b6 Run 3 trials</button><div class="inv-out"></div></div></div>';
    function val(g) { var o = U.$('[data-g=' + g + '] .option[aria-checked=true]', host); return o ? o.getAttribute('data-k') : null; }
    host.addEventListener('click', function (e) {
      var b = e.target.closest('.option'); if (b) { U.$$('.option', b.parentNode).forEach(function (o) { o.setAttribute('aria-checked', 'false'); o.classList.remove('right', 'wrong'); }); b.setAttribute('aria-checked', 'true'); ran = false; U.$('.inv-out', host).innerHTML = ''; return; }
      if (e.target.closest('.run')) run();
    });
    function run() {
      var c = val('change'), ms = val('measure'); if (c == null || ms == null) { U.$('.inv-out', host).innerHTML = '<p class="warn">Choose what to change and what to measure first.</p>'; return; }
      var v = vars.filter(function (x) { return x.id === c; })[0], good = m.answerKey && c === m.answerKey.change, base = 40;
      var rows = v.levels.map(function (lv, k) { var t = [0, 1, 2].map(function (r) { return Math.round(good ? base + k * 45 + ((r * 7 + k * 3) % 9) : base + 30 + ((r * 11 + k * 5) % 13)); }); return { lv: lv, t: t, avg: Math.round((t[0] + t[1] + t[2]) / 3) }; });
      var max = Math.max.apply(null, rows.map(function (r) { return r.avg; }));
      U.$('.inv-out', host).innerHTML = '<table class="data"><thead><tr><th>' + esc(v.name) + '</th><th>Trial 1</th><th>Trial 2</th><th>Trial 3</th><th>Average</th></tr></thead><tbody>' + rows.map(function (r) { return '<tr><th>' + esc(r.lv) + '</th><td>' + r.t.join('</td><td>') + '</td><td><b>' + r.avg + '</b></td></tr>'; }).join('') + '</tbody></table>' +
        '<div class="mini-bars">' + rows.map(function (r) { return '<div class="mb"><div class="bar" style="height:' + Math.round(100 * r.avg / max) + '%"></div><span>' + esc(r.lv) + '</span></div>'; }).join('') + '</div><p class="small">Measured: ' + esc(meas[+ms]) + '</p>';
      ran = true;
    }
    var api = {
      get: function () { var ms = val('measure'); return { change: val('change'), measure: ms == null ? null : +ms, ran: ran }; },
      set: function (a) { if (!a) return; U.$$('[data-g=change] .option', host).forEach(function (o) { o.setAttribute('aria-checked', String(o.getAttribute('data-k') === a.change)); }); U.$$('[data-g=measure] .option', host).forEach(function (o) { o.setAttribute('aria-checked', String(+o.getAttribute('data-k') === a.measure)); }); if (a.ran) run(); },
      mark: function (key) { var a = api.get(); var c = U.$('[data-g=change] .option[aria-checked=true]', host), mm = U.$('[data-g=measure] .option[aria-checked=true]', host); if (c) c.classList.add(a.change === key.change ? 'right' : 'wrong'); if (mm) mm.classList.add(a.measure === key.measure ? 'right' : 'wrong'); },
      reveal: function (key) { api.set({ change: key.change, measure: key.measure, ran: true }); api.mark(key); }
    };
    return api;
  };
})();
