/* Design a World: read-aloud voice picking. Ranks the voices the browser already has, so no downloads and it works offline.
   Voice choice and speed are saved on this device only (localStorage "daw.voice"), never in save codes or reports. */
(function (root) {
  var V = {}, KEY = 'daw.voice';
  // Higher = nicer sounding. Natural/neural/Google/Apple first; old Microsoft desktop voices and eSpeak last.
  var RULES = [
    [/natural|neural/i, 100], [/google (us|uk) english/i, 92], [/google.*english/i, 88], [/\b(samantha|ava|allison|siri|zoe|evan|nicky|serena|karen|daniel)\b/i, 85],
    [/chrome ?os/i, 60], [/\b(aria|jenny|guy|sonia|libby|ryan)\b/i, 80],
    [/microsoft.*\b(david|zira|mark|hazel|george|susan)\b|\b(david|zira|mark|hazel)\b/i, 20], [/espeak|festival|flite/i, 5]
  ];
  V.score = function (v) {
    var s = 40, n = (v && v.name) || ''; for (var i = 0; i < RULES.length; i++) if (RULES[i][0].test(n)) { s = RULES[i][1]; break; }
    var l = String((v && v.lang) || '').replace('_', '-');
    if (/^en-US/i.test(l)) s += 6; else if (/^en-(GB|AU|CA|IN)/i.test(l)) s += 3; else if (!/^en/i.test(l)) s = -1000;
    return s;
  };
  // voices usable right now: English only; when offline, only on-device voices
  V.usable = function (voices, o) { o = o || {}; var on = o.online !== false; return (voices || []).filter(function (v) { return v && V.score(v) > -500 && (on || v.localService !== false); }); };
  V.rank = function (voices, o) {
    o = o || {};
    return V.usable(voices, o).map(function (v, i) { return { v: v, s: V.score(v) + (v.localService === false ? 0 : 2), i: i }; })
      .sort(function (a, b) { return b.s - a.s || a.i - b.i; }).map(function (x) { return x.v; });
  };
  V.best = function (voices, o) { return V.rank(voices, o)[0] || null; };
  // the student's saved pick wins if it is still usable; otherwise the best one
  V.choose = function (voices, prefName, o) { var u = V.usable(voices, o), p = prefName && u.filter(function (v) { return v.name === prefName; })[0]; return p || V.best(voices, o); };
  V.label = function (v) { var tag = v.localService === false ? ' (needs internet)' : ''; return v.name + tag; };
  V.get = function () { try { var o = JSON.parse(root.localStorage.getItem(KEY) || '{}'); return { name: o.name || '', rate: +o.rate || 0, voice: o.voice || '' }; } catch (e) { return { name: '', rate: 0, voice: '' }; } };
  V.set = function (o) { try { var c = V.get(); if (o.name != null) c.name = o.name; if (o.rate != null) c.rate = +o.rate; if (o.voice != null) c.voice = o.voice; root.localStorage.setItem(KEY, JSON.stringify(c)); } catch (e) {} };
  V.rate = function () { var r = V.get().rate; return r >= 0.5 && r <= 1.6 ? r : 0.95; };
  V.voices = function () { try { return root.speechSynthesis ? root.speechSynthesis.getVoices() : []; } catch (e) { return []; } };
  V.online = function () { return !(root.navigator && root.navigator.onLine === false); };
  V.pick = function () { return V.choose(V.voices(), V.get().name, { online: V.online() }); };
  // ---------- pre-made voice clips (Kokoro, made once on a computer and shipped in audio/) ----------
  // window.DAW_AUDIO = { fmt, dir, def, voices: { af_heart: { name, ids: [...] } } } comes from audio/manifest.js
  V.DEFAULT = 'af_heart';
  V.man = function () { return root.DAW_AUDIO || null; };
  V.clipVoices = function () { var m = V.man(); return m ? Object.keys(m.voices || {}).filter(function (k) { return (m.voices[k].ids || []).length; }) : []; };
  V.clipVoice = function (pref) { var vs = V.clipVoices(), p = pref == null ? V.get().voice : pref; if (p === 'builtin') return null; if (p && vs.indexOf(p) >= 0) return p; var d = (V.man() && V.man().def) || V.DEFAULT; return vs.indexOf(d) >= 0 ? d : vs[0] || null; };
  V.clipUrl = function (text, voice) {
    var m = V.man(), N = root.DAW_NARR; if (!m || !N) return null; var first = V.clipVoice(voice), id = N.id(text), def = m.def || V.DEFAULT;
    // the picked voice first; lines it does not have use the default Kokoro voice (never the old Microsoft-style voice)
    var tryV = first ? [first].concat(first !== def ? [def] : []) : [];
    for (var i = 0; i < tryV.length; i++) { var v = m.voices[tryV[i]]; if (!v) continue; if (!v.set) { v.set = {}; v.ids.forEach(function (x) { v.set[x] = 1; }); } if (v.set[id]) return (m.dir || 'audio') + '/' + tryV[i] + '/' + id + '.' + (m.fmt || 'ogg'); }
    return null;
  };
  var cur = null, seq = 0;
  V.stop = function () { if (cur) { try { cur.pause(); } catch (e) {} cur = null; } if (root.speechSynthesis) try { root.speechSynthesis.cancel(); } catch (e) {} };
  V.fallback = function (text) {
    var ss = root.speechSynthesis; if (!ss) return false;
    var u = new root.SpeechSynthesisUtterance(String(text).replace(/\s+/g, ' ')); u.rate = V.rate(); u.lang = 'en-US';
    var v = V.pick(); if (v) { u.voice = v; if (v.lang) u.lang = v.lang; } ss.speak(u); return true;
  };
  // tries the shipped clip first; any problem (no clip, blocked, decode error) falls back to the built-in voice
  V.speak = function (text) {
    V.stop(); var me = ++seq, url = V.clipUrl(text); V.last = { text: text, clip: url || null };
    if (!url || !root.Audio) return V.fallback(text);
    var rate = Math.max(0.6, Math.min(1.5, V.rate() / 0.95)), gone = false;
    function bad() { if (gone || me !== seq) return; gone = true; cur = null; V.last.clip = null; V.fallback(text); }
    function play(src) { if (me !== seq) return; var a = new root.Audio(src); a.playbackRate = rate; a.preservesPitch = true; a.onerror = bad; cur = a; var p = a.play(); if (p && p.catch) p.catch(bad); }
    try { if (root.fetch && /^https?:/.test(root.location && root.location.protocol + '')) root.fetch(url).then(function (r) { if (!r.ok) throw 0; return r.blob(); }).then(function (b) { if (!gone) play(root.URL.createObjectURL(b)); }).catch(function () { if (!gone) play(url); }); else play(url); } catch (e) { bad(); }
    return true;
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = V; else root.DAW_VOICE = V;
})(typeof window !== 'undefined' ? window : globalThis);
