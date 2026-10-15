/* Design a World: small DOM helpers, toasts, modals, read-aloud. */
(function () {
  'use strict';
  var U = window.DAW_UI = {};
  U.$ = function (s, r) { return (r || document).querySelector(s); };
  U.$$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  U.esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  U.el = function (tag, attrs, html) { var e = document.createElement(tag); if (attrs) Object.keys(attrs).forEach(function (k) { if (k === 'class') e.className = attrs[k]; else if (k.slice(0, 2) === 'on') e.addEventListener(k.slice(2), attrs[k]); else e.setAttribute(k, attrs[k]); }); if (html != null) e.innerHTML = html; return e; };
  U.words = function (s) { return String(s || '').trim().split(/\s+/).filter(Boolean).length; };
  U.fmtTime = function (iso) { if (!iso) return ''; var d = new Date(iso); return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) + ', ' + d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }); };
  U.seedShuffle = function (arr, seedStr) { // deterministic shuffle that never returns the original order (when n > 1)
    var a = arr.map(function (x, i) { return i; }), h = 0; for (var k = 0; k < seedStr.length; k++) h = (h * 31 + seedStr.charCodeAt(k)) >>> 0;
    for (var i = a.length - 1; i > 0; i--) { h = (h * 1103515245 + 12345) >>> 0; var j = h % (i + 1); var t = a[i]; a[i] = a[j]; a[j] = t; }
    if (a.length > 1 && a.every(function (x, i) { return x === i; })) a.push(a.shift());
    return a;
  };
  var toastBox;
  U.toast = function (msg, kind, ms) {
    if (!toastBox) { toastBox = U.el('div', { class: 'toasts', role: 'status', 'aria-live': 'polite' }); document.body.appendChild(toastBox); }
    var t = U.el('div', { class: 'toast ' + (kind || '') }, msg); toastBox.appendChild(t);
    setTimeout(function () { t.classList.add('out'); setTimeout(function () { t.remove(); }, 400); }, ms || 3200);
  };
  // Modal: returns {el, body, close}
  (function () { function sync() { document.body.classList.toggle('has-modal', !!document.querySelector('.modal-wrap')); } if (typeof MutationObserver !== 'undefined') { var go = function () { new MutationObserver(sync).observe(document.body, { childList: true }); sync(); }; if (document.body) go(); else document.addEventListener('DOMContentLoaded', go); } })();
  U.modal = function (opts) {
    var wrap = U.el('div', { class: 'modal-wrap' + (opts.wide ? ' wide' : '') + (opts.full ? ' full' : ''), role: 'dialog', 'aria-modal': 'true', 'aria-label': opts.title || 'Dialog' });
    var box = U.el('div', { class: 'modal' });
    var head = U.el('div', { class: 'modal-head' }, '<h2>' + (opts.titleHtml || U.esc(opts.title || '')) + '</h2>');
    var body = U.el('div', { class: 'modal-body' });
    // every dialog gets a speaker: reads the title and what is on screen (voice only when tapped, or with auto-read on)
    var spk = U.el('button', { class: 'icon-btn speak-all', 'aria-label': 'Read this aloud', title: 'Read aloud' }, '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 8.5a4.5 4.5 0 0 1 0 7M18.5 6a8 8 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>');
    spk.addEventListener('click', function () { U.speak(U.readable(head.querySelector('h2'), body)); }); head.appendChild(spk);
    var x = U.el('button', { class: 'icon-btn close', 'aria-label': 'Close', title: 'Close' }, '&times;'); head.appendChild(x);
    box.appendChild(head); box.appendChild(body); wrap.appendChild(box); document.body.appendChild(wrap);
    var api = { el: wrap, box: box, body: body, head: head, close: function () { wrap.remove(); document.removeEventListener('keydown', onKey); if (opts.onClose) opts.onClose(); } };
    function onKey(e) { if (e.key === 'Escape' && !opts.noEsc) api.close(); }
    x.addEventListener('click', api.close); document.addEventListener('keydown', onKey);
    wrap.addEventListener('mousedown', function (e) { if (e.target === wrap && !opts.sticky) api.close(); });
    if (window.DAW_APP && DAW_APP.settings && DAW_APP.settings().autoRead && !opts.noAutoRead) setTimeout(function () { if (document.body.contains(wrap)) U.speak(U.readable(head.querySelector('h2'), body, 400)); }, 350);
    setTimeout(function () { if (box.contains(document.activeElement)) return; var f = box.querySelector('[autofocus]') || x; f.focus(); }, 30);
    return api;
  };
  // plain text for read-aloud: skips buttons' internals, hidden parts, and form fields
  U.readable = function (h, body, max) {
    var parts = [h ? h.textContent : '']; if (body) { var c = body.cloneNode(true); Array.prototype.forEach.call(c.querySelectorAll('[hidden],textarea,input,select,svg,script,style,.speak-btn,.sr-skip'), function (n) { n.remove(); }); parts.push(c.innerText || c.textContent || ''); }
    return parts.join('. ').replace(/\s+/g, ' ').trim().slice(0, max || 1600);
  };
  U.confirm = function (title, html, okText, cb, danger) {
    var m = U.modal({ title: title });
    m.body.innerHTML = '<div class="confirm-text">' + html + '</div><div class="btn-row"><button class="btn ghost" data-a="no">Cancel</button><button class="btn ' + (danger ? 'danger' : 'primary') + '" data-a="yes" autofocus>' + U.esc(okText || 'OK') + '</button></div>';
    m.body.querySelector('[data-a=no]').onclick = m.close;
    m.body.querySelector('[data-a=yes]').onclick = function () { m.close(); cb(); };
  };
  // Read aloud (Web Speech API). Works offline with on-device voices on Chromebooks.
  U.speak = function (text) {
    if (!('speechSynthesis' in window) && !(window.DAW_VOICE && window.DAW_VOICE.clipVoices().length)) { U.toast('Read-aloud is not available in this browser.'); return; }
    if (window.DAW_VOICE) { window.DAW_VOICE.speak(text); return; }
    window.speechSynthesis.cancel(); var u = new SpeechSynthesisUtterance(String(text).replace(/\s+/g, ' ')); u.lang = 'en-US'; window.speechSynthesis.speak(u);
  };
  U.speakBtn = function (getText, label) {
    var b = U.el('button', { class: 'speak-btn', type: 'button', title: 'Read aloud', 'aria-label': label || 'Read aloud' }, window.DAW_ART.icon('speaker', 18) + '<span>Read</span>');
    b.addEventListener('click', function () { U.speak(typeof getText === 'function' ? getText() : getText); });
    return b;
  };
  U.download = function (filename, data, mime) {
    var blob = data instanceof Blob ? data : new Blob([data], { type: mime || 'application/octet-stream' });
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = filename; document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
  };
  U.copy = function (text) {
    function fallback() { var t = U.el('textarea'); t.value = text; document.body.appendChild(t); t.select(); try { document.execCommand('copy'); } catch (e) {} t.remove(); return Promise.resolve(); }
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text).catch(fallback);
    return fallback();
  };
  U.readFile = function (file) { return new Promise(function (res, rej) { var r = new FileReader(); r.onload = function () { res(r.result); }; r.onerror = rej; r.readAsText(file); }); };
})();
