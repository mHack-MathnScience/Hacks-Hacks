/* Design a World: short landform time-lapse (original SVG art) with a years-passed clock.
   play(host, {agent, ok, timescale, art, name}) animates ~2.4 s with requestAnimationFrame (about 30 fps),
   jumps straight to the end with reduced motion, and pauses while the tab is hidden. */
(function () {
  'use strict';
  var A = window.DAW_ART, TL = window.DAW_TL = {};
  function ease(p) { return p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2; }
  function fmt(n) { return Math.round(n).toLocaleString('en-US'); }
  TL.clock = function (ts, p) {
    var F = window.DAW_FUN_DATA || {}, T = (F.timelapse || {})[ts] || { years: 1000, unit: 'years' }, v = T.years * ease(p);
    return (T.unit === 'days' ? 'Days passed: ' : 'Years passed: ') + fmt(v);
  };
  // one frame of the scene; p = 0..1
  TL.frame = function (agent, ok, p) {
    var e = ease(p), o = ['<rect width="360" height="220" fill="#dff1fb"/><circle cx="318" cy="34" r="16" fill="#ffd43b"/>'];
    var strata = ['#c9a27a', '#b5835a', '#d8b48a', '#a96f44'], k;
    if (agent === 'volcanic') {
      o.push('<rect y="170" width="360" height="50" fill="#6b8f3a"/>');
      var h = 20 + 110 * (ok ? e : e * 0.25); o.push('<path d="M' + (180 - h * 1.1) + ' 172 L180 ' + (172 - h) + ' L' + (180 + h * 1.1) + ' 172 Z" fill="#5c4a3f"/>');
      if (ok) o.push('<path d="M172 ' + (172 - h) + ' q8 -12 16 0 l-3 ' + h * 0.5 + ' l-4 -6 l-4 ' + h * 0.4 + 'z" fill="#f76707" opacity="' + (0.4 + 0.5 * Math.sin(p * 20) * 0.5 + 0.3) + '"/>');
      return o.join('');
    }
    for (k = 0; k < 4; k++) o.push('<rect y="' + (110 + k * 28) + '" width="360" height="28" fill="' + strata[k] + '"/>');
    o.push('<rect y="104" width="360" height="8" fill="#7fb24a"/>');
    if (agent === 'water') {
      var d = 8 + 96 * (ok ? e : e * 0.15), w = 30 + 60 * (ok ? e : 0.1);
      o.push('<path d="M' + (180 - w) + ' 104 L' + (180 - 10) + ' ' + (104 + d) + ' L' + (180 + 10) + ' ' + (104 + d) + ' L' + (180 + w) + ' 104 Z" fill="#dff1fb"/>');
      o.push('<path d="M' + (180 - 14) + ' ' + (104 + d - 6) + ' L' + (180 + 14) + ' ' + (104 + d - 6) + ' L' + (180 + 10) + ' ' + (104 + d) + ' L' + (180 - 10) + ' ' + (104 + d) + 'Z" fill="#3ea3e3"/>');
      for (k = 0; k < 7; k++) { var x = (k * 53 + p * 300) % 360; o.push('<circle cx="' + x + '" cy="' + (98 - (k % 3) * 22 - 10) + '" r="2.4" fill="#3a8fd6" opacity=".7"/>'); }
      for (k = 0; k < 5; k++) o.push('<circle cx="' + (240 + ((k * 23 + p * 120) % 110)) + '" cy="' + (104 + d - 3) + '" r="2" fill="#a9825a"/>');
    } else if (agent === 'wind') {
      var hole = 30 * (ok ? e : e * 0.15);
      o.push('<path d="M120 104 L120 46 L240 46 L240 104 Z" fill="#c9733f"/><path d="M120 46 L240 46 L232 38 L128 38 Z" fill="#e0995e"/>');
      o.push('<ellipse cx="180" cy="' + (100 - hole * 0.6) + '" rx="' + hole + '" ry="' + hole * 0.9 + '" fill="#dff1fb"/>');
      var dune = 30 * (ok ? e : 0.2); o.push('<path d="M250 104 Q300 ' + (104 - dune) + ' 350 104Z" fill="#e8c27a"/>');
      for (k = 0; k < 9; k++) { var xx = (k * 41 + p * 520) % 380 - 10; o.push('<line x1="' + xx + '" y1="' + (30 + k * 8) + '" x2="' + (xx + 22) + '" y2="' + (30 + k * 8) + '" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".85"/>'); }
    } else if (agent === 'ice') {
      var y0 = 104 + 70 * (ok ? e : e * 0.15);
      o.push('<path d="M90 104 Q180 ' + (y0 + 30) + ' 270 104 Z" fill="#dff1fb"/>');
      var gx = -120 + 300 * e; o.push('<path d="M' + gx + ' 40 L' + (gx + 150) + ' 40 L' + (gx + 190) + ' 104 L' + (gx - 20) + ' 104 Z" fill="#e7f5ff" stroke="#a5d8ff" stroke-width="3" opacity="' + (1 - Math.max(0, e - 0.85) * 5) + '"/>');
    } else { // gravity
      var pile = 34 * (ok ? e : e * 0.2);
      o.push('<path d="M0 104 L120 40 L170 40 L170 104 Z" fill="#9a7650"/>');
      o.push('<path d="M170 104 Q220 ' + (104 - pile) + ' 280 104 Z" fill="#7d6e60"/>');
      for (k = 0; k < 6; k++) { var t = (p * 3 + k / 6) % 1; o.push('<circle cx="' + (130 + t * 110) + '" cy="' + (44 + t * t * 58) + '" r="' + (4 + k % 3) + '" fill="#6c5a4a"/>'); }
    }
    return o.join('');
  };
  TL.markup = function (name) { return '<div class="tl-box" aria-label="Time-lapse: drop a force here"><svg class="tl-svg" viewBox="0 0 360 220" role="img" aria-label="Time-lapse of the land changing"><g class="tl-g">' + TL.frame('water', false, 0) + '</g></svg><div class="tl-clock" aria-live="polite">Years passed: 0</div><div class="tl-end" hidden></div><div class="tl-drop-hint">Drop a force here</div></div>'; };
  function calm() { var s = window.DAW_APP && DAW_APP.settings ? DAW_APP.settings() : {}; return !!s.calm || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches && s.calm !== false); }
  TL.play = function (host, o) {
    var g = host.querySelector('.tl-g'), clock = host.querySelector('.tl-clock'), end = host.querySelector('.tl-end'), dur = 2400, t0 = null, last = 0, paused = 0;
    if (host._tl) cancelAnimationFrame(host._tl); host.classList.add('playing'); end.hidden = true; host.setAttribute('data-agent', o.agent); host.setAttribute('data-ok', o.ok ? '1' : '0');
    function draw(p) { g.innerHTML = TL.frame(o.agent, o.ok, p); clock.textContent = TL.clock(o.timescale, p); }
    function finish() { draw(1); host.classList.remove('playing'); host.setAttribute('data-done', '1'); end.innerHTML = o.ok ? (o.art && A ? A.thumb(o.art, 70, 4) : '') + '<b>' + (o.name || '') + '</b>' : '<b>Hmm. Not much changed.</b>'; end.hidden = false; if (o.onDone) o.onDone(); }
    host.removeAttribute('data-done');
    if (calm() || o.instant) { finish(); return; }
    function step(ts) {
      if (document.hidden) { paused = ts; host._tl = requestAnimationFrame(step); return; }
      if (t0 == null) t0 = ts; if (paused) { t0 += ts - paused; paused = 0; }
      var p = Math.min(1, (ts - t0) / dur);
      if (ts - last >= 33 || p >= 1) { last = ts; draw(p); }
      if (p < 1) host._tl = requestAnimationFrame(step); else finish();
    }
    host._tl = requestAnimationFrame(step);
  };
})();
