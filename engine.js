/* The Last Word — rules engine. Pure: no DOM, no storage. Shared by the
 * browser UI and the node harness. */
(function (root) {
  'use strict';
  var G = (typeof module !== 'undefined' && module.exports) ? require('./content.js') : root.GAME;

  var VERSION = 1;
  var GLYPHS = 'RAGBWV';

  function newState() {
    return {
      v: VERSION, loc: G.START, tide: 3, f: {}, seen: {}, clues: [], lumen: {}, guesses: {},
      read: [], found: [], searches: [], parrot: 0, aim: 'sea', seq: 'RR BV', flashes: 0,
      returned: [], playMs: 0, nbSeen: 0, created: Date.now()
    };
  }

  function compact(seq) {
    return String(seq || '').toUpperCase().replace(/[^RAGBWV]/g, '');
  }
  function tidy(seq) {
    return String(seq || '').toUpperCase().replace(/[^RAGBWV ]/g, '').replace(/ +/g, ' ').trim();
  }

  function helpers(s) {
    return {
      clue: function (id) {
        if (!G.CLUES[id]) throw new Error('unknown clue ' + id);
        if (s.clues.indexOf(id) < 0) s.clues.push(id);
        s.seen['clue:' + id] = 1;
      },
      lumen: function (word, src) {
        word = compact(word);
        var e = s.lumen[word] || (s.lumen[word] = { src: [] });
        if (e.src.indexOf(src) < 0) e.src.push(src);
      },
      mark: function (k) { s.seen[k] = 1; },
      compact: compact,
      tidy: tidy
    };
  }

  function here(s) { return G.LOC[s.loc]; }

  function view(s) {
    var L = here(s);
    return { loc: s.loc, title: L.title, scene: L.scene, text: L.desc(s), acts: L.acts(s), exits: L.exits(s) };
  }

  // Every player-possible move from this state, as {kind, id, label, panel}
  function available(s) {
    if (s.f.ended) return [];
    var v = view(s);
    var out = v.acts.map(function (a) { return { kind: 'act', id: a.id, label: a.label, panel: !!a.panel }; });
    v.exits.forEach(function (e) { out.push({ kind: 'go', id: e.to, label: e.label }); });
    return out;
  }

  function act(s, id) {
    if (s.f.ended) return { error: 'ended' };
    var ok = here(s).acts(s).some(function (a) { return a.id === id; });
    if (!ok) return { error: 'not available: ' + id };
    s.seen['act:' + id] = 1;
    var r = G.ACT[id](s, helpers(s)) || {};
    return r;
  }

  function go(s, to) {
    if (s.f.ended) return { error: 'ended' };
    var ok = here(s).exits(s).some(function (e) { return e.to === to; });
    if (!ok) return { error: 'no exit: ' + to };
    s.loc = to;
    s.seen['loc:' + to] = 1;
    return { moved: true };
  }

  function canSubmit(s, type) {
    var sub = G.SUB[type];
    if (!sub || s.f.ended) return false;
    if (sub.at && sub.at !== s.loc) return false;
    if (sub.when && !sub.when(s)) return false;
    return true;
  }

  function submit(s, type, value) {
    if (!canSubmit(s, type)) return { error: 'cannot submit ' + type + ' here' };
    s.seen['sub:' + type] = 1;
    return G.SUB[type].run(s, helpers(s), value) || {};
  }

  /* ------------------------------------------------------------- index */
  function isGone(s, w) {
    return G.EXILED.indexOf(w) >= 0 && !s.f.ended && s.returned.indexOf(w) < 0;
  }
  function entryTokens(s, e) {
    var t = (e[1] + ' ' + e[3])
      .replace(/\[\[[^\]]*\]\]/g, ' ')
      .replace(/\{[xX]:([a-z]+)\}/g, function (m, w) { return isGone(s, w) ? ' ' : ' ' + w + ' '; })
      .toLowerCase().replace(/’/g, "'");
    return (t.match(/[a-z0-9']+/g) || []).map(function (w) { return w.replace(/'s$/, '').replace(/^'+|'+$/g, ''); });
  }
  function normQuery(q) {
    var m = String(q || '').toLowerCase().replace(/’/g, "'").match(/[a-z0-9']+/);
    return m ? m[0].replace(/'s$/, '').replace(/^'+|'+$/g, '') : '';
  }
  function matches(tok, q) {
    return tok === q || tok === q + 's' || tok === q + 'es' || (q.length > 3 && q.slice(-1) === 's' && tok === q.slice(0, -1));
  }
  function search(s, query) {
    if (s.loc !== 'cottage' || s.f.ended) return { error: 'the Index is in the cottage' };
    var q = normQuery(query);
    if (!q) return { q: q, status: 'empty', total: 0, results: [] };
    s.searches.push(q);
    if (s.searches.length > 300) s.searches.shift();
    s.seen['search'] = 1;
    if (isGone(s, q)) return { q: q, status: 'exiled', total: 0, results: [] };
    var hits = G.ENTRIES.filter(function (e) {
      return entryTokens(s, e).some(function (t) { return matches(t, q); });
    }).map(function (e) { return e[0]; });
    var shown = hits.slice(0, 5);
    shown.forEach(function (id) { if (s.found.indexOf(id) < 0) s.found.push(id); });
    return { q: q, status: hits.length ? 'ok' : 'none', total: hits.length, results: shown };
  }
  function entry(id) {
    for (var i = 0; i < G.ENTRIES.length; i++) if (G.ENTRIES[i][0] === id) return G.ENTRIES[i];
    return null;
  }
  // Read an entry: needs to have been turned up by a search (re-reading works anywhere).
  function readEntry(s, id) {
    var e = entry(id);
    if (!e || s.found.indexOf(id) < 0) return { error: 'not found yet' };
    if (s.read.indexOf(id) < 0) s.read.push(id);
    s.seen['entry:' + id] = 1;
    var c = G.ENTRY_CLUES[id];
    if (c) helpers(s).clue(c);
    return { entry: e };
  }

  /* ----------------------------------------------------------- persist */
  function serialize(s) { return JSON.stringify(s); }
  function deserialize(str) {
    var o;
    try { o = typeof str === 'string' ? JSON.parse(str) : str; } catch (e) { return null; }
    return sanitize(o);
  }
  function sanitize(o) {
    if (!o || typeof o !== 'object' || o.v !== VERSION || !G.LOC[o.loc]) return null;
    var d = newState();
    Object.keys(d).forEach(function (k) {
      if (o[k] === undefined || typeof o[k] !== typeof d[k] || Array.isArray(d[k]) !== Array.isArray(o[k])) o[k] = d[k];
    });
    if (!(o.tide >= 1 && o.tide <= 5)) o.tide = 3;
    if (!G.AIMS[o.aim]) o.aim = 'sea';
    // drop unknown clue ids defensively
    o.clues = o.clues.filter(function (c) { return !!G.CLUES[c]; });
    o.read = o.read.filter(function (id) { return !!entry(id); });
    o.found = o.found.filter(function (id) { return !!entry(id); });
    return o;
  }

  var E = {
    VERSION: VERSION, GLYPHS: GLYPHS, G: G,
    newState: newState, view: view, available: available, act: act, go: go,
    canSubmit: canSubmit, submit: submit, search: search, readEntry: readEntry, entry: entry,
    serialize: serialize, deserialize: deserialize, sanitize: sanitize, compact: compact, tidy: tidy,
    isGone: isGone, nudge: function (s) { return G.nudge(s); }
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = E;
  else root.ENGINE = E;
})(this);
