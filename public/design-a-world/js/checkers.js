/* Design a World: answer checkers (pure functions; also used by Node unit tests). */
(function (root) {
  'use strict';
  function setEq(a, b) { a = (a || []).slice().sort(); b = (b || []).slice().sort(); return a.length === b.length && a.every(function (x, i) { return x === b[i]; }); }
  function arrEq(a, b) { return Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every(function (x, i) { return x === b[i]; }); }
  function countSame(a, b) { var n = 0; (b || []).forEach(function (x, i) { if (a && a[i] === x) n++; }); return n; }
  var C = {};
  C.choice = function (t, key, a) { return { ok: a === key, detail: '' }; };
  C.multi = function (t, key, a) {
    var right = (a || []).filter(function (x) { return key.indexOf(x) >= 0; }).length, wrong = (a || []).length - right;
    return { ok: setEq(a, key), detail: (right < key.length ? 'You are missing ' + (key.length - right === 1 ? 'a correct choice' : 'some correct choices') : 'You found the correct choices') + (wrong ? ', and ' + (wrong === 1 ? 'one choice does' : 'some choices do') + ' not belong' : '') + '.' };
  };
  function left(n, tot, one, many, rest) { var k = tot - n; return k <= 0 ? 'All ' + many + ' ' + rest[1] + '.' : k + ' ' + (k === 1 ? one : many) + ' ' + (k === 1 ? rest[0] : rest[2]) + '.'; }
  C.sort = function (t, key, a) { var n = countSame(a, key); return { ok: arrEq(a, key), detail: left(n, key.length, 'card', 'cards', ['is not in the right group yet', 'are in the right group', 'are not in the right group yet']) }; };
  C.match = function (t, key, a) { var n = countSame(a, key); return { ok: arrEq(a, key), detail: left(n, key.length, 'match', 'matches', ['needs another look', 'look right', 'need another look']) }; };
  C.label = C.match;
  C.order = function (t, key, a) { var n = countSame(a, key); return { ok: arrEq(a, key), detail: left(n, key.length, 'step', 'steps', ['is not in the right place yet', 'are in the right place', 'are not in the right place yet']) }; };
  C.cer = function (t, key, a) {
    a = a || {}; var claimOk, evOk;
    if (key.claims) { // several acceptable claims, each with its own supporting evidence
      claimOk = key.claims.indexOf(a.claim) >= 0;
      var sup = claimOk ? (key.evidenceFor[String(a.claim)] || []) : [];
      evOk = claimOk && (a.evidence || []).length > 0 && setEq(a.evidence, sup);
    } else { claimOk = a.claim === key.claim; evOk = setEq(a.evidence, key.evidence); }
    return { ok: claimOk && evOk, detail: (claimOk ? 'Your claim is strong. ' : 'Check your claim. ') + (evOk ? 'Your evidence fits.' : 'Check your evidence: pick ALL that support the claim, and nothing else.') };
  };
  C['build-web'] = function (t, key, a) {
    var edges = (a || []).map(function (e) { return e[0] + '>' + e[1]; });
    var req = key.edges.map(function (e) { return e[0] + '>' + e[1]; }), opt = (key.optional || []).map(function (e) { return e[0] + '>' + e[1]; });
    var missing = req.filter(function (e) { return edges.indexOf(e) < 0; });
    var wrong = edges.filter(function (e) { return req.indexOf(e) < 0 && opt.indexOf(e) < 0; });
    var optCount = edges.filter(function (e) { return opt.indexOf(e) >= 0; }).length;
    var ok = !missing.length && !wrong.length && optCount >= (key.minOptional || 0);
    if (key.minCorrect) { ok = !wrong.length && optCount >= key.minCorrect; var dd = optCount >= key.minCorrect ? 'You have enough feeding arrows.' : 'Add more feeding arrows (you need at least ' + key.minCorrect + ').'; if (wrong.length) dd += ' ' + wrong.length + ' arrow' + (wrong.length > 1 ? 's point' : ' points') + ' the wrong way or does not belong.'; return { ok: ok, detail: dd, wrong: wrong, missing: [] }; }
    var d = missing.length ? (missing.length === 1 ? 'One feeding arrow is' : 'Some feeding arrows are') + ' still missing.' : 'All the feeding arrows are there.';
    if (wrong.length) d += ' ' + wrong.length + ' arrow' + (wrong.length > 1 ? 's point' : ' points') + ' the wrong way or does not belong.';
    if (optCount < (key.minOptional || 0)) d += ' Add an arrow to the decomposer.';
    return { ok: ok, detail: d, wrong: wrong, missing: missing };
  };
  C.circuit = function (t, key, a) {
    a = a || {};
    if (t.mode === 'parts') {
      var parts = t.parts || [], sl = (a.slots || []).map(function (k) { return k == null ? null : parts[k]; });
      var full = sl.length >= (t.slots || 4) && sl.every(function (p) { return p; });
      var ins = sl.some(function (p) { return p && p.kind === 'insulator'; });
      var hasSw = sl.some(function (p) { return p && p.kind === 'switch'; }), dev = sl.filter(function (p) { return p && p.kind === 'device'; });
      var okp = full && !ins && (!key.needSwitch || hasSw) && (!key.needDevice || dev.length > 0) && (!hasSw || !!a.switchClosed);
      var dp = !full ? 'Fill every spot in the loop.' : ins ? 'An insulator is blocking the loop.' : (key.needSwitch && !hasSw) ? 'Add a switch so you can turn it on and off.' : (key.needDevice && !dev.length) ? 'Add a device (bulb, buzzer, or motor) to use the energy.' : (hasSw && !a.switchClosed) ? 'Close the switch.' : 'Complete circuit!';
      return { ok: okp, detail: dp, lit: okp, devices: okp ? dev.map(function (p) { return p.name; }) : [] };
    }
    var mats = t.materials || [], gaps = a.gaps || [];
    var filled = gaps.length >= (t.gaps || 2) && gaps.every(function (g) { return g != null; });
    var conduct = filled && gaps.every(function (g) { return mats[g] && mats[g].conductor; });
    var ok = conduct && !!a.switchClosed;
    var d = !filled ? 'Fill every gap.' : !conduct ? 'One gap has an insulator. Electricity cannot pass through it.' : !a.switchClosed ? 'Close the switch to complete the loop.' : 'Complete circuit!';
    return { ok: ok, detail: d, lit: ok };
  };
  C.orbit = function (t, key, a) {
    if (t.mode === 'table') {
      var rows = key.rows || {}, n = 0, tot = 0;
      Object.keys(rows).forEach(function (tm) { tot++; var r = (a && a.rows && a.rows[tm]) || {}; if (r.sun === rows[tm].sun && r.shadow === rows[tm].shadow) n++; });
      return { ok: n === tot, detail: left(n, tot, 'time', 'times', ['needs another look', 'look right', 'need another look']) };
    }
    var ang = ((a && a.angle) || 0) % 360; if (ang < 0) ang += 360;
    var diff = Math.abs(ang - key.angle); diff = Math.min(diff, 360 - diff);
    return { ok: diff <= (key.tolerance || 15), detail: '' };
  };
  C.investigate = function (t, key, a) {
    a = a || {};
    if (!a.ran) return { ok: false, detail: 'Run your trials first.' };
    var okC = a.change === key.change, okM = a.measure === key.measure;
    return { ok: okC && okM, detail: (okC ? '' : 'You changed the wrong variable for this question. ') + (okM ? '' : 'Measure something that answers the question.') };
  };
  C.write = function (t, key, a) {
    a = a || {}; var words = String(a.text || '').trim().split(/\s+/).filter(Boolean).length, need = (key && key.minWords) || t.minWords || 0;
    var cl = t.checklist || [], checked = (a.checks || []).filter(Boolean).length;
    var ok = words >= need && checked >= cl.length;
    return { ok: ok, detail: (words < need ? 'Write at least ' + need + ' words (you have ' + words + '). ' : '') + (checked < cl.length ? 'Check every item on the checklist when your writing does it.' : '') };
  };
  C.writing = C.write;
  function num(v) { if (typeof v === 'number') return v; var t = String(v == null ? '' : v).replace(/[, ]/g, '').replace(/[^0-9.\-\/]/g, ''); if (/^\d+\/\d+$/.test(t)) { var p = t.split('/'); return +p[0] / +p[1]; } return t === '' ? NaN : +t; }
  function same(a, k) { if (typeof k === 'number') return Math.abs(num(a) - k) < 0.0051; return String(a == null ? '' : a).trim().toLowerCase() === String(k).trim().toLowerCase(); }
  C.num = num; C.same = same;
  C.coordinate = function (t, key, a) {
    a = a || {}; var pts = a.points || {}, labels = Object.keys(key.points), n = 0;
    labels.forEach(function (l) { var p = pts[l]; if (p && p[0] === key.points[l][0] && p[1] === key.points[l][1]) n++; });
    var qOk = key.q != null ? a.q === key.q : key.model ? String(a.qText || '').trim().split(/\s+/).filter(Boolean).length >= 3 : true;
    return { ok: n === labels.length && qOk, detail: left(n, labels.length, 'plotted point', 'plotted points', ['is not in the right place yet', 'are in the right place', 'are not in the right place yet']) + (qOk ? '' : key.q != null ? ' Check your answer to the question.' : ' Answer the question in at least 3 words.') };
  };
  C.measure = function (t, key, a) {
    a = a || {}; var ids = Object.keys(key.values), nv = 0, nu = 0;
    ids.forEach(function (id) { var r = (a.values || {})[id]; if (same(r, key.values[id])) nv++; if ((a.units || {})[id] === key.units[id]) nu++; });
    return { ok: nv === ids.length && nu === ids.length, detail: left(nv, ids.length, 'number', 'numbers', ['needs another look', 'look right', 'need another look']).replace(/\.$/, '') + (nu < ids.length ? '; check your units (square units for area, cubic units for volume, plain units for perimeter).' : '.') };
  };
  C.chart = function (t, key, a) {
    a = a || {}; var gOk;
    if (key.dots) { var d = a.dots || {}; gOk = Object.keys(key.dots).every(function (v) { return (d[v] || 0) === key.dots[v]; }) && Object.keys(d).every(function (v) { return (d[v] || 0) === (key.dots[v] || 0); }); }
    else gOk = key.bars.every(function (srs, i) { return srs.every(function (v, j) { return a.bars && a.bars[i] && a.bars[i][j] === v; }); });
    var qs = Object.keys(key.answers), nq = qs.filter(function (q) { return same((a.answers || {})[q], key.answers[q]); }).length;
    return { ok: gOk && nq === qs.length, detail: (gOk ? 'Your graph matches the data. ' : 'Your graph does not match the data table yet. ') + (nq < qs.length ? 'Check your answers to the questions.' : 'Your answers to the questions look right.') };
  };
  C.budget = function (t, key, a) {
    a = a || {}; var okC = Object.keys(key.choose || {}).every(function (k) { return (a.choose || {})[k] === key.choose[k]; });
    var okR = key.requiredTotal == null || same(a.requiredTotal, key.requiredTotal), okS = same(a.totalSpent, key.totalSpent), okB = same(a.finalBalance, key.finalBalance);
    var okQ = !t.question2 || String(a.q2 || '').trim().split(/\s+/).filter(Boolean).length >= 4;
    var d = []; if (!okR) d.push('required total'); if (!okC) d.push('how many you chose'); if (!okS) d.push('total spent'); if (!okB) d.push('final balance'); if (!okQ) d.push('the last question (write at least 4 words)');
    return { ok: okC && okR && okS && okB && okQ, detail: d.length ? 'Check: ' + d.join(', ') + '.' : 'Budget balanced!' };
  };
  // follow-up checkers (School Bot followUps): numeric answers accept fractions and mixed numbers; grid = one choice per row
  function numMixed(v) {
    var t = String(v == null ? '' : v).toLowerCase().replace(/[a-z$]+\.?/g, ' ').replace(/,/g, '').trim().replace(/\s+/g, ' ');
    var mm = /^(-?\d+) (\d+)\/(\d+)$/.exec(t); if (mm) return +mm[1] + (+mm[1] < 0 ? -1 : 1) * (+mm[2] / +mm[3]);
    mm = /^(-?\d+)\/(\d+)$/.exec(t.replace(/ /g, '')); if (mm) return +mm[2] ? +mm[1] / +mm[2] : NaN;
    t = t.replace(/ /g, ''); return t === '' || isNaN(+t) ? NaN : +t;
  }
  C.numMixed = numMixed;
  C.numeric = function (t, key, a) {
    key = key || t; var txt = String(a == null ? '' : a).trim(); if (!txt) return { ok: false, detail: 'Type your answer.' };
    var norm = function (x) { return String(x).toLowerCase().replace(/\s+/g, ' ').trim(); };
    if ((key.accepted || []).some(function (x) { return norm(x) === norm(txt); })) return { ok: true, detail: '' };
    var v = numMixed(txt), tol = key.tol;
    if (tol && !isNaN(v) && Math.abs(v - tol.value) <= (tol.tolerance != null ? tol.tolerance : 0.005)) return { ok: true, detail: '' };
    return { ok: false, detail: isNaN(v) ? 'Type a number, fraction, or mixed number (example: 1 3/4).' : 'Check your math.' };
  };
  C.grid = function (t, key, a) { var n = countSame(a, key); return { ok: arrEq(a, key), detail: left(n, key.length, 'row', 'rows', ['needs another look', 'look right', 'need another look']) }; };
  function check(task, key, answer) { var f = C[task.type]; if (!f) return { ok: false, detail: 'Unknown task type ' + task.type }; return f(task, key, answer); }
  var api = { check: check, checkers: C, setEq: setEq };
  root.DAW_CHECK = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
