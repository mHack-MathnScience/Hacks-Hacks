/* Design a World: original art for the fun pass: townsfolk portraits and achievement medallions (inline SVG,
   flat shapes with soft shading like the rest of the game's art). */
(function () {
  'use strict';
  var A = window.DAW_ART, FA = window.DAW_FUNART = {};
  function sh(c, a) { return A && A.shade ? A.shade(c, a) : c; }
  // ---------- townsfolk portraits ----------
  FA.portrait = function (npc, size) {
    var L = (npc && npc.look) || {}, c = (npc && npc.color) || '#1c7ed6', o = ['<svg viewBox="0 0 80 80" width="' + (size || 64) + '" height="' + (size || 64) + '" class="portrait" aria-hidden="true"><circle cx="40" cy="40" r="39" fill="' + sh(c, 0.75) + '"/>'];
    function eyes(y, glasses) { o.push('<circle cx="32" cy="' + y + '" r="3" fill="#1b1b1b"/><circle cx="48" cy="' + y + '" r="3" fill="#1b1b1b"/><circle cx="33" cy="' + (y - 1) + '" r="1" fill="#fff"/><circle cx="49" cy="' + (y - 1) + '" r="1" fill="#fff"/>'); if (glasses) o.push('<g fill="none" stroke="#343a40" stroke-width="2"><circle cx="32" cy="' + y + '" r="6"/><circle cx="48" cy="' + y + '" r="6"/><path d="M38 ' + y + ' h4"/></g>'); }
    function smile(y) { o.push('<path d="M33 ' + y + ' q7 7 14 0" fill="none" stroke="#5a2d1a" stroke-width="2.4" stroke-linecap="round"/>'); }
    if (L.rock) {
      o.push('<path d="M14 62 Q8 40 22 26 Q34 14 52 20 Q70 26 68 48 Q68 66 50 70 L24 70 Q16 68 14 62Z" fill="#8f8478"/><path d="M22 30 Q32 22 44 24" stroke="#a69c90" stroke-width="3" fill="none"/><circle cx="56" cy="56" r="3" fill="#7a6f63"/><circle cx="24" cy="52" r="2" fill="#7a6f63"/>');
      eyes(42, true); o.push('<path d="M30 54 q10 -5 20 0 q-10 3 -20 0z" fill="#e9ecef"/>'); smile(57);
    } else if (L.robot) {
      o.push('<rect x="18" y="22" width="44" height="40" rx="10" fill="#dee2e6" stroke="' + c + '" stroke-width="3"/><rect x="24" y="30" width="32" height="18" rx="6" fill="#13294b"/><circle cx="32" cy="39" r="4" fill="#66d9e8"/><circle cx="48" cy="39" r="4" fill="#66d9e8"/><path d="M40 22 V12" stroke="#495057" stroke-width="3"/><circle cx="40" cy="10" r="4" fill="#ffd43b"/><rect x="30" y="52" width="20" height="4" rx="2" fill="' + c + '"/><rect x="12" y="36" width="6" height="12" rx="3" fill="#adb5bd"/><rect x="62" y="36" width="6" height="12" rx="3" fill="#adb5bd"/>');
    } else if (L.cloud) {
      o.push('<g fill="#fff" stroke="#c5d6e8" stroke-width="2"><circle cx="26" cy="46" r="14"/><circle cx="40" cy="38" r="18"/><circle cx="56" cy="46" r="13"/><rect x="24" y="44" width="34" height="16" stroke="none"/></g><path d="M26 22 h28 l-4 -8 h-20z" fill="#13294b"/><rect x="24" y="22" width="32" height="5" rx="2" fill="#13294b"/><circle cx="40" cy="17" r="3" fill="#ffd43b"/>');
      eyes(42, false); smile(48); o.push('<circle cx="27" cy="48" r="3" fill="#ffc9c9"/><circle cx="53" cy="48" r="3" fill="#ffc9c9"/>');
    } else {
      var sk = L.skin || '#f1c27d', hr = L.hair || '#3b2a1a';
      o.push('<path d="M14 80 Q16 58 40 58 Q64 58 66 80Z" fill="' + (L.shirt || c) + '"/><rect x="35" y="50" width="10" height="10" fill="' + sh(sk, -0.1) + '"/>');
      if (L.hairStyle === 'long') o.push('<path d="M20 40 Q20 14 40 14 Q60 14 60 40 L62 64 Q52 58 40 58 Q28 58 18 64Z" fill="' + hr + '"/>');
      o.push('<ellipse cx="40" cy="38" rx="17" ry="19" fill="' + sk + '"/>');
      if (L.hairStyle === 'bun') o.push('<path d="M23 34 Q24 18 40 18 Q56 18 57 34 Q50 26 40 26 Q30 26 23 34Z" fill="' + hr + '"/><circle cx="40" cy="14" r="7" fill="' + hr + '"/>');
      else if (L.hairStyle === 'curls') o.push('<g fill="' + hr + '"><circle cx="26" cy="26" r="7"/><circle cx="34" cy="20" r="7"/><circle cx="44" cy="19" r="7"/><circle cx="53" cy="25" r="7"/></g>');
      else if (L.hairStyle === 'long') o.push('<path d="M23 32 Q30 20 40 22 Q50 20 57 32 Q50 24 40 26 Q30 24 23 32Z" fill="' + hr + '"/>');
      eyes(38, L.extra === 'book'); smile(46); o.push('<circle cx="28" cy="44" r="3" fill="' + sh(sk, -0.15) + '" opacity=".5"/><circle cx="52" cy="44" r="3" fill="' + sh(sk, -0.15) + '" opacity=".5"/>');
      if (L.extra === 'hat') o.push('<path d="M16 24 h48 l-4 -4 h-40z" fill="#8a6a45"/><path d="M26 20 Q28 8 40 8 Q52 8 54 20Z" fill="#a07c50"/><rect x="26" y="17" width="28" height="3" fill="#2b8a3e"/>');
      if (L.extra === 'sash') o.push('<path d="M22 62 L58 80 L52 80 L18 66Z" fill="#ffd43b"/>');
      if (L.extra === 'book') o.push('<rect x="50" y="62" width="18" height="14" rx="2" fill="#a0522d"/><rect x="52" y="64" width="14" height="10" fill="#fff4e6"/>');
    }
    o.push('</svg>'); return o.join('');
  };
  // ---------- achievement glyphs (24x24, drawn in white on the medallion) ----------
  var W = 'fill="#fff"', SW = 'fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"';
  FA.glyph = {
    rock: '<path d="M4 18 L7 9 L13 6 L19 9 L21 17 L14 20 Z" ' + W + '/><path d="M9 11 l4 2 M14 9 l2 4" stroke="#0003" stroke-width="1.4"/>',
    rocks: '<circle cx="7" cy="16" r="4" ' + W + '/><circle cx="16" cy="15" r="5" ' + W + '/><circle cx="12" cy="7" r="3" ' + W + '/>',
    mountain: '<path d="M2 20 L9 7 L13 13 L16 9 L22 20 Z" ' + W + '/><path d="M9 7 l-2 4 h4z" fill="#0002"/>',
    canyon: '<path d="M2 6 h7 l2 14 h2 l2 -14 h7 v14 h-20z" ' + W + '/><path d="M11 20 h2 v-3 h-2z" fill="#74c0fc"/>',
    wind: '<path d="M3 9 h11 a3 3 0 1 0 -3 -3 M3 13 h15 a3 3 0 1 1 -3 3 M3 17 h7" ' + SW + '/>',
    hourglass: '<path d="M6 3 h12 M6 21 h12 M7 3 c0 6 10 6 10 9 c0 3 -10 3 -10 9 M17 3 c0 6 -10 6 -10 9 c0 3 10 3 10 9" ' + SW + '/>',
    paw: '<ellipse cx="12" cy="16" rx="5" ry="4" ' + W + '/><circle cx="6" cy="10" r="2.2" ' + W + '/><circle cx="10" cy="6.5" r="2.2" ' + W + '/><circle cx="14" cy="6.5" r="2.2" ' + W + '/><circle cx="18" cy="10" r="2.2" ' + W + '/>',
    book: '<path d="M3 5 q5 -2 9 1 q4 -3 9 -1 v14 q-5 -2 -9 1 q-4 -3 -9 -1z" ' + W + '/><path d="M12 6 v14" stroke="#0003" stroke-width="1.4"/>',
    leaf: '<path d="M5 19 C5 9 12 4 20 4 C20 13 15 19 6 19 Z" ' + W + '/><path d="M6 19 L15 10" stroke="#0003" stroke-width="1.6"/>',
    seedling: '<path d="M12 21 V11" ' + SW + '/><path d="M12 12 C6 12 4 8 4 5 C9 5 12 8 12 12 Z M12 10 C12 6 15 3 20 3 C20 8 17 10 12 10 Z" ' + W + '/>',
    web: '<path d="M12 2 V22 M2 12 H22 M5 5 L19 19 M19 5 L5 19" ' + SW + ' stroke-width="1.4"/><circle cx="12" cy="12" r="4" ' + SW + ' stroke-width="1.4"/><circle cx="12" cy="12" r="8" ' + SW + ' stroke-width="1.4"/>',
    bolt: '<path d="M13 2 L5 13 h6 l-2 9 l9 -12 h-6 z" ' + W + '/>',
    sunmoon: '<circle cx="9" cy="12" r="5" ' + W + '/><path d="M17 4 a6 6 0 1 0 3 11 a5 5 0 0 1 -3 -11z" ' + W + '/>',
    flask: '<path d="M9 3 h6 M10 3 v6 l-5 10 a1.5 1.5 0 0 0 1.3 2 h11.4 a1.5 1.5 0 0 0 1.3 -2 l-5 -10 v-6" ' + SW + '/><path d="M7.5 15 h9 l2 4 h-13z" ' + W + '/>',
    binoculars: '<circle cx="7" cy="15" r="4.5" ' + SW + '/><circle cx="17" cy="15" r="4.5" ' + SW + '/><path d="M9 7 h6 v5 h-6z M5 11 l2 -6 h2 M19 11 l-2 -6 h-2" ' + W + '/>',
    tag: '<path d="M3 12 L12 3 H21 V12 L12 21 Z" ' + W + '/><circle cx="16.5" cy="7.5" r="2" fill="#0003"/>',
    map: '<path d="M3 6 l6 -3 l6 3 l6 -3 v15 l-6 3 l-6 -3 l-6 3z" ' + W + '/><path d="M9 3 v15 M15 6 v15" stroke="#0003" stroke-width="1.4"/>',
    house: '<path d="M3 11 L12 3 L21 11 V21 H3 Z" ' + W + '/><rect x="10" y="14" width="4" height="7" fill="#0003"/>',
    brush: '<path d="M14 3 l7 7 l-8 8 l-7 -7z" ' + W + '/><path d="M6 11 c-3 3 -4 7 -3 10 c3 1 7 0 10 -3" ' + W + '/>',
    palette: '<path d="M12 3 a9 9 0 1 0 0 18 c2 0 2 -2 1 -3 c-1 -1 0 -3 2 -3 h3 a3 3 0 0 0 3 -3 c0 -5 -4 -9 -9 -9z" ' + W + '/><circle cx="7.5" cy="11" r="1.6" fill="#e03131"/><circle cx="10" cy="7" r="1.6" fill="#1c7ed6"/><circle cx="15" cy="7" r="1.6" fill="#2f9e44"/>',
    ruler: '<path d="M3 16 L16 3 L21 8 L8 21 Z" ' + W + '/><path d="M7 14 l2 2 M10 11 l2 2 M13 8 l2 2" stroke="#0004" stroke-width="1.4"/>',
    cards: '<rect x="3" y="6" width="11" height="15" rx="2" ' + W + ' transform="rotate(-10 8 13)"/><rect x="10" y="3" width="11" height="15" rx="2" ' + W + ' opacity=".85"/>',
    compass: '<circle cx="12" cy="12" r="9" ' + SW + '/><path d="M12 5 L15 12 L12 19 L9 12 Z" ' + W + '/>',
    sparkle: '<path d="M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z" ' + W + '/>',
    rainbow: '<path d="M3 18 a9 9 0 0 1 18 0" fill="none" stroke="#ff8787" stroke-width="2.4"/><path d="M6 18 a6 6 0 0 1 12 0" fill="none" stroke="#ffe066" stroke-width="2.4"/><path d="M9 18 a3 3 0 0 1 6 0" fill="none" stroke="#8ce99a" stroke-width="2.4"/>',
    redo: '<path d="M18 9 A7 7 0 1 0 19 15" ' + SW + '/><path d="M19 4 V9 H14" ' + SW + '/>',
    shield: '<path d="M12 2 L20 5 V11 C20 16 16 20 12 22 C8 20 4 16 4 11 V5 Z" ' + W + '/><path d="M8 12 l3 3 l5 -6" stroke="#0005" stroke-width="2" fill="none"/>',
    drop: '<path d="M12 3 C8 9 5 12 5 15 a7 7 0 0 0 14 0 c0 -3 -3 -6 -7 -12z" ' + W + '/>',
    wrench: '<path d="M14 4 a5 5 0 0 0 5 7 l-8 8 a2.5 2.5 0 0 1 -4 -4 l8 -8 a5 5 0 0 0 -1 -3z" ' + W + '/>',
    bulb: '<path d="M12 3 a6 6 0 0 1 4 10.5 V16 H8 V13.5 A6 6 0 0 1 12 3z" ' + W + '/><rect x="9" y="17" width="6" height="2" rx="1" ' + W + '/><rect x="10" y="20" width="4" height="2" rx="1" ' + W + '/>',
    pencil: '<path d="M4 20 L5 15 L16 4 L20 8 L9 19 Z" ' + W + '/><path d="M4 20 l1 -5 l4 4z" fill="#0003"/>',
    heart: '<path d="M12 20 C5 15 3 12 3 8.5 A4.5 4.5 0 0 1 12 6 A4.5 4.5 0 0 1 21 8.5 C21 12 19 15 12 20 Z" ' + W + '/>',
    scroll: '<path d="M6 4 h12 a2 2 0 0 1 0 4 h-1 v10 a2 2 0 0 1 -2 2 h-10 a2 2 0 0 1 0 -4 h1 v-10 a2 2 0 0 1 0 -2z" ' + W + '/><path d="M9 9 h6 M9 12 h6 M9 15 h4" stroke="#0004" stroke-width="1.4"/>',
    handshake: '<path d="M2 12 L7 7 L12 10 L17 7 L22 12 L15 18 L12 16 L9 18 Z" ' + W + '/>',
    megaphone: '<path d="M3 10 h4 l10 -5 v14 l-10 -5 h-4z" ' + W + '/><path d="M7 14 l2 6 h3 l-2 -6" ' + W + '/>',
    magnifier: '<circle cx="10" cy="10" r="6" ' + SW + '/><path d="M15 15 L21 21" ' + SW + ' stroke-width="3"/>',
    stage: '<path d="M2 20 h20 v-3 h-20z" ' + W + '/><path d="M3 4 h18 v3 c-3 0 -3 3 -6 3 s-3 -3 -6 -3 s-3 3 -6 3z" ' + W + '/><circle cx="12" cy="13" r="2.5" ' + W + '/>',
    flag: '<path d="M5 21 V3 M5 4 h12 l-3 4 l3 4 h-12" ' + SW + '/><path d="M5 4 h12 l-3 4 l3 4 h-12z" ' + W + '/>',
    chat: '<path d="M3 5 h18 v11 h-10 l-5 4 v-4 h-3z" ' + W + '/><path d="M7 9 h10 M7 12 h6" stroke="#0004" stroke-width="1.4"/>',
    ear: '<path d="M8 20 c3 0 3 -3 5 -5 c3 -3 5 -5 5 -8 a6 6 0 0 0 -12 0" ' + SW + '/><path d="M10 9 a2 2 0 0 1 4 0 c0 2 -2 2 -2 4" ' + SW + '/>',
    mirror: '<ellipse cx="12" cy="10" rx="6" ry="7" ' + SW + '/><path d="M12 17 V22 M8 22 h8" ' + SW + '/><path d="M9 8 l3 -2" stroke="#fff" stroke-width="1.6"/>',
    star: '<path d="M12 2 l3 6.5 l7 .8 l-5.2 4.8 l1.4 7 L12 17.6 L5.8 21 l1.4 -7 L2 9.3 l7 -.8z" ' + W + '/>',
    coin: '<circle cx="12" cy="12" r="8.5" ' + W + '/><text x="12" y="16.5" text-anchor="middle" font-size="12" font-weight="800" font-family="Lexend, sans-serif" fill="#0005">\u00a2</text>',
    chart: '<path d="M4 20 V4 M4 20 H20" ' + SW + '/><rect x="7" y="12" width="3" height="7" ' + W + '/><rect x="12" y="8" width="3" height="11" ' + W + '/><rect x="17" y="5" width="3" height="14" ' + W + '/>',
    target: '<circle cx="12" cy="12" r="9" ' + SW + '/><circle cx="12" cy="12" r="5" ' + SW + '/><circle cx="12" cy="12" r="1.8" ' + W + '/>',
    quill: '<path d="M20 3 C10 4 6 10 5 19 L7 19 C8 15 9 13 11 12 C15 11 19 8 20 3 Z" ' + W + '/><path d="M4 21 L9 15" ' + SW + '/>',
    tent: '<path d="M2 20 L12 4 L22 20 Z" ' + W + '/><path d="M12 20 L12 12 L9 20 Z" fill="#0004"/>',
    city: '<path d="M3 21 V10 h5 V21 M9 21 V5 h6 V21 M16 21 V12 h5 V21" ' + W + '/><path d="M11 8 h2 M11 11 h2 M11 14 h2" stroke="#0004" stroke-width="1.4"/>',
    sun: '<circle cx="12" cy="12" r="5" ' + W + '/><path d="M12 2 v3 M12 19 v3 M2 12 h3 M19 12 h3 M5 5 l2 2 M17 17 l2 2 M19 5 l-2 2 M5 19 l2 -2" ' + SW + '/>',
    snow: '<path d="M12 3 V21 M4 7.5 L20 16.5 M20 7.5 L4 16.5" ' + SW + '/>',
    rain: '<path d="M7 13 a4.5 4.5 0 0 1 .5 -9 a6 6 0 0 1 11 2 a3.5 3.5 0 0 1 -.5 7z" ' + W + '/><path d="M8 16 l-1 3 M12 16 l-1 3 M16 16 l-1 3" ' + SW + '/>',
    storm: '<path d="M7 13 a4.5 4.5 0 0 1 .5 -9 a6 6 0 0 1 11 2 a3.5 3.5 0 0 1 -.5 7z" ' + W + '/><path d="M12 13 l-3 5 h3 l-2 4" ' + SW + '/>',
    bug: '<ellipse cx="12" cy="13" rx="5" ry="7" ' + W + '/><path d="M12 6 V20 M7 10 L3 8 M7 14 H3 M7 17 L4 20 M17 10 L21 8 M17 14 H21 M17 17 L20 20" ' + SW + ' stroke-width="1.6"/>'
  };
  FA.medal = function (def, tier, locked, size) {
    var ic = def.icon || {}, col = locked ? '#adb5bd' : (ic.color || '#1c7ed6'), ring = locked ? '#ced4da' : tier && def.tiers ? ({ 1: '#b0703a', 2: '#8f9aa5', 3: '#e0a800' })[tier] : '#ffd43b';
    var g = locked && def.secret ? '<text x="12" y="17" text-anchor="middle" font-size="14" font-weight="800" font-family="Lexend, sans-serif" fill="#fff">?</text>' : (FA.glyph[ic.glyph] || FA.glyph.star);
    return '<svg viewBox="0 0 64 64" width="' + (size || 64) + '" height="' + (size || 64) + '" class="medal' + (locked ? ' locked' : '') + '" aria-hidden="true"><circle cx="32" cy="33" r="29" fill="#0002"/><circle cx="32" cy="31" r="29" fill="' + ring + '"/><circle cx="32" cy="31" r="23" fill="' + col + '"/><circle cx="32" cy="31" r="23" fill="url(#medal-sheen)" opacity=".35"/><defs><linearGradient id="medal-sheen" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/></linearGradient></defs><g transform="translate(16 15) scale(1.333)"' + (locked ? ' opacity=".55"' : '') + '>' + g + '</g>' +
      (tier && def.tiers && !locked ? '<g>' + [0, 1, 2].slice(0, tier).map(function (k) { return '<circle cx="' + (24 + k * 8) + '" cy="58" r="3" fill="' + ring + '" stroke="#fff" stroke-width="1"/>'; }).join('') + '</g>' : '') + '</svg>';
  };
})();
