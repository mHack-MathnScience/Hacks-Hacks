/* Design a World: the exact read-aloud strings for text that is the same for every student (mission intros, task questions,
   Then & Now events, landform prompts, problems). The game and tools/make_audio.mjs both build their text here, so a pre-made
   voice clip is found by the exact text. Student-typed or personalised text never matches and uses the fallback voice. */
(function (root) {
  var N = {};
  N.norm = function (t) { return String(t || '').replace(/\s+/g, ' ').trim(); };
  N.intro = function (m, fill) { return (fill ? fill(m.prompt) : m.prompt) + '. ' + (m.vocab || []).map(function (v) { return v.def + '. The science word is ' + v.term; }).join('. '); };
  N.unit = function (u, fill) { return (u.prompt ? fill(u.prompt) + '. ' : '') + fill(u.task.question || ''); };
  N.explain = function (m, fill) { return fill(m.explainPrompt || 'Explain what you learned.'); };
  N.history = function (b) { return (b.situation || '') + ' ' + (b.perspectives || []).map(function (p) { return p.who + ' says: ' + p.view; }).join('. '); };
  N.landform = function (lf) { return (lf.simple || ('How did this ' + lf.name.toLowerCase() + ' form?')) + ' Who did the work? What happened? How long did it take?'; };
  N.problem = function (p) { return [p.title + '.', p.situation, (p.facts || []).join(' '), (p.voices || []).map(function (v) { return v.who + ' says: ' + v.says; }).join(' '), 'Your choices: ' + (p.options || []).map(function (o) { return o.text; }).join('. ')].filter(Boolean).join(' '); };
  // short stable id for a line of text (FNV-1a, 32-bit, plus length)
  N.id = function (t) { t = N.norm(t); var h = 2166136261; for (var i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h.toString(36) + t.length.toString(36); };
  if (typeof module !== 'undefined' && module.exports) module.exports = N; else root.DAW_NARR = N;
})(typeof window !== 'undefined' ? window : globalThis);
