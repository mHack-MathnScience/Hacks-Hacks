/* Design a World: fun-layer panels. Card binder (flip cards and nicknames), Achievements gallery,
   Looks (unlocked building skins and map themes), the Survival Season lab, and the optional
   student-only "My Achievements" Showcase page (never in teacher views or exports). */
(function () {
  'use strict';
  var U = window.DAW_UI, S = window.DAW_STATE, A = window.DAW_ART, F = window.DAW_FUNC, FA = window.DAW_FUNART, esc = U.esc;
  var FU = window.DAW_FUNUI;
  function app() { return window.DAW_APP; }
  function dx() { return window.DAW_DESC.shared(); }
  function DUI() { return window.DAW_DESCUI; }
  var KIND = { lf: 'Landform', ft: 'Resource & weather', org: 'Living thing' };

  // ---------- binder: Cards | Achievements | Looks ----------
  FU.binder = function (tab) {
    var save = app().save(), ix = app().ix(), md = U.modal({ title: 'My Collection', full: true }); md.el.id = 'binder-modal';
    var cur = tab || 'cards', filt = 'all';
    function paint() {
      var cs = F.cards(save), got = cs.filter(function (c) { return c.got; }).length, ac = F.achCounts(save);
      md.body.innerHTML = '<div class="seg binder-tabs" role="tablist">' + [['cards', 'Field Guide cards (' + got + ')'], ['ach', 'Achievements (' + ac.earned + ')'], ['looks', 'Looks']].map(function (t) { return '<button class="seg-b' + (t[0] === cur ? ' on' : '') + '" role="tab" aria-selected="' + (t[0] === cur) + '" data-tab="' + t[0] + '">' + t[1] + '</button>'; }).join('') + '</div><div class="binder-body" data-tab="' + cur + '"></div>';
      var host = U.$('.binder-body', md.body);
      if (cur === 'cards') cards(host, cs); else if (cur === 'ach') gallery(host); else looks(host);
    }
    function cards(host, cs) {
      var list = cs.filter(function (c) { return filt === 'all' || c.kind === filt; }).map(function (c, k) { return [c, k]; }).sort(function (a, b) { return (b[0].got ? 1 : 0) - (a[0].got ? 1 : 0) || a[1] - b[1]; }).map(function (p) { return p[0]; }), got = list.filter(function (c) { return c.got; }).length;
      host.innerHTML = '<div class="binder-bar"><p class="small">Every Field Guide entry you finish becomes a card. Tap a card to flip it. Name your creatures on the back!</p><div class="seg small card-filt">' + [['all', 'All'], ['lf', 'Landforms'], ['ft', 'Resources'], ['org', 'Living things']].map(function (f) { return '<button class="seg-b' + (filt === f[0] ? ' on' : '') + '" data-f="' + f[0] + '">' + f[1] + '</button>'; }).join('') + '</div><span class="small">' + got + ' of ' + list.length + ' found</span></div>' +
        '<div class="card-grid">' + list.map(cardHtml).join('') + '</div>';
    }
    function art(c, size) { return c.kind === 'org' ? DUI().orgIcon(c.id, size) : A.thumb(c.art || 'plain', size, 3); }
    function back(c) {
      var x = dx(), d = c.kind === 'lf' ? x.lf[c.id] : c.kind === 'ft' ? x.ft[c.id] : x.org[c.id]; if (!d) return '';
      if (c.kind === 'lf') return '<p><b>Made by:</b> ' + esc((d.agent || []).join(', ')) + '</p><p><b>How:</b> ' + esc((d.process || []).join(' + ')) + '</p><p><b>Speed:</b> ' + esc({ fast: 'fast (days)', medium: 'medium (hundreds of years)', slow: 'slow (thousands to millions of years)' }[d.timescale] || d.timescale || '') + '</p>';
      if (c.kind === 'ft') return '<p><b>Group:</b> ' + esc(d.group || '') + '</p>' + (d.model ? '<p class="small">' + esc(String(d.model).slice(0, 110)) + '</p>' : '');
      return '<p><b>Home:</b> ' + esc((d.biomes || []).map(function (b) { return (x.biome[b] || {}).name || b; }).join(', ')) + '</p><ul class="fc-traits">' + (d.traits || []).slice(0, 3).map(function (t) { return '<li>' + esc(t.text) + '</li>'; }).join('') + '</ul>' +
        '<label class="nick-row" onclick="event.stopPropagation()">Nickname <input class="nick-in" data-org="' + esc(c.id) + '" maxlength="20" value="' + esc(c.nick) + '" placeholder="Name it!"></label><button class="btn small primary nick-save" data-org="' + esc(c.id) + '">Save name</button>';
    }
    function cardHtml(c) {
      if (!c.got) return '<div class="fcard locked k-' + c.kind + '" data-key="' + esc(c.key) + '"><div class="fc-inner"><div class="fc-front"><span class="fc-art sil">' + art(c, 76) + '</span><b>Not found yet</b><small>' + esc(KIND[c.kind]) + '</small></div></div></div>';
      return '<div class="fcard k-' + c.kind + (c.fav ? ' fav' : '') + '" data-key="' + esc(c.key) + '" role="button" tabindex="0" aria-label="' + esc(c.name) + ' card. Tap to flip."><span class="fc-inner"><span class="fc-front">' + (c.fav ? '<span class="fc-star" title="Favorite">\u2605</span>' : '') + '<span class="fc-art">' + art(c, 76) + '</span><b>' + esc(c.nick ? c.nick : c.name) + '</b><small>' + esc(c.nick ? c.name : KIND[c.kind]) + '</small></span><span class="fc-back"><b>' + esc(c.name) + '</b>' + back(c) + '</span></span></div>';
    }
    function gallery(host) {
      var stt = F.achState(save, ix), types = F.achData().types || {}, sc = F.ensure(save);
      host.innerHTML = '<div class="binder-bar"><p class="small">Achievements are just for fun. They never go in your teacher report.</p><label class="cbx small"><input type="checkbox" class="ach-sc"' + (sc.showcaseAch ? ' checked' : '') + '> Show a <b>My Achievements</b> page in my Showcase</label></div>' +
        Object.keys(types).map(function (ty) {
          var rows = stt.filter(function (a) { return a.def.type === ty; }); if (!rows.length) return '';
          return '<h4 class="strand">' + esc(types[ty]) + '</h4><div class="ach-grid">' + rows.map(achHtml).join('') + '</div>';
        }).join('');
    }
    function achHtml(a) {
      var d = a.def, hide = a.secret && !a.earned, tn = d.tiers && a.earned ? F.TIER[a.tier] : '';
      return '<div class="ach' + (a.earned ? ' earned' : ' locked') + (a.secret ? ' secret' : '') + (tn ? ' tier-' + tn : '') + '" data-id="' + esc(d.id) + '" data-tier="' + a.tier + '" tabindex="0">' + FA.medal(d, a.tier, !a.earned, 60) +
        '<span class="ach-t"><b>' + (hide ? '???' : esc(d.name)) + (tn ? ' <span class="tier ' + tn + '">' + tn + '</span>' : '') + '</b><small>' + (hide ? '???' : esc(a.earned ? d.desc : d.hint)) + '</small>' +
        (d.tiers && !hide ? '<small class="tier-next">' + d.tiers.map(function (t, k) { return '<span class="pip' + (a.tier > k ? ' on ' + F.TIER[k + 1] : '') + '" title="' + F.TIER[k + 1] + ': ' + t + '">' + t + '</span>'; }).join('') + (a.next ? ' Next: ' + a.next : '') + '</small>' : '') + '</span></div>';
    }
    function looks(host) {
      host.innerHTML = '<p class="small">Finish stages and earn achievements to unlock new looks for your world.</p>' + [['building', 'Building looks'], ['theme', 'Map themes']].map(function (g) {
        var cur2 = g[0] === 'building' ? F.ensure(save).skin : F.ensure(save).theme;
        return '<h4 class="strand">' + g[1] + '</h4><div class="look-grid">' + F.skins(g[0]).map(function (k) {
          var un = F.isUnlocked(save, ix, k), u = k.unlock || {}, how = u.stageComplete ? 'Finish Stage ' + u.stageComplete : u.achievement ? 'Earn ' + ((F.achDef(u.achievement) || {}).name || 'an achievement') : '';
          return '<div class="look' + (un ? '' : ' locked') + (cur2 === k.id ? ' on' : '') + '" data-skin="' + esc(k.id) + '">' + FU.skinPreview(k, 70) + '<span><b>' + esc(k.name) + '</b><small>' + esc(un ? k.desc : 'Locked: ' + how) + '</small></span>' + (un ? (cur2 === k.id ? '<span class="tag">In use</span>' : '<button class="btn small primary use-skin" data-skin="' + esc(k.id) + '">Use</button>') : A.icon('lock', 16)) + '</div>';
        }).join('') + '</div>';
      }).join('');
    }
    md.body.addEventListener('click', function (e) {
      var t = e.target;
      var tb = t.closest('.binder-tabs .seg-b'); if (tb) { cur = tb.getAttribute('data-tab'); FU.sfx('tap'); paint(); return; }
      var fb = t.closest('.card-filt .seg-b'); if (fb) { filt = fb.getAttribute('data-f'); paint(); return; }
      var ns = t.closest('.nick-save'); if (ns) { e.stopPropagation(); var id = ns.getAttribute('data-org'), inp = U.$('.nick-in[data-org="' + id + '"]', md.body), v = F.setNick(save, id, inp.value); app().commit('Nickname', { noRender: true }); FU.checkNow(); U.toast(v ? 'Named it ' + esc(v) + '!' : 'Nickname removed.', 'good', 1800); var fc = ns.closest('.fcard'); var b = fc && fc.querySelector('.fc-front b'); if (b && v) b.textContent = v; return; }
      if (t.closest('.nick-row')) return;
      var fc2 = t.closest('.fcard:not(.locked)'); if (fc2) { fc2.classList.toggle('flipped'); FU.sfx('flip'); return; }
      var us = t.closest('.use-skin'); if (us) { F.apply(save, ix, us.getAttribute('data-skin')); app().commit('Changed look'); FU.checkNow(); FU.sfx('unlock'); paint(); return; }
    });
    md.body.addEventListener('change', function (e) { if (e.target.classList.contains('ach-sc')) { F.ensure(save).showcaseAch = e.target.checked; app().commit(null, { quiet: true, noRender: true, noFun: true }); } });
    md.body.addEventListener('keydown', function (e) { if (e.target.classList.contains('nick-in') && e.key === 'Enter') { e.preventDefault(); var b = U.$('.nick-save[data-org="' + e.target.getAttribute('data-org') + '"]', md.body); if (b) b.click(); } if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('fcard')) { e.preventDefault(); e.target.click(); } });
    paint(); return md;
  };

  // ---------- optional, student-chosen Showcase page ----------
  FU.showcaseAchOn = function (save) { return !!(save && save.fun && save.fun.showcaseAch); };
  FU.showcaseAch = function (host) {
    var save = app().save(), got = F.achState(save, app().ix()).filter(function (a) { return a.earned; });
    host.innerHTML = '<div class="sc-ach"><p class="small">Just for fun, and only here in your Showcase. Turn it off in Achievements.</p>' + (got.length ? '<div class="ach-grid">' + got.map(function (a) { var tn = a.def.tiers ? F.TIER[a.tier] : ''; return '<div class="ach earned' + (tn ? ' tier-' + tn : '') + '">' + FA.medal(a.def, a.tier, false, 56) + '<span class="ach-t"><b>' + esc(a.def.name) + (tn ? ' <span class="tier ' + tn + '">' + tn + '</span>' : '') + '</b><small>' + esc(a.def.desc) + '</small></span></div>'; }).join('') + '</div>' : '<p>No achievements yet. Keep exploring!</p>') + '</div>';
  };

  // ---------- Survival Season lab ----------
  FU.season = function (o) {
    o = o || {}; var save = app().save(), ix = app().ix(), x = dx(), md = U.modal({ title: 'Survival Season', full: true }); md.el.id = 'season-modal';
    var biomes = Object.keys(x.biome), onMap = {}, BI = window.DAW_BIOMES, BUI = window.DAW_BIOMEUI;
    save.world.tiles.forEach(function (t) { var b = window.DAW_DESC.habitat(x, save, t, window.DAW_ITEMS.get(t.t).art).id; if (b) onMap[b] = 1; });
    if (BI) BI.kinds(save).forEach(function (c) { onMap[BI.byCode[c].dx] = 1; });
    var biome = o.biome || (BUI && BUI.lastBiome()) || Object.keys(onMap)[0] || 'forest', cond = o.cond || 'mild', picks = (o.orgs || []).slice(0, 6), run = null, rae = F.npc('rae'), playing = null;
    var COND_IC = { mild: 'sun', dry: 'sun', cold: 'snow', hot: 'sun' };
    function pool() { var all = (x.data.organisms || []); return all.filter(function (g) { return g.biomes.indexOf(biome) >= 0; }).concat(all.filter(function (g) { return g.biomes.indexOf(biome) < 0; })); }
    function paint() {
      var bm = x.biome[biome] || { name: biome }, cnd = F.cond(cond);
      md.body.innerHTML = '<div class="ss">' +
        '<section class="ss-setup"><h4>1. Biome</h4><div class="chips ss-biomes">' + biomes.map(function (b) { return '<button class="chipbtn ss-biome' + (b === biome ? ' on' : '') + '" data-b="' + b + '" aria-pressed="' + (b === biome) + '">' + esc((x.biome[b] || {}).name || b) + (onMap[b] ? ' \u2713' : '') + '</button>'; }).join('') + '</div>' +
        '<h4>2. Weather this season</h4><div class="chips ss-conds">' + F.conditions().map(function (c) { return '<button class="chipbtn ss-cond' + (c.id === cond ? ' on' : '') + '" data-c="' + c.id + '" aria-pressed="' + (c.id === cond) + '" title="' + esc(c.text) + '">' + esc(c.name) + '</button>'; }).join('') + '</div>' +
        '<h4>3. Living things <small>(' + picks.length + ' of 6)</small></h4><div class="ss-pool">' + pool().map(function (g) { var on = picks.indexOf(g.id) >= 0, home = g.biomes.indexOf(biome) >= 0, sr = run && run.results.filter(function (r) { return r.id === g.id; })[0]; return '<button class="ss-org' + (on ? ' on' : '') + (home ? ' home' : '') + (sr ? ' ' + sr.status : '') + '" data-o="' + g.id + '" aria-pressed="' + on + '">' + DUI().orgIcon(g.id, 34) + '<span><b>' + esc(g.name) + '</b><small>' + esc(g.role || g.kind) + (home ? ' \u00b7 lives here' : '') + '</small></span></button>'; }).join('') + '</div></section>' +
        '<section class="ss-stage"><div class="ss-scene" data-done="' + (run ? 1 : 0) + '" data-all="' + (run && run.allThrive ? 1 : 0) + '">' + scene(bm, cnd) + '</div><div class="ss-cal"><span>Spring</span><span>Summer</span><span>Fall</span><span>Winter</span><i class="ss-mark"></i></div>' +
        '<div class="btn-row"><button class="btn primary big ss-run"' + (picks.length ? '' : ' disabled') + '>' + (run ? 'Run it again \u25b6' : 'Run the season \u25b6') + '</button></div>' + (picks.length ? '' : '<p class="small ss-note">Pick at least one living thing.</p>') + '</section>' +
        '<section class="ss-result" aria-live="polite">' + result() + '</section></div>';
    }
    function scene(bm, cnd) {
      var ground = { desert: '#e9c46a', grassland: '#a3c45a', forest: '#5c8d3a', mountain: '#9aa5a8', tundra: '#dfe7e3', freshwater: '#6fb3d9', coast: '#e6d3a3', ocean: '#3d85c6' }[biome] || '#8fbf5a';
      var sky = cond === 'cold' ? '#dbe9f6' : cond === 'hot' ? '#ffe3c2' : cond === 'dry' ? '#f8eccf' : '#d6efff';
      var o = '<svg viewBox="0 0 560 250" class="ss-svg" role="img" aria-label="' + esc(bm.name + ', ' + cnd.name) + '"><rect width="560" height="250" fill="' + sky + '"/><circle class="ss-sun" cx="490" cy="46" r="24" fill="' + (cond === 'cold' ? '#fff3bf' : '#ffd43b') + '"/>';
      if (cond === 'cold') o += [60, 150, 260, 380, 470].map(function (sx, k) { return '<text x="' + sx + '" y="' + (40 + (k % 2) * 30) + '" font-size="18" fill="#fff">\u2744</text>'; }).join('');
      if (cond === 'mild') o += '<g fill="#fff" opacity=".9"><ellipse cx="140" cy="50" rx="40" ry="14"/><ellipse cx="160" cy="40" rx="22" ry="14"/></g>';
      o += '<path d="M0 150 Q140 120 280 140 T560 135 V250 H0Z" fill="' + ground + '"/><g class="ss-bg" transform="translate(30 70) scale(.9)" opacity=".85">' + A.thumb(((x.biome[biome] || {}).items || ['plain'])[0], 120, 3).replace('<svg', '<svg x="0" y="0"') + '</g>';
      var n = picks.length, gap = 500 / Math.max(1, n);
      o += picks.map(function (id, k) { var r = run && run.results.filter(function (q) { return q.id === id; })[0], cls = r ? r.status : ''; return '<g class="ss-crit ' + cls + '" data-o="' + id + '" transform="translate(' + (30 + gap * k + gap / 2 - 28) + ' 150)"><g class="ss-bob">' + DUI().orgIcon(id, 56).replace('<svg', '<svg x="0" y="0"') + '</g>' + (r ? '<g transform="translate(28 74)"><rect x="-34" y="-12" width="68" height="20" rx="10" fill="' + (r.status === 'thrive' ? '#2b8a3e' : '#e8590c') + '"/><text y="3" text-anchor="middle" font-size="11" font-weight="700" fill="#fff" font-family="Lexend, sans-serif">' + (r.status === 'thrive' ? 'Thriving' : 'Struggling') + '</text></g>' : '') + '</g>'; }).join('');
      return o + '</svg>';
    }
    function result() {
      if (!run) return '<h4>Results</h4>' + FU.say(rae, 'Pick a biome, the weather, and some living things. Then press Run. Who will thrive?', 'small') + '<p class="small">Tip: living things need a home that fits their traits, and food to eat.</p>';
      var thr = run.results.filter(function (r) { return r.status === 'thrive'; }).length;
      return '<h4>Results: ' + thr + ' of ' + run.total + ' thriving</h4>' + (run.allThrive ? '' : '<div class="btn-row left ss-retry-row"><button class="btn primary ss-retry">Swap and try again</button></div>') + FU.say(rae, run.allThrive ? F.line(rae, 'cheer', {}, 'ss' + F.ensure(save).seasons.length) : F.line(rae, 'oops', {}, 'ss' + F.ensure(save).seasons.length), 'small') +
        '<ul class="ss-why">' + run.results.map(function (r) { return '<li class="' + r.status + '" data-o="' + r.id + '"><b>' + (r.status === 'thrive' ? '\u2714 ' : '\u2193 ') + esc(r.name) + '</b><span>' + r.why.map(esc).join(' ') + '</span></li>'; }).join('') + '</ul>' +
        (run.foodWeb ? '<p class="fb good small">' + A.icon('check', 14) + ' Complete food web: producers, consumers, and decomposers all thrived.</p>' : '<p class="small">A full food web needs a producer, a consumer, and a decomposer.</p>') +
        '';
    }
    function play(done) {
      var scn = U.$('.ss-scene', md.body), mk = U.$('.ss-mark', md.body); scn.classList.add('playing');
      if (FU.motionOff()) { mk.style.left = '100%'; done(); return; }
      var t0 = performance.now(), dur = 2600, last = 0;
      function fr(ts) { if (!document.body.contains(scn)) return; if (document.hidden) { playing = requestAnimationFrame(fr); t0 += 16; return; } var p = Math.min(1, (ts - t0) / dur); if (ts - last > 33) { last = ts; mk.style.left = (p * 100).toFixed(1) + '%'; U.$$('.ss-bob', scn).forEach(function (b, k) { b.setAttribute('transform', 'translate(0 ' + (-Math.abs(Math.sin(p * 12 + k)) * 6).toFixed(1) + ')'); }); } if (p < 1) playing = requestAnimationFrame(fr); else done(); }
      playing = requestAnimationFrame(fr);
    }
    md.body.addEventListener('click', function (e) {
      var t = e.target, b;
      if ((b = t.closest('.ss-biome'))) { biome = b.getAttribute('data-b'); run = null; FU.sfx('tap'); paint(); return; }
      if ((b = t.closest('.ss-cond'))) { cond = b.getAttribute('data-c'); run = null; FU.sfx('tap'); paint(); return; }
      if ((b = t.closest('.ss-org'))) { var id = b.getAttribute('data-o'), k = picks.indexOf(id); if (k >= 0) picks.splice(k, 1); else if (picks.length < 6) picks.push(id); else { U.toast('Six is the most. Tap one to take it out first.'); return; } run = null; FU.sfx('tap'); paint(); return; }
      if (t.closest('.ss-retry')) { var pl = U.$('.ss-pool', md.body); U.$$('.ss-org.struggle', md.body).forEach(function (q) { q.classList.add('nudge'); }); if (pl) { var first = U.$('.ss-org.struggle', md.body); if (first) first.scrollIntoView({ block: 'nearest' }); } U.toast('Tap a struggling one to take it out, then add one that fits.', '', 3500); return; }
      if (t.closest('.ss-run')) {
        if (!picks.length) return; U.$('.ss-run', md.body).disabled = true; run = null; FU.sfx('soft');
        play(function () {
          run = F.runSeason(x, biome, cond, picks); F.recordSeason(save, run); app().commit('Survival season', { noRender: true }); FU.checkNow();
          paint(); FU.sfx(run.allThrive ? 'cheer' : 'bad'); if (run.allThrive) FU.confetti();
        });
      }
    });
    paint(); return md;
  };
})();
