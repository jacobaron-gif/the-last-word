/* Persistence: localStorage autosave + best-effort server backup.
 * Server calls are fire-and-forget and must never break the game.
 * With nosync: a separate key and no network at all. */
(function (root) {
  'use strict';
  var KEY = 'oneEvening.lastWord.v1';
  var KEY_NOSYNC = 'oneEvening.lastWord.nosync.v1';
  var SAVE_URL = '/save/one-evening';
  var LOAD_URL = '/load/one-evening';

  function create(opts) {
    opts = opts || {};
    var nosync = !!opts.nosync;
    var storage = opts.storage || null;
    var fetchFn = nosync ? null : (opts.fetch || null);
    var key = nosync ? KEY_NOSYNC : KEY;
    var timer = null, pending = null;

    function readLocal() {
      try { return storage ? storage.getItem(key) : null; } catch (e) { return null; }
    }
    function writeLocal(str) {
      try { if (storage) storage.setItem(key, str); } catch (e) { /* quota / private mode */ }
    }
    function clearLocal() {
      try { if (storage) storage.removeItem(key); } catch (e) { /* ignore */ }
    }
    function post(body, keepalive) {
      if (!fetchFn) return;
      try {
        var init = { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: body };
        if (keepalive && body.length < 60000) init.keepalive = true;
        var p = fetchFn(SAVE_URL, init);
        if (p && typeof p.then === 'function') p.then(function () {}, function () {});
      } catch (e) { /* ignore */ }
    }
    function save(str) {
      writeLocal(str);
      if (!fetchFn) return;
      pending = str;
      if (timer) return;
      timer = setTimeout(function () {
        timer = null;
        var b = pending; pending = null;
        if (b) post(b, false);
      }, 1200);
    }
    function flush() {
      if (!fetchFn) return;
      if (timer) { clearTimeout(timer); timer = null; }
      if (pending) { var b = pending; pending = null; post(b, true); }
    }
    // cb(textOrNull). Never throws, always calls back exactly once.
    function loadRemote(cb, timeoutMs) {
      if (!fetchFn) { cb(null); return; }
      var done = false;
      function finish(v) { if (done) return; done = true; clearTimeout(t); cb(v); }
      var t = setTimeout(function () { finish(null); }, timeoutMs || 3000);
      try {
        var p = fetchFn(LOAD_URL, { cache: 'no-store' });
        if (!p || typeof p.then !== 'function') { finish(null); return; }
        p.then(function (r) { return r && r.ok ? r.text() : null; })
          .then(function (txt) { finish(txt || null); }, function () { finish(null); });
      } catch (e) { finish(null); }
    }
    return { key: key, nosync: nosync, readLocal: readLocal, save: save, clearLocal: clearLocal, flush: flush, loadRemote: loadRemote };
  }

  var SAVE = { create: create, KEY: KEY, KEY_NOSYNC: KEY_NOSYNC };
  if (typeof module !== 'undefined' && module.exports) module.exports = SAVE;
  else root.SAVE = SAVE;
})(this);
